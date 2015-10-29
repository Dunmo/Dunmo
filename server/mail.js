
check(process.env.SECRETS_MAILCHIMP, String);
var mailChimp = new MailChimp(process.env.SECRETS_MAILCHIMP);
var mailingListId = 'a2015f3903';

var mandrill = Mandrill;

mandrill.config({
  username: 'dunmo@dunmoapp.com',
  key: process.env.SECRETS_MANDRILL,
  // port: 587, // defaults to 465 for SMTP over TLS
  // host: 'smtp.mandrillapp.com', // the SMTP host
  // baseUrl: 'https://mandrillapp.com/api/1.0/' // update this in case Mandrill changes its API endpoint URL or version
});

Meteor.methods({
  'mailing-list/subscribe': function (options) {
    var res = mailChimp.call('lists', 'subscribe', {
      id: mailingListId,
      email: {
        email: options.email
      },
      merge_vars: {
        FNAME: options.firstname,
        LNAME: options.lastname
      },
      double_optin: false,
      send_welcome: false
    });

    if(res.status === 'error') {
      // TODO: if(res.name === 'List_DoesNotExist') Meteor.call('notify/sys-admin');
      throw new Meteor.Error(500, res.error);
    }

    return res;
  },

  'mailing-list/unsubscribe': function (email) {
    var res = mailChimp.call('lists', 'unsubscribe', {
      id: mailingListId,
      email: {
        email: email
      },
      send_goodbye: true,
      send_notify: true
    });

    if(res.status === 'error') {
      // TODO: if(res.name === 'List_DoesNotExist') Meteor.call('notify/sys-admin');
      throw new Meteor.Error(500, res.error);
    }

    return res;
  }
});
