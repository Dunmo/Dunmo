
var View = Template.calendarListItem;

View.helpers({
  activeClass: function () {
    return this.active ? 'settings__cal__list__item--active' : '';
  },

  checkActiveClass: function () {
    return this.active ? 'settings__cal__list__item__active-icon--active' : '';
  }
});

View.events({
  'click .list-group-item' : function (e) {
    var active = !this.active;
    this.update({ active: active });
    gapi.syncTasksWithCalendar();
  }
});
