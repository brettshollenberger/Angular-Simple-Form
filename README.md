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
      zip:   { presence: true, zip: { validates: zipValidator, message: "Must contain a valid zip code"} }
    }
  };
  ```
Writing custom validations is much easier in Simple Form, too. No more boilerplate; no more custom directives that tap into the $parsers array. Simple Form validators just require you to write a function that returns true or false, and assign it to the validates key on your validation:
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

To add custom error message to presence validation:

  ```
  user = {
    name: '',
    validates: {
      name:  { presence: { message: 'Please enter a name.' } }
    }
  };
  ```

#### Absence:

As in Rails, `absence: true` indicates a field that should not have a value:

  ```
  user = {
    name: '',
    validates: {
      name:  { absence: true }
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

#### Exclusion: 

Verifies that a field's value is excluded from a given set:

  ```
  parentScope.user = {
    size: '',
    validates: {
      size: { exclusion: { from: ["XL", "XXL", "XS"] } }
    }
  };
  ```

#### Numericality: 

Verifies that a field's value is a number:

  ```
  parentScope.user = {
    orderNumber: '',
    validates: {
      orderNumber: { numericality: true }
    }
  };
  ```

You can also specify an option to ignore certain characters, like dashes and commas:

  ```
  parentScope.user = {
    orderNumber: '',
    validates: {
      orderNumber: { numericality: { ignore: /[\-\,]/g } }
    }
  };
  ```

Which would make numbers like `1-111-000-11` and `1,111` validate to true.

#### Length: 

Verifies that a field's value is a certain length:

  ```
  parentScope.user = {
    username: '',
    validates: {
      username: { length: { in: _.range(1..20) } }
    }
  };
  ```

  ```
  parentScope.user = {
    username: '',
    validates: {
      username: { length: { min: 1 } }
    }
  };
  ```

  ```
  parentScope.user = {
    username: '',
    validates: {
      username: { length: { min: 1, max: 10 } }
    }
  };
  ```

  ```
  parentScope.user = {
    username: '',
    validates: {
      username: { length: { is: 6 } }
    }
  };
  ```

#### Uniqueness: 

Verifies that a field's value is unique. This validator requires the model to implement
an `all` method that retrieves all objects from the database to check against. In general,
fields that must be unique should be indexed for performance:

  ```
  parentScope.user = {
    username: '',
    validates: {
      username: { uniqueness: true }
    }
  };
  ```

Due to the opinionated nature of Simple Form, Angular forms that use the uniqueness validator
should aim to follow the ActiveRecord pattern for designing models.

Stay tuned for more! Happy hacking.
