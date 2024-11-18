# The Window Object
The `window` acts as a global variable, representing the window in which the script is running, and exposes properties and methods to `JavaScript`.

## Properties of the Window Object
- `closed`: Indicates whether the referenced window is closed.
- `console`: Provides methods to output log information to the browser console.
- `crypto`: This object allows web pages to access certain encryption-related services.
- `customElements`: Can be used to register new custom elements or retrieve information about previously defined custom elements.
- `devicePixelRatio`: Returns the ratio of the physical pixel resolution of the current display device to the CSS pixel resolution.
- `document`: Returns a reference to the `document` object.
- `frameElement`: Returns the element embedded in the current `window` object, such as `<iframe>` or `<object>`, and returns `null` if the current `window` object is already the top-level window.
- `frames`: Returns an array-like object that lists all the direct child windows of the current window.
- `fullScreen`: Indicates whether the window is in full-screen mode.
- `history`: Provides an interface for manipulating the browser session history.
- `indexedDB`: Integrates mechanisms to provide asynchronous access to indexed databases for applications.
- `innerHeight`: Returns the height of the document display area of the window.
- `innerWidth`: Returns the width of the document display area of the window.
- `length`: Sets or returns the number of `<iframe>` frames in the window.
- `localStorage`: Provides a long-term local storage interface.
- `location`: Contains information about the current document location.
- `locationbar`: Returns a `locationbar` object with a `visibility` property that can be checked.
- `name`: Sets or returns the name of the window.
- `navigator`: Provides information related to the application running the current code.
- `opener`: Returns a reference to the window that opened this window.
- `outerHeight`: Returns the outer height of the window, including the toolbar and scrollbar.
- `outerWidth`: Returns the outer width of the window, including the toolbar and scrollbar.
- `pageXOffset`: Sets or returns the `X` position of the current page relative to the upper left corner of the window display area.
- `pageYOffset`: Sets or returns the `Y` position of the current page relative to the upper left corner of the window display area.
- `parent`: Returns the parent window object of the current window, or returns a self-reference if there is no parent window.
- `performance`: Allows web pages to access certain functions to measure the performance of web pages and web applications.
- `screen`: Returns properties related to the current rendering window and screen.
- `screenLeft`: Returns the `X` coordinate relative to the screen window.
- `screenTop`: Returns the `Y` coordinate relative to the screen window.
- `screenX`: Returns the `X` coordinate relative to the screen window.
- `screenY`: Returns the `Y` coordinate relative to the screen window.
- `sessionStorage`: Provides a local storage interface with current session validity.
- `self`: Returns a reference to the current window.
- `status`: Sets the text of the window status bar.
- `top`: Returns a reference to the topmost window in the window hierarchy.

## Methods of the Window Object
* `alert()`: Displays an alert dialog with specified text content and an OK button.
* `atob()`: Decodes a string encoded with `Base64`.
* `btoa()`: Creates a `Base64` encoded string.
* `blur()`: Moves the keyboard focus away from the top-level window.
* `clearInterval()`: Cancels the interval set by `setInterval()`.
* `clearTimeout()`: Cancels the timeout set by the `setTimeout()` method.
* `close()`: Closes the current window or a specified window.
* `confirm()`: Displays a dialog with a message, an OK button, and a Cancel button.
* `focus()`: Gives focus to a window.
* `getComputedStyle()`: Gets the `CSS` styles of a specified element.
* `matchMedia()`: Returns the result object of a specified media query string parsing.
* `moveBy()`: Moves the window created by `open` by a specified amount.
* `moveTo()`: Moves the top-left corner of the window created by `open` to a specified coordinate.
* `open()`: Opens a new browser window or finds a named window.
* `postMessage()`: Safely implements cross-origin communication.
* `print()`: Prints the content of the current window.
* `prompt()`: Displays a dialog prompting the user for input.
* `requestAnimationFrame()`: Provides a method for drawing animation frames to match the screen refresh rate.
* `queueMicrotask()`: Provides a callback interface for adding to the microtask queue.
* `resizeBy()`: Adjusts the size of the window created by `open` by a specified number of pixels.
* `resizeTo()`: Adjusts the size of the window created by `open` to a specified width and height.
* `scroll()`: Scrolls the window to a specific position in the document.
* `scrollBy()`: Scrolls the document within the window by a specified offset.
* `scrollTo()`: Scrolls the content to the specified coordinates.
* `setInterval()`: Calls a function or evaluates an expression at specified intervals.
* `setTimeout()`: Calls a function or evaluates an expression after a specified number of milliseconds.
* `stop()`: Stops the loading of the page, equivalent to clicking the stop button in the browser.

## Events of the Window Object
### Load-related
* `onbeforeunload`: Occurs just before the document is about to be unloaded (refreshed or closed).
* `onload`: Occurs when the document has finished loading.
* `onunload`: Occurs when the window unloads its resources and content.
* `onerror`: Occurs when a JavaScript runtime error or resource loading failure happens.
* `onabort`: Event handler for the abort event sent to the window, not applicable to `Firefox 2` or `Safari`.

### Window-related
* `onblur`: Occurs when the window loses focus.
* `onfocus`: Occurs when the window gains focus.
* `onresize`: Occurs when the window size changes.
* `onscroll`: Occurs when the window scrolls.
* `onmessage`: Occurs when the window object receives a message.
* `onchange`: Occurs when the content of a form element in the window changes.
* `oninput`: Occurs when a form element in the window gets user input.
* `onreset`: Occurs when a form in the window is reset.
* `onselect`: Occurs when text in a form element in the window is selected.
* `onsubmit`: Occurs when the `submit` button in a form in the window is pressed.
* `onhashchange`: Occurs when the anchor/hash value of the window changes.

### Mouse Related
* `onclick`: Triggered when the page is clicked.
* `onmouseup`: Triggered when the mouse button is released.
* `ondblclick`: Called when the page is double-clicked.
* `oncontextmenu`: Triggered when the right mouse button is clicked to open the context menu.
* `onmousedown`: Triggered when the mouse button is pressed.
* `onmousemove`: Triggered when the mouse is moved.
* `onmouseout`: Triggered when the mouse moves out of the window.
* `onmouseover`: Triggered when the mouse moves over the window.
* `onauxclick`: Indicates that a non-primary button is pressed on an input device, such as the middle button of a mouse.

### Keyboard Related
* `onkeydown`: Triggered when a keyboard key is pressed.
* `onkeyup`: Triggered when a keyboard key is released.
* `onkeypress`: Triggered when a keyboard key is pressed and then released.

### Animation Related
* `onanimationcancel`: Sent when a `CSS` animation is unexpectedly terminated, i.e., at any time it stops running without sending an `animationend` event, for example, when `animation-name` is changed or the animation is deleted.
* `onanimationend`: Sent when a `CSS` animation reaches the end of its active period, calculated as `(animation-duration*animation-iteration-count) + animation-delay`.
* `onanimationiteration`: Triggered when a `CSS` animation completes one iteration of the sequence of animation instructions by executing the last step of the animation.

### Device Related
* `ondevicemotion`: Triggered when the device's state changes.
* `ondeviceorientation`: Triggered when the device's relative orientation changes.
* `ondeviceproximity`: Triggered when the device's sensor detects an object getting closer to or further away from the device.

### Print Related
* `onbeforeprint`: Triggered when the page is about to start printing.
* `onafterprint`: Triggered when the page has started printing or the print window has been closed.

### Application Related
* `onappinstalled`: Dispatched once a `Web` application is successfully installed as a progressive `Web` application.
* `onbeforeinstallprompt`: Scheduled on the device when the user is about to be prompted to install a `web` application, and its associated events can be saved for later use in prompting the user at a more opportune time.


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```


## Reference

```
https://www.runoob.com/jsref/obj-window.html
https://developer.mozilla.org/zh-CN/docs/Web/API/Window
```