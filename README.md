# Digvijay Rathore

Personal site for Digvijay Rathore, GTM engineer in Berlin. Astro 5, TypeScript, and GSAP. The page is a cursor-ink portfolio: a stable-fluids reveal over Berlin footage, a name that docks into a fixed sidebar, a curved project gallery, a pinned case reel, spinning certificates, and a draggable contact wall.

Case studies live at `/work/[slug]` and are driven by one markdown file each in `src/content/work`.

## Run

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:4731

Live: https://digvijay-rathore-portfolio.vercel.app

```bash
npm run build
npm run preview
```

## Replace the portrait

The hero portrait is a cut-out of the lime-green studio photo. To replace it:

```bash
python scripts/cutout-portrait.py path/to/portrait.jpg public/portrait/digvijay.png
```

Requires Pillow (`pip install pillow`). The script keys out green-dominant pixels and writes a transparent PNG. Keep the filename `digvijay.png`.

## Replace the CV

The Download CV button points at:

`public/cv/Digvijay_Rathore_CV_GTM_Engineer.pdf`

That path is the CV PDF. Replace the file in place if you export a newer version, and keep the filename.

## Add a project

1. Create `src/content/work/your-slug.md`. Copy an existing file and edit the frontmatter.
2. Drop media in `public/work/your-slug/`:
   - `thumb.jpg` — gallery card and showcase still
   - `shot-1.jpg`, `shot-2.jpg` — case-study frames
   - `loop.mp4` — short muted loop
   - `clip.mp4` — optional extra clip
3. Point the frontmatter paths at those files.

```yaml
---
title: "Project name"
hook: "One sentence."
role: "What you did"
dates: "2025 — 2026"
tools:
  - "Clay"
problem: "What was broken."
built: "What you shipped."
result: "What changed."
metrics:
  - label: "Demos"
    value: "7 in 6 weeks"
link: "https://example.com"   # optional
thumbnail: /work/your-slug/thumb.jpg
loop: /work/your-slug/loop.mp4
screenshots:
  - /work/your-slug/shot-1.jpg
  - /work/your-slug/shot-2.jpg
clips:
  - /work/your-slug/clip.mp4
order: 12
featured: true
anonymous: false
---

Longer notes go here. They render under the structured fields.
```

`featured: false` keeps a project off the curved gallery and still builds its page. `anonymous: true` prints a reminder not to name the client. The competitive-intel entry must stay anonymous.

To use MDX instead of Markdown, install the official integration and widen the loader:

```bash
npx astro add mdx
```

Then in `src/content.config.ts` change the glob to `**/*.{md,mdx}`.

Placeholder frames and loops are labeled **PLACEHOLDER** on purpose. Swap the files; you do not need to touch the components.

## Where the CV still needs filling in

Anything the build did not have a source for is marked `TODO` in the case studies, the skill chips, and the timeline. Do not invent dates, titles, or tool lists — paste them from the CV into the frontmatter.

## Motion and mobile

- Desktop uses ScrollSmoother, a Flip of the name and portrait into the sidebar, a pinned horizontal reel, a dragging certificate orbit, and inertia on the contact tiles.
- Under 860px the sidebar, rulers, and readout hide. The gallery and certificates become horizontal snap rows. Sections stack. A menu button opens the five sections.
- `prefers-reduced-motion: reduce` skips the fluid sim, the smooth scroll, the letter scatter, and the auto-moving gallery. The Berlin poster stays as a still, dim background. Content is in its final position.

Background video is lazy in the sense that case-study loops use `preload="none"` and only load when they near the viewport. The hero film loads during the preloader.

## Deploy

Vercel, no environment variables:

1. Import the Git repository.
2. Framework preset: Astro.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`

Or from the project root, with the Vercel CLI: `npx vercel`.

The site is static. Nothing needs a server, a database, or a secret.
