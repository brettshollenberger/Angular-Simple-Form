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

simpleForm.directive('ngModel', function() {
  return {
    restrict: 'A',
    require: ['^ngModel', '^form'],
    compile: function() {
      return {
        pre: function(scope, element, attrs, ctrls) {
          var $model;

          var modelCtrl = ctrls[0],
          formCtrl = ctrls[1] || nullFormCtrl;

          modelCtrl.$name      = attrs.name || attrs.ngModel || 'unnamedInput';
          $model               = scope.$eval(attrs.ngModel.replace(/\.\w{0,}/g, ''));
          modelCtrl.$validates = $model.validates[attrs.ngModel.replace(/\w{0,}\./, '')];

          for (var validator in modelCtrl.$validates) {
            addValidations(validator, modelCtrl.$validates[validator]);
          }

          function addValidations(validator, validation) {
            var validators = {
              presence: { required: true },
              email:    { type: "email" }
            };

            var validationKey = validators[validator.toString()];
            if (validationKey) {
              element.attr(validationKey);
            } else {
              modelCtrl.$parsers.push(function(value) {
                if (validation[0](value)) {
                  modelCtrl.$setValidity(validator, true);
                } else {
                  modelCtrl.$setValidity(validator, false);
                }
                return value;
              });
              element.attr({validates: Object.keys(modelCtrl.$validates)});
            }
          }
        }
      };
    }
  };
});
