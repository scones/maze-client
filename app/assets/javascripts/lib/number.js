
/**
 * prevent negative modulo result
 */
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
}

