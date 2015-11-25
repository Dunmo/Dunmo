
var rankVar = new ReactiveVar();

var View = Template.addTask;

function itemType () {
  return 'task';
}

View.onRendered(function () {
  rankVar.set(1);
  $('.app-addtask__content--title').focus();
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
    var rankMap = { 0: 'rankzero', 1: 'rankone', 2: 'ranktwo', 3: 'rankthree' };
    var rank = rankVar.get();
    return rankMap[rank];
  },
  today: function () {
    return moment().format('YYYY-MM-DD');
  }
});

View.events({
  'keydown': function (e, t) {
    if(e.which !== 27) return;
    Session.set('add-task-is-active', false);
  },

  'click .app-addtask__section--importance': function (e, t) {
    var rank = rankVar.get();
    var newRank = rank + 1;
    if(newRank > 3) newRank = 0;
    rankVar.set(newRank);
  },

  'submit form.app-addtask': function (e, t) {
    e.preventDefault();
    $('.warning').removeClass('warning');

    var $parent = $('.app-addtask');

    var importance = rankVar.get();

    var title = $parent.find('input.app-addtask__content--title').val();

    var hours = Number($parent.find('input.app-addtask__content--duration-hour').val());
    var mins = Number($parent.find('input.app-addtask__content--duration-minute').val());
    var duration = moment.duration({ hours: hours, minutes: mins }).asMilliseconds();

    var duedate = $parent.find('input.app-addtask__content--due').val();
    var dueAt = moment(duedate).toDate();

    if(!duration || duration <= 0) {
      $('.app-addtask__section--duration').addClass('warning');
      return false;
    }

    console.log('importance, title, duration, dueAt: ', importance, title, duration, dueAt);

    Tasks.create({
      ownerId: Meteor.userId(),
      title: title,
      importance: importance,
      dueAt: dueAt,
      remaining: duration
    });

    Session.set('add-task-is-active', false);

    gapi.syncTasksWithCalendar();

    return false;
  }
});
