
Scheduler = {

  generateTodoList: function(freetimes, todos, options) {
    var freetime, ret, todoList
    var self = this;

    if(options.algorithm !== 'greedy') {
      console.warn('Scheduler.generateTodoList() currently accepts only the "greedy" algorithm');
      return [];
    }

    _.forOwn(options, function (value, key) {
      self[key] = value;
    });

    todoList = freetimes.map(function(freetime) {
      if(todos.length > 0) {
        ret      = self._fillFreetime(freetime, todos);
        freetime = ret[0];
        todos    = ret[1];
        return freetime.todos;
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

  _fillFreetime: function(freetime, todos) {
    var self = this;
    todos             = R.cloneDeep(todos);
    freetime          = R.cloneDeep(freetime);
    freetime.todos    = [];
    var totalFreetime = freetime.remaining();
    var remaining     = totalFreetime;

    while(remaining > 0 && todos.length > 0) {
      var todo      = R.cloneDeep(todos[0]);
      var todoStart = freetime.start + ( totalFreetime - remaining );

      // TODO: use _.min(remaining, maxTaskDuration)
      // Task is too big to fit
      if(todo.remaining > remaining) {
        var ret   = todo.split(remaining);
        todo      = ret[0];
        todos[0]  = ret[1];
        remaining = 0;
      } else {
        todos.shift();
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
  },

  _fillDaylist: function(daylist, todos) {
    var self = this;
    daylist  = R.cloneDeep(daylist);
    todos    = R.cloneDeep(todos);

    self._resetDay();

    daylist.todos = daylist.freetimes.map(function(freetime) {
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

  _resetDay: function () {
    self.taskTimeAssignedToday = {};
  }

};
