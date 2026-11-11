const postModules = import.meta.glob('../posts/*.md', { eager: true });
const noteModules = import.meta.glob('../notes/*.md', { eager: true });

function toEntry([path, mod], kind) {
  const slug = path.split('/').pop().replace(/\.md$/, '');
  const fm = mod.frontmatter ?? {};
  return {
    slug,
    kind,
    title: fm.title ?? slug,
    summary: fm.summary ?? '',
    date: fm.date ? String(fm.date).slice(0, 10) : '',
    tags: fm.tags ?? [],
    origin: fm.origin ?? '',
    Content: mod.default
  };
}

const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);

/** 原创文章 */
export function getPosts() {
  return Object.entries(postModules).map((e) => toEntry(e, 'post')).sort(byDateDesc);
}

/** 从 Obsidian 同步过来的学习笔记 */
export function getNotes() {
  return Object.entries(noteModules).map((e) => toEntry(e, 'note')).sort(byDateDesc);
}

/** 全部内容，文章在前 */
export function getAll() {
  return [...getPosts(), ...getNotes()];
}

/** 按标签分组统计，用于笔记索引页 */
export function groupByTag(notes) {
  const map = new Map();
  for (const n of notes) {
    for (const t of n.tags) {
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(n);
    }
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}
