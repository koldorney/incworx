import { env } from '$env/dynamic/private';
import type { Account, EmailStatus, EnrichmentProvider, PhoneResult, RawLead } from './types';

export class ApolloProvider implements EnrichmentProvider {
	name = 'apollo';

	private get apiKey() {
		const key = env.APOLLO_API_KEY;
		if (!key) throw new Error('APOLLO_API_KEY not set');
		return key;
	}

	private async request(path: string, body: Record<string, unknown>) {
		const res = await fetch(`https://api.apollo.io/v1/${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': this.apiKey
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) throw new Error(`Apollo ${path}: ${res.status} ${await res.text()}`);
		return res.json();
	}

	async findContacts(account: Account, titles: string[]): Promise<RawLead[]> {
		const data = await this.request('mixed_people/search', {
			person_titles: titles,
			q_organization_domains: account.domain ? [account.domain] : undefined,
			q_organization_name: !account.domain ? account.company_name : undefined,
			page: 1,
			per_page: 25
		});

		return (data.people || []).map((p: Record<string, unknown>) => ({
			full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
			title: p.title as string | null,
			email: p.email as string | null,
			linkedin_url: p.linkedin_url as string | null,
			location: [p.city, p.state, p.country].filter(Boolean).join(', ') || null
		}));
	}

	async verifyEmail(email: string): Promise<EmailStatus> {
		try {
			const data = await this.request('people/match', { email });
			if (data.person?.email_status === 'verified') return 'valid';
			if (data.person?.email_status === 'unverified') return 'unknown';
			return 'unknown';
		} catch {
			return 'unknown';
		}
	}

	async findPhone(
		lead: { full_name: string; email: string | null; location: string | null },
		_account: Account
	): Promise<PhoneResult[]> {
		if (!lead.email) return [];
		try {
			const data = await this.request('people/match', { email: lead.email });
			const phones: PhoneResult[] = [];
			if (data.person?.phone_numbers) {
				for (const p of data.person.phone_numbers) {
					phones.push({
						number: p.sanitized_number || p.raw_number,
						type: p.type === 'mobile' ? 'mobile' : p.type === 'work_direct' ? 'mobile' : 'landline',
						geo_match: true
					});
				}
			}
			return phones;
		} catch {
			return [];
		}
	}

	async companyResearch(domain: string): Promise<string> {
		try {
			const data = await this.request('organizations/enrich', {
				domain
			});
			const org = data.organization;
			if (!org) return '';
			return [
				org.short_description,
				org.industry ? `Industry: ${org.industry}` : '',
				org.estimated_num_employees ? `~${org.estimated_num_employees} employees` : '',
				org.annual_revenue_printed ? `Revenue: ${org.annual_revenue_printed}` : ''
			].filter(Boolean).join('. ');
		} catch {
			return '';
		}
	}
}
