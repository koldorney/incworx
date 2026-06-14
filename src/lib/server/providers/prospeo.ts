import { env } from '$env/dynamic/private';
import type { Account, EmailStatus, EnrichmentProvider, PhoneResult, RawLead } from './types';

export class ProspeoProvider implements EnrichmentProvider {
	name = 'prospeo';

	private get apiKey() {
		const key = env.PROSPEO_API_KEY;
		if (!key) throw new Error('PROSPEO_API_KEY not set');
		return key;
	}

	private async request(path: string, body: Record<string, unknown>) {
		const res = await fetch(`https://api.prospeo.io/${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-KEY': this.apiKey
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) throw new Error(`Prospeo ${path}: ${res.status} ${await res.text()}`);
		return res.json();
	}

	async findContacts(_account: Account, _titles: string[]): Promise<RawLead[]> {
		// Prospeo is primarily email-find/verify — sourcing handled by Apollo
		return [];
	}

	async verifyEmail(email: string): Promise<EmailStatus> {
		try {
			const data = await this.request('email-verifier', { email });
			if (data.response?.is_valid === true) return 'valid';
			if (data.response?.is_catch_all === true) return 'catch_all';
			return 'invalid';
		} catch {
			return 'unknown';
		}
	}

	async findPhone(
		lead: { full_name: string; email: string | null; location: string | null },
		account: Account
	): Promise<PhoneResult[]> {
		if (!lead.email) return [];
		try {
			const data = await this.request('mobile-finder', {
				email: lead.email,
				company: account.company_name
			});
			if (data.response?.phone) {
				return [{
					number: data.response.phone,
					type: 'mobile',
					geo_match: true
				}];
			}
			return [];
		} catch {
			return [];
		}
	}

	async companyResearch(_domain: string): Promise<string> {
		return '';
	}
}
