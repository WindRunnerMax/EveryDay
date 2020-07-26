# Vue中$refs的理解
`$refs`是一个对象，持有注册过`ref attribute`的所有`DOM`元素和组件实例。

## 描述
`ref`被用来给元素或子组件注册引用信息，引用信息将会注册在父组件的`$refs`对象上，如果在普通的`DOM`元素上使用，引用指向的就是`DOM`元素，如果用在子组件上，引用就指向组件实例，另外当`v-for`用于元素或组件的时候，引用信息将是包含`DOM`节点或组件实例的数组。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app">
        <div ref="node">Node</div>
        <layout-div ref="layout"></layout-div>
        <div v-for="i in 3" :key="i" ref="nodearr">{{i}}</div>
    </div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    Vue.component("layout-div", {
      data: function(){
          return {
            count: 0
          }
      },
      template: `<div>
                    <div>{{count}}</div>
                </div>`
    })

    var vm = new Vue({
        el: '#app',
        mounted: function(){
            console.log(this.$refs.node); // <div>Node</div> // DOM元素
            console.log(this.$refs.layout); // VueComponent {_uid: 1, ...} // 组件实例
            console.log(this.$refs.nodearr); // (3) [div, div, div] // DOM元素数组
        }
    })
</script>
</html>
```

因为`ref`本身是作为渲染结果被创建的，在初始渲染的时候是不能访问的，因为其还不存在，而且`$refs`也不是响应式的，因此不应该试图用它在模板中做数据绑定，在初始化访问`ref`时，应该在其生命周期的`mounted`方法中调用，在数据更新之后，应该在`$nextTick`方法中传递回调操作来获取元素或实例，此外一般不推荐直接操作`DOM`元素，尽量使用数据绑定让`MVVM`的`ViewModel`去操作`DOM`。


```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">

    var vm = new Vue({
        el: '#app',
        data: function(){
            return {
                msg: 0
            }
        },
        template:  `<div>
                       <div ref="node">{{msg}}</div>
                       <button @click="updateMsg">button</button>
                    </div>`,
        beforeMount: function(){
            console.log(this.$refs.node); // undefined
        },
        mounted: function(){
            console.log(this.$refs.node); // <div>0</div>
        },
        methods: {
            updateMsg: function(){
                this.msg = 1;
                console.log(this.$refs.node.innerHTML); // 0
                this.$nextTick(() => {
                    console.log(this.$refs.node.innerHTML); // 1
                })
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
https://cn.vuejs.org/v2/api/#ref
https://zhuanlan.zhihu.com/p/50638655
https://juejin.im/post/5da58c54e51d4524e207fb92
```
