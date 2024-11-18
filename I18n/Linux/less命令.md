# Less Command
The `less` command functions similar to `more` and can be used to browse the contents of files. When using the `less` command to display a file, you can use the `pageup` key to move up a page, the `pagedown` key to move down a page, the `↑` and `↓` keys to browse line by line, and the `q` key to exit the browsing. Unlike `more`, `less` does not need to read the entire file when loading, so it loads faster. After exiting `less`, the shell does not retain the displayed content, whereas `more` leaves the displayed content in the shell.

## Syntax

```shell
less [option] [file]
```

## Options
* `-b <buffer size>`: Set the size of the buffer.
* `-e`: Automatically exit the command when the end of the file is reached.
* `-f`: Force open special files, such as device files, directories, and binary files.
* `-g`: Highlight only the last searched keyword.
* `-i`: Ignore case when searching.
* `-m`: Display the percentage similar to the `more` command.
* `-N`: Display line numbers for each line.
* `-o <file>`: Save the output of `less` to the specified file.
* `-Q`: Disable the bell warning sound.
* `-s`: Condense multiple adjacent empty lines into one.
* `-S`: Truncate lines that are too long.
* `-x <num>`: Display tab characters as a specified number of spaces.

## Common Operations
* `ctrl + F`: Move forward one screen.
* `ctrl + B`: Move backward one screen.
* `ctrl + D`: Move forward half a screen.
* `ctrl + U`: Move backward half a screen.
* `j`: Move forward one line.
* `k`: Move backward one line.
* `/string`: Search forward for a string.
* `?string`: Search backward for a string.
* `n`: Repeat the previous search related to `/` or `?`.
* `N`: Reverse repeat the previous search related to `/` or `?`.
* `b`: Scroll backward one page.
* `d`: Scroll backward half a page.
* `h`: Display the help screen.
* `Q`: Quit the `less` command.
* `u`: Scroll forward half a page.
* `y`: Scroll forward one line.
* `space`: Scroll one page.
* `enter`: Scroll one line.
* `pageup`: Scroll upward one page.
* `pagedown`: Scroll downward one page.
* `G`: Move to the last line.
* `g`: Move to the first line.
* `q / ZZ`: Quit the `less` command.
* `v`: Open the current file in the configured editor.
* `h`: Display the `less` help document.
* `&pattern`: Display only the lines that match the pattern, not the entire file.
* `ma`: Mark the current position with marker `a`.
* `a`: Navigate to the marker `a`.

## Examples
Browse the `file.txt` file.
```shell
less file.txt
```

View process information using `ps` and page through it using `less`.
```shell
ps -ef | less
```

View the `file.txt` file and search for the string `1` backward.
```shell
less file.txt 
/1
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://man.linuxde.net/less
https://www.runoob.com/linux/linux-comm-less.html
https://www.tutorialspoint.com/unix_commands/less.htm
```