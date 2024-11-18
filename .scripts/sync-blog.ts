import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
import { DOCS_GROUP } from "./constant";

const exec = promisify(aliasExec);

(async () => {
  console.log("Syncing Blog...");
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(__dirname, `../${group}`);
    const to = path.resolve(__dirname, `../../Blog/`);
    await exec(`cp -r ${from} ${to}`);
  }
})();
