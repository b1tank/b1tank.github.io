import type { CollectionEntry } from 'astro:content';

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  }).format(date);
}

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function tagSlug(tag: string) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function publishedPosts(posts: CollectionEntry<'posts'>[]) {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}
