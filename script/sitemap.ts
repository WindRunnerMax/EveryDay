import { sidebar } from "../sidebar";
import path from "path";
import thread from "child_process";
import utils from "util";
import fs from "fs";

const promisify = utils.promisify;
const exec = promisify(thread.exec);
const writeFile = promisify(fs.writeFile);

const domain = "https://blog-ssg.touchczy.top/";
const langs = ["en-us", "zh-cn"];
const mainLang = langs[0];
const target = path.resolve(__dirname, "../docs/public");
const docs = path.resolve(__dirname, "../docs");

const allPath: string[] = [];
Object.values(sidebar).forEach((value) => {
  value.forEach((item) => {
    if (item.link) allPath.push(item.link);
    if (item.items) {
      item.items.forEach((child) => {
        typeof child === "string"
          ? allPath.push(child)
          : allPath.push(child.link);
      });
    }
  });
});

const getGitLastUpdatedTimeStamp = async (filePath: string) => {
  let lastUpdated: number | null = null;
  try {
    const { stdout } = await exec(`git log -1 --format=%at ${filePath}`);
    lastUpdated = Number(stdout) * 1000;
    if (Number.isNaN(lastUpdated)) lastUpdated = null;
  } catch (e) {
    /* noop */
  }
  return lastUpdated;
};

(async () => {
  for (const lang of langs) {
    const content: string[] = [];
    const base = lang.replace(mainLang, "");
    content.push(`<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>`);

    content.push(`
<url>
  <loc>${domain}</loc>
  <priority>1.0</priority>
</url>
`);

    for (const item of allPath) {
      const file = path.join(docs, lang, item);
      const time = await getGitLastUpdatedTimeStamp(file + ".md");
      content.push(`<url>`);
      content.push(`  <loc>${domain}${path.join(base, item)}.html</loc>`);
      content.push(`  <priority>1.0</priority>`);
      time &&
        content.push(`  <lastmod>${new Date(time).toISOString()}</lastmod>`);
      content.push(`</url>\n`);
    }
    content.push(`</urlset>`);

    writeFile(
      path.join(target, `sitemap-${lang.split("-")[0]}.xml`),
      content.join("\n")
    );
  }
})();
