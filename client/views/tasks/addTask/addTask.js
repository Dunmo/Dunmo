
var rankVar = new ReactiveVar();

var View = Template.addTask;

function itemType () {
  return 'task';
}

View.onCreated(function () {
  rankVar.set(1);
});

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
  },
  rank: function () {
    var rankMap = { 1: 'rankone', 2: 'ranktwo', 3: 'rankthree' };
    var rank = rankVar.get();
    return rankMap[rank];
  }
});
