var View = Template.addTask;

function itemType () {
  return 'task';
}

View.helpers({
  addTaskIsActive: function () {
    return Session.get('add-task-is-active');
  },
  itemType: function () {
    // later, we can add projects, events, etc.
    return itemType();
  },
  itemName: function () {
    return itemType().capitalize();
  },
  isTask: function () {
    return itemType() === 'task';
  }
});
