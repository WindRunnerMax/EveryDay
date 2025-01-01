# ed Command

The `ed` command is a text editor used for text manipulation. It is the simplest text editing program in Linux, unlike other full-screen editing programs, `ed` can only edit one line at a time. Although not commonly used, `ed` commands are particularly useful for editing large files or for text editing within shell script programs. When `ed` is called with a file name parameter, a copy of the file is read into the editor's buffer. Changes are made to the copy, rather than directly to the file itself. Upon exiting `ed`, any changes not explicitly saved using the `w` command will be lost. There are two different modes of editing: command and input. When first invoked, `ed` is in command mode, where commands are read from standard input and executed to manipulate the contents of the editor's buffer.

## Syntax
```shell
ed [options] [file]
```

## Options
* `-G, --traditional`: Run in compatibility mode.
* `-l, --loose-exit-status`: Exit with zero status (normal termination) even if the command fails. This option is useful, for example, if setting `ed` as the editor for `crontab`.
* `-p, --prompt=STRING`: By default, `ed` waits for user input on blank lines, this option allows the use of a specific string as a prompt.
* `-r, --restricted`: Run in restricted mode.
* `-s, --quiet, --silent`: Suppress diagnostics.
* `-v, --verbose`: Verbose operation.
* `-h, --help`: Display help information.
* `-V, --version`: Display version information.

## Exit Status
* `0` indicates normal exit.
* `1` indicates environmental issues, such as file not found, invalid flags, I/O errors, and so on.
* `2` indicates a corrupt or invalid input file.
* `3` indicates internal consistency errors (like a software bug) that cause `ed` to crash.

## Examples
A complete editing example:

```shell
ed
a
My name is Titan.
And I love Perl very much.
.
i
I am 24.
.
c
I am 24 years old.
.
w readme.txt
q
```

Explanation:

```
ed                          # Activate the ed command
a                           # Tell ed that I want to edit a new file
My name is Titan.           # Enter the first line content
And I love Perl very much.  # Enter the second line content
.                           # Return to the ed command line state
i                           # Tell ed that I want to insert content before the last line
I am 24.                    # Insert I am 24. between My name is Titan. and And I love Perl very much.
.                           # Return to the ed command line state
c                           # Tell ed that I want to replace the last line's input content
I am 24 years old.          # Replace I am 24. with I am 24 years old., here replacing the last input content
.                           # Return to the ed command line state
w readme.txt                # Name the file readme.txt and save. If editing an existing file, only need to input w
q                           # Completely exit the ed editor
```

```
cat readme.txt
# My name is Titan.
# I am 24 years old.
# And I love Perl very much.
```


## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/ued.htm
https://www.runoob.com/linux/linux-comm-ed.html
https://www.geeksforgeeks.org/ed-command-in-linux-with-examples/
```