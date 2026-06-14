export interface Account {
	id: string;
	company_name: string;
	domain: string | null;
	size: number | null;
	revenue_stage: string | null;
	industry: string | null;
	location: string | null;
}

export interface RawLead {
	full_name: string;
	title: string | null;
	email: string | null;
	linkedin_url: string | null;
	location: string | null;
}

export type EmailStatus = 'valid' | 'invalid' | 'catch_all' | 'unknown';
export type PhoneType = 'mobile' | 'landline' | 'unknown';

export interface PhoneResult {
	number: string;
	type: PhoneType;
	geo_match: boolean;
}

export interface EnrichmentProvider {
	name: string;
	findContacts(account: Account, titles: string[]): Promise<RawLead[]>;
	verifyEmail(email: string): Promise<EmailStatus>;
	findPhone(lead: { full_name: string; email: string | null; location: string | null }, account: Account): Promise<PhoneResult[]>;
	companyResearch(domain: string): Promise<string>;
}

export interface EnrichmentJobLog {
	lead_id?: string;
	account_id?: string;
	provider: string;
	operation: string;
	status: string;
	cost_usd: number;
	raw_response: unknown;
}
