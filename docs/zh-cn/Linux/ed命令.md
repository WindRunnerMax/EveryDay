# ed命令
`ed`命令是文本编辑器，用于文本编辑，`ed`是`Linux`中功能最简单的文本编辑程序，一次仅能编辑一行而非全屏幕方式的操作。`ed`命令并不是一个常用的命令，一般使用比较多的是`vi`指令，但`ed`文本编辑器对于编辑大文件或对于在`shell`脚本程序中进行文本编辑很有用。如果使用文件名参数调用`ed`，则文件的副本将被读入编辑器的缓冲区，对该副本进行更改，而不是直接对文件本身进行更改。退出`ed`后，任何未使用`w`命令显式保存的更改都将丢失。编辑有两种不同的模式：命令和输入。第一次调用时，`ed`处于命令模式，在这种模式下，命令从标准输入中读取并执行以操作编辑器缓冲区的内容。

## 语法

```shell
ed [options] [file]
```

## 参数
* `-G, --traditional`: 在兼容模式下运行。
* `-l, --loose-exit-status`: 即使命令失败，也以零状态退出(正常终止)。例如如果将`ed`设置为`crontab`的编辑器，则此选项很有用。
* `-p, --prompt=STRING`: `ed`通常在空白行等待用户输入，此选项将使用字符串作为提示。
* `-r, --restricted`: 在受限模式下运行。
* `-s, --quiet, --silent`: 禁止诊断。
* `-v, --verbose`: 详细操作。
* `-h, --help`: 显示帮助信息。
* `-V, --version`: 显示版本信息。

## 状态码
* `0`表示正常退出。
* `1`表示环境问题，例如文件未找到、无效标志、`I/O`错误等等。
* `2`表示损坏或无效的输入文件。
* `3`表示内部一致性错误(如软件`bug`)，导致`ed`死机。

## 示例
比较完整的编辑示例。

```shell
ed
a
My name is Titan.
And I love Perl very much.
.
i
I am 24.
.
c
I am 24 years old. 
.
w readme.txt
q
```

```
ed                          # 激活 ed 命令 
a                           # 告诉 ed 我要编辑新文件 
My name is Titan.           # 输入第一行内容 
And I love Perl very much.  # 输入第二行内容 
.                           # 返回 ed 的命令行状态 
i                           # 告诉 ed 我要在最后一行之前插入内容 
I am 24.                    # 将 I am 24. 插入 My name is Titan. 和 And I love Perl very much. 之间 
.                           # 返回 ed 的命令行状态 
c                           # 告诉 ed 我要替换最后一行输入内容 
I am 24 years old.          # 将 I am 24. 替换成 I am 24 years old. ，这里替换的是最后输的内容
.                           # 返回 ed 的命令行状态 
w readme.txt                # 将文件命名为 readme.txt 并保存，如果是编辑已经存在的文件，只需要敲入 w 即可
q                           # 完全退出 ed 编辑器 
```


```
cat readme.txt
# My name is Titan.
# I am 24 years old. 
# And I love Perl very much.
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ued.htm
https://www.runoob.com/linux/linux-comm-ed.html
https://www.geeksforgeeks.org/ed-command-in-linux-with-examples/
```

