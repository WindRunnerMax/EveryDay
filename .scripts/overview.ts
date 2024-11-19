import path from "node:path";
import fs from "node:fs/promises";
import { glob } from "glob";
import { docs } from "./docs";
import { countWords } from "alfaaz";

const root = path.resolve(__dirname, `..`);

(async () => {
  console.log("Preparing Files");
  const DOCS_GROUP = Object.keys(docs);
  const group: Record<string, string[]> = {};
  for (const item of ["Backup", ...DOCS_GROUP]) {
    group[item] = await glob(path.join(root, `${item}`) + "/*.md");
  }
  const all = Object.values(group).flat();

  console.log("Processing README.md");
  const processREADME = async () => {
    // 全量文章路径与字数统计
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
    const summary = [
      `版本库中共有\`${count}\`篇文章，总计\`${lines}\`行，\`${words}\`字，\`${characters}\`字符。`,
    ];
    // 全量文章索引以及目录
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
    // 生成 README.md
    const origin = await fs.readFile(path.join(root, "README.md"), "utf-8");
    const readme = origin.split("\n");
    const record: Record<string, string[]> = { summary, content };
    const target: string[] = [];
    const regexp = /<!-- (.+?) (.+?) -->/;
    for (let i = 0; i < readme.length; ++i) {
      target.push(readme[i]);
      const start = regexp.exec(readme[i].trim());
      const key = start && start[1];
      const value = start && start[2];
      if (!key || !value || value !== "Start") {
        continue;
      }
      for (let k = i + 1; k < readme.length; ++k) {
        const end = regexp.exec(readme[k].trim());
        const endKey = end && end[1];
        const endValue = end && end[2];
        if (!key || !endValue || endKey !== key || endValue !== "End") {
          continue;
        }
        target.push(...record[key.toLocaleLowerCase()]);
        target.push(`<!-- ${key} End -->`);
        i = k;
        break;
      }
    }
    await fs.writeFile(path.join(root, "README.md"), target.join("\n"));
  };
  await processREADME();

  console.log("Processing Timeline.md");
  const processTimeline = async () => {
    // 预定义匹配选项
    const FE_GROUP = new Set([
      "HTML",
      "CSS",
      "JavaScript",
      "Browser",
      "Vue",
      "React",
      "Plugin",
      "Patterns",
      "Linux",
      "LeetCode",
    ]);
    const LIMIT_MATCH = [
      "Vue/Vue学习笔记.md",
      "Vue/Vue-Cli4笔记.md",
      "Linux/Ubuntu16.04安装QQ机器人.md",
    ];
    const matchedPaths: string[] = [];
    for (const file of all) {
      const lastPart = file.split("/").slice(-2);
      if (!FE_GROUP.has(lastPart[0])) continue;
      const pathName = lastPart.join("/");
      if (LIMIT_MATCH.includes(pathName)) continue;
      matchedPaths.push(pathName);
    }
    // 处理文件匹配
    const origin = await fs.readFile(path.join(root, "Timeline.md"), "utf-8");
    const timeline = origin.split("\n");
    const pathSet = new Set(matchedPaths);
    type Item = { date: string; path: string; name: string };
    const record: Item[] = [];
    let preLineDate = "";
    for (let index = 0; index < timeline.length; ++index) {
      const line = timeline[index];
      const date = /(\d{4}-\d{2}-\d{2})/.exec(line);
      if (date) {
        preLineDate = date[1];
        continue;
      }
      const data = /第(.+?)题：\[(.+?)\]\((.+?)\)/.exec(line);
      if (data && data[1] && data[2] && data[3] && preLineDate) {
        const serial = Number(data[1].trim());
        const name = data[2];
        const path = data[3].replace(/%20/g, " ");
        if (pathSet.has(path)) {
          pathSet.delete(path);
          record.push({ date: preLineDate, path, name });
        }
      }
    }
    // 处理差异 => 新增内容
    if (pathSet.size) {
      const today = new Date().toISOString().split("T")[0];
      for (const path of pathSet) {
        const name = path.split("/").pop();
        if (!name) continue;
        record.unshift({ date: today, path, name });
      }
    }
    // 统计字数
    const count = record.length;
    let lines = 0;
    let words = 0;
    let characters = 0;
    for (const item of record) {
      const content = await fs.readFile(path.join(root, item.path), "utf8");
      const line = content.split("\n").length;
      const character = content.length;
      lines = lines + line;
      characters = characters + character;
      words = words + countWords(content.replace(/`/g, " "));
    }
    // 组装内容
    const target: string[] = [];
    target.push("# Timeline");
    target.push("");
    target.push(
      `前端笔记系列共有 ${count} 篇文章，总计 ${lines} 行， ${words} 字， ${characters} 字符。`
    );
    target.push("");
    record.forEach((item, index) => {
      target.push(`### ${item.date}`);
      const path = item.path.replace(/ /g, "%20");
      target.push(`第 ${count - index} 题：[${item.name}](${path})`);
      target.push("");
    });
    await fs.writeFile(path.join(root, "Timeline.md"), target.join("\n"));
  };
  await processTimeline();
})();
