
core                      = core                      || {};
core.random               = core.random               || {};
core.random.distributions = core.random.distributions || {}


core.random.distributions.uniform_int = function (min, max, random_generator) {
  if (min > max)
    core.console.error("core.random.distributions.uniform_int: invalid distribution, min value bigger than max value");

  this.min = min;
  this.max = max;
  this.random_generator = random_generator;
};


core.random.distributions.uniform_int.prototype.rand = function() {
  return Math.floor(this.random_generator.rand() % (this.max + 1 - this.min)) + this.min;
};

