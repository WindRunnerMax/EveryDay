```markdown
# Binary Tree Level Order Traversal II
Given a binary tree, return the bottom-up level order traversal of its nodes' values. That is, from the leaf nodes' level to the root node's level, in ascending order.

## Example

```
Given binary tree [3,9,20,null,null,15,7]

    3
   / \
  9  20
    /  \
   15   7
   
Return its bottom-up level order traversal:

[
  [15,7],
  [9,20],
  [3]
]
```

## Solution

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrderBottom = function(root) {
    if(!root) return [];
    var queue = [root];
    var target = [];
    while(queue.length){
        let tmp = [];
        let levelSize = queue.length;
        for(let i=0;i<levelSize;++i){
            let cur = queue.shift();
            tmp.push(cur.val);
            if(cur.left) queue.push(cur.left);
            if(cur.right) queue.push(cur.right);
        }
        target.unshift(tmp);
    }
    return target;
};
```

## Idea
The level order traversal of a tree can be realized by using breadth-first search. This problem requires obtaining the level order traversal from leaf nodes to the root node, so it just needs to push the result array into the target array in reverse order. First, check if it is an empty tree. If so, return an empty array. Then, define a queue and put the root node in it. After that, define the target array. Loop while the queue is not empty. Define a level cache array and the number of nodes in that level. Then traverse the nodes in that level, take out the front node from the queue, push its value into the cache array, push the left node into the queue if it exists, push the right node into the queue if it exists, and finally push the cache array into the target array at the beginning. Finally, return the target array.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://leetcode-cn.com/problems/binary-tree-level-order-traversal-ii/solution/er-cha-shu-de-ceng-ci-bian-li-ii-by-leetcode-solut/
```
```