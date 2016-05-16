// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
// require jquery
// require jquery_ujs
// require turbolinks
// require_tree .

//= require 'three-0.76.0'
//= require 'jquery-2.2.3'
//= require 'dat.gui-0.5.1'

$(document).ready(function() {

  var core = core || {};

  core.WIDTH       = window.innerWidth;
  core.HEIGHT      = window.innerHeight;
  core.ASPECT      = core.WIDTH / core.HEIGHT;
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
    core.container = $('.container');
    core.renderer = new THREE.WebGLRenderer();
    core.camera = new THREE.PerspectiveCamera(core.VIEW_ANGLE, core.ASPECT, core.NEAR, core.FAR);
    core.scene = new THREE.Scene();

    core.camera.position.z = 300;
    core.renderer.setSize(core.WIDTH, core.HEIGHT);
    core.container.append(core.renderer.domElement);

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

    core.scene.add(core.camera);

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
    core.ASPECT = WIDTH/HEIGHT;

    core.camera.aspect = core.ASCPECT;
    core.camera.updateProjectionMatrix();
    renderer.setSize(core.WIDTH, core.HEIGHT);
  }


  function render() {
    requestAnimationFrame(render);

    core.mesh.rotation.x += 0.0053;
    core.mesh.rotation.y += 0.0111;

    core.renderer.render(core.scene, core.camera);
  }

  core.init_geometry();
  render();

});

