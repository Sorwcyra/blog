const modules = import.meta.glob('../posts/*.md', { eager: true });

export function getPosts() {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path.split('/').pop().replace(/\.md$/, '');
      const fm = mod.frontmatter ?? {};
      return {
        slug,
        title: fm.title ?? slug,
        summary: fm.summary ?? '',
        date: fm.date ? String(fm.date).slice(0, 10) : '',
        tags: fm.tags ?? [],
        Content: mod.default
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
