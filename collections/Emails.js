
// Email
// ==================
// userId   : String
// address  : String
// isActive : Boolean

Emails = new Mongo.Collection('emails');

Emails.helpers({
  update: function (data) {
    if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) )
      data = { $set: data };

    return Emails.update(this._id, data);
  }
});

Emails.create = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(o) {
      Emails.create(o);
    });
  }

  if(typeof obj === 'string') obj = { email: obj };

  if(obj.isActive === undefined || obj.isActive === null) obj.isActive = true;

  var curr = Emails.findOne({ email: obj.email });
  if(curr) return curr.update(obj);
  else     return Emails.insert(obj);
};
