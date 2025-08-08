# Exploring rich text React real-time preview
In the previous article, we discussed many capabilities of rich text engines and collaboration. In this article, we lean towards the specific implementation of application components. In some scenarios, such as when writing documentation for a component library, we hope to have the ability for real-time preview. This means that users can directly write code in the document and see the real-time preview on the page. This allows users to have a more intuitive understanding of how to use the components, which is a functionality found in many component library documents. Therefore, in this article, we will focus on the real-time preview of `React` components and discuss the implementation of related capabilities. The relevant code mentioned in this article is available at `https://github.com/WindrunnerMax/ReactLive` and the implementation effect in the rich text document can be referred to at `https://windrunnermax.github.io/DocEditor/`.

## Description
First, let's briefly discuss the relevant scenarios. In fact, the API documentation for many component libraries is directly generated from `Markdown`, such as `Arco-Design`, which is actually generated from `md` files for component application examples and API tables. When we use it, we find that we cannot directly edit code on the official website for real-time preview. This is because this method directly uses a `loader` to compile the `md` file into `jsx` syntax based on certain rules. This effectively means that the code is directly generated from `md`, and then it goes through the complete code packaging process. Since there are statically deployed API documents, there must also be dynamically rendered component API documents, such as `MUI`. It also uses a `loader` to process `md` placeholder files and loads the corresponding `jsx` components into specified positions. The rendering method not only involves static compilation, but also has the ability for dynamic rendering. The code examples on the official website can be edited in real-time and the preview effect can be seen immediately.

This kind of small-scale `Playground` capability application is quite common. It is smaller in scale and does not require capabilities similar to `code-sandbox` for complete demonstrations. For technical colleagues, using `Markdown` to create documents is not a difficult task, but `Markdown` is not a widely accepted capability and still requires a certain learning cost. Rich text capabilities are relatively easier to accept. Where there are scenarios, there are requirements. We also hope to implement dynamic rendering of components in rich text, and this ability is suitable to be developed as a third-party plugin that can be loaded on demand. In addition, in the implementation of rich text, there may be some very complex scenarios, such as the folding table capability commonly used in third-party interfaces. This is not a common scenario, and the cost of implementing it in rich text would be particularly high, especially in terms of implementing interactions. The return on investment (`ROI`) would be relatively low. In reality, most companies have their own API interface platforms. Therefore, using `OpenAPI` to directly generate complex components like folding tables from the interface platform is a relatively acceptable approach. Both of the above scenarios actually require the ability to dynamically render components. The understanding of the `Playground` capability is relatively straightforward, while the reason for dynamic rendering of components in the API interface platform is that our data structure is probably not uniform. For example, some text needs to be bold. The lowest-cost solution is to directly assemble it into the `<strong />` tag and then render it within an existing component library's folding table.

Here we briefly discuss the possible approaches for implementing preview capabilities in rich text. The structure of the preview block is actually very simple, it is nothing more than a part of the code block, while the other part is the real-time preview during editing. In rich text, the implementation of code blocks generally involves many examples, for example, when using `slate`, the `decorate` capability can be used, or a common approach can be adopted in `quill` by using `prismjs` or `lowlight` to parse the entire code block. Then, the parsed parts can be sequentially placed as the content of `text` with the parsed attributes in the data structure. When rendering, the corresponding styles can be rendered based on the attributes. It may even be possible to directly embed a code editor, but this makes it more difficult to perform document-level search and replace, and requires attention to event bubbling. For the preview area, the main task is to mark the rendered content as `Embed/Void` to avoid the selection change affecting the editor's `Model`.

Next, let's move on to the main topic of how to dynamically render `React` components to achieve real-time preview. First, let's explore the implementation direction. In fact, we can simply consider that implementing a dynamically rendering component is essentially transitioning from a string to executable code. So, if in `Js` we can directly execute code, there are two methods: `eval` and `new Function`. We certainly cannot use `eval` because the code executed by `eval` runs in the current scope, which means it can access and modify variables in the current scope. Although some restrictions are put in place when using strict mode, it is still not entirely secure. This may lead to security risks and unexpected side effects. Therefore, we definitely need to use `new Function` to implement dynamic code execution.

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

So now that we have a clear direction, we can continue to study how to render `React` code. After all, the browser cannot directly execute `React` code. The relevant code in the article is available at `https://github.com/WindrunnerMax/ReactLive` and the implementation effect can also be previewed online on `Git Pages`.

## Compiler

Earlier we also mentioned that browsers cannot directly execute `React` code. One of the issues is that the browser doesn't understand what this component is. For example, if we import a `<Button />` component from a component library, the browser doesn't understand the syntax of `<Button />`. Of course, we'll discuss the issue of the `Button` component's dependencies later. So, when we write `React` components, `JSX` is actually compiled to `React.createElement`. Starting from `17`, you can use the `jsx` method from `react/jsx-runtime`, but here we are still using `React.createElement`. So, what we need to do now is to compile the `React` string, converting from `JSX` to a function call format, similar to the following:

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

`Babel` is a widely used `JS` compiler, usually used to transform the latest version of `JS` code into older version codes that browsers can understand. We can use `Babel` to compile `JSX` syntax. `babel-standalone` incorporates the core functionality and common plugins of `Babel`, which can be directly referenced in the browser, allowing us to use `Babel` to transform `JS` code directly in the browser.

In this case, we are actually using `babel 6.x`. The `babel-standalone` in `6.x` version is just `791KB` in size, while `@babel/standalone` in `7.x` version is already `2.77MB`. However, the `7.x` version supports direct types definition for `TS` with `@types/babel__standalone`, and we can use `@types/babel-core` as an alternative to use `babel-standalone`. Using `Babel` is very straightforward. We just need to pass the code and configure the relevant `presets` to obtain the code we want. However, what we obtain is still a code string. Also, we discovered that we cannot use the `<> </>` syntax, after all, it's a package from 6 years ago. This is handled normally in `@babel/standalone`.

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

Since we dynamically render components based on user input, security is a consideration, and using `Babel` has the advantage of allowing us to easily register plugins. We can handle some processing during code parsing, such as only allowing users to define a component function named `App`. If any other function is declared, a parsing failure exception will be thrown, and we can also choose to remove the current node. Of course, this is still not enough. We will need to continue discussing security-related issues in the future.

```js
import { PluginObj } from "babel-standalone";
```

```js
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

Also, we can do a simple benchmark here. Using the following code, we generated 1000 'Button' components, each containing a 'div' structure nested within it, to test the speed of compilation using `babel`. The results show that the actual speed is quite good and sufficient for small-scale `playground` scenarios.

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
`SWC` is the abbreviation for `Speedy Web Compiler`, which is a fast `TypeScript/JavaScript` compiler written in `Rust`, and is also a library that supports both `Rust` and `JavaScript`. Created to address the slow compilation speed in web development, `SWC` performs exceptionally well in terms of compilation speed compared to traditional compilers. It can utilize multiple CPU cores to process code in parallel, significantly improving compilation speed, especially for large projects or projects with a large number of files. The `rspack` we used previously is based on `SWC`.

For us, the main purpose of using `SWC` is its ability to compile quickly. We can directly use `swc-wasm`, which is the `WebAssembly` version of `SWC` and can be used directly in the browser. Because `SWC` must be asynchronously loaded, we need to define the entire process as an asynchronous function to wait for the loading to complete before using synchronous code transformation. In addition, similar to `Babel`, we can write plugins to handle intermediate products in the parsing process, but this needs to be implemented in `Rust` and involves a certain learning curve. For now, we focus on the code transformation capabilities.

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
```

```javascript
/*#__PURE__*/ React.createElement(Button, {
    className: "button-component"
}, /*#__PURE__*/ React.createElement("div", {
    className: "div-child"
}));
```

Here we are still using `1000` `Button` components nested with `div` structures to perform a simple `benchmark`. The results show that the actual compilation speed is very fast, with the main time being spent on the initial `wasm` loading. Efficiency will be greatly improved if the page is refreshed without disabling caching and directly utilizing the `304` results, thus maintaining a relatively high level of speed after the initial load.

```javascript
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
`Sucrase` is an alternative to `Babel` that enables super fast development builds. It focuses on compiling non-standard language extensions, such as `JSX`, `TypeScript`, and `Flow`. Due to its narrower support range, `Sucrase` can adopt a performance-oriented but less scalable and maintainable architecture. Its parser is a fork of `Babel`'s parser, reduced to a subset of the solutions used by `Babel`.

Similarly, we use `Sucrase` to improve compilation speed. It can be loaded directly in the browser and has a relatively small package size, making it ideal for small `Playground` scenarios. However, due to the extensive use of advanced techniques for transformation and lacking a lengthy processing flow similar to `Babel`, `Sucrase` is unable to handle intermediate code products with plugins. Therefore, when there is a need to process code, we must use regular expressions to manually match and handle related code.

```javascript
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

```javascript
<Button className="button-component">
  <div className="div-child"></div>
</Button>

// --->

React.createElement(Button, { className: "button-component",}
  , React.createElement('div', { className: "div-child",})
)
```

Here we are still using `1000` `Button` components nested with `div` structures to perform a simple `benchmark`. The results show that the actual compilation speed is very fast, significantly faster than `Babel` overall, but slightly inferior to `SWC`. However, considering that `SWC` requires a longer initialization time, using `Sucrase` is still a good choice overall.

```javascript
console.time("sucrase");
const code = getCode();
const result = compileWithSucrase(code);
console.timeEnd("sucrase");
```

```
sucrase: 47.10302734375 ms
```

## Code Construction


In the previous section, we solved the first issue of browsers not being able to directly execute `React` code, which is that the browser does not recognize code like `<Button />` as a `React` component. We need to compile it into `Js` code that the browser can understand. Therefore, in this section, we need to address two issues. The first is how to let the browser know how to find the `Button` object, which is the dependency problem. After compiling the `<Button />` component into `React.createElement(Button, null)`, the browser is not informed of what the `Button` object is or where to find it. The second issue is how to construct appropriate code after handling the compiled code and dependency problem, and how to place it within `new Function` to obtain a true `React` component instance.

### Deps/With
Here we need to briefly review `new Function` and the `with` syntax because we will use them later. Using the `Function` constructor allows us to dynamically create function objects, similar to how `eval` dynamically executes code. However, unlike `eval`, which has access to the local scope, functions created with the `Function` constructor only execute within the global scope. Its syntax is `new Function(arg0, arg1, /* ... */ argN, functionBody)`.

```js
const sum = new Function('a', 'b', 'return a + b');

console.log(sum(1, 2)); // 3
```

The `with` statement sets the scope of the code to a specific object. Its syntax is `with (expression) statement`, where `expression` is an object, and `statement` is a statement or block. `with` specifies the scope of the code to a specific object, and its internal variables reference the properties of that object. If an accessed `key` is not a property of the object, the scope continues to search until reaching `window`. If the property is still not found on `window`, a `ReferenceError` is thrown. We can use `with` to specify the scope of the code, but it increases the length of the scope chain, and its usage is not allowed in strict mode.

```js
with (Math) {
  console.log(PI); // 3.1415926
  console.log(cos(PI)); // -1
  console.log(sin(PI/ 2)); // 1
}
```

Next, let's address the dependency problem of the component, using the `<Button />` component as an example. After compilation, we need `React` and `Button` as dependencies. However, as mentioned earlier, `new Function` is in the global scope and does not access the current scope's values. Therefore, we need to find a way to pass the relevant dependencies into our code for it to execute properly. One approach could be to directly assign the relevant variables to the `window`, but this method is not elegant and is overly intrusive. Instead, we can consider the parameters of the `new Function` statement: all parameters except the last one are simply arguments, and the last one is the function body. Therefore, we can first construct an object, place all the dependencies in it, and then declare all the object's `key` as parameters and pass their `value` as parameter values during function construction and execution.

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

Using parameters is a good approach, but it may become less controllable as we use a large number of variables. In such cases, if we want to implement additional functionality, such as restricting user access to the `window`, using `with` may be a better choice. Let's first use `with` to achieve the basic capability of accessing dependencies.

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

This kind of implementation seems to be more elegant. By using a `sandbox` variable to hold all dependencies, accessing dependencies becomes more controllable. In fact, we may not want the user's code to have such high permission to access all global objects. For example, we may want to restrict users from accessing the `window`. Of course, we can directly put `window: {}` in the `sandbox` variable because when searching upwards in the scope, it stops when `window` is found. However, an obvious problem is that we cannot enumerate and put all global objects in the parameter. At this point, we need to use `with` because when using `with`, we first access this variable, so if we can proxy when accessing this variable, returning `null` for those not in the whitelist is enough. At this point, we also need to bring in the `Proxy` object. We can use `with` together with `Proxy` to restrict user access, and we will expand on this in the security section later.

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
In the aforementioned code, we solved the dependency issue and briefly addressed security concerns. However, so far we have only been dealing with strings and have not yet transformed them into actual `React` components. Here, we focus on generating `React` component objects from strings. Similarly, we still use `new Function` to execute the code. However, we need to concatenate the code string into the form we want to bring out the generated object. For example, the `<Button />` component, after being compiled by the compiler, we will get `React.createElement(Button, null)`. Therefore, when constructing the function, if we only use `new Function("sandbox", "React.createElement(Button, null)")`, even if we execute it, we will not get the component instance because this function has no return value. So, we need to concatenate it into `return React.createElement(Button, null)`, so that we can get our first method, concatenate `render` to get the returned component instance. Additionally, users may often write several components at the same level, usually requiring us to nest a layer of `div` or `React.Fragment` at the outermost level.

```js
export const renderWithInline = (code: string, dependency: Sandbox) => {
  const fn = new Function("dependency", `with(dependency) { return (${code.trim()})}`);
  return fn(dependency);
};
```

Although it seems able to meet our needs, it is important to note that we must enable the `production` and other configurations of the compiler. Additionally, we must avoid extra user input such as `import` statements. Otherwise, for example, the `Babel` compilation result in such cases where we use the concatenated `return` form will obviously cause syntax errors. So, can we change our approach and directly compile the `return` part of the code, such as `return <Button />`, in the compiler? In fact, this is possible in `Sucrase` because it does not pay particular attention to syntax, but compiles as much as possible. However, in `Babel`, it will throw a `'return' outside of function` exception, and in `SWC`, it will throw a `Return statement is not allowed here` exception. Even though our ultimate goal is to place it in the `new Function` to construct the function, using `return` is reasonable, however, the compiler is not aware of this, so we still need to pay attention to this limitation.

```js
"use strict";
```

```jsx
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

Since this approach has many limitations and requires attention and adaptation in many places, we need to change our approach. When compiling the code, it should fully comply with the syntax rules and not require attention to user input. We only need to extract the compiled components. We can achieve this by using the passed dependency. First, generate a random `id`, then configure an empty object, and assign the compiled component to this object. Finally, in the rendering function, return it using the object and `id`.

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

Here we still use the `<Button />` component as an example. Let's compare it directly with the result compiled with `Babel`. Even if we haven't turned on `production` mode, the result of the compilation still complies with the syntax rules. Due to the reference passing, we can extract the compiled component instance using `___BRIDGE___` and the randomly generated `id`.

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

Additionally, we can relatively comprehensively open up the capabilities of the component by using conventions to fix a function name such as `App`. When splicing the code, we can use `___BRIDGE___["id-xxx"] = React.createElement(App);`. Afterwards, users can have more freedom to implement related interactions with the component, such as using `useEffect` and other `Hooks`. This conventional approach is more flexible and commonly seen in applications, such as conventional routing. Below is the result of compiling and splicing `App` as the function name, which can be placed in `new Function` and used the reference of the dependency to obtain the final generated component instance.

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

## Render Components
In the previous section, we discussed how to solve the problems of code compilation, component dependencies, and building code, and finally obtain the instance of the component. In this section, we mainly discuss how to render the component on the page, which is actually quite simple. We can choose several methods to achieve the final rendering.

### Render
In `React`, we usually render components directly using `ReactDOM.render`. Similarly, we can use this method to render the component, as we have already obtained the component instance. We simply find a suitable `div` to mount and render the component on the `DOM`.

```js
// https://github.com/WindrunnerMax/ReactLive/blob/master/src/index.tsx
```

```javascript
const code = `<Button type='primary' onClick={() => alert(111)}>Primary</Button>`;
const el = ref.current;
const sandbox = withSandbox({ React, Button, console, alert });
const compiledCode = compileWithSucrase(code);
const Component = renderWithDependency(compiledCode, sandbox) as JSX.Element;
ReactDOM.render(Component, el);
```

Of course, we can also try a different approach. We can delegate the rendering capability to the user, meaning that we can specify that the user can execute `ReactDOM.render` in the code. We can encapsulate this method once to ensure that the user can only render components to our fixed `DOM` structure. Alternatively, we can directly pass `ReactDOM` to the user code to execute the rendering logic, although this is not advisable due to lack of control. However, if we can fully trust the user input, this rendering method is acceptable.

```javascript
const INIT_CODE = `
render(<Button type='primary' onClick={() => alert(111)}>Primary</Button>);
`;
const render = (element: JSX.Element) => ReactDOM.render(element, el);
const sandbox = withSandbox({ React, Button, console, alert, render });
const compiledCode = compileWithSucrase(code);
renderWithDependency(compiledCode, sandbox);
```

### SSR
In fact, rendering `React` components in a `Markdown` editor is a common practice, for example, dynamic rendering during editing and static rendering when consuming components. When consuming, dynamic rendering of components is the scenario we mentioned at the beginning, and `Markdown` frameworks usually support `SSR`. Therefore, we also need to support `SSR` for static rendering of components. In fact, we can dynamically compile code to obtain `React` components, then use `ReactDOMServer.renderToString` (which returns `data-reactid` to signal to `React` that the content has been server-rendered and should not be re-rendered on the client) or `ReactDOMServer.renderToStaticMarkup` to generate HTML tags, known as "dehydration". These can then be placed in HTML and returned to the client. On the client side, we can use `ReactDOM.hydrate` to inject events into the components, known as "rehydration", thus achieving `SSR` server-side rendering. Below is a `DEMO` implemented using `express`, which essentially represents the most basic principle of `SSR`.

```javascript
// https://codesandbox.io/p/sandbox/ssr-w468kc?file=/index.js:1,36
const express = require("express");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { Button } = require("@arco-design/web-react");
const { transform } = require("sucrase");

const code = `<Button type="primary" onClick={() => alert(1)}>Primary</Button>`;
const OPTIONS = { transforms: ["jsx"], production: true };

const App = () => { // Server-side `React` component
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
```

```javascript
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
        const App = () => { // Client-side \`React\` component
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

## Security Considerations
Since we've chosen to render components dynamically, security inevitably needs to be considered. For example, in the simplest form of attack, a user could write a function in the code to obtain the current user's `Cookie`, and then construct an `XHR` object or use `fetch` to send the `Cookie` to their server. If the website doesn't have `HttpOnly` enabled and this code gets stored, every other user who visits the page in the future will unknowingly send their `Cookie` to the malicious server, enabling the attacker to obtain other users' `Cookie` information. This poses a serious threat known as persistent XSS attack. Additionally, as mentioned earlier, if malicious code executes on the server side in an SSR rendering mode, it would be an even more dangerous operation. Therefore, it's crucial to consider the security implications of user actions.

In reality, as long as user input is being accepted and executed as code, we cannot completely guarantee that this behavior is secure. What we need to be mindful of is to never trust user input. The safest approach is to not allow user input at all. However, for the current scenario, that's not feasible. Therefore, it's essential to ensure that user input is within manageable limits. For example, only allowing internal company input for document creation, and ensuring that externally received content is strictly for consumption without being stored and displayed to other users. This can significantly mitigate the risk of malicious attacks. Nevertheless, even with these measures in place, we still strive to securely execute user-inputted code. The most common approach is to restrict user access to global objects like `window`.

### Deps
In the previous section, we also mentioned that `new Function` is in the global scope and does not read the variables in the defining scope. However, since we are constructing a function, we can completely pass all the variables from the `window` to this function and assign `null` to the variable names. This way, when searching for values in the scope, we will directly obtain the values we passed in without continuing to search upwards. This approach can be used whether by using parameters or constructing `with`. It also allows us to limit user access through a whitelist. Of course, the properties of this object can be as many as thousands, which may not appear so elegant.

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
The `Proxy` object can create a proxy for another object, which can intercept and redefine the basic operations of the object, such as property lookup, assignment, enumeration, function calls, and so on. Thus, in combination with the previous use of `with`, we can delegate all object access and assignments to `sandbox` to achieve more precise control over object access. Below is a simple sandbox implementation using `Proxy`, which allows us to limit user access through a whitelist. If the accessed object is not in the whitelist, it returns `null`; if it is in the whitelist, it returns the object itself.

In this implementation, the `with` statement determines whether the accessed field is in the object using the `in` operator, thus deciding whether to continue looking up through the scope chain. Therefore, we need to ensure that `has` always returns `true` to prevent code from accessing the global object through the scope chain. Furthermore, functions like `alert` and `setTimeout` must run in the `window` scope. These functions share the characteristic of being non-constructible and lacking a `prototype` property, which we can use for filtering and binding `window` when fetching.

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

If you've used Google Chrome plugins like `TamperMonkey`, `ViolentMonkey`, or `ScriptCat`, you may have noticed the presence of two objects, `window` and `unsafeWindow`. The `window` object is a secure and isolated environment, while `unsafeWindow` is the window object in the user's page. For a long time, I used to believe that the `window` object accessible in these plugins was actually provided by the Content Scripts of the browser extensions, and that `unsafeWindow` was the user page's `window`. This led me to spend a significant amount of time exploring how to directly access the user page's `window` object from the Content Scripts of the browser extensions. However, my quest ended in failure. One interesting concept in this pursuit was the implementation of an escape from the browser extension. Since Content Scripts and Inject Scripts share the DOM, it was once possible to escape through the DOM. However, this approach has long been outdated.

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

In addition, `FireFox` also provides a `wrappedJSObject` to help us access the page's `window` object from Content Scripts. However, this feature may also be removed in future versions due to security concerns. So, why do we know that they are actually the same browser environment? Aside from inspecting the source code, we can also verify the script's effect in the browser through the following code. It shows that modifications to `window` are actually synchronized with `unsafeWindow`, proving that they are indeed the same reference.

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
```

// TamperMonkey: [https://github.com/Tampermonkey/tampermonkey/blob/07f668cd1cabb2939220045839dec4d95d2db0c8/src/content.js#L476](https://github.com/Tampermonkey/tampermonkey/blob/07f668cd1cabb2939220045839dec4d95d2db0c8/src/content.js#L476) - Not updated for a long time
// ViolentMonkey: [https://github.com/violentmonkey/violentmonkey/blob/ecbd94b4e986b18eef34f977445d65cf51fd2e01/src/injected/web/gm-global-wrapper.js#L141](https://github.com/violentmonkey/violentmonkey/blob/ecbd94b4e986b18eef34f977445d65cf51fd2e01/src/injected/web/gm-global-wrapper.js#L141)
// ScriptCat: [https://github.com/scriptscat/scriptcat/blob/0c4374196ebe8b29ae1a9c61353f6ff48d0d8843/src/runtime/content/utils.ts#L175](https://github.com/scriptscat/scriptcat/blob/0c4374196ebe8b29ae1a9c61353f6ff48d0d8843/src/runtime/content/utils.ts#L175)
// wrappedJSObject: [https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts)

Upon careful observation, in the last two lines of the verification code, we actually circumvented the sandbox limitations of these extensions, thus enabling direct access to `unsafeWindow` without needing `@grant unsafeWindow`. This leads us to consider whether limiting the user's code access to objects like `window` is sufficient to guarantee security. Clearly, it's not enough. We need to handle various cases to minimize the possibility of users bypassing the sandbox, such as controlling user access to `this`.

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

When it comes to 'with', we can briefly talk about the knowledge of `Symbol.unscopables`. We can focus on the following example. In the second part, we added a property to the object's prototype chain, and this property happens to have the same name as our `with` variable. Additionally, the value in this property is accessed within the `with`, leading to unexpected behavior. This issue was even exposed in the well-known framework `Ext.js v4.2.1`. In order to address this issue, `TC39` introduced the `Symbol.unscopables` rule. After `ES6`, this rule is applied to each array method.

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
In the previous discussion, we have been using methods to restrict user access to global variables or isolate the current environment in order to implement a sandbox. However, we can also adopt a different approach. Placing the user's code within an `iframe` for execution allows us to isolate the user's code in an independent environment, effectively achieving the sandbox effect. This approach is quite common. For instance, `CodeSandbox` uses this method for implementation. We can directly use the `contentWindow` of the `iframe` to access the `window` object and then execute the user's code using this object. This enables us to achieve isolation of the user's access to the environment. Furthermore, we can also use the `sandbox` attribute of the `iframe` to restrict user behavior, such as limiting `allow-forms` form submission, `allow-popups` pop-ups, and `allow-top-navigation` navigation modification, thus creating a more secure sandbox.

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

Similarly, we can also add a layer of proxies to ensure that all object accesses within the `iframe` are done using the global object of the `iframe`. If the object is not found, it will continue to access the originally passed value. Additionally, when compiling functions, we can use this completely isolated `window` environment for execution, thereby achieving a completely isolated code execution environment.

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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://swc.rs/docs/usage/wasm
https://zhuanlan.zhihu.com/p/589341143
https://github.com/alangpierce/sucrase
https://babel.dev/docs/babel-standalone
https://github.com/simonguo/react-code-view
https://github.com/LinFeng1997/markdown-it-react-component/
```