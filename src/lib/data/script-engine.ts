// Dynamic cold-call script engine.
//
// Built on Connor Murray's (Cold Call Mastery) value-statement framework:
//  - OPENER: an assumptive formality, then a ~30s value statement that answers
//    WHO you are, WHY you're calling (priorities + how), and WHAT you want
//    (15 min on the calendar). Sell the MEETING, not the product. Assumptive
//    frame + downward inflection — no passive "if you're interested" language.
//  - GATEKEEPER: same assumptive frame — you belong, you're the point of
//    contact, you're not asking permission.
//  - OBJECTIONS: ARA first (Acknowledge, Reassert it makes sense to meet, Advance
//    to the meeting — double down and sell the time), then ACE if they push back
//    (Ask a sharp question, Clarify why with "the reason I ask…", Expand to build
//    credibility). Tier-2 "premise" objections (not interested / busy) get moved,
//    not handled — trade them for a real objection you can work with.
//
// Each cluster maps a contact's title/department to the priorities and proof
// points that land for that persona inside a PE firm. Proof points are real,
// anonymized client outcomes from incworx.com.

export type Rep = 'Joseph' | 'Ryan';

export interface ScriptContact {
	name: string;
	first_name?: string | null;
	position?: string | null;
	dept?: string | null;
	firm?: string | null;
}

export interface Objection {
	trigger: string;
	response: string;
}

export interface Cluster {
	key: string;
	label: string;
	keywords: string[];
	// Value-statement opener pieces:
	hook: string; // follows "I help PE firms " — the tight, benefit-led lead line
	who: string; // follows "I'm part of " — the team you sit on
	priorities: string; // follows "that works with PE firms on " — named priorities
	how: string; // a standalone sentence — how we solve it, with a proof point
	// Gatekeeper:
	screenReason: string; // follows "I'm the point of contact on our side for "
	// Email:
	emailSubject: string;
	emailHook: string; // past-tense proof sentence for the email body
	emailReason: string; // follows "We " — verb phrase for the email body
	// Role-specific objection bank (shared objections are appended automatically):
	objections: Objection[];
}

// ---------------------------------------------------------------------------
// Shared objections — appended to every cluster. These are role-agnostic:
// the Tier-2 "premise" rejections and the meta questions. {{rep}} is injected
// in the UI.
// ---------------------------------------------------------------------------
export const SHARED_OBJECTIONS: Objection[] = [
	{
		trigger: 'Not interested',
		response:
			"Totally fair — most folks aren't until they see the numbers. And just so I'm not misreading it: is that because you've already got someone on the AI and Microsoft side, or is it more that nothing's on the radar right now?"
	},
	{
		trigger: "I'm busy / bad time",
		response:
			"Totally — I'll be quick. The reason I called: I run the AI and Microsoft automation side for PE firms — we standardized 40,000 job titles for one client in a couple hours and pulled $350K out of another's annual run-rate. I'm not trying to do it all now, just looking to grab fifteen minutes next week. Is Monday or Tuesday better, or should I catch you another day?"
	},
	{
		trigger: 'Just send me an email',
		response:
			"Yeah, I can send something over. I'll say though — it still makes sense to grab fifteen minutes live, even briefly, because what's in the email usually lands but creates more questions than it answers. So how about I send it inside a calendar invite for Monday or Tuesday, we review it together, and if it's not relevant you just decline it?"
	},
	{
		trigger: 'Who are you? / What is this about? / Is this a cold call?',
		response:
			"Fair question — and no, I'm not selling you anything on this call. I'm {{rep}} with IncWorx; we're a Microsoft and AI shop that works with PE firms to standardize systems and erase the manual work across their portfolio companies. I'd just be your point of contact for it going forward — and I'm really only looking to get fifteen minutes set up next week."
	},
	{
		trigger: 'How did you get my number?',
		response:
			"Nothing sketchy — it's a public B2B database, same way most outreach works these days, and I'll scrub you in a second if you'd rather I not call. The reason I reached out specifically is that what we do for PE portfolios looked like a real fit for you. Worth fifteen minutes before you decide?"
	},
	{
		trigger: 'Do we already work with you?',
		response:
			"No — that's actually why I reached out. Looks like there's been some back-and-forth in the past but it's been pretty inconsistent, so I wanted to properly introduce myself and make sure we're on the same page going forward. Easiest is fifteen minutes next week — Monday or Tuesday?"
	}
];

// ---------------------------------------------------------------------------
// Clusters. Order matters: most specific functional clusters first, executive
// + admin last (executive is the catch-all for Partner/MD/VP/Principal).
// ---------------------------------------------------------------------------
export const CLUSTERS: Cluster[] = [
	{
		key: 'it',
		label: 'IT / Data',
		keywords: ['it', 'i.t', 'information technology', 'technology', 'cio', 'cto', 'infrastructure', 'data and ai', 'data & ai', 'technical', 'systems'],
		hook: 'cut IT run-rate and consolidate systems across their portfolio companies',
		who: 'the AI and data team at IncWorx',
		priorities:
			'consolidating systems and cutting IT run-rate across their portfolio companies — things like standardizing data, retiring duplicate tools, and getting clean reporting after an acquisition',
		how: "We just consolidated one client's SQL environment and pulled three hundred and fifty thousand dollars out of their annual run-rate — usually by getting the data and tooling cleaned up so the portfolio isn't paying for five systems that all do the same thing.",
		screenReason: "the AI and Microsoft work across the portfolio's IT and data",
		emailSubject: 'Took $350K off a client’s annual run rate',
		emailHook: "We recently consolidated a client's SQL Server environment and pulled $350,000 out of their annual run rate.",
		emailReason: 'help PE firms consolidate systems and cut IT run-rate across their portfolio companies',
		objections: [
			{
				trigger: 'We already have an MSP / IT team',
				response:
					"Got it — and that's actually why I reached out; we sit right alongside the MSP. They keep the lights on, we come in on the AI and consolidation projects they don't have the bandwidth to build. So it still makes sense to get introduced — I'd be your point of contact for exactly that. Does Monday or Tuesday work?\n\nIf they push back: When you say the MSP has it covered, does that include consolidating the duplicate systems across the portfolio? The reason I ask — that's usually where we come in. We pulled $350K out of one client's run-rate doing exactly that, and it's the kind of thing an MSP rarely touches."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"Makes sense for the day-to-day. We tend to come in on the spikes — a post-close integration, a standardization push across the portfolio — so your team isn't pulled off their core work. Worth fifteen minutes to see if it fits?\n\nIf they push back: Is the in-house team handling data standardization across new acquisitions too, or mostly keeping the existing systems running? The reason I ask is that integration work is where lean teams usually get buried — it's exactly the lift we take off their plate."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find isn't the AI itself, it's getting the portfolio's data and systems clean enough that it actually works on real work. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?\n\nIf they push back: Are the portfolio companies' systems consolidated enough that Copilot's running on clean data yet? The reason I ask is that's where most AI rollouts stall — and it's the part we specialize in."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who owns technology or value-creation across the portfolio? I'd rather start with the right name than waste anyone's time. That said, since you'd touch this day-to-day, it might still make sense to have you on a quick intro — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and honestly most of what we do pays for itself; the consolidation I mentioned took $350K off a client's run-rate. So this isn't really a spend conversation, it's getting on the same page so when it does come up we can move fast. Worth fifteen minutes?\n\nIf they push back: Is that a freeze for the year or more of a right-now thing? The reason I ask is we usually map this out ahead of time so the savings are ready to capture the moment budget opens up."
			}
		]
	},
	{
		key: 'legal',
		label: 'Legal / Compliance',
		keywords: ['counsel', 'legal', 'compliance', 'cco', 'gc', 'sustainability', 'governance'],
		hook: 'speed up diligence and contract review on their deals',
		who: 'the AI and compliance team at IncWorx',
		priorities:
			'speeding up diligence and contract review on their deals — things like first-pass contract review, surfacing risk across an agreement, and cutting the manual hours out of diligence',
		how: "We built an AI contract-review system on Microsoft Copilot that automated a firm's entire first-pass review — usually by taking the manual reading and risk-flagging off the team so diligence moves faster.",
		screenReason: 'the AI and contract-review work on the deal side',
		emailSubject: 'AI-assisted contract review for your deals',
		emailHook: 'We built an AI contract-review system on Microsoft Copilot that automated a firm’s entire first-pass review.',
		emailReason: 'help PE firms speed up diligence and contract review on their deals',
		objections: [
			{
				trigger: 'We use outside counsel for that',
				response:
					"Of course — and we're not replacing counsel. We sit underneath them on the manual side: first-pass review, flagging risk across an agreement, cutting the diligence hours — so counsel spends their time on judgment, not reading. Worth fifteen minutes to get introduced? Monday or Tuesday?\n\nIf they push back: On a typical deal, how much of first-pass review and diligence is still done by hand today? The reason I ask is we built an AI contract-review system on Copilot that automated a firm's entire first pass — that's usually the slow, expensive part."
			},
			{
				trigger: 'We handle compliance in-house',
				response:
					"Right call for the day-to-day. We come in on the spikes — a wave of diligence on a new deal, a compliance push across the portfolio — so your team isn't drowning in documents. Worth fifteen minutes?\n\nIf they push back: Is the in-house team reviewing contracts across the portfolio companies too, or mainly fund-level? The reason I ask is that volume is exactly where AI review earns its keep, and it's what we automate."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find is trust: getting the AI accurate enough on real contracts and clean enough data that the team actually relies on it. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?\n\nIf they push back: Is the AI accurate enough on first-pass review that the team trusts it on live deals yet? The reason I ask is that's where most legal AI stalls — and it's the part we get over the line."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — is that the GC, or whoever owns diligence and compliance across the portfolio? I'd rather start with the right name. Since you'd be close to this, a quick intro with you might still be the fastest way to point it the right direction — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and this isn't really a spend conversation; it's getting aligned so when a deal heats up and diligence piles on, we can move fast. Worth fifteen minutes to be on the radar?\n\nIf they push back: Is that tied to deal flow being quiet right now, or more of a budget freeze? The reason I ask is we usually get introduced before the crunch so we're ready the moment diligence ramps."
			}
		]
	},
	{
		key: 'hr',
		label: 'HR / People',
		keywords: ['people', 'human resources', 'hr', 'talent', 'workforce enablement', 'chief people'],
		hook: 'clean up HR data and automate people-ops after every acquisition',
		who: 'the people-systems team at IncWorx',
		priorities:
			'standardizing HR data and automating people-ops across their portfolio companies — things like mapping and cleaning up job titles, onboarding and provisioning, and taking the manual work off the team after every acquisition',
		how: "We built a Power App that mapped and standardized 40,000 job titles in a couple hours, plus an automated goal-tracking system for another client's workforce — usually by cleaning up people data and automating the manual ops after a deal closes.",
		screenReason: 'the people-systems and HR-data work across the portfolio',
		emailSubject: 'Standardizing 40,000 job titles in a couple hours',
		emailHook: 'We built a Power App that mapped and standardized 40,000 job titles in a couple hours, plus an automated goal-tracking system for another client’s workforce.',
		emailReason: 'help PE firms standardize HR data and automate people-ops across their portfolio companies',
		objections: [
			{
				trigger: 'We already have an HRIS / a PEO',
				response:
					"Got it — and we work right alongside the HRIS. We're not replacing it; we come in on the data and the manual people-ops it doesn't touch — cleaning up job titles, onboarding, provisioning — especially after an acquisition. Worth fifteen minutes to get introduced? Monday or Tuesday?\n\nIf they push back: When a new company joins the portfolio, who's standardizing the people data and titles across it today? The reason I ask is we built a Power App that mapped 40,000 job titles in a couple hours — that's usually a painful manual lift the HRIS leaves on the team."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"Makes sense for the day-to-day. We come in on the spikes — a post-close people-data cleanup, an onboarding wave across the portfolio — so HR isn't buried in spreadsheets. Worth fifteen minutes?\n\nIf they push back: Is the team standardizing people data across all the portfolio companies in-house, or just the fund? The reason I ask is that cross-portfolio cleanup is where lean HR teams get stretched, and it's exactly what we automate."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find is the data underneath it: AI on people-ops only works once the titles and records are actually clean and standardized. That's the part we did with the 40,000-title Power App. Worth fifteen minutes to compare notes?\n\nIf they push back: Is the people data standardized enough across the portfolio that AI's giving you something reliable yet? The reason I ask is that foundation is where most of these stall — and it's where we come in."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who owns people operations or HR systems across the portfolio? I'd rather start with the right name. Since you'd be close to the day-to-day, a quick intro with you might still be the fastest path — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and most of what we do here saves hours rather than costs them. So this isn't a spend conversation, it's being on the same page so the next time an add-on closes we can jump in. Worth fifteen minutes?\n\nIf they push back: Is that a freeze, or more that there's no acquisition in flight right now? The reason I ask is the people-data cleanup is most valuable right at close, so we like to be ready before the next one."
			}
		]
	},
	{
		key: 'finance',
		label: 'Finance',
		keywords: ['finance', 'cfo', 'chief financial', 'controller', 'accounting', 'tax', 'treasur', 'capital markets'],
		hook: 'get leadership real-time numbers and automate the back-office close',
		who: 'the finance-automation team at IncWorx',
		priorities:
			'tightening reporting and automating back-office work across their portfolio companies — things like invoice processing, month-end close, and getting leadership real-time numbers',
		how: "We just automated a client's invoice processing and built Power BI dashboards that give their leadership real-time numbers — usually by taking the manual close and reporting work off the team so they're not waiting on month-end.",
		screenReason: 'the finance-automation work across the portfolio companies',
		emailSubject: 'Real-time numbers without waiting on month-end',
		emailHook: 'We just automated invoice processing and built Power BI dashboards that give leadership real-time numbers.',
		emailReason: 'help PE firms automate financial reporting and back-office work across their portfolio companies',
		objections: [
			{
				trigger: 'We already have an ERP / a finance vendor',
				response:
					"Got it — and that's actually why I reached out; we work alongside whatever ERP you've got. We're not replacing it, we come in on the automation and reporting layer on top — invoice processing, month-end, real-time dashboards. Still makes sense to get introduced. Monday or Tuesday?\n\nIf they push back: Does the current setup give leadership real-time numbers, or is it still waiting on month-end close? The reason I ask is that's usually where we come in — we automated one client's close and reporting so leadership stopped waiting on the team."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"Right call for the day-to-day. We come in on the spikes — a close cycle that keeps slipping, reporting that's all manual across the holdings — so finance isn't buried in spreadsheets. Worth fifteen minutes?\n\nIf they push back: Is the team handling reporting across all the portfolio companies in-house, or mainly the fund? The reason I ask is consolidating that reporting is where lean finance teams usually get stretched."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find isn't the AI, it's getting the financial data clean and consolidated enough that it produces something leadership can trust. That's the foundation we build. Worth fifteen minutes to compare notes?\n\nIf they push back: Is the data consolidated enough across the holdings that AI's giving you reliable numbers yet? The reason I ask is that's where most finance AI stalls — and it's the part we specialize in."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — is that the CFO, or whoever owns finance systems across the portfolio? I'd rather start with the right name. Since you'd touch the reporting day-to-day, a quick intro with you might still be the fastest path — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and honestly most of what we do pays for itself; one consolidation took $350K off a client's run-rate. So this frees up budget rather than spends it. Worth fifteen minutes?\n\nIf they push back: Is that a freeze through the close and audit period, or longer-term? The reason I ask is we usually get ahead of those cycles so you're not scrambling, and the savings are teed up when budget opens."
			}
		]
	},
	{
		key: 'ir',
		label: 'Investor Relations',
		keywords: ['investor relations', 'investor', 'ir', 'fundraising', 'co-invest', 'private wealth', 'marketing', 'brand', 'communications'],
		hook: 'automate LP reporting and take the manual grind out of fundraising ops',
		who: 'the investor-operations team at IncWorx',
		priorities:
			'taking the manual grind out of LP reporting and fundraising operations — things like automating data entry, standardizing reporting, and pulling fund and deal data together in one place',
		how: "We built automated lead-capture and reporting workflows that pulled hours of manual data entry off a client's team — usually by getting fund and LP data into one place so reporting stops being a quarterly fire drill.",
		screenReason: 'the reporting and automation work on the investor-relations side',
		emailSubject: 'Automating the manual work in LP reporting',
		emailHook: 'We built automated lead-capture and reporting workflows that pulled hours of manual data entry off a client’s team.',
		emailReason: 'help PE firms streamline LP reporting and automate their fundraising operations',
		objections: [
			{
				trigger: 'We have an IR team / fund admin for that',
				response:
					"Totally — and that's who we work alongside. We're not replacing IR or the fund admin; we take the manual data-entry and reporting grind off them so LP reporting stops being a quarterly fire drill. Worth fifteen minutes to get introduced? Monday or Tuesday?\n\nIf they push back: Is LP reporting and the data pull mostly manual today, or is it automated? The reason I ask is that's exactly what we automate — we pulled hours of manual data entry off one client's team."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"Makes sense for the day-to-day. We come in on the spikes — a fundraise, a quarter-end reporting crunch — so the team isn't re-keying data under deadline. Worth fifteen minutes?\n\nIf they push back: When a fundraise or quarter-end hits, how much of the reporting is still assembled by hand? The reason I ask is that crunch is exactly where we take the manual work off the team."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find is the data plumbing underneath it: AI on LP reporting only works once fund and deal data live in one clean place. That's the part we build. Worth fifteen minutes to compare notes?\n\nIf they push back: Is the fund and LP data consolidated enough that AI's producing something you'd send to an LP yet? The reason I ask is that foundation is where most of these stall."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who owns IR operations or reporting systems? I'd rather start with the right name. Since you're close to the reporting, a quick intro with you might still be the fastest path — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and most of what we do here gives the team hours back rather than costs them. So this isn't a spend conversation, it's being aligned before the next fundraise or quarter-end. Worth fifteen minutes?\n\nIf they push back: Is that tied to no raise being active right now, or a budget freeze? The reason I ask is we like to get the reporting automated before the crunch, not during it."
			}
		]
	},
	{
		key: 'admin',
		label: 'Management / Admin',
		keywords: ['administration', 'administrative', 'admin', 'office manager', 'facilities', 'property manager', 'project manager', 'coordinator', 'intake', 'filing', 'records', 'document'],
		hook: 'automate the manual intake, filing, and tracking work across their portfolio companies',
		who: 'the automation team at IncWorx',
		priorities:
			'automating the manual intake, filing, and tracking work across their portfolio companies — things like document handling, status tracking, and the repetitive admin that eats up the day',
		how: 'We replace manual intake and filing with AI agents that cut the errors and delays out of admin work — usually by automating the repetitive tracking so the team can focus on the work that matters.',
		screenReason: 'the automation work across the portfolio companies',
		emailSubject: 'Replacing manual intake and filing with AI agents',
		emailHook: 'We replace manual intake and filing with AI agents that cut the errors and delays out of admin work.',
		emailReason: 'help PE firms automate the manual intake, filing, and tracking work across their portfolio companies',
		objections: [
			{
				trigger: 'We handle that in-house',
				response:
					"Makes sense for the day-to-day. We come in on the repetitive, high-volume stuff — intake, filing, status tracking — so your team isn't doing it by hand. Worth fifteen minutes?\n\nIf they push back: How much of the intake and tracking is still manual today? The reason I ask is that's exactly the work our AI agents take off the team."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find is the last mile: getting the agents reliable enough on real intake and filing that the team actually trusts them. Worth fifteen minutes to compare notes?\n\nIf they push back: Are the agents handling real intake end-to-end yet, or still assisting? The reason I ask is getting them production-ready is the part we specialize in."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who owns operations or the admin systems here? I'd rather start with the right name. Since you'd be close to the day-to-day, a quick intro with you might still help point it the right direction — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and most of what we do here saves hours rather than costs them. So it's being on the same page for when it does come up. Worth fifteen minutes?\n\nIf they push back: Is that a freeze, or just nothing on the radar right now? The reason I ask is the intake automation tends to pay for itself fast once it's in."
			}
		]
	},
	{
		key: 'operations',
		label: 'Operations',
		keywords: ['operations', 'operating', 'coo', 'portfolio performance', 'portfolio', 'performance reporting', 'strategic resource', 'revenue operations'],
		hook: 'standardize systems and data across the portfolio right after a deal closes',
		who: 'the portfolio-operations team at IncWorx',
		priorities:
			'standardizing systems and data across their portfolio companies right after close — things like consolidating tooling, cleaning up operational and workforce data, and cutting the manual work out of integration',
		how: "We just built a Power App that mapped and standardized 40,000 job titles in a couple hours — a fraction of the time and cost other vendors quoted — usually by getting systems and data lined up across the portfolio right after a deal closes.",
		screenReason: 'the systems and data work across the portfolio companies',
		emailSubject: 'Standardizing portfolio systems right after close',
		emailHook: 'We just built a Power App that mapped and standardized 40,000 job titles in a fraction of the time and cost other vendors quoted.',
		emailReason: 'help PE firms standardize systems and data across their portfolio companies after an acquisition',
		objections: [
			{
				trigger: 'We have a portfolio-ops team for that',
				response:
					"That's exactly who we work alongside — we're not replacing portfolio ops. We're the team that handles the systems-and-data heavy lifting after a deal closes so your ops folks aren't doing it by hand. Worth fifteen minutes to get introduced? Monday or Tuesday?\n\nIf they push back: When a new platform or add-on closes, who's standardizing systems and data across it today? The reason I ask is that's the grunt work we erase — we mapped 40,000 job titles for one client in a couple hours."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"Right call for the steady state. We come in on the spikes — a post-close integration, a standardization push across the portfolio — so your team isn't pulled off value creation. Worth fifteen minutes?\n\nIf they push back: Is the team handling integration across every new acquisition in-house, or does it stretch them? The reason I ask is that integration crunch is exactly where we plug in."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great — you're ahead of most. The gap we usually find is that AI only delivers once the portfolio's systems and data are actually standardized. That's the foundation we build. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?\n\nIf they push back: Are the portfolio companies standardized enough that AI's working across them, or still company-by-company? The reason I ask is that's where most rollouts stall — and it's where we come in."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who owns value-creation or operations across the portfolio? I'd rather start with the right name. Since you're close to the operating side, a quick intro with you might still be the fastest path — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and this isn't really a spend conversation; it's getting aligned so the next time a deal closes we can move fast on the integration. Worth fifteen minutes to be on the radar?\n\nIf they push back: Is that because nothing's closing right now, or a budget freeze? The reason I ask is the standardization work is most valuable right at close, so we like to be ready before the next one."
			}
		]
	},
	{
		key: 'executive',
		label: 'Executive',
		keywords: ['managing director', 'vice president', 'senior vice president', 'svp', 'partner', 'principal', 'president', 'ceo', 'director', 'advisor', 'executive', 'md'],
		hook: 'get real, measurable value out of AI across their portfolio',
		who: 'the AI and Microsoft team at IncWorx',
		priorities:
			'getting real, measurable value out of AI across their portfolio — things like getting the portfolio companies’ data and systems clean enough that Copilot actually works on real work',
		how: "We took a financial firm from AI-curious to fully Copilot-ready, and we're the shop Gryphon Investors and Potomac Equity Partners already use for this — usually by getting the portfolio's data and systems clean enough that AI actually pays off.",
		screenReason: 'the AI and Microsoft work across the portfolio',
		emailSubject: 'Getting your portfolio AI-ready (Gryphon, Potomac)',
		emailHook: "We took a financial firm from AI-curious to fully Copilot-ready, and we've done Microsoft work for PE firms like Gryphon Investors and Potomac Equity Partners.",
		emailReason: 'help PE firms get their portfolio capturing real, measurable value from AI',
		objections: [
			{
				trigger: 'We already have a vendor / partner for this',
				response:
					"Makes sense, most firms your size do — and we're not asking you to fire anyone. We usually come in on the projects they're too slow or too expensive to take on, often for about a tenth of the big-firm quote. We're already the shop Gryphon and Potomac use. Worth a quick look?\n\nIf they push back: Is the current partner actually getting the portfolio's data clean enough that AI pays off, or mostly keeping things running? The reason I ask is that's the gap we fill — we took a financial firm from AI-curious to fully Copilot-ready."
			},
			{
				trigger: 'We handle that in-house',
				response:
					"That's usually the right call for the core stuff. We come in on the big pushes — a portfolio-wide AI rollout, a post-close standardization — so your team isn't stretched. We've done exactly this for Gryphon and Potomac. Worth fifteen minutes?\n\nIf they push back: Does the in-house team have the bandwidth to get every portfolio company AI-ready, or just the priorities? The reason I ask is that scale is where we usually plug in."
			},
			{
				trigger: "We're already doing AI",
				response:
					"That's great to hear — you're ahead of most. The gap we usually find isn't the AI itself, it's getting the portfolio companies' data and systems clean enough that Copilot actually works on real work. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?\n\nIf they push back: Are the portfolio companies actually capturing measurable value from it yet, or is it still early? The reason I ask is bridging that gap from pilot to real ROI is exactly what we do."
			},
			{
				trigger: "I'm not the right person",
				response:
					"Fair — who runs value-creation or technology across the portfolio? I'd rather start with the right name. Honestly though, since this is a portfolio-level play, a quick intro with you might be the fastest way to point it the right direction — Monday or Tuesday?"
			},
			{
				trigger: 'No budget / not a priority right now',
				response:
					"Understood — and honestly most of what we do pays for itself; one consolidation took $350K off a client's run-rate. So this frees up budget rather than spends it. Worth fifteen minutes to be on the radar?\n\nIf they push back: Is that a freeze for the year, or just nothing in flight right now? The reason I ask is we like to be aligned before the next deal so the value's ready to capture when it closes."
			}
		]
	}
];

export const DEFAULT_CLUSTER: Cluster = {
	key: 'default',
	label: 'General',
	keywords: [],
	hook: 'erase the manual grunt work and standardize the systems their portfolio companies still run by hand',
	who: 'the AI and Microsoft automation team at IncWorx',
	priorities:
		'erasing the manual grunt work and standardizing the systems their portfolio companies still run by hand',
	how: "We just standardized 40,000 job titles for one client in a couple hours, and pulled three hundred and fifty thousand dollars out of another client's run-rate on a systems consolidation — usually the kind of grunt work AI just erases.",
	screenReason: 'the AI and Microsoft automation work across the portfolio',
	emailSubject: 'Erasing the grunt work across your portfolio',
	emailHook: 'We recently built a Power App that standardized 40,000 job titles in a couple hours, and consolidated another client’s SQL environment to save $350,000 a year.',
	emailReason: 'help PE firms erase the grunt work and standardize the systems across their portfolio companies',
	objections: [
		{
			trigger: 'We already have a vendor / partner for this',
			response:
				"Makes sense, most firms your size do — and we're not asking you to fire anyone. We usually come in on the projects they're too slow or too expensive to take on, often for about a tenth of the big-firm quote. We're already the shop Gryphon and Potomac use. Worth a quick look?\n\nIf they push back: Is the current partner actually moving on the manual, cross-portfolio work, or mostly keeping things running? The reason I ask is that's the gap we fill — we pulled $350K out of one client's run-rate doing exactly that."
		},
		{
			trigger: 'We handle that in-house',
			response:
				"That's usually right for the day-to-day. We come in on the spikes — a post-close integration, a standardization push across the portfolio — so your team isn't pulled off their core work. Worth fifteen minutes?\n\nIf they push back: Is the team handling the cross-portfolio standardization in-house, or does it stretch them? The reason I ask is that's exactly the lift we take off lean teams."
		},
		{
			trigger: "We're already doing AI",
			response:
				"That's great — you're ahead of most. The gap we usually find isn't the AI itself, it's getting the portfolio's data and systems clean enough that it works on real work. We took a financial firm from AI-curious to fully Copilot-ready. Worth fifteen minutes to compare notes?\n\nIf they push back: Are the portfolio companies actually capturing measurable value yet, or is it still early? The reason I ask is bridging that gap is exactly what we do."
		},
		{
			trigger: "I'm not the right person",
			response:
				"Fair — who owns technology or value-creation across the portfolio? I'd rather start with the right name than waste anyone's time. A quick intro with you might still be the fastest way to point it the right direction — Monday or Tuesday?"
		},
		{
			trigger: 'No budget / not a priority right now',
			response:
				"Understood — and most of what we do pays for itself; one consolidation took $350K off a client's run-rate. So this frees up budget rather than spends it. Worth fifteen minutes?\n\nIf they push back: Is that a freeze for the year, or just nothing in flight right now? The reason I ask is we like to be aligned before the next deal so the value's ready to capture."
		}
	]
};

// Back-compat: the flat objection bank (default role + shared). The UI now
// pulls role-specific objections via objectionsFor(); this remains for any
// caller that wants a generic set.
export const OBJECTIONS: Objection[] = [...DEFAULT_CLUSTER.objections, ...SHARED_OBJECTIONS];

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

// Role-specific objection bank for a contact: the cluster's own objections
// first, then the shared Tier-2 / meta objections. {{rep}} tokens are injected
// by the caller.
export function objectionsFor(contact: ScriptContact): Objection[] {
	return [...clusterFor(contact).objections, ...SHARED_OBJECTIONS];
}

// OPENER — value-statement framework. Assumptive formality, then WHO / WHY / WHAT,
// closing on the meeting with an assumptive two-option ask. Sell the meeting.
export function buildScript(contact: ScriptContact, rep: Rep): string {
	const c = clusterFor(contact);
	const fn = firstName(contact);
	return `Hey ${fn}, this is ${rep} with IncWorx. How are you?

Good — yeah, the reason I'm calling is I help PE firms ${c.hook}. ${c.how} So I know that's high level, but I'd be your point of contact here for anything in these areas going forward.

I caught you a bit out of the blue, so I'm not looking to get into all of it right now. I was more looking to grab fifteen minutes next week with you and our president Jonathan, just to introduce the team and get priorities aligned going forward. Do you have time Monday or Tuesday for a fifteen minute sync?`;
}

// GATEKEEPER — one standardized, generic ask for every contact. Stay broad with
// the gatekeeper: you belong, you're the point of contact, you're not pitching.
export function buildScreen(rep: Rep, contact: ScriptContact): string {
	const fn = firstName(contact);
	return `Hey, it's ${rep} with IncWorx. I'm the PoC on our side for the systems and data work across the portco, and I just need to introduce myself and get a quick fifteen minutes set up. Put me through to ${fn}?`;
}

export function buildEmail(contact: ScriptContact, rep: Rep): { subject: string; body: string } {
	const c = clusterFor(contact);
	const fn = firstName(contact);
	const firm = contact.firm ?? 'your firm';
	const body = `Hi ${fn},

I help PE firms ${c.hook} — and I'd be your point of contact for it going forward.

${c.emailHook}

Not looking to get into it over email — worth fifteen minutes next week with me and our president Jonathan to introduce the team? I can do Monday or Tuesday, whatever's easier for ${firm}.

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
