
Template.taskItem.helpers({
  expanded: function () {
    console.log('Session.get: ', Session.get('currently-expanded-task'));
    console.log('this._id: ', this._id);
    return Session.get('currently-expanded-task') === this._id;
  },

  rank: function () {
    var ranks = ['rankzero', 'rankone', 'ranktwo', 'rankthree'];
    return ranks[this.importance];
  },

  impFields: function (imp) {
    var isActive = (Number(imp) === this.importance);
    return { class: active ? 'active' : '' };
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
    console.log('click!');
    console.log('this._id: ', this._id);
    if(Session.get('currently-expanded-task') === this._id) {
      Session.set('currently-expanded-task', '');
    } else {
      Session.set('currently-expanded-task', this._id);
    }
  }
});
