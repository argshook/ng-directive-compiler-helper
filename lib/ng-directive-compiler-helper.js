'use strict';

/*
  Helper for easier directive compiling

  Usage examples:

  // 1. set up a compiler first:

  var myDirectiveTemplate = '<my-directive></my-directive>';
  var compile;

  beforeEach(function($rootScope, $compile) {
    compile = createCompiler(myDirectiveTemplate, $rootScope, $compile);
  });

  // 2. use created compiler in tests:

  it('should compile', function() {
    compile(function(scope, element) {
      expect(scope).toBeDefined();
      // etc...
    });
  });

  // adjust parent scope
  it('should have parent scope values', function() {
    compile({ parentScopeValue: true }, function(scope, element) {
      expect(scope.parentScopeValue).toBe(true);
    });
  });

  // adjust directive element attributes
  it('should have additional attributes', function() {
    // first param === parentScope, empty in this case
    compile({}, { newAttribute: 'hello' }, function(scope, element) {
      expect(element.attr('newAttribute')).toBe('hello');
    });
  });

  // 3 working with isolate scope directives:
  it('should set isolate scope properties from attributes', function() {
    // note that attribute properties are kebab-case and not camelCase!
    compile({}, { 'isolate-scope-attribute': 'hello' }, function(scope) {
      expect(scope.isolateScopeAttribute).toBe('hello');
    });
  });
 */

/**
 * createCompiler
 * @param  {string} template   string representing the template of directive
 * @param  {object} $rootScope the rootScope service
 * @param  {object} $compile   the compile service
 * @return {function}          compiler function
 */
function createCompiler(template, $rootScope, $compile) {
  /**
   * directive template compiler
   * @param  {object|function}      parentScope object | callback function
   * @param  {object|function}      attrs object | callback function
   * @param  {function} callback    function to fire when template has been compiled
   * @return {object}               object with element and scope properties
   */
  return function(/*parentScope, attrs, callback*/) {
    var args        = Array.prototype.slice.call(arguments, 0),
        callback    = _.isFunction(_.last(args)) ? args.pop() : angular.noop,
        parentScope = args.shift() || {},
        attrs       = args.shift() || {};

    var scope = $rootScope.$new(),
        extendedScope = _.extend(scope, parentScope),
        templateWithAttrs = $(template).attr(attrs),
        element = $compile(templateWithAttrs)(extendedScope);

    extendedScope.$digest();

    callback(extendedScope.$$childHead, element);

    return { scope: extendedScope.$$childHead, element: element};
  };
}
