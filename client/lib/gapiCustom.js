
var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var apiKey = 'AtwQ5-FSiXOk72t0L0QCzQux';
var scopes = 'https://www.googleapis.com/auth/calendar';

var GLOBAL_MIN_TIME = 0;

gapi.handleClientLoad = function () {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
  gapi.checkAuth();
};

gapi.checkAuth = function () {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
      handleAuthResult);
};

gapi.handleAuthResult = function (callback, doc) {
  return function(authResult) {
    if (authResult) {
      callback(doc);
    } else {
      // console.log('auth failed');
    }
  };
};

gapi.handleAuthClick = function (callback, doc) {
  return function(event) {
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: false
    }, gapi.handleAuthResult(callback, doc));

    return false;
  }
};

gapi.createDunmoCalendar = function (callback) {
  var name = 'Dunmo Tasks';
  // console.log('callback: ', callback);

  gapi.onAuth(function () {
    var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });

    if( cal ) {
      // console.log('createDunmoCalendar: calendar found: ', cal);
      return;
    }

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.calendars.insert({
        'summary': name
      });

      request.execute(function(res) {
        // console.log('res: ', res);
        res.googleCalendarId = res.id;
        res.ownerId          = Meteor.userId();

        var ret = Calendars.updateOrCreate(res);
        // console.log('ret: ', ret);
        callback();
      });
    });
  });
};

gapi.loadDunmoCalendar = function (callback) {
  var name = 'Dunmo Tasks';
  var cal  = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
  // console.log('cal: ', cal);
  if(cal) callback();
  else    gapi.createDunmoCalendar(callback);
};

gapi.getCalendars = function () {
  gapi.onAuth(function () {
    var request = gapi.client.calendar.calendarList.list({
      'minAccessRole': 'reader'
    });

    request.execute(function(resp) {
      console.log('resp: ', resp);
      Calendars.updateOrCreate(resp.items);
    });
  });
};

gapi.deleteCalendar = function (name) {
  return function() {
    var cal = Calendars.findOne({ summary: name });
    if( !cal ) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.calendars.delete({
        'calendarId': cal.googleCalendarId
      });

      request.execute(function(res) {
        Calendars.remove(cal._id);
      });
    });
  };
};

gapi.getAllFromCalendarAfter = function (minTime, callback) {
  if(typeof minTime === 'function') {
    callback = minTime;
    minTime = Date.now();
  }
  var name = 'Dunmo Tasks';

  if( !callback ) {
    // console.log('getAllFutureFromCalendar: no callback supplied. must be called asynchronously');
    return;
  }
  var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
  if(!cal) {
    // console.log('getAllFutureFromCalendar: ', cal, ' not found.');
    return;
  }

  // console.log('cal: ', cal);

  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.events.list({
      'calendarId': cal.googleCalendarId,
      timeMin: Date.formatGoog(new Date(minTime))
    });

    request.execute(function(res) {
      var items = res.items;
      callback(items);
    });
  });
};

gapi.getAllFutureFromCalendar = function (callback) {
  var minTime = Date.now();
  gapi.getAllFromCalendarAfter(minTime, callback);
};

gapi.getCurrentTaskEvent = function (callback) {
  var name = 'Dunmo Tasks';

  if( !callback ) {
    console.log('getCurrentTaskEvent: no callback supplied. must be called asynchronously');
    return;
  }
  var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
  if(!cal) {
    console.log('getCurrentTaskEvent: ', cal, ' not found.');
    return;
  }

  // console.log('cal: ', cal);

  gapi.client.load('calendar', 'v3', function() {
    var min = Date.now() - (2 * MINUTES);
    var max = Date.now() + (2 * MINUTES);
    min = Date.formatGoog(min);
    max = Date.formatGoog(max);
    var request = gapi.client.calendar.events.list({
      'calendarId': cal.googleCalendarId,
      'timeMin': min,
      'timeMax': max
    });

    request.execute(function(res) {
      var items = res.items;

      items = lodash.filter(items, isHappeningNow);
      var item = items[0]; // TODO: Is the first one the first chronologically?
      callback(item);
    });
  });
};

// minTime is a Number of Milliseconds
gapi.deleteAllFromCalendarAfter = function (minTime) {
  gapi.getAllFromCalendarAfter(minTime, function(events) {
    events.forEach(function (e) {
      gapi.removeEventFromCalendar()(e.id);
    });
  });
};

function isHappeningNow(event) {
  console.log("event: ", event);
  if( !event ) return false;
  var start = Date.ISOToMilliseconds(event.start.dateTime);
  var end = Date.ISOToMilliseconds(event.end.dateTime);
  var now = Date.now();
  console.log("start, end: ", start, end);
  var ret = start < now && now < end;
  console.log("ret: ", ret);
  return ret;
};

// will not delete the current task event
gapi.deleteAllFutureFromCalendar = function (callback) {
  gapi.getAllFutureFromCalendar(function(events) {
    console.log('events: ', events);
    events.forEach(function (e) {
      gapi.removeEventFromCalendar()(e.id);
    });
  });
};

gapi.addEventToCalendar = function () {
  var name = 'Dunmo Tasks';

  return function(doc) {
    var cal, start, end;
    console.log('add!');
    cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
    if( !cal ) return;

    start = (doc.start && doc.start.dateTime) || doc.start;
    end   = (doc.end   && doc.end.dateTime)   || doc.end;

    console.log('start: ', start);
    console.log('end: ', end);

    if(!doc.summary) doc.summary = doc.title;
    start = Date.formatGoog(new Date(start));
    end = Date.formatGoog(new Date(end));
    console.log('doc: ', doc);

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.insert({
        'calendarId': cal.googleCalendarId,
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
        console.log('res: ', res);
        Tasks.update(doc._id, { $addToSet: { gcalEventIds: res.id } });
      });
    });
  };
};

// TODO: refactor to remove one layer of indirection
gapi.removeEventFromCalendar = function() {
  var name = 'Dunmo Tasks';

  return function(eventId) {
    var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
    if(!cal) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.delete({
        'calendarId': cal.googleCalendarId,
        'eventId': eventId
      });

      request.execute(function(res) {
        var tasks = Meteor.user().tasks();
        tasks.forEach(function (task) {
          task.update({ $pull: { gcalEventIds: eventId } });
        });
      });
    });
  };
};

function getBusytimes(calendars) {
  var busytimes = [];
  lodash.keys(calendars).forEach(function(k) {
    var calendar = calendars[k];
    calendar.busy.forEach(function(busy) {
      busy.start = Date.ISOToMilliseconds(busy.start);
      busy.end   = Date.ISOToMilliseconds(busy.end);
      console.log('busy: ', busy);
      busytimes.push(busy);
    });
  });
  return busytimes;
};

function coalesceBusytimes(busytimes) {
  busytimes    = _.sortBy(busytimes, 'end');
  busytimes    = _.sortBy(busytimes, 'start');
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
      newObj.start = _.min([last.start, next.start]);
      newObj.end   = _.max([last.end,   next.end]);
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

  busytimes = coalesceBusytimes(busytimes);
  console.log('busytimes: ', busytimes);

  var freetimes  = [];

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;
    console.log('index: ', index);
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
  var items, minTime, maxTime, request;

  items = Meteor.user().calendarIdObjects();
  console.log('items: ', items);

  if (typeof(startingFrom) === 'function') {
    minTime = Date.now();
    callback = startingFrom;
  } else {
    minTime = startingFrom;
  }

  maxTime = Meteor.user().latestTaskTime();
  maxTime = Number(maxTime);
  console.log('maxTime: ', maxTime);
  if( !maxTime || maxTime < minTime) {
    callback([]);
    return;
  }

  request = gapi.client.calendar.freebusy.query({
    'timeMin': Date.formatGoog(new Date(minTime)),
    'timeMax': Date.formatGoog(new Date(maxTime)),
    'items': items
  });

  request.execute(function(res) {
    var calendars, busytimes, freetimes;

    calendars = res.result.calendars;
    console.log('calendars: ', calendars);

    busytimes = getBusytimes(calendars);
    console.log('busytimes: ', busytimes);

    console.log('minTime, maxTime: ', minTime, maxTime);
    freetimes = toFreetimes(busytimes, minTime, maxTime);
    console.log('freetimes: ', freetimes);

    callback(freetimes);
  });
};

gapi.syncTasksWithCalendar = function (startingFrom) {
  startingFrom = startingFrom || Date.now();

  gapi.onAuth(function() {

    gapi.getCurrentTaskEvent(function(currEvent) {
      if(currEvent) {
        var firstTask = Meteor.user().sortedTodos()[0];
        // if current task is first task
        if( firstTask && _.contains(firstTask.gcalEventIds, currEvent.id) ) {
          startingFrom = Date.ISOToMilliseconds(currEvent.start.dateTime);
        }
        else {
          console.log('split currEvent');
          gapi.setEndTime(currEvent, startingFrom);
        }
      }
      console.log('startingFrom: ', startingFrom);

      // will not delete current task event
      gapi.deleteAllFromCalendarAfter(startingFrom);

      gapi.getFreetimes(startingFrom, function(freetimes) {
        todos = Meteor.user().todoList(freetimes);
        todos.forEach(function(todo) {
          gapi.addEventToCalendar()(todo);
        });
      });
    });

  });
};

gapi.splitEvent = function (e, splitTime) {
  // console.log('e: ', e);
  // console.log('e.start: ', e.start);
  // console.log('e.start.dateTime: ', e.start.dateTime);
  // console.log('new Date(e.start.dateTime): ', new Date(e.start.dateTime));

  var startTime = new Date(e.start.dateTime);
  var event1 = R.cloneDeep(e);
  var event2 = R.cloneDeep(e);
  // console.log('event1: ', event1);
  // console.log('event2: ', event2);

  event1.end.dateTime   = Date.formatGoog(new Date(splitTime));
  event2.start.dateTime = Date.formatGoog(new Date(splitTime));
  // console.log('event1: ', event1);
  // console.log('event2: ', event2);

  return [event1, event2];
};

// takes in an event and a new end time
gapi.setEndTime = function (e, newEndTime) {
  console.log('e, newEndTime: ', e, newEndTime);
  console.log('e: ', e);
  e.end.dateTime = Date.formatGoog(new Date(newEndTime));
  console.log('e: ', e);

  gapi.removeEventFromCalendar()(e.id);
  gapi.addEventToCalendar()(e);
};

// 'Dunmo Tasks' events channel
gapi.createChannel = function () {
  gapi.onAuth(function() {
    var name = 'Dunmo Tasks';

    var cal = Meteor.user().taskCalendar();
    if(!cal) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.watch({
        'calendarId'  : cal.googleCalendarId,
        'showDeleted' : true,
        'id'          : 'googlesucks-' + String(Math.random()).substring(2),
        'type'        : 'web_hook',
        'address'     : CONFIG.urls.calendarWatchUrl
      });

      request.execute(function(res) {
        // console.log('res: ', res);

        Meteor.user().update({ watchObj: res.request });
      });
    });
  });
};

gapi.test = function () {
  // console.log('testall');
  gapi.onAuth(function () {
    // console.log('onauth');
    // gapi.deleteAllFutureFromCalendar();
    gapi.getFreetimes(function (freetimes) {
      // console.log('freetimes: ', freetimes);
      todos = Meteor.user().todoList(freetimes);
      // console.log('todos: ', todos);
    });
  });
};

gapi.checkIsDone = function (taskEvent) {
  var task   = Tasks.findOne({ gcalEventIds: taskEvent.id });
  var isDone = taskEvent.summary.trim().charAt(0) === '*';
  task.update({ isDone: isDone });
};
