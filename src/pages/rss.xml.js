import rss from '@astrojs/rss';
import { getAll } from '../lib/posts';

export async function GET(context) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const items = getAll()
    .filter((x) => x.date)
    .map((x) => ({
      title: x.title,
      pubDate: new Date(x.date),
      description: x.summary,
      link: `${base}/${x.kind === 'note' ? 'notes' : 'posts'}/${x.slug}/`,
      categories: x.tags
    }));

  return rss({
    title: 'sorwcyra blog',
    description: '汪晨阳 sorwcyra 的技术博客：RAG、Agent、后端工程与学习笔记',
    site: context.site,
    items,
    customData: '<language>zh-cn</language>'
  });
}
