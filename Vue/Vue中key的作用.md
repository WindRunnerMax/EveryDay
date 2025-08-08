# Vue中key的作用
`key`的特殊`attribute`主要用在`Vue`的虚拟`DOM`算法，在新旧`Nodes`对比时辨识`VNodes`。如果不使用`key`，`Vue`会使用一种最大限度减少动态元素并且尽可能的尝试就地修改、复用相同类型元素的算法，而使用`key`时，它会基于`key`的变化重新排列元素顺序，并且会移除`key`不存在的元素。此外有相同父元素的子元素必须有独特的`key`，重复的`key`会造成渲染错误。

## 概述
首先是官方文档的描述，当`Vue`正在更新使用`v-for`渲染的元素列表时，它默认使用就地更新的策略，如果数据项的顺序被改变，`Vue`将不会移动`DOM`元素来匹配数据项的顺序，而是就地更新每个元素，并且确保它们在每个索引位置正确渲染。这个默认的模式是高效的，但是只适用于不依赖子组件状态或临时`DOM`状态的列表渲染输出，例如表单输入值。为了给`Vue`一个提示，以便它能跟踪每个节点的身份，从而重用和重新排序现有元素，你需要为每项提供一个唯一 `key attribute`，建议尽可能在使用`v-for`时提供`key attribute`，除非遍历输出的`DOM`内容非常简单，或者是刻意依赖默认行为以获取性能上的提升。  
简单来说，当在列表循环中使用`key`时，需要使用`key`来给每个节点做一个唯一标识，`diff`算法就可以正确的识别此节点，找到正确的位置直接操作节点，尽可能地进行重用元素，`key`的作用主要是为了高效的更新虚拟`DOM`。此外，使用`index`作为`key`是并不推荐的做法，其只能保证`Vue`在数据变化时强制更新组件，以避免原地复用带来的副作用，但不能保证最大限度的元素重用，且使用`index`作为`key`在数据更新方面和不使用`key`的效果基本相同。

## 示例

首先定义一个`Vue`实例，渲染四个列表，分别为简单列表与复杂列表，以及其分别携带`key`与不携带`key`时对比其更新渲染时的速度，本次测试使用的是`Chrome 81.0`，每次在`Console`执行代码时首先会进行刷新重新加载界面，避免浏览器以及`Vue`自身优化带来的影响。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app">
        <ul>
            <li v-for="item in simpleListWithoutKey" >{{item}}</li>
        </ul>

        <ul>
            <li v-for="item in simpleListWithKey" :key="item" >{{item}}</li>
        </ul>

        <ul>
            <li v-for="item in complexListWithoutKey">
                <span v-for="value in item.list" v-if="value > 5">{{value}}</span>
            </li>
        </ul>

        <ul>
            <li v-for="item in complexListWithKey" :key="item.id">
                <span v-for="value in item.list" :key="value" v-if="value > 5">{{value}}</span>
            </li>
        </ul>

    </div>
</body>
<script src="https://cdn.staticfile.org/vue/2.2.2/vue.min.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            simpleListWithoutKey: [1, 2, 3, 4, 5, 6],
            simpleListWithKey: [1, 2, 3, 4, 5, 6],
            complexListWithoutKey:[
                {id: 1, list: [1, 2, 3]},
                {id: 2, list: [4, 5, 6]},
                {id: 3, list: [7, 8, 9]}
            ],
            complexListWithKey:[
                {id: 1, list: [1, 2, 3]},
                {id: 2, list: [4, 5, 6]},
                {id: 3, list: [7, 8, 9]}
            ],
        }
    })
</script>
</html>
```

### 简单列表
在简单列表的情况下，不使用`key`可能会比使用`key`的情况下在更新时的渲染速度更快，这也就是官方文档中提到的，除非遍历输出的`DOM`内容非常简单，或者是刻意依赖默认行为以获取性能上的提升。在下面的例子中可以看到没有`key`的情况下列表更新时渲染速度会快，当不存在`key`的情况下，这个列表直接进行原地复用，原有的节点的位置不变，原地复用元素，将内容更新为`5`、`6`、`7`、`8`、`9`、`10`，并添加了`11`与`12`两个节点，而存在`key`的情况下，原有的`1`、`2`、`3`、`4`节点被删除，`5`、`6`节点保留，添加了`7`、`8`、`9`、`10`、`11`、`12`六个节点，由于在`DOM`的增删操作上比较耗时，所以表现为不带`key`的情况下速度更快一些。


```javascript
// 没有key的情况下
console.time();
vm.simpleListWithoutKey = [5, 6, 7, 8, 9, 10, 11, 12];
vm.$nextTick(() => console.timeEnd());
// default: 2.193056640625ms
```

```javascript
// 存在key的情况下
console.time();
vm.simpleListWithKey = [5, 6, 7, 8, 9, 10, 11, 12];
vm.$nextTick(() => console.timeEnd());
// default: 3.2138671875ms
```

原地复用可能会带来一些副作用，文档中提到原地复用这个默认的模式是高效的，但是只适用于不依赖子组件状态或临时`DOM`状态的列表渲染输出，例如表单输入值。在不设置`key`的情况下，元素中没有与数据`data`绑定的部分，`Vue`会默认使用已经渲染的`DOM`，而绑定了数据`data`的部分会进行跟随数据渲染，假如操作了元素位置，则元素中未绑定`data`的部分会停留在原地，而绑定了`data`的部分会跟随操作进行移动，在下面的例子中首先需要将两个`A`之后的输入框添加数据信息，这样就制作了一个临时状态，如果此时点击下移按钮，那么不使用`key`的组中的输入框将不会跟随下移，且`B`到了顶端并成为了红色，而使用`key`的组中会将输入框进行下移，且`A`依旧是红色跟随下移。


```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>就地复用</title>
</head>
<body>

  <div id="app">
    <h3>采用就地复用策略(vuejs默认情况)</h3>
    <div  v-for='(p, i) in persons'>
      <span>{{p.name}}<span>  
      <input type="text"/>  
      <button @click='down(i)' v-if='i != persons.length - 1'>下移</button>
    </div> 

    <h3>不采用就地复用策略(设置key)</h3>
    <div  v-for='(p, i) in persons' :key='p.id'>
      <span>{{p.name}}<span> 
      <input type="text"/>  
      <button @click='down(i)' v-if='i != persons.length - 1'>下移</button>
    </div>

  </div>
<script src="https://cdn.staticfile.org/vue/2.2.2/vue.min.js"></script>
  <script>
    new Vue({
      el: '#app',
      data: {
        persons: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' }
        ]
      },
      mounted: function(){
        // 此DOM操作将两个A的颜色设置为红色 主要是为了演示原地复用
        document.querySelectorAll("h3 + div > span:first-child").forEach( v => v.style.color="red");
      },
      methods: {
        down: function(i) {
            if (i == this.persons.length - 1) return;
          var listClone = this.persons.slice();
          var one = listClone[i];
          listClone[i] = listClone[i + 1];
          listClone[i + 1] = one;
          this.persons = listClone;
        }
      }
    });
  </script>
</body>
</html>
<!-- 源于 https://www.zhihu.com/question/61078310 @霸都丶傲天 有修改-->
```

### 复杂列表
使用`key`不仅能够避免上述的原地复用的副作用，且在一些操作上可能能够提高渲染的效率，主要体现在重新排序的情况，包括在中间插入和删除节点的操作，在下面的例子中没有`key`的情况下重新排序会原地复用元素，但是由于`v-if`绑定了`data`所以会一并进行操作，在这个`DOM`操作上比较消耗时间，而使用`key`得情况则直接复用元素，`v-if`控制的元素在初次渲染就已经决定，在本例中没有对其进行更新，所以不涉及`v-if`的`DOM`操作，所以在效率上会高一些。

```javascript
console.time();
vm.complexListWithoutKey = [
        {id: 3, list: [7, 8, 9]},
        {id: 2, list: [4, 5, 6]},
        {id: 1, list: [1, 2, 3]},
    ];
vm.$nextTick(() => console.timeEnd());
vm.$nextTick(() => console.timeEnd());
// default: 4.100244140625ms
```

```javascript
console.time();
vm.complexListWithKey = [
        {id: 3, list: [7, 8, 9]},
        {id: 2, list: [4, 5, 6]},
        {id: 1, list: [1, 2, 3]},
    ];
vm.$nextTick(() => console.timeEnd());
// default: 3.016064453125ms
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/api/#key
https://www.jianshu.com/p/4bdd2690859c
https://www.zhihu.com/question/61078310
https://segmentfault.com/a/1190000012861862
https://www.cnblogs.com/zhumingzhenhao/p/7688336.html
https://blog.csdn.net/hl18730262380/article/details/89306500
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/1
https://cn.vuejs.org/v2/guide/list.html#%E7%BB%B4%E6%8A%A4%E7%8A%B6%E6%80%81
```
