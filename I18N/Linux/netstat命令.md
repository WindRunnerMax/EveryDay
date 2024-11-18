# Netstat Command
The `netstat` command displays various network-related information, such as network connections, routing tables, interface statistics, masqueraded connections, multicast member identities, and more.

## Syntax

```shell
netstat [address_family_options] [--tcp|-t] [--udp|-u] [--raw|-w] 
        [--listening|-l] [--all|-a] [--numeric|-n] [--numeric-hosts] 
        [--numeric-ports] [--numeric-users] [--symbolic|-N] 
        [--extend|-e[--extend|-e]] [--timers|-o] [--program|-p] 
        [--verbose|-v] [--continuous|-c]

netstat {--route|-r} [address_family_options] [--extend|-e[--extend|-e]] 
        [--verbose|-v] [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]
        
netstat {--interfaces|-i} [--all|-a] [--extend|-e[--extend|-e]] [--verbose|-v] 
        [--program|-p] [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]

netstat {--groups|-g} [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]
        
netstat {--masquerade|-M} [--extend|-e] [--numeric|-n] [--numeric-hosts] 
        [--numeric-ports] [--numeric-users] [--continuous|-c]
        
netstat {--statistics|-s} [--tcp|-t] [--udp|-u] [--raw|-w]

netstat {--version|-V}

netstat {--help|-h}

address_family_options may be any combination of the following options: 
[-4] [-6] [--protocol={inet,unix,ipx,ax25,netrom,ddp}[,...]] [--unix|-x] 
[--inet|--ip] [--ax25] [--ipx] [--netrom] [--ddp]
```

## Parameters
The type of information printed by `netstat` is controlled by the first parameter, which can be one of the following:
* `(none)`: By default, `netstat` displays the list of open sockets. If no address family is specified, it prints the active sockets of all configured address families.
* `--route, -r`: Displays the kernel routing table, similar to the output of `netstat -r` and `route -e`.
* `--groups, -g`: Shows the membership information of multicast groups for `IPv4` and `IPv6`.
* `--interfaces, -i`: Displays a table of all network interfaces.
* `--masquerade, -M`: Shows the list of masqueraded connections.
* `--statistics, -s`: Displays summary statistics for each protocol.

Following the first parameter, the following options specify the reporting behavior of `netstat`:
* `--verbose, -v`: Tells the user what has happened in detail, especially printing some useful information about unconfigured address families.
* `--wide, -W`: Uses the specified width without truncating the `IP` address based on the output, this is optional to avoid breaking existing scripts.
* `--numeric, -n`: Displays numerical addresses rather than attempting to determine symbolic host, port, or user names.
* `--numeric-hosts`: Displays numerical host addresses, but does not affect the resolution of ports or usernames.
* `--numeric-ports`: Shows numerical port numbers, but does not affect the resolution of host or username.
* `--numeric-users`: Displays numerical user IDs, but does not affect the resolution of host or port names.
* `--protocol=family, -A`: Specifies the address family (low-level protocol) to display its connections, which is a comma-separated list of address family keywords, such as `inet`, `unix`, `ipx`, `ax25`, `netrom`, and `ddp`, which has the same effect as using the `--inet`, `-unix(-x)`, `-ipx`, `-ax25`, `-netrom`, and `--ddp` options. The `inet` family includes raw, udp, and tcp protocol sockets.
* `-c, --continuous`: Causes `netstat` to print the selected information continuously every second.
* `-e, --extend`: Displays additional information, use this option twice for maximal detail.
* `-o, --timers`: Includes information related to network timers.
* `-p, --program`: Shows the process identifier `PID` and the name of the program owning each socket.
* `-l, --listening`: Only shows listening sockets, which are omitted by default.
* `-a, --all`: Shows both listening and non-listening sockets, displays interfaces that are not currently enabled using the `--interfaces` option.
* `-F`: Prints route information from the `FIB`, which is the default setting.
* `-C`: Prints route information from the routing cache.

## Network Connection
Information about active internet connections for `TCP`, `UDP`, `raw` falls into the following categories:
* `Proto`: The protocol `tcp`, `udp`, `raw` used by the socket.
* `Recv-Q`: The number of bytes not copied by the user program connected to this socket.
* `Send-Q`: The number of bytes not acknowledged by the remote host.
* `Local Address`: The local address and port number of the socket, unless the `--numeric, -n` option is specified, in which case the socket address will be resolved to its canonical host name `FQDN`, and the port number will be converted to the corresponding service name.
* `Foreign Address`: The remote address and port number of the socket, similar to the local address.
* `State`: The state of the `socket`, this column can be left blank since there is no state in raw sockets, and states are usually not used in `UDP`. This could typically be one of the following values, which `TCP` generally goes through during handshaking and closing:
    * `ESTABLISHED`: The socket has an established connection.
    * `SYN_SENT`: The socket is actively attempting to establish a connection.
    * `SYN_RECV`: A connection request has been received from the network.
    * `FIN_WAIT1`: The socket has closed; the connection is closing.
    * `FIN_WAIT2`: The connection has been closed; the socket is waiting for the remote to close.
    * `TIME_WAIT`: The socket is waiting after close to handle packets still in the network.
    * `CLOSE`: The socket is not being used.
    * `CLOSE_WAIT`: The remote has closed; waiting for the socket to close.
    * `LAST_ACK`: The remote has closed, and the socket has been closed, waiting for acknowledgement.
    * `LISTEN`: The socket is listening for incoming connections, unless specified with the `--listening, -l` or `--all, -a` options, these sockets are not included in the output.
    * `CLOSING`: Both sockets are closed, but we still have not sent all the data.
    * `UNKNOWN`: The status of the socket is unknown.
* `User`: The username or User `ID(UID)` of the socket owner.
* `PID/Program name`: The `PID` of the process and the process name of the program owning the socket, separated by a forward slash. Including this column requires superuser privileges to view this information on sockets not owned. This identification information is not applicable to `IPX` sockets yet.

## UNIX Domain Sockets

Information about active `UNIX` domain sockets falls into the following categories:
- `Proto`: The protocol used by the socket, usually `unix`.
- `RefCnt`: Reference count, indicating the processes connected through this socket.
- `Flags`: The displayed flags show `SO_ACCEPTON` as `ACC`, `SO_WAITDATA(W)` or `SO_NOSPACE(N)`, and if the respective process for an unconnected socket is waiting for connection requests, `SO_ACCEPTON` is used on the unconnected socket. Other flags are not a normal concern.
- `Type`: There are several types of socket access:
    - `SOCK_DGRAM`: The socket is used in datagram (connectionless) mode.
    - `SOCK_STREAM`: This is a stream (connection) socket.
    - `SOCK_RAW`: This socket is used as a raw socket.
    - `SOCK_RDM`: This service provides reliable message delivery.
    - `SOCK_SEQPACKET`: This is a sequential packet socket.
    - `SOCK_PACKET`: Raw interface access socket.
- `State`: This field will contain one of the following keywords:
    - `FREE`: Unallocated socket.
    - `LISTENING`: The socket is listening for connection requests and will only be included in the output when the `--listening, -l` or `--all, -a` options are specified.
    - `CONNECTING`: The socket is about to establish a connection.
    - `CONNECTED`: The socket is connected.
    - `DISCONNECTING`: The socket is disconnecting.
    - `(empty)`: The socket is not connected to another socket.
- `PID/Program name`: Process ID (PID) and process name of the process opening the socket.
- `Path`: This is the pathname attached to the socket by the corresponding process.
- `Active IPX sockets`: List of active `IPX` sockets.
- `Active NET/ROM sockets`: List of active `NET/ROM` sockets.
- `Active AX.25 sockets`: List of active `AX.25` sockets.

## Files

`netstat` uses the following files:
- `/etc/services`: Service translation file.
- `/proc`: Mount point of the `proc` file system, providing access to kernel status information in a hierarchical file structure form.
- `/proc/net/dev`: Device information file.
- `/proc/net/raw`: Raw socket information.
- `/proc/net/tcp`: `TCP` socket information.
- `/proc/net/udp`: `UDP` socket information.
- `/proc/net/igmp`: `IGMP` multicast information.
- `/proc/net/unix`: `Unix` domain socket information.
- `/proc/net/ipx`: `IPX` socket information.
- `/proc/net/ax25`: `AX25` socket information.
- `/proc/net/appletalk`: `DDP(appletalk)` socket information
- `/proc/net/nr`: `NET/ROM` socket information.
- `/proc/net/route`: `IP` route information.
- `/proc/net/ax25_route`: `AX25` route information.
- `/proc/net/ipx_route`: `IPX` route information.
- `/proc/net/nr_nodes`: `NET/ROM` node list.
- `/proc/net/nr_neigh`: `NET/ROM` neighbors.
- `/proc/net/ip_masquerade`: Masqueraded connections.
- `/proc/net/snmp`: Statistics.

## Examples

Display all `listening` and `non-listening` sockets, and use piping and `less` for convenient viewing of the current status.

```shell
netstat -a | less
```

List all `TCP` ports.

```shell
netstat -at
```

List all `UDP` ports.

```shell
netstat -au
```

List only the listening ports.

```shell
netstat -l
```

List statistics for all ports.

```shell
netstat -s | less
```

Display the `PID` and program names using `TCP`.

```shell
netstat -pt
```

Get kernel routing information.

```shell
netstat -r
```

Retrieve network information related to `ssh` processes.

```shell
netstat -ap | grep ssh
```

Get network status information for port `80`.

```shell
netstat -anp | grep :80
```

Retrieve a list of network interfaces.

```shell
netstat -i
```

Retrieve a list of network interfaces with extended information.

```shell
netstat -ie
```

Get the statistical information of the state of `TCP` sockets using the `awk` command.

```shell
netstat -ant|awk '/^tcp/ {++S[$NF]} END {for(a in S) print (a,S[a])}'
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/unetstat.htm
https://www.runoob.com/linux/linux-comm-netstat.html
https://www.geeksforgeeks.org/netstat-command-linux/
```