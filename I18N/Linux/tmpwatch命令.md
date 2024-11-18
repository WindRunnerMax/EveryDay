# tmpwatch Command
The `tmpwatch` command recursively deletes files that have not been accessed within a given period of time. It is commonly used to clean up directories used for temporary storage and can be used to set file expiration times, with the default unit being hours.

## Syntax

```shell
tmpwatch [-u | -m | -c] [-MUadfqstvx] [--verbose] [--force] [--all] [--nodirs] [--nosymlinks] [--test] [--fuser] [--quiet] [--atime | --mtime | --ctime] [--dirmtime] [--exclude path ] [--exclude-user user ] time dirs
```

## Parameters
* `-a, --all`: Delete all types of files, not just regular files, symbolic links, and directories.
* `-c, --ctime`: Decide to delete files based on the file's `ctime` (i.e., `inode` change time) instead of `atime`, and for directories, make the decision based on `mtime`.
* `-d, --nodirs`: Do not attempt to delete directories even if they are empty.
* `-f, --force`: Delete files even if `root` does not have write access, similar to `rm -f`.
* `-l, --nosymlinks`: Do not attempt to delete symbolic links.
* `-m, --mtime`: Decide to delete files based on the file's `mtime` (i.e., modification time) instead of `atime`.
* `-M, --dirmtime`: Decide to delete directories based on the directory's `mtime` instead of `atime`, completely ignoring directory time.
* `-q, --quiet`: Report only fatal errors.
* `-s, --fuser`: Try to use the `fuser` command to see if files are open before deleting them. By default, this is not enabled, but it can be helpful in some cases.
* `-t, --test`: Do not delete files but take the actions to delete them. This implies `-v`.
* `-u, --atime`: Decide to delete files based on the file's access time, which is the default value. Note that regular `updatedb` filesystem scans will retain recent directory times.
* `-U, --exclude-user=user`: Do not delete files owned by a specific user. The user can be a username or a numerical user `ID`.
* `-v, --verbose`: Print detailed information, with two levels of verbosity available.
* `-x, --exclude=path`: Skip the specified path. If the `path` is a directory, all files within it will also be skipped. If the path does not exist, it must be an absolute path that does not contain symbolic links.
* `-X, --exclude-pattern=pattern`: Skip paths matching a specific pattern. If a directory matches the `pattern`, all the files within it will also be skipped. The pattern must match an absolute path that does not contain symbolic links.

## Examples
To remove files in the `/var/log/` directory that have not been accessed in over `30` days:

```shell
tmpwatch 30d /var/log/
```

List all files in the `/tmp/` cache directory that have been idle for at least `30` hours:

```shell
tmpwatch –mtime 30 –nodirs /tmp/ –test
```

Delete all files in the `/tmp/` cache directory that have not been accessed for at least `30` hours:

```shell
tmpwatch -am 30 –nodirs /tmp/
```

## Every Day One Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://linux.die.net/man/8/tmpwatch
https://www.runoob.com/linux/linux-comm-tmpwatch.html
https://www.interserver.net/tips/kb/tmpwatch-command-linux/
```

## Parameters
* `-a, --all`: Deletes all files, not just regular files, symbolic links, and directories.
* `-c, --ctime`: Determines the deletion of files based on the `ctime` or `inode` change time rather than `atime`, and for directories based on `mtime`.
* `-d, --nodirs`: Do not attempt to delete even if the directory is empty.
* `-f, --force`: Deletes files even if `root` does not have write access, similar to `rm -f`.
* `-l, --nosymlinks`: Do not attempt to delete symbolic links.
* `-m, --mtime`: Determines the deletion of files based on the `mtime` or modification time rather than `atime`.
* `-M, --dirmtime`: Determines the deletion of directories based on the directory's `mtime` or modification time, completely ignoring directory time.
* `-q, --quiet`: Report only fatal errors.
* `-s, --fuser`: Attempts to use the `fuser` command to check if the file is open before deleting it, not enabled by default, but helpful in some cases.
* `-t, --test`: Does not delete files, but performs the actions to delete them, meaning `-v`.
* `-u, --atime`: Determines the deletion of files based on their access time, which is the default, note that periodic `updatedb` file system scans will preserve recent directory times.
* `-U, --exclude-user=user`: Do not delete files owned by a specific user, the user can be a username or a numerical user `ID`.
* `-v, --verbose`: Print detailed output, with two levels of verbosity available.
* `-x, --exclude=path`: Skip the path, if `path` is a directory, all files within it will also be skipped, if the path does not exist, it must be an absolute path that does not include symbolic links.
* `-X, --exclude-pattern=pattern`: Skip paths that match the pattern, if a directory matches the `pattern`, all the files within it will be skipped, the pattern must match an absolute path that does not include symbolic links.

## Examples
To delete files older than `30d` that have not been accessed in the `/var/log/` log directory.

```shell
tmpwatch 30d /var/log/
```

List all files in the `/tmp/` cache directory that have not been modified for at least `30` hours.

```shell
tmpwatch –mtime 30 –nodirs /tmp/ –test
```

Delete all files in the `/tmp/` cache directory that have not been accessed for at least `30` hours.

```shell
tmpwatch -am 30 –nodirs /tmp/
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://linux.die.net/man/8/tmpwatch
https://www.runoob.com/linux/linux-comm-tmpwatch.html
https://www.interserver.net/tips/kb/tmpwatch-command-linux/
```