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
	<h2 class="text-2xl font-bold text-gray-900 mb-6">ICP Profile</h2>

	{#if actionResult?.success}
		<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
			Profile saved.
		</div>
	{/if}
	{#if actionResult?.error}
		<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
			{actionResult.error}
		</div>
	{/if}

	<form method="POST" action="?/save" class="space-y-6">
		{#if profile.id}
			<input type="hidden" name="id" value={profile.id} />
		{/if}

		<div class="grid grid-cols-2 gap-4">
			<div class="col-span-2">
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
				<input id="name" name="name" type="text" value={profile.name}
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
					placeholder="e.g. Jonathan Hicks – US Services" required />
			</div>

			<div class="col-span-2">
				<label for="services" class="block text-sm font-medium text-gray-700 mb-1">Services (comma-separated)</label>
				<input id="services" name="services" type="text" value={profile.services?.join(', ')}
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
					placeholder="IT consulting, managed services, cloud migration" />
			</div>

			<div class="col-span-2">
				<label for="positioning" class="block text-sm font-medium text-gray-700 mb-1">Positioning</label>
				<textarea id="positioning" name="positioning" rows="2"
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
					placeholder="How you want to be positioned to prospects">{profile.positioning}</textarea>
			</div>

			<div class="col-span-2">
				<label for="voice_notes" class="block text-sm font-medium text-gray-700 mb-1">Voice Notes</label>
				<textarea id="voice_notes" name="voice_notes" rows="2"
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
					placeholder="Tone, style, phrases to use in signals">{profile.voice_notes}</textarea>
			</div>
		</div>

		<div class="border-t pt-4">
			<h3 class="text-sm font-semibold text-gray-900 mb-3">Firmographic Filters</h3>
			<div class="grid grid-cols-3 gap-4">
				<div>
					<label for="company_size_min" class="block text-sm font-medium text-gray-700 mb-1">Min Size (employees)</label>
					<input id="company_size_min" name="company_size_min" type="number" value={profile.company_size_min}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="10" />
				</div>
				<div>
					<label for="company_size_max" class="block text-sm font-medium text-gray-700 mb-1">Max Size</label>
					<input id="company_size_max" name="company_size_max" type="number" value={profile.company_size_max}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="500" />
				</div>
				<div>
					<label for="revenue_stage" class="block text-sm font-medium text-gray-700 mb-1">Revenue Stage</label>
					<select id="revenue_stage" name="revenue_stage"
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
						<option value="">Any</option>
						<option value="pre-revenue" selected={profile.revenue_stage === 'pre-revenue'}>Pre-Revenue</option>
						<option value="1m-5m" selected={profile.revenue_stage === '1m-5m'}>$1M–$5M</option>
						<option value="5m-20m" selected={profile.revenue_stage === '5m-20m'}>$5M–$20M</option>
						<option value="20m-50m" selected={profile.revenue_stage === '20m-50m'}>$20M–$50M</option>
						<option value="50m-100m" selected={profile.revenue_stage === '50m-100m'}>$50M–$100M</option>
						<option value="100m+" selected={profile.revenue_stage === '100m+'}>$100M+</option>
					</select>
				</div>
			</div>
		</div>

		<div class="border-t pt-4">
			<h3 class="text-sm font-semibold text-gray-900 mb-3">Targeting</h3>
			<div class="space-y-4">
				<div>
					<label for="target_titles" class="block text-sm font-medium text-gray-700 mb-1">Target Titles (comma-separated)</label>
					<input id="target_titles" name="target_titles" type="text" value={profile.target_titles?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="CTO, VP Engineering, IT Director" />
				</div>
				<div>
					<label for="target_geo" class="block text-sm font-medium text-gray-700 mb-1">Target Geo (comma-separated)</label>
					<input id="target_geo" name="target_geo" type="text" value={profile.target_geo?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="US" />
				</div>
			</div>
		</div>

		<div class="border-t pt-4">
			<h3 class="text-sm font-semibold text-gray-900 mb-3">Qualification Criteria</h3>
			<div class="space-y-4">
				<div>
					<label for="pain_points" class="block text-sm font-medium text-gray-700 mb-1">Pain Points (comma-separated)</label>
					<input id="pain_points" name="pain_points" type="text" value={profile.pain_points?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="Legacy infrastructure, security compliance gaps" />
				</div>
				<div>
					<label for="buying_triggers" class="block text-sm font-medium text-gray-700 mb-1">Buying Triggers (comma-separated)</label>
					<input id="buying_triggers" name="buying_triggers" type="text" value={profile.buying_triggers?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="New CTO hire, failed audit, M&A activity" />
				</div>
				<div>
					<label for="disqualifiers" class="block text-sm font-medium text-gray-700 mb-1">Disqualifiers (comma-separated)</label>
					<input id="disqualifiers" name="disqualifiers" type="text" value={profile.disqualifiers?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="Government, non-profit, under 10 employees" />
				</div>
				<div>
					<label for="objections" class="block text-sm font-medium text-gray-700 mb-1">Common Objections (comma-separated)</label>
					<input id="objections" name="objections" type="text" value={profile.objections?.join(', ')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="Already have an MSP, budget frozen" />
				</div>
			</div>
		</div>

		<div class="flex justify-end pt-4 border-t">
			<button type="submit"
				class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
				Save Profile
			</button>
		</div>
	</form>
</div>
