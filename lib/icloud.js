
iCloud = function (appleId, password) {
  this.urls = {
    "version" : "https://www.icloud.com/system/version.json",
    "validate": "/setup/ws/1/validate?clientBuildNumber={0}&clientId={1}",
    "login": "/setup/ws/1/login?clientBuildNumber={0}&clientId={1}"
  }

  this.appleId      = appleId;
  this.password     = password;

  this.clientBuildNumber  = '1P24';
  this.clientId     = uuid.v1().toString().toUpperCase();

  this.cookie = null;
  this.instance = null;

  this.validate();
};

iCloud.prototype = {
  validate: function() {
    var me = this;

    var endpoint = this.urls.login
        .replace('{0}', this.clientBuildNumber)
        .replace('{1}', this.clientId);

    var options = {
      headers: {
        'Origin': 'https://www.icloud.com',
        'Referer': 'https://www.icloud.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
      }
    };

    var data = JSON.stringify({
      apple_id: this.appleId,
      password: this.password,
      extended_login: false
    });

    var url = "p04-setup.icloud.com" + endpoint;

    HTTP.post(url, options, function(res) {
      console.log('res: ', res);
      return;

      if (res.headers['set-cookie']) me.cookie = res.headers['set-cookie'];

      var buffer = '';

      res.on('data', function(data) {
        buffer += data;
      });

      res.on('end', function() {

        me.instance = JSON.parse(buffer);

        var reminders_url = me.instance.webservices.reminders.url;

        var time_zone = 'America/Indiana/Indianapolis';

        var dsid = me.instance.dsInfo.dsid;
        var getContactListUrl = '/rd/reminders/tasks?clientBuildNumber={1}&clientId={2}&clientVersion=2.1&dsid={3}&lang=en_US&usertz={4}'
          .replace('{1}', me.clientBuildNumber)
          .replace('{2}', me.clientId)
          .replace('{3}', dsid) // &id={4}
          .replace('{4}', time_zone);

        var options2 = {
          host: reminders_url.replace('https://', '').replace(':443', ''),
          path: getContactListUrl,
          method: 'GET',
          headers: {
            'Origin': 'https://www.icloud.com',
            'Referer': 'https://www.icloud.com',
            'Cookie': me.cookie.join('; '),
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
          }
        };

        var req2 = https.request(options2, function(res) {

          var buf2 = '';
          res.on('data', function(data) {
            buf2 += data;
          });

          res.on('end', function() {
            var obj = JSON.parse(buf2);
            var reminders = obj.Reminders;

            for (var i = 0; i < reminders.length; i++ ) {
              var title = reminders[i].title.replace(/\ufffc/g, '');
              var dueDate = reminders[i].dueDate;
              if(dueDate)
                console.log('{0}-{1}'.replace('{0}', dueDate[2]).replace('{1}', dueDate[3]), title);
              else
                console.log('----', title);
            }
          });
        });
      });
    });
  }
};
