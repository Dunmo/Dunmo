/*
 * Tag
 * ==========
 * title : String
 * type  : String<user,topic>
 *
 */

Tags._symbolForTagType = {
  user:  '@',
  topic: '#'
};

Tags._tagTypeForSymbol = {
  '@' : 'user',
  '#' : 'topic'
};

Tags.createTagsFromTodoTitle = function (todoTitle) {
  var tags = Tags.parseTagsFromString(todoTitle);

  tags = tags.map(function (tag) {
    return { inputString: tag, ownerId: Meteor.userId() };
  });

  Tags.createOrUpdate(tags);
};

// required:
//   ownerId
//   inputString or (title & type)
Tags.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(tag) {
      return Tags.createOrUpdate(tag);
    });
  } else if(typeof(obj) === 'object') {
    obj.ownerId         = obj.ownerId       || null; // Meteor.userId();
    obj.inputString     = obj.inputString;
    obj.title           = obj.title         || obj.inputString.substring(1);
    obj.type            = obj.type          || Tags.tagTypeFromString(obj.inputString);
    obj.isRemoved       = obj.isRemoved     || false;
    obj.lastUpdatedAt   = obj.lastUpdatedAt || Date.now();

    if(!title) return false;

    var tag = Tags.findOne({ ownerId: obj.ownerId, title: obj.title, type: obj.type });
    if(tag) return tag.update(obj);
    else    return Tags.insert(obj);
  }
};

Tags.parseTagsFromString = function (str) {
  return str.match(/([\#][\w\-]+)/g);
};

// expects strings in the form '#tag', '@person', etc.
Tags.tagTypeFromString = function (str) {
  var symbol = str.firstChar();
  return Tags._tagTypeForSymbol[symbol];
};
