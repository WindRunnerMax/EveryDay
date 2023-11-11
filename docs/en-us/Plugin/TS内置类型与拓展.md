# Built-in Types and Extensions in TS

`TypeScript` has a type system and it's also a superset of `JavaScript`. It can be compiled into regular `JavaScript` code, meaning it's `JavaScript` with type checking.

## Built-in Types
`TypeScript` provides several utility types to facilitate common type transformations, and these types are available globally. The `TypeScript Playground` at `https://www.typescriptlang.org/play` offers the ability to compile `TS` online. Here's a neat trick: if we've written a complex type in the `Playground` and want to see the intermediate types in the type inference process, we can use the `//  ^?` marker to directly see the related type definitions in the `Playground`.

```js
type Instance = Record<string | symbol, number>;
type InstanceKey = keyof Instance;
//  ^? type InstanceKey = string | symbol
type InstanceValue = Instance[keyof Instance];
//  ^? type InstanceValue = number

// [Playground link](https://www.typescriptlang.org/play?#code/C4TwDgpgBAkgdgZ2AQzgY2gXigJQmgewCcATAHiSIEs4BzKAHygRAFsAjAgGwBoo4ArhwhEAfAG4AUKEixEKdBADSEEFGwBrVQQBmcpKgxSA9MahQAegH5p4aPAOKAasi4Cs+hRgDaWkLs9DCABdEzNLGyA)
```

### Partial
`Partial<Type>` constructs a type where all properties of `Type` are made optional.

```js
/**
 * Make all properties in T optional
 */

type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

```js
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
```

### Required
`Required<Type>` constructs a type where all properties of `Type` are made `required`, opposite to the functionality of `Partial<Type>`.

```js
/**
 * Make all properties in T required
 */

type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

```js
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
```

### Readonly
`Required<Type>` constructs a type where all properties of `Type` are made `readonly`, meaning the properties of the constructed type are read-only and cannot be modified, which is very useful for objects used with `Object.freeze()`.

```js
/**
 * Make all properties in T readonly
 */

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

```js
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
```

### Record
`Record<Keys, Type>` constructs an object type where the property keys are of type `Keys` and the property values are of type `Type`. Typically, `Record` is used to represent an object.

```js
/**
 * Construct a type with a set of properties K of type T
 */

type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

```js
type RecordType = Record<string, string|number>;
```

```typescript
const recordExample: RecordType ={
  a: 1,
  b: "1"
}
```

### Pick
The `Pick<Type, Keys>` constructs a type by selecting a set of properties `Keys` from the `Type`.

```typescript
/**
 * From T, pick a set of properties whose keys are in the union K
 */

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

```typescript
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
The `Omit<Type, Keys>` constructs a type by selecting all the properties from `Type` and then removing `Keys`, opposite to the functionality of `Pick<Type, Keys>`.

```typescript
/**
 * Construct a type with the properties of T except for those in type K.
 */

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

```typescript
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
The `Exclude<UnionType, ExcludedMembers>` constructs a type by excluding all union members assignable to `ExcludedMembers` from the `UnionType`.

```typescript
/**
 * Exclude from T those types that are assignable to U
 */

type Exclude<T, U> = T extends U ? never : T;
```

```typescript
type ExcludeExample = Exclude<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExcludeExample
 * "c" | "z"
 */
```

### Extract
The `Extract<Type, Union>` constructs a type by extracting all union members assignable to `Union` from the `Type`, opposite to the functionality of `Exclude<UnionType, ExcludedMembers>`.

```typescript
/**
 * Extract from T those types that are assignable to U
 */

type Extract<T, U> = T extends U ? T : never;
```

```typescript
type ExtractExample = Extract<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExtractExample
 * "a" | "b"
 */
```

### NonNullable
The `NonNullable<Type>` constructs a type by excluding `null` and `undefined` from the `Type`.

```typescript
/**
 * Exclude null and undefined from T
 */

type NonNullable<T> = T extends null | undefined ? never : T;
```

```typescript
type NonNullableExample = NonNullable<number|string|null|undefined>;

/**
 * NonNullableExample
 * string | number
 */
```

### Parameters
The `Parameters<Type>` constructs a tuple type from the types used as parameters in the function type `Type`.

```typescript
/**
 * Obtain the parameters of a function type in a tuple
 */

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

```typescript
type FnType = (a1: number, a2: string) => void;

type ParametersExample = Parameters<FnType>;
```

```markdown
/**
 * ParametersExample
 * [a1: number, a2: string]
 */
```

### ConstructorParameters
`ConstructorParameters<Type>` constructs a tuple or array type from the parameter types of a constructor function type, producing a tuple type containing all parameter types.

```js
/**
 * Obtain the parameters of a constructor function type in a tuple
 */

type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
```

```js
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
`ReturnType<Type>` constructs a type consisting of the return type of the function `Type`.

```js
/**
 * Obtain the return type of a function type
 */

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

```js
type FnType = (a1: number, a2: string) => string | number;

type ReturnTypeExample = ReturnType<FnType>;

/**
 * ReturnTypeExample
 * string | number
 */
```

### InstanceType
`InstanceType<Type>` constructs a type consisting of the instance type of the constructor function in `Type`.

```js
/**
 * Obtain the return type of a constructor function type
 */

type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
```

```js
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
`ThisParameterType<Type>` extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.

```js
/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.
 */

type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
```

```js
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
The `OmitThisParameter<Type>` removes the `this` parameter from `Type`. If `Type` doesn't explicitly declare this parameter, the result is just `Type`; otherwise, it creates a new function type from `Type` that doesn't include this parameter. The generics are removed, and only the last overloaded signature is propagated to the new function type.

```js
/**
 * Removes the 'this' parameter from a function type.
 */

type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;
```

```js
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
The `ThisType<Type>` can be used to type `this` in object literals and provide a convenient way to control the `this` type through context types. It is only effective when the `--noImplicitThis` option is used.

```js
/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }
```

```js
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
The `Uppercase<StringType>` converts `StringType` to uppercase, and in `TS`, the built-in keyword `intrinsic` is used for compile-time implementation.

```js
/**
 * Convert string literal type to uppercase
 */

type Uppercase<S extends string> = intrinsic;
```

```js
type UppercaseExample = Uppercase<"abc">;

/**
 * UppercaseExample
 * ABC
 */
```

### Lowercase
The `Lowercase<StringType>` converts `StringType` to lowercase.

```js
/**
 * Convert string literal type to lowercase
 */

type Lowercase<S extends string> = intrinsic;
```

```js
type LowercaseExample = Lowercase<"ABC">;

/**
 * LowercaseExample
 * abc
 */
```

### Capitalize
The `Capitalize<StringType>` capitalizes the first letter of `StringType`.

```js
/**
 * Convert first character of string literal type to uppercase
 */

type Capitalize<S extends string> = intrinsic;
```

```js
type CapitalizeExample = Capitalize<"abc">;

/**
 * CapitalizeExample
 * Abc
 */
```

### Uncapitalize
The `Uncapitalize<StringType>` converts the first letter of `StringType` to lowercase.

```js
/**
 * Convert first character of string literal type to lowercase
 */

type Uncapitalize<S extends string> = intrinsic;
```

```js
type UncapitalizeExample = Uncapitalize<"ABC">;

/**
 * CapitalizeExample
 * aBC
 */
```

## Expansion
Some common syntax and concepts in `TypeScript`.

### Generics

Generics refers to a feature in which the specific type is not specified in advance when defining a function, interface, or class, but is specified when used. For example, if you need to implement a function that generates an array filled with default values, the type of the array does not need to be specified in advance, and can be specified when used. Of course, in this case, using `new Array` and `fill` functions achieves the same effect.

```js
function createArray<T>(value: T, length: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < length; i++) {
      result[i] = value;
  }
  return result;
}

console.log(createArray<number>(1, 3)); // It can also automatically infer `number` without explicitly specifying
```

We can also constrain the type of `T` to only `number` and `string`.

```js
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

Multiple types can also be mutually constrained, for example the `Pick` above, where `K` must be a subset of `key` in `T`.

```js
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

Defaults can be specified for `T` when passing generics, and writing classes using generics, known as generic classes, is also fully supported.

```js
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

### Type Assertion

Type assertion can be used to manually specify the type of a value. Due to the potential conflict with `TSX`, the syntax `<Type>value` is not commonly used, and instead, `value as Type` is preferred. Usually, when TypeScript is uncertain about the type of a variable in a union type, we can only access the common properties or methods of all types in the union type.

```js
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

Sometimes, however, it is necessary to access properties or methods specific to one type even when the type is not yet determined.

```js
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

In the example above, accessing `animal.swim` will cause an error. In this case, type assertion can be used to assert `animal` as `Fish`. However, it is important to note that while type assertion can deceive the TypeScript compiler, it cannot prevent runtime errors. Misusing type assertion may lead to runtime errors.

```js
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

A single assertion `value as Type` has certain conditions. When type `S` is a subset of type `T`, or type `T` is a subset of type `S`, `S` can be successfully asserted as `T`. This is to provide additional safety when making type assertions. It is dangerous to make completely baseless assertions. If you want to do this, you can use `any`.
If you believe that a value `value` must be of a certain type `Type`, and a single assertion cannot satisfy this requirement, you can use double assertion, i.e., `value as unknown as Type`. Using `value as any as Type` has the same effect, but if you use a double assertion, it can break the restriction that requires `A` to be asserted as `B` only if `A` is compatible with `B` or vice versa, allowing any type to be asserted as any other type. Generally speaking, do not use double assertion unless absolutely necessary.
In addition, type assertions are not referred to as type conversions because type conversions usually imply some kind of runtime support, whereas type assertions only affect the type at compile time in TypeScript. Type assertion statements are removed in the compiled result, meaning that type assertion is purely a compile-time syntax and also a way to provide the compiler with information on how to analyze the code.
There is also an expression related to type assertions, `!`, which was introduced in TypeScript 2.7, and is called `definite assignment assertion`. Definite assignment assertion allows you to add an exclamation mark `!` after an instance property or variable declaration to tell TypeScript that the variable has indeed been assigned a value, even if TypeScript cannot infer this result.

```js
let x: number;
let y!: number;
console.log(x + x); // Variable 'x' is used before being assigned.(2454)
console.log(y + y); // ok
```

Since we mentioned `!`, we can also talk about `?`. In an `interface`, `?` and `undefined` are not equivalent. In the example below, when `b` is not declared with `?` in the `interface`, it is `required`. TypeScript considers it a must-specify `key` even if its value can only be `undefined`.

```js
interface Example{
  a?: number;
  b: undefined;
}

const example1: Example = {}; // Property 'b' is missing in type '{}' but required in type 'Example'.(2741)
const example2: Example = { b: undefined }; // ok
```

### infer
`infer` is used as a placeholder for the type variable to be inferred in the `extends` conditional statement, or when used for inference. For example, the `ReturnType` above is inferred through `infer`. It first constrains a generic to a function type, and then infers it using `infer`.

```js
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

There are some applications, such as converting a `tuple` to a `union`, such as `[string, number, symbol] -> string | number | symbol`.

```js
type ElementOf<T> = T extends Array<infer E> ? E : never;

type TTuple = [string, number, symbol];

type ToUnion = ElementOf<TTuple>; // string | number | symbol
```

There is also a more peculiar implementation.

```js
type TTuple = [string, number, symbol];
type Res = TTuple[number]; // string | number | symbol

// https://stackoverflow.com/questions/44480644/string-union-to-string-array/45486495#45486495
```

For example, getting the type of the first parameter of a function.

```js
type fn = (a: number, b: string, ddd: boolean) => void;

type FirstParameter<T> = T extends (args1: infer R, ...rest: any[]) => any ? R : never;
```

```javascript
type firstArg = FirstParameter<fn>;  // number
```

### Function Overload
`TypeScript` allows you to declare function overloads, which means that a function can accept different numbers or types of parameters and react differently. Of course, it's crucial that the final declaration seen inside the function is truly compatible with all overloads. This is because the nature of the function call is what the function body needs to consider.

```js
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

Here's a practical and simple example: the `Date` object on `iOS` does not accept strings in the format of `2022-04-05 20:00:00` for parsing. When executed in the `Safari` console, some abnormal behavior occurs. Parsing this string in the Chrome browser or on Android doesn't cause any problems, so some compatibility processing is needed.

```javascript
// safari
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // NaN

// chrome
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // 2
```

Therefore, a simple compatibility check needs to be made for the date and time objects, while ensuring the declaration of `TS`. This can be done using function overloads and other methods.

```js
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
        // Building without parameters
        return new Date();
    } else if (p1 instanceof Date || (typeof p1 === "number" && p2 === void 0)) {
        // The first parameter is `Date` or `Number` and there is no second parameter
        return new Date(p1);
    } else if (typeof p1 === "number" && typeof p2 === "number") {
        // Both the first and second parameters are `Number`
        return new Date(p1, p2, p3 || 1, p4 || 0, p5 || 0, p6 || 0, p7 || 0);
    } else if (typeof p1 === "string") {
        // The first parameter is `String`
        return new Date(p1.replace(/-/g, "/"));
    }
    throw new Error("No suitable parameters");
}

console.log(safeDate("2022-04-05 20:00:00").getDay()); // 2
```


```js
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

### Declaration Files

There are several syntaxes for declaring global variables:

* `declare var` declares global variables.
* `declare function` declares global functions.
* `declare class` declares global classes.
* `declare enum` declares global enum types.
* `declare namespace` declares global objects with subproperties.
* `interface` and `type` declare global types.
* `declare module` extends declarations.

We can use the `declare` keyword to inform TypeScript about certain variables or objects that have been declared, and we can choose to place these declarations in `.ts` or `.d.ts` files. `declare namespace` indicates that a global variable is an object containing many subproperties.

```js
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

For module declaration files, there are several syntaxes:

* `export` exports variables.
* `export namespace` exports objects with subproperties.
* `export default ES6` default export.
* `export = ` exports `CommonJs` modules.

Module declaration files are significantly different from global variable declaration files. In module declaration files, using `declare` will no longer declare a global variable, but only a local variable in the current file. The type declarations will be applied only when exported in the declaration file, imported in the using file, and `export {}` is often explicitly used when trying to use a module declaration file without actual exports. For module declaration files, we highly recommend using the `ES6` standard's `export default` and `export`.

```js
// xxx.ts
export const name: string = "1";

// xxxxxx.ts
import { name } from "xxx.ts";
console.log(name); // 1 // typeof name === "string"
```

If you need to extend the original module, you need to reference the original module in the type declaration file and then use `declare module` to extend it.

```js
// xxx.d.ts
import * as moment from "moment";

declare module "moment" {
    export function foo(): moment.CalendarKey;
}

// xxx.ts
import * as moment from "moment";
moment.foo();
```

```js
import Vue from "vue";

declare module "vue/types/vue" {
    interface Vue {
        copy: (str: string) => void;
    }
}
```

There are also declarations for files such as `.vue`, `.css`, and `.scss`, where the types of their imported objects need to be declared globally.

```js
declare module "*.vue" {
    import Vue from "vue/types/vue";
    export default Vue;
}
```

```js
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

```js
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

In declaration files, you can also import another declaration file using triple-slash directive `///`. In global variable declaration files, the use of `import` and `export` keywords is not allowed. If they are used, it will be treated as a module or a `UMD` library, and it will no longer be a declaration file for global variables. Therefore, when writing a declaration file for a global variable and needing to reference types from another library, a triple-slash directive must be used.

```js
// types/jquery-plugin/index.d.ts
/// <reference types="jquery" />
declare function foo(options: JQuery.AjaxSettings): string;

// src/index.ts
foo({});
```

### Covariance and Contravariance
Subtyping is a complex topic in programming theory, and its complexity comes from a pair of phenomena that are often confused. Simply put, covariance means type convergence, contravariance means type divergence. In the following example, we will discuss this issue and demonstrate that the subtype in TypeScript is `OK`.

```js
type SuperType = (value: number|string) => number|string; // Super type
type SubType = (value: number|string|boolean) => number; // Sub type - Contravariant in parameters, Covariant in return type

const subFn: SubType = (value: number|string|boolean) => 1;
const superFn: SuperType = subFn; // ok
```

Let's first discuss the subtype. Obviously, `number` is a subtype of `number|string`, so the example above is completely valid. This is also a process of covariance, which shows that `SubType` in the example is indeed a subtype of `SuperType`.

```js
type SuperType = number|string; // Super type
type SubType = number; // Sub type

const subValue: SubType = 1;
const superValue: SuperType = subValue; // ok
```

Now, let's go back to the previous example. The type of the parameter `value` in this function is quite strange. It seems to be a subtype, but the type variety has increased instead. This is actually what we call contravariance, which is to ensure that type convergence is safe. In this case, our `subFn` actually represents a function of type `SuperType`. When we actually call it, the passed parameter is a subtype of `SuperType`, i.e. `number|string`, which must be a subclass of `SubType`, i.e. `number|string|boolean`. This also ensures the safe convergence of function parameters. After the function is executed and returns a value, since the return type of the function is `number`, the returned value must also be a subclass of `number|string`, thus ensuring the safe convergence of the function's return value. We can understand this function subtype issue through the following call process, achieving safe type convergence.

```js
SuperType parameter -> SubType parameter -> Execute -> SubType return value -> SuperType return value
number|string -> number|string|boolean -> ... -> number -> number|string
```

In summary, except for function parameter types being contravariant, all types are covariant. When assigning one function to another function variable, it is necessary to ensure that the parameter types diverge, i.e. they are smaller than the target type. When the target function is executed, it runs the original function, and the passed parameter type converges to the original function's parameter type. Covariance means type convergence, i.e. the type range is narrowed or unchanged, and contravariance means the opposite. Essentially, it is to ensure that type convergence is safe at execution.

You can also refer to [this article](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html) for a description of covariance and contravariance.

Before starting the article, let's establish the following conventions: `A ≼ B` means `A` is a subtype of `B`; `A → B` denotes a function type with `A` as the parameter type and `B` as the return type; `x: A` means the type of `x` is `A`.
Suppose we have the following types: `Greyhound ≼ Dog ≼ Animal`.
`Greyhound` is a subtype of `Dog`, and `Dog` is a subtype of `Animal`. Since subtypes are generally transitive, we also say that `Greyhound` is a subtype of `Animal`. Now, which of the following types is a subtype of `Dog → Dog`?

1. `Greyhound → Greyhound`.
2. `Greyhound → Animal`.
3. `Animal → Animal`.
4. `Animal → Greyhound`.

Let's think about how to answer this question. First, we assume that `f` is a function with `Dog → Dog` as a parameter, and its return value is not important. For a specific description of the problem, let's assume that the function structure is like this `f: (Dog → Dog) → String`. Now, I want to pass a function `g` to the function `f` for invocation. Let's see what happens when `g` is of the following four types.

1. Suppose `g: Greyhound → Greyhound`, is the type of `f(g)` safe?
   No, it's unsafe, because when calling the parameter `(g)` function inside `f`, the parameter used may be a subtype of Greyhound that is not the same as Greyhound, for example, a German Shepherd.

2. Suppose `g: Greyhound → Animal`, is the type of `f(g)` safe?
   No, it's unsafe, for the same reason as in 1.

3. Suppose `g: Animal → Animal`, is the type of `f(g)` safe?
   No, it's unsafe. Because after calling the parameter, `f` might make the return value, which is an `Animal`, bark like a dog, and not all animals bark like dogs.

4. Suppose `g: Animal → Greyhound`, is the type of `f(g)` safe?
   Yes, it's safe. Firstly, `f` might call with any breed of dog as a parameter, and all dogs are animals. Secondly, it might assume the result to be a dog, and all Greyhounds are indeed dogs.

As mentioned above, we conclude that `(Animal → Greyhound) ≼ (Dog → Dog)`. It's easy to understand that the return value type is covariant, but the parameter type is contravariant. Using appropriate terminology to describe this peculiar behavior, we can say that we allow a function type where the return value type is covariant, and the parameter type is contravariant. Covariance in return value type means that `A ≼ B` implies `(T → A) ≼ (T → B)`, and contravariance in parameter type means that `A ≼ B` implies `(B → T) ≼ (A → T)`, where `A` and `B` have switched positions. An interesting phenomenon is that in TypeScript, the parameter type is bidirectionally covariant, meaning it is both covariant and contravariant, which is not safe. However, you can now fix this issue in TypeScript 2.6 version using the `--strictFunctionTypes` or `--strict` flag.

```json
[The content of tsconfig.json file]
```

```js
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5" /* The target property specifies the output version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */,
    "module": "commonjs" /* Specifies the module standard to use: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */,
    "lib": ["es6", "dom"] /* The lib property specifies the library files to include in the compilation */,
    "allowJs": true,                       /* The allowJs property specifies whether to compile js files, default is false */
    "checkJs": true,                       /* The checkJs property specifies whether to check and report errors in js files, default is false */
    "jsx": "preserve",                     /* Specifies the intended development environment for jsx code: 'preserve', 'react-native', or 'react'. */
    "declaration": true,                   /* The declaration property specifies whether to generate the corresponding ".d.ts" declaration files during compilation. If set to true, a .js file and a declaration file will be generated for each ts file. However, declaration and allowJs cannot be set to true at the same time */
    "declarationMap": true,                /* Specifies whether to generate map files for the .d.ts declaration files */
    "sourceMap": true,                     /* The sourceMap property specifies whether to generate .map files during compilation */
    "outFile": "./",                       /* The outFile property specifies merging output files into one file, its value is a file path name. For example, setting it to "./dist/main.js" will output a main.js file. Note that this configuration is only supported when the module value is amd or system */
    "outDir": "./",                        /* The outDir property specifies the output folder, the value is a folder path string, and the output files will be placed in this folder */
    "rootDir": "./",                       /* Specifies the root directory of the compiled files. The compiler will look for the entry file in the root directory. If the compiler finds that not all files are loaded with the value of rootDir as the root directory to search for the entry file, an error will be reported, but compilation will not stop */
    "composite": true,                     /* Whether to compile referenced projects */
    "incremental": true,                   /* Whether to enable incremental compilation */
    "tsBuildInfoFile": "./",               /* Specifies the file to store incremental compilation information */
    "removeComments": true,                /* The removeComments property specifies whether to remove comments from the compiled files, true removes comments, default is false */
    "noEmit": true,                        /* Does not generate compiled files, this is generally used less frequently */
    "importHelpers": true,                 /* The importHelpers property sets whether to import the helper functions from tslib, default is false */
    "downlevelIteration": true,            /* Provides full support for iterators in 'for-of', spread, and destructuring when the target is 'ES5' or 'ES3' */
    "isolatedModules": true,               /* The isolatedModules property specifies whether to treat each file as a separate module, default is true, and it cannot be set simultaneously with declaration */
    "newLine": "lf",                       /* Specifies the newline character. Two options are 'crlf' and 'LF' */
```

```json
{
  /* Strict Type-Checking Options */
  "strict": true, /* The value of strict is either true or false, specifying whether to enable all type checks. If set to true, the following strict type checks will also be enabled, with the default being false */,
  "noImplicitAny": true, /* The value of noImplicitAny is either true or false. If we don't explicitly set a type for some values, the compiler will default to any. If noImplicitAny is true, it will result in an error for values without an explicit type. The default value is false. */,
  "strictNullChecks": true, /* When strictNullChecks is true, null and undefined values cannot be assigned to non-these two types of values, nor can other types be assigned to them, except for any type. There is also an exception: undefined can be assigned to void type. */,
  "strictFunctionTypes": true, /* The value of strictFunctionTypes is either true or false, specifying whether to use the bidirectional covariant check for function parameters */,
  "strictBindCallApply": true, /* When set to true, the checking of the parameters of the bind, call, and apply bound methods is strict */,
  "strictPropertyInitialization": true, /* When set to true, it will check whether the non-undefined properties of a class have been initialized in the constructor function. To enable this, strictNullChecks must be enabled as well, with the default being false */,
  "noImplicitThis": true, /* Generates an error when the value of the this expression is of type any */,
  "alwaysStrict": true, /* The value of alwaysStrict is either true or false, specifying whether to always check each module in strict mode and add the "use strict" string to the compiled JavaScript file to inform the browser that the JavaScript is in strict mode. */,
  
  /* Additional Checks */
  "noUnusedLocals": true, /* Checks for variables that are defined but not used. For this purpose, ESLint can provide prompts when writing code, and it defaults to false */,
  "noUnusedParameters": true, /* Checks for parameters in the function body that are not used. This can also be checked with ESLint, and defaults to false */,
  "noImplicitReturns": true, /* Checks whether a function has a return value. When set to true, it will prompt if a function does not have a return value, with the default being false */,
  "noFallthroughCasesInSwitch": true, /* Checks whether there are cases in the switch statement that do not use break to exit the switch. Defaults to false */,
  
  /* Module Resolution Options */
  "moduleResolution": "node", /* Selects the module resolution strategy, with two types: 'node' and 'classic' */,
  "baseUrl": "./", /* Specifies the base directory for resolving non-relative module names. Relative modules are not affected by baseUrl */,
  "paths": {}, /* Sets the module name to the path mapping based on baseUrl */,
  "rootDirs": [], /* Specifies a list of paths, and during compilation, the content of the paths in this list will be placed in a folder */,
  "typeRoots": [], /* Specifies the paths for declaration files or folders. If specified, only the declaration files listed here will be loaded */,
  "types": [], /* Specifies the modules to include. Only the declaration files of the modules listed here will be loaded */,
  "allowSyntheticDefaultImports": true, /* Specifies allowing default imports from modules without default exports */,
  "esModuleInterop": true, /* Achieves interoperability between CommonJS and ES modules by creating namespaces for imported content */,
  "preserveSymlinks": true, /* Does not resolve symbolic links to their real paths. To know more about this, refer to the related knowledge of webpack and Node.js symlinks */
}
```

```json
{
  /* Source Map Options */
  "sourceRoot": "", /* sourceRoot is used to specify where the debugger should find TypeScript files instead of the source file location. This value will be written into the .map file. */
  "mapRoot": "", /* The mapRoot is used to specify where the debugger can find the mapping file instead of the output file location. Specifying the root path of the map file will affect the sources property in the .map file. */
  "inlineSourceMap": true, /* Specify whether to compile the content of the map file and the js file into the same js file. If set to true, the content of the map will be inserted at the bottom of the js file in the form of //# sourceMappingURL= followed by a concatenated base64 string. */
  "inlineSources": true, /* Used to specify whether to further include the content of .ts files in the input file. */
  
  /* Experimental Options */
  "experimentalDecorators": true, /* Used to specify whether to enable experimental decorator features. */
  "emitDecoratorMetadata": true, /* Used to specify whether to provide metadata support for decorators. Regarding metadata, it is also a new standard in ES6 and can be obtained through the static methods provided by Reflect. If you need to use some methods provided by Reflect, you need to import the library ES2015.Reflect. */
  
  "files": [], // Files can configure an array list containing the relative or absolute paths of specified files. The compiler will only compile the files listed in files during compilation. If not specified, it depends on whether the include option is set. If there is no include option, it will default to compile files in the root directory and all subdirectories. The paths listed here must be specific files, not a folder, and cannot use *? **/ and other wildcards.
  "include": [], // Include can also specify a list of paths to be compiled, but the difference from files is that the paths here can be folders or files, can use relative and absolute paths, and can use wildcards, such as "./src" meaning to compile all files in the src folder and its subfolders.
  "exclude": [], // Exclude represents the files to be excluded and not compiled. It can also specify a list, with the same rules as include, can be files or folders, can be relative or absolute paths, and can use wildcards.
  "extends": "", // Extends can inherit the configuration in this configuration file by specifying the path of another tsconfig.json file. The configuration from the inherited file will override the configuration defined in the current file. Starting from version 3.2, TS supports inheriting a tsconfig.json configuration file from a Node.js package.
  "compileOnSave": true, // The value of compileOnSave is true or false. If set to true, when we edit files in the project, the editor will regenerate the files based on the configuration in tsconfig.json when saved. However, the editor must support this feature.
  "references": [] // An array of objects specifying the projects to be referenced.
}
```
## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
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