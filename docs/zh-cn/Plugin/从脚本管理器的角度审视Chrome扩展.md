# 从脚本管理器的角度审视Chrome扩展

在之前一段时间，我需要借助Chrome扩展来完成一个需求，当时还在使用油猴脚本与浏览器扩展之间调研了一波，而此时恰好我又有一些做的还可以的油猴脚本 [TKScript](https://github.com/WindrunnerMax/TKScript)，相对会比较熟悉脚本管理器的能力，预估是不太能完成需求的，所以趁着这个机会，我又学习了一波浏览器扩展的能力。那么在后来需求的开发过程中，因为有些能力是类似于脚本管理器提供的基础环境，致使我越来越好奇脚本管理器是怎么实现的，而实际上脚本管理器实际上还是一个浏览器扩展，浏览器也并没有给脚本管理器开后门来实现相关能力，而让我疑惑的三个问题是:

1. 脚本管理器为什么能够先于页面的`JS`运行。
2. 脚本管理器是如何能够得到页面`window`对象。
3. 脚本管理器为什么能够无视浏览器的同源策略从而发起跨域的请求。
 
因此，之后调研了一波浏览器扩展能力的开发之后，总结了脚本管理器的核心能力实现，同样也是解答了让我疑惑的这三个问题。

## 描述
不知道大家是否有用过油猴脚本，因为实际上浏览器级别的扩展整体架构非常复杂，尽管当前有统一规范但不同浏览器的具体实现不尽相同，并且成为开发者并上架`Chrome`应用商店需要支付`5$`的注册费，如果我们只是希望在`Web`页面中进行一些轻量级的脚本编写，使用浏览器扩展级别的能力会显得成本略高，所以在没有特殊需求的情况，在浏览器中实现级别的轻量级脚本是很不错的选择。

那么在简单了解了浏览器扩展的开发之后，我们回到开头提出的那三个问题，实际上这三个问题并没有那么独立，而是相辅相成的，为了清晰我们还是将其拆开来看，所以我们在看每个问题的时候都需要假设另一方面的实现。比如在解答第三个为什么能够跨域请求的问题时，我们就需要假设脚本实际是运行在`Inject`环境中的，因为如果脚本是运行在`Background`中的话，那么讨论跨域就没什么意义了。

## document_start
在油猴脚本管理器中有一个非常重要的实现是`@run-at: document-start/document-end/document-idle`，特别是`document-start`，试想一下如果我们能够在页面实际加载的时候就运行我们想执行的`JS`代码的话，岂不是可以对当前的页面“为所欲为了”。虽然我们不能够`Hook`自面量的创建，但是我们总得调用浏览器提供的`API`，只要用`API`的调用，我们就可以想办法来劫持掉函数的调用，从而拿到我们想要的数据，例如可以劫持`Function.prototype.call`函数的调用，而这个函数能够完成很大程度上就需要依赖我这个劫持函数在整个页面是要最先支持的，否则这个函数已经被调用过去了，那么再劫持就没有什么意义了。

```js
Function.prototype.call = function (dynamic, ...args) {
  const context = Object(dynamic) || window;
  const symbol = Symbol();
  context[symbol] = this;
  args.length === 2 && console.log(args);
  try {
    const result = context[symbol](...args);
    delete context[symbol];
    return result;
  } catch (error) {
    console.log("Hook Call Error", error);
    console.log(context, context[symbol], this, dynamic, args);
    return null;
  }
};
```

那么可能我们大家会想这个代码的实现意义在何处，举一个简单的实践，在某某文库中所有的文字都是通过`canvas`渲染的，因为没有`DOM`那么如果我们想获得文档的整篇内容是没有办法直接复制的，所以一个可行的方案是劫持`document.createElement`函数，当创建的元素是`canvas`时我们就可以提前拿到画布的对象，从而拿到`ctx`，而又因为实际绘制文字总归还是要调用`context2DPrototype.fillText`方法的，所以再劫持到这个方法，我们就能将绘制的文字拿出来，紧接着就可以自行创建`DOM`画在别处，想复制就可以复制了。

那么我们回到这个问题的实现上，如果能够保证脚本是最先执行的，那么我们几乎可以做到在语言层面上的任何事情，例如修改`window`对象、`Hook`函数定义、修改原型链、阻止事件等等等等。其本身的能力也是源自于浏览器拓展，而如何将浏览器扩展的这个能力暴露给`Web`页面就是脚本管理器需要考量的问题了。那么我们在这里假设用户脚本是运行在浏览器页面的`Inject Script`而不是`Content Script`，基于这个假设，首先我们大概率会写过动态/异步加载`JS`脚本的实现，类似于下面这种方式:

```js
const loadScriptAsync = (url: string) => {
    return new Promise<Event>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = e => {
            script.remove();
            resolve(e);
        };
        script.onerror = e => {
            script.remove();
            reject(e);
        };
        document.body.appendChild(script);
    });
};
```

那么现在就有一个明显的问题，我们如果在`body`标签构建完成也就是大概在`DOMContentLoaded`时机再加载脚本肯定是达不到`document-start`的目标的，即使是在`head`标签完成之后处理也不行，很多网站都会在`head`内编写部分`JS`资源，在这里加载同样时机已经不合适了，实际上最大的问题还是整个过程是异步的，在整个外部脚本加载完成之前已经有很多`JS`代码在执行了，做不到我们想要的“最先执行”。

那么下载我们就来探究具体的实现，首先是`V2`的扩展，对于整个页面来说，最先加载的必定是`html`这个标签，那么很明显我们只要将脚本在`html`标签级别插入就好了，配合浏览器扩展中`background`的`chrome.tabs.executeScript`动态执行代码以及`Content Script`的`"run_at": "document_start"`建立消息通信确认注入的`tab`，这个方法是不是看起来很简单，但就是这么简单的问题让我思索了很久是如何做到的。

```js
// Content Script --> Background
// Background -> chrome.tabs.executeScript
chrome.tabs.executeScript(sender.tabId, {
  frameId: sender.frameId,
  code: `(function(){
    let temp = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
        temp.setAttribute('type', 'text/javascript');
        temp.innerHTML = "${script.code}";
        temp.className = "injected-js";
        document.documentElement.appendChild(temp);
        temp.remove();
    }())`,
  runAt,
});
```

这个看起来其实已经还不错了，能够基本做到`document-start`，但既然都说了是基本，说明还有些情况会出问题，我们仔细看这个代码的实现，在这里有一个通信也就是`Content Script --> Background`，既然是通信那么就是异步处理的，既然是异步处理就会消耗时间，一旦消耗时间那么用户页面就可能已经执行了大量的代码了，所以这个实现会偶现无法做到`document-start`的情况，也就是实际上是会出现脚本失效的情况。

那么有什么办法解决这个问题呢，在`V2`中我们能够明确知道的是`Content Script`是完全可控的`document-start`，但是`Content Script`并不是`Inject Script`，没有办法访问到页面的`window`对象，也就没有办法实际劫持页面的函数，那么这个问题看起来很复杂，实际上想明白之后解决起来也很简单，我们在原本的`Content Script`的基础上，再引入一个`Content Script`，而这个`Content Script`的代码是完全等同于原本的`Inject Script`，只不过会挂在`window`上，我们可以借助打包工具来完成这件事。

```js
compiler.hooks.emit.tapAsync("WrapperCodePlugin", (compilation, done) => {
  Object.keys(compilation.assets).forEach(key => {
    if (!isChromium && key === process.env.INJECT_FILE + ".js") {
      try {
        const buffer = compilation.assets[key].source();
        let code = buffer.toString("utf-8");
        code = `window.${process.env.INJECT_FILE}=function(){${code}}`;
        compilation.assets[key] = {
          source() {
            return code;
          },
          size() {
            return this.source().length;
          },
        };
      } catch (error) {
        console.log("Parse Inject File Error", error);
      }
    }
  });
  done();
});
```

这段代码表示了我们在同样的`Content Script`的`window`对象上挂了一个随机生成的`key`，而内容就是我们实际想要注入到页面的脚本，但是现在虽然我们能够拿到这个函数了，怎么能够让其在用户页面上执行呢，这里实际上是用到了同样的`document.documentElement.appendChild`创建脚本方法，但是在这里的实现非常非常巧妙，我们通过两个`Content Script`配合`toString`的方式拿到了字符串，并且将其作为代码直接注入到了页面，从而做到了真正的`document-start`。

```js
const fn = window[process.env.INJECT_FILE as unknown as number] as unknown as () => void;
// #IFDEF GECKO
if (fn) {
  const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
  script.setAttribute("type", "text/javascript");
  script.innerText = `;(${fn.toString()})();`;
  document.documentElement.appendChild(script);
  script.onload = () => script.remove();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete window[process.env.INJECT_FILE];
}
// #ENDIF
```

此外我们可能纳闷，为什么脚本管理器框架和用户脚本都是采用这种方式注入的，而在浏览器控制台的`Sources`控制面板下只能看到一个`userscript.html?name=xxxxxx.user.js`却看不到脚本管理器的代码注入，实际上这是因为脚本管理器会在用户脚本的最后部分注入一个类似于`//# sourceURL=chrome.runtime.getURL(xxx.user.js)`的注释，其中这个`sourceURL`会将注释中指定的`URL`作为脚本的源`URL`，并在`Sources`面板中以该`URL`标识和显示该脚本，这对于在调试和追踪代码时非常有用，特别是在加载动态生成的或内联脚本时。

```js
window["xxxxxxxxxxxxx"] = function (context, GM_info) {
  with (context)
    return (() => {
      // ==UserScript==
      // @name       TEST
      // @description       TEST
      // @version    1.0.0
      // @match      http://*/*
      // @match      https://*/*
      // ==/UserScript==

      console.log(window);

      //# sourceURL=chrome-extension://xxxxxx/DEBUG.user.js
    })();
};
```

由于实际上`Chrome`浏览器不再允许`V2`的扩展程序提交，所以我们只能提交`V3`的代码，但是`V3`的代码有着非常严格的`CSP`内容安全策略的限制，可以简单的认为不允许动态地执行代码，所以我们上述的方式就都失效了，于是我们只能写出类似下面的代码。

```js
const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", chrome.runtime.getURL("inject.js"));
document.documentElement.appendChild(script);
script.onload = () => script.remove();
```

虽然看起来我们也是在`Content Script`中立即创建了`Script`标签并且执行代码，而他能够达到我们的`document-start`目标吗，很遗憾答案是不能，在首次打开页面的时候是可以的，但是在之后因为这个脚本实际上是相当于拿到了一个外部的脚本，因此`Chrome`会将这个脚本和页面上其他的页面同样处于一个排队的状态，而其他的脚本会有强缓存在，所以实际表现上是不一定谁会先执行，但是这种不稳定的情况我们是不能够接受的，肯定做不到`document-start`目标。实际上光从这点来看`V3`并不成熟，很多能力的支持都不到位，所以在后来官方也是做出了一些方案来处理这个问题，但是因为我们并没有什么办法决定用户客户端的浏览器版本，所以很多兼容方法还是需要处理的。

```js
if (cross.scripting && cross.scripting.registerContentScripts) {
    logger.info("Register Inject Scripts By Scripting API");
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/registerContentScripts
    cross.scripting
      .registerContentScripts([
        {
          matches: [...URL_MATCH],
          runAt: "document_start",
          world: "MAIN",
          allFrames: true,
          js: [process.env.INJECT_FILE + ".js"],
          id: process.env.INJECT_FILE,
        },
      ])
      .catch(err => {
        logger.warning("Register Inject Scripts Failed", err);
      });
    } else {
    logger.info("Register Inject Scripts By Tabs API");
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
    cross.tabs.onUpdated.addListener((_, changeInfo, tab) => {
      if (changeInfo.status == "loading") {
        const tabId = tab && tab.id;
        const tabURL = tab && tab.url;
        if (tabURL && !URL_MATCH.some(match => new RegExp(match).test(tabURL))) {
          return void 0;
        }
        if (tabId && cross.scripting) {
          cross.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: [process.env.INJECT_FILE + ".js"],
            injectImmediately: true,
          });
        }
      }
    });
}
```

在`Chrome V109`之后支持了`chrome.scripting.registerContentScripts`，`Chrome 111`支持了直接在`Manifest`中声明`world: 'MAIN'`的脚本，但是这其中的兼容性还是需要开发者来做，特别是如果原来的浏览器不支持`world: 'MAIN'`，那么这个脚本是会被当作`Content Script`处理的，关于这点我觉得还是有点难以处理。

在高版本浏览器尚未普及的情况下，我们还是需要根据用户的页面实际情况，在`worker`中判断究竟是采用注册的方式还是直接执行的方式。但是在`worker`中执行就意味着我们必须要申请到`scripting`以及`host permissions`，这就意味着我们的扩展会有更高的权限，通常这样就要在扩展市场触发额外的审核环节。

```js
if (cross.scripting && cross.scripting.registerContentScripts) {
  cross.scripting
    .registerContentScripts([/* ... */]);
} else {
  cross.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    if (changeInfo.status == "loading") {
      cross.scripting.executeScript(/* ... */);
    }
  });
}
```

此外，在`Firefox`如果用户页面存在`CSP`策略的话，这里就会出现额外的问题。网站的`CSP`策略通常会限制`script-src`以及`unsafe-inline`，因此我们上述注入到`Inject Script`的策略就会失效。而直接使用`tabs.executeScript`注入的环境是`Content Script`，因此我们也不能直接通过这个方法注入，顺便提一下上述的`scripting.executeScript`的`World: MAIN`的`Chrome`兼容性也不是特别好。

`scripting.executeScript`这个方法在`Firefox`虽然也可用，但是要`FF 128`才支持`World: MAIN`，那么在这种情况下我们只能通过一些策略来尝试绕过`CSP`的限制，或者采用兜底方案保证部分功能的正常运行。

* 通过`webRequest.onHeadersReceived`修改响应头，阻止`CSP`策略的加载。
  * 由于`CSP`不支持多个`nonce`声明, 但可以配置多个`sha-hash`，因此我们可以在响应头中加入`sha256-${CSP-HASH}`，在编译时计算并替换资源。但是处理不好就会导致问题，例如最初`'self'`是没问题的，但是`'self'+'hash'`就会导致宽松到严格结构问题。
  * 修改响应头的方法虽然有效，但是很容易受到其他扩展的干扰，常见的广告拦截器都会修改响应头，而多个修改`CSP`的扩展同时运行时，浏览器会更倾向于更加严格的模式，实际同样会导致无法正常注入。
  * 在实际的调用过程中只有完全移除，才可以避免扩展的冲突问题。浏览器扩展，例如脚本猫、篡改猴等，匹配到需要运行脚本时，会直接将响应头的`CSP`策略完全移除，暴力猴则会尝试在`Firefox`的情况中读取`nonce`来允许执行脚本。
* 通过`webRequest.onResponseStarted`中读取响应头，读取`CSP`策略加载脚本。
  * 通常`script-src`都会允许部分脚本的执行，例如我们上面提到的`nonce`。那么我们既然不能修改响应头，倒不如仅读取而不阻塞，然后读取到类似`nonce`、`blob`的值，基于这些特征创建脚本标签，然后插入到页面中。
  * 如果最终都匹配不到相关的特征，我们就可以直接在`Content Script`中执行了。在`Content Script`中不会受到`CSP`策略的限制，并且共享`DOM`事件样式等，可以保证部分功能的正常运行。
* 在`Content Script`中通过`wrappedJSObject`检查并兜底执行策略。
  * `wrappedJSObject`是`Firefox`中的一个特性，可以让我们访问到页面的`Inject Script`中的`Window`对象。那么在上述的脚本执行没有成功时，在`window`上不会挂载我们的幂等执行的锁，那么我们就可以得知脚本没有成功执行。
  * 在检查到脚本没有成功执行后，我们就通过`Blob`对象以及`URL.createObjectURL`方法，构造`blob:https://xxx`的同域`URL`，然后通过`script.src`的方式加载脚本。但是这里的问题与上边的问题类似，这会是异步的而不能完全保证`document_start`。
  * 当上述脚本的`onload`后再次检查都无法成功执行后，我们同样只能兜底通过`Content Script`的方式执行脚本，以此保证`DOM`事件与样式部分功能的正常执行，此外在`Content Script`中通过`exportFunction`导出函数到页面也是可选的方案。

```js
cross.webRequest.onResponseStarted.addListener(
  res => {
    if (!res.responseHeaders) return void 0;
    if (res.type !== "main_frame" && res.type !== "sub_frame")  return void 0;
    for (let i = 0; i < res.responseHeaders.length; i++) {
      const responseHeaderName = res.responseHeaders[i].name.toLowerCase();
      if (responseHeaderName !== "content-security-policy") continue;
      const value = res.responseHeaders[i].value || "";
      let code = /* ... */
      const onUpdate = (_: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (changeInfo.status !== "loading") return void 0;
        cross.tabs
          .executeScript(res.tabId, /* ... */)
        cross.tabs.onUpdated.removeListener(onUpdate);
      };
      cross.tabs.onUpdated.addListener(onUpdate, { tabId: res.tabId });
    }
  },
  { urls: URL_MATCH, types: ["main_frame", "sub_frame"] },
  ["responseHeaders"]
);
```

## unsafeWindow
这个问题也是一个非常有意思的点，关于这个问题我还在群里提问过但是当时并没有得到一个答案，那么在这里我们就研究一下，首先我们要明确的是在脚本中是存在两个`window`的，也就是`window`以及`unsafeWindow`两个对象，`window`对象是一个隔离的安全`window`环境，而`unsafeWindow`就是用户页面中的`window`对象。

曾经我很长一段时间都认为这些插件中可以访问的`window`对象实际上是浏览器拓展的`Content Scripts`提供的`window`对象，而`unsafeWindow`是用户页面中的`window`，以至于我用了比较长的时间在探寻如何直接在浏览器拓展中的`Content Scripts`直接获取用户页面的`window`对象，当然最终还是以失败告终，这其中比较有意思的是一个逃逸浏览器拓展的实现，因为在`Content Scripts`与`Inject Scripts`是共用`DOM`的，所以可以通过`DOM`来实现逃逸，当然这个方案早已失效。

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

此外在`FireFox`中还提供了一个`wrappedJSObject`来帮助我们从`Content Scripts`中访问页面的的`window`对象，但是这个特性也有可能因为不安全在未来的版本中被移除。实际上就拿上边这个逃逸方法而言，浏览器也是正在围追堵截这种行为，也就是说我们可以明确的是在`Content Scripts`中是拿不到浏览器页面的`window`对象的。

那么最终我如何确定这两个`window`对象实际上是同一个浏览器环境的`window`呢，主要是之前做到了需要动态渲染`React`组件的需求，突然又意识到了这个问题，所以除了看开源的脚本管理器源码之外我们也可以通过以下的代码来验证脚本在浏览器的效果，可以看出我们对于`window`的修改实际上是会同步到`unsafeWindow`上，证明实际上是同一个引用。

```js
unsafeWindow.name = "111111";
console.log(window === unsafeWindow); // false
console.log(window); // Proxy {Symbol(Symbol.toStringTag): 'Window'}
console.log(window.onblur); // null
unsafeWindow.onblur = () => 111;
console.log(unsafeWindow); // Window { ... }
console.log(unsafeWindow.name, window.name); // 111111 111111
console.log(window.onblur); // () => 111
const win = new Function("return this")();
console.log(win === unsafeWindow); // true
```

实际上在这里还利用了`new Function`的逃逸，所以才能够发现这俩实际上是同一个引用，那么问题又来了，既然都是同一个`window`对象，脚本管理器是如何提供的干净的`window`对象的，在这里我们就得聊一个小故事了。试想一下如果我们完全信任用户当前页面的`window`，那么我们可能会直接将`API`挂载到`window`对象上，听起来似乎没有什么问题，但是设想这么一个场景，假如用户访问了一个恶意页面，然后这个网页又恰好被类似`https://*/*`规则匹配到了，那么这个页面就可以获得访问我们的脚本管理器的相关`API`，这相当于是浏览器扩展级别的权限，例如直接获取用户磁盘中的文件内容，并且可以直接将内容跨域发送到恶意服务器，这样的话我们的脚本管理器就会成为一个安全隐患，再比如当前页面已经被`XSS`攻击了，攻击者便可以借助脚本管理器`GM.cookie.get`来获取`HTTP Only`的`Cookie`，并且即使不开启`CORS`也可以轻松将请求发送到服务端。那么显然我们本身是准备使用脚本管理器来`Hook`浏览器的`Web`页面，此时反而却被越权访问了更高级的函数，这显然是不合理的，所以`GreaseMonkey`实现了`XPCNativeWrappers`机制，也可以理解为针对于`window`对象的沙箱环境。

实际上在`@grant none`的情况下，脚本管理器会认为当前的环境是安全的，同样也不存在越权访问的问题了，所以此时访问的`window`就是页面原本的`window`对象。此外，上边我们也提到了验证代码最后两行我们突破了这些扩展的沙盒限制，从而可以在未`@grant unsafeWindow`情况下能够直接访问`unsafeWindow`，当然这并不是什么大问题，因为脚本管理器本身也是提供`unsafeWindow`访问的，而且如果在页面未启用`unsafe-eval`的`CSP`情况下这个例子就失效了。只不过我们也可以想一下其他的方案，是不是直接禁用`Function`函数以及`eval`的执行就可以了，但是很明显即使我们直接禁用了`Function`对象的访问，也同样可以通过构造函数的方式即`(function(){}).constructor`来访问`Function`对象，所以针对于`window`沙箱环境也是需要不断进行攻防的，例如小程序不允许使用`Function`、`eval`、`setTimeout`、`setInterval`来动态执行代码，那么社区就开始有了手写解释器的实现，对于我们这个场景来说，我们甚至可以直接使用`iframe`创建一个`about:blank`的`window`对象作为隔离环境。

那么我们紧接着可以简单地讨论下如何实现沙箱环境隔离，其实在上边的例子中也可以看到直接打印`window`输出的是一个`Proxy`对象，那么在这里我们同样使用`Proxy`来实现简单的沙箱环境，我们需要实现的是对于`window`对象的代理，在这里我们简单一些，我们希望的是所有的操作都在新的对象上，不会操作原本的对象，在取值的时候可以做到首先从我们新的对象取，取不到再去`window`对象上取，写值的时候只会在我们新的对象上操作，在这里我们还用到了`with`操作符，主要是为了将代码的作用域设置到一个特定的对象中，在这里就是我们创建的的`context`，在最终结果中我们可以看到我们对于`window`对象的读操作是正确的，并且写操作都只作用在沙箱环境中。

```js
const context = Object.create(null);
const global = window;
const proxy = new Proxy(context, {
    // `Proxy`使用`in`操作符号判断是否存在属性
    has: () => true,
    // 写入属性作用到`context`上
    set: (target, prop, value) => {
        target[prop] = value;
        return true;
    },
    // 特判特殊属性与方法 读取属性依次读`context`、`window`
    get: (target, prop) => {
        switch (prop) {
            // 重写特殊属性指向
            case "globalThis":
            case "window":
            case "parent":
            case "self":
                return proxy;
            default:
                if (prop in target) {
                    return target[prop];
                }
                const value = global[prop];
                // `alert`、`setTimeout`等方法作用域必须在`window`下
                if (typeof value === "function" && !value.prototype) {
                    return value.bind(global);
                }
                return value;
        }
    },
});

window.name = "111";
with (proxy) {
    console.log(window.name); // 111
    window.name = "222";
    console.log(name); // 222
    console.log(window.name); // 222
}
console.log(window.name); // 111
console.log(context); // { name: '222' }
```

此外即使我们完成了沙箱环境的构建，但是如何将这个对象传递给用户脚本，我们不能将这些变量暴露给网站本身，但是又需要将相关的变量传递给脚本，而脚本本身就是运行在用户页面上的，否则我们没有办法访问用户页面的`window`对象，所以接下来我们就来讨论如何保证我们的高级方法安全地传递到用户脚本的问题。实际上在上边的`source-map`我们也可以明显地看出来，我们可以直接借助闭包以及`with`访问变量即可，并且在这里还需要注意`this`的问题，所以在调用该函数的时候通过如下方式调用即可将当前作用域的变量作为传递给脚本执行。

```js
script.apply(proxyContent, [ proxyContent, GM_info ]);
```

那么现在到目前为止我们使用`Proxy`实现了`window`对象隔离的沙箱环境，总结起来我们的目标是实现一个干净的`window`沙箱环境，也就是说我们希望网站本身执行的任何不会影响到我们的`window`对象，比如网站本体在`window`上挂载了`$$`对象，我们本身不希望其能直接在开发者的脚本中访问到这个对象，我们的沙箱环境是完全隔离的，而用户脚本管理器的目标则是不同的，比如用户需要在`window`上挂载事件，那么我们就应该将这个事件处理函数挂载到原本的`window`对象上，那么我们就需要区分读或者写的属性是原本`window`上的还是`Web`页面新写入的属性，显然如果想解决这个问题就要在用户脚本执行之前将原本`window`对象上的`key`记录副本，相当于以白名单的形式操作沙箱。同样的相辅相成的，如果想要做到`window`沙箱那么就必须保证扩展的`Inject Script`是最先执行的也就是`document-start`，否则就很难保证用户原本是不是在`window`对象上挂载了内容，导致污染了沙箱环境。


## xmlHttpRequest
接着我们来聊最后一个问题，脚本管理器是如何做到的可以跨域请求，实际上因为在前边我们明确了用户脚本是在浏览器当前的页面执行的，那么理所当然的就会存在同源策略的问题，然后在脚本管理器中只要声明了链接的域名，就可以逃脱这个限制，这又是一件很神奇的事情。

那么解决这个问题的方式也比较简单，很明显在这里发起的通信并不是直接从页面的`window`发起的，而是从浏览器扩展发出去的，所以在这里我们就需要讨论如何做到在用户页面与浏览器扩展之间进行通信的问题。在`Content Script`中的`DOM`和事件流是与`Inject Script`共享的，那么实际上我们就可以有两种方式实现通信，首先我们常用的方法是`window.addEventListener + window.postMessage`，只不过这种方式很明显的一个问题是在`Web`页面中也可以收到我们的消息，即使我们可以生成一些随机的`token`来验证消息的来源，但是这个方式毕竟能够非常简单地被页面本身截获不够安全，所以在这里通常是用的另一种方式，即`document.addEventListener + document.dispatchEvent + CustomEvent`自定义事件的方式，在这里我们需要注意的是事件名要随机，通过在注入框架时于`background`生成唯一的随机事件名，之后在`Content Script`与`Inject Script`都使用该事件名通信，就可以防止用户截获方法调用时产生的消息了。

```js
// Content Script
document.addEventListener("xxxxxxxxxxxxx" + "content", e => {
    console.log("From Inject Script", e.detail);
});

// Inject Script
document.addEventListener("xxxxxxxxxxxxx" + "inject", e => {
    console.log("From Content Script", e.detail);
});

// Inject Script
document.dispatchEvent(
    new CustomEvent("xxxxxxxxxxxxx" + "content", {
        detail: { message: "call api" },
    }),
);

// Content Script
document.dispatchEvent(
    new CustomEvent("xxxxxxxxxxxxx" + "inject", {
        detail: { message: "return value" },
    }),
);
```

只不过因为这边涉及到的通信会比较多，通过`Content Script`中转来将消息发送到`Background/Worker`来最终实现的请求，实际控制起来还是有些麻烦的，需要比较好的设计来处理各个模块的通信与事件触发。


## 总结
最终在这里我们可能已经明确了浏览器扩展的一些非常`Hack`能力的实现，同时可能也会发现浏览器扩展的权限是真的非常高，在`V2`版本中甚至连`HTTP Only`的`Cookie`都可以拿到，在`V3`中限制就多了起来，但是整体的权限还是非常高的，所以在选择浏览器扩展时还是需要谨慎，要不就选择用户比较多的，要不就选择开源的。不过之前类似`EDGE`扩展的事件还是不容易避免，简单来说就是`EDGE`开放了扩展，然后有些不怀好意的人将开源的扩展封装了广告代码然后提交到扩展市场，最终使用拓展的我们还是要关注一下这些问题的，最后提供一些脚本管理器可以参考学习。

* [GreaseMonkey](https://github.com/greasemonkey/greasemonkey): 俗称油猴，最早的用户脚本管理器，为`Firefox`提供扩展能力，采用`MIT license`协议。
* [TamperMonkey](https://github.com/Tampermonkey/tampermonkey): 俗称篡改猴，最受欢迎的用户脚本管理器，能够为当前主流浏览器提供扩展能力，开源版本(`2.9`版本前)采用`GPL-3.0 license`协议。
* [ViolentMonkey](https://github.com/violentmonkey/violentmonkey): 俗称暴力猴，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用`MIT license`协议。
* [ScriptCat](https://github.com/scriptscat/scriptcat): 俗称脚本猫，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用` GPL-3.0 license`协议。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/scriptscat/scriptcat>
- <https://github.com/greasemonkey/greasemonkey>
- <https://github.com/Tampermonkey/tampermonkey>
- <https://github.com/violentmonkey/violentmonkey>
- <https://reorx.com/blog/understanding-chrome-manifest-v3/>
- <https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions>

