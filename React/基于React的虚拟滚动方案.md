# 基于React的虚拟滚动方案
在渲染列表时我们通常会一次性将所有列表项渲染到`DOM`中，在数据量大的时候这种操作会造成页面响应缓慢，因为浏览器需要处理大量的`DOM`元素。而此时我们通常就需要虚拟滚动来实现性能优化，当我们拥有大量数据需要在用户界面中以列表或表格的形式展示时，这种性能优化方式可以大幅改善用户体验和应用性能，那么在本文中就以固定高度和非固定高度两种场景展开虚拟列表的实现。

## 描述
实现虚拟列表通常并不是非常复杂的事情，但是我们需要考虑到很多细节问题。在具体实现之前我思考了一个比较有意思的事情，为什么虚拟滚动能够优化性能。我们在浏览器中进行`DOM`操作的时候，此时这个`DOM`是真正存在的吗，或者说我们在`PC`上实现窗口管理的时候，这个窗口是真的存在的吗。那么答案实际上很明确，这些视图、窗口、`DOM`等等都是通过图形化模拟出来的，虽然我们可以通过系统或者浏览器提供的`API`来非常简单地实现各种操作，但是实际上些内容是系统帮我们绘制出来的图像，本质上还是通过外部输入设备产生各种事件信号，从而产生状态与行为模拟，诸如碰撞检测等等都是系统通过大量计算表现出的状态而已。

那么紧接着，在前段时间我想学习下`Canvas`的基本操作，于是我实现了一个非常基础的图形编辑器引擎。因为在浏览器的`Canvas`只提供了最基本的图形操作，没有那么方便的`DOM`操作从而所有的交互事件都需要通过鼠标与键盘事件自行模拟，这其中有一个非常重要的点是判断两个图形是否相交，从而决定是否需要按需重新绘制这个图形来提升性能。那么我们设想一下，最简单的判断方式就是遍历一遍所有图形，从而判断是否与即将要刷新的图形相交，那么这其中就可能涉及比较复杂的计算，而如果我们能够提前判断某些图形是不可能相交的话，就能够省去很多不必要的计算。那么在视口外的图层就是类似的情况，如果我们能够确定这个图形是视口外的，我们就不需要判断其相交性，而且本身其也不需要渲染，那么虚拟滚动也是一样，如果我们能够减少`DOM`的数量就能够减少很多计算，从而提升整个页面的运行时性能，至于首屏性能就自不必多说，减少了`DOM`数量首屏的绘制一定会变快。

当然上边只是我对于提升页面交互或者说运行时性能的思考，实际上关于虚拟滚动优化性能的点在社区上有很多讨论了。诸如减少`DOM`数量可以减少浏览器需要渲染和维持的`DOM`元素数量，进而内存占用也随之减少，这使得浏览器可以更快地响应用户操作。以及浏览器的`reflow`和重绘`repaint`操作通常是需要大量计算的，并且随着`DOM`元素的增多而变得更加频繁和复杂，通过虚拟滚动个减少需要管理的`DOM`数量，同样可显著提高渲染性能。此外虚拟滚动还有更快的首屏渲染时间，特别是超大列表的全量渲染很容易导致首屏渲染时间过长，还能够减少`React`维护组件状态所带来的`Js`性能消耗，特别是在存在`Context`的情况下，不特别关注就可能会存在性能劣化问题。

文中会提到`4`种虚拟列表的实现方式，分别有固定高度的`OnScroll`实现和不定高度的`IntersectionObserver+OnScroll`实现，相关`DEMO`都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/react-virtual-list`中。

## 固定高度
实际上关于虚拟滚动的方案在社区有很多参考，特别是固定高度的虚拟滚动实际上可以做成非常通用的解决方案。那么在这里我们以`ArcoDesign`的`List`组件为例来研究一下通用的虚拟滚动实现。在`Arco`给予的示例中我们可以看到其传递了`height`属性，此时如果我们将这个属性删除的话虚拟列表是无法正常启动的，那么实际上`Arco`就是通过列表元素的数量与每个元素的高度，从而计算出了整个容器的高度，这里要注意滚动容器实际上应该是虚拟列表的容器外的元素，而对于视口内的区域则可以通过`transform: translateY(Npx)`来做实际偏移，当我们滚动的时候，我们需要通过滚动条的实际滚动距离以及滚动容器的高度，配合我们配置的元素实际高度，就可以计算出来当前视口实际需要渲染的节点，而其他的节点并不实际渲染，从而实现虚拟滚动。当然实际上关于`Arco`虚拟列表的配置还有很多，在这里就不完整展开了。

```js
<List
  {/* ... */}
  virtualListProps={{
    height: 560,
  }}
  {/* ... */}
/>
```

那么我们可以先来设想一下，当我们有了每个元素的高度以及元素数量，很明显我们就可以计算出容器的高度了，当我们有了容器的高度，此时滚动容器的子元素就可以得到，此时我们就可以得到拥有滚动条的滚动容器了。

```js
// packages/fixed-height-scroll/src/index.tsx
// ...
const totalHeight = useMemo(() => itemHeight * list.length, [itemHeight, list.length]);
// ...
<div
  style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
  onScroll={onScroll.run}
  ref={setScroll}
>
  {scroll && (
    <div style={{ height: totalHeight, position: "relative", overflow: "hidden" }}>
      {/* ... */}
    </div>
  )}
</div>
```

那么既然滚动容器已经有了，我们现在就需要关注于我们即将要展示的列表元素，因为我们是存在滚动条且实际有滚动偏移的，所以我们的滚动条位置需要锁定在我们的视口位置上，我们只需要使用`scrollTop / itemHeight`取整即可，并且这里我们使用`translateY`来做整体偏移，使用`translate`还可以触发硬件加速。那么除了列表的整体偏移之外，我们还需要计算出当前视口内的元素数量，这里的计算同样非常简单，因为我们的高度固定了，此时只需要跟滚动容器相除即可，实际上这部分在实例化组件的时候就已经完成了。

```js
useEffect(() => {
  if (!scroll) return void 0;
  setLen(Math.ceil(scroll.clientHeight / itemHeight));
}, [itemHeight, scroll]);

const onScroll = useThrottleFn(
  () => {
    const containerElement = container.current;
    if (!scroll || !containerElement) return void 0;
    const scrollTop = scroll.scrollTop;
    const newIndex = Math.floor(scrollTop / itemHeight);
    containerElement.style.transform = `translateY(${newIndex * itemHeight}px)`;
    setIndex(newIndex);
  },
  { wait: 17 }
);
```

## 不定高度
固定高度的虚拟列表是比较适用于通用的场景的，实际上此处的固定高度不一定是指元素的高度是固定的，而是指元素的高度是可以直接计算得到而不是必须要渲染之后才能得到，例如图片的宽高是可以在上传时保存，然后在渲染时通过图片宽高以及容器宽度计算得到的。然而实际上我们有很多场景下并不台能够完全做到元素的固定高度，例如在线文档场景下的富文本编辑器中，特别是文本块的高度，在不同的字体、浏览器宽度等情况下表现是不同的，我们无法在其渲染之前的到其高度，这就导致了我们无法像图片一样提前计算出其占位高度，从而对于文档块结构的虚拟滚动就必须要解决块高度不固定的问题，由此我们需要实现不定高度的虚拟滚动调度策略来处理这个问题。

### IntersectionObserver占位符
如果我们需要判断元素是否出现在视口当中时，通常会监听`onScroll`事件用来判断元素实际位置，而现如今绝大多数浏览器都提供了`IntersectionObserver`原生对象，用以异步地观察目标元素与其祖先元素或顶级文档视口的交叉状态，这对判断元素是否出现在视口范围非常有用，那么同样的，我们也可以借助`IntersectionObserver`来实现虚拟滚动。

需要注意的是，`IntersectionObserver`对象的应用场景是观察目标元素与视口的交叉状态，而我们的虚拟列表核心概念是不渲染非视口区域的元素，所以这里边实际上出现了一个偏差，在虚拟列表中目标元素都不存在或者说并未渲染，那么此时是无法观察其状态的。所以为了配合`IntersectionObserver`的概念，我们需要渲染实际的占位符，例如`10k`个列表的节点，我们首先就需要渲染`10k`个占位符，实际上这也是一件合理的事，除非我们最开始就注意到列表的性能问题，而实际上大部分都是后期优化页面性能，特别是在复杂的场景下例如文档中，所以假设原本有`1w`条数据，每条数据即使仅渲染`3`个节点，那么此时我们如果仅渲染占位符的情况下还能将原本页面`30k`个节点优化到大概`10k`个节点，这对于性能提升本身也是非常有意义的。

此外，在`https://caniuse.com/?search=IntersectionObserver`可以观察到兼容性还是不错的，在浏览器不支持的情况下可以采用`OnScroll`方案或者考虑使用`polyfill`。那么紧接着，我们来实现这部分内容，首先我们需要生成数据，在这里需要注意的是我们所说的不定高度实际上应该是被称为动态高度，元素的高度是需要我们实际渲染之后才能得到的，在渲染之前我们仅以估算的高度占位，从而能够使滚动容器产生滚动效果。

```js
// packages/indefinite-height-placeholder/src/index.tsx
const LIST = Array.from({ length: 1000 }, (_, i) => {
  const height = Math.floor(Math.random() * 30) + 60;
  return {
    id: i,
    content: (
      <div style={{ height }}>
        {i}-高度:{height}
      </div>
    ),
  };
});
```

接下来我们需要创建`IntersectionObserver`，同样的因为我们的滚动容器可能并不一定是`window`，所以我们需要在滚动容器上创建`IntersectionObserver`，此外通常我们会对视口区域做一层`buffer`，用来提前加载视口外的元素，这样可以避免用户滚动时出现空白区域，这个`buffer`的大小通常选择当前视口高度的一半。

```js
useLayoutEffect(() => {
  if (!scroll) return void 0;
  // 视口阈值 取滚动容器高度的一半
  const margin = scroll.clientHeight / 2;
  const current = new IntersectionObserver(onIntersect, {
    root: scroll,
    rootMargin: `${margin}px 0px`,
  });
  setObserver(current);
  return () => {
    current.disconnect();
  };
}, [onIntersect, scroll]);
```

接下来我们需要对占位节点的状态进行管理，因为我们此时有实际占位，所以就不再需要预估整个容器的高度，而且只需要实际滚动到相关位置将节点渲染即可。我们为节点设置三个状态，`loading`状态即占位状态，此时节点只渲染空的占位符也可以渲染一个`loading`标识，此时我们还不知道这个节点的实际高度；`viewport`状态即为节点真实渲染状态，也就是说节点在逻辑视口内，此时我们可以记录节点的真实高度；`placeholder`状态为渲染后的占位状态，相当于节点从在视口内滚动到了视口外，此时节点的高度已经被记录，我们可以将节点的高度设置为真实高度。

```
loading -> viewport <-> placeholder
```

```js
type NodeState = {
  mode: "loading" | "placeholder" | "viewport";
  height: number;
};

public changeStatus = (mode: NodeState["mode"], height: number): void => {
  this.setState({ mode, height: height || this.state.height });
};

render() {
  return (
    <div ref={this.ref} data-state={this.state.mode}>
      {this.state.mode === "loading" && (
        <div style={{ height: this.state.height }}>loading...</div>
      )}
      {this.state.mode === "placeholder" && <div style={{ height: this.state.height }}></div>}
      {this.state.mode === "viewport" && this.props.content}
    </div>
  );
}
```

当然我们的`Observer`的观察同样需要配置，这里需要注意的是`IntersectionObserver`的回调函数只会携带`target`节点信息，我们需要通过节点信息找到我们实际的`Node`来管理节点状态，所以此处我们借助`WeakMap`来建立元素到节点的关系，从而方便我们处理。

```js
export const ELEMENT_TO_NODE = new WeakMap<Element, Node>();
componentDidMount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.set(el, this);
  this.observer.observe(el);
}

componentWillUnmount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.delete(el);
  this.observer.unobserve(el);
}
```

最后就是实际滚动调度了，当节点出现在视口时我们需要根据`ELEMENT_TO_NODE`获取节点信息，然后根据当前视口信息来设置状态，如果当前节点是进入视口的状态我们就将节点状态设置为`viewport`，如果此时是出视口的状态则需要二次判断当前状态，如果不是初始的`loading`状态则可以直接将高度与`placeholder`设置到节点状态上，此时节点的高度就是实际高度。

```js
const onIntersect = useMemoizedFn((entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    const node = ELEMENT_TO_NODE.get(entry.target);
    if (!node) {
      console.warn("Node Not Found", entry.target);
      return void 0;
    }
    const rect = entry.boundingClientRect;
    if (entry.isIntersecting || entry.intersectionRatio > 0) {
      // 进入视口
      node.changeStatus("viewport", rect.height);
    } else {
      // 脱离视口
      if (node.state.mode !== "loading") {
        node.changeStatus("placeholder", rect.height);
      }
    }
  });
});
```

### IntersectionObserver虚拟化

### OnScroll滚动事件监听


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/7232856799170805820
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
https://arco.design/react/components/list#%E6%97%A0%E9%99%90%E9%95%BF%E5%88%97%E8%A1%A8
```
