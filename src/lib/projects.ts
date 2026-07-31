import { getCollection, type CollectionEntry } from 'astro:content';

let projectPromise: Promise<CollectionEntry<'projects'>[]> | undefined;

function githubRepository(source?: string) {
  if (!source) return undefined;
  const match = source.match(/^https:\/\/github\.com\/([^/]+)\/([^/#]+)\/?$/);
  return match ? `${match[1]}/${match[2]}` : undefined;
}

async function latestPush(project: CollectionEntry<'projects'>) {
  const repository = githubRepository(project.data.source);
  if (!repository) return project.data.updated;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'b1tank.github.io build',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${repository}`, { headers });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const data = await response.json();
    return data.pushed_at ? new Date(data.pushed_at) : project.data.updated;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[projects] Using saved timestamp for ${repository}: ${message}`);
    return project.data.updated;
  }
}

export function getProjects() {
  projectPromise ??= getCollection('projects').then(async (projects) => {
    const hydrated = await Promise.all(projects.map(async (project) => ({
      ...project,
      data: { ...project.data, updated: await latestPush(project) },
    })));
    return hydrated.sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf() || a.data.order - b.data.order);
  });
  return projectPromise;
}
