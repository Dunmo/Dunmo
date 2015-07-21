var ex = 0;
Template.taskItem.helpers({
  expanded: function () {
    return Session.get('currently-expanded-task') === this._id;
  },

  rank: function () {
    var ranks = ['rankzero', 'rankone', 'ranktwo', 'rankthree'];
    return ranks[this.importance];
  }
});

Template.taskItem.events({

  'click .app-taskitem__quick-actions__button--done': function (e) {
    e.stopPropagation()
    this.toggleDone();
  },

  'click .app-taskitem__quick-actions__button--start': function (e) {
    e.stopPropagation()
    // start the timer
  },

  'click .app-taskitem__quick-actions__button--delay': function (e) {
    e.stopPropagation()
    // show delay options popup
  },

  'click .app-taskitem__quick-actions, click .app-taskitem__chevron': function () {
    if(Session.get('currently-expanded-task') === this._id) {
      Session.set('currently-expanded-task', '');
    } else {
      Session.set('currently-expanded-task', this._id);
    }
  }
});
