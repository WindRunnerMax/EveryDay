# 基于Chrome扩展的浏览器事件
`Chrome`扩展是一种可以在浏览器中添加新功能和修改浏览器行为的软件程序，我们可以基于`Manifest`规范的`API`实现对于浏览器和`Web`页面在一定程度上的修改，例如广告拦截、代理控制等。`Chrome DevTools Protocol`则是`Chrome`浏览器提供的一套与浏览器进行交互的`API`，我们可以基于`DevTools`协议控制`Chromium`内核的浏览器进行各种操作，例如操作页面元素、模拟用户交互等。

## 描述
前段时间我们需要实现一个比较复杂的需求，经常做需求的同学都知道，很多功能并不是可以按步就班地实现的，在某些情况下例如要跨部门甚至无法联系合作的情况下，单方面跨系统完成一些事情就可能需要动用不同寻常的方法。当然具体需求的内容不是很方便表达，所以在这里我们就替代为其他方面的需求展开文章的叙述，虽然实现的目的不一样，但是最终想要表达的技术方案是类似的。

因此在这里假设我们的背景变成了另一个故事，前段时间语雀进行了商业化，对于用户文章的数量和分享都做了一些限制，那么此时我们可能希望将现在已经写过的文档内容抽离出来，将其放在`GitHub`或者其他软件中作备份或分享等。那么此时问题来了，熟悉富文本的同学都知道，我们在语雀上存储的文档都是`JSON`文件而不是`MarkDown`等，会存在固定的私有格式，因此我们可能需要对其先进行一遍解析，而调用语雀的`OpenAPI`所需要的`Personal Token`是需要超级会员的，因此我们可能只能走比较常用的`Cookie`以及私有格式的解析方案，或者自动化操作`Puppeteer`模拟导出文档也是可行的。

那么有没有更加通用的方案可以参考，熟悉富文本的同学还知道，由于富文本需要实现`DOM`与选区`MODEL`的映射，因此生成的`DOM`结构通常会比较复杂，而当我们从文档中复制内容到剪贴板时，我们会希望这个结构是更规范化的，以便粘贴到其他平台例如飞书、`Word`等时会有更好的解析。因此我们便可以借助这一点来获取更加通用的方案，毕竟通过`HTML`解析成`MarkDown`等格式社区有很多完善的方法而不需要我们自行解析了，此外由于我们是通过`HTML`来描述内容，对于文档的内容完整性保持的会更好一些，自行解析的情况下可能会由于复杂的嵌套内容需要不断完善解析程序。

当然在这里只是平替了一下需求，前边我们也提到了背景是假设出来的，而由这个背景则延伸出了我们文章要聊的解决方案，如果真的是针对于语雀的这个迁移问题，在批量处理内容的情况下还是自行解析`JSON`会更方便一些。那么我们可以继续沿着提取`HTML`内容的思路处理数据，首先我们需要考虑如何获取这个`HTML`内容，最简单的方案就是我们通过读取`Node.innerHTML`属性来获取`DOM`结构，那么问题来了，在语雀当中有大量的`ne`开头的标签，以及大量的`ne`属性值来表达样式，以简单的文本与加粗为例，其`HTML`内容是这样的，其实语雀还算比较简单的结构，如果是飞书的表达则更加复杂。 

```html
<!-- 语雀 -->
<ne-p id="u5aec73be" data-lake-id="u5aec73be">
  <ne-text id="u1e4a00ce">123</ne-text>
  <ne-text id="ucc026ff4" ne-bold="true">123</ne-text>
  <span class="ne-viewer-b-filler" ne-filler="block"><br></span>
</ne-p>

<!-- 飞书 -->
 <div class="block docx-text-block" data-block-type="text" data-block-id="2" data-record-id="doxcns7E9SHaX2Xft1XweL0Mqwth">
  <div class="text-block-wrapper">
    <div class="text-block">
      <div class="zone-container text-editor non-empty" data-zone-id="2" data-zone-container="*" data-slate-editor="true" contenteditable="true">
        <div class="ace-line" data-node="true" dir="auto">
          <span data-string="true" class=" author-0087753711195911211" data-leaf="true">123</span>
          <span data-string="true" style="font-weight:bold;" class=" author-0087753711195911211" data-leaf="true">123</span>
          <span data-string="true" data-enter="true" data-leaf="true">&ZeroWidthSpace;</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

可以看出来，我们取得这样的`HTML`解析起来相对成本还是比较高的，而如果我们以上述的剪贴板思路，也就是富文本通常会对复制的内容作`Normalize`处理，那么我们可以通过剪贴板事件来获取这个规范化的内容，然后再进行处理`HTML`，这里的`HTML`内容就会规范很多，那么同样也会便于我们处理数据。在这里实际上通常还会有私有类型的数据，这里就是我们选中部分取得的渲染`Fragment`，通常是用来在编辑器内部粘贴处理数据无损化还原使用的，如果对于数据格式非常熟悉的话解析这部分内容也是可以的，只是并没有比较高的通用性。

```html
<!-- 语雀 -->
<div class="lake-content" typography="classic">
  <p id="u5aec73be" class="ne-p" style="margin: 0; padding: 0; min-height: 24px">
    <span class="ne-text">123</span>
    <strong><span class="ne-text">123</span></strong>
  </p>
</div>

<!-- 飞书 -->
<div data-page-id="doxcnTYldMboJldT2Mc2wXfervv6vqc" data-docx-has-block-data="false">
  <div class="ace-line ace-line old-record-id-doxcnsBUassFNud1XwL1vMgth">
    123<strong>123</strong>
  </div>
</div>
```

那么我们就可以继续沿着这个思路，以复制出的的内容为基准解析`HTML`格式解析内容，而实际上说了这么多我们最需要解决的问题是如何自动化提取内容，由此就引出了我们今天要聊的`Chrome`拓展与`Chrome DevTools Protocol`协议，当我们成功解决了内容问题之后，接下来将内容格式转换为其他格式社区就有很多成熟的方案了。文中涉及的相关代码都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/chrome-debugger`中，在这里为了方便处理演示`DEMO`，我们的事件触发全部都是`DOM0`级的事件绑定形式。

## JavaScript事件 
既然我们的目标是自动操作浏览器执行复制操作，那么可供自动化操作的选择有很多例如`Selenium`、`Puppeteer`，都是可以考虑的方案。在这里我们考虑比较轻量的解决方案，不需要安装`WebDriver`等依赖环境，并且可以直接安装在用户本身的浏览器中开箱即用，基于这些考虑则使用`Chrome`扩展来帮我们实现目标是比较好的选择。并且`Chrome`扩展程序可以帮我们在`Web`页面中直接注入脚本，实现相关功能也会更加方便，关于使用扩展程序实现复杂的功能注入可以参考之前的文章，在这里就不重复叙述了。

那么接下来我们就需要考虑一下如何触发页面的`OnCopy`事件，

OnPaste
那么既然都聊到了`OnCopy`的事件，我们同样也需要聊一下`OnPaste`的事件，因为当我们执行了`OnCopy`提取内容之后，这部分内容实际上还是存在于剪贴板之中的，我们还需要将其提取出来。

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
