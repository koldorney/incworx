<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { data } = $props();

	const CAT: Record<string, { color: string; r: number; label: string }> = {
		incworx: { color: '#6366f1', r: 22, label: 'Incworx' },
		firm: { color: '#3b82f6', r: 16, label: 'PE Firms (Clients)' },
		prospect: { color: '#f59e0b', r: 14, label: 'Prospect Firms' },
		holding: { color: '#a78bfa', r: 7, label: 'Portfolio Holdings' },
		person: { color: '#10b981', r: 8, label: 'Key Contacts' },
		sector: { color: '#ef4444', r: 10, label: 'Sectors' },
		tech: { color: '#06b6d4', r: 9, label: 'Tech Platforms' },
		geo: { color: '#f97316', r: 9, label: 'Cities' }
	};

	const EDGE_TYPES: Record<string, { color: string; label: string }> = {
		client: { color: '#6366f1', label: 'Client relationship' },
		employs: { color: '#10b981', label: 'Employs / contact' },
		sector: { color: '#ef4444', label: 'Sector / industry' },
		uses_tech: { color: '#06b6d4', label: 'Uses technology' },
		located: { color: '#f97316', label: 'Located in' },
		tech_rel: { color: '#06b6d4', label: 'Tech relationship' },
		holds: { color: '#a78bfa', label: 'Portfolio holding' }
	};

	let graphContainer: HTMLElement;
	let scriptModalOpen = $state(false);
	let modalContent = $state('');

	onMount(() => {
		if (!data.nodes.length) return;

		const nodes = data.nodes.map(n => ({ ...n }));
		const links = data.links.map(l => ({ ...l }));
		const SCRIPTS = data.scripts;

		// Stats
		const sNodes = document.getElementById('sNodes');
		const sEdges = document.getElementById('sEdges');
		const sFirms = document.getElementById('sFirms');
		const sContacts = document.getElementById('sContacts');
		const sProspects = document.getElementById('sProspects');
		const sHoldings = document.getElementById('sHoldings');
		if (sNodes) sNodes.textContent = String(nodes.length);
		if (sEdges) sEdges.textContent = String(links.length);
		if (sFirms) sFirms.textContent = String(nodes.filter(n => n.cat === 'firm').length);
		if (sContacts) sContacts.textContent = String(nodes.filter(n => n.cat === 'person').length);
		if (sProspects) sProspects.textContent = String(nodes.filter(n => n.cat === 'prospect').length);
		if (sHoldings) sHoldings.textContent = String(nodes.filter(n => n.cat === 'holding').length);

		// Visibility toggles
		const visible: Record<string, boolean> = { incworx: true, firm: true, prospect: true, holding: true, person: true, sector: true, tech: true, geo: true };
		const edgeVis: Record<string, boolean> = { client: true, employs: true, sector: true, uses_tech: true, located: true, tech_rel: true, holds: true };

		const togglesEl = document.getElementById('toggles')!;
		Object.entries(CAT).forEach(([k, v]) => {
			const count = nodes.filter(n => n.cat === k).length;
			const row = document.createElement('div');
			row.className = 'toggle-row';
			row.innerHTML = `<span class="toggle-dot" style="background:${v.color}"></span><span class="toggle-label">${v.label}</span><span class="toggle-count">${count}</span>`;
			row.addEventListener('click', () => {
				visible[k] = !visible[k];
				row.classList.toggle('off', !visible[k]);
				updateVisibility();
			});
			togglesEl.appendChild(row);
		});

		const edgeTogglesEl = document.getElementById('edgeToggles')!;
		Object.entries(EDGE_TYPES).forEach(([k, v]) => {
			const count = links.filter(l => l.etype === k).length;
			const row = document.createElement('div');
			row.className = 'toggle-row';
			row.innerHTML = `<span class="toggle-dot" style="background:${v.color}"></span><span class="toggle-label">${v.label}</span><span class="toggle-count">${count}</span>`;
			row.addEventListener('click', () => {
				edgeVis[k] = !edgeVis[k];
				row.classList.toggle('off', !edgeVis[k]);
				updateVisibility();
			});
			edgeTogglesEl.appendChild(row);
		});

		// D3 setup
		const container = document.getElementById('graph-container')!;
		const W = container.clientWidth;
		const H = container.clientHeight;
		const svg = d3.select('#graph');
		const g = svg.append('g');
		const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 5]).on('zoom', (e) => g.attr('transform', e.transform));
		svg.call(zoomBehavior);

		const sim = d3.forceSimulation(nodes as any)
			.force('link', d3.forceLink(links as any).id((d: any) => d.id).distance((d: any) => {
				const sc = typeof d.source === 'object' ? d.source.cat : nodes.find(n => n.id === d.source)?.cat;
				const tc = typeof d.target === 'object' ? d.target.cat : nodes.find(n => n.id === d.target)?.cat;
				if (sc === 'incworx' || tc === 'incworx') return 200;
				if (sc === 'firm' && tc === 'person') return 80;
				if (sc === 'firm' && tc === 'firm') return 250;
				if (sc === 'geo' || tc === 'geo') return 130;
				return 100;
			}).strength((d: any) => {
				const sc = typeof d.source === 'object' ? d.source.cat : nodes.find(n => n.id === d.source)?.cat;
				if (sc === 'incworx') return 0.3;
				return 0.5;
			}))
			.force('charge', d3.forceManyBody().strength((d: any) => d.cat === 'incworx' ? -1200 : d.cat === 'firm' ? -600 : d.cat === 'prospect' ? -400 : d.cat === 'holding' ? -120 : -150))
			.force('center', d3.forceCenter(W / 2, H / 2))
			.force('collision', d3.forceCollide().radius((d: any) => CAT[d.cat].r + 10))
			.force('x', d3.forceX(W / 2).strength(0.015))
			.force('y', d3.forceY(H / 2).strength(0.015));

		const linkG = g.append('g');
		const nodeG = g.append('g');

		const link = linkG.selectAll('line').data(links).join('line')
			.attr('class', 'link')
			.attr('stroke', (d: any) => EDGE_TYPES[d.etype]?.color || '#444')
			.attr('stroke-width', (d: any) => d.etype === 'client' ? 2 : 1);

		const node = nodeG.selectAll<SVGGElement, any>('g').data(nodes).join('g')
			.call(d3.drag<SVGGElement, any>()
				.on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
				.on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
				.on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

		node.append('circle')
			.attr('class', 'node-circle')
			.attr('r', (d: any) => CAT[d.cat].r)
			.attr('fill', (d: any) => CAT[d.cat].color)
			.attr('stroke', 'rgba(255,255,255,0.15)')
			.attr('stroke-width', (d: any) => d.cat === 'incworx' ? 2.5 : 1);

		node.filter((d: any) => d.cat === 'incworx' || d.cat === 'firm' || d.cat === 'prospect').append('text')
			.text((d: any) => {
				if (d.cat === 'incworx') return 'IW';
				const words = d.label.split(' ');
				return words.map((w: string) => w[0]).join('').substring(0, 3);
			})
			.attr('text-anchor', 'middle').attr('dy', '0.35em')
			.attr('fill', 'rgba(255,255,255,0.9)')
			.attr('font-size', (d: any) => d.cat === 'incworx' ? 14 : 11)
			.attr('font-weight', 600)
			.style('pointer-events', 'none');

		node.append('text')
			.attr('class', (d: any) => 'node-label' + (d.cat === 'firm' ? ' firm-label' : '') + (d.cat === 'prospect' ? ' firm-label' : '') + (d.cat === 'incworx' ? ' incworx-label' : ''))
			.text((d: any) => d.label)
			.attr('dy', (d: any) => CAT[d.cat].r + 14);

		const tip = document.getElementById('tip')!;
		let selectedNode: string | null = null;

		node.on('mouseover', (e: MouseEvent, d: any) => {
			if (selectedNode) return;
			highlightNode(d);
			showTooltip(e, d);
		}).on('mouseout', () => {
			if (selectedNode) return;
			clearHighlight();
			tip.style.opacity = '0';
		}).on('click', (e: MouseEvent, d: any) => {
			e.stopPropagation();
			if (d.cat === 'prospect' && SCRIPTS[d.id]) { showScriptModal(d); return; }
			if (selectedNode === d.id) { selectedNode = null; clearHighlight(); hideDetail(); return; }
			selectedNode = d.id;
			highlightNode(d);
			showDetail(d);
		});

		svg.on('click', () => { selectedNode = null; clearHighlight(); hideDetail(); });

		function highlightNode(d: any) {
			const connected = new Set([d.id]);
			links.forEach((l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				if (si === d.id) connected.add(ti);
				if (ti === d.id) connected.add(si);
			});
			node.select('.node-circle').classed('dim', (n: any) => !connected.has(n.id));
			node.select('.node-label').classed('dim', (n: any) => !connected.has(n.id));
			link.classed('highlight', (l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				return si === d.id || ti === d.id;
			}).classed('dim', (l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				return si !== d.id && ti !== d.id;
			});
		}

		function clearHighlight() {
			node.select('.node-circle').classed('dim', false);
			node.select('.node-label').classed('dim', false);
			link.classed('highlight', false).classed('dim', false);
		}

		function showTooltip(e: MouseEvent, d: any) {
			tip.innerHTML = `<strong>${d.label}</strong><div class="tt-sub">${d.sub}</div>`;
			tip.style.opacity = '1';
			const rect = container.getBoundingClientRect();
			tip.style.left = Math.min(e.clientX - rect.left + 15, rect.width - 280) + 'px';
			tip.style.top = (e.clientY - rect.top - 50) + 'px';
		}

		function showDetail(d: any) {
			const conns: { node: any; rel: string }[] = [];
			links.forEach((l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				if (si === d.id) { const n = nodes.find(x => x.id === ti); if (n) conns.push({ node: n, rel: l.rel }); }
				if (ti === d.id) { const n = nodes.find(x => x.id === si); if (n) conns.push({ node: n, rel: l.rel }); }
			});
			const area = document.getElementById('detailArea')!;
			area.innerHTML = `<div class="detail-panel">
				<h2>${d.label}</h2>
				<div class="detail-sub">${d.sub}</div>
				<p style="font-size:12px;color:#aaa;margin-bottom:12px;line-height:1.5">${d.detail || ''}</p>
				<div class="section-title">Connections (${conns.length})</div>
				<ul class="detail-connections">
					${conns.map(c => `<li><span class="conn-dot" style="background:${CAT[c.node.cat].color}"></span>${c.node.label}<span class="conn-rel">${c.rel}</span></li>`).join('')}
				</ul>
			</div>`;
		}

		function hideDetail() { document.getElementById('detailArea')!.innerHTML = ''; }

		function updateVisibility() {
			node.attr('display', (d: any) => visible[d.cat] ? null : 'none');
			link.attr('display', (d: any) => {
				const sc = typeof d.source === 'object' ? d.source.cat : d.source;
				const tc = typeof d.target === 'object' ? d.target.cat : d.target;
				return visible[sc] && visible[tc] && edgeVis[d.etype] ? null : 'none';
			});
		}

		sim.on('tick', () => {
			link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
				.attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
			node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
		});

		document.getElementById('resetBtn')!.addEventListener('click', () => {
			selectedNode = null; clearHighlight(); hideDetail();
			svg.transition().duration(500).call(zoomBehavior.transform as any, d3.zoomIdentity);
		});

		document.getElementById('focusIncworx')!.addEventListener('click', () => {
			const n = nodes.find(d => d.id === 'incworx') as any;
			if (n) svg.transition().duration(700).call(zoomBehavior.transform as any,
				d3.zoomIdentity.translate(W / 2 - n.x * 1.8, H / 2 - n.y * 1.8).scale(1.8));
		});

		document.getElementById('focusFirms')!.addEventListener('click', () => {
			Object.keys(visible).forEach(k => visible[k] = (k === 'firm' || k === 'incworx' || k === 'prospect' || k === 'holding'));
			Object.keys(edgeVis).forEach(k => edgeVis[k] = (k === 'client' || k === 'holds'));
			document.querySelectorAll('#toggles .toggle-row').forEach((row, i) => {
				const k = Object.keys(CAT)[i];
				row.classList.toggle('off', !visible[k]);
			});
			document.querySelectorAll('#edgeToggles .toggle-row').forEach((row, i) => {
				const k = Object.keys(EDGE_TYPES)[i];
				row.classList.toggle('off', !edgeVis[k]);
			});
			updateVisibility();
		});

		document.getElementById('search')!.addEventListener('input', (e) => {
			const q = (e.target as HTMLInputElement).value.toLowerCase();
			if (!q) { clearHighlight(); return; }
			const matches = new Set<string>();
			nodes.forEach(n => {
				if (n.label.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q) || (n.detail || '').toLowerCase().includes(q)) matches.add(n.id);
			});
			node.select('.node-circle').classed('dim', (n: any) => !matches.has(n.id));
			node.select('.node-label').classed('dim', (n: any) => !matches.has(n.id));
			link.classed('dim', (l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				return !matches.has(si) && !matches.has(ti);
			});
		});

		function showScriptModal(d: any) {
			const s = SCRIPTS[d.id];
			if (!s) return;
			const conns: { node: any; rel: string; etype: string }[] = [];
			links.forEach((l: any) => {
				const si = typeof l.source === 'object' ? l.source.id : l.source;
				const ti = typeof l.target === 'object' ? l.target.id : l.target;
				if (si === d.id || ti === d.id) {
					const otherId = si === d.id ? ti : si;
					const n = nodes.find(x => x.id === otherId);
					if (n) conns.push({ node: n, rel: l.rel, etype: l.etype });
				}
			});

			modalContent = `
				<div class="modal-close"><button onclick="document.getElementById('scriptModal').classList.remove('open')">&times;</button></div>
				<div class="modal-head">
					<div class="m-name">${d.label} <span class="m-badge">Score: ${s.score}</span></div>
					<div class="m-meta">${d.sub} &bull; ${d.detail.split('|')[0].trim()}</div>
				</div>
				<div class="m-method">
					<div class="m-pill"><b>1.</b> Observation</div>
					<div class="m-pill"><b>2.</b> Connection</div>
					<div class="m-pill"><b>3.</b> Insight</div>
					<div class="m-pill"><b>4.</b> CTA</div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Portfolio Holdings (Graph Signals)</div>
					<div class="m-tags">${s.holdings.map((h: string) => '<span class="m-tag holding">' + h + '</span>').join('')}</div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Tech Stack Detected</div>
					<div class="m-tags">${s.techStack.map((t: string) => '<span class="m-tag tech">' + t + '</span>').join('')}</div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Sector Focus</div>
					<div class="m-tags">${s.sectors.map((x: string) => '<span class="m-tag sector">' + x + '</span>').join('')}</div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Similar Client Connection</div>
					<div class="m-tags"><span class="m-tag sim">${s.similarClient}</span></div>
					<div class="m-similar"><div class="il">Why this comparison works</div><p>${s.similarWhy}</p></div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Key Insight (Observation)</div>
					<div class="m-insight"><div class="il">Signal intelligence</div><p>${s.insight}</p></div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Email Script — First Touch</div>
					<div class="m-script">
						<button class="m-copy" data-type="email" data-id="${d.id}">Copy</button>
						<div class="ch">Email</div>
						<div class="subj">Subject: ${s.emailSubject}</div>
						<div class="body">${s.emailBody.replace(/\{\{FIRST_NAME\}\}/g, '<span class="vr">{{FIRST_NAME}}</span>').replace(/\n/g, '<br>')}</div>
					</div>
				</div>
				<div class="m-section">
					<div class="m-section-title">Cold Call Script</div>
					<div class="m-script">
						<button class="m-copy" data-type="phone" data-id="${d.id}">Copy</button>
						<div class="ch">Phone — Opening</div>
						<div class="body">${s.phone.replace(/\{\{FIRST_NAME\}\}/g, '<span class="vr">{{FIRST_NAME}}</span>')}</div>
					</div>
				</div>`;

			scriptModalOpen = true;

			// Bind copy buttons after render
			setTimeout(() => {
				document.querySelectorAll('.m-copy').forEach(btn => {
					btn.addEventListener('click', () => {
						const type = btn.getAttribute('data-type');
						const id = btn.getAttribute('data-id')!;
						const sc = SCRIPTS[id];
						const text = type === 'email' ? 'Subject: ' + sc.emailSubject + '\n\n' + sc.emailBody : sc.phone;
						navigator.clipboard.writeText(text).then(() => {
							btn.textContent = 'Copied!';
							setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
						});
					});
				});
			}, 50);
		}
	});

	function closeModal() {
		scriptModalOpen = false;
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeModal();
	}
</script>

<svelte:head>
	<title>Incworx GTM Map</title>
</svelte:head>

<svelte:document onkeydown={handleModalKeydown} />

<div id="app">
	<div id="sidebar">
		<div id="sidebar-header">
			<h1>PE Ecosystem Network</h1>
			<p>Force-directed GTM intelligence map</p>
		</div>
		<div class="stats-bar">
			<span><b id="sNodes">0</b> nodes</span>
			<span><b id="sEdges">0</b> edges</span>
			<span><b id="sFirms">0</b> firms</span>
			<span><b id="sContacts">0</b> contacts</span>
			<span><b id="sProspects">0</b> prospects</span>
			<span><b id="sHoldings">0</b> holdings</span>
		</div>
		<div class="search-box">
			<input type="text" id="search" placeholder="Search nodes..." />
		</div>
		<div class="section">
			<div class="section-title">Node Types</div>
			<div id="toggles"></div>
		</div>
		<div class="section">
			<div class="section-title">Edge Types</div>
			<div id="edgeToggles"></div>
		</div>
		<div id="detailArea"></div>
	</div>

	<div id="graph-container" bind:this={graphContainer}>
		<svg id="graph"></svg>
		<div class="tooltip" id="tip"></div>
		<div class="toolbar">
			<button id="resetBtn">Reset</button>
			<button id="focusIncworx">Focus Incworx</button>
			<button id="focusFirms">PE View</button>
		</div>
	</div>
</div>

<!-- Script Modal -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div id="scriptModal" class:open={scriptModalOpen} onclick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
	<div id="modalContent">
		{@html modalContent}
	</div>
</div>

<style>
	#app { display: flex; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; }
	#sidebar { width: 320px; background: #111118; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
	#sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
	#sidebar-header h1 { font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 4px 0; }
	#sidebar-header p { font-size: 12px; color: #888; margin: 0; }
	.stats-bar { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #888; }
	.stats-bar b { color: #fff; }
	.section { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
	:global(.section-title) { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 10px; font-weight: 600; }
	:global(.toggle-row) { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; user-select: none; }
	:global(.toggle-row:hover) { opacity: 0.8; }
	:global(.toggle-dot) { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; transition: opacity 0.2s; }
	:global(.toggle-row.off .toggle-dot) { opacity: 0.2; }
	:global(.toggle-row.off .toggle-label) { opacity: 0.35; }
	:global(.toggle-label) { font-size: 13px; }
	:global(.toggle-count) { font-size: 11px; color: #555; margin-left: auto; }
	:global(.detail-panel) { padding: 16px 20px; }
	:global(.detail-panel h2) { font-size: 15px; font-weight: 600; color: #fff; margin: 0 0 2px 0; }
	:global(.detail-sub) { font-size: 12px; color: #888; margin-bottom: 12px; }
	:global(.detail-connections) { list-style: none; padding: 0; margin: 0; }
	:global(.detail-connections li) { font-size: 12px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 6px; }
	:global(.detail-connections li:last-child) { border: none; }
	:global(.conn-dot) { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
	:global(.conn-rel) { color: #666; margin-left: auto; font-size: 11px; }
	#graph-container { flex: 1; position: relative; }
	:global(#graph) { width: 100%; height: 100%; display: block; }
	:global(.link) { stroke-opacity: 0.25; transition: stroke-opacity 0.2s, stroke-width 0.2s; }
	:global(.link.highlight) { stroke-opacity: 0.8; }
	:global(.link.dim) { stroke-opacity: 0.03; }
	:global(.node-circle) { cursor: pointer; transition: opacity 0.2s; }
	:global(.node-circle.dim) { opacity: 0.08; }
	:global(.node-label) { pointer-events: none; font-size: 11px; fill: rgba(255,255,255,0.7); text-anchor: middle; transition: opacity 0.2s; }
	:global(.node-label.dim) { opacity: 0.05; }
	:global(.node-label.firm-label) { font-size: 12px; font-weight: 600; fill: rgba(255,255,255,0.9); }
	:global(.node-label.incworx-label) { font-size: 14px; font-weight: 700; fill: #fff; }
	.tooltip { position: absolute; background: rgba(17,17,24,0.95); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.15s; max-width: 260px; z-index: 10; }
	:global(.tooltip strong) { color: #fff; display: block; margin-bottom: 2px; }
	:global(.tt-sub) { color: #888; }
	.toolbar { position: absolute; top: 16px; right: 16px; display: flex; gap: 6px; z-index: 5; }
	.toolbar button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: background 0.15s; }
	.toolbar button:hover { background: rgba(255,255,255,0.12); }
	.search-box { padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
	.search-box input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 7px 10px; color: #e0e0e0; font-size: 13px; outline: none; box-sizing: border-box; }
	.search-box input:focus { border-color: rgba(99,102,241,0.5); }

	/* Modal */
	#scriptModal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; overflow-y: auto; padding: 40px; }
	#scriptModal.open { display: flex; justify-content: center; align-items: flex-start; }
	#modalContent { background: #111118; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 720px; width: 100%; padding: 32px; position: relative; }
	:global(.modal-close) { position: absolute; top: 16px; right: 16px; }
	:global(.modal-close button) { background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 4px 8px; }
	:global(.modal-close button:hover) { color: #fff; }
	:global(.modal-head) { margin-bottom: 20px; }
	:global(.m-name) { font-size: 22px; font-weight: 700; color: #fff; }
	:global(.m-badge) { background: #6366f1; color: #fff; font-size: 12px; padding: 2px 10px; border-radius: 12px; font-weight: 600; margin-left: 8px; }
	:global(.m-meta) { font-size: 13px; color: #888; margin-top: 4px; }
	:global(.m-method) { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
	:global(.m-pill) { background: #1e1e3a; border: 1px solid #2a2a5a; border-radius: 20px; padding: 6px 14px; font-size: 12px; color: #aab; }
	:global(.m-pill b) { color: #7c8cf8; }
	:global(.m-section) { margin-bottom: 16px; }
	:global(.m-section-title) { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #5a5a8a; margin-bottom: 8px; }
	:global(.m-tags) { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
	:global(.m-tag) { font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: 500; }
	:global(.m-tag.holding) { background: #2a2010; color: #E6A545; border: 1px solid #3a3020; }
	:global(.m-tag.tech) { background: #101a2e; color: #4a9af5; border: 1px solid #1a2a4e; }
	:global(.m-tag.sector) { background: #1e1020; color: #e07070; border: 1px solid #2e1a2a; }
	:global(.m-tag.sim) { background: #0a2020; color: #4ac4a0; border: 1px solid #1a3030; }
	:global(.m-similar) { background: #0a0f1e; border: 1px solid #1a2040; border-radius: 8px; padding: 14px 18px; margin-top: 8px; }
	:global(.m-similar .il) { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #7c8cf8; margin-bottom: 6px; }
	:global(.m-similar p) { font-size: 13px; color: #a0a0d0; margin: 0; }
	:global(.m-insight) { background: #0f1a10; border: 1px solid #1a3020; border-radius: 8px; padding: 14px 18px; }
	:global(.m-insight .il) { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4ac4a0; margin-bottom: 6px; }
	:global(.m-insight p) { font-size: 13px; color: #a0c0a0; margin: 0; }
	:global(.m-script) { background: #0a0a18; border: 1px solid #1a1a30; border-radius: 8px; padding: 16px 20px; position: relative; }
	:global(.m-copy) { position: absolute; top: 12px; right: 12px; background: #1e1e3a; border: 1px solid #2a2a5a; color: #8888aa; border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer; }
	:global(.m-copy:hover) { background: #2a2a4a; color: #fff; }
	:global(.ch) { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #5a5a8a; margin-bottom: 8px; }
	:global(.subj) { font-size: 14px; font-weight: 600; color: #7c8cf8; margin-bottom: 10px; }
	:global(.m-script .body) { font-size: 13.5px; color: #c0c0d0; white-space: pre-wrap; line-height: 1.6; }
	:global(.vr) { color: #E6A545; font-weight: 600; }
</style>
