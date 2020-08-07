# more命令
`more`命令类似`less`，以分页的形式浏览文件内容，在`more`命令退出后会在`shell`上留下操作的内容，在分页浏览时使用`h`键输出说明文件。

## 语法

```shell
more [options] [file]
```

## 参数
* `-d`: 提示使用者，在画面下方显示`[Press space to continue, 'q' to quit.]`，如果使用者按错键，则会显示`[Press 'h' for instructions.]`而不是滴声。
* `-f`: 计算行数时，以实际上的行数，而非自动换行过后的行数，某些单行字数太长的会被扩展为两行或两行以上。
* `-l`: 取消遇见特殊字元`^L`送纸字元时会暂停的功能。
* `-c`: 不进行滚动而是从顶部绘制每个屏幕，清除每行显示的其余部分，跟`-p`相似，不同的是先显示内容再清除其他输出。
* `-p`: 不以滚动的方式显示每一页，而是先清除输出后再显示内容。
* `-s`: 当遇到有连续两行以上的空白行，就代换为一行的空白行。
* `-u`: 不显示下划线，根据环境变数`TERM`指定的`terminal`而有所不同。
* `-<num>`: 指定每屏的行数。
* `+<num>`: 从第`num`行开始显示。
* `+/<str>`: 在每个文档显示前搜寻字串`str`，然后从该字串之后开始显示。
* `-V`: 显示版本信息。

## 常用操作
* `h or ?`: 帮助菜单，显示命令的摘要。
* `SPACE`: 显示接下来的`k`行文本，默认为当前屏幕尺寸。
* `Enter`: 向下`n`行，需要定义，默认为`1`行。
* `Ctrl+F`: 向下滚动一屏。
* `Ctrl+B`: 返回上一屏。
* `=`: 输出当前行的行号。
* `:f`: 输出文件名和当前行的行号。
* `V`: 调用`vi`编辑器。
* `! <cmd>`: 调用`Shell`，并执行命令。
* `q`: 退出`more`命令。

## 示例
分页显示`/var/log/ufw.log`文件内容。

```shell
more /var/log/ufw.log
```

从第`20`行开始显示`/var/log/ufw.log`文件内容。

```shell
more +20 /var/log/ufw.log
```

以`1`行分页显示`/var/log/ufw.log`文件内容。

```shell
more -1 /var/log/ufw.log
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-more.html
https://www.tutorialspoint.com/unix_commands/more.htm
https://alvinalexander.com/unix/edu/examples/more.shtml
```
