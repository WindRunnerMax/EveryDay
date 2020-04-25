# JS中this的指向

`this`的指向在函数定义的时候是确定不了的，只有函数执行的时候才能确定`this`到底指向谁，实际上`this`的最终指向的是那个调用它的对象。

## 实例
定义函数与对象并调用，注意只有调用函数才会使`this`指向调用者，但箭头函数除外。
```javascript
function s(){
    console.log(this);
}

// window中直接调用 // 非 use strict
s(); // Window // 等同于window.s()，调用者为window
// window是Window的一个实例 // window instanceof Window //true

// 新建对象s1
var s1 = {
    t1: function(){ // 测试this指向调用者
        console.log(this); // s1
        s(); // Window // 此次调用仍然相当 window.s()，调用者为window
    },
    t2: () => { // 测试箭头函数，this并未指向调用者
        console.log(this);
    },
    t3: { // 测试对象中的对象
      tt1: function() {
           console.log(this);
      }  
    },
    t4: { // 测试箭头函数以及非函数调用this并未指向调用者
      tt1: () => {
           console.log(this);
      }  
    },
    t5: function(){ // 测试函数调用时箭头函数的this的指向，其指向了上一层对象的调用者
        return {
            tt1: () => {
                console.log(this);
            }
        }
    }
}
s1.t1(); // s1对象 // 此处的调用者为 s1 所以打印对象为 s1
s1.t2(); // Window
s1.t3.tt1(); // s1.t3对象
s1.t4.tt1(); // Window
s1.t5().tt1(); // s1对象
```
比较特殊的例子，我们调用同一个方法，但是得到的`this`是不同的，要注意实际上`this`的最终指向的是那个调用它的对象

```javascript
var s1 = {
    t1: function(){
        console.log(this);
    }
}
s1.t1(); // s1对象
var p = s1.t1;
p(); // Window

// 注意此时将方法赋值给了p，此时直接调用p得到的this是Window
// 其实这个例子也并不是很特殊，因为函数也是一个对象，此时p是被赋值了一个函数
console.log(p); // ƒ (){console.log(this);}
// 而此函数是被window调用的，由此，this指向了window
```

## 改变this指向

```
使用 apply、call、bind可以改变this的指向，可以参考
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/apply%E3%80%81call%E3%80%81bind.md
```

## 参考
```
http://www.ruanyifeng.com/blog/2018/06/javascript-this.html
```