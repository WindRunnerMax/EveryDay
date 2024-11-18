# The Kth Largest Element in an Array
Find the `k`th largest element in an unsorted array. Note that it is the `k`th largest element in the sorted order, not the `k`th distinct element.

## Example

```
Input: [3,2,1,5,6,4] and k = 2
Output: 5
```

```
Input: [3,2,3,1,2,4,5,5,6] and k = 4
Output: 4
```

## Solution

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

## Idea
Use the data structure of the max heap to solve the problem. The max heap requires that the key of the root node is greater than or equal to the key value of the left child and right child, and is a complete binary tree. First, define the `adjustHeap` function to adjust the heap. Use `i` as the index of the parent element, and use `k` as the index of the left child. When the right child exists, judge whether the right child is greater than the left child. If it is greater than the left child, let `k` point to the right child, then judge the value of the parent and the child pointed by `k`. If the child value is greater than the parent value, swap them, and continue to adjust along the path with `k` as the parent node, otherwise end this loop. Then define `n` as the length of the array, and then adjust each subtree with each parent node as the parent and make the entire tree meet the characteristics of the max heap. After that, go through the loop `k` times. Since it is a max heap and has been adjusted, take out the top value of the heap, which is the maximum value, and assign it to `target`. Then judge whether further adjustment is needed. If needed, swap the top value with the last value, and adjust the heap to meet the characteristics of the max heap. Similarly, take out the maximum value of the heap `k` times to complete.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://leetcode-cn.com/problems/kth-largest-element-in-an-array/
```