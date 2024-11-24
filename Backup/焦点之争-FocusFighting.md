# 焦点之争-FocusFighting
> The Web is fundamentally designed to work for all people, whatever their hardware, software, language, location, or ability. When the Web meets this goal, it is accessible to people with a diverse range of hearing, movement, sight, and cognitive ability. --- [W3C - Accessibility](https://www.w3.org/mission/accessibility/)

在现代软件开发中，无障碍设计`Accessibility(a11y)`非常重要，在`W3C`使命中的无障碍部分，明确了网络是为所有人服务而设计的，无论他们的硬件、软件、语言、位置或能力如何。`WAI-ARIA`则是`W3C`编写的一项规范，定义了一组可应用于元素的附加`HTML`属性，以提供附加语义并改善缺乏的可访问性，而我们在`DOM`节点中经常见到的`aria-xxx`、`role`属性就是基于这里的规范定义。

在这里我们主要聊的则是`WAI-ARIA`中的 [Dialog Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)，而在这里如果我们仅仅加入`role="dialog"`并不足以满足`Dialog Accessible`。而在`MDN`中解释了我们必须做什么，但却没有解释如何做，因此我们必须要主动完成下面两个要求:

* 对话框必须被正确标记: 每个对话框都需要有一个清晰易懂的标签，例如标题等，以便屏幕阅读器等辅助技术能够识别和传达对话框的内容。
* 键盘焦点必须被正确管理: 当一个对话框出现时，键盘焦点应自动移动到对话框内的第一个可交互元素，以便使用键盘而非鼠标的用户能够直接与对话框内的内容进行交互。当关闭对话框时，键盘焦点应返回到触发对话框显示的元素，确保用户可以继续他们之前的操作。

那么我们主要关注于在键盘的焦点管理部分，因此我们必须要用`JavaScript`来主动管理焦点，对于这部分我们可以查到很多开源的实现，例如`react-focus-trap`等。`ArcoDesign`作为国际化的设计体系，在对话框/模态框类的实现中自然也会考虑到这个问题，例如在 [Drawer](https://github.com/arco-design/arco-design/blob/07fc25/components/Drawer/index.tsx#L10) 组件中我们可以看到是使用`react-focus-lock`来实现焦点管理的。

那么在这里我们就以`react-focus-lock`为例，聊一聊在键盘焦点管理实现的过程中，可能存在的焦点抢占`FocusFighting`问题。特别是在微前端场景中，子应用无法由主应用完全控制的情况下，则更容易出现这个现象。


## 奇怪的复制问题
在聊焦点抢占问题之前，我们先来看一下早些时间在知乎的遇到的奇怪现象，也是与焦点有关的一件有趣的事情。在知乎的专栏页面，在未登录的情况下，我们是无法正常选中文本的，那么自然也不不能够正常复制。那么在防止文本选中这个行为中，我们通常能想到的是`user-select`样式属性，以及`select-start`事件来完成。

```html
<div id="$1" style="user-select: none;">123123123</div>
<script>
  $1.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
</script>
```

但是即使我们使用样式优先级覆盖了`user-select`，并且在捕获阻止了`select-start`事件的冒泡以及默认行为，很遗憾我们还是不能正常选中文本。在尝试将文本节点以及所有父节点的相关事件全部在控制台删除之后，依然不能做到正常选中文本，那么干脆我们将所有`DOM`的事件全部移除。注意这里的`getEventListeners`与`queryObjects`一样，只有在`Chrome`控制台才能使用。

```js
const removeAllEventListeners = (element) => {
  const listeners = getEventListeners(element);
  Object.keys(listeners).forEach(event => {
    listeners[event].forEach(listener => {
      element.removeEventListener(event, listener.listener, {
        capture: listener.useCapture,
        once: listener.once,
        passive: listener.passive,
      });
    });
  });
};

const elements = [...document.querySelectorAll("*")];
for (const element of elements) {
  element instanceof HTMLElement && removeAllEventListeners(element);
}
```

在这里我们将所有的事件全部移除之后，可以惊喜地发现我们正常选中文本了。那么明确了处理的方向之后，我们就可以比较轻松地排查出来最终的问题所在。在当前的页面未登录的情况下，右下角会出现一个登录的引导弹窗，而在这个弹窗中的登录按钮是被`react-focus-lock`管理的，此时焦点会被永远抢占到这个登录按钮上，导致我们无法正常选中文本，我们可以轻松地模拟这个问题。

```html
<div>123123123</div>
<button id="$1" autofocus>登录</button>
<script>
  $1.addEventListener("blur", (e) => {
    $1.focus();
  });
</script>
```

不过这是早些年间知乎专栏页面才存在的问题，当前的页面已经不存在这个问题了，估计是被反馈过这个问题并且已经解决了。在这里也简单写一下之前在脚本中解决这个问题的方法，我们只需要使用`MutationObserver`观察`DOM`的节点变化，并且在登录弹窗出现的时候，将其移除即可。

```js
const removeFocalPointModal: MutationCallback = mutationsList => {
  for (const mutation of mutationsList) {
    const addedNodes = mutation.addedNodes;
    // 判断登录弹窗并移除
  }
};
const observer = new MutationObserver(removeFocalPointModal);
observer.observe(document, { childList: true, subtree: true });
```

## 步入焦点陷阱
在`react-focus-lock`中，我们可以在 [DEMO](https://codesandbox.io/p/sandbox/5wmrwlvxv4) 中看到启动焦点工作区锁定的按钮叫做`!ACTIVATE THE TRAP!`，当点击这个按钮后，我们就可以发现此时我们的焦点就无法从工作区域中移出，我们使用`tab`键可以在工作区中移动，也只能在工作区中移动，即使点击外部的按钮/输入框也无法移出工作区。

这就是我们要聊的陷阱`Trap`，`react-focus-lock`抓住了我们的焦点，且让其无法逃离。这个陷阱的描述就非常有意思，当我们在平整的地面上遇到陷阱之后，我们就很难逃离，这与此时我们的焦点行为是一致的。

* 专注任务: 通常情况下，`react-focus-lock`会始终将用户带回到指定组件，因为我们可以将用户锁定在组件内。
* 锁定用户意图: 如果存在适用于无障碍`a11y`的场景，要求锁定用户意图和焦点时，可以实现程序化的焦点管理以及智能返回焦点等。
* 模态对话框: 在模态框中不能使用`Tab`键退出，即不会出现`tab-out`行为。这点主要是指的当我们打开模态框时，即使由于遮罩存在无法点击，但是依然可以使用`tab`键在遮罩后的文本框输入内容。

这个库中导出的组件用起来也很简单，在下面的例子中，`FocusLock`组件外的两个`input`我们没有办法将焦点移动上去，我们的焦点只能在`FocusLock`组件内部的`input`和`button`之间移动。

```js
// packages/focus-fighting/src/modules/focus-trap.tsx
import FocusLock from "react-focus-lock@2.13.2";
<input type="text" />
<FocusLock>
  <input type="text" />
  <input type="text" />
  <button>button</button>
</FocusLock>
<input type="text" />
```

实际上实现相关交互的库也比较容易找到，例如 [focus-trap-react](https://github.com/focus-trap/focus-trap-react) 、[react-focus-trap](https://github.com/vigetlabs/react-focus-trap) 等，那么对于其基本原理我们可以概括为两种:

* 受控模式: 这种方式通过添加全局键盘事件监听，当按下`Tab`键时，将收集所有可聚焦元素并手动将焦点从一个元素移动到另一个元素。这就是完全受控的实现方式，通过模拟键盘事件来完成，例如`focus-trap-react`的实现。
* 非受控模式: 通过添加全局的`focusin`等事件监听，当焦点移动到某个元素时，检查当前焦点元素是否是允许聚焦的工作区域，如果不是的话则将焦点移动到工作区域的第一个元素。这就是非受控的实现方式，通过处理事件副作用来完成，例如`react-focus-trap`的实现。

说起来这跟富文本的受控和非受控输入也比较像，受控输入是通过监听`beforeinput`事件来控制输入的内容，非受控输入则是通过`MutationObserver`来观察`DOM`变化带来的副作用来处理输入的内容。说回焦点问题，我们要重点聊的 [react-focus-lock](https://github.com/theKashey/react-focus-lock) 则同样是非受控模式的实现。

`react-focus-lock`默认模式下的焦点管理会在工作区的两侧增加增加守卫节点，当然工作区也会被包裹一层`data-focus-lock-disabled`节点，而`data-focus-guard`则是重要的守卫节点。当`div`节点被置于`tabindex`属性时，则可以将焦点放置到这个节点上，当焦点移动到守卫节点时，则可以自动将焦点移动到工作区的第一个元素上。

```html
<div style="background: rgb(238, 238, 238); padding: 10px;">
  <span>工作区</span>
  <div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
  <div data-focus-lock-disabled="false">
    <input type="text">
    <input type="text">
    <button>button</button>
  </div>
  <div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
</div>
```

通过守卫节点实现的方式，则让焦点管理这件比较复杂的事情变得相对简单了不少。当然在这里即使不使用守卫节点`react-focus-lock`自然也会有兜底的焦点移动实现，也可以通过`noFocusGuards`属性将其主动关闭，但是将其关闭之后在`iframe`嵌套中可能会存在问题-[Stories](https://github.com/theKashey/react-focus-lock/blob/1ce25b/stories/Jump.js#L70)。

关于管理焦点的方式可以参考下面的流程，这是`react-focus-lock`作者的 [文章](https://medium.com/@antonkorzunov/its-a-focus-trap-699a04d66fb5) 提到的实现思路:

> 1. Remember the last focused item.
> 2. On focusOut:
>    1. find common parent of modal and document.activeElement
>    2. get all tabbable element inside common parent.
>    3. get all tabbable elements inside the Modal
> 3. Find the difference between last focused item and current.
> 4. If diff(current-active)>1 -> return focus to the last node.
> 5. If current < first node -> go to the last-by-order
> 6. If current > last node -> go to the first-by-order
> 7. If first < current < last -> move cursor to the nearest-in-direction

此外需要提到的一点是，现在整个库的流程管理可能并没有这么简单了。在不断的迭代下导致现在查阅 [主要代码](https://github.com/theKashey/react-focus-lock/blob/1ce25b/src/Trap.js#L98) 的部分非常艰难，主要原因是状态转移的逻辑不是很清晰，且我们很难理解这个状态所代表的意义，变量也没有类型声明就更加难以管理其赋值行为，当然这不影响其是对于焦点管理比较好的开源实现。

在这里我们还需要考虑一下究竟哪些元素可以获得焦点，这对于我们后续的研究非常有帮助，特别是涉及到`activeElement`的时候。在 [W3C: focusable-area](https://html.spec.whatwg.org/multipage/interaction.html#focusable-area) 中描述了哪些元素可以获得焦点，这里我们直接从`focus-lock`中取出`tabble`的部分，`focus-lock`是`react-focus-lock`的通用方法依赖，下面列举的节点就是可以被赋值到`document.activeElement`属性的节点。

```js
export var tabbables = [
    'button:enabled',
    'select:enabled',
    'textarea:enabled',
    'input:enabled',
    // elements with explicit roles will also use explicit tabindex
    // '[role="button"]',
    'a[href]',
    'area[href]',
    'summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
    '[tabindex]',
    '[contenteditable]',
    '[autofocus]',
];
```

在这里值的一提的是，在非`contenteditable`的情况下，如果我们选中文本的话，`document.activeElement`通常会是`body`元素。在默认情况下`FocusLock`组件会豁免对于`body`元素的焦点管理，这样我们就可以正常选中文本了。而如果想模拟先前我们提到的知乎专栏的效果，我们只需要将`persistentFocus`属性传入`FocusLock`组件即可，不过我觉得对于用户来说这并不是交互友好的表现。

```js
<FocusLock persistentFocus>
  <input type="text" />
  <input type="text" />
  <button>button</button>
</FocusLock>
```

## 多焦点工作区
那么爱思考的我们自然会想到一个问题，`react-focus-lock`会自动将焦点锁定到使用`<FocusLock />`组件的区域，那么如果页面中存在多个`FocusLock`组件的话，测试下会不会存在焦点抢占的问题。

```js
// src/modules/multi-lock.tsx
<Fragment>
  {new Array(len).fill(null).map((_, index) => (
    <div key={index} style={{ background: "#eee", marginTop: 10, padding: 10 }}>
      <span>工作区 {index}</span>
      <FocusLock>
        <input type="text" />
        <input type="text" />
      </FocusLock>
    </div>
  ))}
  <button onClick={() => setLen(p => p + 1)}>+</button>
  <button onClick={() => setLen(p => Math.max(p - 1, 1))}>-</button>
</Fragment>
```

那么在实际的测试过程中，我们可以发现焦点是会被最新的工作区锁定，需要注意的是这里并不是发生了焦点的战争，焦点是锁定在最新的工作区，而不是两者发起战争进行抢占的死循环。这实际上在`Modal`模态框的场景中是比较合理的，通常情况下我们都是希望在最顶层的模态框中锁定焦点，而当我们关闭最外层的模态框时，焦点会自动回到上一层的模态框中。

我们还可以关注非`<FocusLock />`组件的情况，也就是使用`input`主动设置焦点来进行焦点抢占。当`input`元素失去焦点的时候，我们就主动将焦点强行拉回到这个`input`焦点上，这就是我们要聊的真正的焦点抢占情况。在下面的例子中，当我们点击第`3`个`input`元素的时候(此时没有`auto-focus`)，焦点会被强行在两个`input`之间争夺。

```js
// src/modules/input-focus.tsx
<Fragment>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>工作区 1</span>
    <FocusLock>
      <input type="text" onFocus={() => console.log("Lock input 1")} />
      <input type="text" onFocus={() => console.log("Lock input 2")} />
    </FocusLock>
  </div>
  <input
    ref={ref}
    onBlur={() => setTimeout(() => ref.current?.focus(), 1000)}
    onFocus={() => console.log("Lock input 3")}
  />
</Fragment>
```

那么关于这个问题我们自然是有办法可以解决，并且`react-focus-lock`也直接提供了解决方案来处理。我们可以使用`<FreeFocusInside />`这个`HOC`组件来告诉`lock`组件不要抢夺焦点，其含义是隐藏`FocusLock`的内部结构，允许不受管理的焦点。那么在上述的`multi-lock`例子中，我们可以将`FreeFocusInside`组件引入。

```js
// src/modules/multi-lock-free.tsx
<FocusLock>
  <FreeFocusInside>
    <input type="text" />
    <input type="text" />
  </FreeFocusInside>
</FocusLock>
```

这里需要注意的是，如果`FreeFocusInside`在`FocusLock`外层的话，使用`tab`切换焦点时，由于我们通知了工作区不要抢占焦点，而此时由于先前提到的`guard`节点同样可以放置焦点，因此会导致看起来有次`tab`按键的响应无效。那么将`FreeFocusInside`放置于内层，在这里的表现就发生了变化，在非主焦点内部切换正常，当失去焦点时则会自动回到主工作区焦点内且正常步入陷阱。

那么对于主动的`input`抢占问题，实际上是希望不要抢夺干净的`input`焦点，这里所谓的干净焦点指的是非主动抢夺的焦点情况，而对于上边例子中的焦点抢占情况，则只是不会由`FocusLock`组件来抢占外边的`input`焦点。如果此时焦点在`FocusLock`组件内部的话，还是会被我们的`input`组件抢占，在这里只是避免了两者的混战。

```js
// src/modules/input-focus-free.tsx
<Fragment>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>工作区 1</span>
    <FocusLock>
      <input type="text" onFocus={() => console.log("Lock input 1")} />
      <input type="text" onFocus={() => console.log("Lock input 2")} />
    </FocusLock>
  </div>
  <FreeFocusInside>
    <input
      ref={ref}
      onBlur={() => setTimeout(() => ref.current?.focus(), 1000)}
      onFocus={() => console.log("Lock input 3")}
    />
  </FreeFocusInside>
</Fragment>
```

我们可以看下`FreeFocusInside`的实现，[在这里](https://github.com/theKashey/react-focus-lock/blob/1ce25b/src/FreeFocusInside.js)可以看到其只是简单地增加了`data-no-focus-lock`属性，从`package.json`可以看到`**/sidecar.js, **/index.js`是存在`sideEffects`的，那么也就是说假如直接从`dist/xxx/FreeFocusInside.js`引入的话是无效的，当然因为需要锁定焦点必须要引入`FocusLock`，所以直接引用倒是也不会有问题。

那么这里的事件处理重点实际上是在`Trap.js`中，当发生焦点变动的时候，会进入`isFreeFocus`函数的判断条件，如果是处于`body`不必多说，如果是`focusIsHidden`判断条件则是查找当前所有允许聚焦即`data-no-focus-lock`属性的白名单节点，并且检查目标的`activeElement`节点是否属于白名单节点的子节点，如果是的话则不会抢占焦点。

```js
// https://github.com/theKashey/react-focus-lock/blob/1ce25b/src/Trap.js
const isFreeFocus = () => focusOnBody() || focusIsHidden();

if (!isFreeFocus()) {
  // ...
}

// https://github.com/theKashey/focus-lock/blob/e9025f/src/focusIsHidden.ts
export const focusIsHidden = (inDocument: Document = document): boolean => {
  const activeElement = getActiveElement(inDocument);

  if (!activeElement) {
    return false;
  }

  // this does not support setting FOCUS_ALLOW within shadow dom
  return toArray(inDocument.querySelectorAll(`[${FOCUS_ALLOW}]`)).some((node) => contains(node, activeElement));
};
```

## 混合焦点管理
在同样的`FocusLock`锁定的多个工作区时，只会处理最新的工作区，这里是借助于`SideCar`来实现的。当`FocusLock`组件被挂载/卸载时，就可以触发`SideCar`的`Effect`执行[handleStateChangeOnClient](https://github.com/theKashey/react-focus-lock/blob/1ce25b/src/Trap.js#L277)，此时就可以只处理最新的工作区事件处理。

那么如果存在不同版本焦点管理器来管理多个工作区的话，会发生什么情况。依据我们先前的经验，这里大概率会出现焦点抢夺的情况，因为我们用来标记是否是最新工作区的方法是依赖`SideCar`，而不是某种属性，这种情况下是无法共享状态的。那么事实也确实如此，运行下面的例子后，我们可以看到控制台在不断打印焦点的战争。

```js
// src/modules/workspace-war.tsx
<Fragment>
  <FocusLockV9 autoFocus>
    <span>react-focus-lock@2.9.1</span>
    <input type="text" onFocus={() => console.log("focus input-1")} />
    <input type="text" onFocus={() => console.log("focus input-2")} />
  </FocusLockV9>
  <FocusLockV13 autoFocus>
    <span>react-focus-lock@2.13.2</span>
    <input type="text" onFocus={() => console.log("focus input-3")} />
    <input type="text" onFocus={() => console.log("focus input-4")} />
  </FocusLockV13>
</Fragment>
```

在这里我们的将不同版本的`npm`包引用的方式是借助`npm alias`的能力，在`package.json`中将包名命名为其他的名字，然后在实际构建依赖的时候包内容可以是我们指定的别名了。只不过这种方式可能会存在类型声明的些许问题，我们需要使用`declare module`来主动声明一下才可以。

```js
// package.json
{
  "dependencies": {
    "react-focus-lock@2.13.2": "npm:react-focus-lock@2.13.2",
    "react-focus-lock@2.9.1": "npm:react-focus-lock@2.9.1"
  }
}
```

```js
// src/global.d.ts
declare module "react-focus-lock@2.13.2" {
  import ReactFocusLock from "react-focus-lock@2.13.2/dist/cjs/index.d.ts";
  export * from "react-focus-lock@2.13.2/dist/cjs/index.d.ts";
  export default ReactFocusLock;
}
```

我们还可以再试一下不同焦点管理器混合使用，在这里我们将`react-focus-trap`和`focus-trap-react`同时在页面中引入。这种情况下其实必然会发生焦点抢占的情况，此外实际上我们自行抢占焦点的实现，也算是一种不同焦点管理器的混合使用模式。

```js
// src/modules/multi-lock-tools.tsx
<Fragment>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>react-focus-lock</span>
    <FocusLock>
      <input type="text" onFocus={() => console.log("Lock input 1")} />
    </FocusLock>
  </div>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>focus-trap-react</span>
    <FocusTrapReact>
      <div>
        <input type="text" onFocus={() => console.log("Lock input 2")} />
      </div>
    </FocusTrapReact>
  </div>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>react-focus-trap</span>
    <ReactFocusTrap>
      <input type="text" onFocus={() => console.log("Lock input 3")} />
    </ReactFocusTrap>
  </div>
</Fragment>
```

## 焦点自动降级
在`react-focus-lock`中提到了关于自动降级的问题，也就是发生焦点战争的时候，`FocusLock`会自动降级，使得其他的焦点管理器占据主导，从而避免无限循环的焦点抢占。

> React-Focus-Lock will automatically surrender, letting another library to take the lead.

那么我们就来实际测试一下如何触发焦点自动降级的情况。在下面的例子中我们部署了一个焦点陷阱工作区，以及一个自动抢占焦点的`input`元素，当进入页面时则会因为`autoFocus`的存在触发焦点战争。

```js
// focus-fighting/src/modules/auto-degrade.tsx
<Fragment>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>工作区</span>
    <FocusLock autoFocus>
      <input type="text" onFocus={() => console.log("Lock input 1")} />
      <input type="text" onFocus={() => console.log("Lock input 2")} />
    </FocusLock>
  </div>
  <input
    autoFocus
    ref={ref}
    onBlur={() => ref.current?.focus()}
    onFocus={() => console.log("Lock input 3")}
  />
</Fragment>
```

在这个例子中，我们的表现是可以正常在`input 3`中输入内容，而无法在`input 1/2`中放置焦点，这就是`FocusLock`的自动降级策略。然而实际上这里存在一个问题，如果我们此时打开控制台的话，除了发现会有`FocusLock: focus-fighting detected.`触发的提示外，还会发现控制台的输出是一直不停歇的，也就是说焦点战争还是一直存在的。

那么此时如果我们通过`IME`输入内容例如中文的话，则会发现输入的内容发生了偏差，这就是因为焦点实际还是被不断抢占的，只不过这个过程变成了异步因此看起来是可输入的而已。这其实是个`BUG`，在先前也提到了由于库实现的状态转移太过复杂，且用到了大量的`setTimeout`异步任务，这就导致管理起来更加困难。

这里的主要问题则是由于 [moveFocusInside.ts](https://github.com/theKashey/focus-lock/blob/1b7ece/src/moveFocusInside.ts) 进行了检查，如果触发了焦点锁定则会在延时后的异步任务中将其重设，但是由于在`react-focus-lock`的实现中，其回调函数同样是`1ms`优先级的异步任务，因此造成了状态管理的不确定性。

```js
// https://github.com/theKashey/focus-lock/blob/1b7ece/src/moveFocusInside.ts
if (lockDisabled) {
  return;
}
if (focusable) {
  /** +FOCUS-FIGHTING prevention **/
  if (guardCount > 2) {
    // we have recursive entered back the lock activation
    console.error(
      'FocusLock: focus-fighting detected. Only one focus management system could be active. ' +
        'See https://github.com/theKashey/focus-lock/#focus-fighting'
    );
    lockDisabled = true;
    setTimeout(() => {
      lockDisabled = false;
    }, 1);

    return;
  }
  guardCount++;
  focusOn(focusable.node, options.focusOptions);
  guardCount--;
}
```

针对这个问题顺便提了个`PR`，不过就改了一行代码就不献丑了。其实在这里还有个比较值得关注的事情，我们可以关注`guardCount`这个变量，在最后记录值的时候是连续的`+1`和`-1`，那么如果这段代码是同步执行到底的话，则实际上并没有什么意义。而在`focusOn`中实际上就是同步执行的，也不存在`await`的情况，那么这里只可能是递归的情况下才有效。

```js
// https://github.com/theKashey/focus-lock/blob/1b7ece/src/commands.ts
export const focusOn = (
  target: Element | HTMLFrameElement | HTMLElement | null,
  focusOptions?: FocusOptions | undefined
): void => {
  if (!target) {
    // not clear how, but is possible https://github.com/theKashey/focus-lock/issues/53
    return;
  }
  if ('focus' in target) {
    target.focus(focusOptions);
  }
  if ('contentWindow' in target && target.contentWindow) {
    target.contentWindow.focus();
  }
};
```

那么实际上这里主要的问题是`focus event - move focus - focus on - focus event`的循环，而我们通常认为`focus`作为事件回调应该是异步执行的，而且是[宏任务队列](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks)。那么理论上如果是异步执行的话，那么上述的递归增加`guardCount`的值就不成立了，然而上述的实现在之前测试的过程中是可行的。

实际上如果查阅 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#adding_messages) 的话，单击具有单击事件处理程序的元素将添加一条`Message`，然而有些事件是同步发生的没有消息增加，例如通过`click`方法模拟点击触发回调。那么这样的话，我们就可以理解上述调用`.focus`方法的同步执行，因此可以递归地增加`guardCount`。

```html
<!DOCTYPE html>
<html>
  <body>
    <input id="$1" type="text" />
    <button id="$2">button</button>
  </body>
  <script>
    document.addEventListener("focusin", () => {
      console.log("on document focusin");
    });
    $2.onclick = () => {
      console.log("button click");
      $1.focus();
      console.log("sync or async?");
    };
  </script>
</html>
```

在上述的例子中，如果事件执行是同步的话，则会先执行`focusin`再执行`sync or async`，而如果是异步执行`focus in`的回调，那么这里的执行顺序就应该是`sync or async`在前。当点击按钮后，输出结果则可以明确，通过`.focus()`执行触发的事件回调是同步执行的。

```
on document focusin
button click
on document focusin
sync or async?
```

那么依据这个情况，我们就可以理解上述的检查是在递归的情况下才可以生效的。那么我们可以思考另一个问题，在前边我们是直接通过`onBlur`回调执行了`ref.focus()`，那么如果这个回调是异步的话，那么焦点抢占的情况就会发生了，我们可以测试一下这个问题。此外以`react-focus-lock`为例，事件的触发都是`setTimeout`异步执行的，因此在不同焦点管理器甚至不同版本的情况下也会发生冲突。

在下面的例子中，我们就可以焦点抢占的情况，打开控制台之后可以发现在不断打印内容。此时并没有触发`FocusLock: focus-fighting detected.`的提示，也就是并没有正常检查到抢占行为，且此时的表现与之前的效果并不太一样，焦点此时会在工作区显示，而不是像上述的自动降级情况下焦点会锁在`input`上。

```js
<Fragment>
  <div style={{ background: "#eee", marginTop: 10, padding: 10 }}>
    <span>工作区</span>
    <FocusLock autoFocus>
      <input type="text" onFocus={() => console.log("Lock input 1")} />
      <input type="text" onFocus={() => console.log("Lock input 2")} />
    </FocusLock>
  </div>
  <input
    autoFocus
    ref={ref}
    onBlur={() => setTimeout(() => ref.current?.focus(), 0)}
    onFocus={() => console.log("Lock input 3")}
  />
</Fragment>
```

关于这个问题，我们可能需要一些外部的方案来解决，因为这里并没有很好的办法来处理。我们可以在`window`上添加对于`onBlur`事件的监听，当在`10ms`内触发了多次`onBlur`事件的话，则可以认为是焦点抢占的情况，此时我们可以直接在捕获阶段阻止事件的传播，以此来避免焦点抢占的情况。这里的事件冒泡是观察相关源码得出的结论，不同的库实现也会不一样。

```js
// src/modules/fighting-check.tsx
useEffect(() => {
    let lastRecord: number = 0;
    let execution: number = 0;
    const cb = (e: FocusEvent) => {
      const now = Date.now();
      if (now - lastRecord >= 10) {
        execution = 0;
        lastRecord = now;
      }
      if (execution++ >= 4) {
        console.error("Callback Exec Limit");
        e.stopPropagation();
      }
    };
    document.addEventListener("focusout", cb, true);
    return () => {
      document.removeEventListener("focusout", cb, true);
    };
  }, []);
```

但是在这种情况下我们虽然可以大概检查出存在焦点抢占的情况，但是却难以控制最后的落点，也就是说即使我们点击的是`input 3`，但是焦点可能会落在`input 1/2`上，我们无法准确地控制事件的传。因此我们应该尝试判断焦点的事件源，如果事件是从点击事件触发的，那么我们就避免焦点被抢夺，这样还可以避免`tab`按键的情况被处理。但是这里还没有想好该如何实现，在库外部实现这个方案有点难以控制，事件的触发次数太多导致无法准确感知事件源。

## Iframe 争夺战

iframe 无法得知路径上的 DOM 属性
1. Iframe抢夺主页面焦点
2. 主页面抢夺Iframe焦点

## 参考

```
https://www.w3.org/mission/accessibility/
https://github.com/vigetlabs/react-focus-trap
https://github.com/theKashey/react-focus-lock
https://github.com/focus-trap/focus-trap-react
https://medium.com/@antonkorzunov/its-a-focus-trap-699a04d66fb5 
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
https://html.spec.whatwg.org/multipage/interaction.html#focusable-area
https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
https://stackoverflow.com/questions/14572084/keep-tabbing-within-modal-pane-only/38865836
```
