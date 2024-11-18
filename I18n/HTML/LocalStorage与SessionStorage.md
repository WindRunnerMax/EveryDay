# localStorage and sessionStorage
`localStorage` and `sessionStorage` are solutions provided by `HTML5` for web storage.

## Similarities
* Both are independent of `HTTP` and are standards provided by `HTML5`, so they are not automatically carried with `Cookie` when making an `HTTP` request.
* Both exist in the form of key-value pairs, commonly using the same APIs.
* The storage type for both is `String`, so when storing data, the `toString()` method is called to convert it to a `String`.
* The storage capacity for each domain is limited, varying among different browsers, with most having a storage capacity of around `5M`.

## Differences
* `localStorage` is used for persistent local storage, and unless the data is actively deleted, it will never expire.
* `sessionStorage` becomes invalid after the user closes the browser or the session ends; it is not related to server-side sessions.

## Common Operations

* Storing data

```javascript
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');
/**
 * Since storing data calls the toString() method,
 * objects will be stored as the string [object Object].
 * Therefore, when storing, you need to call JSON.stringify() to convert it to a string,
 * and when retrieving, call JSON.parse() to convert the string back to an object.
 */
```

* Retrieving data

```javascript
localStorage.getItem('key');
sessionStorage.getItem('key');
```

* Deleting data

```javascript
localStorage.removeItem('key');
sessionStorage.removeItem('key');
```

* Clearing data

```javascript
localStorage.clear();
sessionStorage.clear();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```