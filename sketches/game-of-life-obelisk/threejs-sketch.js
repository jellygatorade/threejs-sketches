import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

function threeJSscene(p5data) {
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

  // UV Grid Texture
  const loader = new THREE.TextureLoader();
  const uvGridMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(
      "../../three.js-r148/examples/textures/uv_grid_opengl.jpg"
    ),
  });

  // create cylinders
  const initialpositionY = 0;
  const initialScale = 1;
  //const totalCylinders = 96;
  const scaleBy = 0.94;
  const offsetBy = 1.01;

  let positionY = initialpositionY;
  let scale = initialScale;

  const cylinders = new THREE.Group();

  console.log(p5data);

  const canvasTextures = [];

  for (let i = 0; i < p5data.canvases.length; i++) {
    const geometry = new THREE.CylinderGeometry(23.87324, 24.87324, 1, 64, 1);
    //const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
    //const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1, true, 0, 2*Math.PI);

    // CANVAS TEXTURE
    // Needs to be passed the p5canvas param
    //const canvasTexture = new THREE.CanvasTexture(p5data.original.canvas);
    const canvasTexture = new THREE.CanvasTexture(p5data.canvases[i].canvas);
    const canvasMaterial = new THREE.MeshBasicMaterial({
      map: canvasTexture,
    });
    canvasTextures.push(canvasTexture);

    const materials = [canvasMaterial, uvGridMaterial, uvGridMaterial];

    const cylinder = new THREE.Mesh(geometry, materials);
    cylinder.position.y = positionY;
    //cylinder.scale.set(scale, scale, scale);
    cylinder.scale.x = scale;
    cylinder.scale.z = scale;

    cylinders.add(cylinder);

    scale *= scaleBy;
    positionY += offsetBy;
  }

  scene.add(cylinders);

  camera.position.y = 20;
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
    canvasTextures.map((texture) => (texture.needsUpdate = true));

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();
}

export { threeJSscene };
