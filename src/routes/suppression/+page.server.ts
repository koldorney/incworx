import { getSupabase, isConfigured } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { entries: [] };
	const supabase = getSupabase();
	const { data: entries } = await supabase
		.from('suppression')
		.select('*')
		.order('added_at', { ascending: false })
		.limit(200);

	return { entries: entries ?? [] };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const type = form.get('type') as string;
		const value = (form.get('value') as string)?.trim().toLowerCase();
		const reason = (form.get('reason') as string)?.trim() || null;

		if (!type || !value) return fail(400, { error: 'Type and value are required' });
		if (!['email', 'phone', 'domain'].includes(type)) return fail(400, { error: 'Invalid type' });

		const { error } = await supabase.from('suppression').insert({ type, value, reason });
		if (error) {
			if (error.code === '23505') return fail(409, { error: 'Already suppressed' });
			return fail(500, { error: error.message });
		}

		return { success: true };
	},

	remove: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(400, { error: 'Missing ID' });
		await supabase.from('suppression').delete().eq('id', id);
		return { success: true };
	},

	bulk_upload: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();
		const type = form.get('type') as string;
		const csv = form.get('csv') as string;
		const reason = (form.get('reason') as string)?.trim() || 'Bulk upload';

		if (!type || !csv) return fail(400, { error: 'Type and CSV data required' });

		const values = csv.split(/[\n,]/).map(v => v.trim().toLowerCase()).filter(Boolean);
		const rows = values.map(value => ({ type, value, reason }));

		const { error } = await supabase.from('suppression').upsert(rows, { onConflict: 'type,value' });
		if (error) return fail(500, { error: error.message });

		return { success: true, message: `Added ${rows.length} entries` };
	}
};
