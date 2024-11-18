# Document Object
The `Document` interface represents any web page loaded in a browser and serves as the entry point for the web page content, known as the `DOM` tree. The `DOM` tree contains elements like `<body>`, `<div>`, and many other elements. The `Document` object provides global manipulation capabilities to the web page document itself and the interface describes the common properties and methods for any type of document. Depending on the document type (e.g., `HTML`, `XML`, `SVG`, and so on), it can use additional `APIs`. Furthermore, for an `HTML` document using `text/html` as the content type, it also implements the `HTMLDocument` interface, while `XML` and `SVG` documents additionally implement the `XMLDocument` interface.

## Properties
* `Document()`: The `Document` constructor creates a new `Document` object, which represents the page loaded in the browser and serves as the entry point for the page content.
* `document.body`: Returns the `<body>` element or `<frameset>` element in the current document.
* `document.characterSet`: A read-only property that returns the character encoding of the current document, which is used to render the document content and may differ from the encoding specified for the page.
* `document.childElementCount`: A read-only property of `ParentNode.childElementCount` that returns an unsigned long integer representing the number of child elements of a given element.
* `document.children`: A read-only property that returns a dynamic `HTMLCollection` of the child `elements` of a `Node`.
* `document.compatMode`: Indicates whether the current document is in quirks mode, standards mode, or almost standards mode.
* `document.contentType`: A read-only property that returns the `Content-Type (MIME)` type of the current document.
* `document.currentScript`: The `document.currentScript` property returns the `<script>` element to which the currently running script belongs, and this property cannot be called by a script module; modules should use the `import.meta` object instead.
* `document.defaultView`: In a browser, this property returns the `window` object associated with the current `document` object, or `null` if there is none.
* `document.designMode`: Controls whether the entire document is editable; valid values are `on` and `off`, and according to the specification, this property defaults to `off` and is commonly used with `<iframe>`.
* `document.dir`: The core of the `document.dir` is a `DOMString` that represents the text direction of the document, whether it goes from left-to-right (default) `ltr` or from right-to-left `rtl`, and can set the direction of the text.
* `document.doctype`: Returns the document type definition `DTD` associated with the current document, and the returned object implements the `DocumentType` interface, and a `DocumentType` object can be created using the `DOMImplementation.createDocumentType()` method.
* `document.documentElement`: Read-only property that returns the root element of the `document` object, for example, the `<html>` element of an `HTML` document.
* `document.documentURI`: The `Document` interface's `documentURI` property returns the location of the document as a string, and in the original `DOM3` definition, this property was read/write, but in the modern `DOM` standard `DOM4`, it's read-only.
* `document.domain`: The `domain` property of the `Document` interface gets/sets the original domain portion of the current document, often used for same-origin policy, and if this property is successfully set, the port of the original port part will also be set to `null`.
* `document.embeds`: The `embeds` property of the `Document` interface returns a read-only list of `<object>` elements embedded in the current document.
* `document.firstElementChild`: A read-only property that returns the first child element of an object, or `null` if there are no child elements.
* `document.forms`: `document.forms` returns a collection of `<form>` elements in the current document, which is an `HTMLCollection`.
* `document.mozFullScreenEnabled`: Returns a Boolean value indicating whether the browser supports full-screen mode, which is available only on pages that do not contain windowed plugins, and for a page in an `<iframe>` element, it must have the `mozallowfullscreen` attribute.
* `document.head`: Returns the `<head>` element in the current document, or the first one if there are multiple `<head>` elements.
* `document.hidden`: The `hidden` property of the `document` is a read-only property that returns a Boolean value, indicating whether the page is `true` (hidden) or `false` (visible).
* `document.images`: Read-only property that returns a collection of all the `image` elements in the current document.
* `document.implementation`: Returns a `DOMImplementation` object associated with the current document.
* `lastElementChild`: A read-only property that returns the last child `Element` of the object, or `null` if there are no child elements.
* `document.lastModified`: Returns a string containing the date and time of the last modification of the current document.
* `document.links`: The `document.links` property returns a collection of all the `<area>` and `<a>` elements in the document with an `href` attribute value.
* `document.location`: Returns a `Location` object containing information about the document's `URL` and providing methods to change this `URL` and load other `URLs`.
* `document.onbeforeunload`: This event is triggered when a page is about to unload (refresh or close).
* `document.onload`: Triggered after the document has finished loading.
* `document.onreadystatechange`: Triggered when the `readyState` property of the document changes.
* `document.onvisibilitychange`: Called when the `visibilitychange` event of the object is triggered.
* `document.onunload`: Triggered when the window unloads its content and resources.
* `document.onerror`: Triggered when a JavaScript runtime error occurs or a resource fails to load.
* `document.onabort`: An event handler for the abort event sent to the window, not applicable for `Firefox 2` or `Safari`.
* `document.onblur`: Triggered when the window loses focus.
* `document.onfocus`: Triggered when the window gains focus.
* `document.onresize`: Triggered when the window size changes.
* `document.onscroll`: Triggered when the window scrolls.
* `document.onmessage`: Triggered when the window object receives a message event.
* `document.onchange`: Triggered when the content of form elements in the window changes.
* `document.oninput`: Triggered when form elements in the window receive user input.
* `document.onreset`: Triggered when forms inside the window are reset.
* `document.onselect`: Triggered when text in form elements inside the window is selected.
* `document.onsubmit`: Triggered when the submit button inside a form in the window is pressed.
* `document.onhashchange`: Triggered when the anchor hash of the window changes.
* `document.onclick`: Triggered when the page is clicked.
* `document.onmouseup`: Triggered when a mouse button is released.
* `document.ondblclick`: Triggered when the page is double-clicked.
* `document.oncontextmenu`: Triggered when the right mouse button is clicked to open the context menu.
* `document.onmousedown`: Triggered when a mouse button is pressed.
* `document.onmousemove`: Triggered when the mouse is moved.
* `document.onmouseout`: Triggered when the mouse moves out of the window.
* `document.onmouseover`: Triggered when the mouse moves into the window.
* `document.onauxclick`: Indicates when a non-primary button on an input device is pressed, such as the middle button on a mouse.
* `document.onkeydown`: Triggered when a keyboard key is pressed.
* `document.onkeyup`: Triggered when a keyboard key is released.
* `document.onkeypress`: Triggered when a keyboard key is pressed and then released.
* `document.onanimationcancel`: Fired when a CSS animation is unexpectedly aborted, such as when the `animation-name` is changed or the animation is removed.
* `document.onanimationend`: Fired when a CSS animation reaches the end of its active duration, as calculated by `(animation-duration*animation-iteration-count) + animation-delay`.
* `document.onanimationiteration`: Fired when a CSS animation reaches the end of each iteration, completing a single pass through the sequence of animation steps as defined by the last animation instruction.
* `document.ondevicemotion`: Triggered when the device's motion state changes.
* `document.ondeviceorientation`: Triggered when the device's relative orientation changes.
* `document.ondeviceproximity`: Triggered when the device sensor detects an object approaching or moving away.
* `document.onbeforeprint`: Fired when a page is about to start printing.
* `document.onafterprint`: Fired when a page has started printing or the print window has closed.
* `document.onappinstalled`: Dispatched once a web application is successfully installed as a progressive web app.
* `document.onbeforeinstallprompt`: The event handler to be dispatched on the device when a user is about to be prompted to install a web application, and the associated event is saved for use later to prompt the user at a more opportune time.
* `document.plugins`: A read-only property that returns an `HTMLCollection` object containing one or more `HTMLEmbedElements`, representing the `<embed>` elements in the current document.
* `document.readyState`: Describes the loading status of the `document`. When the value of this property changes, the `readystatechange` event is triggered on the `document` object.
* `document.referrer`: Returns a `URI` representing the page from which the current page was linked or opened.
* `document.scripts`: Returns an `HTMLCollection` object containing all the `<script>` elements in the current document.
* `document.scrollingElement`: A read-only property that returns a reference to the scrolling `Element` of the document; in standards mode, it returns the root element of the document, while in quirks mode, it returns the `HTML body` element, and if neither exists, it returns `null`.
* `document.selectedStyleSheetSet`: Returns the name of the currently used style sheet set, and this property can also be used to set the current style sheet set.
* `document.styleSheetSets`: Returns a live list of all currently available style sheet sets.
* `document.title`: Gets or sets the title of the document.
* `document.URL`: Returns the `URL` of the current document.
* `document.visibilityState`: A read-only property that returns the visibility of the `document`, representing the visibility state of the current visible context of the document, indicating if the current document (page) is `visible` (at least partially visible), `hidden` (invisible), or in `prerender` state.

## Methods
* `document.adoptNode(externalNode)`: Retrieves a node from another `document` and removes it, along with all its descendants, from the original document (if it exists). The `ownerDocument` property of the node becomes the current `document`, and then you can insert this node into the current document.
* `document.close()`: `document.close()` is used to end writing operations performed on the document using `document.write()`, which are typically initiated by `document.open()`.
* `document.createAttribute(name)`: The `document.createAttribute()` method creates and returns a new attribute node. This creates a node implementing the `Attr` interface, allowing any type of attribute to be added to the `DOM`.
* `document.createCDATASection(data)`: Creates and returns a new `CDATA` section node.
* `document.createComment(data)`: Creates and returns a comment node. The `data` is a string containing the content of the comment.
* `document.createDocumentFragment()`: Creates a new empty document fragment `DocumentFragment`.
* `document.createElement(tagName[, options])`: In an `HTML` document, the `document.createElement()` method is used to create an `HTML` element specified by the tag name `tagName`. If the user agent cannot recognize `tagName`, an unknown `HTML` element, `HTMLUnknownElement`, will be generated.
* `document.createElementNS(namespaceURI, qualifiedName[, options])`: Creates an element with the specified namespace `URI` and qualified name. To create an element without specifying a namespace `URI`, use the `createElement` method.
* `document.createEvent(type)`: Creates an event of the specified type, and the returned object must be initialized before it can be dispatched to `element.dispatchEvent`.
* `document.createExpression(xpathText, namespaceURLMapper)`: This method compiles and generates an `XPathExpression` that can be executed multiple times.
* `document.createNodeIterator(root[, whatToShow[, filter]])`: Returns a new `NodeIterator` object.
* `document.createNSResolver(node)`: Creates an `XPathNSResolver` that resolves namespaces based on definitions within the specified node's scope.
* `document.createProcessingInstruction(target, data)`: Creates a new processing instruction node and returns it.
* `document.createRange()`: Returns a `Range` object.
* `document.createTextNode(data)`: Creates a new text node. This method can be used to escape `HTML` characters.
* `document.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion)`: Creates and returns a `TreeWalker` object.
* `document.evaluate(xpathExpression, contextNode, namespaceResolver, resultType, result)`: Returns an `XPathResult` object based on the provided `XPath` expression and other parameters.
* `document.exitFullscreen()`: Exits full-screen mode in the current document. Invoking this method will revert the document to the state before entering full-screen mode using the `Element.requestFullscreen()` method.
* `document.getElementById(id)`: Returns an element with a specific `ID`. Since element `ID`s are generally required to be unique, this method naturally becomes an efficient way to locate a specific element.
* `document.getElementsByClassName(names)`: Returns an array-like object containing all child elements with the specified class names. When called on the `document` object, the entire `DOM` document, including the root node, is searched. You can also call the `getElementsByClassName()` method on any element, and it will return all child elements with the specified class names, with the current element as the root node.
* `document.getElementsByName(name)`: Returns a collection of nodes in an `(X)HTML document` with the given `name`.
* `document.getElementsByTagName(name)`: Returns an `HTMLCollection` containing all elements with the given tag name. The entire document structure is searched, including the root node. The returned `HTML` collection is dynamic, meaning it automatically updates itself to stay in sync with the `DOM` tree without needing to call `document.getElementsByTagName()` again.
* `document.getElementsByTagNameNS(namespace, name)`: Returns a collection of elements with the specified name and namespace. The entire document structure is searched, including the root node.
* `document.hasFocus()`: Returns a `Boolean` indicating whether the current document or a node within the current document has focus. This method can be used to determine whether the active element in the current document has focus.
* `document.hasStorageAccess()`: Returns a `Promise` to determine whether the document has access to first-party storage.
* `document.importNode(externalNode, deep)`: Copies a node from an external document and then can insert this cloned node into the current document.
* `document.open()`: Opens a document to be written to. This has several side effects, such as clearing all event listeners registered to the document, its nodes, or the window in the document. All nodes in the document are also cleared.
* `prepend((Node or DOMString)... nodes)`: Inserts a series of `Node` objects or `DOMString` objects before the first child of the parent node.
* `document.queryCommandEnabled(command)`: Checks if the specified editing command is available in the browser.
* `document.queryCommandSupported(command)`: Determines whether the browser supports the specified editing command.
* `document.querySelector(selectors)`: Returns the first element in the document that matches the specified set of `CSS` selectors, as an `HTMLElement` object. If no match is found, it returns `null`. Matching is performed using depth-first pre-order traversal, starting with the first element in the document markup and then traversing in order of child nodes.
* `document.querySelectorAll(selectors)`: Returns a static `NodeList` containing `Element` objects that match at least one of the specified `CSS` selectors, or an empty `NodeList` if no matches are found.
* `document.releaseCapture()`: Releases mouse capture if it is currently enabled on an element within the document by calling `element.setCapture()`.
* `document.write(markup)`: The `document.write()` method writes a text string to a document stream opened by `document.open()`. Because `document.write` needs to write content to the document stream, if `document.write` is called on a document that is closed (e.g., finished loading), `document.open` will automatically be invoked, clearing the content of the document.
* `document.writeln(line)`: Writes a string of text to the document, followed by a line break.

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/en/docs/Web/API/Document
```