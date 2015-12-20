
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
