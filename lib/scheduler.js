
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
      var todo, todoIndex;

      // Filter out maxedTodos
      todos = todos.filter(function (todo) {
        if(self.timeLeftToday(todo._id) === 0) maxedTodos.push(todo);
        return self.timeLeftToday(todo._id) > 0;
      });
      if(todos.length == 0) break;

      // Don't schedule the same task twice in a row
      if(_.last(freetime.todos) && todos[0]._id === _.last(freetime.todos)._id) {
        // get the next task
        if(todos.length > 1) {
          todoIndex = 1;
        } else if(self.taskBreakInterval > 0) { // take a break if there's no next task
          remaining -= self.taskBreakInterval;
          if(remaining < 0) remaining = 0;
          todoIndex = 0;
        } else { // if the break length is 0, schedule the task anyway
          todoIndex = 0;
        }
      } else {
        todoIndex = 0;
      }

      todo = R.cloneDeep(todos[todoIndex]);

      var todoStart = freetime.start + ( totalFreetime - remaining );

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

      if(Number(todo.dueAt) < (freetime.start + (totalFreetime - remaining))) {
        todo.isOverdue = true;
      }

      todo.start = new Date(todoStart);
      todo.end = new Date(todoStart + todo.remaining);

      freetime.todos.push(todo);
    }

    todos = todos.concat(maxedTodos);

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
