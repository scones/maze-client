
core = core || {};

core.DEBUG_LEVEL = {
  NO_DEBUG: 0,
  ERROR: 10,
  WARN: 20,
  LOG: 30,
  INFO: 40
}

core.debug = core.debug || core.DEBUG_LEVEL.NO_DEBUG;

core.errors = [];
core.warnings = [];
core.logs = [];
core.infos = [];

core.console_pure = window.console;

core.console = {};
core.console.error = function(message) {
  core.errors.push(message);
  if (core.debug >= core.DEBUG_LEVEL.ERROR)  {
    core.console_pure.error(message);
  }
}
core.console.warn = function(message) {
  core.warnings.push(message);
  if (core.debug >= core.DEBUG_LEVEL.WARN) {
    core.console_pure.warn(message);
  }
}
core.console.log = function(message) {
  core.logs.push(message);
  if (core.debug >= core.DEBUG_LEVEL.LOG) {
    core.console_pure.log(message);
  }
}
core.console.info = function(message) {
  core.infos.push(message);
  if (core.debug >= core.DEBUG_LEVEL.INFO) {
    core.console_pure.info(message);
  }
}

console = core.console;
window.console = console;

