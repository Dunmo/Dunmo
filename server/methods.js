
function callSync(verb) {
  return function(uri, options) {
    var res = request[verb](uri, options);
    res     = res.response;
    res     = JSON.stringify(res);
    return res;
  };
};

Meteor.methods({
  'postSync': callSync('postSync'),
  'getSync': callSync('getSync')
});
