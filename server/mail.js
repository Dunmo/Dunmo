
Accounts.emailTemplates.from = 'Dunmo <contact@dunmoapp.com>',
Accounts.emailTemplates.siteName = 'dunmoapp.com',
Accounts.emailTemplates.resetPassword.subject = function (user) {
  return 'Reset your Dunmo Password';
};
Accounts.emailTemplates.resetPassword.html = function (user, url) {
  var name = user.profile.name;
  url = url.replace('#/', '');
  return 'Please click the following link to reset your password:\n\n' + url;
};

// check(process.env.SECRETS_MAILCHIMP, String);
// TODO: hack, switch after meteor upgrade
if (typeof process.env.SECRETS_MAILCHIMP !== 'string') {
  console.error('expected String for process.env.SECRETS_MAILCHIMP, got:',
    process.env.SECRETS_MAILCHIMP,
    ',',
    typeof process.env.SECRETS_MAILCHIMP);
}
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

    Meteor.call('mailing-list/send/welcome-to-dunmo', options);

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
  },

  'mailing-list/send/welcome-to-dunmo': function (options) {
    var defaults = {
      message: {
        subject: options.firstname + ', ready to 10x your productivity?',
      }
    };

    options = lodash.defaultsDeep({}, options, defaults);

    return Meteor.call('mailing-list/send', 'welcome-to-dunmo', options);
  },

  'mailing-list/send': function (template_name, options) {
    options.message.to = [ { email: options.email } ];

    var defaults = {
      template_name: template_name,
      template_content: [],
      message: {
        from_email: 'michael@dunmoapp.com',
        from_name: 'Michael from Dunmo',
        // important: false,
        track_opens: true,
        track_clicks: true,
        // auto_text: true,
        // auto_html: true,
        // inline_css: true,
        // url_strip_qs: false,
        // preserve_recipients: false,
        // view_content_link: null,
        // tracking_domain: null,
        // signing_domain: null,
        // return_path_domain: null,
        merge_language: 'mailchimp',
        global_merge_vars: [
          { name: 'COMPANY', content: 'Team Dunmo' },
          { name: 'DESCRIPTION', content: 'You\'re part of Dunmo' },
          { name: 'LIST_ADDRESS_HTML', content: 'Team Dunmo<br>320 North Street<br>West Lafayette, IN 47906' },
          { name: 'UNSUB', content: 'https://dunmoapp.com/api/mailing-list/unsubscribe?email=' + options.email }
        ],
        // merge_vars: [],
        // tags: [],
        // subaccount: null,
        // google_analytics_domains: [],
        // metadata: [],
        // recipient_metadata: [],
        // attachments: [],
        // images: [],
      }
    };

    options = lodash.defaultsDeep({}, options, defaults);

    var res = mandrill.messages.sendTemplate(options);

    if(res.status === 'error') {
      // TODO: if(res.name === 'List_DoesNotExist') Meteor.call('notify/sys-admin');
      throw new Meteor.Error(500, res.error);
    }

    return res;
  }
});
