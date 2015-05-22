
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
  _onauth = function () {
    if(!gapi.auth) window.setTimeout(_onauth, 1);
    else {
      gapi.auth.authorize(gapi.AUTH_PARAMS, function(authResult) {
        if(authResult) gapi.client.load('calendar', 'v3', callback);
      });
    }
  };
  _onauth();
};

///////////////
// Calendars //
///////////////

gapi.assignCalToCurrentUser = function (cal, callback) {
  var id   = cal.id;
  var user = Meteor.user();
  user.taskCalendarId(id);
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
      if(!res) console.error('Error: no result on insert task calendar');

      var cal = res.result;
      if(!res.result) console.error('Error on insert task calendar: ', res.error);
      else            callback(res.result);
    });
  });
};

gapi.findOrCreateTaskCalendar = function (callback) {
  gapi.findCalendar({ summary: 'Dunmo Tasks' }, function (cal) {
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
  var user           = Meteor.user();
  var taskCalendarId = user.taskCalendarId();

  if(!taskCalendarId) {
    gapi.findOrCreateTaskCalendar(callback);
    return;
  }

  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendars.get({
      'calendarId': taskCalendarId
    });

    request.execute(function(res) {
      if(res && res.result) callback(res.result);
      else                  gapi.findOrCreateTaskCalendar(callback);
    });
  });
};

gapi.deleteTaskCalendar = function (callback) {
  gapi.getCalendarList(function (calendarList) {
    var calendars = calendarList.items;
    calendars     = lodash.select(calendars, { summary: 'Dunmo Tasks' });
    calendars.forEach(function (calendar) {
      gapi.deleteCalendar(calendar.id);
    });
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

    removedCalendars.forEach(function (cal) { cal.remove(); });
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

gapi.getAllFromCalendarAfter = function (minTime, callback) {
  if(typeof minTime === 'function') {
    callback = minTime;
    minTime = Date.now();
  }

  if( !callback ) {
    console.error('getAllFutureFromCalendar: no callback supplied. must be called asynchronously');
    return;
  }

  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.list({
        'calendarId': cal.id,
        timeMin: Date.formatGoog(new Date(minTime))
      });

      request.execute(function(res) {

        var items = res.items;
        callback(items);
      });
    });
  });
};

gapi.getAllFutureFromCalendar = function (callback) {
  var minTime = Date.now();
  gapi.getAllFromCalendarAfter(minTime, callback);
};

gapi.getCurrentTaskEvent = function (callback) {
  if( !callback ) {
    console.error('getCurrentTaskEvent: no callback supplied. must be called asynchronously');
    return;
  }

  var min = Date.now() - (2 * MINUTES);
  var max = Date.now() + (2 * MINUTES);

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
        callback(item);
      });
    });
  });
};

gapi.fixCurrentTaskEvent = function (startingFrom, callback) {
  gapi.getCurrentTaskEvent(function(currEvent) {
    if(currEvent) {
      // if current task is first task
      var firstTask = Meteor.user().sortedTodos()[0];
      if( firstTask && lodash.contains(firstTask.gcalEventIds, currEvent.id) ) {
        startingFrom = Date.ISOToMilliseconds(currEvent.start.dateTime);
      }
      else gapi.setEndTime(currEvent, startingFrom);

      callback(startingFrom);
    }
    else callback(startingFrom);
  });
};

// minTime is a Number of Milliseconds
gapi.deleteAllFromCalendarAfter = function (minTime) {
  gapi.getAllFromCalendarAfter(minTime, function(events) {
    events.forEach(function (e) {
      gapi.removeEventFromCalendar(e.id);
    });
  });
};

function isHappeningNow(event) {
  if( !event ) return false;
  var start = Date.ISOToMilliseconds(event.start.dateTime);
  var end = Date.ISOToMilliseconds(event.end.dateTime);
  var now = Date.now();

  var ret = start < now && now < end;

  return ret;
};

// will not delete the current task event
gapi.deleteAllFutureFromCalendar = function (callback) {
  gapi.getAllFutureFromCalendar(function(events) {

    events.forEach(function (e) {
      gapi.removeEventFromCalendar(e.id);
    });
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
        // console.log('added event: ', res);
        Tasks.update(doc._id, { $addToSet: { gcalEventIds: res.id } });
      });
    });
  });
};

gapi.removeEventFromCalendar = function(eventId) {
  gapi.getTaskCalendar(function (cal) {
    gapi.onAuth(function () {
      var request = gapi.client.calendar.events.delete({
        'calendarId' : cal.id,
        'eventId'    : eventId
      });

      request.execute(function(res) {
        var tasks = Meteor.user().tasks();
        tasks.forEach(function (task) {
          task.update({ $pull: { gcalEventIds: eventId } });
        });
      });
    });
  });
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
  gapi.addEventToCalendar(e);
};

///////////////
// Free/Busy //
///////////////

function getBusytimesFromCalendars(calendars) {
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
  var calendarIdObjects, minTime, maxTime;

  if (typeof(startingFrom) === 'function') {
    minTime = Date.now();
    callback = startingFrom;
  } else {
    minTime = startingFrom;
  }

  maxTime = Meteor.user().latestTodoTime();
  maxTime = Number(maxTime);

  if( !maxTime || maxTime < minTime) {
    console.warn('Warning: No tasks or all tasks are before start time');
    callback([]);
    return;
  }

  calendarIdObjects = Meteor.user().calendarIdObjects();

  gapi.onAuth(function () {
    var request = gapi.client.calendar.freebusy.query({
      'timeMin' : Date.formatGoog(new Date(minTime)),
      'timeMax' : Date.formatGoog(new Date(maxTime)),
      'items'   : calendarIdObjects
    });
    request.execute(function(res) {
      var busytimes, calendars, freetimes, result;
      result = res.result;
      if(!result) console.warn('Warning: No result from freebusy query');
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
    var maxTime     = Meteor.user().latestTodoTime();
    maxTime         = Number(maxTime);
    var freetimeIds = Freetimes.createFromBusytimes(busytimes, {
      userId            : userId,
      minTime           : startingFrom,
      maxTime           : maxTime,
      defaultProperties : { ownerId: userId }
    });
    var freetimes   = Freetimes.fetch({ _id: { $in: freetimeIds } });
    callback(freetimes);
  });
};

////////////////
// Sync Tasks //
////////////////

gapi.syncTasksWithCalendar = function (startingFrom) {
  startingFrom = startingFrom || Date.now();
  gapi.fixCurrentTaskEvent(startingFrom, function(startingFrom) {
    // will not delete current task event
    gapi.deleteAllFromCalendarAfter(startingFrom);
    gapi.getFreetimes(startingFrom, function(freetimes) {
      var user = Meteor.user();
      todos    = user.todoList(freetimes);
      todos.forEach(function(todo) {
        gapi.addEventToCalendar(todo);
      });
    });
  });
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
