# 基于drawio构建流程图编辑器
`drawio`是一款非常强大的开源在线的流程图编辑器，支持绘制各种形式的图表，提供了`Web`端与客户端支持，同时也支持多种资源类型的导出。

## 描述
在我们平时写论文、文档时，为了更好地阐述具体的步骤和流程，我们经常会有绘制流程图的需求，这时我们可能会想到`Visio`，可能会想到`ProcessOn`，同时我们也许会因为`Visio`其庞大的体积望而却步，也会因为`ProcessOn`只有免费的几张图而处处掣肘，那么在此时我们就要请出我们的主角`drawio`了，对于单纯的使用人员，使用`drawio`可以获得一个简单免费无限空间的高级绘图工具，而对于进阶的开发人员，可以为自己和团队非常简单快速的搭建一个免费无限空间且功能强大的绘图工具，何乐而不为。

`drawio`项目的历史可以追溯至`2005`年，当时`JGraph`团队开始开发`mxGraph`，这是一个基于`JavaScript`与`SVG`的图表库，用于在`Web`应用程序中创建交互式图表，支持了`Firefox 1.5`和`Internet Explorer 5.5`。`2012`年，`JGraph`团队将已有的程序删除了`Java applet`相关的部分，并且从域名`diagram.ly`改为`draw.io`，这是因为创始人觉得`io`比`ly`更酷，而`drawio`则成为了一个基于`mxGraph`的图表编辑器，可以在浏览器中运行并创建图表，最初是一个内部工具，而后来`mxGraph`团队决定将其作为一个开源项目发布。在`2020`年`JGraph`团队处于安全和版权的考虑，将`draw.io`移至`diagrams.net`域，`diagrams.net`目前仍然是一个活跃的开源项目，拥有大量的用户和贡献者，支持多种图表类型，包括流程图、组织结构图、`UML`图等，同时还支持多种文件格式，包括`XML`、`PNG`、`JPEG`、`PDF`等。

集成`drawio`到我们自己的项目有很多优点，包括但不限于 开箱即用的能力、应用于生产环境的非常成熟的项目、开源项目、支持二次开发、强大的社区等等，但是同样的`drawio`也存在一些不足，从上边简单的概括实际上可以看出来这个项目的历史实际上是非常久远了，本身也没有支持`ESM`，有大量的原型链修改，如果看过相关源码可以发现实际上是非常复杂的，代码的可读性和可维护性都不是很好，同时也没有支持`TypeScript`，这些都是我们需要解决的问题。实际上，现代浏览器中更加流行的方案应该是完全基于`Canvas`绘制的画板，当然这种方式的成本会相当高，如果我们想以低成本的方式集成一个流程图编辑器到我们自己的项目，那么`drawio`是最好的选择之一。

那么问题来了，我们应该如何将`drawio`集成到自己的项目当中，我们在这里提供了两种方案，一种是独立编辑器，这种方式是将`Npm`包打包到自己的项目当中，另一种是嵌入`drawio`，这种方式是通过`iframe`与部署好的`drawio`项目进行通信，这两种方式都可以用来完成流程图的集成，文中描述的相关内容都在`https://github.com/WindrunnerMax/FlowChartEditor`中。

## 独立编辑器

## 嵌入drawio

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/jgraph/drawio
https://github.com/jgraph/mxgraph
https://github.com/jgraph/mxgraph-js
https://zh.wikipedia.org/wiki/Draw.io
https://juejin.cn/post/7017686432009420808
```
