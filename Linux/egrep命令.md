# egrep命令
`egrep`命令用于模式搜索，属于`grep`函数族，工作原理和`grep-E`一样，其将模式视为扩展正则表达式，并打印出与模式匹配的行，如果有多个文件具有匹配的模式，其还能显示每行的文件名。

## 语法

```shell
egrep [options] PATTERN [FILE...]
```

## 参数
* `-A NUM, --after-context=NUM`: 在匹配行之后打印尾部上下文的`NUM`行，在相邻的匹配组之间放置包含`--`的行。
* `-a, --text`: 像处理文本一样处理二进制文件，这相当于`--binary files=text`选项。
* `-B NUM, --before-context=NUM`: 在匹配行之前打印前导上下文的`NUM`行，在相邻的匹配组之间放置包含`--`的行。
* `-C NUM, --context=NUM`: 打印输出上下文的`NUM`行，在相邻的匹配组之间放置包含`--`的行。
* `-b, --byte-offset`: 打印输入文件中每行输出之前的字节偏移量。
* `--binary-files=TYPE`: 如果文件的前几个字节指示该文件包含二进制数据，则假定该文件为类型类型。默认情况下，`TYPE`是`binary`，`grep`通常输出一行消息，说明二进制文件匹配，或者不输出消息(如果不匹配)。如果`TYPE`不匹配，`grep`假设二进制文件不匹配，这相当于`-I`选项。如果`TYPE`是`text`，`grep`会像处理文本一样处理二进制文件，这相当于`-a`选项。此外`grep--binary files=text`可能会输出二进制垃圾，如果输出是终端，并且终端驱动程序将其中的一些解释为命令，则会产生严重的副作用。
* `--colour[=WHEN], --color[=WHEN]`: 在匹配字符串周围加上标记`find in GREP_COLOR`环境变量，`WHEN`可以是`never`、`always`、`auto`。
* `-c, --count`: 禁止正常输出，而是为每个输入文件打印匹配行的计数，使用`-v，--invert match`选项，计算不匹配的行数。
* `-D ACTION, --devices=ACTION`: 如果输入文件是设备、`FIFO`或套接字，使用`ACTION `来处理它。默认情况下，`ACTION`是`read`，这意味着设备的读取就像它们是普通文件一样，如果`ACTION`为`skip`，则设备将自动跳过。
* `-d ACTION, --directories=ACTION`: 如果输入文件是目录，使用`ACTION`来处理它。默认情况下，`ACTION`是`read`，这意味着目录的读取就像它们是普通文件一样，如果`ACTION`是`skip`，则目录将被自动跳过，如果`ACTION`是递归的，`grep`将递归地读取每个目录下的所有文件，这相当于`-r`选项。
* `-e PATTERN, --regexp=PATTERN`: 使用`PATTERN`作为模式，用于保护以`-`开头的模式。
* `-F, --fixed-strings`: 将`PATTERN`解释为固定字符串的列表，用换行符分隔，这些字符串可以匹配。
* `-P, --perl-regexp`: 将`PATTERN`解释为`Perl`正则表达式。
* `-f FILE, --file=FILE`: 从`FILE`获取模式，每行一个，空文件包含零个模式，因此不匹配。
* `-G, --basic-regexp`: 将`PATTERN`解释为基本正则表达式，这是默认值。
* `-H, --with-filename`: 打印每个匹配项的文件名。
* `-h, --no-filename`: 当搜索多个文件时，禁止在输出中使用文件名前缀。
* `--help`: 显示帮助文件。
* `-I`: 处理二进制文件，就像它不包含匹配数据一样，这相当于`--binary-files=without-match`选项。
* `-i, --ignore-case`: 忽略`PATTERN`和输入文件中的大小写区别。
* `-L, --files-without-match`: 禁止正常输出，而是打印通常不会从中打印输出的每个输入文件的名称，扫描将在第一个匹配时停止。
* `-l, --files-with-matches`: 禁止正常输出，而是打印通常从中打印输出的每个输入文件的名称，扫描将在第一个匹配时停止。
* `-m NUM, --max-count=NUM`: 在匹配行数之后停止读取文件。如果输入是来自常规文件的标准输入，并且输出`NUM`个匹配行，`grep`确保标准输入在退出之前定位到最后一个匹配行之后，而不管是否存在后续上下文行。这使调用进程能够继续(恢复)搜索，当`grep`在NUM个匹配行之后停止时，它输出任何后面的上下文行。当`-c`或`--count`选项也被使用时，`grep`不会输出大于`NUM`的计数。当`-v`或`--invert match`选项也被使用时，`grep`会在输出`NUM`个不匹配的行之后停止。
* `--mmap`: 如果可能，使用`mmap`系统调用来读取输入，而不是默认的读取系统调用。在某些情况下，`--mmap`可以产生更好的性能。但是，如果在`grep`操作时输入文件收缩，或者发生`I/O`错误，那么`--mmap`可能会导致未定义的行为(包括核心转储)。
* `-n, --line-number`: 在输出的每一行前面加上输入文件中的行号。
* `-o, --only-matching`: 只显示匹配行中与模式匹配的部分。
* `--label=LABEL`: 将实际来自标准输入的输入显示为来自文件`LABEL`的输入。这对于`zgrep`之类的工具尤其有用，例如`gzip -cd foo.gz | grep -H --label = foo`。
* `--line-buffered`: 使用行缓冲，这可能会导致性能损失。
* `-q, --quiet, --silent`: 保持安静，不向标准输出写入任何内容。如果找到任何匹配项，即使检测到错误，也立即退出，状态为零。
* `-R, -r, --recursive`: 递归地读取每个目录下的所有文件，这相当于`-d recurse`选项。
* `-s, --no-messages`: 禁止显示有关不存在或不可读文件的错误消息。
* `-U, --binary`: 将文件视为二进制文件。默认情况下，在`MS-DOS`和`MS Windows`下，`grep`通过查看从文件中读取的第一个`32KB`的内容来猜测文件类型。如果`grep`确定文件是文本文件，它将从原始文件内容中删除`CR`字符(以使带有`^`和`$`的正则表达式正常工作)。指定`-U`会推翻这种猜测，导致读取所有文件并逐字传递给匹配机制，如果文件是一个文本文件，每行末尾都有`CR/LF`对，这将导致某些正则表达式失败。此选项对`MS-DOS`和`MS Windows`以外的平台无效。
* `-u, --unix-byte-offsets`: 报告`Unix`样式的字节偏移量，此开关使`grep`报告字节偏移，就好像该文件是`Unix`样式的文本文件一样，即去除了`CR`字符。这将产生与在`Unix`机器上运行`grep`相同的结果，除非也使用`-b`选项，否则该选项无效。它对除`MS-DOS`和`MS-Windows`以外的平台没有影响。
* `-V, --version`: 输出版本信息。
* `-v, --invert-match`: 反转匹配的意义，以选择不匹配的行。
* `-w, --word-regexp`: 只选择与表单中包含的单词匹配的行。测试是匹配的子串必须在行的开头，或者前面有非单词组成字符，同样，它必须位于行的末尾，或者后跟非单词组成字符。单词组成字符是字母、数字和下划线。
* `-x, --line-regexp`: 仅选择与整行完全匹配的那些匹配项。
* `-Z, --null`: 输出零字节(`ASCII NULL`字符)，而不是通常在文件名后的字符。例如`grep -lZ`在每个文件名之后输出一个零字节，而不是通常的换行符。即使存在包含不寻常字符(例如换行符)的文件名，此选项也可以使输出明确。此选项可与`find -print0`、`perl -0`、`sort -z`和`xargs -0`等命令一起使用，以处理任意文件名，即使是包含换行符的文件名。


## 示例

`hello.c`文件内容如下:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
   printf("Hello World\n");
   printf("Hello World\n");
   printf("Hello World\n");
   return 0;
}
```

匹配带有`Hello`的行。

```shell
egrep Hello hello.c
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

匹配带有`Hello`行的数量。

```shell
egrep -c Hello hello.c
# 3
```

反转匹配的意义，选择不匹配`Hello`的行。

```shell
egrep -v Hello hello.c
# #include <stdio.h>
# #include <stdlib.h>
#
# int main() {
#    return 0;
# }
```

匹配带有`i`的行并忽略大小写。

```shell
egrep -i I hello.c
# #include <stdio.h>
# #include <stdlib.h>
# int main() {
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

仅输出与文件整行匹配的行。

```shell
egrep -x "   return 0;" hello.c
#    return 0;
```

匹配带有`Hello`的行并输出行号。

```shell
egrep -n Hello hello.c
# 5:   printf("Hello World\n");
# 6:   printf("Hello World\n");
# 7:   printf("Hello World\n");
```

递归匹配当前目录下所有文件中能够匹配`h*`的文件，输出行号并忽略大小写，注意实际在终端中匹配成功的位置会使用红色字体标注。

```shell
egrep -rni "h*" ./
# ./hello.c:1:#include <stdio.h>
# ./hello.c:2:#include <stdlib.h>
# ./hello.c:3:
# ./hello.c:4:int main() {
# ./hello.c:5:   printf("Hello World\n");
# ./hello.c:6:   printf("Hello World\n");
# ./hello.c:7:   printf("Hello World\n");
# ./hello.c:8:   return 0;
# ./hello.c:9:}
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/uegrep.htm
https://www.runoob.com/linux/linux-comm-egrep.html
https://www.geeksforgeeks.org/egrep-command-in-linux-with-examples/
```

