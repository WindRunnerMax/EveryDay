# 初探富文本之React实时预览
在前文中我们探讨了很多关于富文本引擎和协同的能力，在本文中我们更偏向具体的应用组件实现。在一些场景中比如组件库的文档编写时，我们希望能够有实时预览的能力，也就是用户可以在文档中直接编写代码，然后在页面中实时预览，这样可以让用户更加直观的了解组件的使用方式，这也是很多组件库文档中都会有的一个功能。那么我们在本文就侧重于`React`组件的实时预览，来探讨相关能力的实现。

## 描述
首先我们先简单探讨下相关的场景，实际上当前很多组件库的`API`文档都是由`Markdown`来直接生成的，例如`Arco-Design`，实际上是通过一个个`md`文件来生成的组件应用示例以及`API`表格，那么其实我们用的时候也可以发现我们是无法直接在官网编辑代码来实时预览的，这是因为这种方式是直接利用`loader`来将`md`文件根据一定的规则编译成了`jsx`语法，这样实际上就相当于直接用`md`生成了代码，之后就是完整地走了代码打包流程。那么既然有静态部署的`API`文档，肯定也有动态渲染组件的`API`文档，例如`MUI`，其同样也是通过`loader`处理`md`文件的占位，将相应的`jsx`组件通过指定的位置加载进去，只不过其的渲染方式除了静态编译完成后还多了动态渲染的能力，官网的代码示例就是可以实时编辑的，并且能够即使预览效果。

这种小规模的`Playground`能力应用还是比较广泛的，其比较小而不至于使用类似于`code-sandbox`的能力来做完整的演示，基于`Markdown`来完成文档对于技术同学来说并不是什么难事，但是`Markdown`毕竟不是一个可以广泛接受的能力，还是需要有一定的学习成本的，富文本能力会相对更容易接受一些，那么有场景就有需求，我们同样也会希望能在富文本中实现这种动态渲染组件的能力，这种能力适合做成一种按需加载的第三方插件的形式。此外，在富文本的实现中可能会有一些非常复杂的场景，例如第三方接口常用的折叠表格能力，这不是一个常见的场景而且在富文本中实现成本会特别高，尤其体现在实现交互上，`ROI`会比较低，而实际上公司内部一般都会有自己的`API`接口平台，于是利用`OpenAPI`对接接口平台直接生成折叠表格等复杂组件就是一个相对可以接受的方式。上述的两种场景下实际上都需要动态渲染组件的能力，`Playground`能力的能力比较好理解，而对接接口平台需要动态渲染组件的原因是我们的数据结构大概率是无法平齐的，例如某些文本需要加粗，成本最低的方案就是我们直接组装为`<strong />`的标签，并入已有组件库的折叠表格中将其渲染出来即可。

我们在这里也简单聊一下富文本中实现预览能力可以参考的方案，预览块的结构实际上很简单，无非是一部分是代码块，在编辑时另一部分可以实时预览，而在富文本中实现代码块一般都会有比较多的示例，例如使用`slate`时可以使用`decorate`的能力，或者可以在`quill`采用通用的方案，使用`prismjs`或者`lowlight`来解析整个代码块，之后将解析出的部分依次作为`text`的内容并且携带解析的属性放置于数据结构中，在渲染时根据属性来渲染出相应的样式即可，甚至于可以直接嵌套代码编辑器进去，只不过这样文档级别的搜索替换会比较难做，而且需要注意事件冒泡的处理，而预览区域主要需要做的是将渲染出的内容标记为`Embed/Void`，避免选区变换对编辑器的`Model`造成影响。

那么接下来我们进入正题，如何动态渲染`React`组件来完成实时预览，我们首先来探究一下实现方向，实际上我们可以简单思考一下，实现一个动态渲染的组件实际上不就是从字符串到可执行代码嘛，那么如果在`Js`中我们能直接执行代码中能直接执行代码的方法有两个: `eval`和`new Function`，那么我们肯定是不能用`eval`的，`eval`执行的代码将在当前作用域中执行，这意味着其可以访问和修改当前作用域中的变量，虽然在严格模式下做了一些限制但明显还是没那么安全，这可能导致安全风险和意外的副作用，而`new Function`构造函数创建的函数有自己的作用域，其只能访问全局作用域和传递给它的参数，从而更容易控制代码的执行环境，在后文中安全也是我们需要考虑的问题，所以我们肯定是需要用`new Function`来实现动态代码执行的。

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
前边我们也提到了，浏览器是不能直接执行`React`代码的，这其中一个问题就是浏览器并不知道这个组件是什么，例如我们从组件库引入了一个`<Button />`组件，那么将这个组件交给浏览器的时候其并不知道`<Button />`是什么语法，当然针对于`Button`这个组件依赖的问题我们后边再聊，那么实际上在我们平时写`React`组件的时候，`jsx`实际上是会编译成`React.createElement`的，在`17`之后可以使用`react/jsx-runtime`的`jsx`方法，在这里我们还是使用`React.createElement`，所以我们现在要做的就是将`React`字符串进行编译，从`jsx`转换为函数调用的形式，类似于下面的形式:


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

在这里实际上我们在这里用的是`babel 6.x`，`babel-standalone`也就是`6.x`版本的`min.js`包才`791KB`，而`@babel/standalone`也就是`7.x`版本的`min.js`包已经`2.77MB`了，只不过`7.x`版本会有`TS`直接类型定义`@types/babel__standalone`，使用`babel-standalone`就需要曲线救国了，可以使用`@types/babel-core`来中转一下。那么其实使用`Babel`非常简单，我们只需要将代码传进去，配置好相关的`presets`就可以得到我们想要的代码了，当然在这里我们得到的依旧是代码字符串，并且实际在使用的时候发现还不能使用`<></>`语法，毕竟是`6`年前的包了，在`@babel/standalone`中是可以正常处理的。

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

实际上因为我们是接受用户的输入来动态地渲染组件的，所以安全问题我们是需要考虑在内的，而使用`Babel`的一个好处是我们可以比较简单地注册插件，在代码解析的时候就可以进行一些处理，例如我们只允许用户定义名为`App`的组件函数，一旦声明其他函数则抛出解析失败的异常，我们也可以选择移除当前节点。当然仅仅是这些还是不够的，关于安全的相关问题我们后续还需要继续讨论。

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

那么对于我们来说，使用`SWC`的主要目的是为了其能够快速编译，那么我们就可以直接使用`swc-wasm`来实现，其是`SWC`的`WebAssembly`版本，可以直接在浏览器中使用。因为`SWC`必须要异步加载才可以，所以我们是需要将整体定义为异步函数才行，等待加载完成之后我们就可以使用同步的代码转换了，此外使用`SWC`也是可以写插件来处理解析过程中的中间产物的，类似于`Babel`我们可以写插件来限制某些行为，但是需要用`Rust`来实现，还是有一定的学习成本，我们现在还是关注代码的转换能力。

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
`Sucrase`是`Babel`的替代品，可以实现超快速的开发构建，其专注于编译非标准语言扩展，例如`JSX`、`TypeScript`、`Flow`，由于支持范围较小，`Sucrase`可以采用性能更高但可扩展性和可维护性较差的架构，`Sucrase`的解析器是从`Babel`的解析器分叉出来的，并将其缩减为`Babel`解决问题的一个集合中的子集。

同样的，我们使用`Sucrase`的目的是提高编译速度，`Sucrase`可以直接在浏览器中加载，并且包体积比较小，实际上是非常适合我们这种小型`Playground`场景的。只不过因为使用了非常多的黑科技进行转换，并没有类似于`Babel`有比较长的处理流程，`Sucrase`是没有办法做插件来处理代码中间产物的，所以在需要处理代码的情况下，我们需要使用正则表达式自行匹配处理相关代码。

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

在这里我们依然使用`1000`个`Button`组件与`div`结构的嵌套来做一个简单的`benchmark`，从结果可以看出实际编译速度是非常快的，整体而言速度远快于`Babel`但是略微逊色于`SWC`，当然`SWC`需要比较长时间的初始化，所以整体上来说使用`Sucrase`是不错的选择。

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

在上一节我们解决了浏览器无法直接执行`React`代码的第一个问题，即浏览器不认识形如`<Button />`的代码是`React`组件，我们需要将其编译成浏览器能够认识的`Js`代码，那么紧接着在本节中我们需要解决两个问题，第一个问题是如何让浏览器知道如何找到`Button`这个对象也就是依赖问题，在我们将`<Button />`组件编译为`React.createElement(Button, null)`之后，并没有告知浏览器`Button`对象是什么或者应该从哪里找到这个对象，第二个问题是我们处理好编译后的代码以及依赖问题之后，我们应该如何构造合适的代码，将其放置于`new Function`中执行，由此得到真正的`React`组件实例。


### with/deps
在这里因为我们后边需要用到`new Function`以及`with`语法，所以在这里先回顾一下。通过`Function`构造函数可以动态创建函数对象，类似于`eval`可以动态执行代码，然而与具有访问本地作用域的`eval`不同，`Function`构造函数创建的函数仅在全局作用域中执行，其语法为`new Function(arg0, arg1, /* …, */ argN, functionBody)`。

```js
const sum = new Function('a', 'b', 'return a + b');

console.log(sum(1, 2)); // 3
```

`with`语句可以将代码的作用域设置到一个特定的对象中，其语法为`with (expression) statement`，`expression`是一个对象，`statement`是一个语句或者语句块。`with`可以将代码的作用域指定到特定的对象中，其内部的变量都是指向该对象的属性，如果访问某个`key`时该对象中没有该属性，那么便会继续沿着作用域检索直至`window`，如果在`window`上还找不到那么就会拋出`ReferenceError`异常，由此我们可以借助`with`来指定代码的作用域，只不过`with`语句会增加作用域链的长度，而且严格模式下不允许使用`with`语句。

```js
with (Math) {
  console.log(PI); // 3.1415926
  console.log(cos(PI)); // -1
  console.log(sin(PI/ 2)); // 1
}
```

那么首先我们来解决一下组件的依赖问题


```js
new Function("sandbox", `
with(sandbox){
 // xxx
}
`)(sandbox);
```

```js
new Function(...Object.keys(sandbox), `
 // xxx
`)(...Object.values(sandbox));
```

### jsx/fn

```jsx
<Button></Button>

// return 
// const ___COMPONENT = <Button></Button>; ___BRIDGE["sssss"] = ___COMPONENT;
```

```jsx
const App = () => {
  return <Button></Button>;
};
```

## 渲染组件

### render

```js
const code = `
const App = () => {
    // xxx
}
return App;
`;
ReactDOM.render(<App></App>, dom);
```

```js
const code = `
const App = () => {
    // xxx
}
return App;

ReactDOM.render(<App></App>);
`;
```

### ssr

```js
ReactDOMServer.renderToStaticMarkup
ReactDOM.hydrate
```

## 安全考量
既然我们选择了动态渲染组件，那么安全性必然是需要考量的。例如最简单的一个攻击形式，我作为用户在代码中编写了函数能取得当前用户的`Cookie`，并且构造了`XHR`对象或者通过`fetch`将`Cookie`发送到我的服务器中，如果此时网站恰好没有开启`HttpOnly`，并且将这段代码落库了，那么以后每个打开这个页面的其他用户都会将其`Cookie`发送到我的服务器中，这样我就可以拿到其他用户的`Cookie`，这是非常危险的存储型`XSS`攻击。

那么实际上只要接受了用户输入并且作为代码执行，那么我们就无法完全保证这个行为是安全的，我们应该注意的是永远不要相信用户的输入，所以实际上最安全的方式就是不让用户输入，当然对于目前这个场景来说是做不到的，那么我们最好还是要能够做到用户是可控范围的，比如只接受公司内部的输入来编写文档，对外来说只是消费侧不会将内容落库展示到其他用户面前，这样就可以很大程度上的避免一些恶意的攻击。当然即使是这样，我们依然希望能够做到安全地执行用户输入的代码，那么最常用的方式就是限制用户对于`window`等全局对象的访问。

### deps

```js
const sandbox = { window: {} }
```

### proxy

`window/unsafeWindow`

```js
new Proxy(sandbox, {
  get(_, name): unknown {
    switch (name) {
      case "window":
      case "document":
        return {};
    }
  },
});
```

### iframe

```js
const iframe = document.createElement("iframe");
iframe.src = "about:blank";
iframe.style.position = "fixed";
iframe.style.left = "-10000px";
iframe.style.top = "-10000px";
document.body.appendChild(iframe);
const sandbox = iframe.contentWindow;
document.body.removeChild(iframe);
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://swc.rs/docs/usage/wasm
https://github.com/alangpierce/sucrase
https://babel.dev/docs/babel-standalone
https://github.com/simonguo/react-code-view
https://github.com/LinFeng1997/markdown-it-react-component/
```



