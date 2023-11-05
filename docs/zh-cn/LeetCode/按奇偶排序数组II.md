# 按奇偶排序数组II
给定一个非负整数数组`A`，`A`中一半整数是奇数，一半整数是偶数。  
对数组进行排序，以便当`A[i]`为奇数时，`i`也是奇数；当`A[i]`为偶数时，`i`也是偶数。  
你可以返回任何满足上述条件的数组作为答案。

## 示例

```
输入：[4,2,5,7]
输出：[4,5,2,7]
解释：[4,7,2,5]，[2,5,4,7]，[2,7,4,5] 也会被接受。
```

## 题解

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

## 思路
本题是分配奇偶数的问题，名义上是排序，其实将奇偶数分配即可，首先遍历数组，将数组中的奇数与偶数分别取出并置入数组，之后再次遍历数组根据下标分别从奇数数组与偶数数组置入目标数组即可，使用双指针原地修改数组也可完成本题。首先分别定义奇数数组与偶数数组，之后进行遍历，如果这个数是奇数，就将其加入奇数数组，同样如果是偶数就加入偶数数组，之后进行`map`遍历，如果下标是奇数就将奇数数组的相应位置上的值返回，否则就返回偶数数组相应位置上的值，在这里判断奇偶性是通过位运算实现的，另外向下取整也是通过位运算隐式转换为整数，进行`map`遍历会生成新数组，将新数组返回即可。



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://leetcode-cn.com/problems/sort-array-by-parity-ii/
```

