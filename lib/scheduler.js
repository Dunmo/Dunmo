
Scheduler = {

  generateTodoList: function(freetimes, todos, algorithm) {
    var freetime, ret, todoList
    if(algorithm !== 'greedy') {
      console.warn('Scheduler.generateTodoList() currently accepts only the "greedy" algorithm');
      return [];
    }

    todoList = lodash.map(freetimes, function(freetime) {
      if(todos.length > 0) {
        ret      = this._fillFreetime(freetime, todos);
        freetime = ret[0];
        todos    = ret[1];
        return freetime.todos;
      } else {
        return null;
      }
    });

    return lodash.flatten(lodash.compact(todoList));
  },

  _fillFreetime: function(freetime, todos) {
    freetime          = R.cloneDeep(freetime);
    freetime.todos    = [];
    var totalFreetime = freetime.timeRemaining();
    var remaining     = totalFreetime;
    var endDate       = new Date(freetime.end);

    while(remaining > 0 && todos.length > 0) {
      var todo      = R.cloneDeep(todos[0]);
      var todoStart = freetime.start + ( totalFreetime - remaining );

      // TODO: use lodash.min(remaining, maxTaskDuration)
      // Task is too big to fit
      if(todo.remaining > remaining) {
        var ret   = todo.split(remaining));
        todo      = ret[0];
        todos[0]  = ret[1];
        remaining = 0;
      } else {
        todos.shift();
        remaining = remaining - todo.remaining;
      }

      if(todo.dueAt < new Date(freetime.start + (totalFreetime - remaining))) {
        todo.isOverdue = true;
      }

      todo.start = new Date(todoStart);
      todo.end = new Date(todoStart + todo.remaining);

      freetime.todos.push(todo);
    }

    while(todos.length > 0) {
      var todo = R.cloneDeep(todos[0]);
      if(todo.dueAt > freetime.end) break;
      todo.isOverdue = true;
      freetime.todos.push(todo);
      todos.shift();
    }

    return [ freetime, todos ];
  },

  // _fillDaylist: function(daylist, todos) {
  //   daylist       = R.cloneDeep(daylist);
  //   daylist.todos = [];
  //   var remaining = daylist.timeRemaining();
  //   console.log('remaining: ', remaining);
  //   console.log('todos: ', todos);
  //   while(remaining > 0 && todos.length > 0) {
  //     var ret   = this._appendTodo(daylist, todos, remaining);
  //     daylist   = R.cloneDeep(ret[0]);
  //     todos     = R.cloneDeep(ret[1]);
  //     remaining = R.cloneDeep(ret[2]);
  //   }

  //   if(todos.length > 0) {
  //     var ret = this._appendOverdue(daylist, todos);
  //     daylist = ret[0];
  //     todos   = ret[1];
  //   }
  //   console.log('[ daylist, todos ]: ', [ daylist, todos ]);
  //   return [ daylist, todos ];
  // }

};
