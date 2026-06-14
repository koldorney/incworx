import { getSupabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const supabase = getSupabase();

	const days = parseInt(url.searchParams.get('days') || '30');
	const since = new Date();
	since.setDate(since.getDate() - days);

	const { data: jobs } = await supabase
		.from('enrichment_jobs')
		.select('provider, operation, cost_usd, status, created_at')
		.gte('created_at', since.toISOString())
		.order('created_at', { ascending: false });

	// Aggregate by provider
	const byProvider: Record<string, { total: number; count: number }> = {};
	const byOperation: Record<string, { total: number; count: number }> = {};
	const byDay: Record<string, number> = {};
	let totalCost = 0;

	for (const job of jobs || []) {
		const cost = Number(job.cost_usd) || 0;
		totalCost += cost;

		if (!byProvider[job.provider]) byProvider[job.provider] = { total: 0, count: 0 };
		byProvider[job.provider].total += cost;
		byProvider[job.provider].count++;

		if (!byOperation[job.operation]) byOperation[job.operation] = { total: 0, count: 0 };
		byOperation[job.operation].total += cost;
		byOperation[job.operation].count++;

		const day = job.created_at.slice(0, 10);
		byDay[day] = (byDay[day] || 0) + cost;
	}

	return {
		totalCost,
		byProvider,
		byOperation,
		byDay,
		days,
		jobCount: jobs?.length ?? 0
	};
};
