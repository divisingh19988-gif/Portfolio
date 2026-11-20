import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    hook: z.string(),
    role: z.string(),
    dates: z.string(),
    tools: z.array(z.string()),
    problem: z.string(),
    built: z.string(),
    result: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })),
    link: z.string().optional(),
    thumbnail: z.string(),
    loop: z.string().optional(),
    screenshots: z.array(z.string()).default([]),
    clips: z.array(z.string()).default([]),
    order: z.number(),
    featured: z.boolean().default(true),
    anonymous: z.boolean().default(false),
  }),
});

export const collections = { work };
