import { threeJSscene } from "./threejs-sketch.js";

let canvas;

let bufferedFrame;
let bufferedFrames = [];

let canvasCtxArray = [];

const config = {
  width: 3000,
  height: 20,
  keepFrames: 36,
};

const dataForThree = {
  original: undefined,
  canvases: [],
};

// Adds new canvas to dom and returns the 2d canvas context
function createNewCanvas() {
  const HTMLcanvas = document.createElement("canvas");
  HTMLcanvas.width = config.width;
  HTMLcanvas.height = config.height;
  document.getElementById("p5-buffer-canvases-parent").appendChild(HTMLcanvas);

  const HTMLcontext = HTMLcanvas.getContext("2d");
  dataForThree.canvases.push(HTMLcontext);
  return HTMLcontext;
}

// https://dev.to/turneremma21/circular-access-of-array-in-javascript-j52
const circularArrayAccess = (currentIndex, arr, direction) => {
  let i;
  if (direction === "left") {
    i = currentIndex - 1;
  } else if (direction === "right") {
    i = currentIndex + 1;
  }
  const n = arr.length;
  return arr[((i % n) + n) % n];
};

function XOR(a, b) {
  return (a || b) && !(a && b);
}

const instantiate0 = (p) => {
  let grid;
  let cols;
  let row = 0;
  let resolution = 20;

  const canvasParent = document.getElementById("p5-original-canvas-parent");

  p.setup = function () {
    canvas = p.createCanvas(config.width, config.height);

    canvas.parent(canvasParent);

    p.noStroke();
    p.noSmooth();

    p.pixelDensity(1);

    p.frameRate(60);

    cols = 150; // must result in integer

    // currently using a proportion system of
    // circle of radius 15 has circumference of ~94.25 - so I am short .25 units around the edge (also I think there are not enough units to make the pattern visible)
    // it would be best to find a radius that gives a whole number circumference
    // then the #of game of life columns (cells) can be that whole number
    // and the p5 measures can be gotten proportions from there
    // // right now I am using 20px cell size, white square positioned with 1px border (see p.rect below)

    // radius = 15.5972 gives circumference ~98.0001
    // radius = 23.87324 gives circumference ~149.99999
    // p5 sketch size needs to be 20 height * total columns, if we do one column per circumference unit, that is 20*150 = 3000

    grid = new Array(cols);
    for (let i = 0; i < cols; i++) {
      grid[i] = p.floor(p.random(2)); // initialize cells with random on/off value
    }

    console.log(grid); // initial grid

    for (let i = 0; i < config.keepFrames; i++) {
      canvasCtxArray.push(createNewCanvas());
    }

    dataForThree.original = canvas;

    //threeJSscene(canvas.canvas);
    threeJSscene(dataForThree);
  };

  p.draw = function () {
    /******************************************************
     * After you complete whatever normal p5 sketching
     * Grab the current frame (the one before the one currently being drawn)
     * and write to the new canvas contexts
     ******************************************************/

    // Store the last frame
    bufferedFrame = canvas.get();

    // get the HTML canvas ImageData object from the Canvas API
    let imageData = bufferedFrame.canvas
      .getContext("2d")
      .getImageData(0, 0, config.width, config.height);

    // Keep an array of the last config.keepFrames amount of ImageData
    bufferedFrames.unshift(imageData);
    if (bufferedFrames.length > config.keepFrames) {
      bufferedFrames.pop();
    }

    // Write each ImageData in bufferedFrames to DOM
    for (let i = 0; i < bufferedFrames.length; i++) {
      canvasCtxArray[i].putImageData(bufferedFrames[i], 0, 0);
    }

    ////////////////////////////////////
    // Draw the next frame

    row += 20;
    if (row >= p.height) {
      row = 0;
      p.clear();
    }

    for (let i = 0; i < cols; i++) {
      let x = i * resolution;
      if (grid[i] == 1) {
        p.fill(255);
        //p.stroke(0);
        //p.rect(x + 1, row + 1, resolution - 2, resolution - 2); // locationx, locationy, width, height
        p.rect(x + 1, row + 1, resolution - 2, resolution - 2); // locationx, locationy, width, height
      }
    }

    let next = new Array(cols);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
      let left = circularArrayAccess(i, grid, "left");
      let self = grid[i];
      let right = circularArrayAccess(i, grid, "right");

      // Rule 30 - https://en.wikipedia.org/wiki/Rule_30
      // left_cell XOR (central_cell OR right_cell)
      next[i] = XOR(left === 1, self === 1 || right === 1) ? 1 : 0;

      // Rule 90 - https://en.wikipedia.org/wiki/Rule_90
      // left_cell XOR right_cell
      //next[i] = XOR(left === 1, right === 1) ? 1 : 0;

      // Rule 110

      // // Rule 184
      // if (self === 1 && right === 0) {
      //   next[i] = 0;
      // } else if (self === 1 && right === 1) {
      //   next[i] = 1;
      // } else if (self === 0 && left === 0) {
      //   next[i] = 0;
      // } else if (self === 0 && left === 1) {
      //   next[i] = 1;
      // } else {
      //   console.log("other case");
      // }
    }

    grid = next;
  };
};

let p5inst0 = new p5(instantiate0);
