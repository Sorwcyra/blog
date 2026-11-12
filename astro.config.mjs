import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://sorwcyra.github.io',
  base: '/blog',
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // 双主题：深色 / 白天各一套高亮，由 CSS 变量 (--shiki-light / --shiki-dark) 取色
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed'
      },
      defaultColor: false,
      wrap: true
    }
  }
});
