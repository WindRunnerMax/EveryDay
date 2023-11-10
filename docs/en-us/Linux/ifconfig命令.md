# ifconfig Command

The `ifconfig` command stands for `interface configuration` and is used to view and change the configuration of network interfaces on a system.

## Syntax

```shell
ifconfig [-a] [-v] [-s] <interface> [[<AF>] <address>]
  [add <address>[/<prefixlen>]]
  [del <address>[/<prefixlen>]]
  [[-]broadcast [<address>]]  [[-]pointopoint [<address>]]
  [netmask <address>]  [dstaddr <address>]  [tunnel <address>]
  [outfill <NN>] [keepalive <NN>]
  [hw <HW> <address>]  [mtu <NN>]
  [[-]trailers]  [[-]arp]  [[-]allmulti]
  [multicast]  [[-]promisc]
  [mem_start <NN>]  [io_addr <NN>]  [irq <NN>]  [media <type>]
  [txqueuelen <NN>]
  [[-]dynamic]
  [up|down] ...
```

## Parameters
* `(none), -a`: Display information for all network interfaces, even if they are turned off.
* `-s`: Display a brief list in the same format as the `netstat -i` command.
* `-v`: Verbose mode, displays detailed information on certain error conditions.
* `interface`: Interface name, usually the driver name followed by a unit number, such as the first Ethernet interface `eth0`. If kernel supports alias interfaces, a first alias for `eth0` can be specified with `eth0:0`, to use them to assign a second address, to delete an alias interface, use `ifconfig eth0:0 down`. Note that if the first (main) interface is deleted, all aliases will be removed for each range with the same address/netmask combination on the same network.
* `up`: This flag activates the interface. If an address has been assigned to the interface, it is implicitly specified.
* `down`: This flag causes the interface's driver to be disabled.
* `[-]arp`: Enable (`-` prefix disables) the use of the `ARP` protocol on this interface.
* `[-]promisc`: Enable (`-` prefix disables) promiscuous mode for the interface. When promiscuous mode is enabled, the interface will receive all packets on the network.
* `[-]allmulti`: Enable (`-` prefix disables) all-multicast mode. When all-multicast mode is enabled, the interface will receive all multicast packets on the network.
* `metric N`: This parameter sets the interface metric, which the interface uses to make routing decisions. `N` must be an integer between `0` and `4294967295`.
* `mtu N`: This parameter is used to set the maximum transmission unit for the interface, which limits the maximum packet size the interface can transmit.
* `dstaddr address`: Set the remote IP address for a point-to-point link (e.g., `PPP`). This keyword is now deprecated; please use the `pointopoint` keyword instead.
* `netmask address`: Set the IP network mask for the interface. This value defaults to the standard `A`, `B`, or `C` class network masks derived from the interface `IP` address, but it can be set to any value.
* `add address/prefixlen`: Add an `IPv6` address to the interface.
* `del address/prefixlen`: Remove an `IPv6` address from the interface.
* `tunnel aa.bb.cc.dd`: Create a new `SIT (IPv6-in-IPv4)` device, tunneled to the given destination.
* `irq address`: Set the interrupt line used by this device. Not all devices can dynamically change their `IRQ` settings.
* `io_addr address`: Set the starting address in this device's `I/O` space.
* `mem_start address`: Set the starting address for the shared memory used by this device. Only a few devices require this feature.
* `media type`: Set the physical port or media type for the device. Not all devices can change this setting, and some devices can change the values they support. Typical values for type are `10base2` (thin coaxial cable network), `10baseT` (twisted pair `10 Mbps` Ethernet), AUI transceiver, etc. The special media type `auto` tells the driver to autonegotiate the media. Not all drivers can perform this operation.
* `[-]broadcast [address]`: If an address parameter is specified, it sets the protocol broadcast address for the interface; otherwise, it sets (with `-` prefix clears) the interface's `IFF_BROADCAST` flag.
* `[-]pointopoint [address]`: This keyword enables the interface's point-to-point mode, meaning it is a direct link between two machines with no one else listening in. If an `address` parameter is also provided, set the protocol address at the other end of the link as with the obsolete `dstaddr` keyword; otherwise, set or clear the interface's `IFF POINTOPOINT` flag.
* `hw class address`: If supported by the device driver, set the hardware address for this interface. The keyword must be followed by the name of the hardware class and its printable `ASCII` equivalent of the hardware address. Currently supported hardware classes include `ether (Ethernet)`, `ax25 (AMPR AX.25)`, `ARCnet and netrom (AMPR NET/ROM)`.
* `multicast`: Set the multicast flag on the interface. This is usually unnecessary since the driver will correctly set this flag.
* `address`: IP address assigned to the interface.
* `txqueuelen length`: Set the length of the device's transmit queue. For slower devices with higher latency (e.g., connections over modems or `ISDN`), setting it to a smaller value is very useful to prevent too much interference from rapid bulk transfers with interactive communication such as `telnet`.

```markdown
## Hardware Types <HW>
`loop (Local Loopback)`, `slip (Serial Line IP)`, `cslip (VJ Serial Line IP)`, `slip6 (6-bit Serial Line IP)`, `cslip6 (VJ 6-bit Serial Line IP)`, `adaptive (Adaptive Serial Line IP)`, `ash (Ash)`, `ether (Ethernet)`, `ax25 (AMPR AX.25)`, `netrom (AMPR NET/ROM)`, `rose (AMPR ROSE)`, `tunnel (IPIP Tunnel)`, `ppp (Point-to-Point Protocol)`, `hdlc ((Cisco)-HDLC)`, `lapb (LAPB)`, `arcnet (ARCnet)`, `dlci (Frame Relay DLCI)`, `frad (Frame Relay Access Device)`, `sit (IPv6-in-IPv4)`, `fddi (Fiber Distributed Data Interface)`, `hippi (HIPPI)`, `irda (IrLAP)`, `ec (Econet)`, `x25 (generic X.25)`, `eui64 (Generic EUI-64)`

## Address Families <AF>
`unix (UNIX Domain)`, `inet (DARPA Internet)`, `inet6 (IPv6)`, `ax25 (AMPR AX.25)`, `netrom (AMPR NET/ROM)`, `rose (AMPR ROSE)`, `ipx (Novell IPX)`, `ddp (Appletalk DDP)`, `ec (Econet)`, `ash (Ash)`, `x25 (CCITT X.25)`

## Examples

Display network device information.

```shell
ifconfig
```

Start and stop a specific network card.

```shell
ifconfig eth0 down
ifconfig eth0 up
```

Configure and delete an `IPv6` address for a network card.

```shell
ifconfig eth0 add 33ffe:3240:800:1005::2/64
ifconfig eth0 del 33ffe:3240:800:1005::2/64
```

To change the `MAC` address, first disable the network card, then modify the `MAC` address, and finally enable the network card.

```shell
ifconfig eth1 hw ether 00:1D:1C:1D:1E
ifconfig eth1 up
```

Assign an `IP` address to the network card, and include the subnet mask and broadcast address.

```shell
ifconfig eth0 192.168.1.56 netmask 255.255.255.0 broadcast 192.168.1.255
```

Enable and disable the `ARP` protocol.

```shell
ifconfig eth0 arp
ifconfig eth0 -arp
```

Set the Maximum Transmission Unit `MTU`.

```shell
ifconfig eth0 mtu 1500
```

## Every Day One Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/uifconfi.htm
https://www.runoob.com/linux/linux-comm-ifconfig.html
https://www.geeksforgeeks.org/ifconfig-command-in-linux-with-examples/
```
```