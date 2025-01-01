import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

const MAP: Record<string, string> = {
  __ORIGIN__: "__TARGET__",
};

const withSuffix = (fileName?: string) => {
  if (!fileName) return null;
  return fileName.endsWith(".md") ? fileName : `${fileName}.md`;
};

const removeSuffix = (fileName?: string) => {
  if (!fileName) return null;
  return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
};

(async () => {
  const root = path.resolve(__dirname, `..`);
  // 处理 docs 文件
  const docsPath = path.resolve("./docs.ts");
  let docsFile = await fs.readFile(docsPath, "utf-8");
  for (const [key, value] of Object.entries(MAP)) {
    docsFile = docsFile.replaceAll(`/${key}"`, `/${value}"`);
  }
  await fs.writeFile(docsPath, docsFile);
  // 处理 Timeline 文件
  const timelinePath = path.join(root, "Timeline.md");
  let timelineFile = await fs.readFile(timelinePath, "utf-8");
  for (const [key, value] of Object.entries(MAP)) {
    timelineFile = timelineFile.replaceAll(
      `[${key}](Linux/${key}.md)`,
      `[${value}](Linux/${value}.md)`
    );
  }
  await fs.writeFile(timelinePath, timelineFile);
  // 处理文件名
  const files = await glob(path.join(root, "**", "*.md"));
  for (const file of files) {
    const group = file.split("/");
    const fileName = removeSuffix(group.pop());
    const origin = withSuffix(fileName);
    const target = withSuffix(MAP[fileName]);
    if (origin && target) {
      fs.rename([...group, origin].join("/"), [...group, target].join("/"));
    }
  }
})();
