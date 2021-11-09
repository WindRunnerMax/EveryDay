# Vue首屏性能优化组件
简单实现一个`Vue`首屏性能优化组件，现代化浏览器提供了很多新接口，在不考虑`IE`兼容性的情况下，这些接口可以很大程度上减少编写代码的工作量以及做一些性能优化方面的事情，当然为了考虑`IE`我们也可以在封装组件的时候为其兜底，本文的首屏性能优化组件主要是使用`IntersectionObserver`以及`requestIdleCallback`两个接口。

## 描述
先考虑首屏场景，当做一个主要为展示用的首屏时，通常会加载较多的资源例如图片等，如果我们不想在用户打开时就加载所有资源，而是希望用户滚动到相关位置时再加载组件，此时就可以选择`IntersectionObserver`这个接口，当然也可以使用`onscroll`事件去做一个监听，只不过这样性能可能比较差一些。还有一些组件，我们希望他必须要加载，但是又不希望他在初始化页面时同步加载，这样我们可以使用异步的方式比如`Promise`和`setTimeout`等，但是如果想再降低这个组件加载的优先级，我们就可以考虑`requestIdleCallback`这个接口，相关代码在`https://github.com/WindrunnerMax/webpack-simple-environment`的`vue--first-screen-optimization`分支。

### IntersectionObserver
`IntersectionObserver`接口，从属于`Intersection Observer API`，提供了一种异步观察目标元素与其祖先元素或顶级文档视窗`viewport`交叉状态的方法，祖先元素与视窗`viewport`被称为根`root`，也就是说`IntersectionObserver API`，可以自动观察元素是否可见，由于可见`visible`的本质是，目标元素与视口产生一个交叉区，所以这个`API`叫做交叉观察器，兼容性`https://caniuse.com/?search=IntersectionObserver`。  

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


```
{
  time: 3893.92,
  rootBounds: ClientRect {
    bottom: 920,
    height: 1024,
    left: 0,
    right: 1024,
    top: 0,
    width: 920
  },
  boundingClientRect: ClientRect {
     // ...
  },
  intersectionRect: ClientRect {
    // ...
  },
  intersectionRatio: 0.54,
  target: element
}
```

### requestIdleCallback
`requestIdleCallback`方法能够接受一个函数，这个函数将在浏览器空闲时期被调用，这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应，函数一般会按先进先调用的顺序执行，如果回调函数指定了执行超时时间`timeout`，则有可能为了在超时前执行函数而打乱执行顺序，兼容性`https://caniuse.com/?search=requestIdleCallback`。

```javascript
const handle = window.requestIdleCallback(callback[, options]);
```

* `requestIdleCallback`方法返回一个`ID`，可以把它传入`window.cancelIdleCallback()`方法来结束回调。
* 参数`callback`，一个在事件循环空闲时即将被调用的函数的引用，函数会接收到一个名为`IdleDeadline`的参数，这个参数可以获取当前空闲时间以及回调是否在超时时间前已经执行的状态。
* 参数`options`可选，包括可选的配置参数，具有如下属性:
    * `timeout`: 如果指定了`timeout`，并且有一个正值，而回调在`timeout`毫秒过后还没有被调用，那么回调任务将放入事件循环中排队，即使这样做有可能对性能产生负面影响。

## 实现
实际上编写组件主要是搞清楚如何使用这两个主要的`API`就好，首先关注`IntersectionObserver`，因为考虑需要使用动态组件`<component />`，那么我们向其传值的时候就需要使用异步加载组件`() => import("component")`的形式。监听的时候，可以考虑加载完成之后即销毁监听器，或者离开视觉区域后就将其销毁等，这方面主要是策略问题。在页面销毁的时候就必须将`Intersection Observer`进行`disconnect`，防止内存泄漏。使用`requestIdleCallback`就比较简单了，只需要将回调函数执行即可，同样也类似于`Promise.resolve().then`这种异步处理的情况。  
这里是简单的实现逻辑，通常`observer`的使用方案是先使用一个`div`等先进行占位，然后在`observer`监控其占位的容器，当容器在视区时加载相关的组件，相关的代码在`https://github.com/WindrunnerMax/webpack-simple-environment`的`vue--first-screen-optimization`分支，请尽量使用`yarn`进行安装，可以使用`yarn.lock`文件锁住版本，避免依赖问题。使用`npm run dev`运行之后可以在`Console`中看到这四个懒加载组件`created`创建的顺序，其中`A`的`observer`懒加载是需要等其加载页面渲染完成之后，判断在可视区，才进行加载，首屏使能够直接看到的，而`D`的懒加载则是需要将滚动条滑动到`D`的外部容器出现在视图之后才会出现，也就是说只要不滚动到底部是不会加载`D`组件的，另外还可以通过`component-params`和`component-events`将`attrs`和`listeners`传递到懒加载的组件，类似于`$attrs`和`$listeners`，至此懒加载组件已简单实现。

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
    color: #fff;
    height: 500px;
    background: $color-blue;
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

    private init() {
        if (this.type === "observer") {
            // 存在`window.IntersectionObserver`
            if (window.IntersectionObserver) {
                this.observer = new IntersectionObserver(entries => {
                    entries.forEach(item => {
                        // `intersectionRatio`为目标元素的可见比例，大于`0`代表可见
                        // 在这里也有实现策略问题 例如加载后不解除`observe`而在不可见时销毁等
                        if (item.intersectionRatio > 0) {
                            this.loadComponent();
                            // 加载完成后将其解除`observe`
                            this.observer?.unobserve(item.target);
                        }
                    });
                });
                this.observer.observe(this.$el.parentElement || this.$el);
            } else {
                // 直接加载
                this.loadComponent();
            }
        } else if (this.type === "idle") {
            // 存在`requestIdleCallback`
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (window.requestIdleCallback) {
                requestIdleCallback(this.loadComponent, { timeout: 3 });
            } else {
                // 直接加载
                this.loadComponent();
            }
        } else if (this.type === "lazy") {
            // 存在`Promise`
            if (window.Promise) {
                Promise.resolve().then(this.loadComponent);
            } else {
                // 降级使用`setTimeout`
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
}
</script>
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback
```
