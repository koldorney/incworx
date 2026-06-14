<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const nav = [
		{ href: '/profile', label: 'Profile', icon: '◎' },
		{ href: '/leads', label: 'Leads', icon: '◉' },
		{ href: '/lists', label: 'Lists', icon: '☰' },
		{ href: '/suppression', label: 'Suppression', icon: '⊘' },
		{ href: '/usage', label: 'Usage', icon: '$' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen bg-gray-50">
	<aside class="w-56 bg-gray-900 text-gray-100 flex flex-col">
		<div class="px-4 py-5 border-b border-gray-700">
			<h1 class="text-lg font-semibold tracking-tight">KoldOps Engine</h1>
		</div>
		<nav class="flex-1 px-2 py-4 space-y-1">
			{#each nav as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
				>
					<span class="text-base">{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
			v1 &middot; KoldOps LLC
		</div>
	</aside>
	<main class="flex-1 overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
