<script lang="ts">
	let { data } = $props();

	let search = $state('');
	let firmFilter = $state('');
	let deptFilter = $state('');
	let priorityFilter = $state('');
	let tzFilter = $state('');
	let groupFilter = $state('');
	let hideDnc = $state(false);
	let sortCol = $state('timezone');
	let sortDir = $state<'asc' | 'desc'>('asc');

	const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
	// East -> West ordering for timezone sort
	const tzOrder: Record<string, number> = { ET: 0, CT: 1, MT: 2, PT: 3 };
	const firms = $derived([...new Set(data.contacts.map(c => c.firm))].sort());

	const filtered = $derived.by(() => {
		let list = data.contacts.filter(c => {
			if (firmFilter && c.firm !== firmFilter) return false;
			if (deptFilter && c.dept !== deptFilter) return false;
			if (priorityFilter && c.priority !== priorityFilter) return false;
			if (tzFilter && c.timezone !== tzFilter) return false;
			if (groupFilter && c.group_name !== groupFilter) return false;
			if (hideDnc && c.dnc) return false;
			if (search) {
				const s = `${c.name} ${c.firm} ${c.position} ${c.email} ${c.dept}`.toLowerCase();
				if (!s.includes(search.toLowerCase())) return false;
			}
			return true;
		});
		list.sort((a, b) => {
			let va: any, vb: any;
			if (sortCol === 'priority') { va = priorityOrder[a.priority]; vb = priorityOrder[b.priority]; }
			else if (sortCol === 'confidence') { va = a.confidence; vb = b.confidence; }
			else if (sortCol === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
			else if (sortCol === 'firm') { va = a.firm.toLowerCase(); vb = b.firm.toLowerCase(); }
			else if (sortCol === 'position') { va = a.position.toLowerCase(); vb = b.position.toLowerCase(); }
			else if (sortCol === 'dept') { va = a.dept; vb = b.dept; }
			else if (sortCol === 'timezone') { va = tzOrder[a.timezone] ?? 9; vb = tzOrder[b.timezone] ?? 9; }
			else if (sortCol === 'group_name') { va = a.group_name ?? ''; vb = b.group_name ?? ''; }
			else { va = a.name; vb = b.name; }
			if (va < vb) return sortDir === 'asc' ? -1 : 1;
			if (va > vb) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
		return list;
	});

	function toggleSort(col: string) {
		if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else { sortCol = col; sortDir = 'asc'; }
	}

	function deptClass(dept: string) {
		if (['it', 'executive', 'operations', 'finance', 'management'].includes(dept)) return 'dept-' + dept;
		return 'dept-other';
	}

	function confClass(conf: number) {
		if (conf >= 95) return 'conf-high';
		if (conf >= 85) return 'conf-med';
		return 'conf-low';
	}

	function copyEmail(email: string) {
		navigator.clipboard.writeText(email);
	}

	function copyAllEmails() {
		const emails = filtered.map(c => c.email).join('\n');
		navigator.clipboard.writeText(emails);
	}

	function exportCSV() {
		const header = 'Name,First,Last,Firm,Position,Department,Group,Timezone,DNC,Email,Phone,LinkedIn,Confidence,Priority';
		const rows = filtered.map(c =>
			[c.name, c.first_name, c.last_name, c.firm, `"${c.position}"`, c.dept, c.group_name, c.timezone, c.dnc ? 'yes' : 'no', c.email, c.phone, c.linkedin, c.confidence, c.priority].join(',')
		);
		const csv = header + '\n' + rows.join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'incworx-pe-call-list.csv';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Call List | Incworx</title>
</svelte:head>

<div class="page">
	<div class="header">
		<h1>PE Ecosystem — Cold Call List</h1>
		<p>{data.contacts.length} senior contacts across {firms.length} PE firms</p>
	</div>
	<div class="controls">
		<input type="text" placeholder="Search name, firm, position, email..." bind:value={search} />
		<select bind:value={firmFilter}>
			<option value="">All Firms</option>
			{#each firms as f}
				<option value={f}>{f}</option>
			{/each}
		</select>
		<select bind:value={deptFilter}>
			<option value="">All Departments</option>
			<option value="it">IT / Technology</option>
			<option value="executive">Executive</option>
			<option value="operations">Operations</option>
			<option value="finance">Finance</option>
			<option value="management">Management</option>
		</select>
		<select bind:value={priorityFilter}>
			<option value="">All Priorities</option>
			<option value="high">High Priority</option>
			<option value="medium">Medium Priority</option>
			<option value="low">Lower Priority</option>
		</select>
		<select bind:value={tzFilter}>
			<option value="">All Time Zones</option>
			<option value="ET">Eastern (ET)</option>
			<option value="CT">Central (CT)</option>
			<option value="MT">Mountain (MT)</option>
			<option value="PT">Pacific (PT)</option>
		</select>
		<select bind:value={groupFilter}>
			<option value="">All Groups</option>
			<option value="A">Group A</option>
			<option value="B">Group B</option>
		</select>
		<label class="dnc-toggle"><input type="checkbox" bind:checked={hideDnc} /> Hide DNC</label>
		<div class="stats">Showing <b>{filtered.length}</b> of <b>{data.contacts.length}</b> contacts</div>
	</div>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th class:sorted-asc={sortCol === 'priority' && sortDir === 'asc'} class:sorted-desc={sortCol === 'priority' && sortDir === 'desc'} onclick={() => toggleSort('priority')}>#</th>
					<th class:sorted-asc={sortCol === 'name' && sortDir === 'asc'} class:sorted-desc={sortCol === 'name' && sortDir === 'desc'} onclick={() => toggleSort('name')}>Name</th>
					<th class:sorted-asc={sortCol === 'firm' && sortDir === 'asc'} class:sorted-desc={sortCol === 'firm' && sortDir === 'desc'} onclick={() => toggleSort('firm')}>Firm</th>
					<th class:sorted-asc={sortCol === 'position' && sortDir === 'asc'} class:sorted-desc={sortCol === 'position' && sortDir === 'desc'} onclick={() => toggleSort('position')}>Position</th>
					<th class:sorted-asc={sortCol === 'dept' && sortDir === 'asc'} class:sorted-desc={sortCol === 'dept' && sortDir === 'desc'} onclick={() => toggleSort('dept')}>Dept</th>
					<th class:sorted-asc={sortCol === 'group_name' && sortDir === 'asc'} class:sorted-desc={sortCol === 'group_name' && sortDir === 'desc'} onclick={() => toggleSort('group_name')}>Grp</th>
					<th class:sorted-asc={sortCol === 'timezone' && sortDir === 'asc'} class:sorted-desc={sortCol === 'timezone' && sortDir === 'desc'} onclick={() => toggleSort('timezone')}>TZ</th>
					<th>Email</th>
					<th>Phone</th>
					<th class:sorted-asc={sortCol === 'confidence' && sortDir === 'asc'} class:sorted-desc={sortCol === 'confidence' && sortDir === 'desc'} onclick={() => toggleSort('confidence')}>Conf.</th>
					<th>LinkedIn</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as c, i}
					<tr class="priority-{c.priority}">
						<td>{i + 1}</td>
						<td class="name">{c.name}</td>
						<td><span class="firm-tag">{c.firm}</span></td>
						<td class="position">{c.position}</td>
						<td><span class="dept {deptClass(c.dept)}">{c.dept}</span></td>
						<td><span class="grp grp-{c.group_name}">{c.group_name || '—'}</span></td>
						<td><span class="tz">{c.timezone || '—'}</span></td>
						<td class="email"><a href="mailto:{c.email}">{c.email}</a></td>
						<td class="phone">{#if c.dnc}<span class="dnc-flag" title="Do Not Call">DNC</span>{:else}{c.phone || '—'}{/if}</td>
						<td class="confidence {confClass(c.confidence)}">{c.confidence}%</td>
						<td class="linkedin">{#if c.linkedin}<a href={c.linkedin} target="_blank" rel="noopener">Profile</a>{/if}</td>
						<td class="actions"><button class="copy-btn" onclick={() => copyEmail(c.email)}>Copy</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="export-bar">
		<button class="export-btn" onclick={exportCSV}>Export CSV</button>
		<button class="export-btn secondary" onclick={copyAllEmails}>Copy Filtered Emails ({filtered.length})</button>
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a1a; color: #e0e0e0; }
	.header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px 32px; border-bottom: 1px solid #333; }
	.header h1 { font-size: 20px; color: #fff; margin: 0 0 4px 0; }
	.header p { font-size: 13px; color: #888; margin: 0; }
	.controls { display: flex; gap: 12px; padding: 12px 32px; background: #111; flex-wrap: wrap; align-items: center; border-bottom: 1px solid #222; }
	.controls input, .controls select { background: #1a1a2e; border: 1px solid #333; color: #e0e0e0; padding: 8px 12px; border-radius: 6px; font-size: 13px; }
	.controls input { width: 280px; }
	.controls select { min-width: 160px; }
	.stats { margin-left: auto; font-size: 13px; color: #888; }
	.stats b { color: #00d4aa; }
	.table-wrap { overflow: auto; flex: 1; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	thead { position: sticky; top: 0; z-index: 10; }
	th { background: #1a1a2e; padding: 10px 12px; text-align: left; font-weight: 600; color: #aaa; border-bottom: 2px solid #333; cursor: pointer; user-select: none; white-space: nowrap; }
	th:hover { color: #00d4aa; }
	th.sorted-asc::after { content: ' ▲'; color: #00d4aa; }
	th.sorted-desc::after { content: ' ▼'; color: #00d4aa; }
	td { padding: 8px 12px; border-bottom: 1px solid #1a1a2e; }
	tr:hover td { background: #1a1a3a; }
	.name { font-weight: 600; color: #fff; }
	.email a { color: #4da6ff; text-decoration: none; }
	.email a:hover { text-decoration: underline; }
	.phone { color: #00d4aa; }
	.dnc-flag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: #5c1a1a; color: #ff6b6b; }
	.grp { display: inline-block; width: 18px; text-align: center; padding: 2px 0; border-radius: 6px; font-size: 11px; font-weight: 700; }
	.grp-A { background: #1a3a5c; color: #4da6ff; }
	.grp-B { background: #5c3a1a; color: #ffb347; }
	.tz { font-size: 11px; font-weight: 600; color: #b088f9; }
	.dnc-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #aaa; cursor: pointer; }
	.dnc-toggle input { accent-color: #00d4aa; }
	.linkedin a { color: #0077b5; text-decoration: none; font-size: 12px; }
	.linkedin a:hover { text-decoration: underline; }
	.position { color: #ccc; }
	.dept { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
	.dept-it { background: #1a3a5c; color: #4da6ff; }
	.dept-executive { background: #3a1a5c; color: #b088f9; }
	.dept-operations { background: #1a5c3a; color: #00d4aa; }
	.dept-finance { background: #5c3a1a; color: #ffb347; }
	.dept-management { background: #5c1a3a; color: #ff6b9d; }
	.dept-other { background: #2a2a3a; color: #888; }
	.firm-tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #222; color: #ccc; }
	.confidence { font-size: 11px; }
	.conf-high { color: #00d4aa; }
	.conf-med { color: #ffb347; }
	.conf-low { color: #ff6b6b; }
	.copy-btn { background: #1a1a3a; border: 1px solid #333; color: #aaa; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; }
	.copy-btn:hover { background: #2a2a4a; color: #fff; }
	.actions { display: flex; gap: 6px; }
	.export-bar { padding: 12px 32px; background: #111; border-top: 1px solid #222; display: flex; gap: 12px; align-items: center; flex-shrink: 0; }
	.export-btn { background: linear-gradient(135deg, #00d4aa, #00a884); color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
	.export-btn:hover { opacity: 0.9; }
	.export-btn.secondary { background: #1a1a3a; color: #e0e0e0; border: 1px solid #333; }
	.priority-high { border-left: 3px solid #00d4aa; }
	.priority-medium { border-left: 3px solid #ffb347; }
	.priority-low { border-left: 3px solid #555; }
</style>
