
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
    this.remove();
    gapi.syncTasksWithCalendar();
  },

  'click .done.btn': function (e) {
    console.log('this: ', this);
    this.markDone();
    gapi.syncTasksWithCalendar();
  },

  'click .edit.btn': function (e) {
    Session.set('currentlyEditing', this._id);
  },

  'click .save, keydown input.todo': function (e) {
    // if we press anything except enter or the save button, return
    if( e.which && (e.which !== 13 && e.which !== 1) ) return;

    var str = $('input.todo').val();
    Session.set('currentlyEditing', '');

    if(str !== this.inputString) {
      this.reParse(str);
      gapi.syncTasksWithCalendar();
    }
  }
});
