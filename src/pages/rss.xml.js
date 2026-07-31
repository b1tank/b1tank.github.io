import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { publishedPosts } from '../lib/content';

export async function GET(context) {
  const posts = publishedPosts(await getCollection('posts'));
  return rss({
    title: 'Zhichao Li — b1tank',
    description: 'Writing about software, systems, visual explanations, and building products.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
