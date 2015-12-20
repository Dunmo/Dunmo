
let View = Template.layout;

View.onCreated(function () {
  // TODO: where to put this?
  this.autorun( () => this.subscribe('mySyncables') );

  Helpers.heapIdentify();
});

View.helpers({
  modalActive () { return Session.get('add-task-is-active') },
});

View.events({

  'click' (e, t) {
    if( $(e.target).closest('.app-taskitem').length > 0 ) return false;
    Session.set('currently-expanded-task', null);
  },

  'click .app-dimmer' (e, t) {
    Helpers.toggleAddTaskIsActive(false);
  },

});
