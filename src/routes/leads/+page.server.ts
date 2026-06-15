import { getSupabase, isConfigured } from '$lib/server/supabase';
import { getProvider, logJob, waterfallFindPhone, waterfallVerifyEmail, estimateCost } from '$lib/server/providers';
import { qualifyBatch } from '$lib/server/qualify';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	if (!isConfigured()) return { leads: [], profiles: [], filter: 'all', stats: { total: 0, needsEnrichment: 0, needsQualification: 0, qualified: 0, withPhone: 0, withEmail: 0 } };
	const supabase = getSupabase();
	const status = url.searchParams.get('status') || 'all';

	let query = supabase
		.from('leads')
		.select('*, accounts(company_name, domain, industry, location)')
		.order('created_at', { ascending: false })
		.limit(100);

	if (status !== 'all') {
		query = query.eq('qualification_status', status);
	}

	const { data: leads } = await query;
	const { data: profiles } = await supabase.from('icp_profiles').select('id, name').order('created_at', { ascending: false });

	const allLeads = leads ?? [];
	const stats = {
		total: allLeads.length,
		needsEnrichment: allLeads.filter(l => l.email_status === 'unknown' || !l.phone).length,
		needsQualification: allLeads.filter(l => l.qualification_status === 'pending').length,
		qualified: allLeads.filter(l => l.qualification_status === 'qualified').length,
		withPhone: allLeads.filter(l => l.phone && l.phone_status === 'valid').length,
		withEmail: allLeads.filter(l => l.email_status === 'valid').length
	};

	return { leads: allLeads, profiles: profiles ?? [], filter: status, stats };
};

export const actions: Actions = {
	find_leads: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const icpId = form.get('icp_id') as string;
		const domain = (form.get('domain') as string)?.trim();

		if (!icpId) return fail(400, { error: 'Select an ICP profile' });
		if (!domain) return fail(400, { error: 'Enter a domain to source from' });

		const { data: icp } = await supabase
			.from('icp_profiles')
			.select('*')
			.eq('id', icpId)
			.single();
		if (!icp) return fail(404, { error: 'ICP not found' });

		// Create or find account
		let { data: account } = await supabase
			.from('accounts')
			.select('*')
			.eq('domain', domain)
			.eq('icp_profile_id', icpId)
			.single();

		if (!account) {
			const { data: newAccount, error } = await supabase
				.from('accounts')
				.insert({
					icp_profile_id: icpId,
					company_name: domain.replace(/\.\w+$/, ''),
					domain,
					source_provider: 'apollo'
				})
				.select()
				.single();
			if (error) return fail(500, { error: error.message });
			account = newAccount;
		}

		// Source contacts via Apollo
		const apollo = getProvider('apollo');
		try {
			const contacts = await apollo.findContacts(account, icp.target_titles);
			await logJob({
				account_id: account.id,
				provider: 'apollo',
				operation: 'find',
				status: 'complete',
				cost_usd: estimateCost('apollo', 'find'),
				raw_response: { count: contacts.length }
			});

			let inserted = 0;
			for (const c of contacts) {
				const { error } = await supabase.from('leads').insert({
					account_id: account.id,
					full_name: c.full_name,
					title: c.title,
					email: c.email,
					linkedin_url: c.linkedin_url,
					location: c.location,
					source_provider: 'apollo',
					basis: `Apollo people search on ${domain}`
				});
				if (!error) inserted++;
			}

			return { success: true, message: `Found ${inserted} contacts at ${domain}` };
		} catch (err) {
			return fail(500, { error: `Apollo search failed: ${err}` });
		}
	},

	enrich: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const leadIds = (form.get('lead_ids') as string).split(',').filter(Boolean);

		if (!leadIds.length) return fail(400, { error: 'No leads selected' });

		const { data: leads } = await supabase
			.from('leads')
			.select('*, accounts(*)')
			.in('id', leadIds);
		if (!leads?.length) return fail(404, { error: 'Leads not found' });

		let enriched = 0;
		for (const lead of leads) {
			// Skip already-enriched
			if (lead.email_status === 'valid' && lead.phone_status === 'valid') continue;

			// Verify email if we have one but haven't verified
			if (lead.email && lead.email_status === 'unknown') {
				const emailStatus = await waterfallVerifyEmail(lead.email, lead.id);
				await supabase.from('leads').update({ email_status: emailStatus }).eq('id', lead.id);
			}

			// Find phone if missing
			if (!lead.phone || lead.phone_status === 'unknown') {
				const phoneResult = await waterfallFindPhone(
					{ id: lead.id, full_name: lead.full_name, email: lead.email, location: lead.location },
					lead.accounts
				);
				if (phoneResult.bestNumber) {
					await supabase.from('leads').update({
						phone: phoneResult.bestNumber,
						phone_type: phoneResult.bestType,
						phone_status: 'valid',
						enriched_at: new Date().toISOString()
					}).eq('id', lead.id);
				}
			}

			enriched++;
		}

		return { success: true, message: `Enriched ${enriched} leads` };
	},

	qualify: async ({ request }) => {
		const form = await request.formData();
		const leadIds = (form.get('lead_ids') as string).split(',').filter(Boolean);
		const icpId = form.get('icp_id') as string;

		if (!leadIds.length) return fail(400, { error: 'No leads selected' });
		if (!icpId) return fail(400, { error: 'Select an ICP profile' });

		try {
			const results = await qualifyBatch(leadIds, icpId);
			const qualified = results.filter(r => r.status === 'qualified').length;
			return { success: true, message: `${qualified}/${results.length} qualified` };
		} catch (err) {
			return fail(500, { error: `Qualification failed: ${err}` });
		}
	}
};
