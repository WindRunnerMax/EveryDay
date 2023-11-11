# Pico Command

The `pico` command is a simple and user-friendly text editing program designed primarily for display-based operation, with the style of the `pine` email composer. On modern Linux systems, `nano`, the GNU version of `pico`, is installed by default, and its usage is identical to that of `pico`.

## Syntax

```
nano [OPTIONS] [[+LINE[,COLUMN]] FILE]...
```

## Parameters
* `+LINE[,COLUMN]`: Places the cursor at line `LINE` and column `COLUMN` when starting up, rather than the default at line `1` and column `1`.
* `-?`: Same as `-h`.
* `-A, --smarthome`: Makes the `Home` key more intelligent; if pressed anywhere on a line other than at the very beginning of non-whitespace characters, the cursor will jump to that beginning (forward or backward); if the cursor is already there, it will jump to the true beginning of the line.
* `-B, --backup`: When saving files, it backs up the previous version of the file to the current filename with a `~` suffix.
* `-C dir, --backupdir=dir`: Set the directory where `nano` places unique backup files if file backups are enabled.
* `-D, --boldtext`: Uses bold text instead of reverse video text.
* `-E, --tabstospaces`: Converts typed tabs to spaces.
* `-F, --multibuffer`: Enables multiple file buffers if available.
* `-H, --historylog`: Logs searches and replacements to `~/.nano_history` from which, if there is `nanorc` support, they can be retrieved in later sessions.
* `-I, --ignorercfiles`: If there is `nanorc` support, do not retrieve `SYSCONFDIR/nanorc` or `~/.nanorc`.
* `-K, --rebindkeypad`: Interprets the keys of the numeric keypad so that they all work properly. This option is unnecessary unless needed, as enabling this option will prevent mouse support from functioning properly.
* `-L, --nonewlines`: Does not add newlines at the end of the file.
* `-N, --noconvert`: Disables automatic conversion from `DOS/Mac` format.
* `-O, --morespace`: Uses the blank line below the title bar as extra editing space.
* `-Q str, --quotestr=str`: Sets the quoting string used for justification. If there is extended regular expression support, the default value is `^([ \t]*[#:>\|}])+`, otherwise it is `>`. Please note that `\t` represents `Tab`.
* `-R, --restricted`: Restricts mode; does not read or write any files not specified on the command line, read any `nanorc` files, allow suspending, allow appending a file to another name if there is a filename already, or save under another name, or use backup files or spell checking. Access can also be obtained by calling `nano` with any name starting with `r` (e.g., `rnano`).
* `-S, --smooth`: Enables smooth scrolling; text will scroll line by line rather than the usual chunk-wise behavior.
* `-T cols, --tabsize=cols`: Sets the size (width) of the tabs to `cols`, where `cols`' value must be greater than `0`; default value is `8`.
* `-U, --quickblank`: Quickly clears the status bar; after one keypress rather than 25 keypresses, the status bar message will disappear. Please note that `-c` will override this content.
* `-V, --version`: Outputs version information.
* `-W, --wordbounds`: More accurately detects word boundaries by treating punctuation as part of the word.
* `-Y str, --syntax=str`: Specifies a specific syntax to be highlighted from the `nanorc`, if available.
* `-c, --const`: Constantly display the cursor position. Please note that this will override `-U`.
* `-d, --rebinddelete`: Interprets the `Delete` key differently so that both the backspace key and the `Delete` key work properly; this option is only needed if the backspace key acts like `Delete` on the system.
* `-h, --help`: Outputs help information.
* `-i, --autoindent`: Indents new lines to the previous line's indentation, useful when editing source code.
* `-k, --cut`: Enables cutting from the cursor to the end of the line.
* `-l --nofollow`: If the file being edited is a symbolic link, it replaces that link with the new file instead of following it, perhaps useful when editing files in `/tmp`.
* `-m, --mouse`: Enables mouse support (if available for your system); mouse double-click can be used for marking when setting shortcuts, the mouse will work in the `X` window system and on the console when running `gpm`.
* `-o dir, --operatingdir=dir`: Sets the operating directory, making `nano` behave similar to `chroot`.
* `-p, --preserve`: Preserves the `XON` and `XOFF` sequences `^Q` and `^S` so that they are captured by the terminal.
* `-r cols, --fill=cols`: Wraps at column `cols`; if this value is equal to or less than `0`, wrapping will take place `cols` columns from the width of the screen; wrapping point will change with the width of the screen if it is adjusted, default value is `-8`.
* `-s prog, --speller=prog`: Enables an alternate spell-check program command.
* `-t, --tempfile`: Always saves the modified buffer without prompting, same as the `Pico` `-t` option.
* `-v, --view`: View file (read-only) mode.
* `-w, --nowrap`: Disables line wrapping for long lines.
* `-x, --nohelp`: Disables the help screen at the bottom of the editor.
* `-z, --suspend`: Enables the suspend feature.
* `-a, -b, -e, -f, -g, -j`: Ignored for compatibility with `Pico`.

## Example
Edit a file using `nano`, and edit the file according to the prompts.

```shell
nano file.txt

```
# ^G Get Help
# ^O WriteOut
# ^R Read File
# ^Y Prev Page
# ^K Cut Text
# ^C Cur Pos
# ^X Exit
# ^J Justify
# ^W Where Is
# ^V Next Page
# ^U UnCut Text
# ^T To Spell


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/linux/linux-comm-pico.html
https://www.tutorialspoint.com/unix_commands/nano.htm
https://www.geeksforgeeks.org/nano-text-editor-in-linux/
```