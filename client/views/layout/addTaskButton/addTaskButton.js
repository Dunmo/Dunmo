let View = Template.addTaskButton;

View.events({
  'click .app-addtaskbutton__body': (e, t) => { return Session.set('add-task-is-active', true) },
});
