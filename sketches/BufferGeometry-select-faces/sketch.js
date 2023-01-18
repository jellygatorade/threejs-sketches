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

// geometry - box and cylinder as examples
const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
//const geometry = new THREE.BoxGeometry(5, 5, 5);

// scene.add(cylinder);

const materials = [
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
  }),
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  }),
];

console.log(geometry);

// Following
// https://dustinpfister.github.io/2018/05/14/threejs-mesh-material-index/
// https://stackoverflow.com/questions/41540313/three-buffergeometry-accessing-face-indices-and-face-normals/41540720#41540720
// https://stackoverflow.com/questions/68934851/three-js-assign-array-of-materials-to-an-indexed-buffergeometry

// To change material per face in a BufferGeometry
// Faces must be selected by group

// For BufferGeometries in general (I think)
// geometry.index.array holds 3x the total amount of triangular faces, because it holds each vertex for each face
// geometry.index.array.length will 3x the total amount of triangular faces

// For CylinderGeometry specifically
// geometry.groups default 0th group always contains half of the total number of geometry.index.array.length
// I want
// start: 0, count: 3, materialIndex: 0
// start: 3, count: 3, materialIndex: 1
// start: 6, count: 3, materialIndex: 0
// ...until
// start: 0.5 * geometry.index.array.length ... and from there keep the two default groups representing the ends of the cylinder

const defaultGroups = geometry.groups; // store the default groups that come with CylinderGeometry
geometry.clearGroups(); // clear the default groups

// The loop below accomplishes something like this...
// geometry.addGroup(0, 3, 0);
// geometry.addGroup(3, 3, 1);
// geometry.addGroup(6, 3, 0);
// ...

let lastMatIndex = 0;
for (let i = 0; i < 0.5 * geometry.index.array.length; i += 3) {
  //console.log(i, lastMatIndex);
  geometry.addGroup(i, 3, lastMatIndex);
  // if i is odd
  if (i % 2 !== 0) {
    lastMatIndex = 1 - lastMatIndex; // flip between 0 and 1
  }
}

// Add the default groups back
geometry.addGroup(
  defaultGroups[1].start,
  defaultGroups[1].count,
  defaultGroups[1].materialIndex
);
geometry.addGroup(
  defaultGroups[2].start,
  defaultGroups[2].count,
  defaultGroups[2].materialIndex
);

// Cylinder by default only has 3 groups
// Box by default has 6 groups
const allFacesMaterials = geometry.groups.map((face, index) => {
  //console.log(index);
  // If index is even or odd
  if (index % 2 == 0) {
    return materials[0];
  } else {
    return materials[1];
  }
});

const object = new THREE.Mesh(geometry, allFacesMaterials);

console.log(object);

scene.add(object);

// const points = [];
// for (let i = 0; i < 10; i++) {
//   points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
// }
// const lathegeometry = new THREE.LatheGeometry(points);
// console.log(lathegeometry);

// Show edges
//const edges = new THREE.WireframeGeometry(geometry);
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(
  edges,
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
scene.add(line);

//lights
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_pointlights.html

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
