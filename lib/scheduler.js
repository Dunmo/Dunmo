
Scheduler = {

  generateTodoList: function(freetimes, todos, algorithm) {
    if(algorithm !== 'greedy') {
      return [];
    }

    var user = this;

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
  },

  // a private helper function for generateTodoList
  _generateDayList: function(freetime, todos) {
    console.log('generating dayList');
    var user      = this;
    var dayList   = R.cloneDeep(freetime);
    var remaining = freetime.timeRemaining();
    dayList.todos = [];
    console.log('remaining: ', remaining);
    console.log('todos: ', todos);
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
    console.log('[ dayList, todos ]: ', [ dayList, todos ]);
    return [ dayList, todos ];
  },

  // a private helper function for _generateDayList
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

  // a private helper function for _appendTodo
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

};
