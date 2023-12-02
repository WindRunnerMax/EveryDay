# Exploring webpack: Building for Multiple Platforms in a Single Application

In modern front-end development, we can simplify many tasks by using build tools. One widely-used approach is building for multiple platforms in a single application. In webpack, developers have a lot of flexibility to manipulate the build process using loaders and plugins. By manipulating the intermediate outputs, we can easily achieve building for multiple platforms. However, it's important to note that this is a concept and not a method deeply integrated into webpack. We can also use other build tools like rollup, vite, rspack, etc., to achieve this.

## Description
Let's first discuss building for multiple platforms. The idea behind building for multiple platforms in a single application is simple: we can use one codebase to generate code for multiple platforms. This approach is useful for scenarios such as cross-platform compatibility for mini-programs, browser extension compatibility, and compliance with overseas application resource rules, etc. The core code remains the same, but there may be differences in interface calls or configuration implementations due to cross-platform reasons. However, the amount of differentiating code is minimal. In these scenarios, using build tools to achieve building for multiple platforms is highly suitable.

It's important to note that we are eliminating code redundancy caused by cross-platform development during the compilation process. For example, compatibility code for different versions of browsers needs to be dynamically executed in the browser. It cannot be treated as redundancy because we cannot distribute a set of code for each browser version. Therefore, this situation does not fall into the category of building for multiple platforms that we are discussing here. In fact, we can understand that because we can absolutely determine the platform of the code and distribute application packages independently, we can separate the code during the build process. The code for platform compatibility does not disappear; it only shifts. This means that we are moving the process of dynamically determining the platform from runtime to build time, thereby achieving better performance and smaller bundle size.

To achieve building for multiple platforms, we need the capabilities of build tools. Usually, build tools have the ability to remove "DEAD CODE" during code resource compression. Even if a build tool does not have this ability preset, there are usually plugins available to combine functionalities. Therefore, we can leverage this method to achieve building for multiple platforms. Specifically, we can use `if` conditions in combination with code expressions to ensure that the code is an absolute Boolean condition during compilation. This allows the build tool to remove the code that does not meet the condition as "DEAD CODE". In addition, since we are actually handling "DEAD CODE", in some scenarios, such as different logic and package references for internal and external SDKs, we can optimize the bundle size using build tool's tree shaking.

```js
if ("chromium" === "chromium") {
    // xxx
}

if ("gecko" === "chromium") {
    // xxx
}
```

## `process.env`
During our regular development process, especially when we import third-party npm packages, we may encounter the error `ReferenceError: process is not defined` after bundling. This is a classic exception and usually occurs when applying Node.js code to a browser environment. Apart from this case, we also need to use `process.env` in front-end build scenarios. For example, in the entry file `react/index.js` of React, you can see the following code:

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

Of course, this happens during the build, but it actually runs in the Node environment. By differentiating different environment variables and bundling different outputs accordingly, we can distinguish between production and development code, and provide functionality and warnings specific to the development environment. Similarly, we can also use this method as a condition for building for multiple platforms by determining the current platform using `process.env` and removing the code that does not meet the condition during the build process. Although using a similar approach to React for cross-platform compilation is feasible, it seems to follow the CommonJS module management pattern. However, ES Module is a statically declared statement, which means import and export statements must be used in the top-level scope of a module and cannot be used in conditional statements or loops. Therefore, this code snippet may need to be manually maintained or generated automatically using tools.

So, in the static declaration of `ES Module`, we need to rely on collaborative tools to complete the cross-platform compilation solution. Going back to the problem mentioned at the beginning, the `process is not defined` issue, in addition to the two situations mentioned above, there is another common situation where the variable `process` itself exists in the code, but the browser does not find the `process` variable when executing at runtime, resulting in an exception. Initially, I was puzzled why this `Node` variable would appear in the browser. So, to solve this problem, I might declare this variable globally. However, looking at it now, I might have used it incorrectly at that time. In fact, we should rely on browser build tools to handle the current environment configuration. Let's take an example: suppose our environment variable `process.env.NODE_ENV` is `development`, and our source code looks like this. After being processed by the packaging tool, this conditional statement will become `"development" === "development"`, and this condition will always be `true`. As a result, the `else` part will become `DEAD CODE` and be removed, so in the end, the actual `url` we get is `xxx`. Similarly, in the `production` environment, the resulting `url` will become `xxxxxx`.

```js
let url = "xxx";
if (process.env.NODE_ENV === "development") {
    console.log("Development Env");
} else {
    url = "xxxxxx";
}
export const URL = url;

// After processing

let url = "xxx";
if ("development" === "development") {
    console.log("Development Env");
}// else {
 //    url = "xxxxxx";
 // }
export const URL = url;
```

In fact, this is a very common way to specify environment variables to distinguish environments, so that unnecessary code can be removed during packaging. For example, the `Create React App` scaffold has related configurations for `custom-environment-variables`, which means that environment variables must start with `REACT_APP_`, and the `NODE_ENV` environment variable will also be injected automatically. However, it is worth noting that we should not start the names of any private keys or other environment variables with `REACT_APP_`, because if there is a use of this environment variable in the frontend build source code, it can lead to the risk of key leakage. That's why the `Create React App` convention requires environment variables to start with `REACT_APP_` in order to be injected.

Speaking of this, I have to mention the `sideEffects` configuration in `package.json`. `sideEffects` is usually translated as side effects, which can also be seen as incidental effects. In `ES Module`, the modules declared at the top are completely static, which means that the dependency structure of the entire module can be clearly determined during compilation. Therefore, it is relatively simple to achieve `TreeShaking` by determining the dependencies. However, the dependency structure cannot be statically determined through methods like `require` and `import()`, so it is not easy to `TreeShaking` modules referenced dynamically. So, let's assume we have implemented `ES` module `A`, and it references module `B`. In module `B`, only a part of the implemented function is used, and the other part is not used in the entire project. After static analysis, this part of the code will be removed.

The above description is a more common situation. In fact, by combining with our `process.env`, we can make better use of this capability. Different modules can be encapsulated in different platforms through environment variables. In the packaging process, since the module is only imported but not called, the entire module can be `TreeShaking`. Let's assume we have three modules, `A -> B -> C`. If it can be determined at `A` that `B` is not used, meaning `B` is a module without side effects, then by breaking the reference to `B`, we can save the size of `B` module and `C` module in the package. In fact, our module reference depth may be quite large. It is a hierarchical structure of `N` level tree. If we can break it in the middle, we can optimize the size to a large extent.

When it comes to the configuration of `sideEffects`, let's assume that module `A` references module `B`. In reality, there is no function call to module `B` in module `A`; it is simply a reference. However, module `B` contains initialization side-effect code, such as directly hijacking the functions of `Node.prototype`. It is important to note that this hijacking is not encapsulated within a function; it is executed directly in the module. 

By default, if the `sideEffects` configuration is not specified in the `package.json` file (i.e., `package.json` does not have a `sideEffects` field or the value of `sideEffects` is set to `true`), all modules are considered to have side effects. Therefore, the code in module `B` will be executed. However, if `sideEffects` is set to `false`, the code in module `B` will not be executed. 

Another scenario is when we are writing TypeScript (`TS`), where we may not use the syntax `import type xxx from "xxx"`. In this case, unnecessary side-effect code will still be executed even if we only reference types. Therefore, in this case, `sideEffects` is necessary. Of course, we can also automatically handle the `import type` statements for referencing types through `Lint`.

In practice, it is usually not sufficient to simply set `sideEffects` to `false`. There are times when we directly import CSS, such as `import "./index.css"`. Since there is no actual function call, this CSS code would be tree-shaken. Furthermore, in the development environment, tree shaking is not enabled by default in Webpack, so some configuration is required. Therefore, in many NPM packages, you will see the following configuration, which explicitly identifies modules with side effects in order to avoid unexpected module removal:

```js
"sideEffects": [
   "dist/**/*",
  "*.scss",
  "*.less",
  "*.css",
  "**/styles/**"
],
```

## __DEV__

When reading the source code of React and Vue, you may often encounter the variable `__DEV__`. If you pay close attention, you will notice that although this is a variable, it is not declared in the current file and is not imported from any other module, except when it is declared in `global.d.ts`. Therefore, just like the variable `process.env.NODE_ENV`, this variable is injected at compile time and serves a similar purpose. However, from its name, it is clear that this variable focuses more on defining different behaviors between development and production builds.

In fact, this approach represents another scenario. `process.env` is a relatively common scenario and a compilation approach that everyone can understand. On the other hand, `__DEV__` is more like a custom variable, making it more suitable for internal use. In other words, if the behavior associated with this variable is built-in during the development and build process, typically during the development process of an npm package, it is recommended to use environment variables similar to `__DEV__`. Usually, the relevant values are pre-defined during the packaging process and do not need to be read from environment variables. Additionally, after the code is packaged, the relevant code will be removed, avoiding any additional behavior. On the other hand, if user-defined environment variables are required during the build process, it is recommended to use `process.env`. This method is more widely accepted because it allows users to read the content through environment variables, making it more convenient for users.

As mentioned earlier in the context of Webpack, the same approach is used, but with simplified configuration. In this case, notice that we use `JSON.stringify` to handle the values of the environment variables. This is actually quite interesting. During my previous internship, I was also curious about the purpose of `JSON.stringify`. Normally, it is redundant to stringify a string. The reason is simple. For example, when we have the string `"production"`, if we stringify it, it becomes `' "production" '` or `"\"production\""`—essentially, wrapping the string with an additional layer. Now, suppose we have the following code:

```js
if (process.env.NODE_ENV === "development") {
    // xxx
}
```

The key point is that we previously mentioned that this method of defining environment variables is similar to string replacement. In basic JavaScript syntax, if we pass a variable as a string, it will be converted to a string literal during the actual output. For example, `console.log("production")` will output `production`, while `console.log("\"production\"")` will output `"production"`. 

So, here's the answer: If we don't use `JSON.stringify`, the source code will directly print `production` instead of `"production"`, which will result in an exception during the build process because `production` is not defined.

```js
console.log("production"); // production
console.log('"production"'); // "production"
console.log("\"production\""); // "production"


```plaintext
// After compilation of "production"
if (production === "development") {
    // xxx
}
// After compilation of "\"production\""
if ("production" === "development") {
    // xxx
}
```

So modern build tools usually have related solutions, and application frameworks based on `webpack` encapsulation generally allow direct definition of underlying `webpack` configurations, so that environment variables can be injected. Some common build tool configuration methods are as follows:
```js
// webpack
new webpack.DefinePlugin({
  "__DEV__": JSON.stringify(process.env.NODE_ENV === "development"),
  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  "process.env.PLATFORM": JSON.stringify(process.env.PLATFORM),
});

// vite
export default defineConfig({
  define: {
    "__DEV__": JSON.stringify(process.env.NODE_ENV === "development"),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.PLATFORM": JSON.stringify(process.env.PLATFORM),
  },
});

// rollup
import replace from "@rollup/plugin-replace";
export default {
  plugins: [
    replace({
      values: {
        "__DEV__": JSON.stringify(process.env.NODE_ENV === "development"),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.PLATFORM": JSON.stringify(process.env.PLATFORM),
      },
      preventAssignment: true
    }),
  ],
};

// rspack
module.exports = {
  builtins: {
    define: {
      "__DEV__": JSON.stringify(process.env.NODE_ENV === "development"),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.PLATFORM": JSON.stringify(process.env.PLATFORM),
    },
  }
}
```

## if-def
When dealing with some cross-platform compilation issues, the most commonly used method for me is `process.env` and `__DEV__`. However, after using it frequently, I find that in this kind of conditional compilation scenario, using `process.env.PLATFORM === xxx` too much can easily lead to deep nesting issues, which reduces readability. After all, `Promise` is designed to solve the problem of callback hell. If we introduce nesting issues due to the need for cross-platform compilation, it doesn't seem to be a good solution.

In `C/C++`, there is a very interesting preprocessor called `C Preprocessor`. It is not part of the compiler, but a separate step in the compilation process. Simply put, the `C Preprocessor` is like a text replacement tool. For example, macro parameters without identifiers are directly replaced with the original text. It can instruct the compiler to perform the required preprocessing before actual compilation. `#include`, `#define`, `#ifdef`, and other preprocessor directives belong to the `C Preprocessor`. Here, we mainly focus on the part of conditional compilation, which includes `#if`, `#endif`, `#ifdef`, `#endif`, `#ifndef`, `#endif`, and other conditional compilation directives.

```c
#if VERBOSE >= 2
  print("trace message");
#endif

#ifdef __unix__ /* __unix__ is usually defined by compilers targeting Unix systems */
# include <unistd.h>
#elif defined _WIN32 /* _WIN32 is usually defined by compilers targeting 32 or 64 bit Windows systems */
# include <windows.h>
#endif
```

So we can also achieve similar behavior using build tools. First, the `C Preprocessor` is a preprocessing tool that does not participate in actual compile-time behavior. It is similar to the `loader` in `webpack`. We can directly replace the original text in the `loader`. We can implement constructs like `#ifdef` and `#endif` using comments to avoid deep nesting issues. The logic related to string replacement can be modified directly to remove conditions that do not meet the platform criteria or retain those that do. This way, we can achieve similar effects as `#ifdef` and `#endif`. 

In addition, using comments can be helpful in implementing certain complex scenarios. For example, I have encountered a complex `SDK` packaging scenario where the behavior for internal and external platforms and the main project platform is inconsistent. If we do not build multiple packages, cross-platform support would require users to configure the build tool themselves. Using comments can achieve a complete package without configuring the `loader`. In some cases, it can avoid the need for users to modify their own configurations. Of course, this situation is deeply coupled to the business scenario; it only provides a reference for a specific case.

Furthermore, when implementing cross-platform related requirements in the past, I found that too many logic implemented with preprocessor directives is not ideal, especially when it involves `else` logic. It is difficult to guarantee that new platforms will not need to be compatible in the future. If we use `else` logic, we would need to check all the cross-platform branch logic when adding or removing platform compilations later. It is also easy to overlook some branch situations, resulting in errors. So here, we only need to use `#IFDEF` and `#ENDIF` to clearly indicate the platforms that need to compile this piece of code, thereby avoiding unnecessary problems as much as possible and maintaining the extensibility of the platform.

Next, we need to implement the functionality through a `loader`. I implemented it based on `rspack`, which is compatible with the basic interface of `webpack5`. Since we mainly process the source code here, we use only the basic capabilities of the `API`. In fact, they are generally applicable in most cases. There is no need to describe the part about writing the `loader` in detail. The `loader` is a function that takes the source code as a parameter and returns the modified code. The relevant information needed can be directly obtained from `this`. I have also annotated the types using `jsdoc`.

```js
const path = require("path");
const fs = require("fs");

/**
 * @this {import('@rspack/core').LoaderContext}
 * @param {string} source
 * @returns {string}
 */
function IfDefineLoader(source) {
  return source;
}
```

Next, to maintain generality, we handle some parameters including the environment variable name, `include`, `exclude`, and `debug` mode, and do some matching. If the file needs to be processed, we continue; otherwise, we simply return the source code. The `debug` mode can help us output some debug information.

```js
// Check parameter configuration
/** @type {boolean} */
const debug = this.query.debug || false;
/** @type {(string|RegExp)[]} */
const include = this.query.include || [path.resolve("src")];
/** @type {(string|RegExp)[]} */
const exclude = this.query.exclude || [/node_modules/];
/** @type {string} */
const envKey = this.query.platform || "PLATFORM";
```

```javascript
// Filter resource path
let hit = false;
const resourcePath = this.resourcePath;
for (const includeConfig of include) {
  const verified =
    includeConfig instanceof RegExp
      ? includeConfig.test(resourcePath)
      : resourcePath.startsWith(includeConfig);
  if (verified) {
    hit = true;
    break;
  }
}
for (const excludeConfig of exclude) {
  const verified =
    excludeConfig instanceof RegExp
      ? excludeConfig.test(resourcePath)
      : resourcePath.startsWith(excludeConfig);
  if (verified) {
    hit = false;
    break;
  }
}
if (debug && hit) {
  console.log("if-def-loader hit path", resourcePath);
}
if (!hit) return source;
```

Next is the specific code processing logic. At first, I tried to process it directly with regex, but found it to be complicated, especially when there are nested scenarios, it is not easy to handle the logic. Then I thought that since the code is processed line by line, processing line by line would be the most convenient way, especially during the processing, as it is comments itself, they will eventually be deleted, even if there is indentation, directly removing the preceding and trailing whitespace can directly match and handle the markers. This way, the idea becomes much simpler. The starting `#IFDEF` of the preprocessing directive will only set it to `true`, and the ending `#ENDIF` of the preprocessing directive will only set it to `false`. Our ultimate goal is to delete the code, so returning a blank line for the code lines that do not meet the condition is sufficient. However, attention should be paid to handling nested scenarios. We need a stack to record the index of the current handling `#IFDEF` in order to push it onto the stack. When encountering `#ENDIF`, it will be popped out of the stack. We also need to record the current processing state. If the current processing state is `true`, then when popping out of the stack, we need to determine whether to set the current state to `false` in order to end the processing of the current block. Additionally, we can generate debug information for the resulting file after the module hits using the `debug` setting.

```javascript
// CURRENT PLATFORM: GECKO

// #IFDEF CHROMIUM
// some expressions... // remove
// #ENDIF

// #IFDEF GECKO
// some expressions... // retain
// #ENDIF

// #IFDEF CHROMIUM
// some expressions... // remove
// #IFDEF GECKO
// some expressions... // remove
// #ENDIF
// #ENDIF

// #IFDEF GECKO
// some expressions... // retain
// #IFDEF CHROMIUM
// some expressions... // remove
// #ENDIF
// #ENDIF

// #IFDEF CHROMIUM|GECKO
// some expressions... // retain
// #IFDEF GECKO
// some expressions... // retain
// #ENDIF
// #ENDIF
```

```js
// Control whether this line meets the preprocessing condition during iteration
const platform = (process.env[envKey] || "").toLowerCase();
let terser = false;
let revised = false;
let terserIndex = -1;
/** @type {number[]} */
const stack = [];
const lines = source.split("\n");
const target = lines.map((line, index) => {
  // Remove leading and trailing whitespace, remove comment symbols and whitespace at the beginning of the line (optional)
  const code = line.trim().replace(/^\/\/\s*/, "");
  // Check the start of the preprocessing directive `#IFDEF` and set to `true`
  if (/^#IFDEF/.test(code)) {
    stack.push(index);
    // If it is already `true`, just continue
    if (terser) return "";
    const match = code.replace("#IFDEF", "").trim();
    const group = match.split("|").map(item => item.trim().toLowerCase());
    if (group.indexOf(platform) === -1) {
      terser = true;
      revised = true;
      terserIndex = index;
    }
    return "";
  }
  // Check the end of the preprocessing directive `#IFDEF` and set to `false`
  if (/^#ENDIF$/.test(code)) {
    const index = stack.pop();
    // Ignore extra `#ENDIF`
    if (index === undefined) return "";
    if (index === terserIndex) {
      terser = false;
      terserIndex = -1;
    }
    return "";
  }
  // Erase if it meets the preprocessing condition
  if (terser) return "";
  return line;
});

// Test file rewrite
if (debug && revised) {
  // rm -rf ./**/*.log
  console.log("if-def-loader revise path", resourcePath);
  fs.writeFile(resourcePath + ".log", target.join("\n"), () => null);
}
// Return the processing result
return target.join("\n");
```

For the complete code, please refer to `https://github.com/WindrunnerMax/TKScript/blob/master/packages/force-copy/script/if-def/index.js`. There is also a browser extension developed for `v2/v3` and the related implementation for compatibility with `Gecko/Chromeium` can be found. The development of related Greasemonkey plugins can also be found in the repository. If you want to use the already developed `loader`, you can directly install `if-def-processor` and refer to `https://github.com/WindrunnerMax/TKScript/blob/master/packages/force-copy/rspack.config.js` for configuration.

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://juejin.cn/post/6945789317218304014
https://www.rspack.dev/config/builtins.html
https://en.wikipedia.org/wiki/C_preprocessor
https://webpack.js.org/plugins/define-plugin
https://vitejs.dev/config/shared-options.html
https://github.com/rollup/plugins/tree/master/packages/replace
```
