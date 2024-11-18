# Element Object
The `Element` is a very versatile base class. All objects under the `Document` inherit from it, describing the common methods and properties of all elements of the same type. Some interfaces inherit from `Element` and add additional functionality. For example, the `HTMLElement` interface describes the basic interface for all `HTML` elements, while the `SVGElement` interface is the foundation for all `SVG` elements. Most functions are further specified in interfaces at a deeper level of this class.

## Properties
All properties inherit from its ancestor interface `Node`, and extend the parent interface `EventTarget` of `Node`, and inherits properties from `ParentNode`, `ChildNode`, `NonDocumentTypeChildNode`, and `Animatable`.
 
- `Element.prototype.attributes`: Read-only. Returns a `NamedNodeMap` of all attributes associated with this element.
- `Element.prototype.classList`: Read-only. Returns the `class` attribute of the element, as a `DOMTokenList`.
- `Element.prototype.className`: A `DOMString` representing the `class` of this element.
- `Element.prototype.clientHeight`: Read-only. Returns a `Number` representing the height of the element relative to the outer element.
- `Element.prototype.clientLeft`: Read-only. Returns a `Number` representing the width of the element from its left border.
- `Element.prototype.clientTop`: Read-only. Returns a `Number` representing the height of the element from its top border.
- `Element.prototype.clientWidth`: Read-only. Returns a `Number` representing the width of the element's interior.
- `Element.prototype.computedName`: Read-only. Returns a `DOMString` containing tags exposed to accessibility.
- `Element.prototype.computedRole`: Read-only. Returns a `DOMString` containing the `ARIA` role applied to a specific element.
- `Element.prototype.id`: A `DOMString` representing the id of this element.
- `Element.prototype.innerHTML`: Returns a `DOMString` representing the content of this element.
- `Element.prototype.localName`: Read-only. Returns a `DOMString` representing the localized part of this element's name.
- `Element.prototype.namespaceURI`: Read-only. The `namespace URI` corresponding to the element, or `null` if none.
- `NonDocumentTypeChildNode.nextElementSibling`: Read-only. Returns an `Element` representing the next sibling of this element, or `null` if none exists.
- `Element.prototype.outerHTML`: Returns a `DOMString` obtaining the `HTML` text of the `DOM` element and its descendants. When set, it parses from the given string, replacing itself.
- `Element.prototype.prefix`: Read-only. A `DOMString` representing the namespace prefix of the element, or `null` if not specified.
- `NonDocumentTypeChildNode.prototype.previousElementSibling`: Read-only. Returns an `Element` representing the previous sibling of this element, or `null` if none exists.
- `Element.prototype.scrollHeight`: Read-only. Returns a `Number` representing the element's scroll height.
- `Element.prototype.scrollLeft`: Returns a `Number` representing the leftmost offset of the element's horizontal scrollbar.
- `Element.prototype.scrollLeftMax`: Read-only. Returns a `Number` representing the maximum value the horizontal scrollbar of the element can move.
- `Element.prototype.scrollTop`: Returns a `Number` representing the distance of the element's vertical scrollbar.
- `Element.prototype.scrollTopMax`: Read-only. Returns a `Number` representing the maximum value the vertical scrollbar of the element can move.
- `Element.prototype.scrollWidth`: Read-only. Returns a `Number` representing the scroll view width of the element.
- `Element.prototype.shadowRoot`: Read-only. Returns the open `shadowRoot` hosted by the element, or `null` if there is no open `shadowRoot`.
- `Element.prototype.openOrClosedShadowRoot`: Read-only. Returns the `shadowRoot` hosted by the element, whether it is open or closed, only applicable to `WebExtensions`.
- `Element.prototype.slot`: Returns the name of the `DOM` slot into which the element is inserted.
- `Element.prototype.tabStop`: Returns a boolean value indicating whether the element can receive input focus via the `Tab` key.
- `Element.prototype.tagName`: Read-only. Returns a string with the given element tag name.
- `Element.prototype.undoManager`: Read-only. Returns the `UndoManager` associated with the element.
- `Element.prototype.undoScope`: Returns a boolean value indicating whether the element is an undo scope host.
- `Slotable.prototype.assignedSlot`: Read-only. Returns `HTMLSlotElement` representing the slot into which the node is inserted.

## Methods

Inherits methods from its parent node and its parent node `EventTarget`, and implements the methods of `ParentNode`, `ChildNode`, `NonDocumentTypeChildNode`, and `Animatable`.

* `EventTarget.prototype.addEventListener()`: Registers an event handler for a specific type of event on the element.
* `Element.prototype.attachShadow()`: Attaches a shadow `DOM` tree to the specified element and returns a reference to its `ShadowRoot`.
* `Element.prototype.animate()`: Shortcut method to create and run animations on the element, returning the created animation object instance.
* `Element.prototype.closest()`: Returns the closest ancestor `Element` of the current element or the current element itself that matches the given selector in the parameter.
* `Element.prototype.createShadowRoot()`: Creates a `shadow DOM` on the element, turning it into a `shadow host`, and returns the `ShadowRoot`.
* `Element.prototype.computedStyleMap()`: Returns a `StylePropertyMapReadOnly` interface, which provides a read-only representation of the CSS declaration block; it is an alternative form of `CSSStyleDeclaration`.
* `EventTarget.dispatchEvent()`: Dispatches an event to this node in the `DOM` and returns a boolean value indicating whether the event was not canceled by any of its event handlers.
* `Element.prototype.getAnimations()`: Returns an array of active `Animation` objects on the element.
* `Element.prototype.getAttribute()`: Retrieves the value of a named attribute on the current node and returns it as an object.
* `Element.prototype.getAttributeNames()`: Returns an array of attribute names for the current element.
* `Element.prototype.getAttributeNS()`: Retrieves the value of an attribute with a specified name and namespace on the current node and returns it as an object.
* `Element.prototype.getAttributeNode()`: Retrieves the node representation of a named attribute on the current node and returns it as an attribute.
* `Element.prototype.getAttributeNodeNS()`: Retrieves the node representation of an attribute with a specified name and namespace on the current node and returns it as an attribute.
* `Element.prototype.getBoundingClientRect()`: Returns the size and position of the element relative to the viewport.
* `Element.prototype.getClientRects()`: Returns a collection of rectangles indicating the border box of each line of text within the element in the client.
* `Element.prototype.getElementsByClassName()`: Takes a list of classes as a parameter and returns a dynamic `HTMLCollection` containing all descendant elements with those classes.
* `Element.prototype.getElementsByTagName()`: Returns a dynamic `HTMLCollection` containing all descendant elements of the current element with a specific tag name.
* `Element.prototype.getElementsByTagNameNS()`: Returns a dynamic `HTMLCollection` containing all descendant elements of the current element with a specific tag name and namespace.
* `Element.prototype.hasAttribute()`: Returns a boolean value indicating whether the element has the specified attribute.
* `Element.prototype.hasAttributeNS()`: Returns a boolean value indicating whether the element has the specified attribute in the specified namespace.
* `Element.prototype.hasAttributes()`: Returns a boolean value indicating whether the element has one or more `HTML` attributes.
* `Element.prototype.hasPointerCapture()`: Indicates whether the element on which it is called has pointer capture for the pointer identified by the given pointer `ID`.
* `Element.prototype.insertAdjacentElement()`: Inserts a given element node at a given position relative to the element that calls it.
* `Element.prototype.insertAdjacentHTML()`: Parses text as `HTML` or `XML`, and inserts the resulting nodes into the tree at a given position.
* `Element.prototype.insertAdjacentText()`: Inserts the given text node at a given position relative to the element that calls it.
* `Element.prototype.matches()`: Returns a boolean value indicating whether the specified selector string selects the element.
* `Element.prototype.pseudo()`: Returns a `CSSPseudoElement` representing the pseudo-element that matches the specified pseudo-element selector.
* `Element.prototype.querySelector()`: Returns the first `Node` that matches the specified selector string relative to the element.
* `Element.prototype.querySelectorAll()`: Returns a `NodeList` of nodes that matches the specified selector string relative to the element.
* `Element.prototype.releasePointerCapture()`: Releases (stops) the pointer capture previously set for a specific pointer event.
* `ChildNode.prototype.remove()`: Removes the element from its parent's list of children.
* `Element.prototype.removeAttribute()`: Removes a named attribute from the current node.
* `Element.prototype.removeAttributeNS()`: Removes an attribute with the specified name and namespace from the current node.
* `Element.prototype.removeAttributeNode()`: Removes the node representation of a named attribute from the current node.
* `EventTarget.prototype.removeEventListener()`: Removes an event listener from the element.
* `Element.prototype.requestFullscreen()`: Asynchronously requests the browser to set the element to full screen.
* `Element.prototype.requestPointerLock()`: Allows asynchronously requesting to lock the pointer to the given element.
* `Element.prototype.scroll()`: Scrolls to a specific set of coordinates within the given element.
* `Element.prototype.scrollBy()`: Scrolls the element by a given amount.
* `Element.prototype.scrollIntoView()`: Scrolls the page until the element is in view.
* `Element.prototype.scrollTo()`: Scrolls to a specific set of coordinates within the given element.
* `Element.prototype.setAttribute()`: Sets the value of a named attribute on the current node.
* `Element.prototype.setAttributeNS()`: Sets the value of an attribute on the current node using the specified name and namespace.
* `Element.prototype.setAttributeNode()`: Sets the node representation of a named attribute on the current node.
* `Element.prototype.setAttributeNodeNS()`: Sets the node representation of an attribute with a specified name and namespace on the current node.
* `Element.prototype.setCapture()`: Sets the mouse event capture, redirecting all mouse events to this element.
* `Element.prototype.setPointerCapture()`: Specifies a specific element as the capture target for future pointer events.
* `Element.prototype.toggleAttribute()`: Toggles a boolean attribute on the specified element; if the boolean attribute exists, it is removed, and if it does not exist, it is added.

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Element
```