
let View = Template.sidebar;

function isActive (val) {
  return Session.get('task-filter')    === val ||
         Session.get('project-filter') === val;
}

View.helpers({
  user () { Meteor.user() },
  activeClass (filter) {
    if(Session.get('active-sidebar-section') === filter) return 'app-sidebar__section--active';
    else return isActive(filter) ? 'app-sidebar__subsection__item--active' : '';
  }
});

View.events({

  'click .app-sidebar__section__heading': e => {
    const slug = $(e.target).parents('.app-sidebar__section').data('section');
    FlowRouter.go('/' + slug);
  },

  'click .app-sidebar__subsection__item': e => {
    let self      = e.target;
    const section = $(self).parents('.app-sidebar__section').data('section');
    const slug    = $(self).data('href');
    FlowRouter.go('/' + section + '/' + slug);
  },

});
