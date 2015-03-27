
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

  if(obj.isActive === undefined || obj.isActive === null) obj.isActive = true;

  Emails.insert(obj);
};
