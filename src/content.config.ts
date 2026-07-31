import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.object({
      src: image(),
      alt: z.string(),
    }).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'experimental', 'archived', 'coming-soon']),
    order: z.number().default(99),
    tags: z.array(z.string()).default([]),
    source: z.url().optional(),
    live: z.string().optional(),
    demo: z.string().optional(),
  }),
});

export const collections = { posts, projects };
