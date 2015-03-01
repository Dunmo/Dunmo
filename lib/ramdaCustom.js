R = {};

R.cloneDeep = function cloneDeep(value) {
  return _baseCopy(value, [], []);
};

/**
 * Private `_baseCopy` function dispatches value copying to the `_copyObj`
 * function or creates a copy itself.
 *
 * @private
 * @category Internal
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @return {*} The copied value.
 */
 function _baseCopy(value, refFrom, refTo) {
  switch (value && toString.call(value)) {
    case '[object Object]':   return _copyObj(value, {}, refFrom, refTo);
    case '[object Array]':    return _copyObj(value, [], refFrom, refTo);
    case '[object Function]': return value;
    case '[object Date]':     return new Date(value);
    default:
    return value;
  }
}

/**
 * Private `_copyObj` function creates a copy of the object or array provided by
 * the `_baseCopy` function.
 * Circular or duplicate references are detected using the source references in
 * refFrom and used to create the same circular or duplicate reference in the copy.
 *
 * @private
 * @category Internal
 * @param {*} value The value to be copied
 * @param {*} copiedValue Empty object or array or aid copying
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @return {*} The copied value.
 */
 function _copyObj(value, copiedValue, refFrom, refTo) {
  var len = refFrom.length;
  var idx = -1;
  while (++idx < len) {
    if (value === refFrom[idx]) {
      return refTo[idx];
    }
  }

  refFrom[refFrom.length] = value;
  refTo[refTo.length] = copiedValue;
  for (var key in value) {
    copiedValue[key] = _baseCopy(value[key], refFrom, refTo);
  }
  return copiedValue;
}