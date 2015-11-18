
function isActive (val) {
  return Session.get('task-filter')    === val ||
         Session.get('project-filter') === val;
}

var View = Template.sidebar;

View.helpers({
  user: function () { return Meteor.user(); },
  activeClass: function (filter) {
    if(Session.get('active-sidebar-section') === filter) return 'app-sidebar__section--active';
    else return isActive(filter) ? 'app-sidebar__subsection__item--active' : '';
  }
});

View.events({

  'click .app-sidebar__section__heading': function (e) {
    var slug = $(e.target).parents('.app-sidebar__section').data('section');
    FlowRouter.go('/' + slug);
  },

  'click .app-sidebar__subsection__item': function (e) {
    var self = e.target;
    var section = $(self).parents('.app-sidebar__section').data('section');
    var slug = $(self).data('href');
    FlowRouter.go('/' + section + '/' + slug);
  }

});
