var View = Template.layout;

View.helpers({
  modalActive: function () {
    return Session.get('add-task-is-active');
  }
});
