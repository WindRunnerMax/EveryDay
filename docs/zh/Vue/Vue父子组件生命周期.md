# Vue父子组件生命周期
`Vue`实例需要经过创建、初始化数据、编译模板、挂载`DOM`、渲染、更新、渲染、卸载等一系列过程，这个过程就是`Vue`的生命周期，`Vue`中提供的钩子函数有`beforeCreate`、`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeDestroy`、`destroyed`，父子组件嵌套时，父组件和子组件各拥有各自独立的钩子函数。

## 描述

### 创建过程
创建过程主要涉及`beforeCreate`、`created`、`beforeMount`、`mounted`四个钩子函数。

```
Parent beforeCreate -> Parent Created -> Parent BeforeMount -> Child BeforeCreate -> Child Created -> Child BeforeMount -> Child Mounted -> Parent Mounted
```

### 更新过程
更新过程主要涉及`beforeUpdate`、`updated`两个钩子函数，当父子组件有数据传递时才会有生命周期的比较。

```
Parent BeforeUpdate -> Child BeforeUpdate -> Child Updated -> Parent Updated
```

### 销毁过程
销毁过程主要涉及`beforeDestroy`、`destroyed`两个钩子函数，本例直接调用`vm.$destroy()`销毁整个实例以达到销毁父子组件的目的。

```
Parent BeforeDestroy -> Child BeforeDestroy -> Child Destroyed -> Parent Destroyed
```


### 示例
```html
<!DOCTYPE html>
<html>

<head>
    <title>Vue父子组件生命周期</title>
</head>

<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    Vue.component("counter", {
        props: {
            count: { 
                type: Number,
                default: 0
            },
        },
        beforeCreate: function() {
            console.log("Child", "BeforeCreate");
        },
        created: function() {
            console.log("Child", "Created");
        },
        beforeMount: function() {
            console.log("Child", "BeforeMount");
        },
        mounted: function() {
            console.log("Child", "Mounted");
        },
        beforeUpdate: function() {
            console.log("Child", "BeforeUpdate");
        },
        updated: function() {
            console.log("Child", "Updated");
        },
        beforeDestroy: function() {
            console.log("Child", "BeforeDestroy");
        },
        destroyed: function() {
            console.log("Child", "Destroyed");
        },
        template: `
            <div>
                <div>{{count}}</div>
            </div>
        `
    })
    var vm = new Vue({
        el: '#app',
        data: function(){
            return {
                count: 1
            }
        },
        beforeCreate: function() {
            console.log("Parent", "BeforeCreate");
        },
        created: function() {
            console.log("Parent", "Created");
        },
        beforeMount: function() {
            console.log("Parent", "BeforeMount");
        },
        mounted: function() {
            console.log("Parent", "Mounted");
        },
        beforeUpdate: function() {
            console.log("Parent", "BeforeUpdate");
        },
        updated: function() {
            console.log("Parent", "Updated");
        },
        beforeDestroy: function() {
            console.log("Parent", "BeforeDestroy");
        },
        destroyed: function() {
            console.log("Parent", "Destroyed");
        },
        template: `
            <div>
                <counter :count="count"></counter> 
                <button @click="count++">++</button>
            </div>
        `
    })
</script>

</html>
```

## 生命周期
`Vue`生命周期钩子函数功能示例，其中`this.msg`初始化赋值`Vue Lifecycle`，在更新过程中赋值为`Vue Update`。

### beforeCreate
从`Vue`实例开始创建到`beforeCreate`钩子执行的过程中主要进行了一些初始化操作，例如组件的事件与生命周期钩子的初始化。在此生命周期钩子执行时组件并未挂载，`data`、`methods`等也并未绑定，此时主要可以用来加载一些与`Vue`数据无关的操作，例如展示一个`loading`等。

```javascript
console.log("beforeCreate");
console.log(this.$el); //undefined
console.log(this.$data); //undefined 
console.log(this.msg); // undefined
console.log("--------------------");
```

### created
从`beforeCreate`到`created`的过程中主要完成了数据绑定的配置、计算属性与方法的挂载、`watch/event`事件回调等。在此生命周期钩子执行时组件未挂载到到`DOM`，属性`$el`目前仍然为`undefined`，但此时已经可以开始操作`data`与`methods`等，只是页面还未渲染，在此阶段通常用来发起一个`XHR`请求。

```javascript
console.log("created");
console.log(this.$el); //undefined
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### beforeMount
从`created`到`beforeMount`的过程中主要完成了页面模板的解析，在内存中将页面的数据与指令等进行解析，当页面解析完成，页面模板就存在于内存中。在此生命周期钩子执行时`$el`被创建，但是页面只是在内存中，并未作为`DOM`渲染。

```javascript
console.log("beforeMount");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); // {__ob__: Observer}
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### mounted
从`beforeMount`到`mounted`的过程中执行的是将页面从内存中渲染到`DOM`的操作。在此生命周期钩子执行时页面已经渲染完成，组件正式完成创建阶段的最后一个钩子，即将进入运行中阶段。此外关于渲染的页面模板的优先级，是`render`函数 `>` `template`属性 `>` 外部`HTML`。

```javascript
console.log("mounted");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### beforeUpdate
当数据发生更新时`beforeUpdate`钩子便会被调用，此时`Vue`实例中数据已经是最新的，但是在页面中的数据还是旧的，在此时可以进一步地更改状态，这不会触发附加的重渲染过程。在上述例子中加入了`debugger`断点，可以观察到`Vue`实例中数据已经是最新的，但是在页面中的数据还是旧的。

```javascript
// this.msg = "Vue Update";
console.log("beforeUpdate");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### updated
当数据发生更新并在`DOM`渲染完成后`updated`钩子便会被调用，在此时组件的`DOM`已经更新，可以执行依赖于`DOM`的操作。

```javascript
// this.msg = "Vue Update";
console.log("updated");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### beforeDestroy
在`Vue`实例被销毁之前`beforeDestroy`钩子便会被调用，在此时实例仍然完全可用。

```javascript
// this.$destroy();
console.log("beforeDestroy");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### destroyed
在`Vue`实例被销毁之后`destroyed`钩子便会被调用，在此时`Vue`实例绑定的所有东西都会解除绑定，所有的事件监听器会被移除，所有的子实例也会被销毁，组件无法使用，`data`和`methods`也都不可使用，即使更改了实例的属性，页面的`DOM`也不会重新渲染。

```javascript
// this.$destroy();
console.log("destroyed");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000011381906
https://www.cnblogs.com/yuliangbin/p/9348156.html
https://www.cnblogs.com/zmyxixihaha/p/10714217.html
```
