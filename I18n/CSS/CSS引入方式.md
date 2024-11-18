# Ways to Import CSS
There are four main ways to apply CSS to HTML: adding inline styles to HTML elements, embedding styles using the `<style>` tag, linking external stylesheets using the `<link>` tag, and importing external stylesheets using `@import`.

## Inline Styles

```html
<div style="color: red"></div>
```
### Features
* No additional HTTP requests required.
* Suitable for use in HTML emails and rich text editors.
* Inline styles have a higher priority than external styles and can override them.
* Allows for changing styles without modifying the main CSS stylesheet by adding rules directly to elements.
* Suitable for dynamic styles where each element has different styles.

### Limitations
* Can make page maintenance difficult.
* Adding too many similar styles can make the page complex.

## Embedded Styles

```html
<style type="text/css">
    div {
        color: blue;
    }
</style>
```

### Features
* CSS and HTML are combined in a single file, no additional HTTP requests required.
* Suitable for dynamic styles where different styles are loaded from a database for different users.

### Limitations
* Embedded styles cannot be cached by the browser and reused for other pages.


## Linked Styles

```html
<link rel="stylesheet" href="Path To stylesheet.css">
```

### Features
* Allows changing the theme of a website by replacing the CSS file.
* Only requires making changes in a single CSS file, and all website pages will be updated.
* Improves website speed for multiple page requests as the CSS is cached by the browser on the first visit.

### Limitations
* Each linked CSS file requires an additional HTTP request.

## Importing Styles

```html
<style>
    @import url("Path To stylesheet.css");
</style>
```

### Features
* Allows adding new CSS files without changing the HTML tags.

### Limitations
* Requires an additional HTTP request.

## Differences between link and @import
* `<link>` is an HTML tag, while `@import` is a CSS statement. It is worth noting that `@import` statements need to be placed at the beginning of the CSS stylesheet to correctly import external files.
* `@import` is a concept introduced in CSS 2.1, so older browser versions like IE4 and IE5 cannot correctly import external stylesheets. This can be used to hide CSS2 rules for these older browser versions.
* When an HTML file is loaded, files referenced by `<link>` are loaded simultaneously, while files referenced by `@import` are loaded after the entire page has finished downloading. Therefore, sometimes pages using `@import` to load CSS may appear without styles, causing a flickering effect, especially when the internet connection is slow.
* The `<link>` tag can have a `rel` attribute, where `rel="stylesheet"` means that the stylesheet is applied immediately to the document, and `rel="alternate stylesheet"` means that it is an alternate stylesheet that is not applied immediately to the document. The `<link>` tag can be accessed using JavaScript, and the stylesheet can be switched immediately by setting the `disabled` property, making it useful for switching themes and other functionalities. `@import`, on the other hand, is not part of the DOM and cannot be controlled directly using JavaScript.
* Mixing `<link>` and `@import` may have a negative impact on webpage performance. In some older versions of IE, mixing `<link>` and `@import` can cause the stylesheets to be loaded one by one, disrupting parallel downloading and slowing down page loading. Additionally, regardless of the browser, if an external CSS file is loaded using `<link>` and that CSS file continues to use `@import` to load another external CSS file, the stylesheets will be loaded sequentially instead of in parallel. This is because the browser needs to parse the CSS file loaded by `<link>` and then discover the `@import` statement to load the external CSS file, resulting in slower page loading.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
[https://alistapart.com/article/alternate/](https://alistapart.com/article/alternate/)
[https://matthewjamestaylor.com/add-css-to-html](https://matthewjamestaylor.com/add-css-to-html)
[https://www.runoob.com/w3cnote/html-import-css-method.html](https://www.runoob.com/w3cnote/html-import-css-method.html)
[http://www.stevesouders.com/blog/2009/04/09/dont-use-import/](http://www.stevesouders.com/blog/2009/04/09/dont-use-import/)
[https://stackoverflow.com/questions/1022695/difference-between-import-and-link-in-css](https://stackoverflow.com/questions/1022695/difference-between-import-and-link-in-css)
```