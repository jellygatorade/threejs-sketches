import * as THREE from "three";

import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";
import { GUI } from "../../three.js-r148/examples/jsm/libs/lil-gui.module.min.js";

import { gol } from "./game-of-life-1d.js";

// sketch config variables

const golCellCount = 150;
const intialGOL = gol.init(golCellCount);
const golUniversesCount = 64;

let speed = 0.01; // in units for THREE.Clock

const initialWireframes = false;

const initialRule = "Rule 90";
let rule = initialRule;

const initialEnvMap = "Day";

// basic scene

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50, // fov
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// env map

const textureLoader = new THREE.TextureLoader();

// const textureEquirec = textureLoader.load(
//   "../../three.js-r148/examples/textures/2294472375_24a3b8ef46_o.jpg"
// );

const textureEquirecDay = textureLoader.load("./envmaps/evening_meadow_2k.jpg");
textureEquirecDay.mapping = THREE.EquirectangularReflectionMapping;
textureEquirecDay.encoding = THREE.sRGBEncoding;

const textureEquirecNight = textureLoader.load(
  "./envmaps/dikhololo_night_2k.jpg"
);
textureEquirecNight.mapping = THREE.EquirectangularReflectionMapping;
textureEquirecNight.encoding = THREE.sRGBEncoding;

// materials

const materialsBasic = [
  new THREE.MeshBasicMaterial({
    color: 0x0d0d0d,
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  }),
];

const materialsReflective = [
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
    roughness: 0.15,
    metalness: 1,
    envMap: textureEquirecDay,
  }),
  new THREE.MeshStandardMaterial({
    color: 0xd4cecb, // beige
    side: THREE.DoubleSide,
    transparent: false,
    emissive: 0xd4cecb,
    emissiveIntensity: 0.4,
    roughness: 0.09,
    metalness: 0.5,
    envMap: textureEquirecDay,
  }),
];

const transparentMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.0,
});

// Edges colors
const basicLineColor = new THREE.Color(0x022b00);
const envLineColor = new THREE.Color(0x232418);

const wireframeMaterial = new THREE.LineBasicMaterial({
  color: envLineColor,
  linewidth: 1,
}); // Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.

//

let materials = materialsReflective;

const switchMaterialEnvMaps = (envmap) => {
  scene.background = envmap;
  materialsReflective.forEach((material) => (material.envMap = envmap));
  if (envmap === "Day") {
    materialsReflective[1].emissiveIntensity = 0.4;
  } else if (envmap === "Dusk") {
    materialsReflective[1].emissiveIntensity = 0.18;
  }
};

const switchEnvironments = (value) => {
  switch (value) {
    case "Day":
      scene.background = textureEquirecDay;
      materials = materialsReflective;
      switchMaterialEnvMaps(textureEquirecDay);
      wireframeMaterial.color = envLineColor;
      break;
    case "Dusk":
      scene.background = textureEquirecNight;
      materials = materialsReflective;
      switchMaterialEnvMaps(textureEquirecNight);
      wireframeMaterial.color = envLineColor;
      break;
    case "None":
      scene.background = null;
      materials = materialsBasic;
      wireframeMaterial.color = basicLineColor;
      break;
  }
};

switchEnvironments(initialEnvMap);

//

// Alternates materials per the geometry group index
const alternateFacesMaterials = (geometry) => {
  const matArray = geometry.groups.map((face, index) => {
    //console.log(index);
    // If index is even or odd
    if (index % 2 == 0) {
      return materials[0];
    } else {
      return materials[1];
    }
  });
  return matArray;
};

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
const scaleBy = 0.96;
const offsetBy = 1;

let positionY = initialpositionY;
let scale = initialScale;
const cylinders = new THREE.Group();
const edges = new THREE.Group();

for (let i = 0; i < golUniversesCount; i++) {
  // Using the GOL array to specify how many divisions

  //  CylinderGeometry params
  //
  //  {
  //    radiusTop : Float,
  //    radiusBottom : Float,
  //    height : Float,
  //    radialSegments : Integer,
  //    heightSegments : Integer,
  //    openEnded : Boolean,
  //    thetaStart : Float, thetaLength : Float)
  //   }

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

  let cylinder;
  if (i === 0) {
    cylinder = new THREE.Mesh(geometry, mapGOLToMaterials(intialGOL));
  } else {
    cylinder = new THREE.Mesh(geometry, transparentMaterial);
  }

  cylinder.position.y = positionY;
  cylinder.scale.set(scale, scale, scale);
  //cylinder.scale.x = scale;
  //cylinder.scale.z = scale;

  // Show edges
  const cylinderEdges = new THREE.EdgesGeometry(cylinder.geometry);
  // Edges colors
  // 0x61ff8e
  // 0x909e93
  // 0x718074
  // 0x434530
  // 0x232418
  const lines = new THREE.LineSegments(cylinderEdges, wireframeMaterial);

  lines.position.y = positionY;
  lines.scale.set(scale, scale, scale);
  //lines.scale.x = scale;
  //lines.scale.z = scale;

  cylinders.add(cylinder);
  edges.add(lines);

  scale *= scaleBy;
  positionY += offsetBy;
}

scene.add(cylinders);

if (initialWireframes) {
  scene.add(edges);
}

// controls and camera positioning

const controls = new OrbitControls(camera, renderer.domElement);

const fullHeight = 0.5 * golUniversesCount * offsetBy;
const halfHeight = 0;

camera.position.x = -10;
camera.position.y = 2 * fullHeight + 2;
camera.position.z = 0.65 * fullHeight - 0;
controls.target = new THREE.Vector3(0, halfHeight - 10, 0);
controls.update();

//

// gui

const mapRange = (number, [inMin, inMax], [outMin, outMax]) => {
  // if you need an integer value use Math.floor or Math.ceil here
  return ((number - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

const speeds = {
  controlsMin: 0,
  controlsMax: 1,
  threeClockMin: 0.1,
  threeClockMax: 0,
};
const initialSpeed = mapRange(
  speed,
  [speeds.threeClockMin, speeds.threeClockMax],
  [speeds.controlsMin, speeds.controlsMax]
);

//

const gui = new GUI();

const parameters = {
  speed: initialSpeed,
  wireframes: initialWireframes,
  rule: initialRule,
  environmentMap: initialEnvMap,
};

const speedGUI = gui
  .add(parameters, "speed")
  .min(0.0)
  .max(1.0)
  .step(0.01)
  .name("Speed")
  .listen();

speedGUI.onChange(function (value) {
  const newSpeed = mapRange(
    value,
    [speeds.controlsMin, speeds.controlsMax],
    [speeds.threeClockMin, speeds.threeClockMax]
  );

  console.log(newSpeed);

  if (newSpeed >= speeds.threeClockMin) {
    speed = 1; // set to overly slow at minimum position
  } else {
    speed = newSpeed; // heed the actual mapped value
  }
});

const ruleGUI = gui
  .add(parameters, "rule", ["Rule 30", "Rule 90", "Rule 184"])
  .name("Rule");

ruleGUI.onChange(function (value) {
  rule = value;
});

const envmapGUI = gui
  .add(parameters, "environmentMap", ["Day", "Dusk", "None"])
  .name("Enviroment");

envmapGUI.onChange(function (value) {
  switchEnvironments(value);
});

const wireframesGUI = gui
  .add(parameters, "wireframes")
  .min(0.0)
  .max(0.1)
  .step(0.01)
  .name("Wireframes")
  .listen();
wireframesGUI.onChange(function (value) {
  if (value) {
    scene.add(edges);
  } else {
    scene.remove(edges);
  }
});

// resize

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
    let nextIteration = gol.iterate(rule);

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

  renderer.render(scene, camera);
}

animate();
