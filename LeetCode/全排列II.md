# 全排列II
给定一个可包含重复数字的序列，返回所有不重复的全排列。

## 示例

```
输入: [1,1,2]
输出:
[
  [1,1,2],
  [1,2,1],
  [2,1,1]
]
```

## 题解

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function(nums) {
    var target = [];
    recursive(nums, [], target, 0, {});
    return target;
};

function recursive(nums, tmp, target, deep, hashTable){
    if(deep === nums.length) {
        var targetTmp = tmp.map( v => nums[v] );
        var targetTmpStr = JSON.stringify(targetTmp);
        if(!hashTable[targetTmpStr]) {
            hashTable[targetTmpStr] = true;
            target.push([...targetTmp]);
        }
        return 0;
    }
    for(let i=0; i<nums.length; ++i) {
        if(tmp.includes(i)) continue;
        tmp.push(i);
        recursive(nums, tmp, target, deep+1, hashTable);
        tmp.pop();
    }
}
```

## 思路
整体思路是利用回溯加去重的方式，在具体递归的过程中类似于一棵决策树，首先定义一个用于递归的函数，分别传递原数组的引用、暂存数组索引的引用、目标数组的引用、递归深度、哈希表对象，如果递归的深度与原数组的长度相同，那么就在暂存数组中使用索引取出原数组的值，将更新变量转换为字符串，因为在`Js`中对象也是以`HashTable`进行存储的，便可以直接利用`Js`对象来实现哈希表，将转换的字符串作为键值放置于哈希表，目的是之后再次出现这个字符串那么就不再放入目标数组以达到去重的目的，如果目前的`HashTable`还不存在该`key`，那么就将取得的原数组值作浅拷贝放置于目标数组，接下来是递归方案，在递归过程中已经出现在暂存数组的索引值就不再继续递归，利用回溯法实现一棵决策树，从而实现全排列。
```
   1         2          3
 2   3     1   3      1   2
3     2   3     1    2     1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 题源

```
https://leetcode-cn.com/problems/permutations-ii/
```
