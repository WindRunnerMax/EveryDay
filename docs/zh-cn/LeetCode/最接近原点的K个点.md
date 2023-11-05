# 最接近原点的K个点
我们有一个由平面上的点组成的列表`points`。需要从中找出`K`个距离原点`(0, 0)`最近的点。  （这里，平面上两点之间的距离是欧几里德距离。）  
你可以按任何顺序返回答案。除了点坐标的顺序之外，答案确保是唯一的。

## 示例

```
输入：points = [[1,3],[-2,2]], K = 1
输出：[[-2,2]]
解释： 
(1, 3) 和原点之间的距离为 sqrt(10)，
(-2, 2) 和原点之间的距离为 sqrt(8)，
由于 sqrt(8) < sqrt(10)，(-2, 2) 离原点更近。
我们只需要距离原点最近的 K = 1 个点，所以答案就是 [[-2,2]]。
```

```
输入：points = [[3,3],[5,-1],[-2,4]], K = 2
输出：[[3,3],[-2,4]]
（答案 [[-2,4],[3,3]] 也会被接受。）
```

## 题解

```javascript
/**
 * @param {number[][]} points
 * @param {number} K
 * @return {number[][]}
 */
var kClosest = function(points, K) {
    const n = points.length;
    if(K >= n) return points;
    points.sort((a,b) => {
        const v1 = Math.pow(a[0], 2) + Math.pow(a[1], 2);
        const v2 = Math.pow(b[0], 2) + Math.pow(b[1], 2);
        return v1 - v2;
    })
    return points.slice(0, K);
};
```

## 思路
如果要真正的计算欧几里得距离的话，得到的数可能会是个小数，除了会有精度误差之外在计算方面不如整型计算快，而且由于计算仅仅是为了比较而用，直接取算欧几里得距离的平方计算即可，所以直接根据距离排序并取出前`N`个数组即可，当然直接对于取出前`N`个最大最小值的情况下使用大小顶堆效率会更高。首先定义`n`为点的数量，当`K`取值大于等于点的数量直接将原数组返回即可，之后定义排序，将`a`点与`b`点的欧几里得距离的平方计算出并根据此值进行比较，排序结束后直接使用数组的`slice`方法对数组进行切片取出前`K`个值即可。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://leetcode-cn.com/problems/k-closest-points-to-origin/
```

