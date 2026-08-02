import type { CollectionEntry } from 'astro:content';

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles',
  }).format(date);
}

export function publishedPosts(posts: CollectionEntry<'posts'>[]) {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}
