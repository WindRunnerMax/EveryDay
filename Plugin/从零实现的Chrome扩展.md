# 从零实现的Chrome扩展
`Chrome`扩展是一种可以在`Chrome`浏览器中添加新功能和修改浏览器行为的软件程序，例如我们常用的`TamperMonkey`、`Proxy SwitchyOmega`、`AdGuard`等等，这些拓展都是可以通过`WebExtensions API`来修改、增强浏览器的能力，用来提供一些浏览器本体没有的功能，从而实现一些有趣的事情。

## 描述
实际上`FireFox`是才第一个引入浏览器扩展/附加组件的主流浏览器，其在`2004`年发布了第一个版本的扩展系统，允许开发人员为`FireFox`编写自定义功能和修改浏览器行为的软件程序。而`Chrome`浏览器则在`2010`年支持了扩展系统，同样其也允许开发人员为`Chrome`编写自定义功能和修改浏览器行为的软件程序。

虽然`FireFox`是第一个引入浏览器扩展的浏览器，但是`Chrome`的扩展系统得到了广泛的认可和使用，也已经成为了现代浏览器中最流行的扩展系统之一。目前用于构建`FireFox`扩展的技术在很大程度上与被基于`Chromium`内核的浏览器所支持的扩展`API`所兼容，例如`Chrome`、`Edge`、`Opera`等。在大多数情况下，为基于`Chromium`内核浏览器而写的插件只需要少许修改就可以在`FireFox`中运行。那么本文就以`Chrome`扩展为例，聊聊如何从零实现一个`Chrome`扩展，本文涉及的相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment`的`chrome-browser-extension`分支中。

## manifest
我们可以先来想一下浏览器拓展到底是什么，浏览器本身是支持了非常完备的`Web`能力的，也就是同时拥有渲染引擎和`Js`解析引擎，那么浏览器拓展本身就不需要再去实现一套新的可执行能力了，完全复用`Web`引擎即可。那么问题来了，单纯凭借`Js`是没有办法做到一些能力的，比如拦截请求、修改请求头等等，这些`Native`的能力单凭`Js`肯定是做不到的，起码也得上`C++`直接运行在浏览器代码中才可以，实际上解决这个问题也很简单，直接通过类似于`Js Bridge`的方式暴露出一些接口就可以了，这样还可以更方便地做到权限控制，一定程度避免浏览器扩展执行一些恶意的行为导致用户受损。

那么由此看来，浏览器扩展其实就是一个`Web`应用，只不过其运行在浏览器的上下文中，并且可以调用很多浏览器提供的特殊`API`来做到一些额外的功能。那么既然是一个`Web`应用，应该如何让浏览器知道这是一个拓展而非普通的`Web`应用，那么我们就需要标记和配置文件，这个文件就是`manifest.json`，通过这个文件我们可以来描述扩展的基本信息，例如扩展的名称、版本、描述、图标、权限等等。



manifest.json v3
rspack
HMR WebSocket
background.html/Service Worker/xxxxxx.html
通信
Copy DEMO
谷歌开发者价格


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.chrome.com/docs/extensions/mv3/intro/
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions
```
