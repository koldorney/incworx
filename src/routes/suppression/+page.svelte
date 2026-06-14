<script lang="ts">
	let { data, form: actionResult } = $props();
	let bulkMode = $state(false);
	let bulkCsv = $state('');
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Suppression List</h2>
		<button onclick={() => bulkMode = !bulkMode}
			class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
			{bulkMode ? 'Single Entry' : 'Bulk Upload'}
		</button>
	</div>

	{#if actionResult?.success}
		<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
			{actionResult.message || 'Done.'}
		</div>
	{/if}
	{#if actionResult?.error}
		<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
			{actionResult.error}
		</div>
	{/if}

	<!-- Add Entry -->
	<div class="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
		{#if bulkMode}
			<form method="POST" action="?/bulk_upload" class="space-y-3">
				<div class="flex gap-3">
					<div>
						<label for="bulk_type" class="block text-xs text-gray-500 mb-1">Type</label>
						<select id="bulk_type" name="type" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
							<option value="email">Email</option>
							<option value="phone">Phone</option>
							<option value="domain">Domain</option>
						</select>
					</div>
					<div class="flex-1">
						<label for="bulk_reason" class="block text-xs text-gray-500 mb-1">Reason</label>
						<input id="bulk_reason" name="reason" type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							placeholder="Bulk upload" />
					</div>
				</div>
				<div>
					<label for="bulk_csv" class="block text-xs text-gray-500 mb-1">Values (one per line or comma-separated)</label>
					<textarea id="bulk_csv" name="csv" rows="4" bind:value={bulkCsv}
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
						placeholder="bad@example.com&#10;spam@example.com"></textarea>
				</div>
				<button type="submit" class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
					Add to Suppression
				</button>
			</form>
		{:else}
			<form method="POST" action="?/add" class="flex items-end gap-3">
				<div>
					<label for="entry_type" class="block text-xs text-gray-500 mb-1">Type</label>
					<select id="entry_type" name="type" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
						<option value="email">Email</option>
						<option value="phone">Phone</option>
						<option value="domain">Domain</option>
					</select>
				</div>
				<div class="flex-1">
					<label for="entry_value" class="block text-xs text-gray-500 mb-1">Value</label>
					<input id="entry_value" name="value" type="text"
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="spam@example.com" />
				</div>
				<div class="flex-1">
					<label for="entry_reason" class="block text-xs text-gray-500 mb-1">Reason</label>
					<input id="entry_reason" name="reason" type="text"
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						placeholder="Opted out" />
				</div>
				<button type="submit" class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
					Suppress
				</button>
			</form>
		{/if}
	</div>

	<!-- Suppression Table -->
	<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-200">
				<tr>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
					<th class="px-3 py-2"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.entries as entry}
					<tr class="hover:bg-gray-50">
						<td class="px-3 py-2">
							<span class="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{entry.type}</span>
						</td>
						<td class="px-3 py-2 font-mono text-gray-900">{entry.value}</td>
						<td class="px-3 py-2 text-gray-600">{entry.reason || '—'}</td>
						<td class="px-3 py-2 text-gray-500">{new Date(entry.added_at).toLocaleDateString()}</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/remove" class="inline">
								<input type="hidden" name="id" value={entry.id} />
								<button type="submit" class="text-red-600 hover:text-red-800 text-xs">Remove</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-3 py-8 text-center text-gray-500">
							No suppressed entries yet.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
