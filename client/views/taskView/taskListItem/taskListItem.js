
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

  snoozeActive: function () {
    return Session.get('snoozeActive') === this._id;
  },

  importanceString: function () {
    return Natural.numBangs[this.importance];
  },

  remainingString: function () {
    return Natural.humanizeDuration(this.remaining);
  },

  dueAtString: function () {
    var due = this.dueAt;
    if(due == Infinity) return 'someday';
    return moment(due).format('dddd, MMM Do [at] h:mm a');
  },

  titleWidth: function () {
    return Session.get('titleWidth');
  },

  linePropRemainingWidth: function () {
    return Session.get('linePropRemainingWidth');
  },

  linePropDueWidth: function () {
    return Session.get('linePropDueWidth');
  }

});

Template.taskListItem.events({
  'click .remove.btn': function (e) {
    this.remove();
    if(this.isOnboardingTask) setOnboardingTasks();
    gapi.syncTasksWithCalendar();
  },

  'click .done.btn': function (e) {
    this.markDone();
    if(this.isOnboardingTask) setOnboardingTasks();
    gapi.syncTasksWithCalendar();
  },

  'click .edit.btn': function (e) {
    Session.set('currentlyEditing', this._id);
  },

  'click .snooze.btn': function (e) {
    if(Session.get('snoozeActive') === this._id) {
      var val = $("#datetimepicker").val();
      val = Number(new Date(val));
      this.setSnoozedUntil(val);
      if(this.isOnboardingTask) setOnboardingTasks();
      gapi.syncTasksWithCalendar();
      Session.set('snoozeActive', '');
    } else {
      Session.set('snoozeActive', this._id);
    }
  },

  'click .save, keydown input.todo': function (e) {
    // if we press anything except enter or the save button, return
    if( e.which && (e.which !== 13 && e.which !== 1 && e.which !== 27) ) return;

    // if we press escape, cancel
    if( e.which && e.which === 27 ) {
      Session.set('currentlyEditing', '');
      resetTaskListItemWidths();
      return;
    }

    var str = $('input.todo').val();
    Session.set('currentlyEditing', '');
    resetTaskListItemWidths();

    if(str !== this.inputString) {
      this.reParse(str);
      this.setNeedsReviewed(false);
      gapi.syncTasksWithCalendar();
    }
  }

});
