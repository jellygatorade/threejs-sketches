import { threeJSscene } from "./threejs-sketch.js";

let canvas;

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

  const canvasParent = document.getElementById("p5-canvas-parent");

  p.setup = function () {
    //canvas = p.createCanvas(400, 400);
    //canvas = p.createCanvas(800, 10);
    canvas = p.createCanvas(3000, 20);

    canvas.parent(canvasParent);

    p.noStroke();
    p.noSmooth();

    p.pixelDensity(1);

    p.frameRate(15);

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

    threeJSscene(canvas.canvas);
  };

  p.draw = function () {
    //p.background(0); // black background

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
    }

    grid = next;
  };

  p.windowResized = function () {
    //p.resizeCanvas(canvasParent.clientWidth, canvasParent.clientHeight);
  };
};

let p5inst0 = new p5(instantiate0);

export { canvas };
