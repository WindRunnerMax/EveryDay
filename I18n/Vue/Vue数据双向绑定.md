# Vue Data Two-Way Binding
`Vue` implements data two-way binding through data interception, in which the core method is to intercept properties through `Object.defineProperty()`, which allows precise addition or modification of object properties. The `getter` and `setter` in the property descriptor are used to achieve data interception.

## Description
When running a `Vue` instance and printing the `data`, you can see that the `msg` in the object has `get` and `set`. With them, you can achieve data interception and update the data. In `Vue`, `get` and `set` are defined through the `Object.defineProperty()` method from `ES5`. The specific functionality of this method can be found at `https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md`.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Data Binding</title>
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
            msg: 'Data'
        },
        created: function() {
            console.log(this.$data); //{__ob__: Observer} 
        }
    })
</script>
</html>
```

```javascript
/*
{__ob__: Observer}
    msg: "Data"
    __ob__: Observer {value: {…}, dep: Dep, vmCount: 1}
    get msg: ƒ reactiveGetter()
    set msg: ƒ reactiveSetter(newVal)
    __proto__: Object
*/
```

## Implementation Analysis
`Vue`s two-way data binding can be simply divided into three parts:
* `Observer`: The main job here is to recursively monitor all the properties on the object. When the property value changes, the corresponding `Watcher` is triggered.
* `Watcher`: Observes when the monitored data value is modified and executes the corresponding callback function to update the template content in `Vue`.
* `Dep`: Acts as a bridge between `Observer` and `Watcher`. Each `Observer` corresponds to a `Dep`, which internally maintains an array to store the `Watcher` related to that `Observer`.

Based on the above three parts, implementing a simple `Demo` functionality is straightforward, but the actual data update in `Vue` is asynchronous and involves a lot of optimization, making it very complex in reality.  
First, implement the `Dep` method, which serves as a bridge between `Observer` and `Watcher`. In simple terms, it is a listener mode event bus responsible for receiving `watchers` and saving them. The `subscribers` array is used to save the events to be triggered, the `addSub` method is used to add events, and the `notify` method is used to trigger events.

```javascript
function __dep(){
    this.subscribers = [];
    this.addSub = function(watcher){
        if(__dep.target && !this.subscribers.includes(__dep.target) ) this.subscribers.push(watcher);
    }
    this.notifyAll = function(){
        this.subscribers.forEach( watcher => watcher.update());
    }
}
```
The `Observer` method intercepts the data and redefines the properties using `Object.defineProperty`. Note that a property descriptor can only be a data descriptor or an accessor descriptor, but not both. Therefore, in this small `Demo`, `getter` and `setter` are used to operate on the defined local variable `value`. The main idea is to define the `value` local variable using the block scope of `let` and achieve `getter` and `setter` operations on `value` based on the principle of closure. Each data binding has its own `dep` instance, which uses this bus to store the `Watcher` related to this property and trigger it when updating the data in `set`.

```javascript
function __observe(obj){
    for(let item in obj){
        let dep = new __dep();
        let value = obj[item];
        if (Object.prototype.toString.call(value) === "[object Object]") __observe(value);
        Object.defineProperty(obj, item, {
            configurable: true,
            enumerable: true,
            get: function reactiveGetter() {
                if(__dep.target) dep.addSub(__dep.target);
                return value;
            },
            set: function reactiveSetter(newVal) {
                if (value === newVal) return value;
                value = newVal;
                dep.notifyAll();
            }
        });
    }
    return obj;
}
```
The `Watcher` method takes a callback function as a parameter to execute operations after data changes, generally used to render templates. The `update` method is the method executed after the data changes. `activeRun` is the operation executed when binding for the first time. Regarding `__dep.target` in this operation, its main purpose is to associate the data related to the callback function with `sub`. For example, if `msg` is used in the callback function, then when `activeRun` is executed, `__dep.target` will point to `this`, and then when `fn()` is executed, it will obtain `msg`, triggering the `get()` of `msg`, where `get` will check if `__dep.target` is empty. At this point, `__dep.target` is not empty. Each property mentioned earlier will have its own `dep` instance. `__dep.target` will then be added to the `subscribers` of its own instance. After execution, `__dep.target` will be set to `null`. This process is repeated to bind all related properties with the `watcher`. When a related property is `set`, it will trigger the `update` of various `watchers` and then execute rendering operations, and so on.
```javascript
function __watcher(fn){
    this.update = function(){
        fn();
    }
    
    this.activeRun = function(){
        __dep.target = this;
        fn();
        __dep.target = null;
    }
    this.activeRun();
}
```

## Code Example
This is a code example of the small `Demo` mentioned above. The `__proxy` function not mentioned earlier is mainly used to directly proxy the properties in `vm.$data` to the `vm` object. The first of the two `watchers` is used to print and view the data, and the second is a very simple template engine renderer. It demonstrates how data changes to trigger a page data re-rendering. In this `Demo`, open the console and type `vm.msg = 11;` to trigger a page data change. You can also add a line to `console.log(dep);` at line 40 to view the `watchers` bound to each property.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Data Binding</title>
</head>
<body>
    <div id="app">
        <div>{{msg}}</div>
        <div>{{date}}</div>
    </div> 
</body>
<script type="text/javascript">

    var Mvvm = function(config) {
        this.$el = config.el;
        this.__root = document.querySelector(this.$el);
        this.__originHTML = this.__root.innerHTML;
```

```javascript
function __dep(){
    this.subscribers = [];
    this.addSub = function(watcher){
        if(__dep.target && !this.subscribers.includes(__dep.target) ) this.subscribers.push(watcher);
    }
    this.notifyAll = function(){
        this.subscribers.forEach( watcher => watcher.update());
    }
}


function __observe(obj){
    for(let item in obj){
        let dep = new __dep();
        let value = obj[item];
        if (Object.prototype.toString.call(value) === "[object Object]") __observe(value);
        Object.defineProperty(obj, item, {
            configurable: true,
            enumerable: true,
            get: function reactiveGetter() {
                if(__dep.target) dep.addSub(__dep.target);
                return value;
            },
            set: function reactiveSetter(newVal) {
                if (value === newVal) return value;
                value = newVal;
                dep.notifyAll();
            }
        });
    }
    return obj;
}

this.$data = __observe(config.data);

function __proxy (target) {
    for(let item in target){
        Object.defineProperty(this, item, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter() {
                return this.$data[item];
            },
            set: function proxySetter(newVal) {
                this.$data[item] = newVal;
            }
        });
    }
}

__proxy.call(this, config.data);

function __watcher(fn){
    this.update = function(){
        fn();
    }
    
    this.activeRun = function(){
        __dep.target = this;
        fn();
        __dep.target = null;
    }
    this.activeRun();
}

new __watcher(() => {
    console.log(this.msg, this.date);
})
```

```
        new __watcher(() => {
            var html = String(this.__originHTML||'').replace(/"/g,'\\"').replace(/\s+|\r|\t|\n/g, ' ')
            .replace(/\{\{(.)*?\}\}/g, function(value){ 
                return  value.replace("{{",'"+(').replace("}}",')+"');
            })
            html = `var targetHTML = "${html}";return targetHTML;`;
            var parsedHTML = new Function(...Object.keys(this.$data), html)(...Object.values(this.$data));
            this.__root.innerHTML = parsedHTML;
        })

    }

    var vm = new Mvvm({
        el: "#app",
        data: {
            msg: "1",
            date: new Date(),
            obj: {
                a: 1,
                b: 11
            }
        }
    })

</script>
</html>
```


## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/255d4dec710a
https://www.jianshu.com/p/c8186e9e027b
https://www.cnblogs.com/wangjiachen666/p/9883916.html
https://blog.csdn.net/wangshu696/article/details/84570886
https://blog.csdn.net/qq_43051529/article/details/82877673
https://github.com/liutao/vue2.0-source/blob/master/%E5%8F%8C%E5%90%91%E6%95%B0%E6%8D%AE%E7%BB%91%E5%AE%9A.md
```