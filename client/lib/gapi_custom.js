
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
        console.log('resp: ', resp);
        Calendars.updateOrCreate(resp.items);
      });
    });
  })();
};

gapi.createCalendar = function (name) {
  return function() {
    if( Calendars.findOne({ summary: name }) ) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.calendars.insert({
        'summary': name
      });

      request.execute(function(res) {
        console.log('res: ', res);
        var data              = {};
        data.summary          = res.summary;
        data.googleCalendarId = res.id;
        data.ownerId          = Meteor.userId();

        Calendars.updateOrCreate(data);
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
        console.log('res: ', res);
        Calendars.remove(cal._id);
      });
    });
  };
};

gapi.getAllFutureFromCalendar = function (name, callback) {
  if(typeof name !== 'string') {
    console.log('getAllFutureFromCalendar: name should be a string, received ', name);
    return;
  }
  if( !callback ) {
    console.log('getAllFutureFromCalendar: no callback supplied. must be called asynchronously');
    return;
  }
  var cal = Calendars.findOne({ summary: name });
  if(!cal) {
    console.log('getAllFutureFromCalendar: ', cal, ' not found.');
    return;
  }

  console.log('cal: ', cal);

  gapi.client.load('calendar', 'v3', function() {
    console.log('cal.googleCalendarId: ', cal.googleCalendarId);
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

// minTime is a Number of Milliseconds
gapi.deleteAllFromCalendarAfter = function (name, minTime) {
  gapi.handleAuthClick(gapi.getAllFromCalendarAfter(name, minTime, function(events) {
    console.log('events: ', events);
    events.forEach(function (e) {
      gapi.removeEventFromCalendar('Dunmo Tasks')(e.id);
    });
  }))();
};

function isHappeningNow(event) {
  if( !event ) return false;
  var start = Date.ISOToMilliseconds(event.start.dateTime);
  var end = Date.ISOToMilliseconds(event.end.dateTime);
  var now = Date.now();
  console.log('start: ', start);
  console.log('end: ', end);
  console.log('now: ', now);
  return start < now && now < end;
};

gapi.deleteAllFutureFromCalendar = function (name, callback) {
  gapi.getAllFutureFromCalendar(name, function(events) {
    var first, second;
    first = events[0];
    console.log('first: ', first);
    console.log('isHappeningNow(first): ', isHappeningNow(first));
    if(isHappeningNow(first)) {
      var ret = gapi.splitEvent(first, Date.now());
      first   = ret[0];
      second  = ret[1];
      console.log('first: ', first);
      console.log('second: ', second);
      events[0] = second;
    }
    console.log('events: ', events);
    events.forEach(function (e) {
      gapi.removeEventFromCalendar('Dunmo Tasks')(e.id);
    });
  });
};

gapi.addEventToCalendar = function (name) {
  return function(doc) {
    var cal = Calendars.findOne({ summary: name });
    if( !cal ) return;

    if(!doc.summary) doc.summary = doc.title;
    doc.start = Date.formatGoog(doc.start);
    doc.end = Date.formatGoog(doc.end);

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
      });
    });
  };
};

gapi.removeEventFromCalendar = function(name) {
  return function(eventId) {
    var cal = Calendars.findOne({ summary: name });
    if(!cal) return;

    gapi.client.load('calendar', 'v3', function() {
      var request = gapi.client.calendar.events.delete({
        'calendarId': cal.googleCalendarId,
        'eventId': eventId
      });

      request.execute(function(res) {
        console.log('remove event res: ', res);
      });
    });
  };
};

gapi.getLatestTaskTime = function (calendar_name) {

}

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

  console.log('freetimes: ', freetimes);

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
gapi.getFreetimes = function (callback) {
  var items = Meteor.user().calendarIdObjects();
  console.log('items: ', items);

  var minTime = Date.now();
  var maxTime = Meteor.user().latestTaskTime();
  console.log('maxTime: ', maxTime);
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

gapi.syncTasksWithCalendar = function () {
  gapi.onAuth(function() {
    gapi.deleteAllFutureFromCalendar('Dunmo Tasks');

    gapi.getFreetimes(function(freetimes) {
      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);
      todos.forEach(function(todo) {
        console.log('todo: ', todo);
        gapi.addEventToCalendar('Dunmo Tasks')(todo);
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

gapi.test = function () {
  console.log('testall');
  gapi.onAuth(function () {
    console.log('onauth');
    // gapi.deleteAllFutureFromCalendar('Dunmo Tasks');
    gapi.getFreetimes(function (freetimes) {
      console.log('freetimes: ', freetimes);
      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);
    });
  });
};
