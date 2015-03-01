
// Freetime
// ========
// start : DateTime
// end   : DateTime
// todos : [Task]

Freetimes = new Mongo.Collection('freetimes');

Freetimes.helpers({
  'update': function (data) {
    Freetimes.update(this._id, { $set: data });
  },

  duration: function() {
    return this.end - this.start;
  }
});

Freetimes.updateOrCreate = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(cal) {
      Freetimes.updateOrCreate(cal);
    });
  } else if(typeof(obj) === 'object') {
    var ft = Freetimes.findOne({ googleCalendarId: obj.id });
    if(ft) {
      Freetimes.update(ft._id, obj);
    } else {
      Freetimes.insert(obj);
    }
  } else {
    console.log('type error, updateOrCreate does not expect: ', typeof(obj));
  }
}

// "ya29.KAHNrGk9bVgQmNZNEgBZJnYhNxdGjeQkCwxQHu2KCDHNFgwUSF3fVZXVY9K3EScLHqMEXX1iA2YiUQ"
// "ya29.KAED79aO5aTZ7Vn3lS7BDAL-R_LrG-HoPFw12YKFi39m35hbr6MsP9HptzOeCVu6r5Zf3vhdE3NF6g"