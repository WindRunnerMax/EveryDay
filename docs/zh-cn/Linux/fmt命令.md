# fmt命令
`fmt`命令用于编排文本文件，其会从指定的文件里读取内容，将其依照指定格式重新编排后，输出到标准输出设备，若指定的文件名为`-`，则`fmt`指令会从标准输入设备读取数据。

## 语法
```
fmt [-WIDTH] [OPTION]... [FILE]...
```

## 参数
* `-c, --crown-margin`: 保留前两行的缩进。
* `-p, --prefix=STRING`: 仅重新格式化以`STRING`开头的行，并将前缀重新附加到格式化后的行上。
* `-s, --split-only`: 拆分长行，但不再重新填充它们。
* `-t, --tagged-paragraph`: 第一行的缩进不同于第二行。
* `-u, --uniform-spacing`: 单词之间使用一个空格，句子后面使用两个空格。
* `-w, --width=WIDTH`: 最大行宽(默认为`75`列)。
* `-g, --goal=WIDTH`: 目标宽度(默认为宽度的`93％`)。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。

## 示例

默认情况下，`fmt`不使用任何选项，将给定文件中存在的所有单词格式化为一行，当然默认单行最大宽度`75`。

```shell
cat file.txt
# Hello
# everyone.
# Have
# a
# nice 
# day.

fmt file.txt
# Hello everyone.  Have a nice day.
```

格式化文件，并使用`-w`选项指定文件行最大宽度，添加单词超出长度则将单词换行。

```shell
cat file.txt
# Hello
# everyone.
# Have
# a
# nice 
# day.

fmt -w 10 file.txt
# Hello
# everyone.
# Have a
# nice day.
```

`-s`选项分割了很长的行，但是不重新填充它们。

```
cat file.txt
# Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It is not rude, it is not self-seeking, it is not easily angered,  it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres. Love never fails.

fmt -s file.txt
# Love is patient, love is kind. It does not envy, it does not boast, it
# is not proud. It is not rude, it is not self-seeking, it is not easily
# angered,  it keeps no record of wrongs. Love does not delight in evil
# but rejoices with the truth. It always protects, always trusts, always
# hopes, always perseveres. Love never fails.

```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ufmt.htm
https://www.runoob.com/linux/linux-comm-fmt.html
https://www.geeksforgeeks.org/fmt-command-unixlinux/
```