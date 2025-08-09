# MVP模式
`MVC`即模型`Model`、视图`View`、管理器`Presenter`，`MVP`模式从`MVC`模式演变而来，通过管理器将视图与模型巧妙地分开，即将`Controller`改名为`Presenter`，同时改变了通信方向，`MVP`模式模式不属于一般定义的`23`种设计模式的范畴，而通常将其看作广义上的架构型设计模式。

## 概述
在`MVC`里`View`是可以直接访问`Model`中数据的，但`MVP`中的`View`并不能直接使用`Model`，而是通过为`Presenter`提供接口，让`Presenter`去更新`Model`，再通过观察者模式等方式更新`View`，与`MVC`相比，`MVP`模式通过解耦`View`和`Model`，完全分离视图和模型使职责划分更加清晰，由于`View`不依赖`Model`，可以将`View`抽离出来做成组件，其只需要提供一系列接口提供给上层操作。


```
View <-> Controller <-> Model
```

## 实现

在这里我们主要是示例`MVP`的分层结构，如果要实现`MVP`信息传递就需要进行一些指令与事件的解析等，`Presenter`作为`View`和`Model`之间的中间人，除了基本的业务逻辑外，还需要实现对从`View`到`Model`以及从`Model`到`View`的数据进行手动同步，例如我们在`View`中实现一个`++`计数器就需要在`Presenter`实现具体操作的`Model`进行`++`后再`Render`到视图中，此外由于没有数据绑定，如果`Presenter`对视图渲染的需求增多，其不得不过多关注特定的视图，一旦视图需求发生改变`Presenter`也需要改动。

```html
<!DOCTYPE html>
<html>
<head>
    <title>MVP</title>
</head>
<body>
    <div id="app"></div>
</body>
<script type="text/javascript">
    const MVP = function(){
        this.data = {};
        this.template = "";
    };
    MVP.prototype.model = function(data){
        /* 一些预处理 */
        this.data = data;
    }
    MVP.prototype.view = function(template){
        /* 一些预处理 */
        this.template = template;
    }
    MVP.prototype.presenter = function(el){
        /* 一些处理 */
        /* 重点是presenter部分 指令的解析、逻辑等都需要在这里实现 */
        const container = document.querySelector(el);
        const formatString = (str, data) => {
            return str.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] === void 0 ? "" : data[key]);
        }
        return {
            render: () => {
                const parsedStr = formatString(this.template, this.data);
                container.innerHTML = parsedStr;
            }
        }
    }

    const mvp = new MVP();
    mvp.model({
        name: "测试",
        phone: "13333333333"
    })
    mvp.view(`
        <div>
            <span>姓名</span>
            <span>{{name}}</span>
        </div>
        <div>
            <span>手机号</span>
            <span>{{phone}}</span>
        </div>
    `);
    const presenter = mvp.presenter("#app");
    presenter.render();

</script>
</html>
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/140071889
https://juejin.cn/post/6844903480126078989
http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html
```

