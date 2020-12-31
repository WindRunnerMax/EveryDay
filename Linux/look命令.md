# look命令
`look`命令用于查询单词，仅需指定欲查询的字首字符串，它会显示所有开头字符串符合该条件的单词。

## 语法

```
look [-bdf] [-t char] string [file ...]
```

## 参数
* `-a, --alternative`: 使用备用字典文件。
* `-d, --alphanum`: 使用普通字典字符集和顺序，即只比较空格和字母数字字符。如果未指定文件，则默认情况下此选项处于启用状态。
* `-f, --ignore-case`: 忽略字母字符的大小写，如果未指定文件，则默认情况下此选项处于启用状态。
* `-t, --terminate character`: 指定一个字符串终止字符，即仅比较字符串中直到第一个出现的字符，包括第一个出现的字符。
* `-V, --version`: 输出版本信息。
* `-h, --help`: 输出帮助信息。

## 示例

使用`look`查找以`ab`开头的单词。

```
look ab
# Abbas
# Abbas's
# Abbasid
# Abbasid's
# Abbott
# Abbott's
# Abby
# ...
```

在文件中查找以`L`开头的单词并列出全句。

```
# file.txt
HELLO LINUX!  
Linux is a free unix-type opterating system.  
This is a linux testfile!  
```

```
look L file.txt
Linux is a free unix-type opterating system.
```

在上述示例中使用`-t`指定字符串终止字符，即仅比较字符串中第一次出现之前(包括第一次出现)的字符。

```
look -t E HEO file.txt
# HELLO LINUX!
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-look.html
https://www.tutorialspoint.com/unix_commands/look.htm
https://www.geeksforgeeks.org/look-command-in-linux-with-examples/
```

