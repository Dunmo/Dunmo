let View = Template.addTaskButton;

View.events({
  'click .app-addtaskbutton__body': (e, t) => { return Helpers.toggleAddTaskIsActive(true); },
});
