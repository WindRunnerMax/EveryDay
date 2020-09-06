# 二叉树的层次遍历 II
给定一个二叉树，返回其节点值自底向上的层次遍历。   即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历。

## 示例

```
给定二叉树 [3,9,20,null,null,15,7]

    3
   / \
  9  20
    /  \
   15   7
   
返回其自底向上的层次遍历为

[
  [15,7],
  [9,20],
  [3]
]
```

## 题解

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

## 思路
树的层次遍历可以使用广度优先遍历实现，题目中要求得到从叶子节点到根节点的层次遍历，只需要在最后推入数组的时候将其推入目标数组头部即可，首先判断是否是空树，空树直接返回空数组即可，定义一个队列并将根节点置入，之后定义目标数组，在队列不空的时候执行循环，定义层次缓存数组，定义该层次的节点数量，之后遍历该层次节点，取出队首节点将值推入缓存数组，如果存在左节点就将左节点推入队列，如果存在右节点就将右节点推入队列，之后将缓存数组推入目标数组头部，最后返回目标数组即可。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://leetcode-cn.com/problems/binary-tree-level-order-traversal-ii/solution/er-cha-shu-de-ceng-ci-bian-li-ii-by-leetcode-solut/
```
