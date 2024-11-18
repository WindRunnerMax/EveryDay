
# Exploring webpack: Setting up Vue development environment

Usually we can easily set up the development environment for Vue using `vue-cli`. `vue-cli` is indeed a great tool that allows us to focus on writing business code without worrying about complicated configurations such as `webpack`. However, this can lead to over-reliance on `vue-cli` and overlooking the importance of `webpack`. In some special scenarios, such as configuring multiple entry points for Vue and optimizing project build speed, we might find ourselves struggling. Of course, it might be a little late to start learning `vue2 + webpack` now, as everyone is considering transitioning to `vue3 + vite` haha.

## Description
The relevant code in this article is located in the `webpack--vue-cli` branch of `https://github.com/WindrunnerMax/webpack-simple-environment`. By default, `webpack` only supports `js` and `json` file formats. Therefore, for `webpack` to recognize `css`, `img`, `html`, `vue`, and other files, they need to be converted to `js`. The main purpose of setting up the Vue development environment is actually to handle the `.vue` single file components, which mainly requires corresponding `loader` parsers. The rest is just routine issues.

## Implementation

### Environment Setup
To start exploring `webpack`, let's begin with setting up a simple `webpack` environment. First, initialize and install dependencies.

```shell
$ yarn init -y
$ yarn add -D webpack webpack-cli cross-env
```

You can then try running the `webpack` bundling program. `webpack` can bundle without any configuration. The directory structure will be as follows:

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

Next, add a build command.

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
Execute `npm run build`, which will call the `webpack` command located in `node_modules/.bin` by default. It internally invokes `webpack-cli` to parse user parameters for bundling and uses `src/index.js` as the entry file by default.

```shell
$ npm run build
```

After the execution is complete, a warning will appear indicating that the default `mode` is `production`. At this point, the `dist` folder will be created, which contains the final bundled result. Inside, there will be a `main.js`, in which `webpack` performs some syntax analysis and optimizations. The bundled structure will look like this:

```javascript
// src/main.js
(()=>{"use strict";console.log(2)})();
```

### webpack Configuration File
Of course, in general, we don't use zero configuration for bundling. Hence, we'll start by creating a `webpack.config.js` file. Since `webpack` mentions that the default `mode` is `production`, let's first configure to address this issue. For this simple `webpack` environment, we won't differentiate between `webpack.dev.js` and `webpack.prod.js` for configuration, but simply use `process.env.NODE_ENV` to distinguish in `webpack.config.js`. `cross-env` is a plugin used to configure environment variables.

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

### HtmlWebpackPlugin Plugin
We not only need to handle `js` files, but also `html` files. For this, we need to use the `html-webpack-plugin` plugin.

```shell
$ yarn add -D html-webpack-plugin
```

After that, configure it in `webpack.config.js`. Simply configure the relevant input, output, and compression information. Also, if you want to delete the `dist` folder every time you build, consider using the `clean-webpack-plugin` plugin.

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
            filename: "index.html", // The name of the packaged file, the root path is `module.exports.output.path`
            template: path.resolve("./public/index.html"),
            hash: true, // Add a `hash` stamp after the referenced resources
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
            },
            inject: "body", // `head`, `body`, `true`, `false`
            scriptLoading: "blocking" // `blocking`, `defer`
        })
    ]
}
```

Then create a `/public/index.html` file and input the `html` code that will be injected.

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

Run `npm run build`, and we can see the successfully injected code in the `/dist/index.html` file.

```html
<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><title>Webpack Template</title></head><body><div id=app></div><!-- built files will be auto injected --><script src=index.js?94210d2fc63940b37c8d></script></body></html>
```

### webpack-dev-server

When developing a project, we usually debug by directly accessing a certain `ip` and port to preview the effect. `webpack-dev-server` is used to help us achieve this function. It actually implements the web server function based on `express`, and the packaged `html` and `bundle.js` after `webpack-dev-server` packaging are stored in memory and cannot be seen in the directory. It is generally used in conjunction with `webpack` hot updates.

```shell
$ yarn add -D webpack-dev-server
```

Next, you need to configure the `devServer` environment in `webpack.config.js`, including the configuration of `package.json`.

```javascript
// webpack.config.js
```

```javascript
// ...
module.exports = {
    // ...
    devServer: {
        hot: true, // Enable hot module replacement
        open: true, // Automatically open browser for preview
        compress: true, // Enable gzip
        port: 3000  // If not specified, the port will be automatically assigned
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

Afterwards, run `npm run dev` and the browser will automatically open for preview. As per the code above, the page will be empty, but when examining the console, you will see that the `DOM` structure is loaded and the `Console` shows the number `2`. Additionally, if you modify the source code file, such as adding a certain structure to the `DOM`, you will notice that `webpack` does support `HMR` at this point.

### Setting up the Basic Vue Environment
First, let's attempt to build a `Vue` component written in `.js`, without considering the loading of single file components `.vue` files, but only building a `Vue` object instance. To keep the code for the demonstration as complete as possible, we will create a `main.js` in the `src` directory as the main entry point for coding. Additionally, we need to import `main.js` into `index.js`, meaning that the nominal entry point for the code is `main.js`, but in reality, for `webpack`, the entry point is `index.js`, and the current commit at this point is `625814a`.

First, we need to install `Vue` before we can begin developing using `Vue`.

```shell
$ yarn add vue
```

Next, write the following in `/src/main.js`.

```javascript
// /src/main.js
import Vue from "vue";

new Vue({
    el: "#app",
    template: "<div>Vue Example</div>"
})
```

Additionally, note that it is necessary to add the following configuration in `webpack.config.js`. However, this is only to handle `Vue` for the `compiler` mode, and by default, it is in `runtime` mode, meaning it points to `dist/vue.runtime.common.js`. After handling single file components `.vue` files, this modification will no longer be necessary. After making this change, we can run `npm run dev` again to see the effect.

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

Next, we will officially start dealing with `.vue` files. First, create an `App.vue` file in the root directory, and the directory structure will look as follows:

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

Then, modify the `main.js` and `App.vue` files.

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

The next step is to use a `loader` to handle the files, because we need to handle `.vue` files at this point.

```shell
$ yarn add -D vue-loader vue-template-compiler css-loader vue-style-loader
```

Later, you need to write relevant configurations in `webpack.config.js`. After that, by running `npm run dev`, the application will run successfully. At this point, the `commit id` is `831d99d`.

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

### Handling Resource Files
Usually, we need to handle resource files, and once again, we need to use loaders for this. Mainly, we need to handle images. The `commit id` after setting up resource file handling is `f531cc1`.

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
                            limit: 8192, // If less than `8K`, convert to `base64` using `url-loader`, otherwise use `file-loader` to handle the file
                            fallback: {
                                loader: "file-loader",
                                options: {
                                    esModule: false,
                                    name: "[name].[hash:8].[ext]",
                                    outputPath: "static", // File storage path after packaging, dist/static
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
```

```html
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

After that, run `npm run dev`, and you can see the effect. You can see in the `Element` tab of the console that images smaller than 8K are directly encoded into `base64`, while files larger than 8K are referenced as external resources.

```html
<!-- ... -->
<img data-v-7ba5bd90="" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASA..." alt="" class="vue">
<img data-v-7ba5bd90="" src="http://localhost:3000/static/vue-large.b022422b.png" alt="" class="vue-large"> 
<!-- ... -->
```

### Handling Babel
Using `babel` is mainly for browser compatibility. `@babel/core` is the core package of `babel`, `@babel/preset-env` integrates some optional solutions of `babel`, and you can use different presets by modifying specific parameters. `babel-loader` allows `ES6+` to be converted to `ES5`. By default, `babel` only translates syntax and does not convert new `API`. `core-js` allows browsers that do not support `ES6+ API` to support new `API`, and of course `babel-polyfill` can also be used. You can check the relevant differences and it is recommended to use `core-js`. The commit id for handling the `babel` is `5e0f5ad`.

```shell
$ yarn add -D @babel/core @babel/preset-env babel-loader
```
```shell
$ yarn add core-js@3
```

Then create a new file called `babel.config.js` in the root directory, and write the following code into it.

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

After that, make a new syntax in `App.vue`, and write a more recent syntax `?.`.

```html
<!-- App.vue -->
<template>
    <div>
        <img src="./static/vue.jpg" alt="" class="vue">
        <img src="./static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
        <button @click="toast">Button</button>
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
            window?.alert("Example Message");
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

Also, modify `webpack.config.js`.

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

After running `npm run dev`, you should be able to see it up and running and working properly. The `?.` syntax here is actually a form of encoding. You can search for the string `ExampleMessage` in the browser console's `Source` tab to locate the relevant position and see the result of the encoding.

```javascript
window?.alert("ExampleMessage");
// ->
window === void 0 ? void 0 : window.alert("ExampleMessage");
```

### Processing Css
We usually don't just write native `css`, I personally prefer using the `sass` framework for `css`, so here you need to install `sass` and `sass-loader`. Please use a version of `sass-loader` that is lower than `@11.0.0`; `sass-loader@11.0.0` does not support `vue@2.6.14`. Furthermore, we usually need to handle the compatibility of `CSS` in different browsers, so you also need to install `postcss-loader`. Additionally, the `postcss.config.js` file can be used to configure some information, such as `@/` aliases. Also, it is important to note that the resolution order of `loader` in `use` is from bottom to top. For example, in the resolution of `.scss` files below, `sass-loader` is used first and then `postcss-loader`, and so on. The `commit id` for `sass` and `postcss` after processing is `f679718`.

```shell
yarn add -D sass sass-loader@10.1.1 postcss postcss-loader 
```

Afterwards, let's create a simple example. Create a file `/src/common/styles.scss` and write a variable `$color-blue: #4C98F7;` inside it.

```css
$color-blue: #4C98F7;
```

Next, modify `App.vue` and `webpack.config.js`, then run `npm run dev` to see the word `Example` turn blue.

```html
<!-- App.vue -->
<template>
    <div>
        <img src="./static/vue.jpg" alt="" class="vue">
        <img src="./static/vue-large.png" alt="" class="vue-large">
        <div class="example">{{ msg }}</div>
        <button @click="toast">Button</button>
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

### Join VueRouter

When using `Vue`, it's highly likely that you'll need the full `Vue` ecosystem, including `VueRouter`. You can install `vue-router` directly here.

```shell
$ yarn add vue-router
```

There are quite a few changes here. Mainly, we create a `src/router/index.js` file, and then establish two components, `src/components/tab-a.vue` and `src/components/tab-b.vue`, as well as a component `src/views/framework.vue` to accommodate these two components. Afterward, we make the `App.vue` component only act as a container, and in `src/main.js` we make a reference to `VueRouter`. These changes include some usage of `VueRouter`, and there are quite a few of them, so we recommend directly running the version control system. The related `commit id` is `96acb3a`.

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
        <button @click="toast">Button</button>
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


### Adding Vuex
Just like when using `Vue`, you also need to use `Vuex` from the `Vue` ecosystem, so let's go ahead and install `vuex` directly.

```shell
yarn add vuex
```

After that, we mainly created a new file `src/store/index.js` as the `store`, modified `src/views/framework.vue` to implement an example of getting values from the `store` and modifying values, and finally referenced the `store` in `src/main.js` with the related commit id being `a549808`.

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

### Configure ESLint
Normally, during development, we need to configure `ESLint` and `prettier` to standardize our code. Therefore, we need to do some configuration. After configuring, the commit id for `ESLint` is `9ca1b7b`.

```shell
$ yarn add -D eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-vue prettier vue-eslint-parser
```

Create `.editorconfig`, `.eslintrc.js`, and `.prettierrc.js` in the root directory, and do some configuration. Of course, these can be customized, but be mindful of potential conflicts between `prettier` and `eslint` rules.

```<!-- .editorconfig -->
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
    "printWidth": 100, // Specify the line length for line breaks
    "tabWidth": 4, // Width of tab character
    "useTabs": false, // Do not use tab
    "semi": true, // Add a semicolon at the end of the line
    "singleQuote": false, // Use double quotes
    "quoteProps": "preserve", // Do not require quotes around object literal properties
    "jsxSingleQuote": false, // Use single quotes in jsx syntax
    "trailingComma": "es5", // Ensure there is a trailing comma after the last property of an object
    "bracketSpacing": true, // Add spaces within curly braces { name: 'rose' }
    "jsxBracketSameLine": false, // Place the closing bracket of a multi-line JSX element last
    "arrowParens": "avoid", // For arrow functions, do not force parentheses for a single parameter
    "requirePragma": false, // Whether to format the code strictly according to a special comment at the top of the file
    "insertPragma": false, // Whether to insert a pragma marker at the top of the file, indicating that the file has been formatted by prettier
    "proseWrap": "preserve", // Wrap lines as-is
    "htmlWhitespaceSensitivity": "ignore", // Control how HTML files handle whitespace, affecting layout
    "endOfLine": "lf" // Line ending: \n \r \n\r auto
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
        // Semicolons
        "semi": "error",
        // Keep consistent quote props for object keys
        "quote-props": ["error", "consistent-as-needed"],
        // Allow arrow functions without parentheses for single parameters
        "arrow-parens": ["error", "as-needed"],
        // No var
        "no-var": "error",
        // Const
        "prefer-const": "error",
        // Allow console
        "no-console": "off",
    },
};
```

We can also configure `lint-staged` to automatically fix ESLint errors and prevent `git add` if the errors cannot be fixed.

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

### Configure TypeScript

Although the support for `ts` in `Vue2` is relatively poor, at least the logic extracted can be written in `ts`, which can avoid many errors at compile time. For the `Vue2 + TS` decorator writing style, you can refer to the previous blog [Migrating uniapp mini program to TS](https://blog.touchczy.top/#/MiniProgram/uniapp%E5%B0%8F%E7%A8%8B%E5%BA%8F%E8%BF%81%E7%A7%BB%E5%88%B0TS). This change is relatively large, mainly configuring the related information of `ESLint`, handling the prompt information of `TS` and `Vue` files, configuring `resolve` in `webpack.config.js`, resolving with `ts-loader`, modifying the `TS` decorator method for `.vue`, using `src/sfc.d.ts` as the declaration file for `.vue` files, modifying `TS` for `VueRouter` and `Vuex`, and finally configuring `tsconfig.json` to complete the information for `TS`. The `commit id` after configuring `TypeScript` is `0fa9324`.

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
// to_be_replace[x]
```

```javascript
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/6989491439243624461
https://juejin.cn/post/6844903942736838670
https://segmentfault.com/a/1190000012789253
```