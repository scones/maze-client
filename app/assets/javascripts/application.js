//= require 'three-0.76.0'
//= require 'jquery-2.2.3'
//= require 'dat.gui-0.5.1'
//= require_tree .

$(document).ready(function() {

  var core = core || {};

  core.WIDTH       = null;
  core.HEIGHT      = null;
  core.ASPECT      = null;
  core.VIEW_ANGLE  = 60.0;
  core.NEAR        = 0.1;
  core.FAR         = 1000.0;


  core.node = function(seed, size, parent = null) {
    this.parent = parent;
    this.size = size;
    this.children = new Array(4);
    this.geometry = new THREE.BufferGeometry();
  };


  core.cell = function(parent) {
    this.parent = parent;
    this.directions = new Array(4);
  };


  core.init_geometry = function() {
    // basic stuff
    core.scene = new THREE.Scene();
    core.container = $('.container');
    core.renderer = new THREE.WebGLRenderer();
    core.container.append(core.renderer.domElement);

    // camera
    core.camera = new THREE.PerspectiveCamera(core.VIEW_ANGLE, 0, core.NEAR, core.FAR);
    onWindowResize();
    core.camera.position.z = 300;
    core.scene.add(core.camera);

    // geometry
    var sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });
    var radius = 50, segments = 16, rings = 16;
    var geometry = new THREE.IcosahedronGeometry(radius);
    core.mesh = new THREE.Mesh(
      geometry,
      sphereMaterial
    );
    core.scene.add(core.mesh);

    // light
    var pointLight = new THREE.PointLight( 0xFFFFFF );
    pointLight.position.x = 70;
    pointLight.position.y = 40;
    pointLight.position.z = 90;
    core.scene.add(pointLight);
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

    core.mesh.rotation.x += 0.0053;
    core.mesh.rotation.y += 0.0111;

    core.renderer.render(core.scene, core.camera);
  }


  window.addEventListener( 'resize', onWindowResize, false );
  core.init_geometry();
  render();

});

