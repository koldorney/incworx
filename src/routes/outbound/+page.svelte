<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { data } = $props();

	// A/B/A/B Timer State
	const A_DURATION = 25 * 60;
	const B_DURATION = 5 * 60;

	let sessionActive = $state(false);
	let currentBlock = $state<'A' | 'B'>('A');
	let blockNumber = $state(1);
	let timeRemaining = $state(A_DURATION);
	let totalSessionTime = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let sessionId = $state('');

	// Contact queue
	let queueIndex = $state(0);
	let firmFilter = $state('');
	const firms = [...new Set(data.contacts.map(c => c.firm))].sort();

	const queue = $derived.by(() => {
		let list = data.contacts.filter(c => c.priority === 'high');
		if (firmFilter) list = list.filter(c => c.firm === firmFilter);
		return list;
	});

	const currentContact = $derived(queue[queueIndex] || null);

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
		currentBlock = 'A';
		blockNumber = 1;
		timeRemaining = A_DURATION;
		totalSessionTime = 0;
		sessionStats = { dials: 0, connects: 0, voicemails: 0, noAnswers: 0, meetingsBooked: 0, emailsSent: 0 };
		startTimer();
	}

	function stopSession() {
		sessionActive = false;
		if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
	}

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			timeRemaining--;
			totalSessionTime++;
			if (timeRemaining <= 0) {
				advanceBlock();
			}
		}, 1000);
	}

	function advanceBlock() {
		if (currentBlock === 'A') {
			currentBlock = 'B';
			timeRemaining = B_DURATION;
		} else {
			currentBlock = 'A';
			blockNumber++;
			timeRemaining = A_DURATION;
		}
	}

	function skipBlock() {
		advanceBlock();
	}

	function formatTime(secs: number) {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	let dispositionNotes = $state('');

	async function logDisposition(disposition: string) {
		if (!currentContact) return;

		const entry = {
			contact_name: currentContact.name,
			firm: currentContact.firm,
			disposition,
			notes: dispositionNotes,
			block_type: currentBlock,
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
	const dialsPerHour = $derived(totalSessionTime > 60 ? Math.round(sessionStats.dials / (totalSessionTime / 3600)) : sessionStats.dials);

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});
</script>

<svelte:head>
	<title>Outbound Center | Incworx</title>
</svelte:head>

<div class="page">
	<!-- Timer Bar -->
	<div class="timer-bar" class:active={sessionActive} class:block-a={currentBlock === 'A'} class:block-b={currentBlock === 'B'}>
		{#if !sessionActive}
			<div class="timer-idle">
				<div class="method-label">Connor Murray A/B/A/B System</div>
				<div class="method-desc">25 min Activity sprints + 5 min Batch reviews. Pure volume, pure focus.</div>
				<button class="start-btn" onclick={startSession}>Start Session</button>
			</div>
		{:else}
			<div class="timer-active">
				<div class="block-indicator">
					<span class="block-letter">{currentBlock}</span>
					<span class="block-name">{currentBlock === 'A' ? 'ACTIVITY SPRINT' : 'BATCH REVIEW'}</span>
					<span class="block-num">Block {blockNumber}</span>
				</div>
				<div class="timer-clock">{formatTime(timeRemaining)}</div>
				<div class="timer-hint">{currentBlock === 'A' ? 'Dial. Pitch. Move on. No pausing.' : 'Log notes. Research next batch. Prep.'}</div>
				<div class="timer-controls">
					<button class="timer-btn" onclick={skipBlock}>Skip →</button>
					<button class="timer-btn stop" onclick={stopSession}>End Session</button>
				</div>
			</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {((currentBlock === 'A' ? A_DURATION : B_DURATION) - timeRemaining) / (currentBlock === 'A' ? A_DURATION : B_DURATION) * 100}%"></div>
			</div>
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
					<div class="stat-val">{dialsPerHour}</div>
					<div class="stat-lbl">Dials/Hr</div>
				</div>
				<div class="stat-card">
					<div class="stat-val">{sessionStats.emailsSent}</div>
					<div class="stat-lbl">Emails</div>
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

	/* Timer Bar */
	.timer-bar { background: #111118; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 32px; position: relative; }
	.timer-bar.active.block-a { background: linear-gradient(135deg, #0f1a0f, #111118); border-bottom-color: #10b981; }
	.timer-bar.active.block-b { background: linear-gradient(135deg, #1a1a0f, #111118); border-bottom-color: #f59e0b; }
	.timer-idle { text-align: center; padding: 8px 0; }
	.method-label { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; }
	.method-desc { font-size: 13px; color: #888; margin-bottom: 12px; }
	.start-btn { background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 10px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
	.start-btn:hover { opacity: 0.9; }
	.timer-active { display: flex; align-items: center; gap: 24px; }
	.block-indicator { display: flex; align-items: center; gap: 8px; }
	.block-letter { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #fff; }
	.block-a .block-letter { background: #10b981; }
	.block-b .block-letter { background: #f59e0b; }
	.block-name { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; }
	.block-num { font-size: 11px; color: #666; }
	.timer-clock { font-size: 36px; font-weight: 700; font-variant-numeric: tabular-nums; color: #fff; min-width: 100px; }
	.timer-hint { font-size: 13px; color: #888; flex: 1; }
	.timer-controls { display: flex; gap: 8px; }
	.timer-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; }
	.timer-btn:hover { background: rgba(255,255,255,0.12); }
	.timer-btn.stop { border-color: #ef4444; color: #ef4444; }
	.timer-btn.stop:hover { background: rgba(239,68,68,0.1); }
	.progress-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.05); }
	.progress-fill { height: 100%; transition: width 1s linear; }
	.block-a .progress-fill { background: #10b981; }
	.block-b .progress-fill { background: #f59e0b; }

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
