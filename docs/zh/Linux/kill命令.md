# kill命令
`kill`命令向指定的`pid`进程发送信号，如果不指定要发送的`signal`信号，则默认情况下`signal`是`SIGTERM`，它会终止进程，要列出所有可用信号，可以使用`-l`选项获取`Linux`信号列表，经常使用的信号包括`HUP`、`INT`、`KILL`、`STOP`、`CONT`和`0`，可以通过三种方式指定信号: 按数字例如`-9`，带有`SIG`前缀例如`-SIGKILL`，不带`SIG`前缀例如`-KILL`。负`PID`值用于指示过程组`ID`，如果传递了进程组`ID`，则该组中的所有进程都将接收到该信号，`PID`为`-1`是特殊的，其指示除两个以外的所有进程，`kill`进程本身和`init`即`PID 1`，其是系统上所有进程的父进程，将`-1`指定为目标会将信号发送到除这两个以外的所有进程。

## 语法

```shell
kill pid ...
kill {-signal | -s signal} pid ...
kill {-l | --list[=signal] | -L | --table}
```

## 参数
* `-signal, -s signal`: 要发送的信号的名称、缩写名或编号，前面有破折号，例如`-SIGTERM`、`-TERM`、`-15`等，要查看可用信号的列表可以使用`kill -l`。
* `pid`: 数字进程`ID`，如果不确定某个进程的`PID`是什么，可以使用`ps`命令将其列出例如`ps -aux`，通常会配合管道与`grep`使用例如查看`nginx`相关的进程` ps -aux | grep nginx`。
* `-l, --list[=signal]`: 列出可用的信号名称，用`-l`或`--list`列出所有信号名称，使用`--list = signal`，可将数字转换为其信号名称。
* `-L, --table`: 在表格中列出可用的信号名称和编号。

## 信号
下列的某些信号是不能使用的，因为系统有可能不支持这些信号，或者这些信号已中断，详情可以实际查阅系统的`kill -l`命令。每个系统都有信号`1`、`3`、`9`和`15`，这些是最常见的信号。终止信号不仅用于关闭锁定的应用程序，还可以阻止软件执行不允许的任务，这意味着其中一些终止信号是安全的一部分，另外`kill`命令不仅停止`/`终止进程，而且还暂停，继续和重新启动进程。

```
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14 49) SIGRTMIN+15 50) SIGRTMAX-14 51) SIGRTMAX-13 52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX
```

* `SIGHUP`: `SIGHUP`信号用于断开进程与父进程的连接，这也可以用于重新启动进程，这对于内存泄漏的守护程序很有用。
* `SIGINT`: 该信号与按`Ctrl+C`相同，在某些系统上`delete + break`会向进程发送相同的信号，该进程被中断并停止，但是该进程自身可以忽略此信号。
* `SIGQUIT`: 这类似于`SIGINT`，但由于`QUIT`字符通常是由`Ctrl+\`来控制，进程在收到`SIGQUIT`退出时会产生`core`文件, 在这个意义上类似于一个程序错误信号。
* `SIGILL`: 当一个进程执行一个错误的、禁止的或未知的功能时，系统向该进程发送`SIGILL`信号，这是代表非法操作的信号。
* `SIGTRAP`: 此信号用于调试目的，当某个进程执行了某个操作或满足了调试器正在等待的条件时，此信号将被发送到该进程。
* `SIGABRT`: 该终止信号是中止信号,通常进程会在自身上发出此终止信号。
* `SIGBUS`: 当一个进程被发送`SIGBUS`信号时，是因为该进程导致了一个总线错误，通常这些总线错误是由于进程试图使用假物理地址或进程的内存对齐设置不正确造成的。
* `SIGFPE`: 被零除的进程使用`SIGFPE`终止。
* `SIGKILL`: `SIGKILL`信号强制进程立即停止执行，程序不能忽略该信号，此过程也无法清除。
* `SIGUSR1`: 这表示用户定义的条件，用户可以通过在`sigusr1.c`中编程命令来设置此信号。
* `SIGSEGV`: 当应用程序有分段冲突时，这个信号被发送到进程。
* `SIGUSR2`: 这表示用户定义的条件。
* `SIGPIPE`: 当进程尝试写入缺少与读取器连接的一端的管道时，此信号将发送到进程，读取器是在管道末端读取数据的过程。
* `SIGALRM`: 当实时或时钟计时器到期时，将发送`SIGALRM`。
* `SIGTERM`: 该信号请求进程停止运行，该信号可以被程序自身忽略，该过程有时间正常关闭，当程序正常关闭时，这意味着它有时间保存进度并释放资源，换句话说即它不被迫停止。
* `SIGCHLD`: 当父进程丢失其子进程时，将向父进程发送`SIGCHLD`信号，这将清理子进程使用的资源，子进程指的是由另一个称为父进程的进程启动的进程。
* `SIGCONT`: 要使进程在被`SIGTSTP`或`SIGSTOP`信号暂停后继续执行，需要将`SIGCONT`信号发送到已暂停的进程，这是`CONTiNUE SIGNAL`，该信号对`Unix`作业控制执行后台任务很有帮助。
* `SIGSTOP`: 该信号使操作系统暂停进程的执行，进程自身不能忽略该信号。
* `SIGTSTP`: 这个信号类似于按下`Ctrl+Z`，它向包含进程的终端发出请求，请求进程暂时停止，进程自身可以忽略该信号。
* `SIGTTIN`: 当进程试图从`tty`终端读取数据时，进程接收到这个信号。
* `SIGTTOU`: 当某个进程尝试向`tty`终端进行写操作时，该进程将收到此信号。
* `SIGURG`: 当进程中有紧急数据要读取或数据非常大时，`SIGURG`信号将发送到该进程。
* `SIGXCPU`: 当某个进程在分配的时间之后使用`CPU`时，系统将向该进程发送该信号，`SIGXCPU`的行为就像一个警告，该进程有时间保存进度(如果可能)并在系统使用`SIGKILL`终止该进程之前将其关闭。
* `SIGXFSZ`: 文件系统对文件的大小有限制，当程序尝试违反此限制时，系统将发送该过程`SIGXFSZ`信号。
* `SIGVTALRM`: `SIGVTALRM`在进程使用的`CPU`时间结束时发送。
* `SIGPROF`: 当进程以及由系统代表进程使用的`CPU`时间过去时，将发送`SIGPROF`信号。
* `SIGWINCH`: 当进程在更改其大小的终端中时，该进程将接收此信号。
* `SIGIO`: `SIGPOLL`的别名或至少表现得很像`SIGPOLL`。
* `SIGPWR`: 电源故障将导致系统将该信号发送到进程，如果系统仍在运行。
* `SIGSYS`: 为系统调用提供无效参数的进程将接收此信号。
* `SIGRTMIN*`: 这是一组在系统之间变化的信号，它们被标记为`SIGRTMIN + 1`、`SIGRTMIN + 2`、`SIGRTMIN + 3`、`...`，通常最多`15`个，这些是用户定义的信号，它们必须在`Linux`内核的源代码中进行编程。
* `SIGRTMAX*`: 这是一组在系统之间变化的信号，它们被标记为`SIGRTMAX-1`、`SIGRTMAX-2`、`SIGRTMAX-3`、`...`，通常最多`14`个，这些是用户定义的信号，它们必须在`Linux`内核的源代码中进行编程。
* `SIGEMT`:  指示一个实现定义的硬件故障。
* `SIGINFO`: 终端有时可能会向进程发送状态请求，发生这种情况时，进程也将收到此信号。
* `SIGLOST`: 试图访问锁定文件的进程将收到此信号。
* `SIGPOLL`: 当进程引起异步`I/O`事件时，会向该进程发送`SIGPOLL`信号。

## 示例
要显示所有可用信号，查看信号的详细信息可以使用`man`命令，例如信号`7 SIGBUS`即使用`man 7 signal`。

```shell
kill -l
```

在表格中列出可用的信号名称和编号。

```shell
kill -L
```


终端断线，重新加载配置文件，平滑重启。

```
kill -1 111
```

通知进程关闭，使进程自行关闭，这个关闭是安全、干净地退出，如果`kill`命令后直接加进程的`pid`号默认选项为`-15`，这个信号是可以被进程自身忽略并继续执行自身的，即该信号是可以被阻塞和忽略的。

```
kill -15 111
```

强行中断当前程序的执行，类似`Ctrl+C`按键用以结束进程的结果，该信号是可以被阻塞和忽略的。

```
kill -2 111
```

退出进程，类似`Ctrl+\`按键用以结束进程的结果，该信号是可以被阻塞和忽略的。

```
kill -3 111
```

强行关闭进程，`-9`信号是无条件终止，这个信号不能被捕获或忽略，同时接收这个信号的进程在收到这个信号时不能执行任何清理，该信号是不可以被阻塞和忽略的，当然通常是不建议使用`kill -9`的，应该尝试使用`-15`以及`-2`给目标进程一个清理自身资源工作的机会，不要用收割机来修剪花盆里的花。

```
kill -9 111
```

暂停进程，对于暂停信号进程自身不能忽略该信号。

```
kill -19 111 
```

激活进程，对于激活信号必须发送到已暂停的进程才有效。

```
kill -18 111 
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ukill.htm
https://www.linux.org/threads/kill-commands-and-signals.8881/
https://www.geeksforgeeks.org/kill-command-in-linux-with-examples/
```