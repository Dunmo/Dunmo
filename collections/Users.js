
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
  'update': function (data) {
    return Meteor.users.update(this._id, { $set: data });
  },

  'appleCredentials': function () {
    console.log('this.appleCredentialsId: ', this.appleCredentialsId);
    return AppleCredentials.findOne(this.appleCredentialsId);
  },

  'setAppleCredentials': function (data) {
    var cred = this.appleCredentials();

    console.log('cred: ', cred);

    if(!cred) {
      console.log('creating new apple credentials');
      var id = AppleCredentials.insert(data);
      this.update({ appleCredentialsId: id });
    } else {
      console.log('updating apple credentials');
      cred.update(data);
    }
  },

  'loginWithApple': function (user, pass) {
    var cred = this.appleCredentials();
    if( !cred && !(user && pass) ) {
      console.log('Error: no Apple credentials provided.');
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

  'syncReminders': function () {
    var cred = this.appleCredentials();
    cred.syncReminders();
  },

  'tasks': function () {
    // this.syncReminders();
    return Tasks.find({ ownerId: this._id });
  },

  'sortedTasks': function () {
    var tasks = this.tasks();

    tasks = _.sortBy(tasks, 'timeRemaining');
    tasks = _.sortBy(tasks, 'importance');
    tasks = _.sortBy(tasks, 'dueAt');

    return tasks;
  },

  'calendars': function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid });
  },

  'activeCalendars': function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid, active: true });
  },

  'calendarIdObjects': function () {
    var calendars = this.activeCalendars();
    var idObjects = calendars.map(function(calendar) {
      return { id: calendar.googleCalendarId };
    });
    return idObjects;
  }
});


