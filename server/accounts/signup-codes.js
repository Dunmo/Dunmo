
var SEED = 'Dunmo - Smart Productivity';
var AES_KEY = 'Dunmo - Simple Productivity';
var INDEX_CHAR_LENGTH = 4;
var AES_ENCRYPTED_STRING_LENGTH = INDEX_CHAR_LENGTH + 40; // adds 40 characters

var random = {
  randInt: function (max) {
    var fraction = Math.random();
    var floatValue = fraction * max;
    var intValue = Math.floor(floatValue);
    return intValue;
  }
}

function padLeadingZeroes(n, len) {
  var str = n.toString();
  var numIterations = len - n.length;
  _(numIterations).times(function () {
    str = '0' + str;
  });
  return str;
}

function encrypt(str) {
  return CryptoJS.AES.encrypt(str, AES_KEY).toString();
}

function decrypt(str) {
  return CryptoJS.AES.decrypt(str, AES_KEY).toString(CryptoJS.enc.Utf8);
}

function generateCodeAtIndex(index) {
  if(index <= 0)     index = 1;    // Don't want 0; that's the seed
  if(index >= 10000) index = 9999; // Has to be four digits or less
  var code = SEED;
  for(var i = 0; i < index; i++) code = SHA256(code);
  return code;
}

function getIndex(fullCode) {
  var indexCode = fullCode.substring(0, AES_ENCRYPTED_STRING_LENGTH);
  var indexStr = decrypt(indexCode);
  var index = parseInt(indexStr);
  return index;
}

Meteor.methods({
  'signup/codes/validate': function (fullCode) {
    var index = getIndex(fullCode);
    var code = fullCode.substring(AES_ENCRYPTED_STRING_LENGTH);
    var codeForIndex = generateCodeAtIndex(index);
    return code === codeForIndex;
  },

  'signup/codes/generate-by-index': function (index) {
    var indexStr = index.toString();
    var paddedIndexStr = padLeadingZeroes(index, 4);
    var indexCode = encrypt(paddedIndexStr);
    var code = generateCodeAtIndex(index);
    var fullCode = indexCode + code;
    return fullCode;
  },

  'signup/codes/generate-random': function () {
    var index = random.randInt(10000);
    var fullCode = Meteor.call('signup/codes/generate-by-index', index);
    return fullCode;
  }
});
