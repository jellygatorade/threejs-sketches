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
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { TexturePass } from "three/addons/postprocessing/TexturePass.js";

import { SepiaShader } from "three/addons/shaders/SepiaShader.js";

// BlurShader-3 is the best I have tried - Fabrice Neyret's "Single-pass gaussian blur - fast"
import { BlurShader } from "./BlurShader-3.js";
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

// add red box to bufferScene
var redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var boxGeometry = new THREE.BoxGeometry(5, 5, 5);
var boxObject = new THREE.Mesh(boxGeometry, redMaterial);
boxObject.position.z = 0;
bufferScene.add(boxObject); //We add it to the bufferScene instead of the normal scene!

//

// add an EffectComposer
const composer = new EffectComposer(renderer);

const shaderSepia = SepiaShader;
const effectSepia = new ShaderPass(shaderSepia);
effectSepia.uniforms["amount"].value = 0.9;

const shaderBlur = BlurShader;
const effectBlur = new ShaderPass(shaderBlur);
effectBlur.uniforms["res"].value = new Vector2(
  window.innerWidth,
  window.innerHeight
);

const renderScene = new TexturePass(bufferTexture.texture);
composer.addPass(renderScene);
//composer.addPass(effectSepia);
composer.addPass(effectBlur);

const delta = 0.05; // required for EffectComposer

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
  boxObject.rotation.y += 0.01;
  boxObject.rotation.x += 0.01;

  // render onto off-screen texture
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera);

  // finally draw to the screen
  composer.render(delta);

  // or, render without first passing to bufferTexture -> EffectComposer
  // renderer.setRenderTarget(null);
  // renderer.render(bufferScene, camera);
}

render();
