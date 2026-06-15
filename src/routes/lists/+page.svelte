<script lang="ts">
	let { data, form: actionResult } = $props();
	let newListName = $state('');
	let selectedIcp = $state(data.profiles[0]?.id ?? '');
</script>

<div class="max-w-4xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Lists</h2>
		<p class="text-sm text-gray-500 mt-0.5">Build export lists from qualified leads and download CSV for your BDR.</p>
	</div>

	{#if actionResult?.message}
		<div class="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
			</svg>
			{actionResult.message}
		</div>
	{/if}
	{#if actionResult?.error}
		<div class="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
			</svg>
			{actionResult.error}
		</div>
	{/if}

	<!-- Create List -->
	<div class="mb-6 bg-white border border-gray-200 rounded-xl p-5">
		<h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
			<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			Create List from Qualified Leads
		</h3>
		<form method="POST" action="?/create" class="flex items-end gap-3">
			<div class="flex-1">
				<label for="list_name" class="block text-xs font-medium text-gray-600 mb-1.5">List Name</label>
				<input id="list_name" name="name" type="text" bind:value={newListName}
					class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
					placeholder="Week 1 — IT Directors" />
			</div>
			<div>
				<label for="list_icp" class="block text-xs font-medium text-gray-600 mb-1.5">ICP Profile</label>
				<select id="list_icp" name="icp_id" bind:value={selectedIcp}
					class="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow">
					{#each data.profiles as p}
						<option value={p.id}>{p.name}</option>
					{:else}
						<option value="" disabled>No profiles</option>
					{/each}
				</select>
			</div>
			<button type="submit"
				class="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer whitespace-nowrap">
				Create List
			</button>
		</form>
	</div>

	<!-- Existing Lists -->
	<div class="space-y-3">
		{#each data.lists as list}
			<div class="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition-colors">
				<div class="flex items-center gap-4">
					<div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
						<svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
						</svg>
					</div>
					<div>
						<h4 class="text-sm font-semibold text-gray-900">{list.name}</h4>
						<p class="text-xs text-gray-500 mt-0.5">
							{list.list_items?.[0]?.count ?? 0} leads
							{#if list.exported_at}
								<span class="text-gray-300 mx-1">&middot;</span>
								Exported {new Date(list.exported_at).toLocaleDateString()}
							{/if}
						</p>
					</div>
				</div>
				<a href="/api/lists/{list.id}/csv"
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
					</svg>
					Export CSV
				</a>
			</div>
		{:else}
			<div class="bg-white border border-gray-200 rounded-xl p-12 text-center">
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
						<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900 mb-1">No lists yet</p>
					<p class="text-xs text-gray-500">Qualify some leads first, then create a list above to export CSV for your BDR.</p>
				</div>
			</div>
		{/each}
	</div>
</div>
