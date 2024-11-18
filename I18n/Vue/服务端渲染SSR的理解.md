# Understanding of Server-Side Rendering (SSR)

`SSR` or Server-Side Rendering means that when a request is made, the content on the page is generated through server-side rendering, and the browser can directly display the returned HTML from the server.

## Client-Side Rendering (CSR)

When building a typical Single Page Application (SPA), it is a client-side rendering application. `CSR` or Client-Side Rendering means that when a request is made, the content on the page is rendered through the loaded Js file, and the Js file dynamically runs on the browser, while the server only returns an HTML template.

### Advantages
* Reduces server computation pressure.
* Achieves separation between front-end and back-end, allowing team members to focus on their respective tasks, thus significantly improving development efficiency.

### Disadvantages
* Not favorable for SEO, as search engine crawlers cannot fully parse user pages.
* Increased wait time for users when there are more requests, leading to slow initial page rendering.
* Consumes the performance of the user's browser.

## Server-Side Rendering (SSR)

`SSR` or Server-Side Rendering is when the content on the page is generated through server-side rendering upon request, and the browser can directly display the server's returned HTML. Traditional server-side rendering, also known as back-end template rendering, such as `JSP` or `PHP`, was the earliest form of web development. It involves the server using a template engine to concatenate the template with data into complete HTML, which is then sent to the client. The client receives and parses the HTML to display it in the browser, without requiring additional asynchronous data requests. If the web needs interactivity, the client needs to use Js to manipulate the DOM or render other dynamic parts.

### Advantages
* Better SEO as search engine crawlers can directly view fully rendered pages. If SEO is crucial for the site and the content is asynchronously fetched, server-side rendering (SSR) may be necessary to address this issue.
* Faster time-to-content, especially for slow network conditions or slow devices, as it eliminates the need to wait for all JavaScript to download and execute. Users can see the fully-rendered page more quickly, leading to a better user experience. For applications where time-to-content is directly related to conversion rates, server-side rendering (SSR) is crucial.

### Disadvantages
* Development limitations, browser-specific code can only be used in certain lifecycle hooks, and some external libraries may require special handling to run in server-rendered applications.
* More requirements for build setup and deployment. Unlike single-page applications (SPAs) that can be deployed on any static file server, server-rendered applications usually need to run in a Node.js server environment.
* Higher server-side load. Rendering the entire application in Node.js will obviously consume more CPU resources than just serving static files. Therefore, adequate server load preparation and wise caching strategies are needed, especially for use in high-traffic environments.

## Prerendering

If using server-side rendering (SSR) only to improve the SEO of a few marketing pages, such as `/`, `/about`, `/contact`, then prerendering may be necessary. Instead of dynamically compiling HTML in real time on the web server, prerendering generates static HTML files for specific routes at build time. If using webpack, the `prerender-spa-plugin` can be easily added for prerendering.

### Advantages
* Easier setup for prerendering, and the frontend application can function as a fully static site.

### Disadvantages
* Only suitable for specific static pages.

## Conclusion

Essentially, both rendering approaches involve string concatenation to generate HTML, and their differences ultimately lie in time and performance consumption. The client undergoes a time period from Js loading to data request and page rendering in different network environments, leading to significant time and browser performance consumption. On the other hand, the server experiences fast data response within the intranet, without the need to wait for Js code to load, thus significantly reducing the time spent on server-side rendering. This places the bulk of the performance demand on the server, resulting in faster client-side page response times.

Server-side rendering (SSR) primarily addresses initial page rendering and SEO optimization. The decision to use SSR depends on how critical SEO is for the website and the importance of time-to-content for the application. For instance, if building an internal dashboard where an extra few hundred milliseconds during initial loading are insignificant, employing server-side rendering (SSR) would be an overkill. However, if a significant portion of traffic comes from search engine crawlers, then SSR becomes an essential solution. Similarly, if time-to-content is a critical metric, server-side rendering (SSR) can help achieve optimal initial loading performance. In conclusion, the development approach should be tailored to the practical scenario.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://ssr.vuejs.org/en/
https://zhuanlan.zhihu.com/p/90746589
https://www.jianshu.com/p/10b6074d772c
https://github.com/yacan8/blog/issues/30
https://juejin.im/post/6890810591968477191
https://juejin.im/post/6844903959241424910
```