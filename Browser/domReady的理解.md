# domReady的理解
`domReady`是名为`DOMContentLoaded`事件的别称，当初始的`HTML`文档被完全加载和解析完成之后，`DOMContentLoaded`事件被触发，而无需等待样式表、图像和子框架的完全加载。

## 描述
浏览器渲染`DOM`结构是有一定顺序的，虽然不同浏览器的实现各有不同，但是基本流程都大致相同：

* 自上而下，首先解析`HTML`标签，生成`DOM Tree`。
* 在解析到`<link>`或者`<style>`标签时，开始解析`CSS`，生成`CSSOM`，值的注意的是此时解析`HTML`标签与解析`CSS`是并行执行的。
* 当遇到`<script>`标签后，浏览器会立即开始解析脚本，并停止解析文档，因为脚本有可能会改动`DOM`与`CSS`，继续解析会浪费资源，所以应当将`<script>`标签放于`<body></body>`后。
* 当`DOM Tree`与`CSSOM`生成后，将两者结合进行布局，计算它们的大小位置等布局信息，形成一个能够表示这所有信息的内部表示模型，可称为渲染树`render tree`。
* 根据计算好的信息绘制整个页面，系统会遍历渲染树，并调用`paint`方法，将内容显示在屏幕上。

在浏览器解析`DOM`结构的过程中是存在阻塞过程的：
* 解析`JavaScript`过程中会阻塞浏览器的解析过程，准确来说解析渲染过程与解析`JavaScript`的过程是互斥的。
* `CSS`加载解析时不会阻塞`DOM`树的解析过程，这两个解析过程是可以并行的，但是`CSS`加载过程中是不能进行`JavaScript`的解析的，也就是说`CSS`加载过程中是会阻塞`JavaScript`的解析，此外因为生成`Render Tree`时需要`CSSOM`，所以在`DOM Tree`解析完成而`CSSOM`未完成时不会继续生成`Render Tree`。
* 解析`HTML`结构同样不会阻塞`CSS`解析的过程，也同样不会和`JavaScript`的解析过程并行执行，并且`DOM Tree`解析未完成而`CSSOM`完成时同样不会继续生成`Render Tree`。
* 使用异步加载的`<script>`标签是不会阻塞`DOM`解析的，当然其就不会阻塞`DOMContentLoaded`事件的触发，但是依旧会阻塞`load`事件的触发。

再来看一下`DOMContentLoaded`事件与`load`事件的触发时机：
* 当初始的`HTML`文档被完全加载和解析完成之后，`DOMContentLoaded`事件被触发，而无需等待样式表、图像和子框架的完全加载。关于触发的时机，如果文档中全部为`HTML`与`CSS`则`DomContentLoaded`事件无需等到`CSS`加载完毕即可触发；当`Js`都在`CSS`之前`DomContentLoaded`事件无需等到`CSS`加载完毕即可触发，当然解析`CSS`与`DOM`是需要等待前边的`Js`解析完毕的；当`Js`在`CSS`之后时，则`DomContentLoaded`事件需等到`CSS`与`Js`加载完毕才能够触发，上文也提到了`CSS`的加载会阻塞`Js`的加载，而`Js`标签本身也属于`DOM`结构，必须等待其加载完成之后才能触发`DomContentLoaded`事件；异步加载的`<script>`标签不会阻塞`DOMContentLoaded`事件。
* 当整个页面及所有依赖资源如样式表和图片都已完成加载时，将触发`load`事件。不使用动态加载的`<iframe>`同样会阻塞`load`事件，此外即使是异步加载的`<script>`标签同样会阻塞`load`事件。

在各种条件下重新整理一下页面加载的过程，主要是在于`DOMContentLoaded`事件与`load`事件触发的时间线：
* 自上而下，首先解析`HTML`标签，生成`DOM Tree`，此时`document.readyState = "loading"`。
* 在解析到`<link>`或者`<style>`标签时，开始解析`CSS`，生成`CSSOM`，值的注意的是此时解析`HTML`标签与解析`CSS`是并行执行的。
* 解析到没有设置异步加载的`<script>`的时候，阻塞文档解析，等待`Js`脚本加载并且执行完成后，才会继续解析文档。
* 解析到异步`<script>`的时候不阻塞解析文档，继续向下解析，`defer`属性会使`Js`文件等待`DOM Tree`构建完成之后再执行，而`async`属性会使`Js`文件在下载完成后立即执行。
* 解析文档的时候遇到需要加载外部资源例如图片时，先解析这个节点，根据`src`创建加载线程，异步加载图片资源，不阻塞解析文档，当然浏览器对于一个域名能够开启最大的线程数量会有限制。
* 文档解析完成，`document.readyState = "interactive"`。
* 设置为`defer`属性的`<script>`脚本开始按照顺序执行。
* 触发`DOMContentLoaded`事件。
* 等待设置为`async`属性的`<script>`以及图片与`<iframe>`等加载，直至页面完全加载完成。
* `load`事件触发，`document.readyState = "complete"`。

## 调用
有些时候我们希望尽快介入对`DOM`的干涉，此时调用`DOMContentLoaded`事件显然更加合适，而为了处理各种浏览器，需要对其进行兼容处理。
* 对于支持`DOMContentLoaded`的浏览器使用`DOMContentLoaded`事件。
* 如果是小于`525`版本的`Webkit`则通过轮询`document.readyState`来实现。
* 对于旧版本的`IE`浏览器使用`Diego Perini`发现的著名`hack`。

```javascript
/* https://www.cnblogs.com/JulyZhang/archive/2011/02/12/1952484.html */
/*
 * 注册浏览器的DOMContentLoaded事件
 * @param { Function } onready [必填]在DOMContentLoaded事件触发时需要执行的函数
 * @param { Object } config [可选]配置项
 */
function onDOMContentLoaded(onready, config) {
    //浏览器检测相关对象，在此为节省代码未实现，实际使用时需要实现。
    //var Browser = {};
    //设置是否在FF下使用DOMContentLoaded（在FF2下的特定场景有Bug）
    this.conf = {
        enableMozDOMReady: true
    };
    if (config)
        for (var p in config)
            this.conf[p] = config[p];
    var isReady = false;

    function doReady() {
        if (isReady) return;
        //确保onready只执行一次
        isReady = true;
        onready();
    }
    /*IE*/
    if (Browser.ie) {
        (function() {
            if (isReady) return;
            try {
                document.documentElement.doScroll("left");
            } catch (error) {
                setTimeout(arguments.callee, 0);
                return;
            }
            doReady();
        })();
        window.attachEvent('onload', doReady);
    }
    /*Webkit*/
    else if (Browser.webkit && Browser.version < 525) {
        (function() {
            if (isReady) return;
            if (/loaded|complete/.test(document.readyState))
                doReady();
            else
                setTimeout(arguments.callee, 0);
        })();
        window.addEventListener('load', doReady, false);
    }
    /*FF Opera 高版webkit 其他*/
    else {
        if (!Browser.ff || Browser.version != 2 || this.conf.enableMozDOMReady)
            document.addEventListener("DOMContentLoaded", function() {
                document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                doReady();
            }, false);
        window.addEventListener('load', doReady, false);
    }
}
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.im/post/6844903667733118983
https://juejin.im/post/6844903535314731021
https://juejin.im/post/6844903623583891469
https://juejin.im/post/6844904072340832264
https://juejin.im/post/6844904176569286669
https://www.cnblogs.com/caizhenbo/p/6679478.html
https://www.cnblogs.com/rubylouvre/p/4536334.html
https://developer.mozilla.org/zh-CN/docs/Web/Events/DOMContentLoaded
https://gwjacqueline.github.io/%E5%BC%82%E6%AD%A5%E5%8A%A0%E8%BD%BDjs/
```
