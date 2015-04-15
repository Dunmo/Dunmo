
var view = Template.referralView;

view.helpers({
  referred: function () {
    return Meteor.user().referred();
  }
});

var submitEmail = function () {
  var referrerEmail = $('.referrer-input').val();
  $('.referrer-input').val('');
  $('.referrer-input').attr('placeholder', 'Success!');

  var userEmail = Meteor.user().primaryEmailAddress();

  var data = { referrerEmail: referrerEmail, userEmail: userEmail };
  // data = JSON.stringify(data);

  console.log('data: ', data);

  Meteor.call('createReferral', data);

  // $.post('/api/referral', data, function(res) {
  //   res = JSON.parse(res);
  //   console.log('res: ', res);
  // });
};

view.events({
  'keypress .referrer-input' : function(e) {
    if(e.which != 13) return;
    submitEmail();
  },

  'click .btn-submit' : submitEmail
});
