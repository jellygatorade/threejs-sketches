import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// material
const textureLoader = new THREE.TextureLoader();

const diffuse = textureLoader.load(
  "../../three.js-r148/examples/textures/carbon/Carbon.png"
);
diffuse.encoding = THREE.sRGBEncoding;
diffuse.wrapS = THREE.RepeatWrapping;
diffuse.wrapT = THREE.RepeatWrapping;

// geometry
const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
//const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1, true, 0, 2*Math.PI);
const material = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  roughness: 0.4,
});
const cylinder = new THREE.Mesh(geometry, material);

scene.add(cylinder);

//lights
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_pointlights.html

const sphere = new THREE.SphereGeometry(0.5, 16, 8);

const light1 = new THREE.PointLight(0xff0040, 2, 50);
light1.add(
  new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 }))
);
scene.add(light1);

const light2 = new THREE.PointLight(0x0040ff, 2, 50);
light2.add(
  new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff }))
);
scene.add(light2);

const light3 = new THREE.PointLight(0x80ff80, 2, 50);
light3.add(
  new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x80ff80 }))
);
scene.add(light3);

const light4 = new THREE.PointLight(0xffaa00, 2, 50);
light4.add(
  new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffaa00 }))
);
scene.add(light4);

camera.position.z = 36;

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  cylinder.rotation.x += 0.01;
  cylinder.rotation.y += 0.01;

  const time = Date.now() * 0.0005;

  light1.position.x = Math.sin(time * 0.7) * 30;
  light1.position.y = Math.cos(time * 0.5) * 40;
  light1.position.z = Math.cos(time * 0.3) * 30;

  light2.position.x = Math.cos(time * 0.3) * 30;
  light2.position.y = Math.sin(time * 0.5) * 40;
  light2.position.z = Math.sin(time * 0.7) * 30;

  light3.position.x = Math.sin(time * 0.7) * 30;
  light3.position.y = Math.cos(time * 0.3) * 40;
  light3.position.z = Math.sin(time * 0.5) * 30;

  light4.position.x = Math.sin(time * 0.3) * 30;
  light4.position.y = Math.cos(time * 0.7) * 40;
  light4.position.z = Math.sin(time * 0.5) * 30;

  renderer.render(scene, camera);
}

animate();
