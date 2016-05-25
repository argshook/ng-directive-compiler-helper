/* global jasmine, describe, angular, it, expect, beforeEach, inject, createCompiler */

describe('createCompiler', function () {
  var createdCompiler;
  var mockTemplate = '<my-directive></my-directive>';
  var mockIsolateTemplate = '<my-isolate-directive></my-isolate-directive>';

  angular
    .module('mockModule', ['ngMock'])
    .directive('myDirective', function () {
      return {
        restrict: 'E',
        scope: true,
        template: '<div id="directive">directive <div class="child">Child content</div></div>'
      };
    })
    .directive('myIsolateDirective', function () {
      return {
        restrict: 'E',
        scope: { isolateProperty: '@' },
        template: '<div id="isolate-directive">isolate directive <button ng-click="isolateProperty = \'changed\'">Click me</button><div class="child">Isolate child content</div></div>',
      };
    });

  beforeEach(module('mockModule'));

  describe('createCompiler()', function () {
    it('should return function', function () {
      expect(typeof createCompiler()).toBe('function');
    });
  });

  describe('compiler with non-isolate scope directive', function () {
    beforeEach(inject(function ($rootScope, $compile) {
      createdCompiler = createCompiler(mockTemplate, $rootScope, $compile);
    }));

    it('should return object with scope and element properties', function () {
      var compiledDirective = createdCompiler();
      expect(compiledDirective.scope).toBeDefined();
      expect(compiledDirective.element.text()).toMatch('directive');
      expect(compiledDirective.element[0].querySelector('.child').innerText).toBe('Child content');
    });

    describe('when one argument given', function () {
      describe('which is function', function () {
        it('should call that one argument as if it was a callback function', function () {
          expectCallbackToBeCalled();
        });
      });

      describe('which is object', function () {
        it('should return object with scope and element properties where scope is extended with first argument', function () {
          var compiledDirective = createdCompiler({ someProperty: 'someValue' });
          expect(compiledDirective.scope.someProperty).toBe('someValue');
          expect(compiledDirective.element.text()).toMatch('directive');
          expect(compiledDirective.element[0].querySelector('.child').innerText).toBe('Child content');
        });
      });
    });

    describe('when two arguments given', function () {
      it('should set parent scope from first argument', function () {
        createdCompiler({ parentScope: 'value' }, function (scope) {
          expect(scope.parentScope).toBe('value');
        });
      });

      describe('when type of second argument is', function () {
        describe('function', function () {
          it('should call second argument as if it was a callback function', function () {
            expectCallbackToBeCalled();
          });
        });

        describe('object', function () {
          it('should return object with scope and element properties where element has attributes set from second argument', function () {
            var compiledDirective = createdCompiler({}, { 'some-attribute': 'someAttributeValue' });
            expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
          });
        });
      });
    });

    describe('when three arguments given', function () {
      it('should set parent scope from first argument', function () {
        createdCompiler({ parentScope: 'value' }, {}, function (scope) {
          expect(scope.parentScope).toBe('value');
        });
      });

      it('should set directive attributes from second argument', function () {
        createdCompiler({}, { moustache: 'french', 'big-phat': 'azz' }, function (scope, element) {
          expect(element.attr('moustache')).toBe('french');
          expect(element.attr('big-phat')).toBe('azz');
        });
      });

      it('should call third argument as if it was a callback function', function () {
        expectCallbackToBeCalled();
      });

      it('should return object with scope and element properties that are extended from 1st and 2nd args', function () {
        var callbackSpy = jasmine.createSpy('createdCompilerCallbackSpy');
        var compiledDirective = createdCompiler(
          { someProperty: 'someValue' },
          { 'some-attribute': 'someAttributeValue' },
          callbackSpy
        );

        expect(callbackSpy).toHaveBeenCalled();
        expect(compiledDirective.scope.someProperty).toBe('someValue');
        expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
      });
    });
  });

  describe('compiler with isolate scope directive', function () {
    beforeEach(inject(function ($rootScope, $compile) {
      createdCompiler = createCompiler(mockIsolateTemplate, $rootScope, $compile);
    }));

    it('should return object with scope and element properties', function () {
      var compiledDirective = createdCompiler();
      expect(compiledDirective.scope).toBeDefined();
      expect(compiledDirective.element.text()).toMatch('isolate directive');
      expect(compiledDirective.element[0].querySelector('.child').innerText).toBe('Isolate child content');
    });

    describe('when one argument given', function () {
      describe('which is function', function () {
        it('should call that one argument as if it was a callback function', function () {
          expectCallbackToBeCalled();
        });
      });

      describe('which is object', function () {
        it('should return object with scope and element properties where scope is NOT extended with first argument', function () {
          var compiledDirective = createdCompiler({ parentScopeProperty: 'someValue' });
          expect(compiledDirective.scope.parentScopeProperty).not.toBe('someValue');
          expect(compiledDirective.element.text()).toMatch('isolate directive');
          expect(compiledDirective.element[0].querySelector('.child').innerText).toBe('Isolate child content');
        });
      });
    });

    describe('when two arguments given', function () {
      it('should ignore parent scope from first argument', function () {
        createdCompiler({ isolateProperty: 'value' }, function (scope, element) {
          expect(scope.isolateProperty).not.toBeDefined();
        });
      });

      describe('when type of second argument is', function () {
        describe('function', function () {
          it('should call second argument as if it was a callback function', function () {
            expectCallbackToBeCalled();
          });
        });

        describe('object', function () {
          it('should return object with scope and element properties where element has attributes set from second argument', function () {
            var compiledDirective = createdCompiler({}, { 'some-attribute': 'someAttributeValue' });
            expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
          });
        });
      });
    });

    describe('when three arguments given', function () {
      it('should ignore parent scope from first argument', function () {
        createdCompiler({ isolateProperty: 'value' }, function (scope, element) {
          expect(scope.isolateProperty).not.toBeDefined();
        });
      });

      it('should set isolate scope properties from attributes object', function () {
        createdCompiler({}, { 'isolate-property': 'value' }, function (scope, element) {
          expect(scope.isolateProperty).toBe('value');
        });
      });

      it('should call third argument as if it was a callback function', function () {
        expectCallbackToBeCalled();
      });

      it('should return object with scope and element properties', function () {
        var callbackSpy = jasmine.createSpy('createdCompilerCallbackSpy');
        // since it's isolate scope directive, first argument should not extend scope properties
        var compiledDirective = createdCompiler(
          { someProperty: 'someValue' },
          { 'some-attribute': 'someAttributeValue' },
          callbackSpy
        );

        expect(callbackSpy).toHaveBeenCalled();
        expect(compiledDirective.scope.someProperty).not.toBe('someValue');
        expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
      });
    });
  });

  describe('when compiled with driver', function() {
    var driver = {
      text: function(element) {
        return element[0].querySelector('.child').innerText;
      },

      driveMeCrazy: function(element, scope) {
        var click = document.createEvent('MouseEvent');

        click.initEvent('click', true, true);
        element[0].querySelector('button').dispatchEvent(click);
        scope.$digest();
      },

      testicle: 'shit',

      goodbye: function() {
        expect(this.$.toString()).toBe('[[object HTMLElement]]');
        return 'you little ' + this.testicle;
      },

      doSpecial: function(special) {
        return special.toUpperCase();
      }
    };

    beforeEach(inject(function($rootScope, $compile) {
      createdCompiler = createCompiler(mockIsolateTemplate, $rootScope, $compile, driver);
    }));

    it('should use last argument as driver', function() {
      createdCompiler(function(scope, element, driver) {
        expect(driver.text()).toBe('Isolate child content')
        driver.driveMeCrazy(element, scope);
        expect(scope.isolateProperty).toBe('changed')
      });
    });

    it('should pass arguments to driver methods', function() {
      createdCompiler(function(scope, element, driver) {
        expect(driver.doSpecial('trick')).toBe('TRICK');
      });
    });

    it('should set expected context to driver methods', function() {
      function callback(scope, element, driver) {
        expect(driver.goodbye()).toBe('you little shit');
        expect(driver.testicle).toBe('shit');
      }

      createdCompiler(callback);
    });
  });

  function expectCallbackToBeCalled() {
    var callbackSpy = jasmine.createSpy('callbackSpy');
    createdCompiler(callbackSpy);
    expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
  }
});

