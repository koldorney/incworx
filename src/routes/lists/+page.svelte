<script lang="ts">
	let { data, form: actionResult } = $props();
	let newListName = $state('');
	let selectedIcp = $state(data.profiles[0]?.id ?? '');
</script>

<div class="max-w-4xl">
	<h2 class="text-2xl font-bold text-gray-900 mb-6">Lists</h2>

	{#if actionResult?.message}
		<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
			{actionResult.message}
		</div>
	{/if}
	{#if actionResult?.error}
		<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
			{actionResult.error}
		</div>
	{/if}

	<!-- Create List -->
	<div class="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
		<h3 class="text-sm font-semibold text-gray-900 mb-3">Create List from Qualified Leads</h3>
		<form method="POST" action="?/create" class="flex items-end gap-3">
			<div class="flex-1">
				<label for="list_name" class="block text-xs text-gray-500 mb-1">List Name</label>
				<input id="list_name" name="name" type="text" bind:value={newListName}
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
					placeholder="Week 1 — IT Directors" />
			</div>
			<div>
				<label for="list_icp" class="block text-xs text-gray-500 mb-1">ICP Profile</label>
				<select id="list_icp" name="icp_id" bind:value={selectedIcp}
					class="px-3 py-2 border border-gray-300 rounded-md text-sm">
					{#each data.profiles as p}
						<option value={p.id}>{p.name}</option>
					{/each}
				</select>
			</div>
			<button type="submit"
				class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
				Create List
			</button>
		</form>
	</div>

	<!-- Existing Lists -->
	<div class="space-y-3">
		{#each data.lists as list}
			<div class="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
				<div>
					<h4 class="font-medium text-gray-900">{list.name}</h4>
					<p class="text-xs text-gray-500 mt-0.5">
						{list.list_items?.[0]?.count ?? 0} leads
						{#if list.exported_at}
							&middot; Exported {new Date(list.exported_at).toLocaleDateString()}
						{/if}
					</p>
				</div>
				<div class="flex gap-2">
					<form method="POST" action="?/send_slack">
						<input type="hidden" name="list_id" value={list.id} />
						<button type="submit"
							class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
							Send to Slack
						</button>
					</form>
					<a href="/api/lists/{list.id}/csv"
						class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center">
						Export CSV
					</a>
				</div>
			</div>
		{:else}
			<div class="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
				No lists yet. Qualify some leads and create a list above.
			</div>
		{/each}
	</div>
</div>
