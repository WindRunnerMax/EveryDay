import path from "node:path";
import fs from "node:fs/promises";
import { glob } from "glob";
import { docs } from "./docs";
import { countWords } from "alfaaz";

const root = path.resolve(__dirname, `..`);

(async () => {
  console.log("Calculating...");
  const DOCS_GROUP = Object.keys(docs);
  const group = await Promise.all(
    DOCS_GROUP.map((group) => glob(path.join(root, `${group}`) + "/*.md"))
  );
  const files = group.flat(1);
  const backup = await glob(path.join(root, `Backup`) + "/*.md");
  const all = [...files, ...backup];
  const count = all.length;
  let lines = 0;
  let words = 0;
  let characters = 0;
  for (const file of all) {
    const content = await fs.readFile(file, "utf8");
    const line = content.split("\n").length;
    const character = content.length;
    lines = lines + line;
    characters = characters + character;
    words = words + countWords(content.replace(/`/g, " "));
  }

  console.log("Processing README.md");
  const content: string[] = [];
  for (const [key, value] of Object.entries(docs)) {
    content.push(`## ${key}`);
    for (const item of value) {
      const name = item.split("/").pop();
      if (!name) continue;
      content.push(`* [${name}](${item.replace(/ /g, "%20")}.md)`);
    }
    content.push("");
  }
  const summary = [
    `版本库中共有\`${count}\`篇文章，总计\`${lines}\`行，\`${words}\`字，\`${characters}\`字符。`,
  ];
  const readme = await fs.readFile(path.resolve(root, "README.md"), "utf-8");
  const record: Record<string, string[]> = { summary, content };
  const readmeFile: string[] = [];
  const readmeLines = readme.split("\n");
  const regexp = /<!-- (.+?) (.+?) -->/;
  for (let i = 0; i < readmeLines.length; ++i) {
    readmeFile.push(readmeLines[i]);
    const start = regexp.exec(readmeLines[i].trim());
    const key = start && start[1];
    const value = start && start[2];
    if (!key || !value || value !== "Start") {
      continue;
    }
    for (let k = i + 1; k < readmeLines.length; ++k) {
      const end = regexp.exec(readmeLines[k].trim());
      const endKey = end && end[1];
      const endValue = end && end[2];
      if (!key || !endValue || endKey !== key || endValue !== "End") {
        continue;
      }
      readmeFile.push(...record[key.toLocaleLowerCase()]);
      readmeFile.push(`<!-- ${key} End -->`);
      i = k;
      break;
    }
  }
  await fs.writeFile(
    path.resolve(root, "README.md"),
    readmeFile.join("\n"),
    "utf-8"
  );
})();
