import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import seedData from '$lib/data/graph-seed.json';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
	const supabase = getSupabase();

	const { nodes, links, scripts } = seedData as {
		nodes: { id: string; cat: string; label: string; sub: string; detail?: string }[];
		links: { source: string; target: string; rel: string; etype: string }[];
		scripts: Record<string, {
			score: number;
			similarClient: string;
			similarWhy: string;
			insight: string;
			holdings: string[];
			techStack: string[];
			sectors: string[];
			emailSubject: string;
			emailBody: string;
			phone: string;
		}>;
	};

	// Clear existing data
	await supabase.from('outreach_scripts').delete().neq('node_id', '');
	await supabase.from('graph_links').delete().neq('id', 0);
	await supabase.from('graph_nodes').delete().neq('id', '');

	// Insert nodes in batches
	const nodeBatchSize = 50;
	let nodesInserted = 0;
	for (let i = 0; i < nodes.length; i += nodeBatchSize) {
		const batch = nodes.slice(i, i + nodeBatchSize).map(n => ({
			id: n.id,
			cat: n.cat,
			label: n.label,
			sub: n.sub,
			detail: n.detail || ''
		}));
		const { error } = await supabase.from('graph_nodes').upsert(batch);
		if (error) return json({ error: `Node insert failed: ${error.message}` }, { status: 500 });
		nodesInserted += batch.length;
	}

	// Insert links in batches
	const linkBatchSize = 50;
	let linksInserted = 0;
	for (let i = 0; i < links.length; i += linkBatchSize) {
		const batch = links.slice(i, i + linkBatchSize).map(l => ({
			source_id: l.source,
			target_id: l.target,
			rel: l.rel,
			etype: l.etype
		}));
		const { error } = await supabase.from('graph_links').insert(batch);
		if (error) return json({ error: `Link insert failed: ${error.message}` }, { status: 500 });
		linksInserted += batch.length;
	}

	// Insert scripts
	const scriptRows = Object.entries(scripts).map(([nodeId, s]) => ({
		node_id: nodeId,
		score: s.score,
		similar_client: s.similarClient,
		similar_why: s.similarWhy,
		insight: s.insight,
		holdings: s.holdings,
		tech_stack: s.techStack,
		sectors: s.sectors,
		email_subject: s.emailSubject,
		email_body: s.emailBody,
		phone_script: s.phone
	}));

	const { error: scriptError } = await supabase.from('outreach_scripts').upsert(scriptRows);
	if (scriptError) return json({ error: `Script insert failed: ${scriptError.message}` }, { status: 500 });

	return json({
		success: true,
		nodes: nodesInserted,
		links: linksInserted,
		scripts: scriptRows.length
	});
};
