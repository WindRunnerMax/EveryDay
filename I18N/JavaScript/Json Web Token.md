# JSON WEB TOKEN

The acronym `JSON WEB TOKEN` is abbreviated as `JWT` and is an open standard based on `JSON` for securely exchanging information between two communicating parties in a concise, `URL`-safe declarative format, often used for authentication.

## Structure

`JWT` consists of three parts separated by `.`, which are `Header`, `Payload`, and `Signature`, with the following structure:

```javascript
Header.Payload.Signature
```

Here is an example given by `jwt.io`:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

For this example, the three parts are:

```javascript
// header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +base64UrlEncode(payload),
  "your-256-bit-secret"
)
```

### Header
The `Header` consists of two parts: the type of token and the algorithm name. In this example, the token type is `jwt`, and the encryption algorithm is `HMAC-SHA256`. Encoding the `Header` using the `BASE64URL` algorithm yields the first part of the `jwt`. Note that `BASE64URL` algorithm encoding is slightly different from `BASE64` encoding. `BASE64URL` requires replacing `+` with a minus sign `-`, `/` with `_`, and it has no standard filling, so the `=` is removed.

```javascript
base64UrlEncode({"alg": "HS256","typ": "JWT"}) === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
```

### Payload
The `Payload` is the main body of the `JWT` and can store data information. It contains three parts: registered claims, public claims, and private claims.

#### Registered claims (suggested but not mandatory)
* `iss`: The issuer of the `jwt`.
* `sub`: The subject of the `jwt`.
* `aud`: The audience of the `jwt`.
* `exp`: The expiration time of the `jwt`.
* `nbf`: The "not before" time of the `jwt`.
* `iat`: The issuance time of the `jwt`.
* `jti`: The unique identifier of the `jwt` to prevent replay attacks.

#### Public claims
Any information can be added to the public claims. Typically, user and business information are added, but sensitive information is not recommended as the public claims can be decrypted on the client side unless the information is encrypted.

#### Private claims
Private claims are defined jointly by the server and client. Sensitive information is also not recommended here.

```javascript
base64UrlEncode({"sub": "1234567890","name": "John Doe","iat": 1516239022}) === "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
```

### Signature
The `Signature` is a hash signature generated by encoding and hashing the first two parts of the data using the algorithm defined in the `Header` of the `JWT`. This is primarily to ensure that the data has not been tampered with.

```javascript
HMACSHA256( base64UrlEncode(header) + "." +base64UrlEncode(payload),"your-256-bit-secret") === "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

## Advantages
* Stateless and extensible: `JWT` is stored on the client side, making it stateless and easy to expand.
* CSRF attack prevention: By using `JWT` placed in the `Authorization: Bearer ${JWT}` field of the request header instead of using `Cookie`, `CSRF` attacks can be effectively prevented.
* `Payload` can store non-sensitive information necessary for other business logic, thereby reducing the server's load.
* Cross-language support: Due to the universal nature of `json` and encryption algorithms, `JWT` is supported in most programming languages.
* Lighter than `OAuth2`: Although with different use cases, `OAuth2` being an authorization framework and `JWT` being an authentication protocol for user authentication and protection of backend `API` in a frontend-backend separation scenario.

## Disadvantages
* Once issued, cannot be updated: To update the data or renew, a reissue is necessary.
* Cannot be revoked: `JWT` remains valid until its expiration time arrives.
* `Payload` is `BASE64URL` encoded and not encrypted, thus sensitive data should not be stored in the `jwt` without encryption.
* Potential security risks: Information leakage can result in unauthorized access to all token permissions, so the `JWT` validity period should not be too long.
* Forgery of `JWT`: Attackers can forge the `Header` in `JWT` by setting `alg` as `none` to verify identity, and some libraries implement this verification by default, thus requiring disabling requests with `alg` as `none`.
* `HMAC` key brute forcing: Users can crack the key from the complete `JWT` information, as the encryption algorithm is included in the `jwt`. This operation can be done locally without server interaction.

## Related

```
CSRF https://github.com/WindrunnerMax/EveryDay/blob/master/Browser/CSRF%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0.md
XSS https://github.com/WindrunnerMax/EveryDay/blob/master/Browser/XSS%E8%B7%A8%E7%AB%99%E8%84%9A%E6%9C%AC%E6%94%BB%E5%87%BB.md
Cookie and Session https://github.com/WindrunnerMax/EveryDay/blob/master/HTML/Cookie%E4%B8%8ESession.md
```

## Everyday Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.freebuf.com/vuls/219056.html
https://blog.csdn.net/qq_28165595/article/details/80214994
```