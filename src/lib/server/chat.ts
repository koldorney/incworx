import { env } from '$env/dynamic/private';
import { getSupabase, isConfigured } from './supabase';
import { getProvider, logJob, waterfallFindPhone, waterfallVerifyEmail, estimateCost } from './providers';
import { qualifyBatch } from './qualify';

const TOOLS = [
	{
		name: 'search_leads',
		description: 'Find contacts at a company domain via Apollo. Returns sourced leads with names, titles, emails.',
		input_schema: {
			type: 'object' as const,
			properties: {
				domain: { type: 'string', description: 'Company domain (e.g. acme.com)' },
				icp_id: { type: 'string', description: 'ICP profile ID to associate leads with. Omit to use the first available profile.' }
			},
			required: ['domain']
		}
	},
	{
		name: 'view_leads',
		description: 'Query existing leads in the database. Use to show the user what leads they have.',
		input_schema: {
			type: 'object' as const,
			properties: {
				status: { type: 'string', enum: ['all', 'pending', 'qualified', 'disqualified'], description: 'Filter by qualification status' },
				limit: { type: 'number', description: 'Max results (default 20)' },
				domain: { type: 'string', description: 'Filter by company domain' }
			}
		}
	},
	{
		name: 'enrich_leads',
		description: 'Run email verification and phone finding on leads. Use after sourcing to get verified contact info.',
		input_schema: {
			type: 'object' as const,
			properties: {
				lead_ids: { type: 'array', items: { type: 'string' }, description: 'Lead IDs to enrich. If omitted, enriches all un-enriched leads.' }
			}
		}
	},
	{
		name: 'qualify_leads',
		description: 'Run AI qualification on leads to score fit and generate call signals. Use after enrichment.',
		input_schema: {
			type: 'object' as const,
			properties: {
				lead_ids: { type: 'array', items: { type: 'string' }, description: 'Lead IDs to qualify. If omitted, qualifies all pending leads.' },
				icp_id: { type: 'string', description: 'ICP profile to qualify against. Omit to use the first available profile.' }
			}
		}
	},
	{
		name: 'create_list',
		description: 'Create an export list from qualified leads. The list can then be downloaded as CSV.',
		input_schema: {
			type: 'object' as const,
			properties: {
				name: { type: 'string', description: 'Name for the list (e.g. "Week 1 — IT Directors")' },
				icp_id: { type: 'string', description: 'ICP profile to pull qualified leads from. Omit to use the first available.' }
			},
			required: ['name']
		}
	},
	{
		name: 'get_profiles',
		description: 'List all ICP (Ideal Customer Profile) profiles.',
		input_schema: { type: 'object' as const, properties: {} }
	},
	{
		name: 'save_profile',
		description: 'Create or update an ICP profile. Use when the user describes their ideal customer.',
		input_schema: {
			type: 'object' as const,
			properties: {
				id: { type: 'string', description: 'Profile ID to update. Omit to create a new profile.' },
				name: { type: 'string', description: 'Profile name' },
				services: { type: 'array', items: { type: 'string' }, description: 'Services offered' },
				positioning: { type: 'string', description: 'How the client wants to be positioned' },
				voice_notes: { type: 'string', description: 'Tone and style for outreach signals' },
				company_size_min: { type: 'number', description: 'Minimum company size (employees)' },
				company_size_max: { type: 'number', description: 'Maximum company size (employees)' },
				revenue_stage: { type: 'string', description: 'Revenue stage filter' },
				target_titles: { type: 'array', items: { type: 'string' }, description: 'Job titles to target' },
				target_geo: { type: 'array', items: { type: 'string' }, description: 'Geographic regions to target' },
				pain_points: { type: 'array', items: { type: 'string' }, description: 'Customer pain points' },
				buying_triggers: { type: 'array', items: { type: 'string' }, description: 'Events that trigger buying' },
				disqualifiers: { type: 'array', items: { type: 'string' }, description: 'Reasons to disqualify a lead' },
				objections: { type: 'array', items: { type: 'string' }, description: 'Common sales objections' }
			},
			required: ['name']
		}
	},
	{
		name: 'get_lists',
		description: 'View existing export lists.',
		input_schema: { type: 'object' as const, properties: {} }
	}
];

const BASE_SYSTEM_PROMPT = `You are the AI assistant for Incworx GTM Center, a go-to-market platform built for Incworx.

## About Incworx
Incworx is a managed IT services and IT consulting company. They serve mid-market businesses (typically 50–500 employees) that need help with infrastructure management, cloud migration, cybersecurity, and IT strategy. Their founder Jonathan Hicks sells into companies where technology is critical but in-house IT teams are stretched thin or non-existent — think manufacturing firms, professional services firms, healthcare organizations, and financial services companies that have outgrown break-fix IT.

Incworx's sweet spot: companies going through growth, digital transformation, or compliance pressure (HIPAA, SOC2, PCI) who need a strategic IT partner, not just a helpdesk. They compete against other MSPs and VARs but differentiate on strategic advisory — they don't just fix things, they plan and execute IT roadmaps.

## Your Role
You are Jonathan's outbound lead generation engine. Your job is to have a natural conversation that drives his sales pipeline. You understand his world — the MSP/IT services space, the buyer personas (CTOs, VPs of IT, IT Directors, Operations leaders at mid-market companies), the pain points (aging infrastructure, security gaps, compliance deadlines, vendor sprawl), and the buying triggers (new CTO hire, failed audit, M&A, rapid growth).

You have tools to:
- Search for contacts at company domains
- Enrich leads with verified emails and direct phone numbers
- Qualify leads with AI scoring against a targeting profile
- Build export lists for Jonathan's BDRs to call
- Manage targeting profiles

## How to Behave
Be conversational, concise, and action-oriented. Talk like a sharp sales ops person who knows the IT services space — not a generic AI. When Jonathan says "find me IT directors at manufacturing companies in Ohio," you should execute immediately and come back with results, not ask 5 clarifying questions.

When you execute actions, summarize results clearly. Use markdown for formatting.

When showing results, include links to the data views:
- [View all leads](/leads) or [View qualified leads](/leads?status=qualified)
- [Export lists](/lists)
- [Edit targeting profile](/profile)
- [View usage & costs](/usage)
- [Download CSV](/api/lists/{id}/csv) for specific lists

When the user describes their ideal customer, proactively save it as a targeting profile.
When you find or qualify leads, show a brief summary — name, title, company, fit score. Skip the noise.
When creating lists, provide the CSV download link.

Suggest smart next steps based on what just happened. If leads were found, suggest enriching them. If they were enriched, suggest qualifying. If qualified, suggest building an export list. Keep the pipeline moving.`;

async function buildSystemPrompt(): Promise<string> {
	if (!isConfigured()) return BASE_SYSTEM_PROMPT;
	const supabase = getSupabase();

	const { data: profile } = await supabase
		.from('icp_profiles')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	if (!profile) return BASE_SYSTEM_PROMPT;

	const profileContext = [
		`\n## Active Targeting Profile: "${profile.name}"`,
		profile.services?.length ? `- **Services**: ${profile.services.join(', ')}` : '',
		profile.positioning ? `- **Positioning**: ${profile.positioning}` : '',
		profile.target_titles?.length ? `- **Target titles**: ${profile.target_titles.join(', ')}` : '',
		profile.target_geo?.length ? `- **Geography**: ${profile.target_geo.join(', ')}` : '',
		profile.company_size_min || profile.company_size_max ? `- **Company size**: ${profile.company_size_min || '?'}–${profile.company_size_max || '?'} employees` : '',
		profile.revenue_stage ? `- **Revenue stage**: ${profile.revenue_stage}` : '',
		profile.pain_points?.length ? `- **Pain points**: ${profile.pain_points.join(', ')}` : '',
		profile.buying_triggers?.length ? `- **Buying triggers**: ${profile.buying_triggers.join(', ')}` : '',
		profile.disqualifiers?.length ? `- **Disqualifiers**: ${profile.disqualifiers.join(', ')}` : '',
		profile.voice_notes ? `- **Voice/tone**: ${profile.voice_notes}` : '',
		`\nUse this profile context in all your recommendations, qualification judgments, and outreach signals. When the user asks you to find or qualify leads without specifying a profile, use this one.`
	].filter(Boolean).join('\n');

	return BASE_SYSTEM_PROMPT + profileContext;
}

async function getDefaultIcpId(): Promise<string | null> {
	if (!isConfigured()) return null;
	const supabase = getSupabase();
	const { data } = await supabase.from('icp_profiles').select('id').order('created_at', { ascending: false }).limit(1);
	return data?.[0]?.id ?? null;
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
	if (!isConfigured()) return { error: 'Database not configured' };
	const supabase = getSupabase();

	switch (name) {
		case 'search_leads': {
			const domain = input.domain as string;
			let icpId = input.icp_id as string | undefined;
			if (!icpId) icpId = (await getDefaultIcpId()) ?? undefined;
			if (!icpId) return { error: 'No ICP profile found. Ask the user to describe their ideal customer first.' };

			const { data: icp } = await supabase.from('icp_profiles').select('*').eq('id', icpId).single();
			if (!icp) return { error: 'ICP profile not found' };

			let { data: account } = await supabase
				.from('accounts').select('*').eq('domain', domain).eq('icp_profile_id', icpId).single();

			if (!account) {
				const { data: newAccount, error } = await supabase
					.from('accounts')
					.insert({ icp_profile_id: icpId, company_name: domain.replace(/\.\w+$/, ''), domain, source_provider: 'apollo' })
					.select().single();
				if (error) return { error: error.message };
				account = newAccount;
			}

			const apollo = getProvider('apollo');
			const contacts = await apollo.findContacts(account, icp.target_titles);
			await logJob({ account_id: account.id, provider: 'apollo', operation: 'find', status: 'complete', cost_usd: estimateCost('apollo', 'find'), raw_response: { count: contacts.length } });

			const inserted = [];
			for (const c of contacts) {
				const { data: lead, error } = await supabase.from('leads').insert({
					account_id: account.id, full_name: c.full_name, title: c.title, email: c.email,
					linkedin_url: c.linkedin_url, location: c.location, source_provider: 'apollo',
					basis: `Apollo people search on ${domain}`
				}).select('id, full_name, title, email, location').single();
				if (!error && lead) inserted.push(lead);
			}

			return { domain, count: inserted.length, leads: inserted };
		}

		case 'view_leads': {
			const status = (input.status as string) || 'all';
			const limit = (input.limit as number) || 20;
			const domain = input.domain as string | undefined;

			let query = supabase
				.from('leads')
				.select('id, full_name, title, email, email_status, phone, phone_type, qualification_status, fit_score, signal_why, accounts(company_name, domain)')
				.order('created_at', { ascending: false })
				.limit(limit);

			if (status !== 'all') query = query.eq('qualification_status', status);
			if (domain) query = query.eq('accounts.domain', domain);

			const { data: leads } = await query;
			const summary = {
				total: leads?.length ?? 0,
				qualified: leads?.filter((l: { qualification_status: string }) => l.qualification_status === 'qualified').length ?? 0,
				pending: leads?.filter((l: { qualification_status: string }) => l.qualification_status === 'pending').length ?? 0,
				disqualified: leads?.filter((l: { qualification_status: string }) => l.qualification_status === 'disqualified').length ?? 0
			};
			return { summary, leads: leads ?? [] };
		}

		case 'enrich_leads': {
			let leadIds = input.lead_ids as string[] | undefined;
			if (!leadIds?.length) {
				const { data } = await supabase.from('leads').select('id').or('email_status.eq.unknown,phone_status.eq.unknown').limit(50);
				leadIds = data?.map((l: { id: string }) => l.id) ?? [];
			}
			if (!leadIds.length) return { message: 'No leads need enrichment.' };

			const { data: leads } = await supabase.from('leads').select('*, accounts(*)').in('id', leadIds);
			if (!leads?.length) return { error: 'No leads found' };

			let enriched = 0;
			for (const lead of leads) {
				if (lead.email && lead.email_status === 'unknown') {
					const emailStatus = await waterfallVerifyEmail(lead.email, lead.id);
					await supabase.from('leads').update({ email_status: emailStatus }).eq('id', lead.id);
				}
				if (!lead.phone || lead.phone_status === 'unknown') {
					const phoneResult = await waterfallFindPhone(
						{ id: lead.id, full_name: lead.full_name, email: lead.email, location: lead.location },
						lead.accounts
					);
					if (phoneResult.bestNumber) {
						await supabase.from('leads').update({
							phone: phoneResult.bestNumber, phone_type: phoneResult.bestType,
							phone_status: 'valid', enriched_at: new Date().toISOString()
						}).eq('id', lead.id);
					}
				}
				enriched++;
			}
			return { enriched, total: leads.length };
		}

		case 'qualify_leads': {
			let leadIds = input.lead_ids as string[] | undefined;
			let icpId = input.icp_id as string | undefined;
			if (!icpId) icpId = (await getDefaultIcpId()) ?? undefined;
			if (!icpId) return { error: 'No ICP profile found.' };

			if (!leadIds?.length) {
				const { data } = await supabase.from('leads').select('id').eq('qualification_status', 'pending').limit(50);
				leadIds = data?.map((l: { id: string }) => l.id) ?? [];
			}
			if (!leadIds.length) return { message: 'No pending leads to qualify.' };

			const results = await qualifyBatch(leadIds, icpId);
			const qualified = results.filter(r => r.status === 'qualified');
			const disqualified = results.filter(r => r.status === 'disqualified');
			return {
				total: results.length, qualified: qualified.length, disqualified: disqualified.length,
				results: results.map(r => ({ lead_id: r.lead_id, status: r.status, fit_score: r.fit_score, signal_why: r.signal_why }))
			};
		}

		case 'create_list': {
			const listName = input.name as string;
			let icpId = input.icp_id as string | undefined;
			if (!icpId) icpId = (await getDefaultIcpId()) ?? undefined;
			if (!icpId) return { error: 'No ICP profile found.' };

			const { data: leads } = await supabase
				.from('leads').select('id, email, phone, accounts!inner(icp_profile_id)')
				.eq('qualification_status', 'qualified').eq('accounts.icp_profile_id', icpId);

			if (!leads?.length) return { error: 'No qualified leads found. Qualify some leads first.' };

			const { data: suppressed } = await supabase.from('suppression').select('type, value');
			const suppressedSet = new Set((suppressed || []).map((s: { type: string; value: string }) => `${s.type}:${s.value}`));
			const validLeads = leads.filter((l: { email: string | null; phone: string | null }) => {
				if (l.email && suppressedSet.has(`email:${l.email.toLowerCase()}`)) return false;
				if (l.phone && suppressedSet.has(`phone:${l.phone}`)) return false;
				return true;
			});

			if (!validLeads.length) return { error: 'All qualified leads are suppressed.' };

			const { data: list, error } = await supabase
				.from('lists').insert({ name: listName, icp_profile_id: icpId }).select().single();
			if (error) return { error: error.message };

			const items = validLeads.map((l: { id: string }) => ({ list_id: list.id, lead_id: l.id }));
			await supabase.from('list_items').insert(items);

			return { list_id: list.id, name: listName, lead_count: validLeads.length, csv_url: `/api/lists/${list.id}/csv` };
		}

		case 'get_profiles': {
			const { data } = await supabase.from('icp_profiles').select('*').order('created_at', { ascending: false });
			return { profiles: data ?? [] };
		}

		case 'save_profile': {
			const id = input.id as string | undefined;
			const profileData: Record<string, unknown> = {};
			for (const key of ['name', 'services', 'positioning', 'voice_notes', 'company_size_min', 'company_size_max', 'revenue_stage', 'target_titles', 'target_geo', 'pain_points', 'buying_triggers', 'disqualifiers', 'objections']) {
				if (input[key] !== undefined) profileData[key] = input[key];
			}

			if (id) {
				const { data, error } = await supabase.from('icp_profiles').update(profileData).eq('id', id).select().single();
				if (error) return { error: error.message };
				return { saved: true, profile: data };
			} else {
				const { data, error } = await supabase.from('icp_profiles').insert(profileData).select().single();
				if (error) return { error: error.message };
				return { saved: true, profile: data };
			}
		}

		case 'get_lists': {
			const { data } = await supabase
				.from('lists').select('*, list_items(count)').order('created_at', { ascending: false });
			return {
				lists: (data ?? []).map((l: { id: string; name: string; exported_at: string | null; list_items: { count: number }[] }) => ({
					id: l.id, name: l.name, exported_at: l.exported_at,
					lead_count: l.list_items?.[0]?.count ?? 0,
					csv_url: `/api/lists/${l.id}/csv`
				}))
			};
		}

		default:
			return { error: `Unknown tool: ${name}` };
	}
}

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export async function chat(messages: ChatMessage[]): Promise<{ message: string }> {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

	const apiMessages: Array<{ role: string; content: unknown }> = messages.map(m => ({
		role: m.role,
		content: m.content
	}));

	const systemPrompt = await buildSystemPrompt();

	let attempts = 0;
	const maxAttempts = 10;

	while (attempts < maxAttempts) {
		attempts++;

		const res = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-sonnet-4-6',
				max_tokens: 2048,
				system: systemPrompt,
				tools: TOOLS,
				messages: apiMessages
			})
		});

		if (!res.ok) {
			const err = await res.text();
			throw new Error(`Claude API error: ${res.status} ${err}`);
		}

		const data = await res.json();

		if (data.stop_reason === 'end_turn') {
			const textBlock = data.content.find((b: { type: string }) => b.type === 'text');
			return { message: textBlock?.text || '' };
		}

		if (data.stop_reason === 'tool_use') {
			apiMessages.push({ role: 'assistant', content: data.content });

			const toolResults = [];
			for (const block of data.content) {
				if (block.type === 'tool_use') {
					try {
						const result = await executeTool(block.name, block.input);
						toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
					} catch (err) {
						toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify({ error: String(err) }), is_error: true });
					}
				}
			}

			apiMessages.push({ role: 'user', content: toolResults });
			continue;
		}

		const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
		return { message: textBlock?.text || '' };
	}

	return { message: 'I hit the maximum number of steps. Please try a simpler request.' };
}
