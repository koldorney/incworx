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
		<h2 class="text-2xl font-bold text-gray-900">Targeting Brain</h2>
		<p class="text-sm text-gray-500 mt-1">This is what the AI knows about your ideal customer. You can also set this up through chat.</p>
	</div>

	{#if actionResult?.success}
		<div class="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			Profile saved — the AI will use this for all future searches and qualification.
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

	<form method="POST" action="?/save" class="space-y-5">
		{#if profile.id}
			<input type="hidden" name="id" value={profile.id} />
		{/if}

		<!-- Who You Are -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-1">Who You Are</h3>
			<p class="text-xs text-gray-400 mb-4">The AI uses this to position you correctly in outreach signals.</p>
			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Profile Name</label>
					<input id="name" name="name" type="text" value={profile.name}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="e.g. Jonathan Hicks – US IT Services" required />
				</div>
				<div>
					<label for="services" class="block text-sm font-medium text-gray-700 mb-1.5">Services You Sell</label>
					<input id="services" name="services" type="text" value={profile.services?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="IT consulting, managed services, cloud migration" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated</p>
				</div>
				<div>
					<label for="positioning" class="block text-sm font-medium text-gray-700 mb-1.5">Your Positioning</label>
					<textarea id="positioning" name="positioning" rows="2"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="How you want the AI to describe what you do">{profile.positioning}</textarea>
				</div>
				<div>
					<label for="voice_notes" class="block text-sm font-medium text-gray-700 mb-1.5">Voice &amp; Tone</label>
					<textarea id="voice_notes" name="voice_notes" rows="2"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Tone, phrases, personality the AI should use">{profile.voice_notes}</textarea>
				</div>
			</div>
		</div>

		<!-- Who You Target -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-1">Who You Target</h3>
			<p class="text-xs text-gray-400 mb-4">The AI uses this to decide who to find and how to filter.</p>
			<div class="space-y-4">
				<div>
					<label for="target_titles" class="block text-sm font-medium text-gray-700 mb-1.5">Decision Maker Titles</label>
					<input id="target_titles" name="target_titles" type="text" value={profile.target_titles?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="CTO, VP Engineering, IT Director" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated</p>
				</div>
				<div>
					<label for="target_geo" class="block text-sm font-medium text-gray-700 mb-1.5">Geography</label>
					<input id="target_geo" name="target_geo" type="text" value={profile.target_geo?.join(', ')}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="US, UK, Canada" />
					<p class="text-xs text-gray-400 mt-1">Comma-separated</p>
				</div>
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
		</div>

		<!-- How the AI Qualifies -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<h3 class="text-sm font-semibold text-gray-900 mb-1">How the AI Qualifies</h3>
			<p class="text-xs text-gray-400 mb-4">Teaches the AI what a good fit looks like vs. what to skip.</p>
			<div class="space-y-4">
				<div>
					<label for="pain_points" class="block text-sm font-medium text-gray-700 mb-1.5">Pain Points You Solve</label>
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
					<label for="disqualifiers" class="block text-sm font-medium text-gray-700 mb-1.5">Instant Disqualifiers</label>
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

		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-400">You can also tell the AI about your ICP in chat — it'll update this for you.</p>
			<button type="submit"
				class="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer">
				Save Profile
			</button>
		</div>
	</form>
</div>
