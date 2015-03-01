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
  var user_addr = req.body.Sender;
  var text = req.body['Text-part'];
  var user = Meteor.users.findOne({ 'services.google.email': user_addr });

  console.log("user_addr: ", user_addr);

  Tasks.create(text, { 'ownerId': user._id });
  res.end();
}, {where: 'server'});

