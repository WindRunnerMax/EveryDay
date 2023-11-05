# CSRF Cross-Site Request Forgery

Cross-Site Request Forgery, commonly abbreviated as `CSRF` or `XSRF`, is an attack method that exploits the trust between a user and a currently logged-in web application to perform unintended operations. In comparison to Cross-Site Scripting (`XSS`), which exploits the user's trust in a specific website, `CSRF` exploits the website's trust in the user's browser, as the browser automatically carries cookies for all requests within the same domain.

## Principle

1. User `A` opens website `B` and successfully logs in to obtain a cookie.
2. User `A` does not log out of website `B` and opens a new tab in the same browser to visit website `C`.
3. Website `C` contains malicious code that sends a request to website `B`.
4. The browser, without the user's knowledge, sends the request to website `B` with the cookie, causing website `B` to process the request with the permissions of user `A`.

## Example

Let's say Xiao Ming has a deposit in a bank. By sending a `GET` form request to `http://bank.example/withdraw?uid=1&amount=100&for=2`, he can transfer `100` to account `2`. When this request is sent to the bank, it first verifies if the cookie has a valid session before processing the data.

Recently, Xiao Hei has been bored and created his own website that allows cross-origin resource requests using certain tags. In his website, he constructs `<img src="http://bank.example/withdraw?uid=1&amount=100&for=2">` and entices Xiao Ming to click on it through advertisements or games. At this point, the browser carries the cookie and visits the bank's website. In most cases, this request will not be successfully executed because it lacks Xiao Ming's authentication information. However, if Xiao Ming has just visited the bank and the server-side session has not expired, this URL will receive a normal response and the transfer will be executed.

## Defense

### Captcha

Adding a captcha to sensitive operations forces user interaction with the website, effectively mitigating `CSRF` attacks.

### Avoid using GET

`GET` endpoints are susceptible to `CSRF` attacks, as constructing an `<img>` tag is all that is needed, and `<img>` tags cannot be filtered. It is best to restrict endpoints to `POST` usage, rendering `GET` requests ineffective and reducing the risk of attacks. However, forcing the use of `POST` only reduces the risk, as attackers can still construct a `<form>` on a third-party page, increasing the possibility of exposure.

### Check the Referer field

The `HTTP` protocol has a `Referer` field that records the source address of the `HTTP` request. Browsers restrict its modification, allowing at most setting it to an empty value (`rel="noreferrer"`). However, if the `HTTP` request is not initiated in a browser, the `Referer` field can be freely modified. 

Using Xiao Hei's `CSRF` attack as an example, if Xiao Hei entices Xiao Ming to visit his website `www.black.com`, the `Referer` for the `CSRF` attack request constructed by Xiao Hei would be `www.black.com`. In normal circumstances, it should be a link starting with the domain name `http://bank.example`. If the `Referer` is incorrect or empty, the request should be rejected. 

However, this method has certain limitations. Some older versions of browsers, such as `IE6`, can tamper with the `Referer` field. Some users believe that the `Referer` field invades their privacy and disable the browser from sending the `Referer`. As a result, normal website visits may be mistaken for `CSRF` attacks and rejected.

### Add a Token verification field

The success of a `CSRF` attack relies on the browser automatically sending the request with the cookie, which contains all the user's authentication information, allowing the attacker to completely forge the user's request. To defend against `CSRF`, it is crucial to include information in the request that the hacker cannot forge, and this information should not be stored in the cookie.

Add a `Token` field to the request header. The browser does not automatically send the `Token` with the request, and the `Token` can carry an encrypted `jwt` for authentication purposes. This way, during a `CSRF` attack, only the cookie is transmitted, which does not indicate the user's identity, and the website can reject the attack request.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```