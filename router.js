
Router.configure({
  layoutTemplate: 'layout'
});

var checkForUser = function() {
  if (!(Meteor.loggingIn() || Meteor.user())) {
    this.redirect('/login');
  }
  this.next();
};

Router.onBeforeAction(checkForUser);

Router.route('/', function () {
  this.redirect('/index.html');
});

var views = ['login', 'gapiExample', 'gettingStarted', 'calendarSettings', 'taskView'];
views.forEach(function (view) {
  Router.route('/' + view);
});

Router.route('/email/receive', function () {
  var req = this.request;
  var res = this.response;
  var user_addr = req.body.Sender;
  var text = req.body['Text-part'];
  var user = Meteor.users.findOne({ 'services.google.email': user_addr });

  console.log("user_addr: ", user_addr);

  Tasks.create(text, { 'ownerId': user._id });
  res.end();
}, {where: 'server'});

Router.route(CONFIG.urls.calendarWatchPath, function () {
  var req = this.request;
  var res = this.response;
  console.log('req: ', req);
  console.log('res: ', res);

  console.log('req.body: ', req.body);

  res.end();
});

Router.route('/calendarWatchMessages', function () {
  var res = this.response;
  var ret = CalendarWatchMessages.find().fetch();
  res.end(ret);
});

