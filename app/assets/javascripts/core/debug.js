
core = core || {};
core.debug = core.debug || {};
core.debug.console = core.debug.console || {};

core.debug.DEBUG_LEVEL = {
  NO_DEBUG: 0,
  ERROR: 10,
  WARN: 20,
  LOG: 30,
  INFO: 40
}
core.debug.level = core.debug.level || core.debug.DEBUG_LEVEL.NO_DEBUG;

core.debug.errors = [];
core.debug.warnings = [];
core.debug.logs = [];
core.debug.infos = [];

core.debug.console_pure = window.console;


core.debug.console.error = function(message) {
  core.debug.errors.push(message);
  if (core.debug.level >= core.debug.DEBUG_LEVEL.ERROR)  {
    core.debug.console_pure.error(message);
  }
};
core.debug.console.warn = function(message) {
  core.debug.warnings.push(message);
  if (core.debug.level >= core.debug.DEBUG_LEVEL.WARN) {
    core.debug.console_pure.warn(message);
  }
};
core.debug.console.log = function(message) {
  core.debug.logs.push(message);
  if (core.debug.level >= core.debug.DEBUG_LEVEL.LOG) {
    core.debug.console_pure.log(message);
  }
};
core.debug.console.info = function(message) {
  core.debug.infos.push(message);
  if (core.debug.level >= core.debug.DEBUG_LEVEL.INFO) {
    core.debug.console_pure.info(message);
  }
};

console = core.debug.console;
window.console = console;


core.debug.print_methods = function(object) {
  console.log(Object.getOwnPropertyNames(object).filter(function (p) {
    return typeof object[p] === 'function';
  }));
};

