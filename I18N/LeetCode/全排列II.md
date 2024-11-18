# Permutations II
Given a collection of numbers that might contain duplicates, return all unique permutations.

## Example

```
Input: [1,1,2]
Output:
[
  [1,1,2],
  [1,2,1],
  [2,1,1]
]
```

## Solution

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

## Idea
The overall idea is to use backtracking and deduplication. During the specific recursion process, it is like a decision tree. First, define a function for recursion, and pass references to the original array, the reference of the temporary storage array index, the reference of the target array, the recursion depth, and the hash table object. If the recursion depth is the same as the length of the original array, then use the index in the temporary storage array to get the value of the original array. Convert the updated variables to strings. In `Js`, objects are also stored using `HashTable`, so you can directly use a `Js` object to implement a hash table. Place the converted string as a key in the hash table. The purpose is that if this string appears again, it will no longer be placed in the target array, achieving the goal of deduplication. If the current `HashTable` does not have this `key`, then place the obtained original array value in the target array as a shallow copy. Next is the recursion approach. If the index that has appeared in the temporary array is no longer recursively continued, use backtracking to implement a decision tree, thus achieving a full permutation.

```
   1         2          3
 2   3     1   3      1   2
3     2   3     1    2     1
```

## Daily Topic

```
[EveryDay](https://github.com/WindrunnerMax/EveryDay)
```

## Topic Source

```
[LeetCode](https://leetcode-cn.com/problems/permutations-ii/)
```