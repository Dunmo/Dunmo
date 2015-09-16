var View = Template.addTask;

function itemType () {
  return 'task';
}

View.helpers({
  itemType: function () {
    // later, we can add projects, events, etc.
    return itemType();
  },
  itemName: function () {
    return itemType().capitalize();
  }
});
