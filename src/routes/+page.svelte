<script lang="ts">
	let { data } = $props();

	const steps = [
		{ num: '1', label: 'Define ICP', desc: 'Set your ideal customer profile', href: '/profile' },
		{ num: '2', label: 'Source', desc: 'Find contacts via Apollo', href: '/leads' },
		{ num: '3', label: 'Enrich', desc: 'Verify emails & phones', href: '/leads' },
		{ num: '4', label: 'Qualify', desc: 'AI scores fit & signals', href: '/leads' },
		{ num: '5', label: 'Export', desc: 'Build lists for your BDR', href: '/lists' }
	];
</script>

<div class="max-w-4xl">
	<div class="mb-8">
		<h2 class="text-2xl font-bold text-gray-900">Outbound Engine</h2>
		<p class="text-gray-500 mt-1">Source, enrich, qualify, and export leads — from one place.</p>
	</div>

	<!-- Pipeline Steps -->
	<div class="grid grid-cols-5 gap-3 mb-10">
		{#each steps as step, i}
			<a href={step.href} class="group relative">
				<div class="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-md transition-all h-full">
					<div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold mb-3">
						{step.num}
					</div>
					<p class="text-sm font-semibold text-gray-900">{step.label}</p>
					<p class="text-xs text-gray-500 mt-0.5">{step.desc}</p>
				</div>
				{#if i < 4}
					<div class="absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300 z-10 hidden lg:block">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</div>
				{/if}
			</a>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 gap-4">
		<a href="/profile" class="group flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
			<div class="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
				</svg>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-900 group-hover:text-brand-700">ICP Profile</h3>
				<p class="text-xs text-gray-500 mt-0.5">Define who you're targeting — titles, company size, pain points, and disqualifiers</p>
			</div>
		</a>

		<a href="/leads" class="group flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
			<div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
				</svg>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-900 group-hover:text-brand-700">Leads</h3>
				<p class="text-xs text-gray-500 mt-0.5">Source contacts from Apollo, enrich with email/phone, and qualify with AI</p>
			</div>
		</a>

		<a href="/lists" class="group flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
			<div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
				</svg>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-900 group-hover:text-brand-700">Lists</h3>
				<p class="text-xs text-gray-500 mt-0.5">Build export lists from qualified leads and download CSV for your BDR</p>
			</div>
		</a>

		<a href="/usage" class="group flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
			<div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
				</svg>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-900 group-hover:text-brand-700">Usage</h3>
				<p class="text-xs text-gray-500 mt-0.5">Track API spend by provider, operation, and day</p>
			</div>
		</a>
	</div>
</div>
