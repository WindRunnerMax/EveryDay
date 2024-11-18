# The RegExp Object in JavaScript
The `RegExp` object represents a regular expression, which is a text template consisting of ordinary characters and special characters, also known as metacharacters or quantifiers, used for pattern matching in strings.

## Description
There are generally two ways to create a `RegExp` object: one is by using a literal, and the other is by using the `RegExp` object constructor.

```javascript
// var regex = /pattern/modifiers;
var regex = /^[0-9]+$/g;

// var regex = new RegExp("pattern", "modifiers");
var regex = new RegExp("^[0-9]+$", "g");
```

Where the pattern `pattern` describes the expression pattern, and the modifiers `modifiers` are used to specify global matching, case-insensitive matching, multiline matching, and more.

* `i`: Performs case-insensitive matching.
* `g`: Performs a global match (finds all matches rather than stopping after the first match).
* `m`: Performs multiline matching.
* `s`: Allows the dot `.` to match newline characters. By default, the dot matches any single character except for a newline character `\n`, but with the `s` flag, the dot includes newline characters.
* `y`: Checks whether the search has sticky properties and only searches at the index indicated by the `lastIndex` property of the regular expression.
* `u`: Unicode mode, used to correctly handle `Unicode` characters larger than `\uFFFF`, which means it can correctly handle `UTF-16` encoding.

### RegExp.prototype.compile()
`regexObj.compile(pattern, flags)`  
The `compile()` method is used to recompile a regular expression during the script execution process. However, this feature has been removed from the web standard, and the use of the `compile()` method is not recommended. One can achieve the same effect using the `RegExp` constructor.

```javascript
var regex = /^[0-9]+$/g;
regex = regex.compile("^[0-9]+$", "i");
console.log(regex); // /^[0-9]+$/i
```

### RegExp.prototype.exec()
`regexObj.exec(str)`  
The `exec()` method executes a search for a match within a specified string and returns an array of results or `null`. When the `global` or `sticky` flags are set, the `RegExp` object maintains state and records the position of the last successful match in the `lastIndex` property. Using this feature, `exec()` can be used to iterate through the results of multiple matches in a single string, including the captured matches. In contrast, `String.prototype.match()` only returns the matched results.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex.exec("2020-09-02");
console.log(res); // ["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]

// For complete global regex matching, use RegExp.prototype.exec() or String.prototype.matchAll()
// When using String.prototype.match() with the /g flag to obtain matches, the capture groups will be ignored.
const regMatch = (regex, str) => {
    var result = [];
    var temp = null;
    var flags = `${regex.flags}${regex.flags.includes("g") ? "" : "g"}`; // Must add the g modifier, otherwise it will fall into an endless loop
    regex = new RegExp(regex, flags);
    while (temp = regex.exec(str)) result.push(temp);
    return result;
}
```

### RegExp.prototype.test()
`regexObj.test(str)`  
The `test()` method executes a search to determine whether the regular expression matches the specified string and returns `true` or `false`.

```javascript
var regex = /^[0-9]+$/g;
console.log(regex.test("1")); // true
```

### String.prototype.search()
`str.search(regexp)`  
The `search()` method executes a search between a regular expression and a `String` object. If a non-regular expression object `regexp` is passed, it will be implicitly converted to a regular expression object using `new RegExp(regexp)`. If a match is found, `search()` returns the index of the first match within the string, otherwise it returns `-1`.

```javascript
var regex = /[0-9]+/g;
console.log("s123".search(regex)); // 1
```

### String.prototype.match()
`str.match(regexp)`  
The `match()` method retrieves the result of matching a string against a regular expression. If a non-regular expression object is passed, it will implicitly use `new RegExp(obj)` to convert it to a `RegExp`. If no parameters are provided and `match()` is used directly, it will return an array containing an empty string, i.e., `[""]`. If the `g` flag is used, it returns all matches of the entire regular expression without the captured groups. If the `g` flag is not used, it returns only the first complete match and its related capture groups as an `Array`.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".match(regex);
console.log(res); // ["2020-09-02"]
```

### String.prototype.matchAll()
`str.matchAll(regexp)`  
The `matchAll()` method returns an iterator containing all the matches of a regular expression and the captured groups. If a non-regular expression object is passed, it will be implicitly converted to a `RegExp` using `new RegExp(obj)`. The passed `RegExp` must be in global mode `g`, otherwise it will throw a `TypeError`. It returns an iterator that cannot be reused, and a new iterator must be obtained by calling the method again after the results are exhausted. `matchAll` internally makes a copy of the `regexp`, so unlike `regexp.exec()`, the `lastIndex` does not change during string scanning.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = "2020-09-02".matchAll(regex);
console.log([...res]); // You can use the spread operator to expand, or call the next() method for iteration
// [["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]]

### String.prototype.replace()
`str.replace(regexp|substr, newSubStr|function)`  
The `replace()` method returns a new string with some or all matches of a pattern replaced by a replacement. The pattern can be a string or a regular expression, and the replacement can be a string or a callback function to be invoked for each match. If the pattern is a string, only the first occurrence will be replaced, and the original string will not be changed.

```javascript
var regex = /\d+/g;
var res = "s1s11s111".replace(regex, "");
console.log(res); // sss
```

### String.prototype.split()
`str.split([separator[, limit]])`  
The `split()` method splits a String object into an array of strings by separating the string into substrings. The separator specifies where to divide the string, and it can be a string or a regular expression. The limit provides an integer that limits the number of split items returned, and it returns an array of substrings formed by splitting the original string at the occurrence of the separator. 
```javascript
var regex = /\d+/g; // Split by digits
var res = "2020-09-02".split(regex);
console.log(res); // ["", "-", "-", ""]
```

## Properties
* `get RegExp[@@species]`: Static property, `RegExp[@@species]` returns the constructor of `RegExp`.
* `RegExp.lastIndex`: `lastIndex` is a readable and writable integer property of a regular expression, used to specify the starting index for the next match.
* `RegExp.prototype.flags`: The `flags` property returns a string consisting of the flags of the current regular expression object.
* `RegExp.prototype.dotAll`: The `dotAll` property indicates whether the `s` modifier is used together in the regular expression.
* `RegExp.prototype.global`: The `global` property indicates whether the `g` modifier is used in the regular expression.
* `RegExp.prototype.ignoreCase`: The `ignoreCase` property indicates whether the `i` modifier is used in the regular expression.
* `RegExp.prototype.multiline`: The `multiline` property indicates whether the `m` modifier is used in the regular expression.
* `RegExp.prototype.source`: 
The `source` property returns the pattern text of the current regular expression object as a string.
* `RegExp.prototype.sticky`: The `sticky` property indicates whether the `y` modifier is used in the regular expression.
* `RegExp.prototype.unicode`: The `unicode` property indicates whether the `u` modifier is used in the regular expression.

## Methods
### RegExp.prototype.compile()
`regexObj.compile(pattern, flags)`  
The `compile()` method is used to recompile a regular expression during script execution, but this feature has been removed from the Web standard. It is not recommended to use the `compile()` method, and you can achieve the same effect using the `RegExp` constructor.

```javascript
var regex = /^[0-9]+$/g;
regex = regex.compile("^[0-9]+$", "i");
console.log(regex); // /^[0-9]+$/i
```

### RegExp.prototype.exec()
`regexObj.exec(str)`  
The `exec()` method executes a search for a match within a specified string and returns the result array, or `null`. When the `global` or `sticky` flags are set, the `RegExp` object is stateful and it records the index of the last successful match in the `lastIndex` property. This feature allows `exec()` to be used for iterating through multiple matches in a single string, including the captured matches, whereas `String.prototype.match()` will only return the matching results.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex.exec("2020-09-02");
console.log(res); // ["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]

// To perform a complete global regex match, you can use RegExp.prototype.exec() or String.prototype.matchAll()
// When using String.prototype.match() with the /g flag to obtain matches, the capturing groups will be ignored.
const regMatch = (regex, str) => {
    var result = [];
    var temp = null;
    var flags = `${regex.flags}${regex.flags.includes("g") ? "" : "g"}`; // Must add the g flag, otherwise it will go into an infinite loop
    regex = new RegExp(regex, flags);
    while (temp = regex.exec(str)) result.push(temp);
    return result;
}
```

### RegExp.prototype.test()
`regexObj.test(str)`  
The `test()` method performs a search for a match between a regular expression and a specified string, returning `true` or `false`.

```javascript
var regex = /^[0-9]+$/g;
console.log(regex.test("1")); // true
```


### RegExp.prototype\[@@match\]()
`regexp[Symbol.match](str)`
When matching a string with a regular expression, the `[@@match]()` method is used to obtain the matching results. The usage of this method is the same as `String.prototype.match()`, except for the `this` and parameter order.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex[Symbol.match]("2020-09-02");
console.log(res); // ["2020-09-02"]
```

### RegExp.prototype\[@@matchAll\]()
`regexp[Symbol.matchAll](str)`
The `[@@matchAll]` method returns all the matching items when a string is used with a regular expression. The usage of this method is the same as `String.prototype.matchAll()`, except for the `this` and parameter order.

```javascript
var regex = /(\d{4})-(\d{2})-(\d{2})/g;
var res = regex[Symbol.matchAll]("2020-09-02");
console.log([...res]); // // [["2020-09-02", "2020", "09", "02", index: 0, input: "2020-09-02", ... ]]
```

### RegExp.prototype\[@@replace\]()
`regexp[Symbol.replace](str, newSubStr|function)`
The `[@@replace]()` method replaces all matching items that conform to the regular pattern in a string with the given replacement, and returns the resulting new string after replacement. The parameter used for replacement can be a string or a callback function for each match. This method can be used similar to `String.prototype.replace()`, except for the `this` and parameter order.

```javascript
var regex = /\d+/g;
var res = regex[Symbol.replace]("s1s11s111", "");
console.log(res); // sss
```

### RegExp.prototype\[@@search\]()
`regexp[Symbol.search](str)`
The `[@@search]()` method executes a search within a given string to find a match with the regular pattern. The usage of this method is the same as `String.prototype.search()`, except for the `this` and parameter order.

```javascript
var regex = /\d+/g;
var res = regex[Symbol.search]("s1s11s111");
console.log(res); // 1
```

### RegExp.prototype\[@@split\]()
`[@@split]()` method splits the `String` object into an array of substrings. The usage is the same as `String.prototype.split()`, except for the `this` and parameter order.

```javascript
var regex = /\d+/g;
var res = regex[Symbol.split]("2020-09-02");
console.log(res); // ["", "-", "-", ""]
```

### RegExp.prototype.toString()
`regexObj.toString()`
The `toString()` method returns a string representing the regular expression.

```javascript
var regex = /\d+/g;
console.log(regex.toString()); // /\d+/g
```

## Regular Expression Rules
A list of metacharacter rules and their behaviors in the context of regular expressions. This section is taken from `https://www.runoob.com/regexp/regexp-metachar.html`.

* `\`: Marks the next character as either a special character, a literal character, a back reference, or an octal escape character. For example, `n` matches the character `n`, `\n` matches a newline character, the sequence `\\` matches `\`, and `\(`
matches `(`.
* `^`: Matches the start of the input string. If the `Multiline` property of the `RegExp` object is set, `^` also matches after a `\n` or `\r`.
* `$`: Matches the end of the input string. If the `Multiline` property of the `RegExp` object is set, `$` also matches before a `\n` or `\r`.
* `*`: Matches the previous sub-expression zero or more times. For example, `zo*` can match `z` or `zoo`, and `*` is equivalent to `{0,}`.
* `+`: Matches the previous sub-expression one or more times. For example, `zo+` can match `zo` or `zoo`, but not `z`, and `+` is equivalent to `{1,}`.
* `?`: Matches the previous sub-expression zero or one time. For example, `do(es)?` can match `do` or `does`, and `?` is equivalent to `{0,1}`.
* `{n}`: `n` is a non-negative integer that matches exactly `n` times. For example, `o{2}` does not match the `o` in `Bob`, but matches the two `o`s in `food`.
* `{n,}`: `n` is a non-negative integer that matches at least `n` times. For example, `o{2,}` does not match the `o` in `Bob`, but matches all the `o`s in `foooood`, where `o{1,}` is equivalent to `o+` and `o{0,}` is equivalent to `o*`.
* `{n,m}`: Both `m` and `n` are non-negative integers where `n <= m`, and it matches at least `n` times and at most `m` times. For example, `o{1,3}` will match the first three `o`s in `fooooood`, `o{0,1}` is equivalent to `o?`, and note that there should be no spaces between the comma and the numbers.
* `?`: When this character is placed immediately after any other quantifier (`*, +, ?, {n}, {n,}, {n,m}`), it makes the matching pattern non-greedy. In non-greedy mode, the pattern matches as little of the searched string as possible, while in the default greedy mode, it matches as much as possible. For example, for the string `oooo`, `o+?` will match a single `o`, while `o+` will match all the `o`s.
* `.`: Matches any single character except for a newline character (`\n`, `\r`). To match any character including `\n`, use a pattern like `(.|\n)`.
* `(pattern)`: Matches `pattern` and captures the match. The captured match can be obtained from the `Matches` collection, used with the `SubMatches` collection in VBScript, or with the `$1…$9` properties in JS. To match parentheses characters, use `\(` or `\)` .
* `(?:pattern)`: Matches `pattern` but does not capture the match, which means it is a non-capturing match and is not stored for later use. This is useful when combining different parts of a pattern using the `|` character. For example, `industr(?:y|ies)` is a more concise expression than `industry|industries`.
* `(?=pattern)`: Positive lookahead assertion. Matches at a position where the string following the current position matches `pattern`. This is a non-capturing match, meaning the match does not need to be stored for later use. For example, `Windows(?=95|98|NT|2000)` can match `Windows` in `Windows2000`, but not in `Windows3.1`. The lookahead does not consume any characters, it means it immediately starts looking for the next match after the last match instead of starting after the lookahead characters.
* `(?!pattern)`: Negative lookahead assertion. Matches at a position where the string following the current position does not match `pattern`. This is a non-capturing match, meaning the match does not need to be stored for later use. For example, `Windows(?!95|98|NT|2000)` can match `Windows` in `Windows3.1`, but not in `Windows2000`. The lookahead does not consume any characters, it means it immediately starts looking for the next match after the last match instead of starting after the lookahead characters.
* `(?<=pattern)`: Positive lookbehind assertion. Works similar to positive lookahead, but in the opposite direction. For example, `(?<=95|98|NT|2000)Windows` can match `Windows` in `2000Windows`, but not in `3.1Windows`.
* `(?<!pattern)`: Negative lookbehind assertion. Works similar to negative lookahead, but in the opposite direction. For example, `(?<!95|98|NT|2000)Windows` can match `Windows` in `3.1Windows`, but not in `2000Windows`.
* `x|y`: Matches either `x` or `y`. For example, `z|food` can match `z` or `food`, and `(z|f)ood` can match `zood` or `food`.
* `[xyz]`: Character set, matches any one of the characters included. For example, `[abc]` can match `a` in `plain`.
* `[^xyz]`: Negated character set, matches any character that is not included. For example, `[^abc]` can match `p`, `l`, `i`, or `n` in `plain`.
* `[a-z]`: Character range, matches any character within the specified range. For example, `[a-z]` can match any lowercase letter from `a` to `z`.
* `[^a-z]`: Negated character range, matches any character that is not within the specified range. For example, `[^a-z]` can match any character that is not a lowercase letter from `a` to `z`.
* `\b`: Matches a word boundary, which is the position between a word and a space. For example, `er\b` can match `er` in `never`, but not in `verb`.
* `\B`: Matches a non-word boundary. `er\B` can match `er` in `verb`, but not in `never`.
* `\cx`: Matches the control character specified by `x`. For example, `\cM` matches a `Control-M` or carriage return. The value of `x` must be one of `A-Z` or `a-z`, otherwise `c` will be treated as a literal `c` character.
* `\d`: Matches a digit character, which is equivalent to `[0-9]`.
* `\D`: Matches a non-digit character, which is equivalent to `[^0-9]`.
* `\f`: Matches a form feed character, which is equivalent to `\x0c` and `\cL`.
* `\n`: Matches a newline character, which is equivalent to `\x0a` and `\cJ`.
* `\r`: Matches a carriage return character, which is equivalent to `\x0d` and `\cM`.
* `\s`: Matches any whitespace character, including space, tab, form feed, etc., which is equivalent to `[ \f\n\r\t\v]`.
* `\S`: Matches any non-whitespace character, which is equivalent to `[^ \f\n\r\t\v]`.
* `\t`: Matches a tab character, which is equivalent to `\x09` and `\cI`.
* `\v`: Matches a vertical tab character, which is equivalent to `\x0b` and `\cK`.
* `\w`: Matches a word character, which includes letters, digits, and underscore, and is equivalent to `[A-Za-z0-9_]`.
* `\W`: Matches a non-word character, which is equivalent to `[^A-Za-z0-9_]`.
* `\xn`: Matches `n`, where `n` is a hexadecimal escape value of two digits. For example, `\x41` matches `A`, and `\x041` is equivalent to `\x04` followed by `1`. This can be used in regular expressions with ASCII encoding.
* `\num`: Matches `num`, which is a positive integer and represents a reference to the matched content. For example, `(.)\1` matches two consecutive identical characters.
* `\n`: Indicates an octal escape value or a back reference. If there are at least `n` captured subexpressions before, then `n` is a back reference. Otherwise, if `n` is an octal digit `0-7`, then `n` is an octal escape value.
* `\nm`: Indicates an octal escape value or a back reference. If there are at least `nm` captured groupings before, then `nm` is a back reference. If there are at least `n` captured groupings before, then `n` is a back reference followed with the character `m`. If none of the above conditions are met, and both `n` and `m` are octal digits (0-7), then `\nm` matches the octal escape value `nm`.
* `\nml`: If `n` is an octal digit `0-7` and `m` and `l` are also octal digits `0-7`, then it matches the octal escape value `nml`.
* `\un`: Matches `n`, where `n` is a `Unicode` character represented by four hexadecimal digits. For example, `\u00A9` matches the copyright symbol.

## Example
This section comes from `https://c.runoob.com/front-end/854`.

### Validation expression for numbers
- Number: `^[0-9]+$`.
- `n`-digit number: `^\d{n}$`.
- At least `n`-digit number: `^\d{n,}$`.
- `m-n` digit number: `^\d{m,n}$`.
- Number starting with zero or non-zero: `^(0|[1-9][0-9]*)$`.
- Non-zero starting number with up to two decimal places: `^([1-9][0-9]*)+(\.[0-9]{1,2})?$`.
- Positive or negative number with `1-2` decimal places: `^(\-)?\d+(\.\d{1,2})$`.
- Positive, negative, and decimal numbers: `^(\-|\+)?\d+(\.\d+)?$`.
- Positive real number with two decimal places: `^[0-9]+(\.[0-9]{2})?$`.
- Positive real number with `1-3` decimal places: `^[0-9]+(\.[0-9]{1,3})?$`.
- Non-zero positive integer: `^[1-9]\d*$ or ^([1-9][0-9]*){1,3}$ or ^\+?[1-9][0-9]*$`.
- Non-zero negative integer: `^\-[1-9][]0-9"*$ or ^-[1-9]\d*$`.
- Non-negative integer: `^\d+$`or`^[1-9]\d*|0$`.
- Non-positive integer: `^-[1-9]\d*|0$ or ^((-\d+)|(0+))$`.
- Non-negative floating point number: `^\d+(\.\d+)?$`or`^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$`.
- Non-positive floating point number: `^((-\d+(\.\d+)?)|(0+(\.0+)?))$`or`^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*))|0?\.0+|0$`.
- Positive floating point number: `^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$`or`^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$`.
- Negative floating point number: `^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$`or`^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$`.
- Floating point number: `^(-?\d+)(\.\d+)?$` or `^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$`.

### Validation expression for characters
- Chinese characters: `^[\u4e00-\u9fa5]{0,}$`.
- English and numbers: `^[A-Za-z0-9]+$` or `^[A-Za-z0-9]{4,40}$`.
- All characters with a length of `3-20`: `^.{3,20}$`.
- Strings consisting of `26` English letters: `^[A-Za-z]+$`.
- Strings consisting of `26` uppercase English letters: `^[A-Z]+$`.
- Strings consisting of `26` lowercase English letters: `^[a-z]+$`.
- Strings consisting of numbers and `26` English letters: `^[A-Za-z0-9]+$`.
- Strings consisting of numbers, `26` English letters, or underscores: `^\w+$` or `^\w{3,20}$`.
- Chinese, English, numbers including underscores: `^[\u4E00-\u9FA5A-Za-z0-9_]+$`.
- Chinese, English, numbers but not including underscores and other symbols: `^[\u4E00-\u9FA5A-Za-z0-9]+$` or `^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$`.
- Allow input containing `^%&',;=?$\` and other characters: `[^%&',;=?$\x22]+`.
- Disallow input containing `~` : `[^~\x22]+`.

### Special Requirement Expressions
* `Email` Address: `^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$`.
* Domain Name: `[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?`.
* `InternetURL`: `[a-zA-z]+://[^\s]*` or `^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$`.
* Mobile Number: `^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$`.
* Phone Number `XXX-XXXXXXX`, `XXXX-XXXXXXXX`, `XXX-XXXXXXX`, `XXX-XXXXXXXX`, `XXXXXXX`, and `XXXXXXXX`: `^(\(\d{3,4}-)|\d{3.4}-)?\d{7,8}$`.
* Domestic Phone Number `(0511-4405222, 021-87888822)`: `\d{3}-\d{8}|\d{4}-\d{7}`.
* Phone Number Regular Expression (supporting mobile number, `3-4` digit area code, `7-8` digit local number, `1-4` digit extension): `((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)`.
* ID Number (`15` digits, `18` digits, the last one is a check digit, which may be a number or character `X`): `(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)`.
* Whether the account is legal (starting with a letter, allowing `5-16` bytes, allowing alphanumeric underscores): `^[a-zA-Z][a-zA-Z0-9_]{4,15}$`.
* Password (starting with a letter, between `6~18` characters, can only contain letters, numbers, and underscores): `^[a-zA-Z]\w{5,17}$`.
* Strong password (must contain a combination of uppercase and lowercase letters and numbers, cannot use special characters, between `8-10` characters): `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,10}$`.
* Strong password (must contain a combination of uppercase and lowercase letters and numbers, can use special characters, between `8-10` characters): `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$`.
* Date format: `^\d{4}-\d{1,2}-\d{1,2}`.
* `12` months of the year (`01-09` and `1-12`): `^(0?[1-9]|1[0-2])$`.
* `31` days in a month (`01-09` and `1-31`): `^((0?[1-9])|((1|2)[0-9])|30|31)$`.
* Money input format, accurate to two decimal places: `^[0-9]+(.[0-9]{1,2})?$`.
* `xml` file: `^([a-zA-Z]+-?)+[a-zA-Z0-9]+\\.[x|X][m|M][l|L]$`.
* Regular expression for Chinese characters: `[\u4e00-\u9fa5]`.
* Double-byte characters: `[^\x00-\xff]` (including Chinese characters, can be used to calculate the length of a string (a double-byte character count as `2`, an ASCII character count as `1`)).
* Regular expression for blank lines: `\n\s*\r` (can be used to delete blank lines).
* Regular expression for `HTML` tags: `<(\S*?)[^>]*>.*?|<.*? />`.
* Regular expression for leading and trailing whitespace characters: `^\s*|\s*$` or `(^\s*)|(\s*$)` (can be used to delete leading and trailing whitespace characters (including spaces, tabs, page breaks, etc.)).
* Tencent `QQ` number: `[1-9][0-9]{4,}` (Tencent `QQ` numbers start from `10000`).
* Chinese postal code: `[1-9]\d{5}(?!\d)` (Chinese postal code is `6` digits).
* `IP` Address: `((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))`.

## Daily Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://c.runoob.com/front-end/854
https://www.jianshu.com/p/7dbf4a1e6805
https://juejin.im/post/6844903816781889543
https://www.runoob.com/regexp/regexp-metachar.html
https://www.cnblogs.com/y896926473/articles/6366222.html
https://www.cnblogs.com/kevin-yuan/archive/2012/09/25/2702167.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp
```