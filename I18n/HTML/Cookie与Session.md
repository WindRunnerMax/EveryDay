# Cookies and Sessions
Session tracking is a commonly used technique in web applications. Since the HTTP protocol is stateless, tracking the user's identity requires tracking the entire session. The most commonly used session tracking methods are cookies and sessions. In simple terms, cookies determine the user's identity by storing information on the client side, while sessions determine the user's identity by storing information on the server side.

## Cookies
Since the HTTP protocol is stateless, once the data exchange is completed, the connection is closed. To exchange data again, a new connection is required. This means that the server cannot track the session from the connection. If both A and B purchase an item at the same time without session tracking, the server cannot determine who purchased the item.  
To enable session tracking, the server issues a pass to each client, and each person must carry the pass when accessing. This way, the server can distinguish the user's identity.  
Cookies are actually small pieces of text information. The server sends the pass information (cookie) to the browser, which stores it. For each request from the same origin, the browser automatically carries the pass information (this is the basis for CSRF protection). As a result, the server can determine the user's identity.

## Sessions
Sessions are a server-side mechanism for recording client state, which also increases the storage pressure on the server.  
For each client session, there is a unique SESSION ID associated with it. The server stores user data in a file or memory corresponding to the SESSION ID. As long as the client provides the SESSION ID to the server with each request, the server can distinguish the user and track the session.

## Example

### Using Cookies Only
Using only cookies for user identity tracking, the server informs the browser of all user data information, which the browser stores. The data is sent to the server with each request. This method is theoretically feasible, but it is not secure, especially when user data is not encrypted. If it is attacked by a man-in-the-middle, all user data will be leaked. Alternatively, the user may modify the browser data to forge requests and access the server with someone else's identity. In addition, different browsers have limitations on the size (usually around 4KB) and number of cookies for the same domain. Storing all user data in cookies may result in insufficient space or quantity.

### Using Sessions Only
Using only sessions for user identity tracking, since only a SESSION ID needs to be transmitted from the client to the server for session tracking, the implementation is relatively simple. It can be achieved by appending a SESSION ID to all URLs or by setting a hidden input field for each form to store the SESSION ID for submission. The server can then track the session. Since the data is stored on the server, it is relatively secure, and the storage capacity depends entirely on the server, which can be well controlled.

### Combined Use
The commonly used approach now is to combine cookies and sessions. The SESSION ID is directly stored in the COOKIE, and the browser automatically carries the COOKIE in the request header for the same origin, enabling session tracking. This way, there is no need to store a large amount of information in the COOKIE or manipulate the SESSION ID for each request. The "Cookie" field in the browser's request header, such as "JSESSION ID=XXXXXXXXXXXXXXXXXXX" for Java's default SESSION ID or "PHPSESSID=XXXXXXXXXXXXXXXXXXXXXXXXXX" for PHP's default SESSION ID, represents this.

## Differences

### Storage Location
Cookies store data in the browser, while sessions store data on the server.

### Type
Cookies store data as strings, while sessions store data as objects on the server.

### Security
Cookies can be modified and forged by users on the client side, while sessions cannot be directly modified or forged by users on the server side.

### Scope
Due to the same-origin policy of browsers, cookies are only sent in the same origin, while sessions can theoretically be shared across multiple domains on the server side.

### Storage Size
Cookies are limited in size by the browser, generally not exceeding 4KB, while the size of sessions on the server side can be flexibly controlled.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```