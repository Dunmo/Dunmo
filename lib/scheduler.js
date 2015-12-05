
Scheduler = {

  _init: function (options) {
    var self = this;

    var defaults = {
      algorithm:            'greedy',
      granularity:          Tasks.GRANULARITY,
      maxTaskInterval:      24*HOURS,
      maxTimePerTaskPerDay: 24*HOURS,
      taskBreakInterval:    0
    };

    options = _.merge(defaults, options);

    _.forOwn(options, function (value, key) {
      self[key] = value;
    });

    if(self.algorithm !== 'greedy') {
      console.error('Scheduler.generateTodoList() currently accepts only the "greedy" algorithm');
      return false;
    }

    return true;
  },

  _granularizeTask: function (task) {
    var self = this;
    var remaining   = task.remaining;
    var granularity = self.granularity;
    remaining       = Math.round(remaining / granularity) * granularity;
    task.remaining  = remaining;
    return task;
  },

  _granularizeFreetime: function (freetime) {
    var self = this;
    freetime = _.cloneDeep(freetime);
    console.log('freetime: ', freetime);
    var start       = freetime.start;
    var end         = freetime.end;
    var granularity = self.granularity;

    start          = Math.ceil(start / granularity) * granularity;
    freetime.start = start;

    end          = Math.floor(end / granularity) * granularity;
    freetime.end = end;

    console.log('freetime: ', freetime);
    return freetime;
  },

  _normalizeTasks: function (tasks) {
    var self = this;
    var granularizedTasks = tasks.map(self._granularizeTask, self);
    return granularizedTasks;
  },

  _normalizeFreetime: function (freetime) {
    var self = this;
    freetime = _.cloneDeep(freetime);
    freetime = self._granularizeFreetime(freetime)
    return freetime;
  },

  // options:
  //   algorithm, granularity, maxTaskInterval, maxTimePerTaskPerDay, taskBreakInterval
  generateTodoList: function (freetimes, todos, options) {
    var self = this;

    if(!self._init(options)) return [];

    var daylists = Daylists.createFromFreetimes(freetimes);

    todos = self._normalizeTasks(todos);

    var todoList = daylists.map(function (daylist) {
      if(todos.length > 0) {
        ret     = self._fillDaylist(daylist, todos);
        daylist = ret[0];
        todos   = ret[1];
        return daylist.todos;
      } else {
        return null;
      }
    });

    todoList = _.compact(todoList);
    todoList = _.flatten(todoList);

    var overdue = todos.map(function (todo) {
      todo.willBeOverdue = true;
      return todo;
    });

    todoList = todoList.concat(overdue);

    return todoList;
  },

  _fillDaylist: function (daylist, todos) {
    var self = this;
    daylist  = _.cloneDeep(daylist);
    todos    = _.cloneDeep(todos);

    self.taskTimeToday = {};

    daylist.todos = daylist.freetimes.map(function (freetime) {
      if(todos.length > 0) {
        ret      = self._fillFreetime(freetime, todos);
        freetime = ret[0];
        todos    = ret[1];
        return freetime.todos;
      } else {
        return null;
      }
    });

    daylist.todos = _.compact(daylist.todos);
    daylist.todos = _.flatten(daylist.todos);

    return [ daylist, todos ];
  },

  timeLeftToday: function (todoId) {
    var timeToday = this.taskTimeToday[todoId];
    if(!timeToday) timeToday = 0;
    return this.maxTimePerTaskPerDay - timeToday;
  },

  addTimeToday: function (todoId, time) {
    var timeToday = this.taskTimeToday[todoId];
    if(!timeToday) timeToday = 0;
    timeToday += time;
    this.taskTimeToday[todoId] = timeToday;
  },

  _rejectMaxedTodos: function (todos, maxedTodos) {
    var self = this;
    todos = _.reject(todos, function (todo) {
      var isNoTimeLeftToday = (self.timeLeftToday(todo._id) <= 0);
      if(isNoTimeLeftToday) maxedTodos.push(todo);
      return isNoTimeLeftToday;
    });
    return [todos, maxedTodos];
  },

  _rejectSnoozedTodos: function (todos, snoozedTodos, todoStart) {
    var self = this;
    todos = _.reject(todos, function (todo) {
      var isSnoozed = todo.snoozedUntil > todoStart;
      if(isSnoozed) snoozedTodos.push(todo);
      return isSnoozed;
    });
    return [todos, snoozedTodos];
  },

  _fillFreetime: function (freetime, todos) {
    var self = this;
    todos             = _.cloneDeep(todos);
    freetime          = _.cloneDeep(freetime);
    freetime          = self._normalizeFreetime(freetime);
    freetime.todos    = [];
    var totalFreetime = freetime.remaining({ granularity: this.granularity });
    var remaining     = totalFreetime;
    var maxedTodos    = [];
    var snoozedTodos  = [];

    while(remaining > 0 && todos.length > 0) {
      var todo, todoIndex, todoStart;

      todoStart = freetime.start + ( totalFreetime - remaining );

      // Filter out maxedTodos
      var ret    = self._rejectMaxedTodos(todos, maxedTodos);
      todos      = ret[0];
      maxedTodos = ret[1];
      if(todos.length == 0) break;

      // Filter out snoozedTodos
      var ret      = self._rejectSnoozedTodos(todos, snoozedTodos, todoStart);
      todos        = ret[0];
      snoozedTodos = ret[1];
      if(todos.length == 0) break;

      // Don't schedule the same task twice in a row
      // Don't schedule a task until its dependencies are complete
      var lastTodo = _.last(freetime.todos);
      todoIndex = -1;
      todo = _.find(todos, function (todo) {
        todoIndex++;
        var sameAsLast  = (lastTodo && todo._id === lastTodo._id);
        var isDependent = todos.some(function (t) { return todo.dependsOn(t); });
        return !sameAsLast && !isDependent;
      });
      todo = _.cloneDeep(todo);

      // take a break if there's no next task
      if(!todo && self.taskBreakInterval > 0) {
        remaining -= self.taskBreakInterval;
        if(remaining < 0) remaining = 0;
        todoStart = freetime.start + ( totalFreetime - remaining );

        todoIndex = -1;
        todo = _.find(todos, function (todo) {
          todoIndex++;
          return !todos.some(function (t) { return todo.dependsOn(t); });;
        });
        todo = _.cloneDeep(todo);
      } else if(!todo) {
        console.log('impossible conditions, but I\'ll try my best');
        todo = _.cloneDeep(todos[0]);
        todoIndex = 0;
      }

      var maxLength = _.min([remaining, self.maxTaskInterval, self.timeLeftToday(todo._id)]);

      // Task is too big to fit
      if(todo.remaining > maxLength) {
        var ret          = todo.split(maxLength);
        todo             = ret[0];
        todos[todoIndex] = ret[1];
        remaining       -= maxLength;
        self.addTimeToday(todo._id, maxLength);
      } else {
        _.pullAt(todos, todoIndex);
        remaining -= todo.remaining;
        self.addTimeToday(todo._id, todo.remaining);
      }

      todo.start = new Date(todoStart);
      todo.end = new Date(todoStart + todo.remaining);

      if(Number(todo.dueAt) < todo.end) {
        todo.willBeOverdue = true;
      }

      freetime.todos.push(todo);

      todos = todos.concat(snoozedTodos);
      todos = Tasks.advancedSort(todos);
    }

    todos = todos.concat(maxedTodos);
    todos = Tasks.advancedSort(todos);

    while(todos.length > 0) {
      var todo = _.cloneDeep(todos[0]);
      if(Number(todo.dueAt) > freetime.end) break;
      todo.willBeOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
    }

    return [ freetime, todos ];
  }

};
