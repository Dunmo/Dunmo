
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
            lastReviewed: 0,
            maxTaskInterval: 2*HOURS,
            maxTimePerTaskPerDay: 6*HOURS,
            taskBreakInterval: 30*MINUTES,
            taskGranularity: 5*MINUTES,
            onboardingIndex: 0,
            lastDayOfWeek: 'monday'
          }
        }
      };

      user = lodash.defaultsDeep({}, user, defaultSettings);

      Users.update(user._id, user);
    });
  }
});

Meteor.startup(function () {
  Migrations.migrateTo('latest');
});
