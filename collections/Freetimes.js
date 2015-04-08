
// Freetime
// ========
// start : DateTime
// end   : DateTime

Freetimes = new Mongo.Collection('freetimes');

Freetimes.helpers({
  update: function (data) {
    Freetimes.update(this._id, { $set: data });
  },

  duration: function() {
    return this.end - this.start;
  },

  remaining: function() {
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

    var id = Freetimes.insert(obj);
    return Freetimes.findOne(id);
  } else {
    // console.log('type error, updateOrCreate does not expect: ', typeof(obj));
  }
}
