# MVC模式
`MVC`即模型`Model`、视图`View`、控制器`Controller`，用一种将业务逻辑、数据、视图分离的方式组织架构代码，通过分离关注点的方式来支持改进应用组织方式，其促成了业务数据`Model`从用户界面`View`中分离出来，还有第三个组成部分`Controller`负责管理传统意义上的业务逻辑和用户输入，通常将`MVC`模式看作架构型设计模式。

## 描述
在前端组件式架构开发，常常将视图、数据、业务逻辑等写在一个模块内，如果组件的内容比较多，容易造成层次的混乱，增加开发与维护的成本，而使用`MVC`模式可以将数据层、视图层、控制器层进行分层组织，用以减少耦合。

```
View -> Controller -> Model -> View
```

## 实现
在这里我们主要是示例`MVC`的分层结构，实际上`MVC`主要分为三部分，如果要实现这部分信息传递就需要进行一些指令与事件的解析等。 
* `View`传送指令到`Controller`。
* `Controller`完成业务逻辑后，要求`Model`改变状态。
* `Model`将新的数据发送到`View`，用户得到反馈。

```html
<!DOCTYPE html>
<html>
<head>
    <title>MVC</title>
</head>
<body>
    <div id="app"></div>
</body>
<script type="text/javascript">
    const MVC = function(){
        this.data = {};
        this.template = "";
    };
    MVC.prototype.model = function(data){
        /* 一些预处理 */
        this.data = data;
    }
    MVC.prototype.view = function(template){
        /* 一些预处理 */
        this.template = template;
    }
    MVC.prototype.controller = function(el){
        /* 一些处理 */
        /* 重点是controller部分 指令的解析、逻辑等都需要在这里实现 */
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

    const mvc = new MVC();
    mvc.model({
        name: "测试",
        phone: "13333333333"
    })
    mvc.view(`
        <div>
            <span>姓名</span>
            <span>{{name}}</span>
        </div>
        <div>
            <span>手机号</span>
            <span>{{phone}}</span>
        </div>
    `);
    const control = mvc.controller("#app");
    control.render();

</script>
</html>
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/648c5d9dacaa
https://segmentfault.com/a/1190000009127861
https://www.kancloud.cn/kancloud/learn-js-design-patterns/56457
```