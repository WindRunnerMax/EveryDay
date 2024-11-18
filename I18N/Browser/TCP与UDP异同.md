# Differences and Similarities between TCP and UDP
The transport layer of the `TCP/IP` model has two different protocols: the `UDP` User Datagram Protocol and the `TCP` Transmission Control Protocol.

## Similarities
* Both `TCP` and `UDP` are protocols that operate at the transport layer.
* Communication using both `TCP` and `UDP` requires open ports.

## Differences

### TCP
* `TCP` is a connection-oriented protocol that provides full-duplex communication. It requires the establishment of a connection before data transmission, and the data payload is relatively larger.
* `TCP` provides reliable delivery services, ensuring reliable communication using services like flow control and congestion control.
* The minimum TCP header size is `20` bytes, and the maximum header size is `60` bytes, including source port, destination port, sequence number, acknowledgment number, data offset, control flags, window, checksum, urgent pointer, options, and other information.
* `TCP` only supports one-to-one communication.
* Communication in `TCP` is byte-oriented.
* `TCP` ensures the order of data transmission by assigning a sequence number to each byte of the data stream within the TCP connection.
* `TCP` provides features such as checksum, acknowledgment response, sequence number, timeout retransmission, connection management, flow control, and congestion control.
* `TCP` is suitable for applications that require reliable transmission, such as file transfers.

### UDP
* `UDP` is connectionless, meaning that a connection does not need to be established before sending data, and the data payload is relatively smaller.
* `UDP` provides best-effort delivery, meaning that it does not guarantee reliable delivery and does not use flow control and congestion control.
* The UDP header is `8` bytes long, including source port, destination port, length, and checksum information.
* `UDP` supports unicast, multicast, and broadcast functionalities, enabling one-to-one, one-to-many, many-to-many, and many-to-one data transmission.
* `UDP` is message-oriented, and it does not merge or split the data segments received from the application layer. Instead, it preserves the boundaries of these segments and passes them down to the `IP` layer after adding the header.
* `UDP` does not ensure the order of data transmission, and the application layer program needs to control the order by adding sequence numbers to the data segments.
* `UDP` adds minimal functionality on top of the `IP` datagram service, mainly adding port functionality and error detection.
* `UDP` is suitable for real-time applications such as network telephony, video conferencing, and live streaming.

## Related Issues

### Achieving Reliable Transmission with UDP
The transport layer cannot ensure the reliable transmission of data, and it can only be implemented at the application layer. This can be done by emulating the reliability transmission features of TCP, such as implementing acknowledgment mechanisms, retransmission mechanisms, and window confirmation, but at the application layer. Open-source programs like `RUDP`, `RTP`, and `UDT` use `UDP` to achieve reliable data transmission. Additionally, there are protocols like `KCP` that balance the reliability of `TCP` with the speed of `UDP`.

### Differences between Short and Long TCP Connections
Short connections: When a `Client` sends a message to a `Server`, the `Server` responds to the `Client`, and then the process is completed with a single read and write. At this point, either party can initiate a `close` operation, but it is usually the `Client` that initiates the `close` operation. Short connections usually involve only one read and write operation between the `Client` and the `Server`. Managing short connections is relatively simple, as any existing connection is useful and does not require additional control measures. However, frequent client requests can result in wasted time and bandwidth on TCP connection establishment and closure operations.

Long connections: After a `Client` and `Server` complete a read and write operation, the connection between them does not close actively. Subsequent read and write operations continue to use this connection. Long connections can eliminate many TCP setup and closure operations, reduce waste, and save time. They are more suitable for clients that frequently request resources. However, as the number of client connections increases, the server load will also increase. In such cases, strategies such as closing long-unused connections using the `LRU` algorithm, and limiting the number of client connections may be necessary to reduce the load.

### Solutions for TCP Packet Sticking and Unpacking
Since `TCP` is byte-oriented and cannot understand the business data of the higher layer, it is unable to guarantee that data packets are not split or recombined at the lower level. This issue can only be resolved through the design of the upper-layer application protocol stack.
* Fixed-length message: The sending end encapsulates each data packet with a fixed length (padding with `0` if necessary). This way, the receiving end naturally splits each data packet by reading a fixed length of data from the receive buffer.
* Setting message boundaries: The server separates message content from the network stream based on message boundaries and uses a line feed character at the end of the packet for separation, as is done in the FTP protocol.
* Splitting messages into message headers and bodies: The message header includes a field that indicates the total length of the message (or the length of the message body).

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/108822858
https://www.cnblogs.com/liangyc/p/11628148.html
https://blog.csdn.net/m_xiaoer/article/details/72885418
https://blog.csdn.net/pangyemeng/article/details/50387078
https://blog.csdn.net/quiet_girl/article/details/50599777
https://blog.csdn.net/liuchenxia8/article/details/80428157
https://blog.csdn.net/qq_40732350/article/details/90902396
https://www.cnblogs.com/fundebug/p/differences-of-tcp-and-udp.html
```