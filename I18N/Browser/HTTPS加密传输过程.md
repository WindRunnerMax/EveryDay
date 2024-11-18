# Process of HTTPS Encrypted Transmission
`HTTPS`, short for `Hyper Text Transfer Protocol over Secure Socket Layer`, is an HTTP channel with security as its goal. It ensures the security of the transmission process by incorporating encryption and identity authentication on top of HTTP. `HTTPS` integrates an `SSL` layer on top of HTTP, and the security foundation of `HTTPS` lies in `SSL`, so the detailed content of the encryption requires `SSL`.

## Background Knowledge
### HTTP
`HTTP` is an application layer protocol that runs on the default port `80`. It is an insecure transmission protocol, as the data transmitted through it is unencrypted plain text, vulnerable to man-in-the-middle attacks, allowing unauthorized access to your network transmission data. This is why it's best to avoid using public Wi-Fi networks as much as possible.

### HTTPS
`HTTPS` is an application layer protocol that runs on the default port `443`. It is a secure transmission protocol that ensures secure transmission by adding an encryption/identity authentication layer directly on top of the `HTTP` and transport layer `TCP`.

### SSL
`SSL`, or Secure Sockets Layer, is positioned between the `TCP/IP` protocol and various application layer protocols, providing security support for data communication. The `SSL` protocol consists of two layers:  
`SSL` Record Protocol: Built on reliable transport protocols such as `TCP`, it provides basic functions like data encapsulation, compression, and encryption for higher-layer protocols.  
`SSL` Handshake Protocol: Built on the `SSL` Record Protocol, it is used for identity authentication, negotiation of encryption algorithms, and exchange of encryption keys before actual data transmission begins.

### TLS
`TLS`, or Transport Layer Security protocol, is used to provide confidentiality and data integrity between two communicating applications. It consists of the `TLS` Record Protocol and the `TLS` Handshake Protocol. `TLS1.0` is the standardized version of `SSL3.0`. Initially developed by Netscape, `SSL` was standardized and slightly modified by the Internet Engineering Task Force `IETF` during `SSL3.0` and renamed as `TLS1.0`.

### Symmetric Encryption
Simply put, symmetric encryption uses the same key for encryption and decryption, and it is more efficient compared to asymmetric encryption.

### Asymmetric Encryption
Simply put, asymmetric encryption uses different keys for encryption and decryption. It requires a public key and a private key, with the private key being kept secret and the public key being publicly accessible. Public key for encryption, private key for decryption; private key for digital signature, public key for verification.

### CA
Since the public key is stored on the server, it needs to be transmitted to the user during the connection establishment process. To prevent man-in-the-middle attacks during the transmission of the public key, a third-party certificate authority `CA` is introduced. Most operating systems come with default installed `CA` certificates, and `CA` also has a public key and a private key. Anyone can obtain a `CA` certificate, which contains a public key used to verify the certificates it issues. `CA` issues certificates to service applicants, assigns them a public key after verifying their identity, binds the public key with the applicant's identity information, signs it, and then issues the certificate to the applicant. If a user wants to authenticate the authenticity of a certificate, they use `CA`'s public key to verify the signature on the certificate. Once the verification is successful, the certificate is considered valid. The certificate is essentially an authentication of the user's public key issued by the certificate authority `CA`.

## Transmission process
1. First, establish the connection with a three-way handshake in `TCP`, which is the foundation of data transmission. `SSL` is initiated on top of this.
2. The client initiates `SSL` communication by sending a `Client Hello`, which includes the `SSL` version, a random value `Random1`, encryption algorithm, and key length supported by the client.
3. The server responds with a `Server Hello`, containing the `SSL` version, random value `Random2`, and encryption components, and then sends the certificate to the client.
4. At this point, the client needs to verify the certificate sent by the server. It will decrypt the digital signature of the certificate using the built-in `CA` certificate in the operating system, and then compare the public key of the certificate with the decrypted content using the same algorithm as the `HASH`, to verify the legitimacy and validity of the certificate and whether it has been hijacked and changed.
5. After verifying the certificate, the client generates another random value `Random3`, encrypts it with the public key, and creates a `Pre-Master Key`. The client sends the `Pre-Master Key` to the server via the `Client Key Exchange` message and then sends a `Change Cipher Spec` message to indicate that subsequent data transmission will be encrypted.
6. The server decrypts the `Pre-Master Key` with its private key into `Random3`, and sends a `Change Cipher Spec` message to indicate encrypted data transmission from now on.
7. At this point, both the client and the server have three random strings, and `Random3` is transmitted in ciphertext, ensuring security. They can now use these three strings for symmetrically encrypted transmission. Since asymmetric encryption is slow and cannot be used for every data transmission, the key is negotiated with asymmetric encryption and then symmetric encryption is used for data transmission.
8. Normal `HTTP` data transmission can now take place, but due to `SSL` encryption, the transmission is secure. This is the process of `HTTPS` transmission, where steps `2`, `3`, `5`, and `6` are also known as the `SSL` four-way handshake.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/yangtianle/p/11202574.html
https://www.cnblogs.com/liyulong1982/p/6106132.html
https://blog.csdn.net/lyztyycode/article/details/81259284
https://blog.csdn.net/lihuang319/article/details/79970774
https://blog.csdn.net/qq_32998153/article/details/80022489
```