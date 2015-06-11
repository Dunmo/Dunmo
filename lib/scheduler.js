
Scheduler = {

  _init: function (options) {
    var self = this;

    var defaults = {
      algorithm:            'greedy',
      maxTaskInterval:      24*HOURS,
      maxTimePerTaskPerDay: 24*HOURS,
      taskBreakInterval:    0
    };

    options = _.merge(defaults, options);

    _.forOwn(options, function (value, key) {
      self[key] = value;
    });

    if(self.algorithm !== 'greedy') {
      console.warn('Scheduler.generateTodoList() currently accepts only the "greedy" algorithm');
      return false;
    }

    return true;
  },

  // options:
  //   algorithm, maxTaskInterval, maxTimePerTaskPerDay, taskBreakInterval
  generateTodoList: function (freetimes, todos, options) {
    var self = this;

    if(!self._init(options)) return [];

    var daylists = Daylists.createFromFreetimes(freetimes);

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
      todo.isOverdue = true;
      return todo;
    });

    todoList = todoList.concat(overdue);

    return todoList;
  },

  _fillDaylist: function (daylist, todos) {
    var self = this;
    daylist  = R.cloneDeep(daylist);
    todos    = R.cloneDeep(todos);

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

  _fillFreetime: function (freetime, todos) {
    var self = this;
    todos             = R.cloneDeep(todos);
    freetime          = R.cloneDeep(freetime);
    freetime.todos    = [];
    var totalFreetime = freetime.remaining();
    var remaining     = totalFreetime;
    var maxedTodos    = [];

    while(remaining > 0 && todos.length > 0) {
      var todo, todoIndex, todoStart;

      todoStart = freetime.start + ( totalFreetime - remaining );

      // Filter out maxedTodos
      todos = _.reject(todos, function (todo) {
        var isNoTimeLeftToday = (self.timeLeftToday(todo._id) <= 0);
        if(isNoTimeLeftToday) maxedTodos.push(todo);
        return isNoTimeLeftToday;
      });
      if(todos.length == 0) break;

      var snoozedTodos = [];
      // Filter out snoozedTodos
      todos = _.reject(todos, function (todo) {
        var isSnoozed = todo.snoozedUntil > todoStart;
        if(isSnoozed) snoozedTodos.push(todo);
        return isSnoozed;
      });
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
      todo = R.cloneDeep(todo);

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
        todo = R.cloneDeep(todo);
      } else if(!todo) {
        console.log('impossible conditions, making due');
        todo = R.cloneDeep(todos[0]);
        todoIndex = 0;
      }

      var maxLength = _.min(remaining, self.maxTaskInterval, self.timeLeftToday(todo._id));

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
        todo.isOverdue = true;
      }

      freetime.todos.push(todo);

      todos = todos.concat(snoozedTodos);
      todos = Tasks.advancedSort(todos);
    }

    todos = todos.concat(maxedTodos);
    todos = Tasks.advancedSort(todos);

    while(todos.length > 0) {
      var todo = R.cloneDeep(todos[0]);
      if(Number(todo.dueAt) > freetime.end) break;
      todo.isOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
    }

    return [ freetime, todos ];
  }

};
