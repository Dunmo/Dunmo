
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

var renderWithLayout = renderLayout('layoutNew', _, 'sidebar', 'topbar');
var renderWithNoLayout = renderLayout('layout', _, null, null);

Router.notfound = {
  action: function (params) {
    Layout.render('notFound');
  },
};

Router.triggers.enter([checkForUser], {
  except: [ 'login', 'root', 'landing', 'onboardingTest' ],
});

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

Router.route('/login', {
  name: 'login',
  action: function (params) {
    renderWithNoLayout('login');
  }
});

Router.route('/app', {
  name: 'app',
  triggersEnter: [redirect('tasks')]
});

Router.route('/tasks/:filter?', {
  name: 'tasks',
  triggersEnter: [function (context, redirect) {
    var allowedFilters = ['all', 'completed', 'trash'];
    if(! _.contains(allowedFilters, context.params.filter)) redirect('/tasks/all');
  }],
  action: function (params) {
    Session.set('active-sidebar-section', 'tasks');
    Session.set('task-filter', params.filter);
    renderWithLayout('tasks');
  }
});

['referrals', 'settings'].forEach(function (view) {
  Router.route('/' + view, {
    name: view,
    action: function (params) {
      renderWithLayout(view);
    }
  });
});
