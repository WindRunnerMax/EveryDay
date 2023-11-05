# pico命令
`pico`是一个简单易用、以显示导向为主的文字编辑程序，具有`pine`电子邮件编写器的风格。在现代`Linux`系统上，`nano`即`pico`的`GNU`版本是默认安装的，在使用上和`pico`一模一样。

## 语法

```
nano [OPTIONS] [[+LINE[,COLUMN]] FILE]...
```

## 参数
* `+LINE[,COLUMN]`: 启动时将光标放置在行号行和列号列，而不是默认的第`1`行第`1`列。
* `-?`: 与`-h`相同。
* `-A, --smarthome`: 使`Home`键更智能，如果在一行中非空格字符的开头但在任何地方按`Home`键，则光标将跳到该开头(向前或向后)，如果光标已经在该位置，它将跳到该行的真实开头。
* `-B, --backup`: 保存文件时，将以前版本的文件备份到以`~`为后缀的当前文件名。
* `-C dir, --backupdir=dir`: 如果启用了文件备份，请设置`nano`放置唯一备份文件的目录。
* `-D, --boldtext`: 使用粗体文本而不是反向视频文本。
* `-E, --tabstospaces`: 将键入的制表符转换为空格。
* `-F, --multibuffer`: 如果可用，启用多个文件缓冲区。
* `-H, --historylog`: 记录搜索并将字符串替换为`~/.nano_history`，如果有`nanorc`支持，则可以在以后的会话中检索它们。
* `-I, --ignorercfiles`: 如果有`nanorc`支持，不要检索`SYSCONFDIR/nanorc`或`~/.nanorc`。
* `-K, --rebindkeypad`: 解释数字小键盘的键，以便它们都可以正常工作。如果不需要，则不需要使用此选项，因为启用此选项后，鼠标支持将无法正常工作。
* `-L, --nonewlines`: 不要在文件末尾添加换行符。
* `-N, --noconvert`: 禁止从`DOS/Mac`格式自动转换文件。
* `-O, --morespace`: 使用标题栏下方的空白行作为额外的编辑空间。
* `-Q str, --quotestr=str`: 设置引号字符串以进行证明。如果有扩展的正则表达式支持，则默认值为`^([ \t]*[#:>\|}])+`，否则为`>`。请注意`\t`代表`Tab`。
* `-R, --restricted`: 限制模式，不读取或写入命令行中未指定的任何文件，读取任何`nanorc`文件，允许挂起，允许将文件附加到其他名称(如果已经有文件名)或以其他名称保存，或者使用备份文件或拼写检查。也可以通过使用以`r`开头的任何名称调用`nano`(例如`rnano`)进行访问。
* `-S, --smooth`: 启用平滑滚动，文本将逐行滚动，而不是通常的逐块行为。
* `-T cols, --tabsize=cols`: 将选项卡的大小(宽度)设置为列，`cols`的值必须大于`0`，默认值为`8`。
* `-U, --quickblank`: 快速清除状态栏，`1`次按键而不是`25`次按键后，状态栏消息将消失，请注意`-c`会覆盖此内容。
* `-V, --version`: 输出版本信息。
* `-W, --wordbounds`: 通过将标点符号视为单词的一部分，可以更准确地检测单词边界。
* `-Y str, --syntax=str`: 从`nanorc`中指定要使用的特定语法高亮显示(如果可用)。
* `-c, --const`: 不断显示光标位置，请注意这将覆盖`-U`。
* `-d, --rebinddelete`: 以不同的方式解释`Delete`键，以便退格键和`Delete`键都能正常工作，只有当退格符在系统上的作用类似于`Delete`时，您才需要使用此选项。
* `-h, --help`: 输出帮助信息。
* `-i, --autoindent`: 将新行缩进到前一行的缩进中，在编辑源代码时很有用。
* `-k, --cut`: 启用从光标到行尾的剪切。
* `-l --nofollow`: 如果正在编辑的文件是符号链接，请用新文件替换该链接，而不是跟随它,，也许适合在`/tmp`中编辑文件。
* `-m, --mouse`: 启用鼠标支持(如果适用于您的系统)。设置快捷方式时，可以用鼠标双击鼠标来执行标记，鼠标将在`X`窗口系统中工作，并在`gpm`运行时在控制台上工作。
* `-o dir, --operatingdir=dir`: 设置操作目录，使`nano`设置类似于`chroot`。
* `-p, --preserve`: 保留`XON`和`XOFF`序列`^Q`和`^S`，以便它们被终端捕获。
* `-r cols, --fill=cols`: 在列`cols`处换行，如果此值等于或小于`0`，则将在屏幕的宽度减去`cols`列的宽度处进行换行，如果调整了屏幕大小，则换行点将随着屏幕的宽度而变化，默认值为`-8`。
* `-s prog, --speller=prog`: 启用备用拼写检查程序命令。
* `-t, --tempfile`: 始终保存更改的缓冲区而无提示，与`Pico`的`-t`选项相同。
* `-v, --view`: 查看文件(只读)模式。
* `-w, --nowrap`: 禁用长行换行。
* `-x, --nohelp`: 禁用编辑器底部的帮助屏幕。
* `-z, --suspend`: 启用暂停功能。
* `-a, -b, -e, -f, -g, -j`: 由于与`Pico`的兼容性而被忽略。

## 示例
使用`nano`编辑文件，根据操作提示编辑文件。

```shell
nano file.txt

# ^G Get Help
# ^O WriteOut
# ^R Read File
# ^Y Prev Page
# ^K Cut Text
# ^C Cur Pos
# ^X Exit
# ^J Justify
# ^W Where Is
# ^V Next Page
# ^U UnCut Text
# ^T To Spell
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-pico.html
https://www.tutorialspoint.com/unix_commands/nano.htm
https://www.geeksforgeeks.org/nano-text-editor-in-linux/
```

