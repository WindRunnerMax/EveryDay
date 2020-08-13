# 数组中的第K个最大元素
在未排序的数组中找到第`k`个最大的元素。请注意，你需要找的是数组排序后的第`k`个最大的元素，而不是第`k`个不同的元素。

## 示例

```
输入: [3,2,1,5,6,4] 和 k = 2
输出: 5
```

```
输入: [3,2,3,1,2,4,5,5,6] 和 k = 4
输出: 4
```

## 题解

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(arr, k) {
    var adjustHeap = function(arr, i, n) {
        for(let k=2*i+1; k<n; k=2*k+1){
            let parent = arr[i];
            if(k+1 < n && arr[k] < arr[k+1]) ++k;
            if(parent < arr[k]){
                [arr[i], arr[k]] = [arr[k], arr[i]];
                i = k;
            }else{
                break;
            }
        }
    }
    var n = arr.length;
    for(let i = Math.floor(n/2-1); i>=0; --i) adjustHeap(arr, i, n);
    var target = 0;
    for(let i=n-1; i>=n-k; --i){
        target = arr[0];
        if(i-1>=n-k){
            [arr[0], arr[i]] = [arr[i], arr[0]];
            adjustHeap(arr, 0, i);
        }
    }
    return target;
};
```

## 思路
采用大顶堆的数据结构解决问题，大顶堆要求根节点的关键字既大于或等于左子树的关键字值，又大于或等于右子树的关键字值并且为完全二叉树，首先定义`adjustHeap`函数左调整堆使用，首先以`i`作为双亲元素的下标，以`k`作为左孩子的下标，当右孩子存在时判断右孩子是否大于左孩子，大于左孩子则将`k`作为右孩子的指向下标，然后判断双亲值与`k`指向的孩子的节点值的大小，如果孩子值大于双亲值则交换，并且以`k`作为双亲节点沿着路径继续向下调整，否则就结束本次循环，然后定义`n`作为数组长度，之后将堆中每个作为双亲节点的子树进行调整，使整个树符合大顶堆的特征，之后进行`k`次循环，由于是大顶堆且已调整完成将顶堆的顶值也就是最大值取出赋值给`target`，之后判断是否需要进一步调整，如果需要则交换顶端值与最后一个值，然后调整顶堆符合大顶堆的条件，同样取出顶堆最大值，取出`k`次即可完成。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://leetcode-cn.com/problems/kth-largest-element-in-an-array/
```
