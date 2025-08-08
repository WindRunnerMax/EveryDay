# Vue Lifecycle
A `Vue` instance needs to go through a series of processes like creation, data initialization, template compilation, mounting `DOM`, rendering, updating, rendering, and unmounting. This whole process is called the lifecycle of `Vue`, which provides many hooks at different stages of the lifecycle. The lifecycle hooks provided in `Vue` include `beforeCreate`, `created`, `beforeMount`, `mounted`, `beforeUpdate`, `updated`, `beforeDestroy`, and `destroyed`.

## Example
During the instantiation of a `Vue` instance, the lifecycle hooks that are directly triggered include `beforeCreate`, `created`, `beforeMount`, and `mounted`. During the process of data updating, the triggered lifecycle hooks include `beforeUpdate` and `updated`. And during the component destruction process, the triggered lifecycle hooks include `beforeDestroy` and `destroyed`.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue Lifecycle</title>
</head>
<body>
    <div id="app">
        <div>{{msg}}</div>
        <button @click="updateMsg">updateMsg</button>
        <button @click="destroyVue">destroyVue</button>
    </div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue Lifecycle'
        },
        beforeCreate: function() {
            console.log("beforeCreate");
            console.log(this.$el); //undefined
            console.log(this.$data); //undefined 
            console.log(this.msg); // undefined
            console.log("--------------------");
        },
        created: function() {
            console.log("created");
            console.log(this.$el); //undefined
            console.log(this.$data); //{__ob__: Observer} 
            console.log(this.msg); // Vue Lifecycle
            console.log("--------------------");
        },
        beforeMount: function() {
            console.log("beforeMount");
            console.log(this.$el); //<div id="app">...</div>
            console.log(this.$data); // {__ob__: Observer}
            console.log(this.msg); // Vue Lifecycle
            console.log("--------------------");
        },
        mounted: function() {
            console.log("mounted");
            console.log(this.$el); //<div id="app">...</div>
            console.log(this.$data); //{__ob__: Observer} 
            console.log(this.msg); // Vue Lifecycle
            console.log("--------------------");
        },
        beforeUpdate: function () {
            console.log("beforeUpdate");
            console.log(this.$el);
            console.log(this.$data);
            console.log(this.msg);
            debugger;
            console.log("--------------------");
        },
        updated: function () {
            console.log("updated");
            console.log(this.$el);
            console.log(this.$data);
            console.log(this.msg);
            console.log("--------------------");
        },
        beforeDestroy: function () {
            console.log("beforeDestroy");
            console.log(this.$el);
            console.log(this.$data);
            console.log(this.msg);
            console.log("--------------------");
        },
        destroyed: function () {
            console.log("destroyed");
            console.log(this.$el);
            console.log(this.$data);
            console.log(this.msg);
            console.log("--------------------");
        },
        methods:{
            updateMsg: function(){
                this.msg = "Vue Update";
            },
            destroyVue: function(){
                this.$destroy();
            }
        }
    })
</script>
</html>
```

## beforeCreate
The process from the creation of the `Vue` instance to the execution of the `beforeCreate` hook mainly involves some initialization operations, such as initializing component events and lifecycle hooks. At this lifecycle hook execution time, the component is not yet mounted, and `data`,` methods`, etc. are not bound. It is mainly used to perform some operations unrelated to `Vue` data, such as displaying a `loading` indicator.

```javascript
console.log("beforeCreate");
console.log(this.$el); // undefined
console.log(this.$data); // undefined 
console.log(this.msg); // undefined
console.log("--------------------");
```

## created
From `beforeCreate` to `created`, the main tasks include configuring data binding, mounting computed properties and methods, and handling `watch/event` callbacks. At this lifecycle hook execution time, the component is not yet mounted to the `DOM`, the `$el` property is still `undefined`, but it is already possible to operate on `data` and `methods`, although the page is not yet rendered. This stage is usually used to initiate an `XHR` request.

```javascript
console.log("created");
console.log(this.$el); // undefined
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

## beforeMount
From `created` to `beforeMount`, the main task is to parse the page template, parsing data and directives in memory, and when the page is parsed, the page template exists in memory. At this lifecycle hook execution time, `$el` is created, but the page only exists in memory and has not been rendered to the `DOM`.

```javascript
console.log("beforeMount");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); // {__ob__: Observer}
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

## mounted
From `beforeMount` to `mounted`, it executes the operation of rendering the page from memory to the `DOM`. At this lifecycle hook execution time, the page has been rendered, and the component has officially completed the last hook of the creation phase and is entering the running phase. In addition, regarding the priority of rendering the page template, it is `render` function `>` `template` property `>` external `HTML`.

```javascript
console.log("mounted");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

## beforeUpdate
When the data is updated, the `beforeUpdate` hook is called. At this time, the data in the `Vue` instance is already updated, but the data in the page is still old. This is an opportunity to further change the state, without triggering an additional re-rendering process. In the above example, adding a `debugger` breakpoint allows you to observe that the data in the `Vue` instance is already updated, but the data in the page is still old.

```javascript
// this.msg = "Vue Update";
console.log("beforeUpdate");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
debugger;
console.log("--------------------");
```

## updated
When the data is updated and the `DOM` rendering is complete, the `updated` hook is called. At this point, the component's `DOM` has been updated, and operations dependent on the `DOM` can be executed.

```javascript
// this.msg = "Vue Update";
console.log("updated");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```


## beforeDestroy
The `beforeDestroy` hook is called before the `Vue` instance is destroyed, and at this point the instance is still fully functional.

```javascript
// this.$destroy();
console.log("beforeDestroy");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

## destroyed
The `destroyed` hook is called after the `Vue` instance is destroyed. At this point, everything bound to the `Vue` instance will be unbound, all event listeners will be removed, all child instances will also be destroyed, components cannot be used, and `data` and `methods` cannot be used either. Even if the instance's properties are changed, the DOM of the page will not be re-rendered.

```javascript
// this.$destroy();
console.log("destroyed");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/672e967e201c
https://cn.vuejs.org/v2/guide/instance.html
https://segmentfault.com/a/1190000011381906
https://segmentfault.com/a/1190000018331135
https://www.cnblogs.com/qidh/p/11431998.html
https://www.cnblogs.com/wangjiachen666/p/9497749.html
```
