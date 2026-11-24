# 笔记同步说明（GitHub 是后台）

博客文章分两类：

| 类型 | 源文件（唯一真源） | 生成物 | 网址 |
| --- | --- | --- | --- |
| 文章 | `src/posts/*.md` | 直接发布 | `/blog/posts/<slug>/` |
| 笔记 | `notes-src/<slug>.md`（在本仓库里） | `src/notes/*.md` | `/blog/notes/<slug>/` |

`notes-src/` 是笔记的**后台源**，存在 GitHub 仓库里，不依赖本机任何 Obsidian 目录。以前电脑 BitLocker 锁盘导致本地笔记丢失，现在改成本仓库即后台；只要仓库在，内容就在。

`src/notes/` 是脚本生成物，**不要手改**，下次同步会覆盖。

---

## 一、日常流程

1. 改笔记正文：编辑 `notes-src/<slug>.md`
2. 改元信息：编辑 `notes.config.json` 里对应条目的 `title` / `summary` / `tags` / `date`
3. 发布：

```bash
npm run publish:notes
```

它会依次做：同步笔记 → 构建 → 提交 → 推送到 GitHub，Actions 自动上线，约 1 分钟。

只想看结果不发布：

```bash
npm run notes          # 同步但不提交
npm run notes:check    # 只打印清单，不写文件
```

本地预览：`npm run dev`，打开 http://127.0.0.1:4321/blog/

---

## 二、新增一篇笔记

1. 在 `notes-src/` 新建 `<slug>.md`，写正文（不需要 frontmatter）
2. 在 `notes.config.json` 的 `notes` 数组里加一条：

```json
{
  "file": "redis-notes.md",
  "slug": "redis-notes",
  "title": "Redis 笔记：数据结构与持久化",
  "summary": "一句话摘要，显示在列表里",
  "tags": ["Redis", "缓存"],
  "date": "2026-11-24",
  "raw": true,
  "origin": "来源说明（可选）"
}
```

字段说明：
- `file`：`notes-src/` 里的文件名
- `slug`：网址路径，英文小写 + 连字符，不能重复
- `raw: true`：表示源文件已经是博客正文，**不再做标题降级/双链替换等转换**（当前所有笔记都是这种）
- `date`：建议显式写；不写则用文件修改时间
- `origin`：写进 frontmatter 的来源标记，可省略

然后跑 `npm run publish:notes`。

---

## 三、旧 Obsidian 转换模式（兼容保留）

如果某条笔记**没有** `raw: true`，脚本仍按老规则从 `noteDir` 读文件并转换：

- 整篇被 ` ```markdown ` 包住的 → 剥掉外壳围栏
- 开头「以下是整理后的…」→ 删掉
- 正文一级标题降一级；与 title 重复的首个 H1 删掉
- `[[双链]]` → 纯文本
- 本地图片 `assets/…` → 复制到 `public/notes-assets/<slug>/`，路径改成带 base 的绝对路径
- 外链图片 → 下载到本地（语雀 CDN 有防盗链，不能直接外链）

`noteDir` 默认是仓库内的 `notes-src`；也可以设环境变量 `NOTE_DIR` 指到别的目录。新笔记建议直接用 `raw: true`，不要再依赖本机路径。

---

## 四、几个坑

- **图片不显示**：先看 `npm run notes` 输出里有没有 `! 图片缺失` 或 `! 外链图下载失败`
- **改了文件名**：`notes.config.json` 里的 `file` 要跟着改，否则会跳过
- **从 config 删掉某篇**：下次同步会自动清掉它生成的 md 和图片目录（靠 `.notes-manifest.json` 记账）
- **本机没网/没装依赖**：`npm run notes` 只用 Node 标准库，能跑；`npm run build` 需要先 `npm ci`

---

## 五、文件在哪

```
blog/
├── notes.config.json          # 笔记清单 + 元信息（noteDir 默认是 notes-src）
├── notes-src/*.md             # 笔记源文件（GitHub 后台，直接编辑这里）
├── scripts/sync-notes.mjs     # 同步脚本
├── src/notes/*.md             # 生成物（别手改）
├── public/notes-assets/       # 笔记图片（生成物）
└── src/pages/notes/
    ├── index.astro            # /blog/notes/ 列表页
    └── [slug].astro           # 单篇笔记页
```
