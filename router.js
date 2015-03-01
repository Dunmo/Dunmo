Router.configure({
  layoutTemplate: 'layout'
});

var checkForUser = function() {
  if (!(Meteor.loggingIn() || Meteor.user())) {
    this.redirect('/login');
  }
  this.next();
};

// Router.onBeforeAction(checkForUser);

Router.route('/', function () {
  this.redirect('/login');
});

Router.route('/login', function () {
  // if (Meteor.user()) {
  //   this.redirect('/');
  // }
  this.render('login');
});

Router.route('/loggedIn');

Router.route('/email/receive', function () {
  var req = this.request;
  var res = this.response;
  console.log("Request body", req.body);
  Tasks.create(req.body, { ownerId: this.userId() });
  res.sendStatus(200);
  res.end();
}, {where: 'server'});