
// Global
Router = FlowRouter;

Router.hasRoute = function (path) {
  return Router._routes.any(function (route) {
    return route.path === path;
  });
};

// Local
var Layout = FlowLayout;

function checkForUser (path, next) {
  // this works only because the use of Fast Render
  if(!Meteor.userId()) Router.go('/login');
}

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

    action: function (params) {
      Layout.render('layout', { main: view, nav: 'nav', header: 'basicHeader' });
    }
  });
});

Router.route('/onboardingTest', {
  action: function (params) {
    Layout.render('layout', { main: 'onboardingTest', header: 'basicHeader' });
  }
});

////////////////
// New Routes //
////////////////

Router.route('/agenda', {
  action: function (params) {
    Layout.render('layoutNew', { main: 'agenda', nav: 'sidebar', header: 'topbar' })
  }
});

Router.route('/tasks', {
  action: function (params) {
    Router.go('/tasks/all');
  }
});

// task views
var newTaskViews = ['all', 'completed', 'trash']
newTaskViews.forEach(function (view) {
  Router.route('/tasks/' + view, {
    action: function (params) {
      Session.set('task-filter', view);
      Layout.render('layoutNew', { main: 'tasks', nav: 'sidebar', header: 'topbar' });
    }
  });
});
