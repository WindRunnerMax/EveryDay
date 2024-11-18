
# The K Closest Points to Origin
We have a list `points` of points on the plane. We need to find the `K` closest points to the origin `(0, 0)`. (Here, the distance between two points on a plane is the Euclidean distance.)

You may return the answer in any order. The answer is guaranteed to be unique except for the order of the coordinates.

## Example

```
Input: points = [[1,3],[-2,2]], K = 1
Output: [[-2,2]]
Explanation: 
The distance between (1, 3) and the origin is sqrt(10),
and the distance between (-2, 2) and the origin is sqrt(8).
Since sqrt(8) < sqrt(10), (-2, 2) is closer to the origin.
We only need the closest K = 1 point to the origin, so the answer is [[-2,2]].
```

```
Input: points = [[3,3],[5,-1],[-2,4]], K = 2
Output: [[3,3],[-2,4]]
(The answer [[-2,4],[3,3]] would also be accepted.)
```

## Solution

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

## Idea
If we really want to calculate the Euclidean distance, the result might be a decimal. Besides the precision error, it's not as efficient as the integer calculation, and since the calculation is only for comparison, we can directly take the square of the Euclidean distance for the calculation. So we just need to sort the points based on the distance and take the first `N` elements. Of course, using a min or max heap for getting the first `N` smallest or largest values would be more efficient. First, we define `n` as the number of points. If `K` is greater than or equal to the number of points, we simply return the original array. Then we define the sort function, which calculates the square of the Euclidean distance between points `a` and `b` and sorts the points based on this value. After sorting, we use the `slice` method of the array to take the first `K` elements.

## Daily Problem

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://leetcode-cn.com/problems/k-closest-points-to-origin/
```