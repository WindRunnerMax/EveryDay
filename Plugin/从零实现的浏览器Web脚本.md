# 从零实现的浏览器Web脚本
在之前我们介绍了从零实现`Chrome`扩展，而实际上浏览器级别的扩展整体架构非常复杂，尽管当前有统一规范但不同浏览器的具体实现不尽相同，并且成为开发者并上架`Chrome`应用商店需要支付`5$`的注册费，如果我们只是希望在`Web`页面中进行一些轻量级的脚本编写，使用浏览器扩展级别的能力会显得成本略高，所以在本文我们主要探讨浏览器`Web`级别的轻量级脚本实现。


## 描述
在前边的从零实现`Chrome`扩展中，我们使用了`TS`完成了整个扩展的实现，并且使用`Rspack`作为打包工具来构建应用，那么虽然我们实现轻量级脚本是完全可以直接使用`Js`实现的，但是毕竟随着脚本的能力扩展会变得越来越难以维护，所以同样的在这里我们依旧使用`TS`来构建脚本，并且在构建工具上我们可以选择使用`Rollup`来构建脚本，本文涉及的相关的实现可以参考个人实现的脚本集合`https://github.com/WindrunnerMax/TKScript`。

GreaseMonkey TamperMonkey ViolentMonkey ScriptCat GreasyFork

## UserScript

### Meta

### Window

### XHR

## 脚本构建

### Rollup

### Meta

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://en.wikipedia.org/wiki/Greasemonkey
```
