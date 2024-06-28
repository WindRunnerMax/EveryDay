class AssertPlugin {
  private options: Record<string, unknown>;
  constructor(options?) {
    this.options = options || {}; // 传递参数
  }
  apply(compiler) {
    compiler.hooks.emit.tapPromise("UrlPlugin", (compilation) => {
      return new Promise<void>((resolve) => {
        const keys = [];
        const assetKeys = Object.keys(compilation.assets);
        for (const key of assetKeys) {
          if (!/.*\.html$/.test(key)) continue;
          keys.push(key);
        }
        Promise.all(
          keys.map((key) => {
            const source = compilation.assets[key].source();
            // 修改`source`
            compilation.assets[key] = {
              source() {
                return source;
              },
              size() {
                return this.source().length;
              },
            };
          })
        ).finally(() => {
          resolve();
        });
      });
    });
  }
}

export default AssertPlugin;
