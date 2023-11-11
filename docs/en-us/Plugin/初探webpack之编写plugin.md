# Exploring webpack plugin development
`webpack` makes its usage more flexible through the `plugin` mechanism to adapt to various application scenarios. Of course, this greatly increases the complexity of `webpack`. During the lifecycle of `webpack`, many events will be broadcast, and `plugin` can hook into these events to change the output results in the processing process through the APIs provided by `webpack` at the appropriate time.

## Description
`webpack` is a modern static module bundler for JavaScript applications. When `webpack` processes an application, it recursively builds a dependency graph containing every module the application needs, and then bundles all of these modules into one or more bundles.  
Using `webpack` as a front-end build tool can usually achieve the following:

* Code transformation: compiling `TypeScript` to `JavaScript`, compiling `SCSS` to `CSS`, and so on.
* File optimization: compressing `JavaScript`, `CSS`, `HTML` code, compressing and merging images, and so on.
* Code splitting: extracting common code from multiple pages, extracting code that does not need to be executed on the initial screen for asynchronous loading.
* Module merging: in a modular project, there are many modules and files that need to be categorized and merged into one file.
* Auto refresh: listening to changes in local source code, automatically rebuilding, refreshing the browser page, usually called hot module replacement (HMR).
* Code validation: before the code is submitted to the repository, it needs to be validated against coding standards and pass unit tests.
* Auto publishing: after updating the code, automatically build the production code and transfer it to the publishing system.

In a `webpack` application, there are two core components:
* Module transformer, used to transform the original content of a module into new content as needed, and to load non-`js` modules.
* Extension plugins, which inject extension logic at specific times in the `webpack` build process to change the build result or do what you want.

This article is about writing a simple `webpack` plugin. Imagine a simple scenario: if we have implemented a multi-page `Vue` application, each packed page will share a common header and footer, which are the top navigation bar and bottom footer. Since frameworks like `Vue` load the header and footer at runtime, this part of the code can actually be developed as a standalone common sub-project, without the need to reference the component on every page of the multi-page application for the framework to parse the component. Additionally, when navigating between pages of a multi-page application, if a header component is written to be referenced within each page component, it is easy to experience navbar flashing due to the longer time needed to load and parse the `JS`.   
To address the issues mentioned above, one solution is to use static page fragments. During the `webpack` packing process, we can inject the header and footer of the pages into the `html` pages to be packed. This approach not only saves some `JS` overhead for framework parsing of components, but also improves `SEO` performance. Although it's only a header and footer with not much information, in a large amount of repeated `CPU` tasks in an `SSR` scenario, even a small improvement can have a significant impact overall, just like the line drawing algorithm in computer graphics, which can't stand too many computational iterations. Furthermore, this approach effectively solves the problem of component header flashing because it is returned with the `HTML` and can be immediately rendered on the page without the need for `JS` loading and parsing. Similarly, this approach can also be used for loading the skeleton screen. All the code mentioned in this article is available at `https://github.com/WindrunnerMax/webpack-simple-environment`.

## Implementation

### Setting up the environment
To explore `webpack`, let's start by setting up a simple `webpack` environment. First, initialize and install dependencies.

```shell
$ yarn init -y
$ yarn add -D webpack webpack-cli cross-env
```

You can first try packaging with `webpack`. `webpack` can be packaged with zero configuration. The directory structure is as follows:

```
webpack-simple
├── package.json
├── src
│ ├── index.js
│ └── sum.js
└── yarn.lock
```

```javascript
// src/sum.js
export const add = (a, b) => a + b;
```

```javascript
// src/index.js
import { add } from "./sum";
console.log(add(1, 1));
```

Then, add a packaging command.

```javascript
// package.json
{
    // ...
    "scripts": {
        "build": "webpack"
    },
    // ...
}
```
Run `npm run build`, which will call the `webpack` command under `node_modules/.bin` by default. Internally, `webpack-cli` will parse user parameters for packaging, and by default, it will use `src/index.js` as the entry file.

```shell
$ npm run build
```

After the execution is completed, a warning will appear, reminding us that the default `mode` is `production`. At this point, you can see the appearance of the `dist` folder, which is the final packaged result. Inside, there is a `main.js` file. `Webpack` will perform some syntax analysis and optimization, and you can see the structure of the completed package.
```javascript
// src/main.js 
(() => {
    "use strict";
    console.log(2);
})();
```

### Configuring Webpack
Of course, we generally don't use zero configurations for packaging, so we first create a file `webpack.config.js`. Since `webpack` says the default `mode` is `production`, let's solve this issue by configuring it. Because it's just a simple `webpack` environment, we won't differentiate between `webpack.dev.js` and `webpack.prod.js` for configuration. Simply use `process.env.NODE_ENV` to differentiate in `webpack.config.js`. Here, we mainly care about the files after the `dist` package. We won't handle the `dev` environment or set up `webpack-dev-server` here. `cross-env` is a plugin used to configure environment variables.
```javascript
// package.json
{
    // ...
    "scripts": {
        "build": "cross-env NODE_ENV=production webpack --config webpack.config.js"
    },
    // ...
}
```

```javascript
const path = require("path");
module.exports = {
    mode: process.env.NODE_ENV,
    entry:  "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist")
    }
}
```

However, according to the above requirements, we not only need to handle `js` files but also need to handle `html` files, for which we need to use the `html-webpack-plugin` plugin.

```shell
$ yarn add -D html-webpack-plugin
```

Then configure it in `webpack.config.js`, simply configure the relevant input/output and compression information. Additionally, if you want to delete the `dist` folder every time you package, you can consider using the `clean-webpack-plugin` plugin.

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: process.env.NODE_ENV,
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webpack Template", 
            filename: "index.html", 
            template: path.resolve("./public/index.html"),
            hash: true, 
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
            },
            inject: "body", 
            scriptLoading: "blocking" 
        })
    ]
}
```

```markdown
### Writing a Plugin
Next, when it comes to the main body, we need to write a plugin to handle the requirements mentioned earlier. Specifically, what we need to do is first leave a comment tag similar to `<!-- inject:name="head" -->` in the `html`. Then after `webpack` bundles the `html` file, we need to perform a regular match to replace the information related to the comment with a page slice, distinguishing which page slice to load by the `name`. Additionally, personally, when actually writing `webpack` plugins, it's best to first refer to the implementations of `webpack` plugins written by others. It's a bit costly to go through the documents and look up various `hooks` on your own.

For this plugin, we will directly create a `static-page-slice.js` in the root directory. The plugin is instantiated by a constructor function, and the constructor function defines the `apply` method. When `webpack` processes the plugin, the `apply` method will be called once by the `webpack compiler`. The `apply` method can receive a reference to the `webpack compiler` object, so that we can access the `compiler` object in the callback function. The structure of the most basic `Plugin` is similar to the following:

```javascript
class BasicPlugin{
    // Obtain the configuration passed in by the user in the constructor
    constructor(options){
        this.options = options || {};
    }
    
    // `Webpack` will call the `apply` method of the `BasicPlugin` instance to pass the `compiler` object to the plugin instance
    apply(compiler){
        compiler.hooks.someHook.tap("BasicPlugin", (params) => {
            /* ... */
        });
    }
}
  
// Export the Plugin
module.exports = BasicPlugin;
```

When developing a `plugin`, the two most commonly used objects are `compiler` and `compilation`. They are the bridge between the `plugin` and `webpack`. The meanings of `compiler` and `compilation` are as follows:
- The `compiler` object contains all the configuration information of the `webpack` environment, including `options`, `loaders`, and `plugins`. This object is instantiated when `webpack` is started and is globally unique. It can be simply understood as the `webpack` instance.
- The `compilation` object contains the current module resources, compiled generated resources, and changed files. When `webpack` is running in development mode, each time a file change is detected, a new `compilation` will be created. The `compilation` object also provides many event callbacks for plugins to extend, and the `compiler` object can also be read through the `compilation`.

The difference between `compiler` and `compilation` is that `compiler` represents the entire life cycle of `webpack` from start to finish, while `compilation` only represents a new compilation. The related information can be referred to at `https://webpack.docschina.org/api/compiler-hooks/`.
`Webpack` is like a production line. The source files must go through a series of processing before they can be converted into output results. The responsibilities of each processing step on this production line are single, and there are dependencies between multiple steps. Only after the current processing is completed can it be handed over to the next step for processing. Plugins are like features inserted into the production line, processing resources on the production line at specific times. `Webpack` organizes this complex production line through `tapeable` at `https://github.com/webpack/tapable`.

Here, we choose to process resource files during the `emit` period of the `compiler` hook, which means executing before outputting the `asset` to the `output` directory. At this time, it is important to note that `emit` is an `AsyncSeriesHook`, which means it is an asynchronous `hook`, so we need to use `tapAsync` or `tapPromise` from `Tapeable`. If a synchronous `hook` is chosen, `tap` can be used instead.

```javascript
class StaticPageSlice {
    constructor(options) {
        this.options = options || {};
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise("StaticPageSlice", compilation => {
            return new Promise(resolve => {
                console.log("StaticPageSlice is being called")
                resolve();
            })
        });
    }
}

module.exports = StaticPageSlice;
```
```

Next, let's officially start processing the logic. First, we need to determine the type of this file. We only need to handle `html` files, so we need to check if it's an `html` file. Then it's a process of regular expression matching. After matching the comment information, we will replace it with a page fragment. We will directly simulate an asynchronous process using `Promise` here for the page fragment. After that, we can reference it in `webpack` and successfully bundle it.

```javascript
// static-page-slice.js
const simulateRemoteData = key => {
    const data = {
        header: "<div>HEADER</div>",
        footer: "<div>FOOTER</div>",
    }
    return Promise.resolve(data[key]);
}
```

```javascript
class StaticPageSlice {
    constructor(options) {
        this.options = options || {}; // Parameters passed in
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise("StaticPageSlice", compilation => {
            return new Promise(resolve => {
                const cache = {};
                const assetKeys = Object.keys(compilation.assets);
                for (const key of assetKeys) {
                    const isLastAsset = key === assetKeys[assetKeys.length - 1];
                    if (!/.*\.html$/.test(key)) {
                        if (isLastAsset) resolve();
                        continue;
                    }
                    let target = compilation.assets[key].source();
                    const matchedValues = target.matchAll(/<!-- inject:name="(\S*?)" -->/g); // `matchAll` function requires `Node v12.0.0` or higher
                    const tags = [];
                    for (const item of matchedValues) {
                        const [tag, name] = item;
                        tags.push({
                            tag,
                            name,
                            data: cache[name] ? cache[name] : simulateRemoteData(name),
                        });
                    }
                    Promise.all(tags.map(item => item.data))
                        .then(res => {
                            res.forEach((data, index) => {
                                const tag = tags[index].tag;
                                const name = tags[index].name;
                                if (!cache[name]) cache[name] = data;
                                target = target.replace(tag, data);
                            });
                        })
                        .then(() => {
                            compilation.assets[key] = {
                                source() {
                                    return target;
                                },
                                size() {
                                    return this.source().length;
                                },
                            };
                        })
                        .then(() => {
                            if (isLastAsset) resolve();
                        });
                }
            });
        });
    }
}
```

```javascript
module.exports = StaticPageSlice;
```

```javascript
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StaticPageSlice = require("./static-page-slice");

module.exports = {
    mode: process.env.NODE_ENV,
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path:path.resolve(__dirname, "dist")
    },
    plugins:[
        new HtmlWebpackPlugin({
            title: "Webpack Template", 
            filename: "index.html", // File name after packaging, the root path is `module.exports.output.path`
            template: path.resolve("./public/index.html"),
            hash: true, // Add `hash` at the end of the referenced resource
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
            },
            inject: "body", // `head`, `body`, `true`, `false`
            scriptLoading: "blocking" // `blocking`, `defer`
        }),
        new StaticPageSlice({
            url: "https://www.example.com/"
        })
    ]
}
```

You can then see the difference between the `html` files before and after packaging.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <!-- inject:name="header" -->
    <div id="app"></div>
    <!-- inject:name="footer" -->
    <!-- built files will be auto injected -->
  </body>
</html>
```

```html
<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><title>Webpack Template</title></head><body><div>HEADER</div><div id=app></div><div>FOOTER</div><!-- built files will be auto injected --><script src=index.js?7e2c7994f2e0891ec351></script></body></html>
```

`Webpack5` has made an update to the `hooks`. Using the plugin above will prompt:

```plaintext
(node:5760) [DEP_WEBPACK_COMPILATION_ASSETS] DeprecationWarning: Compilation.assets will be frozen in future, all modifications are deprecated.
BREAKING CHANGE: No more changes should happen to Compilation.assets after sealing the Compilation.
        Do changes to assets earlier, e. g. in Compilation.hooks.processAssets.
        Make sure to select an appropriate stage from Compilation.PROCESS_ASSETS_STAGE_*.
```

Therefore, we can process the resources in advance according to its prompt to achieve the same effect.

```javascript
// static-page-slice.js
const simulateRemoteData = key => {
    const data = {
        header: "<div>HEADER</div>",
        footer: "<div>FOOTER</div>",
    };
    return Promise.resolve(data[key]);
};

class StaticPageSlice {
    constructor(options) {
        this.options = options || {}; // Passing parameters
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("StaticPageSlice", compilation => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: "StaticPageSlice",
                    stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONS,
                    additionalAssets: true,
                },
                assets => this.replaceAssets(assets, compilation)
            );
        });
    }
```

```javascript
replaceAssets(assets, compilation) {
        return new Promise(resolve => {
            const cache = {};
            const assetKeys = Object.keys(assets);
            for (const key of assetKeys) {
                const isLastAsset = key === assetKeys[assetKeys.length - 1];
                if (!/.*\.html$/.test(key)) {
                    if (isLastAsset) resolve();
                    continue;
                }
                let target = assets[key].source();
                const matchedValues = target.matchAll(/<!-- inject:name="(\S*?)" -->/g); // The `matchAll` function requires `Node v12.0.0` or above
                const tags = [];
                for (const item of matchedValues) {
                    const [tag, name] = item;
                    tags.push({
                        tag,
                        name,
                        data: cache[name] ? cache[name] : simulateRemoteData(name),
                    });
                }
                Promise.all(tags.map(item => item.data))
                    .then(res => {
                        res.forEach((data, index) => {
                            const tag = tags[index].tag;
                            const name = tags[index].name;
                            if (!cache[name]) cache[name] = data;
                            target = target.replace(tag, data);
                        });
                    })
                    .then(() => {
                        compilation.assets[key] = {
                            source() {
                                return target;
                            },
                            size() {
                                return this.source().length;
                            },
                        };
                    })
                    .then(() => {
                        if (isLastAsset) resolve();
                    });
            }
        });
    }
}

module.exports = StaticPageSlice;
```

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://webpack.js.org/concepts/
https://juejin.cn/post/6854573216108085261
https://webpack.js.org/api/plugins/
https://juejin.cn/post/6844903942736838670
https://segmentfault.com/a/1190000012840742
https://segmentfault.com/a/1190000021821557
https://webpack.js.org/api/compilation-hooks/
https://webpack.js.org/api/normalmodulefactory-hooks/
```