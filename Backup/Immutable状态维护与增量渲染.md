# Immutable状态维护与增量渲染
在先前我们讨论了视图层的适配器设计，主要是全量的视图初始化渲染，包括生命周期同步、状态管理、渲染模式、`DOM`映射状态等。在这里我们需要处理变更的增量更新，这属于性能方面的考量，需要考虑如何实现不可变的状态对象，以此来实现`Op`操作以及最小化`DOM`变更。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>从零实现富文本编辑器系列文章</strong></summary>

- [深感一无所长，准备试着从零开始写个富文本编辑器](./从零设计实现富文本编辑器.md)
- [从零实现富文本编辑器#2-基于MVC模式的编辑器架构设计](./基于MVC模式的编辑器架构设计.md)
- [从零实现富文本编辑器#3-基于Delta的线性数据结构模型](./基于Delta的线性数据结构模型.md)
- [从零实现富文本编辑器#4-浏览器选区模型的核心交互策略](./浏览器选区模型的核心交互策略.md)
- [从零实现富文本编辑器#5-编辑器选区模型的状态结构表达](./编辑器选区模型的状态结构表达.md)
- [从零实现富文本编辑器#6-浏览器选区与编辑器选区模型同步](./浏览器选区与编辑器选区模型同步.md)
- [从零实现富文本编辑器#7-基于组合事件的半受控输入模式](./基于组合事件的半受控输入模式.md)
- [从零实现富文本编辑器#8-浏览器输入模式的非受控DOM行为](./浏览器输入模式的非受控DOM行为.md)
- [从零实现富文本编辑器#9-编辑器文本结构变更的受控处理](./编辑器文本结构变更的受控处理.md)
- [从零实现富文本编辑器#10-React视图层适配器的模式扩展](./React视图层适配器的模式扩展.md)
- [从零实现富文本编辑器#11-Immutable状态维护与增量渲染](./Immutable状态维护与增量渲染.md)

</details>

## 行级不可变状态
在这里我们先不引入视图层的渲染问题，而是仅在`Model`层面上实现精细化的处理，具体来说就是实现不可变的状态对象，仅更新的节点才会被重新创建，其他节点则直接复用。由此想来此模块的实现颇为复杂，也并未引入`immer`等框架，而是直接处理的状态对象，因此先从简单的更新模式开始考虑。

回到最开始实现的`State`模块更新文档内容，我们是直接重建了所有的`LineState`以及`LeafState`对象，然后在`React`视图层的`BlockModel`中监听了`OnContentChange`事件，以此来将`BlockState`的更新应用到视图层。

```js
delta.eachLine((line, attributes, index) => {
  const lineState = new LineState(line, attributes, this);
  lineState.index = index;
  lineState.start = offset;
  lineState.key = Key.getId(lineState);
  offset = offset + lineState.length;
  this.lines[index] = lineState;
});
```

这种方式简单直接，全量更新状态能够保证在`React`的状态更新，然而这种方式的问题在于性能。当文档内容非常大的时候，全量计算将会导致大量的状态重建，并且其本身的改变也会导致`React`的`diff`差异进而全量更新文档视图，这样的性能开销通常是不可接受的。

那么通常来说我们就需要基于变更来确定状态的更新，首先我们需要确定更新的粒度，例如以行为基准则未变更的时候就直接取原有的`LineState`。相当于尽可能复用`Origin List`然后生成`Target List`，这样的方式自然可以避免部分状态的重建，尽可能复用原本的对象。

整体思路大概是先执行变成生成最新的列表，然后分别设置旧列表和新列表的`row`和`col`两个指针值，然后更新时记录起始`row`，删除和新增自然是正常处理，对于更新则认为是先删后增。对于内容的处理则需要分别讨论单行和跨行的问题，中间部分的内容就作为重建的操作。

最后可以将这部分增删`LineState`数据放置于`Changes`中，就可以得到实际增删的`Ops`了，这样我们就可以优化部分的性能，因为仅原列表和目标列表的中间部分才会重建，其他部分的行状态直接复用。此外这部分数据在`apply`的`delta`中是不存在的，同样可以认为是数据的补充。

```js
  Origin List (Old)                          Target List (New)
+-------------------+                      +-------------------+
| [0] LineState A   | <---- Retain ------> | [0] LineState A   | (Reused)
+-------------------+                      +-------------------+
| [1] LineState B   |          |           | [1] LineState B2  | (Update)
+-------------------+       Changes        |     (Modified)    | (Del C)
| [2] LineState C   |          |           +-------------------+
+-------------------+          V           | [2] NewState X    | (Inserted)
| [3] LineState D   | ---------------\     +-------------------+
+-------------------+                 \--> | [3] LineState D   | (Reused)
| [4] LineState E   | <---- Retain ------> | [4] LineState E   | (Reused)
+-------------------+                      +-------------------+
```

那么这里实际上是存在非常需要关注的点，我们现在维护的是状态模型，也就是说所有的更新就不再是直接的`compose`，而是操作我们实现的状态对象。本质上我们是需要实现行级别的`compose`方法，这里的实现非常重要，假如我们对于数据的处理存在偏差的话，那么就会导致状态出现问题。

此外在这种方式中，我们判断`LineState`是否需要新建则是根据整个行内的所有`LeafState`来重建的。也就是说这种时候我们是需要再次将所有的`op`遍历一遍，当然实际上由于最后还需要将`compose`后的`Delta`切割为行级别的内容，所以其实即使在应用变更后也最少需要再遍历两次。

那么此时我们需要思考优化方向，首先是首个`retain`，在这里我们应该直接完整复用原本的`LineState`，包括处理后的剩余节点也是如此。而对于中间的节点，我们就需要为其独立设计更新策略，这部分理论上来说是需要完全独立处理为新的状态对象的，这样可以减少部分`Leaf Op`的遍历。

```js
new Delta().retain(5).insert("xx")
insert("123"), insert("\n") // skip 
insert("456"), insert("\n") // new line state
```

其中，如果是新建的节点，我们直接构建新的`LineState`即可，删除的节点则不从原本的`LineState`中放置于新的列表。而对于更新的节点，我们需要更新原本的`LineState`对象，因为实际上行是存在更新的，而重点是我们需要将原本的`LineState`的`key`值复用。

这里我们先简单实现实现描述一下复用的问题，比较方便的实现则是直接以`\n`的标识为目标的`State`，这就意味着我们要独立`\n`为独立的状态。即如果在`123|456\n`的`|`位置插入`\n`的话，那么我们就是`123`是新的`LineState`，`456`是原本的`LineState`，以此来实现`key`的复用。

```js
[
  insert("123"), insert("\n"), 
  insert("456"), insert("\n")
]
// ===>
[ 
  LineState(LeafState("123"), LeafState("\n")), 
  LineState(LeafState("456"), LeafState("\n"))
]
```

其实这里有个非常值得关注的点是，`LineState`在`Delta`中是没有具体对应的`Op`的，而相对应的`LeafState`则是有具体的`Op`的。这就意味着我们在处理`LineState`的更新时，是不能直接根据变更控制的，因此必须要找到能够映射的状态，因此最简单的方案即根据`\n`节点映射。

```js
LeafState("\n", key="1") <=> LineState(key="L1")
```

实际上我们可以总结一下，最开始我们考虑先更新再`diff`，后来考虑的是边更新边记录。边更新边记录的优点在于，可以避免再次遍历一边所有`Leaf`节点的消耗，同时也可以避免`diff`的复杂性。但是这里也存在个问题，如果内部进行了多次`retain`操作，则无法直接复用`LineState`。

不过通常来说，最高频的操作是输入内容，这种情况下首操作一般都是`retain`，尾操作为空会收集剩余文档内容，因此这部分优化是会被高频触发的。而如果是多次的内容部分变更操作，这部分虽然可以通过判断行内的叶子结点是否变更，来判断是否复用行对象，但是也存在一定复杂性。

关于这部分的具体实现，在编辑器的状态模块里存在独立的`Mutate`模块，这部分实现在后边实现各个模块时会独立介绍。到这里我们就可以实现一个简单的`Immutable`状态维护，如果`Leaf`节点发生变化之后，其父节点`Line`会触发更新，而其他节点则可以直接复用。

## Key 值维护
至此我们实现了一套简单的`Immutable Delta+Iterator`来处理更新，这种时候我们就可以借助不可变的方式来实现`React`视图的更新，那么在`React`的渲染模式中，`key`值的管理也是个值的探讨的问题。

在这里我们就可以根据状态不可变来生成`key`值，借助`WeakMap`映射关系获取对应的字符串`id`值，此时就可以借助`key`的管理以及`React.memo`来实现视图的复用。其实在这里初步看起来`key`值应该是需要主动控制强制刷新的时候，以及完全是新节点才会用得到的。

但是这种方式也是有问题的，因为此时我们即使输入简单的内容，也会导致整个行的`key`发生改变，而此时我们是不必要更新此时的`key`的。因此`key`值是需要单独维护的，不能直接使用不可变的对象来索引`key`值，那么如果是直接使用`index`作为`key`值的话，就会存在潜在的原地复用问题。

`key`值原地复用会导致组件的状态被错误保留，例如此时有个非受控管理的`input`组件列表，在某个输入框内已经输入了内容，当其发生顺序变化时，`input`原始输入内容会跟随着原地复用的策略留在原始的位置，而不是跟随到新的位置，因为其顺序`id`未发生变化导致`React`直接复用节点。

在`LineState`节点的`key`值维护中，如果是初始值则是根据`state`引用自增的值，在变更的时候则是尽可能地复用原始行的`key`，这样可以避免过多的行节点重建并且可以控制整行的强刷。

而对于`LeafState`节点的`key`值最开始是直接使用`index`值，这样实际上会存在隐性的问题，而如果直接根据`Immutable`来生成`key`值的话，任何文本内容的更改都会导致`key`值改变进而导致`DOM`节点的频繁重建。

```js
export const NODE_TO_KEY = new WeakMap<Object.Any, Key>();
export class Key {
  /** 当前节点 id */
  public id: string;
  /** 自动递增标识符 */
  public static n = 0;

  constructor() {
    this.id = `${Key.n++}`;
  }

  /**
   * 根据节点获取 id
   * @param node
   */
  public static getId(node: Object.Any): string {
    let key = NODE_TO_KEY.get(node);
    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }
    return key.id;
  }
}
```

通常使用`index`作为`key`是可行的，然而在一些非受控场景下则会由于原地复用造成渲染问题，`diff`算法导致的性能问题我们暂时先不考虑。在下面的例子中我们可以看出，每次我们都是从数组顶部删除元素，而实际的`input`值效果表现出来则是删除了尾部的元素，这就是原地复用的问题。在非受控场景下比较明显，而我们的`ContentEditable`组件就是一个非受控场景，因此这里的`key`值需要再考虑一下。

```js
const { useState, Fragment, useRef, useEffect } = React;
function App() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes] = useState(() => Array.from({ length: 10 }, (_, i) => i));

  const onClick = () => {
    const [_, ...rest] = nodes;
    console.log(rest);
    setNodes(rest);
  };

  useEffect(() => {
    const el = ref.current;
    el && Array.from(el.children).forEach((it, i) => ((it as HTMLInputElement).value = i + ""));
  }, []);

  return (
    <Fragment>
      <p ref={ref}>
        {nodes.map((_, i) => (<input key={i}></input>))}
      </p>
      <button onClick={onClick}>slice</button>
    </Fragment>
  );
}
```

考虑到先前提到的我们不希望任何文本内容的更改都导致`key`值改变引发重建，因此就不能直接使用计算的`immutable`对象引用来处理`key`值，而描述单个`op`的方法除了`insert`就只剩下`attributes`了。

但是如果基于`attributes`来获得就需要精准控制合并`insert`的时候取需要取旧的对象引用，且没有属性的`op`就不好处理了，因此这里可能只能将其转为字符串处理，但是这样同样不能保持`key`的完全稳定，因此前值的索引改变就会导致后续的值出现变更。

```js
const prefix = new WeakMap<LineState, Record<string, number>>();
const suffix = new WeakMap<LineState, Record<string, number>>();
const mapToString = (map: Record<string, string>): string => {
  return Object.keys(map)
    .map(key => `${key}:${map[key]}`)
    .join(",");
};
const toKey = (state: LineState, op: Op): string => {
  const key = op.attributes ? mapToString(op.attributes) : "";
  const prefixMap = prefix.get(state) || {};
  prefix.set(state, prefixMap);
  const suffixMap = suffix.get(state) || {};
  suffix.set(state, suffixMap);
  const prefixKey = prefixMap[key] ? prefixMap[key] + 1 : 0;
  const suffixKey = suffixMap[key] ? suffixMap[key] + 1 : 0;
  prefixMap[key] = prefixKey;
  suffixMap[key] = suffixKey;
  return `${prefixKey}-${suffixKey}`;
};
```

在`slate`中我先前认为生成的`key`跟节点是完全一一对应的关系，例如当`A`节点变化时，其代表的层级`key`必然会发生变化，然而在关注这个问题之后，我发现其在更新生成新的`Node`之后，会同步更新`Path`以及`PathRef`对应的`Node`节点所对应的`key`值。

在后续观察`Lexical`实现的选区模型时，发现其是用`key`值唯一地标识每个叶子结点的，选区也是基于`key`值来描述的。整体表达上比较类似于`Slate`的选区结构，或者说是`DOM`树的结构。这里仅仅是值得`Range`选区，`Lexical`实际上还有其他三种选区类型。

```js
{
  anchor: { key: "51", offset: 2, type: "text" },
  focus: { key: "51", offset: 3, type: "text" }
}
```

在这里比较重要的是`key`值变更时的状态保持，因为编辑器的内容实际上是需要编辑的。然而如果做到`immutable`话，很明显直接根据状态对象的引用来映射`key`会导致整个编辑器`DOM`无效的重建。例如调整标题的等级，就由于整个行`key`的变化导致整行重建。

那么如何尽可能地复用`key`值就成了需要研究的问题，我们的编辑器行级别的`key`是被特殊维护的，即实现了`immutable`以及`key`值复用。而目前叶子状态的`key`依赖了`index`值，因此如果调研`Lexical`的实现，同样可以将其应用到我们的`key`值维护中。

通过在`playground`中调试可以发现，即使我们不能得知其是否为`immutable`的实现，依然可以发现`Lexical`的`key`是以一种偏左的方式维护。因此在我们的编辑器实现中，也可以借助同样的方式，合并直接以左值为准复用，拆分时若以`0`起始直接复用，起始非`0`则创建新`key`。

1. `[123456(key1)][789(bold-key2)]`文本，将`789`的加粗取消，整段文本的`key`值保持为`key1`。
2. `[123456789(key1)]]`文本，将`789`这段文本加粗，左侧`123456`文本的`key`值保持为`key1`，`789`则是新的`key`。
3. `[123456789(key1)]]`文本，将`123`这段文本加粗，左侧`123`文本的`key`值保持为`key1`，`456789`则是新的`key`。
4. `[123456789(key1)]]`文本，将`456`这段文本加粗，左侧`123`文本的`key`值保持为`key1`，`456`和`789`分别是新的`key`。

因此，此时在编辑器中我们也是用类似偏左的方式维护`key`，由于我们需要保持`immutable`，所以这里的表达实际上是尽可能复用先前的`key`状态。这里与`LineState`的`key`值维护方式类似，都是先创建状态然后更新其`key`值，当然还有很多细节的地方需要处理。

```js
// 起始与裁剪位置等同 NextOp => Immutable 原地复用 State
if (offset === 0 && op.insert.length <= length) {
  return nextLeaf;
}
const newLeaf = new LeafState(retOp, nextLeaf.parent);
// 若 offset 是 0, 则直接复用原始的 key 值
offset === 0 && newLeaf.updateKey(nextLeaf.key);
```

这里还存在另一个小问题，我们创建`LeafState`就立即去获得对应的`key`值，然后再考虑去复用原始的`key`值。这样其实就会导致很多不再使用的`key`值被创建，导致每次更新的时候看起来`key`的数字差值比较大。当然这并不影响整体的功能与性能，只是调试的时候看起来比较怪。

因此我们在这里还可以优化这部分表现，也就是说我们在创建的时候不会去立即创建`key`值，而是在初始化以及更新的时候再从外部设置其`key`值。这个实现其实跟`index`、`offset`的处理方式比较类似，我们整体在`update`时处理所有的相关值，且开发模式渲染时进行了严格检查。

```js
// BlockState
let offset = 0;
this.lines.forEach((line, index) => {
  line.index = index;
  line.start = offset;
  line.key = line.key || Key.getId(line);
  const size = line.isDirty ? line.updateLeaves() : line.length;
  offset = offset + size;
});
this.length = offset;
this.size = this.lines.length;
```

```js
// LineState
let offset = 0;
const ops: Op[] = [];
this.leaves.forEach((leaf, index) => {
  ops.push(leaf.op);
  leaf.offset = offset;
  leaf.parent = this;
  leaf.index = index;
  offset = offset + leaf.length;
  leaf.key = leaf.key || Key.getId(leaf);
});
this._ops = ops;
this.length = offset;
this.isDirty = false;
this.size = this.leaves.length;
```

此外，在实现单元测试时还发现，在`leaf`上独立维护了`key`值，那么`\n`这个特殊的节点自然也会有独立的`key`值。这种情况下在`line`级别上维护的`key`值倒是也可以直接复用`\n`这个`leaf`的`key`值。当然这只是理论上的实现，可能会导致一些意想不到的刷新问题。

## 视图增量渲染
在最开始的时候，我们的状态管理形式是直接全量更新`Delta`，然后使用`EachLine`遍历重建所有的状态。并且实际上我们维护了`Delta`与`State`两个数据模型，建立其关系映射关系本身也是一种损耗，渲染的时候的目标状态是`Delta`而非`State`。

这样的模型必然是耗费性能的，每次`Apply`的时候都需要全量更新文档并且再次遍历分割行状态。当然实际上只是计算迭代的话，实际上是不会太过于耗费性能，但是由于我们每次都是新的对象，那么在更新视图的时候，更容易造成性能的损耗。

因此实现增量渲染时，首先我们需要将渲染的目标节点转为`State`，而`Delta`仅用于初始化构建`State`以及生成变更使用。

关于整个状态模型的管理，还有很多问题需要处理，例如我们即使需要重建`LineState`，也需要尽可能找到其原始的`LineState`以便于复用其`key`值，避免整个行的`ReMount`，当然即使复用了`key`值，因为重建了`State`实例，`React`也会继续后边的`ReRender`流程。说到这里，我们对于`ViewModel`的节点都补充了`React.memo`，以便于我们的`State`复用能够正常起到效果。但是，目前来说我们的重建方案效率是不如最开始提到的行方案的，因为此时我们相当于从结果反推，大概需要经过`O(3N)`的时间消耗，而同时`compose`以及复用`state`才是效率最高的方案，这里还存在比较大的优化空间，特别是在多行文档中只更改小部分行内容的情况下，实际上这也是最常见的形式。

## 总结

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
