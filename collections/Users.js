
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

Meteor.users.helpers({

  setRemoved: collectionsDefault.setRemoved(function (bool) {
    this.settings()._setRemoved(bool);
  }),

  update: collectionsDefault.update(Meteor.users),

  primaryEmailAddress: function () {
    return this.services && this.services.google && this.services.google.email;
  },

  settings: function () {
    var settings = UserSettings.findOne({ userId: this._id });
    if(!settings) {
      var settingsId = UserSettings.create({ userId: this._id });
      settings       = UserSettings.findOne(settingsId);
    }
    return settings;
  },

  endOfDay: function (str) {
    var defaultEndOfDay = '22:00';
    var settings = this.settings();
    if(str === '') str = defaultEndOfDay;
    if(str) {
      var time = Date.parseTime(str);
      if(time == settings.endOfDay) return false;
      return settings.update({ endOfDay: time });
    }
    if(!settings.endOfDay) {
      this.endOfDay(defaultEndOfDay);
      return Date.parseTime(defaultEndOfDay);
    }
    return settings.endOfDay;
  },

  startOfDay: function (str) {
    var defaultStartOfDay = '08:00';
    var settings = this.settings();
    if(str === '') str = defaultStartOfDay;
    if(str) {
      var time = Date.parseTime(str);
      if(time == settings.startOfDay) return false;
      return settings.update({ startOfDay: time });
    }
    if(!settings.startOfDay) {
      this.startOfDay(defaultStartOfDay);
      return Date.parseTime(defaultStartOfDay);
    }
    return settings.startOfDay;
  },

  referred: function (bool) {
    var settings = this.settings();
    if(bool !== undefined && bool !== null) {
      if(bool === settings.bool) return false;
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
    if(str && str === settings.taskCalendarId) return false;
    if(str) return settings.update({ taskCalendarId: str });
    else    return settings.taskCalendarId;
  },

  tasks: function () {
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: true } });
  },

  sortedTasks: function () {
    var tasks = this.tasks().fetch();
    tasks = Tasks.basicSort(tasks);
    return tasks;
  },

  todos: function () {
    return Tasks.find({ ownerId: this._id, isRemoved: { $not: true }, isDone: { $not: true } });
  },

  sortedTodos: function () {
    var todos = this.todos().fetch();
    todos = Tasks.basicSort(todos);
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

  todoList: function (freetimes) {
    var todos, todoList;
    todos     = this.sortedTodos();
    freetimes = freetimes || this.freetimes();
    todoList  = Scheduler.generateTodoList(freetimes, todos, 'greedy');
    return todoList;
  }

  // appleCredentials: function () {
  //   return AppleCredentials.findOne(this.appleCredentialsId);
  // },

  // setAppleCredentials: function (data) {
  //   var cred = this.appleCredentials();

  //   if(!cred) {
  //     var id = AppleCredentials.insert(data);
  //     this.update({ appleCredentialsId: id });
  //   } else {
  //     cred.update(data);
  //   }
  // },

  // loginWithApple: function (user, pass) {
  //   var cred = this.appleCredentials();
  //   if( !cred && !(user && pass) ) {
  //     return;
  //   } else if( !cred ) {
  //     AppleCredentials.insert({
  //       appleId:  user,
  //       password: pass
  //     });
  //   } else if( user && pass ) {
  //     cred.update({
  //       appleId:  user,
  //       password: pass
  //     });
  //   } else {
  //     cred.validate();
  //   }
  // },

  // syncReminders: function () {
  //   var cred = this.appleCredentials();
  //   cred.syncReminders();
  // },

});

Meteor.users.findBy = collectionsDefault.findBy(Meteor.users);

Meteor.users.findByEmail = function (email) {
  return Meteor.users.findBy({ email: email });
};

// Requires email & password, could be an array of new users
Meteor.users.create = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(user) {
      Meteor.users.create(user);
    });
  } else if(typeof(obj) === 'object') {
    var user = Meteor.users.findByEmail(obj.email);
    console.log('user: ', user);
    // if(!user) return Meteor.users.insert(user);
  } else {
    console.error('type error, Meteor.users.create does not expect: ', typeof(obj));
  }
};
