[![Build Status](https://travis-ci.org/argshook/ng-directive-compiler-helper.svg?branch=master)](https://travis-ci.org/argshook/ng-directive-compiler-helper)

# Helper for easier directive compiling

Small function to ease testing Angular 1.x directives. 

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

After including this package you will be able to use a global `createCompiler` function. It requires directive template, `$rootScope` and `$compile` services:

`compile = createCompiler(templateString, $rootScope, $compile)`

`compile` is now a function which can be used in two ways:

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
    // note that attribute properties are kebab-case and not camelCase!
    compile({}, { 'new-attribute': 'hello' }, (scope, element) => {
      expect(element.attr('new-attribute')).toBe('hello');
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

1. working with drivers

  ```js
  // 1. define driver
  let driver = {
    parent: e => e.find('.imaginary-parent-with-3-children'); // e - reference to element, passed if no other arguments given,
    children: parent => parent.children;
    alsoChildren: function() { return this.$.children; } // this.$ - also reference to element
  };

  // 2. hook driver when creating compiler (as last argument)
  let compile = createCompiler(templateString, $rootScope, $compile, driver)`

  // 3. use in tests
  it('should contain 3 items', () => {
    compile(function(scope, element, driver) { // <-- driver is passed as third argument
      expect(driver.parent().length).toBe(1);
      expect(driver.children(element).length).toBe(3);
      expect(driver.alsoChildren().length).toBe(3);
    })
  });
  ```

testing like this should be cool because:
* driver can be reused for multiple tests, drying up the test suite
* no need to repeat selectors everywhere
* other more complicated logic can be reused (e.g. do some component setup for assertions)

### Few notes about drivers

* if driver method is called without arguments, it automatically gets element reference (but ONLY if there are no
    arguments given):

> Note: the following examples assume you have `let compile = createCompiler` setup with driver.

  ```js
  let driver = {
    myTitle: e => e.find('.title-element')
  }

  it('should have title', () => {
    compile((scope, element, driver) {
      expect(driver.myTitle().text()).toBe('assume this element has this text ;)');
    });
  });
  ```

* if driver method is called with arguments, element reference is available through `this.$`:

  ```js
  let driver = {
    myListItem: function(n) {
      return this.$.find('.my-list').get(n);
    }
  };

  it('should have correct item', () => {
    compile(function(scope, element, driver) {
      expect(driver.myListItem(2).text()).toBe('assume this text also exists');
    });
  });
  ```


# More examples

i use this helper thing to test one of mine angular projects, you can check here: [argshook/orodarius](https://github.com/argshook/orodarius)


# Contributing

Please provide tests for pull requests.

Testing with karma:

* single run `npm run test`
* watch tests `npm run test:watch`

