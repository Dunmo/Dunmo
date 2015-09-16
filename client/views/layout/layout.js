var View = Template.layout;

View.helpers({
  modalActive: function () {
    return Session.get('add-task-is-active');
  }
});

View.events({
  'click .app-dimmer': function (e, t) {
    Session.set('add-task-is-active', false);
  }
});
