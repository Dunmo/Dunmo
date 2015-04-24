
var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var apiKey = 'AtwQ5-FSiXOk72t0L0QCzQux';
var scopes = 'https://www.googleapis.com/auth/calendar';

var GLOBAL_MIN_TIME = 0;

// gapi.handleClientLoad = function () {
//   gapi.client.setApiKey(apiKey);
//   window.setTimeout(checkAuth,1);
//   gapi.checkAuth();
// };

// gapi.checkAuth = function () {
//   gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
//       handleAuthResult);
// };

// gapi.handleAuthResult = function (callback, doc) {
//   return function(authResult) {
//     if (authResult) {
//       callback(doc);
//     } else {
//       // console.log('auth failed');
//     }
//   };
// };

// gapi.handleAuthClick = function (callback, doc) {
//   return function(event) {
//     gapi.auth.authorize({
//       client_id: clientId,
//       scope: scopes,
//       immediate: true
//     }, gapi.handleAuthResult(callback, doc));

//     return false;
//   }
// };

gapi.createTaskCalendar = function (callback) {
  var calendarName = 'Dunmo Tasks';

  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendars.insert({
      'summary': calendarName
    });

    request.execute(function(res) {

      if(!res)             console.error('Error: no result on insert task calendar');
      else if(!res.result) console.error('Error on insert task calendar: ', res.error);
      else {
        res      = res.result;
        var id   = res.id;
        var user = Meteor.user();
        user.taskCalendarId(id);
        callback(res);
      }
    });
  });
};

gapi.findCalendar = function (selector, callback) {
  gapi.getCalendarList(function (calendarList) {
    var calendars = calendarList.items;
    var calendar  = lodash.find(calendars, selector);
    callback(calendar);
  });
};

gapi.findOrCreateTaskCalendar = function (callback) {
  gapi.findCalendar({ summary: 'Dunmo Tasks' }, function (cal) {
    if(cal) callback(cal);
    else {
      console.error('No task calendar found. Creating new task calendar...');
      gapi.createTaskCalendar(callback);
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
    Calendars.updateOrCreate(calendars);
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

function getBusytimes(calendars) {
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

function addStartEndTimes(busytimes, min, max) {
  var starttimes = lodash.pluck(busytimes, 'start');
  var endtimes   = lodash.pluck(busytimes, 'end');
  var start      = min;
  var end        = max;

  var day        = Number(Date.startOfDay(start));
  var lastDay    = Number(Date.startOfDay(end));

  var user       = Meteor.user();
  var startOfDay = user.startOfDay() || 0;
  var endOfDay   = user.endOfDay()   || 1 * DAYS;

  startOfDay     = day + startOfDay;
  endOfDay       = day + endOfDay;

  if(start < startOfDay) {
    busytimes.push({
      start: start,
      end:   startOfDay
    });
  }

  while(day < lastDay) {
    busytimes.push({
      start: endOfDay,
      end:   startOfDay + 1 * DAYS
    });

    startOfDay += 1 * DAYS;
    endOfDay   += 1 * DAYS;
    day        += 1 * DAYS;
  }

  if(end > endOfDay) {
    busytimes.push({
      start: endOfDay,
      end:   end
    });
  }

  return busytimes;
};

function coalesceBusytimes(busytimes) {
  busytimes    = lodash.sortBy(busytimes, 'end');
  busytimes    = lodash.sortBy(busytimes, 'start');
  newBusytimes = [];

  busytimes.forEach(function (obj) {
    if(newBusytimes.length === 0) {
      newBusytimes.push(obj);
      return;
    }
    var last = newBusytimes.pop();
    var next = obj;
    if(last.end < next.start) {
      newBusytimes.push(last);
      newBusytimes.push(next);
    }
    else {
      var newObj = {};
      newObj.start = lodash.min([last.start, next.start]);
      newObj.end   = lodash.max([last.end,   next.end]);
      newBusytimes.push(newObj);
    }
  });

  return newBusytimes;
};

function toFreetimes(busytimes, minTime, maxTime) {
  if(busytimes.length === 0) {
    return [
      {
        start: minTime,
        end:   maxTime,
        timeRemaining: function () {
          return this.end - this.start;
        }
      }
    ];
  }

  busytimes = addStartEndTimes(busytimes, minTime, maxTime);
  busytimes = coalesceBusytimes(busytimes);

  var freetimes  = [];

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;

    if(index === 0) {
      if(minTime < busytimes[0].start) {
        start = minTime;
        end   = obj.start;
      }
    }
    else if(index === busytimes.length-1) {
      if(maxTime > obj.end) {
        start = obj.end;
        end   = maxTime;
      }
    }
    else {
      start = busytimes[index-1].end;
      end   = obj.start;
    }
    freetimes.push({
      start: start,
      end:   end
    });
  });

  freetimes = freetimes.map(function(ft) {
    ft.ownerId = Meteor.userId();
    ft.timeRemaining = function () {
      return this.end - this.start;
    };
    return ft;
  });

  return freetimes;
};

gapi.onAuth = function (callback) {
  _onauth = function () {
    if(!gapi.auth) {
      window.setTimeout(_onauth, 1);
    }
    else {
      gapi.auth.authorize({
        client_id: clientId,
        scope: scopes,
        immediate: true
      }, function(authResult) {
        if (!authResult) {
          return;
        }

        gapi.client.load('calendar', 'v3', callback);
      });
    }
  };
  _onauth();
};

// callback is given the list of freetimes as an array
// callback(freetimes)
gapi.getFreetimes = function (startingFrom, callback) {
  var items, minTime, maxTime;

  items = Meteor.user().calendarIdObjects();


  if (typeof(startingFrom) === 'function') {
    minTime = Date.now();
    callback = startingFrom;
  } else {
    minTime = startingFrom;
  }

  maxTime = Meteor.user().latestTodoTime();
  maxTime = Number(maxTime);

  if( !maxTime || maxTime < minTime) {
    callback([]);
    return;
  }



  gapi.onAuth(function () {
    var request = gapi.client.calendar.freebusy.query({
      'timeMin' : Date.formatGoog(new Date(minTime)),
      'timeMax' : Date.formatGoog(new Date(maxTime)),
      'items'   : items
    });

    request.execute(function(res) {
      var calendars, busytimes, freetimes;

      var result = res.result;

      if(!result) {

      }
      else {
        calendars = result.calendars;
        busytimes = getBusytimes(calendars);
        freetimes = toFreetimes(busytimes, minTime, maxTime);

        callback(freetimes);
      }
    });
  });
};

gapi.syncTasksWithCalendar = function (startingFrom) {
  startingFrom = startingFrom || Date.now();

  gapi.getCurrentTaskEvent(function(currEvent) {
    if(currEvent) {
      var firstTask = Meteor.user().sortedTodos()[0];
      // if current task is first task
      if( firstTask && lodash.contains(firstTask.gcalEventIds, currEvent.id) ) {
        startingFrom = Date.ISOToMilliseconds(currEvent.start.dateTime);
      }
      else {

        gapi.setEndTime(currEvent, startingFrom);
      }
    }


    // will not delete current task event
    gapi.deleteAllFromCalendarAfter(startingFrom);

    gapi.getFreetimes(startingFrom, function(freetimes) {
      todos = Meteor.user().todoList(freetimes);
      todos.forEach(function(todo) {
        gapi.addEventToCalendar(todo);
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

// 'Dunmo Tasks' events channel
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
