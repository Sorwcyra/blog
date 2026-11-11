# 笔记同步说明（自己看的）

博客文章分两类：

| 类型 | 放哪 | 怎么来 | 网址 |
| --- | --- | --- | --- |
| 文章 | `src/posts/*.md` | 手写，讲项目/思考 | `/blog/posts/<slug>/` |
| 笔记 | `src/notes/*.md` | 从 Obsidian 自动转换 | `/blog/notes/<slug>/` |

`src/notes/` 里**不要手改**，下次同步会被覆盖。想改内容回 Obsidian 改。

---

## 一、日常流程（三步）

1. 在 `C:\Users\19112\Desktop\note` 里正常写 md（Obsidian 里写也行，改了记得存）
2. 打开 `notes.config.json`，在 `notes` 数组里加一条：

```json
{
  "file": "Redis 笔记.md",
  "slug": "redis-notes",
  "title": "Redis 笔记：数据结构与持久化",
  "summary": "一句话摘要，显示在列表里",
  "tags": ["Redis", "缓存"]
}
```

   - `file`：note 目录里的文件名，**必须一字不差**（含空格）
   - `slug`：网址路径，英文小写 + 连字符，不能重复
   - `title` / `summary` / `tags`：随便改，同步时会写进 frontmatter
   - `date` 可选；不写就自动找正文里的「更新日期：2026-06-16」，找不到用文件的修改时间

3. 发布：

```bash
cd C:\Users\19112\WorkBuddy\2026-11-11-17-14-25\blog-site
npm run publish:notes
```

它会依次做：同步笔记 → 构建 → 提交 → 推送到 GitHub，Actions 自动上线，约 1 分钟。

只想看看转换结果、先不发布：

```bash
npm run notes          # 转换但不提交
npm run notes:check    # 只打印清单，连文件都不写
```

本地预览：`npm run dev`，打开 http://127.0.0.1:4321/blog/

---

## 二、转换时自动处理了什么

- **整篇被 ` ```markdown ` 包住的**（AI 生成的那种）→ 剥掉外壳围栏
- **开头那句「以下是整理后的 Markdown 格式文档：」** → 删掉
- **正文标题整体降一级**：`#` → `##`，`##` → `###`，保持和页面标题的层级关系
- **首个 H1 与 title 重复**（完全相同/互相包含/前 12 字一致）→ 删掉，避免标题出现两次
- **`[[双链]]` / `[[双链|别名]]`** → 变成纯文本（Obsidian 内部链接在博客里没有意义）
- **本地图片** `assets/xxx/file.png` → 复制到 `public/notes-assets/<slug>/`，路径改写为 `/blog/notes-assets/<slug>/file.png`
- **外链图片**（语雀 CDN 等）→ **下载到本地**。语雀有防盗链，带 Referer 请求直接 403，所以不能偷懒外链
- **文件名里的空格** → 换成 `-`，避免 URL 出问题
- 从 config 里删掉的笔记，下次同步会自动清掉它生成的 md 和图片目录（靠 `.notes-manifest.json` 记账）

---

## 三、几个坑

- **图片不显示**：先看 `npm run notes` 输出里有没有 `! 图片缺失` 或 `! 外链图下载失败`。缺的那张会保留原引用，页面上就是破图
- **标题出现两次**：说明正文首个 H1 和 title 不像，脚本没认出来。把 config 里的 `title` 写得跟正文标题接近一点，或者直接在 Obsidian 里删掉那行 H1
- **改了 note 文件名**：config 里的 `file` 也要跟着改，否则会提示「文件不存在」而跳过
- **想换笔记目录**（比如以后换电脑）：改 `notes.config.json` 的 `noteDir`，或设环境变量 `NOTE_DIR`

---

## 四、这套东西的文件在哪

```
blog-site/
├── notes.config.json          # 笔记清单 + note 目录位置
├── scripts/sync-notes.mjs     # 转换脚本（唯一需要懂的文件）
├── src/notes/*.md             # 转换产物（自动生成，别手改）
├── public/notes-assets/       # 笔记里的图片（自动生成）
└── src/pages/notes/
    ├── index.astro            # /blog/notes/ 列表页（带标签筛选）
    └── [slug].astro           # 单篇笔记页
```
