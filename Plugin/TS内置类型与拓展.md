# TS内置类型与拓展
`TypeScript`具有类型系统，且是`JavaScript`的超集，其可以编译成普通的`JavaScript`代码，也就是说，其是带有类型检查的`JavaScript`。

## 内置类型
`TypeScript`提供了几种实用程序类型来促进常见的类型转换，这些类型在全局范围内可用。

### Partial
`Partial<Type>`构造一个类型使`Type`的所有属性都设置为可选。

```
/**
 * Make all properties in T optional
 */

type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

```
interface Example {
    a: string;
    b: number;
}

type PartialExample = Partial<Example>;

/**
 * PartialExample
 * interface {
 *     a?: string | undefined;
 *     b?: number | undefined;
 * }
 */
```

### Required
`Required<Type>`构造一个类型使`Type`的所有属性都设置为`required`，与`Partial<Type>`功能相反。

```
/**
 * Make all properties in T required
 */

type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

```
interface Example {
    a?: string;
    b?: number;
}

type RequiredExample = Required<Example>;

/**
 * RequiredExample
 * interface {
 *     a: string;
 *     b: number;
 * }
 */
```

### Readonly
`Required<Type>`构造一个类型使`Type`的所有属性都设置为`readonly`，这意味着构造类型的属性都是只读的，不能被修改，这对使用`Object.freeze()`方法的对象非常有用。

```
/**
 * Make all properties in T readonly
 */

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

```
interface Example {
    a: string;
    b: number;
}

type ReadonlyExample = Readonly<Example>;

/**
 * ReadonlyExample
 * interface {
 *     readonly a: string;
 *     readonly b: number;
 * }
 */
```

### Record
`Record<Keys, Type>`构造一个对象类型，其属性键为`Keys`，其属性值为`Type`，通常可以使用`Record`来表示一个对象。

```
/**
 * Construct a type with a set of properties K of type T
 */

type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

```
type RecordType = Record<string, string|number>;

const recordExample: RecordType ={
  a: 1,
  b: "1"
}
```

### Pick
`Pick<Type, Keys>`通过从`Type`中选择一组属性`Keys`来构造一个类型。

```
/**
 * From T, pick a set of properties whose keys are in the union K
 */

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

```
interface Example {
    a: string;
    b: number;
    c: symbol;
}

type PickExample = Pick<Example, "a"|"b">;

/**
 * PickExample
 * interface {
 *     a: string;
 *     b: number;
 * }
 */
```

### Omit
`Omit<Type, Keys>`通过从`Type`中选择所有属性然后删除`Keys`来构造一个类型，与`Pick<Type, Keys>`功能相反。

```
/**
 * Construct a type with the properties of T except for those in type K.
 */

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

```
interface Example {
    a: string;
    b: number;
    c: symbol;
}

type OmitExample = Omit<Example, "a"|"b">;

/**
 * OmitExample
 * interface {
 *     c: symbol;
 * }
 */
```

### Exclude
`Exclude<UnionType, ExcludedMembers>`通过从`UnionType`中排除可分配给`ExcludedMembers`的所有联合成员来构造类型。

```
/**
 * Exclude from T those types that are assignable to U
 */

type Exclude<T, U> = T extends U ? never : T;
```

```
type ExcludeExample = Exclude<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExcludeExample
 * "c" | "z"
 */
```

### Extract
`Extract<Type, Union>`通过从`Type`中提取所有可分配给`Union`的联合成员来构造一个类型，与`Exclude<UnionType, ExcludedMembers>`功能相反。

```
/**
 * Extract from T those types that are assignable to U
 */

type Extract<T, U> = T extends U ? T : never;
```

```
type ExtractExample = Extract<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExtractExample
 * "a" | "b"
 */
```

### NonNullable
`NonNullable<Type>`通过从`Type`中排除`null`和`undefined`来构造一个类型。

```
/**
 * Exclude null and undefined from T
 */

type NonNullable<T> = T extends null | undefined ? never : T;
```

```
type NonNullableExample = NonNullable<number|string|null|undefined>;

/**
 * NonNullableExample
 * string | number
 */
```

### Parameters
`Parameters<Type>`从函数类型`Type`的参数中使用的类型构造元组类型。

```
/**
 * Obtain the parameters of a function type in a tuple
 */

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

```
type FnType = (a1: number, a2: string) => void;

type ParametersExample = Parameters<FnType>;

/**
 * ParametersExample
 * [a1: number, a2: string]
 */
```

### ConstructorParameters
`ConstructorParameters<Type>`从构造函数类型的类型构造元组或数组类型，其产生一个包含所有参数类型的元组类型。

```
/**
 * Obtain the parameters of a constructor function type in a tuple
 */

type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
```

```
interface Example{
  fn(a: string): string;
}

interface ExampleConstructor{
    new(a: string, b: number): Example;
}

declare const Example: ExampleConstructor;

type ConstructorParametersExample = ConstructorParameters<ExampleConstructor>;

/**
 * ConstructorParametersExample
 * [a: string, b: number]
 */
```

### ReturnType
`ReturnType<Type>`构造一个由函数`Type`的返回类型组成的类型。

```
/**
 * Obtain the return type of a function type
 */

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

```
type FnType = (a1: number, a2: string) => string | number;

type ReturnTypeExample = ReturnType<FnType>;

/**
 * ReturnTypeExample
 * string | number
 */
```

### InstanceType
`InstanceType<Type>`构造一个由`Type`中构造函数的实例类型组成的类型。

```
/**
 * Obtain the return type of a constructor function type
 */

type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
```

```
interface Example{
  fn(a: string): string;
}

interface ExampleConstructor{
    new(a: string, b: number): Example;
}

declare const Example: ExampleConstructor;

type InstanceTypeExample = InstanceType<ExampleConstructor>;

// const a: InstanceTypeExample = new Example("a", 1); // new ExampleConstructor => Example

/**
 * InstanceTypeExample
 * Example
 */
```

### ThisParameterType
`ThisParameterType<Type>`提取函数类型的`this`参数的类型，如果函数类型没有`this`参数，则为`unknown`。

```
/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.
 */

type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
```

```
function toHex(this: Number) {
  return this.toString(16);
}

type ThisParameterTypeExample = ThisParameterType<typeof toHex>;

console.log(toHex.apply(27)); // 1b

/**
 * ThisParameterTypeExample
 * Number
 */
```

### OmitThisParameter
`OmitThisParameter<Type>`从`Type`中移除`this`参数，如果`Type`没有显式声明此参数，则结果只是`Type`，否则，从`Type`创建一个不带此参数的新函数类型。泛型被删除，只有最后一个重载签名被传播到新的函数类型中。

```
/**
 * Removes the 'this' parameter from a function type.
 */

type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;
```

```
function toHex(this: Number) {
  return this.toString(16);
}

type OmitThisParameterExample = OmitThisParameter<typeof toHex>;

const toHex27: OmitThisParameterExample = toHex.bind(27);
console.log(toHex27()); // 1b

/**
 * OmitThisParameterExample
 * () => string
 */
```

### ThisType
`ThisType<Type>`可以在对象字面量中键入`this`，并提供通过上下文类型控制`this`类型的便捷方式，其只有在`--noImplicitThis`的选项下才有效。

```
/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }
```

```
// const foo1 = {
//     bar() {
//          console.log(this.a); // error
//     }
// }

const foo2: { bar: () => void } & ThisType<{ a: number }> = {
    bar() {
         console.log(this.a); // ok
    }
}
```

### Uppercase
`Uppercase<StringType>`将`StringType`转为大写，`TS`以内置关键字`intrinsic`来通过编译期来实现。

```
/**
 * Convert string literal type to uppercase
 */

type Uppercase<S extends string> = intrinsic;
```

```
type UppercaseExample = Uppercase<"abc">;

/**
 * UppercaseExample
 * ABC
 */
```

### Lowercase
`Lowercase<StringType>`将`StringType`转为小写。

```
/**
 * Convert string literal type to lowercase
 */

type Lowercase<S extends string> = intrinsic;
```

```
type LowercaseExample = Lowercase<"ABC">;

/**
 * LowercaseExample
 * abc
 */
```

### Capitalize
`Capitalize<StringType>`将`StringType`首字母转为大写。

```
/**
 * Convert first character of string literal type to uppercase
 */

type Capitalize<S extends string> = intrinsic;
```

```
type CapitalizeExample = Capitalize<"abc">;

/**
 * CapitalizeExample
 * Abc
 */
```

### Uncapitalize
`Uncapitalize<StringType>`将`StringType`首字母转为小写。

```
/**
 * Convert first character of string literal type to lowercase
 */

type Uncapitalize<S extends string> = intrinsic;
```

```
type UncapitalizeExample = Uncapitalize<"ABC">;

/**
 * CapitalizeExample
 * aBC
 */
```

## 拓展
`TypeScript`中常用的一些语法以及概念。

### 泛型
泛型`Generics`是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。举一个简单的例子，如果需要实现一个生成数组的函数，这个数组会填充默认值，这个数组填充的类型不需要事先指定，而可以在使用的时候指定。当然在这里使用`new Array`组合`fill`函数是一个效果。

```
function createArray<T>(value: T, length: number): T[] {
  const result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

console.log(createArray<number>(1, 3)); // 不显式地指定`number`也可以自动推断
```

我们也可以约束`T`的类型只能为`number`与`string`。

```
const createArray = <T extends number|string>(value: T, length: number): T[] => {
  const result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

console.log(createArray<number>(1, 3));
// console.log(createArray(true, 3)); // Argument of type 'boolean' is not assignable to parameter of type 'string | number'.(2345)
```

多个类型也可以相互约束，例如上边的`Pick`，在这里的`K`必须是`T`中`key`的子集。

```
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

在传递泛型的时候可以为`T`指定默认值，使用范型编写`class`即泛型类也是完全支持的。

```
class Example<T = number> {
    public value: T;
    public add: (x: T, y: T) => T;
    constructor(value: T, add: (x: T, y: T) => T){
      this.value = value;
      this.add = add;
    }
}

let example = new Example<number>(1, (x, y) => x + y);
console.log(example.value); // 1
console.log(example.add(1, 2)); // 3
```

### 断言
类型断言`Type Assertion`可以用来手动指定一个值的类型，由于`<Type>value`的语法容易与`TSX`冲突，所以通常都是使用`value as Type`的语法。通常当`TypeScript`不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型中共有的属性或方法。

```
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function getName(animal: Cat | Fish) {
    return animal.name;
}
```

而有时候，我们确实需要在还不确定类型的时候就访问其中一个类型特有的属性或方法。

```
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function isFish(animal: Cat | Fish) {
    if (typeof animal.swim === "function") { // Property 'swim' does not exist on type 'Cat | Fish'. Property 'swim' does not exist on type 'Cat'.(2339)
        return true;
    }
    return false;
}
```

上面的例子中，获取`animal.swim`的时候会报错，此时可以使用类型断言，将`animal`断言成`Fish`。当然这里只是举一个例子说明断言的使用，因为滥用断言是不提倡的，类型断言只能够欺骗`TypeScript`编译器，而无法避免运行时的错误，滥用类型断言可能会导致运行时错误。

```
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function isFish(animal: Cat | Fish) {
    if (typeof (animal as Fish).swim === "function") {
        return true;
    }
    return false;
}
```

单个断言即`value as Type`是有一定条件的，当`S`类型是`T`类型的子集，或者`T`类型是`S`类型的子集时，`S`能被成功断言成`T`。这是为了在进行类型断言时提供额外的安全性，完全毫无根据的断言是危险的，如果你想这么做，你可以使用`any`。  
如果认为某个值`value`必定是某种类型`Type`，而单个断言无法满足要求，可以使用双重断言，即`value as unknown as Type`，使用`value as any as Type`也是同样的效果，但是若使用双重断言，则可以打破要使得`A`能够被断言为`B`，只需要`A`兼容`B`或`B`兼容`A`即可的限制，将任何一个类型断言为任何另一个类型。通常来说除非迫不得已，不要使用双重断言。  
此外类型断言之所以不被称为类型转换，是因为类型转换通常意味着某种运行时的支持，而类型断言只会影响`TypeScript`编译时的类型，类型断言语句在编译结果中会被删除，也就是说类型断言纯粹是一个编译时语法，同时其也是一种为编译器提供关于如何分析代码的方法。    
与类型断言相关的还有一个`!`的表达式，其在`TypeScript 2.7`被加入，其称为`definite assignment assertion`显式赋值断言，显式赋值断言允许你在实例属性和变量声明之后加一个感叹号`!`，来告诉`TypeScript`这个变量确实已被赋值，即使`TypeScript`不能分析出这个结果。

```
let x: number;
let y!: number;
console.log(x + x); // Variable 'x' is used before being assigned.(2454)
console.log(y + y); // ok
```

既然说到了`!`，那么也可以说一下`?`，在`interface`中`?`和`undefined`并不是等效的，在下面的例子中，在`b`未将`?`声明的情况下，其在`interface`下是`required`，`TypeScript`认为其是必须指定的`key`即使其值只能为`undefined`。

```
interface Example{
  a?: number;
  b: undefined;
}

const example1: Example = {}; // Property 'b' is missing in type '{}' but required in type 'Example'.(2741)
const example2: Example = { b: undefined }; // ok
```

### infer
`infer`示在`extends`条件语句中待推断的类型变量，也可以认为其是一个占位符，用以在使用时推断。例如上边的`ReturnType`就是通过`infer`进行推断的，首先是范型约束了一个函数类型，然后在后边进行`infer`占位后进行推断。

```
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

有一些应用，`tuple`转`union`，如`[string, number, symbol] -> string | number | symbol`。

```
type ElementOf<T> = T extends Array<infer E> ? E : never;

type TTuple = [string, number, symbol];

type ToUnion = ElementOf<TTuple>; // string | number | symbol
```

还有一个比较离谱的实现。

```
type TTuple = [string, number, symbol];
type Res = TTuple[number]; // string | number | symbol

// https://stackoverflow.com/questions/44480644/string-union-to-string-array/45486495#45486495
```

还比如获取函数参数的第一个参数类型。

```
type fn = (a: number, b: string, ddd: boolean) => void;

type FirstParameter<T> = T extends (args1: infer R, ...rest: any[]) => any ? R : never;

type firstArg = FirstParameter<fn>;  // number
```

### 函数重载
`TypeScript`允许声明函数重载，即允许一个函数接受不同数量或类型的参数时，作出不同的处理。当然，最终声明即从函数内部看到的真正声明与所有重载兼容是很重要的。这是因为这是函数体需要考虑的函数调用的真实性质。

```
function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string | void {
    if (typeof x === "number") {
        return Number(x.toString().split("").reverse().join(""));
    } else if (typeof x === "string") {
        return x.split("").reverse().join("");
    }
}
```

还有一个比较实用的简单例子，在`ios`上的`Date`对象是不接受形如`2022-04-05 20:00:00`的字符串去解析的，当在`safari`的控制台执行时，会出现一些异常行为。这个字符串的解析在谷歌浏览器或者安卓上就没有问题，所以需要做一下兼容处理。

```javascript
// safari
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // NaN

// chrome
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // 2
```

所以需要对时间日期对象做一下简单的兼容，但是做兼容时又需要保证`TS`的声明，这时就可以使用函数重载等方式处理。

```
function safeDate(): Date;
function safeDate(date: Date): Date;
function safeDate(timestamp: number): Date;
function safeDate(dateTimeStr: string): Date;
function safeDate(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
): Date;
function safeDate(
    p1?: Date | number | string,
    p2?: number,
    p3?: number,
    p4?: number,
    p5?: number,
    p6?: number,
    p7?: number
): Date | never {
    if (p1 === void 0) {
        // 无参构建
        return new Date();
    } else if (p1 instanceof Date || (typeof p1 === "number" && p2 === void 0)) {
        // 第一个参数为`Date`或者`Number`且无第二个参数
        return new Date(p1);
    } else if (typeof p1 === "number" && typeof p2 === "number") {
        // 第一和第二个参数都为`Number`
        return new Date(p1, p2, p3 || 1, p4 || 0, p5 || 0, p6 || 0, p7 || 0);
    } else if (typeof p1 === "string") {
        // 第一个参数为`String`
        return new Date(p1.replace(/-/g, "/"));
    }
    throw new Error("No suitable parameters");
}

console.log(safeDate("2022-04-05 20:00:00").getDay()); // 2
```

```
type DateParams =
    | []
    | [string]
    | [number, number?, number?, number?, number?, number?, number?]
    | [Date];
const safeDate = <T extends DateParams>(...args: T): Date => {
    const copyParams = args.slice(0);
    if (typeof copyParams[0] === "string") copyParams[0] = copyParams[0].replace(/-/g, "/");
    return new Date(...(args as ConstructorParameters<typeof Date>));
};

console.log(safeDate("2022-04-05 20:00:00").getDay()); // 2
```


### 声明文件

对于全局变量的声明文件主要有以下几种语法：

* `declare var`声明全局变量。
* `declare function`声明全局方法。
* `declare class`声明全局类。
* `declare enum`声明全局枚举类型。
* `declare namespace`声明含有子属性的全局对象。
* `interface`和`type`声明全局类型。
* `declare module`拓展声明。

我们可以通过`declare`关键字来告诉`TypeScript`，某些变量或者对象已经声明，我们可以选择把这些声明放入`.ts`或者`.d.ts`里。`declare namespace`表示全局变量是一个对象，包含很多子属性。

```
// global.d.ts
declare namespace App {
    interface Utils {
        onload: <T extends unknown[]>(fn: (...args: T) => void, ...args: T) => void;
    }
}

declare interface Window{
  utils: App.Utils
}

// main.ts
window.utils = {
  onload: () => void 0
}
```

对于模块的声明文件主要有以下几种语法：

* `export`导出变量。
* `export namespace`导出含有子属性的对象。
* `export default ES6`默认导出。
* `export = `导出`CommonJs`模块。

模块的声明文件与全局变量的声明文件有很大区别，在模块的声明文件中，使用`declare`不再会声明一个全局变量，而只会在当前文件中声明一个局部变量，只有在声明文件中使用`export`导出，然后在使用方`import`导入后，才会应用到这些类型声明，如果想使用模块的声明文件而并没有实际的`export`时，通常会显示标记一个空导出`export {}`。对于模块的声明文件我们更推荐使用 `ES6`标准的`export default`和`export`。

```
// xxx.ts
export const name: string = "1";

// xxxxxx.ts
import { name } from "xxx.ts";
console.log(name); // 1 // typeof name === "string"
```

如果是需要扩展原有模块的话，需要在类型声明文件中先引用原有模块，再使用`declare module`扩展原有模块。

```
// xxx.d.ts
import * as moment from "moment";

declare module "moment" {
    export function foo(): moment.CalendarKey;
}

// xxx.ts
import * as moment from "moment";
moment.foo();
```

```
import Vue from "vue";

declare module "vue/types/vue" {
    interface Vue {
        copy: (str: string) => void;
    }
}
```

还有一些诸如`.vue`文件、`.css`、`.scss`文件等，需要在全局中进行声明其`import`时对象的类型。

```
declare module "*.vue" {
    import Vue from "vue/types/vue";
    export default Vue;
}
```

```
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

```
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

在声明文件中，还可以通过三斜线指令即`///`来导入另一个声明文件，在全局变量的声明文件中，是不允许出现`import`、`export`关键字的，一旦出现了，那么他就会被视为一个模块或`UMD`库，就不再是全局变量的声明文件了，故当我们在书写一个全局变量的声明文件时，如果需要引用另一个库的类型，那么就必须用三斜线指令了。

```
// types/jquery-plugin/index.d.ts
/// <reference types="jquery" />
declare function foo(options: JQuery.AjaxSettings): string;

// src/index.ts
foo({});
```

### 协变与逆变
子类型在编程理论上是一个复杂的话题，而他的复杂之处来自于一对经常会被混淆的现象，我们称之为协变与逆变，在这里引用两篇文章以及实例。  
首先是 [这篇文章](https://zhuanlan.zhihu.com/p/353156044) 对于协变与逆变的描述。协变即类型收敛，逆变即类型发散。

```
type Color = {}

type Red = {
  red: any;
}

let c: Color = {};
let r: Red = {red: 1};

// 变量类型是协变的
c = r; // Red类型收敛为Color类型
r = c; // 报错

// 函数参数类型是逆变的
let useC: (c: Color) => number;
let useR: (r: Red) => number;

useC = useR; // 协变，类型收敛。开启strictFunctionTypes:true后将报错，变为逆变。
// useC执行传入Color类型，执行的是useR，Color发散为Red类型，发生错误。

useR = useC; // 逆变，类型发散。
// useR执行传入Red类型，执行的是useC，Red类型收敛为Color类型。

// 函数返回值类型是协变的
let useC2: () => Color = () => ({});
let useR2: () => Red = () => ({red: 1});

useC2 = useR2;
useR2 = useC2; // 报错
```

除了函数参数类型是逆变，都是协变。 将一个函数赋给另一个函数变量时，要保证参数类型发散，即比目标类型范围小。 目标函数执行时是执行的原函数，传入的参数类型会收敛为原函数参数类型。协变表示类型收敛，即类型范围缩小或不变。逆变反之。本质是执行时类型收敛是安全的。

还有 [这篇文章](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html) 对于协变与逆变的描述。  
开始文章之前我们先约定如下的标记，`A≼B`意味着`A`是`B`的子类型;`A → B`指的是以`A`为参数类型，以`B`为返回值类型的函数类型;`x : A`意味着`x`的类型为`A`。  
假设我有如下三种类型：`Greyhound ≼ Dog ≼ Animal`。
`Greyhound`灰狗是`Dog`狗的子类型，而`Dog`则是`Animal`动物的子类型，由于子类型通常是可传递的，因此我们也称`Greyhound`是`Animal`的子类型，问题: 以下哪种类型是`Dog → Dog`的子类型呢。

1. `Greyhound → Greyhound`。
2. `Greyhound → Animal`。
3. `Animal → Animal`。
4. `Animal → Greyhound`。

让我们来思考一下如何解答这个问题，首先我们假设`f`是一个以`Dog → Dog`为参数的函数，它的返回值并不重要，为了具体描述问题，我们假设函数结构体是这样的`f :(Dog → Dog ) → String`，现在我想给函数`f`传入某个函数`g`来调用，我们来瞧瞧当`g`为以上四种类型时，会发生什么情况。  

1.我们假设`g : Greyhound → Greyhound`，`f(g)`的类型是否安全？  
不安全，因为在`f`内调用它的参数`(g)`函数时，使用的参数可能是一个不同于灰狗但又是狗的子类型，例如`GermanShepherd`牧羊犬。  
2.我们假设`g : Greyhound → Animal`，`f(g)`的类型是否安全？  
不安全。理由同`1`。
3.我们假设`g : Animal → Animal`，`f(g)`的类型是否安全？   
不安全。因为`f`有可能在调用完参数之后，让返回值也就是`Animal`动物狗叫，并非所有动物都会狗叫。   
4.我们假设`g : Animal → Greyhound`，`f(g)`的类型是否安全？  
是的，它的类型是安全的，首先`f`可能会以任何狗的品种来作为参数调用，而所有的狗都是动物，其次，它可能会假设结果是一条狗，而所有的灰狗都是狗。  

如上所述，我们得出结论`(Animal → Greyhound) ≼ (Dog → Dog)`返回值类型很容易理解，灰狗是狗的子类型，但参数类型则是相反的，动物是狗的父类。用合适的术语来描述这个奇怪的表现，可以说我们允许一个函数类型中，返回值类型是协变的，而参数类型是逆变的。返回值类型是协变的，意思是`A ≼ B`就意味着`(T → A ) ≼ ( T → B )`，参数类型是逆变的，意思是`A ≼ B`就意味着`(B → T ) ≼ ( A → T )`即`A`和`B`的位置颠倒过来了。一个有趣的现象是在`TypeScript`中，参数类型是双向协变的，也就是说既是协变又是逆变的，而这并不安全，但是现在你可以在`TypeScript 2.6`版本中通过`--strictFunctionTypes`或`--strict`标记来修复这个问题。

### tsconfig.json

```
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5" /* target用于指定编译之后的版本目标: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */,
    "module": "commonjs" /* 用来指定要使用的模块标准: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */,
    "lib": ["es6", "dom"] /* lib用于指定要包含在编译中的库文件 */,
    "allowJs": true,                       /* allowJs设置的值为true或false，用来指定是否允许编译js文件，默认是false，即不编译js文件 */
    "checkJs": true,                       /* checkJs的值为true或false，用来指定是否检查和报告js文件中的错误，默认是false */
    "jsx": "preserve",                     /* 指定jsx代码用于的开发环境: 'preserve', 'react-native', or 'react'. */
    "declaration": true,                   /* declaration的值为true或false，用来指定是否在编译的时候生成相应的".d.ts"声明文件。如果设为true，编译每个ts文件之后会生成一个js文件和一个声明文件。但是declaration和allowJs不能同时设为true */
    "declarationMap": true,                /* 值为true或false，指定是否为声明文件.d.ts生成map文件 */
    "sourceMap": true,                     /* sourceMap的值为true或false，用来指定编译时是否生成.map文件 */
    "outFile": "./",                       /* outFile用于指定将输出文件合并为一个文件，它的值为一个文件路径名。比如设置为"./dist/main.js"，则输出的文件为一个main.js文件。但是要注意，只有设置module的值为amd和system模块时才支持这个配置 */
    "outDir": "./",                        /* outDir用来指定输出文件夹，值为一个文件夹路径字符串，输出的文件都将放置在这个文件夹 */
    "rootDir": "./",                       /* 用来指定编译文件的根目录，编译器会在根目录查找入口文件，如果编译器发现以rootDir的值作为根目录查找入口文件并不会把所有文件加载进去的话会报错，但是不会停止编译 */
    "composite": true,                     /* 是否编译构建引用项目  */
    "incremental": true,                   /* 是否启用增量编译*/
    "tsBuildInfoFile": "./",               /* 指定文件用来存储增量编译信息 */
    "removeComments": true,                /* removeComments的值为true或false，用于指定是否将编译后的文件中的注释删掉，设为true的话即删掉注释，默认为false */
    "noEmit": true,                        /* 不生成编译文件，这个一般比较少用 */
    "importHelpers": true,                 /* importHelpers的值为true或false，指定是否引入tslib里的辅助工具函数，默认为false */
    "downlevelIteration": true,            /* 当target为'ES5' or 'ES3'时，为'for-of', spread, and destructuring'中的迭代器提供完全支持 */
    "isolatedModules": true,               /* isolatedModules的值为true或false，指定是否将每个文件作为单独的模块，默认为true，它不可以和declaration同时设定 */
    "newLine": "lf",                       /* 指定换行符。可选`crlf`和`LF`两种 */

    /* Strict Type-Checking Options */
    "strict": true /* strict的值为true或false，用于指定是否启动所有类型检查，如果设为true则会同时开启下面这几个严格类型检查，默认为false */,
    "noImplicitAny": true,                 /* noImplicitAny的值为true或false，如果我们没有为一些值设置明确的类型，编译器会默认认为这个值为any，如果noImplicitAny的值为true的话。则没有明确的类型会报错。默认值为false */
    "strictNullChecks": true,              /* strictNullChecks为true时，null和undefined值不能赋给非这两种类型的值，别的类型也不能赋给他们，除了any类型。还有个例外就是undefined可以赋值给void类型 */
    "strictFunctionTypes": true,           /* strictFunctionTypes的值为true或false，用于指定是否使用函数参数双向协变检查 */
    "strictBindCallApply": true,           /* 设为true后会对bind、call和apply绑定的方法的参数的检测是严格检测的 */
    "strictPropertyInitialization": true,  /* 设为true后会检查类的非undefined属性是否已经在构造函数里初始化，如果要开启这项，需要同时开启strictNullChecks，默认为false */
   "noImplicitThis": true,                /* 当this表达式的值为any类型的时候，生成一个错误 */
    "alwaysStrict": true,                  /* alwaysStrict的值为true或false，指定始终以严格模式检查每个模块，并且在编译之后的js文件中加入"use strict"字符串，用来告诉浏览器该js为严格模式 */

    /* Additional Checks */
    "noUnusedLocals": true,                /* 用于检查是否有定义了但是没有使用的变量，对于这一点的检测，使用eslint可以在你书写代码的时候做提示，你可以配合使用。它的默认值为false */
    "noUnusedParameters": true,            /* 用于检查是否有在函数体中没有使用的参数，这个也可以配合eslint来做检查，默认为false */
    "noImplicitReturns": true,             /* 用于检查函数是否有返回值，设为true后，如果函数没有返回值则会提示，默认为false */
    "noFallthroughCasesInSwitch": true,    /* 用于检查switch中是否有case没有使用break跳出switch，默认为false */

    /* Module Resolution Options */
    "moduleResolution": "node",            /* 用于选择模块解析策略，有'node'和'classic'两种类型' */
    "baseUrl": "./",                       /* baseUrl用于设置解析非相对模块名称的基本目录，相对模块不会受baseUrl的影响 */
    "paths": {},                           /* 用于设置模块名称到基于baseUrl的路径映射 */
    "rootDirs": [],                        /* rootDirs可以指定一个路径列表，在构建时编译器会将这个路径列表中的路径的内容都放到一个文件夹中 */
    "typeRoots": [],                       /* typeRoots用来指定声明文件或文件夹的路径列表，如果指定了此项，则只有在这里列出的声明文件才会被加载 */
    "types": [],                           /* types用来指定需要包含的模块，只有在这里列出的模块的声明文件才会被加载进来 */
    "allowSyntheticDefaultImports": true,  /* 用来指定允许从没有默认导出的模块中默认导入 */
    "esModuleInterop": true /* 通过为导入内容创建命名空间，实现CommonJS和ES模块之间的互操作性 */,
    "preserveSymlinks": true,              /* 不把符号链接解析为其真实路径，具体可以了解下webpack和nodejs的symlink相关知识 */

    /* Source Map Options */
    "sourceRoot": "",                      /* sourceRoot用于指定调试器应该找到TypeScript文件而不是源文件位置，这个值会被写进.map文件里 */
    "mapRoot": "",                         /* mapRoot用于指定调试器找到映射文件而非生成文件的位置，指定map文件的根路径，该选项会影响.map文件中的sources属性 */
    "inlineSourceMap": true,               /* 指定是否将map文件的内容和js文件编译在同一个js文件中，如果设为true，则map的内容会以//# sourceMappingURL=然后拼接base64字符串的形式插入在js文件底部 */
    "inlineSources": true,                 /* 用于指定是否进一步将.ts文件的内容也包含到输入文件中 */

    /* Experimental Options */
    "experimentalDecorators": true /* 用于指定是否启用实验性的装饰器特性 */
    "emitDecoratorMetadata": true,         /* 用于指定是否为装饰器提供元数据支持，关于元数据，也是ES6的新标准，可以通过Reflect提供的静态方法获取元数据，如果需要使用Reflect的一些方法，需要引入ES2015.Reflect这个库 */
  }
  "files": [], // files可以配置一个数组列表，里面包含指定文件的相对或绝对路径，编译器在编译的时候只会编译包含在files中列出的文件，如果不指定，则取决于有没有设置include选项，如果没有include选项，则默认会编译根目录以及所有子目录中的文件。这里列出的路径必须是指定文件，而不是某个文件夹，而且不能使用* ? **/ 等通配符
  "include": [],  // include也可以指定要编译的路径列表，但是和files的区别在于，这里的路径可以是文件夹，也可以是文件，可以使用相对和绝对路径，而且可以使用通配符，比如"./src"即表示要编译src文件夹下的所有文件以及子文件夹的文件
  "exclude": [],  // exclude表示要排除的、不编译的文件，它也可以指定一个列表，规则和include一样，可以是文件或文件夹，可以是相对路径或绝对路径，可以使用通配符
  "extends": "",   // extends可以通过指定一个其他的tsconfig.json文件路径，来继承这个配置文件里的配置，继承来的文件的配置会覆盖当前文件定义的配置。TS在3.2版本开始，支持继承一个来自Node.js包的tsconfig.json配置文件
  "compileOnSave": true,  // compileOnSave的值是true或false，如果设为true，在我们编辑了项目中的文件保存的时候，编辑器会根据tsconfig.json中的配置重新生成文件，不过这个要编辑器支持
  "references": [],  // 一个对象数组，指定要引用的项目
}
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.typescriptlang.org/play/
https://zhuanlan.zhihu.com/p/443995763
https://zhuanlan.zhihu.com/p/353156044
https://segmentfault.com/q/1010000040197076
https://www.cnblogs.com/terrymin/p/13897214.html
https://www.cnblogs.com/wangleicode/p/10937707.html
https://blog.csdn.net/qq_43869822/article/details/121664818
https://tslang.baiqian.ltd/release-notes/typescript-2.7.html
https://www.typescriptlang.org/docs/handbook/utility-types.html
https://levelup.gitconnected.com/intrinsic-types-in-typescript-8b9f814410d
https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html
https://github.com/xcatliu/typescript-tutorial/blob/master/basics/declaration-files.md
```
