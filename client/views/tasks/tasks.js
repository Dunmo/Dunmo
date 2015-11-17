
Template.tasks.helpers({
  isTodosView: function () {
    return Session.get('task-filter') === 'todo';
  },

  noTodos: function () {
    return Meteor.user().todos().count() === 0;
  },

  tasksEmptyMessage: function () {
    var user = Meteor.user();
    if(user.tasks().count() === 0) {
      return 'You don\'t have any tasks yet. Add some with the green plus button.';
    } else {
      return 'Sweet, looks like you\'re done with all your tasks for now. Add some more with the green plus button.';
    }
  },

  tasks: function () {
    var filter = Session.get('task-filter');
    switch(filter) {
      case 'completed':
        return Meteor.user().doneTasks();
      case 'trash':
        return Meteor.user().fetchRemovedTasks();
      case 'todo':
      default:
        return Meteor.user().fetchSortedTodos();
    }
  }
});
