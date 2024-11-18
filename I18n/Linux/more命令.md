# more Command
The `more` command is similar to `less` in that it allows you to browse the contents of a file in a paginated manner. After exiting the `more` command, the operations performed will remain on the shell. While browsing in pagination, you can use the `h` key to output the help file.

## Syntax
```shell
more [options] [file]
```

## Options
* `-d`: Prompts the user to display `[Press space to continue, 'q' to quit.]` at the bottom of the screen. If the user presses the wrong key, it will display `[Press 'h' for instructions.]` instead of beeping.
* `-f`: Calculates the actual number of lines, not the number of lines after automatic line wrapping. Some single-line words that are too long will be expanded into two or more lines.
* `-l`: Disables the feature that pauses when encountering the special character `^L` for page breaks.
* `-c`: Instead of scrolling, it draws each screen from the top, clearing the remaining parts of each line displayed, similar to `-p`, but different in that it first displays the content before clearing other output.
* `-p`: Does not display each page in scroll mode, but clears the output first before displaying the content.
* `-s`: Substitutes consecutive blank lines with a single blank line.
* `-u`: Hides the underscore, which varies depending on the `terminal` specified by the `TERM` environment variable.
* `-<num>`: Specifies the number of lines per screen.
* `+<num>`: Displays the content starting from line `num`.
* `+/<str>`: Searches for the string `str` before displaying each document, and then begins displaying from that string onwards.
* `-V`: Displays version information.

## Common Operations
* `h or ?`: Help menu, displays a summary of commands.
* `SPACE`: Display the next `k` lines of text, with the default being the current screen size.
* `Enter`: Moves down `n` lines, where `n` needs to be defined, defaulting to `1` line.
* `Ctrl+F`: Scrolls down one page.
* `Ctrl+B`: Goes back one page.
* `=`: Outputs the line number of the current line.
* `:f`: Outputs the file name and the line number of the current line.
* `V`: Invokes the `vi` editor.
* `! <cmd>`: Invokes the `Shell` and executes the command.
* `q`: Exits the `more` command.

## Examples
Paginate the contents of the `/var/log/ufw.log` file.
```shell
more /var/log/ufw.log
```

Display the contents of the `/var/log/ufw.log` file starting from line `20`.
```shell
more +20 /var/log/ufw.log
```

Paginate the contents of the `/var/log/ufw.log` file, with `1` line per page.
```shell
more -1 /var/log/ufw.log
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.runoob.com/linux/linux-comm-more.html
https://www.tutorialspoint.com/unix_commands/more.htm
https://alvinalexander.com/unix/edu/examples/more.shtml
```