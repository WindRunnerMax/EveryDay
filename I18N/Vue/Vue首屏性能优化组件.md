# Vue First Screen Performance Optimization Component

Let's implement a simple `Vue` first screen performance optimization component. Modern browsers provide many new interfaces, which can greatly reduce the workload of writing code and do some performance optimization, without considering `IE` compatibility. Of course, in order to consider `IE`, we can also make provisions for it when encapsulating components. The main purpose of this article's first screen performance optimization component is to use the `IntersectionObserver` and `requestIdleCallback` interfaces.

## Description

Let's first consider the scenario of the first screen. When creating a page primarily for display, it usually involves loading a lot of resources such as images. If we don't want to load all resources when the user opens the page, but rather load the components when the user scrolls to the relevant position, we can choose the `IntersectionObserver` interface. Alternatively, we can use the `onscroll` event to listen, although this may result in poorer performance. For some components, we want them to be loaded but not synchronously when initializing the page. In such cases, we can use asynchronous methods such as `Promise` and `setTimeout`. If we want to further reduce the priority of loading this component, we can consider using the `requestIdleCallback` interface. The relevant code can be found in the `vue--first-screen-optimization` branch of `https://github.com/WindrunnerMax/webpack-simple-environment`.

### IntersectionObserver

The `IntersectionObserver` interface, which belongs to the `Intersection Observer API`, provides a method for asynchronously observing the intersection status of a target element with its ancestor element or the top-level document viewport. The ancestor element and the viewport are referred to as the root. In other words, the `IntersectionObserver API` can automatically observe whether an element is visible. The essence of visibility is when the target element and the viewport create an intersection area, so this API is called an intersection observer. Compatibility can be checked at [https://caniuse.com/?search=IntersectionObserver](https://caniuse.com/?search=IntersectionObserver).

```javascript
const io = new IntersectionObserver(callback, option);

// Start observing
io.observe(document.getElementById("example"));
// Stop observing
io.unobserve(element);
// Disconnect the observer
io.disconnect();
```

```
* The `callback` parameter, after creating a new `IntersectionObserver` object, will execute the specified callback function when it observes that the visible part of the target element has crossed one or more threshold `thresholds`.

* The `option` parameter, the second parameter of the `IntersectionObserver` constructor, is a configuration object that can set the following properties:
    * The `threshold` property determines when to trigger the callback function. It is an array, and each member is a threshold value. The default is `[0]`, which means that the callback function is triggered when the intersection ratio `intersectionRatio` reaches `0`. Users can customize this array, for example, `[0, 0.25, 0.5, 0.75, 1]` means that the callback function will be triggered when the target element is `0%`, `25%`, `50%`, `75%`, and `100%` visible.
    * The `root` property specifies the container node in which the target element is located, that is, the root element. The target element not only scrolls with the window, but also scrolls inside the container, such as scrolling in an `iframe` window. In this case, the `root` property needs to be set. Note that the container element must be an ancestor node of the target element.
    * The `rootMargin` property defines the `margin` of the root element to expand or shrink the size of the `rootBounds` rectangle, thereby affecting the size of the `intersectionRect` intersection area. It uses the CSS definition method, such as `10px 20px 30px 40px`, which represents the values in the `top`, `right`, `bottom`, and `left` directions.

* The `IntersectionObserver.root` attribute is read-only, representing the specific ancestor element `element` of the observed object. If no value is passed in or the value is `null`, the viewport of the top-level document is used by default.
* The `IntersectionObserver.rootMargin` attribute is read-only, representing the rectangular offset added to the root `root` boundary box when calculating the intersection. It can effectively shrink or enlarge the judgment range of the root to meet the calculation needs. The value returned by this attribute may be different from the one specified when calling the constructor, so you may need to change this value to match the internal requirements. All offsets can be expressed in pixels `pixel`, `px`, or percentage `%`. The default value is `0px 0px 0px 0px`.
* The `IntersectionObserver.thresholds` attribute is read-only, representing a list of thresholds in ascending order. Each threshold in the list is the ratio of the intersection area of the observed object to the boundary area. When any threshold of the observed object is crossed, a notification `Notification` will be generated. If no value is passed to the constructor, the default value is `0`.
* The `IntersectionObserver.disconnect()` method stops the `IntersectionObserver` object from observing.
* The `IntersectionObserver.observe()` method starts observing a target element.
* The `IntersectionObserver.takeRecords()` method returns an array of `IntersectionObserverEntry` objects for all observed targets.
* The `IntersectionObserver.unobserve()` method stops observing a specific target element.

In addition, when the `callback` function is executed, it will pass an `IntersectionObserverEntry` object parameter, which provides the following information.
* `time:` The time when the visibility changed, a high-precision timestamp in milliseconds.
* `target:` The observed target element, a `DOM` node object.
* `rootBounds:` Information about the rectangular area of the root element, the return value of the `getBoundingClientRect` method. If there is no root element and it is directly relative to the viewport scrolling, `null` is returned.
* `boundingClientRect:` Information about the rectangular area of the target element.
* `intersectionRect:` Information about the intersection area of the target element with the viewport or the root element.
* `intersectionRatio:` The visible ratio of the target element, that is, the ratio of `intersectionRect` to `boundingClientRect`. When fully visible, it is `1`, and when completely invisible, it is less than or equal to `0`.

```
```json
{
  "time": 3893.92,
  "rootBounds": {
    "bottom": 920,
    "height": 1024,
    "left": 0,
    "right": 1024,
    "top": 0,
    "width": 920
  },
  "boundingClientRect": {
    // ...
  },
  "intersectionRect": {
    // ...
  },
  "intersectionRatio": 0.54,
  "target": "element"
}
```

## requestIdleCallback
The `requestIdleCallback` method can take a function that will be called during browser idle periods, allowing developers to perform background and low-priority work on the main event loop without impacting time-critical events like animations and input responses. The functions are generally executed in first-come, first-served order. If the callback function specifies a timeout, it is possible to disrupt the execution order in order to execute the function before the timeout. For compatibility, check [here](https://caniuse.com/?search=requestIdleCallback).

```javascript
const handle = window.requestIdleCallback(callback[, options]);
```

- The `requestIdleCallback` method returns an `ID`, which can be passed to `window.cancelIdleCallback()` to end the callback.
- Parameter `callback`: A reference to a function that will be called when the event loop is idle. The function will receive a parameter named `IdleDeadline`, which can be used to obtain the current idle time and the status of whether the callback has already been executed before the timeout.
- Optional parameter `options`, which includes the following properties:
    - `timeout`: If a timeout is specified and has a positive value, and the callback has not been called after `timeout` milliseconds, the callback task will be queued in the event loop, even though doing so may have a negative impact on performance.

## Implementation
In fact, the main task of writing components is to understand how to use these two main APIs. First, focus on `IntersectionObserver`, because you consider using the dynamic component `<component />`, so when passing values to it, you need to use the form of asynchronous component loading `() => import("component")`. When observing, you can consider destroying the observer immediately after loading is complete, or destroying it when it leaves the visual area, which is mainly a strategy issue. The `Intersection Observer` must be `disconnect`ed when the page is destroyed to prevent memory leaks. In addition, in order to use `IntersectionObserver`, you must have a target to observe. If nothing is rendered, there is nothing to observe, so you need to introduce a skeleton screen. You can create a component that is very close in size to the real component to act as a placeholder. Here, for demo purposes, a simple `<section />` is rendered as a skeleton screen. Using `requestIdleCallback` is quite simple, just execute the callback function, similar to asynchronous processing with `Promise.resolve().then`.

This is a simple implementation logic. The typical usage of `observer` is to use a `div` or other element as a placeholder first, and then monitor the placeholder container with `observer`. When the container becomes visible, load the relevant components. The relevant code is in the `vue--first-screen-optimization` branch of `https://github.com/WindrunnerMax/webpack-simple-environment`. Please try to use `yarn` for installation to avoid dependency issues by using the `yarn.lock` file to lock the version. After running `npm run dev`, you can see the order in which these four lazy-loaded components are created in the `Console`. The lazy loading of component `A` needs to wait for the page rendering to be completed and then determine if it is in the visible area, so it can be directly seen on the first screen, while the lazy loading of component `D` needs the scroll bar to be scrolled outside the container of `D` to appear in the view after it's loaded. This means that `D` component won't load unless the scroll bar reaches the bottom. Additionally, you can pass `attrs` and `listeners` to the lazy-loaded component through `component-params` and `component-events`, similar to `$attrs` and `$listeners`. Thus, the lazy loading component has been implemented in a simple manner.

```html
<!-- App.vue -->
<template>
    <div>
        <section>1</section>
        <section>
            <div>2</div>
            <lazy-load
                :lazy-component="Example"
                type="observer"
                :component-params="{ content: 'Example A' }"
                :component-events="{
                    'test-event': testEvent,
                }"
            ></lazy-load>
        </section>
        <section>
            <div>3</div>
            <lazy-load
                :lazy-component="Example"
                type="idle"
                :component-params="{ content: 'Example B' }"
                :component-events="{
                    'test-event': testEvent,
                }"
            ></lazy-load>
        </section>
        <section>
            <div>4</div>
            <lazy-load
                :lazy-component="Example"
                type="lazy"
                :component-params="{ content: 'Example C' }"
                :component-events="{
                    'test-event': testEvent,
                }"
            ></lazy-load>
        </section>
        <section>
            <div>5</div>
            <lazy-load
                :lazy-component="Example"
                type="observer"
                :component-params="{ content: 'Example D' }"
                :component-events="{
                    'test-event': testEvent,
                }"
            ></lazy-load>
        </section>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import LazyLoad from "./components/lazy-load/lazy-load.vue";
@Component({
    components: { LazyLoad },
})
export default class App extends Vue {
    protected Example = () => import("./components/example/example.vue");

    protected testEvent(content: string) {
        console.log(content);
    }
}
</script>

<style lang="scss">
@import "./common/styles.scss";
body {
    padding: 0;
    margin: 0;
}
section {
    margin: 20px 0;
    color: #fff; /* Text color white */
    height: 500px;
    background: $color-blue; /* Background color as per $color-blue */
}
</style>
```

```html
<!-- lazy-load.vue -->
<template>
    <div>
        <component
            :is="renderComponent"
            v-bind="componentParams"
            v-on="componentEvents"
        ></component>
    </div>
</template>
```

```typescript
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class LazyLoad extends Vue {
    @Prop({ type: Function, required: true })
    lazyComponent!: () => Vue;
    @Prop({ type: String, required: true })
    type!: "observer" | "idle" | "lazy";
    @Prop({ type: Object, default: () => ({}) })
    componentParams!: Record<string, unknown>;
    @Prop({ type: Object, default: () => ({}) })
    componentEvents!: Record<string, unknown>;

    protected observer: IntersectionObserver | null = null;
    protected renderComponent: (() => Vue) | null = null;

    protected mounted() {
        this.init();
    }
```

```javascript
private init() {
    if (this.type === "observer") {
        // Check for the existence of `window.IntersectionObserver`
        if (window.IntersectionObserver) {
            this.observer = new IntersectionObserver(entries => {
                entries.forEach(item => {
                    // `intersectionRatio` is the visible proportion of the target element, greater than `0` means visible
                    // There are implementation strategy issues here, such as not removing `observe` after loading and destroying when not visible, etc.
                    if (item.intersectionRatio > 0) {
                        this.loadComponent();
                        // Remove `observe` after loading is complete
                        this.observer?.unobserve(item.target);
                    }
                });
            });
            this.observer.observe(this.$el.parentElement || this.$el);
        } else {
            // Load directly
            this.loadComponent();
        }
    } else if (this.type === "idle") {
        // Check for the existence of `requestIdleCallback`
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.requestIdleCallback) {
            requestIdleCallback(this.loadComponent, { timeout: 3 });
        } else {
            // Load directly
            this.loadComponent();
        }
    } else if (this.type === "lazy") {
        // Check for the existence of `Promise`
        if (window.Promise) {
            Promise.resolve().then(this.loadComponent);
        } else {
            // Degrade to use `setTimeout`
            setTimeout(this.loadComponent);
        }
    } else {
        throw new Error(`type: "observer" | "idle" | "lazy"`);
    }
}

private loadComponent() {
    this.renderComponent = this.lazyComponent;
    this.$emit("loaded");
}

protected destroyed() {
    this.observer && this.observer.disconnect();
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback
```