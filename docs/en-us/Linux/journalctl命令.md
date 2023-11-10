```markdown
# journalctl command

The `journalctl` command is a command of the `Systemd` logging system. Its main purpose is to view the logs recorded by the `Systemd` logging system. Before the advent of `Systemd`, logs of the `Linux` system and various applications were managed separately. After `Systemd` replaced `initd`, it began to uniformly manage the boot logs of all `Unit`. With just one `journalctl` command, you can view the logs of all kernels and applications.

## Syntax

```shell
journalctl [OPTIONS...] [MATCHES...]
```



## Parameters
* `--no-full, --full, -l`: When a field matches an available column, it is omitted by default. The default setting is to display complete fields, allowing them to wrap or be truncated. The old option `-l/--full` is no longer useful except for canceling `--no-full`.
* `-a, --all`: Display all fields in full, even if they contain non-printable characters or are very long.
* `-f, --follow`: Display only the most recent log entries and continue printing as new entries are appended to the log.
* `-e, --pager-end`: Immediately jumps to the end of the log, implying `-n 1000` to ensure that the pager does not buffer logs of unlimited size. You can use explicit `-n` and some other numerical values in the command line to override it. Note that this option only supports `less` page.
* `-n, --lines=`: Display the most recent log events and limit the number of events displayed. If used with `--follow`, this option is implicit. The parameter is a positive integer and is optional, with a default value of `10`.
* `--no-tail`: Display all stored output lines, even in `follow` mode, thereby undoing the effect of `--line=`.
* `-r, --reverse`: Reverse the output to show the latest entry first.
* `-o, --output=`: Control the format of the displayed log entries, accepts one of the following options:
    * `short`: Default value, and generates output similar to the traditional `syslog` file format, with each log entry displayed on one line.
    * `short-iso`: Very similar to `short`, but displays an `ISO 8601 wallclock` timestamp.
    * `short-precise`: Very similar to `short`, but displays timestamps with microsecond precision.
    * `short-monotonic`: Similar, but displays `monotonic` timestamps instead of `wallclock` timestamps.
    * `verbose`: Display entries with the complete structure of all fields.
    * `export`: Serialize logs into a binary stream suitable for backup and network transmission, primarily text-based.
    * `json`: Format entries as a `JSON` data structure, one per line.
    * `json-pretty`: Format entries as a JSON data structure, but format them across multiple lines to make them easier to read.
    * `json-sse`: Format entries as a `JSON` data structure, but wrap them in a format suitable for server-sent `Events`.
    * `cat`: Generate a very concise output, only showing the actual message of each log entry, without metadata or even timestamps.
* `-x, --catalog`: Augment log lines with explanatory text from the message catalog, adding explanatory help text from available log messages to the output, which explains the context of errors or log events, possible solutions, and points to support forums, developer documentation, and any other relevant manuals. Note that help text is not available for all messages, but only for selected ones. Also, do not use `-x` when attaching `journalctl` output to error reports.
* `-q, --quiet`: When running as a regular user, suppress any warning messages about inaccessible system logs.
* `-m, --merge`: Display all available logs, including cross-entries from remote logs.
* `-b [ID][±offset], --boot=[ID][±offset]`: Display messages from a specific boot, matching for `_BOOT_ID=`, the parameter may be empty, in which case the logs from the current boot will be shown. If the boot `ID` is omitted, a positive offset will look backwards from the start of the logs, while a value equal to or less than zero will look back from the end of the logs. Thus, `1` denotes the first boot found in chronological order in the logs, `2` the second, and so on, while `-0` denotes the last boot, `-1` the boot before the last, and so on, with an empty offset equivalent to specifying `-0`, unless the current boot is not the last boot, for instance, because a `--directory` was specified to view logs from a different machine. If a 32-character `ID` is specified, an optional offset may follow, identifying a boot relative to the `boot ID`, with negative values representing earlier boots, and positive values representing later boots. If no offset is specified, the value is assumed to be zero, and the logs for the boot given by `ID` are shown.
* `--list-boots`: Display a list of boot numbers (relative to the current boot), their `IDs`, and the timestamps of the first and last message associated with the boot.
* `-k, --dmesg`: Only display kernel messages, meaning `-b` and adding a match for `_TRANSPORT=kernel`.
* `-u, --unit=UNIT|PATTERN`: Display messages for the specified `systemd` unit unit, or for any unit that matches `PATTERN`. If a pattern is specified, the list of unit names found in the logs is compared to the specified pattern, and all matches are picked. For each unit name, an additional match for messages originating from that unit will be added for `_SYSTEMD_UNIT= unit`, as well as extra matches for messages from `systemd` and `coredumps` about the specified unit. This parameter can be specified multiple times.
* `--user-unit=`: Display messages for the specified user session unit, adding matches for the messages from the unit with `_SYSTEMD_USER_UNIT=` and `_UID=`, and extra matches for messages from the `systemd` session and `coredumps` about the specified unit. This parameter can be specified multiple times.
* `-p, --priority=`: Filter the output according to the message priority or priority range, accepting a single number or a text log level (i.e., between `0 emerg` and `7 debug`), or a range of `numeric/text` log levels represented as `..`. Log levels are the usual `syslog` log levels found in `syslog`, namely `emerg 0`, `alert 1`, `crit 2`, `err 3`, `warning 4`, `notice 5`, `info 6`, `debug 7`. If a single log level is specified, all messages at or lower (values lower have higher priority) than that level will be shown. If a range is specified, all messages within that range, including the start and end values of the range, will be shown, adding a `PRIORITY=` match for the specified priority.
* `-c, --cursor=`: Display entries starting from the log position specified by the passed cursor.
* `--after-cursor=`: Display entries starting from the log position specified by this cursor and show the cursor when using the `--show-cursor` option.
* `--show-cursor`: Show the cursor after the two dashes of the last entry, similar to `-- cursor: s=0639...`. The format of the cursor is private and may change.
* `--since=, --until=`: Display entries starting from the specified date or up to the specified date, or within the specified date or up to the specified date. The format of the date specification should be `2012-10-30 18:17:16`. If the time part is omitted, it is assumed to be `00:00:00`. If only the `seconds` component is omitted, it is assumed to be `:00`. If the `date` part is omitted, it is assumed to be the current date, or the strings `yesterday`, `today`, `tomorrow`, representing the day before `00:00:00` of the current date, `00:00:00` of the current date, and the day after the current date, respectively. `now` denotes the current time. Lastly, a relative count may be specified with a `-` or `+` prefix, representing the number of times before or after the current time.
* `-F, --field=`: Print all possible data values accepted for the specified field within all log entries.
* `--system, --user`: Display messages from system services and the kernel (using `--system`), or from the current user services (using `--user`). If neither is specified, it displays all messages visible to the user.
* `-M, --machine=`: Display messages from a running local container, specifying the name of the container to connect to.
* `-D DIR, --directory=DIR`: Operate on the specified log directory `DIR` if provided, instead of default run-time and system log paths.
* `--file=GLOB`: Operate on the specified log files matching the file `glob` if provided, instead of default run-time and system log paths, and multiple times can be specified in which case files are properly interleaved.
* `--root=ROOT`: Operate on the directory tree under the directory path given as argument, if provided, instead of the root directory, e.g., `--update catalog` would create `root/var/lib/systemd/catalog/database`.
* `--new-id128`: Generate a new `128`-bit `ID` suitable for identifying messages instead of showing log content, prepared for developers who need to use new identifiers for their introduced messages and wish to make them identifiable. This will print the new `ID` in three different formats that can be copied into source code or similar files.
* `--header`: Instead of showing log content, display internal header information of the accessed log fields.
* `--disk-usage`: Show the current disk usage of all log files.
* `--list-catalog [128-bit-ID...]`: List the contents of the message catalog in the form of a table of message `ids` and their short descriptive strings, and only for those entries specified if any `128`-bit `id` is specified.
* `--dump-catalog [128-bit-ID...]`: Display the contents of the message catalog, with entries separated by lines comprising of two dashes and the `ID`, in a format identical to a `.catalog` file, and only for those entries specified if any `128`-bit `id` is specified.
* `--update-catalog`: Update the message catalog index needed whenever new catalog files are installed, removed, or updated to regenerate the binary catalog index.
* `--setup-keys`: Generate a new key pair for sealing the forward-secure seals `FSS`, instead of showing log content. This will generate a sealed key and a verification key, with the sealed key stored in a log data directory and kept on the host, while the verification key should be stored externally.
* `--force`: Recreate the `FSS keys` when passed with `--setup keys` and forward-secure seals `FSS` are already set up.
* `--interval=`: Specify the change interval for the sealed key when generating an `FSS` key pair with `--setup-keys`, with shorter intervals increasing `CPU` consumption but narrowing the time range for undetected log changes, with a default of `15` minutes.
* `--verify`: Check the internal consistency of the log files, verifying the authenticity of the log files if they were generated with `FSS` enabled and the `FSS` verification key is specified with `--verify key=`.
* `--verify-key=`: Specify the `FSS` verification key for the `--verify` operation.
* `--no-pager`: Do not pipe the program's output through a pager.
* `--vacuum-size=BYTES`: Reduce disk usage to below the specified size.
* `--vacuum-files=INT`: Retain only the specified number of log files.
* `--vacuum-time=TIME`: Delete any entries earlier than the specified time point.
* `--rotate`: Request the log daemon to rotate the log files, which will block until the rotation operation is complete. Log rotation can ensure that all active log files are closed, renamed for archiving, and new blank log files are created as the new active log files. It is usually used together with `--vacuum-size=`, `--vacuum-time=`, and `--vacuum-file=` to improve the efficiency of log cleaning.
* `-h, --help`: Output help information.
* `--version`: Output version information.

```markdown
## Example
Display all the logs since the last boot.

```shell
journalctl
```

Display kernel logs.

```shell
journalctl -k
```

Using the `-n` parameter, you can display the last `n` lines of logs. If no line number is specified, the default is `10` lines.

```shell
journalctl -n 20
```

View the logs for a specific process.

```shell
journalctl _PID=1
```

Display logs from the last `30` minutes.

```shell
journalctl --since=-30m
```

Display logs since the year `2021`.

```shell
journalctl --since="2021-01-01"
```

Display today's logs.

```shell
journalctl --since=today
```

Using the `-f` parameter provides the functionality similar to `tail -f`, continuously monitoring the newest logs.

```shell
journalctl -f
```

View the logs for a specific `Unit`.

```shell
journalctl -u nginx.service
```

Check the disk space used by logs.

```shell
journalctl --disk-usage
```

Require the log daemon to rotate log files. Log rotation ensures that all active log files are closed, renamed for archiving, and new blank log files are created as new active log files.

```shell
journalctl --rotate
```

Clean up logs older than a week.

```shell
journalctl --vacuum-time=1week
```

Reduce disk usage to below the specified size.

```shell
journalctl --vacuum-size=10M
```

## Today's Task

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
http://www.jinbuguo.com/systemd/journalctl.html#
https://www.commandlinux.com/man-page/man1/journalctl.1.html
https://blog.orchidflower.cn/2020/04/20/linux-command-introduction-04-journalctl/
```
```