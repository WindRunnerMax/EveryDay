# ps command
`Linux` is a multitasking, multi-user operating system, so it allows multiple processes to run simultaneously without interfering with each other. Process is one of the important basic concepts of the `Linux` operating system. A process is an instance of a program that performs different tasks in the operating system. `Linux` provides us with a utility called `ps` to view information related to processes on the system. It is an abbreviation for `process status`. The `ps` command is used to list the currently running processes, their `pid`, and some other information depending on different options. It reads process information from virtual files in the `/proc` file system. `process status` command `ps` displays information about active processes, similar to the Task Manager in `Windows`. Each operating system's version of `ps` is slightly different, so if detailed information is needed, it is necessary to consult the operating system's `wiki`.

## Syntax

```shell
ps [options]
```

## Parameters
The `ps` command has various categories of parameters to choose from: `simple|list|output|threads|misc|all`.

### Simple Process Selection
* `-A, -e`: Select all processes.
* `-a`: Select all processes except session leaders and processes without a controlling terminal.
* `a`: List all processes with a terminal `tty`, including processes from other users, or list all processes when used with the `x` option.
* `-d`: Select all processes except session leaders.
* `-N, --deselect`: Select all processes except those that satisfy the specified conditions.
* `r`: Restrict the selection to only running processes.
* `T`: Select all processes associated with this terminal.
* `x`: List processes without controlling terminals for a pseudoterminal, just like `ps` and `EUID`, or list all processes when used with the `a` option.

### Process Selection By List
* `-C <command>`: Select by command name, this selects processes whose executable name is given in `command`.
* `-G, --Group <GID>`: Select by real group `ID (RGID)` or name, this selects processes with a real group name or `ID` in the `grplist`.
* `-g, --group <group>`: Select by session or effective group name.
* `-p, p, --pid <PID>`: Select by process `ID`.
* `--ppid <PID>`: Select by parent process `ID`, this selects processes with a parent process `ID` from the `pidlist`, in other words, it selects the child processes of those processes listed in `pidlist`.
* `-q, q, --quick-pid <PID>`: Select by process `ID` (quick mode).
* `-s, --sid <session>`: Select by session `ID`.
* `-t, t, --tty <tty>`: Select by `tty (terminal)`.
* `-u, U, --user <UID>`: Select by effective user `ID (EUID)` or name.
* `-U, --User <UID>`: Select by real user `ID (RUID)` or name.

### Output Format Control
* `-F`: Extra full format.
* `-f`: Full format listing, this option may be combined with other `UNIX` style options to add additional columns, it also causes the command arguments to be printed. When used with `-L`, it will add the `NLWP` thread count and `LWP` thread `ID` columns.
* `f, --forest`: ASCII art process hierarchy, like many trees, also called a forest.
* `-H`: Display process hierarchy (forest).
* `-j`: Job control format.
* `j`: `BSD` job control format.
* `-l`: Long format, the `-y` option is often useful with this.
* `l`: Display `BSD` long format.
* `-M, Z`: Add a security data column for `SE Linux`.
* `-O <format>`: Preload default column list.
* `O <format>`: Similar to `-O` with `BSD` features.
* `-o, o, --format <format>`: Specify user-defined format.
* `s`: Display signal format.
* `u`: Display user-oriented format.
* `v`: Display virtual memory format.
* `X`: Display register format.
* `-y`: Do not show flags, display `rss` instead of `addr`, this option can only be used with `-l`.
* `--context`: Display security context format when using `SE Linux`.
* `--headers`: Repeat the header line, printing it on each page of output.
* `--no-headers`: Do not print the header line at all.
* `--cols, --columns, --width <num>`: Set screen width.
* `--rows, --lines <num>`: Set screen height.

### Thread Display
* `H`: Show threads as if they were processes.
* `-L`: Display threads, possibly with `LWP` and `NLWP` columns.
* `-m, m`: Show threads after processes.
* `-T`: Display threads, possibly with `SPID` column.

### Miscellaneous options
* `-c`: Display different scheduler information for `-l` option.
* `c`: Display the actual command name.
* `e`: Show environment after command.
* `k, --sort`: Specify sorting order as `[+|-]key[,[+|-]key[,...]]`.
* `L`: Display format flags.
* `n`: Show numeric `uid` and `wchan`.
* `S, --cumulative`: Include some `dead` child process data.
* `-y`: Do not display flags, show `rss`, only used with `-l`.
* `-V, V, --version`: Display version information.
* `-w, w`: Unlimited output width.
* `--help <simple|list|output|threads|misc|all>`: Display help information.

## Examples
Display processes for the current shell.

```
ps
```

View all running processes.

```
ps -e
```

Usually, viewing all processes can be combined with pipe and `grep` to filter, for example, we can view all processes related to `nginx`.

```
ps -e | grep nginx
```


View all processes except session leaders and processes not associated with a terminal.

```
ps -a
```

View all processes for the `www` user.

```
ps -u www
```


View all processes for the `www` group.

```
ps -G www
```

Use `-f` to view the complete format list.

```
ps -f
```

View processes in a user-defined format.

```
ps -aN --format cmd,pid,user,ppid
```

Sort processes by memory usage.

```
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem
```

Display all current processes, for ease of viewing, it can be used in combination with pipe and `less` command.

```
ps -ax | less
```

Use the `aux` parameter, add `CPU` and memory usage information to display comprehensive information.

```
ps -aux | less
```

Sort processes in descending order by `CPU` usage.

```
ps -aux --sort -pcpu | less
```

Sort processes in descending order by memory usage.

```
ps -aux --sort -pmem | less
```

Sort processes based on overall memory and `CPU` usage and display only the top `10` results.

```
ps -aux --sort -pcpu,+pmem | head -n 10
```


## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/ups.htm
https://www.runoob.com/linux/linux-comm-ps.html
https://www.geeksforgeeks.org/ps-command-in-linux-with-examples/
```