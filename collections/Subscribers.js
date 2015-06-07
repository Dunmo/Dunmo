
// Subscriber
// ==================
// userId   : String
// email    : String
// isActive : Boolean

Subscribers.create = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(o) {
      Subscribers.create(o);
    });
  }

  if(typeof obj === 'string') obj = { email: obj };

  if(obj.isActive === undefined || obj.isActive === null) obj.isActive = true;

  // TODO: find user by email and set userId

  var curr = Subscribers.findOne({ email: obj.email });
  if(curr) return curr.update(obj);
  else     return Subscribers.insert(obj);
};
