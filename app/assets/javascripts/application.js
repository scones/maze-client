//= require 'three-0.76.0'
//= require 'jquery-2.2.3'
//= require 'dat.gui-0.5.1'
//= require 'sprintf-0.7'
//= require_tree .


$(document).ready(function() {

  "use strict";

  core = core || {};

  core.WIDTH       = null;
  core.HEIGHT      = null;
  core.ASPECT      = null;
  core.VIEW_ANGLE  = 60.0;
  core.NEAR        = 0.1;
  core.FAR         = 1000.0;


  var maze = new core.maze(1, 16);
  maze.init();

  core.init_geometry = function() {
    // basic stuff
    core.scene = new THREE.Scene();
    core.container = $('.container');
    core.renderer = new THREE.WebGLRenderer();
    core.container.append(core.renderer.domElement);

    // camera
    core.camera = new THREE.PerspectiveCamera(core.VIEW_ANGLE, 0, core.NEAR, core.FAR);
    onWindowResize();
    var start_node = maze.nodes[0];
    var size_2 = maze.size >>> 1;
    var start_node_position = new THREE.Vector3(1 - size_2, 0.0, 1 - size_2);
    core.camera.position.set(start_node_position.x, start_node_position.y, start_node_position.z);
//    core.camera.position.set(0, 20, 0);
    core.camera.lookAt(new THREE.Vector3(0,0,0));
    core.scene.add(core.camera);

    // geometry

//    var maze_material = new THREE.MeshBasicMaterial({color: 0xCCCCCC});
    var maze_material = new THREE.MeshLambertMaterial({color: 0xCCCCCC});
    var path_material = new THREE.MeshBasicMaterial({color: 0xaa0000});
    var floor_material = new THREE.MeshPhongMaterial({
      color: 0x999999,
      side: THREE.DoubleSide
    });
    var maze_geometry = new THREE.Geometry();
    var path_geometry = new THREE.Geometry();
    var line_count = 0;
    for(var i = 0; i < maze.size; ++i) {
      for (var j = 0; j < maze.size; ++j) {
        var current_node = maze.nodes[maze.size * j + i];
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
              node_center.x + 0.5,
              0.0,
              node_center.z + 0.95
            );

          } else if (core.DIRECTION.DOWN == direction) {

            box_geometry = new THREE.BoxGeometry(1.0, 1.0, 0.1);
            box_geometry.translate(
              node_center.x - 0.5,
              0.0,
              node_center.z - 0.95
            );

          } else if (core.DIRECTION.LEFT == direction && 0 == i) {

            box_geometry = new THREE.BoxGeometry(0.1, 1.0, 1.0);
            box_geometry.translate(
              node_center.x - 0.95,
              0.0,
              node_center.z - 0.5
            );

          } else if (core.DIRECTION.RIGHT == direction) {

            box_geometry = new THREE.BoxGeometry(0.1, 1.0, 1.0);
            box_geometry.translate(
              node_center.x + 0.95,
              0.0,
              node_center.z + 0.5
            );

          }
          var box = new THREE.Mesh(box_geometry, maze_material);
          box.updateMatrix();
          maze_geometry.merge(box.geometry, box.matrix);
        }

        if (current_node.paths[core.DIRECTION.RIGHT] == core.PATH_TYPE.OPEN) {
          ++line_count;
          var vec1 = new THREE.Vector3((i + 1) - size_2, 0.0, (j + 1) - size_2);
          var vec2 = new THREE.Vector3((i + 2) - size_2, 0.0, (j + 1) - size_2);
          path_geometry.vertices.push(vec1);
          path_geometry.vertices.push(vec2);
        }
        if (current_node.paths[core.DIRECTION.DOWN] == core.PATH_TYPE.OPEN) {
          ++line_count;
          var vec1 = new THREE.Vector3((i + 1) - size_2, 0.0, (j + 1) - size_2);
          var vec2 = new THREE.Vector3((i + 1) - size_2, 0.0, (j + 2) - size_2);
          path_geometry.vertices.push(vec1);
          path_geometry.vertices.push(vec2);
        }
      }
    }
    core.scene.add(new THREE.Mesh(maze_geometry, maze_material))
    core.scene.add(new THREE.LineSegments(path_geometry, path_material));

    var basic_box = new THREE.BoxGeometry(1, 1, 1);
    var basic_material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    core.scene.add(new THREE.Mesh(basic_box, basic_material));

    // light
    var light = new THREE.SpotLight(0xFFC900, 0.4, 10.0, 20.0, 0.0, 2);
    light.position.set(start_node_position.x, start_node_position.y, start_node_position.z);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 0.2;
    light.shadow.camera.fov = 20.0;
    core.scene.add(light);
  };


  core.render = function() {
  };


  function onWindowResize() {
    core.WIDTH  = window.innerWidth;
    core.HEIGHT = window.innerHeight;
    core.ASPECT = core.WIDTH/core.HEIGHT;

    core.camera.aspect = core.ASPECT;
    core.camera.updateProjectionMatrix();
    core.renderer.setSize(core.WIDTH, core.HEIGHT);
  }


  function render() {
    requestAnimationFrame(render);

//    core.mesh.rotation.x += 0.0053;
//    core.mesh.rotation.y += 0.0111;

    core.renderer.render(core.scene, core.camera);
  }


  window.addEventListener( 'resize', onWindowResize, false );
  core.init_geometry();
  render();

});

