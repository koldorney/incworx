<script lang="ts">
	import { enhance } from '$app/forms';

	let mode: 'login' | 'signup' = $state('login');
	let loading = $state(false);

	let { form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="w-full max-w-sm">
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
			<h1 class="text-xl font-semibold text-gray-900 mb-1">KoldOps Engine</h1>
			<p class="text-sm text-gray-500 mb-6">
				{mode === 'login' ? 'Sign in to your account' : 'Create your account'}
			</p>

			{#if form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			{#if form?.success}
				<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
					{form.success}
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
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="you@company.com"
						/>
					</div>
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							minlength="6"
							class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Min 6 characters"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						class="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
					>
						{loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
					</button>
				</div>
			</form>

			<div class="mt-4 text-center">
				<button
					type="button"
					onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
					class="text-sm text-blue-600 hover:text-blue-700"
				>
					{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
				</button>
			</div>
		</div>
	</div>
</div>
