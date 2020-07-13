# 两个数组的交集II
给定两个数组，编写一个函数来计算它们的交集。

## 示例

```
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2,2]
```

```
输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[4,9]
```

## 说明
* 输出结果中每个元素出现的次数，应与元素在两个数组中出现次数的最小值一致。
* 我们可以不考虑输出结果的顺序。

## 题解

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
    var hashTable = {};
    var target = [];
    nums1.forEach(v => {
        if(hashTable[v]) hashTable[v]++;
        else hashTable[v] = 1;   
    })
    nums2.forEach(v => {
        if(hashTable[v] && hashTable[v] > 0) {
            hashTable[v]--;
            target.push(v);
        }
    })
    return target;
};
```

## 思路
本题使用哈希表的方式来解答，而`Js`中对象也是以`HashTable`进行存储的，便可以直接利用`Js`对象来实现哈希表，请注意题目要求结果中每个元素出现的次数应与元素在两个数组中出现次数的最小值一致，根据这个要求那么需要在哈希表中记录值出现的次数，首先定义一个`HashTable`用以记录值出现次数，然后定义目标数组，接着将第一个数组`nums1`进行遍历，在哈希表中如果没有定义这个`key`，那么就将这个`key`的值设置为`1`，如果已经定义了，那么就将其值自增，然后遍历第二个数组`nums2`，直接判断在哈希表中是否定义该`key`，如果定义且其计数值大于`0`，那么就将哈希表中该`key`的计数值自减，然后将该`key`推入数组，循环结束后返回目标数组即可。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 题源

```
https://leetcode-cn.com/problems/intersection-of-two-arrays-ii/
```
