# The `route` Command
In computer networking, a router is a device responsible for forwarding network traffic. When a data packet arrives at a router, it must determine the best way to route it to its destination. The `route` command is used to view and modify the kernel routing table. The command syntax varies on different systems, so it's practical to check the command's help to determine the specific usage.

## Syntax

```shell
route [-CFvnee]
route [-v] [-A family] add [-net|-host] target [netmask Nm] [gw Gw] 
      [metric N] i [mss M] [window W] [irtt m] [reject] [mod] [dyn] 
      [reinstate] [[dev] If]
route [-v] [-A family] del [-net|-host] target [gw Gw] [netmask Nm] 
      [metric N] [[dev] If]
route [-V] [--version] [-h] [--help]
```

## Parameters
* `(none)`: View all current route definitions.
* `-A family`: Use the specified address family. You can check the supported address families by using `route --help`, commonly supported address families include `inet (DARPA Internet)`, `inet6 (IPv6)`, `ax25 (AMPR AX.25)`, `netrom (AMPR NET/ROM)`, `ipx (Novell IPX)`, `ddp (Appletalk DDP)`, `x25 (CCITT X.25)`.
* `-F`: Operate on the kernel's `FIB` forwarding information base routing table, which is the default.
* `-C`: Operate on the kernel's route cache.
* `-v`: Output verbose operation details.
* `-n`: Show numerical addresses instead of trying to determine symbolic host names; this will be useful to detect why routing to a name server is failing.
* `-e`: Display the route table in `netstat` format; `-ee` will generate a very long line with all parameters from the route table.
* `del`: Delete a route.
* `add`: Add a route.
* `target`: Target network or host, can be provided as an IP address in dotted decimal form or a host/network name.
* `-net`: The target being added is a network.
* `-host`: The target being added is a host.
* `netmask NM`: When adding a network route, the network mask to be used.
* `gw GW`: Route packets through a gateway; the gateway must be accessible first, usually meaning a static route to the gateway must be set beforehand. If you specify an address of one of the local interfaces, it will be used to determine which interface to route the packet on.
* `metric M`: Set the metric field in the routing table (used by routing daemons) to `M`.
* `mss M`: Set the `TCP` Maximum Segment Size (`MSS`) for connections routed through this route to `M` bytes. The default is the device `MTU` minus the headers, or a lower `MTU` in case of Path MTU Discovery. When Path MTU Discovery doesn't work (typically due to misconfigured firewalls blocking the required `ICMP` fragments), this setting can be used to force the use of smaller `TCP` packets on the other end.
* `window W`: Set the `TCP` window size for connections routed through this route to `W` bytes; only used on `AX.25` networks when the driver can't handle back-to-back frames.
* `irtt m`: Set the Initial Round Trip Time (`irtt`) for `TCP` connections routed through this route to `m` milliseconds (`1-12000`); only used on `AX.25` networks. If omitted, the default value as per `RFC 1122` of `300ms` is used.
* `reject`: Install a blocking route, which forces a route lookup failure. This can be used to block a network before using a default route. It's important to note that this is not intended for firewall purposes.
* `mod, dyn, reinstate`: Install a dynamic or modified route; these flags are used for diagnostic purposes and are typically set only by routing daemons.
* `dev If`: Force the route to be associated with the specified device; otherwise, the kernel will try to determine the device on its own (by checking existing routes and device specifications, and the position of adding the route). This functionality is rarely needed in most typical networks. If `dev If` is the last option on the command line, the word `dev` can be omitted as it is the default. Otherwise, the order of route modifiers `metric - netmask - gw - dev` is irrelevant.
* `-h, --help`: Output help information.

## Examples
Display the routing table for all `IP`s bound to the server.

```shell
route -n
```

Add a default gateway, which assigns a gateway address to forward all packets not belonging to this network.

```shell
route add default gw 169.213.0.0
```

List kernel's route cache information; the kernel retains route cache information for faster packet routing.

```shell
route -Cn
```

Reject routing to a specific host or network.

```shell
route add -host 192.168.1.51 reject
```

Delete the default gateway, which may cause some internet issues, so take note of the default gateway before proceeding with this command.

```shell
route del default
```

When we connect a `PPTP`, we typically configure adding a route for a network segment to specify data to go through `ppp0`.

```shell
route add -net 192.168.0.0/16 dev ppp0
```

Configure adding a route for a domain name to specify data to go through `ppp0`.


```shell
route add -host jwgl.sdust.edu.cn dev ppp0
```

Set all Class D multicast IP routes to go through eth0.

```shell
route add -net 224.0.0.0 netmask 240.0.0.0 dev eth0
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/route.htm
https://blog.csdn.net/u013485792/article/details/51700808
https://www.geeksforgeeks.org/route-command-in-linux-with-examples/
```