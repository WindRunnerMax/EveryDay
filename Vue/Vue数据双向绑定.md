# Vue数据双向绑定
`Vue`是通过数据劫持的方式来实现数据双向数据绑定的，其中最核心的方法便是通过`Object.defineProperty()`来实现对属性的劫持，该方法允许精确地添加或修改对象的属性，对数据添加属性描述符中的`getter`与`setter`实现劫持。

## 概述
运行一个`Vue`实例并将`data`打印，可以看到对象中对于`msg`有了`get`与`set`，通过他们就可以实现数据的劫持，从而进行数据的更新，在`Vue`中`get`与`set`是通过`ES5`的`Object.defineProperty()`方法定义的，该方法的具体功能可以查阅`https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md`。

```html
<!DOCTYPE html>
<html>
<head>
    <title>数据绑定</title>
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

## 分析实现
`Vue`的双向数据绑定，简单点来说分为以下三个部分：
* `Observer`: 这里的主要工作是递归地监听对象上的所有属性，在属性值改变的时候，触发相应的`Watcher`。
* `Watcher`: 观察者，当监听的数据值修改时，执行响应的回调函数，在`Vue`里面的更新模板内容。
* `Dep`: 链接`Observer`和`Watcher`的桥梁，每一个`Observer`对应一个`Dep`，它内部维护一个数组，保存与该`Observer`相关的`Watcher`。

根据上面的三部分实现一个功能非常简单的`Demo`，实际`Vue`中的数据在页面的更新是异步的，且存在大量优化，实际非常复杂。  
首先实现`Dep`方法，这是链接`Observer`和`Watcher`的桥梁，简单来说，就是一个监听者模式的事件总线，负责接收`watcher`并保存。其中`subscribers`数组用以保存将要触发的事件，`addSub`方法用以添加事件，`notify`方法用以触发事件。

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
`Observer`方法就是将数据进行劫持，使用`Object.defineProperty`对属性进行重定义，注意一个属性描述符只能是数据描述符和存取描述符这两者其中之一，不能同时是两者，所以在这个小`Demo`中使用`getter`与`setter`操作的的是定义的`value`局部变量，主要是利用了`let`的块级作用域定义`value`局部变量并利用闭包的原理实现了`getter`与`setter`操作`value`，对于每个数据绑定时都有一个自己的`dep`实例，利用这个总线来保存关于这个属性的`Watcher`，并在`set`更新数据的时候触发。

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
`Watcher`方法传入一个回调函数，用以执行数据变更后的操作，一般是用来进行模板的渲染，`update`方法就是在数据变更后执行的方法，`activeRun`是首次进行绑定时执行的操作，关于这个操作中的`__dep.target`，他的主要目的是将执行回调函数相关的数据进行`sub`，例如在回调函数中用到了`msg`，那么在执行这个`activeRun`的时候`__dep.target`就会指向`this`，然后执行`fn()`的时候会取得`msg`，此时就会触发`msg`的`get()`，而`get`中会判断这个`__dep.target`是不是空，此时这个`__dep.target`不为空，上文提到了每个属性都会有一个自己的`dep`实例，此时这个`__dep.target`便加入自身实例的`subscribers`，在执行完之后，便将`__dep.target`设置为`null`，重复这个过程将所有的相关属性与`watcher`进行了绑定，在相关属性进行`set`时，就会触发各个`watcher`的`update`然后执行渲染等操作。
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

## 代码示例
这是上述的小`Demo`的代码示例，其中上文没有提到的`__proxy`函数主要是为了将`vm.$data`中的属性直接代理到`vm`对象上，两个`watcher`中第一个是为了打印并查看数据，第二个是之前做的一个非常简单的模板引擎的渲染，为了演示数据变更使得页面数据重新渲染，在这个`Demo`下打开控制台，输入`vm.msg = 11;`即可触发页面的数据更改，也可以通过在`40`行添加一行`console.log(dep);`来查看每个属性的`dep`绑定的`watcher`。

```html
<!DOCTYPE html>
<html>
<head>
    <title>数据绑定</title>
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


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/255d4dec710a
https://www.jianshu.com/p/c8186e9e027b
https://www.cnblogs.com/wangjiachen666/p/9883916.html
https://blog.csdn.net/wangshu696/article/details/84570886
https://blog.csdn.net/qq_43051529/article/details/82877673
https://github.com/liutao/vue2.0-source/blob/master/%E5%8F%8C%E5%90%91%E6%95%B0%E6%8D%AE%E7%BB%91%E5%AE%9A.md
```
