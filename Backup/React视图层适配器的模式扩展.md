# React视图层适配器的模式扩展
在编辑器最开始的架构设计上，我们就以`MVC`模式为基础，分别实现模型层、核心层、视图层的分层结构。在先前我们讨论的主要是模型层以及核心层的设计，即数据模型以及编辑器的核心交互逻辑，在这里我们以`React`为例，讨论其作为视图层的模式扩展设计。

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

</details>

## 概述
多数编辑器实现了本身的视图层，而重新设计视图层需要面临渲染问题，诸如处理复杂的`DOM`更新、差量更新的成本，在业务上也无法复用组件生态，且存在新的学习成本。因此我们需要能够复用现有的视图层框架，例如`React/Vue/Angular`等，这就需要在最底层的架构上就实现可扩展视图层的核心模式。

复用现有的视图层框架也就意味着，在核心层设计上不感知任何类型的视图实现，针对诸如选区的实现也仅需要关注最基础的`DOM`操作。而这也就导致我们需要针对每种类型的框架都实现对应的视图层适配器，即使其本身并不会特别复杂，但也会是需要一定工作量的。

虽然独立设计视图层可以解决视图层适配成本问题，但相应的会增加维护成本以及包本身体积，因此在我们的编辑器设计上，我们还是选择复用现有的视图层框架。然而，即使复用视图层框架，适配富文本编辑器也并非是一件简单的事情，需要关注的点包括但不限于以下几部分:

- 核心层与视图层渲染: 生命周期同步、状态管理、渲染模式、`DOM`映射状态等。
- 内容编辑的增量更新: 不可变对象、增量渲染、`Key`值维护等。
- 渲染事件与节点检查: 脏`DOM`检查、选区更新、渲染`Hook`等。
- 编辑节点的组件预设: 零宽字符、`Embed`节点、`Void`节点等。
- 非编辑节点内容渲染: 占位节点、只读模式、插件模式、外部节点挂载等。
 
此外，基于`React`实现视图层适配器，相当于重新深入学习`React`的渲染机制。例如使用`memo`来避免不必要的重渲染、使用`useLayoutEffect`来控制`DOM`渲染更新时机、严格控制父子组件事件流以及副作用执行顺序等、处理脏`DOM`的受控更新等。

除了这些与`React`相关的实现，还有一些样式有关的问题需要注意。例如在`HTML`默认连续的空白字符，包括空格、制表符和换行符等，在渲染时会被合并为一个空格，这样就会导致输入的多个空格在渲染时只显示一个空格。

为了解决这个问题，有些时候我们可以直接使用`HTML`实体`&nbsp;`来表示这些字符来避免渲染合并，然而我们其实可以用更简单的方式来处理，即使用`CSS`来控制空白符的渲染。下面的几个样式分别控制了不同的渲染行为:

- `whiteSpace: "pre-wrap"`: 表示在渲染时保留换行符以及连续的空白字符，但是会对长单词进行换行。
- `wordBreak: "break-word"`: 可以防止长单词或`URL`溢出容器，会在单词内部分行，对中英文混合内容特别有用。
- `overflowWrap: "break-word"`: 同样是处理溢出文本的换行，但自适应宽度时不考虑长单词折断，属于当前标准写法。

```js
<div
  style={{
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  }}
></div>
```

## 生命周期同步


## 状态管理

`core -> react`中使用`context/redux/mobx`是否可以避免自行维护各个状态对象，也可以达到局部刷新而不是刷新整个页面的效果。  

想了想似乎不太行，就拿`context`来说，即使有`immer.js`似乎也做不到局部刷新，因为整个`delta`的数据结构不能够达到非常完整的与`react props`对应的效果，诚然我们可以根据`op & attributes`作为`props`再在组件内部做数据转换，但是这样似乎并不能避免维护一个状态对象，最基本的是应该要维护一个`LineState`对象，每个`op`可能与前一个或者后一个有状态关联，以及行属性需要处理，这样一个基础的`LineState`对象是必不可少的。  

后边我又仔细想了想，毕竟现在没有实现就纯粹是空想，`LineState`对象是必不可少的，再加上是要做插件化的，那么给予`react`组件的`props`应该都实际上可以隐藏在插件里边处理，如果我使用`immer`的话，似乎只需要保证插件给予的参数是不变的即可，但是同样的每一个`LineState`都会重新调用一遍插件化的`render`方法(或者其他名字)，这样确实造成了一些浪费，即使能够保证数据不可变即不会再发生`re-render`，但是如果在插件中解构了这个对象或者做了一些处理，那么又会触发`react`函数执行，当然因为`react diff`的存在可能不会触发视图重绘罢了。

那么既然`LineState`对象不可避免，如果再在这上边抽象出一层`BlockState`来管理`LineState`，这样是不是会更简单一些，同样因为上边也说过目前是在`delta`的基础上又包了一层`block`，那么就又需要一个`ContentState`来管理`BlockState`了，当然这层`ContentState`也是可以直接放在`editor`对象里的，只不过`editor`对象包含了太多的模块，还是抽离出来更合适。通过`editor`的`Content Change`事件作为`bridge`，以及这种一层管理一层的方式，精确地更新每一行，减少性能损耗，甚至于因为我们能够比较精确的得知究竟是哪几个`op`更新了，做到精准更新也不是不可能。



在先前的`State`模块更新文档内容时，我们是直接重建了所有的`LineState`以及`LeafState`对象，然后在`React`视图层的`BlockModel`中监听了`OnContentChange`事件，以此来将`BlockState`的更新应用到视图层。这种方式简单直接，全量更新状态能够保证在`React`的状态更新，然而这种方式的问题在于性能，当文档内容非常大的时候，全量计算将会导致大量的状态重建，并且其本身的改变也会导致`React`的`diff`差异进而全量更新文档视图，这样的性能开销通常是不可接受的。

那么通常来说我们就需要基于`Changes`来确定状态的更新，首先我们需要确定更新的粒度，例如以行为基准则`retain`跨行的时候就直接复用原有的`LineState`，这当然是个合理的方法，相当于尽可能复用`Origin List`然后生成`Target List`，这样的方式自然可以避免部分状态的重建，尽可能复用原本的对象。整体思路大概是分别记录旧列表和新列表的`row`和`col`两个`index`值，然后更新时记录起始`row`，删除和新增自然是正常处理，对于更新则认为是先删后增，对于内容的处理则需要分别讨论单行和跨行的问题，最后可以将这部分增删`LineState`数据放置于`changes`中，就可以得到实际增删的`Ops`了，这部分数据在`apply`的`delta`中是不存在的，同样可以认为是数据的补充。

那么这里实际上是存在非常需要关注的点是我们现在维护的是状态模型，那么也就是说所有的更新就不再是直接的`Delta.compose`，而是使用我们实现的`Mutate`，假如我们对于数据的处理存在偏差的话，那么就会导致状态出现问题，本质上我们是需要实现`Line`级别的`compose`方法。实际上我们可以重新考虑这个问题，如果我们整个行的`LeafState`都没有变化的话，是不是就可以意味着`LineState`就可以直接复用了，在`React`中`Immutable`是很常用的概念，那么我们完全可以重写`compose`等方法做到`Imuutable`，然后在更新的时候重新构建新的`Delta`，当行中`Ops`都没有发生变化的时候，我们就可以直接复用`LinState`，当然`LeafState`是完全可以直接复用的，这里我们将粒度精细到了`Op`级别。

此外在调研了相关编辑器之后，我发现关于`key`值的管理也是个值的探讨的问题。先前我认为`Slate`生成的`key`跟节点是完全一一对应的关系，例如当`A`节点变化时，其代表的层级`key`必然会发生变化，然而在关注这个问题之后，我发现其在更新生成新的`Node`之后，会同步更新`Path`以及`PathRef`对应的`Node`节点所对应的`key`值，包括飞书的`Block`行状态管理也是这样实现的，飞书`Block`的叶子节点则更加抽象，`key`值是`stringify`化的`Op`属性值拼接其`Line`内的属性值`index`，用以处理重复的属性对象。我思考在这里`key`值应该是需要主动控制强制刷新的时候，以及完全是新节点才会用得到的，应该跟`React`以及`ContentEditable`非受控有关系，这个问题还是需要进一步的探讨。

因此关于整个状态模型的管理，还有很多问题需要处理，例如我们即使需要重建`LineState`，也需要尽可能找到其原始的`LineState`以便于复用其`key`值，避免整个行的`ReMount`，当然即使复用了`key`值，因为重建了`State`实例，`React`也会继续后边的`ReRender`流程。说到这里，我们对于`ViewModel`的节点都补充了`React.memo`，以便于我们的`State`复用能够正常起到效果。但是，目前来说我们的重建方案效率是不如最开始提到的行方案的，因为此时我们相当于从结果反推，大概需要经过`O(3N)`的时间消耗，而同时`compose`以及复用`state`才是效率最高的方案，这里还存在比较大的优化空间，特别是在多行文档中只更改小部分行内容的情况下，实际上这也是最常见的形式。



## Key 值维护
在`LineState`节点的`key`值维护中，如果是初始值则是根据`state`引用自增的值，在变更的时候则是尽可能地复用原始行的`key`，这样可以避免过多的行节点重建并且可以控制整行的强刷。

而对于`LeafState`节点的`key`值目前是直接使用`index`值，这样实际上会存在隐性的问题，而如果直接根据`Immutable`来生成`key`值的话，任何文本内容的更改都会导致`key`值改变进而导致`DOM`节点的频繁重建。

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
public updateLines() {
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
}
// LineState
public updateLeaves() {
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
}
```

此外，在实现单元测试时还发现，在`leaf`上独立维护了`key`值，那么`\n`这个特殊的节点自然也会有独立的`key`值。这种情况下在`line`级别上维护的`key`值倒是也可以直接复用`\n`这个`leaf`的`key`值。当然这只是理论上的实现，可能会导致一些意想不到的刷新问题。

## 渲染模式


## 总结



## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://developer.mozilla.org/en-US/docs/Glossary/Character_reference>
