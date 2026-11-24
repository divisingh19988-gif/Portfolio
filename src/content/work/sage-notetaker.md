---
title: "Sage Notetaker"
hook: "A notetaker that keeps the meeting after everyone leaves."
seoTitle: "AI Meeting Notetaker Built in 9 Days"
seoDescription: "Sage is an AI meeting notetaker built at Cloud Studios in 9 days across 122 commits: searchable notes, action items and answers with sources."
role: "Founder's Associate, Cloud Studios"
dates: "Jun 2026 to Jul 2026"
tools:
  - "Google Meet"
  - "Google Calendar"
  - "Playwright"
  - "whisper.cpp"
  - "Qwen 2.5 on llama.cpp"
  - "Supabase"
  - "Next.js"
  - "Fly.io"
  - "Vercel"
  - "GitHub"
  - "Claude Code"
problem: "Notes died in the call. The next person started from zero."
built: "Sage, an AI meeting notetaker built at Cloud Studios. It joins the call, writes the notes and makes every past meeting answerable."
situation: "Our 2-person team made its decisions on daily calls, and the notes died when the call ended. Tools like Fireflies solve this, but they are priced per seat and keep your meeting data on their side."
task: "Build our own notetaker: Sage joins the call, writes the notes and makes every past meeting answerable, with the data in our own database."
action:
  - "Built a bot that joins a Google Meet as a guest, or auto-joins from Google Calendar, using headless Chromium with Playwright on Fly.io. Uploading any recording works too."
  - "Set up the pipeline: a speaker-labelled transcript, then a summary, key points and action items. It started on Deepgram and Claude Haiku, then moved to whisper.cpp and a local Qwen model inside the bot, so every meeting runs at zero API cost. The pipeline is resumable, and a cron job recovers any meeting that gets stuck."
  - "Added Ask Sage, which answers a question across every meeting on file and cites its sources, plus full-text search, talk-time analytics and shareable timestamped moments."
  - "Added AI Skills that turn a meeting into a follow-up email or a standup update, webhooks for Zapier, Make and n8n, and a public REST API."
result: "A working Fireflies-style notetaker for a 2-person team, built in 9 days across 122 commits. Every meeting ends as searchable notes, action items and answers with sources."
next: "Implement this infrastructure in my next role."
metrics:
  - label: "Built in"
    value: "9 days"
  - label: "Commits"
    value: "122"
thumbnail: /work/sage-notetaker/sage.jpg
cardLoop: /work/sage-notetaker/explainer-loop.mp4
explainer: /work/sage-notetaker/explainer.mp4
explainerPoster: /work/sage-notetaker/explainer-poster.jpg
explainerSilent: true
order: 7
featured: true
anonymous: false
---
