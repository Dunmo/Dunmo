var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var apiKey = 'AtwQ5-FSiXOk72t0L0QCzQux';
var scopes = 'https://www.googleapis.com/auth/calendar';

var TODOS = [];

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
  checkAuth();
}

function checkAuth() {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
      handleAuthResult);
}

function handleAuthResult(callback, doc) {
  return function(authResult) {
    // var authorizeButton = document.getElementById('authorize-button');
    if (authResult) {
      // authorizeButton.style.visibility = 'hidden';
      callback(doc);
    } else {
      console.log('auth failed');
      // authorizeButton.style.visibility = '';
    }
  };
}

function handleAuthClick(callback, doc) {
  return function(event) {
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: false
    }, handleAuthResult(callback, doc));

    return false;
  }
}

function getCalendars() {
  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.calendarList.list({
      'calendarId': 'primary'
    });

    request.execute(function(resp) {
      console.log('resp: ', resp);
      Calendars.updateOrCreate(resp.items);

      // for (var i = 0; i < resp.items.length; i++) {
      //   console.log('resp.items[i]: ', resp.items[i]);
      // }
    });
  });
};

function createCalendar(name) {
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

function deleteCalendar(name) {
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

function formatGoog(d) {
  console.log('d: ', d);
  d.setFullYear(2015);
  console.log('d: ', d);
  return d.toISOString();
};

function addEventToCalendar(name) {
  return function(doc) {
    var cal = Calendars.findOne({ summary: name });
    if( !cal ) return;

    if(!doc.summary) doc.summary = doc.title;
    doc.start = formatGoog(doc.start);
    doc.end = formatGoog(doc.end);

    // var doc = {
    //   start:   '2015-03-01T05:00:00.000-05:00',
    //   end:     '2015-03-01T06:30:00.000-05:00',
    //   summary: 'task no. 5'
    // };

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

function getFreetimes() {
  gapi.client.load('calendar', 'v3', function() {
    var items = Meteor.user().calendarIdObjects();

    var minTime = Date.now();
    var latestTask = lodash.max(Meteor.user().tasks().fetch(), 'dueAt');
    console.log('latestTask: ', latestTask);
    var maxTime = latestTask.dueAt;
    console.log('maxTime: ', maxTime);
    if(maxTime < minTime) return;

    var request = gapi.client.calendar.freebusy.query({
      'timeMin': '2015-03-02T00:00:00.000Z',
      'timeMax': '2015-03-06T00:00:00.000Z',
      'items': items
    });

    request.execute(function(res) {
      var calendars = res.result.calendars;
      // console.log('calendars: ', calendars);
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

      busytimes = _.sortBy(busytimes, 'start');
      busytimes = _.sortBy(busytimes, 'end');

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
        return ft;
      });

      console.log('freetimes: ', freetimes);
      // Meteor.user().update({ freetimes: freetimes });
      todos = Meteor.user().todoList(freetimes);
      console.log('todos: ', todos);

      todos.forEach(function(todo) {
        console.log('todo: ', todo);
        addEventToCalendar('Dunmo Tasks')(todo);
      });
    });
  });
};

Template.gapiExample.helpers({
  'calendars' : function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  },

  'tasks' : function() {
    return Tasks.find({ ownerId: Meteor.userId() })
  }
});

Template.gapiExample.events({
  'click #getCalendars' : handleAuthClick(getCalendars),
  'click #getFreetimes' : handleAuthClick(getFreetimes),
  'click #insertCalendar' : handleAuthClick(createCalendar('Dunmo Tasks')),
  'click #deleteCalendar' : handleAuthClick(deleteCalendar('Dunmo Tasks')),
  'click #addEvent' : handleAuthClick(addEventToCalendar('Dunmo Tasks')),
  'click #addTask' : function(e) {
    e.preventDefault();
    var str = $('#taskInput').val();
    console.log('str: ', str);
    Tasks.create(str, { ownerId: Meteor.userId() });
  }
});
