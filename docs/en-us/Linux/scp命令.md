# SCP Command

The `scp` command is used for copying files and directories between Linux systems. `scp` stands for secure copy, and it is a secure remote file copy command based on `ssh` login in the Linux system. Using `scp` allows you to copy and transfer files from the local system to a remote system, from a remote system to the local system, and between two remote systems on the local system. `scp` is encrypted, while `rcp` is not encrypted. `scp` can be considered as an enhanced version of `rcp`.

## Syntax
```shell
scp [OPTION] [user@]SRC_HOST:]file1 [user@]DEST_HOST:]file2
```

## Options
- `-1`: Force `scp` to use protocol 1, which is an older protocol.
- `-2`: Force `scp` to use protocol 2, which is an older protocol.
- `-3`: Specifies that the copy between two remote hosts is to be done through the local host. If not specified, the data will be copied directly between the two remote hosts and this option also disables the progress meter.
- `-4`: Forces `scp` to use only IPv4 addresses.
- `-6`: Forces `scp` to use only IPv6 addresses.
- `-B`: Use batch mode, which means no interactive keyboard input is required to run `scp`. This also means that `scp` cannot prompt for the password to authenticate the session and requires the use of keys for authentication.
- `-C`: Enable compression, passing the `-C` flag to `ssh` to enable compression of the encrypted connection.
- `-c cipher`: Choose the cipher for encrypting data transmission, passing this option directly to `ssh`.
- `-F ssh_config`: Specify an alternative per-user configuration file for `ssh`, passing this option directly to `ssh`.
- `-i identity_file`: Choose the file containing the RSA identity (private key) for authentication, passing this option directly to `ssh`.
- `-l limit`: Limit the bandwidth usage in `Kbit/s`.
- `-o ssh_option `: Pass options to `ssh` in a format used in `ssh_config`, such as `AddressFamily`, `BatchMode`, `BindAddress`, etc., which is useful for specifying options that do not have separate `scp` command flags.
- `-P port`: Specify the port to connect to on the remote host. Note that this option is specified with a capital `P` because `-p` is already reserved for preserving the time and mode of files in `rcp`.
- `-p`: Preserve the original file's modification time, access time, and mode.
- `-q`: Disable the progress meter.
- `-r`: Recursively copy the entire directory.
- `-S program`: Name of the program to use for encrypted connection, which must be able to parse `ssh` options.
- `-v`: Verbose mode, which makes `scp` and `ssh` print debug messages about their progress. This is helpful for debugging connections, authentication, and configuration issues.

## Examples
Transfer `file.txt` to a remote host.

```shell
scp file.txt root@1.1.1.1:/tmp
# file.txt                      100%    0     0.0KB/s   00:00
```

Use a private key to transfer `file.txt` to a remote host.

```shell
scp -i ./v file.txt root@1.1.1.1:/tmp
# file.txt                      100%    0     0.0KB/s   00:00
```

Transfer the `file.txt` file from a remote directory to the local system with private key authentication.

```shell
scp -i ./v root@1.1.1.1:/tmp/file.txt ./
# file.txt                      100%    0     0.0KB/s   00:00
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/scp.htm
https://www.runoob.com/linux/linux-comm-scp.html
https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/
```