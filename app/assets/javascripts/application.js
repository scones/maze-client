//= require 'three-0.76.0'
//= require 'jquery-2.2.3'
//= require 'dat.gui-0.5.1'
//= require 'sprintf-0.7'
//= require 'jquery-mousewheel-3.1.13'

/**
 * @license

 * core and other components
 * 
 * @author Dirk Gustke
 * Modified MIT license (github.com/scones/maze-client/blob/master/LICENSE)
 */

//= require_tree .


player = null;
light = null;
last_time = null;

$(document).ready(function() {

  "use strict";

  core.WIDTH       = null;
  core.HEIGHT      = null;
  core.ASPECT      = null;
  core.VIEW_ANGLE  = 60.0;
  core.NEAR        = 0.1;
  core.FAR         = 1000.0;


  core.init_geometry = function() {
//    var maze_material = new THREE.MeshBasicMaterial({color: 0xCCCCCC});
    var maze_material = new THREE.MeshLambertMaterial({color: 0xCCCCCC});
    var path_material = new THREE.MeshBasicMaterial({color: 0xaa0000});
    var floor_material = new THREE.MeshPhongMaterial({
      color: 0x999999,
      side: THREE.DoubleSide
    });
    var maze_geometry = new THREE.Geometry();
    var path_geometry = new THREE.Geometry();
    var start_node = core.maze.nodes[0];
    var size_2 = core.maze.size >>> 1;
    var start_node_position = new THREE.Vector3(1 - size_2, 0.0, 1 - size_2);
    for(var i = 0; i < core.maze.size; ++i) {
      for (var j = 0; j < core.maze.size; ++j) {
        var current_node = core.maze.nodes[core.maze.size * j + i];
        var node_center = new THREE.Vector3((i + 1) - size_2, 0.0, (j + 1) - size_2);

        // build cell floor/roof
        for (var k = 0; k < 0; ++k) {
          var floor_geometry = new THREE.BoxGeometry(1, 0.1, 1);
          floor_geometry.translate(
            node_center.x - 0.5,
            0 == k ? node_center.y - 0.5 : node_center.y + 0.5,
            node_center.z - 0.5
          );
          var floor = new THREE.Mesh(floor_geometry, floor_material);
          floor.updateMatrix();
          maze_geometry.merge(floor.geometry, floor.matrix);
        }


        // build cell walls
        for (direction = 0; direction < 4; ++direction) {
          // skip empty walls
          if (core.PATH_TYPE.OPEN == current_node.paths[direction])
            continue;

          var box_geometry;
          if (core.DIRECTION.UP == direction && 0 == j) {
            box_geometry = new THREE.BoxGeometry(1.0, 1.0, 0.1);
            box_geometry.translate(
              node_center.x,
              0.0,
              node_center.z - 0.45
            );
          } else if (core.DIRECTION.DOWN == direction) {
            box_geometry = new THREE.BoxGeometry(1.0, 1.0, 0.1);
            box_geometry.translate(
              node_center.x,
              0.0,
              node_center.z + 0.45
            );
          } else if (core.DIRECTION.LEFT == direction && 0 == i) {
            box_geometry = new THREE.BoxGeometry(0.1, 1.0, 1.0);
            box_geometry.translate(
              node_center.x - 0.45,
              0.0,
              node_center.z
            );
          } else if (core.DIRECTION.RIGHT == direction) {
            box_geometry = new THREE.BoxGeometry(0.1, 1.0, 1.0);
            box_geometry.translate(
              node_center.x + 0.45,
              0.0,
              node_center.z
            );
          }
          var box = new THREE.Mesh(box_geometry, maze_material);
          box.updateMatrix();
          maze_geometry.merge(box.geometry, box.matrix);
        }

        if (current_node.paths[core.DIRECTION.RIGHT] == core.PATH_TYPE.OPEN) {
          var vec1 = new THREE.Vector3((i + 1) - size_2, 1.01, (j + 1) - size_2);
          var vec2 = new THREE.Vector3((i + 2) - size_2, 1.01, (j + 1) - size_2);
          path_geometry.vertices.push(vec1);
          path_geometry.vertices.push(vec2);
        }
        if (current_node.paths[core.DIRECTION.DOWN] == core.PATH_TYPE.OPEN) {
          var vec1 = new THREE.Vector3((i + 1) - size_2, 1.01, (j + 1) - size_2);
          var vec2 = new THREE.Vector3((i + 1) - size_2, 1.01, (j + 2) - size_2);
          path_geometry.vertices.push(vec1);
          path_geometry.vertices.push(vec2);
        }
      }
    }
    core.scene.add(new THREE.Mesh(maze_geometry, maze_material))
    core.scene.add(new THREE.LineSegments(path_geometry, path_material));

//    var basic_box = new THREE.BoxGeometry(1, 1, 1);
//    var basic_material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
//    core.scene.add(new THREE.Mesh(basic_box, basic_material));

    // light
    light = new THREE.SpotLight(0xFFC900, 0.8, 5.0, 10.0, 0.0, 2);
    light.position.set(start_node_position.x, start_node_position.y, start_node_position.z);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 0.2;
    light.shadow.camera.fov = 20.0;
    core.scene.add(light);
    core.scene.add(light.target);

  };


  core.init_3d = function() {
    core.scene = new THREE.Scene();
    core.container = $('.container');
    core.renderer = new THREE.WebGLRenderer();
    core.container.append(core.renderer.domElement);
  };


  function window_resize_callback() {
    player.reset_camera_size();
    core.renderer.setSize(window.innerWidth, window.innerHeight);
  };


  function mouse_move_callback(delta_x, delta_y) {
    if (core.events.is_pointer_lock_enabled) {
      if (delta_x) {
        var f_delta_x = delta_x / -100.0;
        player.add_yaw(f_delta_x);
      }
      if (delta_y) {
        var f_delta_y = delta_y / -100.0;
        player.add_pitch(f_delta_y);
      }
    }
  };


  function mouse_wheel_callback(event) {
    event.preventDefault();
  };


  function keydown_callback(event) {
    if (core.events.is_pointer_lock_enabled) {
      if (event.shiftKey)
        player.set_thrust_y(-1);

      if (65 == event.keyCode) // a
        player.set_thrust_x(-1);

      if (68 == event.keyCode) // d
        player.set_thrust_x(1);

      if (87 == event.keyCode) // w
        player.set_thrust_z(1);

      if (83 == event.keyCode) // 's'
        player.set_thrust_z(-1);

      if (32 == event.keyCode) // 'space'
        player.set_thrust_y(1);

      if (81 == event.keyCode) // 'q'
        player.add_roll(-0.005);

      if (69 == event.keyCode) // 'e'
        player.add_roll(0.005);
    }
  };


  function keyup_callback(event) {
    if (event.shiftKey)
      player.unset_thrust_y(-1);

    switch (event.keyCode) {
      case 65: // 'a'
        player.unset_thrust_x(-1);
        break;
      case 68: // 'd'
        player.unset_thrust_x(1);
        break;
      case 87: // 'w'
        player.unset_thrust_z(1);
        break;
      case 83: // 's'
        player.unset_thrust_z(-1);
        break;
      case 32: // 'space'
        player.unset_thrust_y(1);
        break;
    }
  };


  function pointer_lock_enabled_callback(event) {
    console.log("pointer_lock_enabled");
  };


  function pointer_lock_error_callback(event) {
    console.log("pointer_lock_error");
  };


  function pointer_lock_disabled_callback(event) {
    console.log("pointer_lock_disabled");
  };


  core.init_events = function() {
    $(window).bind('resize', window_resize_callback);
    $(document).bind('mousewheel', mouse_wheel_callback);
    $(window).bind('keydown', keydown_callback);
    $(window).bind('keyup', keyup_callback);

    $('.container').bind('click', function() {
      core.events.pointer_lock('container', mouse_move_callback, pointer_lock_enabled_callback, pointer_lock_disabled_callback, pointer_lock_error_callback);
    });
  };


  core.init = function() {
    core.maze = new core.maze(1, 16);
    core.maze.init();
    core.init_events();

    core.init_3d();

    var start_node = core.maze.nodes[0];
    var size_2 = core.maze.size >>> 1;
    var start_node_position = new THREE.Vector3(1 - size_2, 0.0, 1 - size_2);

    player = new core.player();
    player.init(start_node_position, new THREE.Vector3(0.0, 1.0, 0.0));
    core.scene.add(player.camera);

    core.init_geometry();

    last_time = performance.now();
  };


  function render() {
    var current_time = performance.now();
    var delta_time = current_time - last_time;
    player.update(delta_time);
    light.position.copy(player.camera.position);
    light.target.position.copy(player.camera.position.clone().add(player.facing));
    requestAnimationFrame(render);

    core.renderer.render(core.scene, player.camera);
    last_time = current_time;
  };



  core.init();
  render();

  
});

