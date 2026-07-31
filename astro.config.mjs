import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://b1tank.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
  redirects: {
    '/post/2021/01/18/init-post/': '/posts/init-post/',
    '/post/2021/02/20/tldr/': '/posts/tldr/',
  },
  vite: {
    // Mermaid is intentionally a lazy, article-only chunk.
    build: { chunkSizeWarningLimit: 800 },
  },
});
