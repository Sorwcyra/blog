#!/usr/bin/env node
/**
 * sync-notes.mjs
 * 把 Obsidian 笔记（notes.config.json 里登记的）转换成博客文章。
 *
 *   npm run notes          同步笔记 → src/notes/，图片 → public/notes-assets/
 *   npm run notes -- --check   只做检查，不写文件
 *
 * 转换规则：
 *   - 整篇被 ```markdown 包裹的，剥掉外层围栏
 *   - 首行「以下是整理后的…」这类说明句丢弃
 *   - 正文一级标题降为二级；首个一级标题与 title 重复则直接删掉
 *   - [[双链]] / [[双链|别名]] → 纯文本
 *   - 本地图片 assets/… 复制到 public/notes-assets/<slug>/，路径改写为带 base 的绝对路径
 *   - 外链图片保持原样
 *   - 日期依次取：config.date → 正文「更新日期/日期」→ 文件修改时间
 */

import { readFile, writeFile, mkdir, rm, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');

const cfgRaw = await readFile(path.join(ROOT, 'notes.config.json'), 'utf8');
const cfg = JSON.parse(cfgRaw);

// base 从 astro.config.mjs 里读，避免两处硬编码不一致
const astroCfg = await readFile(path.join(ROOT, 'astro.config.mjs'), 'utf8');
const BASE = (astroCfg.match(/base:\s*['"]([^'"]+)['"]/)?.[1] ?? '').replace(/\/$/, '');

const NOTE_DIR_RAW = process.env.NOTE_DIR || cfg.noteDir;
const NOTE_DIR = path.isAbsolute(NOTE_DIR_RAW) ? NOTE_DIR_RAW : path.join(ROOT, NOTE_DIR_RAW);
const POSTS_DIR = path.join(ROOT, 'src', 'notes');
const ASSETS_DIR = path.join(ROOT, 'public', 'notes-assets');
const MANIFEST = path.join(ROOT, '.notes-manifest.json');

const norm = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

/** 去掉已有 frontmatter，返回正文（raw 笔记用） */
function stripFrontmatter(src) {
  const m = src.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
  return m ? src.slice(m[0].length) : src;
}

/** 剥掉整篇外包的 ```markdown / ```md 围栏 */
function stripOuterFence(src) {
  const lines = src.split('\n');
  const first = lines.findIndex((l) => l.trim() !== '');
  if (first === -1) return src;
  const open = lines[first].trim().match(/^```(?:markdown|md)?\s*$/i);
  if (!open) return src;

  let last = -1;
  for (let i = lines.length - 1; i > first; i--) {
    if (lines[i].trim() === '```') { last = i; break; }
  }
  if (last === -1) return src;
  const tail = lines.slice(last + 1).join('\n').trim();
  // 围栏之后如果又出现新的围栏，说明这不是「整篇包裹」，别动
  if (/^```/m.test(tail)) return src;

  return [...lines.slice(first + 1, last), '', tail].join('\n');
}

/** 去掉开头那句人话说明（"以下是整理后的 Markdown 格式文档："） */
function dropMetaPreamble(src) {
  const lines = src.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^(以下是|下面是|这里是).{0,20}(整理|转换|输出|生成).{0,20}[：:。.]?\s*$/.test(lines[i].trim())) {
    lines.splice(i, 1);
  }
  return lines.join('\n');
}

/** [[目标]] / [[目标|别名]] / [[目标#标题]] → 纯文本 */
function stripWikilinks(src) {
  return src.replace(/!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, target, alias) =>
    (alias || target).trim()
  );
}

const SIMPLE = (s) => s.replace(/[\s`*_~·、，,。.：:；;（）()【】\[\]"'“”‘’!！?？—\-/|]/g, '').toLowerCase();

/** 连续的引用行补硬换行，否则 markdown 会把「来源/日期/标签」挤成一段 */
function hardBreakQuotes(src) {
  const lines = src.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^>\s?\S/.test(lines[i]) && /^>\s?\S/.test(lines[i + 1]) && !lines[i].endsWith('  ')) {
      lines[i] += '  ';
    }
  }
  return lines.join('\n');
}

/** 正文标题整体降一级，保证 title(h1) 之下的层级不断裂；与 title 重复的首个 H1 删掉 */
function fixHeadings(src, title) {
  const want = SIMPLE(title);
  let firstSeen = false;
  return src
    .split('\n')
    .filter((line) => {
      const m = line.match(/^#\s+(.+?)\s*$/);
      if (!m) return true;
      const text = m[1].trim();
      if (!firstSeen) {
        firstSeen = true;
        const got = SIMPLE(text);
        // 完全相同 / 互相包含 / 前 12 字一致 → 认定是重复标题
        const head = (a, b) => a.slice(0, 12) === b.slice(0, 12);
        if (got === want || (want && (got.includes(want) || want.includes(got))) || head(got, want)) return false;
      }
      return true;
    })
    .map((line) => line.replace(/^(#{1,5})\s+/, '#$1 '))
    .join('\n');
}

async function pickDate(note, src, file) {
  if (note.date) return String(note.date).slice(0, 10);
  const m = src.match(/(?:更新日期|日期|创建于|写于)\s*[：:]\s*(\d{4})[-./年](\d{1,2})[-./月](\d{1,2})/);
  if (m) {
    return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
  }
  const st = await stat(file);
  const d = new Date(st.mtime);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 从正文首个有内容的段落里捏一个摘要 */
function makeSummary(src) {
  const plain = src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cut = plain.slice(0, 78);
  return (cut.length < plain.length ? cut.replace(/[，,、；;：:]$/, '') + '…' : cut) || '';
}

/**
 * 图片落地：本地 assets 直接复制，外链（如语雀 CDN）下载到本地。
 * 语雀 CDN 有防盗链，浏览器带 Referer 请求会 403，所以不能直接外链引用。
 */
async function relocateImages(src, slug, opts = {}) {
  const destDir = path.join(ASSETS_DIR, slug);
  const re = /!\[([^\]]*)\]\(([^()\s]+)(?:\s+"[^"]*")?\)/g;
  const matches = [...src.matchAll(re)];
  if (matches.length === 0) return { src, count: 0 };

  const used = new Set();
  const pairs = []; // { from?, remote?, to }
  let out = '';
  let cursor = 0;

  for (const m of matches) {
    out += src.slice(cursor, m.index);
    cursor = m.index + m[0].length;
    const [, alt, href] = m;

    if (/^data:/i.test(href) || href.startsWith('/')) { out += m[0]; continue; }

    let file = null;      // 目标文件名
    let from = null;      // 本地源文件
    let remote = null;    // 远程地址

    if (/^https?:/i.test(href)) {
      if (opts.downloadRemote === false) { out += m[0]; continue; }
      remote = href;
      file = path.basename(new URL(href).pathname).replace(/\s+/g, '-') || 'image.png';
    } else {
      const clean = decodeURIComponent(href.split('#')[0].split('?')[0]);
      from = path.join(NOTE_DIR, clean);
      if (!existsSync(from)) {
        console.warn(`  ! 图片缺失：${clean}（保留原引用）`);
        out += m[0];
        continue;
      }
      file = path.basename(clean).replace(/\s+/g, '-');
    }

    if (used.has(file)) file = `${used.size}-${file}`;
    used.add(file);
    pairs.push({ from, remote, to: path.join(destDir, file) });
    out += `![${alt}](${BASE}/notes-assets/${slug}/${encodeURIComponent(file)})`;
  }
  out += src.slice(cursor);

  if (pairs.length > 0 && !CHECK_ONLY) {
    await rm(destDir, { recursive: true, force: true });
    await mkdir(destDir, { recursive: true });
    for (const p of pairs) {
      if (p.from) {
        await copyFile(p.from, p.to);
      } else {
        try {
          const res = await fetch(p.remote, { headers: { 'user-agent': 'Mozilla/5.0' } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          await writeFile(p.to, Buffer.from(await res.arrayBuffer()));
        } catch (e) {
          console.warn(`  ! 外链图下载失败：${p.remote}（${e.message}）`);
          await rm(p.to, { force: true });
        }
      }
    }
  }
  return { src: out, count: pairs.length };
}

const yamlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function main() {
  console.log(`笔记目录：${NOTE_DIR}`);
  console.log(`文章输出：src/notes/   资源：public/notes-assets/   base：${BASE || '(无)'}`);
  if (!existsSync(NOTE_DIR)) {
    console.error(`找不到笔记目录，改 notes.config.json 里的 noteDir`);
    process.exit(1);
  }

  const written = [];
  for (const note of cfg.notes) {
    const file = path.join(NOTE_DIR, note.file);
    if (!existsSync(file)) {
      console.warn(`跳过（文件不存在）：${note.file}`);
      continue;
    }
    let src = norm(await readFile(file, 'utf8'));
    if (note.raw) {
      // GitHub 仓库就是源：正文已经处理过，只保留内容，不再二次转换
      src = stripFrontmatter(src).replace(/\n+$/, '');
    } else {
      src = dropMetaPreamble(src);
      src = stripOuterFence(src);
      src = stripWikilinks(src);
      src = fixHeadings(src, note.title);
      src = hardBreakQuotes(src);
      src = src.replace(/\n{4,}/g, '\n\n\n').trim();
    }

    const date = await pickDate(note, src, file);
    const summary = note.summary || makeSummary(src);
    const tags = note.tags || [];
    const moved = await relocateImages(src, note.slug, { downloadRemote: note.downloadRemote });
    src = moved.src;

    const fm = [
      '---',
      `title: ${yamlStr(note.title)}`,
      `date: ${date}`,
      `summary: ${yamlStr(summary)}`,
      `tags: [${tags.map(yamlStr).join(', ')}]`,
      `origin: ${yamlStr(note.origin || note.file)}`,
      '---',
      ''
    ].join('\n');

    if (!CHECK_ONLY) {
      await mkdir(POSTS_DIR, { recursive: true });
      await writeFile(path.join(POSTS_DIR, `${note.slug}.md`), fm + src + '\n', 'utf8');
    }
    written.push(note.slug);
    console.log(`✓ ${note.slug.padEnd(28)} ${date}  ${moved.count} 图  ${src.split('\n').length} 行`);
  }

  // 清掉已从 config 移除的旧笔记（只删本脚本自己生成过的）
  if (!CHECK_ONLY) {
    let old = [];
    try { old = JSON.parse(await readFile(MANIFEST, 'utf8')).slugs ?? []; } catch {}
    for (const slug of old) {
      if (written.includes(slug)) continue;
      await rm(path.join(POSTS_DIR, `${slug}.md`), { force: true });
      await rm(path.join(ASSETS_DIR, slug), { recursive: true, force: true });
      console.log(`- 已移除过期笔记：${slug}`);
    }
    await writeFile(MANIFEST, JSON.stringify({ slugs: written, at: new Date().toISOString() }, null, 2));
  }

  console.log(`\n${CHECK_ONLY ? '检查完成' : '同步完成'}：${written.length} 篇`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
