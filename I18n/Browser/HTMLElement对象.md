# HTMLElement Object
Any `HTML` element inherits from the `HTMLElement` object, some elements directly implement this interface, while others implement it through multiple inheritance layers.

## Properties
Inherits properties from its parent element `Element`, and implements these properties from `DocumentAndElementEventHandlers`, `ElementCSSInlineStyle`, `GlobalEventHandlers`, `HTMLOrForeignElement`, and `TouchEventHandlers`.
* `HTMLElement.accessKey`: Gets/sets the shortcut key for element access.
* `HTMLElement.accessKeyLabel`: Readonly, returns a `DOMString` containing the shortcut key for element access.
* `HTMLElement.contentEditable`: Gets/sets the editable state of the element.
* `HTMLElement.isContentEditable`: Readonly, returns a `Boolean` value indicating whether the content of the element is editable.
* `HTMLOrForeignElement.dataset`: Readonly, returns a `DOMStringMap` that is used to obtain the custom `data-*` attributes of the element, which is an object in a `key-value` structure.
* `HTMLElement.dir`: Gets/sets the direction of the element, with optional values `ltr`, `rtl`, `auto`.
* `HTMLElement.draggable`: Sets/gets whether the element can be dragged.
* `HTMLElement.enterkeyhint`: Returns a `DOMString` that defines what operation label or icon the `enter` key on the virtual keyboard provides.
* `HTMLElement.hidden`: Gets/sets whether the element is hidden.
* `HTMLElement.inert`: Returns a boolean value indicating whether the user agent must act as if given node plays no role in user interaction events, page-wide text searches, and document styling.
* `HTMLElement.innerText`: Sets or gets the text content of the node and its descendants, and if used as a getter, approximates the text obtained when a user highlights the element's content with a cursor and copies it to the clipboard.
* `HTMLElement.lang`: Returns a `DOMString` representing the language of the element's attributes, text, and element content.
* `HTMLElement.noModule`: Returns a boolean value indicating whether imported scripts can be executed in a user agent that supports module scripts.
* `HTMLOrForeignElement.nonce`: Returns the nonce used by a content security policy to determine whether a given fetch should be allowed for a single use of a password.
* `HTMLElement.offsetHeight`: Readonly, returns a `double` value containing the height of the element relative to the layout.
* `HTMLElement.offsetLeft`: Readonly, returns a `double` value, which is the distance from the left edge of this element to the left edge of the `offsetParent`.
* `HTMLElement.offsetParent`: Readonly, returns an `Element` which is the element from which all offset calculations are currently calculated.
* `HTMLElement.offsetTop`: Readonly, returns a `double` value, which is the distance from the top border of this element to the top border of the `offsetParent`.
* `HTMLElement.offsetWidth`: Readonly, returns a `double` containing the width of the element relative to the layout.
* `HTMLElement.spellcheck`: It is a boolean value that controls spell checking, present in all `HTML` elements, but does not affect all elements.
* `HTMLElement.style`: Returns a `CSSStyleDeclaration`, which is an object representing the style properties of the element.
* `HTMLOrForeignElement.tabIndex`: Is a long integer representing the position of elements arranged in the order of the `Tab` key.
* `HTMLElement.title`: Returns a `DOMString` containing the text that appears in a tooltip when the mouse is placed over the element.
* `HTMLElement.translate`: Is a boolean value representing translation.

## Methods
Inherits methods from its parent element `Element`, and implements these methods from `DocumentAndElementEventHandlers`, `ElementCSSInlineStyle`, `GlobalEventHandlers`, `HTMLOrForeignElement`, `TouchEventHandlers`.

- `HTMLElement.attachInternals()`: Attaches an `ElementInternals` instance to a custom element.
- `HTMLOrForeignElement.blur()`: Removes keyboard focus from the currently focused element.
- `HTMLElement.click()`: Dispatches a mouse click event to the element.
- `HTMLOrForeignElement.focus()`: Sets focus on the element as the current keyboard focus.
- `HTMLElement.forceSpellCheck()`: Runs the spelling and grammar check on the element's contents.

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
```