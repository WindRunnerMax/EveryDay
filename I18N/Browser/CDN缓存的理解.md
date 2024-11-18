# Understanding CDN caching
`CDN` stands for Content Delivery Network. The basic principle of CDN is to widely use various caching servers, distributing these caching servers to regions or networks where user access is relatively concentrated. When users access a website, global load balancing technology is used to direct their access to the nearest functioning caching server. The caching server directly responds to user requests. The basic idea of CDN is to avoid potential bottlenecks and issues that may affect data transmission speed and stability on the internet, making content delivery faster and more stable. By placing node servers in various locations on the network, CDN systems can dynamically redirect user requests to the nearest service node based on network traffic, node connections, load conditions, distance to users, response time, and other comprehensive information. The goal is to allow users to obtain the required content nearby, solve congestion issues on the internet, and improve the response speed of accessing websites.

## Components
* Functionally, a CDN system consists of a distribution service system, a load balancing system, and an operation management system. The distribution service system is mainly responsible for resource response, caching, and synchronization. The load balancing system is mainly responsible for balancing the load of multiple content caching devices and caching load balancing, as well as access control and routing of content. The operation management system is responsible for operational requirement management and network system management.
* In terms of node distribution, the CDN system is mainly divided into the edge layer and the central layer. The edge layer is distributed at the edge of the CDN network, providing users with nearby access services. The central layer is responsible for resource synchronization and operation management functions. The central layer stores relevant configuration information for accelerated domains, such as the origin domain name, and also caches various resources under the accelerated domain. When the edge layer node fails to hit the cache, it needs to send a request to the central layer node. If the central layer node fails to hit the cache, it needs to look up the corresponding origin domain name and send a request to that origin domain name, and then return and cache the requested resource layer by layer.

## Functions
* Save backbone network bandwidth and reduce bandwidth demand.
* Reduce the impact of communication storms and improve the stability of network access.
* Provide server-side acceleration to solve server overload issues caused by high user traffic.
* Overcome the problem of uneven distribution of website users and reduce the construction and maintenance costs of websites.
* Provide resource access caching to reduce response latency for accessing the same object and reduce backbone network bandwidth usage.

## Key Technologies
* Cache algorithms determine hit rates, source server load, and POP node storage capacity.
* Distribution capability depends on IDC capability and IDC strategically distributed.
* Load balancing determines optimal routing, response time, availability, and service quality.
* DNS-based load balancing achieves optimal node service through CNAME.
* Cache points include client browser cache and local DNS server cache.
* Cache content includes DNS address cache, client request content cache, and dynamic content cache.
* Supported protocols include static and dynamic acceleration, image acceleration, HTTPS certificate acceleration, download acceleration, and more.

## Configuration
When using CDN services provided by a CDN service provider, some configurations need to be made:
* Resolve a subdomain, which can be initially resolved to any address, such as `cdn.example.com`.
* Add this domain to the service provider and set the origin domain name, such as `www.example.com`.
* At this point, the service provider will generally assign a CNAME address, such as `cdn.example.com.service.com`.
* Add the domain from the first step as a CNAME record to the assigned CNAME address.
* Alternatively, if the service provider provides a CNAME address in the first step, simply resolve it.

## Access Process
The access process of a simple CDN, using a pull method to fetch the cache, is as follows:
* When accessing a resource, load the resource file from the aforementioned subdomain, and perform DNS resolution for that domain.
* Return the CNAME address, and then resolve the CNAME address.
* Obtain the IP address corresponding to the CNAME domain name, pointing to the CDN edge layer node.
* If the CDN edge layer node fails to hit the resource cache, it requests from the central layer node.
* If the central layer node fails to hit the resource cache, it retrieves the resource from the origin domain name server.
* After successfully obtaining the resource, it is returned layer by layer and cached.
* During this process of searching for resources, the domain name may change, but the resource path remains unchanged.
* Subsequent accesses can directly retrieve the cache from the edge node without the need to retrieve from the origin, speeding up resource access.

## Cache Control
There are two major challenges in computing: when the cache expires and how to name it. In the context of CDN, cache expiration is a tricky problem. If the resource files on the origin server change and the user retrieves the resources from the cache node, it will result in inconsistent resource files. One way to solve this problem is to refresh all CDN caches by actively pushing them, but this method is costly. A simpler solution is to invalidate the cache after a fixed period of time. In addition to controlling the cache on the nodes, the user's local cache also needs to be controlled. The HTTP protocol provides the following cache control methods:

### Strong Cache
Strong cache controls the validity period of the cache stored locally through `Expires` and `Cache-Control`.

#### Expires
`Expires` is a header introduced by HTTP 1.0 to indicate the expiration time of a resource. It represents an absolute time returned by the server. `Expires` is limited by the local time, so modifying the local time may cause the cache to expire. For a resource request, if it is within the `Expires` period, the browser will directly read the cache and will not request the server.

```
Expires: Sun, 14 Jun 2020 02:50:57 GMT
```

#### Cache-Control
`Cache-Control` appeared in HTTP 1.1 and has a higher priority than `Expires`. It represents a relative time and is supported by both request and response headers. Different values provided by `Cache-Control` define different caching strategies.

```
Cache-Control: max-age=300
```

* `Cache-Control: no-store`: The cache cannot store any content related to client requests and server responses. Each request initiated by the client will download the complete response content.
* `Cache-Control: no-cache`: The cache stores the server's response content, but this cache cannot be provided to the browser until the freshness is revalidated with the server. In simple terms, the browser caches the server's response resources, but for each request, the cache needs to evaluate the validity of the cached response with the server. Based on whether the response is `304` or `200`, it determines whether to use the local cached resource or the server's response resource.
* `Cache-Control: public || private`: `public` indicates that the response can be cached by any intermediary, such as a proxy or CDN. The default response is `private`, which means that the response is private and intermediaries cannot cache it. The response can only be applied to the browser's private cache.
* `Cache-Control: max-age=31536000`: The response has the maximum expiration time, and the directive is `max-age=<seconds>`, which indicates the maximum time the resource can be cached and kept fresh, in seconds from the time the request is initiated.
* `Cache-Control: must-revalidate`: When the `must-revalidate` directive is used, it means that when the cache considers using a stale resource, it must first validate its status. Expired caches will not be used. In normal cases, it is not necessary to use this directive because in the case of strong cache expiration, negotiated caching will be performed. However, the HTTP specification allows clients to use expired caches in certain special cases, such as when the validation request fails or when there are some special directives configured, such as `stale-while-revalidate` and `stale-if-error`. The `must-revalidate` directive ensures that the cache must be revalidated in any case after expiration. 

### Negotiated Caching
When the browser's request for a resource does not hit the strong cache, it sends a request to the server to verify if the negotiated cache is hit. If the negotiated cache is hit, the response status returned is `304 (Not Modified)`, and the request does not carry entity data. If it is not hit, the response is `200` and carries the resource entity data. Negotiated caching is managed using the `Last-Modified, If-Modified-Since` and `ETag, If-None-Match` pairs of headers.

#### Last-Modified If-Modified-Since

`Last-Modified` and `If-Modified-Since` were introduced in `HTTP 1.0`. `Last-Modified` indicates the last modification date of the local file. The browser adds `If-Modified-Since` to the request header, which is the value of the previous response's `Last-Modified`, to ask the server if the resource has been updated since that date. If there are updates, the server will send the new resource back. However, if the cached file is opened locally, the `Last-Modified` will be modified. Therefore, `ETag` was introduced in `HTTP 1.1`.

#### ETag If-None-Match

`ETag` is like a fingerprint. Any changes to the resource will cause the `ETag` to change, regardless of the last modification time. `ETag` ensures that each resource is unique. The request header field `If-None-Match` sends the previously returned `ETag` to the server to inquire if the resource's `ETag` has been updated. If there are changes, the server will send the new resource back. `ETag` has a higher priority than `Last-Modified`. The use of `ETag` is mainly considered in the following situations:

- Some files may change periodically, but their content remains the same, such as only modifying the modification time. In this case, we do not want the client to think that the file has been modified and re-`GET` it.
- Some files are modified very frequently, such as multiple times within a second, for example, `N` modifications within `1s`. The granularity that `If-Modified-Since` can detect is in seconds, so it cannot detect such rapid modifications.
- Some servers cannot accurately obtain the last modification time of a file.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/40682772
https://baike.baidu.com/item/CDN/420951
https://juejin.im/post/6844904190913822727
https://juejin.im/post/6844903906296725518
https://juejin.im/post/6844903605888090125
https://blog.csdn.net/pedrojuliet/article/details/78394732
```