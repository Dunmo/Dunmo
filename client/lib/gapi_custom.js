
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

gapi.getAllFromCalendarAfter = function (name, minTime, callback) {
  var cal = Calendars.findOne({ summary: name });
  if(!cal) return;

  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.events.list({
      'calendarId': cal.googleCalendarId
    });

    request.execute(function(res) {
      var items = res.items;
      var now = Date.now();
      items = lodash.filter(items, function(ev) {
        var startTime = Number(new Date(ev.start.dateTime));
        var endTime = Number(new Date(ev.end.dateTime));

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
}

gapi.syncTasksWithCalendar = function () {

  gapi.onAuth(function() {
    var items = Meteor.user().calendarIdObjects();

    var minTime = Date.now();
    var maxTime = Meteor.user().latestTaskTime();
    console.log('maxTime: ', maxTime);
    if(maxTime < minTime) return;

    gapi.deleteAllFromCalendarAfter('Dunmo Tasks', minTime);

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

      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);

      todos.forEach(function(todo) {
        console.log('todo: ', todo);
        gapi.addEventToCalendar('Dunmo Tasks')(todo);
      });
    });
  });

};


gapi.testAll = function () {

  gapi.onAuth(function () {
    var items = Meteor.user().calendarIdObjects();

    var minTime = Date.now();
    var maxTime = Meteor.user().latestTaskTime();
    console.log('maxTime: ', maxTime);
    if(maxTime < minTime) return;

    gapi.deleteAllFromCalendarAfter('Dunmo Tasks', minTime);

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

      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);

      todos.forEach(function(todo) {
        console.log('todo: ', todo);
        gapi.addEventToCalendar('Dunmo Tasks')(todo);
      });
    });
  });

};
