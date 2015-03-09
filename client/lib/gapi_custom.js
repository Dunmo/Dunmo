
var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var apiKey = 'AtwQ5-FSiXOk72t0L0QCzQux';
var scopes = 'https://www.googleapis.com/auth/calendar';

var GLOBAL_MIN_TIME = 0;

gapi.handleClientLoad = function () {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
  gapi.checkAuth();
}

gapi.checkAuth = function () {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
      handleAuthResult);
}

gapi.handleAuthResult = function (callback, doc) {
  return function(authResult) {
    if (authResult) {
      callback(doc);
    } else {
      console.log('auth failed');
    }
  };
}

gapi.handleAuthClick = function (callback, doc) {
  return function(event) {
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: false
    }, gapi.handleAuthResult(callback, doc));

    return false;
  }
}

gapi.getCalendars = function () {
  gapi.handleAuthClick(function () {
    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.calendarList.list({
        'calendarId': 'primary'
      });

      request.execute(function(resp) {
        Calendars.updateOrCreate(resp.items);
      });
    });
  })();
};

gapi.createDunmoCalendar = function () {
  var name = 'Dunmo Tasks';

  return function() {
    if( Calendars.findOne({ ownerId: Meteor.userId(), summary: name }) ) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.calendars.insert({
        'summary': name
      });

      request.execute(function(res) {
        res.googleCalendarId = res.id;
        res.ownerId          = Meteor.userId();

        Calendars.updateOrCreate(res);
      });
    });
  };
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

gapi.getAllFutureFromCalendar = function (callback) {
  var name = 'Dunmo Tasks';

  if( !callback ) {
    console.log('getAllFutureFromCalendar: no callback supplied. must be called asynchronously');
    return;
  }
  var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
  if(!cal) {
    console.log('getAllFutureFromCalendar: ', cal, ' not found.');
    return;
  }

  console.log('cal: ', cal);

  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.events.list({
      'calendarId': cal.googleCalendarId
    });

    request.execute(function(res) {
      var items = res.items;
      var now = Date.now();
      items = lodash.filter(items, function(ev) {
        return Number(new Date(ev.start.dateTime)) > now;
      });
      callback(items);
    });
  });
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

  console.log('cal: ', cal);

  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.events.list({
      'calendarId': cal.googleCalendarId
    });

    request.execute(function(res) {
      var items = res.items;
      items = lodash.filter(items, function(ev) {
        return isHappeningNow(ev);
      });
      var item = items[0]
      callback(item);
    });
  });
};

// minTime is a Number of Milliseconds
gapi.deleteAllFromCalendarAfter = function (minTime) {
  gapi.handleAuthClick(gapi.getAllFromCalendarAfter(minTime, function(events) {
    events.forEach(function (e) {
      gapi.removeEventFromCalendar()(e.id);
    });
  }))();
};

function isHappeningNow(event) {
  if( !event ) return false;
  var start = Date.ISOToMilliseconds(event.start.dateTime);
  var end = Date.ISOToMilliseconds(event.end.dateTime);
  var now = Date.now();
  return start < now && now < end;
};

gapi.deleteAllFutureFromCalendar = function (callback) {
  gapi.getAllFutureFromCalendar(function(events) {
    var first, second;
    first = events[0];
    if(isHappeningNow(first)) {
      var ret = gapi.splitEvent(first, Date.now());
      first   = ret[0];
      second  = ret[1];
      events[0] = second;
    }
    events.forEach(function (e) {
      gapi.removeEventFromCalendar()(e.id);
    });
  });
};

gapi.addEventToCalendar = function () {
  var name = 'Dunmo Tasks';

  return function(doc) {
    var cal = Calendars.findOne({ ownerId: Meteor.userId(), summary: name });
    if( !cal ) return;

    console.log('doc.start: ', doc.start);
    console.log('doc.end: ', doc.end);

    if(!doc.summary) doc.summary = doc.title;
    doc.start = Date.formatGoog(new Date(doc.start));
    doc.end = Date.formatGoog(new Date(doc.end));

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.insert({
        'calendarId': cal.googleCalendarId,
        'start': {
          'dateTime': doc.start
        },
        'end': {
          'dateTime': doc.end
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
    console.log('calendar: ', calendar);
    calendar.busy.forEach(function(busy) {
      busy.start = moment(busy.start)._d;
      busy.end   = moment(busy.end)._d;
      busytimes.push(busy);
    });
  });
  console.log('busytimes: ', busytimes);
  return busytimes;
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

  var startTimes = lodash.pluck(busytimes, 'start');
  var endTimes = lodash.pluck(busytimes, 'end');

  console.log('startTimes: ', startTimes);
  console.log('endTimes: ', endTimes);

  // var currentTime = minTime;
  var freetimes  = [];
  var startQueue = 0;
  var startIndex = 0;
  var endIndex   = 0;

  freetimes.push({
    start: minTime,
    end:   startTimes[startIndex]
  });

  while(startIndex < startTimes.length && endIndex < endTimes.length) {
    if(startTimes[startIndex] < endTimes[endIndex]) {
      startQueue++;
      startIndex++;
    } else {
      startQueue--;
      if(startQueue == 0) {
        freetimes.push({
          start: endTimes[endIndex],
          end:   startTimes[startIndex + 1]
        });
      }
      endIndex++;
    }
  }

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
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: false
  }, function(authResult) {
    if (!authResult) {
      console.log('auth failed');
      return;
    }

    gapi.client.load('calendar', 'v3', callback);
  });
};

// callback is given the list of freetimes as an array
// callback(freetimes)
gapi.getFreetimes = function (startingFrom, callback) {
  var items = Meteor.user().calendarIdObjects();

  var minTime;
  if (typeof(startingFrom) === 'function') {
    minTime = Date.now();
    callback = startingFrom;
  } else {
    minTime = startingFrom;
  }

  var maxTime = Meteor.user().latestTaskTime();
  if( !maxTime || maxTime < minTime) {
    callback([]);
    return;
  }

  var request = gapi.client.calendar.freebusy.query({
    'timeMin': Date.formatGoog(new Date(minTime)),
    'timeMax': Date.formatGoog(new Date(maxTime)),
    'items': items
  });

  request.execute(function(res) {
    var calendars = res.result.calendars;
    // console.log('calendars: ', calendars);

    var busytimes = getBusytimes(calendars);
    busytimes = _.sortBy(busytimes, 'start');
    busytimes = _.sortBy(busytimes, 'end');

    var freetimes = toFreetimes(busytimes, minTime, maxTime);

    callback(freetimes);
  });
};

gapi.syncTasksWithCalendar = function (startingFrom) {
  startingFrom = startingFrom || Date.now();

  gapi.onAuth(function() {
    // gapi.fixDoneTasks();

    gapi.deleteAllFutureFromCalendar();

    gapi.getFreetimes(startingFrom, function(freetimes) {
      gapi.getCurrentTaskEvent(function(currEvent) {
        if(currEvent) {
          var firstTask = Meteor.user().sortedTodos()[0];
          if( firstTask && _.contains(firstTask.gcalEventIds, currEvent.id) ){
            console.log('current currEvent is fine');
            // adjust first freetime
            var currEventEnd = Number(new Date(currEvent.end.dateTime));
            freetimes[0].start = currEventEnd;
          }
          else {
            console.log('split currEvent');
            var ret    = gapi.splitEvent(currEvent, startingFrom);
            var first  = ret[0];
            // var second = ret[1];

            first.start = Number(new Date(first.start.dateTime));
            first.end   = Number(new Date(first.end.dateTime));

            console.log('first: ', first);

            gapi.removeEventFromCalendar()(currEvent.id);
            gapi.addEventToCalendar()(first);
          }
        }

        console.log("freetimes: ", freetimes);
        todos = Meteor.user().todoList(freetimes);
        console.log('todos: ', todos);
        todos.forEach(function(todo) {
          console.log('todo: ', todo);
          gapi.addEventToCalendar()(todo);
        });
      });
    });

  });
};

gapi.splitEvent = function (e, splitTime) {
  console.log('e: ', e);
  console.log('e.start: ', e.start);
  console.log('e.start.dateTime: ', e.start.dateTime);
  console.log('new Date(e.start.dateTime): ', new Date(e.start.dateTime));

  var startTime = new Date(e.start.dateTime);
  var event1 = R.cloneDeep(e);
  var event2 = R.cloneDeep(e);
  console.log('event1: ', event1);
  console.log('event2: ', event2);

  event1.end.dateTime   = Date.formatGoog(new Date(splitTime));
  event2.start.dateTime = Date.formatGoog(new Date(splitTime));
  console.log('event1: ', event1);
  console.log('event2: ', event2);

  return [event1, event2];
};

// 'Dunmo Tasks' events channel
gapi.createChannel = function () {
  gapi.onAuth(function() {
    var name = 'Dunmo Tasks';

    var cal = Calendars.findOne({ summary: name });
    if(!cal) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.watch({
        'calendarId'  : cal.googleCalendarId,
        'showDeleted' : true,
        'id'          : 'googlesucks-58947528974',
        'type'        : 'web_hook',
        'address'     : 'https://3cce1d41.ngrok.com/calendar/watch'
      });

      request.execute(function(res) {
        console.log('res: ', res);
      });
    });
  });
};

gapi.test = function () {
  console.log('testall');
  gapi.onAuth(function () {
    console.log('onauth');
    // gapi.deleteAllFutureFromCalendar();
    gapi.getFreetimes(function (freetimes) {
      console.log('freetimes: ', freetimes);
      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);
    });
  });
};
