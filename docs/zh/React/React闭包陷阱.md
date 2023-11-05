# React闭包陷阱
`React Hooks`是`React 16.8`引入的一个新特性，其出现让`React`的函数组件也能够拥有状态和生命周期方法，其优势在于可以让我们在不编写类组件的情况下，更细粒度地复用状态逻辑和副作用代码，但是同时也带来了额外的心智负担，闭包陷阱就是其中之一。

## 闭包
从`React`闭包陷阱的名字就可以看出来，我们的问题与闭包引起的，那么闭包就是我们必须要探讨的问题了。函数和对其词法环境`lexical environment`的引用捆绑在一起构成闭包，也就是说，闭包可以让你从内部函数访问外部函数作用域。在`JavaScript`，函数在每次创建时生成闭包。在本质上，闭包是将函数内部和函数外部连接起来的桥梁。通常来说，一段程序代码中所用到的名字并不总是有效或可用的，而限定这个名字的可用性的代码范围就是这个名字的作用域`scope`，当一个方法或成员被声明，他就拥有当前的执行上下文`context`环境，在有具体值的`context`中，表达式是可见也都能够被引用，如果一个变量或者其他表达式不在当前的作用域，则将无法使用。作用域也可以根据代码层次分层，以便子作用域可以访问父作用域，通常是指沿着链式的作用域链查找，而不能从父作用域引用子作用域中的变量和引用。

为了定义一个闭包，首先需要一个函数来套一个匿名函数。闭包是需要使用局部变量的，定义使用全局变量就失去了使用闭包的意义，最外层定义的函数可实现局部作用域从而定义局部变量，函数外部无法直接访问内部定义的变量。从下边这个例子中我们可以看到定义在函数内部的`name`变量并没有被销毁，我们仍然可以在外部使用函数访问这个局部变量，使用闭包，可以把局部变量驻留在内存中，从而避免使用全局变量，因为全局变量污染会导致应用程序不可预测性，每个模块都可调用必将引来灾难。

```JavaScript
const Student = () => {
    const name = "Ming";
    const sayMyName = function(){ // `sayMyName`作为内部函数，有权访问父级函数作用域`Student`中的变量
        console.log(name);
    }
    console.dir(sayMyName); // ... `[[Scopes]]: Scopes[2] 0: Closure (student) {name: "Ming"} 1: Global` ...
    return sayMyName; // `return`是为了让外部能访问闭包，挂载到`window`对象实际效果是一样的
}
const stu = Student(); 
stu(); // `Ming`

```

实际开发中使用闭包的场景有非常多，例如我们常常使用的回调函数。回调函数就是一个典型的闭包，回调函数可以访问父级函数作用域中的变量，而不需要将变量作为参数传递到回调函数中，这样就可以减少参数的传递，提高代码的可读性。在下边这个例子中，我们可以看到`local`这个变量是局部的变量，`setTimeout`进行调用的词法作用域是全局的作用域，理论上是无法访问`local`这个局部变量的，但是我们采用了闭包的方式创建了一个能够访问内部局部变量的函数，所以这个变量的值能够被正常打印。如果我们类似于第二个`setTimeout`直接将参数传递也是可以的，但是如果我们在这里封装了很多逻辑，那么这个参数传递就变得比较复杂了，根据实际情况用闭包可能会更合适一些。

```js
const cb = () => {
  const local = 1;
  return () => {
    console.log(local);
  };
}

setTimeout(cb(), 1000); // 1
setTimeout(console.log, 2000, 2); // 2
```

我们可以再看一个例子，我们在写`Node`时可能会遇到一个场景，在调用其他第三方服务接口的时候会会被限制频率，比如对于该接口`1s`最多请求`3`次，此时我们通常有两种解决方案，一种方案是在请求的时候就限制发起请求的频率，直接在发起的时候就控制好，被限频的请求需要排队，另一种方案是不限制发起请求的频率，而是采用一种基于重试的机制，当请求的结果是被限频的时候，我们就延迟一段时间再次发起请求，可以用指数退避算法等方式来控制重试时间，实际上以太网在拥堵的时候就采用了这种方法，每次发生碰撞后，设备会根据指数退避算法来计算等待时间，等待时间会逐渐增加，从而降低了设备再次发生碰撞的概率。

在这里我们需要关注第二种方案中如何进行重试，我们在发起请求的时候通常会携带比较多的信息，比如`url`、`token`、`body`等数据进行查询，如果我们需要进行重试，那么肯定需要找个地方把这些数据存储下来以备下次发起请求，那么在何处存储这些变量呢，当然我们可以在`global/window`中构造一个全局的对象来存储，但是之前也提到过了全局变量污染会导致应用程序不可预测性，所以在这里我们更希望用闭包来进行存储。在下边这个例子中我们就使用了闭包来存储了请求时的一些信息，并且在重试时保证了这些信息是最初定义时的信息，这样就不需要污染全局变量，而且需要对于业务调用来说，我们可以再包装一侧`requestWithLimit`，当内部的请求正常完整之后才会`Resolve Promise`，将这部分重试机制封装到内部会更加易用。

```js
const requestFactory = (url, token) => {
  return function request(){ // 假设这个函数会发起请求并且返回结果
    return { url, token };
  }
}

const req1 = requestFactory("url1", "token1");
console.log(req1()); // 发起请求 `{url: 'url1', token: 'token1'}`
console.log(req1()); // 重试请求 `{url: 'url1', token: 'token1'}`
const req2 = requestFactory("url2", "token2");
console.log(req2()); // 发起请求 `{url: 'url2', token: 'token2'}`
console.log(req2()); // 重试请求 `{url: 'url2', token: 'token2'}`
```

`Js`是静态作用域，但是`this`对象却是个例外，`this`的指向问题就类似于动态作用域，其并不关心函数和作用域是如何声明以及在何处声明的，只关心是从何处调用的，`this`的指向在函数定义的时候是确定不了的，只有函数执行的时候才能确定`this`到底指向谁，当然实际上`this`的最终指向的是那个调用的对象。`this`的设计主要是为了能够在函数体内部获得当前的运行环境`context`，因为在`Js`的内存设计中`Function`是独立的一个堆地址空间，不和`Object`直接相关，所以才需要绑定一个运行环境。

前边提到了词法作用域是在定义时就确定了，所以词法作用域也可以称为静态作用域。那么我们可以看下下边的例子，这个例子是不是很像我们的`React Hooks`来定义的组件。运行这个例子之后，我们可以看到虽然对于这个函数执行起来看起来都是是完全一样的，但是最后打印的时候得到的值是得到了之前作用域中的值。我们现在需要关注的是`fn`这个函数，我们我们说的定义时确定词法作用域这句话具体指的是这个函数被声明并定义的时候确定词法作用域，或者说是在生成函数地址的时候确定词法作用域。其实但从这个例子看起来好像没什么问题，本来就是应该这个样子的，那么为什么要举这个例子呢，其实在这里想表达的意思是，如果我们在写代码的时候不小心保持了之前的`fn`函数地址，那么虽然我们希望得到的`index`是`5`，但是实际拿到的`index`却是`1`，这其实就是所谓的闭包陷阱了，我们在下边探讨`React`的时候也可以通过这个例子理解`React`的视图模型。

```js
const collect = [];

const View = (props) => {
  const index = props.index;

  const fn = () => {
    console.log(index);
  }

  collect.push(fn);

  return index;
}

for(let i=0; i<5; ++i){
  View({index: i + 1});
}

collect.forEach(fn => fn()); // 1 2 3 4 5
```

## 闭包陷阱
说到这陷阱，不由得想起来一句话，出门出门就上当，当当当当不一样，平时开发的时候可以说是一不小心就上当掉入了陷阱。那么我们这个陷阱是完全由闭包引起的吗，那肯定不是，这只是`Js`的语言特性而已，那么这个陷阱是完全由`React`引起的吗，当然也不是，所以接下来我们就要来看看为什么需要闭包和`React`结合会引发这个陷阱。

首先我们要考虑下`React`渲染视图的机制，我们可以想一下，`React`是没有模版的，类似于`Vue`的`template`这部分，那么也就是说`React`是很难去拿到我们希望渲染的视图，就更不用谈去做分析了。那么在`Hooks`中应该如何拿到视图再去更新`DOM`结构呢，很明显我们实际上只需要将这个`Hooks`执行一遍即可，无论你定义了多少分支多少条件，我只要执行一遍最后取得返回值不就可以拿到视图了嘛。同时也是因为`React`渲染视图非常的灵活，从而不得不这样搞，`Vue`不那么灵活但是因为模版的存在可以做更多的优化，这实际上还是个取舍问题。不过这不是我们讨论的重点，既然我们了解到了`React`的渲染机制，而且在上边我们举了一个函数多次运行的示例，那么在这里我们举一个组件多次执行的示例，

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/multi-count.tsx
import React, { useState } from "react";

const collect: (() => number)[] = [];

export const MultiCount: React.FC = () => {
  const [count, setCount] = useState(0);

  const click = () => {
    setCount(count + 1);
  };

  collect.push(() => count);

  const logCollect = () => {
    collect.forEach((fn) => console.log(fn()));
  };

  return (
    <div>
      <div>{count}</div>
      <button onClick={click}>count++</button>
      <button onClick={logCollect}>log {">>"} collect</button>
    </div>
  );
};
```

我们首先点击三次`count++`这个按钮，此时我们的视图上的内容是`3`，但是此时我们点击`log >> count`这个按钮的时候，发现在控制台打印的内容是`0 1 2 3`，这其实就是跟前边的例子一样，因为闭包`+`函数的多次执行造成的问题，因为实际上`Hooks`实际上无非就是个函数，`React`通过内置的`use`为函数赋予了特殊的意义，使得其能够访问`Fiber`从而做到数据与节点相互绑定，那么既然是一个函数，并且在`setState`的时候还会重新执行，那么在重新执行的时候，点击按钮之前的`add`函数地址与点击按钮之后的`add`函数地址是不同的，因为这个函数实际上是被重新定义了一遍，只不过名字相同而已，从而其生成的静态作用域是不同的，那么这样便可能会造成所谓的闭包陷阱。

其实关于闭包陷阱的问题，大部分都是由于依赖更新不及时导致的，例如`useEffect`、`useCallback`的依赖定义的不合适，导致函数内部保持了对上一次组件刷新时定义的作用域，从而导致了问题。例如下边这个例子，我们的`useEffect`绑定的事件依赖是`count`，但是我们在点击`count++`的时候，实际上`useEffect`要执行的函数并没有更新，所以其内部的函数依然保持了上一次的作用域，从而导致了问题。

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/bind-event.tsx
import { useEffect, useRef, useState } from "react";

export const BindEventCount: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);

  const add = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    const el = ref1.current;
    const handler = () => console.log(count);
    el?.addEventListener("click", handler);
    return () => {
      el?.removeEventListener("click", handler);
    };
  }, []);

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
      </div>
    </div>
  );
};
```

当我们多次点击`count++`按钮之后，再去点击`log count 1`按钮，发现控制台输出的内容还是`0`，这就是因为我们的`useEffect`保持了旧的函数作用域，而那个函数作用的`count`为`0`，那么打印的值当然就是`0`，同样的`useCallback`也会出现类似的问题，解决这个问题的一个简单的办法就是在依赖数组中加入`count`变量，当`count`发生变化的时候，就会重新执行`useEffect`，从而更新函数作用域。那么问题来了，这样就能解决所有问题吗，显然是不能的，副作用依赖可能会造成非常长的函数依赖，可能会导致整个项目变得越来越难以维护，关于事件绑定的探讨可以研究下前边 `Hooks`与事件绑定 这篇文章。

那么有没有什么好办法解决这个问题，那么我们就需要老朋友`useRef`了，`useRef`是解决闭包问题的万金油，其能存储一个不变的引用值。设想一下我们只是因为读取了旧的作用域中的内容而导致了问题，如果我们能够得到一个对象使得其无论更新了几次作用域，我们都能够保持对同一个对象的引用，那么更新之后直接取得这个值不就可以解决这个问题了嘛。在`React`中我们就可以借助`useRef`来做到这点，通过保持对象的引用来解决上述的问题。

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/use-ref.tsx
import { useEffect, useRef, useState } from "react";

export const RefCount: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);
  const refCount = useRef<number>(count);

  const add = () => {
    setCount(count + 1);
  };

  refCount.current = count;
  useEffect(() => {
    const el = ref1.current;
    const handler = () => console.log(refCount.current);
    el?.addEventListener("click", handler);
    return () => {
      el?.removeEventListener("click", handler);
    };
  }, []);

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
      </div>
    </div>
  );
};
```

同样的，当我们多次点击`count++`按钮之后，再去点击`log count 1`按钮，发现控制台输出的内容就是最新的`count`值了而不是跟上边的例子一样一直保持`0`，这就是通过在`Hooks`中保持了同一个对象的引用而实现的。通过`useRef`我们就可以封装自定义`Hooks`来完成相关的实现，例如有必要的话可以实现一个`useRefState`，将`state`和`ref`一并返回，按需取用。再比如下边这个`ahooks`实现的`useMemoizedFn`，第一个`ref`保证永远是同一个引用，也就是说返回的函数永远指向同一个函数地址，第二个`ref`用来保存当前传入的函数，这样发生`re-render`的时候每次创建新的函数我们都将其更新，也就是说我们即将调用的永远都是最新的那个函数。由此通过两个`ref`我们就可以保证两点，第一点是无论发生多少次`re-render`，我们返回的都是同一个函数地址，第二点是无论发生了多少次`re-render`，我们即将调用的函数都是最新的。

```js
type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current as T;
}
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/6844904193044512782
https://juejin.cn/post/7119839372593070094
http://www.ferecord.com/react-hooks-closure-traps-problem.html
```
