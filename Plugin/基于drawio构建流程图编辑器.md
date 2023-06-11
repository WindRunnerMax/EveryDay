# 基于drawio构建流程图编辑器
`drawio`是一款非常强大的开源在线的流程图编辑器，支持绘制各种形式的图表，提供了`Web`端与客户端支持，同时也支持多种资源类型的导出。

## 描述
在我们平时写论文、文档时，为了更好地阐述具体的步骤和流程，我们经常会有绘制流程图的需求，这时我们可能会想到`Visio`，可能会想到`ProcessOn`，同时我们也许会因为`Visio`其庞大的体积望而却步，也会因为`ProcessOn`只有免费的几张图而处处掣肘，那么在此时我们就要请出我们的主角`drawio`了，对于单纯的使用人员，使用`drawio`可以获得一个简单免费无限空间的高级绘图工具，而对于进阶的开发人员，可以为自己和团队非常简单快速的搭建一个免费无限空间且功能强大的绘图工具，何乐而不为。

`drawio`项目的历史可以追溯至`2005`年，当时`JGraph`团队开始开发`mxGraph`，这是一个基于`JavaScript`与`SVG`的图表库，用于在`Web`应用程序中创建交互式图表，支持了`Firefox 1.5`和`Internet Explorer 5.5`。`2012`年，`JGraph`团队将已有的程序删除了`Java applet`相关的部分，并且从域名`diagram.ly`改为`draw.io`，这是因为创始人觉得`io`比`ly`更酷，而`drawio`则成为了一个基于`mxGraph`的图表编辑器，可以在浏览器中运行并创建图表，最初是一个内部工具，而后来`mxGraph`团队决定将其作为一个开源项目发布。在`2020`年`JGraph`团队处于安全和版权的考虑，将`draw.io`移至`diagrams.net`域，`diagrams.net`目前仍然是一个活跃的开源项目，拥有大量的用户和贡献者，支持多种图表类型，包括流程图、组织结构图、`UML`图等，同时还支持多种文件格式，包括`XML`、`PNG`、`JPEG`、`PDF`等。

集成`drawio`到我们自己的项目有很多优点，包括但不限于 开箱即用的能力、应用于生产环境的非常成熟的项目、开源项目、支持二次开发、强大的社区等等，但是同样的`drawio`也存在一些不足，从上边简单的概括实际上可以看出来这个项目的历史实际上是非常久远了，本身也没有支持`ESM`，有大量的原型链修改，如果看过相关源码可以发现实际上是非常复杂的，代码的可读性和可维护性都不是很好，同时也没有支持`TypeScript`，这些都是我们需要解决的问题。实际上，现代浏览器中更加流行的方案应该是完全基于`Canvas`绘制的画板，当然这种方式的成本会相当高，如果我们想以低成本的方式集成一个流程图编辑器到我们自己的项目，那么`drawio`是最好的选择之一。

那么问题来了，我们应该如何将`drawio`集成到自己的项目当中，我们在这里提供了两种方案，一种是独立编辑器，这种方式是将`Npm`包打包到自己的项目当中，另一种是嵌入`drawio`，这种方式是通过`iframe`与部署好的`drawio`项目进行通信，这两种方式都可以用来完成流程图的集成，文中描述的相关内容都在`https://github.com/WindrunnerMax/FlowChartEditor`中。

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

修`BUG`: 外部加载模块、`Sketch`无效、`Scroll`与菜单的挂载子容器问题

包体积，懒加载模块

## 嵌入drawio

`https://www.drawio.com/blog/embedding-walkthrough`
`https://desk.draw.io/support/solutions/articles/16000042544`

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
