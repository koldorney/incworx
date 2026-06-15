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

	function statusBadge(status: string) {
		switch (status) {
			case 'valid': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
			case 'invalid': return 'bg-red-50 text-red-700 ring-red-600/20';
			case 'catch_all': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
			case 'qualified': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
			case 'disqualified': return 'bg-red-50 text-red-700 ring-red-600/20';
			default: return 'bg-gray-50 text-gray-600 ring-gray-500/20';
		}
	}

	function fitColor(score: number) {
		if (score >= 80) return 'text-emerald-700 bg-emerald-50';
		if (score >= 60) return 'text-amber-700 bg-amber-50';
		return 'text-red-700 bg-red-50';
	}

	const filters = [
		{ key: 'all', label: 'All', href: '/leads?status=all' },
		{ key: 'pending', label: 'Pending', href: '/leads?status=pending' },
		{ key: 'qualified', label: 'Qualified', href: '/leads?status=qualified' },
		{ key: 'disqualified', label: 'Disqualified', href: '/leads?status=disqualified' }
	];
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">Leads</h2>
			<p class="text-sm text-gray-500 mt-0.5">{data.leads.length} total leads</p>
		</div>
		<div class="flex gap-1.5 bg-gray-100 rounded-lg p-1">
			{#each filters as f}
				<a href={f.href}
					class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors
						{data.filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">
					{f.label}
				</a>
			{/each}
		</div>
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

	<!-- Source Leads -->
	<div class="mb-6 bg-white border border-gray-200 rounded-xl p-5">
		<h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
			<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			Source Leads from Apollo
		</h3>
		<form method="POST" action="?/find_leads" class="flex items-end gap-3">
			<div class="flex-1">
				<label for="icp_select" class="block text-xs font-medium text-gray-600 mb-1.5">ICP Profile</label>
				<select id="icp_select" name="icp_id" bind:value={selectedIcp}
					class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow">
					{#each data.profiles as p}
						<option value={p.id}>{p.name}</option>
					{:else}
						<option value="" disabled>No profiles — create one first</option>
					{/each}
				</select>
			</div>
			<div class="flex-1">
				<label for="domain_input" class="block text-xs font-medium text-gray-600 mb-1.5">Company Domain</label>
				<input id="domain_input" name="domain" type="text" bind:value={domain}
					class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
					placeholder="acme.com" />
			</div>
			<button type="submit"
				class="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer whitespace-nowrap">
				Find Leads
			</button>
		</form>
	</div>

	<!-- Bulk Actions -->
	{#if selectedIds.length > 0}
		<div class="mb-4 p-3.5 bg-brand-50 border border-brand-200 rounded-xl flex items-center gap-3">
			<span class="text-sm font-medium text-brand-700">{selectedIds.length} selected</span>
			<div class="h-4 w-px bg-brand-200"></div>
			<form method="POST" action="?/enrich" class="inline">
				<input type="hidden" name="lead_ids" value={selectedIds.join(',')} />
				<button type="submit" class="px-3.5 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
					Enrich
				</button>
			</form>
			<form method="POST" action="?/qualify" class="inline">
				<input type="hidden" name="lead_ids" value={selectedIds.join(',')} />
				<input type="hidden" name="icp_id" value={selectedIcp} />
				<button type="submit" class="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
					Qualify with AI
				</button>
			</form>
			<button type="button" onclick={() => selectedIds = []}
				class="ml-auto text-xs text-brand-600 hover:text-brand-800 font-medium cursor-pointer">
				Clear selection
			</button>
		</div>
	{/if}

	<!-- Lead Table -->
	<div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50/80 border-b border-gray-200">
				<tr>
					<th class="px-4 py-3 text-left w-10">
						<input type="checkbox" onchange={selectAll}
							checked={selectedIds.length === data.leads.length && data.leads.length > 0}
							class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
					</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fit</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.leads as lead}
					<tr class="hover:bg-gray-50/50 transition-colors">
						<td class="px-4 py-3">
							<input type="checkbox" checked={selectedIds.includes(lead.id)}
								onchange={() => toggleSelect(lead.id)}
								class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
						</td>
						<td class="px-4 py-3 font-medium text-gray-900">{lead.full_name}</td>
						<td class="px-4 py-3 text-gray-600 max-w-40 truncate">{lead.title || '—'}</td>
						<td class="px-4 py-3 text-gray-600">{lead.accounts?.company_name || '—'}</td>
						<td class="px-4 py-3">
							{#if lead.email}
								<div class="flex items-center gap-1.5">
									<span class="truncate max-w-36 text-gray-700">{lead.email}</span>
									<span class="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ring-1 ring-inset {statusBadge(lead.email_status)}">{lead.email_status}</span>
								</div>
							{:else}
								<span class="text-gray-300">—</span>
							{/if}
						</td>
						<td class="px-4 py-3">
							{#if lead.phone}
								<div class="flex items-center gap-1.5">
									<span class="text-gray-700">{lead.phone}</span>
									<span class="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20">{lead.phone_type}</span>
								</div>
							{:else}
								<span class="text-gray-300">—</span>
							{/if}
						</td>
						<td class="px-4 py-3">
							<span class="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ring-1 ring-inset {statusBadge(lead.qualification_status)}">
								{lead.qualification_status}
							</span>
						</td>
						<td class="px-4 py-3">
							{#if lead.fit_score != null}
								<div>
									<span class="inline-flex px-2 py-0.5 text-xs font-bold rounded-md {fitColor(lead.fit_score)}">{lead.fit_score}</span>
									{#if lead.signal_why}
										<p class="text-[11px] text-gray-500 mt-1 truncate max-w-48 leading-tight" title={lead.signal_why}>{lead.signal_why}</p>
									{/if}
								</div>
							{:else}
								<span class="text-gray-300">—</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="px-4 py-16 text-center">
							<div class="flex flex-col items-center">
								<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
									<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
									</svg>
								</div>
								<p class="text-sm font-medium text-gray-900 mb-1">No leads yet</p>
								<p class="text-xs text-gray-500">Enter a company domain above and click Find Leads to source contacts from Apollo.</p>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
