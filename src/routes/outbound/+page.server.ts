import { getSupabase, isConfigured } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { contacts: [], recentActivity: [], repStats: [] };

	const supabase = getSupabase();

	const [contactsResult, activityResult, statsResult] = await Promise.all([
		supabase.from('call_contacts').select('*').order('priority').order('confidence', { ascending: false }),
		supabase.from('call_activities').select('*').order('created_at', { ascending: false }).limit(50),
		supabase.from('call_activity_stats').select('*')
	]);

	return {
		contacts: contactsResult.data ?? [],
		recentActivity: activityResult.data ?? [],
		repStats: statsResult.data ?? []
	};
};
