import path from "node:path";
import fs from "node:fs/promises";
import { DOCS_GROUP } from "./constant";
import { glob } from "glob";
import { docs } from "./docs";

const root = path.resolve(__dirname, `..`);

(async () => {
  console.log("Calculating...");
  const group = await Promise.all(
    DOCS_GROUP.map((group) => glob(path.join(root, `${group}`) + "/*.md"))
  );
  const files = group.flat(1);
  const backup = await glob(path.join(root, `Backup`) + "/*.md");
  const all = [...files, ...backup];
  const count = all.length;
  let lines = 0;
  let characters = 0;
  for (const file of all) {
    const content = await fs.readFile(file, "utf8");
    const line = content.split("\n").length;
    const character = content.length;
    lines = lines + line;
    characters = characters + character;
  }

  console.log("Processing Overview.md");
  const header = [
    "# Overview",
    "",
    `版本库中共有 ${count} 篇文章，总计 ${lines} 行，${characters} 字符。`,
    "",
  ];
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
  const content = header.concat(body).join("\n");
  await fs.writeFile(path.join(root, "Overview.md"), content);
})();
