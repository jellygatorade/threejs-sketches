import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

import { gol } from "./game-of-life-1d.js";

const golCellCount = 150;
const intialGOL = gol.init(golCellCount);
const golUniversesCount = 64;
const speed = 0.05; // figure out units for THREE.Clock

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

// materials
const materials = [
  // new THREE.MeshBasicMaterial({
  //   color: 0x000000,
  // }),
  // new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  // }),
  new THREE.MeshStandardMaterial({
    color: 0xffff00,
    roughness: 0.15,
  }),
  new THREE.MeshStandardMaterial({
    color: 0xff00ff,
    roughness: 0.15,
  }),
];

// // Alternates materials per the geometry group index
// const alternateFacesMaterials = geometry.groups.map((face, index) => {
//   //console.log(index);
//   // If index is even or odd
//   if (index % 2 == 0) {
//     return materials[0];
//   } else {
//     return materials[1];
//   }
// });

function mapGOLToMaterials(array) {
  const newMaterialsArr = array.map((item) => {
    return materials[item];
  });

  return newMaterialsArr;
}

// create cylinders
const initialpositionY = -0.5 * golUniversesCount;
const initialScale = 1;
const radius = 25;
const scaleBy = 0.95;
const offsetBy = 1;

let positionY = initialpositionY;
let scale = initialScale;
const cylinders = new THREE.Group();
const edges = new THREE.Group();

for (let i = 0; i < golUniversesCount; i++) {
  // Using the GOL array to specify how many divisions
  const geometry = new THREE.CylinderGeometry(
    radius * scaleBy,
    radius,
    1,
    intialGOL.length,
    1
  );

  const defaultGroups = geometry.groups; // store the default groups that come with CylinderGeometry
  geometry.clearGroups(); // clear the default groups

  // The loop below accomplishes something like this...
  // geometry.addGroup(0, 6, 0);
  // geometry.addGroup(6, 6, 1);
  // geometry.addGroup(12, 6, 2);
  // geometry.addGroup(18, 6, 3);
  // ...

  let iterations = 0; // used to make each materialIndex unique (0, 1, 2, 3...)
  for (let i = 0; i < 0.5 * geometry.index.array.length; i += 6) {
    //console.log(i, matIndex);
    geometry.addGroup(i, 6, iterations);
    iterations++;
  }

  const cylinder = new THREE.Mesh(geometry, mapGOLToMaterials(intialGOL));

  cylinder.position.y = positionY;
  //cylinder.scale.set(scale, scale, scale);
  cylinder.scale.x = scale;
  cylinder.scale.z = scale;

  cylinders.add(cylinder);

  // Show edges
  const cylinderEdges = new THREE.EdgesGeometry(cylinder.geometry);
  const lines = new THREE.LineSegments(
    cylinderEdges,
    new THREE.LineBasicMaterial({ color: 0x61ff8e, linewidth: 1 }) // Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.
  );

  lines.position.y = positionY;
  //lines.scale.set(scale, scale, scale);
  lines.scale.x = scale;
  lines.scale.z = scale;

  edges.add(lines);

  scale *= scaleBy;
  positionY += offsetBy;
}

scene.add(cylinders);
//scene.add(edges);

console.log(cylinders);
console.log(edges);

// geometry - using the GOL array to specify how many divisions
const geometry = new THREE.CylinderGeometry(15, 15, 1, intialGOL.length, 1);

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
// geometry.addGroup(0, 6, 0);
// geometry.addGroup(6, 6, 1);
// geometry.addGroup(12, 6, 2);
// geometry.addGroup(18, 6, 3);
// ...

let iterations = 0; // used to make each materialIndex unique (0, 1, 2, 3...)
for (let i = 0; i < 0.5 * geometry.index.array.length; i += 6) {
  //console.log(i, matIndex);
  geometry.addGroup(i, 6, iterations);
  iterations++;
}

// Add the default groups back
// geometry.addGroup(
//   defaultGroups[1].start,
//   defaultGroups[1].count,
//   defaultGroups[1].materialIndex
// );
// geometry.addGroup(
//   defaultGroups[2].start,
//   defaultGroups[2].count,
//   defaultGroups[2].materialIndex
// );

//const object = new THREE.Mesh(geometry, alternateFacesMaterials);
//const object = new THREE.Mesh(geometry, mapGOLToMaterials(intialGOL));
//console.log(object);

//scene.add(object);

// // Show edges
// //const edges = new THREE.WireframeGeometry(geometry);
// const edges = new THREE.EdgesGeometry(geometry);
// const line = new THREE.LineSegments(
//   edges,
//   new THREE.LineBasicMaterial({ color: 0xffffff })
// );
// scene.add(line);

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

camera.position.y = 0.5 * golUniversesCount;
camera.position.z = 6;
controls.target = new THREE.Vector3(0, 5, 0);
controls.update();

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

const clock = new THREE.Clock();

let bufferedFrames = [];

function animate() {
  requestAnimationFrame(animate);

  // Control animation update with clock
  if (clock.getElapsedTime() > speed) {
    let nextIteration = gol.iterate();

    // Keep an array of the last config.keepFrames amount of ImageData
    bufferedFrames.unshift(nextIteration);
    if (bufferedFrames.length > golUniversesCount) {
      bufferedFrames.pop();
    }

    cylinders.children.map((cylinder, index) => {
      if (bufferedFrames[index]) {
        cylinder.material = mapGOLToMaterials(bufferedFrames[index]);
      }
    });

    // Reset the clock
    clock.stop();
    clock.start();
  }

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
