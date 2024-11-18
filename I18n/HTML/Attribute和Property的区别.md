# The Difference Between Attribute and Property

`attribute` is a concept in XML elements, used to describe additional information about XML tags, i.e., attributes of XML tags. `property` is a concept in JavaScript objects, used to describe members of JavaScript objects, i.e., properties of JavaScript objects.

## Description
When describing HTML, we need to set key-value pairs for attribute values to describe tags:

```html
<input id="this-input" type="text" value="test" />
```

The above tag node defines three attributes:

```
id: this-input
type: text
value: test
```

After the browser parses this HTML, it creates an `Element` object, which includes many properties such as `id`, `innerHTML`, `outerHTML`, etc. For this JavaScript object, many properties have the same or similar names as the attribute of this node element, but this is not a one-to-one relationship.

* Some attributes have a one-to-one mapping with properties, such as the `id` attribute.
* Some attributes have a one-to-one mapping with properties but with different names, such as the `class` attribute.
* Some attributes do not have a mapping with properties, such as custom `customize` attributes.

## Example

First, change the `type` in the `<input>` tag:

```html
<input id="this-input" type="t" value="test" />
```

Now, get the attribute and property of the object using JavaScript:

```javascript
console.log(document.querySelector("#this-input").getAttribute("type")); // t // attribute
console.log(document.querySelector("#this-input").type); // text // property
```

You can see that for properties, they automatically correct the incorrect value. For attributes, they retain the original value of the DOM node element. It can be said that attributes, semantically, tend to be immutable values, while properties, semantically, tend to be mutable values during their lifecycle. Here is another example, when changing the value in the input box from `test` to another value like `t`, and then getting the attribute and property:

```javascript
console.log(document.querySelector("#this-input").getAttribute("value")); // test
console.log(document.querySelector("#this-input").value); // t
console.log(document.querySelector("#this-input").defaultValue); // test
```

You can see that the attribute still retains its original value, while the property gets the changed value. If you need to get the original value in the property, you can use the `defaultValue` property. If you customize some attributes in the DOM node, they may not be synchronized to the property, and similarly, properties defined in the property may not be synchronized to the attribute.

```html
<input id="another-input" type="type" customize="test" />
```

```javascript
console.log(document.querySelector("#another-input").customize); // undefined
console.log(document.querySelector("#another-input").getAttribute("customize")); // test
```

## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Attribute Property</title>
</head>
<body>

    <input id="this-input" type="t" value="test" />
    <input id="another-input" type="type" customize="test" />

</body>
    <script type="text/javascript">
        console.log(document.querySelector("#this-input").type); // text
        console.log(document.querySelector("#this-input").getAttribute("type")); // t
        console.log(document.querySelector("#another-input").customize); // undefined
        console.log(document.querySelector("#another-input").getAttribute("customize")); // test
    </script>
</html>
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/8415edb391ce
https://juejin.im/post/5bea695ae51d45196e141f7f
https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html/6377829#6377829
```