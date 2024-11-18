# Implementation of Linked List Operations in JavaScript

The main operations of implementing a linked list in `JavaScript` include creating a linked list, traversing the linked list, getting the length of the linked list, getting the value of the `i-th` element, getting the value of the `i-th` element from the end, inserting nodes, deleting nodes, merging ordered linked lists, and finding the intersection of ordered linked lists.

## Creating a Linked List

```javascript
class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

function createLinkList(arr){
    var L = new Node(null);
    var p = L;
    arr.forEach(v => {
        p.next = new Node(v);
        p=p.next;
    })
    return L;
}

(function(){
    var arr = [1, 3, 5, 7, 9]; // For convenience, an array is converted to a linked list
    var L = createLinkList(arr);
})
```

## Traversing the Linked List

```javascript
function traverseLinkList(L){
    var p = L.next;
    while(p){
        console.log(p.data);
        p = p.next;
    }
}
```

## Getting the Length of the Linked List

```javascript
function getLinkListLength(L){
    var p = L.next;
    var n = 0;
    while(p) {
        ++n;
        p = p.next;
    };
    return n;
}
```

## Getting the Value of the `i-th` Element

```javascript
function getIndexValue(L, index){
    var p = L.next;
    if(index <=0 ) return null;
    var n = 0;
    while(p) {
        ++n;
        if(index === n) return p.data;
        p = p.next;
    };
    return null;
}
```

## Getting the Value of the `i-th` Element from the End

```javascript
function getReverseIndexValue(L, index){
    var p = L.next;
    if(index <=0 ) return null;
    var cursor = L;
    var n = 0;
    while(p) {
        ++n;
        if(n >= index) cursor = cursor.next;
        p = p.next;
    };
    if(n < index) return null;
    return cursor.data;
}
```

## Inserting a Node

```javascript
function insertNode(L, position, value){
    var p = L.next;
    var i = 0;
    while(p){
        ++i;
        if(i === position) {
            var saveNextP = p.next;
            p.next = new Node(value);
            p.next.next = saveNextP;
            return true;
        }
        p = p.next;
    }
    return false;
}
```

## Deleting a Node

```javascript
function deleteNode(L, position){
    var p = L.next;
    var preNode = L;
    var i = 0;
    while(p){
        ++i;
        if(i === position) {
            preNode.next = p.next;
            p = null;
            return true;
        }
        preNode = preNode.next;
        p = p.next;
    }
    return false;
}
```

## Merging Ordered Linked Lists

```javascript
function mergeLinkList(L1, L2){
    var p1 = L1.next;
    var p2 = L2.next;
    var L3 = new Node(null);
    var p3 = L3;
    while(p1 && p2){
        if(p1.data < p2.data){
            p3.next = new Node(p1.data);
            p3 = p3.next;
            p1 = p1.next;
        }else{
            p3.next = new Node(p2.data);
            p3 = p3.next;
            p2 = p2.next;
        }
    }
    while(p1) {
        p3.next = new Node(p1.data);
        p3 = p3.next;
        p1 = p1.next;
    }
    while(p2){
        p3.next = new Node(p2.data);
        p3 = p3.next;
        p2 = p2.next;
    }
    return L3;
}
```

## Finding the Intersection of Ordered Linked Lists

```javascript
function unionLinkList(L1, L2){
    var p1 = L1.next;
    var p2 = L2.next;
    var L3 = new Node(null);
    var p3 = L3;
    while(p1 && p2){
        if(p1.data === p2.data){
            p3.next = new Node(p1.data);
            p3 = p3.next;
            p1 = p1.next;
            p2 = p2.next;
        }else if(p1.data < p2.data){
            p1 = p1.next;
        }else{
            p2 = p2.next;
        }
    }
    p3.next = null;
    return L3;
}
```

## Example

```javascript
class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}


function createLinkList(arr){
    var L = new Node(null);
    var p = L;
    arr.forEach(v => {
        p.next = new Node(v);
        p = p.next;
    })
    return L;
}

function traverseLinkList(L){
    var p = L.next;
    while(p){
        console.log(p.data);
        p = p.next;
    }
}

function getLinkListLength(L){
    var p = L.next;
    var n = 0;
    while(p) {
        ++n;
        p = p.next;
    };
    return n;
}

function getIndexValue(L, index){
    var p = L.next;
    if(index <=0 ) return null;
    var n = 0;
    while(p) {
        ++n;
        if(index === n) return p.data;
        p = p.next;
    };
    return null;
}

function getReverseIndexValue(L, index){
    var p = L.next;
    if(index <=0 ) return null;
    var cursor = L;
    var n = 0;
    while(p) {
        ++n;
        if(n >= index) cursor = cursor.next;
        p = p.next;
    };
    if(n < index) return null;
    return cursor.data;
}

function insertNode(L, position, value){
    var p = L.next;
    var i = 0;
    while(p){
        ++i;
        if(i === position) {
            var saveNextP = p.next;
            p.next = new Node(value);
            p.next.next = saveNextP;
            return true;
        }
        p = p.next;
    }
    return false;
}

function deleteNode(L, position){
    var p = L.next;
    var preNode = L;
    var i = 0;
    while(p){
        ++i;
        if(i === position) {
            preNode.next = p.next;
            p = null;
            return true;
        }
        preNode = preNode.next;
        p = p.next;
    }
    return false;
}

function mergeLinkList(L1, L2){
    var p1 = L1.next;
    var p2 = L2.next;
    var L3 = new Node(null);
    var p3 = L3;
    while(p1 && p2){
        if(p1.data < p2.data){
            p3.next = new Node(p1.data);
            p3 = p3.next;
            p1 = p1.next;
        }else{
            p3.next = new Node(p2.data);
            p3 = p3.next;
            p2 = p2.next;
        }
    }
    while(p1) {
        p3.next = new Node(p1.data);
        p3 = p3.next;
        p1 = p1.next;
    }
    while(p2){
        p3.next = new Node(p2.data);
        p3 = p3.next;
        p2 = p2.next;
    }
    return L3;
}
```

```javascript
function unionLinkList(L1, L2){
    var p1 = L1.next;
    var p2 = L2.next;
    var L3 = new Node(null);
    var p3 = L3;
    while(p1 && p2){
        if(p1.data === p2.data){
            p3.next = new Node(p1.data);
            p3 = p3.next;
            p1 = p1.next;
            p2 = p2.next;
        }else if(p1.data < p2.data){
            p1 = p1.next;
        }else{
            p2 = p2.next;
        }
    }
    p3.next = null;
    return L3;
}

(function(){
    var arr = [1, 3, 5, 7, 9]; // To facilitate, convert the array into a linked list
    console.log("Create a linked list");
    var L = createLinkList(arr);
    console.log(L);
    console.log("Traverse the linked list");
    traverseLinkList(L);
    console.log("Get the length of the linked list");
    var n = getLinkListLength(L);
    console.log(n);
    console.log("Get the value of the 2nd element in the linked list");
    var v = getIndexValue(L, 2);
    console.log(v);
    console.log("Get the value of the 2nd to last element in the linked list");
    var v = getReverseIndexValue(L, 2);
    console.log(v);
    console.log("Insert a node with the value 2 after the 1st node");
    insertNode(L, 1, 2);
    traverseLinkList(L);
    console.log("Delete the 2nd node");
    deleteNode(L, 2);
    traverseLinkList(L);
    console.log("Create two ordered linked lists");
    console.log("L1");
    var L1 = createLinkList([1, 5, 7, 10, 30]);
    traverseLinkList(L1);
    console.log("L2");
    var L2 = createLinkList([1, 3, 7, 9, 20, 100]);
    traverseLinkList(L2);
    console.log("Merge ordered linked lists, return a new linked list without modifying the original");
    var L3 = mergeLinkList(L1, L2);
    traverseLinkList(L3);
    console.log("Get the intersection of ordered linked lists, return a new linked list without modifying the original");
    var L3 = unionLinkList(L1, L2);
    traverseLinkList(L3);
})();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```