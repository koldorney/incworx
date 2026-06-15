import { env } from '$env/dynamic/private';
import { getSupabase } from './supabase';

interface IcpProfile {
	company_size_min: number | null;
	company_size_max: number | null;
	revenue_stage: string | null;
	target_titles: string[];
	target_geo: string[];
	disqualifiers: string[];
	pain_points: string[];
	buying_triggers: string[];
	voice_notes: string | null;
	positioning: string | null;
}

interface LeadForQualification {
	id: string;
	full_name: string;
	title: string | null;
	location: string | null;
	account: {
		company_name: string;
		size: number | null;
		revenue_stage: string | null;
		industry: string | null;
		location: string | null;
		research_summary: string | null;
	};
}

interface QualificationResult {
	status: 'qualified' | 'disqualified';
	reason?: string;
	fit_score?: number;
	signal_why?: string;
}

export async function qualifyLead(lead: LeadForQualification, icp: IcpProfile): Promise<QualificationResult> {
	const ruleResult = applyRules(lead, icp);
	if (ruleResult) return ruleResult;

	return await claudeQualify(lead, icp);
}

function applyRules(lead: LeadForQualification, icp: IcpProfile): QualificationResult | null {
	const { account } = lead;

	if (icp.company_size_min && account.size && account.size < icp.company_size_min) {
		return { status: 'disqualified', reason: `Company size ${account.size} below minimum ${icp.company_size_min}` };
	}
	if (icp.company_size_max && account.size && account.size > icp.company_size_max) {
		return { status: 'disqualified', reason: `Company size ${account.size} above maximum ${icp.company_size_max}` };
	}

	if (icp.target_geo.length > 0 && lead.location) {
		const geoMatch = icp.target_geo.some(g =>
			lead.location!.toLowerCase().includes(g.toLowerCase())
		);
		if (!geoMatch) {
			return { status: 'disqualified', reason: `Location "${lead.location}" outside target geo: ${icp.target_geo.join(', ')}` };
		}
	}

	for (const disq of icp.disqualifiers) {
		const lower = disq.toLowerCase();
		if (account.industry?.toLowerCase().includes(lower)) {
			return { status: 'disqualified', reason: `Industry matches disqualifier: ${disq}` };
		}
		if (account.company_name.toLowerCase().includes(lower)) {
			return { status: 'disqualified', reason: `Company matches disqualifier: ${disq}` };
		}
	}

	return null;
}

async function claudeQualify(lead: LeadForQualification, icp: IcpProfile): Promise<QualificationResult> {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

	const prompt = `You are qualifying a lead for outbound sales. Score fit 0-100 and provide a one-line signal (the reason this lead is worth a call).

ICP Context:
- Pain points we solve: ${icp.pain_points.join(', ')}
- Buying triggers: ${icp.buying_triggers.join(', ')}
- Positioning: ${icp.positioning || 'N/A'}
- Voice/tone: ${icp.voice_notes || 'Professional, direct'}

Lead:
- Name: ${lead.full_name}
- Title: ${lead.title || 'Unknown'}
- Location: ${lead.location || 'Unknown'}
- Company: ${lead.account.company_name}
- Industry: ${lead.account.industry || 'Unknown'}
- Size: ${lead.account.size || 'Unknown'} employees
- Research: ${lead.account.research_summary || 'None available'}

Respond in JSON only: {"fit_score": <0-100>, "signal_why": "<one line in the client's voice — why call this person NOW>", "qualified": <true|false>}`;

	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-sonnet-4-6',
			max_tokens: 200,
			messages: [{ role: 'user', content: prompt }]
		})
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Claude API error: ${res.status} ${err}`);
	}

	const data = await res.json();
	const text = data.content?.[0]?.text || '';

	try {
		const parsed = JSON.parse(text);
		const supabase = getSupabase();
		await supabase.from('enrichment_jobs').insert({
			lead_id: lead.id,
			provider: 'anthropic',
			operation: 'qualify',
			status: 'complete',
			cost_usd: 0.003,
			raw_response: parsed
		});

		return {
			status: parsed.qualified ? 'qualified' : 'disqualified',
			reason: parsed.qualified ? undefined : parsed.signal_why,
			fit_score: parsed.fit_score,
			signal_why: parsed.signal_why
		};
	} catch {
		return { status: 'qualified', fit_score: 50, signal_why: 'Could not parse qualification — manual review needed' };
	}
}

export async function qualifyBatch(leadIds: string[], icpId: string) {
	const supabase = getSupabase();

	const { data: icp } = await supabase
		.from('icp_profiles')
		.select('*')
		.eq('id', icpId)
		.single();
	if (!icp) throw new Error('ICP profile not found');

	const { data: leads } = await supabase
		.from('leads')
		.select('*, accounts(*)')
		.in('id', leadIds)
		.eq('qualification_status', 'pending');
	if (!leads?.length) return [];

	const results = [];
	for (const lead of leads) {
		const result = await qualifyLead(
			{
				id: lead.id,
				full_name: lead.full_name,
				title: lead.title,
				location: lead.location,
				account: lead.accounts
			},
			icp
		);

		await supabase
			.from('leads')
			.update({
				qualification_status: result.status,
				disqualify_reason: result.reason || null,
				fit_score: result.fit_score || null,
				signal_why: result.signal_why || null
			})
			.eq('id', lead.id);

		results.push({ lead_id: lead.id, ...result });
	}

	return results;
}
