# Top Command
The `top` command provides a dynamic real-time view of the running system, displaying system summary information as well as a list of processes or threads currently managed by the kernel. The types of system summary information displayed and the type, order, and size of information displayed for tasks are all user-configurable.

## Syntax

```shell
top -hv | -bcHisS -d delay -n limit -u|U user | -p pid -w [cols]
```

## Arguments
* `-h`: Output help information.
* `-v`: Output version information.
* `-b`: Start `top` in batch mode, useful for sending output from `top` to other programs or files, `top` will not accept input and run until you set an iteration limit or terminate using the `-n` command line option.
* `-c`: Start with last remembered `c` state, if `top` shows command lines, the field will now show program names, and vice versa.
* `-d interval`: Specify the delay between screen updates, overriding the corresponding value in the personal configuration file or the default value at startup, the `d` or `s` interactive command can also be used after startup to change the delay.
* `-H`: Instruct `top` to display individual threads, if this command line option is not present, it shows the sum of all threads in each process, the `H` interactive command can be used after startup to change this.
* `-i`: Idle process switch, start with last remembered `i` state, when this switch is off, tasks that have not used any CPU since the last update will not be shown.
* `-n limit`: Specify the maximum number of iterations or frames `top` should produce before ending.
* `-o`: Specifies the name of the field to sort tasks by, independent of what is reflected in the configuration file, you can prefix the field name with `+` or `-` to override the sort direction, a leading `+` will force a high-to-low sort and `-` will ensure a low-to-high sort, primarily used for supporting automated script-driven batch mode operations.
* `-O`: This option is a help form of the `-o` option, it will make `top` print each available field name on a separate line and then exit.
* `-p pid`: Monitor only processes with the specified process ID, this option can be given up to `20` times, it can also take a comma-separated list containing up to `20` PIDs, allowing both methods to be mixed, a `pid` value of zero will be considered as the process id of the `top` program when running, this is just a command line option, if you want to return to normal operation, there is no need to exit and restart `top`, just issue either of the interactive commands `=`, `u`, or `U`, the `p`, `u`, and `U` command line options are mutually exclusive.
* `-s`: Safe mode operation, forcibly start `top` in safe mode even for `root`, better control of this mode can be achieved through system configuration files.
* `-S`: Cumulative time switch, start with last remembered `S` state, when cumulative time mode is on, each process will list the CPU time it and its child processes have used.
* `-u user-id-or-name, -U user-id-or-name`: Display only processes that match the given user ID or username, the `-u` option matches valid users while the `-U` option matches any user `real`, `effective`, `saved`, or `filesystem`, prefixing a user ID or name with an exclamation mark `!` tells `top` to display processes that do not match the provided user, the `p`, `u`, and `U` command line options are mutually exclusive.
* `-w number`: In batch mode, if there are no parameters, `top` will use `COLUMNS=` and `LINES=` environment variables (if set) to format the output, otherwise the width will be fixed at a maximum of `512` columns, with a parameter, the output width can be reduced or increased (up to `512` lines), but the number of lines is considered to be unlimited, in normal display mode, if there are no parameters, `top` will attempt to format the output using `COLUMNS=` and `LINES=` environment variables (if set), the output width can only be reduced with a parameter, not increased, whether using environment variables or a parameter with `-w`, it cannot exceed the actual terminal dimensions when not in batch mode, note that if this command line option is not used, the output width is always based on the dimensions of the terminal in which `top` is invoked, whether in batch mode or not.

## Operations
The following default value operations assume no related configuration file, that is, no user customization, plus items are overrideable through the command line.

* `^Z`: Suspend.
* `fg`: Resume a suspended command.
* `<Left>`: Force screen redraw.
* `A`: Alternate display, default full screen display.
* `d`: `*` Delay time, default `3s`.
* `H`: `*` Thread mode, default off.
* `I`: `Irix` mode, default on.
* `p`: `*` Monitoring `PID`, default show all processes.
* `1`: View the logical count of CPU on the server.
* `M`: Sort by resident memory size.
* `P`: Sort by CPU usage percentage.
* `T`: Sort by time/cumulative time.
* `c`: Switch display of command name and full command line.
* `t`: Switch display of process and CPU information.
* `m`: Switch display of memory information.
* `l`: Switch display of average load and uptime information.
* `o`: Change the order of displayed items.
* `f`: Add or remove column items from the current display.
* `S`: Switch to cumulative mode.
* `s`: Change the delay time between two refreshes, the system will prompt the user to enter the new time, in seconds, if it has a decimal, it will be converted to milliseconds.
* `q`: Exit the `top` command.
* `i`: Ignore idle and zombie processes.
* `k`: Terminate a process.

## Related Information

### Overview
* `total`: Total number of processes.
* `running`: Number of processes currently running.
* `sleeping`: Number of processes in sleep mode.
* `stopped`: Number of stopped processes.
* `zombie`: Number of zombie processes.

### CPU Information
* `us`: Percentage of CPU usage in user space.
* `sy`: Percentage of CPU usage in kernel space.
* `ni`: Percentage of CPU usage by processes with modified priority in user space.
* `id`: Percentage of idle CPU.
* `wa`: Percentage of CPU time spent waiting for input/output.
* `hi`: Percentage of CPU time spent on hardware interrupts.
* `si`: Percentage of CPU time spent on software interrupts.
* `st:` Percentage of CPU time taken by virtual machines.

### Column Fields
You can use the `f` interactive command to customize the position and visibility of the columns.
* `%CPU`: `CPU Usage`, the percentage of CPU time used by tasks since the last screen update, expressed as a percentage of total CPU time. In a true SMP environment, if a process is multi-threaded and `top` is not in thread-mode, it may report a value greater than `100%`. You can use the `H` interactive command to switch to thread-mode. Similarly, in a multi-processor environment, if `Irixmode` is off, `top` will run in `Solarismode`, where the task's `CPU` usage is divided by the total number of CPUs. You can use the `I` interactive command to switch `Irix/Solaris` mode.
* `%MEM`: `Memory Usage (RES)`, the amount of physical memory the task is currently using.
* `CGROUPS`: `Control Groups`, the name of the control group to which the process belongs. Control groups are used to allocate resources (CPU, memory, network bandwidth, etc.) among predefined process groups. An important aspect of `cgroups` is that it is not of a fixed width like most columns. When displayed, it will consume all remaining screen width (up to 512 characters). Despite this, this variable-width field may still be truncated.
* `CODE`: `Code Size (KiB)`, the amount of physical memory in KiB used for executable code, also known as the Text Resident Set size or `TRS`.
* `COMMAND`: `Command Name or Command Line`, displays the command line used to start the task or the name of the associated program. You can use `c` to switch between the command line and the name. When displaying the command line, processes without a command line (such as kernel threads) will only display the program name. This field may also be affected by the view display mode. Similar to `CGROUPS`, it is not of a fixed width, when displayed, it will consume all remaining screen width (up to 512 characters) and may be truncated when displaying command lines.
* `DATA`: `Data + Stack Size (KiB)`, the amount of physical memory in KiB used for data and stack beyond the executable code, also known as the Data Resident Set size or `DRS`.
* `ENVIRON`: `Environment variables`, displays all the environment variables seen by each process, if any. They are shown in the original native order, not the sorted order seen with the non-POSIX `set`. Similar to `CGROUPS`, it's not a fixed width field. When displayed, it will consume all remaining screen width (up to 512 characters) and may be truncated.
* `Flags`: `Task Flags`, indicates the current scheduling flags of the task, represented in hexadecimal and does not include zeroes. These flags are formally defined in `<linux/sched.h>`.
* `GID`: `Group Id`, the effective group `ID`.
* `GROUP`: `Group Name`, the effective group name.
* `NI`: `Nice Value`, a negative `nice` value means a higher priority, while a positive `nice` value means a lower priority. A value of zero in this field means the priority will not be adjusted when determining the task's scheduling capability.
* `P`: `Last used CPU (SMP)`, indicates the number of the last used processor. In a true SMP environment, this may change frequently because the kernel deliberately uses weak affinity. Additionally, the behavior of running `top` may break this weak affinity and cause more processes to change CPUs more frequently due to extra demands on the CPU time.
* `PGRP`: `Process Group Id`, every process is a member of a unique process group used for signal allocation and arbitrated for terminal input and output. When a process is created (`forked`), it becomes a member of its parent process group. By convention, its value is equal to the process `ID` of the first member of the process group (known as the process group leader).
* `PID`: `Process Id`, the unique process `ID` of the task. It wraps around periodically, but never restarts at zero. In the kernel, it's a schedulable entity defined by `task_struct`. This value is also used as the `PID`, session `ID` for the session leader, thread group `ID` for the thread group leader, and the `TTY` process group `ID` for the process group leader.
* `PPID`: `Parent Process Id`, the process `ID` of the parent process of the task (`pid`).
* `PR`: `Priority`, the scheduling priority of the task. If you see `rt` in this field, it means the task is running at a real-time scheduling priority. Real-time priorities, under `linux`, have traditionally been misleading because it traces back to the fact that the operability of the system is not preemptible. The `2.6` kernel can be pre-emptible in most areas, but not all.
* `RES`: `Resident Memory Size (KiB)`, the amount of non-swapped physical memory used by the task.
* `RUID`: `Real User Id`, the real user `ID`.
* `RUSER`: `Real User Name`, the real user name.
* `S`: `Process Status`, the status of the task which can be: `D` uninterruptible sleep, `R` running, `S` sleeping, `T` traced or stopped, `Z` zombie. Tasks shown as running should be considered ready to run — their task structures are only in the `Linux` run queue. According to `top`, a significant, although unknowable, amount of work has likely been done to the task structures in this case because of `top's` latency interval and nice value, you will usually see many tasks in this state. 
* `SHR`: `Shared Memory Size (KiB)`, the amount of shared memory the task can use. Typically, not all of the memory is actually moved to disk. It just means that the task may need to load more pages of memory than are currently resident.
* `SID`: `Session Id`, a session is a set of process groups, typically established by a login `shell`. Newly `forked` processes join the session of their creator. By convention, its value is equal to the `PID` of the session's first member, known as the session leader, normally a login `shell`.
* `SUID`: `Saved User Id`, the saved user `ID`.
* `SUPGIDS`: `Supplementary Group IDs`, any supplementary groups established or inherited from the task's parent. They are displayed as a comma separated list. Similar to `CGROUPS`, it's not a fixed width field. When displayed, it will consume all remaining screen width (up to 512 characters) and may be truncated.
* `SUPGRPS`: `Supplementary Group Names`, any supplementary groups established or inherited from the task's parent. They are displayed as a comma separated list. Similar to `CGROUPS`, it's not a fixed width field. When displayed, it will consume all remaining screen width (up to 512 characters) and may be truncated.
* `SUSER`: `Saved User Name`, the saved user name.
* `SWAP`: `Swapped Size (KiB)`, the non-resident part of the task's address space.
* `TGID`: `Thread Group Id`, the thread group `ID` to which the task belongs. It's the `PID` of the thread group leader and represents those tasks that share the `mm_struct` in kernel terms.
* `TIME`: `CPU Time`, the total CPU time the task has used since it started. When the accumulation mode is on, each process will list the CPU time used by itself and its children. Use `S` to toggle accumulation mode. This is both a command line option and an interactive command. For more information on this mode, see the `S` interactive command.
* `TIME+`: `CPU Time, hundredths`, the same as `Time`, but reflects more granularity in hundredths of a second.
* `TPGID`: `Tty Process Group Id`, the process group `ID` of the foreground process connected to the `tty`. If the process is not connected to a terminal, it is `-1`. By convention, this value is equal to the process `ID` of the process group leader.
* `TTY`: `Controlling Tty`, the name of the controlling terminal. This is typically the device of the process that started the terminal (serial port, `pty`, etc.) and is used for input or output. However, tasks don't need to be associated with a terminal. In such cases, you will see a `?` displayed.
* `UID`: `User Id`, the effective user `ID` of the task owner.
* `USED`: `Memory in Use (KiB)`, this field represents the amount of non-swapped physical memory (`RES`) used by the task plus the non-resident part of its address space (`SWAP`).
* `USER`: `Username`, the effective username of the task owner.
* `VIRT`: `Virtual Memory Size (KiB)`, the total amount of virtual memory the task is using. It includes all code, data and shared libraries as well as pages that have been swapped out and pages that have not been used but have been mapped.
* `WCHAN`: `Sleeping in Function`, depending on the kernel compile options, this field will show the name or address of the kernel function the task is currently sleeping in. A running task will display a dash `-` in this column. By showing this field, `top` can increase its own working set by over 700 kb, depending on the kernel version. If this happens, the only way you can get rid of this added load is to stop and restart `top`.
* `nDRT`: `Dirty Pages Count`, the number of pages modified since being written to secondary storage. `Dirty pages` need to be written out to secondary storage before the corresponding physical memory location can be used for another virtual page.
* `nMaj`: `Major Page Fault Count`, the number of major page faults the task has had. A major page fault occurs when a process tries to read or write a page that is currently not in memory, which involves bringing such a page into memory.
* `nMin`: `Minor Page Fault Count`, the number of minor page faults the task has had. A minor page fault occurs when a process tries to read or write a page that is currently not in memory, without any involved access to the disk.
* `nTH`: `Number of Threads`, the number of threads associated with the process.
* `nsIPC`: `IPC namespace`, the `Inode` for the namespace isolating Inter-Process Communication (`IPC`) resources such as `SystemVIPC` objects and `POSIX` message queues.
* `nsMNT`: `MNT namespace`, the `Inode` for the namespace isolating the mount points, providing different views of the filesystem hierarchy.
* `nsNET`: `NET namespace`, the `Inode` for the namespace isolating network devices, `IP` addresses, `IP` routes, port numbers, etc.
* `nsPID`: `PID namespace`, the `Inode` for the namespace isolating process `ID` numbers, meaning they do not have to be unique in this namespace, so each namespace can have its own `init` (`PID#1`) to manage various initialization tasks and obtain isolated child processes.
* `nsUSER`: `USER namespace`, the `Inode` for the namespace isolating user and group `ID` numbers. This means a process can have a regular unprivileged user `ID` outside the user namespace and a user `ID` of 0 with full root capabilities inside the namespace.
* `nsUTS`: `UTS namespace`, the `Inode` for the namespace isolating the hostname and `NIS` domain name. `UTS` stands for `UNIX` Time-sharing System.
* `vMj`: `Major Page Fault Count Delta`, the number of major page faults that has occurred since the last update.
* `vMn`: `Minor Page Fault Count Delta`, the number of minor page faults that has occurred since the last update.

## Example

Display process information.

```shell
top
```

Show complete command.

```shell
top -c
```

Display program information in batch mode.

```shell
top -b
```

Display program information in cumulative mode.

```shell
top -S
```

Set the number of refreshes to `2`, terminate after updating twice.

```shell
top -n 2
```

Set the refresh time to `3` seconds.

```shell
top -d 3
```

Display specified process information, such as `CPU`, memory usage, etc.

```shell
top -p 131
```

Unable to send commands to the process interactively.

```shell
top -s
```

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/top.htm
https://www.commandlinux.com/man-page/man1/top.1.html
https://www.geeksforgeeks.org/top-command-in-linux-with-examples/
```
