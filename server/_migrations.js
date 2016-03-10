
Migrations.add({
  version: 1,
  up: function() {
    var collections = [Calendars, Events, Tasks];
    collections.forEach(function (collection) {
      var items = collection.find({ _removed: { $exists: true } }).fetch();
      items.forEach(function migrate (item) {
        collection.update(item._id, {
          $unset: { _removed: true },
          $set:   { isRemoved: item._removed === 'removed' }
        });
      });
    });
  }
});

Migrations.add({
  version: 2,
  up: function() {
    Users.find({}).forEach(function (user) {
      var defaultSettings = {
        profile: {
          settings: {
            startOfDay: Date.parseTime('08:00'),
            endOfDay: Date.parseTime('22:00'),
            taskCalendarId: null,
            referrals: [],
            isReferred: false,
            maxTaskInterval: 2*HOURS,
            maxTimePerTaskPerDay: 6*HOURS,
            taskBreakInterval: 30*MINUTES,
            taskGranularity: 5*MINUTES,
            lastDayOfWeek: 'monday'
          }
        }
      };

      user = lodash.defaultsDeep({}, user, defaultSettings);

      Users.update(user._id, user);
    });
  }
});

Migrations.add({
  version: 3,
  up: function() {
    Tasks.find({ isRemoved: true, lastRemovedAt: { $exists: false } }).forEach(function (task) {
      var lastUpdatedAt = task.lastUpdatedAt;
      Tasks.update(task._id, { $set: { lastRemovedAt: lastUpdatedAt } });
    });
  }
});

Migrations.add({
  version: 4,
  up: function() {
    Tasks.find({ timeLastMarkedDone: { $exists: true } }).forEach(function (task) {
      var lastMarkedDoneAt = task.timeLastMarkedDone;
      Tasks.update(task._id, {
        $set: { lastMarkedDoneAt: lastMarkedDoneAt },
        $unset: { needsReviewed: true, timeLastMarkedDone: true }
      });
    });
  }
});

Migrations.add({
  version: 5,
  up: function() {
    Users.update({
      $or: [
        { 'profile.settings.lastDayOfWeek': { $exists: true } },
        { 'profile.settings.workWeek': { $exists: true } },
      ]
    }, {
      $unset: {
        'profile.settings.lastDayOfWeek': true,
        'profile.settings.workWeek': true
      }
    });
  }
});

Migrations.add({
  version: 6,
  up: function () {
    Users.update({}, { $unset: { 'profile.settings.taskGranularity': true } });
  }
});

Migrations.add({
  version: 7,
  up: function () {
    Users.update({}, { $set: { 'profile.settings.minTaskInterval': 15*MINUTES } });
  }
});

Meteor.startup(function () {
  Migrations.migrateTo('latest');
});
