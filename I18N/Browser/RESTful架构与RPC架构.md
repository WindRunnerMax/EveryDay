# RESTful Architecture and RPC Architecture

In a `RESTful` architecture, the focus is on resources. Standard methods are used to retrieve and manipulate information fragments when operating on resources. In an `RPC` architecture, the focus is on methods. Server methods are invoked in the same manner as invoking local methods.

## RESTful Architecture
`REST` stands for Representational State Transfer, which is a software architectural style and can also be referred to as a pattern for designing APIs. `REST` uses HTTP protocol to define general verb methods such as `GET`, `POST`, `PUT`, `DELETE`, and it uniquely identifies network resources via URIs. The response side, based on the different requirements of the request side, represents the requested resource through stateless communication. An architecture that conforms to the `REST` design specifications is referred to as `RESTful`.

### Main Principles
* Everything on the network is abstracted as a resource.
* Each resource has a unique resource identifier.
* Operations on resources do not change the resource identifier.
* All operations are stateless.
* The same resource has multiple representations such as `xml`, `json`, etc.

### Uniform Resource Interface
Security refers to accessing `REST` interfaces without causing changes to the server's resource state. Idempotent means that when the same `REST` interface URI is accessed multiple times, the resource state obtained is the same.
* `GET`: Safe and idempotent, used to read a resource.
* `POST`: Not safe and not idempotent, used to create resources with automatically generated instance numbers on the server, and to update partial resources.
* `PUT`: Not safe and idempotent, used to create resources and update resources with instance numbers on the client side.
* `DELETE`: Not safe and idempotent, used to delete resources with instance numbers on the client side.

### Examples
* To query a `user`, `GET https://127.0.0.1/user/1`, directly carry `params` to query the user.
* To add a `user`, `POST https://127.0.0.1/user`, include user registration information in the request `body`.
* To modify a `user`, `PUT https://127.0.0.1/user`, include the `userid` identification information in the request `body`.
* To delete a `user`, `DELETE https://127.0.0.1/user`, include the `userid` identification information in the request `body`.
* Use the request header `Accept` to obtain different forms of the same resource, such as `application/json` and `application/xml`.
* If the version number is considered as different representations of the same resource, it should also be distinguished in the `Accept` field instead of directly adding the version number to the `URI`.

## RPC Architecture
`RPC` stands for Remote Procedure Call, which can be simply understood as one node requesting a service provided by another node. Remote procedure call is in contrast to local procedure call. When calling a method, the method on the remote server is invoked in the same manner as calling a local method, achieving lightweight and transparent communication.

### Structural Components
* Client: The caller of the service.
* Server: The provider of the service.
* Client Stub: Packages client request parameters into network messages and sends them to the service provider.
* Server Stub: Receives messages sent by the client, unpacks the messages, and calls local methods.

### Communication Process

```
Client
1. Maps the call to a Call Id
2. Serializes the Call Id, along with parameters, into binary form
3. Sends the serialized data packet over the network
4. Awaits server response
5. When the server call is successful and returns a result, deserializes and proceeds with the next steps

Server
1. Maintains a Call Id Map locally to ensure the correspondence between Id and the called method
2. Awaits client requests
3. Upon receiving a request, deserializes the data packet to obtain the Call Id and parameters
4. Searches the Map for the function pointer corresponding to the Call Id
5. Calls the function via the function pointer, passing the deserialized parameters, and obtains the result
6. Serializes the result and returns it to the client over the network

Note:
- Here, the client refers to the local caller, which can also be a server
- Here, the server refers to the callee, which can also be a server
- Whether using sockets for TCP transmission or HTTP for transmission, both are feasible for data packet communication
```

## Related Comparisons
* In terms of communication protocol, `RESTful` uses the `HTTP` protocol for data transmission, while `RPC` generally uses the `TCP` protocol for data transmission. However, the transmission protocol is not the focus of `RPC`. Typically, `TCP` protocol is used for its high efficiency, while using `HTTP` protocol for transmission is completely feasible.
* In terms of performance, the transmission efficiency of `RPC` is higher than that of `RESTful` because `RPC` has an efficient and compact inter-process communication mechanism and transmits small amounts of data, resulting in higher efficiency when exchanging large amounts of messages.
* In terms of flexibility, the flexibility of the `RESTful` architecture is higher than that of the `RPC` architecture. Using the `RESTful` architecture provides better readability, while `RPC` is slightly cumbersome to write and debug.
* Using the `RESTful` architecture for data transmission provides multi-language support. The `HTTP` protocol is relatively more standardized, universal, and standard. For middleware, the first supported protocols usually include the `RESTful` data transmission specification.
* It is recommended to use `RPC` for internal service invocation, while `RESTful` is recommended for external interfaces. For example, the microservices architecture pattern generally adopts the `RPC` for internal and `RESTful` for external communication pattern.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/7d6853140e13
https://www.jianshu.com/p/ee92c9accedd
https://www.zhihu.com/question/28570307
https://www.zhihu.com/question/25536695
https://www.runoob.com/w3cnote/restful-architecture.html
https://blog.csdn.net/bieleyang/article/details/76272699
https://blog.csdn.net/u014590757/article/details/80233901
```