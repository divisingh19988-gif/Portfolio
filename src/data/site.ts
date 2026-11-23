export const site = {
  name: "Digvijay Rathore",
  role: "AI-native GTM Engineer",
  place: "Berlin",
  line: "Outbound, enrichment, and Claude workflows",
  email: "digvijay.rathore.de@gmail.com",
  mailto:
    "mailto:digvijay.rathore.de@gmail.com?subject=Loved%20your%20portfolio&body=Hey%20Digvijay%2C%20Loved%20your%20portfolio%2C%20let%27s%20get%20in%20touch.",
  linkedin: "https://www.linkedin.com/in/digvijay-udawat/",
  github: "https://github.com/divisingh19988-gif",
  cal: "https://cal.com/digvijay-rathore-84nil7/15min",
  getmow: "https://www.getmow.ai/",
  cv: "/cv/Digvijay_Rathore_CV_GTM_Engineer.pdf",
  description:
    "I'm Digvijay Rathore, an AI-native GTM engineer in Berlin. I build the pipeline: sourcing, enrichment, sequencing, and the agents that run it.",
};

// Music button on the home page. Set to false to switch it off everywhere
// (the Spotify paragraph in the privacy policy follows this flag).
export const musicEnabled: boolean = true;

export const nav = [
  { id: "introduce", n: "01", label: "Introduce" },
  { id: "skills", n: "02", label: "Skills" },
  { id: "works", n: "03", label: "Works" },
  { id: "playbooks", n: "04", label: "Playbooks" },
  { id: "certifications", n: "05", label: "Certifications" },
  { id: "contact", n: "06", label: "Contact" },
];

export const playbooks: { title: string; hook: string; image: string; width: number; height: number; pos?: string }[] = [
  {
    title: "The math behind GTM",
    hook: "20,000 emails + 100,000 impressions = 7 clients.",
    image: "/playbooks/gtm-math.webp",
    width: 1038,
    height: 1188,
  },
  {
    title: "Creator-led SaaS",
    hook: "Four ways a SaaS grows when the creator is the channel.",
    image: "/playbooks/creator-led-saas.webp",
    width: 1040,
    height: 1148,
  },
  {
    title: "Viral LinkedIn posts",
    hook: "First make them curious. Then bring the value.",
    image: "/playbooks/linkedin-psychology.webp",
    width: 1058,
    height: 1146,
  },
  {
    title: "CITE, in the wild",
    hook: "My CITE framework, reshared by AI For Search to 1.7M followers.",
    image: "/playbooks/cite-framework-post.webp",
    width: 746,
    height: 1434,
  },
  {
    title: "AI search converts",
    hook: "ChatGPT referrals convert at 11.4%, organic search at 5.3%. Similarweb, 2025.",
    image: "/playbooks/chatgpt-conversion.jpg",
    width: 922,
    height: 1146,
  },
  {
    title: "Outreach that does not scale",
    hook: "We could have sent a LinkedIn message. We drove over with donuts.",
    image: "/playbooks/least-scalable-outreach.jpg",
    width: 1026,
    height: 1422,
  },
  {
    title: "Organic clicks, 28 days",
    hook: "10.1K clicks against 7.22K in the previous 28 days. Search Console.",
    image: "/playbooks/gsc-clicks.jpg",
    width: 948,
    height: 386,
    pos: "left center",
  },
  {
    title: "30 days of AEO",
    hook: "If we had 30 days to improve a German B2B company's AEO, we would start here.",
    image: "/playbooks/aeo-30-days-whiteboard.jpg",
    width: 942,
    height: 1260,
  },
  {
    title: "The CITE framework",
    hook: "Stop chasing #1. Start being cited. Core, Intent, Take, Entity.",
    image: "/playbooks/cite-whiteboard.jpg",
    width: 722,
    height: 1264,
  },
  {
    title: "d-strange",
    hook: "Dr. Strange looked into 14,000,605 futures. My naive AI agent picks the first one it sees.",
    image: "/playbooks/dr-strange-post.jpg",
    width: 944,
    height: 1408,
  },
];

export const words = ["Growth", "Agents", "Claude", "Bots", "Berlin"];

export const taglines = [
  "ships growth loops, not slide decks",
  "founder's associate energy, operator receipts",
  "my agents have agents",
  "claude code till the tokens run out",
  "the pipeline runs while the coffee cools",
  "grok bots on the night shift",
  "one brief in, a fleet back",
];

export const stats = [
  { value: "€500K+", label: "In revenue", note: "closed across sales and growth roles" },
  { value: "1,000+", label: "Demos done", note: "in front of real buyers" },
  { value: "100K+", label: "Cold emails sent", note: "sourced, sequenced, shipped" },
];

export const skills: { n: string; title: string; tags: string[]; note?: string }[] = [
  {
    n: "01",
    title: "GTM & Outbound",
    tags: ["Clay", "Smartlead", "FullEnrich", "LinkedIn Sales Navigator", "Grok Bot agents"],
  },
  {
    n: "02",
    title: "SEO, GEO & AEO Organic Growth",
    tags: ["DataForSEO", "Ahrefs", "Screaming Frog", "GSC", "OpenSEO", "My Claude skills"],
  },
  {
    n: "03",
    title: "Growth & RevOps",
    tags: ["HubSpot", "Attio", "Gong", "Fireflies", "Attribution", "A/B testing"],
  },
  {
    n: "04",
    title: "AI & Automation",
    tags: ["Claude Code", "Custom agents", "Zapier", "ElevenLabs", "PostHog", "REST APIs"],
    note: "My unfair advantage",
  },
];

export const story = [
  {
    n: "01",
    when: "2019",
    title: "EY",
    role: "Tax Consultant Summer Intern · Bangalore",
    copy: "It started at a Big Four desk: GST and income tax filings, and audit preparation for corporate clients. I learned how companies keep their numbers honest.",
    stat: "Big Four",
    statLabel: "First desk",
  },
  {
    n: "02",
    when: "2020 to 2022",
    title: "BYJU'S",
    role: "BDM, Sales Strategy and Revenue Growth · Bangalore",
    copy: "Then I learned to sell. At India's largest edtech company I delivered EUR 70,000 in monthly team revenue, ranked in the national top 50 and was promoted to manager within a year, leading 8+ SDRs.",
    stat: "€70K",
    statLabel: "Monthly team revenue",
  },
  {
    n: "03",
    when: "2023",
    title: "Blingg Labs",
    role: "Growth Head, Acquisition · Mumbai",
    copy: "From selling to growth. In one quarter I grew MRR 5x for a D2C discovery platform by reworking acquisition funnels for 35+ brands: conversion up 30%, CAC down 25%. A pivot from subscription to prepaid took trial-to-purchase from 9% to 40% and tripled repeat purchases.",
    stat: "5x",
    statLabel: "MRR in one quarter",
  },
  {
    n: "04",
    when: "2023 to 2024",
    title: "Fantail",
    role: "Founder's Office: Growth, GTM and Partnerships · Bangalore",
    copy: "My first founder's office, at a supply chain tech company for textiles. I onboarded 35 enterprise and 450 SMB retail brands and scaled recurring revenue to EUR 50,000 through a partner network, with no stores of our own.",
    stat: "€50K",
    statLabel: "Recurring revenue",
  },
  {
    n: "05",
    when: "2025 to 2026",
    title: "Berlin",
    role: "MBA · Gisma University of Applied Sciences",
    copy: "I moved to Berlin for an MBA at Gisma. The city became home base for everything that came next.",
    stat: "MBA",
    statLabel: "Gisma University",
  },
  {
    n: "06",
    when: "2026",
    title: "Cloud Studios",
    role: "Founder's Office, GTM Engineer · First employee · Berlin",
    copy: "First employee at a Berlin app studio, and the point where I stopped waiting for tools and started building them. Listn Intel tracks 15+ competitors and automated about 80% of the manual research. Workshop turns that intel into on-brand content for 7 channels at 40% less AI spend per creative. Leadbot pulls buyer intent from 15+ channels.",
    stat: "80%",
    statLabel: "Manual research automated",
    href: "/work/intel-hub",
    hrefLabel: "See the systems",
  },
  {
    n: "07",
    when: "2026",
    title: "GetMOW",
    role: "Co-Founder · Berlin",
    copy: "Then my own venture: a GEO agency that gets B2B SaaS brands named in AI answers. I built the Agentic Loop, the product behind it, and a multichannel outbound engine that booked 7 demos in 6 weeks on autopilot.",
    stat: "7 demos",
    statLabel: "In 6 weeks",
    href: "/work/getmow-agentic-loop",
    hrefLabel: "Open the case",
  },
];

export const certificates = [
  { org: "Clay", name: "Automated Outbound", tone: "cream" },
  { org: "Anthropic", name: "Building with the Claude API", tone: "red" },
  { org: "Google", name: "AI Professional Certificate", tone: "ink" },
  { org: "AWS", name: "Generative AI Applications", tone: "paper" },
  { org: "Semrush", name: "AI certification", tone: "ember" },
];

export const brandStats = [
  { value: "18,000+", label: "Leads in the engine" },
  { value: "8,445", label: "Claude runs" },
  { value: "772", label: "Tests on Leadbot" },
];

export const contactTiles = [
  { slug: "getmow-agentic-loop", image: "/work/getmow-agentic-loop/poster-1.jpg", title: "Agentic Loop", left: "4%", top: "6%", rot: -6 },
  { slug: "getmow-outbound-engine", image: "/work/getmow-outbound-engine/gtm-workflow.jpg", title: "Outbound engine", left: "38%", top: "3%", rot: 3 },
  { slug: "intel-hub", image: "/work/intel-hub/hub.jpg", title: "Intel hub", left: "72%", top: "7%", rot: 5 },
  { slug: "workshop", image: "/work/workshop/poster-1.jpg", title: "Workshop", left: "76%", top: "40%", rot: -4 },
  { slug: "leadbot", image: "/work/leadbot/poster-1.jpg", title: "Leadbot", left: "2%", top: "38%", rot: 4 },
  { slug: "sage-notetaker", image: "/work/sage-notetaker/sage.jpg", title: "Sage", left: "39%", top: "76%", rot: -3 },
  { slug: "skill-scout", image: "/work/skill-scout/poster-2.jpg", title: "skill-scout", left: "72%", top: "71%", rot: 4 },
  { slug: "d-strange", image: "/work/d-strange/readme.jpg", title: "d-strange", left: "6%", top: "72%", rot: -5 },
];
