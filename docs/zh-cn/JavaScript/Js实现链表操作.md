# Js实现链表操作
`JavaScript`实现链表主要操作，包括创建链表、遍历链表、获取链表长度、获取第`i`个元素值、获取倒数第`i`个元素值、插入节点、删除节点、有序链表合并、有序链表交集。

## 创建链表

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
    var arr = [1, 3, 5, 7, 9]; // 为了方便，将数组转化为链表
    var L = createLinkList(arr);
})
```

## 遍历链表

```javascript
function traverseLinkList(L){
    var p = L.next;
    while(p){
        console.log(p.data);
        p = p.next;
    }
}
```

## 获取链表长度

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

## 获取第i个元素值

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

## 获取倒数第i个元素值

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

## 插入节点

```javascript
function insertNode(L, posistion, value){
    var p = L.next;
    var i = 0;
    while(p){
        ++i;
        if(i === posistion) {
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

## 删除节点

```javascript
function deleteNode(L, posistion){
    var p = L.next;
    var preNode = L;
    var i = 0;
    while(p){
        ++i;
        if(i === posistion) {
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

## 有序链表合并

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

## 有序链表交集

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

## 示例

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

function insertNode(L, posistion, value){
    var p = L.next;
    var i = 0;
    while(p){
        ++i;
        if(i === posistion) {
            var saveNextP = p.next;
            p.next = new Node(value);
            p.next.next = saveNextP;
            return true;
        }
        p = p.next;
    }
    return false;
}

function deleteNode(L, posistion){
    var p = L.next;
    var preNode = L;
    var i = 0;
    while(p){
        ++i;
        if(i === posistion) {
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
    var arr = [1, 3, 5, 7, 9]; // 为了方便，将数组转化为链表
    console.log("创建链表");
    var L = createLinkList(arr);
    console.log(L);
    console.log("遍历链表");
    traverseLinkList(L);
    console.log("获取链表长度");
    var n = getLinkListLength(L);
    console.log(n);
    console.log("获取链表第2个元素值");
    var v = getIndexValue(L, 2);
    console.log(v);
    console.log("获取链表倒数第2个元素值");
    var v = getReverseIndexValue(L, 2);
    console.log(v);
    console.log("在第1个节点后插入值为2的节点");
    insertNode(L, 1, 2);
    traverseLinkList(L);
    console.log("删除第2个节点");
    deleteNode(L, 2);
    traverseLinkList(L);
    console.log("创建两个有序链表");
    console.log("L1");
    var L1 = createLinkList([1, 5, 7, 10, 30]);
    traverseLinkList(L1);
    console.log("L2");
    var L2 = createLinkList([1, 3, 7, 9, 20, 100]);
    traverseLinkList(L2);
    console.log("合并有序链表，不改变原链表，返回一个新链表");
    var L3 = mergeLinkList(L1, L2);
    traverseLinkList(L3);
    console.log("取有序链表交集，不改变原链表，返回一个新链表");
    var L3 = unionLinkList(L1, L2);
    traverseLinkList(L3);
})();
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
