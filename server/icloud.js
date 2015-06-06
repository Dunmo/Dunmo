
// function iCloud (appleId, password) {
//   this.urls = {
//     "version" : "https://www.icloud.com/system/version.json",
//     "validate": "/setup/ws/1/validate?clientBuildNumber={0}&clientId={1}",
//     "login": "/setup/ws/1/login?clientBuildNumber={0}&clientId={1}"
//   }

//   this.appleId      = appleId;
//   this.password     = password;

//   this.clientBuildNumber  = '1P24';
//   this.clientId     = uuid.v1().toString().toUpperCase();

//   this.cookie = null;
//   this.instance = null;

//   this.validate();
// };

// iCloud.prototype = {
//   validate: function() {
//     var me = this;

//     var endpoint = this.urls.login
//         .replace('{0}', this.clientBuildNumber)
//         .replace('{1}', this.clientId);

//     var uri = 'https://p12-setup.icloud.com' + endpoint;

//     // console.log('uri: ', uri);

//     var data = JSON.stringify({
//       apple_id: this.appleId,
//       password: this.password,
//       extended_login: false
//     });

//     var options = {
//       body: data,
//       headers: {
//         'Origin': 'https://www.icloud.com',
//         'Referer': 'https://www.icloud.com',
//         'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
//       }
//     };

//     var res = request.postSync(uri, options);

//     res = res.response;

//     if (res && res.headers['set-cookie']) me.cookie = res.headers['set-cookie'];

//     me.instance = JSON.parse(res.body);

//     var reminders_url = me.instance.webservices.reminders.url;

//     var time_zone = 'America/Indiana/Indianapolis';

//     var dsid = me.instance.dsInfo.dsid;
//     var getContactListUrl = '/rd/reminders/tasks?clientBuildNumber={1}&clientId={2}&clientVersion=2.1&dsid={3}&lang=en_US&usertz={4}'
//       .replace('{1}', me.clientBuildNumber)
//       .replace('{2}', me.clientId)
//       .replace('{3}', dsid) // &id={4}
//       .replace('{4}', time_zone);

//     var uri2 = reminders_url.replace(':443', '') + getContactListUrl;

//     var options2 = {
//       headers: {
//         'Origin': 'https://www.icloud.com',
//         'Referer': 'https://www.icloud.com',
//         'Cookie': me.cookie.join('; '),
//         'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
//       }
//     };

//     var req2 = request.getSync(uri2, options2);

//     req2 = req2.response;

//     var obj = JSON.parse(req2.body);
//     var reminders = obj.Reminders;

//     for (var i = 0; i < reminders.length; i++ ) {
//       var reminder = reminders[i];
//       // console.log('reminder: ', reminder);
//       var title = reminders[i].title.replace(/\ufffc/g, '');
//       var dueDate = reminders[i].dueDate;
//       if(dueDate) console.log('title, dueDate: ', title, dueDate);
//       else        console.log('title: ', title);
//     }
//   }
// };

// Meteor.methods({
//   'iCloud': function (user, pass) {
//     new iCloud(user, pass);
//   }
// });
