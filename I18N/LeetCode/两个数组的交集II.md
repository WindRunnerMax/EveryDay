# Intersection of Two Arrays II
Given two arrays, write a function to compute their intersection.

## Example

```
Input: nums1 = [1,2,2,1], nums2 = [2,2]
Output: [2,2]
```

```
Input: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
Output: [4,9]
```

## Explanation
* The frequency of each element in the output should be the same as the minimum frequency of that element in the two arrays.
* The order of the output does not matter.

## Solution

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

## Idea
In this problem, we use the approach of Hash Table. In JavaScript, an object is implemented as a Hash Table. So, we can directly use JavaScript object to achieve Hash Table. Please note that the output frequency of each element should be consistent with the minimum frequency of that element in the two arrays. According to this requirement, we need to record the frequency of each element in the Hash Table. Firstly, define a Hash Table to record the frequency of each element. Then, define the target array. Next, iterate through the first array `nums1`. If the key doesn't exist in the Hash Table, set its value to `1`. If the key exists, increment its value. Then, iterate through the second array `nums2`. Check if the key exists and its count is greater than `0` in the Hash Table. If so, decrement the count in the Hash Table and push the key into the target array. Finally, return the target array after the loop.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Source

```
https://leetcode.com/problems/intersection-of-two-arrays-ii/
```