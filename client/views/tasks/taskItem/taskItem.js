
Template.taskItem.helpers({
  shortDescription: function () {
    if(Session.get('currently-expanded-task') === this._id) return '';
    if(!this.description) return ''
    if(this.description.length < 140) return this.description;
    else return this.description.substring(0, 140) + '...';
  },

  expanded: function () {
    return Session.get('currently-expanded-task') === this._id;
  },

  editing: function () {
    return Session.get('currently-editing-task') === this._id;
  },

  notEditing: function () {
    return Session.get('currently-editing-task') !== this._id;
  },

  rank: function () {
    var ranks = ['rankzero', 'rankone', 'ranktwo', 'rankthree'];
    return ranks[this.importance];
  },

  impFields: function (imp) {
    var importance = this.importance || 0;
    var isActive = (Number(imp) === importance);
    return { class: (isActive ? 'active' : '') + ' imp-label ' + 'imp-' + imp };
  },

  quickActionFields: function () {
    var isExpanded = (Session.get('currently-expanded-task') === this._id);
    return { style: isExpanded ? 'display: none;' : '' };
  },
});

Template.taskItem.events({

  'click .app-taskitem__quick-actions__button--done, click .app-taskitem__actions__button--done': function (e) {
    e.stopPropagation();
    this.toggleDone();
  },

  'click .app-taskitem__quick-actions__button--start, click .app-taskitem__actions__button--start': function (e) {
    e.stopPropagation();
    // start the timer
  },

  'click .app-taskitem__quick-actions__button--delay, click .app-taskitem__actions__button--delay': function (e) {
    e.stopPropagation();
    // show delay options popup
  },

  'click .app-taskitem__actions__button--remove': function (e) {
    e.stopPropagation();
    this.toggleRemoved();
  },

  'click .app-taskitem__quick-actions, click .app-taskitem__head, click .app-taskitem__chevron': function (e) {
    if(Session.get('currently-expanded-task') === this._id) {
      Session.set('currently-expanded-task', '');
    } else {
      Session.set('currently-expanded-task', this._id);
    }
  },

  'click .input-importance': function (e) {
    var rank = $(e.target).data('importance');
    $(e.target).parent().parent().children('label').removeClass('active');
    $(e.target).parent().parent().children('label').eq(rank).addClass('active');
    this.setImportance(Number(rank));
  },

  'change .textarea-description': function (e) {
    var description = $(e.target).val();
    this.setDescription(description);
  },

  'change .app-taskitem__body__content--duration-hour, change .app-taskitem__body__content--duration-hour': function (e) {
    var task_container = $(e.target).parents('.app-taskitem');
    var hours_remaining = $(task_container).find('[data-field_name="hours_remaining"]').val();
    var minutes_remaining = $(task_container).find('[data-field_name="minutes_remaining"]').val();
    this.setRemainingHrsMins(hours_remaining, minutes_remaining);
  },

  'focusout .app-taskitem__body__content--due': function (e) {
    var due_at = $(e.target).val();
    due_at = moment(due_at)._d;
    if(due_at.toString() !== 'Invalid Date') this.setDueAt(due_at);
  },

});
