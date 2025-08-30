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

不过在这里我们并不展开讨论这些自定义语法解析的内容，而是主要聚焦在基本的`Md`语法解析和增量渲染上，但是在解析的过程中我们还是会涉及到针对语法错误匹配的相关问题处理。文中的相关实现可以参考 [BlockKit](https://windrunnermax.github.io/BlockKit/stream-md.html) 以及 [StreamDelta](https://github.com/WindRunnerMax/webpack-simple-environment/tree/master/packages/stream-delta) 中。

## Markdown流式解析

parse5 / htmlparse2

> The setext heading underline can be preceded by up to three spaces of indentation, and may have trailing spaces or tabs - Example 86
> A list item can contain a heading - Example 300

## 编辑器流式渲染

id 数据重建

额外编辑的 OT

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://astexplorer.net/>
- <https://spec.commonmark.org/0.30/>
- <https://github.com/remarkjs/react-markdown>
- <https://marked.js.org/demo/?outputType=lexer>
- <https://github.com/syntax-tree/mdast-util-from-markdown>
