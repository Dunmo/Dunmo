
let View = Template.tasks;

View.helpers({

  isTodosView () { Session.get('task-filter') === 'todo' },
  noTodos     () { Meteor.user().todos().count() === 0   },

  tasksEmptyMessage () {
    const user = Meteor.user();
    if(user.tasks().count() === 0) {
      return 'You don\'t have any tasks yet. Add some with the green plus button.';
    } else {
      return 'Sweet, looks like you\'re done with all your tasks for now. Add some more with the green plus button.';
    }
  },

  tasks () {
    let filterCursorMap = {
      completed: Meteor.user().doneTasks(),
      trash:     Meteor.user().fetchRemovedTasks(),
      todo:      Meteor.user().fetchSortedTodos(),
      undefined: Meteor.user().fetchSortedTodos(),
    }
    const  filter = Session.get('task-filter');
    let    cursor = filterCursorMap[filter];
    return cursor
  },

});
