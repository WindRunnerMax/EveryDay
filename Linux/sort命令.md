# sort命令
`sort`命令用于将文本文件内容加以排序，可针对文本文件的内容，以行为单位来排序。

## 语法

```shell
sort [OPTION]... [FILE]...
sort [OPTION]... --files0-from=F
```

## 参数
* `-b, --ignore-leading-blanks`: 忽略前导空格。
* `-d, --dictionary-order`: 只考虑空格和字母数字字符。
* `-f, --ignore-case`: 将小写字符转为大写字符。
* `-g, --general-numeric-sort`: 按一般数值进行比较。
* `-i, --ignore-nonprinting`: 只考虑可打印字符。
* `-M, --month-sort`: 比较`JAN < ... < DEC`。
* `-h, --human-numeric-sort`: 比较人类可读的数字，例如`2K`、`1G`。
* `-n, --numeric-sort`: 根据字符串数值进行比较。
* `-R, --random-sort`: 按键的随机哈希排序。
* `--random-source=FILE`: 从`FILE`中获取随机字节。
* `-r, --reverse`: 反转比较结果。
* `--sort=WORD`: 根据`WORD`排序：一般数字`-g`，chan数字`-h`，月份`-M`，数字`-n`，随机-`R`，版本`-V`。
* `--batch-size=NMERGE`: 一次最多合并`NMERGE`输入，对于更多输入，请使用临时文件。
* `-c, --check, --check=diagnose-first`: 检查已排序的输入，不排序。
* `-C, --check=quiet, --check=silent`: 类似于`-c`但不报告第一行错误。
* `--compress-program=PROG`: 用`PROG`压缩临时文件，用`PROG-d`解压临时文件。
* `--debug`: 注释行中用于排序的部分，并向`stderr`警告可疑用法。
* `--files0-from=F`: 从文件`F`中以`NUL`结尾的名称指定的文件读取输入，如果`F`是`-`，则从标准输入读取名称。
* `-k, --key=POS1[,POS2]`: 在`POS1`处开始键(原点`1`)，在`POS2`处结束键(默认行结束)。
* `-m, --merge`: 合并已排序的文件，不排序。
* `-o, --output=FILE`: 将结果写入`FILE`而不是标准输出。
* `-s, --stable`: 通过禁用最后的比较来稳定排序。
* `-t, --field-separator=SEP`: 使用`SEP`代替非空到空的转换。
* `-T, --temporary-directory=DIR`: 将`DIR`用于临时文件，而不是`$TMPDIR`或`/tmp`多个选项指定多个目录。
* `--parallel=N`: 将同时运行的排序数更改为`N`。
* `-u, --unique`: 对于`-c`检查严格的顺序，只输出相等运行的第一个。
* `-z, --zero-terminated`: 以`0`字节结束行，而不是换行。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。


## 示例

`file.txt`、`file1.txt`、`file2.txt`文件内容如下。

```
# file.txt
abhishek
chitransh
satish
rajan
naveen
divyam
harsh

# file1.txt
50
39
15
89
200

# file2.txt
abc
apple
BALL
Abc
bat
bat
```

对`file.txt`文件内容进行排序，要保存的话需要使用输出重定向。

```shell
sort file.txt
# abhishek
# chitransh
# divyam
# harsh
# naveen
# rajan
# satish

sort file2.txt
# abc
# Abc
# apple
# BALL
# bat
# bat
```

可以使用`-r`标志执行逆序排序。

```shell
sort -r file.txt
# satish
# rajan
# naveen
# harsh
# divyam
# chitransh
# abhishek
```

使用`-n`对数字进行排序，不使用`-n`的话则会使用字典序排序。

```shell
sort -n file1.txt
# 15
# 39
# 50
# 89
# 200

sort file1.txt
# 15
# 200
# 39
# 50
# 89
```

要对带有反向数字数据的文件进行排序，我们可以使用下面`-nr`两个选项的组合。

```shell
sort -nr file1.txt
# 200
# 89
# 50
# 39
# 15
```

使用`-u`排序并删除重复项。

```shell
sort -u file2.txt
# abc
# Abc
# apple
# BALL
# bat
```

使用`-c`检查文件是否已经按照顺序排序。

```shell
sort -c file2.txt
# sort: file2.txt:4: disorder: Abc
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/usort.htm
https://www.runoob.com/linux/linux-comm-sort.html
https://www.geeksforgeeks.org/sort-command-linuxunix-examples/
```

