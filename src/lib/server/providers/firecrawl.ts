import { env } from '$env/dynamic/private';
import type { Account, EmailStatus, EnrichmentProvider, PhoneResult, RawLead } from './types';

export class FirecrawlProvider implements EnrichmentProvider {
	name = 'firecrawl';

	private get apiKey() {
		const key = env.FIRECRAWL_API_KEY;
		if (!key) throw new Error('FIRECRAWL_API_KEY not set');
		return key;
	}

	async findContacts(_account: Account, _titles: string[]): Promise<RawLead[]> {
		return [];
	}

	async verifyEmail(_email: string): Promise<EmailStatus> {
		return 'unknown';
	}

	async findPhone(): Promise<PhoneResult[]> {
		return [];
	}

	async companyResearch(domain: string): Promise<string> {
		try {
			const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`
				},
				body: JSON.stringify({
					url: `https://${domain}`,
					formats: ['markdown'],
					onlyMainContent: true
				})
			});
			if (!res.ok) return '';
			const data = await res.json();
			const markdown = data.data?.markdown || '';
			// Truncate to ~3000 chars for Claude summarization
			return markdown.slice(0, 3000);
		} catch {
			return '';
		}
	}
}
