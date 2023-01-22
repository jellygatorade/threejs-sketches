import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Define two*pi rads (360 deg)
const twoPi = Math.PI * 2;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 0, 10);
controls.update();

// Fix aspect ratio on window resize
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**********************************************************************/

// Initialize Params
let params = {
  torusGroup: {
    material: {
      opacity: 0.5,
    },
    motion: {
      distance: 1.0,
      period: 5.0,
      phaseOffset: 1.0,
    },
  },
  sphereGroup1: {
    material: {
      opacity: 1.0,
    },
    motion: {
      distance: 1.0,
      period: 5.0,
      phaseOffset: 1.0,
    },
    scale: 1.0, // Unique to sphere (no scale for torus currently)
  },
  sphereGroup2: {
    material: {
      opacity: 1.0,
    },
    motion: {
      distance: 1.0,
      period: 5.0,
      phaseOffset: 1.0,
    },
    scale: 1.0, // Unique to sphere (no scale for torus currently)
  },
  bloom: {
    exposure: 0.2,
    bloomStrength: 0.2,
    bloomThreshold: 0,
    bloomRadius: 0.1,
  },
  envMap: false,
};

/**********************************************************************/
// Dat GUI
const gui = new GUI();

function updateGroupGeometry(mesh, geometry) {
  //mesh.children[0].geometry = new THREE.WireframeGeometry(geometry); // for WireFrame

  mesh.children[0].geometry.dispose();
  mesh.children[1].geometry.dispose();
  mesh.children[2].geometry.dispose();

  //mesh.children[0].geometry = new THREE.WireframeGeometry(geometry); // for WireFrame

  mesh.children[0].geometry = geometry;
  mesh.children[1].geometry = geometry;
  mesh.children[2].geometry = geometry;

  // these do not update nicely together if shared
}

const guis = {
  generateTorus: function (mesh) {
    const data = {
      radius: 3,
      tube: 1,
      radialSegments: 64,
      tubularSegments: 256,
      arc: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new THREE.TorusGeometry(
          data.radius,
          data.tube,
          data.radialSegments,
          data.tubularSegments,
          data.arc
        )
      );
    }

    const folder = gui.addFolder("Torus Geometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    folder
      .add(data, "radialSegments", 2, 128)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "tubularSegments", 3, 512)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "arc", 0.1, twoPi).onChange(generateGeometry);

    generateGeometry();
  },
};

/*********************************************************************/

// Env map
const textureLoader = new THREE.TextureLoader();

let textureEquirec = textureLoader.load(
  "../../assets/envmaps/above-clouds.jpg"
);
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.encoding = THREE.sRGBEncoding;

const envMapGeometry = new THREE.IcosahedronGeometry(400, 15);
let sphereMaterial = new THREE.MeshLambertMaterial({ envMap: textureEquirec });
let sphereMesh = new THREE.Mesh(envMapGeometry, sphereMaterial);
scene.add(sphereMesh);

// const backgroundParams = {
//   envMap: false,
// };

const backgroundGUIFolder = gui.addFolder("Background");
backgroundGUIFolder.add(params, "envMap").onChange(function (value) {
  if (value) {
    scene.background = textureEquirec;
  } else {
    scene.background = null;
  }
  sphereMaterial.needsUpdate = true;
});

/**********************************************************************/

// Matcap Material

const redMatcap = new THREE.TextureLoader().load(
  "../../assets/matcaps/red-light-to-black.jpg"
);

const greenMatcap = new THREE.TextureLoader().load(
  "../../assets/matcaps/green-light-to-black.jpg"
);

const blueMatcap = new THREE.TextureLoader().load(
  "../../assets/matcaps/blue-light-to-black.jpg"
);

function matcapMaterial(matcap, opacity) {
  return new THREE.MeshMatcapMaterial({
    matcap: matcap,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    clipIntersection: false,
    opacity: opacity,
  });
}

/*********************************************************************/

// Torus Group

const torusGroup = new THREE.Group();

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3));

// Red Torus
torusGroup.add(
  new THREE.Mesh(
    geometry,
    matcapMaterial(redMatcap, params.torusGroup.material.opacity)
  )
);

// // Green Torus
torusGroup.add(
  new THREE.Mesh(
    geometry,
    matcapMaterial(greenMatcap, params.torusGroup.material.opacity)
  )
);

// // Blue Torus
torusGroup.add(
  new THREE.Mesh(
    geometry,
    matcapMaterial(blueMatcap, params.torusGroup.material.opacity)
  )
);

guis.generateTorus(torusGroup);

// Torus Group Params GUI
const torusGroupGUIFolder = gui.addFolder("Torus Group");

// GUI - Opacity
torusGroupGUIFolder
  .add(params.torusGroup.material, "opacity", 0.0, 1.0)
  .onChange(function (value) {
    params.torusGroup.material.opacity = value;
  });

// GUI - Motion
torusGroupGUIFolder
  .add(params.torusGroup.motion, "distance", 0.0, 5.0)
  .onChange(function (value) {
    params.torusGroup.motion.distance = value;
  });

torusGroupGUIFolder
  .add(params.torusGroup.motion, "period", 0.0, 10)
  .onChange(function (value) {
    params.torusGroup.motion.period = value;
  });

torusGroupGUIFolder
  .add(params.torusGroup.motion, "phaseOffset", 0.0, 1)
  .onChange(function (value) {
    params.torusGroup.motion.phaseOffset = value;
  });

scene.add(torusGroup);

/*********************************************************************/

// Sphere Group 1

const sphereGroup1 = new THREE.Group();

const sphereGeometry = new THREE.SphereGeometry(1, 64, 32);

// Red Sphere
sphereGroup1.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(redMatcap, params.sphereGroup1.material.opacity)
  )
);

// Green Sphere
sphereGroup1.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(greenMatcap, params.sphereGroup1.material.opacity)
  )
);

// Blue Sphere
sphereGroup1.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(blueMatcap, params.sphereGroup1.material.opacity)
  )
);

// Sphere Group 1 Params GUI
const sphereGroup1GUIFolder = gui.addFolder("Sphere Group 1");

// GUI - Opacity
sphereGroup1GUIFolder
  .add(params.sphereGroup1.material, "opacity", 0.0, 1.0)
  .onChange(function (value) {
    params.sphereGroup1.material.opacity = value;
  });

// GUI - Scale
const sphereGroup1Scale = sphereGroup1GUIFolder
  .add(params.sphereGroup1, "scale", 0.0, 20.0)
  .onChange(function (value) {
    params.sphereGroup1.scale = value;
  });

// GUI - Motion
sphereGroup1GUIFolder
  .add(params.sphereGroup1.motion, "distance", 0.0, 5.0)
  .onChange(function (value) {
    params.sphereGroup1.motion.distance = value;
  });

sphereGroup1GUIFolder
  .add(params.sphereGroup1.motion, "period", 0.0, 10)
  .onChange(function (value) {
    params.sphereGroup1.motion.period = value;
  });

sphereGroup1GUIFolder
  .add(params.sphereGroup1.motion, "phaseOffset", 0.0, 1)
  .onChange(function (value) {
    params.sphereGroup1.motion.phaseOffset = value;
  });

scene.add(sphereGroup1);

// initialize Sphere Group 1 at 2x scale
sphereGroup1Scale.setValue(2.0);

/*********************************************************************/

// Sphere Group 2

const sphereGroup2 = new THREE.Group();

// use sphereGeometry from sphereGroup1 above
//const sphereGeometry = new THREE.SphereGeometry(1, 64, 32);

// Red Sphere
sphereGroup2.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(redMatcap, params.sphereGroup2.material.opacity)
  )
);

// Green Sphere
sphereGroup2.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(greenMatcap, params.sphereGroup2.material.opacity)
  )
);

// Blue Sphere
sphereGroup2.add(
  new THREE.Mesh(
    sphereGeometry,
    matcapMaterial(blueMatcap, params.sphereGroup2.material.opacity)
  )
);

// Sphere Group 2 Params GUI
const sphereGroup2GUIFolder = gui.addFolder("Sphere Group 2");

// GUI - Opacity
sphereGroup2GUIFolder
  .add(params.sphereGroup2.material, "opacity", 0.0, 1.0)
  .onChange(function (value) {
    params.sphereGroup2.material.opacity = value;
  });

// GUI - Scale
sphereGroup2GUIFolder
  .add(params.sphereGroup2, "scale", 0.0, 20.0)
  .onChange(function (value) {
    params.sphereGroup2.scale = value;
  });

// GUI - Motion
sphereGroup2GUIFolder
  .add(params.sphereGroup2.motion, "distance", 0.0, 5.0)
  .onChange(function (value) {
    params.sphereGroup2.motion.distance = value;
  });

sphereGroup2GUIFolder
  .add(params.sphereGroup2.motion, "period", 0.0, 10)
  .onChange(function (value) {
    params.sphereGroup2.motion.period = value;
  });

sphereGroup2GUIFolder
  .add(params.sphereGroup2.motion, "phaseOffset", 0.0, 1)
  .onChange(function (value) {
    params.sphereGroup2.motion.phaseOffset = value;
  });

scene.add(sphereGroup2);

/*********************************************************************/

// Clock for motion Params
const clock = new THREE.Clock();

/*********************************************************************/

// For post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.bloom.bloomThreshold;
bloomPass.strength = params.bloom.bloomStrength;
bloomPass.radius = params.bloom.bloomRadius;
composer.addPass(bloomPass);

// Dat GUI - Bloom
const bloomGUIFolder = gui.addFolder("Bloom");
bloomGUIFolder.add(params.bloom, "exposure", 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0);
});

bloomGUIFolder
  .add(params.bloom, "bloomThreshold", 0.0, 1.0)
  .onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

bloomGUIFolder
  .add(params.bloom, "bloomStrength", 0.0, 3.0)
  .onChange(function (value) {
    bloomPass.strength = Number(value);
  });

bloomGUIFolder
  .add(params.bloom, "bloomRadius", 0.0, 1.0)
  .step(0.01)
  .onChange(function (value) {
    bloomPass.radius = Number(value);
  });

/**********************************************************************/

function animate() {
  requestAnimationFrame(animate);

  let loopPhaseOffset = 0;

  for (let i = 0; i < torusGroup.children.length; i++) {
    torusGroup.children[i].position.z =
      params.torusGroup.motion.distance *
      Math.sin(
        clock.getElapsedTime() * params.torusGroup.motion.period +
          loopPhaseOffset * params.torusGroup.motion.phaseOffset
      );
    loopPhaseOffset += 1;

    torusGroup.children[i].material.opacity =
      params.torusGroup.material.opacity;
  }

  for (let i = 0; i < sphereGroup1.children.length; i++) {
    sphereGroup1.children[i].position.z =
      params.sphereGroup1.motion.distance *
      Math.sin(
        clock.getElapsedTime() * params.sphereGroup1.motion.period +
          loopPhaseOffset * params.sphereGroup1.motion.phaseOffset
      );
    loopPhaseOffset += 1;

    sphereGroup1.children[i].material.opacity =
      params.sphereGroup1.material.opacity;

    sphereGroup1.children[i].scale.setScalar(params.sphereGroup1.scale);
  }

  for (let i = 0; i < sphereGroup2.children.length; i++) {
    sphereGroup2.children[i].position.z =
      params.sphereGroup2.motion.distance *
      Math.sin(
        clock.getElapsedTime() * params.sphereGroup2.motion.period +
          loopPhaseOffset * params.sphereGroup2.motion.phaseOffset
      );
    loopPhaseOffset += 1;

    sphereGroup2.children[i].material.opacity =
      params.sphereGroup2.material.opacity;

    sphereGroup2.children[i].scale.setScalar(params.sphereGroup2.scale);
  }

  //renderer.render(scene, camera);
  composer.render();
}

animate();
