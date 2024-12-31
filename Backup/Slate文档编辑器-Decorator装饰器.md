# Slate文档编辑器-Decorator装饰器渲染调度
在之前我们聊到了基于文档编辑器的数据结构设计，聊了聊基于`slate`实现的文档编辑器类型系统，那么当前我们来研究一下`slate`编辑器中的装饰器实现。装饰器在`slate`中是非常重要的实现，可以为我们方便地在编辑器渲染调度时处理`range`的渲染。

* 在线编辑: <https://windrunnermax.github.io/DocEditor>
* 开源地址: <https://github.com/WindrunnerMax/DocEditor>

关于`slate`文档编辑器项目的相关文章:

* [基于Slate构建文档编辑器](https://juejin.cn/post/7265516410490830883)
* [Slate文档编辑器-WrapNode数据结构与操作变换](https://juejin.cn/spost/7385752495535603727)
* [Slate文档编辑器-TS类型扩展与节点类型检查](https://juejin.cn/spost/7399453742346551332)
* [Slate文档编辑器-Decorator装饰器渲染调度]()

## Decorate
在`slate`中`decoration`是比较有趣的功能，设想一个场景，当需要实现代码块的高亮时，我们可以有几种方案来实现: 第一种方案是我们可以通过直接将代码块的内容解析的方式，解析出的关键字类别直接写入数据结构中，这样就可以直接在渲染时将高亮信息渲染出来，缺点就是会增加数据结构存储数据的大小；那么第二种方式我们就可以只存储代码信息，当需要数据高亮时也就是前端渲染时我们再将其解析出`Marks`进行渲染，但是这样的话如果存在协同我们还需要为其标记为非协同操作以及无需服务端存储的纯客户端`Op`，会稍微增加一些复杂度；那么第三种方法就是使用`decoration`，实际上可以说这里只是`slate`帮我们把第二种方法的事情做好了，可以在不改变数据结构的情况下将额外的`Marks`内容渲染出来。

当然，我们使用装饰器的场景自然不只是代码块高亮，凡是涉及到不希望在数据结构中表达却要在渲染时表现的内容，都需要使用`decoration`来实现。还有比较明显的例子就是查找能力，如果在编辑器中实现查找功能，那么我们需要将查找到的内容标记出来，这个时候我们就可以使用`decoration`来实现，否则就需要绘制虚拟的图层来完成。而如果需要实现用户态的超链接解析功能，即直接贴入连接的时候，我们希望将其自动转为超链接的节点，也可以利用装饰器来实现。

在前段时间测试`slate`官网的`search-highlighting example`时，当我搜索`adds`时，搜索的效果很好，但是当我执行跨节点的搜索时，就不能非常有效地突出显示内容了，具体信息可以查看`https://github.com/ianstormtaylor/slate/pull/5670`。这也就是说当`decoration`执行跨节点处理的时候，是存在一些问题的。例如下面的例子，当我们搜索`123`或者`12345`时，我们能够正常将标记出的`decoration`渲染出来，然而当我们搜索`123456`时，此时我们构造的`range`会是`path: [0], offset: [0-6]`，此时我们跨越了`[0]`节点进行标记，就无法正常标记内容了。

```js
[
    { text: "12345" },
    { text: "67890" }
]
```

通过调用查找相关代码，我们可以看到上级的`decorate`结果会被传递到后续的渲染中，那么在本级同样会调度传递的`decorate`函数来生成新的`decorations`，并且这里需要判断如果父级的`decorations`与当前节点的`range`存在交集的话，那么内容会被继续传递下去。那么重点就在这里了，试想一下我们的场景，依旧以上述的例子中的内容为例，如果我们此时想要获取`123456`的索引，那么在`text: 12345`这个节点中肯定是不够的，我们必须要在上层数组中将所有文本节点的内容拼接起来，然后再查找才可以找到准确的索引位置。

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/hooks/use-children.tsx#L21
const useChildren = (props: {
  decorations: Range[]
  // ...
}) => {
  // ...

  for (let i = 0; i < node.children.length; i++) {
    // ...
    const ds = decorate([n, p])
    for (const dec of decorations) {
      const d = Range.intersection(dec, range)
      if (d) {
        ds.push(d)
      }
    }
    // ...
  }
  // ...
}
```

那么此时我们就明确需要我们调用`decorate`的节点是父级元素，而父级节点传递到我们需要处理的`text`节点时，就需要`Range.intersection`来判断是否存在交集，实际上这里判断交集的策略很简单，在下面我们举了两个例子，分别是存在交集和不存在交集的情况，我们实际上只需要判断两个节点的最终状态即可。

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/range.ts#L118

// start1          end1          start2          end2
// end1          start2
// end1 < start2 ===> 无交集

// start1          start2          end1          end2
// start2          end1
// start2 < end1 ===> 有交集 [start2, end1]
```

那么我们可以通过修改在`decorate`这部分代码中的`Range.intersection`逻辑部分来解决这个问题吗，具体来说就是当我们查找出的内容超出原本`range`的内容，则截取其需要装饰的部分，而其他部分舍弃掉，实际上这个逻辑在上边我们分析的时候已经发觉是没有问题的，也就是当我们查找`123456`的时候是能够将`12345`这部分完全展示出来的。根据前边的分析，本次循环我们的节点都在`path: [0]`，这部分代码会将`start: 0`到`end: 5`这部分代码截取`range`并渲染。

然而我们在下一个`text range`范围内继续查找`6`这部分就没有那么简单了，因为前边我们实际上查找的`range`是`path: [0], offset: [0-6]`，而第二个`text`的基本`range`是`path: [1], offset: [0-5]`，基于上述判断条件的话我们是发现是不会存在交集的。因此如果需要在这里进行处理的话，我们就需要取得前一个`range`甚至在跨越多个节点的情况下我们需要向前遍历很多节点，当`decorations`数量比较多的情况下我们需要检查所有的节点，因为在此节点我们并不知道前一个节点是否超越了本身节点的长度，这种情况下在此处的计算量可能比较大，或许会造成性能问题。

因此我们还是从解析时构造`range`入手，当跨越节点时我们就需要将当前查找出来的内容分割为多个`range`，然后为每个`range`分别置入标记，还是以上边的数据为例，此时我们查找的结果就是`path: [0], offset: [0, 5]`与`path: [1], offset: [0, 1]`两部分，这种情况下我们在`Range.intersection`时就可以正常处理交集了，此时我们的`path`是完全对齐的，而即使完全将内容跨越，也就是搜索内容跨越不止一个节点时，我们也可以通过这种方式来处理。


```js
// https://github.com/ianstormtaylor/slate/pull/5670
const texts = node.children.map(it => it.text)
const str = texts.join('')
const length = search.length
let start = str.indexOf(search)
let index = 0
let iterated = 0
while (start !== -1) {
  while (index < texts.length && start >= iterated + texts[index].length) {
    iterated = iterated + texts[index].length
    index++
  }
  let offset = start - iterated
  let remaining = length
  while (index < texts.length && remaining > 0) {
    const currentText = texts[index]
    const currentPath = [...path, index]
    const taken = Math.min(remaining, currentText.length - offset)
    ranges.push(/* 构造新的`range` */)
    remaining = remaining - taken
    if (remaining > 0) {
      iterated = iterated + currentText.length
      offset = 0
      index++
    }
  }
  start = str.indexOf(search, start + search.length)
}
```

此外，我们在调度装饰器的时候，需要关注在`renderLeaf`参数`RenderLeafProps`的值，因为在这里存在两种类型的文本内容，即`leaf: Text;`以及`text: Text;`基本`TextInterface`类型。而在我们通过`renderLeaf`渲染内容时，以高亮的代码块内值`mark`节点的渲染为例，我们实际渲染节点需要以`leaf`为基准而不是以`text`为基准，例如当在渲染`mark`和`bold`样式产生重叠时，这两种节点都需要以`leaf`为基准。

在这里的原因是，`decorations`在`slate`实现中是以`text`节点为基准将其拆分为多个`leaves`，然后再将`leaves`传递到`renderLeaf`中进行渲染。因此实际上在这里可以这么理解，`text`属性为原始值，而`leaf`属性为更细粒度的节点，调度`renderLeaf`的时候本身也是以`leaf`为粒度进行渲染的，当然在不使用装饰器的情况下，这两种属性的节点类型是等同的。

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/components/text.tsx#L39
const leaves = SlateText.decorations(text, decorations)
const key = ReactEditor.findKey(editor, text)
const children = []

for (let i = 0; i < leaves.length; i++) {
  const leaf = leaves[i]

  children.push(
    <Leaf
    isLast={isLast && i === leaves.length - 1}
    key={`${key.id}-${i}`}
    renderPlaceholder={renderPlaceholder}
    leaf={leaf}
    text={text}
    parent={parent}
    renderLeaf={renderLeaf}
    />
  )
}
```

## 最后
在这里我们主要讨论了`slate`中的`decoration`装饰器的实现，以及在实际使用中可能会遇到的问题，主要是在跨节点的情况下，我们需要将`range`拆分为多个`range`，然后分别进行处理，并且还分析了源码来探究了相关问题的实现。那么在后边的文章中我们就主要聊一聊在`slate`中`Path`的表达，以及在`React`中是如何控制其内容表达与正确维护`Path`路径与`Element`内容渲染的方案。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://docs.slatejs.org/>
- <https://github.com/ianstormtaylor/slate>
- <https://github.com/WindRunnerMax/DocEditor>
