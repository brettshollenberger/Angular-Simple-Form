# Simple Form

Simple Form DRYs up your forms by eliminating boilerplate, selecting some intelligent defaults, and moving validation logic where it belongs -- to the models.

A simple form looks a lot like a standard Angular form, but with less fuss:

  <form for="user">
    <input ng-model="user.name">
    <input ng-model="user.email">
    <input ng-model="user.zip">
  </form>

Packed into that sleek facade is a lot more information for Angular:

  <form name="userForm">
    <input type="text" name="user.name" ng-model="user.name" required>
    <input type="email" name="user.email" ng-model="user.email" required>
    <input type="text" name="user.zip" ng-model="user.zip" required zip-code-validator>
  </form>

But you don't need to write all that for each form. Simple Form's validations are defined like ActiveRecord validations, on your model objects:

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

Writing custom validations is much easier in Simple Form, too. No more boilerplate; no more custom directives that tap into the $parsers array. Simple Form validators just require you to write a function that returns true or false:

  zipValidator = function(zip) {
    if(!zip) return true;
    return /(^\d{5}$)|(^\d{5}-{0,1}\d{4}$)/.test(zip);
  };

That's it! Happy hacking.
