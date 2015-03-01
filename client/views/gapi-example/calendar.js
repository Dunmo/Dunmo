var clientId = '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com';
var apiKey = 'AtwQ5-FSiXOk72t0L0QCzQux';
var scopes = 'https://www.googleapis.com/auth/calendar';

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
  checkAuth();
}

function checkAuth() {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
      handleAuthResult);
}

function handleAuthResult(callback) {
  return function(authResult) {
    // var authorizeButton = document.getElementById('authorize-button');
    if (authResult) {
      // authorizeButton.style.visibility = 'hidden';
      callback();
    } else {
      console.log('auth failed');
      // authorizeButton.style.visibility = '';
    }
  };
}

function handleAuthClick(callback) {
  return function(event) {
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: false
    }, handleAuthResult(callback));

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

function addEventToCalendar(name) {
  return function() {
    var cal = Calendars.findOne({ summary: name });
    if( !cal ) return;

    var doc = {
      start:   '2015-03-01T05:00:00.000-05:00',
      end:     '2015-03-01T06:30:00.000-05:00',
      summary: 'task no. 5'
    };

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

    var minTime = new Date('2015-03-02');
    var maxTime = new Date('2015-03-06');

    var request = gapi.client.calendar.freebusy.query({
      'timeMin': '2015-03-02T00:00:00.000Z',
      'timeMax': '2015-03-06T00:00:00.000Z',
      // 'timeZone': string,
      // 'groupExpansionMax': integer,
      // 'calendarExpansionMax': integer,
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
          busy.start = moment(busy.start);
          busy.end   = moment(busy.end);
          busytimes.push(busy);
        });
      });
      console.log('busytimes: ', busytimes);

    });
  });
};

Template.gapiCalendar.helpers({
  'calendars' : function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  }
});

Template.gapiCalendar.events({
  'click #getCalendars' : handleAuthClick(getCalendars),
  'click #getFreetimes' : handleAuthClick(getFreetimes),
  'click #insertCalendar' : handleAuthClick(createCalendar('Dunmo Tasks')),
  'click #deleteCalendar' : handleAuthClick(deleteCalendar('Dunmo Tasks')),
  'click #addEvent' : handleAuthClick(addEventToCalendar('Dunmo Tasks'))
});
