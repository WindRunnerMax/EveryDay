# JavaScript 常见面试题目总结

## 间隔时间打印

`0-9`每间隔`1s`打印一个数字。

### async/await

```javascript
(async () => {
  for (let i = 0; i < 10; ++i) {
    await new Promise((resolve) => {
      console.log(i);
      setTimeout(resolve, 1000);
    });
  }
})();
```

### 模拟递归调用

```javascript
const print = (start, end) => {
  if (start >= end) return void 0;
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  }).then(() => {
    console.log(start);
    print(start + 1, end);
  });
};

print(0, 10);
```

### 构造链式调用

```javascript
let promiseChain = Promise.resolve();

(() => {
  for (let i = 0; i < 10; ++i) {
    promiseChain = promiseChain.then(() => {
      console.log(i);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    });
  }
})();
```

### 不使用 let

```javascript
let promiseChain = Promise.resolve();

(() => {
  for (var i = 0; i < 10; ++i) {
    ((i) => {
      promiseChain = promiseChain.then(() => {
        console.log(i);
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });
    })(i);
  }
})();
```

## Promise

### 实现 Promise.all

```javascript
const promiseFactory = (delay) =>
  new Promise((r) => setTimeout(() => r(delay), delay));

const promiseAll = (promises) => {
  return new Promise((resolve, reject) => {
    const promiseStatus = new Array(promises.length).fill(false);
    const result = new Array(promises.length).fill(null);
    promises.forEach((item, index) => {
      item
        .then((res) => {
          result[index] = res;
          promiseStatus[index] = true;
          if (promiseStatus.every((it) => it)) resolve(result);
        })
        .catch((err) => {
          result[index] = err;
          reject(result);
        });
    });
  });
};

promiseAll([
  promiseFactory(1000),
  promiseFactory(2000),
  promiseFactory(3000),
]).then(console.log); // 三秒后输出 [1000, 2000, 3000]
```

## 排序

### 常见排序与复杂度

[常见排序与复杂度](./Js实现数组排序.md)

### 字典序排序

```javascript
const arr = [123, 356, 2, 6, 999, 311];
arr.sort();
console.log(arr); // [123, 2, 311, 356, 6, 999]
```

## 最大的第 K 个数

```javascript
const adjust = (index, arr) => {
  let changeIndex = -1;
  const n = arr.length;
  if (index < n && arr[index] < arr[index * 2 + 1]) {
    changeIndex = index * 2 + 1;
    [arr[index], arr[index * 2 + 1]] = [arr[index * 2 + 1], arr[index]];
  }
  if (index < n && arr[index] < arr[index * 2 + 2]) {
    changeIndex = index * 2 + 2;
    [arr[index], arr[index * 2 + 2]] = [arr[index * 2 + 2], arr[index]];
  }
  if (changeIndex !== -1) adjust(changeIndex, arr);
};

const find = (arr, k) => {
  for (let n = arr.length, i = n - 1; i >= 0; --i) adjust(i, arr);
  for (let i = 0; i < k - 1; ++i) {
    arr.shift();
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    adjust(0, arr);
  }
  console.log(arr.shift());
};

const k = 3;
const arr = [4, 3, 5, 1, 6, 2, 7, 8];
find(arr, k);
```

## 防抖和节流

```javascript
// 防抖
const d = function (time, funct, ...args) {
  let timer = null;
  return () => {
    clearTimeout(timer);
    timer = null;
    timer = setTimeout(() => funct(...args), time);
  };
};
window.onscroll = d(1000, (a) => console.log(a), 1);
```

```javascript
// 节流
const t = function (time, funct, ...args) {
  let timer = null;
  return () => {
    if (!timer) {
      funct(...args);
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
      }, time);
    }
  };
};
window.onscroll = t(1000, (a) => console.log(a), 1);
```

## 继承

```javascript
// 寄生组合继承
function Parent(from) {
  this.name = "parent";
  this.say = function () {
    console.log(this.name);
  };
  this.from = from;
}
function Child(from) {
  Parent.call(this, from);
  this.name = "child";
}
let f = function () {};
f.prototype = Parent.prototype;
Child.prototype = new f();
Child.prototype.construce = Child;

let child = new Child("child");
child.say(); // child
console.log(child.from); // child
```

## 十进制转二进制

### 计算

```javascript
(function (num) {
  num = num >> 0;
  const target = [];
  while (num) {
    target.unshift(num % 2);
    num = (num / 2) >> 0;
  }
  console.log(target.join(""));
})(10);
```

### API

```javascript
console.log(Number(10).toString(2));
```

## 带并发限制的异步调度器

`Js`实现一个带并发限制的异步调度器`Scheduler`，保证同时运行的任务最多有两个。

```javascript
// Start
class Scheduler {
  constructor() {
    this.max = 2;
    this.task = [];
    this.pending = [];
  }
  add(fn) {
    const dispatch = () => {
      for (let i = 0; i < this.max; ++i) {
        if (!this.task[i] && this.pending.length) {
          const runFn = this.pending.shift();
          this.task[i] = true;
          runFn().then(() => {
            this.task[i] = false;
            runFn.resolve();
            dispatch();
          });
        }
      }
    };
    const pr = new Promise((resolve) => {
      fn.resolve = resolve;
      this.pending.push(fn);
    });
    dispatch();
    return pr;
  }
}
// End

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const scheduler = new Scheduler();
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order));
};

addTask(2000, "1");
addTask(1000, "2");
addTask(3000, "3");
addTask(2000, "4");

// 2  第一秒
// 1  第二秒
// 3  第四秒
// 4  第四秒
```

```javascript
// Start
class Scheduler {
  constructor() {
    this.max = 2;
    this.task = [];
    this.pending = [];
  }
  add(fn) {
    return new Promise((resolve) => {
      fn.resolve = resolve;
      if (this.task.length < this.max) {
        this.dispatch(fn);
      } else {
        this.pending.push(fn);
      }
    });
  }
  dispatch(pr) {
    this.task.push(pr);
    pr().then(() => {
      pr.resolve();
      this.task.splice(this.task.indexOf(pr), 1);
      if (this.pending.length) {
        this.dispatch(this.pending.shift());
      }
    });
  }
}
// End

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const scheduler = new Scheduler();
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order));
};

addTask(2000, "1");
addTask(1000, "2");
addTask(3000, "3");
addTask(2000, "4");

// 2  第一秒
// 1  第二秒
// 3  第四秒
// 4  第四秒
```

## 拍平数组

### 迭代式

```javascript
const arr = [1, [2, 3], [[[4, 5, 6]], [7, 8, 9]]];

const flat = (arr) => {
  let i = 0;
  const newArray = [...arr];
  while (i < newArray.length) {
    if (Array.isArray(newArray[i])) {
      const tmp = newArray[i];
      newArray.splice(i, 1, ...tmp);
    } else {
      ++i;
    }
  }
  return newArray;
};

console.log(flat(arr));
```

### 递归式

```javascript
const arr = [1, [2, 3], [[[4, 5, 6]], [7, 8, 9]]];

const flat = (arr) => {
  const newArray = [];
  arr.forEach((item) => {
    if (Array.isArray(item)) newArray.push(...flat(item));
    else newArray.push(item);
  });
  return newArray;
};

console.log(flat(arr));
```

## 手写 apply、call、bind

```javascript
Function.prototype._apply = function (base, args) {
  base.fn = this;
  const result = base.fn(...args);
  delete base.fn;
  return result;
};

Function.prototype._call = function (base, ...args) {
  return this._apply(base, args);
};

Function.prototype._bind = function (base, ...args) {
  const functionArgsLength = this.length;
  const curArgsLength = args.length;
  if (curArgsLength >= functionArgsLength) {
    return this._apply(base, args);
  } else {
    return (...newArgs) => {
      return this._bind(base, ...args, ...newArgs);
    };
  }
};

function fn(num1, num2) {
  console.log(this.num, num1, num2);
}

const obj = { num: 1 };

fn._apply(obj, [2, 3]);
fn._call(obj, 4, 5);
fn._bind(obj)(6)(7);
```

## new 操作符

```javascript
function Student(name) {
  this.name = name;
}

Student.prototype.say = function () {
  console.log("I'm", this.name);
};

const _new = (fn, ...args) => {
  const obj = Object.create(fn.prototype);
  const res = fn.apply(obj, args);

  if ((typeof res === "object" && res !== null) || typeof res === "function") {
    return res;
  }

  return obj;
};

const student = _new(Student, "A");
console.log(student);
student.say();
```

## 数组去重

### Set

```javascript
const arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
const newArr = Array.from(new Set(arr)); // [...(new Set(arr))]
console.log(newArr); // [1, 2, 3, 5]
```

### indexOf

```javascript
// 使用find、findIndex、includes思路相同
const arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
const newArr = [];
arr.forEach((v) => {
  if (newArr.indexOf(v) === -1) newArr.push(v);
});
console.log(newArr); // [1, 2, 3, 5]
```

### 利用对象

```javascript
const arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
const obj = {};
arr.forEach((v) => {
  if (!obj[v]) obj[v] = 1;
});
console.log(Object.keys(obj).map((item) => Number(item))); // [1, 2, 3, 5]
```

## 串行执行 Promise

### reduce

```javascript
const arr = [
  () => Promise.resolve(1),
  (res) => Promise.resolve(res * 2),
  (res) => Promise.resolve(res * 2),
  (res) => Promise.resolve(res * 3),
  (res) => new Promise((r) => setTimeout(() => r(res), 1000)),
];

arr
  .reduce((pre, cur) => {
    return pre.then((res) => cur(res));
  }, Promise.resolve())
  .then((res) => {
    console.log(res);
  });
```

### async/await

```javascript
const arr = [
  () => Promise.resolve(1),
  (res) => Promise.resolve(res * 2),
  (res) => Promise.resolve(res * 2),
  (res) => Promise.resolve(res * 3),
  (res) => new Promise((r) => setTimeout(() => r(res), 1000)),
];

(async () => {
  let preResult = null;
  for (let i = 0; i < arr.length; i++) {
    const fn = arr[i];
    preResult = await fn(preResult);
    console.log(preResult);
  }
})();
```

## 远程相加

假如现在本地无法实现加法功能，现有其他团队提供的远程`Api`可以实现两个数相加的功能，现需要改进`Api`使其能够实现多个数相加。

```javascript
const addRemote = (a, b) => {
  return new Promise((r) => setTimeout(r, 1000, a + b));
};

const add = (...args) => {
  const cur = [].concat(args);
  return new Promise((r) => {
    if (cur.length % 2 === 1) cur.push(0);
    const batchAdd = [];
    for (let i = 0; i < cur.length; i += 2) {
      batchAdd.push(addRemote(cur[i], cur[i + 1]));
    }
    Promise.all(batchAdd).then((res) => {
      if (res.length === 1) {
        r(res.pop());
      } else {
        add(...res).then(r);
      }
    });
  });
};

add(1, 2, 4, 5, 6).then((res) => console.log(res));
```
