# 初探webpack之搭建Vue开发环境
平时我们可以用`vue-cli`很方便地搭建`Vue`的开发环境，`vue-cli`确实是个好东西，让我们不需要关心`webpack`等一些繁杂的配置，然后直接开始写业务代码，但这会造成我们过度依赖`vue-cli`，忽视了`webpack`的重要性，当遇到一些特殊场景时候，例如`Vue`多入口的配置、优化项目的打包速度等等时可能会无从下手。当然现在才开始学习`vue2 + webpack`可能有点晚，毕竟现在都在考虑转移到`vue3 + vite`了。

## 描述
文中相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment`中的`webpack--vue-cli`分支中。`webpack`默认情况下只支持`js`、`json`格式的文件，所以要把`css`、`img`、`html`、`vue`等等这些文件转换成`js`，这样`webpack`才能识别，而实际上搭建`Vue`的开发环境，我们的主要目的是处理`.vue`单文件组件，最主要的其实就是需要相对应的`loader`解析器，主要工作其实就在这里了，其他的都是常规问题了。

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


### webpack配置文件
当然我们打包时一般不会采用零配置，此时我们就首先新建一个文件`webpack.config.js`。既然`webpack`说默认`mode`是`production`，那就先进行一下配置解决这个问题，因为只是一个简单的`webpack`环境我们就不区分`webpack.dev.js`和`webpack.prod.js`进行配置了，简单的使用`process.env.NODE_ENV`在`webpack.config.js`中区分一下即可，`cross-env`是用以配置环境变量的插件。


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

### HtmlWebpackPlugin插件
我们不光是需要处理`js`文件的，还需要处理`html`文件，这里就需要使用`html-webpack-plugin`插件。

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

之后新建`/public/index.html`文件，输入将要被注入的`html`代码。


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
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```

启动`npm run build`，我们就可以在`/dist/index.html`文件中看到注入成功的代码了。

```html
<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><title>Webpack Template</title></head><body><div id=app></div><!-- built files will be auto injected --><script src=index.js?94210d2fc63940b37c8d></script></body></html>
```


### webpack-dev-server

平时开发项目，预览效果时，一般直接访问某个`ip `和端口进行调试的，`webpack-dev-server`就是用来帮我们实现这个功能，他实际上是基于`express`来实现`web`服务器的功能，另外`webpack-dev-server`打包之后的`html`和`bundle.js`是放在内存中的，目录里是看不到的，一般会配合`webpack`的热更新来使用。

```shell
$ yarn add -D webpack-dev-server
```

接下来要在`webpack.config.js`配置`devServer`环境，包括`package.json`的配置。

```javascript
// webpack.config.js

// ...
module.exports = {
    // ...
    devServer: {
        hot: true, // 开启热更新
        open: true, // 自动打开浏览器预览
        compress: true, // 开启gzip
        port: 3000  //不指定端口会自动分配
    },
    // ...
}
```

```javascript
// package.json
// ...
"scripts": {
    "build": "cross-env NODE_ENV=production webpack --config webpack.config.js",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config webpack.config.js"
},
// ...
```

随后运行`npm run dev`即可自动打开浏览器显示预览，当然按照上边的代码来看页面是空的，但是可以打开控制台发现确实加载了`DOM`结构，并且`Console`中显示了我们`console`的`2`，并且此时如果修改了源代码文件，比如在`DOM`中加入一定的结构，发现`webpack`是可以进行`HMR`的。

### 搭建Vue基础环境
首先我们可以尝试一下对于`.js`中编写的`Vue`组件进行构建，即不考虑单文件组件`.vue`文件的加载，只是构建一个`Vue`对象的实例，为了保持演示的代码尽量完整，此时我们在`src`下建立一个`main.js`出来作为之后编写代码的主入口，当然我们还需要在`index.js`中引入`main.js`，也就是说此时代码的名义上的入口是`main.js`并且代码也是在此处编写，实际对于`webpack`来说入口是`index.js`，截至此时的`commit`为`625814a`。  

首先我们需要安装`Vue`，之后才能使用`Vue`进行开发。

```shell
$ yarn add vue
```

之后在`/src/main.js`中编写如下内容。

```javascript
// /src/main.js
import Vue from "vue";

new Vue({
    el: "#app",
    template: "<div>Vue Example</div>"
})
```

另外要注意这里需要在`webpack.config.js`中加入如下配置，当然这里只是为了处理`Vue`为`compiler`模式，而默认是`runtime`模式， 即引入指向`dist/vue.runtime.common.js`，之后我们处理单文件组件`.vue`文件之后，就不需要这个修改了，此时我们重新运行`npm run dev`，就可以看到效果了。

```javascript
// webpack.config.js

// ...
module.exports = {
    // ...
    resolve: {
        alias: {
          "vue$": "vue/dist/vue.esm.js" 
        }
    },
    // ...
}
```

之后我们正式开始处理`.vue`文件，首先新建一个`App.vue`文件在根目录，此时的目录结构如下所示。

```
webpack-simple-environment
├── dist
│   ├── index.html
│   └── index.js
├── public
│   └── index.html
├── src
│   ├── App.vue
│   ├── index.js
│   ├── main.js
│   └── sum.js
├── jsconfig.js
├── LICENSE
├── package.json
├── README.md
├── webpack.config.js
└── yarn.lock
```

之后我们修改一下`main.js`以及`App.vue`这两个文件。

```javascript
import Vue from "vue";
import App from "./App.vue";

const app = new Vue({
    ...App,
});
app.$mount("#app");
```

```html
<!-- App.vue -->
<template>
    <div class="example">{{ msg }}</div>
</template>

<script>
export default {
    name: "App",
    data: () => ({
        msg: "Example"
    })
}
</script>

<style scoped>
    .example{
        font-size: 30px;
    }
</style>
```

之后便是使用`loader`进行处理的环节了，因为我们此时需要对`.vue`文件进行处理，我们需要使用`loader`处理他们。

```shell
$ yarn add -D vue-loader vue-template-compiler css-loader vue-style-loader
```

之后需要在`webpack.config.js`中编写相关配置，之后我们运行`npm run dev`就能够成功运行了，此时的`commit id`为`831d99d`。

```javascript
// webpack.config.js

// ...
const VueLoaderPlugin = require("vue-loader/lib/plugin")

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: "vue-loader",
            },
            {
                test: /\.css$/,
                use: [
                    "vue-style-loader",
                    "css-loader"
                ],
            },
        ],
    },
    plugins:[
        new VueLoaderPlugin(),
        // ...
    ]
}
```

### 处理资源文件
通常我们需要处理资源文件，同样是需要使用`loader`进行处理，主要是对于图片进行处理，搭建资源文件处理完成后的`commit id`为`f531cc1`。

```shell
$ yarn add -D url-loader file-loader
```

```javascript
// webpack.config.js

// ...
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            esModule: false,
                            limit: 8192, //小于`8K`，用`url-loader`转成`base64` ，否则使用`file-loader`来处理文件
                            fallback: {
                                loader: "file-loader",
                                options: {
                                    esModule: false,
                                    name: "[name].[hash:8].[ext]",
                                    outputPath: "static", //打包之后文件存放的路径, dist/static
                                }
                            },
                        }
                    }
                ]
            },
            // ...
        ],
    },
    // ...
}
```

```html
<!-- App.vue -->
<template>
    <div>
        <img src="./static/vue.jpg" alt="" class="vue">
        <img src="./static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
    </div>
</template>

<script>
export default {
    name: "App",
    data: () => ({
        msg: "Example"
    })
}
</script>

<style scoped>
    .vue{
        width: 100px;
    }
    .vue-large{
        width: 300px;
    }
    .example{
        font-size: 30px;
    }
</style>
```

之后运行`npm run dev`，就可以看到效果了，可以在控制台的`Element`中看到，小于`8K`的图片被直接转成了`base64`，而大于`8K`的文件被当作了外部资源进行引用了。

```html
<!-- ... -->
<img data-v-7ba5bd90="" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASA..." alt="" class="vue">
<img data-v-7ba5bd90="" src="http://localhost:3000/static/vue-large.b022422b.png" alt="" class="vue-large"> 
<!-- ... -->
```

### 处理Babel
使用`babel`主要是为了做浏览器的兼容，`@babel/core`是`babel`核心包，`@babel/preset-env`是集成`bebal`一些可选方案，可以通过修改特定的参数来使用不同预设，`babel-loader`可以使得`ES6+`转`ES5`，`babel`默认只转换语法而不转换新的`API`，`core-js`可以让不支持`ES6+ API`的浏览器支持新`API`，当然也可以用`babel-polyfill`，相关区别可以查阅一下，建议用`core-js`，处理完成`babel`的`commit id`为`5e0f5ad`。


```shell
$ yarn add -D @babel/core @babel/preset-env babel-loader
```
```shell
$ yarn add core-js@3
```

之后在根目录新建一个`babel.config.js`，然后将以下代码写入。

```javascript
// babel.config.js
module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 3,
                "modules": false
            }
        ]
    ]
}
```

之后修改一下`App.vue`，写一个较新的语法`?.`。

```html
<!-- App.vue -->
<template>
    <div>
        <img src="./static/vue.jpg" alt="" class="vue">
        <img src="./static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
        <button @click="toast">按钮</button>
    </div>
</template>

<script>
export default {
    name: "App",
    data: () => ({
        msg: "Example"
    }),
    methods: {
        toast: function(){
            window?.alert("ExampleMessage");
        }
    }
}
</script>

<style scoped>
    .vue{
        width: 100px;
    }
    .vue-large{
        width: 300px;
    }
    .example{
        font-size: 30px;
    }
</style>
```

还需要修改一下`webpack.config.js`。

```javascript
// webpack.config.js

// ...
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
        ],
    },
    // ...
}
```

之后运行`npm run dev`就可以看到运行起来并且功能正常了，并且这个`?.`的语法在此处实际上是进行了一次转码，可以在控制台的`Source`里搜索`ExampleMessage`这个字符串就可以定位到相关位置了，然后就可以看到转码的结果了。

```javascript
window?.alert("ExampleMessage");
// ->
window === void 0 ? void 0 : window.alert("ExampleMessage");
```

### 处理Css
通常我们一般不只写原生`css`，我一般使用`sass`这个`css`框架，所以此处需要安装`sass`以及`sass-loader`，`sass-loader`请使用低于`@11.0.0`的版本，`sass-loader@11.0.0`不支持`vue@2.6.14`，此外我们通常还需要处理`CSS`不同浏览器兼容性，所以此处需要安装`postcss-loader`，当然`postcss.config.js`也是可以通过`postcss.config.js`文件配置一些信息的，比如`@/`别名等，另外需要注意，在`use`中使用`loader`的解析顺序是由下而上的，例如下边的对于`scss`文件的解析，是先使用`sass-loader`再使用`postcss-loader`，依次类推，处理完成`sass`和`postcss`的`commit id`为`f679718`。


```shell
yarn add -D sass sass-loader@10.1.1 postcss postcss-loader 
```

之后简单写一个示例，新建文件`/src/common/styles.scss`，然后其中写一个变量`$color-blue: #4C98F7;`。

```css
$color-blue: #4C98F7;
```

之后修改`App.vue`和`webpack.config.js`，然后运行`npm run dev`就可以看到`Example`这个文字变成了蓝色。

```html
<!-- App.vue -->
<template>
    <div>
        <img src="./static/vue.jpg" alt="" class="vue">
        <img src="./static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
        <button @click="toast">按钮</button>
    </div>
</template>

<script>
export default {
    name: "App",
    data: () => ({
        msg: "Example"
    }),
    methods: {
        toast: function(){
            window?.alert("ExampleMessage");
        }
    }
}
</script>

<style scoped lang="scss">
    @import "./common/styles.scss";
    .vue{
        width: 100px;
    }
    .vue-large{
        width: 300px;
    }
    .example{
        color: $color-blue;
        font-size: 30px;
    }
</style>
```

```javascript
// webpack.config.js

// ...
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.css$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    "postcss-loader"
                ],
            },
            {
                test: /\.(scss)$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ]
            },
            // ...
        ],
    },
    // ...
}

```

### 加入VueRouter
使用`Vue`大概率是需要`Vue`全家桶的`VueRouter`的，此处直接安装`vue-router`。

```shell
$ yarn add vue-router
```

在这里改动比较多，主要是建立了`src/router/index.js`文件，之后建立了`src/components/tab-a.vue`与`src/components/tab-b.vue`两个组件，以及承载这两个组件的`src/views/framework.vue`组件，之后将`App.vue`组件仅作为一个承载的容器，以及`src/main.js`引用了`VueRouter`，主要是一些`VueRoute`的一些相关的用法，改动较多，建议直接运行版本库，相关`commit id`为`96acb3a`。

```html
<!-- src/components/tab-a.vue -->
<template>
    <div>Example A</div>
</template>

<script>
export default {
    name: "TabA"
}
</script>
```

```html
<!-- src/components/tab-b.vue -->
<template>
    <div>Example B</div>
</template>

<script>
export default {
    name: "TabB"
}
</script>
```

```html
<!-- src/views/framework.vue -->
<template>
    <div>
        <img src="../static/vue.jpg" alt="" class="vue">
        <img src="../static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
        <button @click="toast">按钮</button>
        <div>
            <router-link to="/tab-a">TabA</router-link>
            <router-link to="/tab-b">TabB</router-link>
            <router-view />
        </div>

    </div>
</template>

<script>
export default {
    name: "FrameWork",
    data: () => ({
        msg: "Example"
    }),
    methods: {
        toast: function(){
            window?.alert("ExampleMessage");
        }
    }
}
</script>

<style scoped lang="scss">
    @import "../common/styles.scss";
    .vue{
        width: 100px;
    }
    .vue-large{
        width: 300px;
    }
    .example{
        color: $color-blue;
        font-size: 30px;
    }
</style>
```

```html
<!-- src/App.vue -->
<template>
    <div>
        <router-view />
    </div>
</template>
```

```javascript
// src/router/index.js
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import FrameWork from "../views/framework.vue";
import TabA from "../components/tab-a.vue";
import TabB from "../components/tab-b.vue";


const routes = [{
    path: "/",
    component: FrameWork,
    children: [
        {
            path: "tab-a",
            name: "TabA",
            component: TabA,
        },{
            path: "tab-b",
            name: "TabB",
            component: TabB,
        } 
    ]
}]

export default new VueRouter({
    routes
})
```

```javascript
// src/main.js
import Vue from "vue";
import App from "./App.vue";
import Router from "./router/index";

const app = new Vue({
    router: Router,
    ...App,
});
app.$mount("#app");
```


### 加入Vuex
同样使用`Vue`也是需要`Vue`全家桶的`Vuex`的，此处直接安装`vuex`。

```shell
yarn add vuex
```

之后主要是新建了`src/store/index.js`作为`store`，修改了`src/views/framework.vue`实现了一个从`store`中取值并且修改值的示例，最后在`src/main.js`引用了`store`，相关`commit id`为`a549808`。

```javascript
// src/store/index.js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
    text: "Value"
}

const getters = {
    getText(state) {
        return state.text;
    }
}

const mutations = {
    setText: (state, text) => {
        state.text = text;
    }
}

export default new Vuex.Store({
    state,
    mutations,
    getters
});
```

```html
<!-- src/views/framework.vue -->
<template>
    <div>
        <section>
            <img src="../static/vue.jpg" alt="" class="vue">
            <img src="../static/vue-large.png" alt="" class="vue-large">
            <div class="example">{{ msg }}</div>
            <button @click="toast">Alert</button>
        </section>
        <section>
            <router-link to="/tab-a">TabA</router-link>
            <router-link to="/tab-b">TabB</router-link>
            <router-view />
        </section>
        <section>
            <button @click="setVuexValue">Set Vuex Value</button>
            <div>{{ text }}</div>
        </section>

    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "FrameWork",
    data: () => ({
        msg: "Example"
    }),
    computed: mapState({
        text: state => state.text
    }),
    methods: {
        toast: function(){
            window?.alert("ExampleMessage");
        },
        setVuexValue: function(){
            this.$store.commit("setText", "New Value");
        }
    }
}
</script>

<style scoped lang="scss">
    @import "../common/styles.scss";
    .vue{
        width: 100px;
    }
    .vue-large{
        width: 300px;
    }
    .example{
        color: $color-blue;
        font-size: 30px;
    }
    section{
        margin: 10px;
    }
</style>
```

```javascript
// src/main.js
import Vue from "vue";
import App from "./App.vue";
import Store from "./store";
import Router from "./router";

const app = new Vue({
    router: Router,
    store: Store,
    ...App,
});
app.$mount("#app");
```

### 配置ESLint
正常情况下开发我们是需要配置`ESLint`以及`prettier`来规范代码的，所以我们需要配置一下，配置完成`ESLint`的`commit id`为`9ca1b7b`。

```shell
$ yarn add -D eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-vue prettier vue-eslint-parser
```

根目录下建立`.editorconfig`、`.eslintrc.js`、`.prettierrc.js`，进行一些配置，当然这都是可以自定义的，不过要注意`prettier`和`eslint`规则冲突的问题。

```
<!-- .editorconfig -->
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 4
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

```javascript
// .prettierrc.js
module.exports = {
    "printWidth": 100, // 指定代码长度，超出换行
    "tabWidth": 4, // tab 键的宽度
    "useTabs": false, // 不使用tab
    "semi": true, // 结尾加上分号
    "singleQuote": false, // 使用单引号
    "quoteProps": "preserve", // 不要求对象字面量属性是否使用引号包裹
    "jsxSingleQuote": false, // jsx 语法中使用单引号
    "trailingComma": "es5", // 确保对象的最后一个属性后有逗号
    "bracketSpacing": true, // 大括号有空格 { name: 'rose' }
    "jsxBracketSameLine": false, // 在多行JSX元素的最后一行追加 >
    "arrowParens": "avoid", // 箭头函数，单个参数不强制添加括号
    "requirePragma": false, // 是否严格按照文件顶部的特殊注释格式化代码
    "insertPragma": false, // 是否在格式化的文件顶部插入Pragma标记，以表明该文件被prettier格式化过了
    "proseWrap": "preserve", // 按照文件原样折行
    "htmlWhitespaceSensitivity": "ignore", // html文件的空格敏感度，控制空格是否影响布局
    "endOfLine": "lf" // 结尾是 \n \r \n\r auto
}
```

```javascript
// .eslintrc.js
module.exports = {
    parser: "vue-eslint-parser",
    extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:vue/recommended",
        "plugin:prettier/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    env: {
        browser: true,
        node: true,
        commonjs: true,
        es2021: true,
    },
    rules: {
        // 分号
        "semi": "error",
        // 对象键值引号样式保持一致
        "quote-props": ["error", "consistent-as-needed"],
        // 箭头函数允许单参数不带括号
        "arrow-parens": ["error", "as-needed"],
        // no var
        "no-var": "error",
        // const
        "prefer-const": "error",
        // 允许console
        "no-console": "off",
    },
};
```

我们还可以配置一下`lint-staged`，在`ESLint`检查有错误自动修复，无法修复则无法执行`git add`。

```shell
$ yarn add -D lint-staged husky
$ npx husky install
$ npx husky add .husky/pre-commit "npx lint-staged"
```

```javascript
// package.json
{
  // ...
  "lint-staged": {
    "*.{js,vue,ts}": [  "eslint --fix" ]
  }
}
```

### 配置TypeScript
虽然是`Vue2`对`ts`支持相对比较差，但是至少对于抽离出来的逻辑是可以写成`ts`的，可以在编译期就避免很多错误，对于一些`Vue2 +TS`的装饰器写法可以参考之前的博客 [uniapp小程序迁移到TS
](https://blog.touchczy.top/#/MiniProgram/uniapp%E5%B0%8F%E7%A8%8B%E5%BA%8F%E8%BF%81%E7%A7%BB%E5%88%B0TS) ，本次的改动比较大，主要是配置了`ESLint`相关信息，处理`TS`与`Vue`文件的提示信息，`webpack.config.js`配置`resolve`的一些信息以及`ts-loader`的解析，对于`.vue`的`TS`装饰器方式修改，`src/sfc.d.ts`作为`.vue`文件的声明文件，`VueRouter`与`Vuex`的`TS`修改，以及最后的`tsconfig.json`用以配置`TS`信息，配置`TypeScript`完成之后的`commit id`为`0fa9324`。

```shell
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser @babel/plugin-syntax-typescript typescript vue-property-decorator vue-class-component ts-loader vuex-class
```

```javascript
// .eslintrc.js
module.exports = {
    parser: "vue-eslint-parser",
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    overrides: [
        {
            files: ["*.ts"],
            parser: "@typescript-eslint/parser",
            plugins: ["@typescript-eslint"],
            extends: ["plugin:@typescript-eslint/recommended"],
        },
        {
            files: ["*.vue"],
            parser: "vue-eslint-parser",
            extends: [
                "plugin:vue/recommended",
                "plugin:prettier/recommended",
                "plugin:@typescript-eslint/recommended",
            ],
        },
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: "@typescript-eslint/parser",
    },
    // ...
};
```

```javascript
// src/sfc.d.ts
declare module "*.vue" {
    import Vue from "vue/types/vue";
    export default Vue;
}
```

```html
<!-- src/views/framework.vue -->
<!-- ... -->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
@Component
export default class FrameWork extends Vue {
    protected msg = "Example";
    @State("text") text!: string;
    protected toast() {
        window?.alert("ExampleMessage");
    }
    protected setVuexValue() {
        this.$store.commit("setText", "New Value");
    }
}
</script>
<!-- ... -->
```

```javascript
// tsconfig.json
{
    "compilerOptions": {
      "target": "esnext",
      "module": "esnext",
      "strict": true,
      "jsx": "preserve",
      "importHelpers": true,
      "moduleResolution": "node",
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "experimentalDecorators":true,
      "sourceMap": true,
      "skipLibCheck": true,
      "baseUrl": ".",
      "types": [],
      "paths": {
        "@/*": [
          "./src/*"
        ]
      },
      "lib": [
        "esnext",
        "dom",
        "es5",
        "ES2015.Promise",
      ]
    },
    "exclude": [ "node_modules" ]
}
```

```javascript
// webpack.config.js

// ...
module.exports = {
    mode: process.env.NODE_ENV,
    entry: "./src/index",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".js", ".vue", ".json", ".ts"],
        alias: {
            "@": path.join(__dirname, "./src"),
        },
    },
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.(ts)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            // ...
        ],
    },
    // ...
};

```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://juejin.cn/post/6989491439243624461>
- <https://juejin.cn/post/6844903942736838670>
- <https://segmentfault.com/a/1190000012789253>
