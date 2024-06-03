# 基于React的SSG渲染方案
静态站点生成`SSG - Static Site Generation`是一种在构建时生成静态`HTML`等文件资源的方法，其可以完全不需要服务端的运行，通过预先生成静态文件，实现快速的内容加载和高度的安全性。由于其生成的是纯静态资源，便可以利用`CDN`等方案以更低的成本和更高的效率来构建和发布网站，在博客、知识库、`API`文档等场景有着广泛应用。

## 描述
在前段时间遇到了一个比较麻烦的问题，我们是主要做文档业务的团队，而由于对外的产品文档涉及到全球很多地域的用户，因此在`CN`以外地域的网站访问速度就成了比较大的问题。虽然我们有多区域部署的机房，但是每个地域机房的数据都是相互隔离的，而实际上很多产品并不会做很多特异化的定制，因此文档实际上是可以通用的，特别是提供了多语言文档支持的情况下，各地域共用一份文档也变得合理了起来。而即使对于`CN`和海外地区有着特异化的定制，但在海外本身的访问也会有比较大的局限，例如假设机房部署在`US`，那么在`SG`的访问速度同样也会成为一件棘手的事情。

那么问题来了，如果我们需要做到各地域访问的高效性，那么就必须要在各个地域的主要机房部署服务，而各个地域又存在数据隔离的要求，那么在这种情况下我们可能需要手动将文档复制到各个机房部署的服务上去，这必然就是一件很低效的事情，即使某个产品的文档不会经常更新，但是这种人工处理的方式依然是会耗费大量精力的，显然是不可取的。而且由于我们的业务是管理各个产品的文档，在加上在海外业务不断扩展的情况下，这类的反馈需求必然也会越来越多，那么解决这个问题就变成了比较重要的事情。

那么在这种情况下，我就忽然想到了我的博客站点的构建方式，为了方便我会将博客直接通过`gh-pages`分支部署在`GitHub Pages`上，而`GitHub Pages`本身是不支持服务端部署的，也就是说我的博客站全部都是静态资源。由此可以想到在业务中我们的文档站也可以用类似的方式来实现，也就是在发布文档的时候通过`SSG`编译的方式来生成静态资源，那么在全部的内容都是静态资源的情况下，我们就可以很轻松地基于`CDN`来实现跨地域访问的高效性。此外除了调度`CDN`的分发方式，我们还可以通过将静态资源发布到业务方申请的代码仓库中，然后业务方就可以自行部署服务与资源了，通过多机房部署同样可以解决跨地域访问的问题。

当然，因为要考虑到各种问题以及现有部署方式的兼容，在我们的业务中通过`SSG`来单独部署实现跨地域的高效访问并不太现实，最终大概率还是要走合规的各地域数据同步方案来保证数据的一致性与高效访问。但是在思考通过`SSG`来作为这个问题的解决方案时，我还是很好奇如何在`React`的基础上来实现`SSG`渲染的，毕竟我的博客就可以算是基于`Mdx`的`SSG`渲染。最开始我把这个问题想的特别复杂，但是在实现的时候发现只是实现基本原理的话还是很粗暴的解决方案，在渲染的时候并没有想象中要处理得那么精细，当然实际上要做完整的方案特别是要实现一个框架也不是那么容易的事情，对于数据的处理与渲染要做很多方面的考量。

在我们正式开始聊`SSG`的基本原理前，我们可以先来看一下通过`SSG`实现静态站点的特点: 

* 访问速度快: 静态网站只是一组预先生成的`HTML`、`CSS`、`JavaScript`、`Image`等静态文件，没有运行在服务器上的动态语言程序，在部署于`CDN`的情况下，用户可以直接通过边缘节点高效获取资源，可以减少加载时间并增强用户体验。
* 部署简单: 静态网站可以在任何托管服务上运行，例如`GitHub Pages`、`Vercel`等，我们只需要传输文件即可，无需处理服务器配置和数据库管理等，如果借助`Git`版本控制和`CI/CD`工具等，还可以比较轻松地实现自动化部署。
* 资源占用低: 静态网站只需要非常少的服务器资源，这使得其可以在低配置的环境中运行，我们可以在较低配置的服务器上借助`Nginx`轻松支撑`10k+`的`QPS`网站访问。
* `SEO`优势: 静态网站通常对搜索引擎优化`SEO`更加友好，预渲染的页面可以拥有完整的`HTML`标签结构，并且通过编译可以使其尽可能符合语义化结构，这样使得搜索引擎的机器人更容易抓取和索引。

那么同样的，通过`SSG`生成的静态资源站点也有一些局限性:

* 实时性不强: 由于静态站点需要提前生成，因此就无法像动态网站一样根据实时的请求生成对应的内容，例如当我们发布了新文档之后，就必须要重新进行增量编译甚至是全站全量编译，那么在编译期间就无法访问到最新的内容。
* 不支持动态交互: 静态站点通常只是静态资源的集合，因此在一些动态交互的场景下就无法实现，例如用户登录、评论等功能，当然这些功能可以通过客户端渲染时动态支持，那么这种情况就不再是纯粹的静态站点，通常是借助`SSG`来实现更好的首屏和`SEO`效果。

综上所述，`SSG`更适用于生成内容较为固定、不需要频繁更新、且对于数据延迟敏感较低的的项目，并且实际上我们可能也只是选取部分能力来优化首屏等场景，最终还是会落到`CSR`来实现服务能力。因此当我们要选择渲染方式的时候，还是要充分考虑到业务场景，由此来确定究竟是`CSR - Client Side Render`、`SSR - Server Side Render`、`SSG - Static Site Generation`更适合我们的业务场景，甚至在一些需要额外优化的场景下，`ISR - Incremental Static Regeneration`、`DPR - Distributed Persistent Rendering`、`ESR - Edge Side Rendering`等也可以考虑作为业务上的选择。 

当然，回到最初我们提到的问题上，假如我们只是为了静态资源的同步，通过`CDN`来解决全球跨地域访问的问题，那么实际上并不是一定需要完全的`SSG`来解决问题。将`CSR`完全转变为`SSR`毕竟是一件改造范围比较大的事情，而我们的目标仅仅是一处生产、多处消费，因此我们可以转过来想一想实际上`JSON`文件也是属于静态资源的一种类型，我们可以直接在前端发起请求将`JSON`文件作为静态资源请求到浏览器并且借助`SDK`渲染即可，至于一些交互行为例如点赞等功能的速度问题我们也是可以接受的，文档站最的主要行为还是阅读文档。此外对于`md`文件我们同样可以如此处理，例如`docsify`就是通过动态请求，但是同样的对于搜索引擎来说这些需要执行`Js`来动态请求的内容并没有那么容易抓取，所以如果想比较好地实现这部分能力还是需要不断优化迭代。

那么接下来我们就从基本原理开始，优化组件编译的方式，进而基于模版渲染生成`SSG`，文中相关`API`的调用基于`React`的`17.0.2`版本实现，内容相关的`DEMO`地址为`https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/react-render-ssg`。

## 基本原理
通常当我们使用`React`进行客户端渲染`CSR`时，只需要在入口的`index.html`文件中置入`<div id="root"></div>`的独立`DOM`节点，然后在引入的`xxx.js`文件中通过`ReactDOM.render`方法将`React`组件渲染到这个`DOM`节点上即可。将内容渲染完成之后，我们就会在某些生命周期或者`Hooks`中发起请求，用以动态请求数据并且渲染到页面上，此时便完成了组件的渲染流程。

那么在前边我们已经聊了比较多的`SSG`内容，那么可以明确对于渲染的主要内容而言我们需要将其离线化，因此在这里就需要先解决第一个问题，如何将数据离线化，而不是在浏览器渲染页面之后再动态获取。很明显在前边我们提到的将数据从数据库请求出来之后写入`json`文件就是个可选的方式，我们可以在代码构建的时候请求数据，在此时将其写入文件，在最后一并上传到`CDN`即可。

在我们的离线数据请求问题解决后，我们就需要来看渲染问题了，前边也提到了类似的问题，如果依旧按照之前的渲染思路，而仅仅是将数据请求的地址从服务端接口替换成了静态资源地址，那么我们就无法做到`SEO`以及更快的首屏体验。其实说到这里还有一个比较有趣的事情，当我们用`SSR`的时候，假如我们的组件是`dynamic`引用的，那么`Next`在输出`HTML`的时候会将数据打到`HTML`的`<script />`标签里，在这种情况下实际上首屏的效率还是不错的，并且`Google`进行索引的时候是能够正常将动态执行`Js`渲染后的数据抓取，对于我们来说也可以算作一种离线化的渲染方案。

那么这种方式虽然可行但是并不是很好的方案，我们依然需要继续解决问题，那么接下来我们需要正常地来渲染完整的`HTML`结构。在`ReactDOM`的`Server API`中存在存在两个相关的`API`，分别是`renderToStaticMarkup`与`renderToString`，这两个`API`都可以将`React`组件输出`HTML`标签的结构，只是区别是`renderToStaticMarkup`渲染的是不带`data-reactid`的纯`HTML`结构，当客户端进行`React`渲染时会完全重建`DOM`结构，因此可能会存在闪烁的情况，`renderToString`则渲染了带标记的`HTML`结构，`React`在客户端不会重新渲染`DOM`结构，那么在我们的场景下时需要通过`renderToString`来输出`HTML`结构的。

```js
// packages/react-render-ssg/src/basic/index.ts
import ReactDOMServer from "react-dom/server";

const App = React.createElement(
  React.Fragment,
  null,
  React.createElement("div", null, "React HTML Render"),
  React.createElement(
    "button",
    {
      onClick: () => alert("On Click"),
    },
    "Button"
  )
);

const HTML = ReactDOMServer.renderToString(App);
// <div data-reactroot="">React HTML Render</div><button data-reactroot="">Button</button>
```

当前我们已经得到组件渲染过后的完整`HTML`结构，紧接着从输出的内容我们可以看出来一个问题，我们定义的`onClick`函数并没有在渲染过后的`HTML`结构中体现出来，此时在我们的`HTML`结构中只是一些完整的标签，并没有任何事件的处理。当然这也是很合理的情况，我们是用`React`框架实现的事件处理，其并不太可能直接完整地映射到输出的`HTML`中，特别是在复杂应用中我们还是需要通过`React`来做后续事件交互处理的，那么很显然我们依旧需要在客户端处理相关的事件。

那么在`React`中我们常用的处理客户端渲染函数就是`ReactDOM.render`，那么当前我们实际上已经处理好了`HTML`结构，而并不需要再次将内容完整地渲染出来，或者换句话说我们现在需要的是将事件挂在相关`DOM`上来处理交互行为，将`React`附加到在服务端环境中已经由`React`渲染的现有`HTML`上，由`React`来接管有关的`DOM`的处理。那么对于我们来说，我们需要将同样的`React`组件在客户端一并定义，然后将其输出到页面的`Js`中，也就是说这部分内容是需要在客户端中执行的。

```js
// packages/react-render-ssg/src/basic/index.ts
const PRESET = `
const App = React.createElement(
  React.Fragment,
  null,
  React.createElement("div", null, "React HTML Render"),
  React.createElement(
    "button",
    {
      onClick: () => alert("On Click"),
    },
    "Button"
  )
);
const _default = App;
ReactDOM.hydrate(_default, document.getElementById("root"));
`;

await fs.writeFile(`dist/${jsPathName}`, PRESET);
```

实际上这部分代码都是在服务端生成的，我们此时并没有在客户端运行的内容，或者说这是我们的编译过程，还没有到达运行时，所以我们生成的一系列内容都是在服务端执行的，那么很明显我们是需要拼装`HTML`等静态资源文件的。因此在这里我们可以通过预先定义一个`HTML`文件的模版，然后将构建过程中产生的内容放到模版以及新生成的文件里，产生的所有内容都将随着构建一并上传到`CDN`上并分发。

```html
<!-- packages/react-render-ssg/public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... Meta -->
    <title>Template</title>
    <!-- INJECT STYLE -->
  </head>
  <body>
    <div id="root">
      <!-- INJECT HTML -->
    </div>
    <!-- ... React Library  -->
    <!-- INJECT SCRIPT -->
  </body>
</html>
```

```js
// packages/react-render-ssg/src/basic/index.ts
const template = await fs.readFile("./public/index.html", "utf-8");
await fs.mkdir("dist", { recursive: true });
const random = Math.random().toString(16).substring(7);
const jsPathName = `${random}.js`;
const html = template
.replace(/<!-- INJECT HTML -->/, HTML)
.replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsPathName}"></script>`);
await fs.writeFile(`dist/${jsPathName}`, PRESET);
await fs.writeFile(`dist/index.html`, html);
```

至此我们完成了最基本的`SSG`构建流程，接下来就可以通过静态服务器访问资源了，在这部分`DEMO`可以直接通过`ts-node`构建以及`anywhere`预览静态资源地址。实际上当前很多开源的静态站点搭建框架例如`VitePress`、`RsPress`等等都是采用类似的原理，都是在服务端生成`HTML`、`Js`、`CSS`等等静态文件，然后在客户端由各自的框架重新接管`DOM`的行为，当然这些框架的集成度很高，对于相关库的复用程度也更高。而针对于更复杂的应用场景，还可以考虑`Next`、`Gatsby`等框架实现，这些框架在`SSG`的基础上还提供了更多的能力，对于更复杂的应用场景也有着更好的支持。

## 组件编译
虽然在前边我们已经实现了最基本的`SSG`原理，但是很明显我们为了最简化地实现原理人工处理了很多方面的内容，例如在上述我们输出到`Js`文件的代码中是通过`PRESET`变量定义的纯字符串实现的代码，而且我们对于同一个组件定义了两遍，相当于在服务端和客户端分开定义了运行的代码，那么很明显这样的方式并不太合理，接下来我们就需要解决这个问题。

那么我们首先需要定义一个公共的`App`组件，在该组件的代码实现中与前边的基本原理中一致，这个组件会共享在服务端的`HTML`生成和客户端的`React Hydrate`，而且为了方便外部的模块导入组件，我们通常都是通过`export default`的方式默认导出整个组件。

```js
// packages/react-render-ssg/src/rollup/app.tsx
import React from "react";

const App = () => (
  <React.Fragment>
    <div>React Render SSG</div>
    <button onClick={() => alert("On Click")}>Button</button>
  </React.Fragment>
);

export default App;
```

紧接着我们先来处理客户端的`React Hydrate`，在先前我们是通过人工维护的编辑的字符串来定义的，而实际上我们同样可以打包工具在`Node`端将组建编译出来，以此来输出`Js`代码文件。在这里我们选择使用`Rollup`来打包`Hydrate`内容，我们以`app.tsx`作为入口，将整个组件作为`iife`打包，然后将输出的内容写入`APP_NAME`，然后将实际的`hydrate`置入`footer`，就可以完成在客户端的`React`接管`DOM`执行了。


```js
// packages/react-render-ssg/rollup.config.js
const APP_NAME = "ReactSSG";
const random = Math.random().toString(16).substring(7);

export default async () => {
  return {
    input: "./src/rollup/app.tsx",
    output: {
      name: APP_NAME,
      file: `./dist/${random}.js`,
      format: "iife",
      globals: {
        "react": "React",
        "react-dom": "ReactDOM",
      },
      footer: `ReactDOM.hydrate(React.createElement(${APP_NAME}), document.getElementById("root"));`,
    },
    plugins: [
      // ...
    ],
    external: ["react", "react-dom"],
  };
};

```

接下来我们来处理服务端的`HTML`文件生成与资源的引用，这里的逻辑与先前的基本原理中服务端生成逻辑差别并不大，只是多了通过终端调用`Rollup`打包的逻辑，同样也是将`HTML`输出，并且将`Js`文件引入到`HTML`中，这里需要特殊关注的是我们的`Rollup`打包时的输出文件路径是在这里由`--file`参数覆盖原本的`rollup.config.js`内置的配置。

```js
// packages/react-render-ssg/src/rollup/index.ts
const exec = promisify(child.exec);

(async () => {
  const HTML = ReactDOMServer.renderToString(React.createElement(App));
  const template = await fs.readFile("./public/index.html", "utf-8");

  const random = Math.random().toString(16).substring(7);
  const path = "./dist/";
  const { stdout } = await exec(`npx rollup -c --file=${path + random}.js`);
  console.log("Client Compile Complete", stdout);

  const jsFileName = `${random}.js`;
  const html = template
    .replace(/<!-- INJECT HTML -->/, HTML)
    .replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsFileName}"></script>`);
  await fs.writeFile(`${path}index.html`, html);
})();
```

## 模版渲染
当前我们已经复用了组件的定义，并且通过`Rollup`打包了需要在客户端运行的`Js`文件，不需要再人工维护输出到客户端的内容。那么场景再复杂一些，假如此时我们的组件有着更加复杂的内容，例如引用了组件库来构建视图，以及引用了一些`CSS`样式预处理器来构建样式，那么我们的服务端输出`HTML`的程序就会变得更加复杂。

继续沿着前边的处理思路，我们在服务端的处理程序仅仅是需要将`App`组件的`HTML`内容渲染出来，那么假设此时我们的组件引用了`@arco-design`组件库，并且通常我们还需要引用其中的`less`文件或者`css`文件。

```js
import "@arco-design/web-react/dist/css/arco.css";
import { Button } from "@arco-design/web-react";
// OR
import "@arco-design/web-react/es/Button/style/index";
import { Button } from "@arco-design/web-react/es/Button";
```

那么需要关注的是，当前我们运行组件的时候是在服务端环境中，那么在`Node`环境中显然我们是不认识`.less`文件以及`.css`文件的，实际上先不说这些样式文件，`import`语法本身在`Node`环境中也是不支持的，只不过我们通常是使用`ts-node`来执行整个运行程序，暂时这点不需要关注，那么对于样式文件我们在这里实际上是不需要的，所以我们就需要配置`Node`环境来处理这些样式文件的引用。

```js
require.extensions[".css"] = () => undefined;
require.extensions[".less"] = () => undefined;
```

但是即使这样问题显然没有结束，熟悉`arco-design`的打包同学可能会清楚，当我们引入的样式文件是`Button/style/index`时，实际上是引入了一个`js`文件而不是`.less`文件，如果需要明确引入`.less`文件的话是需要明确`Button/style/index.less`文件指向的。那么此时如果我们是引入的`.less`文件，那么并不会出现什么问题，但是此时我们引用的是`.js`文件，而这个`.js`文件中内部的引用方式是`import`，因为此时我们是通过`es`而不是`lib`部分明确引用的，即使在`tsconfig`中配置了相关解析方式为`commonjs`也是没有用的。

```js
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs",
      "esModuleInterop": true
    }
  }
}
```

因此我们可以看到，如果仅仅用`ts-node`来解析或者说执行服务端的数据生成是不够的，会导致我们平时实现组件的时候有着诸多限制，例如我们不能随便引用`es`的实现而需要借助包本身的`package.json`声明的内容来引入内容，如果包不能处理`commonjs`的引用那么还会束手无策。那么在这种情况下我们还是需要引入打包工具来打包`commonjs`的代码，然后再通过`Node`来执行输出`HTML`。通过打包工具，我们能够做的事情就很多了，在这里我们将资源文件例如`.less`、`.svg`都通过`null-loader`加载，且相关的配置输出都以`commonjs`为基准，此时我们输出的文件为`node-side-entry.js`。

```js
// packages/react-render-ssg/rspack.server.ts
const config: Configuration = {
  context: __dirname,
  entry: {
    index: "./src/rspack/app.tsx",
  },
  externals: externals,
  externalsType: "commonjs",
  externalsPresets: {
    node: true,
  },
  // ...
  module: {
    rules: [
      { test: /\.svg$/, use: "null-loader" },
      { test: /\.less$/, use: "null-loader" },
    ],
  },
  devtool: false,
  output: {
    iife: false,
    libraryTarget: "commonjs",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, ".temp"),
    filename: "node-side-entry.js",
  },
};
```

当前我们已经得到了可以在`Node`环境中运行的组件，那么紧接着，考虑到输出`SSG`时我们通常都需要预置静态数据，例如我们要渲染文档的话就需要首先在数据库中将相关数据表达查询出来，然后作为静态数据传入到组件中，然后在预输出的`HTML`中将内容直接渲染出来，那么此时我们的`App`组件的定义就需要多一个`getStaticProps`函数声明，并且我们还引用了一些样式文件。

```js
// packages/react-render-ssg/src/rspack/app.tsx
import "./app.less";
import { Button } from "@arco-design/web-react";
import React from "react";

const App: React.FC<{ name: string }> = props => (
  <React.Fragment>
    <div>React Render SSG With {props.name}</div>
    <Button style={{ marginTop: 10 }} type="primary" onClick={() => alert("On Click")}>
      Button
    </Button>
  </React.Fragment>
);

export const getStaticProps = () => {
  return Promise.resolve({
    name: "Static Props",
  });
};

export default App;
```

```css
/* packages/react-render-ssg/src/rspack/app.less */
body {
  padding: 20px;
}
```

同样的，我们也需要为客户端运行的`Js`文件打包，只不过在这里由于我们需要处理预置的静态数据，我们在打包的时候同样就需要预先生成模版代码，当我们在服务端执行打包功能的时候，就需要将从数据库查询或者从文件读取的数据放置于生成的模版文件中，然后以该文件为入口去再打包客户端执行的`React Hydrate`能力。在这里因为希望将模版文件看起来更加清晰，我们使用了`JSON.parse`来处理预置数据，实际上这里只需要将占位预留好，数据在编译的时候经过`stringify`直接写入到模版文件中即可。

```js
// packages/react-render-ssg/src/rspack/entry.tsx
/* eslint-disable @typescript-eslint/no-var-requires */

const Index = require(`<index placeholder>`);
const props = JSON.parse(`<props placeholder>`);
ReactDOM.hydrate(React.createElement(Index.default, { ...props }), document.getElementById("root"));
```

在模版文件生成好之后，我们就需要以这个文件作为入口调度客户端资源文件的打包了，这里由于我们还引用了组件库，输出的内容自然不光是`Js`文件，还需要将`CSS`文件一并输出，并且我们还需要配置一些通过参数名可以控制的文件名生成、`externals`等等。这里需要注意的是，此处我们不需要使用`html-plugin`将`HTML`文件输出，这部分调度我们会在最后统一处理。

```js
// packages/react-render-ssg/rspack.config.ts
const args = process.argv.slice(2);
const map = args.reduce((acc, arg) => {
  const [key, value] = arg.split("=");
  acc[key] = value || "";
  return acc;
}, {} as Record<string, string>);
const outputFileName = map["--output-filename"];

const config: Configuration = {
  context: __dirname,
  entry: {
    index: "./.temp/client-side-entry.tsx",
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  // ...
  builtins: {
    // ...
    pluginImport: [
      {
        libraryName: "@arco-design/web-react",
        customName: "@arco-design/web-react/es/{{ member }}",
        style: true,
      },
      {
        libraryName: "@arco-design/web-react/icon",
        customName: "@arco-design/web-react/icon/react-icon/{{ member }}",
        style: false,
      },
    ],
  },
  // ...
  output: {
    chunkLoading: "jsonp",
    chunkFormat: "array-push",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, "dist"),
    filename: isDev
      ? "[name].bundle.js"
      : outputFileName
      ? `${outputFileName}.js`
      : "[name].[contenthash].js",
    // ...
  },
};
```

那么此时我们就需要调度所有文件的打包过程了，首先我们需要创建需要的输出和临时文件夹，然后启动服务端`commonjs`打包的流程，输出`node-side-entry.js`文件，并且读取其中定义的`App`组件以及预设数据读取方法，紧接着我们需要创建客户端入口的模版文件，并且通过调度预设数据读取方法将数据写入到入口模版文件中，此时我们就可以通过打包的`commonjs`组件执行并且输出`HTML`了，并且客户端运行的`React Hydrate`代码也可以在这里一并打包出来，最后将各类资源文件的引入一并在`HTML`中替换并且写入到输出文件中就可以了。至此当我们打包完成输出文件后，就可以使用静态资源服务器启动`SSG`的页面预览了。

```js
const appPath = path.resolve(__dirname, "./app.tsx");
const entryPath = path.resolve(__dirname, "./entry.tsx");
require.extensions[".less"] = () => undefined;

(async () => {
  const distPath = path.resolve("./dist");
  const tempPath = path.resolve("./.temp");
  await fs.mkdir(distPath, { recursive: true });
  await fs.mkdir(tempPath, { recursive: true });

  const { stdout: serverStdout } = await exec(`npx rspack -c ./rspack.server.ts`);
  console.log("Server Compile", serverStdout);
  const nodeSideAppPath = path.resolve(tempPath, "node-side-entry.js");
  const nodeSideApp = require(nodeSideAppPath);
  const App = nodeSideApp.default;
  const getStaticProps = nodeSideApp.getStaticProps;
  let defaultProps = {};
  if (getStaticProps) {
    defaultProps = await getStaticProps();
  }

  const entry = await fs.readFile(entryPath, "utf-8");
  const tempEntry = entry
    .replace("<props placeholder>", JSON.stringify(defaultProps))
    .replace("<index placeholder>", appPath);
  await fs.writeFile(path.resolve(tempPath, "client-side-entry.tsx"), tempEntry);

  const HTML = ReactDOMServer.renderToString(React.createElement(App, defaultProps));
  const template = await fs.readFile("./public/index.html", "utf-8");
  const random = Math.random().toString(16).substring(7);
  const { stdout: clientStdout } = await exec(`npx rspack build -- --output-filename=${random}`);
  console.log("Client Compile", clientStdout);

  const jsFileName = `${random}.js`;
  const html = template
    .replace(/<!-- INJECT HTML -->/, HTML)
    .replace(/<!-- INJECT STYLE -->/, `<link rel="stylesheet" href="${random}.css">`)
    .replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsFileName}"></script>`);
  await fs.writeFile(path.resolve(distPath, "index.html"), html);
})();
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.sanity.io/ssr-vs-ssg-guide
https://react.docschina.org/reference/react-dom
https://www.theanshuman.dev/articles/what-the-heck-is-ssg-static-site-generation-explained-with-nextjs-5cja
```
