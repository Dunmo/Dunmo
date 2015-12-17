
Helpers = {
  heapIdentify (profile = { name, email }) {
    let user = Meteor.user();
    if(user) {
      profile = _.defaults(profile, {
        name:  user.displayName(),
        email: user.primaryEmailAddress()
      });
    }
    if(profile.name || profile.email) heap.identify(profile);
  },

  isGmailAddress (email) {
    return email.substring(email.length-10, email.length) === '@gmail.com';
  }
};

Template.registerHelper('isGmailAddress', Helpers.isGmailAddress);
