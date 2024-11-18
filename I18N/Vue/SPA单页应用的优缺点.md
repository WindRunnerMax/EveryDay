# Pros and Cons of Single Page Applications

A *Single Page Web Application* is a special type of *Web* application where all activities are confined to a single *Web* page. Only the respective *HTML*, *JavaScript*, and *CSS* files are loaded during the initialization of the *Web* page. Once the page is loaded, the *SPA* doesn't reload or redirect the page. Instead, it dynamically transforms the *HTML* using *JavaScript*. By default, the *Hash* mode uses anchor points to implement routing and to show or hide element components for interaction. Simply put, a *SPA* application only has one page. In contrast, multi-page applications involve constant navigation between multiple pages, while a single-page application always remains within a single page. In the default *Hash* mode, routing is achieved using anchor points and controlling the display and hiding of components to simulate page navigation.

## Advantages
* Enhanced user interaction: After the initial page load, content changes do not require the entire page to be reloaded, resulting in faster response times. It provides the immediacy of desktop applications, portability, and accessibility akin to websites.
* Decoupling of frontend and backend work: Single-page applications can be used in conjunction with *RESTful* architecture, using *REST API* to provide interface data, which helps separate client and server-side work and standardize the use of *API*.
* Reduced server load: The server does not need to handle page template logic and concatenation. It only needs to provide data after the initial page load, while most calculations are moved to the client side. Single-page applications can increase the server load efficiency.
* High maintainability: It typically involves component-based and modular development, with a high degree of code reusability and relative ease of maintenance.

## Disadvantages
* Poor for *SEO*: Due to frontend rendering, search engines do not parse *JavaScript*, thus only fetching the unrendered template of the homepage. To improve *SEO* for single-page applications, *SSR* (server-side rendering) is typically required. Search engine crawlers can directly view fully rendered pages, but server-side rendering can put strain on the server. *SSR* server-side rendering is *CPU*-intensive. However, if only a few pages need *SEO*, pre-rendering can be used.
* Slow initial load speed: *SPA* single-page applications usually load all respective *HTML*, *JavaScript*, and *CSS* files on the first page load. This can be optimized using caching measures and lazy loading, where components are loaded on demand.

## Every Day One Topic
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.jianshu.com/p/9258583ef4ab
https://juejin.im/post/6844903512107663368
https://blog.csdn.net/huangpb123/article/details/86183453
```