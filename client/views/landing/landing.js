
const View = Template.landing;

View.onCreated(function () {
  const instance = Template.instance();
  instance.subscribeLoading = new ReactiveVar(false);
  instance.subscribeDone    = new ReactiveVar(false);
});

View.onRendered(function () {

  let $nav   = $('.landing-navigation');
  const fnav = 'landing-navigation--fixed';

  const navigation = new Waypoint({
    element: document.getElementById('hero'),
    handler (direction) {
      $nav.toggleClass(fnav);
    },
    offset: -10,
  });

  const slideLeft = {
    opacity: 1,
    right: 0,
  };

  const slideLeftReturn = {
    opacity: 0,
    right: '-50%',
  };

  const slideRight = {
    opacity: 1,
    left: 0,
  };

  const slideRightReturn = {
    opacity: 0,
    left: '-50%',
  };

  const duration = 350;

  const featureAnimate = function (id, direction, side) {
    if (side == 'left') {
      if (direction == 'down') {
        $(`#features${id}`).animate(slideRight, duration);
      } else if (direction == 'up') {
        $(`#features${id}`).animate(slideRightReturn, duration);
      }
    } else if (side == 'right') {
      if (direction == 'down') {
        $(`#features${id}`).animate(slideLeft, duration);
      } else if (direction == 'up') {
        $(`#features${id}`).animate(slideLeftReturn, duration);
      }
    }
  };

  const featureOffset = 400;

  const features1 = new Waypoint({
    element: document.getElementById('features1'),
    handler (direction) { featureAnimate(1, direction, 'right') },
    offset: featureOffset,
  });

  const features2 = new Waypoint({
    element: document.getElementById('features2'),
    handler (direction) { featureAnimate(2, direction, 'left') },
    offset: featureOffset,
  });

  const features3 = new Waypoint({
    element: document.getElementById('features3'),
    handler (direction) { featureAnimate(3, direction, 'right') },
    offset: featureOffset,
  });

  const features4 = new Waypoint({
    element: document.getElementById('features4'),
    handler (direction) { featureAnimate(4, direction, 'left') },
    offset: featureOffset,
  });

});

View.helpers({
  subscribeLoading () { return Template.instance().subscribeLoading.get() },
  subscribeDone    () { return Template.instance().subscribeDone.get()    },
  disabledIfDone   () { return Template.instance().subscribeDone.get() ? 'disabled'  : '' },
  subscribeBtnText () { return Template.instance().subscribeDone.get() ? 'Signed Up' : 'Sign Me Up!' },
});

View.events({

  'keydown .landing-subscribe__form__input' (e, t) { Template.instance().subscribeDone.set(false) },

  'click .landing-subscribe__form__submit, submit #subscription' (e, t) {
    e.preventDefault();
    const subscribeLoading = Template.instance().subscribeLoading;
    const subscribeDone    = Template.instance().subscribeDone;
    subscribeLoading.set(true);

    const name  = $('.landing-subscribe__form__input[name="name"]').val();
    const email = $('.landing-subscribe__form__input[name="email"]').val();

    const names = name.trim().split(/\s+/);

    // only capture first and last name
    if(names.length > 2) names[1] = _.last(names);
    Meteor.setTimeout(() => {
      Meteor.call('mailing-list/subscribe', {
        firstname: names[0],
        lastname:  names[1],
        email:     email,
      }, (err, res) => {
        if(err) {
          if(err.error === 214) subscribeDone.set(true); // already subscribed
          console.error('[subscribe] Error:', err);
        } else {
          subscribeDone.set(true);
        }
        subscribeLoading.set(false);
      });
    }, 500);
  },
});
