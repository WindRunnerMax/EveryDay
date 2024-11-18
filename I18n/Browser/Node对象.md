# Node Object
The `Node` is an interface from which various types of `DOM API` objects inherit, allowing us to treat these different types of objects in a similar manner.

## Properties
* `Node.prototype.baseURI`: Read-only, returns a `DOMString` representing the `base URL`. The concept of `base URL` varies in different languages, in `HTML` it represents the protocol and domain, and also the file directory up to the last `/`.
* `Node.prototype.baseURIObject`: Read-only `nsIURI` object representing the element's `base URI` (not applicable to web content).
* `Node.prototype.childNodes`: Read-only, returns a live `NodeList` containing all child nodes of the node. The `NodeList` is dynamically updated, if the node's child nodes change, the `NodeList` object will automatically update.
* `Node.prototype.firstChild`: Read-only, returns the first child `Node` of the node, returns `null` if the node has no child nodes.
* `Node.prototype.isConnected`: Read-only, returns a boolean value to check if the node is connected (directly or indirectly) to a context object, such as the `Document` object in usual `DOM` scenarios, or the `ShadowRoot` object in `shadow DOM` scenarios.
* `Node.prototype.lastChild`: Read-only, returns the last child `Node` of the node, returns `null` if the node has no child nodes.
* `Node.prototype.nextSibling`: Read-only, returns the next sibling `Node` of the node at the same level, returns `null` if none exists.
* `Node.prototype.nodeName`: Read-only, returns a `DOMString` containing the name of the node. The structure of the node's name varies with the node type. The name of an `HTMLElement` corresponds to the associated tag, for example, `HTMLAudioElement` is `audio`, `Text` node corresponds to `#text`, and the `Document` node corresponds to `#document`.
* `Node.prototype.nodeType`: Read-only, returns an unsigned short integer value corresponding to the node type.
* `Node.prototype.nodeValue`: Returns or sets the value of the current node.
* `Node.prototype.ownerDocument`: Read-only, returns the `Document` object to which the element belongs. If there is no associated `Document` object, it returns `null`.
* `Node.prototype.parentNode`: Read-only, returns the parent `Node` of the current node. If there is no such node, for example if the node is the top of a tree structure or not inserted into a tree, this property returns `null`.
* `Node.prototype.parentElement`: Read-only, returns the parent `Element` of the current node. If the current node has no parent node or the parent node is not an `Element`, this property returns `null`.
* `Node.prototype.previousSibling`: Read-only, returns the previous sibling `Node` of the current node, returns `null` if no such node exists.
* `Node.prototype.textContent`: Returns or sets the text content of all child nodes and their descendants within an element.

## Methods
* `Node.prototype.appendChild()`: Appends the specified `childNode` as the last child to the current node. If the parameter references an existing node in the `DOM` tree, the node will be detached from its current position and appended to the new position.
* `Node.prototype.cloneNode()`: Clones a `Node`, and the option to choose whether to clone all the content under this node is available. By default, the content under the node will be cloned.
* `Node.prototype.compareDocumentPosition()`: Compares the position of the current node with another node in the document.
* `Node.prototype.contains()`: Returns a `Boolean` value to indicate whether the passed-in node is a descendant of the node.
* `Node.prototype.getRootNode()`: Returns the root node of the context object. If a `shadow root` node exists, it can also be included in the returned node.
* `Node.prototype.hasChildNodes()`: Returns a `Boolean` value to indicate whether the element has child nodes.
* `Node.prototype.insertBefore()`: Adds a child node `Node` under the current node and positions it in front of the reference node.
* `Node.prototype.isDefaultNamespace()`: Returns a `Boolean` value, accepting a namespace `URI` as a parameter. It returns `true` when the namespace referred to by the parameter is the default namespace, otherwise, it returns `false`.
* `Node.prototype.isEqualNode()`: Returns a `Boolean` value. It returns `true` when two `node` nodes are of the same type and their defined data points match (i.e., same attributes and attribute values, same node values), otherwise, it returns `false`.
* `Node.prototype.isSameNode()`: Returns a `Boolean` value, providing the result of comparing the references of these two nodes.
* `Node.prototype.lookupPrefix()`: Returns a `DOMString` containing the namespace prefix corresponding to the parameter `URI`, or `null` if it doesn't exist. If multiple matching prefixes exist, the result returned depends on the specific browser implementation.
* `Node.prototype.lookupNamespaceURI()`: Accepts a prefix and returns the node namespace `URI` corresponding to the prefix. Returns `null` if the `URI` does not exist. Passing in `null` as the `prefix` parameter will return the default namespace.
* `Node.prototype.normalize()`: Organizes all text child nodes under this element, merges adjacent text nodes, and removes empty text nodes.
* `Node.prototype.removeChild()`: Removes a child node of the current node. This child node must exist under the current node.
* `Node.prototype.replaceChild()`: Replaces one child node `Node` with another node for the selected node.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://developer.mozilla.org/en/docs/Web/API/Node