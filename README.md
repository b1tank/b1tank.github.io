# b1tank.github.io

The personal site of Zhichao Li (@b1tank), built with Astro and deployed to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run check
npm run build
```

## Content

- Posts: `src/content/posts/`
- Projects: `src/content/projects/`
- Static project demos: `public/projects/*/demo/`

Posts use Markdown or MDX with validated frontmatter. Fenced code blocks are syntax highlighted; `mermaid` fences render as diagrams.

## Project snapshots

After the source projects are cloned alongside this repository, run:

```bash
npm run sync:projects
```

This copies an allowlisted set of deployable files from `../abc` and `../opensnipping-web`. It never modifies those repositories or the Yummy Jars deployment.

## Deployment

Pushes to `main` build the static site and deploy it through GitHub Pages Actions. The repository must be public and Pages must use **GitHub Actions** as its source.
