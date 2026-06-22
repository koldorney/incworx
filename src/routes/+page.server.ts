import { getSupabase, isConfigured } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!isConfigured()) return { nodes: [], links: [], scripts: {} };

	const supabase = getSupabase();

	const [nodesResult, linksResult, scriptsResult] = await Promise.all([
		supabase.from('graph_nodes').select('id, cat, label, sub, detail'),
		supabase.from('graph_links').select('source_id, target_id, rel, etype'),
		supabase.from('outreach_scripts').select('*')
	]);

	const nodes = (nodesResult.data ?? []).map(n => ({
		id: n.id,
		cat: n.cat,
		label: n.label,
		sub: n.sub,
		detail: n.detail || ''
	}));

	const links = (linksResult.data ?? []).map(l => ({
		source: l.source_id,
		target: l.target_id,
		rel: l.rel,
		etype: l.etype
	}));

	const scripts: Record<string, {
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
	}> = {};

	for (const s of scriptsResult.data ?? []) {
		scripts[s.node_id] = {
			score: s.score,
			similarClient: s.similar_client,
			similarWhy: s.similar_why,
			insight: s.insight,
			holdings: s.holdings,
			techStack: s.tech_stack,
			sectors: s.sectors,
			emailSubject: s.email_subject,
			emailBody: s.email_body,
			phone: s.phone_script
		};
	}

	return { nodes, links, scripts };
};
