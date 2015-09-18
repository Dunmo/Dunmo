
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
  },
  now: function () {
    return new Date();
  }
});

View.events({
  'submit form.app-addtask': function (e, t) {
    e.preventDefault();
    var $parent = $('.app-addtask');
    var importance = rankVar.get();
    var title = $parent.find('input.app-addtask__content--title').val();
    var hours = Number($parent.find('input.app-addtask__content--duration-hour').val());
    console.log('hours: ', hours);
    var mins = Number($parent.find('input.app-addtask__content--duration-minute').val());
    console.log('mins: ', mins);
    var duration = moment.duration({ hours: hours, minutes: mins }).asMilliseconds();
    var duedate = $parent.find('input.app-addtask__content--due').val();
    console.log('duedate: ', duedate);
    var dueAt = moment(duedate).toDate();
    console.log('importance, title, duration, dueAt: ', importance, title, duration, dueAt);

    Tasks.create({
      ownerId: Meteor.userId(),
      title: title,
      importance: importance,
      dueAt: dueAt,
      remaining: duration
    });

    Session.set('add-task-is-active', false);

    return false;
  }
});
