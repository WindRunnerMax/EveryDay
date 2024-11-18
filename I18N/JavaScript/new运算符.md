# The new Operator

In `JavaScript`, `new` is a syntactic sugar that simplifies the code writing and allows for the batch creation of object instances.  
Syntactic sugar refers to a certain syntax added to a computer language, which does not affect the language's functionality, but makes it more convenient for programmers to use. Generally, the use of syntactic sugar can increase the readability of the program and thus reduce the chance of coding errors.

## Example
Suppose we don't use `new` to initialize and create 10 `student` object instances.

```javascript
var stuGroup = [];
for(let i=0;i<10;++i){
    var obj = {
        name: i,
        hp: 100,
        mp: 1000,
        power: 100,
        defense: 100
    }
    stuGroup.push(obj);
}
console.log(stuGroup);
```
At this point, we will obtain 10 initialized `student` object instances. However, using the `new` keyword can simplify the operation, and we can also use the prototype chain to share properties and other operations.

```javascript
function Student(i){
    this.name = i;
    this.hp = 100;
    this.mp = 1000;
    this.power = 100,
    this.defense = 100;
}
Student.prototype.from = "sdust";
var stuGroup = [];
for(let i=0;i<10;++i){
    stuGroup.push(new Student(i));
}
console.log(stuGroup);
```

## Operation of the new Operator
1. Create a new simple `JavaScript` object, i.e., `{}`.  
2. Link this object (i.e., set this object's constructor) to another object.   
3. Set the newly created object from step `1` as the context `this`.  
4. If the function does not return an object, return the object created in step `1`.  

```javascript
function _new(base,...args){
    var obj = {};
    obj.__proto__ = base.prototype;
    base.apply(obj, args);
    return obj;
}
function Student(i){
    this.name = i;
    this.hp = 100;
    this.mp = 1000;
    this.power = 100,
    this.defense = 100;
}
Student.prototype.from = "sdust";
var stuGroup = [];
for(let i=0;i<10;++i){
    stuGroup.push(_new(Student,i));
}
console.log(stuGroup);
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
Prototypes and Prototype Chain
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/%E5%8E%9F%E5%9E%8B%E4%B8%8E%E5%8E%9F%E5%9E%8B%E9%93%BE.md
apply, call, bind
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/apply%E3%80%81call%E3%80%81bind.md
```