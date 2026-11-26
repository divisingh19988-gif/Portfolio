// Exact copy for the unlisted /bettercontact pitch. Do not add Oxford commas.

export const CAL_URL = "https://cal.com/digvijay-rathore-84nil7/15min";

export const HERO = {
  eyebrow: "Built for Roman Hipp · BetterContact",
  headline: "Roman, which project first and how I'd build it. Answered before we've even talked.",
  subheadline:
    "You took BetterContact to multi-seven figures with three people and a phone. I'm Digvijay, a GTM engineer in Berlin. I'd build the automation layer that keeps it growing without you building every list.",
  primaryCta: { label: "Let's meet for a coffee →", href: CAL_URL },
  secondaryCta: { label: "See the build plan ↓", anchor: "#build" },
};

export const HEARD_FROM_ROMAN = [
  {
    said: "“$1.02M ARR churn” in 2024 because the product had no stickiness",
    where: "Your 7-fails post",
    build: "A PLG layer that spots the drop weeks before the cancel button.",
  },
  {
    said: "31% of provider mobiles got disqualified across 31M enrichments",
    where: "Your Bangkok talk recap",
    build: "Onboarding that shows each signup exactly how much bad data you saved them from.",
  },
  {
    said: "Go-to-market was “just me” until Ben and Shahin joined",
    where: "Your GTM World Tour post",
    build: "Automation and one dashboard so the next stage doesn't run on your memory.",
  },
  {
    said: "Allbound: content + engagement tracking + targeted outbound",
    where: "Your podcast with Daniel Tyoschitz",
    build: "Signals that route to the right channel instead of firing at everyone.",
  },
];

export const PROJECTS_LEAD =
  "Honestly I would want to build all five. But I would not start building on day one. The first week goes to finding out where BetterContact's next big win is and that sets the order.";

type Project = {
  key: string;
  label: string;
  pick?: string;
  leak: string;
  build: string;
  stack: string;
  metric: string;
};

export const PROJECTS: Project[] = [
  {
    key: "signal",
    label: "Signal Machine",
    pick: "Top pick #1",
    leak: "Signals fire at everyone. Clay credits burn on non-ICP domains and the same buyer gets hit twice.",
    build:
      "Start with 2–3 high-intent signals. Gate against HubSpot and PLG at zero cost in n8n, let a custom Signal Triage Grok Bot score ICP fit before a single Clay credit burns, enrich winners through your own waterfall + Connect Intelligence API, approve in Slack and kill any signal that doesn't book.",
    stack:
      "Apify · RB2B/Syft · n8n · Signal Triage Bot (Grok Bot) · Clay · BetterContact Connect Intelligence API · Smartlead/Instantly · Supabase",
    metric: "Meetings booked per signal and Clay credit cost per qualified account",
  },
  {
    key: "plg",
    label: "PLG Onboarding",
    pick: "Top pick #2",
    leak: "A 20-seat agency and a solo rep get the same first-name drip while day-two drop-offs go unseen.",
    build:
      "Enrich every signup in under 5 seconds via your API, track real product events in PostHog and let a custom PLG Concierge Grok Bot route big agencies to Slack with full stack context while firing behavioural nudges that exit the second they convert.",
    stack:
      "BetterContact Webhooks · PostHog · n8n · BetterContact API · PLG Concierge Bot (Grok Bot) · HubSpot · Slack",
    metric: "Time to first enrichment, day-2 wall recovery and free to paid",
  },
  {
    key: "allbound",
    label: "Allbound Overhaul",
    leak: "Intake, enrichment and copy are tangled in one Clay build, so one edit re-runs credits and inbound collides with outbound.",
    build:
      "Split Clay into modular Intake, Scoring, Enrichment and Copy tables, put one n8n HubSpot suppression gate in front, wire RB2B/Syft warm visitors and run every top sequence through a Copy & QA Grok Bot trained on your tone.",
    stack:
      "Modular Clay · RB2B/Syft · n8n Suppression Gate · Copy & QA Bot (Grok Bot) · HubSpot · Smartlead/Instantly · MillionVerifier",
    metric: "Clay credits saved per 1,000 leads, bounce under 0.5% and reply-rate lift",
  },
  {
    key: "nurture",
    label: "Nurture & Win-Back",
    leak: "You wrote it yourself: $1.02M ARR churned in 2024 because the product had no stickiness yet.",
    build:
      "Track rolling 14-day enrichment velocity and unused credits in PostHog and Supabase. A custom Churn Watchdog Grok Bot alerts Slack on 50%+ drops two weeks before renewal and triggers win-back when dormant users change jobs or hire SDRs.",
    stack:
      "BetterContact Usage API · PostHog · n8n · Churn Watchdog Bot (Grok Bot) · Clay (job changes) · HubSpot · Slack",
    metric: "At-risk MRR saved pre-renewal and dormant reactivation rate",
  },
  {
    key: "dashboard",
    label: "One GTM Dashboard",
    leak: "Six tabs and a founder's memory.",
    build:
      "Sync BetterContact usage, HubSpot pipeline, Smartlead/Instantly replies, PostHog activation and Clay credit burn into Supabase nightly. Surface one founder view plus a Monday GTM Brief Grok Bot posting a 5-line Slack summary every Monday at 8am.",
    stack:
      "Supabase · n8n Incremental Sync · PostHog · HubSpot · BetterContact API · Monday GTM Brief Bot (Grok Bot) · Slack",
    metric: "Zero manual tab-checking before the Monday GTM review",
  },
];

export const LIVE_WORKFLOWS = {
  signal: {
    steps: [
      "Apify + RB2B/Syft: 2–3 signals",
      "n8n: $0 HubSpot + PLG dedupe",
      "Grok Bot: ICP score before credits",
      "Clay + your waterfall & Connect Intelligence",
      "Slack 1-click approval → Smartlead",
      "Supabase: attribution + kill-switch",
    ],
    pills: [
      {
        label: "SDR hiring",
        preview:
          "A B2B team opens 2+ SDR roles mentioning cold calling. n8n checks HubSpot at zero cost, Signal Triage Bot confirms ICP fit first, then Clay enriches the hiring manager via your waterfall and queues a 3-line draft in Slack.",
      },
      {
        label: "Community pain",
        preview:
          "A sales leader posts about dead mobiles or bounce spikes. Signal Triage Bot separates real pain from vendor noise before enrichment and drafts a human reply offering to rerun 50 of their failed contacts.",
      },
      {
        label: "Funding / VP Sales",
        preview:
          "A Seed to Series B raise or a new VP Sales. Pre-filter for phone-first B2B, score mobile reachability with your Connect Intelligence API and check after 3 weeks if it outperforms hiring signals.",
      },
    ],
  },
  plg: {
    steps: [
      "Signup + PostHog product events",
      "n8n: <5s enrich via your API",
      "PLG Concierge Bot: score + Slack route",
      "HubSpot: behavioural nudge + hard exit",
      "Churn Watchdog Bot: pre-churn + win-back",
    ],
    pills: [
      {
        label: "Agency · 72%",
        preview:
          "Uploads 500+ rows or connects Clay in the first 48 hours. PLG Concierge Bot skips the basic drip, sends a Clay waterfall recipe with their own match rate and pings Slack for a human check-in.",
      },
      {
        label: "Phone-first sales team",
        preview:
          "A multi-seat domain runs its first phone enrichment. Show how many Connect Intelligence verified mobiles they unlocked then offer a 2-minute HubSpot sync walkthrough.",
      },
      {
        label: "Solo user",
        preview:
          "Signed up but no upload in 24 hours. PostHog flags the stall and triggers one plain-text nudge with a 30-second first-list path — killed the second they upload.",
      },
    ],
  },
};

export const GROK_BOT_FLEET = {
  eyebrow: "Unfair advantage",
  headline: "Custom Grok Bots I'd spin up for BetterContact",
  lead: "I already run this multi-agent Grok Bot architecture every day (Signal Prospector, Hiring Signals, Outbound Prospecting, Writing Bot). Here are the five dedicated bots I'd wire into your stack with a human approving every send.",
  footnote: "My Hiring Signals and Job Pipeline bots are literally how I found this role and built this page today.",
  agents: [
    {
      name: "Signal Triage Bot",
      does: "Reads Apify, RB2B/Syft and Reddit/LinkedIn pain, kills vendor noise and scores ICP fit before a single Clay credit burns.",
      plugs: "Apify · RB2B/Syft · n8n · Clay · Slack",
    },
    {
      name: "PLG Concierge Bot",
      does: "Watches signup webhooks and PostHog events, routes 20-seat agencies to Slack with stack context and catches day-2 drop-offs.",
      plugs: "BetterContact API · PostHog · HubSpot · Slack",
    },
    {
      name: "Churn Watchdog Bot",
      does: "Monitors rolling 14-day enrichment velocity, flags 50%+ drops two weeks before renewal and re-triggers dormant users on job changes.",
      plugs: "BetterContact Usage API · Supabase · Clay · HubSpot",
    },
    {
      name: "Copy & QA Bot",
      does: "Writes plain operator English across cold outbound, PLG nudges and win-back inside approved product-claim guardrails.",
      plugs: "HubSpot · Smartlead/Instantly · Slack approval",
    },
    {
      name: "Monday GTM Brief Bot",
      does: "Pulls Supabase, HubSpot, Smartlead and Clay credit burn into one 5-line Monday Slack brief for Roman, Ben and Shahin.",
      plugs: "Supabase · HubSpot · PostHog · Slack",
    },
  ],
};

export const PROOF_STATS = [
  { v: "18,000+", l: "verified ICP leads" },
  { v: "~400/day", l: "warmed Smartlead emails" },
  { v: "7%+", l: "positive reply rate" },
  { v: "0.2%", l: "bounce rate" },
  { v: "<0.1%", l: "spam rate" },
];

export const BONUS_AUDIT = {
  date: "26 Nov 2026",
  cards: [
    { k: "What's strong", t: "2.3s mobile LCP, clean schema and AI bots let in." },
    { k: "Biggest gap", t: "Competitors own the comparison queries. FullEnrich's own guide ranks BetterContact #5." },
    { k: "Quick wins", t: "Trim the 240-line llms.txt (63 KB), fix the /llms-full.txt 404 and put the category phrase in the H1." },
  ],
};

export const SEO_TEAM = {
  eyebrow: "SEO & GEO System",
  headline: "My 7-agent SEO/GEO team",
  cta: { label: "Understand more about this →", href: CAL_URL },
  lead: "Built to run the full organic and AI visibility cycle behind the audit above — from tracking citations to shipping comparison pages and outreach.",
  stages: [
    {
      name: "Citation Tracking",
      does: "Tracks how often BetterContact gets cited across ChatGPT, Perplexity, Gemini and Google AI on fixed buyer prompts.",
      plugs: "Prompt baseline · AI engines · Monthly delta",
    },
    {
      name: "Gap & Audit",
      does: "Audits crawlability, schema, llms.txt and third-party comparison pages to surface where competitors outrank you.",
      plugs: "Search Console · DataForSEO · Technical checks",
    },
    {
      name: "GEO Assets",
      does: "Turns raw product benchmarks and buyer prompts into citable comparison pages, verdict tables and fresh guides.",
      plugs: "CMS · Comparison hubs · Benchmark studies",
    },
    {
      name: "Citation Outreach",
      does: "Targets authors of high-ranking waterfall lists and peer communities so third-party mentions move in lockstep.",
      plugs: "Third-party listicles · G2 · Communities",
    },
  ],
};

export const QUESTIONS = [
  "Which segment wins this quarter: agencies or phone-first sales teams?",
  "Where is the biggest drop today: signup to first enrichment or activation to paid?",
  "Which signals and Clay tables are live now and which should I not touch?",
  "Can I get read access to product events and HubSpot in week one?",
  "Where should Connect Intelligence show up in onboarding and win-back?",
  "What does a clear win look like at 30, 60 and 90 days?",
];

export const CLOSING_CTA = {
  eyebrow: "Roman, one last thing",
  headline: "Let's meet for a coffee?",
  body: "You opened the GTM World Tour in Berlin and I'm in Berlin too. Coffee is on me whenever you're back in town. Can't wait that long? Grab 15 minutes and I'll walk you through the Signal Machine live.",
  button: { label: "Let's meet for a coffee →", href: CAL_URL },
};

export const FLOW_MODES = [
  { key: "signal" as const, label: "Signal Machine flow" },
  { key: "plg" as const, label: "PLG layer · half the job" },
];
