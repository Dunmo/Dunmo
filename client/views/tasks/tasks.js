
let View = Template.tasks;

View.onCreated(function () {
  this.autorun( () => {
    // TODO: using filter without flash of empty state
    // const filter = Session.get('task-filter') || 'todo';
    this.subscribe('myTasks');
  });
});

View.helpers({

  isTodosView () { return Session.get('task-filter') === 'todo' },
  noTodos     () { return Meteor.user().todos().count() === 0   },

  tasksEmptyMessage () {
    const user = Meteor.user();
    if(user.tasks().count() === 0) {
      return 'You don\'t have any tasks yet. Add some with the green plus button.';
    } else {
      return 'Sweet, looks like you\'re done with all your tasks for now. Add some more with the green plus button.';
    }
  },

  tasks () {
    const filterQueryMap = {
      completed: 'doneTasks',
      trash:     'fetchRemovedTasks',
      todo:      'fetchSortedTodos',
      undefined: 'fetchSortedTodos',
    };
    const filter = Session.get('task-filter');
    const query  = filterQueryMap[filter];
    const user   = Meteor.user();
    const cursor = user[query]();
    return cursor;
  },

});
