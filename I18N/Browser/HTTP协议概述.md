# Overview of HTTP Protocol

The `HTTP` (Hypertext Transfer Protocol) is a data transfer protocol based on the `TCP/IP` communication protocol.

## Characteristics
* `HTTP` is connectionless: This means that each connection handles only one request at a time. Once the server processes the client's request and receives the response, it disconnects. This approach helps save transmission time.
* `HTTP` is media-independent: As long as the client and server know how to handle the data content, any type of data can be sent via `HTTP`. The `Content-Type` is used in `HTTP` to indicate the resource media type.
* `HTTP` is stateless: The protocol has no memory of previous transactions. Lack of state means that if subsequent processing requires previous information, it must be retransmitted, potentially increasing the amount of data transmitted each time. On the other hand, the response is faster when the server does not need previous information.

## Request Methods
`HTTP1.0` defines three request methods: `GET`, `POST`, and `HEAD`.
`HTTP1.1` adds six request methods: `OPTIONS`, `PUT`, `PATCH`, `DELETE`, `TRACE`, and `CONNECT`.
* `GET`: Requests the specified page information and returns the entity body. Due to browser limitations on URL length, it is generally recommended to use no more than `4K`.
* `POST`: Submits data to be processed by a specified resource (e.g., submitting a form or uploading a file). The data is included in the request body. A `POST` request may lead to the creation of a new resource and/or the modification of an existing resource. The maximum resource size carried by the request is determined by the server.
* `HEAD`: Similar to a `GET` request, but the response does not contain specific content; it is used to retrieve headers.
* `PUT`: Transmits data from the client to replace the content of a specified document.
* `DELETE`: Requests the server to delete the specified page.
* `CONNECT`: Opens a bi-directional communication channel between the client and the requested resource, which can be used to create a tunnel.
* `OPTIONS`: Used to obtain the communication options supported by the intended resource.
* `TRACE`: Implements a message loop-back test along the path towards the target resource, providing a practical debugging mechanism.
* `PATCH`: Serves as a supplement to the `PUT` method, used to perform partial updates on known resources.


## Request Headers
* `Accept`: Specifies the content types that the client can accept.
* `Accept-Charset`: The character encoding set that the browser can accept.
* `Accept-Encoding`: Specifies the compression encoding types that the browser can support for web server responses.
* `Accept-Language`: The languages that the browser can accept.
* `Accept-Ranges`: One or more subfields that can request entity ranges of a web page.
* `Authorization`: The authorization credentials for HTTP authorization.
* `Cache-Control`: Specifies the caching mechanism to be followed for the request and response.
* `Connection`: Indicates whether a persistent connection is required.
* `Cookie`: When an HTTP request is sent, all the cookie values saved under that request domain are sent to the web server together.
* `Content-Length`: The length of the request's content.
* `Content-Type`: The MIME information corresponding to the request's entity.
* `Date`: The date and time when the request was sent.
* `Expect`: The specific server behavior expected for the request.
* `From`: The email of the user sending the request.
* `Host`: Specifies the domain name and port number of the requested server.
* `If-Match`: The HTTP request header makes the request conditional. For `GET` and `HEAD` methods, the server will only send back the resource `ETags` if they match the requested resource. For `PUT` and other unsafe methods, it will only upload the resource if it has not been modified.
* `If-Modified-Since`: If the portion requested has been modified after the specified time, the request is successful; otherwise, a `304` code is returned.
* `If-None-Match`: Returns a `304` code if the content has not changed. The parameter is the `Etag` previously sent by the server, and it is compared with the server's response to determine if it has changed.
* `If-Range`: If the entity has not changed, the server sends the client the missing parts; otherwise, it sends the entire entity. The parameter is also the `Etag`.
* `If-Unmodified-Since`: Only successful if the entity has not been modified after the specified time.
* `Max-Forwards`: Limits the time for information to be transmitted through proxies and gateways.
* `Pragma`: Used to contain implementation-specific directives.
* `Proxy-Authorization`: Contains credentials used to authenticate the user agent to the proxy server, usually in response to a `407` `Proxy Authentication Required` status and `Proxy-Authenticate` header.
* `Range`: Requests only a portion of the entity, specifying the range.
* `Referer`: The address of the previous webpage, immediately followed by the current requested webpage; that is, the referrer.
* `TE`: The transfer encodings that the client is willing to accept, and it informs the server to accept the tail add-on header information.
* `Upgrade`: Specifies a certain transport protocol to the server for conversion (if supported).
* `User-Agent`: The `User-Agent` content contains the user information for the request.
* `Via`: Informs the intermediary gateway or proxy server of the address and communication protocol.
* `Warning`: Warning information about the message entity.
* `X-Forwarded-For`: `XFF` is a de facto standard header used to identify the originating IP address of the client connecting to the web server through an HTTP proxy or load balancer.
* `X-Forwarded-Host`: `XFH` is a de facto standard header used to identify the original host requested by the client in an HTTP request header.
* `X-Forwarded-Proto`: `XFP` is a de facto standard header used to identify the protocol as `HTTP` or `HTTPS` through which the client is connecting to the proxy or load balancer.

## Response Headers
* `Accept-Ranges`: Indicates whether the server supports specified range requests and what type of partial requests it supports.
* `Age`: Estimated time that the response was formed since it left the original server to the proxy cache.
* `Allow`: Specifies the valid request methods for a network resource; if not allowed, returns `405`.
* `Cache-Control`: Specifies whether and what type of caching is allowed for all caching mechanisms.
* `Content-Encoding`: The compression encoding types supported by the web server for the returned content.
* `Content-Language`: The language of the response body.
* `Content-Length`: The length of the response body.
* `Content-Location`: An alternative location for the requested resource.
* `Content-MD5`: The MD5 hash value of the returned resource.
* `Content-Range`: The byte range of the current part within the entire response body.
* `Content-Type`: The MIME type of the returned content.
* `Date`: The time when the original server message was sent out.
* `ETag`: The current value of the entity tag for the requested variant.
* `Expires`: The date and time when the response expires.
* `Last-Modified`: The last modified time of the requested resource.
* `Location`: Used to redirect the recipient to a different URL to complete the request or to identify a new resource.
* `Pragma`: Includes implementation-specific directives that can be applied to any recipient in the response chain.
* `Proxy-Authenticate`: Indicates the authentication scheme and parameters that apply to the URL on the proxy.
* `refresh`: Applied to redirects or when a new resource is created, it redirects after 5 seconds.
* `Retry-After`: Informs the client to retry the request after a specified time if the entity is temporarily unavailable.
* `Server`: The name of the web server software.
* `Set-Cookie`: Sets an HTTP cookie.
* `Trailer`: Indicates that header fields are present in the footer of a chunked transfer-encoded message.
* `Transfer-Encoding`: The file transfer encoding.
* `Vary`: Specifies whether downstream proxies should use the cached response or request from the original server.
* `Via`: Informs the client and intermediary agents where the response was sent from.
* `Warning`: Indicates potential problems with the entity.
* `WWW-Authenticate`: Specifies the authorization scheme to be used by the client request entity.
* `X-Frame-Options`: Can be used to indicate whether a browser should be allowed to render a page within a `<frame>`, `<iframe>`, or `<object>`. Sites can use this feature to prevent clickjacking attacks by ensuring that their content is not embedded in other websites.
* `X-XSS-Protection`: Prevents the page from loading when a reflected cross-site scripting (`XSS`) attack is detected.

## Status Codes
### Five Types
* `1xx`: Informational - The server has received the request and requires the requester to continue performing an operation.
* `2xx`: Success - The operation was successfully received and processed.
* `3xx`: Redirection - Further action is required to complete the request.
* `4xx`: Client Error - The request contains a syntax error or cannot be completed.
* `5xx`: Server Error - The server encountered an error while processing the request.

### Detailed
* `100` `Continue`: Keep going, the client should continue its request.
* `101` `Switching Protocols`:  Switching Protocols. The server switches protocols based on the client's request. It can only switch to a higher-level protocol, such as switching to a new version of the `HTTP` protocol.
* `200` `OK`: The request was successful. Generally used for `GET` and `POST` requests.
* `201` `Created`: Created. The request was successful and a new resource was created.
* `202` `Accepted`: Accepted. The request has been accepted but not yet completed.
* `203` `Non-Authoritative Information`:    Non-authoritative information. The request was successful, but the returned `meta` information is not from the original server, but from a copy.
* `204` `No Content`: No content. The server processed the request successfully but did not return any content. This ensures that the browser continues to display the current document without updating the webpage.
* `205` `Reset Content`: Reset content. The server processed successfully, and the user terminal should reset the document view. This status code can be used to clear the form fields in the browser.
* `206` `Partial Content`: Partial content. The server successfully processed part of the `GET` request.
* `300` `Multiple Choices`: Multiple choices. The requested resource may be in multiple locations, and the response can provide a list of resource characteristics and addresses for the user terminal to choose from.
* `301` `Moved Permanently`: Moved permanently. The requested resource has been permanently moved to a new `URI`, and the response will include the new `URI`. The browser will automatically redirect to the new `URI`. Any future requests should use the new `URI` instead.
* `302` `Found`: Found. Temporarily moved, similar to `301`, but the resource has only been temporarily moved, and the client should continue to use the original `URI`.
* `303` `See Other`: See other address. Similar to `301`. Using `GET` and `POST` requests to view.
* `304` `Not Modified`: Not modified. The requested resource has not been modified. When the server returns this status code, it will not return any resources. Clients usually cache visited resources and indicate, by providing a header, that they only want to return resources modified after a specific date.
* `305` `Use Proxy`: Use proxy. The requested resource must be accessed through a proxy.
* `306` `Unused`: This `HTTP` status code is deprecated.
* `307` `Temporary Redirect`: Temporary redirect. Similar to `302`. Using `GET` requests for redirection.
* `400` `Bad Request`: The client's request had a syntax error that the server couldn't understand.
* `401` `Unauthorized`: The request requires user authentication.
* `402` `Payment Required`: Reserved for future use.
* `403` `Forbidden`: The server understands the client's request but refuses to execute it.
* `404` `Not Found`: The server could not find the resource based on the client's request.
* `405` `Method Not Allowed`: The method in the client's request is not allowed.
* `406` `Not Acceptable`: The server cannot complete the request based on the characteristics of the client's request content.
* `407` `Proxy Authentication Required`: The request requires proxy authentication. Similar to `401`, but the requester should use the proxy for authorization.
* `408` `Request Time-out`: The server waited too long for the client to send the request and timed out.
* `409` `Conflict`: The server might return this code when completing a client's `PUT` request and a conflict occurred during the request processing.
* `410` `Gone`: The resource requested by the client no longer exists. `410` differs from `404`. If a resource previously existed but has now been permanently deleted, the `410` code can be used. Website designers can specify the new location of the resource using a `301` code.
* `411` `Length Required`: The server cannot process the client's request information without the `Content-Length`.
* `412` `Precondition Failed`: The client's request information's precondition is not met.
* `413` `Request Entity Too Large`: The server cannot process the request because the entity is too large and thus rejects it. To prevent continuous requests from the client, the server might close the connection. If the server is only temporarily unable to process, it will include a `Retry-After` response message.
* `414` `Request-URI Too Large`: The requested `URI` is too long for the server to process.
* `415` `Unsupported Media Type`: The server cannot process the attached media format requested by the client.
* `416` `Requested range not satisfiable`: The range requested by the client is invalid.
* `417` `Expectation Failed`: The server cannot meet the request header information of `Expect`.
* `500` `Internal Server Error`: An internal server error occurred, and the request cannot be completed.
* `501` `Not Implemented`: The server does not support the requested function and cannot complete the request.
* `502` `Bad Gateway`: When a server acting as a gateway or proxy attempts to process a request, it receives an invalid response from the remote server.
* `503` `Service Unavailable`: The server is temporarily unable to process the client's request due to overload or maintenance. The length of the delay can be included in the server's `Retry-After` header information.
* `504` `Gateway Time-out`: A server acting as a gateway or proxy did not receive a timely response from the remote server.
* `505` `HTTP Version not supported`: The server does not support the `HTTP` protocol version of the request and cannot complete the processing.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://cloud.tencent.com/developer/doc/1117
https://www.runoob.com/http/http-tutorial.html
https://developer.mozilla.org/zh-CN/docs/Web/HTTP
```