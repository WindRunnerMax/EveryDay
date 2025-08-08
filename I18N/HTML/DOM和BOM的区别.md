# The Difference Between DOM and BOM

`JavaScript` running in a browser can be considered as consisting of three parts: `ECMAScript` describes the syntax and basic objects of the language, `DOM` (Document Object Model) describes the methods and interfaces for manipulating web page content, and `BOM` (Browser Object Model) describes the methods and interfaces for interacting with the browser.

## DOM
* `DOM` stands for Document Object Model.
* `DOM` is a standard defined by the W3C.
* The root object of `DOM` is `document`, i.e., `window.document`.

`DOM`, short for Document Object Model, is a tree-based API for working with `XML`. It describes the methods and interfaces for manipulating web page content and serves as the API for both `HTML` and `XML`. `DOM` organizes the entire page into a document composed of a hierarchy of nodes. `DOM` is related to documents, where documents refer to web pages, i.e., `HTML` documents. Web pages are sent from the server to the client's browser, and regardless of the browser used, the received `HTML` is the same. Therefore, `DOM` is independent of the browser and focuses on the content of the web page itself. Since it is relatively independent of the browser, standards can be established.

`DOM` defines objects such as `Node` as the foundation of this implementation. In other words, in order to manipulate the content of this `HTML` programmatically, such as adding elements, modifying elements, deleting elements, etc., we can view this `HTML` structure as an object tree or `DOM` tree. The `HTML` structure itself and everything inside it, such as `<div></div>` tags, are considered objects. Each object is called a node (`Node`), which can be understood as the superclass of all objects in `DOM`.

## BOM
* `BOM` stands for Browser Object Model.
* `BOM` does not have any related standards.
* The root object of `BOM` is `window`.

`BOM`, short for Browser Object Model, is the interface that appeared to control browser behavior, while `DOM` is the interface that appeared to manipulate documents. For example, `BOM` provides interfaces for actions such as page navigation, forward and backward navigation, bookmarks, etc. Programs may also need to obtain parameters such as screen size, so `BOM` provides interfaces to solve these issues. For example, to make the browser navigate to another page, we need the `Location` object.

Since there is no standard, different browsers may require different implementation methods for the same functionality. Therefore, the `JavaScript` code required for the same functionality may vary among different browsers. Although `BOM` does not have a set of standards, the `JavaScript` code for common functions in different browsers is generally similar. There are already default standards for common functions, so there is no need to worry too much about browser compatibility. Not every browser has its own `BOM`, and there is no need to learn a set of `BOM` for each browser. Only a few browsers may have additional features that are reflected in `BOM`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/20724662
https://juejin.cn/post/6844903939008102413
https://blog.csdn.net/xiao__gui/article/details/8315148
```