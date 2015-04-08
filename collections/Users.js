
/*
 * User
 * =========
 * appleCredentialsId          : String
 * emails                      : [{ address : String, verified : Boolean }]
 * profile.name                : String
 * services.google.id          : String
 * services.google.accessToken : String
 * taskCalendarId              : String
 *
 * Meteor.logoutOtherClients
 *
 */

Meteor.users.helpers({
  update: function (data) {
    if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) )
      data = { $set: data };

    return Meteor.users.update(this._id, data);
  },

  'primaryEmailAddress': function () {
    return this.emails[0] && this.emails[0].address;
  },

  'settings': function () {
    var settings = UserSettings.findOne({ userId: this._id });
    if(!settings) {
      settings = UserSettings.create({ userId: this._id });
      settings = UserSettings.findOne(settings);
    }
    return settings;
  },

  'startOfDay': function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseTime(str);
      return settings.update({ startOfDay: time });
    }
    return settings.startOfDay;
  },

  'endOfDay': function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseTime(str);
      return settings.update({ endOfDay: time });
    }
    return settings.endOfDay;
  },

  'appleCredentials': function () {
    return AppleCredentials.findOne(this.appleCredentialsId);
  },

  'setAppleCredentials': function (data) {
    var cred = this.appleCredentials();

    if(!cred) {
      var id = AppleCredentials.insert(data);
      this.update({ appleCredentialsId: id });
    } else {
      cred.update(data);
    }
  },

  'loginWithApple': function (user, pass) {
    var cred = this.appleCredentials();
    if( !cred && !(user && pass) ) {
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

  // 'taskCalendar': function () {
  //   var calId = this.taskCalendarId;
  //   gapi.getTaskCalendar(calId, function () {

  //   });
  //   var cal = Calendars.findOne({ ownerId: this._id, summary: name });
  //   return cal;
  // },

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

  'latestTodoTime': function () {
    var latestTodo = lodash.max(this.todos().fetch(), 'dueAt');
    var maxTime = latestTodo.dueAt;
    return maxTime;
  },

  todoList: function(freetimes) {
    todos = this.sortedTodos();
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

    var todoStart = Number(dayList.start) + ( dayList.timeRemaining() - remaining );

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

    todo.start = new Date(todoStart);
    todo.end = new Date(todoStart + todo.remaining);

    dayList.todos.push(todo);

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


