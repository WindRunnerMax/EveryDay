# WrapNode数据结构与操作变换

在之前我们聊到了一些关于`slate`富文本引擎的基本概念，并且对基于`slate`实现文档编辑器的一些插件化能力设计、类型拓展、具体方案等作了探讨，那么接下来我们更专注于文档编辑器的细节，由浅入深聊聊文档编辑器的相关能力设计。

* 在线编辑: <https://windrunnermax.github.io/DocEditor>
* 开源地址: <https://github.com/WindrunnerMax/DocEditor>

关于`slate`文档编辑器项目的相关文章:

* [基于Slate构建文档编辑器](https://juejin.cn/post/7265516410490830883)
* [Slate文档编辑器-WrapNode数据结构与操作变换](https://juejin.cn/spost/7385752495535603727)
* [Slate文档编辑器-TS类型扩展与节点类型检查](https://juejin.cn/spost/7399453742346551332)

## Normalize
在`slate`中数据结构的规整是比较麻烦的事情，特别是对于需要嵌套的结构来说，例如在本项目中存在的`Quote`和`List`，那么在规整数据结构的时候就有着多种方案，同样以这两组数据结构为例，每个`Wrap`必须有相应的`Pair`的结构嵌套，那么对于数据结构就有如下的方案。实际上我觉得对于这类问题是很难解决的，嵌套的数据结构对于增删改查都没有那么高效，因此在缺乏最佳实践相关的输入情况下，也只能不断摸索。

首先是复用当前的块结构，也就是说`Quote Key`和`List Key`都是平级的，同样的其`Pair Key`也都复用起来，这样的好处是不会出现太多的层级嵌套关系，对于内容的查找和相关处理会简单很多。但是同样也会出现问题，如果在`Quote`和`List`不配齐的情况下，也就是说其并不是完全等同关系的情况下，就会需要存在`Pair`不对应`Wrap`的情况，此时就很难保证`Normalize`，因为我们是需要可预测的结构。

```js
{
    "quote-wrap": true,
    "list-wrap": true,
    children: [
        { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
        { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
        { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
    ]
}
```

那么如果我们不对内容做很复杂的控制，在`slate`中使用默认行为进行处理，那么其数据结构表达会出现如下的情况，在这种情况下数据结构是可预测的，那么`Normalize`就不成问题，而且由于这是其默认行为，不会有太多的操作数据处理需要关注。但是问题也比较明显，这种情况下数据虽然是可预测的，但是处理起来特别麻烦，当我们维护对应关系时，必须要递归处理所有子节点，在特别多层次的嵌套情况下，这个计算量就颇显复杂了，如果在支持表格等结构的情况下，就变得更加难以控制。

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            children: [
                { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
                { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
    ]
}
```

那么这个数据结构实际上也并不是很完善，其最大的问题是`wrap - pair`的间隔太大，这样的处理方式就会出现比较多的边界问题，举个比较极端的例子，假设我们最外层存在引用块，在引用块中又嵌套了表格，表格中又嵌套了高亮块，高亮块中又嵌套了引用块，这种情况下我们的`wrap`需要传递`N`多层才能匹配到`pair`，这种情况下影响最大的就是`Normalize`，我们需要有非常深层次的`DFS`处理才行，处理起来不仅需要耗费性能深度遍历，还容易由于处理不好造成很多问题。

那么在这种情况下，我们可以尽可能简化层级的嵌套，也就是说我们需要避免`wrap - pair`的间隔问题，那么很明显我们直接严格规定`wrap`的所有`children`必须是`pair`，在这种情况下我们做`Normalize`就简单了很多，只需要在`wrap`的情况下遍历其子节点以及在`pair`的情况下检查其父节点即可。当然这种方案也不是没有缺点，这让我们对于数据的操作精确性有着更严格的要求，因为在这里我们不会走默认行为，而是全部需要自己控制，特别是所有的嵌套关系以及边界都需要严格定义，这对编辑器行为的设计也有更高的要求。

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
                { "list-pair": 2, children: [/* ... */] },
                { "list-pair": 3, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
    ]
}
```

那么为什么说数据结构会变得复杂了起来，就以上述的结构为例，假如我们将`list-pair: 2`这个节点解除了`list-wrap`节点的嵌套结构，那么我们就需要将节点变为如下的类型，我们可以发现这里的结构差别会比较大，除了除了将`list-wrap`分割成了两份之外，我们还需要处理其他`list-pair`的有序列表索引值更新，这里要做的操作就比较多了，因此我们如果想实现比较通用的`Schema`就需要更多的设计和规范。

而在这里最容易忽略的一点是，我们需要为原本的`list-pair: 2`这个节点加入`"quote-pair": true`，因为此时该行变成了`quote-wrap`的子元素，总结起来也就是我们需要将原本在`list-wrap`的属性再复制一份给到`list-pair: 2`中来保持正确的嵌套结构。那么为什么不是借助`normalize`来被动添加而是要主动复制呢，原因很简单，如果是`quote-pair`的话还好，如果是被动处理则直接设置为`true`就可以了，但是如果是`list-pair`来实现的话，我们无法得知这个值的数据结构应该是什么样子的，这个实现则只能归于插件的`normalize`来实现了。

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
    ]
}
```

## Transformers
前边也提到了，在嵌套的数据结构中是存在默认行为的，而在之前由于一直遵守着默认行为所以并没有发现太多的数据处理方面的问题，然而当将数据结构改变之后，就发现了很多时候数据结构并不那么容易控制。先前在处理`SetBlock`的时候通常我都会通过`match`参数匹配`Block`类型的节点，因为在默认行为的情况下这个处理通常不会出什么问题。

然而在变更数据结构的过程中，处理`Normalize`的时候就出现了问题，在块元素的匹配上其表现与预期的并不一致，这样就导致其处理的数据一直无法正常处理，`Normalize`也就无法完成直至抛出异常。在这里主要是其迭代顺序与我预期的不一致造成的问题，例如在`DEMO`页上执行`[...Editor.nodes(editor, {at: [9, 1, 0] })]`，其返回的结果是由顶`Editor`至底`Node`，当然这里还会包括范围内的所有`Leaf`节点相当于是`Range`。

```
[]          Editor
[9]         Wrap
[9, 1]      List
[9, 1, 9]   Line
[9, 1, 0]   Text
```

实际上在这种情况下如果按照原本的`Path.equals(path, at)`是不会出现问题的，在这里就是之前太依赖其默认行为了，这也就导致了对于数据的精确性把控太差，我们对数据的处理应该是需要有可预期性的，而不是依赖默认行为。此外，`slate`的文档还是太过于简练了，很多细节都没有提及，在这种情况下还是需要去阅读源码才会对数据处理有更好的理解，例如在这里看源码让我了解到了每次做操作都会取`Range`所有符合条件的元素进行`match`，在一次调用中可能会发生多次`Op`调度。

此外，因为这次的处理主要是对于嵌套元素的支持，所以在这里还发现了`unwrapNodes`或者说相关数据处理的特性，当我调用`unwrapNodes`时仅`at`传入的值不一样，分别是`A-[3, 1, 0]`和`B-[3, 1, 0, 0]`，这里有一个关键点是在匹配的时候我们都是严格等于`[3, 1, 0]`，但是调用结果却是不一样的，在`A`中`[3, 1, 0]`所有元素都被`unwrap`了，而`B`中仅`[3, 1, 0, 0]`被`unwrap`了，在这里我们能够保证的是`match`结果是完全一致的，那么问题就出在了`at`上。此时如果不理解`slate`数据操作的模型的话，就必须要去看源码了，在读源码的时候我们可以发现其会存在`Range.intersection`帮我们缩小了范围，所以在这里`at`的值就会影响到最终的结果。

```js
unwrapNodes(editor, { match: (_, p) => Path.equals(p, [3, 1, 0]), at: [3, 1, 0] }); // A
unwrapNodes(editor, { match: (_, p) => Path.equals(p, [3, 1, 0]), at: [3, 1, 0, 0] }); // B
```

上边这个问题也就意味着我们所有的数据都不应该乱传，我们应该非常明确地知道我们要操作的数据及其结构。其实前边还提到一个问题，就是多级嵌套的情况很难处理，这其中实际上涉及了一个编辑边界情况，使得数据的维护就变得复杂了起来。举个例子，加入此时我们有个表格嵌套了比较多的`Cell`，如果我们是多实例的`Cell`结构，此时我们筛选出`Editor`实例之后处理任何数据都不会影响其他的`Editor`实例，而如果我们此时是`JSON`嵌套表达的结构，我们就可能存在超过操作边界而影响到其他数据特别是父级数据结构的情况。所以我们对于边界条件的处理也必须要关注到，也就是前边提到的我们需要非常明确要处理的数据结构，明确划分操作节点与范围。

```js
{
    children: [
        {
            BLOCK_EDGE: true, // 块结构边界
            children: [
                { children: [/* ... */] },
                { children: [/* ... */] },
            ]
        },
        {  children: [/* ... */] },
        {  children: [/* ... */] },
    ]
}
```

此外，在线上已有页面中调试代码可能是个难题，特别是在`editor`并没有暴露给`window`的情况下，想要直接获得编辑器实例则需要在本地复现线上环境，在这种情况下我们可以借助`React`会将`Fiber`实际写在`DOM`节点的特性，通过`DOM`节点直接取得`Editor`实例，不过原生的`slate`使用了大量的`WeakMap`来存储数据，在这种情况下暂时没有很好的解决办法，除非`editor`实际引用了此类对象或者拥有其实例，否则就只能通过`debug`打断点，然后将对象在调试的过程中暂储为全局变量使用了。

```js
const el = document.querySelector(`[data-slate-editor="true"]`);
const key = Object.keys(el).find(it => it.startsWith("__react"));
const editor = el[key].child.memoizedProps.node;
```

## 总结
在这里我们聊到了`WrapNode`数据结构与操作变换，主要是对于嵌套类型的数据结构需要关注的内容，而实际上节点的类型还可以分为很多种，我们在大范围上可以有`BlockNode`、`TextBlockNode`、`TextNode`，在`BlockNode`中我们又可以划分出`BaseNode`、`WrapNode`、`PairNode`、`InlineBlockNode`、`VoidNode`、`InstanceNode`等。

因此文中叙述的内容还是属于比较基本的，在`slate`中还有很多额外的概念和操作需要关注，例如`Range`、`Operation`、`Editor`、`Element`、`Path`等。那么在后边的文章中我们就主要聊一聊在`slate`中`Path`的表达，以及在`React`中是如何控制其内容表达与正确维护`Path`路径与`Element`内容渲染的。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://docs.slatejs.org/>
- <https://github.com/WindRunnerMax/DocEditor>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/>
