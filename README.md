# eslint-plugin-rxjs-traits

This repo contains the rules that accompany the [`rxjs-traits`](https://github.com/cartant/rxjs-traits) proof-of-concept that [Moshe Kolodny](https://github.com/kolodny) and I have developed - and about which we spoke at RxJS Live London 2020.

When installing the rules, the ESLint TypeScript parser will need to be installed, too:

```
npm install eslint-plugin-rxjs-traits @typescript-eslint/parser --save-dev
```

Configure the `parser` and the `parserOptions` for ESLint. Here, I use a `.eslintrc.js` file for the configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  plugins: ["rxjs-traits"],
  extends: [],
  rules: {
    "rxjs-traits/subscribe": "error",
    "rxjs-traits/take": "error"
  }
};
```