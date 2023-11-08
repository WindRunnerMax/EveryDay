```markdown
# History Object

The `History` object allows manipulation of the session history for the browser, including pages visited in the tab or frame.

## Properties
* `history.length`: Read-only, returns an integer representing the number of elements in the session history, including the current page being loaded. For example, in a new tab loading a page, this property returns `1`.
* `history.scrollRestoration`: Allows a web application to explicitly set the default scroll restoration behavior on history navigation, with possible values of `auto` or `manual`.
* `history.state`: Read-only, returns a value representing the state at the top of the history stack, providing a way to view the state without waiting for the `popstate` event.

## Methods
* `history.back()`: `history.back()` navigates to the previous page in the browser history. Users can simulate this method by clicking the back `←` button on the browser. It is equivalent to `history.go(-1)`. When the browser session history is at the first page, calling this method has no effect and does not produce an error.
* `history.forward()`: `history.forward()` navigates to the next page in the browser history. Users can simulate this method by clicking the forward `→` button on the browser. It is equivalent to `history.go(1)`. When the browser history stack is at the top and the current page is the last one, calling this method has no effect and does not produce an error.
* `history.go()`: `history.go(N)` loads a page from the browser history or session record based on the current page's relative position. For example, passing `-1` as the parameter will load the previous page, and passing `1` will load the next page. When the integer parameter exceeds the limits, such as when the current page is the first one, and there are no pages before it, calling this method with a value of `-1` has no effect and does not produce an error. Calling `go()` without parameters or with non-integer parameters also has no effect, which is different from Internet Explorer's support for using strings as the `url` parameter.
* `history.pushState()`: `history.pushState(state, title[, url])` adds a `state` to the history stack for the current browser session, pushing the data with the specified name and `URL` (if provided) into the session history stack. The data is opaque to `DOM`, and you can specify any serializable `JavaScript` object.
* `history.replaceState()`: `history.replaceState(stateObj, title[, url])` modifies the current history entity, updating the latest entry on the history stack with the specified data, name, and `URL` (if provided). The data is opaque to `DOM`, and you can specify any serializable `JavaScript` object.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/API/History
```
```