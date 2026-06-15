<script lang="ts">
	let { data, form: actionResult } = $props();
	let selectedIds = $state<string[]>([]);

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

	function selectNeedingEnrichment() {
		selectedIds = data.leads
			.filter((l: any) => l.email_status === 'unknown' || !l.phone)
			.map((l: { id: string }) => l.id);
	}

	function selectPending() {
		selectedIds = data.leads
			.filter((l: any) => l.qualification_status === 'pending')
			.map((l: { id: string }) => l.id);
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
			<p class="text-sm text-gray-500 mt-0.5">{data.stats.total} total &middot; Use chat to find new people</p>
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

	<!-- Pipeline Status Bars -->
	{#if data.stats.total > 0}
		<div class="grid grid-cols-4 gap-3 mb-6">
			<div class="bg-white border border-gray-200 rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Need Enrichment</span>
					<span class="text-lg font-bold text-purple-700">{data.stats.needsEnrichment}</span>
				</div>
				{#if data.stats.needsEnrichment > 0}
					<button onclick={selectNeedingEnrichment}
						class="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
						Select &amp; Enrich
					</button>
				{:else}
					<div class="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-lg text-center">All enriched</div>
				{/if}
			</div>

			<div class="bg-white border border-gray-200 rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Need Qualification</span>
					<span class="text-lg font-bold text-amber-700">{data.stats.needsQualification}</span>
				</div>
				{#if data.stats.needsQualification > 0}
					<button onclick={selectPending}
						class="w-full px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer">
						Select &amp; Qualify
					</button>
				{:else}
					<div class="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg text-center">All scored</div>
				{/if}
			</div>

			<div class="bg-white border border-gray-200 rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Qualified</span>
					<span class="text-lg font-bold text-emerald-700">{data.stats.qualified}</span>
				</div>
				<div class="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg text-center">
					Ready for list
				</div>
			</div>

			<div class="bg-white border border-gray-200 rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Direct Dials</span>
					<span class="text-lg font-bold text-blue-700">{data.stats.withPhone}</span>
				</div>
				<div class="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg text-center">
					{data.stats.total > 0 ? Math.round((data.stats.withPhone / data.stats.total) * 100) : 0}% coverage
				</div>
			</div>
		</div>
	{/if}

	<!-- Batch Action Bar -->
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
				<input type="hidden" name="icp_id" value={data.profiles[0]?.id ?? ''} />
				<button type="submit" class="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
					Qualify
				</button>
			</form>
			<button type="button" onclick={() => selectedIds = []}
				class="ml-auto text-xs text-brand-600 hover:text-brand-800 font-medium cursor-pointer">
				Clear
			</button>
		</div>
	{/if}

	<!-- Lead Table -->
	{#if data.leads.length > 0}
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
						<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
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
							<td class="px-4 py-3 text-gray-600 max-w-[160px] truncate">{lead.title || '—'}</td>
							<td class="px-4 py-3 text-gray-600">{lead.accounts?.company_name || '—'}</td>
							<td class="px-4 py-3">
								<div class="flex flex-col gap-0.5">
									{#if lead.email}
										<span class="text-xs text-gray-600 truncate max-w-[180px]" title={lead.email}>
											{lead.email_status === 'valid' ? '✓' : '○'} {lead.email}
										</span>
									{/if}
									{#if lead.phone}
										<span class="text-xs text-gray-600">
											{lead.phone_status === 'valid' ? '✓' : '○'} {lead.phone}
										</span>
									{:else}
										<span class="text-xs text-gray-400">No phone</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ring-1 ring-inset {statusBadge(lead.qualification_status)}">
									{lead.qualification_status}
								</span>
							</td>
							<td class="px-4 py-3">
								{#if lead.fit_score != null}
									<span class="inline-flex px-2 py-0.5 text-[11px] font-bold rounded-md {fitColor(lead.fit_score)}">
										{lead.fit_score}
									</span>
								{:else}
									<span class="text-gray-400 text-xs">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="bg-white border border-gray-200 rounded-xl p-16 text-center">
			<div class="flex flex-col items-center">
				<div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
					<svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
					</svg>
				</div>
				<p class="text-base font-medium text-gray-900 mb-1">No leads yet</p>
				<p class="text-sm text-gray-500 mb-4">Go to <a href="/" class="text-brand-600 hover:underline font-medium">Chat</a> and tell it who you're looking for.</p>
				<a href="/" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
					</svg>
					Start a search in Chat
				</a>
			</div>
		</div>
	{/if}
</div>
