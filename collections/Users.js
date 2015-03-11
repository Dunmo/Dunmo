
/*
 * User
 * =========
 * appleCredentialsId          : String
 * emails                      : [{ address : String, verified : Boolean }]
 * profile.name                : String
 * services.google.id          : String
 * services.google.accessToken : String
 *
 * Meteor.logoutOtherClients
 *
 */

Meteor.users.helpers({
  'update': function (data) {
    return Meteor.users.update(this._id, { $set: data });
  },

  'appleCredentials': function () {
    console.log('this.appleCredentialsId: ', this.appleCredentialsId);
    return AppleCredentials.findOne(this.appleCredentialsId);
  },

  'setAppleCredentials': function (data) {
    var cred = this.appleCredentials();

    console.log('cred: ', cred);

    if(!cred) {
      console.log('creating new apple credentials');
      var id = AppleCredentials.insert(data);
      this.update({ appleCredentialsId: id });
    } else {
      console.log('updating apple credentials');
      cred.update(data);
    }
  },

  'loginWithApple': function (user, pass) {
    var cred = this.appleCredentials();
    if( !cred && !(user && pass) ) {
      console.log('Error: no Apple credentials provided.');
      return;
    } else if( !cred ) {
      AppleCredentials.insert({
        appleId:  user,
        password: pass
      });
    } else if( user && pass ) {
      cred.update({
        appleId:  user,
        password: pass
      });
    } else {
      cred.validate();
    }
  },

  'syncReminders': function () {
    var cred = this.appleCredentials();
    cred.syncReminders();
  },

  'taskCalendar': function () {
    var name = 'Dunmo Tasks';
    var cal = Calendars.findOne({ ownerId: this._id, summary: name });
    return cal;
  },

  'tasks': function () {
    // this.syncReminders();
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: true } });
  },

  'sortedTasks': function () {
    var tasks = this.tasks().fetch();
    tasks = Tasks.basicSort(tasks);
    return tasks;
  },

  'todos': function () {
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: true }, isDone: { $not: true } });
  },

  'sortedTodos': function () {
    var todos = this.todos().fetch();
    todos = Tasks.basicSort(todos);
    return todos;
  },

  'freetimes': function () {
    return Freetimes.find({ ownerId: this._id });
  },

  'calendars': function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid });
  },

  'activeCalendars': function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid, active: true });
  },

  'calendarIdObjects': function () {
    var calendars = this.activeCalendars();
    var idObjects = calendars.map(function(calendar) {
      return { id: calendar.googleCalendarId };
    });
    return idObjects;
  },

  'latestTaskTime': function () {
    var latestTask = lodash.max(this.tasks().fetch(), 'dueAt');
    console.log('latestTask: ', latestTask);
    var maxTime = latestTask.dueAt;
    return maxTime;
  },

  todoList: function(freetimes) {
    todos = this.sortedTodos();
    console.log('todos: ', todos);
    freetimes = freetimes || this.freetimes || this.freetimes();
    todoList = this._generateTodoList(freetimes, todos, 'greedy');
    return todoList;
  },

  // a private helper function for todoList
  _generateTodoList: function(freetimes, todos, algorithm) {
    if(algorithm !== 'greedy') {
      return [];
    }

    var user = this;

    var todoList  = lodash.map(freetimes, function(freetime) {
      if(todos.length > 0) {
        var ret     = user._generateDayList(freetime, todos);
        var freetime = ret[0];
        todos       = ret[1];
        return freetime.todos;
      } else {
        return null;
      }
    });

    return lodash.flatten(lodash.compact(todoList));
  },

  // a private helper function for todoList
  _generateDayList: function(freetime, todos) {
    var user      = this;
    var dayList   = R.cloneDeep(freetime);
    var remaining = freetime.timeRemaining();
    dayList.todos = [];

    while(remaining > 0 && todos.length > 0) { // TODO: remaining.toTaskInterval() > 0 ?
      var ret   = user._appendTodo(dayList, todos, remaining);
      console.log('ret[0]: ', ret[0]);
      dayList   = R.cloneDeep(ret[0]);
      console.log('dayList.todos: ', dayList.todos);
      todos     = R.cloneDeep(ret[1]);
      remaining = R.cloneDeep(ret[2]);
    }

    if(todos.length > 0) {
      var ret = this._appendOverdue(dayList, todos);
      dayList = ret[0];
      todos   = ret[1];
    }

    return [ dayList, todos ];
  },

  // a private helper function for todoList
  _appendTodo: function(dayList, todos, remaining) {
    var todo = R.cloneDeep(todos[0]);

    console.log('dayList.start: ', dayList.start);
    console.log('dayList.end: ', dayList.end);
    console.log('remaining: ', remaining);
    var todoStart = Number(dayList.start) + ( dayList.timeRemaining() - remaining );

    // TODO: This is a hack. todo.remaining should be a number of milliseconds, not a duration object
    if( typeof(todo.remaining) !== 'number' ) todo.remaining = todo.remaining._milliseconds;

    // TODO: what about overdue items?
    if((todo.remaining > remaining) && (todo.dueAt >= (new Date()))) {
      var ret   = R.cloneDeep(todo.split(remaining));
      todo      = R.cloneDeep(ret[0]);
      todos[0]  = R.cloneDeep(ret[1]);
      remaining = 0;
    } else {
      todos.shift();
      remaining = remaining - todo.remaining;
    }

    if(todo.dueAt < Date.now()) todo.isOverdue = true;

    console.log('todoStart: ', todoStart);
    console.log('todo.remaining: ', todo.remaining);

    todo.start = new Date(todoStart);
    todo.end = new Date(todoStart + todo.remaining);

    console.log('todo.start: ', todo.start);
    console.log('todo.end: ', todo.end);

    dayList.todos.push(todo);

    console.log('dayList: ', dayList);

    return [ dayList, todos, remaining ];
  },

  _appendOverdue: function(freetime, todos) {
    var todo = R.cloneDeep(todos[0]);

    while( todo && (todo.dueAt <= freetime.end) ) {
      todo.isOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
      todo = todos[0];
    }

    return [ freetime, todos ]
  }

});


