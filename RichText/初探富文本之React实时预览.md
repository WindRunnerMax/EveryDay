# 初探富文本之React实时预览
在前文中我们探讨了很多关于富文本引擎和协同的能力，在本文中我们更偏向具体的应用组件实现。在一些场景中比如组件库的文档编写时，我们希望能够有实时预览的能力，也就是用户可以在文档中直接编写代码，然后在页面中实时预览，这样可以让用户更加直观的了解组件的使用方式，这也是很多组件库文档中都会有的一个功能。

那么我们在本文就侧重于`React`组件的实时预览，来探讨相关能力的实现。文中涉及的相关代码都在 [ReactLive](https://github.com/WindrunnerMax/ReactLive) 中，在富文本文档中的实现效果可以参考 [DocEditor](https://windrunnermax.github.io/DocEditor/)。

<details>
<summary><strong>初探富文本编辑器系列相关文章</strong></summary>

* [初探富文本编辑器#1-富文本概述](./初探富文本之富文本概述.md)
* [初探富文本编辑器#2-编辑器引擎](./初探富文本之编辑器引擎.md)
* [初探富文本编辑器#3-OT 协同算法](./初探富文本之OT协同算法.md)
* [初探富文本编辑器#4-OT 协同实例](./初探富文本之OT协同实例.md)
* [初探富文本编辑器#5-CRDT 协同算法](./初探富文本之CRDT协同算法.md)
* [初探富文本编辑器#6-CRDT 协同实例](./初探富文本之CRDT协同实例.md)
* [初探富文本编辑器#7-React 实时预览](./初探富文本之React实时预览.md)
* [初探富文本编辑器#8-文档 diff 算法](./初探富文本之文档diff算法.md)
* [初探富文本编辑器#9-在线文档交付](./初探富文本之在线文档交付.md)
* [初探富文本编辑器#10-划词评论能力](./初探富文本之划词评论能力.md)
* [初探富文本编辑器#11-文档虚拟滚动](./初探富文本之文档虚拟滚动.md)
* [初探富文本编辑器#12-搜索替换算法](./初探富文本之搜索替换算法.md)
* [初探富文本编辑器#13-序列化与反序列化](./初探富文本之序列化与反序列化.md)

</details>

## 概述
首先我们先简单探讨下相关的场景，实际上当前很多组件库的`API`文档都是由`Markdown`来直接生成的。例如`Arco-Design`，实际上是通过一个个`md`文件来生成的组件应用示例以及`API`表格，那么其实我们用的时候也可以发现我们是无法直接在官网编辑代码来实时预览的，这是因为这种方式是直接利用`loader`来将`md`文件根据一定的规则编译成了`jsx`语法，这样实际上就相当于直接用`md`生成了代码，之后就是完整地走了代码打包流程。那么既然有静态部署的`API`文档，肯定也有动态渲染组件的`API`文档，例如`MUI`，其同样也是通过`loader`处理`md`文件的占位，将相应的`jsx`组件通过指定的位置加载进去。只不过其的渲染方式除了静态编译完成后还多了动态渲染的能力，官网的代码示例就是可以实时编辑的，并且能够即使预览效果。

这种小规模的`Playground`能力应用还是比较广泛的，其比较小而不至于使用类似于`code-sandbox`的能力来做完整的演示。基于`Markdown`来完成文档对于技术同学来说并不是什么难事，但是`Markdown`毕竟不是一个可以广泛接受的能力，还是需要有一定的学习成本的，富文本能力会相对更容易接受一些。那么有场景就有需求，我们同样也会希望能在富文本中实现这种动态渲染组件的能力，这种能力适合做成一种按需加载的第三方插件的形式。

此外，在富文本的实现中可能会有一些非常复杂的场景，例如第三方接口常用的折叠表格能力，这不是一个常见的场景而且在富文本中实现成本会特别高，尤其体现在实现交互上，`ROI`会比较低，而实际上公司内部一般都会有自己的`API`接口平台，于是利用`OpenAPI`对接接口平台直接生成折叠表格等复杂组件就是一个相对可以接受的方式。上述的两种场景下实际上都需要动态渲染组件的能力，`Playground`能力的能力比较好理解，而对接接口平台需要动态渲染组件的原因是我们的数据结构大概率是无法平齐的，例如某些文本需要加粗，成本最低的方案就是我们直接组装为`<strong />`的标签，并入已有组件库的折叠表格中将其渲染出来即可。

我们在这里也简单聊一下富文本中实现预览能力可以参考的方案，预览块的结构实际上很简单，无非是一部分是代码块，在编辑时另一部分可以实时预览。而在富文本中实现代码块一般都会有比较多的示例，例如使用`slate`时可以使用`decorate`的能力，或者可以在`quill`采用通用的方案，使用`prismjs`或者`lowlight`来解析整个代码块，之后将解析出的部分依次作为`text`的内容并且携带解析的属性放置于数据结构中，在渲染时根据属性来渲染出相应的样式即可。甚至于可以直接嵌套代码编辑器进去，只不过这样文档级别的搜索替换会比较难做，而且需要注意事件冒泡的处理。而预览区域主要需要做的是将渲染出的内容标记为`Embed/Void`，避免选区变换对编辑器的`Model`造成影响。

那么接下来我们进入正题，如何动态渲染`React`组件来完成实时预览。我们首先来探究一下实现方向，实际上我们可以简单思考一下，实现一个动态渲染的组件实际上不就是从字符串到可执行代码嘛，那么如果在`Js`中我们能直接执行代码中能直接执行代码的方法有两个: `eval`和`new Function`。那么我们肯定是不能用`eval`的，`eval`执行的代码将在当前作用域中执行，这意味着其可以访问和修改当前作用域中的变量，虽然在严格模式下做了一些限制但明显还是没那么安全，这可能导致安全风险和意外的副作用。而`new Function`构造函数创建的函数有自己的作用域，其只能访问全局作用域和传递给它的参数，从而更容易控制代码的执行环境，在后文中安全也是我们需要考虑的问题，所以我们肯定是需要用`new Function`来实现动态代码执行的。

```js
"use strict";

;(() => {
  let a = 1;
  eval("a = 2;")
  console.log(a); // 2
})();

;(() => {
  let a = 1;
  const fn = new Function("a = 2;");
  fn();
  console.log(a); // 1
})();
```

那么既然我们有了明确的方向，我们可以接着研究应该如何将`React`代码渲染出来，毕竟浏览器是不能直接执行`React`代码的，文中相关的代码都在`https://github.com/WindrunnerMax/ReactLive`中，也可以在`Git Pages`在线预览实现效果。

## 编译器
前边我们也提到了，浏览器是不能直接执行`React`代码的，这其中一个问题就是浏览器并不知道这个组件是什么。例如我们从组件库引入了一个`<Button />`组件，那么将这个组件交给浏览器的时候其并不知道`<Button />`是什么语法，当然针对于`Button`这个组件依赖的问题我们后边再聊。那么实际上在我们平时写`React`组件的时候，`jsx`实际上是会编译成`React.createElement`的，在`17`之后可以使用`react/jsx-runtime`的`jsx`方法，在这里我们还是使用`React.createElement`。所以我们现在要做的就是将`React`字符串进行编译，从`jsx`转换为函数调用的形式，类似于下面的形式:


```js
<Button className="button-component">
  <div className="div-child"></div>
</Button>

// --->

React.createElement(Button, {
    className: "button-component"
}, React.createElement("div", {
    className: "div-child"
}));
```

### Babel
`Babel`是一个广泛使用的`Js`编译器，通常用来将最新版本的`Js`代码转换为浏览器可以理解的旧版本代码，在这里我们可以使用`Babel`来编译`jsx`语法。`babel-standalone`内置了`Babel`的核心功能和常用插件，可以直接在浏览器中引用，由此直接在浏览器中使用`babel`来转换`Js`代码。

在这里实际上我们在这里用的是`babel 6.x`，`babel-standalone`也就是`6.x`版本的`min.js`包才`791KB`，而`@babel/standalone`也就是`7.x`版本的`min.js`包已经`2.77MB`了。只不过`7.x`版本会有`TS`直接类型定义`@types/babel__standalone`，使用`babel-standalone`就需要曲线救国了，可以使用`@types/babel-core`来中转一下。那么其实使用`Babel`非常简单，我们只需要将代码传进去，配置好相关的`presets`就可以得到我们想要的代码了。当然在这里我们得到的依旧是代码字符串，并且实际在使用的时候发现还不能使用`<></>`语法，毕竟是`6`年前的包了，在`@babel/standalone`中是可以正常处理的。

```js
export const DEFAULT_BABEL_OPTION: BabelOptions = {
  presets: ["stage-3", "react", "es2015"],
  plugins: [],
};

export const compileWithBabel = function (code: string, options?: BabelOptions) {
  const result = transform(code, { ...DEFAULT_BABEL_OPTION, ...options });
  return result.code;
};

// https://babel.dev/repl
// https://babel.dev/docs/babel-standalone
```

```js
<Button className="button-component">
  <div className="div-child"></div>
</Button>

// --->

"use strict";

React.createElement(
  Button,
  { className: "button-component" },
  React.createElement("div", { className: "div-child" })
);
```

实际上因为我们是接受用户的输入来动态地渲染组件的，所以安全问题我们是需要考虑在内的，而使用`Babel`的一个好处是我们可以比较简单地注册插件，在代码解析的时候就可以进行一些处理。例如我们只允许用户定义名为`App`的组件函数，一旦声明其他函数则抛出解析失败的异常，我们也可以选择移除当前节点。当然仅仅是这些还是不够的，关于安全的相关问题我们后续还需要继续讨论。

```js
import { PluginObj } from "babel-standalone";

export const BabelPluginLimit = (): PluginObj => {
  return {
    name: "babel-plugin-limit",
    visitor: {
      FunctionDeclaration(path) {
        const funcName = path.node.id.name;
        if (funcName !== "App") {
          //   throw new Error("Function Error");
          path.remove();
        }
      },
      JSXIdentifier(path) {
        if (path.node.name === "dangerouslySetInnerHTML") {
          //   throw new Error("Attributes Error");
          path.remove();
        }
      },
    },
  };
};

compileWithBabel(code, { plugins: [ BabelPluginLimit() ] });
```

另外在这里我们可以做一个简单的`benchmark`，在这里使用如下代码生成了`1000`个`Button`组件，每个组件嵌套了一个`div`结构，由此来测试使用`babel`编译的速度。从结果可以看出实际速度还是可以的，在小规模的`playground`场景下是足够的。

```js
const getCode = () => {
  const CHUNK = `
    <Button className="button-component">
      <div className="div-child"></div>
    </Button>
    `;
  return "<div>" + new Array(1000).fill(CHUNK).join("") + "</div>";
};

console.time("babel");
const code = getCode();
const result = compileWithBabel(code);
console.timeEnd("babel");
```

```
babel: 254.635986328125 ms
```

### SWC
`SWC`是`Speedy Web Compiler`的简写，是一个用`Rust`编写的快速`TypeScript/JavaScript`编译器，同样也是同时支持`Rust`和`JavaScript`的库。`SWC`是为了解决`Web`开发中编译速度较慢的问题而创建的，与传统的编译器相比，`SWC`在编译速度上表现出色，其能够利用多个`CPU`核心，并行处理代码，从而显著提高编译速度，特别是对于大型项目或包含大量文件的项目来说，我们之前使用的`rspack`就是基于`SWC`实现的。

那么对于我们来说，使用`SWC`的主要目的是为了其能够快速编译，那么我们就可以直接使用`swc-wasm`来实现，其是`SWC`的`WebAssembly`版本，可以直接在浏览器中使用。因为`SWC`必须要异步加载才可以，所以我们是需要将整体定义为异步函数才行，等待加载完成之后我们就可以使用同步的代码转换了。此外使用`SWC`也是可以写插件来处理解析过程中的中间产物的，类似于`Babel`我们可以写插件来限制某些行为，但是需要用`Rust`来实现，还是有一定的学习成本，我们现在还是关注代码的转换能力。

```js
export const DEFAULT_SWC_OPTIONS: SWCOptions = {
  jsc: {
    parser: { syntax: "ecmascript", jsx: true },
  },
};

let loaded = false;
export const prepare = async () => {
  await initSwc();
  loaded = true;
};

export const compileWithSWC = async (code: string, options?: SWCOptions) => {
  if (!loaded) {
    prepare();
  }
  const result = transformSync(code, { ...DEFAULT_SWC_OPTIONS, ...options });
  return result.code;
};

// https://swc.rs/playground
// https://swc.rs/docs/usage/wasm
```

```js
<Button className="button-component">
  <div className="div-child"></div>
</Button>

// --->

/*#__PURE__*/ React.createElement(Button, {
    className: "button-component"
}, /*#__PURE__*/ React.createElement("div", {
    className: "div-child"
}));
```

在这里我们依然使用`1000`个`Button`组件与`div`结构的嵌套来做一个简单的`benchmark`。从结果可以看出实际编译速度是非常快的，主要时间是耗费在初次的`wasm`加载中，如果是刷新页面后不禁用缓存直接使用`304`的结果效率会提高很多，初次加载过后的速度就能够保持比较高的水平了。

```js
console.time("swc-with-prepare");
await prepare();
console.time("swc");
const code = getCode();
const result = compileWithSWC(code);
console.timeEnd("swc");
console.timeEnd("swc-with-prepare");
```

```
swc: 45.98095703125 ms
swc-with-prepare: 701.789306640625 ms

swc: 29.970947265625 ms
swc-with-prepare: 293.3720703125 ms

swc: 35.972900390625 ms
swc-with-prepare: 36.1171875 ms
```

### Sucrase
`Sucrase`是`Babel`的替代品，可以实现超快速的开发构建，其专注于编译非标准语言扩展，例如`JSX`、`TypeScript`、`Flow`。由于支持范围较小，`Sucrase`可以采用性能更高但可扩展性和可维护性较差的架构，`Sucrase`的解析器是从`Babel`的解析器分叉出来的，并将其缩减为`Babel`解决问题的一个集合中的子集。

同样的，我们使用`Sucrase`的目的是提高编译速度，`Sucrase`可以直接在浏览器中加载，并且包体积比较小，实际上是非常适合我们这种小型`Playground`场景的。只不过因为使用了非常多的黑科技进行转换，并没有类似于`Babel`有比较长的处理流程。`Sucrase`是没有办法做插件来处理代码中间产物的，所以在需要处理代码的情况下，我们需要使用正则表达式自行匹配处理相关代码。

```js
export const DEFAULT_SUCRASE_OPTIONS: SucraseOptions = {
  transforms: ["jsx"],
  production: true,
};

export const compileWithSucrase = (code: string, options?: SucraseOptions) => {
  const result = transform(code, { ...DEFAULT_SUCRASE_OPTIONS, ...options });
  return result.code;
};

// https://sucrase.io/
// https://github.com/alangpierce/sucrase
```

```js
<Button className="button-component">
  <div className="div-child"></div>
</Button>

// --->

React.createElement(Button, { className: "button-component",}
  , React.createElement('div', { className: "div-child",})
)
```

在这里我们依然使用`1000`个`Button`组件与`div`结构的嵌套来做一个简单的`benchmark`，从结果可以看出实际编译速度是非常快的，整体而言速度远快于`Babel`但是略微逊色于`SWC`。当然`SWC`需要比较长时间的初始化，所以整体上来说使用`Sucrase`是不错的选择。

```js
console.time("sucrase");
const code = getCode();
const result = compileWithSucrase(code);
console.timeEnd("sucrase");
```

```
sucrase: 47.10302734375 ms
```

## 代码构造

在上一节我们解决了浏览器无法直接执行`React`代码的第一个问题，即浏览器不认识形如`<Button />`的代码是`React`组件，我们需要将其编译成浏览器能够认识的`Js`代码。那么紧接着在本节中我们需要解决两个问题，第一个问题是如何让浏览器知道如何找到`Button`这个对象也就是依赖问题，在我们将`<Button />`组件编译为`React.createElement(Button, null)`之后，并没有告知浏览器`Button`对象是什么或者应该从哪里找到这个对象；第二个问题是我们处理好编译后的代码以及依赖问题之后，我们应该如何构造合适的代码，将其放置于`new Function`中执行，由此得到真正的`React`组件实例。


### Deps/With
在这里因为我们后边需要用到`new Function`以及`with`语法，所以在这里先回顾一下。通过`Function`构造函数可以动态创建函数对象，类似于`eval`可以动态执行代码，然而与具有访问本地作用域的`eval`不同，`Function`构造函数创建的函数仅在全局作用域中执行，其语法为`new Function(arg0, arg1, /* ... */ argN, functionBody)`。

```js
const sum = new Function('a', 'b', 'return a + b');

console.log(sum(1, 2)); // 3
```

`with`语句可以将代码的作用域设置到一个特定的对象中，其语法为`with (expression) statement`，`expression`是一个对象，`statement`是一个语句或者语句块。`with`可以将代码的作用域指定到特定的对象中，其内部的变量都是指向该对象的属性，如果访问某个`key`时该对象中没有该属性，那么便会继续沿着作用域检索直至`window`，如果在`window`上还找不到那么就会拋出`ReferenceError`异常。由此我们可以借助`with`来指定代码的作用域，只不过`with`语句会增加作用域链的长度，而且严格模式下不允许使用`with`语句。

```js
with (Math) {
  console.log(PI); // 3.1415926
  console.log(cos(PI)); // -1
  console.log(sin(PI/ 2)); // 1
}
```

那么紧接着我们就来解决一下组件的依赖问题，还是以`<Button />`组件为例在编译之后我们需要`React`以及`Button`这两个依赖，但是前边也提到了，`new Function`是全局作用域，不会取得当前作用域的值，所以我们需要想办法将相关的依赖传递给我们的代码中，以便其能够正常执行。

首先我们可能想到直接将相关变量挂到`window`上即可，这不就是全局作用域嘛，当然这个方法可以是可以的，但是不优雅，入侵性太强了。所以我们可以先来看看`new Function`的语句的参数，看起来所有的参数中只有最后一个参数是函数语句，其他的都是参数。那么其实这个问题就简单了，我们先构造一个对象，然后将所有的依赖放置进去，最后在构造函数的时候将对象的所有`key`作为参数声明，执行的时候将所有的`value`作为参数值传入即可。


```js
const sandbox = {
  React: "React Object",
  Button: "Button Object",
};

const code = `
console.log(React, Button);
`;

const fn = new Function(...Object.keys(sandbox), code.trim());
fn(...Object.values(sandbox)); // React Object Button Object
```

使用参数的方法实际上是比较不错的，但是因为用了很多个变量变得并没有那么可控。此时如果我们还想做一些额外的功能，例如限制用户对于`window`的访问，那么使用`with`可能是个更好的选择，我们先来使用`with`完成最基本的依赖访问能力。


```js
const sandbox = {
  React: "React Object",
  Button: "Button Object",
};

const code = `
with(sandbox){
    console.log(React, Button);
}
`;

const fn = new Function("sandbox", code.trim());
fn(sandbox); // React Object Button Object
```

这样的实现看起来可能会更优雅一些，我们通过一个`sandbox`变量来承载了所有的依赖，这可以让访问依赖的行为变得更加可控，实际上我们可能并不想让用户的代码有如此高的权限访问全局的所有对象，例如我们可能想限制用户对于`window`的访问，当然我们可以直接将`window: {}`放在`sandbox`变量中，因为在沿着作用域向上查找的时候检索到`window`了就不会继续向上查找了。

但是一个很明显的问题是我们不可能将所有的全局对象枚举出来放在参数中，此时我们就需要使用`with`了。因为使用`with`的时候我们是会首先访问这个变量的，如果我们能在访问这个变量的时候做个代理，不在白名单的全部返回`null`就可以了。此时我们还需要请出`Proxy`对象，我们可以通过`with`配合`Proxy`来限制用户访问，这个我们后边安全部分再展开。


```js
const sandbox = {
  React: "React Object",
  Button: "Button Object",
  console: console
};

const whitelist = [...Object.keys(sandbox)];

const proxy = new Proxy(sandbox, {
  get(target, prop) {
    if(whitelist.indexOf(prop) > -1){
      return sandbox[prop];
    }else{
      return null;
    }
  },
  has: () => true
});


const code = `
with(sandbox){
  console.log(React, Button, window, document, setTimeout);
}
`;

const fn = new Function("sandbox", code.trim());
fn(proxy); // React Object Button Object null null null
```

### JSX/Fn
在上边我们解决了依赖的问题，并且对于安全问题做了简述，只不过到目前为止我们都是在处理字符串，还没有将其转换为真正的`React`组件。所以在这里我们专注于将`React`组件对象从字符串中生成出来，同样的我们依然使用`new Function`来执行代码，只不过我们需要将代码字符串拼接成我们想要的形式，由此来将生成的对象带出来。

例如`<Button />`这个这个组件，经由编译器编译之后，我们可以得到`React.createElement(Button, null)`，那么在构造函数时，如果只是`new Function("sandbox", "React.createElement(Button, null)")`，即使执行之后我们也是得不到组件实例的。因为这个函数没有返回值，所以我们需要将其拼接为`return React.createElement(Button, null)`，所以我们就可以得到我们的第一种方法，拼接`render`来得到返回的组件实例。此外用户通常可能会同一层级下写好几个组件，通常需要我们在最外层嵌套一层`div`或者`React.Fragment`。


```js
export const renderWithInline = (code: string, dependency: Sandbox) => {
  const fn = new Function("dependency", `with(dependency) { return (${code.trim()})}`);
  return fn(dependency);
};
```

虽然看起来是能够实现我们的需求的，只不过需要注意的是，我们必须要开启编译器的`production`等配置，并且要避免用户的额外输入例如`import`语句。否则例如下面的`Babel`编译结果，在这种情况下我们使用拼接`return`的形式显然就会出现问题，会造成语法错误。那么是不是可以换个思路，直接将`return`的这部分代码也就是`return <Button />`放在编译器中编译，实际上这样在`Sucrase`中是可以的，因为其不特别关注于语法，而是会尽可能地编译。

而在`Babel`中会明显地抛出`'return' outside of function.`异常，在`SWC`中会抛出`Return statement is not allowed here`异常。虽然我们最终的目标是放置于`new Function`中来构造函数，使用`return`是合理的，但是编译器是不会知道这一点的，所以我们还是需要关注下这方面限制。

```js
"use strict";

var _button = require("button");
var _jsxFileName = "/sample.tsx";
/*#__PURE__*/React.createElement(_button.Button, {
  __self: void 0,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 3,
    columnNumber: 1
  }
});
```

既然这个方式会有诸多的限制，需要关注和适配的地方比较多，那么我们需要再换一个思路，即在编译代码的时候是完全符合语法规则的，并且不需要关注用户的输入，只需要将编译出来的组件带离出来即可。那么我们可以利用传递的依赖，通过依赖的引用来实现，首先生成一个随机`id`，然后配置一个空的对象，将编译好的组件赋值到这个对象中，在渲染函数的最后通过对象和`id`将其返回即可。

```jsx
export const renderWithDependency = (code: string, dependency: Sandbox) => {
  const id = getUniqueId();
  dependency.___BRIDGE___ = {};
  const bridge = dependency.___BRIDGE___ as Record<string, unknown>;
  const fn = new Function(
    "dependency",
    `with(dependency) { ___BRIDGE___["${id}"] = ${code.trim()}; }`
  );
  fn(dependency);
  return bridge[id];
};
```

在这里我们依旧使用`<Button />`组件为例，直接使用`Babel`编译的结果来对比一下。可以看出来即使我们没有开启`production`模式，编译的结果也是符合语法的，并且因为传递引用的关系，我们能够将编译的组件实例通过`___BRIDGE___`以及随机生成`id`带出来。

```js
"use strict";

var _jsxFileName = "/sample.tsx";
___BRIDGE___["id-xxx"] = /*#__PURE__*/React.createElement(Button, {
  __self: void 0,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 26
  }
});
```

此外我们还可以相对更完整地开放组件能力，通过约定来固定一个函数的名字例如`App`，在拼接代码的时候使用`___BRIDGE___["id-xxx"] = React.createElement(App);`，之后用户便可以可以相对更加自由地对组件实现相关的交互等。例如使用`useEffect`等`Hooks`，这种约定式的方案会更加灵活一些，在应用中也比较常见比如约定式路由等。下面是约定`App`作为函数名编译并拼接后的结果，可以放置于`new Function`并且借助依赖的引用拿到最终生成的组件实例。

```jsx
"use strict";

var _jsxFileName = "/sample.tsx";
const App = () => {
  React.useEffect(() => {
    console.log("Effect");
  }, []);
  return /*#__PURE__*/React.createElement(Button, {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7,
      columnNumber: 10
    }
  });
};
___BRIDGE___["id-xxx"] = React.createElement(App);
```

## 渲染组件
在上文中我们解决了编译代码、组件依赖、构建代码的问题，并且最终得到了组件的实例。在本节中我们主要讨论如何将组件渲染到页面上，这部分实际上是比较简单的，我们可以选择几种方式来实现最终的渲染。

### Render
在`React`中我们渲染组件通常的都是直接使用`ReactDOM.render`，在这里我们同样可以使用这个方法来完成组件渲染。毕竟在之前我们已经得到了组件的实例，那么我们直接找到一个可以挂载的`div`，将组件渲染到`DOM`上即可。

```js
// https://github.com/WindrunnerMax/ReactLive/blob/master/src/index.tsx

const code = `<Button type='primary' onClick={() => alert(111)}>Primary</Button>`;
const el = ref.current;
const sandbox = withSandbox({ React, Button, console, alert });
const compiledCode = compileWithSucrase(code);
const Component = renderWithDependency(compiledCode, sandbox) as JSX.Element;
ReactDOM.render(Component, el);
```

当然我们也可以换个思路，我们也可以将渲染的能力交予用户，也就是说我们可以约定用户可以在代码中执行`ReactDOM.render`，我们可以对这个方法进行一次封装，使用户只能将组件渲染到我们固定的`DOM`结构上。当然我们直接将`ReactDOM`传递给用户代码来执行渲染逻辑也是可以的，只是并不可控不建议这么操作，如果可以完全保证用户的输入是可信的情况，这种渲染方法是可以的。

```js
const INIT_CODE = `
render(<Button type='primary' onClick={() => alert(111)}>Primary</Button>);
`;
const render = (element: JSX.Element) => ReactDOM.render(element, el);
const sandbox = withSandbox({ React, Button, console, alert, render });
const compiledCode = compileWithSucrase(code);
renderWithDependency(compiledCode, sandbox);
```

### SSR
实际上渲染`React`组件在`Markdown`编辑器中也是很常见的应用，例如在编辑时的动态渲染以及消费时的静态渲染组件，当然在消费侧时动态渲染组件也就是我们最开始提到的使用场景。那么`Markdown`的相关框架通常是支持`SSR`的，我们当然也需要支持`SSR`来进行组件的静态渲染。

那么在这里我们能够通过动态编译代码来获得`React`组件之后，通过`ReactDOMServer.renderToString`(多返回`data-reactid`标识，`React`会认识之前服务端渲染的内容, 不会重新渲染`DOM`节点)或者`ReactDOMServer.renderToStaticMarkup`来将`HTML`的标签生成出来，也就是所谓的脱水，然后将其放置于`HTML`中返回给客户端。在客户端中使用`ReactDOM.hydrate`来为其注入事件，也就是所谓的注水，这样就可以实现`SSR`服务端渲染了。下面就是使用`express`实现的`DEMO`，实际上也相当于`SSR`的最基本原理。

```js
// https://codesandbox.io/p/sandbox/ssr-w468kc?file=/index.js:1,36
const express = require("express");
const React= require("react");
const ReactDOMServer = require("react-dom/server");
const { Button } = require("@arco-design/web-react");
const { transform } = require("sucrase");

const code = `<Button type="primary" onClick={() => alert(1)}>Primary</Button>`;
const OPTIONS = { transforms: ["jsx"], production: true };

const App = () => { // 服务端的`React`组件
  const ref = React.useRef(null);

  const getDynamicComponent = () => {
    const { code: compiledCode } = transform(`return (${code.trim()});`, OPTIONS);
    const sandbox= { React, Button };
    const withCode = `with(sandbox) { ${compiledCode} }`;
    const Component = new Function("sandbox", withCode)(sandbox);
    return Component;
  }

  return React.createElement("div", { ref }, getDynamicComponent());
}

const app = express();
const content = ReactDOMServer.renderToString(React.createElement(App));
app.use('/', function(req, res, next){
  res.send(
    `<html>
       <head>
         <title>Example</title>
         <link rel="stylesheet" href="https://unpkg.com/@arco-design/web-react@2.53.0/dist/css/arco.min.css">
         <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/react/17.0.2/umd/react.production.min.js" type="application/javascript"></script>
         <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/react-dom/17.0.2/umd/react-dom.production.min.js" type="application/javascript"></script>
       </head>
       <body>
         <div id="root">${content}</div>
       </body>
       <script src="https://unpkg.com/@arco-design/web-react@2.53.0/dist/arco.min.js"></script>
       <script>
        const App = () => { // 客户端的\`React\`组件
          const ref = React.useRef(null);
          const getDynamicComponent = () => {
            const compiledCode = 'return ' + 'React.createElement(Button, { type: "primary", onClick: () => alert(1),}, "Primary")';
            const sandbox= { React, Button: arco.Button };
            const withCode = "with(sandbox) { " + compiledCode + " }";
            const Component = new Function("sandbox", withCode)(sandbox);
            return Component;
          }
          return React.createElement("div", { ref }, getDynamicComponent());
        }
        ReactDOM.hydrate(React.createElement(App), document.getElementById("root"));
        </script>
      </html>`
  );
})
app.listen(8080, () => {
  console.log("Listen on port 8080")
});
```

## 安全考量
既然我们选择了动态渲染组件，那么安全性必然是需要考量的。例如最简单的一个攻击形式，我作为用户在代码中编写了函数能取得当前用户的`Cookie`，并且构造了`XHR`对象或者通过`fetch`将`Cookie`发送到我的服务器中，如果此时网站恰好没有开启`HttpOnly`，并且将这段代码落库了。那么以后每个打开这个页面的其他用户都会将其`Cookie`发送到我的服务器中，这样我就可以拿到其他用户的`Cookie`，这是非常危险的存储型`XSS`攻击。此外上边也提到了`SSR`的渲染模式，如果恶意代码在服务端执行那将是更加危险的操作，所以对于用户行为的安全考量是非常重要的。

那么实际上只要接受了用户输入并且作为代码执行，那么我们就无法完全保证这个行为是安全的，我们应该注意的是永远不要相信用户的输入，所以实际上最安全的方式就是不让用户输入，当然对于目前这个场景来说是做不到的。那么我们最好还是要能够做到用户是可控范围的，比如只接受公司内部的输入来编写文档，对外来说只是消费侧不会将内容落库展示到其他用户面前，这样就可以很大程度上的避免一些恶意的攻击。当然即使是这样，我们依然希望能够做到安全地执行用户输入的代码，那么最常用的方式就是限制用户对于`window`等全局对象的访问。

### Deps
在前边我们也提到过`new Function`是全局的作用域，其是不会读取定义时的作用域变量的。但是由于我们是构造了一个函数，我们完全可以将`window`中的所有变量都传递给这个函数，并且对变量名都赋予`null`，这样当在作用域中寻找值时都会直接取得我们传递的值而不会继续向上寻找了。无论是使用参数的形式或者是构造`with`都可以采用这种方式，这样我们也可以通过白名单的形式来限制用户的访问。当然这个对象的属性将会多达上千，看起来可能并没有那么优雅。

```js
const sandbox = Object.keys(Object.getOwnPropertyDescriptors(window))
  .filter(key => key.indexOf("-") === -1)
  .reduce((acc, key) => ({ ...acc, [key]: null }), {});

sandbox.console = console;
const code = "console.log(window, document, XMLHttpRequest, eval, Function);"

const fn = new Function(...Object.keys(sandbox), code.trim());
fn(...Object.values(sandbox)); // null null null null null

const withCode = `with(sandbox) { ${code.trim()} }`;
const withFn = new Function("sandbox", withCode);
withFn(sandbox); // null null null null null
```

### Proxy
`Proxy`对象能够为另一个对象创建代理，该代理可以拦截并重新定义该对象的基本操作，例如属性查找、赋值、枚举、函数调用等等。那么配合我们之前使用`with`就可以将所有的对象访问以及赋值全部赋予`sandbox`，就可以来更精确地实现对于对象访问的控制。下面就是我们使用`Proxy`来实现的一个简单的沙箱，我们可以通过白名单的形式来限制用户的访问，如果访问的对象不在白名单中，那么直接返回`null`，如果在白名单中，那么返回对象本身。

在这段实现中，`with`语句是通过`in`运算符来判定访问的字段是否在对象中，从而决定是否继续通过作用域链往上找，所以我们需要将`has`控制永远返回`true`，由此来阻断代码通过作用域链访问全局对象。此外例如`alert`和`setTimeout`等函数必须运行在`window`作用域下，这些函数都有个特点就是都是非构造函数，不能`new`且没有`prototype`属性，我们可以用这个特点来进行过滤，在获取时为其绑定`window`。

```js
export const withSandbox = (dependency: Sandbox) => {
  const top = typeof window === "undefined" ? global : window;
  const whitelist: (keyof Sandbox)[] = [...Object.keys(dependency), ...BUILD_IN_SANDBOX_KEY];
  const proxy = new Proxy(dependency, {
    has: () => true,
    get(_, prop) {
      if (whitelist.indexOf(prop) > -1) {
        const value = dependency[prop];
        if (isFunction(value) && !value.prototype) {
          return value.bind(top);
        }
        return dependency[prop];
      } else {
        return null;
      }
    },
    set(_, prop, newValue) {
      if (whitelist.indexOf(prop) > -1) {
        dependency[prop] = newValue;
      }
      return true;
    },
  });

  return proxy;
};
```

如果大家用过`TamperMonkey`、`ViolentMonkey`暴力猴、`ScriptCat`脚本猫等相关谷歌扩展的话，可以发现其存在`window`以及`unsafeWindow`两个对象。`window`对象是一个隔离的安全`window`环境，而`unsafeWindow`就是用户页面中的`window`对象。

曾经我很长一段时间都认为这些插件中可以访问的`window`对象实际上是浏览器拓展的`Content Scripts`提供的`window`对象，而`unsafeWindow`是用户页面中的`window`，以至于我用了比较长的时间在探寻如何直接在浏览器拓展中的`Content Scripts`直接获取用户页面的`window`对象。当然最终还是以失败告终，这其中比较有意思的是一个逃逸浏览器拓展的实现，因为在`Content Scripts`与`Inject Scripts`是共用`DOM`的，所以可以通过`DOM`来实现逃逸，当然这个方案早已失效。

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

此外在`FireFox`中还提供了一个`wrappedJSObject`来帮助我们从`Content Scripts`中访问页面的的`window`对象，但是这个特性也有可能因为不安全在未来的版本中被移除。那么为什么现在我们可以知道其实际上是同一个浏览器环境呢，除了看源码之外我们也可以通过以下的代码来验证脚本在浏览器的效果，可以看出我们对于`window`的修改实际上是会同步到`unsafeWindow`上，证明实际上是同一个引用。

```js
unsafeWindow.name = "111111";
console.log(window === unsafeWindow); // false
console.log(window); // Proxy {Symbol(Symbol.toStringTag): 'Window'}
console.log(window.onblur); // null
unsafeWindow.onblur = () => 111;
console.log(unsafeWindow); // Window { ... }
console.log(unsafeWindow.name, window.name); // 111111 111111
console.log(window.onblur); // () => 111
const win = new Function("return this")();
console.log(win === unsafeWindow); // true


// TamperMonkey: https://github.com/Tampermonkey/tampermonkey/blob/07f668cd1cabb2939220045839dec4d95d2db0c8/src/content.js#L476 // Not updated for a long time
// ViolentMonkey: https://github.com/violentmonkey/violentmonkey/blob/ecbd94b4e986b18eef34f977445d65cf51fd2e01/src/injected/web/gm-global-wrapper.js#L141
// ScriptCat: https://github.com/scriptscat/scriptcat/blob/0c4374196ebe8b29ae1a9c61353f6ff48d0d8843/src/runtime/content/utils.ts#L175
// wrappedJSObject: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
```


如果观察仔细的话，我们可以看到上边的验证代码最后两行我们竟然突破了这些扩展的沙盒限制，从而在未`@grant unsafeWindow`情况下能够直接访问`unsafeWindow`。从而我们同样需要思考这个问题，即使我们限制了用户的代码对于`window`等对象的访问，但是这样真的能够完整的保证安全吗，很明显是不够的，我们还需要对于各种`case`做处理，从而尽量减少用户突破沙盒限制的可能，例如在这里我们需要控制用户对于`this`的访问。

```js
export const renderWithDependency = (code: string, dependency: Sandbox) => {
  const id = getUniqueId();
  dependency.___BRIDGE___ = {};
  const bridge = dependency.___BRIDGE___ as Record<string, unknown>;
  const fn = new Function(
    "dependency",
    `with(dependency) { 
      function fn(){  "use strict"; return (${code.trim()}); };
      ___BRIDGE___["${id}"] = fn.call(null);
    }
    `
  );
  fn.call(null, dependency);
  return bridge[id];
};
```

其实说到`with`，关于`Symbol.unscopables`的知识也可以简单聊下。我们可以关注下面的例子，在第二部分我们在对象的原型链新增了一个属性，而这个属性跟我们的`with`变量重名，又恰好这个属性中的值在`with`中被访问了，于是造成了我们的值不符合预期的问题。这个问题甚至是在知名框架`Ext.js v4.2.1`中暴露出来的，于是为了兼容这个问题，`TC39`增加了`Symbol.unscopables`规则，在`ES6`之后的数组方法中每个方法都会应用这个规则。

```js
const value = [];
with(value){
  console.log(value.length); // 0
}

Array.prototype.value = { length: 10 };
with(value){
  console.log(value.length); // 10
}

Array.prototype[Symbol.unscopables].value = true;
with(value){
  console.log(value.length); // 0
}

// https://github.com/rwaldron/tc39-notes/blob/master/meetings/2013-07/july-23.md#43-arrayprototypevalues
```

### Iframe
在上文中我们一直是使用限制用户访问全局变量或者是隔离当前环境的方式来实现沙箱，但是实际上我们还可以换个思路，我们可以将用户的代码放置于一个`iframe`中来执行，这样我们就可以将用户的代码隔离在一个独立的环境中，从而实现沙箱的效果，这种方式也是比较常见的，例如`CodeSandbox`就是使用这种方式来实现的。

由此我们可以直接使用`iframe`的`contentWindow`来获取到`window`对象，然后利用该对象进行用户代码的执行，这样就可以做到用户访问环境的隔离了，此外我们还可以通过`iframe`的`sandbox`属性来限制用户的行为，例如限制`allow-forms`表单提交、`allow-popups`弹窗、`allow-top-navigation`导航修改等，这样就可以做到更加安全的沙箱了。

```js
const iframe = document.createElement("iframe");
iframe.src = "about:blank";
iframe.style.position = "fixed";
iframe.style.left = "-10000px";
iframe.style.top = "-10000px";
iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
document.body.appendChild(iframe);
const win = iframe.contentWindow;
document.body.removeChild(iframe);
console.log(win && win !== window && win.parent !== window); // true
```

那么同样的我们也可以为其加一层代理，让其中的对象访问都是使用`iframe`中的全局对象，在找不到的情况下继续访问原本传递的值。并且在编译函数的时候，我们可以使用这个完全隔离的`window`环境来执行，由此来获得完全隔离的代码运行环境。

```js
export const withIframeSandbox = (win: Record<string | symbol, unknown>, proto: Sandbox) => {
  const sandbox = Object.create(proto);
  return new Proxy(sandbox, {
    get(_, key) {
      return sandbox[key] || win[key];
    },
    has: () => true,
    set(_, key, newValue) {
      sandbox[key] = newValue;
      return true;
    },
  });
};

export const renderWithIframe = (code: string, dependency: Sandbox) => {
  const id = getUniqueId();
  dependency.___BRIDGE___ = {};
  const bridge = dependency.___BRIDGE___ as Record<string, unknown>;
  const iframe = document.createElement("iframe");
  iframe.src = "about:blank";
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "-10000px";
  iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  document.body.removeChild(iframe);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sandbox = withIframeSandbox(win || {}, dependency);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fn = new win.Function(
    "dependency",
    `with(dependency) { 
      function fn(){  "use strict"; return (${code.trim()}); };
      ___BRIDGE___["${id}"] = fn.call(null);
    }
    `
  );
  fn.call(null, sandbox);
  return bridge[id];
};
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://swc.rs/docs/usage/wasm>
- <https://zhuanlan.zhihu.com/p/589341143>
- <https://github.com/alangpierce/sucrase>
- <https://babel.dev/docs/babel-standalone>
- <https://github.com/simonguo/react-code-view>
- <https://github.com/LinFeng1997/markdown-it-react-component/>
