
function fields (fields) {
  return fields.reduce(function (object, field) {
    object[field] = 1;
    return object;
  }, {});
}

// when publication name is null, automatically publishes to all clients
const ALL_CLIENTS = null;

Meteor.publish('myProfile', function () {
  const userId = this.userId;
  selector = { _id: userId };
  let data = Users.find(selector);
  return data ? data : this.ready();
});

Meteor.publish('myCalendars', function (selector = {}, options = {}) {
  const userId   = this.userId;
  selector = _.defaults(selector, { ownerId: userId });
  let data = Calendars.find(selector, options);
  return data ? data : this.ready();
});

Meteor.publish('myEvents', function (selector = {}, options = {}) {
  const userId   = this.userId;
  selector = _.defaults(selector, { ownerId: userId });
  let data = Events.find(selector, options);
  return data ? data : this.ready();
});

Meteor.publish('myTasks', function (selector = {}, options = {}) {
  const filterSelectorMap = {
    completed: { isDone: true },
    trash:     { isRemoved: true },
    todo:      { isRemoved: { $ne: true }, isDone: { $ne: true } },
  };
  let filter;
  if(selector.filter) {
    filter = selector.filter;
    delete selector.filter;
  }
  const userId   = this.userId;
  filterSelector = filterSelectorMap[filter];
  selector = _.defaults(selector, { ownerId: userId }, filterSelector);
  let data = Tasks.find(selector, options);
  return data ? data : this.ready();
});

Meteor.publish('mySyncables', function () {
  const userId = this.userId;

  const defaultSelector  = { ownerId: userId, isRemoved: { $ne: true } };
  const taskSelector     = _.defaults(defaultSelector, { isDone: { $ne: true } });
  const calendarSelector = _.defaults(defaultSelector, { active: true });
  const eventSelector    = defaultSelector;

  const taskFields = fields([
    'ownerId',
    'dependencyIds',
    'title',
    'importance',
    'dueAt',
    'remaining',
    'willBeOverdue',
    'snoozedUntil',
    'recurrenceRule',
  ]);

  let data = [
    Users.find({ _id: userId }),
    Tasks.find(taskSelector, { fields: taskFields }),
    Calendars.find(calendarSelector),
    Events.find(eventSelector),
  ];

  return data ? data : this.ready();
});
