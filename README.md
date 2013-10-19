# Simple Form

Simple Form DRYs up your forms by eliminating boilerplate, selecting some intelligent defaults, and moving validation logic where it belongs -- to the models.

A simple form looks a lot like a standard Angular form, but with less fuss:
  ```
  <form for="user">
    <input ng-model="user.name">
    <input ng-model="user.email">
    <input ng-model="user.zip">
  </form>
  ```
Packed into that sleek facade is a lot more information for Angular:
  ```
  <form name="userForm">
    <input type="text" name="user.name" ng-model="user.name" required>
    <input type="email" name="user.email" ng-model="user.email" required>
    <input type="text" name="user.zip" ng-model="user.zip" required zip-code-validator>
  </form>
  ```
But you don't need to write all that for each form. Simple Form's validations are defined like ActiveRecord validations, on your model objects:
  ```
  user = {
    name: '',
    email: '',
    zip: '',
    validates: {
      name:  { presence: true },
      email: { presence: true, email: true },
      zip:   { presence: true, zip: [ zipValidator, "Must contain a valid zip code" ] }
    }
  };
  ```
Writing custom validations is much easier in Simple Form, too. No more boilerplate; no more custom directives that tap into the $parsers array. Simple Form validators just require you to write a function that returns true or false:
  ```
  zipValidator = function(zip) {
    if(!zip) return true;
    return /(^\d{5}$)|(^\d{5}-{0,1}\d{4}$)/.test(zip);
  };
  ```

### Built-in Validators:

#### Presence:

As in Rails, `presence: true` indicates a required field:

  ```
  user = {
    name: '',
    validates: {
      name:  { presence: true }
    }
  };
  ```

#### Format:

Format matches an input against a pattern. There are several built-in, and you can also write your own using the `regex` matcher:

  ```
  parentScope.user = {
    email: '',
    zip: '',
    orderNumber: '',
    validates: {
      email:       { format: { email: true              } },
      zip:         { format: { zip:   true              } },
      orderNumber: { format: { regex: /\d{3}\w{2}\d{3}/ } }
    }
  };
  ```

#### Acceptance:

Acceptance is often used in web applications to verify that a user has accepted something like terms of service. This indicates a true value in a checkbox, for instance:

  ```
  parentScope.user = {
    termsOfService: '',
    validates: {
      termsOfService: { acceptance: true }
    }
  };
  ```

#### Confirmation: 

When two fields need to match, confirmation ensures that both fields do. The second field should be the name of the first field plus "Confirmation."

  ```
  parentScope.user = {
    password: '',
    passwordConfirmation: '',
    validates: {
      password: { confirmation: true },
      passwordConfirmation: { presence: true },
    }
  };
  ```

#### Inclusion: 

Verifies that a field's value is included in a given set:

  ```
  parentScope.user = {
    size: '',
    validates: {
      size: { inclusion: { in: ["small", "medium", "large"] } }
    }
  };
  ```

Stay tuned for more! Happy hacking.
