
Onboarding = new Mongo.Collection('onboarding');

if(Meteor.isServer) {
  Onboarding.upsert({ index: 1 }, {
    index: 1,
    title: 'Get Onboarded!',
    content: 'Get onboarded yo, it\'s the thing to do and stuff.'
  });
}
