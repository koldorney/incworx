import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export function isConfigured(): boolean {
	return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase() {
	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
	return createClient(url, key);
}
