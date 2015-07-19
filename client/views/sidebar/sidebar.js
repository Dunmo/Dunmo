
Template.sidebar.events({

  'click .app-sidebar__section__heading': function (e) {
    var self = e.target;
    $('.app-sidebar__section').removeClass('app-sidebar__section--active');
    $('.app-sidebar__subsection__item--active').removeClass('app-sidebar__subsection__item--active');
    $(self).parent().addClass('app-sidebar__section--active');
    $(self).parent().children('ul').children(':first-child').addClass('app-sidebar__subsection__item--active');
  },

  'click .app-sidebar__subsection__item': function (e) {
    var self = e.target;
    $('.app-sidebar__section').removeClass('app-sidebar__section--active');
    $('.app-sidebar__subsection__item--active').removeClass('app-sidebar__subsection__item--active');
    $(self).parent().parent().addClass('app-sidebar__section--active');
    $(self).addClass('app-sidebar__subsection__item--active');
  }

});
