# 子集 II
给定一个可能包含重复元素的整数数组`nums`，返回该数组所有可能的子集（幂集）。

说明：解集不能包含重复的子集。

## 示例

```
输入: [1,2,2]
输出:
[
  [2],
  [1],
  [1,2,2],
  [2,2],
  [1,2],
  []
]
```

## 题解

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    var target = [[]];
    var n = nums.length;
    if(!n) return target;
    nums.sort((a, b) => a-b);
    var dfs = (cur, tmp, deep, limit) => {
        if (tmp.length + (n - cur + 1) < limit) return void 0;
        if(limit === deep) {
            target.push(tmp);
            return void 0;
        }
        for(let i=cur;i<n; ++i){
            if(i>cur && nums[i-1] === nums[i]) continue;
            dfs(i+1, [...tmp, nums[i]], deep+1, limit);
        }
    }
    nums.forEach((v,i) => dfs(0, [], 0, i+1));
    return target;
};
```

## 思路
在本质上是一个组合问题，以一个长度为`4`的数组`[1, 2, 3, 4]`组合`2`个值为例，每两个组合一个数组可取`1`组合其数组中之后的值，`2`与其数组中之后值，`3`与其数组中之后的值，`4`与其数组中之后值，即`[1, 2]`、`[1, 3]`、`[1, 4]`、`[2, 3]`、`[2, 4]`、`[3, 4]`，按照这个思路就需要取出给定数组的`1 ~ length`长度的组合，这是在给定的数组中没有重复值的情况下，题目中要求会有重复的值，所以在加入的时候我们就需要对其进行操作，首先我们对其进行排序，这样重复的值就会在一起，之后判定对于给定目标长度的数组重复的值只加入一个即可。首先定义目标数组，空数组是所有的数组的子集，所以将空数组置入，之后取得传入的数组的长度`n`，如果长度为`0`则直接返回目标数组，之后对其进行排序，之后定义深度递归遍历，首先进行剪枝，如果当前`tmp`数组的大小为`s`，未确定状态的区间`[cur,n]`的长度为`t`，如果`s + t < limit`，那么即使`t`个都被选中，也不可能构造出一个长度为`limit`的序列，故这种情况就没有必要继续向下递归，之后判断递归深度如果与`limit`相等则直接将`tmp`数组置入目标数组并返回，之后定义一个循环，在这里我们要处理数字重复的情况，先前已经对其进行排序，所以每次递归后的循环对于数组中重复的值，我们只将第一个置入数组，其他的都忽略，从`cur`开始到`n`进行递归取值，将`tmp`数组与`cur`构建一个新数组传递到下一个递归中，之后定义一个循环取得要取得的子集的数组长度，启动递归初始化`cur`为`0`，深度`deep`为`0`，`tmp`为一个空数组，`limit`为`i+1`，递归完成后返回目标数组即可。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://leetcode-cn.com/problems/subsets-ii/
```

