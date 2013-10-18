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
      email: '',
      zip: '',
      id: '',
      validates: {
        name:  { presence: true },
        email: { presence: true, email: true },
        zip:   { presence: true, zip: [ zipValidator, "Must contain a valid zip code" ] }
      },
      save: angular.noop,
      find: angular.noop
    };

    // When a scope calls $new(), the child scope inherits prototypically
    $scope           = parentScope.$new();

    // Basic HTML use case
    html             = '<form for="user">' +
                          '<input ng-model="user.name">' +
                          '<input ng-model="user.email">' +
                          '<input ng-model="user.zip">' +
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
      expect(ngFormCtrl.$fields['user.email'].$validates).toEqual({presence: true, email: true});
    });

    it('defaults to built-in Angular directives for validations', function() {
      expect(element.html().match(/required="required"/)).not.toBeNull();
      expect(element.html().match(/type="email"/)).not.toBeNull();
      expect(element.html().match(/type="phone"/)).toBeNull();
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
      

  });
  
});
