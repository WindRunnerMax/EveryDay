# MVVM模式的理解
`MVVM`全称`Model-View-ViewModel`是基于`MVC`和`MVP`体系结构模式的改进，`MVVM`就是`MVC`模式中的`View`的状态和行为抽象化，将视图`UI`和业务逻辑分开，更清楚地将用户界面`UI`的开发与应用程序中业务逻辑和行为的开发区分开来。

## 描述
`MVVM`模式简化了界面与业务的依赖，有助于将图形用户界面的开发与业务逻辑或数据模型的开发分离开来。在`MVVM`中的`ViewModel`作为绑定器将视图层`UI`与数据层`Model`链接起来，在`Model`更新时，`ViewModel`通过绑定器将数据更新到`View`，在`View`触发指令时，会通过`ViewModel`传递消息到`Model`，`ViewModel`像是一个黑盒，在开发过程中只需要关注于呈现`UI`的视图层以及抽象模型的数据层`Model`，而不需要过多关注`ViewModel`是如何传递的数据以及消息。

## 组成

### Model
* 以面向对象来对对事物进行抽象的结果，是代表真实状态内容的领域模型。
* 也可以将`Model`称为数据层，其作为数据中心仅关注数据本身，不关注任何行为。

### View
* `View`是用户在屏幕上看到的结构、布局和外观，即视图`UI`。
* 当`Model`进行更新的时候，`ViewModel`会通过数据绑定更新到`View`。

### ViewModel
* `ViewModel`是暴露公共属性和命令的视图的抽象。
* `ViewModel`中的绑定器在视图和数据绑定器之间进行通信。
* 在`Model`更新时，`ViewModel`通过绑定器将数据更新到`View`，在`View`触发指令时，会通过`ViewModel`传递消息到`Model`。

## 优点
* 低耦合: 视图`View`可以独立于`Model`变化和修改，一个`ViewModel`可以绑定到不同的`View`上，当`View`变化的时候`Model`可以不变，当`Model`变化的时候`View`也可以不变。
* 可重用性: 可以把一些视图逻辑放在一个`ViewModel`里面，让很多`View`重用这段视图逻辑。
* 独立开发: 开发人员可以专注于业务逻辑和数据的开发`Model`，设计人员可以专注于页面设计。
* 可测试: 界面素来是比较难于测试的，测试行为可以通过`ViewModel`来进行。

## 不足
* 对于过大的项目，数据绑定需要花费更多的内存。
* 数据绑定使得`Bug`较难被调试，当界面异常，可能是`View`的代码有问题，也可能是`Model `的代码有问题，数据绑定使得一个位置的`Bug`可能被快速传递到别的位置，要定位原始出问题的地方就变得不那么容易了。

## 实例
下面是参照`Vue`实现的简单的数据绑定实例，当然对于`Vue`来说，文档中也提到了`Vue`没有完全遵循`MVVM`模型，但是`Vue`的设计也受到了其启发，`https://cn.vuejs.org/v2/guide/instance.html`，关于为什么尤大说`Vue`没有完全遵循`MVVM`，可以参考这个`https://www.zhihu.com/question/327050991`。

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
        <button onclick="update()">update</button>
    </div> 
</body>
<script type="text/javascript">

///////////////////////////////////////////////////////////////////////////////
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


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/38296857
https://baike.baidu.com/item/MVVM/96310
https://www.liaoxuefeng.com/wiki/1022910821149312/1108898947791072
```
