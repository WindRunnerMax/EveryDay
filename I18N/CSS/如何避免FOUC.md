# How to Avoid FOUC

`FOUC`, also known as Flash of Unstyled Content, refers to the phenomenon where HTML is loaded but the style sheet is not, resulting in a flickering effect when the style sheet is subsequently loaded.

## Preload Style Sheets
According to the rendering order of browsers, including or embedding CSS in the `<head>` section can speed up page rendering compared to placing CSS in the `<body>` or at the bottom of the page. This is particularly important for websites with rich content or slow network connections. Placing the style sheet at the bottom will cause the browser to start rendering the page before the style sheet is loaded, resulting in an immediate transition from an unstyled state to a styled state, which leads to a poor user experience and the occurrence of FOUC. Additionally, some browsers may delay rendering the page until the CSS is downloaded, so placing the style sheet at the bottom will further delay page rendering.

## Avoid Using @import
It is recommended to use `<link>` instead of `@import`. When an HTML file is loaded, the files referenced by `<link>` will be loaded simultaneously, while the files referenced by `@import` will be loaded only after the entire page is downloaded. Therefore, sometimes when browsing a page that uses `@import` to load CSS, the styles may not be applied, resulting in FOUC, especially when the network speed is slow. Furthermore, mixing `<link>` and `@import` may have a negative impact on webpage performance. In some older versions of IE, using `<link>` and `@import` together will cause the style sheet files to be loaded one by one, disrupting parallel downloading and slowing down page loading. Additionally, regardless of the browser, if an external CSS file is loaded using `@import` within a `<link>`, it will also be loaded sequentially instead of in parallel. This is because the browser needs to parse the CSS file referenced by `<link>` and then discover the `@import` statement, resulting in slower page loading.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/xianyulaodi/p/5198603.html
```