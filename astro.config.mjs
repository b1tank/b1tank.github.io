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
    '/about/': '/',
    '/work/': '/',
    '/projects/': '/',
    '/projects/learnc/': '/learnc/',
    '/projects/learn-ghostty/': '/learn-ghostty/',
    '/projects/opensnipping/': '/projects/opensnipping/demo/',
    '/projects/abc/': '/projects/abc/demo/',
    '/projects/openmathboard/': 'https://github.com/b1tank/openmathboard',
    '/projects/boringblog/': 'https://lezhiweng.com',
    '/projects/skills/': 'https://github.com/b1tank/skills',
    '/projects/coag/': 'https://github.com/b1tank/coag',
    '/projects/cfd-basics/': 'https://github.com/b1tank/computational-fluid-dynamics-basics',
    '/projects/dsm-f90/': 'https://github.com/b1tank/DSM-f90',
    '/projects/pyspark-kmeans/': 'https://github.com/b1tank/kmeans-clustering-pyspark',
    '/projects/git-remote-helper/': 'https://github.com/b1tank/git-remote-helper',
    '/projects/wireguard-gnome/': 'https://github.com/b1tank/wg-gnome-ext',
    '/projects/container-use-web/': 'https://github.com/b1tank/container-use-web',
    '/projects/otelux/': '/',
    '/projects/deskpal/': '/',
    '/projects/pi-otel/': '/',
    '/posts/': '/writing/',
    '/posts/init-post/': '/writing/init-post/',
    '/posts/tldr/': '/writing/tldr/',
    '/tags/': '/writing/',
    '/tags/thoughts/': '/writing/',
    '/tags/cloud/': '/writing/',
    '/tags/analogy/': '/writing/',
    '/tags/nothing-but-cloud/': '/writing/',
    '/tags/basketball/': '/writing/',
    '/tags/warriors/': '/writing/',
    '/post/2021/01/18/init-post/': '/writing/init-post/',
    '/post/2021/02/20/tldr/': '/writing/tldr/',
  },
  vite: {
    // Mermaid is intentionally a lazy, article-only chunk.
    build: { chunkSizeWarningLimit: 800 },
  },
});
