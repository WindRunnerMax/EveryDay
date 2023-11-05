import { defineConfig } from "rspress/config";

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
  lang: "zh-cn",
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
    },
  ],
});
