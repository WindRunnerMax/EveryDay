# Js常见手写题总结

## 间隔时间打印
`0-9`每间隔`1s`打印一个数字。

### async/await

```javascript
(async () => {
    for (let i = 0; i < 10; ++i) {
        await new Promise(resolve => {
            console.log(i);
            setTimeout(resolve, 1000);
        });
    }
})();
```

### 模拟递归调用

``` javascript
const print = (start, end) => {
    if(start >= end) return void 0;
    new Promise(resolve => {
        setTimeout(resolve, 1000);
    }).then(() => {
        console.log(start);
        print(start + 1, end);
    })
}

print(0, 10);
```

### 构造链式调用

```javascript
let promiseChain = Promise.resolve();

(() => {
    for (let i = 0; i < 10; ++i) {
        promiseChain = promiseChain.then(() => {
            console.log(i);
            return new Promise(resolve => setTimeout(resolve, 1000));
        });
    }
})();
```

### 不使用let

```javascript
let promiseChain = Promise.resolve();

(() => {
    for (var i = 0; i < 10; ++i) {
        (i => {
            promiseChain = promiseChain.then(() => {
                console.log(i);
                return new Promise(resolve => setTimeout(resolve, 1000));
            });
        })(i);
    }
})();
```

## Promise

```javascript
// 定义_Promise构造函数
function _Promise(fn) {
    this.status = "pending"; // 定义属性存储状态 // 赋予初始状态pending
    this.value = null; // resolve的value
    this.reason = null; // reject的reason
    this.onFulfilled = []; // 存储then方法中注册的第一个回调函数
    this.onReject = []; // 存储then方法中注册的第二个回调函数

    // 事件处理函数
    const handler = funct => {
        // 如果是函数的话才进行执行
        if (typeof funct === "function") {
            if (this.status === "fulfilled") funct(this.value); // 执行并传递value
            if (this.status === "rejected") funct(this.reason); // 执行并传递rejected
        }
    };

    // 实现resolve回调
    const resolve = value => {
        this.status = "fulfilled"; // 设置状态
        this.value = value; // 得到结果

        // 判断返回的值是否为Promise实例
        if (value instanceof _Promise) {
            value.onFulfilled = this.onFulfilled; // 是则以此链式调用
            return value;
        }

        // 使用setTimeout是为了将回调函数置于任务队列，不阻塞主线程，异步执行，
        // 实际promise的回调是置于微队列的，而setTimeout的回调是置于宏队列
        setTimeout(() => {
            try {
                this.onFulfilled.forEach(handler); // 交予事件处理
            } catch (e) {
                console.error(`Error in promise: ${e}`); // 打印异常
                reject(e); // reject
            }
        }, 0);
    };

    // 实现rejected
    const reject = reason => {
        this.status = "rejected"; // 设置状态
        this.reason = reason; // 得到结果

        // 置于任务队列
        setTimeout(() => {
            try {
                this.onReject.forEach(handler); // 交予事件处理
            } catch (e) {
                console.error(`Error in promise: ${e}`); // 打印异常
            }
        }, 0);
    };

    fn(resolve, reject); // 执行
}

// 定义then
// value接收上层结果 --- function处理自身逻辑 --- return传递到下层
_Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : v => v; // 转为函数
    onRejected = typeof onRejected === "function" ? onRejected : r => r; // 转为函数
    // 返回一个新的_Promise
    return new _Promise((resolve, reject) => {
        // 将回调函数置于onFulfilled
        this.onFulfilled.push(value => {
            resolve(onFulfilled(value)); // 执行并传递
        });
        // 将回调函数置于onReject
        this.onReject.push(value => {
            reject(onRejected(value)); // 执行并传递
        });
    });
};
```

```javascript
// 测试
const promise = new _Promise(function (resolve, reject) {
    const rand = Math.random() * 2;
    setTimeout(function () {
        if (rand < 1) resolve(rand);
        else reject(rand);
    }, 1000);
});
promise
    .then(
        rand => {
            console.log("resolve", rand); // resolve回调执行
        },
        rand => {
            console.log("reject", rand); // reject回调执行
        }
    )
    .then(function () {
        // resolve后继续执行
        return new _Promise(function (resolve, reject) {
            const rand = Math.random() * 2;
            setTimeout(function () {
                resolve(rand);
            }, 1000);
        });
    })
    .then(function (num) {
        // resolve后继续执行
        console.log(num, "继续执行并接收参数");
        return 1;
    })
    .then(function (num) {
        console.log(num, "继续执行并接收参数");
    });

/*
 实现的_Promise比较简单
 实际使用的Promise比较复杂，有各种情况的考虑
 例子中仅实现了Promise构造函数与then，实际中还有catch、Promise.all、Promise.race、Promise.resolve、Promise.reject等实现
*/
```

## 排序

### 原型链方法调用

```javascript
const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
arr.sort((a, b) => a - b); // arr.__proto__.sort
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 简单选择排序

```javascript
const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
const n = arr.length;
for (let i = 0; i < n; ++i) {
    let minIndex = i;
    for (let k = i + 1; k < n; ++k) {
        if (arr[k] < arr[minIndex]) minIndex = k;
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(n²) 最好情况 O(n²) 最坏情况 O(n²) 空间复杂度 O(1) 不稳定排序
```

### 冒泡排序

```javascript
const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
const n = arr.length;
for (let i = 0; i < n; ++i) {
    let swapFlag = false;
    for (let k = 0; k < n - i - 1; ++k) {
        if (arr[k] > arr[k + 1]) {
            swapFlag = true;
            [arr[k], arr[k + 1]] = [arr[k + 1], arr[k]];
        }
    }
    if (!swapFlag) break;
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(n²) 最好情况 O(n) 最坏情况 O(n²) 空间复杂度 O(1) 稳定排序
```

### 插入排序

```javascript
const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
const n = arr.length;
for (let i = 1; i < n; ++i) {
    let preIndex = i - 1;
    const current = arr[i];
    while (preIndex >= 0 && arr[preIndex] > current) {
        arr[preIndex + 1] = arr[preIndex];
        --preIndex;
    }
    arr[preIndex + 1] = current;
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(n²) 最好情况 O(n) 最坏情况 O(n²) 空间复杂度 O(1) 稳定排序
```


### 快速排序

```javascript
function partition(arr, start, end) {
    const boundary = arr[start];
    while (start < end) {
        while (start < end && arr[end] >= boundary) --end;
        arr[start] = arr[end];
        while (start < end && arr[start] <= boundary) ++start;
        arr[end] = arr[start];
    }
    arr[start] = boundary;
    return start;
}

function quickSort(arr, start, end) {
    if (start >= end) return;
    const boundaryIndex = partition(arr, start, end);
    quickSort(arr, start, boundaryIndex - 1);
    quickSort(arr, boundaryIndex + 1, end);
}

const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
quickSort(arr, 0, arr.length - 1);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(nlogn) 最好情况 O(nlogn) 最坏情况 O(n²) 空间复杂度 O(logn) 不稳定排序
```

### 希尔排序

```javascript
function shellSort(arr) {
    const n = arr.length;
    for (let gap = n / 2; gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; ++i) {
            for (let k = i - gap; k >= 0 && arr[k] > arr[k + gap]; k = k - gap) {
                [arr[k], arr[k + gap]] = [arr[k + gap], arr[k]];
            }
        }
    }
}

const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
shellSort(arr);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(nlogn) 最好情况 O(nlog²n) 最坏情况 O(nlog²n) 空间复杂度 O(1) 不稳定排序
```

### 堆排序

```javascript
function adjustHeap(arr, i, n) {
    for (let k = 2 * i + 1; k < n; k = 2 * k + 1) {
        const parent = arr[i];
        if (k + 1 < n && arr[k] < arr[k + 1]) ++k;
        if (parent < arr[k]) {
            [arr[i], arr[k]] = [arr[k], arr[i]];
            i = k;
        } else {
            break;
        }
    }
}

function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2 - 1); i >= 0; --i) adjustHeap(arr, i, n);
    for (let i = n - 1; i > 0; --i) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        adjustHeap(arr, 0, i);
    }
}

const arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
heapSort(arr);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(nlogn) 最好情况 O(nlogn) 最坏情况 O(nlogn) 空间复杂度 O(1) 不稳定排序
```

### 归并排序

```javascript
function merger(arr, start, mid, end, auxArr) {
    const startStroage = start;
    let midRight = mid + 1;
    let count = 0;
    while (start <= mid && midRight <= end) {
        if (arr[start] <= arr[midRight]) auxArr[count++] = arr[start++];
        else auxArr[count++] = arr[midRight++];
    }
    while (start <= mid) auxArr[count++] = arr[start++];
    while (midRight <= end) auxArr[count++] = arr[midRight++];
    for (let i = 0; i < count; ++i) arr[i + startStroage] = auxArr[i];
    return arr;
}

function mergeSort(arr, start, end, auxArr) {
    if (start < end) {
        const mid = Math.floor((start + end) / 2);
        const left = mergeSort(arr, start, mid, auxArr);
        const right = mergeSort(arr, mid + 1, end, auxArr);
        arr = merger(arr, start, mid, end, auxArr);
    }
    return arr;
}

let arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
arr = mergeSort(arr, 0, arr.length - 1, []);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 平均时间复杂度 O(nlogn) 最好情况 O(nlogn) 最坏情况 O(nlogn) 空间复杂度 O(n) 稳定排序
```
