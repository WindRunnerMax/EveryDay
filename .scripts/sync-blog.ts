import fs from "node:fs/promises";
import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
import { docs } from "./docs";

const exec = promisify(aliasExec);
const root = path.resolve(__dirname, `..`);
const blog = path.resolve(root, `../Blog`);

const getGitLastUpdatedTimeStamp = async (filePath: string) => {
  let lastUpdated: number | null = null;
  try {
    const context = path.dirname(filePath);
    const cmd = `cd ${context} && git log -1 --format=%at ${filePath}`;
    const { stdout } = await exec(cmd);
    lastUpdated = Number(stdout) * 1000;
    if (Number.isNaN(lastUpdated)) lastUpdated = null;
  } catch (e) {
    /* noop */
  }
  return lastUpdated;
};

(async () => {
  console.log("Syncing Blog...");
  const DOCS_GROUP = Object.keys(docs);
  await exec("mkdir -p " + blog + "/I18N");
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(root, group);
    await exec(`rm -rf ${blog}/${group}`);
    await exec(`cp -r ${from} ${blog}`);
    const fromI18N = path.resolve(root, "i18n", group);
    await exec(`rm -rf ${blog}/I18N/${group}`);
    await exec(`cp -r ${fromI18N} ${blog}/I18N`);
  }

  console.log("Processing _sidebar.md");
  const body: string[] = [];
  for (const [key, value] of Object.entries(docs)) {
    body.push(`* ${key}`);
    for (const item of value) {
      const name = item.split("/").pop();
      if (!name) continue;
      body.push(`  * [${name}](${item.replace(/ /g, "%20")}.md)`);
    }
    body.push("");
  }
  const content = body.join("\n");
  await fs.writeFile(path.join(blog, "_sidebar.md"), content);

  console.log("Processing I18N _sidebar.md");
  const i18nBody: string[] = [];
  for (const [key, value] of Object.entries(docs)) {
    i18nBody.push(`* ${key}`);
    for (const item of value) {
      const filePath = path.resolve(root, "I18N", `${item}.md`);
      const fileContent = await fs.readFile(filePath, "utf8");
      const lines = fileContent.split("\n");
      const firstLine = lines[0].trim();
      const name = firstLine.replace(/^#+/g, "").trim();
      if (!name) continue;
      i18nBody.push(`  * [${name}](${item.replace(/ /g, "%20")}.md)`);
    }
    i18nBody.push("");
  }
  const i18nContent = i18nBody.join("\n");
  await fs.writeFile(path.join(blog, "I18N", "_sidebar.md"), i18nContent);

  console.log("Processing sitemap.xml");
  const domain = "https://blog.touchczy.top";
  const allPath: string[] = [];
  const sitemap: string[] = [];
  Object.values(docs).forEach((value) => allPath.push(...value));
  sitemap.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  sitemap.push(`<urlset`);
  sitemap.push(`  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`);
  sitemap.push(`  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`);
  sitemap.push(
    `  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9`
  );
  sitemap.push(`    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"`);
  sitemap.push(`>\n`);

  sitemap.push(`<url>`);
  sitemap.push(`  <loc>${domain}</loc>`);
  sitemap.push(`  <priority>1.0</priority>`);
  sitemap.push(`</url>\n`);

  sitemap.push(`<url>`);
  sitemap.push(`  <loc>${domain}/_sidebar.md</loc>`);
  sitemap.push(`  <priority>1.0</priority>`);
  sitemap.push(`</url>\n`);

  for (const filePath of allPath) {
    const file = path.join(blog, filePath + ".md");
    console.log("Process File:", file);
    const time = await getGitLastUpdatedTimeStamp(file);
    sitemap.push(`<url>`);
    sitemap.push(`  <loc>${domain}/?p=/${filePath}</loc>`);
    sitemap.push(`  <priority>1.0</priority>`);
    const iso = new Date(time).toISOString();
    time && sitemap.push(`  <lastmod>${iso}</lastmod>`);
    sitemap.push(`</url>\n`);
    sitemap.push(`<url>`);
    sitemap.push(`  <loc>${domain}/I18N/?p=/${filePath}</loc>`);
    sitemap.push(`  <priority>1.0</priority>`);
    time && sitemap.push(`  <lastmod>${iso}</lastmod>`);
    sitemap.push(`</url>\n`);
  }
  sitemap.push(`</urlset>`);
  fs.writeFile(path.join(blog, "sitemap.xml"), sitemap.join("\n"));
})();
