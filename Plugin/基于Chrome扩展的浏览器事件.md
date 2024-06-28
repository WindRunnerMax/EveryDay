# 基于Chrome扩展的浏览器事件
`Chrome`扩展是一种可以在浏览器中添加新功能和修改浏览器行为的软件程序，我们可以基于`Manifest`规范的`API`实现对于浏览器和`Web`页面在一定程度上的修改，例如广告拦截、代理控制等。`Chrome DevTools Protocol`则是`Chrome`浏览器提供的一套与浏览器进行交互的`API`，我们可以基于`DevTools`协议控制`Chromium`内核的浏览器进行各种操作，例如操作页面元素、模拟用户交互等。

## 描述
前段时间我们需要实现一个比较复杂的需求，经常做需求的同学都知道，很多功能并不是可以按步就班地实现的，在某些情况下特别是要跨部门甚至无法联系合作的情况下，单方面跨系统完成一些事情就可能需要动用不同寻常的方法。当然具体需求的内容不是很方便表达，所以在这里我们就替代为别的事情展开文章的叙述，虽然实现的目的不一样，但是最终涉及到的技术方案是类似的。

因此在这里我们的背景变成了另一个故事，前段时间语雀进行了商业化，对于用户文章的数量和分享都做了一些限制，那么此时我们可能希望将现在已经写过的文档内容抽离出来，将其放在`GitHub`或者其他软件中作备份或分享等。那么此时问题来了，熟悉富文本的同学都知道，我们在语雀上存储的文档都是`JSON`文件而不是`MarkDown`等，会存在固定的私有格式，因此我们可能需要对其先进行一遍解析，而语雀的`Personal Token`是需要超级会员的，因此我们可能只能走比较常用的`Cookie`以及私有格式的解析方案。

那么有没有更加同样的方案，熟悉富文本的同学还知道，由于富文本需要实现`DOM`与选区`MODEL`的映射，生成的`DOM`结构会比较复杂，而当我们从文档中复制内容到剪贴板时，我们会希望这个结构是更规范化的，以便粘贴到其他平台比如飞书、`Word`等时会有更好的解析。因此我们便可以借助这一点来获取更加通用的方案，毕竟通过`HTML`解析成`MarkDown`等格式社区有很多完善的方法而不需要我们自行解析了，此外由于我们是通过`HTML`来描述内容，对于文档的内容完整性保持的会更好一些，自行解析的情况下可能会由于复杂的嵌套内容需要不断完善解析程序。

当然在这里只是平替了一下需求，由这个背景延伸出了我们文章要聊的解决方案，如果真的是针对于语雀的这个迁移问题，在批量处理内容的情况下还是自行解析`JSON`会更方便一些。那么我们可以继续沿着提取`HTML`内容的思路处理数据，首先我们需要考虑如何获取这个`HTML`内容，最简单的方案就是我们通过读取`Node.innerHTML`属性来获取`DOM`结构，那么问题来了，

为了方便处理演示`DEMO`，我们的事件触发全部都是`DOM0`级的事件绑定形式。

## JavaScript事件 

OnCopy

OnPaste
那么除了`OnCopy`的事件，我们同样也可以聊一下`OnPaste`的事件

```js
document.onpaste = console.log;
console.log(document.execCommand("paste"));
```

在这`2s`的延时需要我们将焦点移动到`document`上，也就是需要点击`body`中任意元素，当然直接点击`input`也是可行的。实际上在前边我们经过`OnCopy`部分的测试，可以得知在用户主动触发可信事件之后一段时间内的事件都是可信的，但是浏览器的安全策略中还有焦点方面的考量。在某些操作中焦点必须要在`document`上，否则操作不会正常执行，与之对应的异常就是`DOMException: Document is not focused.`，而此时我们的焦点是在控制台`Console`面板上的，这里同样可能存在不可控的问题，因此我们需要延时执行以便转移焦点到`document`上。

```js
const input = document.createElement("input");
input.setAttribute("style", "position:fixed; top:0; right: 0");
document.body.appendChild(input);
setTimeout(() => {
  input.focus();
  console.log(document.execCommand("paste"));
}, 2000);
```

## DevToolsProtocol


OnCopy



那么同样的我们接下来就研究下`OnPaste`事件，那么首先我们并不在权限清单中声明`clipboardRead`权限，紧接着我们延续之前的代码在`debugger`中执行`document.execCommand("paste")`，发现执行的结果是`false`，这表示即使在可信的条件下，执行`paste`仍然是无法取得结果的。那么如果我们在`permissions`中声明了`clipboardRead`，可以发现仍然是`false`，这说明在用户脚本`Inject Script`下执行`document.execCommand("paste")`是无法取得效果的。

```js
chrome.debugger
  .attach({ tabId }, "1.2")
  .then(() =>
    chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
      type: "keyDown",
      // ...
    })
  )
  .then(() => {
    return chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
    expression:
        "document.onpaste = console.log;" + "console.log(document.execCommand('paste'))",
    });
  })
  .finally(() => {
    chrome.debugger.detach({ tabId });
  });
```

那么我们继续保持不在清单中声明`clipboardRead`权限，尝试用`DevToolsProtocol`的方式执行`document.execCommand("paste")`，此时是可以正常触发事件的，这里实际上就表明了通过`CDP`协议直接执行事件是完全以用户主动触发的形式来进行的，其本身就是可信的事件源。

```js
chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
  type: "keyDown",
  modifiers: 4,
  keyCode: 86,
  key: "v",
  code: "KeyV",
  windowsVirtualKeyCode: 86,
  nativeVirtualKeyCode: 86,
  isSystemKey: true,
  commands: ["selectAll"],
});
```

紧接着我们简单更改一下先前在用户态执行的`Js`事件操作，将执行的`copy`命令改为`paste`命令，也就是在`Content Script`执行`document.execCommand("paste")`，此时仍然是会返回`false`。那么别忘了此时我们还没有声明清单中的`clipboardRead`权限，那么当我们声明权限之后，再次执行`document.execCommand("paste")`，发现此时的结果是`true`并且可以正常触发事件。

```js
case PCBridge.REQUEST.COPY_ALL: {
  document.onpaste = console.log;
  console.log(document.execCommand("paste"));
  break;
}
```

而如果我们更进一步，继续保持清单中的`clipboardRead`权限声明，将事件传递到`Inject Script`中执行，可以发现即使是在声明了权限的情况下，`document.execCommand("paste")`返回的结果仍然是`false`且无法触发事件，这也印证了之前我们说的在`Inject Script`下执行`paste`命令是无法正常触发的，进而我们可以明确`clipboardRead`权限是需要我们在`Content Script`中使用的。

```js
// Content Script
case PCBridge.REQUEST.COPY_ALL: {
  document.dispatchEvent(new CustomEvent("custom-event"));
  break;
}

// Inject Script
document.addEventListener("custom-event", () => {
  document.onpaste = console.log;
  console.log(document.execCommand("paste"));
});
```

实际上在现代浏览器中我们还有`navigator.clipboard API`来操作剪贴板，`navigator.clipboard.read`有限的剪贴板内容读取 让用户点击授权在某些情况下可能并不是很现实

```js
setTimeout(() => {
  navigator.clipboard.read().then(res => {
    for (const item of res) {
      const types = item.types;
      for (const type of types) {
        item.getType(type).then(data => {
          const reader = new FileReader();
          reader.readAsText(data, "utf-8");
          reader.onload = () => {
            console.info(type, reader.result);
          };
        });
      }
    }
  });
}, 2000);
```

`text/plain`、`text/html`、`image/png`等常见的

```js
setTimeout(() => {
  navigator.clipboard.read().then(res => {
    for (const item of res) {
      item.getType("application/x-slate-fragment").then(console.log).catch()
    }
  });
}, 2000);
```

```js
const input = document.createElement("input");
input.style.position = "fixed";
input.style.top = "100px";
input.style.right = "10px";
input.style.zIndex = "999999";
input.style.width = "200px";
input.placeholder = "Read Clipboard On Paste";
input.addEventListener("paste", event => {
  const clipboardData = event.clipboardData || window.clipboardData;
  for (const item of clipboardData.items) {
    console.log(`%c${item.type}`, "background-color: #165DFF; color: #fff; padding: 3px 5px;");
    console.log(item.kind === "file" ? item.getAsFile() : clipboardData.getData(item.type));
  }
});
document.body.appendChild(input);
```


## 网页离线PDF导出
在前段时间刷社区的时候发现有不少用户希望能够将网页保存为`PDF`文件，方便作为快照保存以供离线阅读。

图片无法选择 目录大纲



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://chromedevtools.github.io/devtools-protocol/
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
https://developer.chrome.google.cn/docs/extensions/reference/api/debugger?hl=zh-cn
```
