
Helpers = {
  // profile: { name, email }
  heapIdentify (profile = {}) {
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
  },

  helpUrl () {
    return '//docs.google.com/forms/d/10Xr_2dIuDddUQ5KM3tlxAaVaWEndlvXYLuNJNv9mdGI/viewform';
  },

  toggleAddTaskIsActive (val) {
    if(_.isUndefined(val)) val = !!Session.get('add-task-is-active');
    Session.set('add-task-is-active', val);
    let params;
    if(val) {
      params = { addTask: true }
    } else {
      $('.app-addtask input').blur();
      params = { addTask: null };
    }
    console.log('params: ', params);
    Router.setQueryParams(params)
  },
};

Template.registerHelper('isGmailAddress', Helpers.isGmailAddress);
Template.registerHelper('helpUrl', Helpers.helpUrl);
