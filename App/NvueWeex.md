# Nvue/Weex

> 使用Uniapp做了一个App，感觉性能不是很好，了解过Uniapp的Nvue，就想做一个纯Nvue项目，其实基本就是做一个Weex项目，不得不说坑是真的多，但是渲染性能真的是没得比
> 本项目开发环境为 UNIAPP 的 纯NVUE 项目，与WEEX有不同之处
> [https://github.com/WindrunnerMax/SW](https://github.com/WindrunnerMax/SW)


## 一、 CSS选择器
### 1. 简单类选择器

```css
/** Weex仅支持简单类选择器，不支持标签选择器以及子选择器 **/

/* 支持 */
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
    
    
/* 不支持 */
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
## 二、通用样式

### 1. flex 布局

 - 每个节点自动设置为flex，无需再次显示声明，且flex为唯一布局方式
 - flex默认方向为纵向，与Web默认不同，需手动声明为横向 `flex-direction: row;`
 - 使用`align-items: center;justify-content: center;/* flex为横向为例 */`进行居中
 - 建议阅读[http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
 - 使用 `flex: 1;`可以将父容器填充满




### 2. text 文字

 - 显示文字必须在`<text></text>`中使用
 - `color: #aaa;font-size: 15px;`等样式仅在`<text></text>`中生效
 - color、font-size等属性不支持从父节点继承，必须使用class或者内联声明
 - text标签中内联 margin、padding 样式失效，需使用class声明

### 3. page 页面
> Weex不支持page选择器，也没有page样式，page.json中设置backgroundColor也无效
> 只能弯道超车设置整体页面颜色，但是效果并不是特别好
> 注意这是Uniapp的Nvue方式
> 此外，直接在 .page 设置 flex:1 ， 并将 class="page" 赋予根节点，可以将页面扩充至满屏，但也会导致页面无法滚动
> 官方机器人给予了更好的解决方案
> 此外一个坑，Nvue不支持全局组件，每个页面需要的组件必须在页面单独引入

```css
/** 首先声明 .page 类 **/
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
        <view class="page" ref="box"> <!-- 声明page与容器块，注意ref -->
            <!-- 页面内容 -->
        </view>
        <view style="background-color: #F8F8F8;" :style="pageFill"></view> <!-- 填充块 -->
    </view>
</template>

```

```javascript
// 获取页面已使用高度，将填充块高度设置为屏幕高度-已使用容器高度
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
        this.resize(); // 调用resize调整填充块大小
        var that = this;
        // uni.requests 中 success 可以调用 that.$nextTick(() => { that.resize() })
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
<!-- 使用flex:1;的情况，可以设置全屏页面，但这样页面将无法滚动 -->
<!-- 页面中 -->
<template>
    <view class="page">
        
        <!-- 节点内容 -->
        
    </view>
</template>

<!-- App.vue -->
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
<!-- 官方的方法，偶然看到官方群机器人的回复 -->
<template>
    <view class="page" style="flex:1;">
        <scroll-view scroll-y="true">
            <view>
                <!-- 页面内容 -->
            </view>
        </scroll-view>
    </view>
</template>

<!-- 封装个组件 -->
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
### 4. width 宽度

 - Weex 针对长度单位，支持 px 和 wx 作为长度单位，不支持相对单位（em，rem，pt，%）
 - Uniapp编译模式，rpx是以750宽屏幕为基准的动态单位，px则是固定像素单位
 - 750rpx是Uniapp中Nvue的满屏基准，是需要编译模式为Uniapp，区别于Weex编译模式
 - 除了固定大小的图片等，直接使用 flex 就可以完成布局，注意使用`flex:1;`


### 5. border 边框

```css
/** border不支持简写 **/

/* 支持 */
.border{
    border-style: solid;
    border-color: #EEEEEE;
    border-bottom-width: 1px;
}

/* 不支持 */
.border{
    border: 1px solid #eee;
}
```

### 6. display 属性


 - 不支持 display 属性
 - 不能使用 display:none; 来控制元素的显隐性
 -  v-show 条件渲染是不生效的，使用 v-if 代替


### 7. z-index 层级
 - 不支持 z-index 进行层级关系的设定，但是靠后的元素层级更高，因此，可以将层级高的元素放在靠后的位置
 
### 8. background 背景
```css
/** background不支持简写，简写在浏览器上颜色能够正常渲染，但是在手机端，颜色无法正常渲染 **/

/* 支持 */
.backgroundT{
    background-color: #F8F8F8;
}

/* 不支持 */
.backgroundT{
    background: #F8F8F8;
}
```



### 9. padding、margin 边距

```css
/* 支持 */
padding: 1px;
padding: 1px 2px 3px 4px; /* class */
margin: 1px;
margin: 1px 2px 3px 4px; /* class */
```

## 三、字体图标
### 1. 阿里矢量图标库

```css
/** 以阿里矢量图标库iconfont为例引入字体图标 **/
/** 只需要在首页引入一次即可全部页面使用 **/
```


```css
/* App.vue */
.iconfont{
    font-family: iconfont;
}
```

```javascript
// 应用首页引入
const dom = weex.requireModule('dom');
dom.addRule('fontFace', {
    'fontFamily': 'iconfont',
    'src': "url('https://at.alicdn.com/t/font_1582902_mwrjy69s3lm.ttf')"
})
```

```xml
<!-- 显示图标 -->
<text class='iconfont' style="color: #FF6347;">&#xe601;</text>
```
## 四、内部组件
### 1. image

 - width, height 和 src必须被提供，否则图片无法渲染。
 - resize属性决定图片缩放，允许值cover / contain / stretch，默认stretch

### 2. webview

 - `<web />`是weex支持的webview组件，加载完成后显示HTML
 - `<web-view />`是uniapp支持的webview组件，webview-styles属性不支持
 - 上述组件都必须指定width, height 和 src，否则无法显示
 - 可以使用 `flex: 1;` 来设置填充满屏幕
 - `<web />`阻断了下载与打开其他应用事件
