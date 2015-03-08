
Date.formatGoog = function (d) {
  d.setFullYear(2015);
  return d.toISOString();
};

Date.ISOToMilliseconds = function (d) {
  return Number(new Date(d));
};
