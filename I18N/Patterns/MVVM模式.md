# MVVM Pattern
`MVVM`, short for `Model-View-ViewModel`, is an improvement based on the `MVC` and `MVP` architecture patterns. In `MVVM`, the status and behavior of the `View` in the `MVC` pattern are abstracted, separating the visual `UI` from the business logic, more clearly distinguishing the development of the user interface `UI` from the development of the business logic and behavior in the application. The `MVP` pattern does not belong to the category of the generally defined `23` design patterns, but is usually considered a broadly architectural design pattern.

## Description
`MVVM` simplifies the dependency between the interface and the business, helping to separate the development of the graphical user interface from the development of business logic or data models. In `MVVM`, the `ViewModel` acts as a binder to link the view layer `UI` with the data layer `Model`. When the `Model` is updated, the `ViewModel` updates the data to the `View` through the binder. When the `View` triggers a command, it passes the message to the `Model` through the `ViewModel`. The `ViewModel` acts like a black box, in the development process, only needing to focus on presenting the view layer of `UI` and the data layer of the abstract model `Model`, without needing to pay too much attention to how the `ViewModel` passes data and messages. The `MVVM` pattern behaves similarly to the `MVP` pattern, but its main difference is that it usually adopts two-way binding `data-binding`, automating the synchronization logic between the `View` and `Model`. Previously, the `Presenter` was responsible for manually synchronizing the `View` and `Model`, but now this is handled by the framework's data binding functionality, only needing to inform it which part of the `Model` corresponds to the data displayed by the `View`.

```
View <- ViewModel <-> Model
```

### Components

#### Model
* It results from abstracting things in an object-oriented manner and represents the real content state, being the domain model.
* The `Model` can also be referred to as the data layer, focusing solely on the data itself, without concern for any behavior.

#### View
* The `View` is the structure, layout, and appearance that the user sees on the screen, i.e., the visual `UI`.
* When the `Model` is updated, the `ViewModel` updates the `View` through data binding.

#### ViewModel
* The `ViewModel` abstracts the view by exposing public properties and commands.
* The binder in the `ViewModel` communicates between the view and the data binder.
* When the `Model` is updated, the `ViewModel` updates the data to the `View`, and when the `View` triggers a command, the `ViewModel` passes the message to the `Model`.

### Advantages
* Loose coupling: The `View` can change independently of the `Model`, a `ViewModel` can be bound to different `View`s, so when the `View` changes, the `Model` can remain unchanged, and when the `Model` changes, the `View` can also remain unchanged.
* Reusability: Some view logic can be placed in a `ViewModel`, allowing many `View`s to reuse this view logic.
* Independent development: Developers can focus on the development of business logic and data in the `Model`, while designers can focus on page design.
* Testability: The interface is usually difficult to test, but behavior can be tested through the `ViewModel`.

### Disadvantages
* For large projects, data binding may require more memory.
* Data binding makes `Bugs` difficult to debug. When the interface is abnormal, it may be due to a problem in the `View` code, or it may be due to a problem in the `Model` code. Data binding makes it possible for a `Bug` in one place to be quickly transmitted to another place, making it less easy to locate the original problematic area.

## Implementation
Below is a simple data binding example implemented according to `Vue`. However, it is worth noting that `Vue` does not fully adhere to the `MVVM` model, but rather takes inspiration from it. See `https://cn.vuejs.org/v2/guide/instance.html` for more information. To understand why Evan You says `Vue` does not fully comply with `MVVM`, you can refer to this `https://www.zhihu.com/question/327050991`.

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
        <button onclick="update()">Update</button>
    </div> 
</body>
<script type="text/javascript">

///////////////////////////////////////////////////////////////////////////////
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

```javascript
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

///////////////////////////////////////////////////////////////////////////////

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

function update(){
    vm.msg = "updated";
}

///////////////////////////////////////////////////////////////////////////////
</script>
</html>
```


## Daily Practice

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/140071889
https://juejin.cn/post/6844903480126078989
http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html
```