import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const supabase = getSupabase();

	const { error } = await supabase.from('call_activities').insert({
		contact_id: body.contact_id || null,
		contact_name: body.contact_name,
		firm: body.firm,
		disposition: body.disposition,
		notes: body.notes || '',
		block_type: body.block_type || 'A',
		session_id: body.session_id || '',
		duration_secs: body.duration_secs || 0
	});

	if (error) return json({ error: error.message }, { status: 500 });
	return json({ success: true });
};
