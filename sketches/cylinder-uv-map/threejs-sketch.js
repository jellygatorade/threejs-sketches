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
  //CylinderGeometry params - (radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
  const geometry = new THREE.CylinderGeometry(15, 15, 1, 64, 1);
  // const geometry = new THREE.CylinderGeometry(
  //   15,
  //   15,
  //   1,
  //   64,
  //   1,
  //   true,
  //   0,
  //   2 * Math.PI
  // );

  // CANVAS TEXTURE
  // Needs to wait for p5 to initialize

  const canvasTexture = new THREE.CanvasTexture(p5canvas);
  const material = new THREE.MeshBasicMaterial({
    map: canvasTexture,
  });

  // UV Grid Texture
  // const loader = new THREE.TextureLoader();
  // const material = new THREE.MeshBasicMaterial({
  //   map: loader.load(
  //     "../../three.js-r148/examples/textures/uv_grid_opengl.jpg"
  //   ),
  // });

  const cylinder = new THREE.Mesh(geometry, material);

  scene.add(cylinder);

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
