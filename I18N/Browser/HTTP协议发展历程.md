# Development History of the HTTP Protocol
The Hypertext Transfer Protocol (`HTTP`) is an application layer protocol used for transmitting hypertext documents. It is designed for communication between web browsers and web servers. Up to now, all versions of the `HTTP` protocol can be divided into `HTTP 0.9`, `HTTP 1.0`, `HTTP 1.1`, `HTTP 2.0`, and `HTTP 3.0`. Among them, the widely used version is `HTTP 1.1`, which is currently advancing towards `HTTP 2.0` and the future `HTTP 3.0` version.

## HTTP 0.9
`HTTP 0.9`, also known as the single-line protocol, originally did not have a version number. Later, its version number was designated as `0.9` to distinguish it from later versions. `HTTP 0.9` is extremely simple, with requests consisting of a single-line command starting with the only available `GET` method, followed by the path of the target resource. The response content of `HTTP 0.9` does not contain `HTTP` headers, which means that only `HTML` files can be transmitted, and other types of files cannot be transmitted. There are also no status codes or error codes. When an exception occurs, a special `HTML` file containing a description of the problem will be returned in the response.

### Characteristics
* It only has a single request line, without `HTTP` request headers and bodies.
* The server does not return header information, only data information.
* The returned file content is transmitted as an ASCII character stream because they are in HTML format, so using ASCII bytecode for transmission is most appropriate.

## HTTP 1.0
`HTTP 1.0` was designed for extensibility to meet the needs of transmitting various types of files and to allow deeper communication between clients and servers. `HTTP 1.0` introduced request and response headers, both of which are stored in a `Key-Value` form. When sending an `HTTP` request, request header information will be included, and when the server returns data, it will first return response header information.

### Characteristics
* The protocol version information is sent with each request, i.e., `HTTP 1.0` is appended to the `GET` line.
* Introducing request headers, when making a request, the client will inform the server through `HTTP` request headers what type of file it expects the server to return, in what form it should be compressed, what language the file should be provided in, and the specific encoding of the file.
* Introducing response headers, the server prepares data based on the information in the request headers and informs the client through the information in the response headers of the format in which the data is returned. If an unsupported format is encountered, only the supported format by the server can be returned, which will be reflected in the response headers. In other words, the browser ultimately interprets the data based on the information in the response headers.
* Introducing status codes, status codes are sent at the beginning of the response to allow the browser to understand whether the request was successful or not and adjust its behavior accordingly.
* Introducing a caching mechanism through status codes and `If-Modified-Since`, `Expires`, and other controls for updating or using local caches.
* Introducing the `Content-Type` header, allowing `HTTP` to transmit documents other than pure text `HTML` files.

## HTTP 1.1
`HTTP 1.1` is a standardized protocol that eliminates a significant amount of ambiguity and introduces multiple improvements.

### Characteristics
* Cache handling: `HTTP 1.1` introduced additional caching control strategies, such as `Entity tag`, `If-Unmodified-Since`, `If-Match`, `If-None-Match`, and more cache headers for control.
* Bandwidth optimization and use of network connections: `HTTP 1.1` introduced the `range` in the request header, allowing only a part of a resource to be requested, resulting in a `206` status code. This allows developers to freely choose to fully utilize bandwidth and connections, and implement breakpoint resumable downloads using `Range` and `Content-Range`.
* Error notification management: `HTTP 1.1` introduced 24 new error status codes.
* Addition of the `Host` request header, allowing different domain names to be hosted on the same `IP` address server.
* Support for persistent connections: `HTTP 1.1` supports persistent connections, enabling multiple `HTTP` requests and responses to be transmitted on a single `TCP` connection, reducing the overhead and delays of establishing and closing connections. In `HTTP 1.1`, `Connection: keep-alive` is enabled by default, and browsers typically allow up to 6 persistent connections to the same domain.
* Introduction of pipelining technology: allowing the second request to be sent before the first response is fully sent to improve the head-of-line blocking problem, although the responses are still returned in the order of the requests.
* Support for chunked responses: using `Transfer-Encoding: chunked` for chunked responses, allowing response data to be divided into multiple parts. Releasing the buffer as early as possible on the server side can achieve faster response speeds.

## HTTP 2.0
`HTTP 2.0` offers better performance. As web pages become increasingly complex, even evolving into standalone applications, and with the increase in media playback and the growth of interactive script sizes, more data is being transmitted through HTTP requests. As a result, `HTTP 2.0` has made significant optimizations for network efficiency.

### Features
* Binary framing: `HTTP 2.0` is a binary protocol rather than a text protocol. It divides all transmitted information into smaller messages and frames, encoding them in binary format.
* Multiplexing: Parallel requests can be processed in the same connection. All access under the same domain goes through the same TCP connection. HTTP messages are broken down into independent frames, and the server reassembles them based on identifiers and headers, eliminating the sequencing and blocking constraints in HTTP 1.1.
* Header compression: Headers in a series of requests are often similar, so this feature removes the cost of duplicating and transmitting redundant data.
* Server push: Servers can proactively push resources to clients without the need for an explicit client request.

## HTTP 3.0
`HTTP 3.0` is currently in the drafting and testing phase. It is a brand-new HTTP protocol for the future. Operating on top of the `QUIC` protocol, `HTTP 3.0` achieves reliable transmission over `UDP`, balancing transmission speed and reliability, and optimizing them. Using `UDP` helps avoid the head-of-line blocking problem of `TCP` and speeds up network transmission. However, it still requires mechanisms for reliable transmission. `HTTP 3.0` is not an extension of `HTTP 2.0`; it will be an entirely new protocol.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.cnblogs.com/heluan/p/8620312.html
https://www.lizenghai.com/archives/67621.html
https://juejin.im/post/5ce37660f265da1bb13f05f0
https://www.chainnews.com/zh-hant/articles/401950499827.htm
https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP
```