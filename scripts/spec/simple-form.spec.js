describe('Simple Form', function () {

  var $compile, $rootScope, parentScope, zipValidator,
  $scope, html, element, f, ngFormCtrl;

  beforeEach(module('simpleForm'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile         = _$compile_;
    $rootScope       = _$rootScope_;

    // Simulate a controller scope that ng-model will inherit from
    parentScope      = $rootScope.$new();

    zipValidator     = function(zip) {
      if(!zip) return true;
      return /(^\d{5}$)|(^\d{5}-{0,1}\d{4}$)/.test(zip);
    };

    // Simulate a model on the parent scope
    parentScope.user = {
      name: '',
      username: '',
      email: '',
      zip: '',
      id: '',
      termsOfService: false,
      password: '',
      passwordConfirmation: '',
      validates: {
        name:                 { presence: true },
        username:             { presence: true, length: { in: _.range(1, 10) } },
        email:                { presence: true, format: { email: true } },
        zip:                  { presence: true, zip: { validates: zipValidator, message: "Must contain a valid zip code" } },
        termsOfService:       { acceptance: true },
        password:             { confirmation: true },
        passwordConfirmation: { presence: true }
      },
      save: angular.noop,
      find: angular.noop
    };

    // When a scope calls $new(), the child scope inherits prototypically
    $scope           = parentScope.$new();

    // Basic HTML use case
    html             = '<form for="user">' +
                          '<input ng-model="user.name">' +
                          '<input ng-model="user.username">' +
                          '<input ng-model="user.email">' +
                          '<input ng-model="user.zip">' +
                          '<input ng-model="user.termsOfService">' +
                          '<input ng-model="user.password">' +
                          '<input ng-model="user.passwordConfirmation">' +
                       '</form>';

    // Compile the view and bind to the scope
    element          = $compile(html)($scope);

    ngFormCtrl       = element.controller('form');
  }));

  describe('form creation and validation', function() {

    it('sets the form name to the name of the model + Form', function() {
      expect(ngFormCtrl.$name).toEqual('userForm');
    });

    it('sets the input name to the ng-model by default', function() {
      expect(ngFormCtrl.$fields['user.name'].$name).toEqual('user.name');
    });

    it('overrides the $name property with the name attribute, if defined', function() {
      html       =  '<form for="user">'+
                      '<input name="username" ng-model="user.name">' +
                    '</form>';

    // Compile the view and bind to the scope
      element    = $compile(html)($scope);

      ngFormCtrl = element.controller('form');
      expect(ngFormCtrl.$fields['username'].$name).toEqual('username');
    });

    it('exposes its fields publicly on the fields array', function() {
      expect(ngFormCtrl.$fields['user.name']).toBeDefined();
      expect(ngFormCtrl.$fields['user.email']).toBeDefined();
      expect(ngFormCtrl.$fields['user.phone']).toBeUndefined();
    });

    it('features built-in validations', function() {
      expect(ngFormCtrl.$fields['user.name'].$validates).toEqual({presence: true});
      expect(ngFormCtrl.$fields['user.email'].$validates).toEqual({presence: true, format: { email: true } });
    });

    it('accepts custom validations', function() {
      expect(element.html().match(/validates="presence,zip"/)).not.toBeNull();
    });

    it('parses true/false validation evaluations into $parser functions', function() {
      ngFormCtrl.$fields['user.zip'].$setViewValue('11111-1111');
      expect(ngFormCtrl.$fields['user.zip'].$valid).toEqual(true);

      ngFormCtrl.$fields['user.zip'].$setViewValue('11111');
      expect(ngFormCtrl.$fields['user.zip'].$valid).toEqual(true);

      ngFormCtrl.$fields['user.zip'].$setViewValue('abcdefg');
      expect(ngFormCtrl.$fields['user.zip'].$valid).toEqual(false);
    });

    it('adds the built-in css valid/invalid classes to inputs', function() {
      ngFormCtrl.$fields['user.zip'].$setViewValue('11111-1111');
      expect(element.html().match(/ng-valid-zip/)).not.toBeNull();
      expect(element.html().match(/ng-invalid-zip/)).toBeNull();

      ngFormCtrl.$fields['user.zip'].$setViewValue('abcdefg');
      expect(element.html().match(/ng-valid-zip/)).toBeNull();
      expect(element.html().match(/ng-invalid-zip/)).not.toBeNull();
    });

    it('validates the presence of a field', function() {
      ngFormCtrl.$fields['user.name'].$setViewValue(null);
      expect(ngFormCtrl.$fields['user.name'].$valid).toBe(false);
    });

    it('validates emails', function() {
      ngFormCtrl.$fields['user.email'].$setViewValue('porky');
      expect(ngFormCtrl.$fields['user.email'].$valid).toBe(false);

      ngFormCtrl.$fields['user.email'].$setViewValue('porky@pig.net');
      expect(ngFormCtrl.$fields['user.email'].$valid).toBe(true);
    });
      
    it('validates zip codes by default', function() {
      parentScope.user = {
        zip: '',
        validates: {
          zip:   { format: { zip: true } }
        }
      };

      html             = '<form for="user">' +
                            '<input ng-model="user.zip">' +
                          '</form>';
      element          = $compile(html)($scope);
      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.zip'].$setViewValue('11111-1111');
      expect(ngFormCtrl.$fields['user.zip'].$valid).toBe(true);

      ngFormCtrl.$fields['user.zip'].$setViewValue('not a zip');
      expect(ngFormCtrl.$fields['user.zip'].$valid).toBe(false);
    });

    it('validates checkbox acceptance', function() {
      ngFormCtrl.$fields['user.termsOfService'].$setViewValue(true);
      expect(ngFormCtrl.$fields['user.termsOfService'].$valid).toBe(true);

      ngFormCtrl.$fields['user.termsOfService'].$setViewValue(false);
      expect(ngFormCtrl.$fields['user.termsOfService'].$valid).toBe(false);
    });

    it('validates confirmation of matching fields', function() {
      ngFormCtrl.$fields['user.password'].$setViewValue('myPassword');
      expect(ngFormCtrl.$fields['user.password'].$valid).toBe(false);

      ngFormCtrl.$fields['user.passwordConfirmation'].$setViewValue('myPassword');
      ngFormCtrl.$fields['user.password'].$setViewValue('myPassword');
      expect(ngFormCtrl.$fields['user.password'].$valid).toBe(true);
    });

    it('validates custom formats', function() {
      parentScope.user = {
        orderNumber: '',
        validates: {
          orderNumber: { format: { regex: /\d{3}\w{2}\d{3}/ } }
        }
      };

      html =  '<form for="user">' +
                '<input ng-model="user.orderNumber">' +
              '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');
      ngFormCtrl.$fields['user.orderNumber'].$setViewValue('123ab456');
      expect(ngFormCtrl.$fields['user.orderNumber'].$valid).toBe(true);
    });

    it('validates inclusion in a set of terms', function() {
      parentScope.user = {
        size: '',
        validates: {
          size: { inclusion: { in: ["small", "medium", "large"] } }
        }
      };

      html =  '<form for="user">' +
                '<input ng-model="user.size">' +
              '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');
      ngFormCtrl.$fields['user.size'].$setViewValue('small');
      expect(ngFormCtrl.$fields['user.size'].$valid).toBe(true);

      ngFormCtrl.$fields['user.size'].$setViewValue('hefty');
      expect(ngFormCtrl.$fields['user.size'].$valid).toBe(false);
    });

    it('validates exclusion in a set of terms', function() {
      parentScope.user = {
        size: '',
        validates: {
          size: { exclusion: { from: ["XL", "XXL", "XXL"] } }
        }
      };

      html =  '<form for="user">' +
                '<input ng-model="user.size">' +
              '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');
      ngFormCtrl.$fields['user.size'].$setViewValue('small');
      expect(ngFormCtrl.$fields['user.size'].$valid).toBe(true);

      ngFormCtrl.$fields['user.size'].$setViewValue('XL');
      expect(ngFormCtrl.$fields['user.size'].$valid).toBe(false);
    });

    it('validates length in', function() {
      ngFormCtrl.$fields['user.username'].$setViewValue('abcdefghijk');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);

      ngFormCtrl.$fields['user.username'].$setViewValue('username');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(true);
    });

    it('validates length min & max', function() {
      parentScope.user = {
        username: '',
        validates: {
          username: { presence: true, length: { min: 1, max: 10 } }
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.username">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.username'].$setViewValue(null);
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);

      ngFormCtrl.$fields['user.username'].$setViewValue('a');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(true);

      ngFormCtrl.$fields['user.username'].$setViewValue('abcdefghi');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(true);

      ngFormCtrl.$fields['user.username'].$setViewValue('abcdefghijk');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);
    });

    it('validates length is', function() {
      parentScope.user = {
        username: '',
        validates: {
          username: { presence: true, length: { is: 6 } }
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.username">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.username'].$setViewValue('abc');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);

      ngFormCtrl.$fields['user.username'].$setViewValue('abcdef');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(true);
    });

    it('validates numericality', function() {
      parentScope.user = {
        orderNumber: '',
        validates: {
          orderNumber: { presence: true, numericality: true }
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.orderNumber">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.orderNumber'].$setViewValue('abc');
      expect(ngFormCtrl.$fields['user.orderNumber'].$valid).toBe(false);

      ngFormCtrl.$fields['user.orderNumber'].$setViewValue('1111');
      expect(ngFormCtrl.$fields['user.orderNumber'].$valid).toBe(true);

      ngFormCtrl.$fields['user.orderNumber'].$setViewValue('1.111');
      expect(ngFormCtrl.$fields['user.orderNumber'].$valid).toBe(true);

      parentScope.user = {
        orderNumber: '',
        validates: {
          orderNumber: { presence: true, numericality: { ignore: /[\-\,]/g } }
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.orderNumber">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.orderNumber'].$setViewValue('1-111-00-11');
      expect(ngFormCtrl.$fields['user.orderNumber'].$valid).toBe(true);
    });

    it('validates absence of a field', function() {
      parentScope.user = {
        badField: '',
        validates: {
          badField: { absence: true }
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.badField">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.badField'].$setViewValue('something');
      expect(ngFormCtrl.$fields['user.badField'].$valid).toBe(false);
    });

    it('validates uniqueness of a field', function() {
      parentScope.user = {
        username: '',
        validates: {
          username: { uniqueness: true }
        },
        all: function() {
          return [
          {
            username: 'brettcassette'
          },
          {
            username: 'brettshollenberger'
          }];
        }
      };

      html             =  '<form for="user">' +
                            '<input ng-model="user.username">' +
                          '</form>';

      element          = $compile(html)($scope);

      ngFormCtrl       = element.controller('form');

      ngFormCtrl.$fields['user.username'].$setViewValue('brettcassette');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);

      ngFormCtrl.$fields['user.username'].$setViewValue('brettshollenberger');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(false);

      ngFormCtrl.$fields['user.username'].$setViewValue('androidgeoff');
      expect(ngFormCtrl.$fields['user.username'].$valid).toBe(true);
    });

  });
  
});
