/*
 * If a user signs in using a service type for the first time, but we already have
 * an existing record for them, merge the records, don't create a seperate one.
 *
 * Additionally, use their google name as a profile name
 */

Accounts.onCreateUser(function(options, user) {
  if (user.services) {
    var service = _.keys(user.services)[0];
    var email = user.services[service].email;

    if (service == 'google') {
      if (!user.profile) user.profile = {};
      if (!user.profile.name) {
        user.profile.google = user.services[service];
        user.profile.name = user.services[service].name;
      }
    }

    if (!email) return user;
    if(!user.emails) user.emails = [];
    user.emails.push({ address: email, verified: true });

    // see if any existing user has this email address, otherwise create new
    var existingUser = Meteor.users.findOne({'emails.address': email});
    if (!existingUser) return user;

    // precaution, these will exist from accounts-password if used
    if (!existingUser.services) existingUser.services = { resume: { loginTokens: [] }};
    if (!existingUser.services.resume) existingUser.services.resume = { loginTokens: [] };

    // copy accross new service info
    if(user.services.resume && user.services.resume.loginTokens) {
      existingUser.services[service] = user.services[service];
      if(!existingUser.services.resume) existingUser.services.resume = {};
      existingUser.services.resume.loginTokens.push(
        user.services.resume.loginTokens[0]
      );
    }

    // even worse hackery
    Meteor.users.remove({_id: existingUser._id}); // remove existing record
    return existingUser;                          // record is re-inserted
  }
});
