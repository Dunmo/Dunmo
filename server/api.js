
var Router = Picker;

var GET    = Router.filter(function(req, res) { return req.method == "GET"    });
var POST   = Router.filter(function(req, res) { return req.method == "POST"   });
var PUT    = Router.filter(function(req, res) { return req.method == "PUT"    });
var DELETE = Router.filter(function(req, res) { return req.method == "DELETE" });

GET.route('/api/emails/:userId', function (params, req, res, next) {
  // get the email for the user id
  var id = params.userId;

  // var user  = Meteor.users.findOne(id);
  // var email = user.primaryEmailAddress();
  var email = Subscribers.findOne({ userId: id });
  var ret;
  if(email) ret = { email: email };
  else      ret = { email: null  };

  ret = JSON.stringify(ret);
  res.end(ret);
});

GET.route('/api/emails', function (params, req, res, next) {
  // get all emails
  var emails = Subscribers.fetch();
  emails     = JSON.stringify(emails);
  res.end(emails);
});

POST.route('/api/emails/:email', function (params, req, res, next) {
  // var body = req.body;
  // if(!body) res.end();
  // var userId = body._id || body.userId || null;
  // var email;
  // if     (body.email)                    email = body.email;
  // else if(body.primaryEmailAddress)      email = body.primaryEmailAddress();
  // else if(body.emails && body.emails[0]) email = body.emails[0].address;

  var email        = params.email;
  var subscriberId = Subscribers.create(email);
  var subscriber   = Subscribers.findOne(subscriberId);
  subscriber       = JSON.stringify(subscriber);
  res.end(subscriber);
});

GET.route('/email/receive', function (params, req, res, next) {
  var user_addr = req.body.Sender;
  var text = req.body['Text-part'];
  var user = Meteor.users.findOne({ 'services.google.email': user_addr });

  Tasks.create(text, { 'ownerId': user._id });
  res.end();
});

POST.route(CONFIG.urls.calendarWatchPath, function (params, req, res, next) {
  // console.log('req: ', req);
  // console.log('res: ', res);

  // console.log('req.body: ', req.body);
  // req = JSON.stringify(req);
  // res = JSON.stringify(res);

  // CalendarWatchMessages.insert({ req: req, res: res });

  // switch case for type of change
  var c = 0;
  switch(c) {
    case 0: // deleted
      // if task event, snooze
      // if future other event, re-sync
      break;
    case 1: // resize
      // if future task event, re-sync after old endtime
      // if past task event && new endtime is after now, re-sync after old endtime
      // if future other event, re-sync
      break;
    case 2: // moved
      // if task event moved from the past to the past, nothing
      // if task event moved from the past to the current time, re-sync after new starttime
      // if task event moved from the past to the future, re-sync after new starttime

      // if task event moved from the current time to the past, nothing
      // if task event moved from the current time to the current time, shifted back, nothing
      // if task event moved from the current time to the current time, shifted ahead, re-sync after now
      // if task event moved from the current time to the future, re-sync after old endtime

      // if task event moved from the future to the past, re-sync after old starttime
      // if task event moved from the future to the current time, re-sync after new starttime
      // if task event moved from the future to the future, shifted back, re-sync after new starttime
      // if task event moved from the future to the future, shifted ahead, re-sync after old starttime

      // if other event, re-sync
      break;
  }

  res.end();
});

GET.route('/calendarWatchMessages', function (params, req, res, next) {
  var ret = CalendarWatchMessages.find().fetch();
  ret = JSON.stringify(ret);
  res.end(ret);
});
