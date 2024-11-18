# Subsets II

Given an integer array `nums` that may contain duplicate elements, return all possible subsets (power set) of the array.

Note: The solution set must not contain duplicate subsets.

## Example

```
Input: [1,2,2]
Output:
[
  [2],
  [1],
  [1,2,2],
  [2,2],
  [1,2],
  []
]
```

## Solution

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

## Idea
Essentially, this is a combination problem. Taking an array of length `4` `[1, 2, 3, 4]` to combine `2` values as an example, we need to take `1` and combine it with the values after it, take `2` and combine it with the values after it, and so on. For example, `[1, 2]`, `[1, 3]`, `[1, 4]`, `[2, 3]`, `[2, 4]`, and `[3, 4]`. Following this approach, we need to generate subsets of lengths `1` through `length` for the given array. When there are no duplicate values in the given array, this approach is sufficient. However, the problem states that there may be duplicate values. Therefore, we need to handle this while adding values to the subsets. First, we sort the array to group duplicate values together, and then we only add the first occurrence of a duplicate value when constructing the subsets. We initialize the target array with an empty array, as it is a subset of all arrays. We then get the length `n` of the input array. If the length is `0`, we return the target array. Then we sort the array and define a depth-first search function. We start by pruning: if the size of the `tmp` array, combined with the length `t` of the undetermined range `[cur, n]`, is less than `limit`, it is not possible to construct a sequence of length `limit` even if all `t` elements are selected. In such cases, there is no need to proceed with further recursion. We then check if the recursion depth is equal to the limit. If so, we add the `tmp` array to the target array and return. Next, we use a loop to handle duplicate numbers. Since we have already sorted the array, we only add the first occurrence of each value and ignore the rest during the recursion. We then define a loop to retrieve subsets of different lengths. We start the recursion with `cur` as `0`, `deep` as `0`, `tmp` as an empty array, and `limit` as `i+1`. After the recursion is complete, we return the target array.

## Daily Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://leetcode-cn.com/problems/subsets-ii/
```