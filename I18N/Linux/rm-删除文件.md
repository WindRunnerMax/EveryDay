# rm Command

The `rm` command is used to delete a file or directory.

## Syntax

```shell
rm [OPTION]... [FILE]...
```

## Options
* `-f, --force`: Delete files without confirmation, regardless of their write-protect status, and ignore non-existent files without prompting.
* `-i`: Prompt for confirmation before deleting each file.
* `-I`: Prompt once before deleting more than three files or when deleting recursively, fewer prompts than `-i` but still prevents most mistakes.
* `--interactive[=WHEN]`: Prompt according to `WHEN`, never, once with `-I`, or always with `-i`, if no `WHEN` is given, always prompt.
* `--one-file-system`: When recursively deleting a directory, skip any directory on a filesystem that has a different corresponding command line parameter.
* `--no-preserve-root`: Do not treat `/` specially.
* `--preserve-root`: Do not remove `/`, default option.
* `-r, -R, --recursive`: Recursively delete directories and their contents.
* `-d, --dir`: Remove empty directories.
* `-v, --verbose`: Output the progress of the execution.
* `--help`: Output help information.
* `--version`: Output version information.

## Examples
Delete the file `file.txt`, prompt for confirmation if the file is write-protected.

```shell
rm file.txt
```

Delete the file `file.txt`, no confirmation prompt even if the file is write-protected.

```shell
rm -f file.txt
```

Delete all files in the current directory, prompting before deletion if write-protected.

```shell
rm *
```

Delete all files in the current directory without any prompts.

```shell
rm -f *
```

Attempt to delete each file in the current directory, prompting for confirmation before each deletion.

```shell
rm -i *
```

Delete each file in the current directory, prompt for confirmation when deleting three or more files.

```shell
$ rm -I *
```

Delete the directory `directory` and all its containing files and directories, prompt for confirmation if files or directories that `rm` attempts to delete have write protection.

```shell
rm -r directory
```

Delete the directory `directory` and all its containing files and directories without any confirmation prompts.

```shell
rm -rf mydirectory
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.howtoforge.com/linux-rm-command/
https://www.runoob.com/linux/linux-comm-rm.html
https://www.tutorialspoint.com/unix_commands/rm.htm
```