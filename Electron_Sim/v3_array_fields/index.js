const ctx = document.getElementById("canvas").getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const field = [];
const electron = [];
const range = 1;
// const imageData = ctx.createImageData(width, height);

let clock = 1;
let simSpeed = 1;
let dampening = 0.99;
let smoothImage = false;
let mouseX = width / 2;
let mouseY = height / 2;
let fullScreen = false;
let mouseMoved = -1;
let cursorBrightness = 0;

/*
Okay, what's the equation to the distance between two points?
- Math.sqrt(Math.abs(x0-x1)**2 + Math.abs(y0-y1)**2)

What if one of the points is moving? Can we represent that as a line?

Like let's say a stationary electron feels the force of a moving electron.

|
|
|
|      o        o
|      ↓
|      
|
---------------------------

Distance would start at a minimum, then hyperbola outward.
Maybe  don't even turn it into an equation since this will get complicated.
Store this data in an array contained by the electron.
Then for every electron, see how far away they were when they released the wave that is now hitting you.
That tells you the intensity because it's a uniform wave.
You can also store the last lookup so you don't have to search through the whole array again.
And since they will always be moving slower than the wave, you only have to look in one direction in the array. No overlapping. Just progressing faster or slower depending on relative speeds.


*/

for (let i = 0; i < width; i++) {
  field[i] = [];
  for (let j = 0; j < height; j++) {
    field[i][j] = {
      x: i,
      y: j,
      pos: 0,
      vel: 0,
      acc: 0,
      nextAcc: 0,
    };
  }
}

for (let i = 0; i < 2; i++) {
  electron[i] = {
    index: i,
    x: new Array(0, 0, 0),
    y: new Array(0, 0, 0),
    dToE: new Array(0, 0, 0),
    velX: 0,
    velY: 0,
    charge: -1,
  };
}

electron[0].x[0] = 100;
electron[0].y[0] = 100;
electron[0].velX = -1;
electron[0].velY = 0;

electron[1].x[0] = 50;
electron[1].y[0] = 50;
electron[1].velX = 0;
electron[1].velY = 0;

const clamp = (min, max) => (value) => Math.min(max, Math.max(min, value));
const clamp8Bit = clamp(0, 255);

const updateElectrons = () => {
  for (let i = 0; i < electron.length; i++) {
    updateElectron(electron[i]);
    // for (let j = i + 1; j < electron.length; j++) {
    //   updateElectron(electron[i], electron[j]);
    // }
  }
};

const updateElectron = (electronAt, electronFrom) => {
  // Calculate the length and direction to each other electron.
  //    But it's more complicated than that.. Let's make a function:
  // let d = calculateDistances(electronAt, electronFrom);
  // let distances = calculateDistances(electronAt, electronFrom, 0);

  // let force = 1 / distances.d ** 2;
  // let forceX = force * (distances.dx / distances.d);
  // let forceY = force * (distances.dy / distances.d);
  // // console.log(electronAt);

  // electronAt.velX += forceX;
  // electronFrom.velX += forceX;
  // electronAt.velY += forceY;
  // electronFrom.velY += forceY;

  electronAt.x[clock] = electronAt.x[clock - 1] + electronAt.velX;
  electronAt.y[clock] = electronAt.y[clock - 1] + electronAt.velY;
};

const calculateDistances = (electronAt, electronFrom, lastDistance) => {
  let dx = electronAt.x[clock] - electronFrom.x[lastDistance];
  let dy = electronAt.y[clock] - electronFrom.y[lastDistance];
  let d = (dx ** 2 + dy ** 2) ** 0.5;
  let lastDist = lastDistance;
  // console.log(electronFrom.x[clock - 1]);

  let found = "looking";
  while (found == "looking") {
    if (d < 10) {
      found = "impact";
    }
    if (clock - lastDist > 1000) {
      found = "gone";
    }
    if (lastDist >= electronAt.x.length) {
      found = "notYet";
    }
    lastDist++;
    {
      dx = electronAt.x[clock] - electronFrom.x[lastDist];
      dy = electronAt.y[clock] - electronFrom.y[lastDist];
      d = (dx ** 2 + dy ** 2) ** 0.5;
      // dx *= d / (d - clock);
      // dy *= d / (d - clock);
      // d -= clock;
      lastDist++;
    }
  }
  // console.log(found);
  let distances = {
    dx: dx,
    dy: dy,
    d: d,
  };
  return distances;

  // console.log(`clk:${clock} lastDist:${lastDist} lx:${electronAt.x.length}`);
};

const updateScreen = () => {
  ctx.clearRect(0, 0, 500, 500);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 500, 500);

  for (let i = 0; i < electron.length - 1; i++) {
    let numRings = 30;
    let pxPerRing = 5;
    let rTotal = numRings * pxPerRing;
    for (let t = clock - 1; t > Math.max(0, clock - numRings - 1); t--) {
      let xPos1 = electron[i].x[t];
      let yPos1 = electron[i].y[t];
      let xPos2 = electron[i].x[t + 1];
      let yPos2 = electron[i].y[t + 1];

      let percThru = (clock - t) / numRings;
      let rInner = percThru * pxPerRing * numRings;
      let rOuter = rInner + pxPerRing;
      let gradient = ctx.createRadialGradient(
        xPos1,
        yPos1,
        rInner,
        xPos2,
        yPos2,
        rOuter
      );
      // gradient.addColorStop(0, `rgba(255,255,0,0)`);
      let colorCenter = 1;
      if (percThru > 0.0) {
        colorCenter = 0.01;
      }
      gradient.addColorStop(0, `rgba(255,255,0,${colorCenter})`);
      gradient.addColorStop(1, `rgba(255,255,0,0)`);
      ctx.beginPath();
      ctx.arc(xPos2, yPos2, rOuter, 0, 2 * Math.PI, false);
      ctx.fillStyle = gradient;
      ctx.fill();

      //   let percThru = (clock - t) / resolution;
      //   let rInner = percThru * 100;
      //   let rOuter = rInner + 13;
      //   // console.log(percThru);
      //   let gradient = ctx.createRadialGradient(
      //     electron[i].x[t],
      //     electron[i].y[t],
      //     rInner,
      //     electron[i].x[t + 1],
      //     electron[i].y[t + 1],
      //     rOuter
      //   );
      //   gradient.addColorStop(0, `rgba(255,255,0,${0})`);
      //   gradient.addColorStop(0.8, `rgba(255,255,0,${0})`);
      //   gradient.addColorStop(0.81, `rgba(255,255,0,${1 - percThru})`);
      //   gradient.addColorStop(1, `rgba(255,255,0,${1 - percThru})`);
      //   ctx.beginPath();
      //   ctx.arc(
      //     electron[i].x[t],
      //     electron[i].y[t],
      //     rOuter,
      //     0,
      //     2 * Math.PI,
      //     false
      //   );
      //   ctx.fillStyle = gradient;
      //   ctx.fill();
    }
  }

  let gradient = ctx.createRadialGradient(
    electron[0].x[clock],
    electron[0].y[clock],
    0,
    electron[0].x[clock],
    electron[0].y[clock],
    1
  );
  // gradient.addColorStop(0, `rgba(255,255,0,0)`);
  gradient.addColorStop(0, `rgba(255,255,0,1)`);
  gradient.addColorStop(1, `rgba(255,255,0,1)`);
  ctx.beginPath();
  ctx.arc(electron[0].x[clock], electron[0].y[clock], 1, 0, 2 * Math.PI, false);
  ctx.fillStyle = gradient;
  ctx.fill();

  // for (let i = 0; i < electron.length; i++) {
  //   for (let t = clock - 1; t > Math.max(0, clock - 100); t--) {
  //     let ex = electron[i].x[t];
  //     let ey = electron[i].y[t];
  //     const gradient = ctx.createRadialGradient(
  //       ex,
  //       ey,
  //       clock - t,
  //       ex,
  //       ey,
  //       clock - t + 1
  //     );
  //     gradient.addColorStop(0, `rgba(255,255,0,${1 - (clock - t) / 100})`);
  //     gradient.addColorStop(1, `rgba(255,255,0,${1 - (clock - t + 1) / 100})`);
  //     ctx.beginPath();
  //     ctx.arc(ex, ey, clock - t + 1, 0, 2 * Math.PI, false);
  //     ctx.fillStyle = gradient;
  //     ctx.fill();
  //   }
  // }
  // console.log(clock);
  // }
};

const nextTick = () => {
  updateElectrons();
  // electron[0].velX = 5 * Math.cos(clock / 20);
  electron[0].x[clock] = mouseX;
  electron[0].y[clock] = mouseY;
  updateScreen();
  clock++;
  if (clock < 2000) {
    requestAnimationFrame(nextTick);
  }
};
nextTick();

const handleMouse = () => {
  if (mouseMoved > 0) {
    // document.getElementById("canvas_div_no_cursor").style.cursor = "none";
    mouseMoved -= 1;
    if (mouseMoved > 80) {
      cursorBrightness += 0.2;
      cursorBrightness = Math.min(1, cursorBrightness);
    } else {
      cursorBrightness = mouseMoved / 80;
    }
    const gradient = ctx.createRadialGradient(
      mouseX + 399,
      mouseY,
      1,
      mouseX + 399,
      mouseY,
      20
    );
    gradient.addColorStop(0, `rgba(255,255,250,${0.2 * cursorBrightness})`);
    gradient.addColorStop(0.3, `rgba(255,255,250,0)`);
    gradient.addColorStop(0.5, `rgba(0,0,0,${0.2 * cursorBrightness})`);
    gradient.addColorStop(1, `rgba(0,0,0,0)`);
    // for (let i = 0; i < resolution; i++) {
    //   gradient.addColorStop(
    //     i / resolution / 2,
    //     `rgba(255,255,100,${(resolution - i) / resolution ** 1.5})`
    //   );
    // }
    ctx.beginPath();
    ctx.arc(mouseX + 399, mouseY, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
};

document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX;
  mouseY = event.pageY;
  mouseMoved = 100;
});

// function fullscreen() {
//   var el = document.getElementById("canvas");
//   fullScreen = !fullScreen;
//   if (fullScreen) {
//     if (el.webkitRequestFullScreen) {
//       el.webkitRequestFullScreen();
//     } else {
//       el.mozRequestFullScreen();
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     // width = canvas.width;
//     // height = canvas.height;
//   } else {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     } else if (document.webkitExitFullscreen) {
//       /* Safari */
//       document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) {
//       /* IE11 */
//       document.msExitFullscreen();
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     width = canvas.width;
//     height = canvas.height;
//   }
// }

// canvas.addEventListener("click", fullscreen);

// const updateFieldForces = (field) => {
//   for (let i = 1; i < width - 1; i++) {
//     for (let j = 1; j < height - 1; j++) {
//       updateField(field[i][j], field);
//     }
//   }
// };

// const updateVelandPos = (field) => {
//   for (let i = 1; i < width - 1; i++) {
//     for (let j = 1; j < height - 1; j++) {
//       field[i][j].acc = field[i][j].nextAcc;
//       field[i][j].nextAcc = 0;
//       field[i][j].vel += field[i][j].acc;
//       field[i][j].pos += field[i][j].vel;
//     }
//   }
// };

// const updatePixels = (field) => {
//   for (let i = 1; i < width - 1; i++) {
//     for (let j = 1; j < height - 1; j++) {
//       const pixelStartIndex = (j * width + i) * 4;
//       imageData.data[pixelStartIndex] = clamp8Bit(-field[i][j].pos); // red value
//       imageData.data[pixelStartIndex + 1] = clamp8Bit(field[i][j].pos); // green value
//       imageData.data[pixelStartIndex + 2] = clamp8Bit(-10 * field[i][j].vel); // blue value
//       imageData.data[pixelStartIndex + 3] = 255; // alpha value
//     }
//   }

// const addPreset = (preset) => {
//   if (preset > -1) {
//     let srcX1 = 0;
//     let srcX2 = 0;
//     let srcY1 = 0;
//     let srcY2 = 0;
//     let newVal = 0;
//     if (preset == 0) {
//       srcX1 = Math.round(width / 2);
//       srcY1 = Math.round(height / 2);
//       if (clock < 100) {
//         field[srcX1][srcY1].pos = 255;
//       }
//       field[srcX1][srcY1].vel = 0;
//       field[srcX1][srcY1].acc = 0;
//     }
//     if (preset == 1) {
//       newVal = 255;
//       srcX1 = Math.round(width / 2 - 3);
//       srcY1 = Math.round(height / 2 - 3);
//       srcX2 = Math.round(width / 2 + 3);
//       srcY2 = Math.round(height / 2 + 3);
//       field[srcX1][srcY1].pos = newVal;
//       field[srcX1][srcY1].vel = 0;
//       field[srcX1][srcY1].acc = 0;
//       field[srcX2][srcY2].pos = -newVal;
//       field[srcX2][srcY2].vel = 0;
//       field[srcX2][srcY2].acc = 0;
//     } else if (preset == 2) {
//       newVal = 255 * Math.sin(clock / 10);
//       srcX1 = Math.round(width / 2 - 3);
//       srcY1 = Math.round(height / 2 - 3);
//       srcX2 = Math.round(width / 2 + 3);
//       srcY2 = Math.round(height / 2 + 3);
//       field[srcX1][srcY1].pos = newVal;
//       field[srcX1][srcY1].vel = 0;
//       field[srcX1][srcY1].acc = 0;
//       field[srcX2][srcY2].pos = -newVal;
//       field[srcX2][srcY2].vel = 0;
//       field[srcX2][srcY2].acc = 0;
//     } else if (preset == 3) {
//       newVal = Math.min(255, clock * 10);
//       srcX1 = Math.round(width / 2 - 10 * Math.sin(clock / 50));
//       srcY1 = Math.round(height / 2 - 10 * Math.cos(clock / 50));
//       srcX2 = Math.round(width / 2 + 10 * Math.sin(clock / 50));
//       srcY2 = Math.round(height / 2 + 10 * Math.cos(clock / 50));
//       field[srcX1][srcY1].pos = newVal;
//       field[srcX1][srcY1].vel = 0;
//       field[srcX1][srcY1].acc = 0;
//       field[srcX2][srcY2].pos = -newVal;
//       field[srcX2][srcY2].vel = 0;
//       field[srcX2][srcY2].acc = 0;
//     } else if (preset == 4) {
//       newVal = 255 * Math.sin(clock / 50);
//       srcX1 = width / 2;
//       srcY1 = height / 2;
//       field[srcX1][srcY1].pos = newVal;
//       field[srcX1][srcY1].vel = 0;
//       field[srcX1][srcY1].acc = 0;
//     }
//   }
// };

// const putImage = () => {
//   ctx.imageSmoothingEnabled = smoothImage;
//   ctx.putImageData(imageData, 0, 0);
// };

// const handleMouse = () => {
//   if (mouseMoved > 0) {
//     // document.getElementById("canvas_div_no_cursor").style.cursor = "none";
//     mouseMoved -= 1;
//     if (mouseMoved > 80) {
//       cursorBrightness += 0.2;
//       cursorBrightness = Math.min(1, cursorBrightness);
//     } else {
//       cursorBrightness = mouseMoved / 80;
//     }
//     const gradient = ctx.createRadialGradient(
//       mouseX + 399,
//       mouseY,
//       1,
//       mouseX + 399,
//       mouseY,
//       20
//     );
//     gradient.addColorStop(0, `rgba(255,255,250,${0.2 * cursorBrightness})`);
//     gradient.addColorStop(0.3, `rgba(255,255,250,0)`);
//     gradient.addColorStop(0.5, `rgba(0,0,0,${0.2 * cursorBrightness})`);
//     gradient.addColorStop(1, `rgba(0,0,0,0)`);
//     // for (let i = 0; i < resolution; i++) {
//     //   gradient.addColorStop(
//     //     i / resolution / 2,
//     //     `rgba(255,255,100,${(resolution - i) / resolution ** 1.5})`
//     //   );
//     // }
//     ctx.beginPath();
//     ctx.arc(mouseX + 399, mouseY, 10, 0, 2 * Math.PI, false);
//     ctx.fillStyle = gradient;
//     ctx.fill();
//   }
// };

// const updateField = (fieldAt, field) => {
//   let adjField = [
//     field[fieldAt.x - 1][fieldAt.y],
//     field[fieldAt.x + 1][fieldAt.y],
//     field[fieldAt.x][fieldAt.y + 1],
//     field[fieldAt.x][fieldAt.y - 1],
//   ];
//   for (let i = 0; i < 4; i++) {
//     let force = adjField[i].pos - fieldAt.pos;
//     force /= 50;
//     fieldAt.nextAcc += force;
//     adjField[i].nextAcc -= force;
//   }
//   fieldAt.pos *= dampening;
// };
