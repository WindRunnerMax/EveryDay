const path = require("path");

/**
 * @param {string} source
 * @returns {string}
 */
function AssetLoader(source) {
  /** @type {string} */
  const context = this.context;
  const dirName = context.slice(context.lastIndexOf("/") + 1);
  return source
    .split("\n")
    .map((item) => {
      let line = item;
      if (line.startsWith("<img") || line.startsWith("<p><img")) {
        const result = /src="(.*?)"/.exec(line);
        if (result && result[1] && /(.png|.jpg)/.test(result[1])) {
          line = `![IMG](${result[1]})`;
        }
      }
      const regexp = /^\!\[(.*)\]\((.+)\)/;
      if (regexp.test(line)) {
        const result = regexp.exec(line);
        if (!result || !result[2] || result[2].startsWith("http")) return line;
        const fileName = result[2].slice(result[2].lastIndexOf("/") + 1);
        const filePath = path.join(
          "..",
          "..",
          "zh-cn",
          dirName,
          "screenshots",
          fileName
        );
        return `![${result[1]}](${filePath})`;
      }
      return line;
    })
    .join("\n");
}

module.exports = AssetLoader;
