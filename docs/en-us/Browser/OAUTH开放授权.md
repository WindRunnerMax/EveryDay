# OAUTH Open Authorization

The `OAUTH` open authorization provides a secure, open, and simple standard for authorizing user resources. `OAUTH` authorization does not allow third parties to access user account information, such as usernames and passwords. Therefore, a third party can obtain authorization for a user's resources from the `OAUTH` provider without needing the user's username and password. This makes `OAUTH` authorization secure, and the current version of `OAUTH` is `2.0`.

## Example
Suppose there is a website that provides photo printing and delivery services, but all of the user's photos are stored in `Google` Drive. If the user wants to print a large number of photos, there are several solutions:
* The user can log in to their own `Google` account, download all the photos they want to print, and then upload the photos to the cloud printing website for printing. This solution is feasible but cumbersome because it requires downloading and then uploading the photos.
* The user can provide their `Google` account password to the printing website, allowing the website to access the photos. The user can then select the photos to be printed. However, this solution is highly unreliable as the printing website can access the user's account and password, potentially saving them on their backend servers. The printing website only needs to access the photo data, but at this point, the website has the same level of access as the user's `Google` account, potentially compromising all the data stored in the account. If all the websites that require `Google` authorization require users to provide their account passwords, the user can only revoke the authorization through password modification, which would invalidate all authorizations for other websites as well. If the website stores user authorization information in plain text and the database is compromised, all user information will be exposed. Additionally, there is a risk of phishing where the website deceives users into providing their account passwords, a common tactic employed by phishing sites through the guise of offering free items.
* Using `OAUTH` open authorization, the cloud printing website can only access the data authorized by the user, restricting access to other data. The user's authorization is entirely managed on the `Google` authorization website. Even if the user is not logged in to `Google` when authorizing, the authorization process still takes place on the official `Google` website. Therefore, the printing website cannot obtain the user's account and password. After the user grants the permission to read the photos to the printing website on the `Google` authorization page, the website can access the photo information and proceed with the printing service. In simple terms, `OAuth` is an authorization mechanism where the data owner tells the system to grant access to third-party applications to retrieve the data, and the system then generates a short-term access token to replace the password for the third-party application to access the resources.

## Authorization process

### Term Definitions
* `Third-party application`: Refers to applications by third-party providers, such as the cloud printing website mentioned earlier.
* `HTTP service`: Represents the service provider, for example, `Google` in the previous example.
* `User Agent`: Usually a web browser used by the user.
* `Authorization server`: The server used by the service provider to handle authentication.
* `Resource server`: The server where the service provider stores user resources.

### Basic Flow
* The user opens the application, and the application requests authorization from the user.
* The user grants authorization on the service provider's website and returns authorization information to the application.
* The application uses the obtained authorization to request a `Token` from the authorization server.
* The authorization server confirms the application's authorization code and issues a token upon successful authentication.
* The application uses the token to request resources from the resource server.
* The resource server verifies the token and grants access to the application.

### Client Authorization Model
In the second step of the basic flow, the application needs to obtain the user's authorization information to request a token. `OAuth 2.0` defines four authorization grant types.

#### Authorization Code Grant
The authorization code grant, also known as the "authorization code flow," is the most complete and rigorous authorization mode, and it is also the most commonly used. Its main feature is the interaction between the client's back-end server and the service provider's authentication server, which avoids the transmission of tokens in the frontend. The frontend only passes an authorization code, and the authorization code needs to be exchanged for a token by the backend with the Appid and AppSecret. AppSecret and similar data need to be kept strictly confidential, so the token cannot be obtained directly from the code, making the authorization code grant mode highly secure.

- The user opens the application, clicks on the third-party authorization button, and at this time, the application's APPID and the URL for the post-authorization redirection need to be passed. The page then redirects to the authorization website or opens a new window to the authorization website. This example mainly uses the redirection to the authorization website, but the basic process is the same.
- The user clicks the authorization button on the authorization website, and the browser then redirects to the previously passed URL and carries the authorization code (CODE) information, which generally has a short expiration period, typically 10 minutes.
- The application receives the authorization code and sends it to the backend. The backend then initiates a request to the authentication server based on the authorization code and the Appid and AppSecret information.
- The authentication server checks if the requested data is correct, and if so, it returns a token.
- The application uses the token to request resources from the resource server, and the resource server, upon verifying the token, agrees to grant access to the requested resources.

#### Implicit Grant
The implicit grant, also known as the "implicit grant type," does not involve the third-party application's server and instead directly requests a token from the authentication server in the browser, bypassing the authorization code step. All steps are completed in the browser, and the token is visible to the visitor, and the client does not need to be authenticated.

- The user opens the application, clicks the third-party authorization button, and at this time, the application's APPID and the URL for the post-authorization redirection need to be passed. The page then redirects to the authorization website or opens a new window to the authorization website. This example mainly uses the redirection to the authorization website, but the basic process is the same.
- The user clicks the authorization button on the authorization website, and the browser then redirects to the previously passed URL and carries a HASH that includes the token.
- The browser initiates a request to the resource server, at this point, it does not carry the HASH information from the previous step, and the resource server returns a parsing script.
- The browser parses the script obtained from the previous step and then uses the script to parse the token from the HASH. At this point, the application obtains the token.
- The application uses the token to request resources from the resource server, and the resource server, upon verifying the token, agrees to grant access to the requested resources.

#### Resource Owner Password Credentials Grant
In the resource owner password credentials grant, the user provides their username and password to the client, which then uses this information to request authorization from the service provider. In this mode, the user must provide their password to the client, but the client is not permitted to store the password. This is commonly used in cases where the client is highly trusted by the user, such as when the client is part of an operating system. The authentication server should only consider using this mode when other authorization modes are not feasible.

- The user provides their username and password to the application, and the application sends this information to the authentication server to request a token.
- After confirming the information, the authentication server returns a token to the application.
- The application uses the token to request resources from the resource server, and upon verifying the token, the resource server agrees to grant access to the requested resources.

#### Client Credentials Grant
The client credentials grant is when the client, on its own behalf rather than on behalf of the user, authenticates with the service provider. In this mode, the user directly registers with the client, and the client then requests services from the service provider using its own credentials. Strictly speaking, this mode does not involve any authorization issues.

- The user registers their identity in the application, and the application authenticates with the authentication server to request a token.
- After confirming the identity, the authentication server returns a token to the application.
- The application uses the token to request resources from the resource server, and upon verifying the token, the resource server grants access to the requested resources to the application.

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```markdown
[Zhuanlan Zhihu](https://zhuanlan.zhihu.com/p/138424479)
[Ruan Yifeng's Blog 2014](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)
[Ruan Yifeng's Blog 2019](http://www.ruanyifeng.com/blog/2019/04/oauth_design.html)
```