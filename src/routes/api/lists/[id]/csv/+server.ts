import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const supabase = getSupabase();

	const { data: list } = await supabase
		.from('lists')
		.select('name, list_items(leads(full_name, title, email, phone, phone_type, fit_score, signal_why, source_provider, accounts(company_name, domain)))')
		.eq('id', params.id)
		.single();

	if (!list) {
		return new Response('List not found', { status: 404 });
	}

	// Filter against suppression
	const { data: suppressed } = await supabase.from('suppression').select('type, value');
	const suppressedSet = new Set((suppressed || []).map(s => `${s.type}:${s.value}`));

	const headers = ['Name', 'Title', 'Company', 'Domain', 'Email', 'Phone', 'Phone Type', 'Fit Score', 'Signal', 'Source'];
	const rows = [headers.join(',')];

	for (const item of list.list_items) {
		const lead = item.leads as Record<string, unknown>;
		if (!lead) continue;
		const account = lead.accounts as Record<string, string> | null;

		// Skip suppressed
		if (lead.email && suppressedSet.has(`email:${(lead.email as string).toLowerCase()}`)) continue;
		if (lead.phone && suppressedSet.has(`phone:${lead.phone}`)) continue;
		if (account?.domain && suppressedSet.has(`domain:${account.domain.toLowerCase()}`)) continue;

		const row = [
			lead.full_name,
			lead.title || '',
			account?.company_name || '',
			account?.domain || '',
			lead.email || '',
			lead.phone || '',
			lead.phone_type || '',
			lead.fit_score ?? '',
			lead.signal_why || '',
			lead.source_provider || ''
		].map(v => `"${String(v).replace(/"/g, '""')}"`);

		rows.push(row.join(','));
	}

	// Log the export
	await supabase.from('handoffs').insert({
		list_id: params.id,
		channel: 'csv',
		summary: `Exported ${rows.length - 1} leads as CSV`
	});

	const filename = `${list.name.replace(/[^a-z0-9]/gi, '_')}.csv`;

	return new Response(rows.join('\n'), {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
