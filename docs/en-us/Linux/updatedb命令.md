# The updatedb command

The `updatedb` command creates or updates the database used by the `locate` command. If the database already exists, `updatedb` reuses its data to avoid rereading unchanged directories. Typically, `updatedb` is run by `cron` every day to update the default database.

## Syntax

```shell
updatedb [OPTION]...
```

## Parameters

* `-f, --add-prunefs FS`: Add entries in the space-separated list `FS` to `PRUNEFS`.
* `-n, --add-prunenames NAMES`: Add entries in the space-separated list `NAMES` to `PRUNENAMES`.
* `-e, --add-prunepaths PATHS`: Add entries in the space-separated list `PATHS` to `PRUNEPATHS`.
* `-U, --database-root PATH`: Store only the results of scanning file system subtrees rooted at paths for which the path of the database to be generated, by default, will scan the whole file system, i.e. `/`, and `locate` outputs entries as absolute pathnames, regardless of the forms of `PATH` is specified.
* `-h, --help`: Display help information.
* `-o, --output FILE`: Write the database to the file instead of using the default database. Default database location is `/var/lib/mlocate/mlocate.db`.
* `--prune-bind-mounts FLAG`: Set `PRUNE_BIND_MOUNTS` to `FLAG`, overriding the configuration file, default is `no`.
* `--prunefs FS`: Set `PRUNEFS` to `FS`, overriding the configuration file.
* `--prunenames NAMES`: Set `PRUNENAMES` to `NAMES`, overriding the configuration file.
* `--prunepaths PATHS`: Set `PRUNEPATHS` to `PATHS`, overriding the configuration file.
* `-l, --require-visibility FLAG`: Set flag in the generated database for "require files' visibility before reporting" to `FLAG`, default value is `yes`. If `FLAG` is `0` or `no`, or the database file is readable by `others` or not owned by `slocate`, then `locate` outputs database entries that user running `locate` cannot read necessary directories to find files described by database entries. If `FLAG` is `1` or `yes`, `locate` checks the permissions of each entry's parent directory before reporting the parent directory of each entry to the calling user. To truly hide the existence of a file, the database group is set to `slocate`, and the database permissions prevent users from reading the user's database other than `locate set-gid slocate`. Note that visibility check only occurs when the database is owned by `slocate` and not readable by `others`.
* `-v, --verbose`: Output the path names of files to standard output.
* `-V, --version`: Output version information.

## Examples

Update the database used by the `locate` command.

```shell
updatedb
```

Update the database used by the `locate` command and output the found files.

```shell
updatedb -v
```

Specify the directory for updating the database used by the `locate` command.

```shell
updatedb -U /home
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://linux.die.net/man/8/updatedb
https://www.computerhope.com/unix/ulocate.htm
https://www.runoob.com/linux/linux-comm-updatedb.html
```