
// function callSync(verb) {
//   return function(uri, options) {
//     var res = request[verb](uri, options);
//     res     = res.response;
//     res     = JSON.stringify(res);
//     return res;
//   };
// };

function createReferral(data) {

  var referrerEmail = data.referrerEmail;
  var userEmail     = data.userEmail;

  var users = Meteor.users.find().fetch();
  var referrer = lodash.find(users, function(user) {
    return user.primaryEmailAddress() === referrerEmail;
  });
  var user = lodash.find(users, function(user) {
    return user.primaryEmailAddress() === userEmail;
  });


  if(!referrer) return;

  var ret = referrer.addReferral(userEmail);
  if (ret == 1) user.referred(true);
};

function fetchMailingList() {
  return Subscribers.fetch();
};

Meteor.methods({
  // 'postSync': callSync('postSync'),
  // 'getSync': callSync('getSync'),
  'createReferral': createReferral,
  'fetchMailingList': fetchMailingList
});
