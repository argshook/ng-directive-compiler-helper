describe('createCompiler', function() {
  var createdCompiler,
      mockTemplate = '<my-directive></my-directive>',
      mockIsolateTemplate = '<my-isolate-directive></my-isolate-directive>';

  angular
    .module('mockModule', [])
    .directive('myDirective', function() {
      return {
        restrict: 'E',
        scope: true,
        template: '<div>directive</div>'
      };
    })
    .directive('myIsolateDirective', function() {
      return {
        restrict: 'E',
        scope: { isolateProperty: '@' },
        template: '<div>isolate directive</div>',
      };
    });

  beforeEach(module('mockModule'));

  describe('createCompiler()', function() {
    it('should return function', function() {
      expect(typeof createCompiler()).toBe('function');
    });
  });

  describe('compiler with non-isolate scope directive', function() {
    beforeEach(inject(function($rootScope, $compile) {
      createdCompiler = createCompiler(mockTemplate, $rootScope, $compile);
    }));

    it('should return object with scope and element properties', function() {
      var compiledDirective = createdCompiler();
      expect(compiledDirective.scope).toBeDefined();
      expect(compiledDirective.element.text()).toBe('directive');
    });

    describe('when one argument given', function() {
      describe('which is function', function() {
        it('should call that one argument as if it was a callback function', function() {
          expectCallbackToBeCalled();
        });
      });

      describe('which is object', function() {
        it('should return object with scope and element properties where scope is extended with first argument', function() {
          var compiledDirective = createdCompiler({ someProperty: 'someValue' });
          expect(compiledDirective.scope.someProperty).toBe('someValue');
          expect(compiledDirective.element.text()).toBe('directive');
        });
      });
    });

    describe('when two arguments given', function() {
      it('should set parent scope from first argument', function() {
        createdCompiler({ parentScope: 'value' }, function(scope) {
          expect(scope.parentScope).toBe('value');
        });
      });

      describe('when type of second argument is', function() {
        describe('function', function() {
          it('should call second argument as if it was a callback function', function() {
            expectCallbackToBeCalled();
          });
        });

        describe('object', function() {
          it('should return object with scope and element properties where element has attributes set from second argument', function() {
            var compiledDirective = createdCompiler({}, { 'some-attribute': 'someAttributeValue' });
            expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
          });
        });
      });
    });

    describe('when three arguments given', function() {
      it('should set parent scope from first argument', function() {
        createdCompiler({ parentScope: 'value' }, {}, function(scope) {
          expect(scope.parentScope).toBe('value');
        });
      });

      it('should set directive attributes from second argument', function() {
        createdCompiler({}, { moustache: 'french' }, function(scope, element) {
          expect(element.attr('moustache')).toBe('french');
        });
      });

      it('should call third argument as if it was a callback function', function() {
        expectCallbackToBeCalled();
      });

      it('should return object with scope and element properties that are extended from 1st and 2nd args', function() {
        var callbackSpy = jasmine.createSpy('createdCompilerCallbackSpy'),
            compiledDirective = createdCompiler({ someProperty: 'someValue' }, { 'some-attribute': 'someAttributeValue' }, callbackSpy);

        expect(callbackSpy).toHaveBeenCalled();
        expect(compiledDirective.scope.someProperty).toBe('someValue');
        expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
      });
    });
  });

  describe('compiler with isolate scope directive', function() {
    beforeEach(inject(function($rootScope, $compile) {
      createdCompiler = createCompiler(mockIsolateTemplate, $rootScope, $compile);
    }));

    it('should return object with scope and element properties', function() {
      var compiledDirective = createdCompiler();
      expect(compiledDirective.scope).toBeDefined();
      expect(compiledDirective.element.text()).toBe('isolate directive');
    });

    describe('when one argument given', function() {
      describe('which is function', function() {
        it('should call that one argument as if it was a callback function', function() {
          expectCallbackToBeCalled();
        });
      });

      describe('which is object', function() {
        it('should return object with scope and element properties where scope is NOT extended with first argument', function() {
          var compiledDirective = createdCompiler({ parentScopeProperty: 'someValue' });
          expect(compiledDirective.scope.parentScopeProperty).not.toBe('someValue');
          expect(compiledDirective.element.text()).toBe('isolate directive');
        });
      });
    });

    describe('when two arguments given', function() {
      it('should ignore parent scope from first argument', function() {
        createdCompiler({ isolateProperty: 'value' }, function(scope, element) {
          expect(scope.isolateProperty).not.toBeDefined();
        });
      });

      describe('when type of second argument is', function() {
        describe('function', function() {
          it('should call second argument as if it was a callback function', function() {
            expectCallbackToBeCalled();
          });
        });

        describe('object', function() {
          it('should return object with scope and element properties where element has attributes set from second argument', function() {
            var compiledDirective = createdCompiler({}, { 'some-attribute': 'someAttributeValue' });
            expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
          });
        });
      });
    });

    describe('when three arguments given', function() {
      it('should ignore parent scope from first argument', function() {
        createdCompiler({ isolateProperty: 'value' }, function(scope, element) {
          expect(scope.isolateProperty).not.toBeDefined();
        });
      });

      it('should set isolate scope properties from attributes object', function() {
        createdCompiler({}, { 'isolate-property': 'value' }, function(scope, element) {
          expect(scope.isolateProperty).toBe('value');
        });
      });

      it('should call third argument as if it was a callback function', function() {
        expectCallbackToBeCalled();
      });

      it('should return object with scope and element properties', function() {
        var callbackSpy = jasmine.createSpy('createdCompilerCallbackSpy'),
            // since it's isolate scope directive, first argument should not extend scope properties
            compiledDirective = createdCompiler({ someProperty: 'someValue' }, { 'some-attribute': 'someAttributeValue' }, callbackSpy);

        expect(callbackSpy).toHaveBeenCalled();
        expect(compiledDirective.scope.someProperty).not.toBe('someValue');
        expect(compiledDirective.element.attr('some-attribute')).toBe('someAttributeValue');
      });
    });
  });

  function expectCallbackToBeCalled() {
    var callbackSpy = jasmine.createSpy('callbackSpy');
    createdCompiler(callbackSpy);
    expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
  }
});
