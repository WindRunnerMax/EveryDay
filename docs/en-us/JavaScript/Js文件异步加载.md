# Asynchronously Loading Js Files
The rendering engine and the `Js` script engine in the browser are mutually exclusive. When the browser starts rendering a page, if it encounters a `<script>` tag, it will stop rendering the current page. In other words, during the process of script loading and execution, the rendering of the page will be blocked. In an environment with poor network speed, the browser page may appear to be unresponsive. This is also why `<script>` files should be placed after the `<body>` tag as much as possible. Asynchronously loading `Js` files allows the browser to load external `Js` script files without blocking the rendering thread. This is known as non-blocking loading. Of course, the parsing and execution of the `Js` script after loading must be mutually exclusive with the rendering engine, and the timing of parsing and executing the `Js` script depends on the way the `Js` is asynchronously loaded.

## defer
`defer` is an attribute supported by early versions of `IE` and is now supported by mainstream browsers. This attribute causes the browser to open a thread to load the `Js` and execute it after the `DOM` structure is parsed.
* `defer` only applies to external scripts.
* If there are multiple scripts declared with `defer`, they will be downloaded and executed in order.
* `defer` scripts will be executed before `onDOMContentLoaded`, and of course, also before the `onload` event.

```html
<!-- Compatibility https://caniuse.com/#feat=script-defer -->
<script type="text/javascript" defer="defer" src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js" ></script>
```

## async
`HTML5` defines the `async` attribute for the `<script>` element. This attribute causes the browser to open a thread to load the `Js` and execute it immediately after downloading.
* `async` only applies to external scripts.
* If there are multiple scripts declared with `async`, their downloading and execution will also be asynchronous, and the order of execution cannot be guaranteed.
* `async` will be executed before the `onload` event, but it cannot guarantee the sequence of execution relative to `DOMContentLoaded`.

```html
<!-- Compatibility https://caniuse.com/#feat=script-async -->
<script type="text/javascript" async="async" src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js" ></script>
``` 

## Script DOM Element
The approach of the `Script DOM Element` is to dynamically insert a `<script>` tag to load an external `Js` script file, and use it as a callback function for the `onload` event, so that it will not block the rendering thread until the page is loaded.

```javascript
window.onload = function(){
    var script= document.createElement('script'); 
    script.type = 'text/javascript'; 
    script.src ="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"; 
    var body= document.getElementsByTagName('body')[0]; 
    body.appendChild(script);
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://segmentfault.com/a/1190000006778717
https://www.cnblogs.com/jiasm/p/7683930.html
https://blog.csdn.net/zyj0209/article/details/79698430
https://blog.csdn.net/qq_41245969/article/details/82428464
```