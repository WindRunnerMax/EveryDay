# Why does `data` return as a function?

When building component-based applications with `Vue`, the `data` property of each component is returned as a function. This is mainly because in the implementation of componentization, each instance can maintain an independent copy of the returned object, rather than sharing the reference to the same object.

## Simple `Vue` Instance
In a simple `Vue` instance, when not using componentization, `data` can be an object since there is only one instance and no issue with multiple instances sharing the same data.

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

## Component-based Instance
If using `Vue` with component-based instances, the `data` property must be returned as a function. If not using a function to return `data`, unexpected situations may occur. For example, in the following example, the button component is being reused. When clicking the first button, it should only increment the count for that specific button, but all buttons end up getting incremented. It's important to note that using a function to return the data is still necessary in this case, as without it `Vue` would throw an error in componentization. Even though the data is returned as a function, the `count` property within the returned object still points to the reference of the `counter` object. Essentially, it still leads to multiple component instances sharing one object, producing the same effect as directly returning an object.

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

To prevent this phenomenon, in the implementation of componentization, the `data` property must be returned as a function so that each instance can maintain an independent copy of the returned object, rather than sharing the reference to the same object.

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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://segmentfault.com/a/1190000019318483
https://cn.vuejs.org/v2/guide/components.html
https://blog.csdn.net/fengjingyu168/article/details/72900624
```