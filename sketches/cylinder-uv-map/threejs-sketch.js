import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

function threeJSscene(p5canvas) {
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
  renderer.domElement.style.zIndex = "0";

  const controls = new OrbitControls(camera, renderer.domElement);

  // geometry

  // //CylinderGeometry params - (radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
  // const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
  // // const geometry = new THREE.CylinderGeometry(
  // //   15,
  // //   15,
  // //   1,
  // //   64,
  // //   1,
  // //   true,
  // //   0,
  // //   2 * Math.PI
  // // );

  // CANVAS TEXTURE
  // Needs to be passed the p5canvas param
  const canvasTexture = new THREE.CanvasTexture(p5canvas);
  const canvasMaterial = new THREE.MeshBasicMaterial({
    map: canvasTexture,
  });

  // UV Grid Texture
  const loader = new THREE.TextureLoader();
  const uvGridMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(
      "../../three.js-r148/examples/textures/uv_grid_opengl.jpg"
    ),
  });

  const materials = [canvasMaterial, uvGridMaterial, uvGridMaterial];

  // create cylinders
  const initialpositionY = 0;
  const initialScale = 1;
  const totalCylinders = 96;
  const scaleBy = 0.95;
  const offsetBy = 1.01;

  let positionY = initialpositionY;
  let scale = initialScale;

  const cylinders = new THREE.Group();

  for (let i = 0; i < totalCylinders; i++) {
    const geometry = new THREE.CylinderGeometry(23.87324, 23.87324, 1, 64, 1);
    //const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
    //const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1, true, 0, 2*Math.PI);
    const cylinder = new THREE.Mesh(geometry, materials);
    cylinder.position.y = positionY;
    cylinder.scale.set(scale, scale, scale);

    cylinders.add(cylinder);

    scale *= scaleBy;
    positionY += offsetBy;
  }

  scene.add(cylinders);

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
    canvasTexture.needsUpdate = true;

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();
}

export { threeJSscene };
