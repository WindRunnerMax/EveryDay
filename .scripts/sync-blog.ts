import fs from "node:fs/promises";
import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
import { DOCS_GROUP } from "./constant";
import { docs } from "./docs";

const root = path.resolve(__dirname, `..`);
const exec = promisify(aliasExec);

(async () => {
  console.log("Syncing Blog...");
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(root, group);
    const to = path.resolve(root, `../Blog/`);
    await exec(`cp -r ${from} ${to}`);
  }
  const from = path.join(root, "Overview.md");
  const to = path.join(root, "../Blog/");
  await exec(`cp -r ${from} ${to}`);
  
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
  await fs.writeFile(path.join(root, "../Blog/_sidebar.md"), content);
})();
