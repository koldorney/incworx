<script lang="ts">
	import { enhance } from '$app/forms';

	let mode: 'login' | 'signup' = $state('login');
	let loading = $state(false);

	let { form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-12 h-12 bg-brand-500 rounded-xl mb-4">
				<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<h1 class="text-xl font-semibold text-white">Incworx GTM Center</h1>
			<p class="text-sm text-brand-200 mt-1">AI-powered outbound lead generation</p>
		</div>

		<div class="bg-white rounded-xl shadow-2xl shadow-black/20 p-8">
			<h2 class="text-lg font-semibold text-gray-900 mb-1">
				{mode === 'login' ? 'Welcome back' : 'Get started'}
			</h2>
			<p class="text-sm text-gray-500 mb-6">
				{mode === 'login' ? 'Sign in to your account' : 'Create your account'}
			</p>

			{#if form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
					<svg class="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
					</svg>
					<span>{form.error}</span>
				</div>
			{/if}

			{#if form?.success}
				<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start gap-2">
					<svg class="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{form.success}</span>
				</div>
			{/if}

			<form
				method="POST"
				action={mode === 'login' ? '?/login' : '?/signup'}
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
							placeholder="you@company.com"
						/>
					</div>
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							minlength="6"
							class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
							placeholder="Min 6 characters"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						class="w-full py-2.5 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer"
					>
						{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
					</button>
				</div>
			</form>

			<div class="mt-5 text-center">
				<button
					type="button"
					onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
					class="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
				>
					{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
				</button>
			</div>
		</div>
	</div>
</div>
