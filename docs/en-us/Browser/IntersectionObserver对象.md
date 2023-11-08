# IntersectionObserver Object
The `IntersectionObserver` object, belonging to the `Intersection Observer API`, provides an asynchronous way to observe the intersection status of a target element with its ancestor element or the top-level document viewport. The ancestor element and the viewport are referred to as the root. In other words, the `IntersectionObserver API` can automatically observe whether an element is visible. Since the essence of visibility is the intersection between the target element and the viewport, this API is called an intersection observer. Compatibility: [Check compatibility here](https://caniuse.com/?search=IntersectionObserver).  

## Description
`IntersectionObserver` solves a long-standing problem on the web of observing whether elements are visible. The essence of visibility is the intersection between the target element and the viewport, which is why this API is called an intersection observer. Detecting whether an element is visible or whether two elements intersect is not easy. Many solutions are unreliable or have poor performance. There are now many requirements for intersection detection, such as lazy loading images, infinite scrolling content, detecting element exposure, playing animations within the visible area, etc. Intersection detection usually requires listening to the `onscroll` event and may require frequent calls to `Element.getBoundingClientRect()` to obtain the boundary information of relevant elements. Event listening and calling `Element.getBoundingClientRect()` both run on the main thread, so frequent triggering and calling may cause performance issues. This detection method is extremely awkward and inelegant.  
The `Intersection Observer API` registers a callback function, which is triggered and executed whenever the monitored element enters or exits another element or the viewport, or when the size of the intersection area between two elements changes. This way, the website's main thread no longer needs to work hard to monitor element intersections, as the browser will optimize the intersection management. It's important to note that the `Intersection Observer API` cannot provide the number of overlapping pixels or the specific pixels that overlap. Its more common usage is to trigger a callback when the intersecting ratio of two elements is around `N%` to perform certain logic.  

```javascript
const io = new IntersectionObserver(callback, option);

// Start observing
io.observe(document.getElementById("example"));
// Stop observing
io.unobserve(element);
// Disconnect the observer
io.disconnect();
```

```markdown
* The parameter `callback`, when a new `IntersectionObserver` object is created, will execute the specified callback function when it observes that the visible portion of the target element has crossed one or more thresholds `thresholds`.

* The parameter `option`, the second parameter of the `IntersectionObserver` constructor is a configuration object, which can set the following properties:
   * The `threshold` property determines when to trigger the callback function. It is an array, each member is a threshold value, default as `[0]`, that is, when the intersection ratio `intersectionRatio` reaches `0`, the callback function will be triggered. Users can customize this array, for example, `[0, 0.25, 0.5, 0.75, 1]` indicating that the callback function will be triggered when the target element is `0%`, `25%`, `50%`, `75%`, and `100%` visible.
   * The `root` property specifies the container node, the root element, where the target element is located. The target element will scroll not only with the window, but also within the container, for example, scrolling in an `iframe` window, the `root` property needs to be set. Note that the container element must be an ancestor element of the target element.
   * The `rootMargin` property defines the `margin` of the root element to expand or shrink the size of the `rootBounds` rectangle, thereby affecting the size of the `intersectionRect` intersection area. It uses the CSS definition method, for example, `10px 20px 30px 40px`, representing values in the `top`, `right`, `bottom`, and `left` directions.

* The property `IntersectionObserver.root` is read-only, representing the specific ancestor element `element` of the observed object. If no value is passed or the value is `null`, the top-level document viewport is used by default.

* The property `IntersectionObserver.rootMargin` is read-only, representing the rectangle offset added to the root `root` boundary box during intersection calculation, which can effectively shrink or expand the judging range of the root to meet calculation needs. The value returned by this property may differ from the value specified when calling the constructor, so it may be necessary to change the value to match internal requirements. All offset values can be expressed in pixels `px` or percentage (%) and the default is `0px 0px 0px 0px`.

* The property `IntersectionObserver.thresholds` is read-only, representing a list of thresholds, sorted in ascending order. Each threshold in the list is the ratio of the intersecting area of the observed object to the boundary region. A notification `Notification` will be generated when any threshold of the observed object is crossed. If no value is passed into the constructor, the default value is `0`.

* The method `IntersectionObserver.disconnect()` stops the `IntersectionObserver` object from observing.

* The method `IntersectionObserver.observe()` starts observing a target element for the `IntersectionObserver`.

* The method `IntersectionObserver.takeRecords()` returns an array of `IntersectionObserverEntry` objects for all observed targets.

* The method `IntersectionObserver.unobserve()` stops observing a specific target element for the `IntersectionObserver`.

Additionally, when the `callback` function is executed, it will pass an `IntersectionObserverEntry` object parameter, which provides the following information:

* `time:` the time when the visibility changes, a high-precision timestamp in milliseconds.

* `target:` the observed target element, a `DOM` node object.

* `rootBounds:` information about the rectangle area of the root element, the return value of the `getBoundingClientRect` method. If there is no root element, or directly scrolls relative to the viewport, `null` is returned.

* `boundingClientRect:` information about the rectangle area of the target element.

* `intersectionRect:` information about the intersecting area of the target element with the viewport or root element.

* `intersectionRatio:` the visible ratio of the target element, i.e. the ratio of `intersectionRect` to `boundingClientRect`. It is `1` when fully visible and less than or equal to `0` when fully invisible.
```

## Application
Implement a simple example using `IntersectionObserver`. Two squares can demonstrate whether square `1` is within the visible area of the screen and whether square `2` is within the relatively visible intersection area of square `1`. Additionally, `IntersectionObserver` can be used to optimize the initial screen rendering, which can be referenced at `https://github.com/WindrunnerMax/EveryDay/blob/master/Vue/Vue%E9%A6%96%E5%B1%8F%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E7%BB%84%E4%BB%B6.md`.

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
```

```html
</body>
<script>
    (function(){
        const box1 = document.querySelector("#box1");
        const box2 = document.querySelector("#box2");
        const box1Status = document.querySelector("#box1-status");
        const box2Status = document.querySelector("#box2-status");
        const box1Observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
                // `intersectionRatio` represents the visible percentage of the target element. If it's greater than `0`, it's visible
                if (item.intersectionRatio > 0) {
                    box1Status.innerText = "visible";
                }else{
                    box1Status.innerText = "invisible";
                }
            });
        }, {root: document});
        const box2Observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
                // `intersectionRatio` represents the visible percentage of the target element. If it's greater than `0`, it's visible
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/eadd83d794c8
https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
```