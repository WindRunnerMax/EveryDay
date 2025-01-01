# ex command
The `ex` command is used to start the `vim` text editor in `Ex` mode. The effect of running `ex` is similar to `vi -e`. To return from `Ex` mode to normal mode, just type `:vi` or `:visual` in `vim`. You can start `ex` by running `vi -e`, or start `vi` by running `ex -v`. `ex` is the basis of `vim`, which is one of the most popular text editors in the world. `ex` is not another editor; it should be said that `vi` is the visual mode of the more general and basic `ex` line editor, making `ex` the underlying line editor of `vi`. Since some `ex` commands can save a lot of editing time, they are very useful when using `vi`. Most of these commands can be used without leaving `vi`.

## Syntax

```shell
ex [ -| -s ] [ -l ] [ -L ] [ -R ] [ -r [ file ] ] [ -t tag ] [ -v ] [ -V ] 
   [ -x ] [ -wn ] [ -C ] [ +command | -c command ] file
```

## Parameters
* `--`: Only file names after it.
* `-v`: Start `vim` in `vi` mode.
* `-e`: Start `vim` in `ex` mode.
* `-E`: Start `vim` in improved `ex` mode.
* `-s`: Silent mode, only effective if preceded by the `-e` option or if a command starting with `Ex` is given before the `-s` option.
* `-d`: Start in `diff` mode, should have two or three file name arguments, `vim` will open all the files and show the differences between them, working like `vimdiff`.
* `-y`: Start `vim` in easy mode, similar to `evim` or `eview`, making `vim` behave like a clicking and typing editor.
* `-R`: Read-only mode, sets the `readonly` option, allowing editing of the buffer, but preventing accidental overwriting of the file. If you still want to overwrite the file, use `w!` in the `Ex` command.
* `-Z`: Restricted mode, similar to `rvim`.
* `-m`: Prevent modification of the file, resetting the write option, still allowing modification of the buffer but not writing to the file.
* `-M`: No modification allowed, the modify and write options will be unset, thus disallowing any changes and writing to the file. Note that these options can be set to enable modification.
* `-b`: Binary mode, sets several options so that binary files or executable files can be edited.
* `-l`: `Lisp` mode, sets the `lisp` and `showmatch` options on.
* `-C`: Compatible, sets the `compatible` option, causing `vim` to act like `vi`, even if a `.vimrc` file exists.
* `-N`: Not compatible mode, resets the compatible option, causing `vim` to behave better even if the `.vimrc` file does not exist, but with less compatibility with `vi`.
* `-V[N][fname]`: Verbose mode, provides information about which files the information came from and messages used for reading and writing the `viminfo` file, the optional number `N` is the verbose value, default is `10`.
* `-D`: Debug mode, jumps to debug mode when the first command is executed from a script.
* `-n`: No swap file will be used, making it impossible to recover after a crash. This feature is very convenient for editing files on very slow media such as floppy disks.
* `-r`: List swap files and information about using them for recovery.
* `-r <file name>`: Recovery mode, swap files are used to recover crashed editing sessions, swap files have the same file name as the text file with `.swp` appended.
* `-L`: Same as `-r`.
* `-A`: If `vim` is compiled with Arabic language support, used for editing right-to-left files and Arabic keyboard mapping, this option will start `vim` in Arabic mode, setting `ARABIC`, otherwise an error message will be issued, causing `vim` to abort.
* `-H`: Start in Hebrew mode.
* `-F`: Start in Farsi mode.
* `-T <terminal>`: Tells `vim` the name of the terminal being used, only needed when the automatic method is not working, should be a terminal known to `vim` built-in, or defined in the `termcap` or `terminfo` file.
* `--not-a-term`: Skip warnings when input or output is not a terminal.
* `-u <vimrc>`: Initialize using commands in the file `.vimrc`, skipping all other initializations. Use this option to edit special types of files, or to skip all initializations by giving the name `NONE`.
* `--noplugin`: Skip loading plugins, as if `-u` is empty.
* `-p[N]`: Open `N` tab pages, if `N` is omitted, one tab page is opened for each file.
* `-o[N]`: Open `N` stacked windows, when `N` is omitted, one window is opened for each file.
* `-O[N]`: Open `N` horizontally split windows, if `N` is omitted, one window is opened for each file.
* `+`: Start at the end of the file.
* `+<lnum>`: For the first file, the cursor will be positioned on line `num`. If `num` is missing, the cursor will be on the last line.
* `--cmd <command>`: Execute `<command>` before loading any `.vimrc` file.
* `-c <command>`: Execute `<command>` after the first file has been loaded.
* `-S <session>`: Source the file `<session>` after the first file has been loaded.
* `-s <scriptin>`: Read normal mode commands from the file `<scriptin>`.
* `-w <scriptout>`: Append all typed commands to the file `<scriptout>`.
* `-W <scriptout>`: Write all typed commands to the file `<scriptout>`.
* `-x`: Edit an encrypted file.
* `--startuptime <file>`: Write the startup timing messages to `<file>`.
* `-i <viminfo>`: Use `<viminfo>` instead of `.viminfo`.
* `-h  or  --help`: Output help information.
* `--version`: Output version information.

## Examples
Start `ex` editing mode for `file.txt`.

```shell
ex file.txt
```

Display total line count and current line number.

```shell
= | .=
```

Print the first `3` lines of the file.

```shell
1,3 p
```

Delete lines `1` to `2` and switch back to `vi` mode to see the effect.

```shell
1,2 d
vi
```

Move lines `1` and `2` below line `3`.

```shell
1,2 m 3
vi
```

Copy lines `1` and `2` below line `3`.

```shell
1,2 co 3
vi
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/uex.htm
https://www.runoob.com/linux/linux-comm-ex.html
https://www.cnblogs.com/dasn/articles/5240991.html
https://www.tutorialspoint.com/unix_commands/ex.htm
https://blog.csdn.net/u013408061/article/details/77853130
https://www.geeksforgeeks.org/ex-command-in-linux-with-examples/
```