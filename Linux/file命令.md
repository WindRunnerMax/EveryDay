# file命令
`file`命令用来探测给定文件的类型，`file`命令对文件的检查分为文件系统、魔法文件和语言检查`3`个过程。

## 语法

```shell
file [ -bchikLnNprsvz ] [ -f namefile ] [ -F separator ] [ -m magicfiles ] [file or folder] ...
file -C [ -m magicfile ]
```

## 参数
* `-b, --brief`: 简洁模式，列出辨识结果时，不显示文件名称。
* `-c, --checking-printout`: 详细显示指令执行过程，便于排错或分析程序执行的情形。
* `-C, --compile`: 编译一个`magic.mgc`输出文件，其中包含文件的预解析版本。
* `-f, --files-from <file>`: 指定名称文件，其内容有一个或多个文件名称时，让`file`依序辨识这些文件，格式为每列一个文件名称。
* `-F, --separator separator`: 使用指定的字符串作为文件名和返回的文件结果之间的分隔符，默认为`:`。
* `-i, --mime`: 使文件命令输出`mime`类型。
* `-L`: 直接显示符号连接所指向的文件的类别。
* `-L, --dereference`: 跟随符号链接，如果设置了`POSIXLY_CORRECT`，则为默认值。
* `-m <file>`: 指定魔法文件，`magic file`规则就是根据文件的特殊内容去判断一个文件的类型，例如`tar`格式的标识信息，通常默认`magic file`文件存在于`/usr/share/file/`等目录下。
* `-n, --no-buffer`: 检查每个文件后强制刷新标准输出，仅在检查文件列表时才有用，该选项供希望从管道输出文件类型的程序使用。
* `-N, --no-pad`: 不要填充文件名，以使它们在输出中对齐。
* `-r, --raw`: 不将无法打印的字符翻译为`\ooo`，通常文件将不可打印的字符转换为八进制表示形式。
* `-v`: 显示版本信息。
* `-z`: 尝试去解读压缩文件的内容。
* `file or folder`: 要确定类型的文件列表，多个文件之间使用空格分开，可以使用`shell`通配符匹配多个文件。

## 示例

显示文件类型。

```shell
file file.txt
# file.txt: ASCII text
```

显示文件`MIME`类型。

```shell
file -i file.txt
# file.txt: text/plain; charset=us-ascii
```

简洁模式，不显示文件名。

```shell
file -b -i file.txt
# text/plain; charset=us-ascii
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-file.html
https://www.tutorialspoint.com/unix_commands/file.htm
https://blog.csdn.net/pzqingchong/article/details/70226640
```
