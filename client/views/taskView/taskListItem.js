
Template.taskListItem.events({
  'click .remove': function() {
    console.log('this: ', this);
    this.remove();
    gapi.syncTasksWithCalendar();
  }
});
