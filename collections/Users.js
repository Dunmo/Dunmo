
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
    return this.services && this.services.google && this.services.google.email;
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

  taskBreakInterval: function (str) {
    var settings = this.settings();
    if(str) {
      var time = Date.parseDuration(str);
      return settings.update({ taskBreakInterval: time });
    }
    return settings.taskBreakInterval;
  },

  referred: function (bool) {
    var settings = this.settings();
    if(bool !== undefined && bool !== null) {
      return settings.update({ isReferred: bool });
    }
    return settings.isReferred;
  },

  addReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $addToSet: { referrals: str } });
    else    return null;
  },

  referrals: function () {
    var settings = this.settings();
    return settings.referrals;
  },

  removeReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $pull: { referrals: str } });
    else    return null;
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

  // a private helper function for todoList
  // _splitTasksByMaxTaskInterval: function (tasks) {
  //   var maxTaskInterval = this.maxTaskInterval();
  //   if(!maxTaskInterval) return tasks;
  //   var tasks           = R.cloneDeep(tasks);
  //   var splitTasks      = [];

  //   tasks.forEach(function (task) {
  //     while(task.remaining > maxTaskInterval) {
  //       var ret = task.split(maxTaskInterval);
  //       splitTasks.push(ret[0])
  //       task    = ret[1];
  //     }
  //     splitTasks.push(task);
  //   });

  //   return splitTasks;
  // },

  todoList: function(freetimes) {
    var todos, maxTimePerTaskPerDay, isByDay, todoList;

    todos = this.sortedTodos();

    freetimes = freetimes || this.freetimes();

    maxTimePerTaskPerDay = this.maxTimePerTaskPerDay();
    if(this.maxTimePerTaskPerDay() != 0) isByDay = true;

    if(isByDay) freetimes = this.freetimesByDay(freetimes);

    todoList = this._generateTodoList(freetimes, todos, 'greedy', isByDay);

    return todoList;
  },

  freetimesByDay: function(freetimes) {
    var end = this.endOfDay();
    var grouped = lodash.groupBy(freetimes, function (freetime) {
      return Number(Date.startOfDay(freetime.start)) + end;
    });
    return grouped;
  },

  // a private helper function for todoList
  _generateTodoList: function(freetimes, todos, algorithm, isByDay) {

    var user = this;

    if(!isByDay) {
      var todoList  = lodash.map(freetimes, function(freetime) {
        if(todos.length > 0) {
          var ret      = user._generateDayList(freetime, todos);
          var freetime = ret[0];
          todos        = ret[1];
          return freetime.todos;
        } else {
          return null;
        }
      });

      return lodash.flatten(lodash.compact(todoList));
    }
    else {
      var todoList       = [];
      var freetimesByDay = freetimes;
      var endsOfDays     = lodash.keys(freetimesByDay);
      var endOfFirstDay  = Number(endsOfDays[0]);
      var endOfDay       = user.endOfDay();
      var newEnd         = endOfFirstDay + endOfDay;
      var taskTimeAssignedToday = {};

      lodash.forOwn(freetimesByDay, function(freetimes, day) {
        todos.forEach(function (todo) {
          taskTimeAssignedToday[todo._id] = 0;
        });

        freetimes.forEach(function(freetime) {
          if(todos.length > 0) {
            var ret  = user._fillFreetime(freetime, todos, taskTimeAssignedToday);
            freetime = ret[0];
            todos    = ret[1];
            taskTimeAssignedToday = ret[2];
            todoList = todoList.concat(freetime.todos);
          } else {
            return null;
          }
        });
      });

      return lodash.flatten(lodash.compact(todoList));
    }
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
    var user                 = this;
    var freetimeStart        = freetime.start;
    var maxTaskInterval      = user.maxTaskInterval();
    var maxTimePerTaskPerDay = user.maxTimePerTaskPerDay();
    var lastTodo             = lodash.last(freetime.todos);
    var todo, todoIndex;

    // find a todo that's different from the most recent one on this freetime
    // and that we aren't already spending "maxTimePerTaskPerDay" on today
    if(lastTodo && taskTimeAssignedToday) {
      todo = lodash.find(todos, function (todo, index) {
        todoIndex     = index;
        var different = lastTodo ? todo._id != lastTodo._id : true;
        var timeLeft  = taskTimeAssignedToday[todo._id] < maxTimePerTaskPerDay;
        return different && timeLeft;
      });
    }
    else if(lastTodo) {
      todo = lodash.find(todos, function (todo, index) {
        todoIndex     = index;
        var different = lastTodo ? todo._id != lastTodo._id : true;
        return different;
      });
    }
    else if(taskTimeAssignedToday) {
      todo = lodash.find(todos, function (todo, index) {
        todoIndex    = index;
        var timeLeft = taskTimeAssignedToday[todo._id] < maxTimePerTaskPerDay;
        return timeLeft;
      });
    }
    else {
      todoIndex = 0;
      todo      = todos[0];
    }

    if(!todo && todos.length > 0) {
      var taskBreakInterval = user.taskBreakInterval();
      if(remaining > taskBreakInterval) {
        remaining -= taskBreakInterval;
      } else {
        remaining = 0;
        return R.cloneDeep([ freetime, todos, remaining, taskTimeAssignedToday ]);
      }

      if(taskTimeAssignedToday) {
        todo = lodash.find(todos, function (todo, index) {
          todoIndex    = index;
          var timeLeft = taskTimeAssignedToday[todo._id] < maxTimePerTaskPerDay;
          return timeLeft;
        });
      }
      else {
        todoIndex = 0;
        todo      = todos[0];
      }
    }
    else if(!todo) {
      remaining = 0;
      return R.cloneDeep([ freetime, todos, remaining, taskTimeAssignedToday ]);
    }

    todo = R.cloneDeep(todo);

    var todoStart = freetimeStart + ( freetime.remaining() - remaining );
    var taskTimeLeftToday = maxTimePerTaskPerDay - taskTimeAssignedToday[todo._id];
    var rem = lodash.min([taskTimeLeftToday, remaining, maxTaskInterval]);

    if( (todo.remaining > rem) && (todo.dueAt >= freetimeStart) ) {
      var ret          = todo.split(rem);
      todo             = ret[0];
      todos[todoIndex] = ret[1];
    } else {
      todos.splice(todoIndex, 1);
    }

    if(todo.dueAt < freetimeStart) todo.isOverdue = true;

    todo.start = new Date(todoStart);
    todo.end   = new Date(todoStart + todo.remaining);

    taskTimeAssignedToday[todo._id] += todo.remaining;
    remaining -= todo.remaining;

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

function propsToDates(obj) {
  obj = R.cloneDeep(obj);
  if( Array.isArray(obj) ) return obj.map(propsToDates);

  obj.start = new Date(obj.start);
  obj.end   = new Date(obj.end);

  return obj;
};

function tasksAreEqual(task1, task2) {
  return ['title', 'start', 'end', 'overdue'].all(function (prop) {
    return ( lodash.isEqual(task1[prop], task2[prop]) );
  });
};

if(CONFIG.testing) {
  // SETUP
  var user = helpers;
  user._id = '1337';
  user.maxTaskInterval      = function () { return 2 * HOURS; };
  user.maxTimePerTaskPerDay = function () { return 4 * HOURS; };
  user.taskBreakInterval    = function () { return 1 * HOURS; };
  var tasks = user.tasks().fetch();
  tasks.forEach(function (task) {
    Tasks.remove(task._id);
  });
  var tasks = user.tasks().fetch();

  Tasks.create('task 1 due by tuesday at midnight for 4 hours very important', { ownerId: '1337' });
  Tasks.create('task 2 due by wednesday at midnight for 4 hours very important', { ownerId: '1337' });

  var freetimes = [
    // { start: 'sunday   at 8am ', end: 'sunday   at 12pm ' },
    // { start: 'sunday   at 2pm ', end: 'sunday   at 6pm ' },
    // { start: 'sunday   at 8pm ', end: 'sunday   at 10pm' },
    { start: 'monday at 8am ', end: 'monday at 11am' },
    { start: 'monday at 2pm ', end: 'monday at 10pm' }
  ];

  freetimes = freetimes.map(function (obj) {
    obj.start = Number(Date.create(obj.start));
    obj.end   = Number(Date.create(obj.end));
    return Freetimes.create(obj);
  });

  // console.log('freetimes: ', freetimes);

  // COMPUTATION
  var taskEvents = user.todoList(freetimes);

  // EVALUATION
  taskEvents.forEach(function (ev) {
    var obj = {
      title:   ev.title,
      start:   ev.start,
      end:     ev.end,
      overdue: ev.overdue
    }
    console.log(obj);
  });

  if(taskEvents.any(function(t){return (Number(t.end)-Number(t.start))>2*HOURS})) {
    console.log('failed, task lasts longer than 2 hours');
  }

  var expected = [
    {
      title: 'task 1',
      start: Date.create('monday at 8am'),
      end:   Date.create('monday at 10am')
    },
    {
      title: 'task 2',
      start: Date.create('monday at 10am'),
      end:   Date.create('monday at 11am')
    },
    {
      title: 'task 1',
      start: Date.create('monday at 2pm'),
      end:   Date.create('monday at 4pm')
    },
    {
      title: 'task 2',
      start: Date.create('monday at 4pm'),
      end:   Date.create('monday at 6pm')
    },
    {
      title: 'task 2',
      start: Date.create('monday at 7pm'),
      end:   Date.create('monday at 8pm')
    }
  ];

  var currTask, currIndex;
  if(expected.any(function(et, i) {
    currTask  = taskEvents[i];
    currIndex = i;
    return !currTask || ( ! tasksAreEqual(et, currTask) );
  })) {
    console.log('FAILED. Expected\n', currTask, '\nto be\n', expected[currIndex]);
  }

  // TEARDOWN
  freetimes.forEach(function (freetime) {
    Freetimes.remove(freetime._id);
  });

  user.tasks().forEach(function (task) {
    Tasks.remove(task._id);
  });
}
