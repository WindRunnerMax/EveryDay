# Sort Array By Parity II
Given a non-negative integer array `A`, half of the integers in `A` are odd and half are even.  
Sort the array so that when `A[i]` is odd, `i` is also odd; when `A[i]` is even, `i` is also even.  
You can return any array that satisfies the above conditions.

## Example

```
Input: [4,2,5,7]
Output: [4,5,2,7]
Explanation: [4,7,2,5], [2,5,4,7], [2,7,4,5] are also accepted.
```

## Solution

```javascript
/**
 * @param {number[]} A
 * @return {number[]}
 */
var sortArrayByParityII = function(arr) {
    let odd = [];
    let even = [];
    arr.forEach(v => {
        if(v & 1 === 1) odd.push(v);
        else even.push(v);
    })
    let target = arr.map((v, i) => {
        if(i & 1 === 1) return odd[~~(i/2)];
        else return even[i/2];
    })
    return target;
};
```

## Idea
This problem is about distributing odd and even numbers, nominally it's about sorting, but actually it's just a matter of distributing odd and even numbers. First, traverse the array and put the odd and even numbers into separate arrays. Then, traverse the array again and put the elements from the odd and even arrays into the target array based on the index. It is also possible to complete this problem by modifying the array in place with two pointers. First, define arrays for odd and even numbers, then traverse the array again, if the number is odd, add it to the odd array, and likewise if it is even, add it to the even array. Then, use the `map` method to traverse, if the index is odd, return the value at the corresponding position in the odd array, otherwise return the value at the corresponding position in the even array. In this case, checking for odd and even is implemented using bitwise operations, and rounding down is also achieved through bitwise operations that implicitly convert to integers. The `map` method will generate a new array, and return the new array.

## Daily Exercise

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://leetcode-cn.com/problems/sort-array-by-parity-ii/
```