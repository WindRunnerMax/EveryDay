## Exploring Writing Loaders for Webpack

`Loader` is one of the core features of `Webpack`, which is used to convert different types of files into modules that `Webpack` can recognize. In other words, it transforms the original content of the modules into new content as needed to load non-`js` modules. By working in conjunction with extension plugins, it injects extension logic into the specific stages of the `Webpack` build process to alter the build result, thus completing a full build process.

## Description
`Webpack` is a modern static module bundler for `JavaScript` applications. When `Webpack` processes an application, it recursively builds a dependency graph that includes every module the application needs, and then packs all these modules into one or more bundles.  
Using `Webpack` as a front-end build tool usually involves the following aspects:
- Code transformation: Compiling `TypeScript` into `JavaScript`, compiling `SCSS` into `CSS`, and so on.
- File optimization: Compressing `JavaScript`, `CSS`, `HTML` code, compressing and merging images, and more.
- Code splitting: Extracting common code from multiple pages, extracting code that doesn't need to be executed on the initial page load for asynchronous loading.
- Module merging: In a modular project, there are many modules and files that need to be merged into one file for building purposes.
- Automatic refreshing: Listening to changes in local source code, automatically rebuilding, and refreshing the browser page, usually known as Hot Module Replacement (`HMR`).
- Code validation: Validating the code for compliance with standards and ensuring that unit tests pass before the code is submitted to the repository.
- Automatic publishing: After updating the code, automatically building the production code and transferring it to the publishing system.

For `Webpack`, everything is a module, and `Webpack` can only process `js` and `json` files. Therefore, if you want to use other types of files, they need to be converted into modules recognized by `Webpack`, namely `js` or `json` modules. This means that regardless of the file suffix, such as `png`, `txt`, `vue`, etc., they need to be used as `js`. However, directly treating them as `js` is not possible because these files do not adhere to the syntax structure of `js`. Therefore, we need `Webpack loaders` to help us transform non-`js` files into `js` files, such as `css-loader`, `ts-loader`, `file-loader`, and so on.

Here, we will write a simple `Webpack loader`. Let's consider a simple scenario in which we focus on `vue2`. Typically, when building a `vue` project, we write `.vue` files as modules. Although this single-file component approach is clear, it can lead to large files if a component is complex. Of course, `vue` provides a way to reference `js` and `css` in `.vue` files, but it can still be somewhat cumbersome to use. Therefore, we can write a `Webpack loader` to separate the three parts, namely `html`, `js`, and `css` during code writing, and then merge them in the `loader`, which will then be processed by `vue-loader`. Focusing on separation does not necessarily mean separating file types; splitting a single file into multiple files is simply a matter of code readability in the writing process. Here, our main focus is on writing a simple `loader`, not on debating whether files should be separated. All the code mentioned in this article is available in [https://github.com/WindrunnerMax/webpack-simple-environment](https://github.com/WindrunnerMax/webpack-simple-environment).

## Implementation

### Setting Up the Environment
Here, we will directly use the simple `vue + ts` development environment set up in my previous article [Exploring Webpack: Building a Vue Development Environment from Scratch](https://github.com/WindrunnerMax/EveryDay/blob/master/Plugin/%E5%88%9D%E6%8E%A2webpack%E4%B9%8B%E6%90%AD%E5%BB%BAVue%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83.md). The relevant code for the environment can be found in the `webpack--vue-cli` branch of [https://github.com/WindrunnerMax/webpack-simple-environment](https://github.com/WindrunnerMax/webpack-simple-environment), and we can simply clone and install it:

```
git clone https://github.com/WindrunnerMax/webpack-simple-environment.git
git checkout webpack--vue-cli
yarn install --registry https://registry.npm.taobao.org/
```

After this, we can run `yarn dev` to see the effect. Here, let's first print the current directory structure.

```
webpack--vue-cli
├── dist
│   ├── static
│   │   └── vue-large.b022422b.png
│   ├── index.html
│   ├── index.js
│   └── index.js.LICENSE.txt
├── public
│   └── index.html
├── src
│   ├── common
│   │   └── styles.scss
│   ├── components
│   │   ├── tab-a.vue
│   │   └── tab-b.vue
│   ├── router
│   │   └── index.ts
│   ├── static
│   │   ├── vue-large.png
│   │   └── vue.jpg
│   ├── store
│   │   └── index.ts
│   ├── views
│   │   └── framework.vue
│   ├── App.vue
│   ├── index.ts
│   ├── main.ts
│   ├── sfc.d.ts
│   └── sum.ts
├── LICENSE
├── README.md
├── babel.config.js
├── package.json
├── tsconfig.json
├── webpack.config.js
└── yarn.lock
```

### Writing a loader
Before writing a `loader`, let's focus on the `.vue` files in the directory structure above, because we need to split them, but how to split them is something to consider. In order to minimize the impact on normal usage, we have adopted the following approach here.

* We left the `template` part in the `.vue` file, because some plugins such as `Vetur` will check for syntax in the `template`. For example, if it is separated as an `html` file, `prettier` will give errors for syntax like `@click`. Also, if the `.vue` file does not exist, modifications are needed for using `declare module "*.vue"` in `TS`. So, following the principle of minimal impact, we left the `template` part in the `.vue` file, thus preserving the `.vue` declaration file.
* For the `script` part, we extracted it. If it is written in `js`, then we named it as `.vue.js`, and for `ts` it is named as `.vue.ts`.
* For the `style` part, we also extracted it, using the same approach as `script`, naming them respectively as `.vue.css`, `.vue.scss`, and `.vue.less`. For `scoped`, we implemented it through comments.

With the above modifications, we printed the directory structure again, focusing on the separation of `.vue` files.

```
webpack--loader
├── dist
│   ├── static
│   │   └── vue-large.b022422b.png
│   ├── index.html
│   ├── index.js
│   └── index.js.LICENSE.txt
├── public
│   └── index.html
├── src
│   ├── common
│   │   └── styles.scss
│   ├── components
│   │   ├── tab-a
│   │   │   ├── tab-a.vue
│   │   │   └── tab-a.vue.ts
│   │   └── tab-b
│   │       ├── tab-b.vue
│   │       └── tab-b.vue.ts
│   ├── router
│   │   └── index.ts
│   ├── static
│   │   ├── vue-large.png
│   │   └── vue.jpg
│   ├── store
│   │   └── index.ts
│   ├── views
│   │   └── framework
│   │       ├── framework.vue
│   │       ├── framework.vue.scss
│   │       └── framework.vue.ts
│   ├── App.vue
│   ├── index.ts
│   ├── main.ts
│   ├── sfc.d.ts
│   └── sum.ts
├── LICENSE
├── README.md
├── babel.config.js
├── package.json
├── tsconfig.json
├── vue-multiple-files-loader.js
├── webpack.config.js
└── yarn.lock
```

Now let's start writing this `loader` officially. First, we need to briefly explain the input and output of the `loader`, as well as the commonly used modules.

* Simply put, a `webpack loader` is a function from `string` to `string`. It takes a string of code as input and returns a string of code as output.
* Typically, for handling various file types, there are already good solutions available as `loaders`. The `loader` we write ourselves is usually used for code processing. This means that after obtaining the `source` in the `loader`, we convert it into an `AST` tree, then make some modifications to this `AST`, and finally convert it back into a string of code for return.
* Converting from string to an `AST` syntax tree is done in order to obtain a data structure that is easy for the computer to recognize. `Webpack` comes with some built-in tools for this, such as `acorn` for code to `AST` conversion, `estraverse` for `AST` traversal, and `escodegen` for converting `AST` to string code.
* Since the `loader` operates from string to string, after processing the code into an `AST`, it needs to be converted back to a string and then passed to the next `loader`. The next `loader` might need to perform the same conversion again, which can be time-consuming. To address this, we can use `speed-measure-webpack-plugin` for speed profiling and `cache-loader` to store the `AST`.
* `loader-utils` is a commonly used utility class in `loader`. The commonly used methods include `urlToRequest` for converting absolute paths to relative paths in `webpack` requests and `getOptions` for retrieving the parameters passed when configuring `loader`.

Since we don't need any `AST` related processing for this requirement, it's a relatively simple example. First, we need to write a `loader` file and then configure it in `webpack.config.js`. In the root directory, we create a `vue-multiple-files-loader.js` and then in the `webpack.config.js` `module.rule` section, find the `test: /\.vue$/` part and modify it as follows.

```javascript
// ...
{
    test: /\.vue$/,
    use: [
        "vue-loader",
        {
            loader: "./vue-multiple-files-loader",
            options: {
                // Matched file extensions
                style: ["scss", "css"],
                script: ["ts"],
            },
        },
    ],
}
// ...
```

First, after `"vue-loader"`, we can see that we have written an object. The `loader` property of this object is a string, which will be passed to `require` in the future. This means that in `webpack`, it will automatically help us `require` this module, i.e., `require("./vue-multiple-files-loader")`. `Webpack loader` has a priority. Here, our goal is to first process the code through the `vue-multiple-files-loader` and then hand it over to `vue-loader` for processing. So we need to write `vue-multiple-files-loader` after `vue-loader`, so that the `vue-multiple-files-loader` code will be executed first. We pass parameters through the `options` object, which can be accessed in the `loader`.

Regarding the priority of `webpack loader`, when defining the `loader` configuration, in addition to the `loader` and `options` options, there is also an `enforce` option, which can accept values of `pre: `pre-loader`, `normal: `normal-loader`, `inline: `inline-loader`, `post: `post-loader`. The priority is `pre > normal > inline > post`. For `loader` of the same priority, the execution order is from right to left, from bottom to top. It's easy to understand, and as for the right-to-left ordering, it's just a choice of `compose` rather than `pipe` in `webpack`. Additionally, when using `require`, we can also skip certain `loader`s: `!` skips `normal-loader`, `-!` skips `pre` and `normal-loader`, `!!` skips `pre`, `normal` and `post-loader`. For example `require("!!raw!./script.coffee")`. As for skipping `loader`s, the official recommendation from `webpack` is unless it's generated from another `loader`, it's generally not recommended to skip proactively.

Now we've sorted out the creation of the `vue-multiple-files-loader.js` file and the importing of the loader. So, we can start writing code using it. Typically, loaders are time-consuming applications, so we handle this loader asynchronously. By using `this.async`, we inform the `loader-runner` that this loader will be called back asynchronously. Once the processing is complete, we can execute the processed string code as a parameter using its return value.

```javascript
module.exports = async function (source) {
    const done = this.async();
    // do something
    done(null, source);
}
```

For file operations, we use `promisify` so that we can better utilize `async/await`.

```javascript
const fs = require("fs");
const { promisify } = require("util");

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
```

Now let's get back to the previous requirement. The idea is simple. First, in this loader, we only receive files ending with `.vue`, which is configured in `webpack.config.js`. Therefore, we only focus on `.vue` files here. In this file, we need to get the directory where the file is located, then traverse it, and build a regular expression based on the `options` configured in `webpack.config.js` to match related files in the same directory, such as `script` and `style`. For files that match successfully, we read them, concatenate them according to the rules of `.vue` files, and then return them for `vue-loader` processing.

To start, let's handle the current directory, the current file being processed, and build the regular expression. Here, we pass `scss`, `css`, and `ts` as options. For the file `App.vue`, these will generate two regular expressions: `/App\.vue\.css$|App\.vue\.scss$/` and `App\.vue\.ts$`.

```javascript
const filePath = this.context;
const fileName = this.resourcePath.replace(filePath + "/", "");

const options = loaderUtils.getOptions(this) || {};
const styleRegExp = new RegExp(options.style.map(it => `${fileName}\\.${it}$`).join("|"));
const scriptRegExp = new RegExp(options.script.map(it => `${fileName}\\.${it}$`).join("|"));
```

Next, we match the paths of `script` and `style` files by traversing the directory.

```javascript
let stylePath = null;
let scriptPath = null;

const files = await readDir(filePath);
files.forEach(file => {
    if (styleRegExp.test(file)) stylePath = path.join(filePath, file);
    if (scriptRegExp.test(file)) scriptPath = path.join(filePath, file);
});
```

Then, for the `script` part, if a matching node exists and the original `.vue` file does not have a `script` tag, we asynchronously read the file and concatenate the code. If the extension is not `js`, for example, if it's written in `ts`, it will be treated as `lang="ts"`, and then concatenated into the `source` string.

```javascript
if (scriptPath && !/<script[\s\S]*?>/.test(source)) {
    const extName = scriptPath.split(".").pop();
    if (extName) {
        const content = await readFile(scriptPath, "utf8");
        const scriptTagContent = [
            "<script ",
            extName === "js" ? "" : `lang="${extName}" `,
            ">\n",
            content,
            "</script>",
        ].join("");
        source = source + "\n" + scriptTagContent;
    }
}
```

Afterwards, for the `style` section, if there is a matching node and the original `.vue` file does not contain a `style` tag, then the file is asynchronously read and the code is concatenated. If the file extension is not `.css`, for example if it is written in `.scss`, then it will be processed as `lang="scss"`. If the code contains the word `// scoped` on a single line, then this `style` section will be treated as scoped, and then concatenated into the string `source`.

```javascript
if (stylePath && !/<style[\s\S]*?>/.test(source)) {
    const extName = stylePath.split(".").pop();
    if (extName) {
        const content = await readFile(stylePath, "utf8");
        const scoped = /\/\/[\s]scoped[\n]/.test(content) ? true : false;
        const styleTagContent = [
            "<style ",
            extName === "css" ? "" : `lang="${extName}" `,
            scoped ? "scoped " : " ",
            ">\n",
            content,
            "</style>",
        ].join("");
        source = source + "\n" + styleTagContent;
    }
}
```

After that, use `done(null, source)` to trigger the callback and complete the `loader` process. The relevant code is as shown below, and the complete code is in the `webpack--loader` branch of `https://github.com/WindrunnerMax/webpack-simple-environment`.

```javascript
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const loaderUtils = require("loader-utils");

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

module.exports = async function (source) {
    const done = this.async();
    const filePath = this.context;
    const fileName = this.resourcePath.replace(filePath + "/", "");

    const options = loaderUtils.getOptions(this) || {};
    const styleRegExp = new RegExp(options.style.map(it => `${fileName}\\.${it}$`).join("|"));
    const scriptRegExp = new RegExp(options.script.map(it => `${fileName}\\.${it}$`).join("|"));

    let stylePath = null;
    let scriptPath = null;

    const files = await readDir(filePath);
    files.forEach(file => {
        if (styleRegExp.test(file)) stylePath = path.join(filePath, file);
        if (scriptRegExp.test(file)) scriptPath = path.join(filePath, file);
    });
```

```javascript
// If there is a matching node and the original `.vue` file does not contain a `script` tag
if (scriptPath && !/<script[\s\S]*?>/.test(source)) {
    const extName = scriptPath.split(".").pop();
    if (extName) {
        const content = await readFile(scriptPath, "utf8");
        const scriptTagContent = [
            "<script ",
            extName === "js" ? "" : `lang="${extName}" `,
            ">\n",
            content,
            "</script>",
        ].join("");
        source = source + "\n" + scriptTagContent;
    }
}

// If there is a matching node and the original `.vue` file does not contain a `style` tag
if (stylePath && !/<style[\s\S]*?>/.test(source)) {
    const extName = stylePath.split(".").pop();
    if (extName) {
        const content = await readFile(stylePath, "utf8");
        const scoped = /\/\/[\s]scoped[\n]/.test(content) ? true : false;
        const styleTagContent = [
            "<style ",
            extName === "css" ? "" : `lang="${extName}" `,
            scoped ? "scoped " : " ",
            ">\n",
            content,
            "</style>",
        ].join("");
        source = source + "\n" + styleTagContent;
    }
}

// console.log(stylePath, scriptPath, source);
done(null, source);
};
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://webpack.js.org/api/loaders/
https://juejin.cn/post/6844904054393405453
https://segmentfault.com/a/1190000014685887
https://segmentfault.com/a/1190000021657031
https://webpack.js.org/concepts/loaders/#inline
http://t.zoukankan.com/hanshuai-p-11287231.html
https://v2.vuejs.org/v2/guide/single-file-components.html
```