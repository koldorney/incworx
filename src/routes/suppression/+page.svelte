<script lang="ts">
	let { data, form: actionResult } = $props();
	let bulkMode = $state(false);
	let bulkCsv = $state('');
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">Suppression List</h2>
			<p class="text-sm text-gray-500 mt-0.5">Block specific emails, phones, or domains from appearing in your lists.</p>
		</div>
		<button onclick={() => bulkMode = !bulkMode}
			class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				{#if bulkMode}
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
				{/if}
			</svg>
			{bulkMode ? 'Single Entry' : 'Bulk Upload'}
		</button>
	</div>

	{#if actionResult?.success}
		<div class="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			{actionResult.message || 'Done.'}
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

	<!-- Add Entry -->
	<div class="mb-6 bg-white border border-gray-200 rounded-xl p-5">
		{#if bulkMode}
			<h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
				<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
				</svg>
				Bulk Upload
			</h3>
			<form method="POST" action="?/bulk_upload" class="space-y-3">
				<div class="flex gap-3">
					<div>
						<label for="bulk_type" class="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
						<select id="bulk_type" name="type" class="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow">
							<option value="email">Email</option>
							<option value="phone">Phone</option>
							<option value="domain">Domain</option>
						</select>
					</div>
					<div class="flex-1">
						<label for="bulk_reason" class="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
						<input id="bulk_reason" name="reason" type="text"
							class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
							placeholder="Bulk upload" />
					</div>
				</div>
				<div>
					<label for="bulk_csv" class="block text-xs font-medium text-gray-600 mb-1.5">Values (one per line or comma-separated)</label>
					<textarea id="bulk_csv" name="csv" rows="4" bind:value={bulkCsv}
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="bad@example.com&#10;spam@example.com"></textarea>
				</div>
				<button type="submit" class="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
					Add to Suppression
				</button>
			</form>
		{:else}
			<h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
				<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
				</svg>
				Add Suppression Entry
			</h3>
			<form method="POST" action="?/add" class="flex items-end gap-3">
				<div>
					<label for="entry_type" class="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
					<select id="entry_type" name="type" class="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow">
						<option value="email">Email</option>
						<option value="phone">Phone</option>
						<option value="domain">Domain</option>
					</select>
				</div>
				<div class="flex-1">
					<label for="entry_value" class="block text-xs font-medium text-gray-600 mb-1.5">Value</label>
					<input id="entry_value" name="value" type="text"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="spam@example.com" />
				</div>
				<div class="flex-1">
					<label for="entry_reason" class="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
					<input id="entry_reason" name="reason" type="text"
						class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
						placeholder="Opted out" />
				</div>
				<button type="submit" class="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
					Suppress
				</button>
			</form>
		{/if}
	</div>

	<!-- Suppression Table -->
	<div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50/80 border-b border-gray-200">
				<tr>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
					<th class="px-4 py-3 w-16"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.entries as entry}
					<tr class="hover:bg-gray-50/50 transition-colors">
						<td class="px-4 py-3">
							<span class="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ring-1 ring-inset
								{entry.type === 'email' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
								 entry.type === 'phone' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
								 'bg-amber-50 text-amber-700 ring-amber-600/20'}">
								{entry.type}
							</span>
						</td>
						<td class="px-4 py-3 font-mono text-gray-900 text-xs">{entry.value}</td>
						<td class="px-4 py-3 text-gray-600">{entry.reason || '—'}</td>
						<td class="px-4 py-3 text-gray-500">{new Date(entry.added_at).toLocaleDateString()}</td>
						<td class="px-4 py-3">
							<form method="POST" action="?/remove" class="inline">
								<input type="hidden" name="id" value={entry.id} />
								<button type="submit" title="Remove entry" class="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
									</svg>
								</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-4 py-16 text-center">
							<div class="flex flex-col items-center">
								<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
									<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
									</svg>
								</div>
								<p class="text-sm font-medium text-gray-900 mb-1">No suppressed entries</p>
								<p class="text-xs text-gray-500">Add emails, phones, or domains that should never appear in your export lists.</p>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
