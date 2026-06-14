import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase } }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim();
		const password = form.get('password') as string;

		if (!email || !password) return fail(400, { error: 'Email and password are required' });

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message });

		redirect(303, '/');
	},

	signup: async ({ request, locals: { supabase } }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim();
		const password = form.get('password') as string;

		if (!email || !password) return fail(400, { error: 'Email and password are required' });
		if (password.length < 6) return fail(400, { error: 'Password must be at least 6 characters' });

		const { error } = await supabase.auth.signUp({ email, password });
		if (error) return fail(400, { error: error.message });

		return { success: 'Check your email to confirm your account.' };
	}
};
