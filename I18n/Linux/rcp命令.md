# `rcp` command

The `rcp` command is used to copy remote files or directories. If two or more files or directories are specified at the same time, and the final destination is an existing directory, it will copy all the previously specified files or directories to that directory. After executing the `rcp` command, there will be no return information. It is only necessary to check whether the files or directories have been successfully copied in the target directory. `rcp` does not prompt for password input. It executes remote execution through `rsh` and requires the same authorization.

## Syntax

```shell
rcp [options] [origin] [target]
```

## Options
* `-r`: Recursively copy all contents from the source directory to the target directory. To use this option, the target location must be a directory.
* `-p`: Preserve the modification time and mode of the source file, including owner, group, permission, and time, ignoring `umask`.
* `-k`: Request `rcp` to obtain a `Kerberos` permit for a remote host in the specified area, rather than obtaining a `Kerberos` permit for a remote host in the area within the `krb_relmofhost` determined.
* `-x`: Open `DES` encryption for all transmitted data, which affects response time and `CPU` usage, but can improve security.
* `-D`: Specify the port number of the remote server.

## Example
Copy the remote file `file.txt`.

```shell
rcp root@1.1.1.1:/file.txt file.txt
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/linux/linux-comm-rcp.html
https://www.tutorialspoint.com/unix_commands/rcp.htm
https://www.cnblogs.com/peida/archive/2013/03/14/2958685.html
```