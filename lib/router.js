
// Global Helpers
Router = FlowRouter;

Router.hasRoute = function (path) {
  return Router._routes.any(function (route) {
    return route.path === path;
  });
};

// Local Helpers
var Layout = BlazeLayout;

function checkForUser (context, redirect) {
  // only works because of meteorhacks:fast-render
  if(!Meteor.userId()) redirect('/auth');
}

function addTaskModal (context, redirect) {
  if(context.queryParams && context.queryParams.addTask === 'true') {
    Session.set('add-task-is-active', true);
  }
}

var redirect = _.curry(function (url, context, redirect) {
  // TODO: This is a hack; we shouldn't serve html files statically
  if(url.substring(url.length - 5) === '.html') window.location.href = url;
  else redirect(url);
});

var renderLayout = _.curry(function (layout, view, nav, header) {
  Layout.render(layout, { main: view, nav: nav, header: header });
});

var renderWithLayout = renderLayout('layout', _, 'sidebar', 'topbar');
var renderWithTopbar = renderLayout('fullscreenLayout', _, null, 'topbar');
var renderWithNoLayout = function (view) {
  Layout.render(view);
}

Router.notfound = {
  action: function (params) {
    Layout.render('notFound');
  },
};

Router.triggers.enter([checkForUser], {
  except: [ 'auth', 'login', 'signup', 'resetPassword', 'root', 'landing' ]
});

Router.triggers.enter([addTaskModal]);

Router.route('/', {
  name: 'root',
  triggersEnter: [function (context, redirect) {
    if(Meteor.userId()) redirect('/tasks');
    else                redirect('/landing');
  }]
});

Router.route('/landing', {
  name: 'landing',
  // triggersEnter: [redirect('/index.html')],
  action: function (params) {
    renderWithNoLayout('landing');
  }
});

 Router.route('/auth', {
   name: 'auth',
   triggersEnter: [function (context, redirect) {
     if(Meteor.userId()) redirect('/app');
   }],
   action: function (params) {
     renderWithTopbar('auth');
   }
 });

//Router.route('/login', {
//  name: 'login',
//  triggersEnter: [function (context, redirect) {
//    if(Meteor.userId()) redirect('/app');
//  }],
//  action: function (params) {
//    renderWithTopbar('login');
//  }
//});
//
//Router.route('/signup', {
//  name: 'signup',
//  triggersEnter: [function (context, redirect) {
//    var queryParams = context.queryParams;
//    if(queryParams.code === undefined) redirect('/signup?code=')
//    if(Meteor.userId()) redirect('/app');
//  }],
//  action: function (params, queryParams) {
//    var code = queryParams.code || '';
//    code = code.replace(/ /g, '+');
//    Meteor.call('signup/codes/validate', code, function (err, res) {
//      if(res) {
//        renderWithTopbar('signup');
//      } else {
//        renderWithTopbar('invalidSignupCode');
//      }
//    });
//  }
//});
//
//Router.route('/reset-password/:token', {
//  name: 'resetPassword',
//  action: function (params) {
//    var token = params.token;
//    Session.set('resetToken', token);
//    renderWithTopbar('resetPassword');
//  }
//})

Router.route('/app', {
  name: 'app',
  triggersEnter: [redirect('tasks')]
});

Router.route('/tasks/:filter?', {
  name: 'tasks',
  triggersEnter: [function (context, redirect) {
    var allowedFilters = ['todo', 'completed', 'trash'];
    if(! _.contains(allowedFilters, context.params.filter)) redirect('/tasks/todo');
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

// Aliases

Router.route('/index.html', {
  triggersEnter: [redirect('/landing')]
});

// Router.route('/signup', {
//   triggersEnter: [redirect('/auth#signup')]
// });

//Router.route('/reset-password', {
//  triggersEnter: [redirect('/login#reset')]
//});

// Redirect from old views
Router.route('/taskView', {
  triggersEnter: [redirect('/tasks')]
});

Router.route('/calendarSettings', {
  triggersEnter: [redirect('/settings')]
});

// Router.route('/login', {
//   triggersEnter: [redirect('/auth')]
// });

//Router.route('/auth', {
//  triggersEnter: [redirect('/login')]
//});
