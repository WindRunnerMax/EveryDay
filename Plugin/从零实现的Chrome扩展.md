# 从零实现的Chrome扩展
`Chrome`扩展是一种可以在`Chrome`浏览器中添加新功能和修改浏览器行为的软件程序，例如我们常用的`TamperMonkey`、`Proxy SwitchyOmega`、`AdGuard`等等，这些拓展都是可以通过`WebExtensions API`来修改、增强浏览器的能力，用来提供一些浏览器本体没有的功能，从而实现一些有趣的事情。

## 描述
实际上`FireFox`是才第一个引入浏览器扩展/附加组件的主流浏览器，其在`2004`年发布了第一个版本的扩展系统，允许开发人员为`FireFox`编写自定义功能和修改浏览器行为的软件程序。而`Chrome`浏览器则在`2010`年支持了扩展系统，同样其也允许开发人员为`Chrome`编写自定义功能和修改浏览器行为的软件程序。

虽然`FireFox`是第一个引入浏览器扩展的浏览器，但是`Chrome`的扩展系统得到了广泛的认可和使用，也已经成为了现代浏览器中最流行的扩展系统之一。目前用于构建`FireFox`扩展的技术在很大程度上与被基于`Chromium`内核的浏览器所支持的扩展`API`所兼容，例如`Chrome`、`Edge`、`Opera`等。在大多数情况下，为基于`Chromium`内核浏览器而写的插件只需要少许修改就可以在`FireFox`中运行。那么本文就以`Chrome`扩展为例，聊聊如何从零实现一个`Chrome`扩展，本文涉及的相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment`的`chrome-browser-extension`分支中。

## Manifest
我们可以先来想一下浏览器拓展到底是什么，浏览器本身是支持了非常完备的`Web`能力的，也就是同时拥有渲染引擎和`Js`解析引擎，那么浏览器拓展本身就不需要再去实现一套新的可执行能力了，完全复用`Web`引擎即可。那么问题来了，单纯凭借`Js`是没有办法做到一些能力的，比如拦截请求、修改请求头等等，这些`Native`的能力单凭`Js`肯定是做不到的，起码也得上`C++`直接运行在浏览器代码中才可以，实际上解决这个问题也很简单，直接通过类似于`Js Bridge`的方式暴露出一些接口就可以了，这样还可以更方便地做到权限控制，一定程度避免浏览器扩展执行一些恶意的行为导致用户受损。

那么由此看来，浏览器扩展其实就是一个`Web`应用，只不过其运行在浏览器的上下文中，并且可以调用很多浏览器提供的特殊`API`来做到一些额外的功能。那么既然是一个`Web`应用，应该如何让浏览器知道这是一个拓展而非普通的`Web`应用，那么我们就需要标记和配置文件，这个文件就是`manifest.json`，通过这个文件我们可以来描述扩展的基本信息，例如扩展的名称、版本、描述、图标、权限等等。

在`manifest.json`中有一个字段为`manifest_version`，这个字段标志着当前`Chrome`的插件版本，现在我们在浏览器安装的大部分都是`v2`版本的插件，`v1`版本的插件早已废弃，而`v3`版本的插件因为存在大量的`Breaking Changes`，以及诸多原本`v2`支持的`API`在`v3`被限制或移除，导致诸多插件无法无损过渡到`v3`版本。但是自`2022.01.17`起，`Chrome`网上应用店已停止接受新的`Manifest V2`扩展，所以对于要新开发的拓展来说，我们还是需要使用`v3`版本的受限能力，而且因为谷歌之前宣布`v2`版本将在`2023`初完全废弃，但是又因为不能做到完全兼容`v2`地能力，现在又延迟到了`2024`年初。但是无论如何，谷歌都准备逐步废弃`v2`而使用`v3`，那么我们在这里也是基于`v3`来实现`Chrome`扩展。

那么构建一个扩展应用，你就需要在项目的根目录创建一个`manifest.json`文件，一个简单的`manifest.json`的结构如下所示，详细的配置文档可以参考`https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json`:

```json
{
    "manifest_version": 3,              // 插件版本
    "name": "Extension",                // 插件名称
    "version": "1.0.0",                 // 插件版本号
    "description": "Chrome Extension",  // 插件描述信息
    "icons": {                          // 插件在不同位置显示的图标 // 可以直接配置为`string`
      "16": "icon16.png",               // `16x16`像素的图标
      "32": "icon32.png",               // `32x32`像素的图标
      "48": "icon48.png",               // `48x48`像素的图标
      "128": "icon128.png"              // `128x128`像素的图标
    },
    "action": {                         // 单击浏览器工具栏按钮时的行为
      "default_popup": "popup.html",    // 单击按钮时打开的默认弹出窗口
      "default_icon": {                 // 弹出窗口按钮图标 // 可以直接配置为`string`
        "16": "icon16.png",             // `16x16`像素的图标
        "32": "icon32.png",             // `32x32`像素的图标
        "48": "icon48.png",             // `48x48`像素的图标
        "128": "icon128.png"            // `128x128`像素的图标
      }
    },
    "background": {                     // 定义后台页面的文件和工作方式
      "service_worker": "background.js" // 注册`Service Worker`文件
    },
    "permissions": [                    // 定义插件需要访问的`API`权限
      "storage",                        // 存储访问权限
      "activeTab",                      // 当前选项卡访问权限
      "scripting"                       // 脚本访问权限
    ]
}
```

## Bundle
既然在上边我们确定了`Chrome`扩展实际上还是`Web`技术，那么我们就完全可以利用`Web`的相关生态来完成插件的开发，当前实际上是有很多比较成熟的扩展框架的，其中也集合了相当一部分的能力，只不过我们在这里希望从零开始跑通一整套流程，那么我们就自行借助打包工具来完成产物的构建。在这里选用的是`Rspack`，`Rspack`是一个于`Rust`的高性能构建引擎，具备与`Webpack`生态系统的互操作性，可以被`Webpack`项目低成本集成，并提供更好的构建性能。选用`Rspack`的主要原因是其编译速度会快一些，特别是在复杂项目中`Webpack`特别是`CRA`创建的项目打包速度简直惨不忍睹，我这边有个项目改造前后的`dev`速度对比大概是`1min35s : 24s`，速度提升还是比较明显的，当然在我们这个简单的`Chrome`扩展场景下实际上是区别不大的，




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
