/* global angular */

'use strict';

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
        callback    = angular.isFunction(args[args.length - 1]) ? args.pop() : angular.noop,
        parentScope = args.shift() || {},
        attrs       = args.shift() || {};

    var scope = $rootScope.$new(),
        extendedScope = angular.extend(scope, parentScope),
        templateWithAttrs = angular.element(template).attr(attrs),
        element = $compile(templateWithAttrs)(extendedScope);

    extendedScope.$digest();

    callback(extendedScope.$$childHead, element);

    return { scope: extendedScope.$$childHead, element: element};
  };
}
