# Fetch Method in JavaScript
The `fetch()` method is defined on the `Window` object and the `WorkerGlobalScope` object to initiate resource requests. It returns a `Promise` object, which is resolved after the request response and returns a `Response` object.

## Description
`Promise<Response> fetch(input[, init])` 

`input`: Specifies the resource to be fetched and can have the following values:
* A string containing the URL of the resource to be fetched. Some browsers accept `blob` and `data` as `schemes`.
* A `Request` object.

`init`: An options object that includes all the request settings. The optional parameters include:
* `method`: The request method to be used, such as `GET` or `POST`.
* `headers`: The request headers, in the form of a `Headers` object or an object literal containing `ByteString` values.
* `body`: The request body information, which can be a `Blob`, `BufferSource`, `FormData`, `URLSearchParams`, or `USVString` object. Note that the `GET` or `HEAD` method requests cannot contain a `body`.
* `mode`: The request mode, such as `cors`, `no-cors`, or `same-origin`.
* `credentials`: The request credentials, such as `omit`, `same-origin`, or `include`. This option must be provided to automatically send `cookies` within the current domain.
* `cache`: The request cache mode: `default`, `no-store`, `reload`, `no-cache`, `force-cache`, or `only-if-cached`.
* `redirect`: Available `redirect` modes: `follow` for automatic redirection, `error` to automatically terminate if a redirection occurs and throw an error, or `manual` for manual redirection handling.
* `referrer`: A `USVString` that can be `no-referrer`, `client`, or a `URL`, with the default being `client`.
* `referrerPolicy`: Specifies the value of the `referer` HTTP header and can be one of the following: `no-referrer`, `no-referrer-when-downgrade`, `origin`, `origin-when-cross-origin`, `unsafe-url`.
* `integrity`: Includes the `subresource integrity` value of the request, for example: `sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=`.

It returns a `Promise` which resolves to a `Response` object.

## Difference between fetch and jQuery.ajax
* When a `fetch()` call receives an HTTP status code indicating an error, the returned `Promise` is not marked as `reject`, even if the response HTTP status code is `404` or `500`. Instead, the `Promise` resolves, but the `ok` property of the resolved value is set to `false` only in the case of network failure or when the request is blocked.
* `fetch()` does not accept cross-origin `cookies`, and it cannot establish cross-origin sessions. The `Set-Cookie` header from other domains will be ignored.
* `fetch()` does not send `cookies` unless the `credentials` initialization option is used.

## Examples

### Making a Request
Initiating a simple resource request with `fetch` returns a `Promise` object, which resolves to a `Response` object after the request response.

```javascript
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js")
.then(res => console.log(res))
```

### Setting Parameters
Setting parameters via the `init` options object allows configuration of `method`, `header`, `body`, `mode`, `credentials`, `cache`, `redirect`, `referrer`, `referrerPolicy`, and `integrity`.

```javascript
var headers = new Headers({
    "accept": "application/javascript" 
});
headers.append("accept", "application/xml");
headers.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36");
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js", {
    method: "GET",
    headers: headers,
    cache: 'no-cache',
})
.then(res => console.log(res))
```

#### Headers Object
* `Headers.append()`: Adds a value to an existing `header` or adds a new `header` with a value.
* `Headers.delete()`: Deletes a specified `header` from the `Headers` object.
* `Headers.entries()`: Returns an iterator of all key-value pairs in the `Headers` object.
* `Headers.get()`: Returns all the values of a specified header from the `Headers` object as a `ByteString`.
* `Headers.has()`: Returns a boolean value indicating whether a specified `header` exists in the `Headers` object.
* `Headers.keys()`: Returns an iterator of all existing `header` names in the `Headers` object.
* `Headers.set()`: Replaces the value of an existing `header` or adds a new `header` with a value.
* `Headers.values()`: Returns an iterator of all the values of existing `header`s in the `Headers` object.

### Handling the Response
Handling the response data using the `Response` object, including retrieving the response status and processing the response body.

```javascript
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js")
.then(res => res.text())
.then(data => console.log(data))
```

#### Response Object
Properties and methods related to the `Response` object:
* `Response.headers`: Read-only. Contains the `Headers` object associated with this `Response`.
* `Response.ok`: Read-only. Contains a boolean value indicating whether the `Response` was successful, with an `HTTP` status code in the range of `200-299`.
* `Response.redirected`: Read-only. Indicates whether the `Response` is from a redirect. If so, its `URL` list will have multiple entries.
* `Response.status`: Read-only. Contains the status code of the `Response`.
* `Response.statusText`: Read-only. Contains the status message consistent with the `Response` status code.
* `Response.type`: Read-only. Contains the type of the `Response`, such as `basic` or `cors`.
* `Response.url`: Read-only. Contains the `URL` of the `Response`.
* `Response.useFinalURL`: Contains a boolean value to indicate whether this is the final `URL` of the `Response`.
* `Response.clone()`: Creates a clone of the `Response` object.
* `Response.error()`: Returns a new `Response` object bound to a network error.
* `Response.redirect()`: Creates a new `Response` with a different `URL`.

The `Response` implements the `Body` interface, and the related properties and methods can be used directly:
* `Body.body`: Read-only. A simple getter that exposes the `body` content as a `ReadableStream` type.
* `Body.bodyUsed`: Read-only. Contains a boolean value to indicate whether the `Response`'s `Body` has been read.
* `Body.arrayBuffer()`: Reads the `Response` object, marks it as read, and returns a `Promise` object parsed as an `ArrayBuffer`. The `Response` objects are set as `stream` mode, so they can only be read once.
* `Body.blob()`: 
Reads the `Response` object, marks it as read, and returns a `Promise` object parsed as a `Blob`.
* `Body.formData()`: 
Reads the `Response` object, marks it as read, and returns a `Promise` object parsed as a `FormData`.
* `Body.json()`: 
Reads the `Response` object, marks it as read, and returns a `Promise` object parsed as a `JSON`.
* `Body.text()`: 
Reads the `Response` object, marks it as read, and returns a `Promise` object parsed as a `USVString`.


## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://segmentfault.com/a/1190000012740215
https://developer.mozilla.org/zh-CN/docs/Web/API/Headers
https://developer.mozilla.org/zh-CN/docs/Web/API/Response
https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
https://developer.mozilla.org/zh-CN/docs/Web/API/WindowOrWorkerGlobalScope/fetch
```