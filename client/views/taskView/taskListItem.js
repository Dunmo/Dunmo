
Template.taskListItem.rendered = function () {
  Session.set('currentlyEditing', '');
};

Template.taskListItem.helpers({
  activeClass: function () {
    if(Number(this.dueAt) < Date.now()) return 'overdue';
    else if(this.willBeOverdue)         return 'at-risk';
    else                                return '';
  },

  editBtnClass: function () {
    var currentlyEditing = Session.get('currentlyEditing') === this._id;
    return currentlyEditing ? 'save btn-default' : 'edit btn-warning';
  },

  faEditClass: function () {
    var currentlyEditing = Session.get('currentlyEditing') === this._id;
    return currentlyEditing ? 'fa-save' : 'fa-edit';
  },

  editing: function () {
    return Session.get('currentlyEditing') === this._id;
  },

  importanceString: function () {
    return Natural.numBangs[this.importance];
  },

  remainingString: function () {
    return moment.duration(this.remaining).humanize();
  },

  dueAtString: function () {
    return moment(this.dueAt).format('dddd, MMM Do [at] h:mm a');
  }
});

Template.taskListItem.events({
  'click .remove.btn': function (e) {
    this.remove();
    gapi.syncTasksWithCalendar();
  },

  'click .done.btn': function (e) {
    this.markDone();
    gapi.syncTasksWithCalendar();
  },

  'click .edit.btn': function (e) {
    Session.set('currentlyEditing', this._id);
  },

  'click .save, keydown input.todo': function (e) {
    // if we press anything except enter or the save button, return
    if( e.which && (e.which !== 13 && e.which !== 1 && e.which !== 27) ) return;

    // if we press escape, cancel
    if( e.which && e.which === 27 ) {
      Session.set('currentlyEditing', '');
      window.setTimeout(resetTaskListItemWidths, 50);
      return;
    }

    var str = $('input.todo').val();
    Session.set('currentlyEditing', '');
    window.setTimeout(resetTaskListItemWidths, 50);

    if(str !== this.inputString) {
      this.reParse(str);
      this.setNeedsReviewed(false);
      gapi.syncTasksWithCalendar();
    }
  }

});
