# tr命令
`tr`命令用于转换或删除文件中的字符，可以读文件也可以从标准输入设备读取数据，经过字符串转译后，将结果输出到标准输出设备。

## 语法

```shell
tr [OPTION]... SET1 [SET2]
```

## 参数
* `-c, -C, --complement`: 使用`SET1`的补码。
* `-d, --delete`: 删除`SET1`中的字符，不翻译。
* `-s, --squeeze-repeats`: 用一次出现的字符替换`SET1`中列出的重复字符的每个输入序列。
* `-t, --truncate-set1`: 首先将`SET1`截断为`SET2`的长度。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。


## 解释序列
* `\NNN`: 八进制值为`NNN`的字符(`1`到`3`个八进制数字)。
* `\\`: 反斜杠。
* `\a`: 可闻的`BEL`。
* `\b`: 退格键。
* `\f`: 换页。
* `\n`: 新行。
* `\r`: 返回。
* `\t`: 水平制表符。
* `\v`: 垂直制表符。
* `CHAR1-CHAR2`: 从`CHAR1`到`CHAR2`的所有字符按升序排列。
* `[CHAR*]`: 在`SET2`中，复制`CHAR`直到`SET1`的长度。
* `[CHAR*REPEAT]`: 重复`CHAR`的副本，如果以`0`开头，则重复八进制。
* `[:alnum:]`: 所有字母和数字。
* `[:alpha:]`: 所有字母。
* `[:blank:]`: 所有水平空白。
* `[:cntrl:]`: 所有控制字符。
* `[:digit:]`: 所有数字。
* `[:graph:]`: 所有可打印字符，不包括空格。
* `[:lower:]`: 所有小写字母。
* `[:print:]`: 所有可打印字符，包括空格。
* `[:punct:]`: 所有标点符号。
* `[:space:]`: 所有水平或垂直空白。
* `[:upper:]`: 所有大写字母。
* `[:xdigit:]`: 所有十六进制数字。
* `[=CHAR=]`: 等同于`CHAR`的所有字符。

## 示例

`file.txt`文件内容如下。

```
Hello World
```

将文件中的字母全部转换为大写。

```shell
cat file.txt | tr [a-z] [A-Z]
# HELLO WORLD
```

同样可以使用`[:lower]`与`[:upper]`参数来实现。

```shell
cat file.txt | tr [:lower:] [:upper:]
# HELLO WORLD
```

将水平空白符转换为`\t`。

```shell
cat file.txt | tr [:space:] "\t"
# Hello   World   
```

删除所有`o`字符。

```shell
cat file.txt | tr -d "o"
# Hell Wrld
```

删除所有数字。

```shell
echo "My ID is 73535" | tr -d [:digit:]
# My ID is
```



取出字符串中的数字。

```
echo "My ID is 73535" | tr -cd [:digit:]
# 73535
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-tr.html
https://www.tutorialspoint.com/unix_commands/tr.htm
https://www.geeksforgeeks.org/tr-command-in-unix-linux-with-examples/
```

