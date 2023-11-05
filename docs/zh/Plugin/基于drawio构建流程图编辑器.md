# 基于drawio构建流程图编辑器
`drawio`是一款非常强大的开源在线的流程图编辑器，支持绘制各种形式的图表，提供了`Web`端与客户端支持，同时也支持多种资源类型的导出。

## 描述
在我们平时写论文、文档时，为了更好地阐述具体的步骤和流程，我们经常会有绘制流程图的需求，这时我们可能会想到`Visio`，可能会想到`ProcessOn`，同时我们也许会因为`Visio`其庞大的体积望而却步，也会因为`ProcessOn`只有免费的几张图而处处掣肘，那么在此时我们就要请出我们的主角`drawio`了，对于单纯的使用人员，使用`drawio`可以获得一个简单免费无限空间的高级绘图工具，而对于进阶的开发人员，可以为自己和团队非常简单快速的搭建一个免费无限空间且功能强大的绘图工具，何乐而不为。

`drawio`项目的历史可以追溯至`2005`年，当时`JGraph`团队开始开发`mxGraph`，这是一个基于`JavaScript`与`SVG`的图表库，用于在`Web`应用程序中创建交互式图表，支持了`Firefox 1.5`和`Internet Explorer 5.5`。`2012`年，`JGraph`团队将已有的程序删除了`Java applet`相关的部分，并且从域名`diagram.ly`改为`draw.io`，这是因为创始人觉得`io`比`ly`更酷，而`drawio`则成为了一个基于`mxGraph`的图表编辑器，可以在浏览器中运行并创建图表，最初是一个内部工具，而后来`mxGraph`团队决定将其作为一个开源项目发布。在`2020`年`JGraph`团队处于安全和版权的考虑，将`draw.io`移至`diagrams.net`域，`diagrams.net`目前仍然是一个活跃的开源项目，拥有大量的用户和贡献者，支持多种图表类型，包括流程图、组织结构图、`UML`图等，同时还支持多种文件格式，包括`XML`、`PNG`、`JPEG`、`PDF`等。

集成`drawio`到我们自己的项目有很多优点，包括但不限于 开箱即用的能力、应用于生产环境的非常成熟的项目、开源项目、支持二次开发、强大的社区等等，但是同样的`drawio`也存在一些不足，从上边简单的概括实际上可以看出来这个项目的历史实际上是非常久远了，本身也没有支持`ESM`，有大量的原型链修改，如果看过相关源码可以发现实际上是非常复杂的，代码的可读性和可维护性都不是很好，同时也没有支持`TypeScript`，这些都是我们需要解决的问题。实际上，现代浏览器中更加流行的方案应该是完全基于`Canvas`绘制的画板，当然这种方式的成本会相当高，如果我们想以低成本的方式集成一个流程图编辑器到我们自己的项目，那么`drawio`是最好的选择之一。

那么问题来了，我们应该如何将`drawio`集成到自己的项目当中，我们在这里提供了两种方案，一种是独立编辑器，这种方式是将`Npm`包打包到自己的项目当中，另一种是嵌入`drawio`，这种方式是通过`iframe`与部署好的`drawio`项目进行通信，这两种方式都可以用来完成流程图的集成，文中描述的相关内容都在  [Github](https://github.com/WindrunnerMax/FlowChartEditor) ｜ [Editor DEMO](https://windrunnermax.github.io/FlowChartEditor/) 中。

## 独立编辑器
首先我们来研究下作为独立编辑器集成到我们自己项目当中的方式，我们先来看一下`mxGraph`项目，文档地址为`https://jgraph.github.io/mxgraph/`，可以看到`mxGraph`有`.NET`、`Java`、`JavaScript`三种语言的支持，在这里我们主要关注的是`JavaScript`的支持，在文档中实际上我们是可以找到相当多的`Example`，在这里我们需要关注的是`Graph Editor`这个示例。当我们打开这个示例`https://jgraph.github.io/mxgraph/javascript/examples/grapheditor/www/index.html`之后，可以发现这实际上是一个非常完整的编辑器项目，而且我们可以看到这个链接的地址是以`.html`结尾并且是部署在`Github`的`Git Pages`上的，这就意味着这个`.html`后缀不是由后端输出的而是一个完整的纯前端项目，那么在理论上我们就可以将其作为纯前端的包集成到我们自己的项目中。

当前我们开发前端都离不开`Npm`包，我们也更希望将这个包作为依赖直接集成到我们的项目当中，但是当我们查阅相关的代码之后，发现这并不是一个简单的工作，例如当我们打开`Graph.js`这个文件，可以惊奇地发现仅这一个文件的代码行数就高达`11941`行，更不用说实际上核心部分是包括如下`10`个核心类的。

```
Actions.js
Dialogs.js
Editor.js
EditorUi.js
Format.js
Graph.js
Menus.js
Shapes.js
Sidebar.js
Toolbar.js
```

而且如果我们仔细观察相关的变量命名可以发现，这十个核心类并不是打包或者混淆之后的代码，也就是说其本身就是以这种形式编写的，在我们进行二次开发的时候也会感觉到比较难以维护，至于`TS`的支持我们本身也不能奢求，毕竟这确实是个年代非常久远的项目，毕竟在最初开发的时候`TypeScript`可能都还没开始。另外可以说句题外话，如果目前有需要使用`mxGraph`作为基础从零开发新项目而不是想集成已有的项目，目前更推荐使用`maxGraph`来完成，`mxGraph`早已停止维护，而`maxGraph`尽可能提供与`mxGraph`相同的功能，是支持`TypeScript`、`Tree Shaking`、`ES Module`的现代化矢量图形库。

回到集成独立编辑器的问题上来，我们的目标是要`Graph Editor`，而这个编辑器又是以`mxGraph`为基础完成的，所以我们当前的第一步就是将`mxGraph`作为依赖安装，`mxGraph`是有`npm`包的，所以直接安装这个依赖就可以了，对于`TS`项目也是有`@typed-mxgraph/typed-mxgraph`包，再指定一下`tsconfig.json`的`typeRoots`配置项即可，实际上在这里我们并不是很关心`TS`定义，因为我们上边描述的主体模块都是`JS`定义的，当然在修一些`BUG`的时候还是很有用的。那么在安装好`mxGraph`主包以及`TS`定义之后，我们先定义好将要引用的模块，当然实际上在这里因为`mxGraph`并没有`ESM`所以没有`Tree Shaking`的支持，在这里主要的目的就是方便后续的模块引用以及初始化模块的配置。

```js
import factory from "mxgraph";

declare global {
  interface Window {
    mxBasePath: string;
    mxLoadResources: boolean;
    mxForceIncludes: boolean;
    mxLoadStylesheets: boolean;
    mxResourceExtension: string;
  }
}

window.mxBasePath = "static";
window.mxLoadResources = false;
window.mxForceIncludes = false;
window.mxLoadStylesheets = false;
window.mxResourceExtension = ".txt";

const mx = factory({
  // https://github.com/jgraph/mxgraph/issues/479
  mxBasePath: "static",
});

// 需要用到的模块再引用 
// 实际上所有的模块依然都会被打包
export const {
  mxGraph,
  // ...
} = mx;
```

在编写这个引用模块时，由于`mxGraph`并没有`ESM`的支持，我考虑到使用`maxGraph`来作为平替，尝试一番最后还是失败了，应该是两个包之间依然存在一定的`GAP`，最终还是选择使用`mxGraph`，另外如果有必要的话可以配置`externals`来避免需要完整打包`mxGraph`，这方面配置在这里就不再赘述了。那么接下来的主要工作就是将`Graph Editor`部分引入进来，这一部分是最耗时也是最麻烦的一部分，在集成的过程中我们主要做了如下几件事:

* 将主模块拆离并集成到我们当前的项目中。这部分工作实际上比较简单，就是将需要用到的代码全部下载到我们自己的项目当中，当然一开始也是没什么头绪的，因为在不了解的情况下还是比较难以组织起来这部分代码的，另外项目用到了大量的`window`对象上的值，如果不借助一些工具很难去查找到这么多未定义的变量，我们只是把代码拷贝过来也是无法直接运行起来的，需要解决所有这些诸如`undef`的问题，以及外部资源引用的问题才行。
* 处理所有资源文件，包括图片、样式模块，去除所有依赖路径的资源引用。这部分工作是要处理外部的资源引用，`Graph Editor`实际上是有很多外部的资源引用的，包括多语言、图片等，而实际上我们在上边配置的诸如`mxBasePath`、`mxResourceExtension`等都是为了要处理外部资源，但是由于我们目前是更希望作为`npm`包来引用的，处理资源路径问题又相对比较麻烦，所以在这里我们采取的方案是将所有的图片资源都处理成了`Base64`直接集成进去，当然在这个过程中也修改了相关代码使其不会发起请求去加载外部资源，另外由于一些修改过程中的客观原因，在项目中图片资源分为了两种，一种是转换成了`Base64`的`TS`文件，一种是借助`loader`加载的资源，当然本质上是都是`Base64`的资源，在这里实现的目标就是不再发起外部资源的请求。
* 借助`ESLint`精简部分代码，去除部分`IE`浏览器的支持，`Prettier`格式化各个模块的代码。这部分工作是个比较复杂的，首先是借助`ESLint`精简代码，在这里就是对核心模块逐步放开`ESLint`规则，依据这些规则修改相关代码，例如借助`no-undef`就可以找到所有未定义的模块，然后再处理这些模块的引用，通过`no-unused-vars`规则找到未使用的变量，由此来精简代码。我们现在都更加聚焦于现代浏览器，对于`IE`浏览器不希望再做额外的支持，于是在这里我们也去除了部分兼容`IE`的代码。借助于`Prettier`以及`prettier/prettier`规则我们可以将代码格式化，在格式化代码之后可以看到相关模块的实现会比较舒服，而且也解决了一些隐式的问题，并且以`Graph.js`核心类为例，代码量从`11941`行精简到了`10637`行。
* 处理多语言，目前支持`EN`和`ZH-CN`两种语言的加载。这部分工作主要是多语言的支持，目前我们希望的是不再加载外部资源，那么多语言当然也不例外，在这里我们已经将相关的语言定义好，要加载哪种语言之需要在启动编辑器的时候，将语言模块的配置传入即可，此外由于所有的语言模块并不是都必须要加载的，在这里是通过按需加载的方式实现的，以减少包的体积，实际上我们的主包也更推荐以懒加载的方式载入到自己的项目当中。

在完成了上述的集成之后，我们就可以成功地将项目完整的启动了，但是在实际使用的过程中发现还是有一些`BUG`，比如我们打开`Graph Editor`最新的在线链接，可以发现`Sketch`样式是无效的，所以我们还需要对整个包做一些`BUG`的修复，在这里主要列举了三个`BUG`的修改，仅作参考。

外部加载模块问题，众所周知(或者没那么周知)`mxGraph`的很多模块都是挂载到`window`上的，这里的模块有多种类型，比如图形模块`mxGraphModel`、`mxGeometry`、`mxCell`等等，工具模块`mxUtils`、`mxEvent`、`mxCodec`等等，但是在这里我们是作为`npm`包引进的，我们是不希望污染全局变量的，而且我们通过`xml`来加载图形的时候是需要找到这些图形模块，否则是无法呈现出图形的，经过分析源码我们可以知道动态加载在`mxCodec`的`decode`方法上，于是我们需要在这里处理好模块这个加载函数，当然可能通过`external`的方式加载`mxGraph`模块包的方式直接挂在`window`上也是个可行的办法，但是在这里我们是重写了相关模块来实现的。

```js
// https://github.com/maxGraph/maxGraph/issues/102
// https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/io/mxCodec.js#L423
mxCodec.prototype.decode = function (node, into) {
  this.updateElements();
  let obj: unknown = null;
  if (node && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
    let ctor: unknown = null;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // 因为需要处理的`XML Node`可能不在`Window`上
      ctor = mx[node.nodeName] || window[node.nodeName];
    } catch (error) {
      console.log(`NODE ${node.nodeName} IS NOT FOUND`, error);
    }
    const dec = mx.mxCodecRegistry.getCodec(ctor);
    if (dec) {
      obj = dec.decode(this, node, into);
    } else {
      obj = node.cloneNode(true);
      obj && (obj as Element).removeAttribute("as");
    }
  }
  return obj;
};
```

`Sketch`无效问题，如果我们打开`Graph Editor`最新的在线链接，可以发现`Sketch`样式是无效的，因为现在`mxGraph`是不再继续维护了，所以反馈`BUG`是无效的，实际上这个问题处理也比较简单，我们可以通过`git`回溯到功能正常的版本就可以了。

```
aa11697fbd5ba9f4bb
https://github.com/jgraph/mxgraph-js 
```

`Scroll`与菜单的挂载子容器问题，这个问题比较尴尬，因为`mxGraph`一直是以一整个应用来设计的，但是当我们需要将其嵌入到其他应用中的时候，由于我们的滚动容器可能就是`body`，此时当我们已经将页面向下滚动了一部分，之后再打开流程图编辑器的话，就会发现我们没有办法正常拖拽画布或者选中图形了，并且菜单的位置计算也出现了错误，所以在这里需要保证相关的位置计算正确。

```js
mxUtils.getScrollOrigin = function (node, includeAncestors, includeDocument) {
  includeAncestors = includeAncestors != null ? includeAncestors : false;
  includeDocument = includeDocument != null ? includeDocument : false;
  const doc = node != null ? node.ownerDocument : document;
  const b = doc.body;
  const d = doc.documentElement;
  const result = new mxPoint();
  let fixed = false;
  while (node != null && node != b && node != d) {
    if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop)) {
      result.x += node.scrollLeft;
      result.y += node.scrollTop;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const style = mxUtils.getCurrentStyle(node);
    if (style != null) {
      fixed = fixed || style.position == "fixed";
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    node = includeAncestors ? node.parentNode : null;
  }
  if (!fixed && includeDocument) {
    const origin = mxUtils.getDocumentScrollOrigin(doc);
    result.x += origin.x;
    result.y += origin.y;
  }
  return result;
};

// 处理菜单的挂载容器
mxPopupMenu.prototype.showMenu = function () {
  container.appendChild(this.div);
  mxUtils.fit(this.div);
};
// 处理菜单的挂载子容器
mxPopupMenu.prototype.showSubmenu = function (parent, row) {
  if (row.div != null) {
    row.div.style.left = parent.div.offsetLeft + row.offsetLeft + row.offsetWidth - 1 + "px";
    row.div.style.top = parent.div.offsetTop + row.offsetTop + "px";
    container.appendChild(row.div);
    const left = parseInt(row.div.offsetLeft);
    const width = parseInt(row.div.offsetWidth);
    const offset = mxUtils.getDocumentScrollOrigin(document);
    const b = document.body;
    const d = document.documentElement;
    const right = offset.x + (b.clientWidth || d.clientWidth);
    if (left + width > right) {
      row.div.style.left =
        Math.max(0, parent.div.offsetLeft - width + (mxClient.IS_IE ? 6 : -6)) + "px";
    }
    mxUtils.fit(row.div);
  }
};
```

最后，实际上由于没有`TreeShaking`，并且我们可能需要动态地加载图形，所以我们整个包体积还是比较大的，所以为了不影响应用的主体能力，我们还是建议使用懒加载的方式去加载编辑器，具体来说就是可以通过`import type`来引入类型，然后通过`import()`来加载模块。

```js
import type * as DiagramEditor from "embed-drawio/dist/packages/core/diagram-editor";
import type * as DiagramViewer from "embed-drawio/dist/packages/core/diagram-viewer";

let editor: typeof DiagramEditor | null = null;
export const diagramEditorLoader = (): Promise<typeof DiagramEditor> => {
  if (editor) return Promise.resolve(editor);
  return Promise.all([
    import(
      /* webpackChunkName: "embed-drawio-editor" */ "embed-drawio/dist/packages/core/diagram-editor"
    ),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import(/* webpackChunkName: "embed-drawio-css" */ "embed-drawio/dist/index.css"),
  ]).then(res => (editor = res[0]));
};

let viewer: typeof DiagramViewer | null = null;
export const diagramViewerLoader = (): Promise<typeof DiagramViewer> => {
  if (viewer) return Promise.resolve(viewer);
  return Promise.all([
    import(
      /* webpackChunkName: "embed-drawio-viewer" */ "embed-drawio/dist/packages/core/diagram-viewer"
    ),
  ]).then(res => (viewer = res[0]));
};
```

## 嵌入drawio
在上边我们完成了基于`mxGraph Example`的流程图编辑器`NPM`包，但是毕竟`mxGraph`已经不再维护，而`JGraph`在`mxGraph Example`的基础上又扩展开发了`drawio`，这是个长期维护的项目，即使`drawio`不接受贡献，但是依旧不妨碍他的活跃，可以在这里体验`drawio`的部署版本`https://app.diagrams.net/`。

在这里我们更要关注的是如何将`drawio`嵌入到我们的应用当中，`drawio`提供了`embed`的方式来帮助我们集成到自己的应用中，通过`iframe`的方式利用`postMessage`进行通信，这样也不会受到跨域的限制，由此来实现编辑、导入导出的一系列功能。

```
https://www.drawio.com/blog/embedding-walkthrough
https://desk.draw.io/support/solutions/articles/16000042544
```

我们在这里通过简单封装通信的方式来实现`drawio`的嵌入，具体来说就是通过`iframe`的方式来加载`drawio`，当然因为网络问题，真正投入到生产环境的话还是需要私有化部署一套才可以，私有化部署了之后也可以进行二开，当然如果在网络可以支持的情况下直接使用`drawio`的部署版本也是有可行性的，最终的数据存储都会存储到我们自己的应用当中。

```js
import { EditorEvents } from "./event";
import { Config, DEFAULT_URL, ExportMsg, MESSAGE_EVENT, SaveMsg } from "./interface";

export class EditorBus extends EditorEvents {
  private lock: boolean;
  protected url: string;
  private config: Config;
  protected iframe: HTMLIFrameElement | null;

  constructor(config: Config = { format: "xml" }) {
    super();
    this.lock = false;
    this.config = config;
    this.url = config.url || DEFAULT_URL;
    this.iframe = document.createElement("iframe");
  }

  public startEdit = () => {
    if (this.lock || !this.iframe) return void 0;
    this.lock = true;
    const iframe = this.iframe;
    const url =
      `${this.url}?` +
      [
        "embed=1",
        "spin=1",
        "proto=json",
        "configure=1",
        "noSaveBtn=1",
        "stealth=1",
        "libraries=0",
      ].join("&");
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "style",
      "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#fff;z-index:999999;"
    );
    iframe.className = "drawio-iframe-container";
    document.body.style.overflow = "hidden";
    document.body.appendChild(iframe);
    window.addEventListener(MESSAGE_EVENT, this.handleMessageEvent);
  };

  public exitEdit = () => {
    this.lock = false;
    this.iframe && document.body.removeChild(this.iframe);
    this.iframe = null;
    document.body.style.overflow = "";
    window.removeEventListener(MESSAGE_EVENT, this.handleMessageEvent);
  };

  onConfig(): void {
    this.config.onConfig
      ? this.config.onConfig()
      : this.postMessage({
          action: "configure",
          config: {
            compressXml: this.config.compress ?? false,
            css: ".geTabContainer{display:none !important;}",
          },
        });
  }
  onInit(): void {
    this.config.onInit
      ? this.config.onInit()
      : this.postMessage({
          action: "load",
          autosave: 1,
          saveAndExit: "1",
          modified: "unsavedChanges",
          xml: this.config.data,
          title: this.config.title || "流程图",
        });
  }
  onLoad(): void {
    this.config.onLoad && this.config.onLoad();
  }
  onAutoSave(msg: SaveMsg): void {
    this.config.onAutoSave && this.config.onAutoSave(msg.xml);
  }
  onSave(msg: SaveMsg): void {
    this.config.onSave && this.config.onSave(msg.xml);
    if (this.config.onExport) {
      this.postMessage({
        action: "export",
        format: this.config.format,
        xml: msg.xml,
      });
    } else {
      if (msg.exit) this.exitEdit();
    }
  }
  onExit(msg: SaveMsg): void {
    this.config.onExit && this.config.onExit(msg.xml);
    this.exitEdit();
  }
  onExport(msg: ExportMsg): void {
    if (!this.config.onExport) return void 0;
    this.config.onExport(msg.data, this.config.format);
    this.exitEdit();
  }
}
```

而在我们使用的时候，直接实例化对象并且进入编辑模式就可以了，另外`drawio`支持多种数据的导出，但是在这里还是推荐`xmlsvg`，简单来说就是这种数据结构是在`svg`标签的基础上携带了`xml`数据，这样的话作为部分冗余字段是可以直接展示为`svg`也可以直接将其导入到`drawio`再次编辑的，如果仅导出为`svg`则是不能再导入编辑的，如果只导出了`xml`虽然可以再次编辑，但是想作为`svg`展示的话就需要`viewer.min.js`来渲染，这部分还是看需求来决定导出类型比较合适。

```js
const bus = new diagram.EditorBus({
  data: svgExample,
  format: "xmlsvg",
  onExport: (svg: string) => {
    const svgStr = base64ToSvgString(svg);
    if (svgStr) {
      setSVGExample(svgStr);
    }
  },
});
bus.startEdit();
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/jgraph/drawio
https://github.com/jgraph/mxgraph
https://github.com/maxGraph/maxGraph
https://github.com/jgraph/mxgraph-js
https://zh.wikipedia.org/wiki/Draw.io
https://juejin.cn/post/7017686432009420808
https://github.com/jgraph/drawio-integration
https://jgraph.github.io/mxgraph/javascript/index.html
```
