
var subscribeLoading = new ReactiveVar();
var subscribeDone = new ReactiveVar();

var View = Template.landing;

View.onCreated(function () {
  subscribeLoading.set(false);
  subscribeDone.set(false);
});

View.onRendered(function () {

  var $nav = $('.landing-navigation');
  var fnav = 'landing-navigation--fixed';

  var navigation = new Waypoint({
    element: document.getElementById('hero'),
    handler: function (direction) {
      $nav.toggleClass(fnav);
    },
    offset: -10
  })

  var slideLeft = {
    opacity: 1,
    right: 0
  };

  var slideLeftReturn = {
    opacity: 0,
    right: '-50%'
  };

  var slideRight = {
    opacity: 1,
    left: 0
  };

  var slideRightReturn = {
    opacity: 0,
    left: '-50%'
  };

  var duration = 350;

  var featureAnimate = function (id, direction, side) {
    if (side == 'left') {
      if (direction == 'down') {
        $('#features' + id).animate(slideRight, duration);
      } else if (direction == 'up') {
        $('#features' + id).animate(slideRightReturn, duration);
      }
    } else if (side == 'right') {
      if (direction == 'down') {
        $('#features' + id).animate(slideLeft, duration);
      } else if (direction == 'up') {
        $('#features' + id).animate(slideLeftReturn, duration);
      }
    }
  }

  var featureOffset = 400;

  var features1 = new Waypoint({
    element: document.getElementById('features1'),
    handler: function (direction) {
      featureAnimate(1, direction, 'right');
    },
    offset: featureOffset
  })

  var features2 = new Waypoint({
    element: document.getElementById('features2'),
    handler: function (direction) {
      featureAnimate(2, direction, 'left');
    },
    offset: featureOffset
  })

  var features3 = new Waypoint({
    element: document.getElementById('features3'),
    handler: function (direction) {
      featureAnimate(3, direction, 'right');
    },
    offset: featureOffset
  })

  var features4 = new Waypoint({
    element: document.getElementById('features4'),
    handler: function (direction) {
      featureAnimate(4, direction, 'left');
    },
    offset: featureOffset
  });

});

View.helpers({
  subscribeLoading: function () {
    return subscribeLoading.get();
  },

  subscribeDone: function () {
    return subscribeDone.get();
  },

  disabledIfDone: function () {
    return subscribeDone.get() ? 'disabled' : '';
  },

  subscribeBtnText: function () {
    return subscribeDone.get() ? 'Signed Up' : 'Sign Me Up!';
  }
});

View.events({
  'keydown .landing-subscribe__form__input': function (e, t) {
    subscribeDone.set(false);
  },

  'click .landing-subscribe__form__submit, submit #subscription': function (e, t) {
    e.preventDefault();
    subscribeLoading.set(true);

    var name = $('.landing-subscribe__form__input[name="name"]').val();
    var email = $('.landing-subscribe__form__input[name="email"]').val();

    var names = name.trim().split(/\s+/);

    // only capture first and last name
    if(names.length > 2) names[1] = _.last(names);
    Meteor.setTimeout(function () {
      Meteor.call('mailing-list/subscribe', {
        firstname: names[0],
        lastname: names[1],
        email: email
      }, function (err, res) {
        if(err) {
          if(err.error === 214) subscribeDone.set(true); // already subscribed
          console.error('[subscribe] Error:', err);
        } else {
          subscribeDone.set(true);
        }
        subscribeLoading.set(false);
      });
    }, 500);
  }
});
