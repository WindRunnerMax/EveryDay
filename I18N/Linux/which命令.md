# Which Command
The `which` command is used to identify the location of a given executable file that would be executed when typing the executable file name or command at the terminal prompt. This command searches for the specified executable file in the directories listed in the `PATH` environment variable.

## Syntax

```shell
which [options] COMMAND
```

## Parameters
* `--version, -[vV]`: Output version information.
* `--help`: Output help information.
* `--skip-dot`: Skip directories in `PATH` that start with `.`.
* `--skip-tilde`: Skip directories in `PATH` that start with `~`.
* `--show-dot`: Do not expand `.` in the output to the current directory.
* `--show-tilde`: Output a tilde for non-root users' `HOME` directory.
* `--tty-only`: Stop processing the right side of the options if not on a `tty`.
* `--all, -a`: Print all matching items in the `PATH`, not just the first one.
* `--read-alias, -i`: Read alias list from standard input.
* `--skip-alias`: Ignore the `--read-alias` option and do not read from standard input.
* `--read-functions`: Read shell functions from standard input.
* `--skip-functions`: Ignore the `--read-functions` option and do not read from standard input.

## Examples

View the absolute path of the `bash` command.

```shell
which bash
# /usr/bin/bash
```

View the absolute path of multiple commands.

```shell
which ping touch
# /usr/bin/ping
# /usr/bin/touch
```

Output the absolute paths of all matching items in the environment variables.

```shell
which -a python
# ~/anaconda3/bin/python
# /usr/bin/python
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/uwhich.htm
https://linuxize.com/post/linux-which-command/
https://www.runoob.com/linux/linux-comm-which.html
```