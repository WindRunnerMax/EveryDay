# 焦点之争-FocusFight
> The Web is fundamentally designed to work for all people, whatever their hardware, software, language, location, or ability. When the Web meets this goal, it is accessible to people with a diverse range of hearing, movement, sight, and cognitive ability. --- [W3C - Accessibility](https://www.w3.org/mission/accessibility/)

在现代软件开发中，无障碍设计`Accessibility`非常重要，在`W3C`使命中的无障碍部分，明确了网络是为所有人服务而设计的，无论他们的硬件、软件、语言、位置或能力如何。`WAI-ARIA`则是`W3C`编写的一项规范，定义了一组可应用于元素的附加`HTML`属性，以提供附加语义并改善缺乏的可访问性，而我们在`DOM`节点中经常见到的`aria-xxx`、`role`属性就是基于这里的规范定义。

在这里我们主要聊的则是`WAI-ARIA`中的 [Dialog Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)，而在这里如果我们仅仅加入`role="dialog"`并不足以满足`Dialog Accessible`，我们必须要完成下面两个要求:

* 对话框必须被正确标记: 每个对话框都需要有一个清晰易懂的标签，例如标题等，以便屏幕阅读器等辅助技术能够识别和传达对话框的内容。
* 键盘焦点必须被正确管理: 当一个对话框出现时，键盘焦点应自动移动到对话框内的第一个可交互元素，以便使用键盘而非鼠标的用户能够直接与对话框内的内容进行交互。当关闭对话框时，键盘焦点应返回到触发对话框显示的元素，确保用户可以继续他们之前的操作。

在键盘的焦点管理部分，我们必须要用`JavaScript`来主动管理焦点，对于这部分我们可以查到很多开源的实现。而`ArcoDesign`作为国际化的设计体系，在对话框/模态框类的实现中自然也会考虑到这个问题，例如在 [Drawer](https://github.com/arco-design/arco-design/blob/07fc25/components/Drawer/index.tsx#L10) 组件中我们可以看到是使用`react-focus-lock`来实现焦点管理的。

那么在这里我们就以`react-focus-lock`为例，聊一聊在键盘焦点管理实现的过程中，可能存在的焦点抢占`FocusFighting`问题。特别是在微前端场景中，子应用无法由主应用完全控制的情况下，则更容易出现这个现象。


## 奇怪的复制问题
在聊焦点抢占问题之前，我们先来看一下之前在知乎的遇到的奇怪现象。在知乎的专栏页面，在未登录的情况下，我们是无法正常选中文本的，那么自然也不不能够正常复制。那么在防止文本选中这个行为中，我们通常能想到的是`user-select`样式属性，以及`select-start`事件来完成。

```js
<div id="$1" style="user-select: none;">123123123</div>
<script>
  $1.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
</script>
```







## 参考

```
https://github.com/theKashey/react-focus-lock
https://medium.com/@antonkorzunov/its-a-focus-trap-699a04d66fb5 
https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
```
