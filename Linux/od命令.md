# od命令
`od`命令会读取所指定的文件的内容，并将其内容以八进制字节码呈现出来。

## 语法

```shell
od [OPTION]... [FILE]...
od [-abcdfilosx]... [FILE] [[+]OFFSET[.][b]]
od --traditional [OPTION]... [FILE] [[+]OFFSET[.][b] [+][LABEL][.][b]]
```

## 参数
* `-A, --address-radix=RADIX`: 选择要以何种基数计算字码。
* `-j, --skip-bytes=BYTES`: 跳过设置的字符数目。
* `-N, --read-bytes=BYTES`: 到设置的字符数目为止。
* `-S BYTES, --strings[=BYTES]`: 输出至少`BYTES`图形字符的字符串，未指定`BYTES`时默认`3`。
* `-t, --format=TYPE`: 设置输出格式。
* `-v, --output-duplicates`: 输出时不省略重复的数据。
* `-w[BYTES], --width[=BYTES]`: 设置每列的最大字符数。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。

## 格式控制
* `-a`: 与`-t a`相同，选择命名字符。
* `-b`: 与`-t o1`相同，选择八进制字节。
* `-c`: 与`-t c`相同，选择`ASCII`字符或反斜杠转义。
* `-d`: 与`-t u2`相同，选择无符号十进制`2`字节单位。
* `-f`: 与`-t fF`相同，选择浮点数。
* `-i`: 与`-t dI`相同，选择十进制整数。
* `-l`: 与`-t dL`相同，选择十进制长。
* `-o`: 与`-t o2`相同，选择八进制`2`字节单位。
* `-s`: 与`-t d2`相同，选择十进制`2`字节单位。
* `-x`: 与`-t x2`相同，选择十六进制`2`字节单位。
* `d[SIZE]`: 有符号十进制，每个整数`SIZE`个字节。
* `f[SIZE]`: 浮点数，每个整数`SIZE`个字节。
* `o[SIZE]`: 八进制，每个整数`SIZE`个字节。
* `u[SIZE]`: 无符号十进制，每个整数`SIZE`个字节。
* `x[SIZE]`: 十六进制，每个整数`SIZE`个字节。

## 示例

输出文件八进制字节码。

```shell
od /tmp/file.txt
```

使用单字节八进制解释进行输出，左侧的默认地址格式为八字节。

```shell
od -c /tmp/file.txt
```

使用`ASCII`码进行输出，其中包括转义字符，左侧的默认地址格式为八字节。

```
od -t d1 /tmp/file.txt
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.howtoforge.com/linux-od-command/
https://www.runoob.com/linux/linux-comm-od.html
https://www.tutorialspoint.com/unix_commands/od.htm
```
