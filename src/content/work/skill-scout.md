---
title: "skill-scout"
hook: "A skill does not enter the workflow until another agent has argued with it."
seoTitle: "Multi-Agent Guard for Claude Skills"
seoDescription: "skill-scout vets every Claude skill before it runs and guards each tool call: 282 skills tracked, 25 blocked at the gate, 350+ automated tests."
cardLine: "Guard for Claude skills"
role: "Side project"
dates: "Jul 2026 to Aug 2026"
tools:
  - "Claude Code"
  - "Claude API"
  - "GitHub API"
  - "Slack"
  - "SQLite"
  - "Cloudflare Tunnel"
  - "Vercel"
  - "Vitest"
problem: "Agent skills were getting installed on vibes. Bad ones burn tokens, or leak credentials, before anyone notices."
built: "A multi-agent system that finds new Claude skills, vets each one before it is allowed in, and guards every tool call at runtime."
situation: "My Claude Code setup had grown past 150 skills, most of them installed on vibes from GitHub. A skill is not code you can scan clean. It is a set of instructions my own agent follows later, with my GitHub, Supabase, Vercel and Gmail tokens within reach. One bad skill could leak credentials, and most of the good ones were never used."
task: "Build a system that finds new skills, vets them before they get in, and shows me which installed ones are dead weight, with me approving every change."
action:
  - "Red-teamed my first idea, auto-installing trending skills after a scan, with 8 agents across 7 lenses. It failed, so I rebuilt the design around a runtime guard and not a scan."
  - "Built 8 single-purpose agents: Scout finds skills from trusted sources, Warden runs the security gate, Matcher ranks them against my real usage logs, Installer pins and installs, Herald handles approvals, Sentinel re-scans what is already installed, Guard blocks risky actions at runtime and Conductor runs the loop every week."
  - "Wrote the Guard as a hook on every tool call. It blocks the patterns that matter: reading a secret and sending it out in the same command, downloading and running remote code, dumping keychains or private keys, and any attempt to switch the guard off."
  - "Kept every AI call that reads untrusted skill text at zero tools, so a malicious skill cannot act during its own review."
  - "Added an approval step: every request to install, ignore or delete a skill comes to me on Slack, and nothing changes until I approve it."
  - "Built a console that scores the whole setup out of 100 and shows installed, pending, blocked and dead-weight skills, plus trending repos and history."
result: "Running on my own Mac every day. The console tracks 282 installed skills, has blocked 25 at the gate and flagged 236 as dead weight, backed by 350+ automated tests. It regularly stops my own agents mid-task, which is exactly what it is for."
next: ""
metrics:
  - label: "Skills tracked"
    value: "282"
  - label: "Blocked at the gate"
    value: "25"
  - label: "Flagged as dead weight"
    value: "236"
thumbnail: /work/skill-scout/console.jpg
cardLoop: /work/skill-scout/explainer-loop.mp4
explainer: /work/skill-scout/explainer.mp4
explainerPoster: /work/skill-scout/explainer-poster.jpg
explainerSilent: true
order: 8
featured: true
anonymous: false
---
