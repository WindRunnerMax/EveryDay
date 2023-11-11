import { defineConfig } from "rspress/config";
import { sidebar } from "./sidebar";

export default defineConfig({
  root: "docs",
  outDir: process.env.NODE_ENV === "development" ? "site-dev" : "site",
  icon: "/favicon.ico",
  logo: "/favicon.ico",
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
        content: "https://github.com/WindrunnerMax",
      },
    ],
    locales: [
      {
        lang: "en-us",
        label: "English",
        title: "Blog",
        description: "WindrunnerMax Blog",
      },
      {
        lang: "zh-cn",
        label: "简体中文",
        title: "Blog",
        description: "WindrunnerMax Blog",
        prevPageText: "上一篇",
        nextPageText: "下一篇",
        outlineTitle: "目录",
      },
    ],
  },
  builderConfig: {
    html: {
      tags: [
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
          test: /\.md$/,
          use: [{ loader: "./script/asset-loader" }],
        });
      },
    },
  },
});
