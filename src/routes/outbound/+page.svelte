<script lang="ts">
	import { buildScript, buildScreen, clusterFor, OBJECTIONS, type Rep } from '$lib/data/script-engine';

	let { data } = $props();

	// Who's calling — toggled at the top of the session.
	let rep = $state<Rep>('Joseph');

	let sessionActive = $state(false);
	let sessionId = $state('');

	// Contact queue
	let queueIndex = $state(0);
	let firmFilter = $state('');
	let groupFilter = $state('');
	let hideDnc = $state(true);
	const firms = [...new Set(data.contacts.map(c => c.firm))].sort();

	const queue = $derived.by(() => {
		let list = data.contacts.filter(c => c.priority === 'high');
		if (firmFilter) list = list.filter(c => c.firm === firmFilter);
		if (groupFilter) list = list.filter(c => c.group_name === groupFilter);
		if (hideDnc) list = list.filter(c => !c.dnc);
		return list;
	});

	const currentContact = $derived(queue[queueIndex] || null);
	const currentScript = $derived(currentContact ? buildScript(currentContact, rep) : '');
	const currentScreen = $derived(currentContact ? buildScreen(rep, currentContact) : '');
	const currentCluster = $derived(currentContact ? clusterFor(currentContact) : null);

	// Session stats
	let sessionStats = $state({
		dials: 0,
		connects: 0,
		voicemails: 0,
		noAnswers: 0,
		meetingsBooked: 0,
		emailsSent: 0
	});

	// Activity feed
	let activityFeed = $state<Array<{
		id?: number;
		contact_name: string;
		firm: string;
		disposition: string;
		notes: string;
		block_type: string;
		created_at: string;
	}>>(data.recentActivity);

	function startSession() {
		sessionActive = true;
		sessionId = 'sess_' + Date.now().toString(36);
		sessionStats = { dials: 0, connects: 0, voicemails: 0, noAnswers: 0, meetingsBooked: 0, emailsSent: 0 };
	}

	function stopSession() {
		sessionActive = false;
	}

	function copyScript() {
		if (currentScript) navigator.clipboard.writeText(currentScript);
	}

	let dispositionNotes = $state('');

	async function logDisposition(disposition: string) {
		if (!currentContact) return;

		const entry = {
			contact_name: currentContact.name,
			firm: currentContact.firm,
			disposition,
			notes: dispositionNotes,
			block_type: rep,
			created_at: new Date().toISOString(),
			session_id: sessionId,
			contact_id: currentContact.id,
			duration_secs: 0
		};

		activityFeed = [entry, ...activityFeed];
		dispositionNotes = '';

		sessionStats.dials++;
		if (disposition === 'connected') sessionStats.connects++;
		else if (disposition === 'voicemail') sessionStats.voicemails++;
		else if (disposition === 'no_answer') sessionStats.noAnswers++;
		else if (disposition === 'meeting_booked') { sessionStats.meetingsBooked++; sessionStats.connects++; }
		else if (disposition === 'email_sent') sessionStats.emailsSent++;

		if (queueIndex < queue.length - 1) queueIndex++;

		fetch('/api/log-activity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(entry)
		}).catch(() => {});
	}

	function nextContact() {
		if (queueIndex < queue.length - 1) queueIndex++;
	}

	function prevContact() {
		if (queueIndex > 0) queueIndex--;
	}

	const dispositions = [
		{ key: 'connected', label: 'Connected', icon: '✓', color: '#10b981' },
		{ key: 'voicemail', label: 'Voicemail', icon: '✉', color: '#f59e0b' },
		{ key: 'no_answer', label: 'No Answer', icon: '✗', color: '#ef4444' },
		{ key: 'busy', label: 'Busy', icon: '◉', color: '#f97316' },
		{ key: 'wrong_number', label: 'Wrong #', icon: '✕', color: '#6b7280' },
		{ key: 'callback', label: 'Callback', icon: '↩', color: '#8b5cf6' },
		{ key: 'email_sent', label: 'Email Sent', icon: '→', color: '#3b82f6' },
		{ key: 'meeting_booked', label: 'Meeting!', icon: '★', color: '#00d4aa' }
	];

	const connectRate = $derived(sessionStats.dials > 0 ? Math.round((sessionStats.connects / sessionStats.dials) * 100) : 0);
</script>

<svelte:head>
	<title>Outbound Center | Incworx</title>
</svelte:head>

<div class="page">
	<!-- Session Bar -->
	<div class="session-bar">
		<div class="rep-toggle">
			<span class="rep-label">Calling as</span>
			<button class:active={rep === 'Joseph'} onclick={() => (rep = 'Joseph')}>Joseph</button>
			<button class:active={rep === 'Ryan'} onclick={() => (rep = 'Ryan')}>Ryan</button>
		</div>
		{#if !sessionActive}
			<button class="start-btn" onclick={startSession}>Start Session</button>
		{:else}
			<span class="session-live">Session live</span>
			<button class="end-btn" onclick={stopSession}>End Session</button>
		{/if}
	</div>

	<div class="main-grid">
		<!-- Left: Contact Card + Queue -->
		<div class="left-col">
			<div class="queue-header">
				<h2>Call Queue</h2>
				<select bind:value={firmFilter}>
					<option value="">All Firms</option>
					{#each firms as f}
						<option value={f}>{f}</option>
					{/each}
				</select>
				<select bind:value={groupFilter}>
					<option value="">A + B</option>
					<option value="A">Group A</option>
					<option value="B">Group B</option>
				</select>
				<label class="dnc-toggle"><input type="checkbox" bind:checked={hideDnc} /> Hide DNC</label>
				<span class="queue-pos">{queueIndex + 1} / {queue.length}</span>
			</div>

			{#if currentContact}
				<div class="contact-card">
					<div class="cc-priority priority-{currentContact.priority}">{currentContact.priority}</div>
					<div class="cc-name">{currentContact.name}</div>
					<div class="cc-position">{currentContact.position}</div>
					<div class="cc-firm">{currentContact.firm}</div>
					<div class="cc-details">
						<div class="cc-row">
							<span class="cc-label">Email</span>
							<a href="mailto:{currentContact.email}" class="cc-email">{currentContact.email}</a>
						</div>
						{#if currentContact.phone}
							<div class="cc-row">
								<span class="cc-label">Phone</span>
								<a href="tel:{currentContact.phone}" class="cc-phone">{currentContact.phone}</a>
							</div>
						{/if}
						{#if currentContact.linkedin}
							<div class="cc-row">
								<span class="cc-label">LinkedIn</span>
								<a href={currentContact.linkedin} target="_blank" rel="noopener" class="cc-linkedin">Open Profile</a>
							</div>
						{/if}
						<div class="cc-row">
							<span class="cc-label">Confidence</span>
							<span class="cc-conf">{currentContact.confidence}%</span>
						</div>
						<div class="cc-row">
							<span class="cc-label">Group / TZ</span>
							<span class="cc-meta">{currentContact.group_name || '—'} · {currentContact.timezone || '—'}{#if currentContact.dnc} · <span class="cc-dnc">DNC</span>{/if}</span>
						</div>
					</div>

					<!-- Dynamic Script (P6) -->
					<div class="script-panel">
						<div class="script-head">
							<span class="script-title">Script</span>
							{#if currentCluster}<span class="cluster-tag">{currentCluster.label}</span>{/if}
							<button class="copy-script" onclick={copyScript}>Copy</button>
						</div>
						<p class="script-body">{currentScript}</p>
					</div>

					<!-- Gatekeeper Screening Line (P7) -->
					<div class="screen-panel">
						<span class="screen-label">If a gatekeeper picks up</span>
						<p class="screen-body">{currentScreen}</p>
					</div>

					<div class="disposition-grid">
						{#each dispositions as d}
							<button
								class="disp-btn"
								style="--btn-color: {d.color}"
								onclick={() => logDisposition(d.key)}
								disabled={!sessionActive}
							>
								<span class="disp-icon">{d.icon}</span>
								<span class="disp-label">{d.label}</span>
							</button>
						{/each}
					</div>

					<textarea
						class="notes-input"
						placeholder="Quick notes..."
						bind:value={dispositionNotes}
						rows="2"
					></textarea>

					<div class="nav-btns">
						<button onclick={prevContact} disabled={queueIndex === 0}>← Prev</button>
						<button onclick={nextContact} disabled={queueIndex >= queue.length - 1}>Next →</button>
					</div>
				</div>
			{:else}
				<div class="empty-queue">No contacts in queue. Adjust your filter.</div>
			{/if}
		</div>

		<!-- Right: Stats + Feed -->
		<div class="right-col">
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-val">{sessionStats.dials}</div>
					<div class="stat-lbl">Dials</div>
				</div>
				<div class="stat-card accent">
					<div class="stat-val">{sessionStats.connects}</div>
					<div class="stat-lbl">Connects</div>
				</div>
				<div class="stat-card gold">
					<div class="stat-val">{sessionStats.meetingsBooked}</div>
					<div class="stat-lbl">Meetings</div>
				</div>
				<div class="stat-card">
					<div class="stat-val">{connectRate}%</div>
					<div class="stat-lbl">Connect Rate</div>
				</div>
				<div class="stat-card">
					<div class="stat-val">{sessionStats.voicemails}</div>
					<div class="stat-lbl">Voicemails</div>
				</div>
				<div class="stat-card">
					<div class="stat-val">{sessionStats.emailsSent}</div>
					<div class="stat-lbl">Emails</div>
				</div>
			</div>

			<div class="objection-bank">
				<h3>Objection Bank</h3>
				<div class="obj-list">
					{#each OBJECTIONS as o}
						<details class="obj">
							<summary>{o.trigger}</summary>
							<p>{rep && o.response.includes('this is with IncWorx') ? o.response.replace('this is with IncWorx', `this is ${rep} with IncWorx`) : o.response}</p>
						</details>
					{/each}
				</div>
			</div>

			<div class="feed-header">
				<h3>Activity Feed</h3>
				{#if sessionActive}
					<span class="live-dot">LIVE</span>
				{/if}
			</div>
			<div class="feed">
				{#each activityFeed as entry}
					<div class="feed-item">
						<div class="feed-disp" style="color: {dispositions.find(d => d.key === entry.disposition)?.color || '#888'}">
							{dispositions.find(d => d.key === entry.disposition)?.icon || '?'}
						</div>
						<div class="feed-content">
							<div class="feed-name">{entry.contact_name} <span class="feed-firm">@ {entry.firm}</span></div>
							<div class="feed-meta">
								{dispositions.find(d => d.key === entry.disposition)?.label || entry.disposition}
								{#if entry.notes} — {entry.notes}{/if}
							</div>
						</div>
						<div class="feed-time">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
					</div>
				{:else}
					<div class="feed-empty">No activity yet. Start a session and start dialing.</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; overflow: hidden; }

	/* Session Bar */
	.session-bar { background: #111118; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 12px 32px; display: flex; align-items: center; gap: 20px; }
	.rep-toggle { display: flex; align-items: center; gap: 8px; }
	.rep-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
	.rep-toggle button { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #aaa; padding: 6px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
	.rep-toggle button.active { background: linear-gradient(135deg, #6366f1, #4f46e5); border-color: transparent; color: #fff; }
	.start-btn { margin-left: auto; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 9px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
	.start-btn:hover { opacity: 0.9; }
	.session-live { margin-left: auto; font-size: 12px; font-weight: 700; color: #10b981; padding: 4px 12px; border: 1px solid #10b981; border-radius: 10px; }
	.end-btn { background: rgba(239,68,68,0.1); border: 1px solid #ef4444; color: #ef4444; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
	.end-btn:hover { background: rgba(239,68,68,0.2); }
	.dnc-toggle { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #aaa; cursor: pointer; }
	.dnc-toggle input { accent-color: #10b981; }

	/* Script + Screening Panels */
	.cc-meta { color: #b088f9; font-weight: 600; }
	.cc-dnc { color: #ff6b6b; font-weight: 700; }
	.script-panel { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; }
	.script-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
	.script-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a5b4fc; }
	.cluster-tag { font-size: 10px; font-weight: 600; background: rgba(99,102,241,0.2); color: #c7d2fe; padding: 2px 8px; border-radius: 8px; }
	.copy-script { margin-left: auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 3px 10px; border-radius: 5px; font-size: 11px; cursor: pointer; }
	.copy-script:hover { background: rgba(255,255,255,0.12); }
	.script-body { font-size: 14px; line-height: 1.55; color: #e8e8f0; margin: 0; }
	.screen-panel { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
	.screen-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; }
	.screen-body { font-size: 13px; line-height: 1.5; color: #fde68a; margin: 4px 0 0; }

	/* Objection Bank */
	.objection-bank { margin-bottom: 16px; }
	.objection-bank h3 { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 8px; }
	.obj-list { display: flex; flex-direction: column; gap: 4px; }
	.obj { background: #111118; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 8px 12px; }
	.obj summary { font-size: 13px; font-weight: 600; color: #ddd; cursor: pointer; list-style: none; }
	.obj summary::-webkit-details-marker { display: none; }
	.obj summary::before { content: '› '; color: #6366f1; }
	.obj[open] summary::before { content: '⌄ '; }
	.obj p { font-size: 13px; line-height: 1.5; color: #aaa; margin: 8px 0 0; }

	/* Main Grid */
	.main-grid { display: grid; grid-template-columns: 420px 1fr; flex: 1; overflow: hidden; }
	.left-col { border-right: 1px solid rgba(255,255,255,0.08); overflow-y: auto; padding: 16px; }
	.right-col { overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }

	/* Queue */
	.queue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
	.queue-header h2 { font-size: 14px; font-weight: 600; color: #fff; margin: 0; }
	.queue-header select { background: #1a1a2e; border: 1px solid #333; color: #e0e0e0; padding: 5px 8px; border-radius: 5px; font-size: 12px; }
	.queue-pos { font-size: 12px; color: #666; margin-left: auto; }

	/* Contact Card */
	.contact-card { background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }
	.cc-priority { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
	.cc-priority.priority-high { color: #10b981; }
	.cc-priority.priority-medium { color: #f59e0b; }
	.cc-priority.priority-low { color: #6b7280; }
	.cc-name { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 2px; }
	.cc-position { font-size: 14px; color: #aaa; margin-bottom: 2px; }
	.cc-firm { font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 16px; }
	.cc-details { margin-bottom: 16px; }
	.cc-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
	.cc-label { color: #666; width: 80px; flex-shrink: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
	.cc-email { color: #4da6ff; text-decoration: none; }
	.cc-email:hover { text-decoration: underline; }
	.cc-phone { color: #10b981; text-decoration: none; font-weight: 600; }
	.cc-linkedin { color: #0077b5; text-decoration: none; }
	.cc-conf { color: #f59e0b; font-weight: 600; }

	/* Disposition Grid */
	.disposition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
	.disp-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 4px; cursor: pointer; text-align: center; transition: all 0.15s; color: var(--btn-color); }
	.disp-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: var(--btn-color); }
	.disp-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.disp-icon { display: block; font-size: 16px; margin-bottom: 2px; }
	.disp-label { font-size: 10px; font-weight: 600; }
	.notes-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 10px; color: #e0e0e0; font-size: 12px; resize: none; box-sizing: border-box; margin-bottom: 12px; font-family: inherit; }
	.notes-input:focus { outline: none; border-color: rgba(99,102,241,0.5); }
	.nav-btns { display: flex; gap: 8px; }
	.nav-btns button { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #ccc; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; }
	.nav-btns button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
	.nav-btns button:disabled { opacity: 0.3; cursor: not-allowed; }
	.empty-queue { text-align: center; padding: 40px; color: #666; }

	/* Stats Grid */
	.stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px; }
	.stat-card { background: #111118; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; text-align: center; }
	.stat-val { font-size: 24px; font-weight: 700; color: #fff; }
	.stat-card.accent .stat-val { color: #10b981; }
	.stat-card.gold .stat-val { color: #f59e0b; }
	.stat-lbl { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

	/* Feed */
	.feed-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
	.feed-header h3 { font-size: 14px; font-weight: 600; color: #fff; margin: 0; }
	.live-dot { font-size: 10px; font-weight: 700; color: #10b981; padding: 2px 8px; border: 1px solid #10b981; border-radius: 10px; animation: pulse 2s infinite; }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
	.feed { flex: 1; overflow-y: auto; }
	.feed-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); }
	.feed-item:hover { background: rgba(255,255,255,0.02); }
	.feed-disp { font-size: 16px; width: 24px; text-align: center; flex-shrink: 0; padding-top: 2px; }
	.feed-content { flex: 1; min-width: 0; }
	.feed-name { font-size: 13px; font-weight: 600; color: #fff; }
	.feed-firm { color: #666; font-weight: 400; }
	.feed-meta { font-size: 12px; color: #888; margin-top: 2px; }
	.feed-time { font-size: 11px; color: #555; flex-shrink: 0; }
	.feed-empty { text-align: center; padding: 40px; color: #555; font-size: 13px; }
</style>
