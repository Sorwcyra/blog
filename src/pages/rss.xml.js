import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';

export async function GET(context) {
  const posts = getPosts();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return rss({
    title: 'sorwcyra blog',
    description: '汪晨阳 sorwcyra 的技术博客：RAG、Agent 与后端工程',
    site: context.site,
    items: posts.map((p) => ({
      title: p.title,
      pubDate: new Date(p.date),
      description: p.summary,
      link: `${base}/posts/${p.slug}/`
    }))
  });
}
