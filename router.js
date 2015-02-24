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
