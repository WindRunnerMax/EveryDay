# Js中Date对象
`JavaScript`的`Date`对象是用于处理日期和时间的全局对象，`Date`对象基于`Unix Time Stamp`，即自`1970`年`1`月`1`日`UTC`起经过的毫秒数。


## 描述
`Date()`构造函数能够接受四种形式的参数，分别为没有参数、`Unix`时间戳、时间戳字符串、分别提供日期与时间的每一个成员。此外创建一个新`Date`对象的唯一方法是通过`new`操作符，若将它作为常规函数调用，即不加`new`操作符，将返回一个字符串，而非`Date`对象。


* 没有参数: 如果没有提供参数，那么新创建的Date对象表示实例化时刻的日期和时间。
* `Unix`时间戳: 一个`Unix`时间戳`Unix Time Stamp`，它是一个整数值，表示自`1970`年`1`月`1`日`00:00:00 UTC-the Unix epoch`以来的毫秒数，忽略了闰秒，请注意大多数`Unix`时间戳功能仅精确到最接近的秒。
* 时间戳字符串: 表示日期的字符串值，该字符串应该能被`Date.parse()`正确方法识别，即符合`IETF-compliant RFC 2822 timestamps`或`version of ISO8601`。
* 分别提供日期与时间的每一个成员: 当至少提供了年份与月份时，这一形式的`Date()`返回的 `Date`对象中的每一个成员都来自提供的参数，没有提供的成员将使用最小可能值，对日期为`1`，其他为`0`。

```javascript
new Date();
new Date(value);
new Date(dateString);
new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
```

```javascript
console.log(new Date()); // Sun Oct 18 2020 10:46:54 GMT+0800 (中国标准时间)
console.log(new Date(1602989155183)); // Sun Oct 18 2020 10:45:55 GMT+0800 (中国标准时间)
console.log(new Date("2020-10-18 10:15:30")); // Sun Oct 18 2020 10:15:30 GMT+0800 (中国标准时间)
console.log(new Date(2020, 9, 18, 10, 15, 30)); // Sun Oct 18 2020 10:15:30 GMT+0800 (中国标准时间)
console.log(typeof(Date())); // string
console.log(typeof(new Date())); // object
```

## 方法

### Date.UTC()
`Date.UTC(year,month[,date[,hrs[,min[,sec[,ms]]]]])`  
`Date.UTC()`方法接受的参数同日期构造函数接受最多参数时一样，返回从`1970-1-1 00:00:00 UTC`到指定日期的的毫秒数。

* `year`: `1900`年后的某一年份。
* `month`: `0`到`11`之间的一个整数，表示月份。
* `date`: `1`到`31`之间的一个整数，表示某月当中的第几天。
* `hrs`: `0`到`23`之间的一个整数，表示小时。
* `min`: `0`到`59`之间的一个整数，表示分钟。
* `sec`: `0`到`59`之间的一个整数，表示秒。
* `ms`: `0`到`999`之间的一个整数，表示毫秒。

```javascript
console.log(Date.UTC(2020, 9, 18, 10, 15, 30)); // 1603016130000
```

### Date.now()
`Date.now()`  
`Date.now()`方法返回自`1970`年`1`月`1`日`00:00:00 (UTC)`到当前时间的毫秒数。

```javascript
console.log(Date.now()); // 1602991355257
```

### Date.parse()
`Date.parse(dateString)`  
`Date.parse()`方法解析一个表示某个日期的字符串，该字符串`dateString`需要符合`RFC2822`或`ISO 8601`日期格式的字符串(其他格式也许也支持，但结果可能与预期不符)，并返回从`1970-1-1 00:00:00 UTC`到该日期对象即该日期对象的`UTC`时间的毫秒数，如果该字符串无法识别，或者一些情况下，包含了不合法的日期数值例如`2015-02-31`，则返回值为`NaN`。不推荐在`ES5`之前使用`Date.parse`方法，因为字符串的解析完全取决于实现。直到至今，不同浏览器在如何解析日期字符串上仍存在许多差异，因此最好还是手动解析日期字符串，在需要适应不同格式时库能起到很大帮助。    

```javascript
console.log(Date.parse("2020-10-18 10:15:30")); // 1602987330000 
console.log(Date.parse("2020-10-18 02:15:30 GMT")); // 1602987330000 
console.log(Date.parse("2020-10-18 02:15:30 UTC")); // 1602987330000 
console.log(Date.parse("2020-10-18 10:15:30 GMT")); // 1603016130000
console.log(Date.parse("2020-10-18 10:15:30 UTC")); // 1603016130000
console.log((1602987330000 - 1603016130000) / 1000 / 3600); // -8
// 如果你在格林威治，你的起始时间是1970年01月01日00时00分00秒。
// 如果你在中国北京，你的起始时间是1970年01月01日08时00分00秒。
// 以相同日期时间来算，北京地区的时间戳在量上是少的。
// 在不同的时区同时运行Date.now()，返回的时间戳是相同的，时间戳是不带有时区信息的。
// 如果我在北京获取到一个时间戳 t，在格林威治使用new Date(t)的话，他取得的时间就比我慢 8 小时。
// 换个角度，如果以相同的时间戳来计算时间的话，北京时间超出格林威治标准时间 8 小时。
```

### Date.prototype.getDate()
`dateObj.getDate()`  
根据本地时间，返回一个指定的日期对象为一个月中的哪一日，范围为从`1-31`。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getDate()); // 18
```

### Date.prototype.getDay()
`dateObj.getDay()`  
`getDay()`方法根据本地时间，返回一个具体日期中一周的第几天，`0`表示星期天。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getDay()); // 0
```

### Date.prototype.getFullYear()
`dateObj.getFullYear()`  
`getFullYear()`方法根据本地时间返回指定日期的年份。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getFullYear()); // 2020
```

### Date.prototype.getHours()
`dateObj.getHours()`  
`getHours()`方法根据本地时间，返回一个指定的日期对象的小时。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getHours()); // 10
```

### Date.prototype.getMilliseconds()
`dateObj.getMilliseconds()`  
`getMilliseconds()`方法，根据本地时间，返回一个指定的日期对象的毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMilliseconds()); // 0
```

### Date.prototype.getMinutes()
`dateObj.getMinutes()`  
`getMinutes()`方法根据本地时间，返回一个指定的日期对象的分钟数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMinutes()); // 15
```

### Date.prototype.getMonth()
`dateObj.getMonth()`  
根据本地时间，返回一个指定的日期对象的月份，为基于`0`的值，`0`表示一年中的第一月。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMonth()); // 9
```

### Date.prototype.getSeconds()
`dateObj.getSeconds()`  
`getSeconds()`方法根据本地时间，返回一个指定的日期对象的秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getSeconds()); // 30
```

### Date.prototype.getTime()
`dateObj.getTime()`  
`getTime`方法的返回值一个数值，表示从`1970`年`1`月`1`日`0`时`0`分`0`秒，距离该日期对象所代表时间的毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getTime()); // 1602987330000
```

### Date.prototype.getTimezoneOffset()
`dateObj.getTimezoneOffset()`  
`getTimezoneOffset()`方法返回协调世界时`UTC`相对于当前时区的时间差值，单位为分钟。

```javascript
var date = new Date();
console.log(date.getTimezoneOffset() / 60); // -8
```

### Date.prototype.getUTCDate()
`dateObj.getUTCDate()`  
`getUTCDate()`方法以世界时为标准，返回一个指定的日期对象为一个月中的第几天。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCDate()); // 18
```

### Date.prototype.getUTCDay()
`dateObj.getUTCDay()`  
`getUTCDay()`方法以世界时为标准，返回一个指定的日期对象为一星期中的第几天，其中`0`代表星期天。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCDay()); // 0
```

### Date.prototype.getUTCFullYear()
`dateObj.getUTCFullYear()`  
`getUTCFullYear()`以世界时为标准，返回一个指定的日期对象的年份。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCFullYear()); // 2020
```

### Date.prototype.getUTCHours()
`dateObj.getUTCHours()`  
`getUTCHours()`方法以世界时为标准，返回一个指定的日期对象的小时数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCHours()); // 2
```

### Date.prototype.getUTCMilliseconds()
`dateObj.getUTCMilliseconds()`  
`getUTCMilliseconds()`方法以世界时为标准，返回一个指定的日期对象的毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMilliseconds()); // 0
```

### Date.prototype.getUTCMinutes()
`dateObj.getUTCMinutes()`  
`getUTCMinutes()`方法以世界时为标准，返回一个指定的日期对象的分钟数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMinutes()); // 15
```

### Date.prototype.getUTCMonth()
`dateObj.getUTCMonth()`  
`getUTCMonth()`方法以世界时为标准，返回一个指定的日期对象的月份，它是从`0`开始计数的，`0`代表一年的第一个月。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMonth()); // 9
```

### Date.prototype.getUTCSeconds()
`dateObj.getUTCSeconds()`  
`getUTCSeconds()`方法以世界时为标准，返回一个指定的日期对象的秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCSeconds()); // 30
```

### Date.prototype.setDate()
`dateObj.setDate(dayValue)`  
`setDate()`方法根据本地时间来指定一个日期对象的天数。

* `dayValue`: 表示一个整数，表示该月的第几天。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setDate(1);
console.log(date); // Thu Oct 01 2020 10:15:30 GMT+0800 (中国标准时间）
```

### Date.prototype.setFullYear()
`dateObj.setFullYear(yearValue[, monthValue[, dayValue]])`  
`setFullYear()`方法根据本地时间为一个日期对象设置年份。

* `yearValue`: 指定年份的整数值，例如1995。
* `monthValue`: 一个`0`到11之间的整数值，表示从一月到十二月。
* `dayValue`: 一个`1`到`31`之间的整数值，表示月份中的第几天，如果指定了`dayValue`参数，就必须同时指定`monthValue`。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setFullYear(2019, 0, 1);
console.log(date); // Tue Jan 01 2019 10:15:30 GMT+0800 (中国标准时间）
```

### Date.prototype.setHours()
`dateObj.setHours(hoursValue[, minutesValue[, secondsValue[, msValue]]])`  
`setHours()`方法根据本地时间为一个日期对象设置小时数，返回从`1970-01-01 00:00:00 UTC`到更新后的日期对象实例所表示时间的毫秒数，在`JavaScript 1.3`版本之前只接受一个参数。

* `hoursValue`: 一个`0`到`23`的整数，表示小时。
* `minutesValue`: 一个`0`到`59`的整数，表示分钟。
* `secondsValue`: 一个`0`到`59`的整数，表示秒数，如果指定了`secondsValue`参数，则必须同时指定`minutesValue`参数。
* `msValue`: 一个`0`到`999`的数字，表示微秒数，如果指定了`msValue`参数，则必须同时指定`minutesValue`和`secondsValue`参数。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.setHours(8)); // 1602980130000
console.log(date); // Sun Oct 18 2020 08:15:30 GMT+0800 (中国标准时间)
```

### Date.prototype.setMilliseconds()
`dateObj.setMilliseconds(millisecondsValue)`  
`setMilliseconds()`方法会根据本地时间设置一个日期对象的毫秒数。

* `millisecondsValue`: 一个`0`到`999`的数字，表示毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMilliseconds(1);
console.log(date.getMilliseconds()); // 1
```

### Date.prototype.setMinutes()
`dateObj.setMinutes(minutesValue[, secondsValue[, msValue]])`  
`setMinutes()`方法根据本地时间为一个日期对象设置分钟数，在`JavaScript 1.3`版本之前只接受第一个参数。

* `minutesValue`: 一个`0`到`59`的整数，表示分钟数。
* `secondsValue`: 一个`0`到`59`的整数，表示秒数。如果指定了`secondsValue`参数，则必须同时指定`minutesValue`参数。
* `msValue`: 一个`0`到`999`的数字，表示微秒数，如果指定了`msValue`参数，则必须同时指定`minutesValue`和`secondsValue`参数。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMinutes(1);
console.log(date); // Sun Oct 18 2020 10:01:30 GMT+0800 (中国标准时间)
```

### Date.prototype.setMonth()
`dateObj.setMonth(monthValue[, dayValue])`  
`setMonth()`方法根据本地时间为一个设置年份的日期对象设置月份，返回从`1970-01-01 00:00:00 UTC`到更新后的日期对象实例所表示时间的毫秒数，在`JavaScript 1.3`版本之前只接受第一个参数。

* `monthValue`: 介于`0`到`11`之间的整数，表示一月到十二月。
* `dayValue`: 从`1`到`31`之间的整数，表示月份中的第几天，`0`为上个月最后一天。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMonth(1);
console.log(date); // Tue Feb 18 2020 10:15:30 GMT+0800 (中国标准时间)
```

### Date.prototype.setSeconds()
`dateObj.setSeconds(secondsValue[, msValue])`  
`setSeconds()`方法根据本地时间设置一个日期对象的秒数，在`JavaScript 1.3`版本之前只接受第一个参数。

* `secondsValue`: 一个`0`到`59`的整数。
* `msValue`: 一个`0`到`999`的数字，表示微秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setSeconds(1);
console.log(date); // Sun Oct 18 2020 10:15:01 GMT+0800 (中国标准时间)
```

### Date.prototype.setTime()
`dateObj.setTime(timeValue)`  
`setTime()`方法以一个表示从`1970-1-1 00:00:00 UTC`计时的毫秒数为来为`Date`对象设置时间。

* `timeValue`: 一个整数，表示从`1970-1-1 00:00:00 UTC`开始计时的毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setTime(1603011933306);
console.log(date); // Sun Oct 18 2020 17:05:33 GMT+0800 (中国标准时间)
```

### Date.prototype.setUTCDate()
`dateObj.setUTCDate(dayValue)`  
`setUTCDate()`方法就是根据全球时间设置特定`date`对象的日期。

* `dayValue`: 一个`1-31`的整形数字，用来指定日期。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCDate(1);
console.log(date.toUTCString()); // Thu, 01 Oct 2020 10:15:30 GMT
```

### Date.prototype.setUTCFullYear()
`dateObj.setUTCFullYear(yearValue[, monthValue[, dayValue]])`  
`setUTCFullYear()`方法根据世界标准时间为一个具体日期设置年份，在`JavaScript 1.3`版本之前只接受第一个参数。

* `yearValue`: 指定年份整数值，例如`1995`。
* `monthValue`: 指定一个`0-11`之间的整数值，代表从一月到十二月。
* `dayValue`: 指定一个`1-31`之间的整数值，代表月份中的第几天，如果指定了`dayValue`参数，那么必须指定`monthValue`参数。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCFullYear(2019);
console.log(date.toUTCString()); // Fri, 18 Oct 2019 10:15:30 GMT
```

### Date.prototype.setUTCHours()
`dateObj.setUTCHours(hoursValue[, minutesValue[, secondsValue[, msValue]]])`  
`setUTCHours()`方法根据通用时间设置指定日期的小时，并返回从`1970`年`1`月`1`日`00:00:00 UTC`到更新后的`date`实例所表示的时间的毫秒数。

* `hoursValue`: 表示小时的整数，取值`0`到`23`之间。
* `minutesValue`: 表示分钟的整数，取值`0`到`59`之间。
* `secondsValue`: 表示秒数的整数，取值`0`到`59`之间，如果指定了该参数，就要同时指定`minutesValue`参数。
* `msValue`: 表示毫秒的整数，取值`0`到`999`之间，如果指定了该参数，就要指定`minutesValue`和`secondsValue`这两个参数。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCHours(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 01:15:30 GMT
```

### Date.prototype.setUTCMilliseconds()
`dateObj.setUTCMilliseconds(millisecondsValue)`  
`setUTCMilliseconds()`方法会根据世界时来设置指定时间的毫秒数。

* `millisecondsValue`: `0 - 999`之间的数值，代表毫秒数。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMilliseconds(111);
console.log(date.getUTCMilliseconds()); // 111
```

### Date.prototype.setUTCMinutes()
`dateObj.setUTCMinutes(minutesValue[, secondsValue[, msValue]])`  
`setUTCMinutes()`方法会根据世界协调时`UTC`来设置指定日期的分钟数，返回从`UTC`时间`1970`年`1`月`1`日`0`时`0`分`0`秒至设置后的时间的毫秒数。

* `minutesValue`: 表示要设置的分钟数，是一个介于`0`和`59`之间的整数。
* `secondsValue`: 表示要设置的秒数，同样也是一个介于`0`和`59`之间的整数，如果传入了这个参数，那么必须要传入上一个参数`minutesValue`。
* `msValue`: 表示要设置的毫秒数，这是一个介于`0`和`999`之间的数字，如果传入了这个参数，那么就必须要传入前面两个参数`minutesValue`和`secondsValue`。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMinutes(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:01:30 GMT
```

### Date.prototype.setUTCMonth()
`dateObj.setUTCMonth(monthValue[, dayValue])`  
`setUTCMonth()`方法根据通用的时间来设置一个准确的月份，返回从`UTC`时间`1970`年`1`月`1`日`0`时`0`分`0`秒至设置后的时间的毫秒数。

* `monthValue`: 一个`0-11`的整数，代表`1`月到`12`月。
* `dayValue`: 一个`1-31`的整数，代表一个月的天数。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMonth(1);
console.log(date.toUTCString()); // Tue, 18 Feb 2020 10:15:30 GMT
```

### Date.prototype.setUTCSeconds()
`dateObj.setUTCSeconds(secondsValue[, msValue])`  
`setUTCSeconds()`方法为一个依据国际通用时间的特定日期设置秒数，返回从`UTC`时间`1970`年`1`月`1`日`0`时`0`分`0`秒至设置后的时间的毫秒数。

* `secondsValue`: 一个在`0`到`59`之间的整数，表示秒数。
* `msValue`: 一个`0`到`999`之间的数字，代表毫秒数。


```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCSeconds(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:15:01 GMT
```

### Date.prototype.toDateString()
`dateObj.toDateString()`  
`toDateString()`方法返回一个日期对象日期部分的字符串。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toDateString()); // Sun Oct 18 2020
```

### Date.prototype.toISOString()
`dateObj.toISOString()`  
`toISOString()`方法返回一个`ISO`即`ISO 8601 Extended Format`格式的字符串`YYYY-MM-DDTHH:mm:ss.sssZ`，时区总是`UTC`协调世界时，加一个后缀`Z`标识。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toISOString()); // 2020-10-18T02:15:30.000Z
```

### Date.prototype.toJSON()
`dateObj.toJSON()`  
`toJSON()`方法返回`Date`对象的字符串形式，调用`toJSON()`返回一个`JSON`格式字符串，使用`toISOString()`，表示该日期对象的值，默认情况下，这个方法常用于`JSON`序列化`Date`对象。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toJSON()); // 2020-10-18T02:15:30.000Z
```

### Date.prototype.toLocaleDateString()
`dateObj.toLocaleDateString([locales [, options]])`  
`toLocaleDateString()`方法返回该日期对象日期部分的字符串，该字符串格式因不同语言而不同。新增的参数`locales`和`options`使程序能够指定使用哪种语言格式化规则，允许定制该方法的表现`behavior`，在旧版本浏览器中，`locales`和`options`参数被忽略，使用的语言环境和返回的字符串格式是各自独立实现的。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleDateString()); // 2020/10/18
```

### Date.prototype.toLocaleString()
`dateObj.toLocaleString([locales [, options]])`  
`toLocaleString()`方法返回该日期对象的字符串，该字符串格式因不同语言而不同。新增的参数`locales`和`options`使程序能够指定使用哪种语言格式化规则，允许定制该方法的表现`behavior`。在旧版本浏览器中，`locales`和`options`参数被忽略，使用的语言环境和返回的字符串格式是各自独立实现的。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleString()); // 2020/10/18 上午10:15:30
```

### Date.prototype.toLocaleTimeString()
`dateObj.toLocaleTimeString([locales [, options]])`  
`toLocaleTimeString()`方法返回该日期对象时间部分的字符串，该字符串格式因不同语言而不同。新增的参数`locales`和`options`使程序能够指定使用哪种语言格式化规则，允许定制该方法的表现`behavior`。在旧版本浏览器中，`locales`和`options`参数被忽略，使用的语言环境和返回的字符串格式是各自独立实现的。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleTimeString()); // 上午10:15:30
```

### Date.prototype.toString()
`dateObj.toString()`  
`toString()`方法返回一个字符串，表示该`Date`对象。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toString()); // Sun Oct 18 2020 10:15:30 GMT+0800 (中国标准时间)
```

### Date.prototype.toTimeString()
`dateObj.toTimeString()`  
`toTimeString()`方法返回一个日期对象时间部分的字符串。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toTimeString()); // 10:15:30 GMT+0800 (中国标准时间)
```

### Date.prototype.toUTCString()
`dateObj.toUTCString()`  
`toUTCString()`方法把一个日期转换为一个字符串，使用`UTC`时区。

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:15:30 GMT
```

### Date.prototype.valueOf()
`dateObj.valueOf()`  
`valueOf()`方法返回一个`Date`对象的原始值。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.valueOf()); // 1602987330000
```

### Date.prototype\[@@toPrimitive\]
`Date()[Symbol.toPrimitive]()`  
`[@@toPrimitive]()`方法可以转换一个`Date`对象到一个原始值。如果`hint`是`string`或`default`，`[@@toPrimitive]()`将会调用`toString`，如果`toString`属性不存在，则调用 `valueOf`，如果`valueOf`也不存在，则抛出一个`TypeError`。如果`hint`是`number`，`[@@toPrimitive]()`会首先尝试`valueOf`，若失败再尝试`toString`。当期望一个原始值却收到一个对象时，`JavaScript`可以自动的调用`[@@toPrimitive]()`方法来将一个对象转化成原始值，所以你很少会需要自己调用这个方法。

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date[Symbol.toPrimitive]("string")); // Sun Oct 18 2020 10:15:30 GMT+0800 (中国标准时间)
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date
```
