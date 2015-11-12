var View = Template.layout;

View.helpers({
  modalActive: function () {
    return Session.get('add-task-is-active');
  }
});

View.events({

  'click': function (e, t) {
    if( $(e.target).closest('.app-taskitem').length > 0 ) return false;
    Session.set('currently-expanded-task', null);
  },

  'click .app-dimmer': function (e, t) {
    Session.set('add-task-is-active', false);
  }
});
