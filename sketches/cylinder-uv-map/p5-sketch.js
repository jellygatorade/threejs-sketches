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
  let resolution = 10;

  const canvasParent = document.getElementById("p5-canvas-parent");

  p.setup = function () {
    canvas = p.createCanvas(400, 400);
    //canvas = p.createCanvas(800, 10);

    canvas.parent(canvasParent);

    p.noStroke();

    p.pixelDensity(1);

    p.frameRate(5);

    cols = 64; // must result in integer

    grid = new Array(cols);
    for (let i = 0; i < cols; i++) {
      grid[i] = p.floor(p.random(2)); // initialize cells with random on/off value
    }

    console.log(grid);

    threeJSscene(canvas.canvas);
  };

  p.draw = function () {
    //p.background(0); // black background

    row += 10;
    if (row >= p.height) {
      row = 0;
      p.clear();
    }

    for (let i = 0; i < cols; i++) {
      let x = i * resolution;
      if (grid[i] == 1) {
        p.fill(255);
        p.stroke(0);
        p.rect(x, row, resolution - 1, resolution - 1);
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
    p.resizeCanvas(canvasParent.clientWidth, canvasParent.clientHeight);
  };
};

let p5inst0 = new p5(instantiate0);

export { canvas };
