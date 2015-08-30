
// Global Helpers
Router = FlowRouter;

Router.hasRoute = function (path) {
  return Router._routes.any(function (route) {
    return route.path === path;
  });
};

// Local Helpers
var Layout = FlowLayout;

function checkForUser (context, redirect) {
  // only works because of meteorhacks:fast-render
  if(!Meteor.userId()) redirect('/login');
}

var redirect = _.curry(function (url, context, redirect) {
  // TODO: This is a hack; we shouldn't serve html files statically
  if(url.substring(url.length - 5) === '.html') window.location.href = url;
  else redirect(url);
});

var renderLayout = _.curry(function (layout, view, nav, header) {
  Layout.render(layout, { main: view, nav: nav, header: header });
});

var renderWithDefaultLayout = renderLayout('layout', _, 'nav', 'basicHeader');
var renderWithNewLayout = renderLayout('layoutNew', _, 'sidebar', 'topbar');

Router.notfound = {
  action: function (params) {
    Layout.render('notFound');
  },
};

Router.triggers.enter([checkForUser], { except: ['login', 'root', 'landing', 'onboardingTest'] });

Router.route('/', {
  name: 'root',
  triggersEnter: [function (context, redirect) {
    if(Meteor.userId()) redirect('/tasks');
    else                redirect('/landing');
  }]
});

Router.route('/landing', {
  name: 'landing',
  triggersEnter: [redirect('/index.html')]
});

var fullViews = ['login'];
fullViews.forEach(function (view) {
  Router.route('/' + view, {
    name: view,
    action: function (params) {
      Layout.render('layout', { main: view, nav: null, header: null });
    }
  });
});

['taskView', 'snoozedTaskView', 'referralView', 'calendarSettings'].forEach(function (view) {
  Router.route('/' + view, {
    name: view,
    action: function (params) {
      renderWithDefaultLayout(view);
    }
  });
});

Router.route('/onboardingTest', {
  name: 'onboardingTest',
  action: function (params) {
    Layout.render('layout', { main: 'onboardingTest', header: 'basicHeader' });
  }
});

////////////////
// New Routes //
////////////////

Router.route('/app', {
  name: 'app',
  triggersEnter: [redirect('/tasks')]
});

Router.route('/agenda', {
  name: 'agenda',
  action: function (params) {
    Session.get('active-sidebar-section', 'agenda');
    renderWithNewLayout('agenda');
  }
});

// task views
Router.route('/tasks/:filter', {
  name: 'tasks',
  triggersEnter: [function (context, redirect) {
    var allowedFilters = ['all', 'completed', 'trash'];
    if(! _.contains(allowedFilters, context.params.filter)) redirect('/tasks/all');
  }],
  action: function (params) {
    Session.set('active-sidebar-section', 'tasks');
    Session.set('task-filter', params.filter);
    renderWithNewLayout('tasks');
  }
});

// project views
Router.route('/projects/archived', {
  name: 'projects/archived',
  action: function (params) {
    Session.get('active-sidebar-section', 'projects');
    Session.set('project-filter', 'archived');
    renderWithNewLayout('archivedProjects');
  }
});

Router.route('/projects/:id', {
  name: 'project',
  action: function (params) {
    Session.get('active-sidebar-section', 'projects');
    Session.set('current-project', params.id);
    renderWithNewLayout('project');
  }
});
