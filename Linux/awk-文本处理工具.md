# awk命令
`Awk`是一种用于高级文本处理的通用脚本语言，其主要用作报告和分析工具，与大多数其他程序性编程语言不同，`Awk`是数据驱动的，也就是说需要定义一组针对输入文本要执行的操作，然后其获取输入数据，对其进行转换，然后将结果发送到标准输出。

## 语法

```shell
awk [ -F fs ] [ -v var=value ] [ 'prog' | -f progfile ] [ file ... ]
```

## 参数
* `-F fs`: 将输入字段分隔符设置为正则表达式`fs`。
* `-v var=value`: 在执行`awk`程序之前，将值赋值给变量`var`。
* `'prog'`: `awk`程序。
* `-f progfile`: 指定文件`progfile`，其中包含要执行的`awk`程序。
* `file ...`: 由指定的`awk`程序处理的文件。

## 示例

示例文件`example.txt`文件内容如下：

```
Bucks Milwaukee    60 22 0.732 
Raptors Toronto    55 24 0.707 
76ers Philadelphia 51 31 0.622
Celtics Boston     33 33 0.598
Pacers Indiana     30 34 0.585
```

输出`example.txt`的第`3`个字段。

```shell
awk '{ print $3 }' example.txt
# 60
# 55
# 51
# 33
# 30
```

使用正则表达式匹配出以`R`开头的组。

```shell
awk '/^R/ { print $1,$2,$3,$4 }' example.txt
# Raptors Toronto 55 24
```

使用`BEGIN`以及`END`输出在处理记录之前与之后执行的操作，处理过程为输出第二个字段包含`Tor`的组。

```shell
awk 'BEGIN { print "Start Processing" }; $2 ~ /Tor/ {print $1,$2,$3,$4 }; END { print "End Processing" }' example.txt
# Start Processing
# Raptors Toronto 55 24
# End Processing
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linuxize.com/post/awk-command/
https://www.computerhope.com/unix/uawk.htm
https://www.runoob.com/linux/linux-comm-awk.html
```
