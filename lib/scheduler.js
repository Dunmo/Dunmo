
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

  _resetDay: function () {
    self.taskTimeAssignedToday = {};
  },

  // options:
  //   algorithm, maxTaskInterval, maxTimePerTaskPerDay, taskBreakInterval
  generateTodoList: function(freetimes, todos, options) {
    var self = this;

    if(!self._init(options)) return [];

    var daylists = Daylists.createFromFreetimes(freetimes);
    console.log('daylists: ', daylists);

    var todoList = daylists.map(function(daylist) {
      console.log('daylist: ', daylist);
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

  _fillDaylist: function(daylist, todos) {
    var self = this;
    daylist  = R.cloneDeep(daylist);
    todos    = R.cloneDeep(todos);

    self._resetDay();

    daylist.todos = daylist.freetimes.map(function(freetime) {
      console.log('freetime: ', Freetimes.printable(freetime));
      if(todos.length > 0) {
        ret      = self._fillFreetime(freetime, todos);
        freetime = ret[0];
        todos    = ret[1];
        console.log('freetime.todos: ', freetime.todos);
        return freetime.todos;
      } else {
        return null;
      }
    });

    daylist.todos = _.compact(daylist.todos);
    daylist.todos = _.flatten(daylist.todos);
    console.log('daylist.todos: ', daylist.todos);

    return [ daylist, todos ];
  },

  _fillFreetime: function(freetime, todos) {
    var self = this;
    todos             = R.cloneDeep(todos);
    freetime          = R.cloneDeep(freetime);
    freetime.todos    = [];
    var totalFreetime = freetime.remaining();
    var remaining     = totalFreetime;

    while(remaining > 0 && todos.length > 0) {
      var todo, todoIndex;

      // Don't schedule the same task twice in a row
      if(_.last(freetime.todos) && todos[0]._id === _.last(freetime.todos)._id) {
        // get the next task
        if(todos.length > 1) {
          todoIndex = 1;
        } else if(self.taskBreakInterval > 0) { // take a break if there's no next task
          remaining -= self.taskBreakInterval;
          if(remaining < 0) remaining = 0;
          continue;
        } else { // if the break length is 0, schedule the task anyway
          todoIndex = 0;
        }
      } else {
        todoIndex = 0;
      }

      todo = R.cloneDeep(todos[todoIndex]);

      var todoStart = freetime.start + ( totalFreetime - remaining );

      // console.log('todo.remaining: ', todo.remaining);
      // console.log('remaining: ', remaining);
      // console.log('self.maxTaskInterval: ', self.maxTaskInterval);

      var maxLength = _.min(remaining, self.maxTaskInterval);
      // console.log('maxLength: ', maxLength);

      // Task is too big to fit
      if(todo.remaining > maxLength) {
        var ret          = todo.split(maxLength);
        todo             = ret[0];
        todos[todoIndex] = ret[1];
        remaining       -= maxLength;
      } else {
        _.pullAt(todos, todoIndex);
        remaining -= todo.remaining;
      }

      if(Number(todo.dueAt) < (freetime.start + (totalFreetime - remaining))) {
        todo.isOverdue = true;
      }

      todo.start = new Date(todoStart);
      todo.end = new Date(todoStart + todo.remaining);

      freetime.todos.push(todo);
    }

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
