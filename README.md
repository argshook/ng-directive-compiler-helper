[![Build Status](https://travis-ci.org/argshook/ng-directive-compiler-helper.svg?branch=master)](https://travis-ci.org/argshook/ng-directive-compiler-helper)

# Helper for easier directive compiling

A small helper function to ease the pain of testing Angular 1.x directives. 

Usually you would have to set up directive compiler, give it a template, manage its attributes, parent or isolate scopes. This helper abstracts these things so you can focus on tests.

## Installing

1. install through `npm`

  ```bash
  $ npm install ng-directive-compiler-helper --save-dev
  ```

1. include in test runner:

  if using [karma](http://karma-runner.github.io/) as test runner, make sure the following is in `karma.conf.js`:

  ```js
  files: [
    'node_modules/ng-directive-compiler-helper/lib/ng-directive-compiler-helper.js'
  ]
  ```

## Quick reference

After including this package you will be able to use `createCompiler` function. It requires directive template, `$rootScope` and `$compile` services:

`compile = createCompiler(templateString, $rootScope, $compile)`

`compile` is now a function which can be used in two major ways:

  1. using *callbackFn* which is called after directive is compiled. *callbackFn* is passed with *scope* and *element* arguments
    * `compile(callbackFn)`;
    * `compile(parentScopeObject, callbackFn)`;
    * `compile(parentScopeObject, elementAttributesObject, callbackFn)`;

    most simple usage:

    ```js
    compile((scope, element) => {
      expect(scope).toBeDefined();
      expect(element).toBeDefined();
    });
    ```

  1. using returned object which contains `scope` and `element` properties:
    * `let compiled = compile()`;
    * `let compiled = compile(parrentScopeObject)`;
    * `let compiled = compile(parrentScopeObject, elementAttributesObject)`;

    most simple usage:

    ```js
    expect(compile().scope).toBeDefined();
    expect(compile().element).toBeDefined();
    ```

## More usage examples:

1. setup compiler first using `createCompiler`:

  ```js
  let myDirectiveTemplate = '<my-directive></my-directive>';
  let compile;

  beforeEach(($rootScope, $compile) => {
    compile = createCompiler(myDirectiveTemplate, $rootScope, $compile);
  });
  ```

1. use created compiler in tests:

  ```js
  it('should compile', () => {
    compile((scope, element) => {
      expect(scope).toBeDefined();
      // etc...
    });
  });
  ```

  ```js
  // adjust parent scope
  it('should have parent scope values', () => {
    compile({ parentScopeValue: true }, (scope, element) => {
      expect(scope.parentScopeValue).toBe(true);
    });
  });
  ```

  ```js
  // adjust directive element attributes
  it('should have additional attributes', () => {
    // first param === parentScope, empty in this case
    compile({}, { newAttribute: 'hello' }, (scope, element) => {
      expect(element.attr('newAttribute')).toBe('hello');
    });
  });
  ```

1. working with isolate scope directives:

  ```js
  it('should set isolate scope properties from attributes', () => {
    // note that attribute properties are kebab-case and not camelCase!
    compile({}, { 'isolate-scope-attribute': 'hello' }, scope => {
      expect(scope.isolateScopeAttribute).toBe('hello');
    });
  });
  ```

