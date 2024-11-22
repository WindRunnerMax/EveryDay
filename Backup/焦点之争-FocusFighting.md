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
// packages/focus-fighting/src/modules/trap.tsx
import FocusLock from "react-focus-lock@2.13.2";
<input type="text" />
<FocusLock>
  <input type="text" />
  <input type="text" />
  <button>button</button>
</FocusLock>
<input type="text" />
```


受控/非受控管理 focus-trap-react/react-focus-trap

非受控的实现方式 guard

文本元素 焦点 activeElement 对我们后续的研究也很有帮助


## 多焦点区域
焦点陷阱+单焦点元素
Free HOC 原理
多个lock陷阱

## 混合焦点管理
不同版本焦点管理器 
不同焦点管理器混合使用
自行抢占焦点
外部焦点状态检查

## 焦点自动降级
焦点陷阱+单焦点元素 
事件同步执行
异步降级方案


## Iframe 争夺战

iframe 无法得知路径上的 DOM 属性
1. Iframe抢夺主页面焦点
2. 主页面抢夺Iframe焦点

## 参考

```
https://github.com/theKashey/react-focus-lock
https://medium.com/@antonkorzunov/its-a-focus-trap-699a04d66fb5 
https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
https://stackoverflow.com/questions/14572084/keep-tabbing-within-modal-pane-only/38865836
```
