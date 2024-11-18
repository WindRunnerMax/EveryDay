# kill command
The `kill` command sends a signal to the specified `pid` process. If the `signal` to be sent is not specified, then by default the `signal` is `SIGTERM`, which terminates the process. To display all available signals, the `-l` option can be used to obtain the Linux signal list. Commonly used signals include `HUP`, `INT`, `KILL`, `STOP`, `CONT`, and `0`. Signals can be specified in three ways: by number, for example, `-9`; with the `SIG` prefix, for example, `-SIGKILL`; or without the `SIG` prefix, for example, `-KILL`. Negative `PID` values are used to indicate process group `ID`. If a process group `ID` is passed, then all processes in that group will receive the signal. `PID` `-1` is special, as it indicates all processes except for two: the `kill` process itself and `init`, specifically `PID 1`, which is the parent process of all processes on the system. Specifying `-1` as the target will send the signal to all processes except these two.

## Syntax

```shell
kill pid ...
kill {-signal | -s signal} pid ...
kill {-l | --list[=signal] | -L | --table}
```

## Parameters
* `-signal, -s signal`: The name, abbreviation, or number of the signal to be sent, preceded by a hyphen, for example, `-SIGTERM`, `-TERM`, `-15`, etc. To view a list of available signals, use `kill -l`.
* `pid`: Numeric process `ID`. If uncertain about a specific process's `PID`, it can be listed using the `ps` command, for example, `ps -aux`. Typically, it is used in conjunction with a pipe and `grep`, for example, to view `nginx`-related processes, `ps -aux | grep nginx`.
* `-l, --list[=signal]`: Lists available signal names. Use `-l` or `--list` to list all signal names. Using `--list = signal` can convert numbers into their signal names.
* `-L, --table`: Lists available signal names and numbers in a table format.

## Signals
Certain signals may not be used because they may not be supported by the system or have been interrupted. For details, refer to the actual system's `kill -l` command. Every system has signals `1`, `3`, `9`, and `15`, which are the most common. Termination signals are used not only to close locked applications but also to prevent software from performing unauthorized tasks. This means that some termination signals are a secure aspect. Additionally, the `kill` command not only stops or terminates processes, but also pauses, resumes, and restarts processes.

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


* `SIGHUP`: The `SIGHUP` signal is used to disconnect a process from its parent process, and it can also be used to restart a process, which is useful for daemons with memory leaks.
* `SIGINT`: This signal is equivalent to pressing `Ctrl+C`. On some systems, `delete + break` will send the same signal to the process, causing it to interrupt and stop, but the process itself can ignore this signal.
* `SIGQUIT`: Similar to `SIGINT`, but because the `QUIT` character is usually controlled by `Ctrl+\`, when a process exits upon receiving `SIGQUIT`, a `core` file is generated, in this sense similar to a program error signal.
* `SIGILL`: When a process performs an erroneous, prohibited, or unknown operation, the system sends a `SIGILL` signal to the process, representing an illegal operation.
* `SIGTRAP`: This signal is used for debugging purposes. It is sent to a process when it performs an operation or meets a condition that the debugger is waiting for.
* `SIGABRT`: This termination signal is an abort signal. Typically, a process sends this termination signal to itself.
* `SIGBUS`: When a process receives a `SIGBUS` signal, it is because the process has caused a bus error. Typically, these bus errors occur when a process attempts to use a false physical address or when the process's memory alignment settings are incorrect.
* `SIGFPE`: Processes that attempt to divide by zero terminate using the `SIGFPE` signal.
* `SIGKILL`: The `SIGKILL` signal forces a process to immediately stop executing. The program cannot ignore this signal, and this process cannot be cleaned up either.
* `SIGUSR1`: This represents a user-defined condition, and users can set this signal by programming a command in `sigusr1.c`.
* `SIGSEGV`: This signal is sent to a process when there is a segmentation fault in the application.
* `SIGUSR2`: This represents a user-defined condition.
* `SIGPIPE`: This signal is sent to a process when it attempts to write to one end of a pipe that is not connected to a reader. The reader is the process that is reading data from the end of the pipe.
* `SIGALRM`: The `SIGALRM` signal is sent when a real-time or clock timer expires.
* `SIGTERM`: This signal requests that a process stop running. This signal can be ignored by the program itself, and the process has time to shut down gracefully. When a program shuts down normally, it means that it has time to save its progress and release resources, in other words, it is not forced to stop.
* `SIGCHLD`: When a parent process loses its child process, the parent process receives the `SIGCHLD` signal, which cleans up the resources used by the child process. A child process refers to a process started by another process called the parent process.
* `SIGCONT`: To make a process continue running after being paused by a `SIGTSTP` or `SIGSTOP` signal, the `SIGCONT` signal needs to be sent to the paused process. This is the `CONTiNUE SIGNAL`, and it is very useful for executing background tasks in Unix job control.
* `SIGSTOP`: This signal causes the operating system to pause the execution of a process, and the process itself cannot ignore this signal.
* `SIGTSTP`: This signal is similar to pressing `Ctrl+Z`. It sends a request to the terminal containing the process to temporarily stop, and the process itself can ignore this signal.
* `SIGTTIN`: The process receives this signal when it attempts to read data from a `tty` terminal.
* `SIGTTOU`: When a process attempts to perform a write operation on a `tty` terminal, the process receives this signal.
* `SIGURG`: The `SIGURG` signal is sent to the process when there is urgent data to be read or when the data is very large.
* `SIGXCPU`: When a process uses the `CPU` after the allocated time, the system sends this signal to the process. The behavior of `SIGXCPU` is like a warning, giving the process time to save its progress (if possible) and close it before the system terminates it using `SIGKILL`.
* `SIGXFSZ`: When a program attempts to violate the size limitation of a file system, the system sends the `SIGXFSZ` signal to the process.
* `SIGVTALRM`: The `SIGVTALRM` signal is sent when the `CPU` time used by the process expires.
* `SIGPROF`: The `SIGPROF` signal is sent when the process exceeds the `CPU` time used on behalf of the process by the system.
* `SIGWINCH`: The process will receive this signal when it is in a terminal that is changing its size.
* `SIGIO`: An alias for `SIGPOLL`, or at least behaves very much like `SIGPOLL`.
* `SIGPWR`: If there is a power failure, the system will send this signal to the process if it is still running.
* `SIGSYS`: A process that provides invalid arguments for a system call will receive this signal.
* `SIGRTMIN*`: This is a group of signals that vary between systems, they are marked as `SIGRTMIN + 1`, `SIGRTMIN + 2`, `SIGRTMIN + 3`, `...`, typically up to a maximum of `15`, these are user-defined signals that must be programmed in the source code of the Linux kernel.
* `SIGRTMAX*`: This is a group of signals that vary between systems, they are marked as `SIGRTMAX-1`, `SIGRTMAX-2`, `SIGRTMAX-3`, `...`, typically up to a maximum of `14`, these are user-defined signals that must be programmed in the source code of the Linux kernel.
* `SIGEMT`: Indicates an implementation-defined hardware fault.
* `SIGINFO`: Sometimes, the terminal may send a status request to the process, in which case the process will also receive this signal.
* `SIGLOST`: A process that tries to access a locked file receives this signal.
* `SIGPOLL`: When a process causes an asynchronous `I/O` event, the `SIGPOLL` signal is sent to the process.

## Example
To display all available signals and view detailed information about a signal, the `man` command can be used, for example for the signal `7 SIGBUS` you can use `man 7 signal`.

```shell
kill -l
```
List the available signal names and numbers in a table.

```shell
kill -L
```
Terminate the session, reload the configuration file, and smoothly restart.

```shell
kill -1 111
```
Notify the process to close, allowing it to shut down on its own in a safe, clean manner. If the `kill` command is followed directly by the process's `pid`, the default option is `-15`. This signal can be ignored and the process can continue. It can be blocked and ignored.

```shell
kill -15 111
```
Forcefully interrupt the current program's execution, similar to pressing `Ctrl+C` to terminate a process. This signal can be blocked and ignored.

```shell
kill -2 111
```
Exit the process, similar to pressing `Ctrl+\` to terminate a process. This signal can be blocked and ignored.

```shell
kill -3 111
```
Forcefully terminate the process. The `-9` signal unconditionally terminates a process, cannot be caught or ignored, and the receiving process cannot perform any cleanup upon receiving this signal. This signal cannot be blocked or ignored, but it's generally not recommended to use `kill -9`. It's better to try using `-15` and `-2` to give the target process a chance to clean up its resources. Don't use a scythe to prune the flowers in a flowerpot.

```shell
kill -9 111
```
Pause the process. The process itself cannot ignore this pause signal.

```shell
kill -19 111 
```
Resume the process. The resume signal must be sent to a paused process to be effective.

```shell
kill -18 111 
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/ukill.htm
https://www.linux.org/threads/kill-commands-and-signals.8881/
https://www.geeksforgeeks.org/kill-command-in-linux-with-examples/
```