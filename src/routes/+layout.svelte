<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { children, data } = $props();

	const nav = [
		{ href: '/profile', label: 'ICP Profile', id: 'profile' },
		{ href: '/leads', label: 'Leads', id: 'leads' },
		{ href: '/lists', label: 'Lists', id: 'lists' },
		{ href: '/suppression', label: 'Suppression', id: 'suppression' },
		{ href: '/usage', label: 'Usage', id: 'usage' }
	];

	const isAuthPage = $derived($page.url.pathname.startsWith('/auth'));
	const isActive = (href: string) => $page.url.pathname === href || ($page.url.pathname === '/' && href === '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isAuthPage}
	{@render children()}
{:else}
	<div class="flex h-screen bg-gray-50">
		<aside class="w-60 bg-brand-950 text-gray-100 flex flex-col">
			<a href="/" class="px-5 py-5 border-b border-white/10 flex items-center gap-3 hover:bg-white/5 transition-colors">
				<div class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
					<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<h1 class="text-sm font-semibold tracking-tight text-white">Incworx</h1>
					<p class="text-[10px] text-brand-200 font-medium tracking-wider uppercase">GTM Center</p>
				</div>
			</a>

			<nav class="flex-1 px-3 py-4 space-y-0.5">
				{#each nav as item}
					{@const active = isActive(item.href)}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
							{active ? 'bg-brand-600/30 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}"
					>
						{#if item.id === 'profile'}
							<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
							</svg>
						{:else if item.id === 'leads'}
							<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
							</svg>
						{:else if item.id === 'lists'}
							<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
							</svg>
						{:else if item.id === 'suppression'}
							<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
							</svg>
						{:else if item.id === 'usage'}
							<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
							</svg>
						{/if}
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="px-4 py-4 border-t border-white/10">
				{#if data.user}
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 bg-brand-600/40 rounded-full flex items-center justify-center text-xs font-medium text-brand-200">
							{data.user.email?.charAt(0).toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-xs text-gray-300 truncate">{data.user.email}</p>
							<form method="POST" action="/auth/logout" use:enhance>
								<button type="submit" class="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
									Sign out
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</aside>

		<main class="flex-1 overflow-y-auto">
			<div class="p-8">
				{@render children()}
			</div>
		</main>
	</div>
{/if}
