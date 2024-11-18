# Single Sign-On (SSO)

Single Sign-On (SSO) refers to the scenario where a user only needs to log in once to access all mutually trusted application systems within a multi-application environment.

## Example
Initially, the service provider had only a single system where all functionalities were consolidated, and SSO was not necessary at that point. A single login sufficed to access all functionalities. However, as the user base and services expanded, the provider opted to partition the functionalities into multiple subsystems. In this new setup, the user login credentials for each subsystem were isolated, necessitating repeated logins when transitioning between subsystems. This scenario was deemed less than ideal, prompting the implementation of SSO as a solution. With SSO, a user only needs to log in within one system, after which further logins across other systems are not necessary as their identity is silently authenticated. For instance, a single login on Baidu allows seamless access to platforms such as Tieba and Wangpan.

### Distinction Between OAUTH and SSO

From a trust perspective, OAUTH's open authorization involves a server and third-party client that are not part of the same mutual trust application group, whereas SSO's subsystems are part of a mutual trust application group, often provided by the same company.

From a resource standpoint, OAUTH's primary focus is on enabling users to decide whether third-party applications can access their personal resources on the server side. The resources are held by the OAUTH service provider, with the client seeking access to the user's resources. On the other hand, SSO's resources are located within the subsystem rather than the SSO server, primarily serving the purpose of login and managing user permissions across different subsystems.

## Implementation Approaches

### Shared Session

If the system uses session-based user information, SSO implementation can involve sharing sessions. Using session information for SSO requires addressing two main issues: the isolation of sessions across subsystems and the sharing of user session IDs on the client side.  
The solution for session consistency primarily involves session synchronization or centralized session storage. Since session synchronization consumes considerable resources, centralized session storage is generally preferred.  
As for sharing session IDs on the client side, the session IDs are primarily stored in cookies. Therefore, the challenge lies in addressing cross-domain cookie issues. For subdomains under the same top-level domain, cookie sharing can be achieved by setting the `domain` attribute to the top-level domain in the `SET-COOKIE` header. If non-subdomain cookie sharing is required, considering the use of the Platform for Privacy Preferences (P3P) header for cross-domain `SET-COOKIE` might be beneficial.

### Ticket

The Ticket method, also known as SSO-Token, serves as a unique identifier for user identity across all subsystems. All subsystem servers can verify this token and obtain the associated user information. Similarly, this method also requires addressing cross-domain cookie issues, often involving the utilization of the `domain` attribute for the top-level domain in `SET-COOKIE` headers or the P3P header for cross-domain `SET-COOKIE`.

### CAS
The Central Authentication Service (CAS) separates the authentication service as a subsystem, and all login authentication services are performed in the CAS authentication center. The CAS system acts as a transit center, capable of authenticating the identity of all users and directly redirecting to various systems after logging in to the CAS system.

Suppose we have three subsystems, system A (A.com), system B (B.com), and the authentication service SSO.com. The main process for a registered user to log in is as follows:

- The user opens system A, and since the user is not logged in, the system automatically redirects to the authentication service SSO.com and carries the parameter storing the redirection address A.com.
- The user enters their account and password on SSO.com, clicks to log in, and upon successful verification, the central authentication server returns a ticket and writes the logged-in cookie under the domain of the SSO.com authentication service. The SSO.com authentication service redirects to the address carried when redirecting to the authentication service, i.e., A.com from the previous step, and carries the ticket issued by the central authentication server.
- System A receives the ticket, passes it to the server of this system, and after verifying the ticket, retrieves the user information carried in the ticket and sets the user of this A system to a logged-in state, issuing cookie information and other user credentials, thus allowing the user to use the A system normally.
- At this point, if the user opens system B, as the user is not logged in to B system, the system automatically redirects to the authentication service SSO.com, carrying the parameter storing the redirect address B.com.
- As the user is already logged in on SSO.com, the system directly obtains the ticket from the central authentication server, then redirects directly to the address from the previous step, i.e., B.com, carrying the ticket issued by the central authentication server.
- System B receives the ticket, passes it to the server of this system, verifies the ticket, retrieves the user information carried in the ticket, sets the user of this B system to a logged-in state, and issues cookie information and other user credentials, thus allowing the user to use the B system normally.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.zifangsky.cn/1327.html
https://zhuanlan.zhihu.com/p/66037342
https://www.jianshu.com/p/75edcc05acfd
https://blog.csdn.net/qq_32060101/article/details/83473760
https://blog.csdn.net/qq_32239417/article/details/62228624
https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
```