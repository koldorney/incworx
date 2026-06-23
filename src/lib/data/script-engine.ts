// Dynamic cold-call script engine.
// Maps a contact's position/department to a case-study-backed cluster, then
// produces a HOOK (what we did for one client) + VALUE ADD (what we can do for
// you) + a gatekeeper SCREEN line. Proof points come from incworx.com/case-studies.

export type Rep = 'Joseph' | 'Ryan';

export interface ScriptContact {
	name: string;
	first_name?: string | null;
	position?: string | null;
	dept?: string | null;
	firm?: string | null;
}

export interface Cluster {
	key: string;
	label: string;
	keywords: string[];
	hook: string; // follows "I'm calling because ..."
	valueAdd: string; // follows "how you ..."
	screen: string; // follows "I work with PE firms to ..."
	emailSubject: string;
	emailHook: string; // past-tense standalone sentence for email body
}

// Order matters: most specific functional clusters first, executive + default last.
export const CLUSTERS: Cluster[] = [
	{
		key: 'it',
		label: 'IT / Data',
		keywords: ['it', 'i.t', 'information technology', 'technology', 'cio', 'cto', 'infrastructure', 'data and ai', 'data & ai', 'technical', 'systems'],
		hook: "we just consolidated a client's SQL Server environment and pulled $350,000 out of their annual run rate",
		valueAdd: "could pull that cost out of your IT and data spend without leaning on a team that's already stretched thin",
		screen: 'modernize and consolidate the IT and data systems across their portfolio companies',
		emailSubject: 'Took $350K off a client’s annual run rate',
		emailHook: "We recently consolidated a client's SQL Server environment and pulled $350,000 out of their annual run rate."
	},
	{
		key: 'legal',
		label: 'Legal / Compliance',
		keywords: ['counsel', 'legal', 'compliance', 'cco', 'gc', 'sustainability', 'governance'],
		hook: 'we built an AI contract-review system on Microsoft Copilot that automated a firm’s entire first-pass review',
		valueAdd: 'could take the contract-review bottleneck off your deal timelines without burning outside-counsel hours',
		screen: 'use AI to speed up diligence and contract review on their deals',
		emailSubject: 'AI-assisted contract review for your deals',
		emailHook: 'We built an AI contract-review system on Microsoft Copilot that automated a firm’s entire first-pass review.'
	},
	{
		key: 'hr',
		label: 'HR / People',
		keywords: ['people', 'human resources', 'hr', 'talent', 'workforce enablement', 'chief people'],
		hook: 'we built a Power App that mapped 40,000 job titles in a couple hours and an automated goal-tracking system for another client’s workforce',
		valueAdd: 'could get clean, standardized HR data and take the manual people-ops off your team after every acquisition',
		screen: 'standardize HR data and automate people operations across their portfolio companies',
		emailSubject: 'Standardizing 40,000 job titles in a couple hours',
		emailHook: 'We built a Power App that mapped and standardized 40,000 job titles in a couple hours, plus an automated goal-tracking system for another client’s workforce.'
	},
	{
		key: 'finance',
		label: 'Finance',
		keywords: ['finance', 'cfo', 'chief financial', 'controller', 'accounting', 'tax', 'treasur', 'capital markets'],
		hook: 'we just automated invoice processing and built Power BI dashboards that give leadership real-time numbers',
		valueAdd: 'could tighten reporting and cut manual work across your holdings',
		screen: 'automate financial reporting and back-office work across their portfolio companies',
		emailSubject: 'Real-time numbers without waiting on month-end',
		emailHook: 'We just automated invoice processing and built Power BI dashboards that give leadership real-time numbers.'
	},
	{
		key: 'ir',
		label: 'Investor Relations',
		keywords: ['investor relations', 'investor', 'ir', 'fundraising', 'co-invest', 'private wealth', 'marketing', 'brand', 'communications'],
		hook: 'we built automated lead-capture and reporting workflows that pulled hours of manual data entry off a client’s team',
		valueAdd: 'could take the manual data entry and reporting grind off your team so LP reporting stops being a quarterly fire drill',
		screen: 'streamline LP reporting and automate their fundraising operations',
		emailSubject: 'Automating the manual work in LP reporting',
		emailHook: 'We built automated lead-capture and reporting workflows that pulled hours of manual data entry off a client’s team.'
	},
	{
		key: 'admin',
		label: 'Management / Admin',
		keywords: ['administration', 'administrative', 'admin', 'office manager', 'facilities', 'property manager', 'project manager', 'coordinator', 'intake', 'filing', 'records', 'document'],
		hook: 'we replace manual intake and filing with agents that cut errors and delays',
		valueAdd: 'can automate your admin and tracking work',
		screen: 'automate the manual intake, filing, and tracking work across their portfolio companies',
		emailSubject: 'Replacing manual intake and filing with AI agents',
		emailHook: 'We replace manual intake and filing with AI agents that cut the errors and delays out of admin work.'
	},
	{
		key: 'operations',
		label: 'Operations',
		keywords: ['operations', 'operating', 'coo', 'portfolio performance', 'portfolio', 'performance reporting', 'strategic resource', 'revenue operations'],
		hook: 'we just built a Power App that mapped and standardized 40,000 job titles in a fraction of the time and cost other vendors quoted',
		valueAdd: 'could standardize systems and data across your portco immediately after close',
		screen: 'standardize systems and data across their portfolio companies after an acquisition',
		emailSubject: 'Standardizing portfolio systems right after close',
		emailHook: 'We just built a Power App that mapped and standardized 40,000 job titles in a fraction of the time and cost other vendors quoted.'
	},
	{
		key: 'executive',
		label: 'Executive',
		keywords: ['managing director', 'vice president', 'senior vice president', 'svp', 'partner', 'principal', 'president', 'ceo', 'director', 'advisor', 'executive', 'md'],
		hook: "we took a financial firm from AI-curious to fully Copilot-ready, and we've done Microsoft work for PE firms like Gryphon Investors and Potomac Equity Partners",
		valueAdd: 'could get your portfolio capturing real, measurable value from AI instead of just paying for the hype',
		screen: 'get their portfolio companies AI-ready and capturing real value from Microsoft and Copilot',
		emailSubject: 'Getting your portfolio AI-ready (Gryphon, Potomac)',
		emailHook: "We took a financial firm from AI-curious to fully Copilot-ready, and we've done Microsoft work for PE firms like Gryphon Investors and Potomac Equity Partners."
	}
];

export const DEFAULT_CLUSTER: Cluster = {
	key: 'default',
	label: 'General',
	keywords: [],
	hook: 'we recently built a Power App that standardized 40,000 job titles in a couple hours, and consolidated another client’s SQL environment to save $350,000 a year',
	valueAdd: 'could erase the grunt work and standardize the systems your portfolio companies are still running by hand',
	screen: 'erase the grunt work and standardize the systems across their portfolio companies',
	emailSubject: 'Erasing the grunt work across your portfolio',
	emailHook: 'We recently built a Power App that standardized 40,000 job titles in a couple hours, and consolidated another client’s SQL environment to save $350,000 a year.'
};

// Map dept -> cluster key as a fallback when the title has no keyword.
const DEPT_FALLBACK: Record<string, string> = {
	it: 'it',
	finance: 'finance',
	operations: 'operations',
	executive: 'executive',
	management: 'admin'
};

function matchesKeyword(hay: string, kw: string): boolean {
	const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(hay);
}

export function clusterFor(contact: ScriptContact): Cluster {
	const hay = (contact.position ?? '').toLowerCase();
	for (const c of CLUSTERS) {
		if (c.keywords.some((k) => matchesKeyword(hay, k))) return c;
	}
	const deptKey = DEPT_FALLBACK[(contact.dept ?? '').toLowerCase()];
	if (deptKey) {
		const c = CLUSTERS.find((x) => x.key === deptKey);
		if (c) return c;
	}
	return DEFAULT_CLUSTER;
}

export function firstName(contact: ScriptContact): string {
	if (contact.first_name) return contact.first_name;
	return (contact.name ?? '').trim().split(/\s+/)[0] || 'there';
}

export function buildScript(contact: ScriptContact, rep: Rep): string {
	const c = clusterFor(contact);
	const fn = firstName(contact);
	return `Hey ${fn}, this is ${rep} with IncWorx. How are you? I'm calling because ${c.hook}. So I thought I'd reach out to see if you think it'd be worth a fifteen minute meeting talking about how you ${c.valueAdd}.`;
}

export function buildScreen(rep: Rep, contact: ScriptContact): string {
	const c = clusterFor(contact);
	return `${rep} with IncWorx. I work with PE firms to ${c.screen}.`;
}

export function buildEmail(contact: ScriptContact, rep: Rep): { subject: string; body: string } {
	const c = clusterFor(contact);
	const fn = firstName(contact);
	const firm = contact.firm ?? 'your firm';
	const body = `Hi ${fn},

${c.emailHook}

I work with PE firms on exactly this — we ${c.screen}.

Worth a quick fifteen minutes to see if it'd be a fit for ${firm}?

Best,
${rep}
IncWorx`;
	return { subject: c.emailSubject, body };
}

// Daily rotation: one group is called, the other emailed; they swap each day.
export type RotationMode = 'call' | 'email';
export function dayParity(date = new Date()): number {
	return Math.floor(date.getTime() / 86_400_000) % 2;
}
// parity 0 -> Call A / Email B ; parity 1 -> Call B / Email A. `flip` inverts.
export function rotationFor(group: 'A' | 'B', date = new Date(), flip = false): RotationMode {
	let callGroup: 'A' | 'B' = dayParity(date) === 0 ? 'A' : 'B';
	if (flip) callGroup = callGroup === 'A' ? 'B' : 'A';
	return group === callGroup ? 'call' : 'email';
}
export function callGroupFor(date = new Date(), flip = false): 'A' | 'B' {
	let g: 'A' | 'B' = dayParity(date) === 0 ? 'A' : 'B';
	return flip ? (g === 'A' ? 'B' : 'A') : g;
}

export interface Objection {
	trigger: string;
	response: string;
}

export const OBJECTIONS: Objection[] = [
	{
		trigger: 'I’m busy / bad time',
		response:
			"Totally get it — I'll be quick. The reason I called: we pull the manual grunt work out of PE portfolio companies with Microsoft and AI. Worth fifteen minutes another day, or should I try you back?"
	},
	{
		trigger: 'Just send me an email',
		response:
			"Happy to — what's the best address? Before I do, so I send something relevant and not just another pitch: are you more focused on standardizing systems across new acquisitions, or cutting back-office cost in the ones you hold?"
	},
	{
		trigger: 'We’re not interested',
		response:
			"Fair enough — most folks aren't until they see the numbers. We saved one client $350K a year just by consolidating their SQL environment. If I'm wrong and that's not interesting, I'll never call again. Worth fifteen minutes?"
	},
	{
		trigger: 'We already have a vendor / partner',
		response:
			"Makes sense, most firms your size do. We're not asking you to fire anyone — we usually come in on the projects they're too slow or too expensive to take on. A lot of our work is for about a tenth of the big-firm quote. Worth a quick look?"
	},
	{
		trigger: 'We already have AI / we’re doing AI',
		response:
			"That's great to hear — you're ahead of most. The gap we usually find isn't the AI itself, it's getting the portfolio companies' data and systems clean enough that Copilot actually works on real work. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?"
	},
	{
		trigger: 'No budget',
		response:
			"Understood — and honestly most of what we do pays for itself. The SQL consolidation I mentioned took $350K off a client's run rate. This is the kind of thing that frees up budget, not spends it. Worth fifteen minutes?"
	},
	{
		trigger: 'We handle that in-house',
		response:
			"That's usually the right call for the day-to-day. We tend to come in for the spikes — a post-close integration, a standardization push across the portfolio — so your team isn't pulled off their core work. Worth fifteen minutes to see if it fits?"
	},
	{
		trigger: 'What is this about / who are you?',
		response:
			"Fair question — this is " /* rep injected in UI */ +
			"with IncWorx. We're a Microsoft and AI consulting firm; we help PE firms standardize systems and erase manual work across their portfolio companies. I'll be brief — got fifteen minutes this week?"
	},
	{
		trigger: 'How did you get my number?',
		response:
			"Public sources — nothing sketchy, and I'll scrub you immediately if you'd rather I not call. I reached out because what we do for PE portfolios looked like a fit for you specifically. Worth fifteen minutes before you decide?"
	},
	{
		trigger: 'Call me back later',
		response:
			"Will do — when's genuinely good, mornings or afternoons? I'll put it on my calendar so you're not getting random calls."
	}
];
