<script lang="ts">
	let { data, form: actionResult } = $props();

	let profile = $state(data.profile ?? {
		id: '',
		name: '',
		services: [],
		positioning: '',
		voice_notes: '',
		company_size_min: '',
		company_size_max: '',
		revenue_stage: '',
		target_titles: [],
		target_geo: ['US'],
		pain_points: [],
		buying_triggers: [],
		disqualifiers: [],
		objections: []
	});
</script>

<div class="max-w-3xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900">ICP Profile</h2>
		<p class="text-sm text-gray-500 mt-1">Define your ideal customer so the AI knows who to target and qualify.</p>
	</div>

	{#if actionResult?.success}
		<div class="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			Profile saved.
		</div>
	{/if}
	{#if actionResult?.error}
		<div class="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
			</svg>
			{actionResult.error}
		</div>
	{/if}

	<form method="POST" action="?/save" class="space-y-6">
		{#if profile.id}
			<input type="hidden" name="id" value={profile.id} />
		{/if}

		<!-- Identity -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
				</svg>
				Identity
			</h3>
			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Profile Name</label>
					<input id="name" name="name" type="text" value={profile.name}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="e.g. Jonathan Hicks – US IT Services" required />
				</div>
				<div>
					<label for="services" class="block text-sm font-medium text-gray-700 mb-1.5">Services</label>
					<input id="services" name="services" type="text" value={profile.services?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="IT consulting, managed services, cloud migration" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated</p>
				</div>
				<div>
					<label for="positioning" class="block text-sm font-medium text-gray-700 mb-1.5">Positioning</label>
					<textarea id="positioning" name="positioning" rows="2"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="How you want to be positioned to prospects">{profile.positioning}</textarea>
				</div>
				<div>
					<label for="voice_notes" class="block text-sm font-medium text-gray-700 mb-1.5">Voice Notes</label>
					<textarea id="voice_notes" name="voice_notes" rows="2"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Tone, style, phrases the AI should use in signals">{profile.voice_notes}</textarea>
				</div>
			</div>
		</div>

		<!-- Firmographics -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
				</svg>
				Firmographic Filters
			</h3>
			<div class="grid grid-cols-3 gap-4">
				<div>
					<label for="company_size_min" class="block text-sm font-medium text-gray-700 mb-1.5">Min Employees</label>
					<input id="company_size_min" name="company_size_min" type="number" value={profile.company_size_min}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" placeholder="10" />
				</div>
				<div>
					<label for="company_size_max" class="block text-sm font-medium text-gray-700 mb-1.5">Max Employees</label>
					<input id="company_size_max" name="company_size_max" type="number" value={profile.company_size_max}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" placeholder="500" />
				</div>
				<div>
					<label for="revenue_stage" class="block text-sm font-medium text-gray-700 mb-1.5">Revenue Stage</label>
					<select id="revenue_stage" name="revenue_stage"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow">
						<option value="">Any</option>
						<option value="pre-revenue" selected={profile.revenue_stage === 'pre-revenue'}>Pre-Revenue</option>
						<option value="1m-5m" selected={profile.revenue_stage === '1m-5m'}>$1M - $5M</option>
						<option value="5m-20m" selected={profile.revenue_stage === '5m-20m'}>$5M - $20M</option>
						<option value="20m-50m" selected={profile.revenue_stage === '20m-50m'}>$20M - $50M</option>
						<option value="50m-100m" selected={profile.revenue_stage === '50m-100m'}>$50M - $100M</option>
						<option value="100m+" selected={profile.revenue_stage === '100m+'}>$100M+</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Targeting -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
				</svg>
				Targeting
			</h3>
			<div class="space-y-4">
				<div>
					<label for="target_titles" class="block text-sm font-medium text-gray-700 mb-1.5">Target Titles</label>
					<input id="target_titles" name="target_titles" type="text" value={profile.target_titles?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="CTO, VP Engineering, IT Director" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated</p>
				</div>
				<div>
					<label for="target_geo" class="block text-sm font-medium text-gray-700 mb-1.5">Target Geography</label>
					<input id="target_geo" name="target_geo" type="text" value={profile.target_geo?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="US, UK, Canada" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated country codes</p>
				</div>
			</div>
		</div>

		<!-- Qualification -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
				</svg>
				AI Qualification Criteria
			</h3>
			<p class="text-xs text-gray-500 mb-4">These help the AI decide which leads are a good fit and craft the right signals.</p>
			<div class="space-y-4">
				<div>
					<label for="pain_points" class="block text-sm font-medium text-gray-700 mb-1.5">Pain Points</label>
					<input id="pain_points" name="pain_points" type="text" value={profile.pain_points?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Legacy infrastructure, security compliance gaps" />
				</div>
				<div>
					<label for="buying_triggers" class="block text-sm font-medium text-gray-700 mb-1.5">Buying Triggers</label>
					<input id="buying_triggers" name="buying_triggers" type="text" value={profile.buying_triggers?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="New CTO hire, failed audit, M&A activity" />
				</div>
				<div>
					<label for="disqualifiers" class="block text-sm font-medium text-gray-700 mb-1.5">Disqualifiers</label>
					<input id="disqualifiers" name="disqualifiers" type="text" value={profile.disqualifiers?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Government, non-profit, under 10 employees" />
				</div>
				<div>
					<label for="objections" class="block text-sm font-medium text-gray-700 mb-1.5">Common Objections</label>
					<input id="objections" name="objections" type="text" value={profile.objections?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Already have an MSP, budget frozen" />
				</div>
			</div>
		</div>

		<div class="flex justify-end">
			<button type="submit"
				class="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer">
				Save Profile
			</button>
		</div>
	</form>
</div>
