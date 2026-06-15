<script lang="ts">
	import { tick } from 'svelte';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	let messages = $state<Message[]>([]);
	let input = $state('');
	let loading = $state(false);
	let chatContainer: HTMLElement | undefined = $state();

	const suggestions = [
		'Find IT decision makers at acme.com',
		'Set up my ICP — I sell managed IT services to mid-market companies',
		'Show me all my leads',
		'Qualify my pending leads and build an export list'
	];

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	async function send(text?: string) {
		const msg = (text || input).trim();
		if (!msg || loading) return;
		input = '';

		messages = [...messages, { role: 'user', content: msg }];
		loading = true;
		await scrollToBottom();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: messages.map(m => ({ role: m.role, content: m.content }))
				})
			});

			const data = await res.json();

			if (data.error) {
				messages = [...messages, { role: 'assistant', content: `Something went wrong: ${data.error}` }];
			} else {
				messages = [...messages, { role: 'assistant', content: data.message }];
			}
		} catch {
			messages = [...messages, { role: 'assistant', content: 'Failed to connect. Check that your API keys are configured.' }];
		}

		loading = false;
		await scrollToBottom();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function renderMarkdown(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-xs">$1</code>')
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 hover:text-brand-700 underline underline-offset-2">$1</a>')
			.replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-gray-900 mt-3 mb-1">$1</h3>')
			.replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-gray-900 mt-4 mb-1">$1</h2>')
			.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
			.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
			.replace(/\n{2,}/g, '</p><p class="mt-2">')
			.replace(/\n/g, '<br>')
			.replace(/^/, '<p>')
			.replace(/$/, '</p>');
	}
</script>

<div class="flex flex-col h-[calc(100vh-4rem)] -m-8">
	<!-- Chat Messages -->
	<div class="flex-1 overflow-y-auto" bind:this={chatContainer}>
		{#if messages.length === 0}
			<!-- Empty State -->
			<div class="flex flex-col items-center justify-center h-full px-8">
				<div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
					<svg class="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 mb-1">What are we building today?</h2>
				<p class="text-sm text-gray-500 mb-8 text-center max-w-md">
					Tell me who you're targeting and I'll source, enrich, qualify, and build your call list.
				</p>
				<div class="grid grid-cols-2 gap-2 w-full max-w-lg">
					{#each suggestions as suggestion}
						<button
							onclick={() => send(suggestion)}
							class="text-left px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer"
						>
							{suggestion}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="max-w-3xl mx-auto px-6 py-6 space-y-5">
				{#each messages as msg}
					{#if msg.role === 'user'}
						<div class="flex justify-end">
							<div class="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-lg text-sm whitespace-pre-wrap">
								{msg.content}
							</div>
						</div>
					{:else}
						<div class="flex gap-3">
							<div class="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
								<svg class="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<div class="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-800 leading-relaxed prose-links">
								{@html renderMarkdown(msg.content)}
							</div>
						</div>
					{/if}
				{/each}

				{#if loading}
					<div class="flex gap-3">
						<div class="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
							<svg class="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<div class="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3">
							<div class="flex gap-1.5 items-center">
								<div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
								<div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
								<div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
								<span class="text-xs text-gray-400 ml-2">Working on it...</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="border-t border-gray-200 bg-white px-6 py-4">
		<div class="max-w-3xl mx-auto">
			<div class="flex gap-3 items-end">
				<div class="flex-1 relative">
					<textarea
						bind:value={input}
						onkeydown={handleKeydown}
						disabled={loading}
						rows="1"
						class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition-shadow disabled:opacity-50"
						placeholder="Tell me what you need — e.g. 'Find CTOs at fintech companies in NYC'"
					></textarea>
				</div>
				<button
					onclick={() => send()}
					disabled={loading || !input.trim()}
					class="px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
					</svg>
				</button>
			</div>
			<p class="text-[11px] text-gray-400 mt-2 text-center">
				AI-powered by Claude. Data views: <a href="/leads" class="text-brand-500 hover:underline">Leads</a> &middot; <a href="/lists" class="text-brand-500 hover:underline">Lists</a> &middot; <a href="/profile" class="text-brand-500 hover:underline">ICP</a> &middot; <a href="/usage" class="text-brand-500 hover:underline">Usage</a>
			</p>
		</div>
	</div>
</div>
