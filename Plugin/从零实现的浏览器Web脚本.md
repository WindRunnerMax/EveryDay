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



在这里我们可以聊一下脚本管理器中非常有意思的实现，首先是`unsafeWindow`这个非常特殊的`API`，试想一下如果我们完全信任用户当前页面的`window`，那么我们可能会直接将`API`挂载到`window`对象上


那么现在到目前为止我们使用`Proxy`实现了`window`对象隔离的沙箱环境，我们的目标是实现一个干净的`window`沙箱环境，也就是说我们希望网站本身执行的`Js`不会影响到我们的`window`对象，比如网站本体在`window`上挂载了`$$`对象，我们本身不希望其能直接在开发者的脚本中访问到这个对象，那么如果想解决这个问题就要在用户脚本执行之前将原本`window`对象上的`key`记录副本，相当于以白名单的形式操作沙箱，由此引出了我们要讨论的下一个问题，如何在`document-start`即页面加载之前执行脚本。


还记得我们最初的问题吗，即使我们完成了沙箱环境的构建，但是如何将这个对象传递给用户脚本，我们不能将这些变量暴露给网站本身，但是又需要将相关的变量传递给脚本，而脚本本身就是运行在用户页面上的，否则我们没有办法访问用户页面的`window`对象，所以接下来我们就来讨论如何保证我们的高级方法安全地传递到用户脚本的问题。闭包访问变量


我们都知道浏览器会有跨域的限制，但是为什么我们的脚本可以通过`GM.xmlHttpRequest`来实现跨域接口的访问，而且我们之前也提到了脚本是运行在用户页面也就是作为`Inject Script`执行的，所以是会受到跨域访问的限制的，所以在这里发起的通信很明显并不是直接从页面的`window`发起的，而是从浏览器扩展发出去的，所以在这里我们就需要讨论如何做到在用户页面与浏览器扩展之间进行通信的问题。

## 脚本构建
在构建`Chrome`扩展的时候我们是使用`Rspack`来完成的，这次我们换个构建工具使用`Rollup`来打包，主要还是`Rspack`更适合打包整体的`Web`应用，而`Rollup`更适合打包工具类库，我们的`Web`脚本是单文件的脚本，相对来说更适合使用`Rollup`来打包，当然如果想使用`Rspack`来体验`Rust`构建工具的打包速度也是没问题的，甚至也可以直接使用`SWC`来完成打包，实际上在这里我并没有使用`Babel`而是使用`ESBuild`来构建的脚本，速度也是非常不错的。

此外，渠道包

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
https://en.wikipedia.org/wiki/Greasemonkey
https://wiki.greasespot.net/Metadata_Block
https://www.tampermonkey.net/documentation.php
https://wiki.greasespot.net/Greasemonkey_Manual:API
https://learn.scriptcat.org/docs/%E7%AE%80%E4%BB%8B/
http://jixunmoe.github.io/gmDevBook/#/doc/intro/gmScript
```
