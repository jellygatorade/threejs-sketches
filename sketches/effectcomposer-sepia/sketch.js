// https://threejs.org/docs/#examples/en/postprocessing/EffectComposer.addPass
// https://threejs.org/examples/#webgl_postprocessing_advanced
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_advanced.html

import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { TexturePass } from "three/addons/postprocessing/TexturePass.js";

import { SepiaShader } from "three/addons/shaders/SepiaShader.js";

// basic scene setup

var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create off-screen render target

// create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();

// create the texture that will store our result
var bufferTexture = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter }
);

// red box
var redMaterial = new THREE.MeshBasicMaterial({ color: 0xf06565 });
var boxGeometry = new THREE.BoxGeometry(5, 5, 5);
var boxObject = new THREE.Mesh(boxGeometry, redMaterial);
boxObject.position.z = -10;
bufferScene.add(boxObject); //We add it to the bufferScene instead of the normal scene!

// blue plane (background)
var blueMaterial = new THREE.MeshBasicMaterial({ color: 0x7074ff });
var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
var planeObject = new THREE.Mesh(plane, blueMaterial);
planeObject.position.z = -15;
bufferScene.add(planeObject); //We add it to the bufferScene instead of the normal scene!

// add an EffectComposer

const composer = new EffectComposer(renderer);
const shaderSepia = SepiaShader;
const effectSepia = new ShaderPass(shaderSepia);
effectSepia.uniforms["amount"].value = 0.9;

const renderScene = new TexturePass(bufferTexture.texture);
composer.addPass(renderScene);
composer.addPass(effectSepia);

const delta = 0.01;

function render() {
  requestAnimationFrame(render);

  // buffer scene box rotation
  boxObject.rotation.y += 0.01;
  boxObject.rotation.x += 0.01;

  // render onto off-screen texture
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera);

  // finally draw to the screen
  composer.render(delta);
}
render();
