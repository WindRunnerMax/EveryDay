# 初探webpack之编写loader
`loader`加载器是`webpack`的核心之一，其用于将不同类型的文件转换为`webpack`可识别的模块，即用于把模块原内容按照需求转换成新内容，用以加载非`js`模块，通过配合扩展插件，在`webpack`构建流程中的特定时机注入扩展逻辑来改变构建结果，从而完成一次完整的构建。

* [初探webpack#1-编写plugin](./初探webpack之编写plugin.md)
* [初探webpack#2-搭建Vue开发环境](./初探webpack之搭建Vue开发环境.md)
* [初探webpack#3-编写loader](./初探webpack之编写loader.md)
* [初探webpack#4-单应用多端构建](./初探webpack之单应用多端构建.md)
* [初探webpack#5-解析器resolver](./初探webpack之解析器resolver.md)

## 概述
`webpack`是一个现代`JavaScript`应用程序的静态模块打包器`module bundler`，当`webpack`处理应用程序时，它会递归地构建一个依赖关系图`dependency graph`，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个`bundle`。  
使用`webpack`作为前端构建工具通常可以做到以下几个方面的事情: 

* 代码转换: `TypeScript`编译成`JavaScript`、`SCSS`编译成`CSS`等。
* 文件优化: 压缩`JavaScript`、`CSS`、`HTML`代码，压缩合并图片等。
* 代码分割: 提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
* 模块合并: 在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
* 自动刷新: 监听本地源代码的变化，自动重新构建、刷新浏览器页面，通常叫做模块热替换`HMR`。
* 代码校验: 在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
* 自动发布: 更新完代码后，自动构建出线上发布代码并传输给发布系统。

对于`webpack`来说，一切皆模块，而`webpack`仅能处理出`js`以及`json`文件，因此如果要使用其他类型的文件，都需要转换成`webpack`可识别的模块，即`js`或`json`模块。也就是说无论什么后缀的文件例如`png`、`txt`、`vue`文件等等，都需要当作`js`来使用，但是直接当作`js`来使用肯定是不行的，因为这些文件并不符合`js`的语法结构，所以就需需要`webpack loader`来处理，帮助我们将一个非`js`文件转换为`js`文件，例如`css-loader`、`ts-loader`、`file-loader`等等。  

在这里编写一个简单的`webpack loader`，设想一个简单的场景，在这里我们关注`vue2`，从实例出发，在平时我们构建`vue`项目时都是通过编写`.vue`文件来作为模块的，这种单文件组件的方式虽然比较清晰，但是如果一个组件比较复杂的话，就会导致整个文件相当大。当然`vue`中给我们提供了在`.vue`文件中引用`js`、`css`的方式，但是这样用起来毕竟还是稍显麻烦，所以我们可以通过编写一个`webpack loader`，在编写代码时将三部分即`html`、`js`、`css`进行分离，之后在`loader`中将其合并，再我们编写的`loader`完成处理之后再交与`vue-loader`去处理之后的事情。当然，关注点分离不等于文件类型分离，将一个单文件分成多个文件也只是对于代码编写过程中可读性的倾向问题，在这里我们重点关注的是编写一个简单的`loader`而不在于对于文件是否应该分离的探讨。文中涉及到的所有代码都在`https://github.com/WindRunnerMax/webpack-simple-environment`。

## 实现

### 搭建环境
在这里直接使用我之前的 [初探webpack之从零搭建Vue开发环境](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/初探webpack之搭建Vue开发环境.md) 中搭建的简单`vue + ts`开发环境，环境的相关的代码都在`https://github.com/WindRunnerMax/webpack-simple-environment`中的`webpack--vue-cli`分支中，我们直接将其`clone`并安装。

```
git clone https://github.com/WindrunnerMax/webpack-simple-environment.git
git checkout webpack--vue-cli
yarn install --registry https://registry.npm.taobao.org/
```

之后便可以通过运行`yarn dev`来查看效果，在这里我们先打印一下此时的目录结构。

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

### 编写loader
在编写`loader`之前，我们先关注一下上边目录结构中的`.vue`文件，因为此时我们需要将其拆分，但是如何将其拆分是需要考虑一下的，为了尽量不影响正常的使用，在这里采用了如下的方案。

* 将`template`部分留在了`.vue`文件中，因为一些插件例如`Vetur`是会检查`template`中的一些语法，例如将其抽离出作为`html`文件，对于`@click`等语法`prettier`是会有`error`提醒的，而且如果不存在`.vue`文件的话，对于在`TS`中使用`declare module "*.vue"`也需要修改，所以本着最小影响的原则我们将`template`部分留在了`.vue`文件中，保存了`.vue`这个声明的文件。
* 对于`script`部分，我们将其抽出，如果是使用`js`编写的，那么就将其命名为`.vue.js`，同样`ts`编写的就命名为`.vue.ts`。
* 对于`style`部分，我们将其抽出，与`script`部分采用同样的方案，使用`css`、`scss`、`less`也分别命名为`.vue.css`、`.vue.scss`、`.vue.less`，而对于`scoped`我们通过注释的方式来实现。

通过以上的修改，我们将文件目录再次打印出来，重点关注于`.vue`文件的分离。

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

现在我们开始正式编写这个`loader`了，首先需要简单说明一下`loader`的输入与输出以及常用的模块。

* 简单来说`webpack loader`是一个从`string`到`string`的函数，输入的是字符串的代码，输出也是字符串的代码。
* 通常来说对于各种文件的处理`loader`已经都有很好的轮子了，我们自己来编写的`loader`通常是用来做代码处理的，也就是说在`loader`中拿到`source`之后，我们将其转换为`AST`树，然后在这个`AST`上进行一些修改，之后再将其转换为字符串代码之后进行返回。
* 从字符串到`AST`语法分析树是为了得到计算机容易识别的数据结构，在`webpack`中自带了一些工具，`acorn`是代码转`AST`的工具，`estraverse`是`AST`遍历工具，`escodegen`是转换`AST`到字符串代码的工具。
* 既然`loader`是字符串到字符串的，那么在代码转换为`AST`处理之后需要转为字符串，然后再传递到下一个`loader`，下一个`loader`可能又要进行相同的转换，这样还是比较耗费时间的，所以可以通过`speed-measure-webpack-plugin`进行速率打点，以及`cache-loader`来存储`AST`。
* `loader-utils`是在`loader`中常用的辅助类，常用的有`urlToRequest`绝对路径转`webpack`请求的相对路径，`urlToRequest`来获取配置`loader`时传递的参数。

由于我们在这里这个需求是用不到`AST`相关的处理的，所以还是比较简单的一个实例，首先我们需要写一个`loader`文件，然后配置在`webpack.config.js`中，在根目录我们建立一个`vue-multiple-files-loader.js`，然后在`webpack.config.js`的`module.rule`部分找到`test: /\.vue$/`，将这部分修改为如下配置。  

```javascript
// ...
{
    test: /\.vue$/,
    use: [
        "vue-loader",
        {
            loader: "./vue-multiple-files-loader",
            options: {
                // 匹配的文件拓展名
                style: ["scss", "css"],
                script: ["ts"],
            },
        },
    ],
}
// ...
```

首先可以看到在`"vue-loader"`之后我们编写了一个对象，这个对象的`loader`参数是一个字符串，这个字符串是将来要被传递到`require`当中的，也就是说在`webpack`中他会自动帮我们把这个模块`require`即`require("./vue-multiple-files-loader")`。`webpack loader`是有优先级的，在这里我们的目标是首先经由`vue-multiple-files-loader`这个`loader`将代码处理之后再交与`vue-loader`进行处理，所以我们要将`vue-multiple-files-loader`写在`vue-loader`后边，这样就会首先使用`vue-multiple-files-loader`代码了。我们通过`options`这个对象传递参数，这个参数可以在`loader`中拿到。    

关于`webpack loader`的优先级，首先定义`loader`配置的时候，除了`loader`与`options`选项，还有一个`enforce`选项，其可接受的参数分别是`pre: `前置`loader`、`normal: `普通`loader`、`inline: `内联`loader`、`post: `后置`loader`，其优先级也是`pre > normal > inline > post`，那么相同优先级的`loader`就是从右到左、从下到上，从上到下很好理解，至于从右到左，只是`webpack`选择了`compose`方式，而不是`pipe`的方式而已，在技术上实现从左往右也不会有难度，就是函数式编程中的两种组合方式而已。此外，我们在`require`的时候还可以跳过某些`loader`，`!`跳过`normal loader`、`-!`跳过`pre`和`normal loader`、`!!`跳过`pre normal`和`post loader`，比如`require("!!raw!./script.coffee")`，关于`loader`的跳过，`webpack`官方的建议是，除非从另一个`loader`处理生成的，一般不建议主动使用。 

现在我们已经处理好`vue-multiple-files-loader.js`这个文件的创建以及`loader`的引用了，那么我们可以通过他来编写代码了，通常来说，`loader`一般是比较耗时的应用，所以我们通过异步来处理这个`loader`，通过`this.async`告诉`loader-runner`这个`loader`将会异步地回调，当我们处理完成之后，使用其返回值将处理后的字符串代码作为参数执行即可。

```javascript
module.exports = async function (source) {
    const done = this.async();
    // do something
    done(null, source);
}
```

对于文件的操作，我们使用`promisify`来处理，以便我们能够更好地使用`async/await`。

```javascript
const fs = require("fs");
const { promisify } = require("util");

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
```

下面我们回到上边的需求上来，思路很简单，首先我们在这个`loader`中仅会收到以`.vue`结尾的文件，这是在`webpack.config.js`中配置的，所以我们在这里仅关注`.vue`文件，那么在这个文件下，我们需要获取这个文件所在的目录，然后将其遍历，通过`webpack.config.js`中配置的`options`来构建正则表达式去匹配同级目录下的`script`与`style`的相关文件，对于匹配成功的文件我们将其读取然后按照`.vue`文件的规则拼接到`source`中，然后将其返回之后将代码交与`vue-loader`处理即可。  

那么我们首先处理一下当前目录，以及当前处理的文件名，还有正则表达式的构建，在这里我们传递了`scss`、`css`和`ts`，那么对于`App.vue`这个文件来说，将会构建`/App\.vue\.css$|App\.vue\.scss$/`和`App\.vue\.ts$`这两个正则表达式。

```javascript
const filePath = this.context;
const fileName = this.resourcePath.replace(filePath + "/", "");

const options = loaderUtils.getOptions(this) || {};
const styleRegExp = new RegExp(options.style.map(it => `${fileName}\\.${it}$`).join("|"));
const scriptRegExp = new RegExp(options.script.map(it => `${fileName}\\.${it}$`).join("|"));
```

之后我们通过遍历目录的方式，来匹配符合要求的`script`和`style`的文件路径。

```javascript
let stylePath = null;
let scriptPath = null;

const files = await readDir(filePath);
files.forEach(file => {
    if (styleRegExp.test(file)) stylePath = path.join(filePath, file);
    if (scriptRegExp.test(file)) scriptPath = path.join(filePath, file);
});
```

之后对于`script`部分，存在匹配节点且原`.vue`文件不存在`script`标签，则异步读取文件之后将代码进行拼接，如果拓展名不为`js`的话，例如是`ts`编写的那么就会将其作为`lang="ts"`去处理，之后将其拼接到`source`这个字符串中。

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

之后对于`style`部分，存在匹配节点且原`.vue`文件不存在`style`标签，则异步读取文件之后将代码进行拼接，如果拓展名不为`css`的话，例如是`scss`编写的那么就会将其作为`lang="scss"`去处理，如果代码中存在单行的`// scoped`字样的话，就会将这个`style`部分作`scoped`处理，之后将其拼接到`source`这个字符串中。

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

在之后使用`done(null, source)`触发回调完成`loader`的流程，相关代码如下所示，完整代码在`https://github.com/WindrunnerMax/webpack-simple-environment`中的`webpack--loader`分支当中。

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

    // 存在匹配节点且原`.vue`文件不存在`script`标签
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

    // 存在匹配节点且原`.vue`文件不存在`style`标签
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


## 每日一题

- <https://github.com/WindrunnerMax/EveryDay>

## 参考

- <https://webpack.js.org/api/loaders/>
- <https://juejin.cn/post/6844904054393405453>
- <https://segmentfault.com/a/1190000014685887>
- <https://segmentfault.com/a/1190000021657031>
- <https://webpack.js.org/concepts/loaders/#inline>
- <http://t.zoukankan.com/hanshuai-p-11287231.html>
- <https://v2.vuejs.org/v2/guide/single-file-components.html>
