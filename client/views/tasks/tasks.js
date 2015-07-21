
Template.tasks.helpers({
  tasks: function () {
    var filter = Session.get('task-filter');
    switch(filter) {
      case 'completed':
        return Meteor.user().doneTasks();
      case 'trash':
        return Meteor.user().fetchRemoved();
      case 'all':
      default:
        return Meteor.user().fetchSortedTodos();
    }
  }
});
