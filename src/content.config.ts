import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    hook: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    role: z.string(),
    dates: z.string(),
    tools: z.array(z.string()),
    problem: z.string(),
    built: z.string(),
    situation: z.string().default(""),
    task: z.string().default(""),
    action: z.array(z.string()).default([]),
    result: z.string(),
    results: z.array(z.string()).default([]),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })),
    link: z.string().optional(),
    thumbnail: z.string(),
    loop: z.string().optional(),
    loopWebm: z.string().optional(),
    cardLoop: z.string().optional(),
    explainer: z.string().optional(),
    explainerPoster: z.string().optional(),
    explainerCaption: z.string().optional(),
    explainerSilent: z.boolean().default(false),
    planImage: z.string().optional(),
    planCaption: z.string().optional(),
    screenshots: z.array(z.string()).default([]),
    clips: z.array(z.string()).default([]),
    demos: z.array(z.string()).default([]),
    next: z.string().default(""),
    order: z.number(),
    featured: z.boolean().default(true),
    anonymous: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

export const collections = { work };
