/******************************************************************************
 * Adapted from the below, code had to be updated to work with r148
 *
 * Specifically
 *
 * var boxMaterial = new THREE.MeshBasicMaterial({ map: bufferTexture.texture });
 *
 * and
 *
 * renderer.setRenderTarget(bufferTexture);
 * renderer.render(bufferScene, camera);
 *
 *
 *
 * See also: https://threejs.org/examples/webgl_rtt.html
 ******************************************************************************/

// Render to buffer following
// https://gamedevelopment.tutsplus.com/tutorials/quick-tip-how-to-render-to-a-texture-in-threejs--cms-25686

// Basic implementation skeleton written below:

/*
// @author Omar Shehata. 2016.

//// This is the basic scene setup ////

var scene = new THREE.Scene();
var width, height = window.innerWidth, window.innerHeight;
var camera = new THREE.PerspectiveCamera( 70, width/height, 1, 1000 );
var renderer = new THREE.WebGLRenderer(); 
renderer.setSize( width,height);
document.body.appendChild( renderer.domElement );

//// This is where we create our off-screen render target ////

// Create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();

// Create the texture that will store our result
var bufferTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

////
// Add anything you want to render/capture in bufferScene here //
////

function render() {

	requestAnimationFrame( render );

	// Render onto our off-screen texture

	renderer.render(bufferScene, camera, bufferTexture);

	// Finally, draw to the screen

	renderer.render( scene, camera );

}

render(); // Render everything!
*/

import * as THREE from "three";
import { OrbitControls } from "../../three.js-r148/examples/jsm/controls/OrbitControls.js";

///////////////////This is the basic scene setup
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

///////////////////This is where we create our off-screen render target
//Create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();
//Create the texture that will store our result
var bufferTexture = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter }
);

//Let's create a red box
var redMaterial = new THREE.MeshBasicMaterial({ color: 0xf06565 });
var boxGeometry = new THREE.BoxGeometry(5, 5, 5);
var boxObject = new THREE.Mesh(boxGeometry, redMaterial);
boxObject.position.z = -10;
bufferScene.add(boxObject); //We add it to the bufferScene instead of the normal scene!

///And a blue plane behind it
var blueMaterial = new THREE.MeshBasicMaterial({ color: 0x7074ff });
var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
var planeObject = new THREE.Mesh(plane, blueMaterial);
planeObject.position.z = -15;
bufferScene.add(planeObject); //We add it to the bufferScene instead of the normal scene!

////////////////////////////Now we use our bufferTexture as a material to render it onto our main scene
var boxMaterial = new THREE.MeshBasicMaterial({ map: bufferTexture.texture });
//var boxMaterial = new THREE.MeshBasicMaterial({});
var boxGeometry2 = new THREE.BoxGeometry(5, 5, 5);
var mainBoxObject = new THREE.Mesh(boxGeometry2, boxMaterial);
mainBoxObject.position.z = -10;
scene.add(mainBoxObject);

console.log(bufferTexture);

//Render everything!
function render() {
  requestAnimationFrame(render);

  //Make the box rotate on box axises
  boxObject.rotation.y += 0.01;
  boxObject.rotation.x += 0.01;
  //Rotate the main box too
  mainBoxObject.rotation.y += 0.01;
  mainBoxObject.rotation.x += 0.01;

  //Render onto our off screen texture
  renderer.setRenderTarget(bufferTexture);
  renderer.render(bufferScene, camera);

  //Finally, draw to the screen
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}
render();
