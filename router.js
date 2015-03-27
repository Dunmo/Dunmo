
Router.configure({
  layoutTemplate: 'layout'
});

if(Meteor.isClient) {
  var checkForUser = function() {
    if ( this.request.url != '/' && !(Meteor.loggingIn() || Meteor.user()) ) {
      this.redirect('/login');
    }
    this.next();
  };

  Router.onBeforeAction(checkForUser);
}

Router.route('/', function () {
  if(Meteor.user()) this.redirect('/taskView');
  else              this.redirect('/index.html');
});

var fullViews = ['login', 'gettingStarted', 'taskView', 'calendarSettings'];
fullViews.forEach(function (view) {
  Router.route('/' + view);
});

Router.route('/api/emails/:userId', {where: 'server'})
  .get(function () {
    var req = this.request;
    var res = this.response;

    // get the email for the user id
    var id    = this.params.userId;
    // var user  = Meteor.users.findOne(id);
    // var email = user.primaryEmailAddress();
    var email = Emails.findOne({ userId: id });
    var ret;
    if(email) ret = { email: email };
    else      ret = { email: null  };

    ret = JSON.stringify(ret);
    res.end(ret);
  });

Router.route('/api/emails', {where: 'server'})
  .get(function () {
    var req = this.request;
    var res = this.response;

    // get all emails
    var emails = Emails.find({}).fetch();
    emails = JSON.stringify(emails);
    res.end(emails);
  })
  .post(function () {
    var req  = this.request;
    var res  = this.response;
    var body = req.body;
    if(!body) res.end();

    var userId = body._id || body.userId || null;
    var email;
    if     (body.email)                    email = body.email;
    else if(body.primaryEmailAddress)      email = body.primaryEmailAddress();
    else if(body.emails && body.emails[0]) email = body.emails[0].address;

    var retId = Emails.create({
      userId : userId,
      email  : email
    });

    var ret = Emails.findOne(retId);
    ret = JSON.stringify(ret);

    res.end(ret);
  });

Router.route('/email/receive', function () {
  var req = this.request;
  var res = this.response;
  var user_addr = req.body.Sender;
  var text = req.body['Text-part'];
  var user = Meteor.users.findOne({ 'services.google.email': user_addr });

  // console.log("user_addr: ", user_addr);

  Tasks.create(text, { 'ownerId': user._id });
  res.end();
}, {where: 'server'});

Router.route(CONFIG.urls.calendarWatchPath, {where: 'server'})
.post(function () {
  var req = this.request;
  var res = this.response;
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

Router.route('/calendarWatchMessages', function () {
  var res = this.response;
  var ret = CalendarWatchMessages.find().fetch();
  ret = JSON.stringify(ret);
  res.end(ret);
}, {where: 'server'});

