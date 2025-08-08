# 从零实现的浏览器Web脚本
在之前我们介绍了从零实现`Chrome`扩展，而实际上浏览器级别的扩展整体架构非常复杂，尽管当前有统一规范但不同浏览器的具体实现不尽相同，并且成为开发者并上架`Chrome`应用商店需要支付`5$`的注册费，如果我们只是希望在`Web`页面中进行一些轻量级的脚本编写，使用浏览器扩展级别的能力会显得成本略高，所以在本文我们主要探讨浏览器`Web`级别的轻量级脚本实现。

## 概述
在前边的从零实现`Chrome`扩展中，我们使用了`TS`完成了整个扩展的实现，并且使用`Rspack`作为打包工具来构建应用，那么虽然我们实现轻量级脚本是完全可以直接使用`JS`实现的，但是毕竟随着脚本的能力扩展会变得越来越难以维护，所以同样的在这里我们依旧使用`TS`来构建脚本，并且在构建工具上我们可以选择使用`Rollup`来打包脚本，本文涉及的相关的实现可以参考个人实现的脚本集合`https://github.com/WindRunnerMax/TKScript`。

当然浏览器是不支持我们直接编写`Web`级别脚本的，所以我们需要一个运行脚本的基准环境，当前有很多开源的脚本管理器: 

* [GreaseMonkey](https://github.com/greasemonkey/greasemonkey): 俗称油猴，最早的用户脚本管理器，为`Firefox`提供扩展能力，采用`MIT license`协议。
* [TamperMonkey](https://github.com/Tampermonkey/tampermonkey): 俗称篡改猴，最受欢迎的用户脚本管理器，能够为当前主流浏览器提供扩展能力，开源版本采用`GPL-3.0 license`协议。
* [ViolentMonkey](https://github.com/violentmonkey/violentmonkey): 俗称暴力猴，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用`MIT license`协议。
* [ScriptCat](https://github.com/scriptscat/scriptcat): 俗称脚本猫，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用` GPL-3.0 license`协议。

此外还有很多脚本集合网站，可以用来分享脚本，例如[GreasyFork](https://greasyfork.org/zh-CN/scripts)。在之前我们提到过，在研究浏览器扩展能力之后，可以发现扩展的权限实在是太高了，那么同样的脚本管理器实际上也是通过浏览器扩展来实现的，选择可信的浏览器扩展也是很重要的，例如在上边提到的`TamperMonkey`在早期的版本是开源的，但是在`18`年之后仓库就不再继续更新了，也就是说当前的`TamperMonkey`实际上是一个闭源的扩展，虽然上架谷歌扩展是会有一定的审核，但是毕竟是闭源的，开源对于类似用户脚本管理器这类高级用户工具来说是一个建立信任的信号，所以在选择管理器时也是需要参考的。

脚本管理器实际上依然是基于浏览器扩展来实现的，通过封装浏览器扩展的能力，将部分能力以`API`的形式暴露出来，并且提供给用户脚本权限来应用这些`API`能力，实际上这其中涉及到很多非常有意思的实现，例如脚本中可以访问的`window`与`unsafeWindow`，那么如何实现一个完全隔离的`window`沙箱环境就值的探索，再比如在`Web`页面中是无法跨域访问资源的，如何实现在`Inject Script`中跨域访问资源的`CustomEvent`通信机制也可以研究一下，以及如何使用`createElementNS`在`HTML`级别实现`Runtime`以及`Script`注入、脚本代码组装后`//# sourceURL`的作用等等，所以如果有兴趣的同学可以研究下`ScriptCat`，这是国内的同学开发的脚本管理器，注释都是中文会比较容易阅读。那么本文还是主要关注于应用，我们从最基本的`UserScript`脚本相关能力，到使用`Rollup`来构建脚本，再通过实例来探索脚本的实现来展开本文的讨论。

## UserScript
在最初`GreaseMonkey`油猴实现脚本管理器时，是以`UserScript`作为脚本的`MetaData`也就是元数据块描述，并且还以`GM.`开头提供了诸多高级的`API`使用，例如可跨域的`GM.xmlHttpRequest`，实际上相当于实现了一整套规范，而后期开发的脚本管理器大都会遵循或者兼容这套规范，以便复用相关的生态。其实对于开发者来说这也是个麻烦事，因为我们没有办法控制用户安装的浏览器扩展，而我们的脚本如果用到了某一个扩展单独实现的`API`，那么就会导致脚本在其他扩展中无法使用，特别是将脚本放在脚本平台上之后，没有办法构建渠道包去分发，所以平时还是尽量使用各大扩展都支持的`Meta`与`API`来开发，避免不必要的麻烦。

此外在很久之前我一直好奇在`GreasyFork`上是如何实现用户脚本的安装的，因为实际上我并没有在那个安装脚本的按钮之后发现什么特殊的事件处理，以及如何检测到当前已经安装脚本管理器并且实现通信的，之后简单研究了下发现实际上只要用户脚本是以`.user.js`结尾的文件，就会自动触发脚本管理器的脚本安装功能，并且能够自动记录脚本安装来源，以便在打开浏览器时检查脚本更新，同样的后期这些脚本管理器依然会遵循这套规范，既然我们了解到了脚本的安装原理，在后边实例一节中我会介绍下我个人进行脚本分发的最佳实践。那么在本节，我们主要介绍常见的`Meta`以及`API`的使用，一个脚本的整体概览可以参考`https://github.com/WindrunnerMax/TKScript/blob/gh-pages/copy-currency.user.js`。

### Meta
元数据是以固定的格式存在的，主要目的是便于脚本管理器能够解析相关属性比如名字和匹配的站点等，每一条属性必须使用双斜杠`//`开头，不得使用块注释`/* */`，与此同时，所有的脚本元数据必须放置于`// ==UserScript==`和`// ==/UserScript==`之间才会被认定为有效的元数据，即必须按照以下格式填写:

```js
// ==UserScript==
// @属性名 属性值
// ==/UserScript==
```

常用的属性如下所示:

* `@name`: 脚本的名字，在`@namespace`级别的脚本的唯一标识符，可以设置语言，例如`// @name:zh-CN 文本选中复制(通用)`。
* `@author`: 脚本的作者，例如`// @author Czy`。
* `@license`: 脚本的许可证，例如`// @license MIT License`。
* `@description`: 脚本功能的描述，在安装脚本时会在管理对话框中呈现给用户，同样可以设置语言，例如`// @description:zh-CN 通用版本的网站复制能力支持`。
* `@namespace`: 脚本的命名空间，用于区分脚本的唯一标识符，例如`// @namespace https://github.com/WindrunnerMax/TKScript`。
* `@version`: 脚本的版本号，脚本管理器启动时通常会对比改字段决定是否下载更新，例如`// @version 1.1.2`。
* `@updateURL`: 检查更新地址，在检查更新时会首先访问该地址，来对比`@version`字段来决定是否更新，该地址应只包含元数据而不包含脚本内容。
* `@downloadURL`: 脚本更新地址(`https`协议)，在检查`@updateURL`后需要更新时，则会请求改地址获取最新的脚本，若未指定该字段则使用安装脚本地址。
* `@include`: 可以使用`*`表示任意字符，支持标准正则表达式对象，脚本中可以有任意数量的`@include`规则，例如`// @include http://www.example.org/*.bar`
* `@exclude`: 可以使用`*`表示任意字符，支持标准正则表达式对象，同样支持任意数量的规则且`@exclude`的匹配权限比`@include`要高，例如`// @exclude /^https?://www\.example\.com/.*$/`。
* `@match`: 更加严格的匹配模式，根据`Chrome`的[Match Patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns)规则来匹配，例如`// @match *://*.google.com/foo*bar`。
* `@icon`: 脚本管理界面显示的图标，几乎任何图像都可以使用，但`32x32`像素大小是最合适的资源大小。
* `@resource`: 在安装脚本时，每个`@resource`都会下载一次，并与脚本一起存储在用户的硬盘上，这些资源可以分别通过`GM_getResourceText`和`GM_getResourceURL`访问，例如`// @resource name https://xxx/xxx.png`。
* `@require`: 脚本所依赖的其他脚本，通常为可以提供全局对象的库，例如引用`jQuery`则使用`// @require https://cdn.staticfile.org/jquery/3.7.1/jquery.min.js`。
* `@run-at`: 用于指定脚本执行的时机，可用的参数只能为`document-start`页面加载前、`document-end`页面加载后资源加载前、`document-idle`页面与资源加载后，默认值为`document-end`。
* `@noframes`: 当存在时，该命令会限制脚本的执行。该脚本将仅在顶级文档中运行，而不会在嵌套框架中运行，不需要任何参数，默认情况下此功能处于关闭状态即允许脚本在`iframe`中运行。
* `@grant`: 脚本所需要的权限，例如`unsafeWindow`，`GM.setValue`，`GM.xmlHttpRequest`等，如果没有指定`@grant`则默认为`none`，即不需要任何权限。

### API

`API`是脚本管理器提供用来增强脚本功能的对象，通过这些脚本我们可以实现针对于`Web`页面更加高级的能力，例如跨域请求、修改页面布局、数据存储、通知能力、剪贴板等等，甚至于在`Beta`版的`TamperMonkey`中，还有着允许用户脚本读写`HTTP Only`的`Cookie`的能力。同样的，使用`API`也有着固定的格式，在使用之前必须要在`Meta`中声明相关的权限，以便脚本将相关函数动态注入，否则会导致脚本无法正常运行，此外还需要注意的是相关函数的命名可能不同，在使用时还需要参考相关文档。

```js
// ==UserScript==
// @grant unsafeWindow
// ==/UserScript==
```

* `GM.info`: 获取当前脚本的元数据以及脚本管理器的相关信息。
* `GM.setValue(name: string, value: string | number | boolean): Promise<void>`: 用于写入数据并储存，数据通常会存储在脚本管理器本体维护的`IndexDB`中。
* `GM.getValue(name: string, default?: T): : Promise<string | number | boolean | T | undefined>`: 用于获取脚本之前使用`GM.setValue`赋值储存的数据。
* `GM.deleteValue(name: string): Promise<void>`: 用于删除之前使用`GM.setValue`赋值储存的数据。
* `GM.getResourceUrl(name: string): Promise<string>`: 用于获取之前使用`@resource`声明的资源地址。
* `GM.notification(text: string, title?: string, image?: string, onclick?: () => void): Promise<void>`: 用于调用系统级能力的窗口通知。
* `GM.openInTab(url: string, open_in_background?: boolean )`: 用于在新选项卡中打开指定的`URL`。
* `GM.registerMenuCommand(name: string, onclick: () => void, accessKey?: string): void`: 用于在脚本管理器的菜单中添加一个菜单项。
* `GM.setClipboard(text: string): void`: 用于将指定的文本数据写入剪贴板。
* `GM.xmlHttpRequest(options: { method?: string, url: string, headers?: Record<string, string>, onload?: (response: { status: number; responseText: string , ... }) => void , ... })`: 用于与标准`XMLHttpRequest`对象类似的发起请求的功能，但允许这些请求跨越同源策略。
* `unsafeWindow`: 用于访问页面原始的`window`对象，在脚本中直接访问的`window`对象是经过脚本管理器封装过的沙箱环境。

单看这些常用的`API`其实并不好玩，特别是其中很多能力我们也可以直接换种思路借助脚本来实现，当然有一些例如`unsafeWindow`和`GM.xmlHttpRequest`我们必须要借助脚本管理器的`API`来完成。那么在这里我们还可以聊一下脚本管理器中非常有意思的实现方案，首先是`unsafeWindow`这个非常特殊的`API`，试想一下如果我们完全信任用户当前页面的`window`，那么我们可能会直接将`API`挂载到`window`对象上，听起来似乎没有什么问题，但是设想这么一个场景，假如用户访问了一个恶意页面，然后这个网页又恰好被类似`https://*/*`规则匹配到了，那么这个页面就可以获得访问我们的脚本管理器的相关`API`，这相当于是浏览器扩展级别的权限，例如直接获取用户磁盘中的文件内容，并且可以直接将内容跨域发送到恶意服务器，这样的话我们的脚本管理器就会成为一个安全隐患，再比如当前页面已经被`XSS`攻击了，攻击者便可以借助脚本管理器`GM.cookie.get`来获取`HTTP Only`的`Cookie`，并且即使不开启`CORS`也可以轻松将请求发送到服务端。那么显然我们本身是准备使用脚本管理器来`Hook`浏览器的`Web`页面，此时反而却被越权访问了更高级的函数，这显然是不合理的，所以`GreaseMonkey`实现了`XPCNativeWrappers`机制，也可以理解为针对于`window`对象的沙箱环境。

那么我们在隔离的环境中，可以得到`window`对象是一个隔离的安全`window`环境，而`unsafeWindow`就是用户页面中的`window`对象。曾经我很长一段时间都认为这些插件中可以访问的`window`对象实际上是浏览器拓展的`Content Scripts`提供的`window`对象，而`unsafeWindow`是用户页面中的`window`，以至于我用了比较长的时间在探寻如何直接在浏览器拓展中的`Content Scripts`直接获取用户页面的`window`对象，当然最终还是以失败告终，这其中比较有意思的是一个逃逸浏览器拓展的实现，因为在`Content Scripts`与`Inject Scripts`是共用`DOM`的，所以可以通过`DOM`来实现逃逸，当然这个方案早已失效。

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

此外在`FireFox`中还提供了一个`wrappedJSObject`来帮助我们从`Content Scripts`中访问页面的的`window`对象，但是这个特性也有可能因为不安全在未来的版本中被移除。那么为什么现在我们可以知道其实际上是同一个浏览器环境呢，除了看源码之外我们也可以通过以下的代码来验证脚本在浏览器的效果，可以看出我们对于`window`的修改实际上是会同步到`unsafeWindow`上，证明实际上是同一个引用。


```js
unsafeWindow.name = "111111";
console.log(window === unsafeWindow); // false
console.log(window); // Proxy {Symbol(Symbol.toStringTag): 'Window'}
console.log(window.onblur); // null
unsafeWindow.onblur = () => 111;
console.log(unsafeWindow); // Window { ... }
console.log(unsafeWindow.name, window.name); // 111111 111111
console.log(window.onblur === unsafeWindow.onblur); // true
const win = new Function("return this")();
console.log(win === unsafeWindow); // true
```

实际上在`@grant none`的情况下，脚本管理器会认为当前的环境是安全的，同样也不存在越权访问的问题了，所以此时访问的`window`就是页面原本的`window`对象。此外，如果观察仔细的话，我们可以看到上边的验证代码最后两行我们突破了这些扩展的沙盒限制，从而可以在未`@grant unsafeWindow`情况下能够直接访问`unsafeWindow`，当然这并不是什么大问题，因为脚本管理器本身也是提供`unsafeWindow`访问的，而且如果在页面未启用`unsafe-eval`的`CSP`情况下这个例子就失效了。只不过我们也可以想一下其他的方案，是不是直接禁用`Function`函数以及`eval`的执行就可以了，但是很明显即使我们直接禁用了`Function`对象的访问，也同样可以通过构造函数的方式即`(function(){}).constructor`来访问`Function`对象，所以针对于`window`沙箱环境也是需要不断进行攻防的，例如小程序不允许使用`Function`、`eval`、`setTimeout`、`setInterval`来动态执行代码，那么社区就开始有了手写解释器的实现，对于我们这个场景来说，我们甚至可以直接使用`iframe`创建一个`about:blank`的`window`对象作为隔离环境。

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

那么现在到目前为止我们使用`Proxy`实现了`window`对象隔离的沙箱环境，总结起来我们的目标是实现一个干净的`window`沙箱环境，也就是说我们希望网站本身执行的任何不会影响到我们的`window`对象，比如网站本体在`window`上挂载了`$$`对象，我们本身不希望其能直接在开发者的脚本中访问到这个对象，我们的沙箱环境是完全隔离的，而用户脚本管理器的目标则是不同的，比如用户需要在`window`上挂载事件，那么我们就应该将这个事件处理函数挂载到原本的`window`对象上，那么我们就需要区分读或者写的属性是原本`window`上的还是`Web`页面新写入的属性，显然如果想解决这个问题就要在用户脚本执行之前将原本`window`对象上的`key`记录副本，相当于以白名单的形式操作沙箱。由此引出了我们要讨论的下一个问题，如何在`document-start`即页面加载之前执行脚本。

实际上`document-start`是用户脚本管理器中非常重要的实现，如果能够保证脚本是最先执行的，那么我们几乎可以做到在语言层面上的任何事情，例如修改`window`对象、`Hook`函数定义、修改原型链、阻止事件等等等等。当然其本身的能力也是源自于浏览器拓展，而如何将浏览器扩展的这个能力暴露给`Web`页面就是需要考量的问题了。首先我们大概率会写过动态/异步加载`JS`脚本的实现，类似于下面这种方式:

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

那么现在就有一个明显的问题，我们如果在`body`标签构建完成也就是大概在`DOMContentLoaded`时机再加载脚本肯定是达不到`document-start`的目标的，甚至于在`head`标签完成之后处理也不行，很多网站都会在`head`内编写部分`JS`资源，在这里加载同样时机已经不合适了。那么对于整个页面来说，最先加载的必定是`html`这个标签，那么很明显我们只要将脚本在`html`标签级别插入就好了，配合浏览器扩展中`background`的`chrome.tabs.executeScript`动态执行代码以及`content.js`的`"run_at": "document_start"`建立消息通信确认注入的`tab`，这个方法是不是看起来很简单，但就是这么简单的问题让我思索了很久是如何做到的。此外这个方案目前在扩展`V2`中是可以行的，在`V3`中移除了`chrome.tabs.executeScript`，替换为了`chrome.scripting.executeScript`，当前的话使用这个`API`可以完成框架的注入，但是做不到用户脚本的注入，因为无法动态执行代码。

```js
(function () {
    const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
    script.setAttribute("type", "text/javascript");
    script.innerText = "console.log(111);";
    script.className = "injected-js";
    document.documentElement.appendChild(script);
    script.remove();
})();
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

还记得我们最初的问题吗，即使我们完成了沙箱环境的构建，但是如何将这个对象传递给用户脚本，我们不能将这些变量暴露给网站本身，但是又需要将相关的变量传递给脚本，而脚本本身就是运行在用户页面上的，否则我们没有办法访问用户页面的`window`对象，所以接下来我们就来讨论如何保证我们的高级方法安全地传递到用户脚本的问题。实际上在上边的`source-map`我们也可以明显地看出来，我们可以直接借助闭包以及`with`访问变量即可，并且在这里还需要注意`this`的问题，所以在调用该函数的时候通过如下方式调用即可将当前作用域的变量作为传递给脚本执行。

```js
script.apply(proxyContent, [ proxyContent, GM_info ]);
```

我们都知道浏览器会有跨域的限制，但是为什么我们的脚本可以通过`GM.xmlHttpRequest`来实现跨域接口的访问，而且我们之前也提到了脚本是运行在用户页面也就是作为`Inject Script`执行的，所以是会受到跨域访问的限制的。那么解决这个问题的方式也比较简单，很明显在这里发起的通信并不是直接从页面的`window`发起的，而是从浏览器扩展发出去的，所以在这里我们就需要讨论如何做到在用户页面与浏览器扩展之间进行通信的问题。在`Content Script`中的`DOM`和事件流是与`Inject Script`共享的，那么实际上我们就可以有两种方式实现通信，首先我们常用的方法是`window.addEventListener + window.postMessage`，只不过这种方式很明显的一个问题是在`Web`页面中也可以收到我们的消息，即使我们可以生成一些随机的`token`来验证消息的来源，但是这个方式毕竟能够非常简单地被页面本身截获不够安全，所以在这里通常是用的另一种方式，即`document.addEventListener + document.dispatchEvent + CustomEvent`自定义事件的方式，在这里我们需要注意的是事件名要随机，通过在注入框架时于`background`生成唯一的随机事件名，之后在`Content Script`与`Inject Script`都使用该事件名通信，就可以防止用户截获方法调用时产生的消息了。

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

## 脚本构建
在构建`Chrome`扩展的时候我们是使用`Rspack`来完成的，这次我们换个构建工具使用`Rollup`来打包，主要还是`Rspack`更适合打包整体的`Web`应用，而`Rollup`更适合打包工具类库，我们的`Web`脚本是单文件的脚本，相对来说更适合使用`Rollup`来打包，当然如果想使用`Rspack`来体验`Rust`构建工具的打包速度也是没问题的，甚至也可以直接使用`SWC`来完成打包，实际上在这里我并没有使用`Babel`而是使用`ESBuild`来构建的脚本，速度也是非常不错的。

此外，之前我们也提到过脚本管理器的`API`虽然都对`GreaseMonkey`兼容，但实际上各个脚本管理器会出现特有的`API`，这也是比较正常的现象毕竟是不同的脚本管理器，完全实现相同的功能是意义不大的，至于不同浏览器的差异还不太一样，浏览器之间的`API`差异是需要运行时判断的。那么如果我们需要全平台支持的话就需要实现渠道包，这个概念在`Android`开发中是非常常见的，那么每个包都由开发者手写显然是不现实的，使用现代化的构建工具除了方便维护之外，对于渠道包的支持也更加方便，利用环境变量与`TreeShaking`可以轻松地实现渠道包的构建，再配合脚本管理器以及脚本网站的同步功能，就可以实现分发不同渠道的能力。

### Rollup
这一部分比较类似于各种`SDK`的打包，假设在这里我们有多个脚本需要打包，而我们的目标是将每个工程目录打包成单独的包，`Rollup`提供了这种同时打包多个输入输出能力，我们可以直接通过`rollup.config.js`配置一个数组，通过`input`来指定入口文件，通过`output`来指定输出文件，通过`plugins`来指定插件即可，我们输出的包一般需要使用`iife`立执行函数也就是能够自动执行的脚本，适合作为`script`标签这样的输出格式。

```js
[
  {
    input: "./packages/copy/src/index.ts",
    output: {
      file: "./dist/copy.user.js",
      format: "iife",
      name: "CopyModule",
    },
    plugins: [ /* ... */ ],
  },
  // ...
];
```

如果需要使用`@updateURL`来检查更新的话，我们还需要单独打包一个`meta`文件，打包`meta`文件与上边同理，只需要提供一个空白的`blank.js`作为`input`，之后将`meta`数据注入就可以了，这里需要注意的一点是这里的`format`要设置成`es`，因为我们要输出的脚本不能带有自执行函数的`(function () {})();`包裹。

```js
[
  {
    input: "./meta/blank.js",
    output: {
      file: "./dist/meta/copy.meta.js",
      format: "es",
      name: "CopyMeta",
    },
    plugins: [{ /* ... */}],
  },
  // ...
];
```

前边我们也提到了渠道包的问题，那么如果想打包渠道包的话主要有以下几个需要注意的地方：首先是在命令执行的时候，我们要设置好环境变量，例如在这里我设置的环境变量是`process.env.CHANNEL`；其次在打包工具中，我们需要在打包的时候将定义的整个环境变量替换掉，实际上这里也是个非常有意思的事情，虽然我们认为`process`是个变量，但是在打包的时候我们是当字符串处理的，利用`@rollup/plugin-replace`将`process.env.CHANNEL`字符串替换成执行命令的时候设置的环境变量；之后在代码中我们需要定义环境变量的使用，在这里特别要注意的是要写成直接表达式而不是函数的形式，因为如果写成了函数我们就无法触发`TreeShaking`，`TreeShaking`是静态检测的方式，我们需要在代码中明确指明这个表达式的`Boolean`值；最后再通过环境变量来设置文件的输出，最终将所有的文件打包出来即可。


```js
// package.json scripts
// "build:special": "cross-env CHANNEL=SPECIAL rollup -c"

// index.ts
const isSpecialEnv = process.env.CHANNEL === "SPECIAL";
if (isSpecialEnv) {
    console.log("IS IN SPECIAL ENV");
}

// @rollup/plugin-replace
replace({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.CHANNEL": JSON.stringify(process.env.CHANNEL),
    "preventAssignment": true,
})

// rollup.config.js
if(process.env.CHANNEL === "SPECIAL"){
    config.output.file = "./dist/copy.special.user.js";
}
```

此外，我们不能使用`rollup-plugin-terser`等模块去压缩打包的产物，特别是要分发到`GreasyFork`等平台中，因为本身脚本的权限也可以说是非常高的，所以配合代码审查是非常有必要的。同样的也因为类似的原因，类似于`jQuery`这种包我们是不能够直接打包到项目中的，一般是需要作为`external`配合`@require`外部引入的，类似于`GreasyFork`也会采取白名单机制审查外部引入的包。大部分情况下我们需要使用`document-start`去前置执行代码，但是在此时`head`标签是没有完成的，所以在这里还需要特别关注下`CSS`注入的时机，如果脚本是在`document-start`执行的话通常就需要自行注入`CSS`而不能直接使用`rollup-plugin-postcss`的默认注入能力。那么到这里实际上`Rollup`打包这部分并没有特别多需要注意的能力，基本就是我们普通的前端工程化项目，完整的配置可以参考`https://github.com/WindrunnerMax/TKScript/blob/master/rollup.config.js`。

```js
// `Plugins Config` 
const buildConfig = {
    postcss: {
        minimize: true,
        extensions: [".css"],
    },
    esbuild: {
        exclude: [/node_modules/],
        sourceMap: false,
        target: "es2015",
        minify: false,
        charset: "utf8",
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
    },
};

// `Script Config` 
const scriptConfig = [
    {
        name: "Copy",
        meta: {
            input: "./meta/blank.js",
            output: "./dist/meta/copy.meta.js",
            metaFile: "./packages/copy/meta.json",
        },
        script: {
            input: "./packages/copy/src/index.ts",
            output: "./dist/copy.user.js",
            injectCss: false,
        },
    },
    // ...
];


export default [
    // `Meta`
    ...scriptConfig.map(item => ({
        input: item.meta.input,
        output: {
            file: item.meta.output,
            format: "es",
            name: item.name + "Meta",
        },
        plugins: [metablock({ file: item.meta.metaFile })],
    })),
    // `Script`
    ...scriptConfig.map(item => ({
        input: item.script.input,
        output: {
            file: item.script.output,
            format: "iife",
            name: item.name + "Module",
        },
        plugins: [
            postcss({ ...buildConfig.postcss, inject: item.script.injectCss }),
            esbuild(buildConfig.esbuild),
            // terser({ format: { comments: true } }),
            metablock({ file: item.meta.metaFile }),
        ],
    })),
];
```

### Meta
在上边虽然我们完成了主体包的构建，但是似乎我们遗漏了一个大问题，也就是脚本管理器脚本描述`Meta`的生成，幸运的是在这里有`Rollup`的插件可以让我们直接调用，当然实现类似于这种插件的能力本身并不复杂，首先是需要准备一个`meta.json`的文件，在其中使用`json`的形式将各种配置描述出来，之后便可以通过遍历的方式生成字符串，在`Rollup`的钩子函数中讲字符串注入到输出的文件中即可。当然这个包还做了很多事情，例如对于字段格式的检查、输出内容的美化等等。

```js
{
    "name": {
        "default": "🔥🔥🔥文本选中复制(通用)🔥🔥🔥",
        "en": "Text Copy Universal",
        "zh-CN": "🔥🔥🔥文本选中复制(通用)🔥🔥🔥"
      },
    "namespace": "https://github.com/WindrunnerMax/TKScript",
    "version": "1.1.2",
    "description": {
        "default": "文本选中复制通用版本，适用于大多数网站",
        "en": "Text copy general version, suitable for most websites.",
        "zh-CN": "文本选中复制通用版本，适用于大多数网站"
      },
    "author": "Czy",
    "match": [
        "http://*/*",
        "https://*/*"
    ],
    "supportURL": "https://github.com/WindrunnerMax/TKScript/issues",
    "license": "GPL License",
    "installURL": "https://github.com/WindrunnerMax/TKScript",
    "run-at": "document-end",
    "grant": [
        "GM_registerMenuCommand",
        "GM_unregisterMenuCommand",
        "GM_notification"
    ]
}
```

## 实例
那么在这部分我们实现用户脚本的实例，虽然我们平时可能`Ctrl C+V`代码比较多，但是`Ctrl C+V`也不是仅仅用来搞代码的，平时抄作业抄报告也是很需要用到的，尤其是当时我还是学生党的时候，要是不能复制粘贴纯自己写报告那简直要了命。那么问题来了，总有一些网站不想让我们愉快地进行复制粘贴，所以在这里我们来实现解除浏览器复制限制的通用方案，具体代码可以参考`https://github.com/WindrunnerMax/TKScript`文本选中复制-通用这部分。

### CSS
某些网站会会通过`CSS`来禁用复制粘贴，具体表现为文字无法直接选中，特别是很多文库类的网站，例如随便在百度上搜索一下实习报告，那么很多搜出来的网站都是无法复制的，当然我们可以直接使用`F12`看到这部分文本，但是当他是这种嵌套层次很深并且分开展示的数据使用`F12`复制起来还是比较麻烦的，当然可以直接使用`$0.innerText`来获取文本，但是毕竟过于麻烦，不如让我们来看看`CSS`是如何禁用的文本选中能力。

那么平时如果我们写过一些文本类操作的能力，比如富文本`Void`块元素的时候，很容易就可以了解到`use-select`这个`CSS`属性，`user-select`属性用于控制用户是否可以选择文本，这不会对作为浏览器用户界面的一部分的内容加载产生任何影响，除非是在文本框中。

```css
user-select: none; /* 元素及其子元素的文本不可选中 */
user-select: auto; /* 具体取值取决于一系列条件 */
user-select: text; /* 元素及其子元素的文本内容可选中 */
user-select: contain; /* 元素的子元素的文本可选中 但元素本身的文本不可选中 */
user-select: all; /* 元素及其子元素的文本内容可选中 */
```

那么我们在这些网站中检索一下，就可以很明显的看到`user-select: none;`，那么如果想解除这个限制，我们可以很轻松地想到`CSS`的优先级，利用优先级来强行覆盖所有属性的值即可，这也是比较通用的实现方案，可以轻松适配绝大多数利用这种方式禁止复制的页面。

```js
const style = document.createElement("style"); 
style.type = "text/css";
style.innerText = "*{user-select: auto !important; -webkit-user-select: auto !important;}"; 
document.head.appendChild(style);
```

### Event
在大部分时候网站都不仅仅是使用`CSS`来禁止用户复制行为的，特别是使用`Canvas`绘制的内容，当然这种方式不在本文讨论的范围，在这里我们要讨论利用事件来限制用户复制的方式，那么能够影响到用户复制行为的事件主要有`onCopy`、`onSelectStart`事件。`onCopy`事件很明显，我们在触发复制例如使用`Ctrl + C`或者右键复制的时候就会触发，在这里我们只要将其截获就可以做到阻止复制了，同样的`onSelectStart`事件也是，只要阻止其默认行为就可以阻止用户的文本选中，自然也就无法复制了。在这里为了简单直接使用`DOM0`事件，如果在控制输入这段代码就可以发现无法正常复制了。

```js
document.oncopy = event => event.preventDefault();
document.onselectstart = event => event.preventDefault();
```

在研究如何处理这些事件的行为之前，我们先来看一下`getEventListeners`方法，`Chrome`浏览器提供的`getEventListeners`方法来获取所有的事件监听，但是这毕竟是在控制台中才能使用的函数，不具有通用性，只是方便我们调试用。

```js
console.log(getEventListeners(document));
// {
//     click: Array(4), 
//     DOMContentLoaded: Array(3),
//     // ...
// }
```

那么既然不具有通用性，我们为什么要聊这个方法呢，这其中涉及一个问题，对于这些事件监听，如果我们想解除这些事件处理函数，对于`DOM0`级的事件而言，我们只需要将属性设置为`null`即可，但是对于`DOM2`级的事件而言，我们需要使用`removeEventListener`来移除事件处理函数，那么问题来了，使用`removeEventListener`函数我们必须要获取当时`addEventListener`时的函数引用，但是我们并没有保存这个引用，那么我们如何获取这个引用呢，这就是我们讨论的`getEventListeners`方法的作用了，我们可以通过这个方法获取到所有的事件监听，之后再通过`removeEventListener`来移除事件处理函数即可，当然在这里我们只能进行事件判定的调试用，并不能实现一个通用的方案。

```js
const listeners = getEventListeners(document);
Object.keys(listeners).forEach(key => {
    console.log(key);
    listeners[key].forEach(item => {
        document.removeEventListener(item.type, item.listener);
    });
});
```

那么我们是不是可以换个思路，非得移除事件监听是比较钻牛角尖了，俗话说得好，最高端的食物往往只需要最简单的烹饪方式，既然移除不了，我们就不让他执行就完事了，既然不想让他执行，那就很自然的联想到了`JS`的事件流模型，那就给他阻止冒泡呗。

```js
document.body.addEventListener("copy", e => e.stopPropagation()); 
document.body.addEventListener("selectstart", e => e.stopPropagation());
```

看似这个方式是没有问题的，那么假如此时`Web`页面本身监听的事件是在`body`上的话，那么很明显在`document`上去阻止冒泡就已经太晚了，并不能达到效果，所以这就很尴尬，那说明这个方案不够通用。那既然冒泡不行，我们直接在捕获阶段给他干掉就`ok`了，并且配合上脚本管理器的`document-start`来保证我们的事件捕获是最先执行的，这样不光能够解决这类`DOM0`事件的问题，对于`DOM2`级的事件也同样有效果。

```js
document.body.addEventListener("copy", e => e.stopPropagation(), true); 
document.body.addEventListener("selectstart", e => e.stopPropagation(), true);
```

这个方案已经是一个比较通用的复制方案了，我们可以解决大多数网站的限制，但通过直接在捕获阶段拦截事件也是可能有一定的副作用的，例如我们在捕获阶段就阻止了键盘的事件，然后在编辑语雀的文档的时候就会出现问题，因为语雀的文档也跟飞书类似，都是按行处理文本，然后猜测他是阻止了`contenteditable`的默认行为，然后编辑器完全接管了键盘的事件，所以会导致其无法换行和处理快捷启动菜单。同理，如果直接阻止了`onCopy`的冒泡，就可能导致编辑器复制采用了默认行为，而通常编辑器会对于复制文本的格式进行一些处理，所以在有编辑功能的时候还是要慎重，完全作为展览端倒是就问题不大了，整体来说是收益更大。

前一段时间我发现了另一种非常有意思的事情，`onFocus`、`onBlur`事件也可以做到限制用户文本选中，随便找个页面然后将下边的代码在控制台执行，我们可以惊奇地发现，我们无法正常选中文本了。

```js
const button = document.createElement("button");
button.onblur = () => button.focus();
button.textContent = "BUTTON";
document.body.appendChild(button);
button.focus();
```

那么实际上这里的原理也很简单，通常在`HTMLInputElement`、`HTMLSelectElement`、`HTMLTextAreaElement`、`HTMLAnchorElement`、`HTMLButtonElement`等元素会有焦点这个概念，而文本的选中也有焦点这个行为，那么既然焦点不能够同时聚焦在一起，我们就直接强行将焦点聚焦在其他的地方，比如上边的例子就是将焦点强行聚焦在了按钮上，这样因为文本内容无法获取焦点，就无法正常选中了。

那么我们同样可以使用捕获阶段阻止事件执行的方式解决这个问题，分别将`onFocus`、`onBlur`事件处理掉即可，只不过这种方式可能会导致页面的焦点控制出现一些问题，所以在这里我们还有另一种方式，通过在`document-start`执行`MutationObserver`，在发现类似的`DOM`节点的时候直接将其移出，让其无法插入到`DOM`树中自然也就不会有相关问题了，只不过这就不是一个通用的解决方案，通常需要`case by case`地处理才可以。

```js
const handler = mutationsList => {
    for (const mutation of mutationsList) {
        const addedNodes = mutation.addedNodes;
        for (let i = 0; i < addedNodes.length; i++) {
            const target = addedNodes[i];
            if (target.nodeType != 1) return void 0;
            if (
                target instanceof HTMLButtonElement &&
                target.textContent === "BUTTON"
            ) {
                target.remove();
            }
        }
    }
};
const observer = new MutationObserver(handler);
observer.observe(document, { childList: true, subtree: true });
```

### 脚本分发
那么基于上述方式我们完成了脚本的编写与打包，在这里也分享一个脚本分发的最佳实践，`GreasyFork`等脚本网站通常会有源代码同步的能力，我们可以直接填入一个脚本链接就可以自动同步脚本更新，就不需要我们到处填写了，那么这里还有一个问题，这个脚本链接应该从哪里来呢，那么同样我们可以借助`GitHub`的 `GitPages`来生成脚本链接，并且`GitHub`还有`GitAction`可以帮助我们自动构建脚本。

那么整个流程就是这样的，我们首先在`GitHub`配置好`GitAction`，当我们推送代码的时候就可以触发自动构建流程，在构建完成后我们可以将代码自动地推送到`GitPages`，之后我们就可以手动获取`GitPages`的脚本链接并且填入到各个脚本网站了，并且如果打了渠道包也可以分别分发不同的脚本链接，这样就完成了整个流程的自动化，并且借助`GitHub`还可以将`jsDelivr`作为`CDN`使用，下面就是完整的`GitAction`的配置。

```yml
name: publish gh-pages

on:
  push:
    branches:
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false

      - name: install and build
        run: |
          npm install -g pnpm@6.24.3
          pnpm install
          pnpm run build
      - name: deploy
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: gh-pages
          FOLDER: dist
```


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://wiki.greasespot.net/Security>
- <https://docs.scriptcat.org/docs/dev/api/>
- <https://en.wikipedia.org/wiki/Greasemonkey>
- <https://wiki.greasespot.net/Metadata_Block>
- <https://juejin.cn/post/6844903977759293448>
- <https://www.tampermonkey.net/documentation.php>
- <https://wiki.greasespot.net/Greasemonkey_Manual:API>
- <https://learn.scriptcat.org/docs/%E7%AE%80%E4%BB%8B/>
- <http://jixunmoe.github.io/gmDevBook/#/doc/intro/gmScript>
