
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

function redirect (url) {
  return function (context, redirect) {
    redirect(url);
  };
}

Router.notfound = {
  action: function (params) {
    Layout.render('notFound');
  },
};

Router.route('/', {
  action: function (params) {
    if(Meteor.userId()) Router.go('/taskView');
    else                window.location.href = '/index.html';
    // TODO: how to wrap Router.go so that no need for window.location.href?
  }
});

Router.route('/landing', {
  action: function (params, redirect) {
    redirect('/index.html');
  }
})

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

Router.route('/app', {
  action: function (params, redirect) {
    redirect('/tasks');
  }
});

Router.route('/agenda', {
  triggersEnter: [checkForUser],
  action: function (params) {
    Session.get('active-sidebar-section', 'agenda');
    Layout.render('layoutNew', { main: 'agenda', nav: 'sidebar', header: 'topbar' })
  }
});

Router.route('/tasks', {
  triggersEnter: [checkForUser],
  action: function (params) {
    Router.go('/tasks/all');
  }
});

// task views
var newTaskViews = ['all', 'completed', 'trash']
newTaskViews.forEach(function (view) {
  Router.route('/tasks/' + view, {
    triggersEnter: [checkForUser],
    action: function (params) {
      Session.get('active-sidebar-section', 'tasks');
      Session.set('task-filter', view);
      Layout.render('layoutNew', { main: 'tasks', nav: 'sidebar', header: 'topbar' });
    }
  });
});

// project views
Router.route('/projects/archived', {
  triggersEnter: [checkForUser],
  action: function (params) {
    Session.get('active-sidebar-section', 'projects');
    Session.set('project-filter', 'archived');
    Layout.render('layoutNew', { main: 'archivedProjects', nav: 'sidebar', header: 'topbar' });
  }
});

Router.route('/projects/:id', {
  triggersEnter: [checkForUser],
  action: function (params) {
    Session.get('active-sidebar-section', 'projects');
    Session.set('current-project', params.id);
    Layout.render('layoutNew', { main: 'project', nav: 'sidebar', header: 'topbar' });
  }
});
