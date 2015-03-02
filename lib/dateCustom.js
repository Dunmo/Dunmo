
Date.formatGoog = function (d) {
  console.log('d: ', d);
  d.setFullYear(2015);
  console.log('d: ', d);
  return d.toISOString();
};
