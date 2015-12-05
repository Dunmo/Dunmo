
let view = Template.referrals;

view.helpers({
  referred () { return Meteor.user().referred() },
});

function submitEmail () {
  let   $input        = $('.referrer-input');
  const referrerEmail = $input.val();
  const userEmail     = Meteor.user().primaryEmailAddress();

  $input.val('');
  $input.attr('placeholder', 'Success!');

  Meteor.call('createReferral', {
    referrerEmail: referrerEmail,
    userEmail: userEmail,
  });
};

view.events({

  'keypress .referrer-input' (e, t) {
    if(e.which != 13) return;
    submitEmail();
  },

  'click .btn-submit' : submitEmail,

});
