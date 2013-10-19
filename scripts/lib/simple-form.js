var simpleForm = angular.module('simpleForm', []);

simpleForm.directive('form', function() {
  return {
    restrict: 'E',
    require: '^form',
    compile: function() {
      return {
        pre: function(scope, formElement, attrs, ctrl) {
          ctrl.$name   = attrs.name || nameDefault() || attrs.ngForm;
          ctrl.$fields = {};

          function nameDefault() {
            return attrs['for'] ? attrs['for'] + 'Form' : '';
          }

          function assertNotHasOwnProperty(name, context) {
            if (name === 'hasOwnProperty') {
              throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
            }
          }

          ctrl.$addControl = function(control) {
            assertNotHasOwnProperty(control.$name, 'input');

            if (control.$name) {
              ctrl.$fields[control.$name] = control;
              ctrl[control.$name] = control;
            }
          };
        }
      };
    }
  };
});

simpleForm.directive('ngModel', function($compile) {

  return {
    restrict: 'A',
    require: ['^ngModel', '^form'],
    compile: function() {
      return {
        pre: function(scope, element, attrs, ctrls) {
          var $model, modelName, fieldName, confirmationName,
          modelCtrl            = ctrls[0],
          formCtrl             = ctrls[1] || nullFormCtrl;
          modelCtrl.$name      = attrs.name || attrs.ngModel || 'unnamedInput';
          $model               = scope.$eval(attrs.ngModel.replace(/\.\w{0,}/g, ''));
          modelCtrl.$validates = $model.validates[attrs.ngModel.replace(/\w{0,}\./, '')];

          var validators = {
            presence: function(value) {
              return value && value.length;
            },
            format: {
              email: function(value) {
                if (!value) return true;
                return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(value);
              },
              zip: function(value) {
                if(!value) return true;
                return /(^\d{5}$)|(^\d{5}-{0,1}\d{4}$)/.test(value);
              },
            },
            // inclusion: {},
            acceptance: function(value) {
              return value == true;
            },
            confirmation: function(value) {
              modelName        = attrs.ngModel.replace(/\.\w{0,}/g, '');
              fieldName        = modelCtrl.$name.replace(/\w{0,}\./, '');
              confirmationName = modelName + '.' + fieldName + 'Confirmation';
              return value == formCtrl.$fields[confirmationName].$viewValue;
            }
          };

          for (var validator in modelCtrl.$validates) {
            addValidations(validator, modelCtrl.$validates[validator]);
          }

          function addValidations(validator, validation) {
            var validationKey;
            var type = Object.prototype.toString.call( validation );

            if (booleanType(type)) { validationKey = findBuiltInValidation(); }
            if (arrayType(type))   { validationKey = validation[0]; }
            if (validationKey)     { pushParser(validationKey); }
            if (objectType(type))  {
              for (var v in validation) {
                var keyName   = Object.keys(validation)[0];
                if (keyName == 'regex') { validationKey = buildRegexValidation(validation, v); }
                if (keyName == 'in')    { validationKey = buildInclusionValidation(validation, v); }
                if (keyName == 'from')    { validationKey = buildExclusionValidation(validation, v); }
                if (otherKeyName(keyName)) { validationKey = findNestedBuiltInValidation(v); }
                pushParser(validationKey);
              }
            }
            element.attr({validates: Object.keys(modelCtrl.$validates)});
          }

          function booleanType(type) {
            return type === '[object Boolean]';
          }

          function arrayType(type) {
            return type === '[object Array]';
          }

          function objectType(type) {
            return type === '[object Object]';
          }

          function findBuiltInValidation() {
            return validators[validator.toString()];
          }

          function findNestedBuiltInValidation(v) {
            return validators[validator.toString()][v];
          }

          function pushParser(validationKey) {
            modelCtrl.$parsers.push(function(value) {
              if (validationKey(value))  { modelCtrl.$setValidity(validator, true);  }
              if (!validationKey(value)) { modelCtrl.$setValidity(validator, false); }
              return value;
            });
          }

          function confirmationType() {
            return validator == 'confirmation';
          }

          function otherKeyName(keyName) {
            return keyName != 'in' && keyName != 'from' && keyName != 'regex';
          }

          function buildRegexValidation(validation, v) {
            return function(value) {
              if (!value) return true;
              return validation[v].test(value);
            };
          }

          function buildInclusionValidation(validation, v) {
            return function(value) {
              if (!value) return true;
              var included = false;
              validation[v].forEach(function(i) {
                if (i == value) { included = true; }
              });
              return included;
            };
          }

          function buildExclusionValidation(validation, v) {
            return function(value) {
              if (!value) return true;
              var included = true;
              validation[v].forEach(function(i) {
                if (i == value) { included = false; }
              });
              return included;
            };
          }
        }
      };
    }
  };
});
