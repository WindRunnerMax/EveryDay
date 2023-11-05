# col命令
在很多`UNIX`说明文件里，都有`RLF`控制字符，当我们把说明文件的内容输出成纯文本文件时，控制字符会变成乱码，`col`命令则能有效滤除这些控制字符。

## 语法

```shell
col [options]
```

## 参数
* `-b, --no-backspaces`: 过滤掉所有的控制字符，包括`RLF`和`HRLF`。
* `-f, --fine`: 允许前半行换行，通常在半行边界上打印的字符会在下一行上打印，滤除`RLF`字符，但允许将`HRLF`字符呈现出来。
* `-p, --pass`: 传递未知控制序列，通常`col`将从输入中过滤出除自身识别和解释的以外的任何控制序列。
* `-h, --tabs`: 将空格转换为制表符，这是默认设置。
* `-x, --spaces`: 将制表符转换为空格。
* `-l, --lines NUM`: 在内存中至少缓冲`num`行，默认情况下缓存`128`行。
* `-V, --version`: 输出版本信息。
* `-H, --help`: 输出帮助信息。

## 示例

将`col`的帮助文档过滤掉反向换行符`RLF`后保存到`col.txt`。

```shell
col --help | col > col.txt
```

将`col`的帮助文档过滤掉控制字符后保存到`col.txt`。

```shell
col --help | col -b > col.txt
```

将`col`的帮助文档的制表符转换为空格后保存到`col.txt`。

```shell
col --help | col -x > col.txt
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ucol.htm
https://www.runoob.com/linux/linux-comm-col.html
https://www.geeksforgeeks.org/col-command-in-linux-with-examples/
```

