# cp Command
The `cp` command is mainly used to copy files or directories.

## Syntax

```shell
cp [OPTION]... [-T] SOURCE DEST
cp [OPTION]... SOURCE... DIRECTORY
cp [OPTION]... -t DIRECTORY SOURCE...
```

## Parameters
* `-a, --archive`: Same as `-dR --preserve = ALL`, when performing a copy, it attempts to preserve as much of the original file structure, attributes, and associated metadata as possible.
* `--attributes-only`: Do not copy file data, only create files with the same attributes. If the target file already exists, its content is not changed, and the `--preserve` option can be used to precisely control the attributes to be copied.
* `--backup[=CONTROL]`: Backup each existing target file, otherwise it will be overwritten or deleted. The control parameter `CONTROL` specifies the version control method to be used: `none, off`, no backup; `numbered, t`, numbered backup; `existing, nil`, simple explanation whether numbered backups exist; `simple, never`, always simple backup. There is a special case where `source` and `dest` are the same regular files, `cp --force --backup` will back up the source.
* `-b `: Similar to `--backup`, but does not accept a control parameter and always uses the default control method.
* `--copy-contents`: When operating recursively, copies the contents of special files, such as devices in `FIFO` and `/dev`, usually for professional use.
* `-d`: Copy symbolic links themselves instead of the files they reference, and retain hard links between source files in the copy, same as `--no-dereference --preserve = links`.
* `-f, --force`: If an existing target file cannot be opened, delete it and then retry. This option is ineffective when using the `n / --no-clobber` option, but it operates independently of `-i / --interactive`, and neither option can negate the effect of the other.
* `-i, --interactive`: Prompt before overwrite, overriding a previous `-n` option.
* `-H`: Follow symbolic links specified on the command line while retaining discovered links. If one of the parameters on the command line is a symbolic link, copy the referenced file instead of the link itself. However, if a symbolic link is discovered during recursive traversal, it will be copied as a symbolic link instead of a regular file.
* `-l, --link`: Create hard links to files instead of copying them.
* `-L, --dereference`: Always follow symbolic links in source files. If `source` is a symbolic link, copy the file to which the link points, rather than the link itself. After this option is specified, `cp` cannot create symbolic links in the target copy.
* `-n, --no-clobber`: Do not overwrite existing files. If `-i / --interactive` was previously specified, this option overrides it. The `-b / --backup` option cannot be used to specify this option, as backups are created only when files are overwritten.
* `-P, --no-dereference`: Do not follow symbolic links in the source, copy the symbolic links as symbolic links. However, existing symbolic links encountered in the target can still be followed.
* `-p`: Same as `--preserve=mode,ownership,timestamps`.
* `--preserve[=ATTR_LIST]`: Preserve the specified attributes, separated by commas. The attributes are: `mode`, preserve file mode bits (set by `chmod`) and any `ACL`; `ownership`, preserve owner and group (set by `chown`), with the ability to preserve these attributes being the same as using `chown`; `timestamps`, preserve the time of the last file access and modification if possible (`atime` and `mtime`, set by `touch`); `links`, preserve all links between source files in the target file, when using `-L` or `-H`, this option may copy symbolic links as hard links; `context`, preserve the `SELinux` security context of the source file, otherwise it will fail due to detailed diagnostics; `xattr`, preserve the extended attributes of the source file, otherwise it will fail due to detailed diagnostics; `all`, preserve all the above, the same as specifying all the mentioned attributes individually, the difference is that `context` or `xattr` cannot be copied and the exit status will not indicate a failure. If not specified, the default value for `attr_list` is `mode`, `ownership`, `timestamps`.
* `-c`: Deprecated, same as `--preserve=context`.
* `--no-preserve=ATTR_LIST`: Do not preserve the specified attributes.
* `--parents`: Use full source file names within the directory, i.e., create missing parent directories in the target according to the path specified in the `source`.
* `-R, -r, --recursive`: Recursively copy directories.
* `--reflink[=WHEN]`: If the target file system supports it, perform optimized `CoW` (Copy-On-Write) cloning, the generated copy will share the same bytes on disk as the original file until the copy is modified. Note that this means if the source bytes are corrupted, the target will share the corrupted data.
* `--remove-destination`: Attempt to remove each target file before opening it, opposite to the `--force` option, this option only removes the target file after a failed attempt to open it.
* `--sparse=WHEN`: Control the creation of sparse files. Sparse files contain holes, where a hole is a sequence of zero bytes that does not occupy physical disk space, when reading the file, the hole will be read as zero. Since many files contain long sequences of zeros, disk space can be saved. By default, `cp` detects sparse files and creates sparse target files. The behavior when the parameter defines the action of `cp` when a sparse source file is detected: `auto`, if the source is sparse, attempt to make the target sparse, do not attempt to make it sparse if the target exists and is not a regular file, this is the default; `always`, attempt to make the target sparse for each long sequence of zero bytes in the source, even if the input file is not sparse, this will make a sparse file properly on the target file system if the source file system does not support sparse files; `never`, do not make the output file sparse, some special files (such as swap files) absolutely cannot be sparse.
* `--strip-trailing-slashes`: Remove all trailing slashes from each source parameter.
* `-s, --symbolic-link`: Create symbolic links instead of copying the files themselves. All source files must be absolute path names beginning with a slash, unless the target file is located in the current directory.
* `-S, --suffix=SUFFIX`: Override the usual backup suffix.
* `-t, --target-directory=DIRECTORY`: Copy all source parameters into the directory.
* `-T, --no-target-directory`: Treat the destination as a regular file.
* `-u, --update`: Copy only when the source file is newer than the target file or the target file is missing.
* `-v, --verbose`: Verbose mode, explain what is being done.
* `-x, --one-file-system`: Operate only on the file system where the command is being executed, skipping files if `cp` tries to cross a boundary to another file system. This includes network drives and any files residing on file systems with different mount points. Directories representing the mount point itself will be copied, but not traversed. If `-v` is specified, it will explicitly show the skipped files.
* `-Z, --context[=CTX]`: Set the `SELinux` security context of the target to the default type, or to `CTX` if specified.
* `--help`: Display help information.
* `--version`: Display version information.


## Example

Copy the file `file.txt` as `file2.txt`.

```shell
cp file.txt file2.txt
```

Recursively copy the contents of the `tmp` folder.

```shell
cp -R ./tmp ./tmp2
```


Create a symbolic link to `file.txt` instead of copying the file. Of course, the `ln` command is specifically for creating symbolic links for files, but `cp` is also a good way to create symbolic links. Note that when creating a symbolic link in another directory, `cp` needs to specify the full path name in the source file name, including the complete directory name. Relative paths will not work.

```shell
cp -s file.txt file-link1
```


## Every Day a Problem

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/ucp.htm
https://linuxize.com/post/cp-command-in-linux/
https://www.runoob.com/linux/linux-comm-cp.html
```