// Following
// https://kadekeith.me/2017/09/12/three-glow.html
// https://kadekeith.me/stuff/three/glow/
//
// which follows https://stemkoski.github.io/Three.js/Shader-Glow.html

import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

let SCENE_WIDTH = window.innerWidth;
let SCENE_HEIGHT = Math.max(window.innerHeight - 130, 200);

let FIELD_OF_VIEW = 45;
let ASPECT = SCENE_WIDTH / SCENE_HEIGHT;
let NEAR = 0.1;
let FAR = 10000;

let scene = new THREE.Scene();

/** create the renderer and add it to the scene */
let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x8d8d8d, 1);
renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT);
document.getElementById("webgl-container").appendChild(renderer.domElement);

/** create the camera and add it to the scene */
let camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW, ASPECT, NEAR, FAR);
camera.position.set(-10, 10, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// main light
let light = new THREE.PointLight(0xffffff, 0.8); // white light
light.position.set(30, 100, 50);
scene.add(light);

let geometry = new THREE.TorusGeometry(10, 3, 16, 100);
let material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
let object = new THREE.Mesh(geometry, material);

let glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    viewVector: {
      type: "v3",
      value: camera.position,
    },
  },
  vertexShader: document.getElementById("vertexShaderSun").textContent,
  fragmentShader: document.getElementById("fragmentShaderSun").textContent,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
});

let glowGeometry = new THREE.TorusGeometry(10, 5, 16, 100);

let glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
object.add(glowMesh);
object.glow = glowMesh;
scene.add(object);

let controls = new OrbitControls(camera, renderer.domElement);

function update() {
  // let viewVector = new THREE.Vector3().subVectors(
  //   camera.position,
  //   object.glow.getWorldPosition()
  // );
  // object.glow.material.uniforms.viewVector.value = viewVector;

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
