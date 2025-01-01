# locate command
The `locate` command is used to search for files that meet certain conditions. It searches the database that stores file and directory names for files or directories that match the specified conditions. The default database for the `locate` command is located at `/var/lib/mlocate/mlocate.db`. Unlike `find`, which searches the hard drive, `locate` only searches in the database, which contains information about all local files. This database is automatically created by the Linux system and is updated once a day. Therefore, using the `locate` command may not find recently modified files, in which case you can manually execute the `updatedb` command to update the database.

## Syntax
```shell
locate [OPTION] [PATTERN]
```

## Options
* `-b, --basename`: Matches only the base name with the specified pattern.
* `-c, --count`: Does not output file names on standard output, but only outputs the number of matching entries.
* `-d, --database <DBPATH>`: Replaces the default database with the specified database. If multiple `--database` options are specified, the result path will be the concatenation of individual paths, and empty database file names will be replaced with the default database.
* `-e, --existing`: Prints only entries for files that exist at the time of the search.
* `-L, --follow`: Follows trailing symbolic links when checking for file existence. This will omit broken symbolic links from the output, which is the default behavior.
* `-h, --help`: Displays online help.
* `-i, --ignore-case`: Ignores case distinctions when matching patterns.
* `-l, --limit, -n <LIMIT>`: Exits successfully after finding` LIMIT` entries. If the `--count` option is specified, the result count will also be limited to `LIMIT`.
* `-m, --mmap`: Ignored for `BSD` and `GNU` compatibility.
* `-P, --nofollow, -H`: Does not follow trailing symbolic links when checking for file existence. This will report broken symbolic links as with any other files.
* `-0, --null`: Uses the `ASCII NUL` character to separate entries on output, instead of writing each entry on a separate line. This option is intended to interoperate with the `--null` option of `GNU xargs`.
* `-S, --statistics`: Writes statistics regarding the reading of the database to standard output, instead of searching for files and exiting successfully.
* `-q, --quiet`: Does not output any messages regarding errors encountered when reading and processing the database.
* `-r, --regexp <REGEXP>`: Searches using basic regular expressions. If this option is used, pattern matching is not allowed, but this option can be specified multiple times.
* `--regex`: Interprets all `PATTERN` as extended regular expressions.
* `-s, --stdio`: Ignored for `BSD` and `GNU` compatibility.
* `-V, --version`: Outputs version information.
* `-w, --wholename`: Matches the entire path name with the specified pattern, which is the default behavior.

## Examples
Search for the `file.txt` file.

```shell
locate file.txt
```

Output the number of matching file names for `file.txt`.

```shell
locate -c file.txt
```

Match files ending with `make`.

```shell
locate -r make$
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://man.linuxde.net/locate_slocate
https://www.runoob.com/linux/linux-comm-locate.html
https://www.tutorialspoint.com/unix_commands/locate.htm
```