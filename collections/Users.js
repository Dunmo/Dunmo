
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

var helpers = {
  update: function (data) {
    if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) )
      data = { $set: data };

    return Meteor.users.update(this._id, data);
  },

  primaryEmailAddress: function () {
    return this.emails[0] && this.emails[0].address;
  },

  settings: function () {
    var settings = UserSettings.findOne({ userId: this._id });
    if(!settings) {
      settings = UserSettings.create({ userId: this._id });
      settings = UserSettings.findOne(settings);
    }
    return settings;
  },

  startOfDay: function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseTime(str);
      return settings.update({ startOfDay: time });
    }
    return settings.startOfDay;
  },

  endOfDay: function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseTime(str);
      return settings.update({ endOfDay: time });
    }
    return settings.endOfDay;
  },

  maxTaskInterval: function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseDuration(str);
      return settings.update({ maxTaskInterval: time });
    }
    return settings.maxTaskInterval;
  },

  maxTimePerTaskPerDay: function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseDuration(str);
      return settings.update({ maxTimePerTaskPerDay: time });
    }
    return settings.maxTimePerTaskPerDay;
  },

  taskCalendarId: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ taskCalendarId: str });
    else    return settings.taskCalendarId;
  },

  appleCredentials: function () {
    return AppleCredentials.findOne(this.appleCredentialsId);
  },

  setAppleCredentials: function (data) {
    var cred = this.appleCredentials();

    if(!cred) {
      var id = AppleCredentials.insert(data);
      this.update({ appleCredentialsId: id });
    } else {
      cred.update(data);
    }
  },

  loginWithApple: function (user, pass) {
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

  syncReminders: function () {
    var cred = this.appleCredentials();
    cred.syncReminders();
  },

  tasks: function () {
    // this.syncReminders();
    var r = new RegExp('true');
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: r } });
  },

  sortedTasks: function () {
    var tasks = this.tasks().fetch();
    tasks     = Tasks.basicSort(tasks);
    return tasks;
  },

  todos: function () {
    var r = new RegExp('true');
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: r }, isDone: { $not: r } });
  },

  sortedTodos: function () {
    var todos = this.todos().fetch();
    todos     = Tasks.basicSort(todos);
    return todos;
  },

  freetimes: function () {
    return Freetimes.find({ ownerId: this._id });
  },

  calendars: function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid });
  },

  activeCalendars: function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid, active: true });
  },

  calendarIdObjects: function () {
    var calendars = this.activeCalendars();
    var idObjects = calendars.map(function(calendar) {
      return { id: calendar.googleCalendarId };
    });
    return idObjects;
  },

  latestTodoTime: function () {
    var latestTodo = lodash.max(this.todos().fetch(), 'dueAt');
    var maxTime    = latestTodo.dueAt;
    return maxTime;
  },

  todoList: function(freetimes) {
    todos = this.sortedTodos();
    todos = this._splitTasksByMaxTaskInterval(todos);
    freetimes = freetimes || this.freetimes || this.freetimes();
    todoList = this._generateTodoList(freetimes, todos, 'greedy');
    return todoList;
  },

  // a private helper function for todoList
  _splitTasksByMaxTaskInterval: function (tasks) {
    var maxTaskInterval = this.maxTaskInterval();
    if(!maxTaskInterval) return tasks;
    var tasks           = R.cloneDeep(tasks);
    var splitTasks      = [];

    tasks.forEach(function (task) {
      while(task.remaining > maxTaskInterval) {
        var ret = task.split(maxTaskInterval);
        splitTasks.push(ret[0])
        task    = ret[1];
      }
      splitTasks.push(task);
    });

    return splitTasks;
  },

  // a private helper function for todoList
  _generateTodoList: function(freetimes, todos, algorithm) {
    if(algorithm !== 'greedy') {
      return [];
    }

    var user          = this;
    var firstFreetime = freetimes[0];
    var freetimeStart = firstFreetime.start;
    var endOfDay      = user.endOfDay();
    var firstDay      = Date.startOfDay(freetimeStart);
    var newEnd        = firstDay + endOfDay;
    var taskTimeAssignedToday = {};

    var todoList = freetimes.map(function(freetime) {
      if(freetime.start > newEnd) {
        newEnd += 1 * DAY;
        taskTimeAssignedToday = {};
      }
      if(todos.length > 0) {
        var ret      = user._fillFreetime(freetime, todos, taskTimeAssignedToday);
        var freetime = ret[0];
        todos        = ret[1];
        taskTimeAssignedToday = ret[2];
        return freetime.todos;
      } else {
        return null;
      }
    });

    return lodash.flatten(lodash.compact(todoList));
  },

  // a private helper function for todoList
  _fillFreetime: function(freetime, todos, taskTimeAssignedToday) {
    var user       = this;
    var freetime   = R.cloneDeep(freetime);
    var remaining  = freetime.remaining();
    freetime.todos = [];

    while(remaining > 0 && todos.length > 0) {
      var ret   = user._appendTodo(freetime, todos, remaining, taskTimeAssignedToday);
      freetime  = ret[0];
      todos     = ret[1];
      remaining = ret[2];
      taskTimeAssignedToday = ret[3];
    }

    if(todos.length > 0) {
      var ret  = this._appendOverdue(freetime, todos);
      freetime = ret[0];
      todos    = ret[1];
    }

    return R.cloneDeep([ freetime, todos, taskTimeAssignedToday ]);
  },

  // a private helper function for todoList
  _appendTodo: function(freetime, todos, remaining, taskTimeAssignedToday) {
    var freetimeStart = freetime.start;
    var maxTime       = user.maxTimePerTaskPerDay();
    var lastTodo      = lodash.last(freetime.todos);
    var todo;
    if(lastTodo) {
      var valid = function (todo) {
        if(!taskTimeAssignedToday[todo._id]) taskTimeAssignedToday[todo._id] = 0;
        return (
          todo._id != lastTodo._id &&
          taskTimeAssignedToday[todo._id] < maxTime
        );
      };
      todo = lodash.find(todos, valid) || todos[0];
    }
    todo = todo || todos[0];
    todo = R.cloneDeep(todo);

    var todoStart = freetime.start + ( freetime.remaining() - remaining );
    if(!taskTimeAssignedToday[todo._id]) taskTimeAssignedToday[todo._id] = 0;
    var taskTimeLeftToday = maxTime - taskTimeAssignedToday[todo._id];
    var rem = taskTimeLeftToday < remaining ? taskTimeLeftToday : remaining;

    if( (todo.remaining > rem) && (todo.dueAt >= freetimeStart) ) {
      var ret    = todo.split(rem);
      todo       = ret[0];
      todos[0]   = ret[1];
      remaining -= rem;
    } else {
      todos.shift();
      remaining = rem - todo.remaining;
    }

    if(todo.dueAt < freetimeStart) todo.isOverdue = true;

    todo.start = new Date(todoStart);
    todo.end   = new Date(todoStart + todo.remaining);

    taskTimeAssignedToday[todo._id] += todo.remaining;

    freetime.todos.push(todo);

    return R.cloneDeep([ freetime, todos, remaining, taskTimeAssignedToday ]);
  },

  _appendOverdue: function(freetime, todos) {
    var todo = R.cloneDeep(todos[0]);

    while( todo && (todo.dueAt <= freetime.end) ) {
      todo.isOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
      todo = todos[0];
    }

    return R.cloneDeep([ freetime, todos ]);
  }

};

Meteor.users.helpers(helpers);

if(CONFIG.testing) {
  // SETUP
  var user = helpers;
  user._id = '1337';
  user.maxTaskInterval      = function () { return 2 * HOURS; };
  user.maxTimePerTaskPerDay = function () { return 4 * HOURS; };

  Tasks.create('task 1 due by saturday at midnight for 8 hours very important', { ownerId: '1337' });
  Tasks.create('task 2 due by sunday at midnight for 8 hours very important', { ownerId: '1337' });

  var freetimes = [
    { start: 'thursday at 8am ', end: 'thursday at 1pm ' },
    { start: 'thursday at 2pm ', end: 'thursday at 3pm ' },
    { start: 'thursday at 8pm ', end: 'thursday at 10pm' },
    { start: 'friday   at 8am ', end: 'friday   at 11am' },
    { start: 'friday   at 2pm ', end: 'friday   at 10pm' }
  ];

  freetimes = freetimes.map(function (obj) {
    obj.start = Number(Date.create(obj.start));
    obj.end   = Number(Date.create(obj.end));
    return Freetimes.create(obj);
  });

  // COMPUTATION
  var taskEvents = user.todoList(freetimes);
  // console.log('taskEvents: ', taskEvents);

  // EVALUATION
  taskEvents.forEach(function (ev) {
    var obj = {
      title: ev.title,
      start: ev.start,
      end:   ev.end
    }
    console.log(obj);
  });

  if(taskEvents.any(function(t){return (Number(t.end)-Number(t.start))>2*HOURS}))
    console.log('failed, task lasts longer than 2 hours');

  // TEARDOWN
  freetimes.forEach(function (freetime) {
    Freetimes.remove(freetime._id);
  });

  user.tasks().forEach(function (task) {
    Tasks.remove(task._id);
  });
}
