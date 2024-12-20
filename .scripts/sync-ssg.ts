import path from "node:path";
import { exec as aliasExec, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import { docs } from "./docs";

const exec = promisify(aliasExec);
const root = path.resolve(__dirname, `..`);
const ssg = path.resolve(root, `../Blog-SSG`);

(async () => {
  console.log("Syncing SSG...");
  const DOCS_GROUP = Object.keys(docs);
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(root, group);
    const to = path.resolve(ssg, `docs/zh-cn`);
    await exec(`rm -rf ${to}/${group}`);
    await exec(`cp -r ${from} ${to}`);
  }

  console.log("Processing", "I18N");
  const from = path.resolve(root, `i18n`);
  const to = path.resolve(ssg, `docs/en-us`);
  await exec(`rm -rf ${to}/*`);
  await exec(`cp -r ${from}/* ${to}`);

  console.log("Processing", "sidebar.ts");
  const inside: any[] = [{ text: "BLOG", link: "index" }];
  for (const [key, value] of Object.entries(docs)) {
    inside.push({ text: key, collapsed: true, items: value });
  }
  const content = { "/": inside };
  const header = "export const sidebar: Sidebar = ";
  const body = JSON.stringify(content, null, 2);
  const footer = [
    "type SidebarItem =",
    "| {",
    "   text: string;",
    "   link: string;",
    "    tag?: string;",
    "  }",
    "| string;",
    "interface SidebarGroup {",
    "  text: string;",
    "  link?: string;",
    "  items?: SidebarItem[];",
    "  collapsible?: boolean;",
    "  collapsed?: boolean;",
    "  tag?: string;",
    "}",
    "type Sidebar = Record<string, (SidebarGroup )[]>;",
  ];
  fs.writeFile(
    path.join(ssg, "sidebar.ts"),
    header + body + "\n" + footer.join("\n")
  );

  console.log("Processing", "sitemap");
  const command = `cd ${ssg} && npm run sitemap`;
  const child = spawn(command, { shell: true });
  child.stdout.on("data", (data) => {
    process.stdout.write(`stdout: ${data}`);
  });
  child.stderr.on("data", (data) => {
    process.stderr.write(`stderr: ${data}`);
  });
})();
