
let View = Template.calendarListItem;

View.helpers({
  activeClass      () { this.active ? 'settings__cal__list__item--active' : '' },
  checkActiveClass () { this.active ? 'settings__cal__list__item__active-icon--active' : '' },
});

View.events({

  'click .list-group-item' (e) {
    const active = !this.active;
    this.update({ active: active });
    gapi.syncTasksWithCalendar();
  },

});
