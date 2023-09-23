# 从零实现的浏览器Web脚本
在之前我们介绍了从零实现`Chrome`扩展，而实际上浏览器级别的扩展整体架构非常复杂，尽管当前有统一规范但不同浏览器的具体实现不尽相同，并且成为开发者并上架`Chrome`应用商店需要支付`5$`的注册费，如果我们只是希望在`Web`页面中进行一些轻量级的脚本编写，使用浏览器扩展级别的能力会显得成本略高，所以在本文我们主要探讨浏览器`Web`级别的轻量级脚本实现。

## 描述
在前边的从零实现`Chrome`扩展中，我们使用了`TS`完成了整个扩展的实现，并且使用`Rspack`作为打包工具来构建应用，那么虽然我们实现轻量级脚本是完全可以直接使用`JS`实现的，但是毕竟随着脚本的能力扩展会变得越来越难以维护，所以同样的在这里我们依旧使用`TS`来构建脚本，并且在构建工具上我们可以选择使用`Rollup`来打包脚本，本文涉及的相关的实现可以参考个人实现的脚本集合`https://github.com/WindrunnerMax/TKScript`。

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

此外，之前我们也提到过脚本管理器的`API`虽然都对`GreaseMonkey`兼容，但实际上各个脚本管理器会出现特有的`API`，这也是比较正常的现象毕竟是不同的脚本管理器，完全实现相同的功能是意义不大的，那么如果我们需要全平台支持的话就需要实现渠道包，这个概念在`Android`开发中是非常常见的，那么每个包都由开发者手写显然是不现实的，使用现代化的构建工具除了方便维护之外，对于渠道包的支持也更加方便，利用环境变量与`TreeShaking`可以轻松地实现渠道包的构建，再配合脚本管理器以及脚本网站的同步功能，就可以实现分发不同渠道的能力。

### Rollup


### Meta

## 实例
`DOM`

### CSS

### Event

### 脚本分发

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://wiki.greasespot.net/Security
https://docs.scriptcat.org/docs/dev/api/
https://en.wikipedia.org/wiki/Greasemonkey
https://wiki.greasespot.net/Metadata_Block
https://juejin.cn/post/6844903977759293448  
https://www.tampermonkey.net/documentation.php
https://wiki.greasespot.net/Greasemonkey_Manual:API
https://learn.scriptcat.org/docs/%E7%AE%80%E4%BB%8B/
http://jixunmoe.github.io/gmDevBook/#/doc/intro/gmScript
```
