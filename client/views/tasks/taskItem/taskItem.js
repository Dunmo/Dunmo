
let View = Template.taskItem;

let isEditingTitle = {};

View.onCreated(function () {
  var task = this.data;
  isEditingTitle[task._id] = new ReactiveVar();
  isEditingTitle[task._id].set(false);
});

View.onRendered(function () {
  var task = this.data;
  if (isEditingTitle[task._id].get()) {
    $('.app-taskitem__head__title--input').focus();
  }
  task.editTitleIsCanceled = false;
    $('.app-taskitem__chevron').click(() => {
        $(this).toggleClass('ion-chevron-down ion-chevron-up')
    })
});

View.helpers({
  warningClass () {
    if(this.isDone || this.isRemoved) return '';

    if(this.isOverdue())        return 'app-taskitem--overdue';
    else if(this.willBeOverdue) return 'app-taskitem--warning';
  },

  shortDescription () {
    if(Session.get('currently-expanded-task') === this._id) return '';
    if(!this.description) return '';
    if(this.description.length < 140) return this.description;
    else return this.description.substring(0, 140) + '...';
  },

  expanded   () { Session.get('currently-expanded-task') === this._id },
  editing    () { Session.get('currently-editing-task')  === this._id },
  notEditing () { Session.get('currently-editing-task')  !== this._id },
  isEditingTitle () { isEditingTitle[this._id] && isEditingTitle[this._id].get() },

  rank () {
    const  ranks = ['rankzero', 'rankone', 'ranktwo', 'rankthree'];
    return ranks[this.importance];
  },

  impFields (imp) {
    const  importance = this.importance || 0;
    const  isActive   = (Number(imp) === importance);
    return { class: (isActive ? 'active' : '') + ' imp-label ' + 'imp-' + imp };
  },

  quickActionFields () {
    const  isExpanded = (Session.get('currently-expanded-task') === this._id);
    return { style: isExpanded ? 'display: none;' : '' };
  },

  chevronDirection () {
    const  isExpanded = (Session.get('currently-expanded-task') === this._id);
    return isExpanded ? 'up' : 'down';
  },
});

Template.taskItem.events({

  'click .app-taskitem__quick-actions__button--done, click .app-taskitem__actions__button--done' (e, t) {
    e.stopPropagation();
    this.toggleDone();
    gapi.syncTasksWithCalendar();
  },

  'click .app-taskitem__quick-actions__button--start, click .app-taskitem__actions__button--start' (e, t) {
    e.stopPropagation();
    // start the timer
  },

  'click .app-taskitem__quick-actions__button--delay, click .app-taskitem__actions__button--delay' (e, t) {
    e.stopPropagation();
    // show delay options popup
  },

  'click .app-taskitem__actions__button--remove' (e, t) {
    e.stopPropagation();
    this.toggleRemoved();
    gapi.syncTasksWithCalendar();
  },

  'click .app-taskitem__importance, click .app-taskitem__head, click .app-taskitem__chevron' (e, t) {
    if(Session.get('currently-expanded-task') === this._id) {
      Session.set('currently-expanded-task', '');
    } else {
      Session.set('currently-expanded-task', this._id);
    }
  },

  'click .app-taskitem__head__title' (e, t) {
    e.stopPropagation();
    isEditingTitle[this._id].set(true);
    Meteor.setTimeout(() => { $('.app-taskitem__head__title--input').focus() }, 0);
  },

  'click .app-taskitem__head__title--input': function (e, t) { e.stopPropagation() },

  'blur .app-taskitem__head__title--input, keydown .app-taskitem__head__title--input' (e, t) {
    if(this.editTitleIsCanceled) return this.editTitleIsCanceled = false;
    if(e.type === 'keydown' && e.which !== 13 && e.which !== 27) return;
    if(e.which === 27) {
      isEditingTitle[this._id].set(false);
      return this.editTitleIsCanceled = true;
    }
    e.stopPropagation();
    const prevTitle = this.title;
    let   title     = t.find('.app-taskitem__head__title--input').value;
    title = _.trim(title);
    if(e.which === 27 || title.length === 0) title = prevTitle;
    this.setTitle(title);
    isEditingTitle[this._id].set(false);
    if(title !== prevTitle) gapi.syncTasksWithCalendar();
  },

  'click .input-importance' (e) {
    const rank = $(e.target).data('importance');
    let $label = $(e.target).parent().parent().children('label');
    $label.removeClass('active');
    $label.eq(rank).addClass('active');
    this.setImportance(Number(rank));
    gapi.syncTasksWithCalendar();
  },

  'change .textarea-description' (e) {
    const description = $(e.target).val();
    this.setDescription(description);
  },

  'change .app-taskitem__body__content--duration-hour, change .app-taskitem__body__content--duration-minute' (e) {
    const task_container = $(e.target).parents('.app-taskitem');
    const hours_remaining = $(task_container).find('[data-field_name="hours_remaining"]').val();
    const minutes_remaining = $(task_container).find('[data-field_name="minutes_remaining"]').val();
    this.setRemainingHrsMins(hours_remaining, minutes_remaining);
    gapi.syncTasksWithCalendar();
  },

  'focusout .app-taskitem__body__content--due' (e) {
    let due_at = $(e.target).val();
    due_at = moment(due_at)._d;
    if(due_at.toString() !== 'Invalid Date') this.setDueAt(due_at);
    gapi.syncTasksWithCalendar();
  },

});
