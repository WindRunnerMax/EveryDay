# Location Object
The `Location` object represents the URL of the object it is linked to, and any modifications made are reflected in the associated object. Both the `Document` and `Window` objects have a link to `Location`, which can be accessed through `document.location` and `window.location`, respectively.

## Properties
* `location.href`: Contains a `DOMString` of the entire URL, where `DOMString` is a `UTF-16` string that directly maps to a `String` in JavaScript.
* `location.protocol`: Contains the protocol of the URL as a `DOMString`, followed by a `:`.
* `location.host`: Contains the domain name as a `DOMString`, possibly followed by a `:` and the URL's port number.
* `location.hostname`: Contains the domain name of the URL as a `DOMString`.
* `location.port`: Contains the port number as a `DOMString`.
* `location.pathname`: Contains the path component of the URL as a `DOMString`, starting with a `/`.
* `location.search`: Contains the URL parameters as a `DOMString`, starting with a `?`.
* `location.hash`: Contains the fragment identifier as a `DOMString`, starting with a `#`.
* `location.origin`: Read-only, contains the standard form `DOMString` of the page's domain of origin.
* `location.ancestorOrigins`: Read-only, returns a static `DOMStringList` that includes in reverse order the origins of all ancestor browsing contexts associated with the given `Location` object. This can be used to determine if a site has framed an `iframe` document. This property is currently still in the proposal stage.

## Methods
* `location.assign()`: Loads the content resource of the given URL to the object associated with this `Location` object, effectively loading a new document.
* `location.reload()`: Reloads the resource from the current URL, with a special optional parameter of type `Boolean`. When this parameter is `true`, the method will always force the refresh to load data from the server. If the parameter is `false` or not specified, the browser may load the page from cache.
* `location.replace()`: Replaces the current resource with the given URL. Unlike the `assign()` method, the new page replaced by `replace()` will not be stored in the session history, meaning the user cannot return to the page using the back button.
* `location.toString()`: Returns a `DOMString` containing the entire URL, equivalent to reading `location.href`, but using it will not modify the value of `location`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Location
```