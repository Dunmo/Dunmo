
String.prototype.firstChar = function () {
  return this.substring(0, 1);
};

String.prototype.capitalize = function () {
  return this.setCharAt(0, this.charAt(0).toUpperCase());
};

String.prototype.setCharAt = function (index, newValue) {
  return this.substring(0, index) + newValue + this.substring(index+1, this.length);
};

String.prototype.slim = function (spacer) {
  spacer = spacer || ' ';
  var str = this.replace(/\s+/g, spacer);
  return str;
};

String.prototype.slimNTidy = function (spacer) {
  var str;

  str = this;
  str = str.trim();
  str = str.slim(spacer);
  return str;
};
