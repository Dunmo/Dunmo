
var subscribeLoading = new ReactiveVar();
var subscribeDone = new ReactiveVar();

var View = Template.landing;

View.onCreated(function () {
  subscribeLoading.set(false);
  subscribeDone.set(false);
});

View.onRendered(function () {

  // SMOOTH SCROLLING

  // Meteor.defer(function () {

  //   $('a[href*=#]:not([href=#])').click(function () {
  //     if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
  //       var target = $(this.hash);
  //       target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
  //       if (target.length) {
  //         $('html,body').animate({
  //           scrollTop: target.offset().top
  //         }, 750);
  //         return false;
  //       }
  //     }
  //   });

  // });

});

View.helpers({
  subscribeLoading: function () {
    return subscribeLoading.get();
  },

  subscribeDone: function () {
    return subscribeDone.get();
  },

  subscribeBtnText: function () {
    return subscribeDone.get() ? 'Signed Up' : 'Sign Me Up!';
  }
});

View.events({
  'click .landing-subscribe__form__submit, submit #subscription': function (e, t) {
    e.preventDefault();
    subscribeLoading.set(true);

    var email = $('.landing-subscribe__form__input[name="email"]').val();

    Meteor.setTimeout(function () {
      Meteor.call('mailing-list/subscribe', email, function (err, res) {
        if(err) {
          console.error('[subscribe] Error:', err);
        } else {
          subscribeDone.set(true);
        }
        subscribeLoading.set(false);
      });
    }, 500);
  }
});
