
String.prototype.slim = function(spacer) {
  spacer = spacer || ' ';
  var str = this.replace(/\s+/g, spacer);
  return str;
};

String.prototype.slimNTidy = function(spacer) {
  var str;

  str = this;
  str = str.trim();
  str = str.slim(spacer);
  return str;
};
