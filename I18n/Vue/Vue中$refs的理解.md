# Understanding `$refs` in Vue
`$refs` is an object that holds all the `DOM` elements and component instances that have been registered with the `ref attribute`.

## Description
`ref` is used to register reference information for elements or child components. The reference information will be registered on the `$refs` object of the parent component. If used on a regular `DOM` element, the reference points to the `DOM` element. If used on a child component, the reference points to the component instance. Additionally, when `v-for` is used on an element or component, the reference information will be an array containing `DOM` nodes or component instances.

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
            console.log(this.$refs.node); // <div>Node</div> // DOM element
            console.log(this.$refs.layout); // VueComponent {_uid: 1, ...} // component instance
            console.log(this.$refs.nodearr); // (3) [div, div, div] // array of DOM elements
        }
    })
</script>
</html>
```

Because `ref` itself is created as a rendering result and cannot be accessed during initial rendering, and `$refs` is not reactive, you should not attempt to use it for data binding in the template. When accessing `ref` during initialization, it should be called in the `mounted` method of its lifecycle. After data update, the `$nextTick` method should be used to pass the callback operation to obtain elements or instances. Additionally, direct manipulation of `DOM` elements is not recommended, it is preferable to use data binding to let the `ViewModel` of the `MVVM` handle `DOM` operations.

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
```

```javascript
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://cn.vuejs.org/v2/api/#ref
https://zhuanlan.zhihu.com/p/50638655
https://juejin.im/post/5da58c54e51d4524e207fb92
```