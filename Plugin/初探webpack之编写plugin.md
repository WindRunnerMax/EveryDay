# 初探webpack之编写plugin
`webpack`通过`plugin`机制让其使用更加灵活，以适应各种应用场景，当然也大大增加了`webpack`的复杂性，在`webpack`运行的生命周期中会广播出许多事件，`plugin`可以`hook`这些事件，在合适的时机通过`webpack`提供的`API`改变其在处理过程中的输出结果。

初探`webpack`系列相关文章:

* [初探webpack案例#1-编写plugin](./初探webpack之编写plugin.md)
* [初探webpack案例#2-搭建Vue开发环境](./初探webpack之搭建Vue开发环境.md)
* [初探webpack案例#3-编写loader](./初探webpack之编写loader.md)
* [初探webpack案例#4-单应用多端构建](./初探webpack之单应用多端构建.md)
* [初探webpack案例#5-解析器resolver](./初探webpack之解析器resolver.md)

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

在`webpack`应用中有两个核心:
* 模块转换器，用于把模块原内容按照需求转换成新内容，可以加载非`js`模块；
* 扩展插件，在`webpack`构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。


本文编写的就是编写一个简单的`webpack`插件，设想一个简单的场景，假如我们实现了一个多页的`Vue`应用，每个打包的页面都会共享一个相同的头部和底部，也就是顶部`navigation bar`和底部的`footer`。因为类似于`Vue`这种框架都是在运行时才会加载出来头部与底部，而这部分代码实际上完全可以作为一个独立的公用子项目去开发，没必要在多页应用的每个页面都引用一次组件再让框架去解析组件。另外在多页应用页面之间跳转时，如果编写一个头部组件在每个页面组件内部去引用的话，很容易因为需要加载解析`JS`的时间比较长从而出现导航栏闪烁的问题。  

如果要解决上边提到的问题的话，可以采用的一个方案就是使用静态页面片，我们可以将头部和底部的页面片在`webpack`打包的时候将其注入到要打包完成的`html`页面中，这样的话不但可以节省一些框架解析组件的`JS`消耗，而且还可以有更好的`SEO`表现。虽然只是一个头部与底部并未承载多少信息，但是如果是在`SSR`场景下大量的重复`CPU`任务，提升一点对于整体来说还是有一个比较大的提高的，就像图形学中画线的算法一样，架不住运算次数太多。此外这样可以比较好的解决组件头部闪烁的问题，因为其是随着`HTML`一并返回的，所以能立即渲染在页面上不需要`JS`的加载解析，同样对于骨架屏而言也是可以采用`webpack`注入页面片的这种方案加载，文中涉及到的所有代码都在`https://github.com/WindRunnerMax/webpack-simple-environment`。

## 实现

### 搭建环境
初探`webpack`，那么便从搭建简单的`webpack`环境开始，首先是初始化并安装依赖。

```shell
$ yarn init -y
$ yarn add -D webpack webpack-cli cross-env
```

首先可以尝试一下`webpack`打包程序，`webpack`可以零配置进行打包，目录结构如下: 

```
webpack-simple
├── package.json
├── src
│   ├── index.js
│   └── sum.js
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

之后写入一个打包的命令。

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
执行`npm run build`，默认会调用`node_modules/.bin`下的`webpack`命令，内部会调用`webpack-cli`解析用户参数进行打包，默认会以`src/index.js`作为入口文件。

```shell
$ npm run build
```

执行完成后，会出现警告，这里还提示我们默认`mode`为`production`，此时可以看到出现了`dist`文件夹，此目录为最终打包出的结果，并且内部存在一个`main.js`，其中`webpack`会进行一些语法分析与优化，可以看到打包完成的结构是。

```javascript
// src/main.js
(()=>{"use strict";console.log(2)})();
```


### 配置webpack
当然我们打包时一般不会采用零配置，此时我们就首先新建一个文件`webpack.config.js`。既然`webpack`说默认`mode`是`production`，那就先进行一下配置解决这个问题，因为只是一个简单的`webpack`环境我们就不区分`webpack.dev.js`和`webpack.prod.js`进行配置了，简单的使用`process.env.NODE_ENV`在`webpack.config.js`中区分一下即可。在这里我们主要关心`dist`打包过后的文件，在这里就不进行`dev`环境的处理以及`webpack-dev-server`的搭建了，`cross-env`是用以配置环境变量的插件。


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
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path:path.resolve(__dirname, "dist")
    }
}
```

不过按照上边的需求来说，我们不光是需要处理`js`文件的，还需要处理`html`文件，这里就需要使用`html-webpack-plugin`插件。

```shell
$ yarn add -D html-webpack-plugin
```


之后在`webpack.config.js`中进行配置，简单配置一下相关的输入输出和压缩信息，另外如果要是想每次打包删除`dist`文件夹的话可以考虑使用`clean-webpack-plugin`插件。

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
            filename: "index.html", // 打包出来的文件名 根路径是`module.exports.output.path`
            template: path.resolve("./public/index.html"),
            hash: true, // 在引用资源的后面增加`hash`戳
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
            },
            inject: "body", // `head`、`body`、`true`、`false`
            scriptLoading: "blocking" // `blocking`、`defer`
        })
    ]
}
```


### 编写插件
之后到了正文环节，此时我们要编写一个插件去处理上边提到的需求，具体实现来看，我们需要的是首先在`html`中留下一个类似于`<!-- inject:name="head" -->`的标记注释，之后在`webpack`打包时对于`html`文件进行一次正则匹配，将注释相关的信息替换成页面片，通过`name`进行区分到底要加载哪一个页面片。另外个人感觉实际上编写`webpack`插件的时候还是首先参考其他人编写的`webpack`插件的实现，自己去翻阅文档成本查阅各种`hook`的成本有点高。  

对于这个插件我们直接在根目录建立一个`static-page-slice.js`，插件由一个构造函数实例化出来，构造函数定义`apply`方法，在`webpack`处理插件的时候，`apply`方法会被`webpack compiler`调用一次。`apply`方法可以接收一个`webpack compiler`对象的引用，从而可以在回调函数中访问到`compiler`对象。一个最基础的`Plugin`的结构是类似于这样的:

```javascript
class BasicPlugin{
    // 在构造函数中获取用户给该插件传入的配置
    constructor(options){
        this.options = options || {};
    }
    
    // `Webpack`会调用`BasicPlugin`实例的`apply`方法给插件实例传入`compiler`对象
    apply(compiler){
        compiler.hooks.someHook.tap("BasicPlugin", (params) => {
            /* ... */
        });
    }
}
  
// 导出 Plugin
module.exports = BasicPlugin;
```

在开发`plugin`时最常用的两个对象就是`compiler`和`compilation`，它们是`plugin`和`webpack`之间的桥梁，`compiler`和`compilation`的含义如下: 
* ` compiler`对象包含了`webpack`环境所有的的配置信息，包含`options`、`loaders`、`plugins`这些信息，这个对象在`webpack`启动时候被实例化，它是全局唯一的，可以简单地把它理解为`webpack`实例。
* `compilation`对象包含了当前的模块资源、编译生成资源、变化的文件等，当`webpack`以开发模式运行时，每当检测到一个文件变化，一次新的`compilation`将被创建，`compilation`对象也提供了很多事件回调供插件做扩展，通过`compilation`也能读取到`compiler`对象。

`compiler`和`compilation`的区别在于`: compiler`代表了整个`webpack`从启动到关闭的生命周期，而`compilation`只是代表了一次新的编译，与之相关的信息可以参考`https://webpack.docschina.org/api/compiler-hooks/`。  

`webpack`就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果，这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理，插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理，`webpack`通过`tapable`来组织这条复杂的生产线`https://github.com/webpack/tapable`。  

在这里我们选择在`compiler`钩子的`emit`时期处理资源文件，即是在输出`asset`到`output`目录之前执行，在此时要注意`emit`是一个`AsyncSeriesHook`也就是异步的`hook`，所以我们需要使用`Tapable`的`tapAsync`或者`tapPromise`，如果选取的是同步的`hook`，则可以使用`tap`。

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

接下来我们正式开始处理逻辑，首先此处我们需要先判断这个文件的类型，我们只需要处理`html`文件，所以我们需要先一下是否为`html`文件，之后就是一个正则匹配的过程，匹配到注释信息以后，将其替换为页面片，这里的页面片我们就直接在此处使用`Promise`模拟一下异步过程就好，之后便可以在`webpack`中引用并成功打包了。

```javascript
// static-page-slice.js
const simulateRemoteData = key => {
    const data = {
        header: "<div>HEADER</div>",
        footer: "<div>FOOTER</div>",
    }
    return Promise.resolve(data[key]);
}


class StaticPageSlice {
    constructor(options) {
        this.options = options || {}; // 传递参数
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
                    const matchedValues = target.matchAll(/<!-- inject:name="(\S*?)" -->/g); // `matchAll`函数需要`Node v12.0.0`以上
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
            filename: "index.html", // 打包出来的文件名 根路径是`module.exports.output.path`
            template: path.resolve("./public/index.html"),
            hash: true, // 在引用资源的后面增加`hash`戳
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
            },
            inject: "body", // `head`、`body`、`true`、`false`
            scriptLoading: "blocking" // `blocking`、`defer`
        }),
        new StaticPageSlice({
            url: "https://www.example.com/"
        })
    ]
}
```

之后便可以看到打包前后的`html`文件的差别了。

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

`webpack5`对于`hooks`有一次更新，使用上边的插件会提示: 

```
(node:5760) [DEP_WEBPACK_COMPILATION_ASSETS] DeprecationWarning: Compilation.assets will be frozen in future, all modifications are deprecated.
BREAKING CHANGE: No more changes should happen to Compilation.assets after sealing the Compilation.
        Do changes to assets earlier, e. g. in Compilation.hooks.processAssets.
        Make sure to select an appropriate stage from Compilation.PROCESS_ASSETS_STAGE_*.
```

所以我们可以根据其提示提前将资源进行处理，可以实现同样的效果。

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
        this.options = options || {}; // 传递参数
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
                const matchedValues = target.matchAll(/<!-- inject:name="(\S*?)" -->/g); // `matchAll`函数需要`Node v12.0.0`以上
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

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://webpack.docschina.org/concepts/>
- <https://juejin.cn/post/6854573216108085261>
- <https://webpack.docschina.org/api/plugins/>
- <https://juejin.cn/post/6844903942736838670>
- <https://segmentfault.com/a/1190000012840742>
- <https://segmentfault.com/a/1190000021821557>
- <https://webpack.docschina.org/api/compilation-hooks/>
- <https://webpack.docschina.org/api/normalmodulefactory-hooks/>
