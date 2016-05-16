//= require 'three-0.76.0'
//= require 'jquery-2.2.3'
//= require 'dat.gui-0.5.1'
//= require_tree .

$(document).ready(function() {

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
    core.camera.position.z = 20;
    core.scene.add(core.camera);

    // geometry
    var sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF
    });
    var geometry = new THREE.Geometry();
    var line_count = 0;
    var size_2 = maze.size >>> 1;
    for(i = 0; i < maze.size; ++i) {
      for (j = 0; j < maze.size; ++j) {
        var current_node = maze.nodes[maze.size * j + i];
        if (current_node.paths[core.DIRECTION.RIGHT] == core.PATH_TYPE.OPEN) {
          ++line_count;
          geometry.vertices.push(new THREE.Vector3((i + 1) - size_2, (j + 1) - size_2, 0.0));
          geometry.vertices.push(new THREE.Vector3((i + 2) - size_2, (j + 1) - size_2, 0.0));
        }
        if (current_node.paths[core.DIRECTION.DOWN] == core.PATH_TYPE.OPEN) {
          ++line_count;
          geometry.vertices.push(new THREE.Vector3((i + 1) - size_2, (j + 1) - size_2, 0.0));
          geometry.vertices.push(new THREE.Vector3((i + 1) - size_2, (j + 2) - size_2, 0.0));
        }
      }
    }
    core.mesh = new THREE.LineSegments(
      geometry,
      sphereMaterial
    );
    core.scene.add(core.mesh);

    // light
/*
    var pointLight = new THREE.PointLight( 0xFFFFFF );
    pointLight.position.x = 70;
    pointLight.position.y = 40;
    pointLight.position.z = 90;
    core.scene.add(pointLight);
*/
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

