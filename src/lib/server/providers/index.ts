import { getSupabase } from '$lib/server/supabase';
import { ApolloProvider } from './apollo';
import { ProspeoProvider } from './prospeo';
import type { Account, EmailStatus, EnrichmentJobLog, EnrichmentProvider, PhoneResult, PhoneType } from './types';

const providers: Record<string, EnrichmentProvider> = {
	apollo: new ApolloProvider(),
	prospeo: new ProspeoProvider()
};

export function getProvider(name: string): EnrichmentProvider {
	const p = providers[name];
	if (!p) throw new Error(`Unknown provider: ${name}`);
	return p;
}

export function getAllProviders(): EnrichmentProvider[] {
	return Object.values(providers);
}

async function logJob(job: EnrichmentJobLog) {
	const supabase = getSupabase();
	await supabase.from('enrichment_jobs').insert({
		lead_id: job.lead_id || null,
		account_id: job.account_id || null,
		provider: job.provider,
		operation: job.operation,
		status: job.status,
		cost_usd: job.cost_usd,
		raw_response: job.raw_response
	});
}

export async function waterfallVerifyEmail(
	email: string,
	leadId: string,
	providerOrder = ['prospeo', 'apollo']
): Promise<EmailStatus> {
	for (const name of providerOrder) {
		const provider = providers[name];
		if (!provider) continue;
		try {
			const status = await provider.verifyEmail(email);
			await logJob({
				lead_id: leadId,
				provider: name,
				operation: 'verify_email',
				status: 'complete',
				cost_usd: estimateCost(name, 'verify_email'),
				raw_response: { email, result: status }
			});
			if (status !== 'unknown') return status;
		} catch (err) {
			await logJob({
				lead_id: leadId,
				provider: name,
				operation: 'verify_email',
				status: 'error',
				cost_usd: 0,
				raw_response: { error: String(err) }
			});
		}
	}
	return 'unknown';
}

export async function waterfallFindPhone(
	lead: { id: string; full_name: string; email: string | null; location: string | null },
	account: Account,
	providerOrder = ['prospeo', 'apollo']
): Promise<{ bestNumber: string | null; bestType: PhoneType; allResults: PhoneResult[] }> {
	const allResults: PhoneResult[] = [];

	for (const name of providerOrder) {
		const provider = providers[name];
		if (!provider) continue;
		try {
			const phones = await provider.findPhone(lead, account);
			await logJob({
				lead_id: lead.id,
				account_id: account.id,
				provider: name,
				operation: 'find_phone',
				status: 'complete',
				cost_usd: estimateCost(name, 'find_phone'),
				raw_response: phones
			});
			allResults.push(...phones);
			if (phones.some(p => p.type === 'mobile')) break;
		} catch (err) {
			await logJob({
				lead_id: lead.id,
				account_id: account.id,
				provider: name,
				operation: 'find_phone',
				status: 'error',
				cost_usd: 0,
				raw_response: { error: String(err) }
			});
		}
	}

	const best = pickBestNumber(allResults);
	return { ...best, allResults };
}

function pickBestNumber(candidates: PhoneResult[]): { bestNumber: string | null; bestType: PhoneType } {
	if (candidates.length === 0) return { bestNumber: null, bestType: 'unknown' };

	const scored = candidates.map(c => {
		let score = 0;
		if (c.type === 'mobile') score += 3;
		else if (c.type === 'landline') score += 1;
		if (c.geo_match) score += 2;
		else score -= 2;
		return { ...c, score };
	});

	scored.sort((a, b) => b.score - a.score);
	return { bestNumber: scored[0].number, bestType: scored[0].type };
}

function estimateCost(provider: string, operation: string): number {
	const costs: Record<string, Record<string, number>> = {
		apollo: { find: 0.03, verify_email: 0.01, find_phone: 0.03, research: 0.01 },
		prospeo: { verify_email: 0.01, find_phone: 0.05 }
	};
	return costs[provider]?.[operation] ?? 0;
}

export { logJob, estimateCost };
export type { Account, EmailStatus, EnrichmentProvider, PhoneResult, RawLead } from './types';
