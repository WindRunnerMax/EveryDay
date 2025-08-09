# IntersectionObserver对象
`IntersectionObserver`对象，从属于`Intersection Observer API`，提供了一种异步观察目标元素与其祖先元素或顶级文档视窗`viewport`交叉状态的方法，祖先元素与视窗`viewport`被称为根`root`，也就是说`IntersectionObserver API`，可以自动观察元素是否可见，由于可见`visible`的本质是，目标元素与视口产生一个交叉区，所以这个`API`叫做交叉观察器，兼容性`https://caniuse.com/?search=IntersectionObserver`。  

## 概述
`IntersectionObserver`解决了一个长期以来`Web`的问题，观察元素是否可见，这个可见`visible`的本质是，目标元素与视口产生一个交叉区，所以这个`API`叫做交叉观察器。  
要检测一个元素是否可见或者两个元素是否相交并不容易，很多解决办法不可靠或性能很差。现在很多需求下都需要用到相交检测，例如图片懒加载、内容无限滚动、检测元素的曝光情况、可视区域播放动画等等，相交检测通常要用到`onscroll`事件监听，并且可能需要频繁调用`Element.getBoundingClientRect()`等方法以获取相关元素的边界信息，事件监听和调用`Element.getBoundingClientRect`都是在主线程上运行，因此频繁触发、调用可能会造成性能问题，这种检测方法极其怪异且不优雅。  
`Intersection Observer API`会注册一个回调函数，每当被监视的元素进入或者退出另外一个元素时或`viewport`，或者两个元素的相交部分大小发生变化时，该回调方法会被触发执行，这样网站的主线程不需要再为了监听元素相交而辛苦劳作，浏览器会自行优化元素相交管理，注意`Intersection Observer API`无法提供重叠的像素个数或者具体哪个像素重叠，他的更常见的使用方式是当两个元素相交比例在`N%`左右时，触发回调，以执行某些逻辑。  


```javascript
const io = new IntersectionObserver(callback, option);

// 开始观察
io.observe(document.getElementById("example"));
// 停止观察
io.unobserve(element);
// 关闭观察器
io.disconnect();
```


* 参数`callback`，创建一个新的`IntersectionObserver`对象后，当其监听到目标元素的可见部分穿过了一个或多个阈`thresholds`时，会执行指定的回调函数。
* 参数`option`，`IntersectionObserver`构造函数的第二个参数是一个配置对象，其可以设置以下属性:
    * `threshold`属性决定了什么时候触发回调函数，它是一个数组，每个成员都是一个门槛值，默认为`[0]`，即交叉比例`intersectionRatio`达到`0`时触发回调函数，用户可以自定义这个数组，比如`[0, 0.25, 0.5, 0.75, 1]`就表示当目标元素`0%`、`25%`、`50%`、`75%`、`100%`可见时，会触发回调函数。
    * `root`属性指定了目标元素所在的容器节点即根元素，目标元素不仅会随着窗口滚动，还会在容器里面滚动，比如在`iframe`窗口里滚动，这样就需要设置`root`属性，注意，容器元素必须是目标元素的祖先节点。
    * `rootMargin`属性定义根元素的`margin`，用来扩展或缩小`rootBounds`这个矩形的大小，从而影响`intersectionRect`交叉区域的大小，它使用`CSS`的定义方法，比如`10px 20px 30px 40px`，表示`top`、`right`、`bottom`和`left`四个方向的值。
* 属性`IntersectionObserver.root`只读，所监听对象的具体祖先元素`element`，如果未传入值或值为`null`，则默认使用顶级文档的视窗。
* 属性`IntersectionObserver.rootMargin`只读，计算交叉时添加到根`root`边界盒`bounding box`的矩形偏移量，可以有效的缩小或扩大根的判定范围从而满足计算需要，此属性返回的值可能与调用构造函数时指定的值不同，因此可能需要更改该值，以匹配内部要求，所有的偏移量均可用像素`pixel`、`px`或百分比`percentage`、`%`来表达，默认值为`0px 0px 0px 0px`。
* 属性`IntersectionObserver.thresholds`只读，一个包含阈值的列表，按升序排列，列表中的每个阈值都是监听对象的交叉区域与边界区域的比率，当监听对象的任何阈值被越过时，都会生成一个通知`Notification`，如果构造器未传入值，则默认值为`0`。
* 方法`IntersectionObserver.disconnect()`，使`IntersectionObserver`对象停止监听工作。
* 方法`IntersectionObserver.observe()`，使`IntersectionObserver`开始监听一个目标元素。
* 方法`IntersectionObserver.takeRecords()`，返回所有观察目标的`IntersectionObserverEntry`对象数组。
* 方法`IntersectionObserver.unobserve()`，使`IntersectionObserver`停止监听特定目标元素。
 
此外当执行`callback`函数时，会传递一个`IntersectionObserverEntry`对象参数，其提供的信息如下。

* `time:`可见性发生变化的时间，是一个高精度时间戳，单位为毫秒。
* `target:`被观察的目标元素，是一个`DOM`节点对象。
* `rootBounds:`根元素的矩形区域的信息，是`getBoundingClientRect`方法的返回值，如果没有根元素即直接相对于视口滚动，则返回`null`。
* `boundingClientRect:`目标元素的矩形区域的信息。
* `intersectionRect:`目标元素与视口或根元素的交叉区域的信息。
* `intersectionRatio:`目标元素的可见比例，即`intersectionRect`占`boundingClientRect`的比例，完全可见时为`1`，完全不可见时小于等于`0`。

## 应用
实现一个使用`IntersectionObserver`的简单示例，两个方块分别可以演示方块`1`是否在屏幕可见区域内以及方块`2`是否在方块`1`的相对可见交叉区域内，另外可以使用`IntersectionObserver`可以进行首屏渲染的优化，可以参考`https://github.com/WindrunnerMax/EveryDay/blob/master/Vue/Vue%E9%A6%96%E5%B1%8F%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E7%BB%84%E4%BB%B6.md`。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style> 
        body{
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            overflow-x: hidden;
        }
        .flex{
            display: flex;
        }
        .top-fixed{
            top: 0;
            position: fixed;
        }
        .placeholder1{
            width: 100%;
        }
        #box1{
            height: 200px; 
            overflow-y: auto; 
            border: 1px solid #aaa; 
            width: 60%;
        }
        .box1-placeholder{
            height: 105vh;
        }
        #box2{
            height: 100px; 
            background-color: blue; 
            margin-top: 300px; 
            width: 60%;
        }
        .box2-placeholder{
            height: 205px;
        }
    </style>
</head>
<body>
    <section class="flex top-fixed">
        <div class="flex">BOX1:</div>
        <div class="flex" id="box1-status">invisible</div>
        <div class="flex">&nbsp;BOX2:</div>
        <div class="flex" id="box2-status">invisible</div>
    </section>
    <div class="box1-placeholder"></div>
    <div id="box1">
        <div class="box2-placeholder"></div>
        <div id="box2"></div>   
        <div class="box2-placeholder"></div>
    </div>
    <div class="box1-placeholder"></div>

</body>
<script>
    (function(){
        const box1 = document.querySelector("#box1");
        const box2 = document.querySelector("#box2");
        const box1Status = document.querySelector("#box1-status");
        const box2Status = document.querySelector("#box2-status");
        const box1Observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
                // `intersectionRatio`为目标元素的可见比例，大于`0`代表可见
                if (item.intersectionRatio > 0) {
                    box1Status.innerText = "visible";
                }else{
                    box1Status.innerText = "invisible";
                }
            });
        }, {root: document});
        const box2Observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
                // `intersectionRatio`为目标元素的可见比例，大于`0`代表可见
                if (item.intersectionRatio > 0) {
                    box2Status.innerText = "visible";
                }else{
                    box2Status.innerText = "invisible";
                }
            });
        }, {root: box1});
        box1Observer.observe(box1);
        box2Observer.observe(box2);
    })();
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/eadd83d794c8
https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
```
