/* global angular */

'use strict';

/**
 * createCompiler
 * @param  {string}   template   string representing the template of directive
 * @param  {object}   $rootScope the rootScope service
 * @param  {object}   $compile   the compile service
 * @param  [{object}] driver     optional driver object literal
 * @return {function}            compiler function
 */
function createCompiler(template, $rootScope, $compile, driver) {
  /**
   * directive template compiler
   * @param  {object|function}      parentScope object | callback function
   * @param  {object|function}      attrs object | callback function
   * @param  {function} callback    function to fire when template has been compiled
   * @param  {function} driver      function to fire when template has been compiled
   * @return {object}               object with element and scope properties
   */
  return function (/* parentScope, attrs, callback */) {
    var args        = [].slice.call(arguments),
        callback    = angular.isFunction(args[args.length - 1]) ? args.pop() : angular.noop,
        parentScope = args.shift() || {},
        attrs       = args.shift() || {};

    var scope = $rootScope.$new(),
        extendedScope = angular.extend(scope, parentScope),
        templateWithAttrs = angular.element(template).attr(attrs),
        element = $compile(templateWithAttrs)(extendedScope);

    extendedScope.$digest();

    if(driver) {
      var tempDriver = angular.copy(driver);

      tempDriver.$ = element;

      var newDriver =
        Object
          .keys(tempDriver)
          .reduce(function (acc, curr) {
            acc[curr] = typeof tempDriver[curr] === 'function' ? function () {
              return arguments.length ?
                tempDriver[curr].apply(tempDriver, arguments) :
                tempDriver[curr].call(tempDriver, element);
            } : tempDriver[curr];
            return acc;
          }, {});

      callback(extendedScope.$$childHead, element, newDriver);
    } else {
      callback(extendedScope.$$childHead, element);
    }


    return {
      scope: extendedScope.$$childHead,
      element: element,
      driver: newDriver
    };
  };
}
