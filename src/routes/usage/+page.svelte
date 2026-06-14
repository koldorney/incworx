<script lang="ts">
	let { data } = $props();

	function formatCost(n: number) {
		return `$${n.toFixed(2)}`;
	}
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">API Usage</h2>
		<div class="flex gap-2">
			<a href="/usage?days=7" class="px-3 py-1 text-sm rounded-md {data.days === 7 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}">7d</a>
			<a href="/usage?days=30" class="px-3 py-1 text-sm rounded-md {data.days === 30 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}">30d</a>
			<a href="/usage?days=90" class="px-3 py-1 text-sm rounded-md {data.days === 90 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}">90d</a>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-3 gap-4 mb-6">
		<div class="p-4 bg-white border border-gray-200 rounded-lg">
			<p class="text-xs text-gray-500 uppercase">Total Spend</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">{formatCost(data.totalCost)}</p>
		</div>
		<div class="p-4 bg-white border border-gray-200 rounded-lg">
			<p class="text-xs text-gray-500 uppercase">API Calls</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">{data.jobCount}</p>
		</div>
		<div class="p-4 bg-white border border-gray-200 rounded-lg">
			<p class="text-xs text-gray-500 uppercase">Avg Cost/Call</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">
				{data.jobCount > 0 ? formatCost(data.totalCost / data.jobCount) : '$0.00'}
			</p>
		</div>
	</div>

	<!-- By Provider -->
	<div class="grid grid-cols-2 gap-4 mb-6">
		<div class="p-4 bg-white border border-gray-200 rounded-lg">
			<h3 class="text-sm font-semibold text-gray-900 mb-3">By Provider</h3>
			{#if Object.keys(data.byProvider).length > 0}
				<div class="space-y-2">
					{#each Object.entries(data.byProvider) as [provider, stats]}
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-700">{provider}</span>
							<span class="text-sm font-mono">
								{formatCost(stats.total)} <span class="text-gray-400">({stats.count} calls)</span>
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500">No data yet.</p>
			{/if}
		</div>

		<div class="p-4 bg-white border border-gray-200 rounded-lg">
			<h3 class="text-sm font-semibold text-gray-900 mb-3">By Operation</h3>
			{#if Object.keys(data.byOperation).length > 0}
				<div class="space-y-2">
					{#each Object.entries(data.byOperation) as [op, stats]}
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-700">{op}</span>
							<span class="text-sm font-mono">
								{formatCost(stats.total)} <span class="text-gray-400">({stats.count})</span>
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500">No data yet.</p>
			{/if}
		</div>
	</div>

	<!-- Daily Spend -->
	<div class="p-4 bg-white border border-gray-200 rounded-lg">
		<h3 class="text-sm font-semibold text-gray-900 mb-3">Daily Spend</h3>
		{#if Object.keys(data.byDay).length > 0}
			<div class="space-y-1">
				{#each Object.entries(data.byDay).sort() as [day, cost]}
					<div class="flex items-center gap-3">
						<span class="text-xs text-gray-500 w-20 font-mono">{day}</span>
						<div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
							<div class="h-full bg-blue-500 rounded"
								style="width: {Math.min(100, (cost / Math.max(...Object.values(data.byDay))) * 100)}%">
							</div>
						</div>
						<span class="text-xs font-mono w-16 text-right">{formatCost(cost)}</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-gray-500">No spend recorded in this period.</p>
		{/if}
	</div>
</div>
