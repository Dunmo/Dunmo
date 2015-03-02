
Template.taskView.helpers({
  tasks: function() {
    return Tasks.find({ ownerId: Meteor.userId() });
  }
});
