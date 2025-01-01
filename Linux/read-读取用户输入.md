# read命令
`read`命令被用来从标准输入读取单行数据，这个命令可以用来读取键盘输入，当使用重定向以及默认选项的情况下，可以读取文件中的一行数据，此时`read`会将换行符视为行尾，但是可以使用`-d`选项更改。

## 语法

```shell
read [-ers] [-a array] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...] [name2 ...]
```

## 参数
* `-a array`: 将单词存储在一个名为`array`的索引数组中，数组元素的编号从`0`开始。
* `-d delim`: 将定界符设置为`delim`，该字符表示行尾，如果未使用`-d`，则默认行定界符为换行符。
* `-e`: 从`shell`获取一行输入，用户手动输入字符，直到达到行分隔符为止。
* `-i text`: 当与`-e`结合使用并且仅在不使用`-s`的情况下，文本将作为输入行的初始文本插入，允许用户在输入行上编辑文本。
* `-n nchars`: 如果尚未达到行定界符，则在读取整数`nchars`个字符后停止读取。
* `-N nchars`: 忽略行定界符，仅在已读取`nchars`个字符，达到`EOF`或读取超时之后才停止读取。
* `-p prompt`: 在开始读取之前，不使用换行符打印字符串提示符。
* `-r`: 使用原始输入，具体来说，这个选项使`read`按字面意思解释反斜杠，而不是将它们解释为转义字符。
* `-s`: 当`read`从终端获取输入时，不显示按键。
* `-t timeout`: 如果在超时秒内未读取完整的输入行，则超时并返回失败，如果超时值为零，那么`read`将不会读取任何数据，但是如果输入可用于读取，则返回成功。如果未指定超时，则使用`shell`变量`TMOUT`的值(如果存在)，超时值可以是小数，例如`3.5`。
* `-u fd`: 从文件描述符`fd`中读取而不是从标准输入中读取，文件描述符应该是一个`small integer`。


## 示例

读取终端的输入，循环读入一直持续到按`Ctrl + D`即`EOF`为止，由于指定变量名`text`，因此整行文本都存储在变量`text`中，每当输入一行后按回车时，将会把输入的内容输出。

```shell
while read text
    do echo "$text"
done
```

读取终端的输入，指定一个输入的超时时间。

```shell
if read -t 3 -p "Text: " text
then
    echo "Text: $text"
else
    echo -e "\nTimeout"
fi
```

按行读取文件中的内容。

```shell
cat test.txt | while read line
do
   echo "$line"
done
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/bash/read.htm
https://www.runoob.com/linux/linux-comm-read.html
https://linuxize.com/post/how-to-read-a-file-line-by-line-in-bash/
```
