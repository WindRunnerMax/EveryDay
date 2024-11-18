# Nvue/Weex

> I made an app using Uniapp, but I feel that the performance is not very good. After learning about Nvue in Uniapp, I wanted to create a pure Nvue project. In fact, it's basically a Weex project. I have to say that there are really a lot of pitfalls, but the rendering performance is really unmatched.
> The development environment for this project is a pure NVUE project in UNIAPP, which is different from WEEX.
> [https://github.com/WindrunnerMax/SW](https://github.com/WindrunnerMax/SW)

## 1. CSS Selectors
### 1. Simple Class Selectors

```css
/** Weex only supports simple class selectors, not tag selectors or child selectors **/

/* Supported */
.test{
    padding: 10px;
    font-size: 15px;
    background-color: #F8F8F8;
}

.test , .test2{
    padding: 10px;
    font-size: 15px;
    background-color: #F8F8F8;
}
    
    
/* Not supported */
a{
    padding: 10px;
    font-size: 15px;
    background-color: #F8F8F8;
}
.test .test2{
    padding: 10px;
    font-size: 15px;
    background-color: #F8F8F8;
}
```
## 2. Common Styles

### 1. Flex Layout

- Each node is automatically set to flex, so there is no need to declare it again, and flex is the only layout mode.
- The default direction of flex is vertical, which is different from the default in web. You need to manually declare it as horizontal using `flex-direction: row;`.
- Use `align-items: center;justify-content: center;/* flex as an example of horizontal */` for center alignment.
- It is recommended to read [http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html).
- Use `flex: 1;` to make the parent container fill the entire space.

### 2. Text Styles

- Text must be displayed within `<text></text>` tags.
- Styles like `color: #aaa;font-size: 15px;` only take effect within `<text></text>` tags.
- Properties like color and font-size cannot be inherited from parent nodes. You must use classes or inline declarations.
- Inline margin and padding styles do not work within text tags. You need to use class declarations.

### 3. Page Styles
> Weex does not support the page selector, nor does it have page styles. Setting the backgroundColor in page.json also has no effect.
> The only way to set the overall page color is to take a detour, but the effect is not particularly good.
> Note that this is the Nvue method in Uniapp.
> In addition, directly setting flex:1 in .page and assigning class="page" to the root node can expand the page to full screen, but it will also prevent the page from scrolling.
> The official robot has provided a better solution.
> Another pitfall is that Nvue does not support global components. Each page must import the components it needs separately.

```css
/** First declare the .page class **/
.page{
    font-family: Arial,, 'STHeiti STXihei', 'Microsoft YaHei', Tohoma, sans-serif;
    padding: 10px;
    font-size: 15px;
    background-color: #F8F8F8;
}
```

```xml
<template>
    <view>
        <view class="page" ref="box"> <!-- Declare page and container block, pay attention to ref -->
            <!-- Page content -->
        </view>
        <view style="background-color: #F8F8F8;" :style="pageFill"></view> <!-- Fill block -->
    </view>
</template>

```

```javascript
// Get the height of the page that has been used, and set the height of the fill block to screen height minus the height of the used container
const app = getApp()
const dom = weex.requireModule('dom');
export default {
    data() {
        return {
            pageFill: {
                width: "750rpx",
                height: "0rpx"
            }
        }
    },
    onReady: function() {
        this.resize(); // Call resize to adjust the size of the fill block
        var that = this;
        // In uni.requests, you can call that.$nextTick(() => { that.resize() }) in success
    },
    methods: {
        resize: function() {
            const that = this;
            const result = dom.getComponentRect(this.$refs.box, option => {
                that.pageFill.height = (uni.getSystemInfoSync().windowHeight - option.size.height) + 'px';
                console.log(uni.getSystemInfoSync().windowHeight, option.size.height);
            })
        },
    }
}
```

```xml
<!-- In the case of using flex:1;, you can set the full-screen page, but the page will not be able to scroll -->
<!-- In the page -->
<template>
    <view class="page">
        
        <!-- Node content -->
        
    </view>
</template>

<!-- In App.vue -->
<style>
.page{
    font-family: Arial, Helvetica, 'STHeiti STXihei', 'Microsoft YaHei', Tohoma, sans-serif;
    padding: 10px;
    font-size: 15px;
    flex: 1;
    background-color: #F8F8F8;
}
</style>
```

```xml
<!-- Official method, accidentally saw the reply from the official group robot -->
<template>
    <view class="page" style="flex:1;">
        <scroll-view scroll-y="true">
            <view>
                <!-- Page content -->
            </view>
        </scroll-view>
    </view>
</template>
```

<!-- Encapsulate a component -->
<template name="scrollpage">
    <view class="scrollPage">
        <scroll-view scroll-y="true">
            <view class="scrollRootView">
                <slot></slot>
            </view>
        </scroll-view>
    </view>
</template>

<script>
    export default {
        name: "scrollpage",
        data() {
            return {};
        }
    }
</script>

<style>
    .scrollPage{
        font-family: Arial, Helvetica, 'STHeiti STXihei', 'Microsoft YaHei', Tohoma, sans-serif;
        font-size: 15px;
        background-color: #F8F8F8;
        flex: 1;
    }
    .scrollRootView{
        padding: 10px;
    }
</style>

```
### 4. width width

 - Weex supports px and wx as length units for length units, and does not support relative units (em, rem, pt, %)
 - In Uniapp compilation mode, rpx is a dynamic unit based on a 750px wide screen, and px is a fixed pixel unit
 - 750rpx is the full-screen benchmark of Nvue in Uniapp, which requires Uniapp as the compilation mode, different from Weex compilation mode
 - Except for fixed-size images, etc., you can use flex to complete the layout, pay attention to use `flex:1;`


### 5. border border

```css
/** border does not support shorthand **/

/* Supported */
.border{
    border-style: solid;
    border-color: #EEEEEE;
    border-bottom-width: 1px;
}

/* Not supported */
.border{
    border: 1px solid #eee;
}
```

### 6. display property


 - display property is not supported
 - Cannot use display:none; to control the visibility of elements
 - v-show conditional rendering does not take effect, use v-if instead


### 7. z-index level
 - z-index is not supported for setting the level relationship, but the element at the back has a higher level, so you can place the element with a higher level at the back
 
### 8. background background
```css
/** background does not support shorthand. Shorthand can render colors normally in browsers, but colors cannot be rendered normally on mobile phones **/

/* Supported */
.backgroundT{
    background-color: #F8F8F8;
}

/* Not supported */
.backgroundT{
    background: #F8F8F8;
}
```



### 9. padding, margin margin

```css
/* Supported */
padding: 1px;
padding: 1px 2px 3px 4px; /* class */
margin: 1px;
margin: 1px 2px 3px 4px; /* class */
```

## Three, font icons
### 1. Alibaba Vector Icon Library

```css
/** Take Alibaba Vector Icon Library iconfont as an example to introduce font icons **/
/** Only need to import once on the homepage, all pages can be used **/
```


```css
/* App.vue */
.iconfont{
    font-family: iconfont;
}
```

```javascript
// Import on the application homepage
const dom = weex.requireModule('dom');
dom.addRule('fontFace', {
    'fontFamily': 'iconfont',
    'src': "url('https://at.alicdn.com/t/font_1582902_mwrjy69s3lm.ttf')"
})
```

```xml
<!-- Display icon -->
<text class='iconfont' style="color: #FF6347;">&#xe601;</text>
```

## IV. Internal Components
### 1. image

- The `width`, `height`, and `src` attributes must be provided, otherwise the image will not be rendered.
- The `resize` attribute determines the image scaling, allowing values of `cover`, `contain`, or `stretch`. The default is `stretch`.

### 2. webview

- `<web />` is the webview component supported by Weex, which displays HTML after it is loaded.
- `<web-view />` is the webview component supported by Uniapp, which does not support the `webview-styles` attribute.
- Both of the above components must specify `width`, `height`, and `src`, otherwise they will not be displayed.
- You can use `flex: 1;` to set it to fill the screen.
- `<web />` blocks the download and open other application events.
