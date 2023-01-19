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

const XOR = (a, b) => {
  return (a || b) && !(a && b);
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const gol = {
  cellCount: undefined,
  current: undefined,
  next: undefined,

  init: function (count) {
    this.cellCount = count;
    this.current = new Array(this.cellCount);

    for (let i = 0; i < this.cellCount; i++) {
      this.current[i] = Math.floor(getRandomInt(2)); // initialize cells with random on/off value
    }

    //console.log(this.current); // initial grid
    return this.current; // initial grid
  },

  iterate: function () {
    this.next = new Array(this.cellCount);

    // Compute next based on this.current
    for (let i = 0; i < this.cellCount; i++) {
      let left = circularArrayAccess(i, this.current, "left");
      let self = this.current[i];
      let right = circularArrayAccess(i, this.current, "right");

      // Rule 30 - https://en.wikipedia.org/wiki/Rule_30
      // left_cell XOR (central_cell OR right_cell)
      this.next[i] = XOR(left === 1, self === 1 || right === 1) ? 1 : 0;

      // Rule 90 - https://en.wikipedia.org/wiki/Rule_90
      // left_cell XOR right_cell
      //this.next[i] = XOR(left === 1, right === 1) ? 1 : 0;

      // Rule 110

      // // Rule 184
      // if (self === 1 && right === 0) {
      //   this.next[i] = 0;
      // } else if (self === 1 && right === 1) {
      //   this.next[i] = 1;
      // } else if (self === 0 && left === 0) {
      //   this.next[i] = 0;
      // } else if (self === 0 && left === 1) {
      //   this.next[i] = 1;
      // } else {
      //   console.log("other case");
      // }
    }

    //console.log(this.next);

    this.current = this.next;

    return this.next;
  },
};

export { gol };
