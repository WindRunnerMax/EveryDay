# The Difference Between v-if and v-show
The `v-if` directive and the `v-show` directive can dynamically control the display and hiding of `DOM` elements based on their values. `v-if` and `v-show` are commonly used directives internally in Vue. The responsibility of a directive is to apply some special behavior to the `DOM` when the value of an expression changes.

## Description

### v-if
The `v-if` directive is used to conditionally render a block of content, which will only be rendered when the expression of the directive returns a truthy value.

```html
<div v-if="show">show</div>
<div v-else>hide</div>
```

### v-show
The usage of the `v-show` directive is similar, but the difference is that the element with the `v-show` directive will always be rendered and kept in the `DOM`. `v-show` simply toggles the `CSS property display` of the element.
```html
<div v-show="show">show</div>
```

## Difference
* Implementation: `v-if` dynamically adds or removes `DOM` elements within the `DOM` tree, while `v-show` controls visibility by setting the `display` style property of `DOM` elements.
* Compilation process: `v-if` toggle involves a partial compilation and unmounting process; during the toggle process, the internal event listeners and child components are properly destroyed and rebuilt. On the other hand, `v-show` simply toggles based on `CSS`.
* Compilation condition: `v-if` is lazy; if the initial condition is false, nothing will be done. Partial compilation only starts when the condition first becomes true. `v-show` is compiled under any condition, and then cached, while `DOM` elements are retained.
* Performance cost: `v-if` has higher toggle cost, while `v-show` has higher initial rendering cost.
* Use cases: `v-if` is suitable for situations where the condition is less likely to change, while `v-show` is suitable for frequently changing conditions.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://cn.vuejs.org/v2/guide/conditional.html#v-if
https://www.cnblogs.com/dengyao-blogs/p/11378228.html
https://cn.vuejs.org/v2/guide/conditional.html#v-show
```