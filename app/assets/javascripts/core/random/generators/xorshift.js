
core = core || {};
core.random = core.random || {};
core.random.generators = core.random.generators || {};


core.random.generators.xorshift = function (seed) {
  this.seed = seed;
};


core.random.generators.xorshift.prototype.rand = function () {
  this.seed = this.seed ^ (this.seed << 13);
  this.seed = this.seed ^ (this.seed >>> 17);
  this.seed = this.seed ^ (this.seed << 5);
  return Math.abs(this.seed);
};

