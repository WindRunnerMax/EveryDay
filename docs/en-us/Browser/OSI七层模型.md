# OSI Seven-Layer Model
The **OSI** seven-layer model consists of the physical layer, data link layer, network layer, transport layer, session layer, presentation layer, and application layer. The session layer, presentation layer, and application layer are generally referred to as the application layer. In the **TCP/IP** four-layer model, the physical layer and data link layer are classified as the network interface layer, the network layer and transport layer are separate layers, and the session layer, presentation layer, and application layer are classified as the application layer.

## Physical Layer
The main task of the physical layer is to determine certain characteristics of the interface with the transmission media, providing the mechanical, electrical, functional, and procedural conditions for establishing, maintaining, and terminating physical connections. In other words, the physical layer provides means for transmitting synchronization and bitstream on physical media.

### Signal-related Concepts
* Unidirectional communication, also known as simplex communication, allows communication in only one direction without bidirectional interaction.
* Bidirectional alternating communication, also known as half-duplex communication, allows both parties to send information, but not simultaneously, and they cannot receive simultaneously.
* Bidirectional simultaneous communication, also known as full-duplex communication, allows both parties to send and receive information simultaneously.
* Baseband signal, also known as basic frequency band signal, is a signal from a signal source, such as data signals representing various texts or image files output by a computer.
* Bandpass signal, after modulating the baseband signal with carrier waves, shifts the frequency range of the signal to a higher frequency band for transmission over the channel, allowing transmission within a certain frequency range.

### Basic Binary Modulation Methods
* Amplitude Modulation (AM): The carrier wave amplitude changes with the baseband digital signal.
* Frequency Modulation (FM): The carrier wave frequency changes with the baseband digital signal.
* Phase Modulation (PM): The initial phase of the carrier wave changes with the baseband digital signal.

### Channel Multiplexing
* Frequency Division Multiplexing (FDM): Divides the total bandwidth used for transmission into several sub-bands or sub-channels, with each sub-channel transmitting one signal.
* Time Division Multiplexing (TDM): Divides time into equal-length time-division multiplexing frames, with each time-division multiplexed user occupying a fixed-numbered slot in each TDM frame.
* Statistical Time Division Multiplexing (STDM): Dynamically allocates line resources according to user's actual needs, providing line resources only when users have data to transmit.
* Wavelength Division Multiplexing (WDM): Optical frequency division multiplexing.
* Code Division Multiplexing (CDM): Distinguishes original signals using different encoding methods, including code-division multiple access, frequency-division multiple access, time-division multiple access, and synchronous code-division multiple access.

## Data Link Layer
The data link layer is used to establish, maintain, and terminate link connections and achieve error-free transmission. It combines bits into bytes, and then frames the bytes, using link layer addresses - such as **MAC** addresses in Ethernet - to access the medium and perform error detection.

### Basic Functions
* Frame Encapsulation: Adding headers and footers to the front and back of a segment of data, then forming a frame, and defining the frame's boundaries.
* Transparent Transmission: When control characters appear in frames, a escape character is inserted, usually using character padding or zero-bit padding.
* Error Control: Due to noise on the physical line, bit errors may occur, which can be controlled using error-correcting codes or detection codes, and since error-correcting codes are complex and carry more redundant information, detection codes with retransmission mechanisms are generally used. The commonly used detection code is the cyclic redundancy check (**CRC**).

### PPP Protocol
* Simple
* Frame Encapsulation
* Transparency
* Multiple Network Layer Protocols
* Multiple types of links
* Error Detection
* Detecting connection state
* Maximum transmission unit
* Network layer address negotiation
* Data compression negotiation

### Ethernet CSMA/CD Protocol
* Multi-access: Many computers are connected to a bus in a multi-point manner.
* Carrier Sense: Before sending data, each station must first check if other computers are sending data on the bus, and if so, it should temporarily not send data to avoid collisions.
* Collision Detection: When at least two stations are sending data at the same time, a collision occurs.
* Half-duplex communication: Both parties can send information, but not simultaneously, and they cannot receive simultaneously
* Contention period: The end-to-end round trip delay is referred to as the contention period, and after this period without detecting a collision, it can be confirmed that this transmission will not collide. Ethernet uses 51.2 microseconds as the contention period.
* Binary exponential backoff algorithm: After a station encounters a collision and stops sending data, it must postpone sending data by a random time before sending again.
* Minimum effective frame length: If a collision occurs, it must be within the first 64 bytes of transmission. Ethernet specifies that frames shorter than 64 bytes are invalid frames terminated abnormally due to collisions. 
* Transparent bridge: The bridge records **MAC** addresses and interface information through self-learning and forwards frames, and generates a forwarding table through the spanning tree algorithm, thereby extending the local area network.

## Network Layer
The network layer specifies the protocols for establishing, maintaining, and terminating network connections. Its main function is to utilize the error-free data transmission function provided by the data link layer between adjacent nodes to establish a connection between two systems through route selection and relay functions.

### Design Adoption
* The network layer only provides simple, flexible, connectionless, best-effort data delivery service.
* The network does not need to establish a connection when sending packets. Each packet, or `IP` datagram, is independently sent and is not related to the packets before or after it, meaning there is no numbering involved.
* The network layer does not guarantee service quality, meaning the transmitted packets may be erroneous, lost, duplicated, or out of order, and it does not ensure the timing of packet delivery.

### Virtual Circuits and Circuit Switching
* A virtual circuit signifies a logical connection, with packets being transmitted along this logical connection using a store-and-forward method, and not actually establishing a physical connection.
* In circuit-switched telephone communication, a genuine connection is first established, so virtual circuits for packet switching and circuit switching are similar but not entirely the same.

### Virtual Circuits versus Datagram

Comparison | Virtual Circuit Service | Datagram Service
--- | --- | ---
Approach | Network should ensure reliable communication | User hosts should ensure reliable communication
Connection establishment | Required | Not necessary
Destination address | Used only during connection establishment; each packet uses a short virtual circuit number | Each packet has its complete destination address
Packet forwarding | Packets belonging to the same virtual circuit are forwarded via the same route | Each packet independently selects a route for forwarding
Node failure | The virtual circuits passing through the failed node will not function | The failed node may lose packets, and some routes may change
Packet order | Always arrives at the destination in the order they were sent | Not necessarily in the order they were sent upon arrival at the destination
End-to-end error handling and flow control | Can be handled by the network or the user host | Handled by the user host

### IP Address Classes
* `A` Class Addresses: The network number field `Net-Id` is 1 byte, and the host number field `Host-Id` is 3 bytes.
* `B` Class Addresses: The network number field `Net-Id` is 2 bytes, and the host number field `Host-Id` is 2 bytes.
* `C` Class Addresses: The network number field `Net-Id` is 3 bytes, and the host number field `Host-Id` is 1 byte.
* `D` Class Addresses: Used for multicasting.
* `E` Class Addresses: Reserved for future use.

### ARP Protocol
* Regardless of the protocol used at the network layer, when transmitting data frames over an actual network link, it is ultimately necessary to use the hardware `MAC` address.
* Each host has an `ARP` cache containing the mapping of the `IP` addresses of hosts and routers on the local area network to their hardware `MAC` addresses.
* `ARP` resolves the mapping of `IP` addresses and hardware `MAC` addresses for hosts and routers on the same local area network.

### ICMP Protocol
There are two types of `ICMP` messages: `ICMP` error reporting messages and `ICMP` query messages. The `ICMP` protocol is mainly used to exchange control information between hosts and routers, including reporting errors, exchanging limited control and status information, etc. When encountering situations such as unattainable destination `IP` data or an `IP` router unable to forward data packets at the current transmission rate, it automatically sends `ICMP` messages, and the `ping` command is based on the `ICMP` protocol.

### Subnetting Methods
* Borrow a certain number of bits from the host portion to be used as the subnet number `Subnet-id`, which reduces the number of bits in the host portion `Host-Id`.
* Use a subnet mask to divide the `IP` address into network and host portions.
* Use Classless Inter-Domain Routing (`CIDR`), by adding a slash `/` followed by the number of bits for the network prefix after the `IP` address, to form continuous `CIDR` address blocks with the same network prefix.

### Routing Protocols
* Interior Gateway Protocol (`IGP`): A routing protocol used within an autonomous system, currently the most widely used of its kind, such as `RIP` and `OSPF`.
* Exterior Gateway Protocol (`EGP`): If the source and destination stations are in different autonomous systems, when a data packet enters the boundary of one autonomous system, a protocol is needed to relay routing information to another autonomous system, which is the Exterior Gateway Protocol (`EGP`). The most widely used protocol in `EGP` is currently `BGP-4`.

### RIP Protocol
* Exchanges information only with neighboring routers.
* The information exchanged is the complete routing table known to the local router.
* Exchange routing information at fixed intervals.
* One issue with RIP is that it takes a rather long time to propagate information to all routers when there is a network failure.
* The greatest advantage of the RIP protocol lies in its simplicity and low overhead.
* The RIP protocol imposes a limitation on the scale of the network, with the maximum distance it can be used for being `15`, and `16` indicating unreachable. As the exchange of routing information between routers involves complete routing tables, the overhead increases as the network size expands.

### OSPF Protocol
* It sends information to all routers within the autonomous system using a flooding method.
* The information sent consists of only a portion of the neighboring routers' link states as known to the local router. Link state indicates which routers are adjacent to the local one and the metric of that link.
* The flooding method is used only when there is a change in link state.
* Due to the frequent exchange of link state information between routers, a database of link states can be established by all routers.
* This database essentially represents the entire network's topological structure and is consistent across the network, which is referred to as synchronizing the link state database.
* The link state database of OSPF can be updated relatively quickly, allowing routers to promptly update their routing tables. The fast convergence of OSPF updates is a significant advantage.
* OSPF specifies periodic refresh of the link states in the database.
* OSPF does not suffer from slow propagation of bad news.
* The link state of a router only relates to the connectivity state with neighboring routers and is not directly affected by the scale of the entire Internet. When the Internet's scale is large, OSPF protocol performs better than the distance vector protocol RIP.

### BGP Protocol
* BGP is a protocol for routers in different autonomous systems to exchange routing information.
* The administrator of each autonomous system must select at least one router as the BGP speaker for that autonomous system.
* BGP speakers in different autonomous systems establish BGP sessions by first establishing a TCP connection and then exchanging BGP messages over this connection to exchange routing information.
* Using a TCP connection provides reliable service and simplifies the routing selection protocol.
* BGP speakers that exchange routing information over a TCP connection become each other's neighbors or peers.

### Internal IP Range
* A class: `10.0.0.0 - 10.255.255.255`
* B class: `172.16.0.0 - 172.31.255.255`
* C class: `192.168.0.0 - 192.168.255.255`

## Transport Layer
The transport layer manages data transfer control between various network layers. Its primary functions include facilitating the exchange and confirmation of data between open systems, compensating for the quality disparities in communication networks, recovering transmission errors that persist after passing through the lower layers to further enhance reliability, as well as utilizing techniques such as multiplexing, segmentation and reassembly, connection establishment and release, and stream and congestion management to improve throughput and service quality.

### TCP Protocol
* TCP is a connection-oriented protocol that provides full-duplex communication and requires the establishment of a connection before data transfer. This results in relatively large data transmission overhead.
* TCP ensures reliable delivery services through features like flow control and congestion control.
* The minimum size of a TCP header is 20 bytes, while the maximum is 60 bytes, inclusive of source port, destination port, sequence number, acknowledgment number, data offset, control flags, window, checksum, urgent pointer, and options.
* TCP supports only one-to-one communication.
* TCP operates based on byte stream communication.
* TCP guarantees the sequencing of data transmission by assigning a sequence number to each byte of the data stream within a TCP connection.
* TCP provides functionalities such as checksum, acknowledgment, sequence number, timeout retransmission, connection management, flow control, and congestion control.
* TCP is suitable for applications that require reliable transmissions, such as file transfers.

#### Three-way handshake
```
client                                      server
actively open →     SYN=1,seq=x         →  passively open, receive
(SYN sent)                                 (SYN received)
receive    ←   SYN=1,ACK=1,seq=y,ack=x+1  ←  send
(connection established)                   (SYN received)
send       →     ACK=1,seq=x+1,ack=y+1    →  receive
(connection established)                   (connection established)
``` 
1. First handshake: The client actively connects to the server, sends the initial sequence number `seq=x` and the `SYN=1` synchronization request flag, and enters the SYN_SENT state, waiting for the server to confirm.
2. Second handshake: After receiving the message, the server sends an acknowledgment flag `ACK=1` and a synchronization request flag `SYN=1`, sends its own sequence number `seq=y`, and the client's confirmation number `ack=x+1`. At this point, the server enters the SYN_RECEIVED state.
3. Third handshake: After receiving the message, the client sends an acknowledgment flag `ACK=1`, sends its own sequence number `seq=x+1` and the server's confirmation number `ack=y+1`, and after sending, confirms that the connection is established in the `ESTABLISHED` state. Upon receiving the acknowledgment, the server enters the `ESTABLISHED` state.

#### Four-way handshake
```
client                                      server
actively close →     FIN=1,seq=u         →  passively close, receive
(FIN_WAIT_1)                              (close_wait)
receive    ←     ACK=1,seq=v,ack=u+1     ←  send
(FIN_WAIT_2)                              (close_wait)
receive    ←   FIN=1,ACK=1,seq=w,ack=u+1  ←  send
(time_wait)                               (last_ack)
send       →     ACK=1,seq=u+1,ack=w+1   →  receive
(time_wait 2MSL)                          (closed)
``` 
1. First handshake: The client sends a release flag `FIN=1`, its own sequence number `seq=u`, and enters the FIN-WAIT-1 state.
2. Second handshake: After receiving the message, the server sends an `ACK=1` acknowledgment flag and the client's acknowledgment number `ack=u+1`, its own sequence number `seq=v`, and enters the CLOSE-WAIT state. The client, upon receiving the message, enters the FIN-WAIT-2 state.
3. Third handshake: The server sends a release flag `FIN=1`, acknowledgment flag `ACK=1`, acknowledgment number `ack=u+1`, its own sequence number `seq=w`, and enters the LAST-ACK state.
4. Fourth handshake: After the client receives the response, it sends an acknowledgment flag `ACK=1`, acknowledgment number `ack=w+1`, its own sequence number `seq=u+1`, and enters the TIME-WAIT state. After `2` maximum segment lifetime periods, the client `CLOSES`. Upon receiving the acknowledgment, the server immediately enters the `CLOSE` state.

```markdown
### Transmission Control
* Flow Control: Use sliding windows to control the flow, maintaining the sending speed not too fast, so that the receiver can keep up, and prevent network congestion.
* Congestion Control
    * Slow start: As long as there is no congestion in the network, the congestion window increases to allow more packets to be sent out. However, when congestion occurs, the congestion window decreases to reduce the number of packets injected into the network.
    * Congestion Avoidance: In either the slow start phase or the congestion avoidance phase, if the sender detects congestion in the network, the slow start threshold is set to half of the sender window value when congestion occurs.
    * Fast Retransmit: The receiver is required to immediately send duplicate acknowledgments for every out-of-order segment received, allowing the sender to know early on about undelivered segments. If the sender receives three consecutive duplicate acknowledgments, it should immediately retransmit the segments that the receiver has not yet received. 
    * Fast Recovery: When the sender receives three consecutive duplicate acknowledgments, it executes a multiplicative decrease algorithm, reducing the slow start threshold by half. It then does not execute the slow start algorithm, but rather sets it to the value after halving the slow start threshold, and then begins to increment the congestion window slowly in a linear manner.
* Timeout Retransmission: Generally uses the Karn algorithm. When calculating the average round-trip time (RTT), if a segment is retransmitted, its round-trip time sample is not used. This yields a more accurate weighted average RTT and retransmission timeout RTO.

### Continuous ARQ Protocol
* The receiver generally uses cumulative acknowledgment. Instead of individually acknowledging each received packet, it sends an acknowledgment for the last sequentially received packet, indicating that all packets up to that point have been correctly received.
* The advantage of cumulative acknowledgment is that it's easy to implement and does not require retransmission if acknowledgments are lost. The drawback is that it does not reflect to the sender the information about all the packets the receiver has already correctly received.

### UDP Protocol
* `UDP` is connectionless, meaning there's no need to establish a connection before sending data, and the data transmission overhead is relatively small.
* `UDP` uses best-effort delivery, meaning it does not guarantee reliable delivery, and it also doesn't use flow control and congestion control.
* `UDP` header is 8 bytes, including source port, destination port, length, and checksum information.
* `UDP` has the functions of unicast, multicast, and broadcast, supporting one-to-one, one-to-many, many-to-many, and many-to-one data transmission.
* `UDP` is message-oriented communication, preserving the boundaries of the messages coming down from the application layer without merging or splitting them. After adding the header, it's delivered to the IP layer.
* `UDP` does not guarantee the order of data transmission, so the application layer program needs to control the order by adding sequence numbers or other methods.
* `UDP` adds very little functionality on top of the IP datagram service, mainly port functionality and error detection.
* `UDP` is suitable for real-time applications such as network telephony, video conferencing, live streaming, etc.

## Application Layer
The session layer, presentation layer, and application layer are generally categorized as the application layer.

### Session Layer
The session layer relies on the communication functions below the transport layer to effectively transfer data between open systems. Its main function is to send and receive data in the correct order according to the agreement between application processes and to conduct various forms of dialogue. The control methods can be summarized as the following two categories: firstly, to facilitate the alternating transformation of sending and receiving processing in the session application, so that at a certain moment only one end sends data, thus requiring alternating changes in the transmission control of the transmitting end. Secondly, in cases of unidirectional transfer of large amounts of data, such as file transfer, to prevent accidents in application processing, markings need to be attached to the data during transmission. If an accident occurs, the data can be resent from the marked position. For example, a long file can be sent in pages, and when the acknowledgment for the previous page is received, the next page's content is sent.

### Presentation Layer
The main function of the presentation layer is to transform the information provided by the application layer into a form comprehensible to all parties, providing a unified representation of character codes, data formats, control information formats, encryption, etc. The presentation layer only transforms the form of the information provided by the application layer, without changing the content itself.

### Application Layer
The application layer is the highest layer of the OSI reference model. Its function is to facilitate the exchange of information between application processes and to provide a series of services required for business processing.
```

### Common Application Layer Protocols
* `DNS` Protocol: Domain Name Service protocol, which translates domain names to `IP` addresses. Domain name resolution queries are usually transmitted using `UDP` with default port `53`. When synchronizing zone transfer data, data is generally transmitted using `TCP`.
* `FTP` Protocol: File Transfer Protocol, providing interactive access, allowing clients to specify file types and formats, as well as file access permissions. Data transmission is done using `TCP`, with control information on the default port `21`, and in active mode, data transmission is on the default port `20`. In passive mode, the server and client negotiate ports between `39000-40000`.
* `TFTP` Protocol: Trivial File Transfer Protocol, a small and easy-to-implement file transfer protocol, which uses `UDP` for data transmission with the default port `69`.
* `TELNET` Protocol: Remote Terminal Protocol, a simple remote terminal protocol that transmits data in plaintext using `TCP` with the default port `23`.
* `SSH` Protocol: Secure Shell Protocol, providing secure remote terminal sessions, using `TCP` for data transmission with the default port `22`.
* `HTTP` Protocol: Hypertext Transfer Protocol, a simple request-response protocol that uses `TCP` to transmit data with the default port `80`.
* `HTTPS` Protocol: Hypertext Transfer Protocol Secure, an extension of the `HTTP` protocol that adds an `SSL` layer for encrypted transmission. It uses `TCP` for data transmission with the default port `443`.
* `SMTP` Protocol: Simple Mail Transfer Protocol, providing a reliable and efficient protocol for email transmission using `TCP` with the default port `25`.
* `POP3` Protocol: Post Office Protocol, a simple email retrieval protocol using `TCP` for data transmission with the default port `110`.
* `IMAP` Protocol: Internet Message Access Protocol, an interactive email access protocol using `TCP` for data transmission with the default port `143`.
* `DHCP` Protocol: Dynamic Host Configuration Protocol, used for dynamically allocating `IP` addresses using `UDP` to transmit data. Clients send data to `DHCP` servers on the default port `67`, and `DHCP` servers respond to clients on the default port `68`.
* `SNMP` Protocol: Simple Network Management Protocol, used for managing `IP` networks, employing `UDP` to transmit data with a default agent port `161` and a default management station port `162`.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```