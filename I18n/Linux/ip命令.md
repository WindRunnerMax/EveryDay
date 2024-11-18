# ip command
The `ip` command is similar to the `ifconfig` command, but more powerful than the `ifconfig` command. Its main function is to display or set the configuration of network devices, routes, and tunnels. The `ip` command is an enhanced version of the network configuration tool in `Linux`, used to replace the `ifconfig` command.

## Syntax
```shell
ip [ OPTIONS ] OBJECT { COMMAND | help }
ip [ -force ] -batch filename

OBJECT := { link | addr | addrlabel | route | rule | neigh | ntable | tunnel | tuntap | maddr | mroute | mrule | monitor | xfrm | netns }

OPTIONS := { -V[ersion] | -s[tatistics] | -r[esolve] | -f[amily] { inet | inet6 | ipx | dnet | link } | -o[neline] }
```

## Parameters

### OPTIONS
* `-b, -batch <FILENAME>`: Read commands from the provided file or standard input, the first failure will lead to the termination of the `ip` execution.
* `-force`: Do not terminate `ip` due to errors in batch mode. If any error occurs during command execution, the application return code will be non-zero.
* `-s, -stats, -statistics`: Output more information. If this option appears two or more times, the amount of information will increase. Typically, the information is statistical information or some time values.
* `-l, -loops <COUNT>`: Specify the maximum number of loops attempted by `ip addr flush` before giving up. The default value is `10`, `0` means looping until all addresses are deleted.
* `-f, -family <FAMILY>`: Specify the protocol family used. The protocol family identifier can be one of `inet`, `inet6`, `bridge`, `ipx`, `dnet`, or `link`. If this option does not exist, the protocol family is guessed based on other parameters. If the rest of the command line does not provide enough information to guess the family, `ip` will fall back to the default `ip` setting, usually `inet` or `any`. `link` is a special family identifier that does not involve any network protocols.
* `-4`: Shortcut for `-family inet`.
* `-6`: Shortcut for `-family inet6`.
* `-B`: Shortcut for `-family bridge`.
* `-D`: Shortcut for `-family decnet`.
* `-I`: Shortcut for `-family ipx`.
* `-0`: Shortcut for `-family link`.
* `-o, -oneline`: Output each record as a single line, replacing newline characters with `\` character. This is convenient when counting records with `wc` or grepping the output.
* `-r, -resolve`: Print `DNS` names using the system's name resolution program instead of host addresses.
* `-V, -Version`: Output version information.

### OBJECT
* `address`: Protocol address on a device, `IP` or `IPv6`.
* `addrlabel`: Label configuration used for protocol address selection.
* `l2tp`: IP tunnel Ethernet `L2TPv3`.
* `link`: Network device.
* `maddress`: Multicast addresses.
* `monitor`: Monitor `netlink` messages.
* `mroute`: Multicast routing cache entry.
* `mrule`: Rule in the multicast routing policy database.
* `neighbour`: Manage `ARP` or `NDISC` cache entries.
* `netns`: Manage network namespaces.
* `ntable`: Operations on the neighbour cache.
* `route`: Routing table entry.
* `rule`: Rule in the routing policy database.
* `tcp_metrics/tcpmetrics`: Manage `TCP` metrics.
* `tunnel`: `IP` tunnel.
* `tuntap`: Manage `TUN/TAP` devices.
* `xfrm`: Manage `IPSec` policies.

## Examples

To view network interface information, such as `IP` addresses and subnets.
```shell
ip addr show
```

To view information about the `eth0` network card.
```shell
ip addr show eth0
```

To enable a network interface.
```shell
ip link set eth0 up
```

To disable a network interface.
```shell
ip link set eth0 down
```

To view routing and default gateway information.
```shell
ip route show
```

To get routing information for a specific `IP`.
```shell
ip route get to 192.168.111.111
```

To view `arp` entries.
```shell
ip neigh
```

To view network statistics.
```shell
ip -s link
```

For detailed help information.
```shell
man ip
```

## Daily Challenge
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/ip.htm
https://www.commandlinux.com/man-page/man8/ip.8.html
https://www.geeksforgeeks.org/ip-command-in-linux-with-examples/
```