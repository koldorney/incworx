<script lang="ts">
	let { data } = $props();

	function formatCost(n: number) {
		return `$${n.toFixed(2)}`;
	}

	const periods = [
		{ days: 7, label: '7d' },
		{ days: 30, label: '30d' },
		{ days: 90, label: '90d' }
	];
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">API Usage</h2>
			<p class="text-sm text-gray-500 mt-0.5">Track enrichment costs across providers and operations.</p>
		</div>
		<div class="flex gap-1.5 bg-gray-100 rounded-lg p-1">
			{#each periods as p}
				<a href="/usage?days={p.days}"
					class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors
						{data.days === p.days ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">
					{p.label}
				</a>
			{/each}
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-3 gap-4 mb-6">
		<div class="bg-white border border-gray-200 rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
					<svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</p>
			</div>
			<p class="text-3xl font-bold text-gray-900">{formatCost(data.totalCost)}</p>
		</div>
		<div class="bg-white border border-gray-200 rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
					</svg>
				</div>
				<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">API Calls</p>
			</div>
			<p class="text-3xl font-bold text-gray-900">{data.jobCount}</p>
		</div>
		<div class="bg-white border border-gray-200 rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
					</svg>
				</div>
				<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost/Call</p>
			</div>
			<p class="text-3xl font-bold text-gray-900">
				{data.jobCount > 0 ? formatCost(data.totalCost / data.jobCount) : '$0.00'}
			</p>
		</div>
	</div>

	<!-- By Provider / By Operation -->
	<div class="grid grid-cols-2 gap-4 mb-6">
		<div class="bg-white border border-gray-200 rounded-xl p-5">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
				</svg>
				By Provider
			</h3>
			{#if Object.keys(data.byProvider).length > 0}
				<div class="space-y-3">
					{#each Object.entries(data.byProvider) as [provider, stats]}
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-700 font-medium capitalize">{provider}</span>
							<div class="text-right">
								<span class="text-sm font-semibold text-gray-900">{formatCost(stats.total)}</span>
								<span class="text-xs text-gray-400 ml-1">({stats.count})</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-400">No data yet.</p>
			{/if}
		</div>

		<div class="bg-white border border-gray-200 rounded-xl p-5">
			<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.384 3.164 1.029-5.994L2.1 7.57l6.02-.875L11.42 1.5l2.69 5.195 6.02.875-4.965 4.77 1.029 5.994L11.42 15.17z" />
				</svg>
				By Operation
			</h3>
			{#if Object.keys(data.byOperation).length > 0}
				<div class="space-y-3">
					{#each Object.entries(data.byOperation) as [op, stats]}
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-700 font-medium">{op.replace(/_/g, ' ')}</span>
							<div class="text-right">
								<span class="text-sm font-semibold text-gray-900">{formatCost(stats.total)}</span>
								<span class="text-xs text-gray-400 ml-1">({stats.count})</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-400">No data yet.</p>
			{/if}
		</div>
	</div>

	<!-- Daily Spend -->
	<div class="bg-white border border-gray-200 rounded-xl p-5">
		<h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
			<svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
			</svg>
			Daily Spend
		</h3>
		{#if Object.keys(data.byDay).length > 0}
			<div class="space-y-2">
				{#each Object.entries(data.byDay).sort() as [day, cost]}
					<div class="flex items-center gap-3">
						<span class="text-xs text-gray-500 w-20 font-mono shrink-0">{day}</span>
						<div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
								style="width: {Math.min(100, (cost / Math.max(...Object.values(data.byDay))) * 100)}%">
							</div>
						</div>
						<span class="text-xs font-mono font-medium w-16 text-right text-gray-700">{formatCost(cost)}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center">
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
						<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900 mb-1">No spend recorded</p>
					<p class="text-xs text-gray-500">API usage will appear here once you start enriching leads.</p>
				</div>
			</div>
		{/if}
	</div>
</div>
