
# String Object in JavaScript
The global `String` object is a constructor for strings or a sequence of characters.

## Description
A string can be created using a literal, and a string variable created using a literal can automatically be converted to a temporary wrapper object when methods are called, allowing methods from its constructor's prototype to be called. String objects can also be generated using the `String` object. In addition, the `ES6` standard also defines template literals for generating strings.

```javascript
var s = "s";
console.log(typeof(s)); // string

var s = new String("s");
console.log(typeof(s)); // object

var fill = "0";
var s = `1${fill}1`;
console.log(s); // 101
```

## Properties
* `String.prototype.constructor`: The constructor function for the prototype object for creating objects.
* `String.prototype.length`: Returns the length of the string.

## Methods

### String.fromCharCode()
`String.fromCharCode(num1[, ...[, numN]])`  
The `String.fromCharCode()` static method returns a string created from the specified `UTF-16` code unit sequence, with the parameters being a series of numbers representing `UTF-16` code units, ranging from `0` to `65535` or `0xFFFF`. Numbers greater than `0xFFFF` will be truncated without validity checking.

```javascript
var s = String.fromCharCode(65, 66, 67);
console.log(s); // ABC
```

### String.fromCodePoint()
`String.fromCodePoint(num1[, ...[, numN]])`  
The `String.fromCodePoint()` static method returns a string created using the specified sequence of code points, where the parameters represent a series of `Unicode` code point positions.

```javascript
var s = String.fromCharCode(9733, 9733, 9733);
console.log(s); // ★★★
```

### String.prototype.charAt()
`str.charAt(index)`  
The `charAt()` method returns the specified character from a string. The `index` parameter is an integer between `0` and the length of the string minus `1`. If no index is provided, `charAt()` uses `0`.

```javascript
var s = "ABC";
console.log(s.charAt(0)); // A
```

### String.prototype.charCodeAt()
`str.charCodeAt(index)`  
The `charCodeAt()` method returns an integer between `0` and `65535`, representing the `UTF-16` code unit at the given index. The `index` parameter is an integer between `0` and the length of the string minus `1`. If no index is provided, `charCodeAt()` uses `0`.

```javascript
var s = "ABC";
console.log(s.charCodeAt(0)); // 65
```

### String.prototype.codePointAt()
`str.codePointAt(pos)`  
The `codePointAt()` method returns a non-negative integer value of a `Unicode` code point. The `pos` parameter is an integer between `0` and the length of the string minus `1`. If no index is provided, `codePointAt()` uses `0`.

```javascript
var s = "ABC";
console.log(s.codePointAt(0)); // 65
```

### String.prototype.concat()
`str.concat(str2, [, ...strN])`  
The `concat()` method concatenates one or more strings with the original string to create a new string and returns it. The `concat` method does not affect the original string. If the parameters are not of string type, they will be converted to strings before concatenation. In fact, in `Js`, the values of primitive data types are immutable. Once created, the values of primitive types cannot be changed. All operations can only return a new value rather than change the old value.

```javascript
var s1 = "ABC";
var s2 = "DEF";
console.log(s1.concat(s2)); // ABCDEF
```

### String.prototype.endsWith()
`str.endsWith(searchString[, length])`  
The `endsWith()` method is used to determine whether the current string ends with another given substring and returns `true` or `false` based on the result. The `searchString` parameter is the substring to be searched, and `length` is optional and represents the length of `str`, with a default value of `str.length`.

```javascript
var s = "ABC";
console.log(s.endsWith("BC")); // true
```

### String.prototype.includes()
`str.includes(searchString[, position])`  
The `includes()` method is used to determine whether one string contains another string and returns `true` or `false` accordingly. The `searchString` parameter is the string to be searched within this string, and `position` is optional and indicates at which index in the current string to begin the search for the substring, with a default value of `0`.

```javascript
var s = "ABC";
console.log(s.includes("BC")); // true
```

### String.prototype.indexOf()
`str.indexOf(searchValue [, fromIndex])`  
The `indexOf()` method returns the index of the first occurrence of the specified value within the `String` object, starting the search at `fromIndex`. If the value is not found, `-1` is returned. The `searchValue` parameter is the string value to be found, and if no exact string is provided, `searchValue` is set to `undefined` and then searched for in the current string. `fromIndex` is optional and represents the position to begin the search, and it can be any integer, with a default value of `0`. If the value of `fromIndex` is less than `0` or greater than `str.length`, the search starts at `0` and `str.length` respectively.

```javascript
var s = "ABC";
console.log(s.indexOf("BC")); // 1
```

### String.prototype.lastIndexOf()
`str.lastIndexOf(searchValue[, fromIndex])`  
The `lastIndexOf()` method returns the index of the last occurrence of a specified value in a string, searching backward from the specified `fromIndex` position within the string. If the value is not found, -1 is returned. This method searches the string `str` from end to start to see if it contains the sub-string `searchValue`, starting the search at position `fromIndex` or the end of the string. If a `searchValue` is found, it returns the position of the first character of `searchValue` in `str`. The `searchValue` parameter is a string that represents the value to be searched. If `searchValue` is an empty string, then `fromIndex` is returned. `fromIndex` is optional. The first character of the string to be matched against `searchValue` will be looked for from position `fromIndex` towards the left in `str`. The default value of `fromIndex` is `+Infinity`. If `fromIndex >= str.length`, then the entire string is searched. If `fromIndex < 0`, it is equivalent to `fromIndex === 0`.

```javascript
var s = "ABCABC";
console.log(s.lastIndexOf("BC")); // 4
```

### String.prototype.localeCompare()
`referenceStr.localeCompare(compareString)`  
The `localeCompare()` method returns a number that indicates whether a reference string comes before, after, or is the same as the given string in sort order. It returns -1 when the reference string comes before the compare string, 1 when the reference string comes after the compare string, and 0 when they are at the same position.

```javascript
var s = "ABC";
console.log(s.localeCompare("DEF")); // -1
```

### String.prototype.match()
`str.match(regexp)`  
The `match()` method retrieves the result of matching a string against a regular expression. If a non-regular expression object is passed, it will be implicitly converted to a `RegExp` using `new RegExp(obj)`. If no parameter is given and the `match()` method is used directly, it will return an array containing an empty string, i.e., `[""]`. If the `g` flag is used, it will return all the results that match the complete regular expression but won't return capture groups. If the `g` flag is not used, only the first complete match and its related capture groups will be returned as an array.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".match(regex);
console.log(res); // ["2020-09-02"]
```

### String.prototype.matchAll()
`str.matchAll(regexp)`  
The `matchAll()` method returns an iterator containing all the matches of a regular expression and its captured groups. If a non-regular expression object is passed, it will be implicitly converted to a `RegExp` using `new RegExp(obj)`. The passed `RegExp` must be in the form of the global mode `g`, otherwise it will throw a `TypeError`. It returns an iterator that cannot be reused. When the results are exhausted, the method needs to be called again to obtain a new iterator. The `matchAll` method internally creates a copy of the `regexp`, so unlike `regexp.exec`, the `lastIndex` won't change during string scanning.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".matchAll(regex);
console.log([...res]); // Using the spread operator to expand, or the next() method to iterate through
// [["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]]
```

### String.prototype.normalize()
`str.normalize([form])`  
The `normalize()` method will normalize the current string according to a specified `Unicode` normalization form. The parameter `form` is optional and can be one of four `Unicode` normalization forms: `NFC`, `NFD`, `NFKC`, or `NFKD`, with the default value being `NFC`.

```javascript
var s = "\u00F1";
console.log(s.normalize()); // ñ
```

### String.prototype.padEnd()
`str.padEnd(targetLength [, padString])`  
The `padEnd()` method will pad the current string with a specified string if necessary to create the target length, and returns the padded string. Padding starts from the end of the current string. The parameter `targetLength` is the target length the current string needs to be padded to. If this value is less than the length of the current string, the current string is returned. The parameter `padString` is optional and is the string used for padding. If the string is too long, only the leftmost part is kept and the rest is truncated if the length of the padded string exceeds the target length.

```javascript
var s = "|";
console.log(s.padEnd(3, ".")); // |..
```

### String.prototype.padStart()
`str.padStart(targetLength [, padString])`
The `padStart()` method will pad the current string with a specified string if necessary to create the target length, and returns the padded string. Padding starts from the beginning of the current string. The parameter `targetLength` is the target length the current string needs to be padded to. If this value is less than the length of the current string, the current string is returned. The parameter `padString` is optional and is the string used for padding. If the string is too long, only the leftmost part is kept and the rest is truncated if the length of the padded string exceeds the target length.

```javascript
var s = "|";
console.log(s.padStart(3, ".")); // ..|
```


```markdown
### String.prototype.repeat()
`str.repeat(count)`  
The `repeat()` constructs and returns a new string that contains the specified number of copies of the string that have been concatenated together. The `count` parameter represents an integer between `0` and `+Infinity`, indicating how many times the original string is repeated in the newly constructed string.

```javascript
var s = "ABC";
console.log(s.repeat(2)); // ABCABC
```

### String.prototype.replace()
`str.replace(regexp|substr, newSubStr|function)`  
The `replace()` method returns a new string with some or all matches of a pattern replaced by a replacement. The pattern can be either a string or a regular expression, and the replacement can be a string or a callback function that is invoked for each match. If the pattern is a string, only the first match will be replaced, and the original string will not be changed.

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replace(regex, "");
console.log(res); // sss
```

### String.prototype.replaceAll()
`str.replaceAll(regexp|substr, newSubstr|function)`  
The `replaceAll()` method returns a new string with all occurrences that match the `pattern` replaced by the `replacement`. The `pattern` can be a string or a `RegExp`, and the `replacement` can be a string or a function invoked for each match. The original string remains unchanged. When using a regular expression, the global `g` flag must be set, otherwise a `TypeError` will be thrown, meaning `replaceAll` must be called with a global `RegExp`.

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replaceAll(regex, "");
console.log(res); // sss
```

### String.prototype.search()
`str.search(regexp)`  
The `search()` method executes a search for a match between a regular expression and a `String` object. If a non-regular expression object `regexp` is passed, it will be implicitly converted to a regular expression object using `new RegExp(regexp)`. If a match is found, `search()` returns the index of the first match in the string; otherwise, it returns `-1`.

```javascript
var regex = /[0-9]+/g;
console.log("s123".search(regex)); // 1
```

### String.prototype.slice()
`str.slice(beginIndex[, endIndex])`  
The `slice()` method extracts a section of a string and returns a new string without modifying the original string. The `beginIndex` parameter indicates the index at which to begin extracting characters from the string, with `0` as the base. If the value is negative, it will be treated as `strLength + beginIndex`, where `strLength` is the length of the string. The `endIndex` is optional, indicating the index at which to end the extraction, and if omitted, `slice()` will continue to extract characters until the end of the string. If this parameter is negative, it will be treated as `strLength + endIndex`.

```javascript
var s = "[ABC]";
console.log(s.slice(1, -1)); // ABC
```

### String.prototype.split()
`str.split([separator[, limit]])`  
The `split()` method splits a `String` object into an array of strings using a specified separator to determine where each split should occur. The `separator` specifies a string that determines the points at which each split should occur and can be a string or a regular expression. The `limit` provides an integer that limits the number of segments returned. It returns an `Array` consisting of the source string split at the occurrences of the separator.

```javascript
var regex = /\d+/g; // Splitting with number
var res = "2020-09-02".split(regex);
console.log(res); // ["", "-", "-", ""]
```

### String.prototype.startsWith()
`str.startsWith(searchString[, position])`  
The `startsWith()` method is used to determine whether a string begins with the characters of another string and returns `true` or `false` based on the result. The `searchString` parameter is the string to be searched, and the `position` parameter, which is optional, specifies the position within the string at which to begin the search for `searchString`, with a default value of `0`.

```javascript
var s = "ABC";
console.log(s.startsWith("AB")); // true
```

### String.prototype.substring()
`str.substring(indexStart[, indexEnd])`  
The `substring()` method returns a subset of a string between one index and another, or from one index to the end of the string. The `indexStart` parameter indicates the first character to include in the returned substring, and the character at this index is treated as the first letter of the returned string. The optional `indexEnd` is an integer between `0` and the string's length, and the character at this index is not included in the extracted string.

```javascript
var s = "ABC";
console.log(s.substring(1)); // BC
```

### String.prototype.toLocaleLowerCase()
`str.toLocaleLowerCase([locale, locale, ...])`  
The `toLocaleLowerCase()` method returns the calling string value converted to lowercase using the case mappings of the host environment's current locale. The `locale` parameter is optional and specifies a particular locale for the case mapping, and if given as an array `Array`, the most appropriate locale will be selected and applied as the default `locale` is the current locale setting of the host environment.

```javascript
var s = "ABC";
console.log(s.toLocaleLowerCase()); // abc
```


### `String.prototype.toLowerCase()`
`str.toLowerCase()`
The `toLowerCase()` method converts the string value called by this method to lowercase and returns it.

```javascript
var s = "ABC";
console.log(s.toLowerCase()); // abc
```

### `String.prototype.toString()`
`str.toString()`
The `toString()` method returns the string representation of the specified object. The `String` object overrides the `toString` method of the `Object` object and does not inherit `Object.toString()`. For the `String` object, the `toString` method returns the string representation of that object, which is the same as the value returned by the `String.prototype.valueOf()` method.

```javascript
var s = new String("ABC");
console.log(s); // String {"ABC"}
console.log(s.toString()); // ABC
```

### `String.prototype.toUpperCase()`
`str.toUpperCase()`
The `toUpperCase()` method converts the string called by this method to uppercase and returns it.

```javascript
var s = "abc";
console.log(s.toUpperCase()); // ABC
```

### `String.prototype.trim()`
`str.trim()`
The `trim()` method removes whitespace from both ends of a string.

```javascript
var s = " A B C ";
console.log(s.trim()); // A B C
```

### `String.prototype.trimEnd()`
`str.trimEnd()`
The `trimEnd()` method removes whitespace from the end of a string. `trimRight()` is an alias for this method.

```javascript
var s = " A B C ";
console.log(s.trimEnd()); //  A B C
```

### `String.prototype.trimStart()`
`str.trimStart()`
The `trimStart()` method removes leading spaces from a string. `trimLeft()` is an alias for this method.

```javascript
var s = " A B C ";
console.log(s.trimStart()); // A B C 
```

### `String.prototype.valueOf()`
`str.valueOf()`
The `valueOf()` method returns the original value of the `String` object.

```javascript
var s = new String("ABC");
console.log(s); // String {"ABC"}
console.log(s.valueOf()); // ABC
```

### `String.prototype\[@@iterator\]()`
`string[Symbol.iterator]`
The `[@@iterator]()` method returns a new `Iterator` object that traverses the Unicode code points of a string and returns the string value of each code point.

```javascript
var s = "ABC";
var it = s[Symbol.iterator]();
console.log(it.next().value); // A
```

### `String.raw()`
`String.raw(callSite, ...substitutions)`
`String.raw()` is a template string tag function used to retrieve the raw string of a template string. For example, the escape character `\n` will not be escaped. The parameter `callSite` is a call point object of a template string, similar to `{ raw: ['foo', 'bar', 'baz'] }`, `...substitutions` are any number of optional parameters representing the values corresponding to any number of interpolated expressions, and `templateString` is the template string, which can contain placeholders `${...}`.

```javascript
var raw = String.raw `\n`;
console.log(raw); // \n
console.log(raw.length); // 2
```

## Every day a question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.runoob.com/jsref/jsref-obj-string.html
https://blog.csdn.net/a153375250/article/details/51013457
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String
```