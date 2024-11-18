# Application of Service Worker
The `Service Worker` essentially acts as a proxy server between a web application, browser, and the network (when available). This API is designed to create efficient offline experiences by intercepting network requests and taking appropriate actions based on the availability of the network. It can update resources from the server, provide entry points for push notifications, and access background sync APIs.

## Description
The `Service Worker` is essentially used for caching resources in the browser. However, it goes beyond just caching and further optimizes through the use of workers. It is based on the `Web Worker` of HTML5, which means it does not block the execution of the current JavaScript thread. Its main working principles are as follows: 
1. It runs as a background thread independent of the current web page thread.
2. It acts as a network proxy, intercepting requests made by the web page and returning cached files. 

In simple terms, the `Service Worker` is a background worker thread that runs continuously, serving as a service. It is well-suited for functionalities that do not require independent resource data or user interaction. The most common use case is intercepting and handling network requests. Here are some key points to note:
* It is based on the `Web Worker`, which is an independent thread separate from the JavaScript main thread, allowing resource-intensive operations to be executed without blocking the main thread.
* It adds the ability for offline caching on top of the `Web Worker`.
* It acts as a proxy server between the web application (server) and the browser, intercepting requests made by the web page and taking actions specified by the developer.
* It creates efficient offline experiences by caching infrequently updated content in the browser, improving the browsing experience.
* It is event-driven and has a lifecycle.
* It can access the cache and indexDB.
* It supports push notifications.
* It allows developers to have control over managing the content and versions of the cache.

The `Service Worker` has other use cases as well, and the standard of `Service Worker` can be used to make web platforms more similar to native applications. Some of these use cases include:
* Background data synchronization.
* Responding to resource requests from other sources.
* Centralized receiving of computationally expensive data updates, such as geolocation and gyroscope information, allowing multiple pages to utilize the same set of data.
* Compiling and managing dependencies of CoffeeScript, LESS, CJS/AMD modules, etc. on the client side (for development purposes).
* Background service hooks.
* Custom templates for specific URL patterns. This enhances performance by prefetching resources that the user may need, such as the next few images in an album.
* It can be combined with App Manifest and Service Worker to implement features like Progressive Web Apps (PWA) installation and offline functionality.
* Background sync, where a service worker can update the cache even if a specific site is not being visited by the user.
* Push notifications, where a service worker can send a notification to the user when new content is available.
* Responding to time or date changes.
* Entering a geofence (an application of Location-Based Services).

## Example
Here is an example of a simple `Service Worker` application that can still be used when there is no internet connection. The relevant code can be found at `https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker`. In this example, a simple native `Service Worker` is implemented without using any libraries like `Workbox`. However, it is worth noting that writing a native `Service Worker` can be cumbersome and complex, so using libraries like `Workbox` can simplify the process. Before using a `Service Worker`, there are some important considerations:
* `Service Worker` runs on a worker, which means it cannot access the DOM.
* It is designed to be completely asynchronous, and synchronous APIs like XHR and localStorage cannot be used in a service worker.
* For security reasons, `Service Workers` can only be hosted on HTTPS, although `http` can be used for local debugging on `localhost`.
* In Firefox browser's private browsing mode, `Service Worker` is not available.
* Its lifecycle is independent of the page (it can continue running even if the associated page is closed, and it can start even without an associated page).

First, use `Node` to start a basic `web` server. You can use the `anywhere` package, or any other server of your choice. After executing the command, you can access `http://localhost:7890/`. Additionally, it is recommended to restart the server after writing the relevant code. I encountered issues with caching before, including `disk cache` and `memory cache`, and they were resolved after restarting the server. Also, please note that the link to be opened is `localhost`, as the browser may not automatically open to `localhost`. If you want to clear the cache, you can click on `Clear site data` in the `Storage` section of the browser console under the `Application` tab. This will clear all the cache on the website. If you are using a server environment such as `express` or `koa`, you can also try using `Service Worker` to cache data requests. Simply provide the path for the data request.

```shell
$ npm install -g anywhere
$ anywhere 7890 # http://localhost:7890/
```

Create an `index.html` file and an `sw.js` file, and import the relevant resource files. The directory structure is as follows, and you can refer to `https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker`. Of course, you can directly clone and run a static file server to use it directly.

```
simple--service-worker
├── static
│   ├── avatar.png
│   └── cache.js
├── index.html
└── sw.js
```

Simply import the relevant files in the `html` file, mainly to leverage the browser environment, and focus on the `js` section.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Service Worker</title>
    <style type="text/css">
        .avatar{
            width: 50px;
            height: 50px;
            border-radius: 50px;
        }
    </style>
</head>
<body>
    <img class="avatar" src="./static/avatar.png">
    <script type="text/javascript">
        navigator.serviceWorker
            .register("sw.js")
            .then(() => {
                console.info("Registration successful");
            })
            .catch(() => {
                console.error("Registration failed");
            });
    </script>
    <script src="./static/cache.js"></script>
</body>
</html>
```

The first step in using `Service Worker` is to tell the browser to register a `Service Worker` script. In this case, we directly write it in the `index.html` file. By default, `Service Worker` only works for the root directory `/`. If you want to change the scope, you can add a second parameter `{ scope: "/xxx"}` when registering, or directly specify the path `/xxx/sw.js` during registration.

```javascript
navigator.serviceWorker
.register("sw.js")
.then(() => {
    console.info("Registration successful");
}).catch(err => {
    console.error("Registration failed");
})
```

Once the registration is successful, the work of the `Service worker` script begins. The following code is written inside the `service worker` script. After registration, the `install` event will be triggered, and the `service worker` script needs to listen for this event. First, the name of the `cache` is defined, which serves as the key to identify this cache object. The `urlsToCache` array contains the data that will be cached. As long as the relevant `path` is provided, even data requests can be cached, not just resource files. However, this can only be done for `Get` requests, as determined by the `Cache` API. After that, the `install` process is carried out. The `event.waitUntil` can be understood as the function of `new Promise`, which means that it waits for the `serviceWorker` to start running before continuing with the subsequent code. The actual parameter it accepts can only be a `Promise`. According to the explanation on MDN, it is because some time is needed for `oninstall` and `onactivate` to complete. The `service worker` standard provides a `waitUntil` method, which is called when `oninstall` or `onactivate` is triggered. It accepts a `promise`, and until this `promise` is successfully resolved, functional events will not be dispatched to the `service worker`. After that, the `cache` identified by the `key` of `CACHE_NAME` is retrieved from `caches`, and then the `path` in the array is added to the `cache` using `cache.addAll`. When the page is first opened, the `Service worker` will automatically request the relevant data and cache it. The data requested using the `Service worker` will be displayed with a small gear icon in the `Network` tab of the Chrome console, making it easy to recognize.

```javascript
const CACHE_NAME = "service-worker-demo";
const urlsToCache = ["/", "/static/avatar.png", "/static/cache.js"];

this.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker]", urlsToCache);
            return cache.addAll(urlsToCache);
        })
    );
});
```

Next is the `activated` phase. If it is the first time loading the `sw`, after installation, it will directly enter the `activated` phase. However, if the `sw` is being updated, the situation becomes more complicated. The process is as follows: First, the old `sw` is `A`, and the new `sw` version is `B`. `B` enters the `install` phase while `A` is still in working state, so `B` enters the `waiting` phase. Only when `A` is terminated can `B` replace `A` and start working normally. There are several ways to trigger the `terminated` state: 1) Closing the browser for a period of time. 2) Manually clearing the Service Worker. 3) Skipping the `waiting` phase during `sw` installation. After that, the `activated` phase is entered, and the `sw` starts working. In the `activated` phase, many meaningful things can be done, such as updating the `key` and `value` stored in the `Cache`. In the code below, any `CACHE_NAME` that is not in the whitelist will be cleared. A version control can also be implemented here, where previous versions need to be cleared. Additionally, the current related cache is checked.

```javascript
this.addEventListener("activate", event => {
    // Clean up `CACHE_NAME` that is not in the whitelist
    const cacheWhitelist = ["service-worker-demo"];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Check the cache
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.keys().then(res => console.log(res)))
    );
});
```

Afterwards, it is the stage of intercepting requests. This stage is a crucial stage for the `sw`, used to intercept and proxy all specified requests, and perform corresponding operations. All caching operations are done in this stage. First, we intercept all requests. The initial conditional statement is used to prevent all requests from being intercepted and made within the worker. However, it can also be used without the conditional statement. Then, if a request matches a cache, the data is directly retrieved from the cache; otherwise, a new request is made using `fetch`. Additionally, if needed, we can cache all requests made without matching during the event response.

```javascript
this.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (url.origin === location.origin && urlsToCache.indexOf(url.pathname) > -1) {
        event.respondWith(
            caches.match(event.request).then(resp => {
                if (resp) {
                    console.log("fetch ", event.request.url, "has cache, retrieving from cache");
                    return resp;
                } else {
                    console.log("fetch ", event.request.url, "has no cache, retrieving from network");
                    return fetch(event.request);
                    // // If necessary, we don't need to match when the event is triggered, we can directly cache all requests made
                    // return fetch(event.request).then(response => {
                    //     return caches.open(CACHE_NAME).then(cache => {
                    //         cache.put(event.request, response.clone());
                    //         return response;
                    //     });
                    // });
                }
            })
        );
    }
});
```

Console output when opened for the first time:
```
cache.js loaded
[Service Worker] (3) ['/', '/static/avatar.png', '/static/cache.js']
Registration successful
(3) [Request, Request, Request]
```

Console output when opened for the second time and onwards:
```
fetch  http://localhost:7811/static/avatar.png has cache, retrieving from cache
fetch  http://localhost:7811/static/cache.js has cache, retrieving from cache
Registration successful
cache.js loaded
```

With this, we have completed a simple example. When the page is opened for the second time, we can disconnect the browser's network connection, such as by closing the file server or selecting `Offline` in the `Network` tab of the console. We can see that the page still loads normally without requiring a network service. Additionally, in the `Size` column of the relevant data in the `Network` tab, there will be a `(ServiceWorker)` indication, indicating that the resources are loaded from the cache data of the `ServiceWorker`. You can clone this example from `https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker` and run it.

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Service Worker</title>
    <style type="text/css">
        .avatar{
            width: 50px;
            height: 50px;
            border-radius: 50px;
        }
    </style>
</head>
<body>
    <img class="avatar" src="./static/avatar.png">
    <script type="text/javascript">
        navigator.serviceWorker
            .register("sw.js")
            .then(() => {
                console.info("Registration successful");
            })
            .catch(() => {
                console.error("Registration failed");
            });
    </script>
    <script src="./static/cache.js"></script>
</body>
</html>
```

```javascript
// sw.js
const CACHE_NAME = "service-worker-demo";
const urlsToCache = ["/", "/static/avatar.png", "/static/cache.js"];

this.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker]", urlsToCache);
            return cache.addAll(urlsToCache);
        })
    );
});

this.addEventListener("activate", event => {
    // Clear `CACHE_NAME` that is not in the whitelist
    const cacheWhitelist = ["service-worker-demo"];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Check the cache
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.keys().then(res => console.log(res)))
    );
});
```

```javascript
this.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (url.origin === location.origin && urlsToCache.indexOf(url.pathname) > -1) {
        event.respondWith(
            caches.match(event.request).then(resp => {
                if (resp) {
                    console.log("fetch ", event.request.url, " has cache, retrieving from cache");
                    return resp;
                } else {
                    console.log("fetch ", event.request.url, " has no cache, fetching from network");
                    return fetch(event.request);
                    // // If necessary, we don't need to match the request in the event response, we can directly cache all requests made
                    // return fetch(event.request).then(response => {
                    //     return caches.open(CACHE_NAME).then(cache => {
                    //         cache.put(event.request, response.clone());
                    //         return response;
                    //     });
                    // });
                }
            })
        );
    }
});
```

```javascript
// cache.js
console.log("cache.js loaded");
// avatar.png
// [byte]png
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://github.com/mdn/sw-test/
https://zhuanlan.zhihu.com/p/25459319
https://zhuanlan.zhihu.com/p/115243059
https://zhuanlan.zhihu.com/p/161204142
https://github.com/youngwind/service-worker-demo
https://mp.weixin.qq.com/s/3Ep5pJULvP7WHJvVJNDV-g
https://developer.mozilla.org/zh-CN/docs/Web/API/Cache
https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API
https://www.bookstack.cn/read/webapi-tutorial/docs-service-worker.md
```