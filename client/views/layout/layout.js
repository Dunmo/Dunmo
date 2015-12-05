
let View = Template.layout;

View.helpers({
  modalActive () { Session.get('add-task-is-active') },
});

View.events({

  'click' (e, t) {
    if( $(e.target).closest('.app-taskitem').length > 0 ) return false;
    Session.set('currently-expanded-task', null);
  },

  'click .app-dimmer' (e, t) {
    Session.set('add-task-is-active', false);
  },

});
