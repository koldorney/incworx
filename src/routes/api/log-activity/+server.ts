import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const supabase = getSupabase();

	// block_type is constrained to 'A' | 'B' (the call group). The rep is stored
	// in its own column — never shove the rep name into block_type.
	const block_type = body.block_type === 'B' ? 'B' : 'A';

	const { error } = await supabase.from('call_activities').insert({
		contact_id: body.contact_id || null,
		contact_name: body.contact_name,
		firm: body.firm,
		disposition: body.disposition,
		notes: body.notes || '',
		block_type,
		rep: body.rep || null,
		session_id: body.session_id || '',
		duration_secs: body.duration_secs || 0
	});

	if (error) return json({ error: error.message }, { status: 500 });
	return json({ success: true });
};
