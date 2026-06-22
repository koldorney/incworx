import { getSupabase, isConfigured } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { contacts: [] };

	const supabase = getSupabase();
	const { data } = await supabase
		.from('call_contacts')
		.select('*')
		.order('priority', { ascending: true })
		.order('confidence', { ascending: false });

	return { contacts: data ?? [] };
};
