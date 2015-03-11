
Template.taskListItem.rendered = function () {
  Session.set('currentlyEditing', '');
};

Template.taskListItem.helpers({
  'editBtnClass': function () {
    var currentlyEditing = Session.get('currentlyEditing') === this._id;
    return currentlyEditing ? 'save btn-default' : 'edit btn-warning';
  },

  'faEditClass': function () {
    var currentlyEditing = Session.get('currentlyEditing') === this._id;
    return currentlyEditing ? 'fa-save' : 'fa-edit';
  },

  'editing': function () {
    return Session.get('currentlyEditing') === this._id;
  }
});

Template.taskListItem.events({
  'click .remove': function (e) {
    console.log('this: ', this);
    this.remove();
    gapi.syncTasksWithCalendar();
  },

  'click .done.btn': function (e) {
    console.log('click: ');
    this.markDone();
    gapi.syncTasksWithCalendar();
  },

  'click .edit.btn': function (e) {
    Session.set('currentlyEditing', this._id);
  },

  'click .save, keydown input.todo': function (e) {
    console.log('e.which: ', e.which);
    if(e.which && e.which !== 13) return;
    var str = $('input.todo').val();
    console.log('str: ', str);
    this.reParse(str);
    Session.set('currentlyEditing', '');
    gapi.syncTasksWithCalendar();
  }
});
