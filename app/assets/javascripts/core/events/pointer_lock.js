
core = core || {};
core.events = core.events || {}

core.events.is_pointer_lock_supported =
  'pointerLockElement' in document ||
  'msPointerLockElement' in document ||
  'mozPointerLockElement' in document ||
  'webkitPointerLockElement' in document;
core.events.is_pointer_lock_enabled = false;

core.events.pointer_lock = function(element_id, extern_move_callback, extern_enable_callback, extern_disable_callback, extern_error_callback) {
  if (core.events.is_pointer_lock_enabled)
    return;
  var element = document.getElementById(element_id);

  if (!core.events.is_pointer_lock_supported) {
    console.error('pointer lock not supported by this browser');
    alert('pointer lock not support by this browser');
  } else {
    if ("function" === typeof extern_move_callback) {
      var move_callback = function(event) {
        event.preventDefault();
        if (extern_move_callback) {
          var delta_x = event.movementX || event.msMovementX || event.mozMovementX || event.webkitMovementX || 0,
              delta_y = event.movementY || event.msMovementY || event.mozMovementY || event.webkitMovementY || 0;
          extern_move_callback(delta_x, delta_y);
        }
      };
      element.addEventListener('mousemove', move_callback);
    };

    var pointer_lock_change = function(event) {
      if (
        document.pointerLockElement === element ||
        document.msPointerLockElement === element ||
        document.mozPointerLockElement === element ||
        document.webkitPointerLockElement === element
      )
      {
//        debugger
        if (!core.events.is_pointer_lock_enabled) {
          core.events.is_pointer_lock_enabled = true;
          if ("function" === typeof extern_enable_callback)
            extern_enable_callback(event);
        }
      } else {
        if ("function" === typeof extern_disable_callback)
          extern_disable_callback(event);
        core.events.is_pointer_lock_enabled = false;

        shutdown();
      }
    };

    this.pointer_lock_error = function(event) {
      if ("function" === typeof extern_error_callback)
        extern_error_callback();

      shutdown();
    };

    var shutdown = function() {
      document.removeEventListener('pointerlockchange', pointer_lock_change, false);
      document.removeEventListener('mspointerlockchange', pointer_lock_change, false);
      document.removeEventListener('mozpointerlockchange', pointer_lock_change, false);
      document.removeEventListener('webkitpointerlockchange', pointer_lock_change, false);

      document.removeEventListener('pointerlockerror', pointer_lock_change, false);
      document.removeEventListener('mspointerlockerror', pointer_lock_change, false);
      document.removeEventListener('mozpointerlockerror', pointer_lock_change, false);
      document.removeEventListener('webkitpointerlockerror', pointer_lock_change, false);

      if ("function" === typeof extern_move_callback)
        element.removeEventListener('mousemove', extern_move_callback, false);
    };

    document.addEventListener('pointerlockchange', pointer_lock_change, false);
    document.addEventListener('mspointerlockchange', pointer_lock_change, false);
    document.addEventListener('mozpointerlockchange', pointer_lock_change, false);
    document.addEventListener('webkitpointerlockchange', pointer_lock_change, false);

    document.addEventListener('pointerlockerror', pointer_lock_change, false);
    document.addEventListener('mspointerlockerror', pointer_lock_change, false);
    document.addEventListener('mozpointerlockerror', pointer_lock_change, false);
    document.addEventListener('webkitpointerlockerror', pointer_lock_change, false);

    element.requestPointerLock = element.requestPointerLock || element.msRequestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
  }
}


var print_methods = function(object) {
  console.log(Object.getOwnPropertyNames(object).filter(function (p) {
    return typeof object[p] === 'function';
  }));
};

