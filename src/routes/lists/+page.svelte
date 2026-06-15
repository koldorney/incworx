<script lang="ts">
	let { data, form: actionResult } = $props();
</script>

<div class="max-w-4xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Export Lists</h2>
		<p class="text-sm text-gray-500 mt-0.5">Your call-ready lists. Ask chat to build a new one from qualified leads.</p>
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

	<!-- Lists -->
	<div class="space-y-3">
		{#each data.lists as list}
			<div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
							<svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">{list.name}</h4>
							<div class="flex items-center gap-2 mt-0.5">
								<span class="text-xs font-medium text-gray-600">{list.list_items?.[0]?.count ?? 0} leads</span>
								{#if list.exported_at}
									<span class="text-gray-300">&middot;</span>
									<span class="text-xs text-gray-500">Exported {new Date(list.exported_at).toLocaleDateString()}</span>
								{/if}
								<span class="text-gray-300">&middot;</span>
								<span class="text-xs text-gray-400">Created {new Date(list.created_at).toLocaleDateString()}</span>
							</div>
						</div>
					</div>
					<a href="/api/lists/{list.id}/csv"
						class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
						</svg>
						Download CSV
					</a>
				</div>
			</div>
		{:else}
			<div class="bg-white border border-gray-200 rounded-xl p-16 text-center">
				<div class="flex flex-col items-center">
					<div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
						<svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
						</svg>
					</div>
					<p class="text-base font-medium text-gray-900 mb-1">No lists yet</p>
					<p class="text-sm text-gray-500 mb-4">Ask chat to "build a list from my qualified leads" and it'll appear here ready to download.</p>
					<a href="/" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
						</svg>
						Build a list in Chat
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
