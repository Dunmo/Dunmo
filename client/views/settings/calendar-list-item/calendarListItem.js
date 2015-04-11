
Template.calendarListItem.helpers({
  activeClass: function () {
    return this.active ? "active" : ""
  }
});

Template.calendarListItem.events({
  'click .list-group-item' : function (e) {
    var active = !this.active;
    this.update({ active: active });
    gapi.syncTasksWithCalendar();
  }
});
