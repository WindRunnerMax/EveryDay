# data为何以函数形式返回
在使用`Vue`构建组件化应用时，每个组件的`data`属性都是以函数形式返回的，这主要是在组件化实现的时候，每个实例可以维护一份被返回对象的独立的拷贝，而不是共享同一个对象的引用。

## Vue简单实例
在一个`Vue`简单实例中，也就是不使用组件化实现的时候，`data`可以是一个对象，因为本身也只有一个实例，就不存在多个实例共享的问题。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app">
        <div>{{msg}}</div>
    </div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue Instance'
        }
    })
</script>
</html>
```

## 组件化实例
如果是使用`Vue`的组件化实例，那么`data`属性就必须以函数的形式返回，如果不使用函数的形式返回，可能会出现一些意料之外的情况，比如下面的例子中，按钮组件是复用的，在点击第一个按钮时本身应该只有第一个按钮`+1`，但是所有的按钮都跟随`+1`。请注意，在此处仍然是使用函数的形式返回，这是因为如果在组件化实现中如果不使用函数的形式返回`Vue`会直接报错，但是实现的效果是相同的，虽然是以函数的形式返回，但是返回的对象中`count`属性都是指向了对于`counter`对象的引用，本质上依旧是多个组件实例共享一个对象，实际效果与以对象的形式直接返回相同。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app">
        <button-counter></button-counter>
        <button-counter></button-counter>
        <button-counter></button-counter>
    </div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var counter = {
        count: 0
    }
    Vue.component('button-counter', {
      data: function(){
          return counter;
      },
      template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
    })
    var vm = new Vue({
        el: '#app'
    })
</script>
</html>
```

所以为了规避这种现象，在组件化实现的时候，`data`属性必须以函数的形式返回，以便每个实例可以维护一份被返回对象的独立的拷贝，而不是共享同一个对象的引用。


```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app">
        <button-counter></button-counter>
        <button-counter></button-counter>
        <button-counter></button-counter>
    </div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    Vue.component('button-counter', {
      data: function(){
          return {
            count: 0
          }
      },
      template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
    })
    var vm = new Vue({
        el: '#app'
    })
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000019318483
https://cn.vuejs.org/v2/guide/components.html
https://blog.csdn.net/fengjingyu168/article/details/72900624
```
