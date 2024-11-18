# Three-way Handshake of TCP

The Transmission Control Protocol (TCP) is a connection-oriented, reliable, byte-stream based transport layer communication protocol, which operates in the transport layer of the OSI seven-layer model. It is a specialized transport protocol designed to provide a reliable end-to-end byte stream over unreliable interconnected networks.

## Three-way Handshake

### Process

```
client                                      server
Active Open →       SYN=1,seq=x       → Passive Open, Received
(SYN Sent)                                (SYN Received)
Received  ←  SYN=1,ACK=1,seq=y,ack=x+1  ← Sent
(Link Established)                        (SYN Received)
Sent      →     ACK=1,seq=x+1,ack=y+1   →  Received
(Link Established)                        (Link Established)
``` 
1. First Handshake: The client actively initiates the connection to the server, sends the initial sequence number `seq=x` with the `SYN=1` synchronization request flag, and enters the SYN_SENT state, waiting for server confirmation.
2. Second Handshake: After receiving the message, the server sends the acknowledgment flag `ACK=1` and the synchronization request flag `SYN=1`, along with its own sequence number `seq=y` and the client's acknowledgment number `ack=x+1`. At this point, the server enters the SYN_RECEIVED state.
3. Third Handshake: After receiving the message, the client sends the acknowledgment flag `ACK=1`, its own sequence number `seq=x+1`, and the server acknowledgment number `ack=y+1`. Upon sending, the connection is confirmed to be in the ESTABLISHED state. The server, upon receiving the confirmation information, enters the ESTABLISHED state.

### Brief Explanation
1. First Handshake: Client: "Hey, buddy, do you want to hang out later? Can you see my message? If so, give me a sign and let me know that I have the ability to send messages."
2. Second Handshake: Server: "Got it, where do you want to go? I received your message, you have the ability to send messages. How about sending me a message back so that I can also confirm that I have the ability to send messages?"
3. Third Handshake: Client: "Let's go fishing in the river and then pick some fruits on the mountain. I also got your message. Your ability to send messages is fine. Both of us have the ability to send messages, so we can have a great time."

```
Both sides need to wait for the other party to agree and return the confirmation. Once one party requests and receives the acknowledgment packet, it means that the network is reachable and the other party agrees to establish the connection. The final model is

A  --Request-->  B

A  <--Acknowledgment--  B

A  <--Request--  B

A  --Acknowledgment-->  B

The middle two steps can be returned together, hence the three-way handshake.
Taken from Zhihu@Manistein
```

## Four-way Handshake
### Process
```
client                                      server
active close →       FIN=1,seq=u          → passive close, receive
(termination wait 1)                        (close wait)
receive    ←      ACK=1,seq=v,ack=u+1      ← send
(termination wait 2)                        (close wait)
receive    ←   FIN=1,ACK=1,seq=w,ack=u+1   ← send
(time wait)                                 (last confirmation)
send       →      ACK=1,seq=u+1,ack=w+1    → receive
(time wait 2MSL close)                      (close)
``` 
1. First Handshake: The client sends the release identification `FIN=1`, its own sequence number `seq=u`, and enters the termination wait `FIN-WAIT-1` state.
2. Second Handshake: After receiving the message, the server sends the `ACK=1` confirmation flag and the client's acknowledgment number `ack=u+1`, its own sequence number `seq=v`, and then enters a close wait `CLOSE-WAIT` state. After receiving this message, the client enters the termination wait `FIN-WAIT-2` state.
3. Third Handshake: The server sends the release identification `FIN=1` signal, confirmation flag `ACK=1`, acknowledgment number `ack=u+1`, its own sequence number `seq=w`, and enters the last confirmation `LAST-ACK` state.
4. Fourth Handshake: After receiving the reply, the client sends the confirmation flag `ACK=1`, acknowledgment number `ack=w+1`, its own sequence number `seq=u+1`, and enters the time wait `TIME-WAIT` state. After the expiration of `2` maximum segment lifetimes, the client `CLOSES`. The server immediately enters the `CLOSE` state upon receiving the acknowledgment.

## Common Questions

### Why not two-way handshake
The `TCP` connection handshake is performed using sequence numbers, which are `seq`. `TCP` requires the `seq` sequence number for reliable retransmission or reception and to avoid the inability to distinguish whether `seq` is delayed or from an old connection when reusing a connection. Therefore, a three-way handshake is necessary to agree and determine the initial `seq` sequence numbers of both parties, thus ensuring the completion of synchronized confirmation of sequence numbers.

If a two-way handshake were to occur, as follows, the client sends the initial sequence number `seq=x` to the server. The server, upon receiving the message, sends the acknowledgment flag `ACK=1`, acknowledgment number `ack=x+1`, and its own sequence number `req=y`. At this point, the server believes the connection is established, and upon receiving the message, the client also believes the request is established.

Considering the scenario of network data delay, if the client initiates a connection, and the packet becomes blocked in the network, and the client re-initiates the request. At this point, the packet changes the routing path and reaches the server. The server then believes the connection is established and sends the packet back to the client. After completing data communication, the connection is closed. Subsequently, the delayed packet from the client finally reaches the server. Because of the two-way handshake, the server believes the connection is established and sends an acknowledgment flag to the client. However, the client deems the sequence number invalid and does not establish the connection, leading to wastage of server resources as a connection that should not have been established is.



## Why not four-way handshake
Back in class, the teacher gave the example of the red and blue army problem, also known as the two-army problem. From the perspective of communication reliability, there's no absolutely reliable protocol.

```
On the two ends of the mountain are Red Army 1 and Red Army 2, and the Blue Army is on the mountain. Red Army 1 and 2 are not opponents of the Blue Army. The only way to defeat the Blue Army is to attack together. So Red Army 1 and 2 need to communicate with each other to determine when to attack.
Red Army 1's messenger successfully sneaks across the mountain and tells Red Army 2 that they should attack at twelve noon the next morning.
Red Army 2 agrees, but Red Army 1 is not sure if Red Army 2 received the message. Recklessly attacking will surely fail, so Red Army 2's messenger needs to cross the mountain and tell Red Army 1 that the message has been received.
Red Army 1 receives the confirmation from Red Army 2, but now Red Army 2 doesn't know if Red Army 1 received their confirmation. So Red Army 1's messenger needs to cross the mountain and tell Red Army 2 that the confirmation has been received.
Red Army 2 receives the confirmation from Red Army 1, but now Red Army 1 doesn't know if Red Army 2 received their confirmation. So Red Army 2's messenger needs to cross the mountain and tell Red Army 1 that the confirmation has been received.
......
```
The two-army problem ultimately falls into a deadlock, indicating that an agreement can never be reached perfectly, and there's no completely reliable communication protocol. As a reliable transmission control protocol, TCP needs to ensure the reliable transmission of data while improving transmission efficiency. When the three-way handshake is completed, a very considerable level of reliability and transmission efficiency is already achieved. Continuing the handshake can indeed further improve the connection's reliability, but just like the curve of a logarithmic function, as the number of handshakes increases, the increase in reliability is not significant. In fact, in relation to the consumption of efficiency, multiple handshakes are detrimental to data transmission.

## Establishing a connection requires three-way handshake, but closing a connection requires a four-way handshake
When establishing a connection, when the server is in the `LISTEN` state and receives a connection request in the form of a `SYN` packet, it sends an `ACK` and `SYN` together in one packet to the client. However, when closing a connection, when the server receives a `FIN` packet from the other party, it means that the other party will no longer send data but can still receive it. At this point, the server may not have sent all of its data to the other party, so the server can either immediately close the connection or send some data to the other party first and then send a `FIN` packet to indicate agreement to close the connection. Therefore, the server's `ACK` and `FIN` are generally sent separately, resulting in an additional step.

## The client still needs to wait for 2MSL
`MSL` stands for `Maximum Segment Lifetime`, and TCP allows different implementations to set different `MSL` values.  
First, to ensure that the last `ACK` packet sent by the client can reach the server. Because this `ACK` packet may be lost, from the server's perspective, it has sent the `FIN+ACK` packet to request the disconnection, but the client has not responded, indicating that it may not have received the disconnection request packet sent by the server. As a result, the server will resend the disconnection request, and the client can receive this retransmitted packet within the `2MSL` time frame, then respond and restart the `2MSL` timer.  
Second, to prevent the occurrence of invalid connection request packets in the current connection. After sending the last acknowledgment packet, the client can allow all segments generated in the time of this `2MSL` to disappear from the network. Thus, in the new connection, there won't be any request packets from the old connection.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/24853633
https://www.cnblogs.com/jainszhang/p/10641728.html
https://blog.csdn.net/jun2016425/article/details/81506353
https://blog.csdn.net/qq_38950316/article/details/81087809
```