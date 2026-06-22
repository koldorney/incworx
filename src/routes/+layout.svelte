<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'Ecosystem Map' },
		{ href: '/call-list', label: 'Call List' },
		{ href: '/outbound', label: 'Outbound Center' }
	];

	const isAuth = $derived(page.url.pathname.startsWith('/auth'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isAuth}
	{@render children()}
{:else}
	<div class="app-shell">
		<nav class="top-nav">
			<div class="nav-brand">
				<span class="brand-icon">IW</span>
				<span class="brand-text">Incworx</span>
			</div>
			<div class="nav-links">
				{#each nav as item}
					<a
						href={item.href}
						class="nav-link"
						class:active={page.url.pathname === item.href}
					>{item.label}</a>
				{/each}
			</div>
			<div class="nav-right">
				<form method="POST" action="/auth/logout">
					<button type="submit" class="nav-logout">Sign out</button>
				</form>
			</div>
		</nav>
		<main class="app-main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(body) { margin: 0; padding: 0; overflow: hidden; }
	.app-shell { display: flex; flex-direction: column; height: 100vh; background: #0a0a0f; }
	.top-nav {
		display: flex;
		align-items: center;
		gap: 0;
		height: 48px;
		background: #111118;
		border-bottom: 1px solid rgba(255,255,255,0.08);
		padding: 0 16px;
		flex-shrink: 0;
		z-index: 50;
	}
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-right: 24px;
	}
	.brand-icon {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: #6366f1;
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.brand-text {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	.nav-links {
		display: flex;
		gap: 2px;
		height: 100%;
	}
	.nav-link {
		display: flex;
		align-items: center;
		padding: 0 14px;
		font-size: 13px;
		font-weight: 500;
		color: #888;
		text-decoration: none;
		border-bottom: 2px solid transparent;
		transition: color 0.15s, border-color 0.15s;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	.nav-link:hover { color: #ccc; }
	.nav-link.active {
		color: #fff;
		border-bottom-color: #6366f1;
	}
	.nav-right { margin-left: auto; }
	.nav-logout {
		background: none;
		border: 1px solid rgba(255,255,255,0.1);
		color: #888;
		padding: 5px 12px;
		border-radius: 5px;
		font-size: 12px;
		cursor: pointer;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	.nav-logout:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
	.app-main { flex: 1; overflow: hidden; }
</style>
