# Implementing array sorting in JavaScript

Commonly used sorting implementations in `Js`, including prototype chain method calls, simple selection sort, bubble sort, insertion sort, quick sort, shell sort, heap sort, and merge sort.

## Prototype chain method calls

```javascript
var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
arr.sort((a,b) => a-b); // arr.__proto__.sort
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

## Simple selection sort

```javascript
var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
var n = arr.length;
for(let i=0; i<n; ++i){
    let minIndex = i;
    for(let k=i+1; k<n; ++k){
        if(arr[k] < arr[minIndex]) minIndex = k;
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(n²), best case O(n²), worst case O(n²), space complexity O(1), unstable sort
```

## Bubble sort

```javascript
var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
var n = arr.length;
for(let i=0; i<n; ++i){
    let swapFlag = false;
    for(let k=0; k<n-i-1; ++k){
        if(arr[k] > arr[k+1]) {
            swapFlag = true;
            [arr[k], arr[k+1]] = [arr[k+1], arr[k]];
        }
    }
    if(!swapFlag) break;
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(n²), best case O(n), worst case O(n²), space complexity O(1), stable sort
```

## Insertion sort

```javascript
var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
var n = arr.length;
for(let i=1; i<n; ++i){
    let preIndex = i-1;
    let current = arr[i];
    while(preIndex >= 0 && arr[preIndex] > current) {
        arr[preIndex+1] = arr[preIndex];
        --preIndex;
    }
    arr[preIndex+1] = current;
}
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(n²), best case O(n), worst case O(n²), space complexity O(1), stable sort
```

## Quick sort

```javascript
function partition(arr, start, end){
    var boundary = arr[start];
    while(start < end){
        while(start < end && arr[end] >= boundary) --end;
        arr[start] = arr[end];
        while(start < end && arr[start] <= boundary) ++start;
        arr[end] = arr[start];
    }
    arr[start] = boundary;
    return start;
}

function quickSort(arr, start, end){
    if(start >= end) return ;
    var boundaryIndex = partition(arr, start, end);
    quickSort(arr, start, boundaryIndex-1);
    quickSort(arr, boundaryIndex+1, end);
}


var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
quickSort(arr, 0, arr.length-1);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(nlogn), best case O(nlogn), worst case O(n²), space complexity O(logn), unstable sort
```

## Shell sort

```javascript
function shellSort(arr){
    var n = arr.length;
    for(let gap=n/2; gap>0; gap=Math.floor(gap/2)){
        for(let i=gap; i<n; ++i){
            for(let k=i-gap; k>=0 && arr[k]>arr[k+gap]; k=k-gap){
                [arr[k], arr[k+gap]] = [arr[k+gap], arr[k]];
            }
        }
    }
}

var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
shellSort(arr);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(nlogn), best case O(nlog²n), worst case O(nlog²n), space complexity O(1), unstable sort
```

## Heap sort

```javascript
function adjustHeap(arr, i, n) {
    for(let k=2*i+1; k<n; k=2*k+1){
        let parent = arr[i];
        if(k+1 < n && arr[k] < arr[k+1]) ++k;
        if(parent < arr[k]){
            [arr[i], arr[k]] = [arr[k], arr[i]];
            i = k;
        }else{
            break;
        }
    }
}

function heapSort(arr) {
    var n = arr.length;
    for(let i = Math.floor(n/2-1); i>=0; --i) adjustHeap(arr, i, n);
    for(let i=n-1; i>0; --i){
        [arr[0], arr[i]] = [arr[i], arr[0]];
        adjustHeap(arr, 0, i);
    }
}

var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
heapSort(arr);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(nlogn) Best case O(nlogn) Worst case O(nlogn) Space complexity O(1) Unstable sorting
```

## Merge Sort

```javascript
function merger(arr, start, mid, end, auxArr){
    var startStroage = start;
    var midRight = mid + 1;
    var count = 0;
    while(start <= mid && midRight <= end){
        if(arr[start] <= arr[midRight]) auxArr[count++] = arr[start++];
        else auxArr[count++] = arr[midRight++];
    }
    while(start<=mid) auxArr[count++] = arr[start++];
    while(midRight<=end) auxArr[count++] = arr[midRight++];
    for(let i=0; i<count; ++i) arr[i+startStroage] = auxArr[i];
    return arr;
}

function mergeSort(arr, start, end, auxArr) {
  if(start<end) {
    var mid = Math.floor((start+end)/2);
    var left = mergeSort(arr, start, mid, auxArr); 
    var right = mergeSort(arr, mid+1, end, auxArr); 
    arr = merger(arr, start, mid, end, auxArr);  
  }
  return arr;
}

var arr = [1, 7, 9, 8, 3, 2, 6, 0, 5, 4];
arr = mergeSort(arr, 0, arr.length-1, []);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// Average time complexity O(nlogn) Best case O(nlogn) Worst case O(nlogn) Space complexity O(n) Stable sorting
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```