import path from "node:path";
import { exec as aliasExec } from "node:child_process";
import { promisify } from "node:util";
import { DOCS_GROUP } from "./constant";

const exec = promisify(aliasExec);

(async () => {
  console.log("Syncing SSG...");
  for (const group of DOCS_GROUP) {
    console.log("Processing", group);
    const from = path.resolve(__dirname, `../${group}`);
    const to = path.resolve(__dirname, `../../Blog-SSG/docs/zh-cn`);
    await exec(`cp -r ${from} ${to}`);
  }
  console.log("Processing", "I18N");
  const from = path.resolve(__dirname, `../i18n/`);
  const to = path.resolve(__dirname, `../../Blog-SSG/docs/en-us`);
  await exec(`cp -r ${from}/* ${to}`);
})();
