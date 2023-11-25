import { defineConfig } from "rspress/config";
import { sidebar } from "./sidebar";

export default defineConfig({
  root: "docs",
  outDir: "site-dev",
  icon: "/favicon.ico",
  logo: "/logo.png",
  route: {
    include: ["docs/**/*.md"],
  },
  title: "Blog",
  description: "WindrunnerMax Blog",
  lang: "en-us",
  themeConfig: {
    lastUpdated: true,
    enableContentAnimation: true,
    sidebar,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/WindrunnerMax/EveryDay",
      },
    ],
    locales: [
      {
        lang: "en-us",
        label: "English",
        title: "Blog",
        description: "WindrunnerMax Blog",
        editLink: {
          docRepoBaseUrl:
            "https://github.com/WindrunnerMax/EveryDay/tree/gh-pages-ssg/docs",
          text: "📝 Edit this page on GitHub",
        },
      },
      {
        lang: "zh-cn",
        label: "简体中文",
        title: "Blog",
        description: "WindrunnerMax Blog",
        prevPageText: "上一篇",
        nextPageText: "下一篇",
        outlineTitle: "目录",
        editLink: {
          docRepoBaseUrl:
            "https://github.com/WindrunnerMax/EveryDay/tree/gh-pages-ssg/docs",
          text: "📝 在 GitHub 上编辑此页",
        },
      },
    ],
  },
  builderConfig: {
    html: {
      tags: [
        {
          tag: "meta",
          attrs: {
            name: "baidu-site-verification",
            content: "codeva-MoRHD4glR8",
          },
        },
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://www.googletagmanager.com/gtag/js?id=G-57PHBXT1C5",
          },
        },
        {
          tag: "script",
          children:
            "window.dataLayer = window.dataLayer || [];\n" +
            "function gtag(){dataLayer.push(arguments);}\n" +
            `gtag("js", new Date());\n` +
            `gtag("config", "G-57PHBXT1C5");`,
        },
      ],
    },
    tools: {
      rspack(options) {
        options.module.rules.unshift({
          enforce: "pre",
          test: /\.md$/,
          use: [{ loader: "./script/asset-loader" }],
        });
      },
    },
  },
});
