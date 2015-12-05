
Helpers = {
  isGmailAddress (email) {
    return email.substring(email.length-10, email.length) === '@gmail.com';
  }
};

Template.registerHelper('isGmailAddress', Helpers.isGmailAddress);
