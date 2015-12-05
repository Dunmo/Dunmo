
let View = Template.addTask;

let rankVar = new ReactiveVar();

// later, we can add projects, events, etc.
function itemType () { return 'task'; }

View.onRendered(function () {
  rankVar.set(1);
  $('.app-addtask__content--title').focus();
});

View.helpers({
  addTaskIsActive () { Session.get('add-task-is-active') },
  itemType        () { itemType()                        },
  itemName        () { itemType().capitalize()           },
  isTask          () { itemType() === 'task'             },
  today           () { moment().format('YYYY-MM-DD')     },

  rank () {
    const rankMap = { 0: 'rankzero', 1: 'rankone', 2: 'ranktwo', 3: 'rankthree' };
    const rank = rankVar.get();
    return rankMap[rank];
  },
});

View.events({

  'keydown' (e, t) {
    if(e.which !== 27) return;
    Session.set('add-task-is-active', false);
  },

  'click .app-addtask__section--importance' (e, t) {
    const rank    = rankVar.get();
    let   newRank = rank + 1;
    if(newRank > 3) newRank = 0;
    rankVar.set(newRank);
  },

  'submit form.app-addtask' (e, t) {
    e.preventDefault();
    $('.warning').removeClass('warning');

    const $parent = $('.app-addtask');

    const importance = rankVar.get();

    const title = $parent.find('input.app-addtask__content--title').val();

    const hours = Number($parent.find('input.app-addtask__content--duration-hour').val());
    const mins = Number($parent.find('input.app-addtask__content--duration-minute').val());
    const duration = moment.duration({ hours: hours, minutes: mins }).asMilliseconds();

    const duedate = $parent.find('input.app-addtask__content--due').val();
    const dueAt = moment(duedate).toDate();

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
  },

});
