# Traceroute command

The `traceroute` command attempts to trace the route of `IP` packets to a particular `Internet` host by initiating probing packets with a small time-to-live (`ttl`) and listening for `ICMP` timeout replies from gateways. It starts with a `ttl` of `1` and increments it until it either receives an `ICMP port unreachable` or `TCP reset`, which indicates that the host has been reached or the maximum number of hops (default of `30` hops) has been reached. It sends three probes (by default) at each `ttl` and prints a line showing the `ttl`, gateway address, and round-trip time for each probe. Additional information can be provided after the address in the request. If responses come from different gateways, it prints the address of each responding system. If there is no response within `5.0` seconds (default value), it prints a `*` for that probe.

## Syntax
```shell
traceroute [-46dFITUnreAV] [-f first_ttl] [-g gate,...] [-i device] 
           [-m max_ttl] [-p port] [-s src_addr] [-q nqueries] 
           [-N squeries] [-t tos] [-l flow_label] [-w waittime] 
           [-z sendwait] [-UL] [-D] [-P proto] [--sport=port] [-M method] 
           [-O mod_options] [--mtu] [--back] host [packet_len]
```

## Parameters
* `-4, -6`: Explicitly force `IPv4` or `IPv6` traceroute, by default, the program will attempt to resolve the given name and automatically select the appropriate protocol, if resolving the hostname returns both `IPv4` and `IPv6` addresses, `traceroute` will use `IPv4`.
* `-I, --icmp`: Use `ICMP ECHO` for probing.
* `-T, --tcp`: Use `TCP SYN` for probing.
* `-d, --debug`: Enable socket-level debugging, if supported by the kernel.
* `-F, --dont-fragment`: Do not fragment the probing packets, for `IPv4` it also sets the `DF` bit, which instructs intermediate routers not to perform remote fragmentation. Change the size of the probing packets via the `packet_len` command parameter to manually obtain information about the `MTU` of individual network hops. Starting from `Linux` kernel `2.6.22`, the non-fragmentation feature (e.g., `-F` or `--mtu`) can function properly. Before this version, `IPv6` was always fragmented and `IPv4` could only use the final `mtu` discovered once (from the route cache), which may be smaller than the actual `mtu` of the device.
* `-f first_ttl, --first=first_ttl`: Specify the starting `TTL`, defaults to `1`.
* `-g gate,..., --gateway=gate,...`: Instruct `traceroute` to add the `IP` source route option to outgoing packets, which tells the network to route packets through the specified gateway (for security reasons, most routers have disabled source routing), multiple gateways (comma-separated list) are usually allowed. For `IPv6`, it is possible to use the form `num`, `addr`, `addr`, `...`, where `num` is the route header type (default is type `2`), note that according to `rfc 5095`, the use of route type `0` is now deprecated.
* `-i device, --interface=device`: Specify the interface through which `traceroute` should send its packets, by default, the interface is chosen based on the routing table.
* `-m max_ttl, --max-hops=max_ttl`: Specify the maximum number of hops `traceroute` should probe (maximum time to live value), default is `30`.
* `-N squeries, --sim-queries=squeries`: Specify the number of probe messages to be sent simultaneously, sending multiple probes can greatly speed up route tracing, the default value is `16`, note that some routers and hosts may employ `ICMP` rate limiting, in which case specifying a large number may result in some responses being lost.
* `-n`: Do not attempt to map the IP addresses to host names when displaying them.
* `-p port, --port=port`: For `UDP` tracing, specify the destination port number `traceroute` will use, the target port number will increment with each probe, for `ICMP` tracing, specify the initial `ICMP` sequence value (also incremented per probe), for `TCP` and other protocols, only specify the (constant) target port to connect to, when using the `tcptraceroute` wrapper program, the `-p` specifies the source port.
* `-t tos, --tos=tos`: For `IPv4`, set the type of service `TOS` and priority value, useful values are `16` for low delay and `8` for high throughput, to use certain `TOS` priority values, superuser permission is required, for `IPv6`, set the traffic class value.
* `-l flow_label, --flowlabel=flow_label`: Use the specified `flow_label` for `IPv6` packets.
* ` -w MAX,HERE,NEAR, --wait=MAX,HERE,NEAR`: Set the time to wait for probe responses, in seconds, default is `5.0`.
* `-q nqueries, --queries=nqueries`: Set the number of probe packets per hop, default is `3`.
* `-r`: Bypass the regular routing table and send directly to a host on the connected network, return an error if the host is not on the directly connected network, this option can be used to perform a `ping` operation on the local host through an interface without a route.
* `-s src_addr, --source=src_addr`: Select an alternate source address, note that an address of an interface must be selected, by default, the address of the outgoing interface is used.
* `-z sendwait, --sendwait=sendwait`: Minimum time interval between probes, default is `0`, if the value is greater than `10`, specify a number in milliseconds, otherwise it is in seconds, floating-point values are also allowed, very useful when some routers employ rate limiting for `ICMP` messages.
* `-e, --extensions`: Display `ICMP` extension names, the universal format is `CLASS / TYPE` followed by a hexadecimal dump, indicated `MPLS` multi-protocol label switching data is parsed, in the format `MPLS:L=label,E=exp_use,S=stack_bottom,T=TTL (with any further objects separated by a slash ("/"))`.
* `-A, --as-path-lookups `: Perform `AS` path lookups in the routing registry and print the result directly after the corresponding address.
* `-M name  --module=name`: Use the specified module (built-in or external) for `traceroute` operations, most methods have their shortcuts, for example, `-I` represents `-M icmp`, etc.
* `-O OPTS,..., --options=OPTS,...`: Use specific module options `OPTS` for the `traceroute` module, allow several `OPTS`, separated by commas, for example, if `OPTS` is `help`, print the help information.
* `--sport=num`: Use the source port number for outgoing packets, indicated as `-N 1`.
* `--fwmark=num`: Set the firewall mark for outgoing packets.
* `-U  --udp`: Use `UDP` for routing to a specific port, instead of increasing the port for each probe, the default port is `53`.
* `-UL`: Use `UDP LITE` for routing, default target port is `53`.
* `-D  --dccp`: Use `DCCP` requests for routing, default port is `33434`.
* `-P prot  --protocol=prot`: Use protocol-protected raw packets for routing.
* `--mtu`: Discover `MTU` along the traced path, indicated as `-F-N 1`.
* `--back`: Infer hops on the backward path, print if different.
* `-V`: Output version information.
* `--help`: Output help information.

## Example

Use `traceroute` to view routing information.

```shell
traceroute www.google.com
```

Specify `IPv4` to view routing information.

```shell
traceroute -4 www.google.com
```

Specify the `TTL` to start with, default is `1`.

```shell
traceroute -f 3 www.google.com
```

Do not resolve `IP` addresses to their domain names.

```shell
traceroute -n www.google.com
```

Set the number of probes per hop, default is `3`.

```shell
traceroute -q 1 www.google.com
```

Specify the complete packet length, default is a `60` byte packet.

```shell
traceroute www.google.com 100
```

Set the target port to be used, default is `33434`.

```shell
traceroute -p 20292 www.google.com
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/utracero.htm
https://www.runoob.com/linux/linux-comm-traceroute.html
https://www.geeksforgeeks.org/traceroute-command-in-linux-with-examples/
```