# ln Command
The `ln` command is used to create links for files. There are two types of links: hard links and symbolic links. The default link type is a hard link. To create a symbolic link, the `-s` option must be used. A symbolic link is not an independent file, as many of its attributes depend on the source file. Therefore, setting permissions for a symbolic link file is meaningless.

## Syntax

```shell
ln [-bdfinsvF] [-S backup-suffix] [-V {numbered,existing,simple}] [--help] [...] [origin] [target]
```
## Parameters

* `-b, --backup`: Make a backup of the target file before overwriting it.
* `-d, -F, --directory`: Create hard links for directories.
* `-f, --force`: Force creation of file or directory links, regardless of whether the file or directory exists.
* `-i, --interactive`: Prompt before overwriting an existing file.
* `-n, --no-dereference`: Treat the target of a symbolic link as a normal file.
* `-s, --symbolic`: Create a symbolic link for the source file, rather than a hard link.
* `-S <backup-suffix>, --suffix=<backup-suffix>`: When using the `-b` option to backup the target file, the backup file will have a suffix added to its name. The default backup suffix is a tilde `~`, which can be changed using the `-S` parameter.
* `-v, --verbose`: Display the process of the command execution.
* `-V <backup method>, --version-control=<backup method>`: When using the `-b` option to backup the target file, a suffix will be added to the backup file's name. This suffix can be changed using the `-S` parameter, and different backup methods specified with the `-V` parameter will result in different suffixes for the backup file.
* `--help`: Display online help.
* `--version`: Display version information.

## Link Types

### Symbolic Link
* Symbolic links exist in the form of paths, similar to shortcuts in the `Windows` operating system.
* Symbolic links can span file systems, which hard links cannot.
* Symbolic links can link to a non-existent filename.
* Symbolic links can link to directories.

### Hard Link
* Hard links exist as file copies but do not occupy actual space.
* Creating hard links for directories is not allowed.
* Hard links can only be created within the same file system.

## Examples

Create a symbolic link `filesoftlink` for `file.txt`.

```shell
ln -s file.txt filesoftlink
```

Create a hard link `filehardlink` for `file.txt`.

```shell
ln file.txt filehardlink
```

Display version information.

```shell
ln --version
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://man.linuxde.net/ln
https://www.runoob.com/linux/linux-comm-ln.html
https://www.tutorialspoint.com/unix_commands/ln.htm
```