import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
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
    await exec(`cp -r ${from} ${to}`);
  }

  console.log("Processing", "I18N");
  const from = path.resolve(root, `i18n`);
  const to = path.resolve(ssg, `docs/en-us`);
  await exec(`cp -r ${from}/* ${to}`);

  console.log("Processing", "sidebar.ts");
  const footer = [
    "type SidebarItem =",
    "| {",
    "   text: string;",
    "   link: string;",
    "    tag?: string;",
    "  }",
    "| string;",
    "interface SidebarGroup {",
    " text: string;",
    "link?: string;",
    "items: SidebarItem[];",
    "collapsible?: boolean;",
    "collapsed?: boolean;",
    "tag?: string;",
    "}",
    "type Sidebar = Record<string, (SidebarGroup )[]>;",
  ];
})();
