# The Date Object in JavaScript

The `Date` object in `JavaScript` is a global object used to handle dates and times. The `Date` object is based on the `Unix Time Stamp`, which is the number of milliseconds elapsed since `1st January 1970 UTC`.

## Description

The `Date()` constructor can accept four types of parameters: no parameters, a `Unix` time stamp, a time stamp string, and separate values for each date and time member. Additionally, the only way to create a new `Date` object is by using the `new` operator. If used as a regular function call, without the `new` operator, it will return a string instead of a `Date` object.

* No parameters: If no parameters are provided, then the newly created `Date` object represents the date and time at the moment of instantiation.

* `Unix` time stamp: A `Unix` time stamp is an integer value that represents the number of milliseconds elapsed since `1st January 1970 00:00:00 UTC - the Unix epoch` and ignores leap seconds. Please note that most `Unix` time stamp functions are only accurate to the nearest second.

* Time stamp string: A string value representing a date, which should be correctly recognized by the `Date.parse()` method, which means it should conform to an `IETF-compliant RFC 2822 timestamp` or a `version of ISO8601`.

* Separate values for each date and time member: When at least the year and month are provided, this form of `Date()` returns a `Date` object with each member originating from the provided parameters. Any members not provided will default to the smallest possible value, with the date being `1` and the others being `0`.

```javascript
new Date();
new Date(value);
new Date(dateString);
new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
```

```javascript
console.log(new Date()); // Sun Oct 18 2020 10:46:54 GMT+0800 (China Standard Time)
console.log(new Date(1602989155183)); // Sun Oct 18 2020 10:45:55 GMT+0800 (China Standard Time)
console.log(new Date("2020-10-18 10:15:30")); // Sun Oct 18 2020 10:15:30 GMT+0800 (China Standard Time)
console.log(new Date(2020, 9, 18, 10, 15, 30)); // Sun Oct 18 2020 10:15:30 GMT+0800 (China Standard Time)
console.log(typeof(Date())); // string
console.log(typeof(new Date())); // object
```

## Methods

### Date.UTC()

`Date.UTC(year,month[,date[,hrs[,min[,sec[,ms]]]]])`  
The `Date.UTC()` method accepts the same parameters as the date constructor when it accepts the maximum number of parameters and returns the number of milliseconds from `1970-1-1 00:00:00 UTC` to the specified date.

* `year`: A year after `1900`.
* `month`: An integer between `0` and `11` representing the month.
* `date`: An integer between `1` and `31` representing the day of the month.
* `hrs`: An integer between `0` and `23` representing the hour.
* `min`: An integer between `0` and `59` representing the minute.
* `sec`: An integer between `0` and `59` representing the second.
* `ms`: An integer between `0` and `999` representing the millisecond.

```javascript
console.log(Date.UTC(2020, 9, 18, 10, 15, 30)); // 1603016130000
```

### Date.now()

`Date.now()`  
The `Date.now()` method returns the number of milliseconds from `1st January 1970 00:00:00 (UTC)` to the current time.

```javascript
console.log(Date.now()); // 1602991355257
```

### Date.parse()

`Date.parse(dateString)`  
The `Date.parse()` method parses a string that represents a date. The `dateString` needs to conform to either `RFC2822` or `ISO 8601` date format strings (although other formats might be also supported, the results may not be as expected) and returns the number of milliseconds from `1970-1-1 00:00:00 UTC` to the date object or the `UTC` time of that date object. If the string cannot be recognized, or in some cases, contains an invalid date value such as `2015-02-31`, the return value is `NaN`. It is not recommended to use the `Date.parse` method before `ES5`, as the string parsing is entirely implementation-dependent. Even today, there are many differences in how different browsers parse date strings, so it is best to parse date strings manually or use a library, especially when adapting to different formats.

```javascript
console.log(Date.parse("2020-10-18 10:15:30")); // 1602987330000 
console.log(Date.parse("2020-10-18 02:15:30 GMT")); // 1602987330000 
console.log(Date.parse("2020-10-18 02:15:30 UTC")); // 1602987330000 
console.log(Date.parse("2020-10-18 10:15:30 GMT")); // 1603016130000
console.log(Date.parse("2020-10-18 10:15:30 UTC")); // 1603016130000
console.log((1602987330000 - 1603016130000) / 1000 / 3600); // -8
// If you're in Greenwich, your epoch is `1st January 1970 00:00:00`.
// If you're in Beijing, your epoch is `1st January 1970 08:00:00`.
// For the same date and time, the timestamp in Beijing is less.
// Running Date.now() in different time zones will return the same timestamp, as the timestamp does not carry time zone information.
// If I get a timestamp t in Beijing, and in Greenwich, using new Date(t), they will be 8 hours apart.
// Alternatively, if you calculate the time using the same timestamp, the Beijing time is 8 hours ahead of Greenwich Mean Time.
```

### Date.prototype.getDate()
`dateObj.getDate()`  
This method returns the day of the month for the specified date according to local time. The range is from `1` to `31`.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getDate()); // 18
```

### Date.prototype.getDay()
`dateObj.getDay()`  
The `getDay()` method returns the day of the week for the specified date according to local time, where `0` represents Sunday.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getDay()); // 0
```

### Date.prototype.getFullYear()
`dateObj.getFullYear()`  
The `getFullYear()` method returns the year of the specified date according to local time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getFullYear()); // 2020
```

### Date.prototype.getHours()
`dateObj.getHours()`  
The `getHours()` method returns the hour for the specified date according to local time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getHours()); // 10
```

### Date.prototype.getMilliseconds()
`dateObj.getMilliseconds()`  
The `getMilliseconds()` method returns the milliseconds for the specified date according to local time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMilliseconds()); // 0
```

### Date.prototype.getMinutes()
`dateObj.getMinutes()`  
The `getMinutes()` method returns the minutes for the specified date according to local time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMinutes()); // 15
```

### Date.prototype.getMonth()
`dateObj.getMonth()`  
This method returns the month for the specified date according to local time. The month is a number from `0` to `11` where `0` represents January.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getMonth()); // 9
```

### Date.prototype.getSeconds()
`dateObj.getSeconds()`  
The `getSeconds()` method returns the seconds for the specified date according to local time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getSeconds()); // 30
```

### Date.prototype.getTime()
`dateObj.getTime()`  
The `getTime` method returns the numeric value corresponding to the time for the specified date according to local time. This value represents the number of milliseconds since January 1, 1970, 00:00:00.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getTime()); // 1602987330000
```

### Date.prototype.getTimezoneOffset()
`dateObj.getTimezoneOffset()`  
The `getTimezoneOffset()` method returns the time difference in minutes between Coordinated Universal Time (UTC) and the current time zone.

```javascript
var date = new Date();
console.log(date.getTimezoneOffset() / 60); // -8
```

### Date.prototype.getUTCDate()
`dateObj.getUTCDate()`  
The `getUTCDate()` method returns the day of the month in the specified date according to Universal Time Coordinate (UTC).

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCDate()); // 18
```

### Date.prototype.getUTCDay()
`dateObj.getUTCDay()`  
The `getUTCDay()` method returns the day of the week in the specified date according to Universal Time Coordinate (UTC), where `0` represents Sunday.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCDay()); // 0
```

### Date.prototype.getUTCFullYear()
`dateObj.getUTCFullYear()`  
The `getUTCFullYear()` method returns the year of the specified date according to Universal Time Coordinate (UTC).

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCFullYear()); // 2020
```

### Date.prototype.getUTCHours()
`dateObj.getUTCHours()`  
The `getUTCHours()` method returns the hour for the specified date according to Universal Time Coordinate (UTC).

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCHours()); // 2
```

### Date.prototype.getUTCMilliseconds()
`dateObj.getUTCMilliseconds()`  
The `getUTCMilliseconds()` method returns the milliseconds for the specified date according to Universal Time Coordinate (UTC).

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMilliseconds()); // 0
```

### Date.prototype.getUTCMinutes()
`dateObj.getUTCMinutes()`  
The `getUTCMinutes()` method returns the minutes in a specified date object according to universal time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMinutes()); // 15
```

### Date.prototype.getUTCMonth()
`dateObj.getUTCMonth()`  
The `getUTCMonth()` method returns the month in a specified date object according to universal time. It is zero-indexed, with `0` representing the first month of the year.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCMonth()); // 9
```

### Date.prototype.getUTCSeconds()
`dateObj.getUTCSeconds()`  
The `getUTCSeconds()` method returns the seconds in a specified date object according to universal time.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.getUTCSeconds()); // 30
```

### Date.prototype.setDate()
`dateObj.setDate(dayValue)`  
The `setDate()` method sets the day of a specified date object based on local time.

* `dayValue`: An integer representing the day of the month.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setDate(1);
console.log(date); // Thu Oct 01 2020 10:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.setFullYear()
`dateObj.setFullYear(yearValue[, monthValue[, dayValue]])`  
The `setFullYear()` method sets the year for a specified date object based on local time.

* `yearValue`: An integer value for the year, for example 1995.
* `monthValue`: An integer value between `0` and `11`, representing January to December.
* `dayValue`: An integer value between `1` and `31`, representing the day of the month. If `dayValue` is specified, `monthValue` must also be specified.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setFullYear(2019, 0, 1);
console.log(date); // Tue Jan 01 2019 10:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.setHours()
`dateObj.setHours(hoursValue[, minutesValue[, secondsValue[, msValue]]])`  
The `setHours()` method sets the hours for a specified date object based on local time, returning the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC. Prior to JavaScript 1.3, it only accepted one parameter.

* `hoursValue`: An integer between `0` and `23` representing the hour.
* `minutesValue`: An integer between `0` and `59` representing the minutes.
* `secondsValue`: An integer between `0` and `59` representing the seconds. If `secondsValue` is specified, `minutesValue` must also be specified.
* `msValue`: A number between `0` and `999` representing the milliseconds. If `msValue` is specified, both `minutesValue` and `secondsValue` must also be specified.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.setHours(8)); // 1602980130000
console.log(date); // Sun Oct 18 2020 08:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.setMilliseconds()
`dateObj.setMilliseconds(millisecondsValue)`  
The `setMilliseconds()` method sets the milliseconds for a specified date object based on local time.

* `millisecondsValue`: A number between `0` and `999` representing the milliseconds.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMilliseconds(1);
console.log(date.getMilliseconds()); // 1
```

### Date.prototype.setMinutes()
`dateObj.setMinutes(minutesValue[, secondsValue[, msValue]])`  
The `setMinutes()` method sets the minutes for a specified date object based on local time. Prior to JavaScript 1.3, it only accepted the first parameter.

* `minutesValue`: An integer between `0` and `59` representing the minutes.
* `secondsValue`: An integer between `0` and `59` representing the seconds. If `secondsValue` is specified, `minutesValue` must also be specified.
* `msValue`: A number between `0` and `999` representing the milliseconds. If `msValue` is specified, both `minutesValue` and `secondsValue` must also be specified.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMinutes(1);
console.log(date); // Sun Oct 18 2020 10:01:30 GMT+0800 (China Standard Time)
```

```javascript
### Date.prototype.setMonth()
`dateObj.setMonth(monthValue[, dayValue])`  
The `setMonth()` method sets the month for a given date object based on local time, and returns the number of milliseconds between `1970-01-01 00:00:00 UTC` and the updated date object instance. Prior to `JavaScript 1.3`, only the first parameter was accepted.

* `monthValue`: An integer between `0` and `11`, representing January to December.
* `dayValue`: An integer between `1` and `31`, representing the day of the month. `0` represents the last day of the previous month.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setMonth(1);
console.log(date); // Tue Feb 18 2020 10:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.setSeconds()
`dateObj.setSeconds(secondsValue[, msValue])`  
The `setSeconds()` method sets the seconds for a given date object based on local time. Prior to `JavaScript 1.3`, only the first parameter was accepted.

* `secondsValue`: An integer between `0` and `59`.
* `msValue`: A number between `0` and `999`, representing milliseconds.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setSeconds(1);
console.log(date); // Sun Oct 18 2020 10:15:01 GMT+0800 (China Standard Time)
```

### Date.prototype.setTime()
`dateObj.setTime(timeValue)`  
The `setTime()` method sets the time for a `Date` object using the number of milliseconds from `1970-1-1 00:00:00 UTC`.

* `timeValue`: An integer representing the number of milliseconds from `1970-1-1 00:00:00 UTC`.

```javascript
var date = new Date("2020-10-18 10:15:30");
date.setTime(1603011933306);
console.log(date); // Sun Oct 18 2020 17:05:33 GMT+0800 (China Standard Time)
```

### Date.prototype.setUTCDate()
`dateObj.setUTCDate(dayValue)`  
The `setUTCDate()` method sets the date of a specific `date` object based on global time.

* `dayValue`: An integer between `1` and `31`, specifying the date.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCDate(1);
console.log(date.toUTCString()); // Thu, 01 Oct 2020 10:15:30 GMT
```

### Date.prototype.setUTCFullYear()
`dateObj.setUTCFullYear(yearValue[, monthValue[, dayValue]])`  
The `setUTCFullYear()` method sets the year for a specific date based on Coordinated Universal Time (UTC). Prior to `JavaScript 1.3`, only the first parameter was accepted.

* `yearValue`: An integer specifying the year, for example, `1995`.
* `monthValue`: An integer between `0` and `11`, representing January to December.
* `dayValue`: An integer between `1` and `31`, representing the day of the month. If `dayValue` is specified, `monthValue` must also be specified.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCFullYear(2019);
console.log(date.toUTCString()); // Fri, 18 Oct 2019 10:15:30 GMT
```

### Date.prototype.setUTCHours()
`dateObj.setUTCHours(hoursValue[, minutesValue[, secondsValue[, msValue]]])`  
The `setUTCHours()` method sets the hour for a specific date based on Coordinated Universal Time (UTC), and returns the number of milliseconds between `1970-1-1 00:00:00 UTC` and the updated `date` instance.

* `hoursValue`: An integer representing the hour, between `0` and `23`.
* `minutesValue`: An integer representing the minutes, between `0` and `59`.
* `secondsValue`: An integer representing the seconds, between `0` and `59`. If this parameter is specified, `minutesValue` must also be specified.
* `msValue`: An integer representing the milliseconds, between `0` and `999`. If this parameter is specified, both `minutesValue` and `secondsValue` must be specified.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCHours(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 01:15:30 GMT
```

### Date.prototype.setUTCMilliseconds()
`dateObj.setUTCMilliseconds(millisecondsValue)`  
The `setUTCMilliseconds()` method sets the milliseconds of a specific time based on Coordinated Universal Time (UTC).

* `millisecondsValue`: A value between `0` and `999`, representing milliseconds.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMilliseconds(111);
console.log(date.getUTCMilliseconds()); // 111
```

### Date.prototype.setUTCMinutes()
`dateObj.setUTCMinutes(minutesValue[, secondsValue[, msValue]])`  
The `setUTCMinutes()` method sets the minutes for a specified date according to Coordinated Universal Time (`UTC`), returning the number of milliseconds between the date and midnight of January 1, 1970.

* `minutesValue`: Represents the minutes to be set and is an integer between `0` and `59`.
* `secondsValue`: Represents the seconds to be set, also an integer between `0` and `59`. If this parameter is passed, the previous parameter `minutesValue` must also be passed.
* `msValue`: Represents the milliseconds to be set, a number between `0` and `999`. If this parameter is passed, the previous two parameters `minutesValue` and `secondsValue` must also be passed.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMinutes(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:01:30 GMT
```

### Date.prototype.setUTCMonth()
`dateObj.setUTCMonth(monthValue[, dayValue])`  
The `setUTCMonth()` method sets an exact month according to Coordinated Universal Time (`UTC`), returning the number of milliseconds between the date and midnight of January 1, 1970.

* `monthValue`: An integer from `0` to `11`, representing January to December.
* `dayValue`: An integer from `1` to `31`, representing the day of the month.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCMonth(1);
console.log(date.toUTCString()); // Tue, 18 Feb 2020 10:15:30 GMT
```

### Date.prototype.setUTCSeconds()
`dateObj.setUTCSeconds(secondsValue[, msValue])`  
The `setUTCSeconds()` method sets the seconds for a specific date according to Coordinated Universal Time (`UTC`), returning the number of milliseconds between the date and midnight of January 1, 1970.

* `secondsValue`: An integer between `0` and `59` representing the seconds.
* `msValue`: A number between `0` and `999`, representing the milliseconds.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
date.setUTCSeconds(1);
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:15:01 GMT
```

### Date.prototype.toDateString()
`dateObj.toDateString()`  
The `toDateString()` method returns the date portion of a date object as a string.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toDateString()); // Sun Oct 18 2020
```

### Date.prototype.toISOString()
`dateObj.toISOString()`  
The `toISOString()` method returns a string in the `ISO 8601 Extended Format` format `YYYY-MM-DDTHH:mm:ss.sssZ`, where the timezone is always Coordinated Universal Time (`UTC`), marked with a suffix `Z`.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toISOString()); // 2020-10-18T02:15:30.000Z
```

### Date.prototype.toJSON()
`dateObj.toJSON()`  
The `toJSON()` method returns the string form of the `Date` object, calling `toJSON()` returns a string in `JSON` format using `toISOString()`, representing the value of the date object. By default, this method is commonly used for `JSON` serialization of `Date` objects.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toJSON()); // 2020-10-18T02:15:30.000Z
```

### Date.prototype.toLocaleDateString()
`dateObj.toLocaleDateString([locales [, options]])`  
The `toLocaleDateString()` method returns a string representing the date portion of the date object. The format of the string varies by language. The addition of the `locales` and `options` parameters allows the program to specify which language formatting rules to use, allowing customization of the method's behavior. In older browser versions, the `locales` and `options` parameters are ignored, and the language environment and returned string format are independently implemented.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleDateString()); // 2020/10/18
```

### Date.prototype.toLocaleString()
`dateObj.toLocaleString([locales [, options]])`  
The `toLocaleString()` method returns a string representing the date object. The format of the string varies by language. The addition of the `locales` and `options` parameters allows the program to specify which language formatting rules to use, allowing customization of the method's behavior. In older browser versions, the `locales` and `options` parameters are ignored, and the language environment and returned string format are independently implemented.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleString()); // 2020/10/18 上午10:15:30
```

### Date.prototype.toLocaleTimeString()
`dateObj.toLocaleTimeString([locales [, options]])`  
The `toLocaleTimeString()` method returns a string representing the time portion of the given date object. The format of the string may vary depending on the language. The newly added `locales` and `options` parameters allow the program to specify which language formatting rules to use, allowing customization of the behavior of this method. In older versions of browsers, the `locales` and `options` parameters are ignored, and the language environment used and the format of the returned string are independently implemented.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toLocaleTimeString()); // 上午10:15:30
```

### Date.prototype.toString()
`dateObj.toString()`  
The `toString()` method returns a string representing the `Date` object.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toString()); // Sun Oct 18 2020 10:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.toTimeString()
`dateObj.toTimeString()`  
The `toTimeString()` method returns a string representing the time portion of a date object.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.toTimeString()); // 10:15:30 GMT+0800 (China Standard Time)
```

### Date.prototype.toUTCString()
`dateObj.toUTCString()`  
The `toUTCString()` method converts a date to a string using the `UTC` time zone.

```javascript
var date = new Date("2020-10-18 10:15:30 GMT");
console.log(date.toUTCString()); // Sun, 18 Oct 2020 10:15:30 GMT
```

### Date.prototype.valueOf()
`dateObj.valueOf()`  
The `valueOf()` method returns the primitive value of a `Date` object.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date.valueOf()); // 1602987330000
```

### Date.prototype\[@@toPrimitive\]
`Date()[Symbol.toPrimitive]()`  
The `[@@toPrimitive]()` method converts a `Date` object to a primitive value. If the hint is "string" or "default", `[@@toPrimitive]()` will call `toString`, and if the `toString` property does not exist, it will call `valueOf`. If `valueOf` also does not exist, it will throw a `TypeError`. If the hint is "number", `[@@toPrimitive]()` will first try `valueOf`, and if that fails, it will try `toString`. When an object is received instead of a primitive value, `JavaScript` can automatically call the `[@@toPrimitive]()` method to convert the object to a primitive value, so you rarely need to call this method yourself.

```javascript
var date = new Date("2020-10-18 10:15:30");
console.log(date[Symbol.toPrimitive]("string")); // Sun Oct 18 2020 10:15:30 GMT+0800 (China Standard Time)
```

## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
```