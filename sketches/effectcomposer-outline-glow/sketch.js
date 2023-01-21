// todo:
// try to implement a multiple pass glow effect
// https://www.youtube.com/watch?v=SMLbbi8oaO8
// and consider this comment:
// "It seems like this could be simplified a bit. You could probably render your blurred geometry to a separate buffer as normal. Draw the rest of the scene as normal and then render the glowing objects as a blurred effect on top of that. Then finally render the that buffer again (non-blurred) on top of that a third time. This eliminates a buffer and a shader step. You could probably also use the depth buffer to handle the overglow effects (4:30) -- also if you still wanted the cutouts you could use a stencil buffer on that first glow-object render (but you probably won't be able to get that inner shadow effect)."

// reference for EffectComposer:
// https://threejs.org/docs/#examples/en/postprocessing/EffectComposer.addPass
// https://threejs.org/examples/#webgl_postprocessing_advanced
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_advanced.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

import { Vector2 } from "three";

//

// basic scene setup

var camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0000ff, 1); // make the renderer backgroundblue
document.body.appendChild(renderer.domElement);

// For orbit controls the camera position and orbit controls target cannot be the same
camera.position.z = 10;
const controls = new OrbitControls(camera, renderer.domElement);

//

// create off-screen render target

// create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();

// create the texture that will store our result
var bufferTexture = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter }
);

// add boxes to bufferScene
var redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

var boxGeometry = new THREE.BoxGeometry(5, 5, 5);

var boxObject1 = new THREE.Mesh(boxGeometry, redMaterial);
var boxObject2 = new THREE.Mesh(boxGeometry, greenMaterial);

boxObject1.position.x = -5;
boxObject2.position.x = 5;

bufferScene.add(boxObject1); //We add it to the bufferScene instead of the normal scene!
bufferScene.add(boxObject2); //We add it to the bufferScene instead of the normal scene!

//

// add an EffectComposer
const composer = new EffectComposer(renderer);

const delta = 0.01; // required for EffectComposer ?

const renderScene = new RenderPass(bufferScene, camera);
composer.addPass(renderScene);

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bufferScene,
  camera
);

// const params = {
//   edgeStrength: 3.0,
//   edgeGlow: 0.0,
//   edgeThickness: 1.0,
//   pulsePeriod: 0,
//   rotate: false,
//   usePatternTexture: false,
// };

outlinePass.visibleEdgeColor.set("#ffffff");
outlinePass.hiddenEdgeColor.set("#ff00ff");
outlinePass.edgeStrength = 7.0;
outlinePass.edgeGlow = 0.2;
outlinePass.edgeThickness = 8.0;
outlinePass.selectedObjects = [boxObject2];

composer.addPass(outlinePass);
//

//

// window resizing

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // update the shader uniforms
  effectBlur.uniforms["res"].value = new Vector2(width, height);

  renderer.setSize(width, height);
}

//

// render

function render() {
  requestAnimationFrame(render);

  // buffer scene box rotation
  boxObject1.rotation.y += 0.01;
  boxObject1.rotation.x += 0.01;

  boxObject2.rotation.y -= 0.01;
  boxObject2.rotation.x -= 0.01;

  // render onto off-screen texture
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera);

  // finally draw to the screen
  composer.render(delta);

  // // or, render without first passing to bufferTexture -> EffectComposer
  // renderer.setRenderTarget(null);
  // renderer.render(bufferScene, camera);
}

render();
