var View = Template.addTaskButton;

View.events({
  'click .app-addtaskbutton__body': function (e, t) {
    Session.set('add-task-is-active', true);
  }
});
