# The role of `key` in Vue

The special `key` attribute is mainly used in Vue's virtual DOM algorithm to identify `VNodes` when comparing new and old nodes. If `key` is not used, Vue will use an algorithm that minimizes dynamic elements as much as possible and tries to modify and reuse elements of the same type in place. When `key` is used, it will re-arrange the element order based on the change in `key` and remove elements with non-existent `key`. Additionally, child elements with the same parent must have unique `key`s, as repeated `key`s will lead to rendering errors.

## Description
First, according to the official documentation, when Vue is updating a list of elements rendered using `v-for`, it defaults to an in-place update strategy. If the order of data items is changed, Vue will not move DOM elements to match the order of the data items, but will update each element in place and ensure that they are rendered correctly at each index position. This default mode is efficient but only applicable to list rendering outputs that do not rely on the state of child components or temporary DOM states, such as form input values. To give Vue a hint so that it can track the identity of each node, in order to reuse and re-order existing elements, you need to provide a unique `key` attribute for each item when using `v-for`. It is recommended to provide a `key` attribute when using `v-for`, unless the DOM content output by the iteration is very simple, or deliberately relies on default behavior to improve performance.

In simple terms, when using `key` in a list loop, it is necessary to use `key` to uniquely identify each node, so that the `diff` algorithm can correctly identify this node, find the correct position to directly operate the node, and reuse the elements as much as possible. The main role of `key` is to efficiently update the virtual DOM. Furthermore, using `index` as the `key` is not recommended. It can only ensure that Vue forcibly updates components when data changes to avoid the side effects of in-place reuse, but it cannot ensure the maximum reuse of elements. Using `index` as the `key` has a similar effect to not using `key` in terms of data updates.

## Example

First, let's define a Vue instance, which renders four lists: a simple list and a complex list, each with and without `key`. We will compare the speed of their updates and rendering. The test will be conducted on `Chrome 81.0`. Each time the code is executed in the console, the page will be refreshed to avoid the influence of browser and Vue's own optimizations.

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

### Simple List

In the case of a simple list, not using `key` may render updates faster than when using `key`. This is also mentioned in the official documentation, unless the `DOM` content traversed for output is extremely simple, or deliberately relies on default behavior to achieve performance improvements. In the example below, you can see that without `key`, the rendering speed of the list is faster. In the absence of `key`, this list is directly reused in place, the positions of the original nodes remain unchanged. The elements are re-used in place, and the content is updated to '5', '6', '7', '8', '9', '10', '11', and '12'. Additionally, two nodes '11' and '12' are added. However, in the presence of `key`, the original nodes '1', '2', '3', and '4' are deleted, while '5' and '6' nodes are retained. Six nodes '7', '8', '9', '10', '11', and '12' are added. Since adding or deleting in the `DOM` is time-consuming, it is observed that the speed is faster without using `key`.

```javascript
// Without key
console.time();
vm.simpleListWithoutKey = [5, 6, 7, 8, 9, 10, 11, 12];
vm.$nextTick(() => console.timeEnd());
// default: 2.193056640625ms
```

```javascript
// With key
console.time();
vm.simpleListWithKey = [5, 6, 7, 8, 9, 10, 11, 12];
vm.$nextTick(() => console.timeEnd());
// default: 3.2138671875ms
```

In-place reuse may have some side effects. The documentation mentions that in-place reuse, the default mode, is efficient, but only applicable for list rendering output that does not depend on sub-component states or temporary `DOM` states, such as form input values. In the absence of setting `key`, the elements do not have parts bound to the data `data`, `Vue` will default to using the already rendered `DOM`, while data-bound parts will be rendered according to the data. If an element's position is manipulated, the parts not bound to `data` will remain in place, while the parts bound to `data` will move along with the operation. In the example below, first, the input boxes after two 'A's need to add data information, creating a temporary state. If the downward button is clicked at this point, the input boxes in the group without using `key` will not move downward, and 'B' will move to the top and become red, while the group using `key` will move the input box downward and 'A' will still be red and move along with it.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>In-Place Reuse</title>
</head>
<body>

  <div id="app">
    <h3>Adopting in-place reuse strategy (default in Vue.js)</h3>
    <div  v-for='(p, i) in persons'>
      <span>{{p.name}}<span>  
      <input type="text"/>  
      <button @click='down(i)' v-if='i != persons.length - 1'>Move Down</button>
    </div> 

    <h3>Not adopting in-place reuse strategy (setting key)</h3>
    <div  v-for='(p, i) in persons' :key='p.id'>
      <span>{{p.name}}<span> 
      <input type="text"/>  
      <button @click='down(i)' v-if='i != persons.length - 1'>Move Down</button>
    </div>

```html
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
        // This DOM operation set two A's to red color for demonstration of in-place reuse
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
<!-- Originally from https://www.zhihu.com/question/61078310 @霸都丶傲天 with modifications-->
```

### Complex List
Using `key` not only avoids the side effects of in-place reuse mentioned above, but also may improve rendering efficiency in some operations, particularly in reordering, inserting, and deleting nodes in the middle. In the example below, when there is no `key`, reordering will lead to in-place reuse of elements, and because `v-if` binds `data`, the operation will be performed together. This may consume more time in DOM operations. However, when using `key`, direct element reuse will occur and the element controlled by `v-if` will have been determined during the initial rendering and will not be updated in this example, so there will be no `DOM` operations involved with `v-if`, resulting in higher efficiency.

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


## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

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