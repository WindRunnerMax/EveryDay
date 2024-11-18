# Navigator Object
The `Navigator` object represents the state and identity of the user agent, allowing scripts to query and register themselves for certain activities. You can obtain a reference to the instantiated `navigator` object using the read-only `window.navigator` property.

## Properties
* `navigator.connection`: Read-only. Provides a `Network Information` object containing information about the device's network connection.
* `navigator.cookieEnabled`: Read-only. Returns `true` if cookies are enabled, `false` otherwise.
* `navigator.credentials`: Read-only. Returns the `Credentials Container` interface, which exposes methods for requesting credentials and notifies the user agent of specific events, such as successful logins or sign-ins.
* `navigator.geolocation`: Read-only. Returns a geographic location object that allows access to the device's location.
* `navigator.hardwareConcurrency`: Read-only. Returns the number of available logical processor cores, accessible by directly calling `navigator.hardwareConcurrency`.
* `navigator.language`: Read-only. Returns a `DOMString` representing the user's preferred language (usually the language of the browser's UI), or `null` if unknown.
* `navigator.maxTouchPoints`: Read-only. Returns the maximum number of simultaneous touch points supported by the current device.
* `navigator.mediaDevices`: Read-only. Returns a reference to the `MediaDevices` object, which can be used to obtain information about available media devices.
* `navigator.mimeTypes`: Read-only. Returns a `MimeTypeArray` object containing a list of `MimeType` objects representing the `MIME` types recognized by the browser.
* `navigator.onLine`: Read-only. Returns a boolean value indicating whether the browser is currently working online.
* `navigator.plugins`: Read-only. Returns a `PluginArray` object listing the plugin objects describing the installed plugins in the application.
* `navigator.serviceWorker`: Read-only. Returns a `ServiceWorkerContainer` object, which provides access to registration, removal, upgrading, and communication with `ServiceWorker` objects relevant to the associated documents.
* `navigator.storage`: Read-only. Returns a singleton `StorageManager` object used to access the browser's overall storage capabilities for the current site or application. The returned object allows you to inspect and configure the persistence of data storage and get a rough idea of how much space the browser has available for local storage. Must be used within an `HTTPS Secure context`.
* `navigator.userAgent`: Read-only. Returns the user agent string for the current browser.
* `navigator.vendor`: Read-only. Returns the vendor name of the current browser.

## Methods
* `navigator.javaEnabled()`: This method returns a boolean value indicating whether the user's browser has `java` enabled.
* `navigator.registerProtocolHandler(scheme, url)`: This method allows websites to register their ability to open or handle specific `URL` schemes (also known as protocols).
* `navigator.requestMediaKeySystemAccess(keySystem, supportedConfigurations)`: This method returns a `Promise` that resolves to a `MediaKeySystemAccess` object, which can be used to access a specific media key system for creating keys to decrypt media streams. This method is part of the Encrypted Media Extensions `API`, providing support for encrypted media and `DRM`-protected videos on the `WEB`, and it needs to be used in a `HTTPS Secure context` environment.
* `navigator.sendBeacon(url, data)`: This method asynchronously sends a small amount of data to a web server over `HTTP`, typically used in conjunction with the `visibilitychange` event (but not with the `unload` and `beforeunload` events).
* `navigator.share(data)`: This method invokes the device's native sharing mechanism and needs to be used in a `HTTPS Secure context` environment.
* `navigator.vibrate(pattern)`: This method triggers the vibration hardware on the device, if available. If the device does not support vibration, this method has no effect. If this method is called when the device is already in a vibration mode, the previous mode will be paused and the new mode will start.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/API/navigator
```