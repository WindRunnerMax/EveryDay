# 流式Markdown增量富文本解析算法
在先前我们我们聊过了`SSE`流式输出的实现，以及基于向量检索的`RAG`服务，这些实现都可以算作是`AI Infra`的范畴。这里我们再来聊一下在`SSE`流式输出的基础上，将`Markdown`解析和富文本编辑器的渲染结合起来，实现编辑器的增量解析算法，同样属于文档场景下的`Infra`建设。

## 概述
在`SSE`流式输出的场景下，`LLMs`模型会逐步输出`Markdown`文本，在基本场景下我们只需要实现`DOM`的渲染即可。然而，在富文本编辑器的场景下，这件事就变得复杂了起来，因为编辑器通常都是自行维护一套数据结构，并不可以直接接受`DOM`结构，再叠加性能问题就需要考虑到下面几点:

- 流式: 流式意味着我们需要处理不完整的`Markdown`文本，在不完整的情况下语法会出现问题，因此需要支持已渲染内容的重建。
- 增量: 增量意味着我们不需要每次都进行全量渲染，已经稳定的内容实际上不需要再次解析，而是只需要在已有内容的基础上进行增量更新。
- 富文本解析: 富文本解析意味着我们需要完整地对应到`Md`的解析情况，无论是流式处理还是增量解析都需要在编辑器结构基础上对等实现。

当然，即使是在基本场景下的`DOM`渲染，也会涉及到很多边界情况的处理，例如若是每次都是`SSE`输出`Md`时都进行全量渲染的性能问题、以及类似图片节点重渲染可能存在的重新加载问题等。因此，这里的增量解析算法流程，即使是对于基本场景也是很值得参考的。

并且，还有更复杂的场景，例如在`SSE`流式输出的过程中，用户总是会存在临时的不完整的`Md`文本，在完整输出`Md`文本之前，就会存在不符合规范的`Md`解析，或者是错误地匹配到另一种`Md`语法的情况。这些情况都需要额外的算法处理，实现一些额外的语法修复方案。

```
<img src="http://
<img src="http://example.com/
<img src="http://example.com/image.png" alt=
```

此外，诸如渲染的语法扩展、自定义组件等等，也会涉及到额外的语法处理，关于自定义解析渲染的实现可以参考`react-markdown`。这其实是是一个很庞大的管道实现，同样也会是很好的自定义处理`AST`并渲染的案例，`remark`也是非常丰富的生态系统，给予了关于`Md`解析的各种实现。

```
markdown -> remark + mdast -> remark plugins + mdast -> remark-rehype + hast -> rehype plugins + hast-> components + ->react elements
```

不过在这里我们并不展开讨论这些自定义语法解析的内容，而是主要聚焦在基本的`Md`语法解析和增量渲染上，但是在解析的过程中我们还是会涉及到针对语法错误匹配的相关问题处理。文中的相关实现可以参考 [BlockKit](https://windrunnermax.github.io/BlockKit/streaming.html) 以及 [StreamDelta](https://github.com/WindRunnerMax/webpack-simple-environment/tree/master/packages/stream-delta) 中。

## Markdown增量解析
首先我们来实现`Markdown`的流式增量解析，能够实现增量解析的重要的基础是，`Md`输出的后续内容格式通常不会影响先前的格式，即我们可以归档已经稳定的内容。因此我们可以设计一套数据处理方案，在解析的过程中需要遵循的整体大原则:

- 非全量解析`Markdown`, 基于流渐进式分割结构处理数据。
- 基于`Lexer`解析的结构, 双指针绑定`Delta`的增量变更。

### 词法解析

首先我们需要一个词法解析器将`Md`解析成`Token`流，或者是需要一个语法解析器将`Md`解析成`AST`。由于我们的数据结构是扁平化的，标准词法解析的扁平`Token`流对我们的二次解析并非难事，而若是完全嵌套结构的数据结构，语法解析生成`AST`的解析方案对则可能更加方便。

当前的主流解析器有比较多的相关实现，`marked`提供了`lexer`方法以及`marked.Lexer`作为解析器，`remark`作为`unified`庞大生态系统的一部分，也提供了`mdast-util-from-markdown`独立的解析器，`markdown-it`同样也提供了`parse`方法以及`parseInline`作为解析器。

在这里我们选择了`marked`作为解析器，主要是由于`marked`比较简单且易于理解。`remark`系列的生态系统过于庞大，但是作为标准的`AST`解析是非常不错的选择。`markdown-it`的`Token`解析器稍微复杂一些，其不直接嵌套而是使用`heading_open`等类型标签进行数据处理。

从名字上也可以看出`marked`提供的`lexer`是偏向于词法解析的，但是其也并非完全纯粹的词法解析器。因为输出的结构也是存在嵌套存在嵌套的结构，当然其也并非比较标准的`AST`结构，这里更像是偏向`Token`流的混合结构实现。一段`Md`文本的解析结构如下所示:

```js
// marked.lexer("> use marked")
{
    "type": "blockquote",
    "raw": "> use marked",
    "tokens": [
        {
            "type": "paragraph",
            "raw": "use marked",
            "text": "use marked",
            "tokens": [{ "type": "text", "raw": "use marked", "text": "use marked", "escaped": false }]
        }
    ],
    "text": "use marked"
}
```

### 索引指针



### 语法修复


parse5 / htmlparse2

```md
- 无序列表项1
   - 无序列表项1.1
   - 
```

> The setext heading underline can be preceded by up to three spaces of indentation, and may have trailing spaces or tabs - Example 86
> A list item can contain a heading - Example 300

## 编辑器流式渲染

id 数据重建

额外编辑的 OT 或者是重新实现编辑器的纯渲染结构以及样式，最后做成编辑器模式

`OT`的实现中最重要的就是`transform`方法，我们可以先看看`transform`所代表的意义。如果是在协同中的话，`b'=a.t(b)`的意思是，假设`a`和`b`都是从相同的`draft`分支出来的，那么`b'`就是假设`a`已经应用了，此时`b`需要在`a`的基础上变换出`b'`才能直接应用。

而我们也可以换种理解方式，即`transform`解决了`a`操作对`b`操作造成的影响。那么类似于`History`模块中`undoable`的实现，`transform`同样可以来解决单机客户端`Opa`以及`Opb`操作带来的影响，那么自然也可以解决流式输出以及用户输入本身相互的数据影响。

## 总结

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://astexplorer.net/>
- <https://spec.commonmark.org/0.30/>
- <https://marked.js.org/using_pro#lexer>
- <https://github.com/remarkjs/react-markdown>
- <https://marked.js.org/demo/?outputType=lexer>
- <https://github.com/syntax-tree/mdast-util-from-markdown>
