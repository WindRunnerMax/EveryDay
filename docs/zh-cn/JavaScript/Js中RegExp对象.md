# Js中RegExp对象
`RegExp`对象表示正则表达式，是由普通字符和特殊字符也叫元字符或限定符组成的文字模板，用于对字符串执行模式匹配。

## 概述
创建一个`RegExp`对象通常有两种方式，一种是通过字面量创建，一种是通过`RegExp`对象构造函数创建。

```javascript
// var regex = /pattern/modifiers;
var regex = /^[0-9]+$/g;

// var regex = new RegExp("pattern", "modifiers");
var regex = new RegExp("^[0-9]+$", "g");
```

其中模式`pattern`描述了表达式的模式，修饰符`modifiers`用于指定全局匹配、区分大小写的匹配和多行匹配等等。

* `i`: 表示执行对大小写不敏感的匹配。
* `g`: 表示执行全局匹配即查找所有匹配而非在找到第一个匹配后停止。
* `m`: 表示执行多行匹配。
* `s`: 表示特殊字符圆点`.`中包含换行符，默认`.`是匹配除换行符`\n`之外的任何单字符，加上`s`之后`.`中包含换行符。
* `y`: 表示搜索是否具有粘性，仅从正则表达式的`lastIndex`属性表示的索引处搜索。
* `u`: `Unicode`模式，用来正确处理大于`\uFFFF`的`Unicode`字符，也就是说能够正确处理`UTF-16`编码。

### RegExp.prototype.compile()
`regexObj.compile(pattern, flags)`  
`compile()`方法被用于在脚本执行过程中重新编译正则表达式，但是该特性已经从`Web`标准中删除，不推荐`compile()`方法，可以使用`RegExp`构造函数来得到相同效果。

```javascript
var regex = /^[0-9]+$/g;
regex = regex.compile("^[0-9]+$", "i");
console.log(regex); // /^[0-9]+$/i
```

### RegExp.prototype.exec()
`regexObj.exec(str)`  
`exec()`方法在一个指定字符串中执行一个搜索匹配，返回一个结果数组或`null`，在设置了`global`或`sticky`标志位的情况下，`RegExp`对象是有状态的，其会将上次成功匹配后的位置记录在`lastIndex`属性中，使用此特性`exec()`可用来对单个字符串中的多次匹配结果进行逐条的遍历包括捕获到的匹配，而相比之下`String.prototype.match()`只会返回匹配到的结果。

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex.exec("2020-09-02");
console.log(res); // ["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]

// 进行一次完整的全局正则匹配需要使用RegExp.prototype.exec()或String.prototype.matchAll()
// 因为当使用String.prototype.match()和/g标志方式获取匹配信息时，捕获组会被忽略。
const regMatch = (regex, str) => {
    var result = [];
    var temp = null;
    var flags = `${regex.flags}${regex.flags.includes("g") ? "" : "g"}`; // 必须加入g修饰符 否则会陷入死循环
    regex = new RegExp(regex, flags);
    while (temp = regex.exec(str)) result.push(temp);
    return result;
}
```

### RegExp.prototype.test()
`regexObj.test(str)`  
`test()`方法执行一个检索，用来查看正则表达式与指定的字符串是否匹配，返回`true`或`false`。

```javascript
var regex = /^[0-9]+$/g;
console.log(regex.test("1")); // true
```

### String.prototype.search()
`str.search(regexp)`  
`search()`方法执行正则表达式和`String`对象之间的一个搜索匹配，如果传入一个非正则表达式对象`regexp`，则会使用`new RegExp(regexp)`隐式地将其转换为正则表达式对象，如果匹配成功，则`search()`返回正则表达式在字符串中首次匹配项的索引，否则返回`-1`。

```javascript
var regex = /[0-9]+/g;
console.log("s123".search(regex)); // 1
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

### String.prototype.replace()
`str.replace(regexp|substr, newSubStr|function)`  
`replace()`方法返回一个由替换值`replacement`替换部分或所有的模式`pattern`匹配项后的新字符串，模式可以是一个字符串或者一个正则表达式，替换值可以是一个字符串或者一个每次匹配都要调用的回调函数，如果`pattern`是字符串，则仅替换第一个匹配项，原字符串不会改变。

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replace(regex, "");
console.log(res); // sss
```

### String.prototype.split()
`str.split([separator[, limit]])`  
`split()`方法使用指定的分隔符字符串将一个`String`对象分割成子字符串数组，以一个指定的分割字串来决定每个拆分的位置，`separator`指定表示每个拆分应发生的点的字符串，`separator`可以是一个字符串或正则表达式，`limit`提供一个整数，限定返回的分割片段数量，返回源字符串以分隔符出现位置分隔而成的一个`Array`。
```javascript
var regex = /\d+/g; // 以数字分割
var res = "2020-09-02".split(regex);
console.log(res); // ["", "-", "-", ""]
```

## 属性
* `get RegExp[@@species]`: 静态属性，`RegExp[@@species]`访问器属性返回`RegExp`的构造器。
* `RegExp.lastIndex`: `lastIndex`是正则表达式的一个可读可写的整型属性，用来指定下一次匹配的起始索引。
* `RegExp.prototype.flags`: `flags`属性返回一个字符串，由当前正则表达式对象的标志组成。
* `RegExp.prototype.dotAll`: `dotAll`属性表明是否在正则表达式中一起使用`s`修饰符。
* `RegExp.prototype.global`: `global`属性表明正则表达式是否使用了`g`修饰符。
* `RegExp.prototype.ignoreCase`: `ignoreCase`属性表明正则表达式是否使用了`i`修饰符。
* `RegExp.prototype.multiline`: `multiline`属性表明正则表达式是否使用了`m`修饰符。
* `RegExp.prototype.source`: 
`source`属性返回一个值为当前正则表达式对象的模式文本的字符串。
* `RegExp.prototype.sticky`: `sticky`属性表明正则表达式是否使用了`y`修饰符。
* `RegExp.prototype.unicode`: `unicode`属性表明正则表达式带有`u`修饰符。

## 方法
### RegExp.prototype.compile()
`regexObj.compile(pattern, flags)`  
`compile()`方法被用于在脚本执行过程中重新编译正则表达式，但是该特性已经从`Web`标准中删除，不推荐`compile()`方法，可以使用`RegExp`构造函数来得到相同效果。

```javascript
var regex = /^[0-9]+$/g;
regex = regex.compile("^[0-9]+$", "i");
console.log(regex); // /^[0-9]+$/i
```

### RegExp.prototype.exec()
`regexObj.exec(str)`  
`exec()`方法在一个指定字符串中执行一个搜索匹配，返回一个结果数组或`null`，在设置了`global`或`sticky`标志位的情况下，`RegExp`对象是有状态的，其会将上次成功匹配后的位置记录在`lastIndex`属性中，使用此特性`exec()`可用来对单个字符串中的多次匹配结果进行逐条的遍历包括捕获到的匹配，而相比之下`String.prototype.match()`只会返回匹配到的结果。

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex.exec("2020-09-02");
console.log(res); // ["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]

// 进行一次完整的全局正则匹配需要使用RegExp.prototype.exec()或String.prototype.matchAll()
// 因为当使用String.prototype.match()和/g标志方式获取匹配信息时，捕获组会被忽略。
const regMatch = (regex, str) => {
    var result = [];
    var temp = null;
    var flags = `${regex.flags}${regex.flags.includes("g") ? "" : "g"}`; // 必须加入g修饰符 否则会陷入死循环
    regex = new RegExp(regex, flags);
    while (temp = regex.exec(str)) result.push(temp);
    return result;
}
```

### RegExp.prototype.test()
`regexObj.test(str)`  
`test()`方法执行一个检索，用来查看正则表达式与指定的字符串是否匹配，返回`true`或`false`。

```javascript
var regex = /^[0-9]+$/g;
console.log(regex.test("1")); // true
```

### RegExp.prototype\[@@match\]()
`regexp[Symbol.match](str)`  
对正则表达式匹配字符串时，`[@@match]()`方法用于获取匹配结果，这个方法的使用方式和`String.prototype.match()`相同，不同之处是`this`和参数顺序。

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex[Symbol.match]("2020-09-02");
console.log(res); // ["2020-09-02"]
```

### RegExp.prototype\[@@matchAll\]()
`regexp[Symbol.matchAll](str)`  
 `[@@matchAll]`方法返回对字符串使用正则表达式的所有匹配项，这个方法的使用方式和`String.prototype.matchAll()`相同，不同之处是`this`和参数顺序。
 
```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex[Symbol.matchAll]("2020-09-02");
console.log([...res]); // // [["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]]
```

### RegExp.prototype\[@@replace\]()
`regexp[Symbol.replace](str, newSubStr|function)`  
`[@@replace]()`方法会在一个字符串中用给定的替换器，替换所有符合正则模式的匹配项，并返回替换后的新字符串结果，用来替换的参数可以是一个字符串或是一个针对每次匹配的回调函数，这个方法基本可以和`String.prototype.replace()`一样使用，不同之处是`this`和参数顺序。

```javascript
var regex = /\d+/g;
var res = regex[Symbol.replace]("s1s11s111", "");
console.log(res); // sss
```

### RegExp.prototype\[@@search\]()
`regexp[Symbol.search](str)`
`[@@search]()`方法执行了一个在给定字符串中的一个搜索以取得匹配正则模式的项，这个方法的使用方式和`String.prototype.search()`相同，不同之处是`this`和参数顺序。

```javascript
var regex = /\d+/g;
var res = regex[Symbol.search]("s1s11s111");
console.log(res); // 1
```

### RegExp.prototype\[@@split\]()
`[@@split]()`方法切割`String`对象为一个其子字符串的数组，这个方法的使用方式和 `String.prototype.split()`相同，不同之处是`this`和参数顺序。

```javascript
var regex = /\d+/g;
var res = regex[Symbol.split]("2020-09-02");
console.log(res); // ["", "-", "-", ""]
```

### RegExp.prototype.toString()
`regexObj.toString()`  
toString() 返回一个表示该正则表达式的字符串。

```javascript
var regex = /\d+/g;
console.log(regex.toString()); // /\d+/g
```

## 正则规则
元字符的规则列表以及它们在正则表达式上下文中的行为，该部分出自`https://www.runoob.com/regexp/regexp-metachar.html`。

* `\`: 将下一个字符标记为一个特殊字符、或一个原义字符、或一个向后引用、或一个八进制转义符，例如`n`匹配字符`n`，`\n`匹配一个换行符，序列`\\`匹配`\`而`\(`则匹配`("`。
* `^`: 匹配输入字符串的开始位置，如果设置了`RegExp`对象的`Multiline`属性，`^`也匹配 `\n`或`\r`之后的位置。
* `$`: 匹配输入字符串的结束位置，如果设置了`RegExp`对象的`Multiline`属性，`$`也匹配 `\n`或`\r`之前的位置。
* `*`: 匹配前面的子表达式零次或多次，例如`zo*`能匹配`z`以及`zoo`，`*`等价于`{0,}`。
* `+`: 匹配前面的子表达式一次或多次，例如`zo+`能匹配`zo`以及`zoo`，但不能匹配`z`，`+`等价于`{1,}`。
* `?`: 匹配前面的子表达式零次或一次，例如`do(es)?`可以匹配`do`或`does`，`?`等价于`{0,1}`。
* `{n}`: `n`是一个非负整数，匹配确定的`n`次，例如`o{2}`不能匹配`Bob`中的`o`，但是能匹配`food`中的两个`o`。
* `{n,}`: `n`是一个非负整数，至少匹配`n`次，例如`o{2,}`不能匹配`Bob`中的`o`，但能匹配`foooood`中的所有`o`，`o{1,}`等价于`o+`，`o{0,}`则等价于`o*`。
* `{n,m}`: `m`和`n`均为非负整数，其中`n <= m`，最少匹配`n`次且最多匹配`m`次，例如`o{1,3}`将匹配`fooooood`中的前三个`o`，`o{0,1}`等价于`o?`，请注意在逗号和两个数之间不能有空格。
* `?`: 当该字符紧跟在任何一个其他限制符`(*, +, ?, {n}, {n,}, {n,m})`后面时，匹配模式是非贪婪的，非贪婪模式尽可能少的匹配所搜索的字符串，而默认的贪婪模式则尽可能多的匹配所搜索的字符串，例如对于字符串`oooo`，`o+?`将匹配单个`o`，而`o+`将匹配所有`o`。
* `.`: 匹配除换行符`(\n、\r)`之外的任何单个字符，要匹配包括`\n`在内的任何字符，请使用像`(.|\n)`的模式。
* `(pattern)`: 匹配`pattern`并获取这一匹配，所获取的匹配可以从产生的`Matches`集合得到，在`VBScript`中使用`SubMatches`集合，在`JS`中则使用`$1…$9`属性，要匹配圆括号字符，请使用`\(`或`\)`。
* `(?:pattern)`: 匹配`pattern`但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用，这在使用字符`|`来组合一个模式的各个部分是很有用，例如`industr(?:y|ies)`就是一个比`industry|industries`更简略的表达式。
* `(?=pattern)`: 正向肯定预查`look ahead positive assert`，在任何匹配`pattern`的字符串开始处匹配查找字符串，这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用，例如`Windows(?=95|98|NT|2000)`能匹配`Windows2000`中的`Windows`，但不能匹配`Windows3.1`中的`Windows`，预查不消耗字符，也就是说在一个匹配发生后，在最后一次匹配之后立即开始下一次匹配的搜索，而不是从包含预查的字符之后开始。
* `(?!pattern)`: 正向否定预查`negative assert`，在任何不匹配`pattern`的字符串开始处匹配查找字符串，这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用，例如`Windows(?!95|98|NT|2000)`能匹配`Windows3.1`中的`Windows`，但不能匹配`Windows2000`中的`Windows`，预查不消耗字符，也就是说在一个匹配发生后，在最后一次匹配之后立即开始下一次匹配的搜索，而不是从包含预查的字符之后开始。
* `(?<=pattern)`: 反向`look behind`肯定预查，与正向肯定预查类似，只是方向相反，例如`(?<=95|98|NT|2000)Windows`能匹配`2000Windows`中的`Windows`，但不能匹配`3.1Windows`中的`Windows`。
* `(?<!pattern)`: 反向否定预查，与正向否定预查类似，只是方向相反，例如`(?<!95|98|NT|2000)Windows`能匹配`3.1Windows`中的`Windows`，但不能匹配`2000Windows`中的`Windows`。
* `x|y`: 匹配`x`或`y`，例如`z|food`能匹配`z`或`food`，`(z|f)ood`则匹配`zood`或`food`。
* `[xyz]`: 字符集合，匹配所包含的任意一个字符，例如`[abc]`可以匹配`plain`中的`a`。
* `[^xyz]`: 负值字符集合。匹配未包含的任意字符，例如`[^abc]`可以匹配`plain`中的`p`、`l`、`i`、`n`。
* `[a-z]`: 字符范围，匹配指定范围内的任意字符，例如`[a-z]`可以匹配`a`到`z`范围内的任意小写字母字符。
* `[^a-z]`: 负值字符范围，匹配任何不在指定范围内的任意字符，例如`[^a-z]`可以匹配任何不在`a`到`z`范围内的任意字符。
* `\b`: 匹配一个单词边界，也就是指单词和空格间的位置，例如`er\b`可以匹配`never`中的 `er`，但不能匹配`verb`中的`er`。
* `\B`: 匹配非单词边界，`er\B`能匹配`verb`中的`er`，但不能匹配`never`中的`er`。
* `\cx`: 匹配由`x`指明的控制字符,例如`\cM`匹配一个`Control-M`或回车符,`x`的值必须为`A-Z`或`a-z`之一，否则将`c`视为一个原义的`c`字符。
* `\d`: 匹配一个数字字符，等价于`[0-9]`。
* `\D`: 匹配一个非数字字符，等价于`[^0-9]`。
* `\f`: 匹配一个换页符，等价于`\x0c`和`\cL`。
* `\n`: 匹配一个换行符，等价于`\x0a`和`\cJ`。
* `\r`: 匹配一个回车符，等价于`\x0d`和`\cM`。
* `\s`: 匹配任何空白字符，包括空格、制表符、换页符等等，等价于`[ \f\n\r\t\v]`。
* `\S`: 匹配任何非空白字符，等价于`[^ \f\n\r\t\v]`。
* `\t`: 匹配一个制表符，等价于`\x09`和`\cI`。
* `\v`: 匹配一个垂直制表符，等价于`\x0b`和`\cK`。
* `\w`: 匹配字母、数字、下划线，等价于`[A-Za-z0-9_]`。
* `\W`: 匹配非字母、数字、下划线，等价于`[^A-Za-z0-9_]`。
* `\xn`: 匹配`n`，其中`n`为十六进制转义值，十六进制转义值必须为确定的两个数字长，例如`\x41`匹配`A`，`\x041`则等价于`\x04`与`1`，正则表达式中可以使用`ASCII`编码。
* `\num`: 匹配`num`，其中`num`是一个正整数，对所获取的匹配的引用，例如`(.)\1`匹配两个连续的相同字符。
* `\n`: 标识一个八进制转义值或一个向后引用，如果`\n`之前至少`n`个获取的子表达式，则`n`为向后引用，否则如果`n`为八进制数字`0-7`，则`n`为一个八进制转义值。
* `\nm`: 标识一个八进制转义值或一个向后引用，如果`\nm`之前至少有`nm`个获得子表达式，则`nm`为向后引用，如果`\nm`之前至少有`n`个获取，则`n`为一个后跟文字`m`的向后引用。如果前面的条件都不满足，若 n 和 m 均为八进制数字 (0-7)，则 \nm 将匹配八进制转义值 `nm`。
* `\nml`: 如果`n`为八进制数字`0-7`，且`m`和`l`均为八进制数字`0-7`，则匹配八进制转义值`nml`。
* `\un`: 匹配`n`，其中`n`是一个用四个十六进制数字表示的`Unicode`字符，例如`\u00A9`匹配版权符号。

## 示例
该部分出自`https://c.runoob.com/front-end/854`。

### 校验数字的表达式
* 数字: `^[0-9]+$`。
* `n`位的数字: `^\d{n}$`。
* 至少`n`位的数字: `^\d{n,}$`。
* `m-n`位的数字: `^\d{m,n}$`。
* 零和非零开头的数字: `^(0|[1-9][0-9]*)$`。
* 非零开头的最多带两位小数的数字: `^([1-9][0-9]*)+(\.[0-9]{1,2})?$`。
* 带`1-2`位小数的正数或负数: `^(\-)?\d+(\.\d{1,2})$`。
* 正数、负数、和小数: `^(\-|\+)?\d+(\.\d+)?$`。
* 有两位小数的正实数: `^[0-9]+(\.[0-9]{2})?$`。
* 有`1~3`位小数的正实数: `^[0-9]+(\.[0-9]{1,3})?$`。
* 非零的正整数: `^[1-9]\d*$ 或 ^([1-9][0-9]*){1,3}$ 或 ^\+?[1-9][0-9]*$`。
* 非零的负整数: `^\-[1-9][]0-9"*$ 或 ^-[1-9]\d*$`。
* 非负整数: `^\d+$`或`^[1-9]\d*|0$`。
* 非正整数: `^-[1-9]\d*|0$ 或 ^((-\d+)|(0+))$`。
* 非负浮点数: `^\d+(\.\d+)?$`或`^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$`。
* 非正浮点数: `^((-\d+(\.\d+)?)|(0+(\.0+)?))$`或`^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*))|0?\.0+|0$`。
* 正浮点数: `^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$`或`^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$`。
* 负浮点数: `^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$`或`^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$`。
* 浮点数: `^(-?\d+)(\.\d+)?$ 或 ^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$`。

### 校验字符的表达式
* 汉字: `^[\u4e00-\u9fa5]{0,}$`。
* 英文和数字: `^[A-Za-z0-9]+$`或`^[A-Za-z0-9]{4,40}$`。
* 长度为`3-20`的所有字符: `^.{3,20}$`。
* 由`26`个英文字母组成的字符串: `^[A-Za-z]+$`。
* 由`26`个大写英文字母组成的字符串: `^[A-Z]+$`。
* 由`26`个小写英文字母组成的字符串: `^[a-z]+$`。
* 由数字和`26`个英文字母组成的字符串: `^[A-Za-z0-9]+$`。
* 由数字、`26`个英文字母或者下划线组成的字符串: `^\w+$`或`^\w{3,20}$`。
* 中文、英文、数字包括下划线: `^[\u4E00-\u9FA5A-Za-z0-9_]+$`。
* 中文、英文、数字但不包括下划线等符号: `^[\u4E00-\u9FA5A-Za-z0-9]+$`或`^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$`。
* 可以输入含有`^%&',;=?$\`等字符: `[^%&',;=?$\x22]+`。
* 禁止输入含有`~`的字符: `[^~\x22]+`。

### 特殊需求表达式
* `Email`地址: `^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$`。
* 域名: `[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?`。
* `InternetURL`: `[a-zA-z]+://[^\s]*`或`^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$`。
* 手机号码: `^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$`。
* 电话号码`XXX-XXXXXXX`、`XXXX-XXXXXXXX`、`XXX-XXXXXXX`、`XXX-XXXXXXXX`、`XXXXXXX`和`XXXXXXXX`: `^(\(\d{3,4}-)|\d{3.4}-)?\d{7,8}$`。
* 国内电话号码`(0511-4405222、021-87888822)`: `\d{3}-\d{8}|\d{4}-\d{7}`。
* 电话号码正则表达式(支持手机号码，`3-4`位区号，`7-8`位直播号码，`1-4`位分机号):  `((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)`。
* 身份证号(`15`位、`18`位数字)，最后一位是校验位，可能为数字或字符`X`: `(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)`。
* 帐号是否合法(字母开头，允许`5-16`字节，允许字母数字下划线): `^[a-zA-Z][a-zA-Z0-9_]{4,15}$`。
* 密码(以字母开头，长度在`6~18`之间，只能包含字母、数字和下划线): `^[a-zA-Z]\w{5,17}$`。
* 强密码(必须包含大小写字母和数字的组合，不能使用特殊字符，长度在`8-10`之间): `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,10}$`。
* 强密码(必须包含大小写字母和数字的组合，可以使用特殊字符，长度在`8-10`之间): `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$`。
* 日期格式: `^\d{4}-\d{1,2}-\d{1,2}`。
* 一年的`12`个月(`01-09`和`1-12`): `^(0?[1-9]|1[0-2])$`。
* 一个月的`31`天(`01-09`和`1-31`): `^((0?[1-9])|((1|2)[0-9])|30|31)$`。
* 钱的输入格式，精确到小数点后两位: `^[0-9]+(.[0-9]{1,2})?$`。
* `xml`文件: `^([a-zA-Z]+-?)+[a-zA-Z0-9]+\\.[x|X][m|M][l|L]$`。
* 中文字符的正则表达式: `[\u4e00-\u9fa5]`。
* 双字节字符: `[^\x00-\xff]`(包括汉字在内，可以用来计算字符串的长度(一个双字节字符长度计`2`，`ASCII`字符计`1`))。
* 空白行的正则表达式: `\n\s*\r`(可以用来删除空白行)。
* `HTML`标记的正则表达式: `<(\S*?)[^>]*>.*?|<.*? />`。
* 首尾空白字符的正则表达式: `^\s*|\s*$或(^\s*)|(\s*$)`(可以用来删除行首行尾的空白字符(包括空格、制表符、换页符等等))。
* 腾讯`QQ`号: `[1-9][0-9]{4,}`(腾讯`QQ`号从`10000`开始)。
* 中国邮政编码: `[1-9]\d{5}(?!\d)`(中国邮政编码为`6`位数字)。
* `IP`地址: `((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))`。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://c.runoob.com/front-end/854
https://www.jianshu.com/p/7dbf4a1e6805
https://juejin.im/post/6844903816781889543
https://www.runoob.com/regexp/regexp-metachar.html
https://www.cnblogs.com/y896926473/articles/6366222.html
https://www.cnblogs.com/kevin-yuan/archive/2012/09/25/2702167.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp
```
