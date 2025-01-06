import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

import { gol } from "./game-of-life-1d.js";

// sketch config variables

let glowGUI;

const golCellCount = 150;
const intialGOL = gol.init(golCellCount);
const golUniversesCount = 72;

let speed = 0.01; // in units for THREE.Clock

const initialWireframes = false;

const initialRule = "Rule 90";
let rule = initialRule;

const initialEnvMap = "Day";

const initialGlow = false;
let glow = initialGlow;

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

const textureEquirecDay = textureLoader.load("../../assets/envmaps/evening_meadow_2k.jpg");
textureEquirecDay.mapping = THREE.EquirectangularReflectionMapping;
textureEquirecDay.encoding = THREE.sRGBEncoding;

const textureEquirecNight = textureLoader.load("../../assets/envmaps/dikhololo_night_2k.jpg");
textureEquirecNight.mapping = THREE.EquirectangularReflectionMapping;
textureEquirecNight.encoding = THREE.sRGBEncoding;

// materials

const materialsBasic = [
  new THREE.MeshBasicMaterial({
    color: 0x0f0f0f,
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    color: 0xf0f0f0,
    side: THREE.DoubleSide,
  }),
];

const materialsBasicRaleighProposal = [
  new THREE.MeshBasicMaterial({
    color: 0x645640,
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    color: 0xf2ebe3,
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
const basicLineColor = new THREE.Color(0x034000);
const basicLineColorRaleighProposal = new THREE.Color(0x241610);
const envLineColor = new THREE.Color(0x2f3020);
const envLineColorRaleighProposal = new THREE.Color(0xffffff);

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
      scene.backgroundIntensity = 0.8;
      materials = materialsReflective;
      switchMaterialEnvMaps(textureEquirecDay);
      wireframeMaterial.color = envLineColor;
      break;
    case "Dusk":
      scene.background = textureEquirecNight;
      scene.backgroundIntensity = 1.0;
      materials = materialsReflective;
      switchMaterialEnvMaps(textureEquirecNight);
      wireframeMaterial.color = envLineColor;
      break;
    case "Raleigh Proposal":
      scene.background = envLineColorRaleighProposal;
      scene.backgroundIntensity = 1.0;
      materials = materialsBasicRaleighProposal;
      wireframeMaterial.color = basicLineColorRaleighProposal;
      glowGUI.setValue(false);
      break;
    case "None":
      scene.background = envLineColor;
      scene.backgroundIntensity = 1.0;
      materials = materialsBasic;
      wireframeMaterial.color = basicLineColor;
      glowGUI.setValue(false);
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

  const geometry = new THREE.CylinderGeometry(radius * scaleBy, radius, 1, intialGOL.length, 1);

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

camera.position.x = -4;
camera.position.y = fullHeight * 1.35;
camera.position.z = 4;
controls.target = new THREE.Vector3(0, halfHeight - 10, 0);
controls.update();

//

// gui - speed functions

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

const initialSpeed = mapRange(speed, [speeds.threeClockMin, speeds.threeClockMax], [speeds.controlsMin, speeds.controlsMax]);

// gui

const gui = new GUI();

const parameters = {
  instruction: "",
  speed: initialSpeed,
  wireframes: initialWireframes,
  rule: initialRule,
  environmentMap: initialEnvMap,
  glow: glow,
};

const instruction1GUI = gui.add(parameters, "instruction").name("- Click + drag + scroll to reposition view.");
// dat.gui styles editing for writing the instruction
document.getElementById("lil-gui-name-1").parentElement.childNodes[0].style.width = "100%";
document.getElementById("lil-gui-name-1").parentElement.childNodes[0].style.whiteSpace = "normal";
document.getElementById("lil-gui-name-1").parentElement.childNodes[1].remove();

const instruction2GUI = gui.add(parameters, "instruction").name("- Numeric keys 1 - 4 to quickly switch between cellular automata rules.");
// dat.gui styles editing for writing the instruction
document.getElementById("lil-gui-name-2").parentElement.childNodes[0].style.width = "100%";
document.getElementById("lil-gui-name-2").parentElement.childNodes[0].style.whiteSpace = "normal";
document.getElementById("lil-gui-name-2").parentElement.childNodes[1].remove();

const instruction3GUI = gui.add(parameters, "instruction").name("- For example switching between Rule 90 and Rule 184 yields nice variations.");
// dat.gui styles editing for writing the instruction
document.getElementById("lil-gui-name-3").parentElement.childNodes[0].style.width = "100%";
document.getElementById("lil-gui-name-3").parentElement.childNodes[0].style.whiteSpace = "normal";
document.getElementById("lil-gui-name-3").parentElement.childNodes[0].style.marginBottom = "0.5rem";
document.getElementById("lil-gui-name-3").parentElement.childNodes[1].remove();

const speedGUI = gui.add(parameters, "speed").min(0.0).max(1.0).step(0.01).name("Speed").listen();

speedGUI.onChange(function (value) {
  const newSpeed = mapRange(value, [speeds.controlsMin, speeds.controlsMax], [speeds.threeClockMin, speeds.threeClockMax]);

  //console.log(newSpeed);

  if (newSpeed >= speeds.threeClockMin) {
    speed = 1; // set to overly slow at minimum position
  } else {
    speed = newSpeed; // heed the actual mapped value
  }
});

const ruleGUI = gui.add(parameters, "rule", ["Rule 30", "Rule 90", "Rule 110", "Rule 184"]).name("Rule");

ruleGUI.onChange(function (value) {
  rule = value;
});

const envmapGUI = gui.add(parameters, "environmentMap", ["Day", "Dusk", "Raleigh Proposal", "None"]).name("Enviroment");

envmapGUI.onChange(function (value) {
  switchEnvironments(value);
});

const wireframesGUI = gui.add(parameters, "wireframes").name("Wireframes");

wireframesGUI.onChange(function (value) {
  if (value) {
    scene.add(edges);
  } else {
    scene.remove(edges);
  }
});

glowGUI = gui.add(parameters, "glow").name("Glow");

glowGUI.onChange(function (value) {
  glow = value;
});

// keyboard shortcuts for cellular automata rules

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "1":
      ruleGUI.setValue("Rule 30");
      break;
    case "2":
      ruleGUI.setValue("Rule 90");
      break;
    case "3":
      ruleGUI.setValue("Rule 110");
      break;
    case "4":
      ruleGUI.setValue("Rule 184");
      break;
    default:
      return;
  }
});

// effect composer - glow

const composer = new EffectComposer(renderer);

const delta = 0.01; // required for EffectComposer ?

const renderScene = new RenderPass(scene, camera);
composer.addPass(renderScene);

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

// Assessment color values
// #60634f
// #474a38"
// #232418
outlinePass.visibleEdgeColor.set("#60634f");
outlinePass.hiddenEdgeColor.set("#000000");
outlinePass.edgeStrength = 2.5;
outlinePass.edgeGlow = 0.0;
outlinePass.edgeThickness = 5.0;
outlinePass.selectedObjects = [cylinders];

composer.addPass(outlinePass);
//

// resize

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

// animation

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

  if (glow) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

animate();
