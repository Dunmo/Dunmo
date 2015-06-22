
var Router = Picker;

var GET    = Router.filter(function(req, res) { return req.method == "GET"    });
var POST   = Router.filter(function(req, res) { return req.method == "POST"   });
var PUT    = Router.filter(function(req, res) { return req.method == "PUT"    });
var DELETE = Router.filter(function(req, res) { return req.method == "DELETE" });

GET.route('/api/subscribers/:userId', function (params, req, res, next) {
  var userId, ret, subscriber;

  userId     = params.userId;
  subscriber = Subscribers.findOne({ userId: userId });

  if(subscriber) ret = { subscriber: subscriber };
  else           ret = { subscriber: null  };

  ret = JSON.stringify(ret);
  res.end(ret);
});

// get all subscribers
GET.route('/api/subscribers', function (params, req, res, next) {
  var subscribers = Subscribers.fetch();
  subscribers     = JSON.stringify(subscribers);
  res.end(subscribers);
});

POST.route('/api/subscribers/:email', function (params, req, res, next) {
  var email        = params.email;
  var subscriberId = Subscribers.create(email);
  var subscriber   = Subscribers.findOne(subscriberId);
  subscriber       = JSON.stringify(subscriber);
  res.end(subscriber);
});

// GET.route('/emails/receive', function (params, req, res, next) {
//   var user_addr = req.body.Sender;
//   var text = req.body['Text-part'];
//   var user = Users.findOne({ 'services.google.email': user_addr });

//   Tasks.create(text, { 'ownerId': user._id });
//   res.end();
// });

// POST.route(CONFIG.urls.calendarWatchPath, function (params, req, res, next) {
//   // console.log('req: ', req);
//   // console.log('res: ', res);

//   // console.log('req.body: ', req.body);
//   // req = JSON.stringify(req);
//   // res = JSON.stringify(res);

//   // CalendarWatchMessages.insert({ req: req, res: res });

//   // switch case for type of change
//   var c = 0;
//   switch(c) {
//     case 0: // deleted
//       // if task event, snooze
//       // if future other event, re-sync
//       break;
//     case 1: // resize
//       // if future task event, re-sync after old endtime
//       // if past task event && new endtime is after now, re-sync after old endtime
//       // if future other event, re-sync
//       break;
//     case 2: // moved
//       // if task event moved from the past to the past, nothing
//       // if task event moved from the past to the current time, re-sync after new starttime
//       // if task event moved from the past to the future, re-sync after new starttime

//       // if task event moved from the current time to the past, nothing
//       // if task event moved from the current time to the current time, shifted back, nothing
//       // if task event moved from the current time to the current time, shifted ahead, re-sync after now
//       // if task event moved from the current time to the future, re-sync after old endtime

//       // if task event moved from the future to the past, re-sync after old starttime
//       // if task event moved from the future to the current time, re-sync after new starttime
//       // if task event moved from the future to the future, shifted back, re-sync after new starttime
//       // if task event moved from the future to the future, shifted ahead, re-sync after old starttime

//       // if other event, re-sync
//       break;
//   }

//   res.end();
// });

// GET.route('/calendarWatchMessages', function (params, req, res, next) {
//   var ret = CalendarWatchMessages.find().fetch();
//   ret = JSON.stringify(ret);
//   res.end(ret);
// });
