# Disk Usage Management with du

The `du` command abbreviates `Disk Usage` and is used to estimate and display disk usage of files and directories within the file system.

## Syntax

```bash
du [OPTION]... [FILE]...
du [OPTION]... --files0-from=F
```

## Options
* `-a, --all`: Count all files, including directories.
* `--apparent-size`: Print apparent sizes instead of disk usage. Apparent sizes are generally smaller, but they may be larger due to holes in sparse files, internal fragmentation, and indirect blocks.
* `-B, --block-size=SIZE`: Scale sizes before printing by `SIZE`. For example, `-BM` prints sizes in units of `1,048,576` bytes.
* `-b, --bytes`: Equivalent to `--apparent-size --block-size=1`.
* `-c, --total`: Show grand total.
* `-D, --dereference-args`: Dereference only the arguments listed on the command line.
* `--files0-from=F`: Estimate disk usage of files specified in file `F`, where each name is terminated by a null character. If `F` is `-`, reads names from standard input.
* `-H`: Equivalent to `--dereference-args (-D)`.
* `-h, --human-readable`: Print sizes in human-readable format, rounding values and using abbreviations. For example, `1K`, `234M`, `2G`, etc.
* `--si`: Similar to `-h`, but uses powers of `1000` instead of `1024`.
* `-k`: Similar to `--block-size=1K`.
* `-l, --count-links`: Count sizes multiple times (if there are hard links).
* `-m`: Similar to `--block-size=1M`.
* `-L, --dereference`: Dereference all symbolic links.
* `-P, --no-dereference`: Do not follow any symbolic links (default behavior).
* `-0, --null`: Use a null byte to terminate each output line instead of a newline.
* `-S, --separate-dirs`: Do not include size of subdirectories.
* `-s, --summarize`: Display only a total for each argument.
* `-x, --one-file-system`: Skip directories on different filesystems.
* `-X, --exclude-from=FILE`: Exclude files matching patterns in `FILE`.
* `--exclude=PATTERN`: Exclude files matching `PATTERN`.
* `-d, --max-depth=N`: Print total only if directory (or file with `--all`) is at most `N` levels below the command line arguments, `--max-depth=0` is equivalent to `--summarize`.
* `--time`: Show last modification time of any file or its subdirectories in the directory.
* `--time=WORD`: Show time according to `WORD`: `atime`, `access`, `use`, `ctime`, or `status`.
* `--time-style=STYLE`: Show time using `STYLE`: `full-iso`, `long-iso`, `iso`, or `+` format (interpretation of `FORMAT` is like `date`).
* `--help`: Display help information and exit.
* `--version`: Output version information and exit.

## Examples

Display the disk space occupied by the current directory and its subdirectories.

```bash
du -h
```

Show disk usage of a specific directory, recursively showing usage by default.

```bash
du -h /home
```

Recursively show space occupied by every file and subdirectory in a directory, finally summarizing total usage.

```bash
du -ah /home
```

Show space usage of immediate subdirectories in the current directory.

```bash
du -h -d 1
```

Display disk usage of the current directory.

```bash
du -h -d 0
```

Show disk space usage of the file system (disk free).

```bash
df -h
```

Display disk usage of all files and subdirectories in the current directory, sorted by size.

```bash
du -a -h -d 1 | sort -h -r
```

Show disk usage of all files and subdirectories in the current directory, excluding certain folders, and sort by size.

```bash
du -a -h -d 1 --exclude=.git --exclude=node_modules | sort -h -r
find . -maxdepth 1 \( -path ./.git -o -path ./node_modules \) -prune -o -exec du -sh {} + | sort -h -r # Mac
```

Check the size of a specific file.

```bash
du -h tsconfig.json
```

Filter and view the volume of a file using `grep`, useful when dealing with symbolic links.

```bash
ls -l -h tsconfig.json
du -a -h -d 1 | grep tsconfig.json
find . -maxdepth 1 -print0 | xargs -0 du -sh | grep tsconfig.json # Mac
```

## Question of the Day

- <https://github.com/WindrunnerMax/EveryDay>

## References

- <https://www.computerhope.com/unix/udu.htm>
- <https://linuxize.com/post/du-command-in-linux/>
- <https://www.runoob.com/linux/linux-comm-du.html>