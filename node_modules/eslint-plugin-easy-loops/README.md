# eslint-plugin-easy-loops

![CI](https://github.com/bennypowers/eslint-plugin-easy-loops/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/eslint-plugin-easy-loops.svg)](https://www.npmjs.com/package/eslint-plugin-easy-loops)

Use this plugin if you'd like to restrict the use of loops to simple, single-expression loop bodies

## 👎 Bad
```js
for (let i = 0, i < 10, i++)  {
  doSomething(i);
  console.log('i is', i);
  otherArr.push(i);
}

for (const child of this.children) {
  const name = child.name;
  const value = child.value;
  elements.push({ name, value });
}
```

## 👍 Good
```js
for (const child of this.children)
  this.registerOnChild(child);

while (node !== document.body)
  leaveBreadCrumb(node)
```

## Installation
```sh
npm install --save-dev eslint-plugin-easy-loops
```

## Usage
In your `.eslintrc`:

```javascript
{
  "plugins": [
    "easy-loops"
  ],
  "rules": {
    "easy-loops/easy-loops": "warn"
  }
}
```

## Rule
Disallow use of `for` and `do while` loops, Restrict use of loops `for-in`, `while`, and `for-of` loops to simple, single-expression loop bodies.

## Why
You [don't](http://www.codereadability.com/coding-without-loops/) [need](http://joelhooks.com/blog/2014/02/06/stop-writing-for-loops-start-using-underscorejs/) [them](http://www.sitepoint.com/quick-tip-stop-writing-loops-start-thinking-with-maps/).

But, OTOH, sometimes you don't need the syntactic noise of a `.forEach`;

This is essentially a more lenient version of [no-loops](https://npm.im/eslint-plugin-no-loops)
