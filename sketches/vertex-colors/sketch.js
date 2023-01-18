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

const geometry = new THREE.BoxGeometry(5, 5, 5);

// Using vertex colors
const colorsAttr = geometry.attributes.position.clone();

// Faces will be colored by vertex colors
geometry.setAttribute("color", colorsAttr);
const vertexColorsMat = new THREE.MeshBasicMaterial({
  vertexColors: true,
});

const cube = new THREE.Mesh(geometry, vertexColorsMat);
scene.add(cube);

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

  renderer.render(scene, camera);
}

animate();
