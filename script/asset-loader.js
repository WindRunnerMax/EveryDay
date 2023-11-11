const path = require("path");

/**
 * @param {string} source
 * @returns {string}
 */
function AssetLoader(source) {
  /** @type {string} */
  const context = this.context.replace("/en-us/", "/zh-cn/");
  let target = source;
  target = target.replace(/screenshots\/([0-9\-]+\.png)/g, function (_, $1) {
    return path.join(context, "screenshots", $1);
  });
  target = target.replace(/\/.+\/([0-9\-]+\.png)/g, function (_, $1) {
    return path.join(context, "screenshots", $1);
  });
  return target;
}

module.exports = AssetLoader;
