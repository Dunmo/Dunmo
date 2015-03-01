
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

  'tasks': function () {
    // this.syncReminders();
    return Tasks.find({ ownerId: this._id });
  },

  'sortedTasks': function () {
    var tasks = this.tasks();

    tasks = _.sortBy(tasks, 'timeRemaining');
    tasks = _.sortBy(tasks, 'importance');
    tasks = _.sortBy(tasks, 'dueAt');

    return tasks;
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

  todoList: function(todoCursor, freetimeCursor) {
    todos = todoCursor.fetch();
    todos = todos.map(function(doc) {
      doc = fieldsToDuration(doc);
      return doc;
    });
    todos = basicSort(todos);

    freetimes = freetimeCursor.fetch();
    freetimes = freetimes.map(function(doc) {
      doc = fieldsToDuration(doc);
      return doc;
    });
    freetimes = this._padDays(freetimes);

    console.log('freetimes: ', freetimes);

    var user = this;

    todoList = user._generateTodoList(freetimes, todos, 'greedy');

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
        return freetime;
      } else {
        return null;
      }
    });

    return lodash.compact(todoList);
  },

  // a private helper function for todoList
  _generateDayList: function(freetime, todos) {
    var user      = this;
    var dayList   = R.cloneDeep(freetime);
    var remaining = R.cloneDeep(freetime.duration);
    dayList.todos = [];

    while(remaining > 0 && todos.length > 0) { // TODO: remaining.toTaskInterval() > 0 ?
      var ret   = R.cloneDeep(user._appendTodo(dayList, todos, remaining));
      dayList   = R.cloneDeep(ret[0]);
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

    // TODO: what about overdue items on the first day?
    // TODO: todo.timeRemaining.toTaskInterval() > remaining.toTaskInterval() ?
    if((todo.timeRemaining > remaining) && (todo.dueAt >= (new Date()))) {
      var ret   = R.cloneDeep(todo.split(remaining));
      todo      = R.cloneDeep(ret[0]);
      todos[0]  = R.cloneDeep(ret[1]);
      remaining = 0;
    } else {
      todos.shift();
      remaining = remaining - todo.timeRemaining;
    }

    if(todo.dueAt < Date.now()) todo.isOverdue = true;

    dayList.todos.push(todo);

    return [ dayList, todos, remaining ];
  },

  _appendOverdue: function(freetime, todos) {
    var todo = R.cloneDeep(todos[0]);

    while(todo && (todo.dueAt <= freetime.end())) {
      todo.isOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
      todo = todos[0];
    }

    return [ freetime, todos ]
  }

});


