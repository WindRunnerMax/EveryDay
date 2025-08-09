# Js中String对象
`String`全局对象是一个用于字符串或一个字符序列的构造函数。

## 概述
创建一个字符串可以通过字面量的方式，通过字面量创建的字符串变量在调用方法的时候能够自动转化为临时的包装对象，从而能够调用其构造函数的原型中的方法，也可以利用`String`对象生成字符串对象，此外在`ES6`标准还定义了模板字面量用以生成字符串的方式。

```javascript
var s = "s";
console.log(typeof(s)); // string

var s = new String("s");
console.log(typeof(s)); // object

var fill = "0";
var s = `1${fill}1`;
console.log(s); // 101
```

## 属性
* `String.prototype.constructor`: 用于创造对象的原型对象的构造函数。
* `String.prototype.length`: 返回了字符串的长度。

## 方法

### String.fromCharCode()
`String.fromCharCode(num1[, ...[, numN]])`  
`String.fromCharCode()`静态方法返回由指定的`UTF-16`代码单元序列创建的字符串，参数为一系列`UTF-16`代码单元的数字，范围介于`0`到`65535`即`0xFFFF`之间，大于`0xFFFF`的数字将被截断，不进行有效性检查。

```javascript
var s = String.fromCharCode(65, 66, 67);
console.log(s); // ABC
```

### String.fromCodePoint()
`String.fromCodePoint(num1[, ...[, numN]])`  
`String.fromCodePoint()`静态方法返回使用指定的代码点序列创建的字符串，参数为一串`Unicode`编码位置，即代码点。

```javascript
var s = String.fromCharCode(9733, 9733, 9733);
console.log(s); // ★★★
```

### String.prototype.charAt()
`str.charAt(index)`  
`charAt()`方法从一个字符串中返回指定的字符，参数`index`是一个介于`0`和字符串长度减`1`之间的整数，如果没有提供索引，`charAt()`将使用`0`。

```javascript
var s = "ABC";
console.log(s.charAt(0)); // A
```

### String.prototype.charCodeAt()
`str.charCodeAt(index)`  
`charCodeAt()`方法返回`0`到`65535`之间的整数，表示给定索引处的`UTF-16`代码单元，参数`index`是一个介于`0`和字符串长度减`1`之间的整数，如果没有提供索引，`charCodeAt()`将使用`0`。

```javascript
var s = "ABC";
console.log(s.charCodeAt(0)); // 65
```

### String.prototype.codePointAt()
`str.codePointAt(pos)`  
`codePointAt()`方法返回一个`Unicode`编码点值的非负整数，参数`index`是一个介于`0`和字符串长度减`1`之间的整数，如果没有提供索引，`codePointAt()`将使用`0`。

```javascript
var s = "ABC";
console.log(s.codePointAt(0)); // 65
```

### String.prototype.concat()
`str.concat(str2, [, ...strN])`  
`concat()`方法将一个或多个字符串与原字符串连接合并，形成一个新的字符串并返回，`concat`方法将一个或多个字符串与原字符串连接合并，形成一个新的字符串并返回，`concat`方法并不影响原字符串，如果参数不是字符串类型，它们在连接之前将会被转换成字符串。事实上，`Js`中基本数据类型的值不可变，基本类型的值一旦创建就不能被改变，所有操作只能返回一个新的值而不能去改变旧的值。

```javascript
var s1 = "ABC";
var s2 = "DEF";
console.log(s1.concat(s2)); // ABCDEF
```

### String.prototype.endsWith()
`str.endsWith(searchString[, length])`  
`endsWith()`方法用来判断当前字符串是否是以另外一个给定的子字符串结尾的，根据判断结果返回`true`或`false`，参数`searchString`是要搜索的子字符串，`length`可选，是作为`str`的长度，默认值为`str.length`。

```javascript
var s = "ABC";
console.log(s.endsWith("BC")); // true
```

### String.prototype.includes()
`str.includes(searchString[, position])`  
`includes()`方法用于判断一个字符串是否包含在另一个字符串中，根据情况返回`true`或`false`，参数`searchString`是要在此字符串中搜索的字符串，`position`可选，是从当前字符串的哪个索引位置开始搜寻子字符串，默认值为`0`。

```javascript
var s = "ABC";
console.log(s.includes("BC")); // true
```

### String.prototype.indexOf()
`str.indexOf(searchValue [, fromIndex])`  
`indexOf()`方法返回调用`String`对象中第一次出现的指定值的索引，从`fromIndex`处进行搜索，如果未找到该值，则返回`-1`，参数`searchValue`是要被查找的字符串值，如果没有提供确切地提供字符串，`searchValue`会被强制设置为`undefined`，然后在当前字符串中查找这个值，`fromIndex`可选，是数字表示开始查找的位置，可以是任意整数，默认值为`0`，如果`fromIndex`的值小于`0`或者大于`str.length`，那么查找分别从`0`和`str.length`开始查找。

```javascript
var s = "ABC";
console.log(s.indexOf("BC")); // 1
```

### String.prototype.lastIndexOf()
`str.lastIndexOf(searchValue[, fromIndex])`  
`lastIndexOf()`方法返回调用`String`对象的指定值最后一次出现的索引，在一个字符串中的指定位置`fromIndex`处从后向前搜索，如果没找到这个特定值则返回`-1`，该方法将从尾到头地检索字符串`str`，看它是否含有子串`searchValue`，开始检索的位置在字符串的`fromIndex`处或字符串的结尾，如果找到一个`searchValue`，则返回`searchValue`的第一个字符在`str`中的位置，参数`searchValue`是一个字符串，表示被查找的值，如果`searchValue`是空字符串，则返回`fromIndex`，`fromIndex`可选，待匹配字符串`searchValue`的开头一位字符从 `str`的第`fromIndex`位开始向左回向查找，`fromIndex`默认值是`+Infinity`，如果`fromIndex >= str.length`，则会搜索整个字符串，如果`fromIndex < 0`，则等同于`fromIndex === 0`。

```javascript
var s = "ABCABC";
console.log(s.lastIndexOf("BC")); // 4
```

### String.prototype.localeCompare()
`referenceStr.localeCompare(compareString)`  
`localeCompare()`方法返回一个数字来指示一个参考字符串是否在排序顺序前面或之后或与给定字符串相同，当引用字符串在比较字符串前面时返回`-1`，当引用字符串在比较字符串后面时返回`1`，相同位置时返回`0`。

```javascript
var s = "ABC";
console.log(s.localeCompare("DEF")); // -1
```

### String.prototype.match()
`str.match(regexp)`  
`match()`方法检索返回一个字符串匹配正则表达式的结果，如果传入一个非正则表达式对象，则会隐式地使用`new RegExp(obj)`将其转换为一个`RegExp`，如果没有给出任何参数并直接使用`match()`方法 ，将会得到一个包含空字符串的`Array`即`[""]`，如果使用`g`标志，则将返回与完整正则表达式匹配的所有结果，但不会返回捕获组，如果未使用`g`标志，则仅返回第一个完整匹配及其相关的捕获组`Array`。

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".match(regex);
console.log(res); // ["2020-09-02"]
```

### String.prototype.matchAll()
`str.matchAll(regexp)`  
`matchAll()`方法返回一个包含所有匹配正则表达式的结果及分组捕获组的迭代器，如果传入一个非正则表达式对象，则会隐式地使用`new RegExp(obj)`将其转换为一个`RegExp`，传入的`RegExp`必须是设置了全局模式`g`的形式，否则会抛出异常`TypeError`，返回一个迭代器，不可重用，结果耗尽需要再次调用方法，获取一个新的迭代器。`matchAll`内部做了一个`regexp`的复制，所以不像`regexp.exec`,`lastIndex`在字符串扫描时不会改变。

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".matchAll(regex);
console.log([...res]); // 使用Spread操作符展开 也可以调用next()方法进行迭代
// [["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]]
```

### String.prototype.normalize()
`str.normalize([form])`  
`normalize()`方法会按照指定的一种`Unicode`正规形式将当前字符串正规化，参数`form`可选，四种`Unicode`正规形式`Unicode Normalization Form`: `NFC`、`NFD`、`NFKC`或`NFKD`其中的一个, 默认值为`NFC`。

```javascript
var s = "\u00F1";
console.log(s.normalize()); // ñ
```

### String.prototype.padEnd()
`str.padEnd(targetLength [, padString])`  
`padEnd()`方法会用一个字符串填充当前字符串，如果需要的话则重复填充，返回填充后达到指定长度的字符串，从当前字符串的末尾右侧开始填充，参数`targetLength`当前字符串需要填充到的目标长度，如果这个数值小于当前字符串的长度，则返回当前字符串本身，`padString`可选，填充字符串，如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断。

```javascript
var s = "|";
console.log(s.padEnd(3, ".")); // |..
```

### String.prototype.padStart()
`str.padStart(targetLength [, padString])`
`padStart()`方法会用一个字符串填充当前字符串，如果需要的话则重复填充，返回填充后达到指定长度的字符串，从当前字符串的左侧开始填充，参数`targetLength`当前字符串需要填充到的目标长度，如果这个数值小于当前字符串的长度，则返回当前字符串本身，`padString`可选，填充字符串，如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断。

```javascript
var s = "|";
console.log(s.padStart(3, ".")); // ..|
```

### String.prototype.repeat()
`str.repeat(count)`  
`repeat()`构造并返回一个新字符串，该字符串包含被连接在一起的指定数量的字符串的副本，参数`count`表示介于`0`和`+Infinity`之间的整数，表示在新构造的字符串中重复了多少遍原字符串。

```javascript
var s = "ABC";
console.log(s.repeat(2)); // ABCABC
```

### String.prototype.replace()
`str.replace(regexp|substr, newSubStr|function)`  
`replace()`方法返回一个由替换值`replacement`替换部分或所有的模式`pattern`匹配项后的新字符串，模式可以是一个字符串或者一个正则表达式，替换值可以是一个字符串或者一个每次匹配都要调用的回调函数，如果`pattern`是字符串，则仅替换第一个匹配项，原字符串不会改变。

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replace(regex, "");
console.log(res); // sss
```

### String.prototype.replaceAll()
`str.replaceAll(regexp|substr, newSubstr|function)`  
`replaceAll()`方法返回一个新字符串，新字符串所有满足`pattern`的部分都已被`replacement`替换，`pattern`可以是一个字符串或一个`RegExp`，`replacement`可以是一个字符串或一个在每次匹配被调用的函数，原始字符串保持不变。当使用一个`regex`时，必须设置全局`g`标志，否则将引发`TypeError`，即必须使用全局`RegExp`调用`replaceAll`。

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replaceAll(regex, "");
console.log(res); // sss
```

### String.prototype.search()
`str.search(regexp)`  
`search()`方法执行正则表达式和`String`对象之间的一个搜索匹配，如果传入一个非正则表达式对象`regexp`，则会使用`new RegExp(regexp)`隐式地将其转换为正则表达式对象，如果匹配成功，则`search()`返回正则表达式在字符串中首次匹配项的索引，否则返回`-1`。

```javascript
var regex = /[0-9]+/g;
console.log("s123".search(regex)); // 1
```

### String.prototype.slice()
`str.slice(beginIndex[, endIndex])`  
`slice()`方法提取某个字符串的一部分，并返回一个新的字符串，且不会改动原字符串，参数`beginIndex`从该索引以`0`为基数处开始提取原字符串中的字符，如果值为负数，会被当做`strLength + beginIndex`看待，这里的`strLength`是字符串的长度，`endIndex`可选，在该索引以`0`为基数处结束提取字符串，如果省略该参数，`slice()`会一直提取到字符串末尾，如果该参数为负数，则被看作是`strLength + endIndex`。

```javascript
var s = "[ABC]";
console.log(s.slice(1, -1)); // ABC
```

### String.prototype.split()
`str.split([separator[, limit]])`  
`split()`方法使用指定的分隔符字符串将一个`String`对象分割成子字符串数组，以一个指定的分割字串来决定每个拆分的位置，`separator`指定表示每个拆分应发生的点的字符串，`separator`可以是一个字符串或正则表达式，`limit`提供一个整数，限定返回的分割片段数量，返回源字符串以分隔符出现位置分隔而成的一个`Array`。
```javascript
var regex = /\d+/g; // 以数字分割
var res = "2020-09-02".split(regex);
console.log(res); // ["", "-", "-", ""]
```

### String.prototype.startsWith()
`str.startsWith(searchString[, position])`  
`startsWith()`方法用来判断当前字符串是否以另外一个给定的子字符串开头，并根据判断结果返回`true`或`false`，参数`searchString`是要搜索的子字符串，参数`position`可选，在`str`中搜索`searchString`的开始位置，默认值为`0`。

```javascript
var s = "ABC";
console.log(s.startsWith("AB")); // true
```

### String.prototype.substring()
`str.substring(indexStart[, indexEnd])`  
`substring()`方法返回一个字符串在开始索引到结束索引之间的一个子集，或从开始索引直到字符串的末尾的一个子集，参数`indexStart`需要截取的第一个字符的索引，该索引位置的字符作为返回的字符串的首字母，`indexEnd`可选，一个`0`到字符串长度之间的整数，以该数字为索引的字符不包含在截取的字符串内。

```javascript
var s = "ABC";
console.log(s.substring(1)); // BC
```

### String.prototype.toLocaleLowerCase()
`str.toLocaleLowerCase([locale, locale, ...])`  
`toLocaleLowerCase()`方法根据任何指定区域语言环境设置的大小写映射，返回调用字符串被转换为小写的格式，参数`locale`可选，指明要转换成小写格式的特定语言区域，如果以一个数组`Array`形式给出多个`locales`, 最合适的地区将被选出来应用，默认的`locale`是主机环境的当前区域`locale`设置。

```javascript
var s = "ABC";
console.log(s.toLocaleLowerCase()); // abc
```

### String.prototype.toLowerCase()
`str.toLowerCase()`  
`toLowerCase()`会将调用该方法的字符串值转为小写形式并返回。

```javascript
var s = "ABC";
console.log(s.toLowerCase()); // abc
```

### String.prototype.toString()
`str.toString()`  
`toString()`方法返回指定对象的字符串形式，`String`对象覆盖了`Object`对象的`toString`方法,并没有继承`Object.toString()`，对于`String`对象，`toString`方法返回该对象的字符串形式，和`String.prototype.valueOf()`方法返回值一样。

```javascript
var s = new String("ABC");
console.log(s); // String {"ABC"}
console.log(s.toString()); // ABC
```

### String.prototype.toUpperCase()
`str.toUpperCase()`  
`toUpperCase()`方法将调用该方法的字符串转为大写形式并返回。

```javascript
var s = "abc";
console.log(s.toUpperCase()); // ABC
```

### String.prototype.trim()
`str.trim()`  
`trim()`方法会从一个字符串的两端删除空白字符。  

```javascript
var s = " A B C ";
console.log(s.trim()); // A B C
```

### String.prototype.trimEnd()
`str.trimEnd()`  
`trimEnd()`方法从一个字符串的末端移除空白字符，`trimRight()`是这个方法的别名。

```javascript
var s = " A B C ";
console.log(s.trimEnd()); //  A B C
```

### String.prototype.trimStart()
`str.trimStart()`  
`trimStart()`方法从字符串的开头删除空格，`trimLeft()`是此方法的别名。

```javascript
var s = " A B C ";
console.log(s.trimStart()); // A B C 
```

### String.prototype.valueOf()
`str.valueOf()`  
`valueOf()`方法返回`String`对象的原始值。

```javascript
var s = new String("ABC");
console.log(s); // String {"ABC"}
console.log(s.valueOf()); // ABC
```

### String.prototype\[@@iterator\]()
`string[Symbol.iterator]`   
`[@@iterator]()`方法返回一个新的`Iterator`对象，它遍历字符串的代码点，返回每一个代码点的字符串值。

```javascript
var s = "ABC";
var it = s[Symbol.iterator]();
console.log(it.next().value); // A
```

### String.raw()
`String.raw(callSite, ...substitutions)`  
String.raw() 是一个模板字符串的标签函数，是用来获取一个模板字符串的原始字符串的，例如`\n`转义字符不会被转义，参数`callSite`是一个模板字符串的调用点对象，类似`{ raw: ['foo', 'bar', 'baz'] }`，`...substitutions`是任意个可选的参数，表示任意个内插表达式对应的值，`templateString`是模板字符串，可包含占位符`${...}`。

```javascript
var raw = String.raw `\n`;
console.log(raw); // \n
console.log(raw.length); // 2
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/jsref/jsref-obj-string.html
https://blog.csdn.net/a153375250/article/details/51013457
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String
```
