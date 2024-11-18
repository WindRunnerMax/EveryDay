# iframe Framework and Pros and Cons

`HTML5` no longer supports the use of `frame`. For the difference between `frame` and `iframe`, please refer to [Difference between iframe and frame](https://www.cnblogs.com/songzhixue/p/11261118.html).

## Basic Usage
* `src`: Specifies the URL of the document to be displayed in the `iframe`.
* `frameborder`: Specifies whether to display the border around the frame.
* `scrolling`: Specifies whether to display the scrollbars in the `iframe`.
* `width`: Specifies the width of the `iframe`, it is recommended to use CSS instead.
* `height`: Specifies the height of the `iframe`, it is recommended to use CSS instead.
* `sandbox`: Enables a set of additional restrictions on the content within the `iframe`.
* `marginwidth`: Defines the left and right margins of the `iframe`.
* `marginheight`: Defines the top and bottom margins of the `iframe`.
* `srcdoc`: Specifies the HTML content of the page to be displayed in the `iframe`.
* `align`: Specifies how to align the frame relative to the surrounding elements, it is recommended to use styles instead.

## Use Cases

### Loading web pages from other domains
`<iframe>` allows cross-domain requests for resources, but cannot be modified. Therefore, it can be used to embed other web pages in a web page. If cross-domain communication is required, consider using `document.domain`, `window.name`, `window.postMessage`.

### Typical system structure
In a typical system structure, the left side is the function tree, the top is personal information, and the right side is the actual functionality. Using `iframe` to separate the functionality, `vue` and `react` can also be used for implementation.

### Implementing Ajax
`iframe` can be used to simulate asynchronous request sending and achieve the same effect as `Ajax`. The completion of an asynchronous `Ajax` request is triggered when `XHR.readyState === 4`, while `iframe` uses `iframe.onload` to trigger the completion. It can also be used to implement long polling.

### Loading advertisements
Advertisements are unrelated to the original content. If hardcoded, it will cause layout disorder and require additional CSS and JS files, greatly reducing the security of the web page. Using `iframe` can solve these problems.

### Submitting forms
`iframe` can be used to submit forms without refreshing the entire page, and can also achieve file uploads without refreshing.

## Pros and Cons

### Pros
1. Can make cross-domain requests to other websites and display the complete website.
2. The typical system structure improves code reusability.
3. Creates a new independent hosting environment, allowing isolation or access to native interfaces and objects.
4. Module separation, if multiple pages reference the same `iframe`, it is easier to modify.
5. Provides a solution for displaying advertisements.
6. If the `iframe` needs to be refreshed, only the frame needs to be refreshed, not the entire page.

### Cons
1. `iframes` block page loading and affect web page loading speed. The `window.onload` event is triggered only after the `iframe` is loaded. This can be solved by dynamically setting `src`.
2. Loading a new page increases the requests for CSS and JS files, adding extra HTTP requests and increasing server load.
3. Sometimes, due to the space occupied by the `iframe`, scrollbars appear, causing layout disorder.
4. Not SEO-friendly, search engine crawlers cannot interpret the content of the `iframe` pages.
5. Some small mobile devices such as phones may not fully display the frame, resulting in poor compatibility.
6. The `iframe` shares the link pool with the main page. If the link pool is exhausted during `iframe` loading, it will cause the main page to be blocked.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/20653055
https://www.cnblogs.com/hq233/p/9849939.html
https://blog.csdn.net/baxiadsy_csdn/article/details/86245809
```