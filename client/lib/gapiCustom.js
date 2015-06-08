
var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var scopes   = 'https://www.googleapis.com/auth/calendar';
var apiKey   = 'AtwQ5-FSiXOk72t0L0QCzQux';

gapi.TASK_CALENDAR_NAME = 'Dunmo Tasks';
gapi.AUTH_PARAMS = {
  client_id: clientId,
  scope:     scopes,
  immediate: true
};

gapi.onAuth = function (callback) {
  if(gapi.isAuthed && gapi.client.calendarIsLoaded) {
    callback();
  } else if(gapi.isAuthed) {
    gapi.client.load('calendar', 'v3', callback);
  } else {
    _onauth = function () {
      if(!gapi.auth) window.setTimeout(_onauth, 1);
      else {
        gapi.auth.authorize(gapi.AUTH_PARAMS, function(authResult) {
          if(authResult) {
            gapi.isAuthed = true;
            gapi.client.load('calendar', 'v3', callback);
            gapi.client.calendarIsLoaded = true;
          }
        });
      }
    };
    _onauth();
  }
};

gapi.normalizeEvents = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(event) {
      return gapi.normalizeEvents(event);
    });
  } else if(typeof(obj) === 'object') {
    var event    = obj;
    event.start  = new Date(event.start.dateTime);
    event.end    = new Date(event.end.dateTime);
    event.userId = Meteor.userId();
    return event;
  }
};

///////////////
// Calendars //
///////////////

gapi.assignCalToCurrentUser = function (cal, callback) {
  // var id   = cal.id;
  // var user = Meteor.user();
  // user.taskCalendarId(id);
  gapi.taskCalendar = cal;
  callback(cal);
};

gapi.findCalendar = function (selector, callback) {
  gapi.getCalendarList(function (calendarList) {
    var cals = calendarList.items;
    var cal  = lodash.find(cals, selector);
    callback(cal);
  });
};

gapi.createTaskCalendar = function (callback) {
  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendars.insert({
      'summary': gapi.TASK_CALENDAR_NAME
    });

    request.execute(function(res) {
      if(!res) console.error('Error: no result on create task calendar');

      var cal = res.result;
      if(!res.result) console.error('Error on create task calendar: ', res.error);
      else            callback(res.result);
    });
  });
};

gapi.findOrCreateTaskCalendar = function (callback) {
  gapi.findCalendar({ summary: gapi.TASK_CALENDAR_NAME }, function (cal) {
    if(cal) gapi.assignCalToCurrentUser(cal, callback);
    else {
      console.info('No task calendar found. Creating new task calendar...');
      gapi.createTaskCalendar(function(cal) {
        gapi.assignCalToCurrentUser(cal, callback);
      });
    }
  });
};

gapi.getTaskCalendar = function (callback) {
  if(gapi.taskCalendar) callback(gapi.taskCalendar);
  else                  gapi.findOrCreateTaskCalendar(callback);
};

// Warning, not all calendars may be gone when callback is called
gapi.deleteTaskCalendar = function (callback) {
  gapi.getCalendarList(function (calendarList) {
    var calendars = calendarList.items;
    calendars     = lodash.select(calendars, { summary: 'Dunmo Tasks' });
    calendars.forEach(function (calendar) {
      gapi.deleteCalendar(calendar.id);
    });
    callback();
  });
};

gapi.getCalendarList = function (callback) {
  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendarList.list({
      'showHidden': true
    });

    request.execute(function(res) {
      callback(res);
    });
  });
};

gapi.syncCalendars = function () {
  gapi.getCalendarList(function (calendarList) {
    var calendars = calendarList.items;
    var calendarIds = lodash.pluck(calendars, 'id');

    // only creates if new
    Calendars.create(calendars);

    var userId = Meteor.userId();
    var allCalendars = Calendars.find({ ownerId: userId }).fetch();
    var removedCalendars = lodash.reject(allCalendars, function(cal) {
      return lodash.contains(calendarIds, cal.googleCalendarId);
    });

    removedCalendars.forEach(function (cal) { cal.setRemoved(); });
  });
};

gapi.deleteCalendar = function (id) {
  var cal = Calendars.findOne({ googleCalendarId: id });

  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendars.delete({
      'calendarId': id
    });

    request.execute(function(res) {
      if(cal) Calendars.remove(cal._id);
    });
  });
};

////////////
// Events //
////////////

// options:
//   calendarId: String (Default: DunmoTaskCalendar)
//   start:      Date
//   end:        Date
// callback(events)
gapi.getEvents = function (options, callback) {
  var calendarId, events, obj, timeMin, timeMax;

  obj = { calendarId: options.calendarId };
  if(options.start) obj.timeMin = Date.formatGoog(new Date(options.start));
  if(options.end)   obj.timeMax = Date.formatGoog(new Date(options.end));

  events = [];

  gapi.onAuth(function () {
    var _callback = function(res) {
      events = events.concat(res.items);
      if(res.nextPageToken) {
        obj.pageToken = res.nextPageToken;
        gapi.client.calendar.events.list(obj).execute(_callback);
      } else {
        events = gapi.normalizeEvents(events);
        events = _.reject(events, function (event) {
          return event.start < options.start;
        });
        callback(events);
      }
    };
    gapi.client.calendar.events.list(obj).execute(_callback);
  });
};

gapi.getTaskEvents = function (options, callback) {
  gapi.getTaskCalendar(function (cal) {
    options.calendarId = cal.id;
    gapi.getEvents(options, callback);
  });
};

gapi.getAllFutureFromCalendar = function (callback) {
  var minTime = Date.now();
  gapi.getTaskEvents({ start: minTime }, callback);
};

gapi.getCurrentTaskEvent = function (callback) {
  var min = Date.floor(Date.now(), 5*MINUTES);
  var max = Date.ceiling(Date.now(), 5*MINUTES);

  min = Date.formatGoog(min);
  max = Date.formatGoog(max);

  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.list({
        'calendarId' : cal.id,
        'timeMin'    : min,
        'timeMax'    : max
      });

      request.execute(function(res) {
        var items = res.items;
        items     = lodash.filter(items, isHappeningNow);
        // TODO: sort by date

        var item  = items[0];
        item = gapi.normalizeEvents(item);
        callback(item);
      });
    });
  });
};

gapi.fixCurrentTaskEvent = function (startingFrom, callback) {
  gapi.getCurrentTaskEvent(function(currEvent) {
    if(currEvent) {
      var doc       = Events.findOne(Events.createOrUpdate(currEvent))
      var taskId    = doc.taskId;
      var firstTask = Meteor.user().sortedTodos()[0];

      // if current task is first task
      if( firstTask && taskId === firstTask._id ) {
        // since it's the first task, we remove the old event, and set the
        // new start time back to the start of the current event. it will be
        // replaced accordingly during the todoList creation
        startingFrom = doc.start;
        gapi.removeEventFromCalendar(currEvent.id);
      }
      else {
        gapi.setEndTime(currEvent, startingFrom);
      }
    }

    callback(startingFrom);
  });
};

// minTime is a Number of Milliseconds
gapi.deleteAllFromCalendarAfter = function (minTime, callback) {
  gapi.getTaskEvents({ start: minTime }, function(events) {
    gapi.pendingDeletes = events.length;
    events.forEach(function (e) {
      gapi.removeEventFromCalendar(e.id);
    });
    (function _local () {
      if(gapi.pendingDeletes == 0) callback();
      else                         window.setTimeout(_local, 50);
    })();
  });
};

function isHappeningNow (event) {
  if( !event ) return false;
  var start = Date.ISOToMilliseconds(event.start.dateTime);
  var end = Date.ISOToMilliseconds(event.end.dateTime);
  var now = Date.now();

  var ret = start < now && now < end;

  return ret;
};

// will not delete the current task event
// Warning, not all events may be gone when callback is called
gapi.deleteAllFutureFromCalendar = function (callback) {
  gapi.getAllFutureFromCalendar(function(events) {
    events.forEach(function (e) {
      gapi.removeEventFromCalendar(e.id);
    });
    callback();
  });
};

gapi.addEventToCalendar = function (doc) {
  var start, end;

  start = (doc.start && doc.start.dateTime) || doc.start;
  end   = (doc.end   && doc.end.dateTime)   || doc.end;

  if(!doc.summary) doc.summary = doc.title;
  start = Date.formatGoog(new Date(start));
  end = Date.formatGoog(new Date(end));

  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.insert({
        'calendarId': cal.id,
        'start': {
          'dateTime': start
        },
        'end': {
          'dateTime': end
        },
        'summary': doc.summary,
        'transparency': 'transparent'
      });

      request.execute(function(res) {
        res.taskId  = doc._id;
        res.ownerId = Meteor.userId();
        var ret     = Events.createOrUpdate(res);
        gapi.pendingEvents--;
        if(gapi.pendingEvents == 0) {
          gapi.isSyncing = false;
          Session.set('isSyncing', false);
          console.log('done syncing');
        }
      });
    });
  });
};

gapi.removeEventFromCalendar = function (eventId) {
  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.delete({
        'calendarId' : cal.id,
        'eventId'    : eventId
      });
      var _local = function () {
        request.execute(function(res) {
          if(res.code == 403) {
            window.setTimeout(_local, 100);
          } else {
            Meteor.call('removeEvent', eventId);
            gapi.pendingDeletes--;
          }
        });
      }
      window.setTimeout(_local, 100);
    });
  });
};

gapi.getEvent = function (event, callback) {
  function execute (cal) {
    var eventId;
    if(typeof event === 'object') eventId = event.googleEventId;
    else                          eventId = event;

    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.get({
        'calendarId' : cal.id,
        'eventId'    : eventId
      });

      request.execute(callback);
    });
  };

  if(event.taskId) gapi.getTaskCalendar(execute);
  else             execute({ id: event.googleCalendarId });
};

gapi.splitEvent = function (e, splitTime) {
  var startTime = new Date(e.start.dateTime);
  var event1 = R.cloneDeep(e);
  var event2 = R.cloneDeep(e);

  event1.end.dateTime   = Date.formatGoog(new Date(splitTime));
  event2.start.dateTime = Date.formatGoog(new Date(splitTime));

  return [event1, event2];
};

// takes in an event and a new end time
gapi.setEndTime = function (e, newEndTime) {
  e.end.dateTime = Date.formatGoog(new Date(newEndTime));

  gapi.removeEventFromCalendar(e.id);
  window.setTimeout(function () { gapi.addEventToCalendar(e); }, 100);
};

///////////////
// Free/Busy //
///////////////

function getBusytimesFromCalendars (calendars) {
  var busytimes = [];
  lodash.keys(calendars).forEach(function(k) {
    var calendar = calendars[k];
    calendar.busy.forEach(function(busy) {
      busy.start = Date.ISOToMilliseconds(busy.start);
      busy.end   = Date.ISOToMilliseconds(busy.end);

      busytimes.push(busy);
    });
  });
  return busytimes;
};

// callback is given the list of busytimes as an array
// callback(busytimes)
gapi.getBusytimes = function (startingFrom, callback) {
  var calendarIdObjects, timeMin, timeMax;

  if (typeof(startingFrom) === 'function') {
    timeMin = Date.now();
    callback = startingFrom;
  } else {
    timeMin = startingFrom;
  }

  // timeMax = Meteor.user().latestTodoTime();
  // timeMax = Number(timeMax);
  timeMax = timeMin + 30*DAYS;

  if( !timeMax || timeMax < timeMin) {
    console.warn('Warning: No tasks or all tasks are due before start time');
    callback([]);
    return;
  }
  if( timeMax && (timeMax - timeMin > 30*DAYS) ) {
    console.warn('Warning: query range exceeds 30 days, limiting to 30 days');
    timeMax = timeMin + 30*DAYS;
  }

  calendarIdObjects = Meteor.user().calendarIdObjects();

  timeMin = Date.formatGoog(new Date(timeMin));
  timeMax = Date.formatGoog(new Date(timeMax));

  gapi.onAuth(function () {
    var request = gapi.client.calendar.freebusy.query({
      'timeMin' : timeMin,
      'timeMax' : timeMax,
      'items'   : calendarIdObjects
    });
    request.execute(function(res) {
      var busytimes, calendars, freetimes, result;
      result = res.result;
      if(!result) console.warn('Warning: No result from freebusy query, res: ', res);
      else {
        calendars = result.calendars;
        busytimes = getBusytimesFromCalendars(calendars);
        callback(busytimes);
      }
    });
  });
};

// callback is given the list of freetimes as an array
// callback(freetimes)
gapi.getFreetimes = function (startingFrom, callback) {
  gapi.getBusytimes(function(busytimes) {
    var userId      = Meteor.userId();
    // var maxTime     = Meteor.user().latestTodoTime();
    // maxTime         = Number(maxTime);
    var freetimes = Freetimes.createFromBusytimes(busytimes, {
      userId            : userId,
      minTime           : startingFrom,
      maxTime           : startingFrom + 30*DAYS,
      defaultProperties : { ownerId: userId }
    });
    // var freetimes   = Freetimes.fetch({ _id: { $in: freetimeIds } });
    callback(freetimes);
  });
};

////////////////
// Sync Tasks //
////////////////

gapi.syncTasksWithCalendar = function () {
  if(gapi.isSyncing && gapi.isQueued) return;

  if(gapi.isSyncing) gapi.isQueued = true;
  function _sync () {
    if(gapi.isSyncing && gapi.isQueued) {
      window.setTimeout(_sync, 10);
      return;
    } else {
      gapi.isSyncing = true;
      gapi.isQueued  = false;
      Session.set('isSyncing', true);
    }
    gapi.getTaskCalendar(function () {
      var startingFrom = Date.now();

      gapi.fixCurrentTaskEvent(startingFrom, function(startingFrom) {
        // should not delete current task event
        gapi.deleteAllFutureFromCalendar(function () {

          Meteor.user().todos().fetch().forEach(function (todo) {
            todo.setWillBeOverdue(false);
          });

          gapi.getFreetimes(startingFrom, function(freetimes) {
            todos = Meteor.user().todoList(freetimes);
            gapi.pendingEvents = todos.length;
            todos.forEach(function(todo) {
              if(todo.isOverdue) {
                todo.setWillBeOverdue(true);
                if(!todo.start || !todo.end) {
                  gapi.pendingEvents--;
                  if(gapi.pendingEvents == 0) {
                    gapi.isSyncing = false;
                    Session.set('isSyncing', false);
                    console.log('done syncing');
                  }
                } else {
                  gapi.addEventToCalendar(todo);
                }
              } else {
                gapi.addEventToCalendar(todo);
              }
            });
          });
        });
      });
    });
  };
  _sync();
};

//////////////
// Channels //
//////////////

gapi.createChannel = function () {
  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.watch({
        'calendarId'  : cal.id,
        'showDeleted' : true,
        'id'          : 'googlesucks-' + String(Math.random()).substring(2),
        'type'        : 'web_hook',
        'address'     : CONFIG.urls.calendarWatchUrl
      });

      request.execute(function(res) {
        Meteor.user().update({ watchObj: res.request });
      });
    });
  });
};

///////////////////
// Miscellaneous //
///////////////////

gapi.test = function () {
  // console.log('testall');
  // gapi.deleteAllFutureFromCalendar();
  gapi.getFreetimes(function (freetimes) {
    // console.log('freetimes: ', freetimes);
    todos = Meteor.user().todoList(freetimes);
    // console.log('todos: ', todos);
  });
};

gapi.checkIsDone = function (taskEvent) {
  var task   = Tasks.findOne({ gcalEventIds: taskEvent.id });
  var isDone = taskEvent.summary.trim().charAt(0) === '*';
  task.update({ isDone: isDone });
};
