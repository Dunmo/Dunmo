
let View = Template.calendarListItem;

View.helpers({
  activeClass      () { return this.active ? 'settings__cal__list__item--active' : '' },
  checkActiveClass () { return this.active ? 'settings__cal__list__item__active-icon--active' : '' },
});

View.events({

  'click .list-group-item' (e) {
    const active = !this.active;
    this.update({ active: active });
    gapi.syncTasksWithCalendar();
  },

});
