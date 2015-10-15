
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

Meteor.startup(function () {
  Migrations.migrateTo('latest');
});
