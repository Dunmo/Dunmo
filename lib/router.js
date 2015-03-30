
// Global
Router = FlowRouter;
console.log('Router: ', Router);

Router.hasRoute = function (path) {
  console.log('this: ', this);
  return Router._routes.any(function (route) {
    return route.path === path;
  });
};

// Local
var Layout = FlowLayout;

var checkForUser = function(path, next) {
  // this works only because the use of Fast Render
  var redirectPath = !Meteor.userId() ? '/login' : null;
  next(redirectPath);
};

Router.notfound = {
  action: function (params) {
    // render a public url

    // else show 404 page
  }
};

Router.route('/', {
  action: function (params) {
    console.log('this: ', this);
    if(Meteor.userId()) Router.go('/taskView');
    else                window.location.href = '/index.html';
    // TODO: how to wrap Router.go so that no need for window.location.href?
  }
});

var fullViews = ['login'];
fullViews.forEach(function (view) {
  Router.route('/' + view, {
    action: function (params) {
      Layout.render('layout', { main: view, header: null });
    }
  });
});

var authedViews = ['gettingStarted', 'taskView', 'calendarSettings'];
authedViews.forEach(function (view) {
  Router.route('/' + view, {
    middlewares: [checkForUser],

    action: function(params) {
      Layout.render('layout', { main: view, header: 'basicHeader' });
    }
  });
});
