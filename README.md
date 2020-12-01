# apidoc-plugin-ts

A plugin for [apidoc](https://www.npmjs.com/package/apidoc) that injects `@apiSuccess` and `@apiParam` params from TypeScript interfaces. Supports extended and nested interfaces.

## Getting started

```javascript
npm install --save-dev apidoc apidoc-plugin-ts-archlet
```

```javascript
yarn add -D apidoc apidoc-plugin-ts-archlet
```

A custom api-doc param `@apiInterfaceSuccess` is exposed:

```javascript
@apiInterfaceSuccess (optional path to definitions file) {INTERFACE_NAME}
 ```

## Example

Given the following interface:

```javascript
// filename: ./employers.ts

export interface Employer {
  /**
   * Employer job title
   */
  jobTitle: string;
  /**
   * Employer personal details
   */
  personalDetails: {
    name: string;
    age: number;
  }
}
```

### @apiInterfaceSuccess example


and the following custom param:

```javascript
@apiInterfaceSuccess (./employers.ts) {Employer}
```

under the hood this would transpile to:

```javascript
@apiSuccess {String} jobTitle Job title
@apiSuccess {Object} personalDetails Employer personal details
@apiSuccess {String} personalDetails.name
@apiSuccess {Number} personalDetails.age
```

*Note if the `Person` interface is defined in the same file then you can drop the path:*

```javascript
@apiInterfaceSuccess {Person}
```
### @apiInterfaceParam example


and the following custom param:

```javascript
@apiInterfaceParam (./employers.ts) {Employer}
```

under the hood this would transpile to:

```javascript
@apiParam {String} jobTitle Job title
@apiParam {Object} personalDetails Employer personal details
@apiParam {String} personalDetails.name
@apiParam {Number} personalDetails.age
```

*Note if the `Person` interface is defined in the same file then you can drop the path:*

```javascript
@apiInterfaceParam {Person}
```
