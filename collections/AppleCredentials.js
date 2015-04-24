/*
 * AppleCredentials
 * =========
 * appleId  : String
 * password : String
 *
 * TODO: hash apple passwords
 */

AppleCredentials = new Mongo.Collection('appleCredentials');

AppleCredentials.before.insert(function(uid, doc) {
  doc.createdAt = Date.now();

  doc.urls = {
    'version' : 'https://www.icloud.com/system/version.json',
    'setup'   : 'https://p12-setup.icloud.com',
    'validate': '/setup/ws/1/validate?clientBuildNumber={0}&clientId={1}',
    'login'   : '/setup/ws/1/login?clientBuildNumber={0}&clientId={1}'
  }

  doc.clientBuildNumber  = '1P24';
  doc.clientId           = uuid.v1().toString().toUpperCase();

  doc.cookie   = null;
  doc.instance = null;

  return doc;
});

AppleCredentials.after.insert(function(uid, doc) {
  this.transform().validate();
});

AppleCredentials.helpers({
  'update': function (data) {
    AppleCredentials.update(this._id, { $set: data });
  },

  'loginEndpoint': function () {
    return this.urls.login
                    .replace('{0}', this.clientBuildNumber)
                    .replace('{1}', this.clientId);
  },

  'validate': function () {
    var uri = this.urls.setup + this.loginEndpoint();

    var data = JSON.stringify({
      apple_id: this.appleId,
      password: this.password,
      extended_login: false
    });

    var options = {
      body: data,
      headers: {
        'Origin': 'https://www.icloud.com',
        'Referer': 'https://www.icloud.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrothis/35.0.1916.114 Safari/537.36'
      }
    };

    // var res = request.postSync(uri, options);
    var cred = this;
    Meteor.call('postSync', uri, options, function(err, res) {
      res = JSON.parse(res);
      // console.log('res.body: ', res.body);

      if(res.statusCode != 200) {
        console.error('Error: ', res.error);
        return false;
      }

      var obj = {};

      if(res && res.headers['set-cookie']) obj.cookie = res.headers['set-cookie'];
      obj.instance = res.body;

      cred.update(obj);
    });
  },

  'syncReminders': function () {
    var reminders_url = this.instance.webservices.reminders.url;

    var time_zone = 'America/Indiana/Indianapolis';

    var dsid = this.instance.dsInfo.dsid;
    var getContactListUrl = '/rd/reminders/tasks?clientBuildNumber={1}&clientId={2}&clientVersion=2.1&dsid={3}&lang=en_US&usertz={4}'
      .replace('{1}', this.clientBuildNumber)
      .replace('{2}', this.clientId)
      .replace('{3}', dsid) // &id={4}
      .replace('{4}', time_zone);

    var uri = reminders_url.replace(':443', '') + getContactListUrl;

    var options = {
      headers: {
        'Origin'    : 'https://www.icloud.com',
        'Referer'   : 'https://www.icloud.com',
        'Cookie'    : this.cookie.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
      }
    };

    // var res = request.getSync(uri, options);
    var cred = this;
    Meteor.call('getSync', uri, options, function(res) {
      res = JSON.parse(res);

      var obj = res.body;
      var reminders = obj.Reminders;

      // console.log('reminders[0]: ', reminders[0]);

      reminders.forEach(function(reminder) {
        AppleReminders.upsert({ appleReminderId: reminder.fdsa }, reminder);
        var title = reminders[i].title.replace(/\ufffc/g, '');
        var dueDate = reminders[i].dueDate;
        if(dueDate)
          console.log('{0}-{1}'.replace('{0}', dueDate[2]).replace('{1}', dueDate[3]), title);
        else
          console.log('----', title);
      });
    });
  }
});
