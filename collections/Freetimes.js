
// Freetime
// ========
// start : DateTime
// end   : DateTime
// todos : [Task]

Freetimes = new Mongo.Collection('freetimes');

Freetimes.helpers({
  update: function (data) {
    Freetimes.update(this._id, { $set: data });
  },

  duration: function() {
    return this.end - this.start;
  },

  timeRemaining: function() {
    return this.duration();
  }
});

Freetimes.create = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(ft) {
      Freetimes.create(ft);
    });
  } else if(typeof(obj) === 'object') {
    obj.start = Number(obj.start);
    obj.end   = Number(obj.end);
    obj.remaining = function () {
      return this.end - this.start;
    };
    var id = Freetimes.insert(obj);
    return Freetimes.findOne(id);
  } else {
    // console.log('type error, updateOrCreate does not expect: ', typeof(obj));
  }
}

// "ya29.KAHNrGk9bVgQmNZNEgBZJnYhNxdGjeQkCwxQHu2KCDHNFgwUSF3fVZXVY9K3EScLHqMEXX1iA2YiUQ"
// "ya29.KAED79aO5aTZ7Vn3lS7BDAL-R_LrG-HoPFw12YKFi39m35hbr6MsP9HptzOeCVu6r5Zf3vhdE3NF6g"
