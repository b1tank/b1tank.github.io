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
    category: z.enum(['agent-systems', 'learning', 'tools', 'personal', 'scientific']),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.url().optional(),
    live: z.string().optional(),
    demo: z.string().optional(),
    demoLabel: z.string().default('Launch demo'),
    liveLabel: z.string().default('Original deployment'),
  }),
});

export const collections = { posts, projects };
