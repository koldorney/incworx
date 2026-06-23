<script lang="ts">
	import {
		CLUSTERS,
		DEFAULT_CLUSTER,
		clusterFor,
		callGroupFor,
		buildEmail,
		type Rep,
		type Cluster
	} from '$lib/data/script-engine';

	let { data } = $props();

	let rep = $state<Rep>('Joseph');
	let flip = $state(false);

	const callGroup = $derived(callGroupFor(new Date(), flip));
	const emailGroup = $derived(callGroup === 'A' ? 'B' : 'A');
	const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

	const callList = $derived(data.contacts.filter((c) => c.group_name === callGroup && !c.dnc));
	const callDnc = $derived(data.contacts.filter((c) => c.group_name === callGroup && c.dnc));

	const allClusters: Cluster[] = [...CLUSTERS, DEFAULT_CLUSTER];

	const emailBatches = $derived.by(() => {
		const recips = data.contacts.filter((c) => c.group_name === emailGroup);
		return allClusters
			.map((cl) => {
				const members = recips.filter((c) => clusterFor(c).key === cl.key);
				const sample = members[0] ? buildEmail(members[0], rep) : null;
				return { cluster: cl, members, sample };
			})
			.filter((b) => b.members.length > 0)
			.sort((a, b) => b.members.length - a.members.length);
	});

	function copy(text: string) {
		navigator.clipboard.writeText(text);
	}

	function copyAddresses(members: typeof data.contacts) {
		copy(members.map((c) => c.email).filter(Boolean).join(', '));
	}
</script>

<svelte:head>
	<title>Daily Rotation | Incworx</title>
</svelte:head>

<div class="page">
	<div class="topbar">
		<div class="rep-toggle">
			<span class="rep-label">Sending as</span>
			<button class:active={rep === 'Joseph'} onclick={() => (rep = 'Joseph')}>Joseph</button>
			<button class:active={rep === 'Ryan'} onclick={() => (rep = 'Ryan')}>Ryan</button>
		</div>
		<div class="today">{today}</div>
		<button class="flip-btn" onclick={() => (flip = !flip)}>⇄ Flip groups</button>
	</div>

	<div class="assign">
		<div class="assign-card call">
			<div class="assign-tag">Today — Call</div>
			<div class="assign-grp">Group {callGroup}</div>
			<div class="assign-sub">{callList.length} callable · {callDnc.length} DNC excluded</div>
			<a class="assign-link" href="/outbound">Open call queue →</a>
		</div>
		<div class="assign-card email">
			<div class="assign-tag">Today — Email</div>
			<div class="assign-grp">Group {emailGroup}</div>
			<div class="assign-sub">{emailBatches.reduce((n, b) => n + b.members.length, 0)} recipients · {emailBatches.length} batches</div>
			<div class="assign-note">Tomorrow these swap.</div>
		</div>
	</div>

	<h2 class="section-title">Email batches — Group {emailGroup}</h2>
	<div class="batches">
		{#each emailBatches as b}
			<div class="batch">
				<div class="batch-head">
					<span class="batch-cluster">{b.cluster.label}</span>
					<span class="batch-count">{b.members.length} recipient{b.members.length === 1 ? '' : 's'}</span>
					<button class="mini-btn" onclick={() => copyAddresses(b.members)}>Copy {b.members.length} emails</button>
				</div>
				{#if b.sample}
					{@const s = b.sample}
					<div class="email-preview">
						<div class="email-row">
							<span class="email-k">Subject</span>
							<span class="email-v">{s.subject}</span>
							<button class="mini-btn" onclick={() => copy(s.subject)}>Copy</button>
						</div>
						<div class="email-body">{s.body}</div>
						<button class="mini-btn body-copy" onclick={() => copy(s.body)}>Copy body (sample)</button>
						<p class="merge-note">Personalized per recipient — first name + firm swap automatically when you copy each.</p>
					</div>
				{/if}
				<div class="recip-list">
					{#each b.members as m}
						<div class="recip">
							<span class="recip-name">{m.name}</span>
							<span class="recip-firm">{m.firm}</span>
							<a class="recip-email" href="mailto:{m.email}?subject={encodeURIComponent(buildEmail(m, rep).subject)}&body={encodeURIComponent(buildEmail(m, rep).body)}">Compose →</a>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.page { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; min-height: 100%; padding: 0 0 40px; }
	.topbar { display: flex; align-items: center; gap: 20px; padding: 14px 32px; background: #111118; border-bottom: 1px solid rgba(255,255,255,0.08); }
	.rep-toggle { display: flex; align-items: center; gap: 8px; }
	.rep-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
	.rep-toggle button { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #aaa; padding: 6px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
	.rep-toggle button.active { background: linear-gradient(135deg, #6366f1, #4f46e5); border-color: transparent; color: #fff; }
	.today { margin-left: auto; font-size: 13px; color: #aaa; }
	.flip-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
	.flip-btn:hover { background: rgba(255,255,255,0.12); }

	.assign { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px 32px; }
	.assign-card { border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(255,255,255,0.08); }
	.assign-card.call { background: linear-gradient(135deg, rgba(16,185,129,0.12), #111118); border-color: rgba(16,185,129,0.4); }
	.assign-card.email { background: linear-gradient(135deg, rgba(245,158,11,0.1), #111118); border-color: rgba(245,158,11,0.4); }
	.assign-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #888; }
	.assign-grp { font-size: 32px; font-weight: 800; color: #fff; margin: 4px 0; }
	.assign-sub { font-size: 13px; color: #aaa; }
	.assign-link { display: inline-block; margin-top: 12px; color: #10b981; text-decoration: none; font-weight: 600; font-size: 14px; }
	.assign-link:hover { text-decoration: underline; }
	.assign-note { margin-top: 12px; font-size: 12px; color: #666; }

	.section-title { font-size: 16px; color: #fff; margin: 8px 32px 12px; }
	.batches { display: flex; flex-direction: column; gap: 14px; padding: 0 32px; }
	.batch { background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
	.batch-head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
	.batch-cluster { font-size: 14px; font-weight: 700; color: #c7d2fe; }
	.batch-count { font-size: 12px; color: #888; }
	.mini-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.mini-btn:hover { background: rgba(255,255,255,0.12); }
	.batch-head .mini-btn { margin-left: auto; }
	.email-preview { padding: 14px 16px; background: rgba(99,102,241,0.05); }
	.email-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
	.email-k { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; width: 60px; }
	.email-v { font-size: 13px; font-weight: 600; color: #e8e8f0; flex: 1; }
	.email-body { font-size: 13px; line-height: 1.6; color: #ccc; white-space: pre-wrap; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px 14px; }
	.body-copy { margin-top: 8px; }
	.merge-note { font-size: 11px; color: #666; margin: 8px 0 0; }
	.recip-list { padding: 8px 16px 14px; }
	.recip { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
	.recip-name { font-weight: 600; color: #fff; min-width: 180px; }
	.recip-firm { color: #888; flex: 1; }
	.recip-email { color: #4da6ff; text-decoration: none; font-size: 12px; }
	.recip-email:hover { text-decoration: underline; }
</style>
