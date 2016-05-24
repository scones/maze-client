
core = core || {}

core.player = function(view_angle, near, far) {
  this.view_angle = view_angle;
  this.near = near;
  this.far = far;
  this.camera = null;
  this.delta_pitch = 0.0;
  this.delta_yaw = 0.0;
  this.delta_roll = 0.0;
  this.yaw_angle  = 0.0;
  this.pitch_angle = 0.0;
  this.roll_angle = 0.0;
  this.orig_facing_axis = null;
  this.orig_up_axis = null;
  this.orig_right_side_axis = null;
  this.facing = null;
  this.right_side = null;
  this.mass = 10.0;
  this.vector_thrust = null;
  this.active_thrust = null;
  this.velocity = null;
};


core.player.prototype.init = function(position, up) {
  this.camera = new THREE.PerspectiveCamera(this.view_angle, 0, this.near, this.far);
  this.camera.position.set(position.x, position.y, position.z);
  this.camera.up.copy(up);
  this.facing = new THREE.Vector3(0, 0, -1);
  this.roll_axis = this.facing.clone();
  this.yaw_axis = this.camera.up.clone();
  this.pitch_axis = new THREE.Vector3();
  this.pitch_axis.crossVectors(this.facing, this.camera.up);
  this.pitch_axis.normalize();

  // trigger resize
  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false,window,0);
  window.dispatchEvent(evt);

  this.vector_thrust = new THREE.Vector3(0.0000004, 0.0000008, 0.0000012);
  this.active_thrust = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.right_side = new THREE.Vector3();
};


core.player.prototype.reset_camera_size = function() {
  this.camera.aspect = window.innerWidth/window.innerHeight;
  this.camera.updateProjectionMatrix();
};


core.player.prototype.add_yaw = function(yaw) {
  this.delta_yaw += yaw;
};


core.player.prototype.add_pitch = function(pitch) {
  this.delta_pitch += pitch;
};


core.player.prototype.add_roll = function(roll) {
  this.delta_roll += roll;
};


core.player.prototype.update = function(delta_time) {
  this.update_position(delta_time);
  this.update_camera();
};


core.player.prototype.set_thrust_z = function(direction) {
  this.active_thrust.z = direction;
};


core.player.prototype.set_thrust_x = function(direction) {
  this.active_thrust.x = direction;
};


core.player.prototype.set_thrust_y = function(direction) {
  this.active_thrust.y = direction;
};


core.player.prototype.unset_thrust_z = function(direction) {
  if (this.active_thrust.z == direction)
    this.active_thrust.z = 0;
}


core.player.prototype.unset_thrust_x = function(direction) {
  if (this.active_thrust.x == direction)
    this.active_thrust.x = 0;
}


core.player.prototype.unset_thrust_y = function(direction) {
  if (this.active_thrust.y == direction)
    this.active_thrust.y = 0;
}


core.player.prototype.update_position = function(delta_time) {
  var delta_thrusts = new THREE.Vector3();
  if (this.active_thrust.x || this.active_thrust.y || this.active_thrust.z) {
    delta_thrusts.multiplyVectors(this.active_thrust, this.vector_thrust); // activate thrusts as requested
    var thrust_x = this.right_side.clone();
    var thrust_y = this.camera.up.clone();
    var thrust_z = this.facing.clone();
    thrust_x.multiplyScalar(delta_thrusts.x);
    thrust_y.multiplyScalar(delta_thrusts.y);
    thrust_z.multiplyScalar(delta_thrusts.z);
    thrust_x.add(thrust_y);
    thrust_x.add(thrust_z);
    thrust_x.multiplyScalar(delta_time / this.mass); // convert to velocity
    this.velocity.add(thrust_x);
  }
  if (this.velocity.x || this.velocity.y || this.velocity.z) {
    delta_thrusts = this.velocity.clone();
    delta_thrusts.multiplyScalar(delta_time);
    this.camera.position.add(delta_thrusts);
  }
};


core.player.prototype.update_camera = function() {
  if (this.delta_yaw || this.delta_pitch || this.delta_roll) {
    // update angles
    this.yaw_angle += this.delta_yaw;
    this.pitch_angle += this.delta_pitch;
    this.roll_angle += this.delta_roll;

    // keep angles in good interval
/*
    if (this.pitch_angle > core.math.PI_2)
      this.pitch_angle -= core.math.PI_2;
    if (this.yaw_angle > core.math.PI_2)
      this.yaw_angle -= core.math.PI_2;
    if (this.roll_angle > core.math.PI_2)
      this.roll_angle -= core.math.PI_2;

    if (this.pitch_angle < 0)
      this.pitch_angle += core.math.PI_2;
    if (this.yaw_angle < 0)
      this.yaw_angle += core.math.PI_2;
    if (this.roll_angle < 0)
      this.roll_angle += core.math.PI_2;
*/
    // setup quaternions
    var yaw = new THREE.Quaternion();
    var pitch = new THREE.Quaternion();
    var roll = new THREE.Quaternion();
    yaw.setFromAxisAngle(this.yaw_axis, this.yaw_angle);
    pitch.setFromAxisAngle(this.pitch_axis, this.pitch_angle);
    roll.setFromAxisAngle(this.roll_axis, this.roll_angle);

    var tmp = new THREE.Quaternion();
    var rotation = new THREE.Quaternion();
    tmp.multiplyQuaternions(pitch, roll);
    rotation.multiplyQuaternions(yaw, tmp); // rotation = yaw * pitch * roll

    // apply rotations
    var up = this.yaw_axis.clone();
    var facing = this.roll_axis.clone();
    up.applyQuaternion(rotation);
    facing.applyQuaternion(rotation);
    up.normalize();
    facing.normalize();
    this.camera.up.copy(up);
    this.facing.copy(facing);

    var look_at = facing.clone();
    look_at.multiplyScalar(this.camera.position.length());
    look_at.add(this.camera.position);
    this.camera.lookAt(look_at);
    this.camera.updateProjectionMatrix();

    // fading rotation effect
    if (this.delta_yaw)
      this.delta_yaw *= 0.92;

    if (this.delta_pitch)
      this.delta_pitch *= 0.92;

    if (this.delta_roll)
      this.delta_roll *= 0.975;

    this.rotation_update = false;
  }
};

