
var View = Template.calendarListItem;

View.helpers({
  activeClass: function () {
    return this.active ? "active" : "";
  }
});

View.events({
  'click .list-group-item' : function (e) {
    var active = !this.active;
    this.update({ active: active });
    // gapi.syncTasksWithCalendar();
  }
});
