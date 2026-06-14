import { getSupabase, isConfigured } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { profile: null };
	const supabase = getSupabase();
	const { data: profiles } = await supabase
		.from('icp_profiles')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(1);

	return { profile: profiles?.[0] ?? null };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const supabase = getSupabase();
		const form = await request.formData();

		const parseArray = (key: string) =>
			(form.get(key) as string || '').split(',').map(s => s.trim()).filter(Boolean);

		const data = {
			name: form.get('name') as string,
			services: parseArray('services'),
			positioning: form.get('positioning') as string || null,
			voice_notes: form.get('voice_notes') as string || null,
			company_size_min: parseInt(form.get('company_size_min') as string) || null,
			company_size_max: parseInt(form.get('company_size_max') as string) || null,
			revenue_stage: form.get('revenue_stage') as string || null,
			target_titles: parseArray('target_titles'),
			target_geo: parseArray('target_geo') || ['US'],
			pain_points: parseArray('pain_points'),
			buying_triggers: parseArray('buying_triggers'),
			disqualifiers: parseArray('disqualifiers'),
			objections: parseArray('objections')
		};

		if (!data.name) return fail(400, { error: 'Name is required' });

		const existingId = form.get('id') as string;

		if (existingId) {
			const { error } = await supabase
				.from('icp_profiles')
				.update(data)
				.eq('id', existingId);
			if (error) return fail(500, { error: error.message });
		} else {
			const { error } = await supabase
				.from('icp_profiles')
				.insert(data);
			if (error) return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
