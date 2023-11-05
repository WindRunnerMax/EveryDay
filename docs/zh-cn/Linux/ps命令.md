# ps命令
`Linux`是一个多任务、多用户的操作系统，因此它允许多个进程同时运行而不相互干扰，进程是`Linux`操作系统的重要基本概念之一，进程是程序的执行实例，在操作系统中执行不同的任务。`Linux`为我们提供了一个名为`ps`的实用程序，用于查看与系统上的进程相关的信息，它是`process status`进程状态的缩写，`ps`命令用于列出当前正在运行的进程，它们的`pid`以及一些其他信息取决于不同的选项，它从`/proc`文件系统中的虚拟文件读取进程信息，`/proc`包含虚拟文件，这就是它被称为虚拟文件系统的原因，`process status`命令`ps`显示有关活动进程的信息，类似于`windows`的任务管理器，每个操作系统的`ps`版本都略有不同，因此若要是需要获取详细情况则需要查阅操作系统的`wiki`。

## 语法

```shell
ps [options]
```

## 参数
`ps`命令有多种类别的参数可以选择: `simple|list|output|threads|misc|all`。

### Simple Process Selection
* `-A, -e`: 选择所有进程。
* `-a`: 选择除会话引线和与终端无关的进程之外的所有进程。
* `a`: 列出带有终端`tty`的所有进程，包括其他用户进程，或者在与`x`选项一起使用时列出所有进程。
* `-d`: 选择除会话所属者以外的所有进程。
* `-N, --deselect`: 选择除满足指定条件的进程以外的所有进程。
* `r`: 将选择限制为仅运行进程。
* `T`: 选择与此终端关联的所有进程。
* `x`: 列出拥有的所有进程(和`ps`相同的`EUID`)，或者在和`a`选项一起使用时列出所有进程。

### Process Selection By List
* `-C <command>`: 按命令名选择，这将选择其可执行名称在`command`中给定的进程。
* `-G, --Group <GID>`: 按真实组`ID (RGID)`或名称选择，这将选择其真实组名或`ID`在`grplist`列表中的进程。
* `-g, --group <group>`: 按会话或有效组名选择。
* `-p, p, --pid <PID>`: 按进程`ID`选择。
* `--ppid <PID>`: 按父进程`ID`选择，这将选择`pidlist`中具有父进程`ID`的进程，也就是说，它选择的进程是`pidlist`中列出的那些进程的子进程。
* `-q, q, --quick-pid <PID>`: 按进程`ID`选择(快速模式)。
* `-s, --sid <session>`: 按会话`ID`选择。
* `-t, t, --tty <tty>`: 通过`tty (terminal)`选择。
* `-u, U, --user <UID>`: 根据有效的用户`ID (EUID)`或名称选择。
* `-U, --User <UID>`: 按真实用户`ID (RUID)`或名称选择。

### Output Format Control
* `-F`: 额外的完整格式。
* `-f`: 进行全格式列表，可以将此选项与其他`UNIX`样式的选项结合使用以添加其他列，它还会导致命令参数被打印，与`-L`一起使用时，将添加`NLWP`线程数和`LWP`线程`ID`列。
* `f, --forest`:` ASCII art`进程层次结构，如许多树，也称为林。
* `-H`: 显示进程层次结构(林)。
* `-j`: 作业格式。
* `j`: `BSD`作业控制格式。
* `-l`: 长格式，`-y`选项通常对此很有用。
* `l`: 显示`BSD`长格式。
* `-M, Z`: 对于`SE Linux`添加一列安全数据。
* `-O <format>`: 使用默认列预加载。
* `O <format>`: 与`-O`类似，具有`BSD`特性。
* `-o, o, --format <format>`: 指定用户定义的格式。
* `s`: 显示信号格式。
* `u`: 显示面向用户的格式。
* `v`: 显示虚拟内存格式。
* `X`: 寄存器格式。
* `-y`: 不显示标志，显示`rss`代替`addr`，此选项只能与`-l`一起使用。
* `--context`: 使用`SE Linux`时，显示安全上下文格式。
* `--headers`: 重复标题行，每页输出一行。
* `--no-headers`: 完全不打印标题行。
* `--cols, --columns, --width <num>`: 设置屏幕宽度。
* `--rows, --lines <num>`: 设置屏幕高度。

### Thread Display
* `H`: 将线程显示为进程。
* `-L`: 显示线程，可能带有`LWP`和`NLWP`列。
* `-m, m`: 在进程之后显示线程。
* `-T`: 显示线程，可能带有`SPID`列。

### Miscellaneous options
* `-c`: 为`-l`选项显示不同的调度程序信息。
* `c`: 显示真实的命令名称。
* `e`: 在命令后显示环境。
* `k, --sort`: 指定排序顺序为`[+|-]key[,[+|-]key[,...]]`。
* `L`: 显示格式说明符。
* `n`: 显示数字`uid`和`wchan`。
* `S, --cumulative`: 包含一些`dead`子进程数据。
* `-y`: 不显示标志，显示`rss`，仅与`-l`一起使用。
* `-V, V, --version`: 显示版本信息。
* `-w, w`: 无限制的输出宽度。
* `--help <simple|list|output|threads|misc|all>`: 显示帮助信息。

## 示例
显示当前`shell`的进程。

```
ps
```

查看所有正在运行的进程。

```
ps -e
```

通常查看所有进程可以与管道以及`grep`命令结合用以过滤，例如我们查看与`nginx`有关的所有进程。

```
 ps -e | grep nginx
```


查看除会话引线和未与终端关联的进程之外的所有进程。

```
ps -a
```

查看`www`用户的所有进程。

```
ps -u www
```


查看`www`组的所有进程。

```
ps -G www
```

使用`-f`查看完整格式列表。

```
ps -f
```

按用户自定义格式查看进程。

```
ps -aN --format cmd,pid,user,ppid
```

根据内存占用情况将进程排序。

```
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem
```

显示所有当前进程，为了便于查看可以结合管道和`less`命令来使用。

```
ps -ax | less
```

使用`aux`参数，加入`CPU`与内存用量信息，来显示全面的信息。

```
ps -aux | less
```

根据`CPU`使用将进程降序排序。

```
ps -aux --sort -pcpu | less
```

根据内存使用将进程降序排序。

```
ps -aux --sort -pmem | less
```

合并内存与`CPU`的整体使用情况进行排序，并只显示前`10`个结果。

```
ps -aux --sort -pcpu,+pmem | head -n 10
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ups.htm
https://www.runoob.com/linux/linux-comm-ps.html
https://www.geeksforgeeks.org/ps-command-in-linux-with-examples/
```