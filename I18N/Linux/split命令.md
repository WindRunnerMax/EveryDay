# `split` command
The `split` command is used to split a large file into smaller files. By default, it splits the file into smaller files with `1000` lines in each file.

## Syntax

```shell
split [OPTION]... [FILE [PREFIX]]
```

## Options
* `-a, --suffix-length=N`: Use suffixes of length `N`, by default use 2 characters.
* `--additional-suffix=SUFFIX`: Append an additional `SUFFIX` to the file names.
* `-b, --bytes=SIZE`: Put `SIZE` bytes per output file.
* `-C, --line-bytes=SIZE`: Put at most `SIZE` bytes of lines into each output file, similar to `-b` but with consideration for maintaining line integrity.
* `-d`: Use numeric suffixes instead of alphabetic.
* `--numeric-suffixes[=FROM]`: Same as `-d`, but allows setting a start value.
* `-e, --elide-empty-files`: Do not generate empty output files with `-n`.
* `--filter=COMMAND`: Write to shell `COMMAND`; file name is `$FILE`.
* `-l, --lines=NUMBER`: Put `NUMBER` lines per output file.
* `-n, --number=CHUNKS`: Generate `CHUNKS` output files; `CHUNKS` could be:
  - `N`: split into `N` files based on input size
  - `K/N`: output `K`th of `N` to stdout
  - `l/N`: split into `N` files, no line splitting
  - `l/K/N`: output `K`th of `N` to stdout, no line splitting
  - `r/N`: similar to `l`, but use a round robin distribution
  - `r/K/N`: output `K`th of `N` to stdout, with round robin distribution
* `-t, --separator=SEP`: Use `SEP` instead of newline as the record separator, `\0` for `NUL`.
* `-u, --unbuffered`: Immediately copy input to output with `-n r/...`.
* `--verbose`: Print informative message before opening each output file.
* `--help`: Display help information.
* `--version`: Output version information.

## Examples
Split file `tmp/file.txt` into separate files, named `newaa`, `newab`, `newac`, etc., with each file containing 2 bytes of data.

```shell
split -b 2 /tmp/file.txt new
```

Split file `tmp/file.txt` into separate files, named `newaa`, `newab`, `newac`, etc., with each file containing 2 lines of data.

```shell
 split -l 2 /tmp/file.txt new
```

Split file `tmp/file.txt` into separate files, using numeric suffixes, with each file containing 2 lines of data.

```shell
split -d -l 2 /tmp/file.txt new
```

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/usplit.htm
https://www.runoob.com/linux/linux-comm-split.html
https://www.tutorialspoint.com/unix_commands/split.htm
```