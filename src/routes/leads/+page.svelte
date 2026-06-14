<script lang="ts">
	let { data, form: actionResult } = $props();
	let selectedIds = $state<string[]>([]);
	let domain = $state('');
	let selectedIcp = $state(data.profiles[0]?.id ?? '');

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter(i => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function selectAll() {
		if (selectedIds.length === data.leads.length) {
			selectedIds = [];
		} else {
			selectedIds = data.leads.map((l: { id: string }) => l.id);
		}
	}

	function statusColor(status: string) {
		switch (status) {
			case 'valid': return 'bg-green-100 text-green-800';
			case 'invalid': return 'bg-red-100 text-red-800';
			case 'catch_all': return 'bg-yellow-100 text-yellow-800';
			case 'qualified': return 'bg-green-100 text-green-800';
			case 'disqualified': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Leads</h2>
		<div class="flex gap-2">
			<a href="/leads?status=all" class="px-3 py-1 text-sm rounded-md {data.filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}">All</a>
			<a href="/leads?status=pending" class="px-3 py-1 text-sm rounded-md {data.filter === 'pending' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}">Pending</a>
			<a href="/leads?status=qualified" class="px-3 py-1 text-sm rounded-md {data.filter === 'qualified' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}">Qualified</a>
			<a href="/leads?status=disqualified" class="px-3 py-1 text-sm rounded-md {data.filter === 'disqualified' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">Disqualified</a>
		</div>
	</div>

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

	<!-- Find Leads -->
	<div class="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
		<h3 class="text-sm font-semibold text-gray-900 mb-3">Source Leads</h3>
		<form method="POST" action="?/find_leads" class="flex items-end gap-3">
			<div class="flex-1">
				<label for="icp_select" class="block text-xs text-gray-500 mb-1">ICP Profile</label>
				<select id="icp_select" name="icp_id" bind:value={selectedIcp}
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
					{#each data.profiles as p}
						<option value={p.id}>{p.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex-1">
				<label for="domain_input" class="block text-xs text-gray-500 mb-1">Company Domain</label>
				<input id="domain_input" name="domain" type="text" bind:value={domain}
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
					placeholder="acme.com" />
			</div>
			<button type="submit"
				class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
				Find Leads
			</button>
		</form>
	</div>

	<!-- Bulk Actions -->
	{#if selectedIds.length > 0}
		<div class="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
			<span class="text-sm text-gray-700">{selectedIds.length} selected</span>
			<form method="POST" action="?/enrich" class="inline">
				<input type="hidden" name="lead_ids" value={selectedIds.join(',')} />
				<button type="submit" class="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700">
					Enrich
				</button>
			</form>
			<form method="POST" action="?/qualify" class="inline">
				<input type="hidden" name="lead_ids" value={selectedIds.join(',')} />
				<input type="hidden" name="icp_id" value={selectedIcp} />
				<button type="submit" class="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700">
					Qualify
				</button>
			</form>
		</div>
	{/if}

	<!-- Lead Table -->
	<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-200">
				<tr>
					<th class="px-3 py-2 text-left">
						<input type="checkbox" onchange={selectAll}
							checked={selectedIds.length === data.leads.length && data.leads.length > 0} />
					</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
					<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fit</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.leads as lead}
					<tr class="hover:bg-gray-50">
						<td class="px-3 py-2">
							<input type="checkbox" checked={selectedIds.includes(lead.id)}
								onchange={() => toggleSelect(lead.id)} />
						</td>
						<td class="px-3 py-2 font-medium text-gray-900">{lead.full_name}</td>
						<td class="px-3 py-2 text-gray-600">{lead.title || '—'}</td>
						<td class="px-3 py-2 text-gray-600">{lead.accounts?.company_name || '—'}</td>
						<td class="px-3 py-2">
							{#if lead.email}
								<span class="inline-flex items-center gap-1">
									<span class="truncate max-w-32">{lead.email}</span>
									<span class="px-1.5 py-0.5 text-xs rounded {statusColor(lead.email_status)}">{lead.email_status}</span>
								</span>
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-3 py-2">
							{#if lead.phone}
								<span class="inline-flex items-center gap-1">
									<span>{lead.phone}</span>
									<span class="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{lead.phone_type}</span>
								</span>
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-3 py-2">
							<span class="px-1.5 py-0.5 text-xs rounded {statusColor(lead.qualification_status)}">
								{lead.qualification_status}
							</span>
						</td>
						<td class="px-3 py-2">
							{#if lead.fit_score != null}
								<span class="font-mono text-xs">{lead.fit_score}</span>
								{#if lead.signal_why}
									<p class="text-xs text-gray-500 mt-0.5 truncate max-w-48" title={lead.signal_why}>{lead.signal_why}</p>
								{/if}
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="px-3 py-8 text-center text-gray-500">
							No leads yet. Source some from the panel above.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
