# Dunmo Code Style Guide

If you're not familiar with Meteor, check out the tutorial here: https://www.meteor.com/install

## Templates

Templates are designed to be front end components that can be composed to form whole web views.
They consist of three separate, but connected parts:
`myTemplate.html` - Structure
`myTemplate.css`  - Style
`myTemplate.js`   - Events and Data Binding

Don't put CSS styles in the HTML. We try to use CSS classes to represent the abstract idea behind a certain rule.
e.g. `<button class="btn btn-sm btn-warning btn-action"><i class="fa fa-lg fa-edit-o"></i></button>`

## Javascript

We try to write functional Javascript whenever possible. There are three basic rules.
Modularity    - A function should try as hard as possible to have one job.
Composability - Functions should be designed to work well together for advanced functionality.
Idempotence   - Don't mutuate objects or arrays in functions. Copy them, modify them, and return the new value.

Don't use for loops on arrays. Use a functional style. For more info, see here: http://eloquentjavascript.net/1st_edition/chapter6.html

...to be continued.

In the meantime, try to follow conventions in the existing code base, and ask for clarification if it's ambiguous.
