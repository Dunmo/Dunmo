
Mousetrap.bind(['esc'], function () {
  Helpers.toggleAddTaskIsActive(false);
});

Mousetrap.bind(['a', 'n'], function () {
  // to prevent key from appearing in first add task input
  Meteor.setTimeout(function () {
    Helpers.toggleAddTaskIsActive(true);
  });
});

Mousetrap.bind(['t'], function () {
  Router.go('/tasks/todo');
});

Mousetrap.bind(['c'], function () {
  Router.go('/tasks/completed');
});

Mousetrap.bind(['r'], function () {
  Router.go('/tasks/trash');
});

Mousetrap.bind(['?'], function () {
  window.open(Helpers.helpUrl(), '_blank');
});

Mousetrap.bind(['s'], function () {
  Router.go('/settings');
});
