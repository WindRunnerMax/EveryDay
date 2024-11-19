import fs from "node:fs/promises";
import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
import { docs } from "./docs";

const exec = promisify(aliasExec);
const root = path.resolve(__dirname, `..`);
const blog = path.resolve(root, `../Blog`);

(async () => {
  console.log("Syncing Blog...");
  const DOCS_GROUP = Object.keys(docs);
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(root, group);
    await exec(`cp -r ${from} ${blog}`);
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
})();
