# 初探webpack之单应用多端构建
在现代化前端开发中，我们可以借助构建工具来简化很多工作，单应用多端构建就是其中应用比较广泛的方案，`webpack`中提供了`loader`与`plugin`来给予开发者非常大的操作空间来操作构建过程，通过操作中间产物我们可以非常方便地实现多端构建。当然这是一种思想而不是深度绑定在`webpack`中的方法，我们也可以借助其他的构建工具来实现，比如`rollup`、`vite`、`rspack`等等。

## 描述
首先我们先来聊聊多端构建，实际上单应用多端构建的思想非常简单，就是在同一个项目中我们可以通过一套代码来构建出多个端的代码，例如小程序的跨平台兼容、浏览器扩展程序的跨平台兼容、海内外应用资源合规问题等等，这些场景的特点是核心代码是一致的。只不过因为跨平台的原因会有接口调用或者实现配置的差异，但是差异化的代码量是非常少的，在这种场景下借助构建工具来实现单应用多端编译是非常合适的。

在这里需要注意的是，我们是在编译的过程中处理掉单应用跨平台造成的代码冗余情况，而例如在浏览器中不同版本的兼容代码是需要执行动态判断的，不能够作为冗余处理，因为我们不能够为每个版本的浏览器都分发一套代码，所以这种情况不属于我们讨论的多端构建场景。实际上我们也可以理解为因为我们能够绝对地判断代码的平台并且能够独立分发应用包，所以才可以在构建的过程中将代码分离，兼容平台的代码不会消失只会转移，相当于将代码中需要动态判断平台的过程从运行时移动到了构建时机，从而能够获得更好的性能与更小的包体积。

接下来实现多端构建就需要借助构建工具的能力了，通常构建工具在处理代码资源压缩时会有清除`DEAD CODE`的能力，即使构建工具没有预设这个能力，通常也会有插件来组合功能，那么我们就可以借助这个方法来实现多端构建。那么具体来说，我们可以通过`if`条件，配合代码表达式，让代码在编译的过程中保证是绝对的布尔值条件，从而让构建工具在处理的过程中将不符合条件的代码处理掉`DEAD CODE`即可。此外由于我们实际上是处理了`DEAD CODE`，那么在一些场景下例如对内与对外开放的`SDK`有不同的逻辑以及包引用等，就可以借助构建工具的`TreeShaking`实现包体积的优化。

```js
if ("chromium" === "chromium") {
    // xxx
}

if ("gecko" === "chromium") {
    // xxx
}
```

## process.env
我们在平时开发的过程中，特别是引入第三方`Npm`包的时候，可能会发现打包之后会有出现`ReferenceError: process is not defined`的错误，这也算是经典的异常了。当然这种情况通常是发生在将`Node.js`代码应用到浏览器环境中，除了这种情况之外，在前端构建的场景中也会需要使用到`process.env`，例如在`React`的入口文件`react/index.js`中就可以看到如下的代码:

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

当然在这里是构建时发生的，实际上还是运行在`Node`环境中的，通过区分不同的环境变量打包不同的产物，从而可以区分生产环境与开发环境的代码，从而提供开发环境相关的功能和警告。那么类似的，我们同样也可以借助这种方式作为多端构建的条件判断，通过`process.env`来判断当前的平台，从而在构建的过程中将不符合条件的代码处理掉。类似于`React`的这种方式来做跨平台编译当然是可行的，只不过看起来这似乎是`commonjs`的模块化管理方式，而`ES Module`是静态声明的语句，也就是说导入导出语句必须在模块的顶层作用域中使用，而不能在条件语句或循环语句等代码块中使用，所以这段代码通常可能需要手动维护或者需要借助工具自动生成。

那么在`ES Module`静态声明中，我们就需要借助共建工具来完成跨端编译的方案了。回到刚开始时提到的那个`process is not defined`的问题，除了上述的两种情况，还有一种常见的情况是`process`这个变量代码本身就存在于代码当中，而在浏览器在`runtime`执行的时候发现并没有`process`这个变量从而抛出的异常。在最开始的时候，我还是比较纳闷这个`Node`变量为什么会出现在浏览器当中，所以为了解决这个问题我可能会在全局声明一下这个变量，那么在现在看来当时我可能产生了误用的情况，实际上我们应该借助于浏览器构建工具来处理当前的环境配置。

那么我们来举个例子，假设此时我们的环境变量是`process.env.NODE_ENV`是`development`，而我们的源码中是这样的，那么在借助打包工具处理之后，这个判断条件就会变成`"development" === "development"`，这个条件永远为`true`，那么`else`的部分就会变成`DEAD CODE`进而被移除，由此最后我们实际得到的`url`是`xxx`，同理在`production`的时候得到的`url`就会变成`xxxxxx`。

```js
let url = "xxx";
if (process.env.NODE_ENV === "development") {
    console.log("Development Env");
} else {
    url = "xxxxxx";
}
export const URL = url;

// 处理后

let url = "xxx";
if ("development" === "development") {
    console.log("Development Env");
}// else {
 //    url = "xxxxxx";
 // }
export const URL = url;
```

实际上这是个非常通用的处理方式，通过指定环境变量的方式来做环境的区分，以便打包时将不需要的代码移除，例如在`Create React App`脚手架中就有`custom-environment-variables`相关的配置，也就是必须要以`REACT_APP_`开头的环境变量注入，并且`NODE_ENV`环境变量也会被自动注入。当然值得注意的是我们不应该把任何私钥等环境变量的名称以`REACT_APP_`开头，因为这样如果在前端构建的源码中有这个环境变量的使用，则会造成密钥泄漏的风险，这也是`Create React App`约定需要以`REACT_APP_`开头的环境变量才会被注入的原因。

那么实际上这个功能看起来是不是非常像字符串替换，而`webpack`就提供了开箱即用的`webpack.DefinePlugin`来实现这个能力`https://webpack.js.org/plugins/define-plugin/`，这个插件可以在打包的过程中将指定的变量替换为指定的值，从而实现我们要做的允许跨端的的不同行为，我们直接在`webpack`的配置文件中配置即可。此外，使用`ps -e`或`systemctl status`查看进程`pid`，并配合`cat /proc/${pid}/environ | tr '\0' '\n'`来读取运行中程序的环境变量是个不错的方式。

```js
new webpack.DefinePlugin({
  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  "process.env.PLATFORM": JSON.stringify(process.env.PLATFORM),
});
```

说到这里，就不得不提到`package.json`的`sideEffects`配置项了，`sideEffects`通常被译作副作用，当然我们也可以将其看作附带效应。在`ES Module`中，顶部声明的模块是完全静态的，也就是说整个模块的依赖结构在编译时是能够明确确定的，那么通过确定的依赖来实现`TreeShaking`就是比较简单的事情了，当然通过`require`以及`import()`等动态导入的方式就无法静态确定依赖结构了，所以通常对于动态引用的模块不容易进行`TreeShaking`。那么假设我们现在实现了`ES`模块`A`，并且引用了模块`B`，而在`B`模块中实现的函数只用了其中一部分，而另一部分在整个项目中并未使用，那么这部分代码在静态分析之后就会被移除掉。

上边描述的是比较常规的情况，实际上配合我们的`process.env`就可以更大程度地发挥这部分能力，在不同的平台中通过环境变量封装不同的模块，在打包的时候因为实际只引用但是并未调用，所以整个模块都可以被`TreeShaking`，假设我们有`A -> B -> C`三个模块，如果能够在`A`处判断没有用到`B`，也就是认为`B`是无副作用的模块，那么通过打断`B`的引用，便可以在包中省下来`B`模块与`C`模块的体积，而实际上我们的模块引用深度可能是会相当大的，这是个`N`叉树级的层次结构，假如能在中间打断的话，便可以很大程度上优化体积。

回到`sideEffects`的配置上，假设我们的模块`A`引用了模块`B`，而实际上在`A`中并没有任何关于`B`模块函数的调用只是单纯的引用了而已，在`B`模块中实现了初始化的副作用代码，例如直接在模块`B`中劫持了`Node.prototype`的函数，注意在这里并没有将这个劫持封装到函数中，是直接在模块中执行的。

那么在默认情况下，也就是`package.json`没有配置`sideEffects`默认为`true`，即认为所有模块都有副作用的情况下，`B`模块这段代码实际上同样会被执行，而如果标记了`sideEffects`为`false`的情况下，这段代码是不会被执行的。还有一种情况，在写`TS`的时候我们可能通常不会写`import type xxx from "xxx";`的语法，在这种我们实际上仅引用了类型的情况下不必要的副作用代码还是会被执行的，所以在这里`sideEffects`是很有必要的，当然我们也可以通过`Lint`自动处理仅引用类型时的`import type`语句。

实际上配置`sideEffects`将直接配置为`false`的情况下通常是无法满足我们的需求的，有些时候我们是直接引用了`css`，类似于`import "./index.css"`的这种形式，因为没有实际的函数调用，所以这段`CSS`也会被`TreeShaking`掉，另外在开发环境下`Webpack`是默认不会开启`TreeShaking`的，所以需要配置一下，所以在很多`Npm`包中我们能够看到如下配置，通常就是明确地标明了副作用模块，避免意外的模块移除。

```js
"sideEffects": [
   "dist/**/*",
  "*.scss",
  "*.less",
  "*.css",
  "**/styles/**"
],
```

## \_\_DEV\_\_ 
在阅读`React`和`Vue`的源码的时候，我们通常可以看到`__DEV__`这个变量，而如果我们观察仔细的话就可以发现，虽然这是个变量但是并没有在当前文件中声明，也没有从别的模块当中引入，当然在`global.d.ts`中声明的不算，因为其并不会注入到`runtime`中。那么实际上，这个变量与`process.env.NODE_ENV`变量一样，都是在编译时注入的，起到的也是相通的作用，只不过这个变量从命名中就可以看出来，是比较关注于开发构建和生产构建之间的不同行为的定义。

实际上在这里这种方式相当于是另一种场景，`process.env`是一种相对比较通用的场景，也是大家普遍能够看懂的一种编译的定义方式，而`__DEV__`比较像是内部自定义的变量，所以这种方式比较适合内部使用。也就是说，如果这个变量对应的行为是我们在开发过程和构建过程中内建的，通常是在`Npm`包的开发过程中，那么使用类似于`__DEV__`的环境变量是比较推荐的。

因为通常在打包的过程中我们会预定义好相关的值而不需要实际从环境变量中读取，而且在打包之后相关代码会被抹掉，不会引发额外的行为。那么如果在构建的过程中需要用户自己来自定义的环境变量，那么使用`process.env`是比较推荐的，这是一种比较能为大家普遍认同的定义方式，而且因为实际上可以通过环境变量来读取内容，用户使用的过程中会更加方便。

那么在前边我们也说明了在`webpack`使用，因为使用的是同样的方式，只是简化了配置，那么在这里我们也是类似的配置方式，不知道大家有没有注意到一个细节，我们使用的是`JSON.stringify`来处理环境变量的值，这其实是一件很有意思的事情，在之前实习的时候我也纳闷这个`JSON.stringify`的作用，本来就是个字符串为什么还要`stringify`。实际上这件事很简单，例如`"production"`这个字符串，我们将其`stringify`之后便成为了`'"production"'`或者表示为`"\"production\""`，类似于将字符串又包裹了一层，那么假如此时我们的代码如下:

```js
if (process.env.NODE_ENV === "development") {
    // xxx
}
```

那么重点来了，我们之前提到了这种定义环境变量的方式是类似于字符串替换的模式，而因为在`JS`的基本语法中，如果我们传递的变量是字符串，那么在实际输出的过程中会将其转换为字符串字面量，例如如果我们执行`console.log("production")`输出的是`production`，而执行`console.log("\"production\"")`输出的是`"production"`，那么答案也就显而易见了，如果不进行`JSON.stringify`的话，在输出的源码当中会直接打印`production`而不是`"production"`，从而在构建的过程中则会直接抛出异常，因为我们并没有定义`production`这个变量。

```js
console.log("production"); // production
console.log('"production"'); // "production"
console.log("\"production\""); // "production"

// "production"编译后
if (production === "development") {
    // xxx
}
// "\"production\""编译后
if ("production" === "development") {
    // xxx
}
```

那么现代化的构建工具通常都会有相关的处理方案，而基于`webpack`封装的应用框架通常也可以直接定义底层的`webpack`配置，从而将环境变量注入进去，一些常见的构建工具配置方式如下:

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
在处理一些跨平台的编译问题时，我最常用的的方法就是`process.env`与`__DEV__`，但是在用多了之后发现，在这种类似于条件编译的情况下，大量使用`process.env.PLATFORM === xxx`很容易出现深层次嵌套的问题，可读性会变得很差，毕竟我们的`Promise`就是为了解决异步回调的嵌套地狱的问题，如果我们因为需要跨平台编译而继续引入嵌套问题的话，总感觉并不是一个好的解决方案。

在`C/C++`中有一个非常有意思的预处理器，`C Preprocessor`不是编译器的组成部分，但其是编译过程中一个单独的步骤，简单来说`C Preprocessor`相当于是一个文本替换工具，例如不加入标识符的宏参数等都是原始文本直接替换，可以指示编译器在实际编译之前完成所需的预处理。`#include`、`#define`、`#ifdef`等等都属于`C Preprocessor`的预处理器指令，在这里我们主要关注条件编译的部分，也就是`#if`、`#endif`、`#ifdef`、`#endif`、`#ifndef`、`#endif`等条件编译指令。

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

那么我们同样也可以将类似的方式借助构建工具来实现，首先`C Preprocessor`是一个预处理工具，不参与实际的编译时的行为，那么是不是就很像`webpack`中的`loader`，而原始文本的直接替换我们在`loader`中也是完全可以做到的，而类似于`#ifdef`、`#endif`我们可以通过注释的形式来实现，这样就可以避免深层次的嵌套问题，而字符串替换的相关逻辑是可以直接修改原来来处理，例如不符合平台条件的就可以移除掉，符合平台条件的就可以保留下来，这样就可以实现类似于`#ifdef`、`#endif`的效果了。

此外，通过注释来实现对某些复杂场景还是有帮助的，例如我就遇到过比较复杂的`SDK`打包场景，对内与对外以及对本体项目平台的行为都是不一致的，如果在不构建多个包的情况下，跨平台就需要用户自己来配置构建工具，而使用注释可以在不配置`loader`的情况下同样能够完整打包，在某些情况下可以避免用户需要改动自己的配置，当然这种情况还是比较深地耦合在业务场景的，只是提供一种情况的参考。


```js
// #IFDEF CHROMIUM
console.log("IS IN CHROMIUM");
// #ENDIF

// #IFDEF GECKO
console.log("IS IN GECKO");
// #ENDIF
```

此外，在之前实现跨平台相关需求的时候，我发现使用预处理指令实现过多的逻辑反而不好，特别是涉及到`else`的逻辑，因为我们很难保证后续会不会需要兼容新的平台。那么如果我们使用了`else`相关逻辑的话，后续增删平台编译的时候就需要检查所有的跨平台分支逻辑，而且比较容易忽略掉一些分支情况，从而导致错误的发生，所以在这里我们只需要使用`#IFDEF`、`#ENDIF`就可以了。即明确地指出这段代码需要编译的平台，由此来尽可能避免不必要的问题，同时保留平台的扩展性。

那么接下来就需要通过`loader`来实现功能了，在这里我是基于`rspack`来实现的，同样兼容`webpack5`的基本接口，当然在这里因为我们主要是对源代码进行处理，所以使用的都是最基本的`Api`能力，实际上在大部分情况下都是通用的。那么编写`loader`这部分就不需要过多描述了，`loader`是一个函数，接收源代码作为参数，返回处理后的代码即可，并且需要的相关信息可以直接从`this`中取得即可，在这里我通过`jsdoc`将类型标注了一下。

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

接下来，为了保持通用性，我们处理一些参数，包括读取的环境变量名字、`include`、`exclude`以及`debug`模式，并且做一下匹配，如果命中了该文件需要处理则继续，否则直接返回源代码即可，并且`debug`模式可以帮我们输出一些调试信息。

```js
// 检查参数配置
/** @type {boolean} */
const debug = this.query.debug || false;
/** @type {(string|RegExp)[]} */
const include = this.query.include || [path.resolve("src")];
/** @type {(string|RegExp)[]} */
const exclude = this.query.exclude || [/node_modules/];
/** @type {string} */
const envKey = this.query.platform || "PLATFORM";

// 过滤资源路径
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

接下来就是具体的代码处理逻辑了，最开始的时候我想使用正则的方式直接进行处理的，但是发现处理起来比较麻烦，尤其是存在嵌套的情况下，就不太容易处理逻辑，那么再后来我想反正代码都是 一行一行的逻辑，按行处理的方式才是最方便的，特别是在处理的过程中因为本身就是注释，最终都是要删除的，即使存在缩进的情况直接去掉前后的空白就能直接匹配标记进行处理了。

这样思路就变的简单了很多，预处理指令起始`#IFDEF`只会置`true`，预处理指令结束`#ENDIF`只会置`false`，而我们的最终目标实际上就是删除代码，所以将不符合条件判断的代码行返回空白即可，但是处理嵌套的时候还是需要注意一下，我们需要一个栈来记录当前的处理预处理指令起始`#IFDEF`的索引即进栈，当遇到`#ENDIF`再出栈，并且还需要记录当前的处理状态，如果当前的处理状态是`true`，那么在出栈的时候就需要确定是否需要标记当前状态为`false`从而结束当前块的处理，并且还可以通过`debug`来实现对于命中模块处理后文件的生成。

```js
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
// 迭代时控制该行是否命中预处理条件
const platform = (process.env[envKey] || "").toLowerCase();
let terser = false;
let revised = false;
let terserIndex = -1;
/** @type {number[]} */
const stack = [];
const lines = source.split("\n");
const target = lines.map((line, index) => {
  // 去掉首尾的空白 去掉行首注释符号与空白符(可选)
  const code = line.trim().replace(/^\/\/\s*/, "");
  // 检查预处理指令起始 `#IFDEF`只会置`true`
  if (/^#IFDEF/.test(code)) {
    stack.push(index);
    // 如果是`true`继续即可
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
  // 检查预处理指令结束 `#IFDEF`只会置`false`
  if (/^#ENDIF$/.test(code)) {
    const index = stack.pop();
    // 额外的`#ENDIF`忽略
    if (index === undefined) return "";
    if (index === terserIndex) {
      terser = false;
      terserIndex = -1;
    }
    return "";
  }
  // 如果命中预处理条件则擦除
  if (terser) return "";
  return line;
});

// 测试文件复写
if (debug && revised) {
  // rm -rf ./**/*.log
  console.log("if-def-loader revise path", resourcePath);
  fs.writeFile(resourcePath + ".log", target.join("\n"), () => null);
}
// 返回处理结果
return target.join("\n");
```

完整的代码可以参考`https://github.com/WindrunnerMax/TKScript/blob/master/packages/force-copy/script/if-def/index.js`，并且有开发浏览器扩展`v2/v3`以及兼容`Gecko/Chromeium`相关的实现可以参考，当然油猴插件相关的开发在仓库中也可以找到，如果想使用已经开发好的`loader`的话，可以直接安装`if-def-processor`，并且参考`https://github.com/WindrunnerMax/TKScript/blob/master/packages/force-copy/rspack.config.js`配置即可。


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://juejin.cn/post/6945789317218304014>
- <https://www.rspack.dev/config/builtins.html>
- <https://en.wikipedia.org/wiki/C_preprocessor>
- <https://webpack.js.org/plugins/define-plugin>
- <https://vitejs.dev/config/shared-options.html>
- <https://github.com/rollup/plugins/tree/master/packages/replace>

