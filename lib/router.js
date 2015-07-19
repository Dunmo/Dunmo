
// Global
Router = FlowRouter;

Router.hasRoute = function (path) {
  return Router._routes.any(function (route) {
    return route.path === path;
  });
};

// Local
var Layout = FlowLayout;

var checkForUser = function(path, next) {
  // this works only because the use of Fast Render
  if(!Meteor.userId()) Router.go('/login');
};

Router.notfound = {
  action: function (params) {
    // render a public url

    // else show 404 page
  }
};

Router.route('/', {
  action: function (params) {
    if(Meteor.userId()) Router.go('/taskView');
    else                window.location.href = '/index.html';
    // TODO: how to wrap Router.go so that no need for window.location.href?
  }
});

var fullViews = ['login'];
fullViews.forEach(function (view) {
  Router.route('/' + view, {
    action: function (params) {
      Layout.render('layout', { main: view, nav: null, header: null });
    }
  });
});

var authedViews = ['taskView', 'snoozedTaskView', 'referralView', 'calendarSettings'];
authedViews.forEach(function (view) {
  Router.route('/' + view, {
    triggersEnter: [checkForUser],

    action: function(params) {
      Layout.render('layout', { main: view, nav: 'nav', header: 'basicHeader' });
    }
  });
});

Router.route('/onboardingTest', {
  action: function(params) {
    Layout.render('layout', { main: 'onboardingTest', header: 'basicHeader' });
  }
});

Router.route('/new-app', {
  action: function(params) {
    Layout.render('layoutNew', { nav: 'sidebar', header: 'topbar' })
  }
})
