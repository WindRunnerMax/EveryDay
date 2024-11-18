# Understanding Shadow DOM
`Shadow DOM` is a specification of `HTML` that allows for the insertion of a subtree of `DOM` elements during document rendering, but this subtree is not part of the main `DOM` tree. If translated literally, `Shadow DOM` can be translated as "影子DOM" (Shadow DOM), which is an independent structure that does not belong to the main `DOM` tree.

## Description
One important attribute of `Web components` is encapsulation - the ability to hide markup structure, styles, and behavior and isolate them from other code on the page, ensuring that different parts do not mix together. This is where the `Shadow DOM` interface comes in. It allows you to attach a hidden, independent `DOM` to an element. The `Shadow DOM` standard allows you to maintain a set of `Shadow DOM` for your own custom elements.  
`Shadow DOM` allows you to attach a hidden `DOM` tree to a regular `DOM` tree. It starts with a `shadow root` node, and below this root node can be any element, just like regular `DOM` elements. There are also some specific terms for `Shadow DOM`.

* `Shadow host`: A regular `DOM` node to which the `Shadow DOM` is attached.
* `Shadow tree`: The `DOM` tree inside the `Shadow DOM`.
* `Shadow boundary`: The end of the `Shadow DOM` and the beginning of the regular `DOM`.
* `Shadow root`: The root node of the `Shadow tree`.

We can manipulate `Shadow DOM` in the same way as regular `DOM` - for example, adding child nodes, setting attributes, adding styles to nodes (e.g., through the `element.style` property), or adding styles to the entire `Shadow DOM` (e.g., adding styles within a `<style>` element). The difference is that elements inside the `Shadow DOM` will not affect elements outside of it (except for `:focus-within`), which provides convenience for encapsulation.  
Furthermore, `Shadow DOM` is not a new concept from any perspective. For a long time, browsers have used it to encapsulate the internal structure of some elements. For example, for a `<video>` element with default playback controls, all we see is a `<video>` tag, but in its `Shadow DOM`, there are a series of buttons and other controllers. Another example is that we are familiar with concepts like components in frameworks like `React` or `Vue`. The commonly used elements such as `<input>`, `<audio>`, `<video>`, etc., actually exist as components, namely `HTML Web Components`, and these components have their own `Shadow DOM`, which is composed of their own HTML tags.  
Modern browsers such as `Firefox`, `Chrome`, `Opera`, and `Safari` natively support `Shadow DOM`. The new `Edge` based on `Chromium` also supports `Shadow DOM`, while the old `Edge` does not. As for the `IE` browser... well, in terms of compatibility, you can refer to this link: `https://caniuse.com/?search=Shadow%20DOM`.

## Example

```html
<!DOCTYPE html>
<html>

<head>
    <title>Shadow DOM</title>
    <style>
        .text{
            color: blue; /* Set font color */ /* It can be seen that styles defined externally cannot affect the styles of elements inside the shadow */
        }
    </style>
</head>

<body>
    <div id="app">
        <div class="shadow-cls"></div>
    </div>
</body>

```html
<script type="text/javascript">
    (function(doc, win){
        var shadowHost = doc.querySelector(".shadow-cls"); // Get the shadow host
        var shadowRoot = shadowHost.attachShadow({mode: "open"}); // Create (attach) the shadow root // "open" means that the Shadow DOM can be accessed through JavaScript methods on the page
        var style = doc.createElement("style"); // Create a style element
        style.textContent = `
            .text{
                font-style: italic;
            }
        `; // Internal styles for the shadow
        const template = `
          <div>
              <div class="text">Text</div>
          </div>
        `; // Template // You can also try <template> and <script text/template>
        const container = doc.createElement("div"); // Create a container
        container.innerHTML = template; // Add to the container
        shadowRoot.append(style, container); // Add to the shadow
    })(document, window);
</script>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://segmentfault.com/a/1190000017970486
https://www.cnblogs.com/tugenhua0707/p/10545179.html
https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM
```