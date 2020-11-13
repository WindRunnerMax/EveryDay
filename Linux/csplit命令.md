# csplit命令
`csplit`命令将用`PATTERN`分隔的`FILE`文件输出到文件`xx00`、`xx01`、`...`，并将每个文件的字节数输出到标准输出。

## 语法

```shell
csplit [OPTION]... FILE PATTERN...
```

## 参数
* `-b, --suffix-format=FORMAT`: 使用`sprintf FORMAT`格式而不是`%02d`。
* `-f, --prefix=PREFIX`: 使用`PREFIX`代替`xx`。
* `-k, --keep-files`: 出错时不要删除输出文件。
* `-m, --suppress-matched`: 取消匹配`PATTERN`的行。
* `-n, --digits=DIGITS`: 使用指定的数字位数，而不是`2`。
* `-s, --quiet, --silent`: 不要打印输出文件大小的计数。
* `-z, --elide-empty-files`: 删除空输出文件。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。

## 模式
如果文件被指定为破折号`-`，`csplit`将读取标准输入，每种模式可能是：
* `INTEGER`: 复制到指定行号，但不包括指定行号。
* `/REGEXP/[OFFSET]`: 复制到但不包括匹配行。
* `%REGEXP%[OFFSET]`: 跳至但不包括匹配行。
* `{INTEGER}`: 重复上一个模式指定的次数。
* `{*}`: 尽可能多次重复前面的模式。

## 示例

`list.txt`文件内容如下：

```
1. Apples
2. Bananas
3. Oranges
4. Pineapples
5. Guava
```

使用`csplit`命令将此文件分为两部分，第二部分从第三行开始。

```shell
csplit list.txt 3
# 21
# 34

cat xx00
# 1. Apples
# 2. Bananas

cat xx01
# 3. Oranges
# 4. Pineapples
# 5. Guava
```

使用`csplit`命令将此文件分为三部分。

```shell
csplit list.txt 2 3
# 21
# 34

cat xx00
# 1. Apples

cat xx01
# 2. Bananas

cat xx02
# 3. Oranges
# 4. Pineapples
# 5. Guava
```

使用自定义的分割前缀`aa`代替`xx`分割前缀。

```shell
csplit list.txt -f aa 3
# 21
# 34

ls
# aa00  aa01 list.txt
```

使用三位数字代替默认的两位数字。

```shell
csplit list.txt -n 3 3
# 21
# 34

ls
# list.txt  xx000  xx001
```

使用模式定义分割规则，重复上一个模式指定的次数。

```shell
csplit list.txt 2 {1}
# 10
# 22
# 23

ls xx*
# xx00  xx01  xx02
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ucsplit.htm
https://www.runoob.com/linux/linux-comm-csplit.html
https://www.geeksforgeeks.org/csplit-command-in-linux-with-examples/
```

