# diff命令
`diff`命令能够比较给定的两个文件的不同，如果使用`-`代替文件参数，则要比较的内容将来自标准输入，`diff`命令是以逐行的方式比较文本文件的异同处，如果该命令指定进行目录的比较，则将会比较该目录中具有相同文件名的文件，而不会对其子目录文件进行任何比较操作。

## 语法

```shell
diff [-abBcdefHilnNpPqrstTuvwy][-<line>][-C <line>][-D <macro>][-I <string>][-S <file>][-W <width>][-x <file or folder>][-X <file>][--help][--left-column][--suppress-common-line][file or folder][file or folder]
```

## 参数
* `-a`或`--text`: `diff`预设只会逐行比较文本文件。
* `-b`或`--ignore-space-change`: 不检查空格字符的不同。
* `-B`或`--ignore-blank-lines`: 不检查空白行。
* `-c`: 显示全部内容，并标出不同之处。
* `-C <line>`或`--context <line>`: 与执行`-c-<line>`指令相同。
* `-d`或`--minimal`: 使用不同的演算法，以小的单位来做比较。
* `-D <macro>`或`ifdef <macro>`: 此参数的输出格式可用于前置处理器巨集。
* `-e`或`--ed`: 此参数的输出格式可用于`ed`的`script`文件。
* `-f`或`-forward-ed`: 输出的格式类似`ed`的`script`文件，但按照原来文件的顺序来显示不同处。
* `-H`或`--speed-large-files`: 比较大文件时，可加快速度。
* `-l<string>`或`--ignore-matching-lines<string>`: 若两个文件在某几行有所不同，而这几行同时都包含了选项中指定的字符或字符串，则不显示这两个文件的差异。
* `-i`或`--ignore-case`: 不检查大小写的不同。
* `-l`或`--paginate`: 将结果交由`pr`程序来分页。
* `-n`或`--rcs`: 将比较结果以`RCS`的格式来显示。
* `-N`或`--new-file`: 在比较目录时，若文件`A`仅出现在某个目录中，预设会显示`Only in <folder>`，文件`A`若使用`-N`参数，则`diff`会将文件`A`与一个空白的文件比较。
* `-p`: 若比较的文件为`C`语言的程序码文件时，显示差异所在的函数名称。
* `-P`或`--unidirectional-new-file`: 与`-N`类似，但只有当第二个目录包含了第一个目录所没有的文件时，才会将这个文件与空白的文件做比较。
* `-q`或`--brief`: 仅显示有无差异，不显示详细的信息。
* `-r`或`--recursive`: 比较子目录中的文件。
* `-s`或`--report-identical-files`: 若没有发现任何差异，仍然显示信息。
* `-S <file>`或`--starting-file <file>`: 在比较目录时，从指定的文件开始比较。
* `-t`或`--expand-tabs`: 在输出时，将`tab`字符展开。
* `-T`或`--initial-tab`: 在每行前面加上`tab`字符以便对齐。
* `-u`，`-U <columns>`或`--unified=<columns>`: 以合并的方式来显示文件内容的不同。
* `-v`或`--version`: 显示版本信息。
* `-w`或`--ignore-all-space`: 忽略全部的空格字符。
* `-W <width>`或`--width <width>`: 在使用`-y`参数时，指定栏宽。
* `-x <file or folder>`或`--exclude <file or folder>`: 不比较选项中所指定的文件或目录。
* `-X<file>`或`--exclude-from<file>`: 您可以将文件或目录类型存成文本文件，然后在`<file>`中指定此文本文件。
* `-y`或`--side-by-side`: 以并列的方式显示文件的异同之处。
* `--help`: 显示帮助。
* `--left-column`: 在使用`-y`参数时，若两个文件某一行内容相同，则仅在左侧的栏位显示该行内容。
* `--suppress-common-lines`: 在使用`-y`参数时，仅显示不同之处。

## 示例
比较`file.txt`与`file2.txt`文件的差异，仅输出不同之处。

```shell
diff file.txt file2.txt
```

比较`file.txt`与`file2.txt`文件的差异，并排输出全部内容，`|`表示前后`2`个文件内容有不同，`<`表示后面文件比前面文件少了`1`行内容，`>`表示后面文件比前面文件多了`1`行内容。

```shell
diff -y file.txt file2.txt 
```

比较`file.txt`与自定义输入内容的差异，输入内容后按`Ctrl+D`输出`EOF`标识后结束输入。

```shell
diff -y file.txt -
```
    


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/diff
https://www.cnblogs.com/wf-linux/p/9488257.html
https://www.runoob.com/linux/linux-comm-diff.html
```
