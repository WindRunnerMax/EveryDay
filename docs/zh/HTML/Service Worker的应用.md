# Service Worker的应用
`Service worker`本质上充当`Web`应用程序、浏览器与网络(可用时)之间的代理服务器，这个`API`旨在创建有效的离线体验，它会拦截网络请求并根据网络是否可用来采取适当的动作、更新来自服务器的的资源，它还提供入口以推送通知和访问后台同步`API`。


## 描述
`Service Worker`本质上也是浏览器缓存资源用的，只不过他不仅仅是`Cache`，也是通过`worker`的方式来进一步优化，其基于`h5`的`web worker`，所以不会阻碍当前`js`线程的执行，其最主要的工作原理，`1`是后台线程，是独立于当前网页线程，`2`是网络代理，在网页发起请求时代理拦截，来返回缓存的文件。简单来说`Service Worker`就是一个运行在后台的`Worker`线程，然后它会长期运行，充当一个服务，很适合那些不需要独立的资源数据或用户互动的功能，最常见用途就是拦截和处理网络请求，以下是一些细碎的描述：
* 基于`web worker`(一个独立于`JavaScript`主线程的独立线程，在里面执行需要消耗大量资源的操作不会堵塞主线程)。
* 在`web worker`的基础上增加了离线缓存的能力。
* 本质上充当`Web`应用程序(服务器)与浏览器之间的代理服务器(可以拦截全站的请求，并作出相应的动作`->`由开发者指定的动作)。
* 创建有效的离线体验(将一些不常更新的内容缓存在浏览器，提高访问体验)。
* 由事件驱动的，具有生命周期。
* 可以访问`cache`和`indexDB`。
* 支持推送。
* 可以让开发者自己控制管理缓存的内容以及版本。

`Service worker`还有一些其他的使用场景，以及`service worker`的标准能够用来做更多使`web`平台接近原生应用的事情：

* 后台数据同步。
* 响应来自其它源的资源请求。
* 集中接收计算成本高的数据更新，比如地理位置和陀螺仪信息，这样多个页面就可以利用同一组数据。
* 在客户端进行`CoffeeScript`、`LESS`、`CJS/AMD`等模块编译和依赖管理(用于开发目的)。
* 后台服务钩子。
* 自定义模板用于特定`URL`模式。性能增强，比如预取用户可能需要的资源，比如相册中的后面数张图片。
* 可以配合`App Manifest`和`Service Worker`来实现`PWA`的安装和离线等功能。
* 后台同步，启动一个`service worker`即使没有用户访问特定站点，也可以更新缓存。
* 响应推送，启动一个`service worker`向用户发送一条信息通知新的内容可用。
* 对时间或日期作出响应。
* 进入地理围栏(`LBS`的一种应用)。

## 示例
实现一个简单的`Service worker`应用示例，这个示例可以在断网的时候同样可以使用，相关的代码在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker`，在这里就是用原生的`Service Worker`写一个简单示例，直接写原生的`Service Worker`比较繁琐和复杂，所以可以借助一些库例如`Workbox`等，在使用`Service Worker`之前有一些注意事项：
* `Service worker`运行在`worker`上，也就表明其不能访问`DOM`。
* 其设计为完全异步，同步`API`(如`XHR`和`localStorage`)不能在`service worker`中使用。
* 出于安全考量，`Service workers`只能由`HTTPS`承载，`localhost`本地调试可以使用`http`。
* 在`Firefox`浏览器的用户隐私模式，`Service Worker`不可用。
* 其生命周期与页面无关(关联页面未关闭时，它也可以退出，没有关联页面时，它也可以启动)。

首先使用`Node`启动一个基础的`web`服务器，可以使用`anywhere`这个包，当然使用其他服务器都是可以的，执行完命令后访问`http://localhost:7890/`即可。另外写完相关代码后建议重启一下服务，之前我就遇到了无法缓存的问题，包括`disk cache`和`memory cache`，要重启服务才解决。还有要打开的链接为`localhost`，自动打开浏览器可能并不是`localhost`所以需要注意一下。如果要清理缓存的话，可以在浏览器控制台的`Application`项目中`Storage`点击`Clear site data`就能清理在网站中的所有缓存了。如果使用`express`或者`koa`等服务器环境，还可以尝试使用`Service Worker`来缓存数据请求，同样提供数据请求的`path`即可。

```shell
$ npm install -g anywhere
$ anywhere 7890 # http://localhost:7890/
```

编写一个`index.html`文件和`sw.js`文件，以及引入相关的资源文件，目录结构如下，可以参考`https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker`，当然直接`clone`下来运行一个静态文件服务器就可以直接使用了。

```
simple--service-worker
├── static
│   ├── avatar.png
│   └── cache.js
├── index.html
└── sw.js
```

在`html`中引入相关文件即可，主要是为了借助浏览器环境，而关注的位置是`js`。


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
                console.info("注册成功");
            })
            .catch(() => {
                console.error("注册失败");
            });
    </script>
    <script src="./static/cache.js"></script>
</body>
</html>
```
使用`Service worker`的第一步，就是告诉浏览器，需要注册一个`Service worker`脚本，在这里我们直接将其写到了`index.html`文件中了。默认情况下，`Service worker`只对根目录`/`生效，如果要改变生效范围可以在`register`时加入第二个参数`{ scope: "/xxx"}`，也可以直接在注册的时候就指定路径`/xxx/sw.js`。

```javascript
navigator.serviceWorker
.register("sw.js")
.then(() => {
    console.info("注册成功")
}).catch(err => {
    console.error("注册失败")
})
```

一旦登记成功，接下来都是`Service worker`脚本的工作，下面的代码都是写在`service worker`脚本里面的，登记后，就会触发`install`事件，`service worker`脚本需要监听这个事件。首先定义这个`cache`的名字，相当于是标识这一个缓存对象的键值，之后的`urlsToCache`数组是即将要缓存的数据，只要给定了相关的`path`，连数据请求也是同样能够缓存的，而不仅仅是资源文件，当然这边必须是`Get`的请求下使用，这是`Cache`这个`API`决定的。之后便是进行`install`，关于`event.waitUntil`可以理解为`new Promise`的作用，是要等待`serviceWorker`运行起来才继续后边的代码，其接受的实际参数只能是一个`Promise`。在`MDN`的解释是因为`oninstall`和`onactivate`完成前需要一些时间，`service worker`标准提供一个`waitUntil`方法，当`oninstall`或者`onactivate`触发时被调用，接受一个`promise`，在这个`promise`被成功`resolve`以前，功能性事件不会分发到`service worker`。之后便是从`caches`取出这个`CACHE_NAME`的`key`标识的`cache`，之后使用`cache.addAll`将数组中的`path`告诉`cache`，在第一次打开的时候，`Service worker`会自动去请求相关的数据并且缓存起来，使用`Service worker`去请求的数据，在`Chrome`控制台的`Network`中会显示一个小小的齿轮图标，很好辨认。

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

之后是`activated`阶段，如果是第一次加载`sw`，在安装后，会直接进入`activated`阶段，而如果`sw`进行更新，情况就会显得复杂一些，流程如下`:`首先老的`sw`为`A`，新的`sw`版本为`B, B`进入`install`阶段，而`A`还处于工作状态，所以`B`进入`waiting`阶段，只有等到`A`被`terminated`后，`B`才能正常替换`A`的工作。这个`terminated`的时机有如下几种方式，`1`、关闭浏览器一段时间。`2`、手动清除`Service Worker`。`3`、在`sw`安装时直接跳过`waiting`阶段。然后就进入了`activated`阶段，激活`sw`工作，`activated`阶段可以做很多有意义的事情，比如更新存储在`Cache`中的`key`和`value`。在下边的代码中，实现了不在白名单的`CACHE_NAME`就清理，可以在这里实现一个`version`也就是版本的控制，之前的版本就要清理等，另外还查看了一下目前的相关缓存。

```javascript
this.addEventListener("activate", event => {
    // 不在白名单的`CACHE_NAME`就清理
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
    // 查看一下缓存
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.keys().then(res => console.log(res)))
    );
});
```

之后便是拦截请求的阶段了，该阶段是`sw`关键的一个阶段，用于拦截代理所有指定的请求，并进行对应的操作，所有的缓存部分，都是在该阶段。首先我们直接拦截掉所有的请求，在最前边的判断操作是为了防止所有的请求都被拦截从而都在`worker`里边发起请求，当然不进行判断也是可以使用的。然后对于请求如果匹配到了缓存，那么就直接从缓存中取得数据，否则就使用`fetch`去请求新的。另外如果有需要的话我们不需要在事件响应时进行匹配 可以直接将所有发起过的请求缓存。

```javascript
this.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (url.origin === location.origin && urlsToCache.indexOf(url.pathname) > -1) {
        event.respondWith(
            caches.match(event.request).then(resp => {
                if (resp) {
                    console.log("fetch ", event.request.url, "有缓存，从缓存中取");
                    return resp;
                } else {
                    console.log("fetch ", event.request.url, "没有缓存，网络获取");
                    return fetch(event.request);
                    // // 如果有需要的话我们不需要在事件响应时进行匹配 可以直接将所有发起过的请求缓存
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

第一次打开时控制台的输出：
```
cache.js loaded
[Service Worker] (3) ['/', '/static/avatar.png', '/static/cache.js']
注册成功
(3) [Request, Request, Request]
```

第二次及之后打开的控制台输出：
```
fetch  http://localhost:7811/static/avatar.png 有缓存，从缓存中取
fetch  http://localhost:7811/static/cache.js 有缓存，从缓存中取
注册成功
cache.js loaded
```

至此我们就完成了一个简单的示例，在第二次打开页面的时候，我们可以将浏览器的网络连接断开，例如关闭文件服务器或者在控制台的`Network`中选择`Offline`，而我们也可以看到页面依旧正常加载，不需要网络服务，另外也可以在`Network`的相关的数据的`Size`列会出现`(ServiceWorker)`这个信息，说明资源是从`ServiceWorker`加载的缓存数据。可以在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/simple--service-worker`中`clone`下来后运行这个示例。

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
                console.info("注册成功");
            })
            .catch(() => {
                console.error("注册失败");
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
    // 不在白名单的`CACHE_NAME`就清理
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
    // 查看一下缓存
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.keys().then(res => console.log(res)))
    );
});

this.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (url.origin === location.origin && urlsToCache.indexOf(url.pathname) > -1) {
        event.respondWith(
            caches.match(event.request).then(resp => {
                if (resp) {
                    console.log("fetch ", event.request.url, "有缓存，从缓存中取");
                    return resp;
                } else {
                    console.log("fetch ", event.request.url, "没有缓存，网络获取");
                    return fetch(event.request);
                    // // 如果有需要的话我们不需要在事件响应时进行匹配 可以直接将所有发起过的请求缓存
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


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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
