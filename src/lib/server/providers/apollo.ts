import { env } from '$env/dynamic/private';
import type { Account, EmailStatus, EnrichmentProvider, PhoneResult, RawLead } from './types';

export class ApolloProvider implements EnrichmentProvider {
	name = 'apollo';

	private get apiKey() {
		const key = env.APOLLO_API_KEY;
		if (!key) throw new Error('APOLLO_API_KEY not set');
		return key;
	}

	private async post(path: string, body: Record<string, unknown>) {
		const res = await fetch(`https://api.apollo.io/api/v1/${path}`, {
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

	private async get(path: string, params: Record<string, string>) {
		const url = new URL(`https://api.apollo.io/api/v1/${path}`);
		for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
		const res = await fetch(url.toString(), {
			headers: { 'X-Api-Key': this.apiKey }
		});
		if (!res.ok) throw new Error(`Apollo ${path}: ${res.status} ${await res.text()}`);
		return res.json();
	}

	async findContacts(account: Account, titles: string[]): Promise<RawLead[]> {
		const searchBody: Record<string, unknown> = {
			person_titles: titles,
			page: 1,
			per_page: 25
		};
		if (account.domain) {
			searchBody.q_organization_domains_list = [account.domain];
		} else {
			searchBody.q_organization_name = account.company_name;
		}

		const data = await this.post('mixed_people/api_search', searchBody);

		const people: RawLead[] = [];
		for (const p of data.people || []) {
			const lead: RawLead = {
				full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
				title: (p.title as string) || null,
				email: null,
				linkedin_url: null,
				location: null
			};

			// Search results may not include contact details — enrich by ID if available
			if (p.id) {
				try {
					const enriched = await this.post('people/match', {
						id: p.id,
						reveal_personal_emails: false
					});
					const person = enriched.person;
					if (person) {
						lead.email = person.email || null;
						lead.linkedin_url = person.linkedin_url || null;
						lead.location = [person.city, person.state, person.country].filter(Boolean).join(', ') || null;
					}
				} catch {
					// Enrichment failed for this person — keep what we have from search
					lead.location = [p.city, p.state, p.country].filter(Boolean).join(', ') || null;
				}
			}

			people.push(lead);
		}

		return people;
	}

	async verifyEmail(email: string): Promise<EmailStatus> {
		try {
			const data = await this.post('people/match', { email });
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
			const data = await this.post('people/match', { email: lead.email });
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
			const data = await this.get('organizations/enrich', { domain });
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
