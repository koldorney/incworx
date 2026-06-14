import { getSupabase, isConfigured } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { lists: [], profiles: [] };
	const supabase = getSupabase();
	const { data: lists } = await supabase
		.from('lists')
		.select('*, list_items(count)')
		.order('created_at', { ascending: false });

	const { data: profiles } = await supabase
		.from('icp_profiles')
		.select('id, name');

	return { lists: lists ?? [], profiles: profiles ?? [] };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const name = (form.get('name') as string)?.trim();
		const icpId = form.get('icp_id') as string;

		if (!name || !icpId) return fail(400, { error: 'Name and ICP are required' });

		// Get qualified, non-suppressed leads for this ICP
		const { data: leads } = await supabase
			.from('leads')
			.select('id, email, phone, accounts!inner(icp_profile_id)')
			.eq('qualification_status', 'qualified')
			.eq('accounts.icp_profile_id', icpId);

		if (!leads?.length) return fail(400, { error: 'No qualified leads found for this ICP' });

		// Filter out suppressed
		const { data: suppressed } = await supabase.from('suppression').select('type, value');
		const suppressedSet = new Set((suppressed || []).map(s => `${s.type}:${s.value}`));

		const validLeads = leads.filter(l => {
			if (l.email && suppressedSet.has(`email:${l.email.toLowerCase()}`)) return false;
			if (l.phone && suppressedSet.has(`phone:${l.phone}`)) return false;
			return true;
		});

		if (!validLeads.length) return fail(400, { error: 'All qualified leads are suppressed' });

		// Create list
		const { data: list, error } = await supabase
			.from('lists')
			.insert({ name, icp_profile_id: icpId })
			.select()
			.single();
		if (error) return fail(500, { error: error.message });

		// Add items
		const items = validLeads.map(l => ({ list_id: list.id, lead_id: l.id }));
		await supabase.from('list_items').insert(items);

		return { success: true, message: `Created "${name}" with ${validLeads.length} leads` };
	},

	send_slack: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const listId = form.get('list_id') as string;

		const webhookUrl = env.SLACK_WEBHOOK_URL;
		if (!webhookUrl) return fail(500, { error: 'SLACK_WEBHOOK_URL not configured' });

		// Get list with leads
		const { data: list } = await supabase
			.from('lists')
			.select('*, list_items(leads(full_name, title, email, phone, phone_type, fit_score, signal_why, accounts(company_name)))')
			.eq('id', listId)
			.single();

		if (!list) return fail(404, { error: 'List not found' });

		const leads = list.list_items.map((li: { leads: unknown }) => li.leads);
		const lines = leads.map((l: Record<string, unknown>) => {
			const account = l.accounts as Record<string, string> | null;
			return `*${l.full_name}* — ${l.title} @ ${account?.company_name}\n` +
				`  Email: ${l.email || 'N/A'} | Phone: ${l.phone || 'N/A'} (${l.phone_type})\n` +
				`  Score: ${l.fit_score}/100 — ${l.signal_why || ''}`;
		});

		const message = {
			text: `📋 *List: ${list.name}* (${leads.length} leads)\n\n${lines.join('\n\n')}`
		};

		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(message)
		});

		if (!res.ok) return fail(500, { error: 'Slack webhook failed' });

		// Log handoff
		await supabase.from('handoffs').insert({
			list_id: listId,
			channel: 'slack',
			summary: `Sent ${leads.length} leads to Slack`
		});
		await supabase.from('lists').update({ exported_at: new Date().toISOString() }).eq('id', listId);

		return { success: true, message: 'Sent to Slack' };
	},

	export_csv: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const listId = form.get('list_id') as string;

		const { data: list } = await supabase
			.from('lists')
			.select('*, list_items(leads(full_name, title, email, phone, phone_type, fit_score, signal_why, source_provider, accounts(company_name, domain)))')
			.eq('id', listId)
			.single();

		if (!list) return fail(404, { error: 'List not found' });

		// Log handoff
		await supabase.from('handoffs').insert({
			list_id: listId,
			channel: 'csv',
			summary: `Exported ${list.list_items.length} leads as CSV`
		});
		await supabase.from('lists').update({ exported_at: new Date().toISOString() }).eq('id', listId);

		return { success: true, message: 'CSV export logged. Download will come from the API route.' };
	}
};
