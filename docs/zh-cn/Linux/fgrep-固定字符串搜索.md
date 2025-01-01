# fgrep命令
当需要搜索包含很多正则表达式元字符的字符串时，例如`$`、`^`等，`fgrep`很有用，其通过指定搜索字符串包含固定字符，从而无需对每个字符进行转义用反斜杠，如果搜索的字符串包含换行符，则每行将被视为要在搜索中匹配的单个固定字符字符串。也就是说`fgrep`是用来搜索固定字符的，固定字符表示字符串是按字面意义解释的-元字符不存在，因此不能使用正则表达式，运行`fgrep`与使用`-F`选项运行`grep`效果相同。

## 语法

```shell
fgrep [-b] [-c] [-h] [-i] [-l] [-n] [-s] [-v] [-x] [ -e pattern_list] [-f pattern-file] [pattern] [file]
```

## 参数
* `-b`: 在每一行前面加上找到该行所在的块号，这在根据上下文(第一个块为`0`)定位块号时非常有用。
* `-c`: 只打印包含模式的行数。
* `-h`: 搜索多个文件时禁止打印文件。
* `-i`: 在比较时忽略大小写的区别。
* `-l`: 打印一次具有匹配行的文件名称，用换行分隔，当模式出现多次时，不会重复文件名。
* `-n`: 在文件中，在每一行前面加上它的行号(第一行是`1`)。
* `-s`: 静默工作，也就是说只显示错误消息，这对于检查错误状态非常有用。
* `-v`: 打印除包含模式的行以外的所有行。
* `-x`: 仅打印完全匹配的行。
* `-e pattern_list`: 在`pattern list`中搜索字符串，当字符串以`-`开头时很有用。
* `-f pattern-file`: 从模式文件中获取模式列表。
* `pattern`: 指定在搜索输入期间使用的模式。
* `file`: 要搜索模式的文件的路径名，如果没有指定文件参数，将使用标准输入。

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
fgrep Hello hello.c
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

匹配带有`Hello`行的数量。

```shell
fgrep -c Hello hello.c
# 3
```

反转匹配的意义，选择不匹配`Hello`的行。

```shell
fgrep -v Hello hello.c
# #include <stdio.h>
# #include <stdlib.h>
#
# int main() {
#    return 0;
# }
```

匹配带有`i`的行并忽略大小写。

```shell
fgrep -i I hello.c
# #include <stdio.h>
# #include <stdlib.h>
# int main() {
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

仅输出与文件整行匹配的行。

```shell
fgrep -x "   return 0;" hello.c
#    return 0;
```

匹配带有`Hello`的行并输出行号。

```shell
fgrep -n Hello hello.c
# 5:   printf("Hello World\n");
# 6:   printf("Hello World\n");
# 7:   printf("Hello World\n");
```

递归匹配当前目录下所有文件中能够匹配`h*`的文件，请注意由于使用`fgrep`，命令是不会匹配`*`的模式，而是将其作为固定字符`*`去匹配，所以此时是没有匹配的，如果使用`grep`以及相同的参数，则能够输出行号并忽略大小写，注意实际在终端中匹配成功的位置会使用红色字体标注。

```shell
fgrep -rni "h*" ./
# [输出为空]
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ufgrep.htm
https://www.runoob.com/linux/linux-comm-fgrep.html
https://www.geeksforgeeks.org/fgrep-command-in-linux-with-examples/
```

