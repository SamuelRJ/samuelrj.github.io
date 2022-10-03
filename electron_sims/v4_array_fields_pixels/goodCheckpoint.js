const ctx = document.getElementById("canvas").getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const field = [];
const pixelData = [];
const electron = [];
const range = 1;
const imageData = ctx.createImageData(width, height);

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
  pixelData[i] = [];
  for (let j = 0; j < height; j++) {
    pixelData[i][j] = 0.5;
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
//redo electron datatype. Get rid of velocity. Let electron.x[clock] the sum of the forces. Then turn it into a position by adding it to the current position.

electron[0].x[0] = 100;
electron[0].y[0] = 100;
electron[0].velX = 10;
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

const updateScreen = () => {
  ctx.clearRect(0, 0, 500, 500);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 500, 500);

  for (let i = 0; i < width - 1; i++) {
    for (let j = 0; j < height - 1; j++) {
      updatePixelValue(i, j);
    }
  }
  updatePixels(pixelData);
};

const updatePixelValue = (x, y) => {
  pixelData[x][y] = 0;
  for (let i = 1; i < electron.length; i++) {
    let d2eX = x - electron[i].x[clock];
    let d2eY = y - electron[i].y[clock];
    let d2e = (d2eX ** 2 + d2eY ** 2) ** 0.5;
    if (d2e < 100) {
      // console.log(d2e);
      let force = calculateDistances(x, y, electron[i], clock);
      if (x == 119 && y == 49) {
        console.log(`d2e:${d2e} force:${force}`);
      }
      if (force > 0) {
        if (x == 119 && y == 49) {
          console.log(`d2e:${d2e} force:${force}`);
        }

        d2e = force;
      }
      // console.log(d2e);
      // console.log("");
    }
    let force = 2 / (d2e + 1);
    // let distances = calculateDistances(x, y, electron[i], 0);
    pixelData[x][y] += force;
  }
};

const simpleDistance = (x1, y1, x2, y2) => {
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
};

const calculateDistances = (fromX, fromY, toElectron, lastDist) => {
  let speedOfLight = 2;

  let distAt = 0;
  let distPrev = distAt;

  let secCounter = 0;
  for (secCounter = 1; secCounter < 1000; secCounter++) {
    distAt = simpleDistance(
      fromX,
      fromY,
      toElectron.x[Math.max(0, clock - secCounter)],
      toElectron.y[Math.max(0, clock - secCounter)]
    );
    if (distAt - secCounter * speedOfLight < 0) {
      let calcdDistance = distPrev - distPrev / (distPrev - distAt);
      let velocity = 1 / (distPrev - distAt);
      let force = velocity / (1 + calcdDistance);
      return force;
    }
    distPrev = distAt;
  }

  /*




*/

  // lightDist = (clock - lastDist) * speedOfLight;

  // if (dist > lightDist) {
  //   distPrev = dist;
  // } else if (dist <= lightDist) {
  //   // return a force proportional to the distance between this point and the last one. That captures the relative motion

  //   let lightOvershoot = lightDist - dist;
  //   // let lightPrev = (clock - lastDist - 1) * speedOfLight;
  //   let lightOvershootPerc = lightOvershoot / speedOfLight;
  //   let distFinal = dist - (dist - distPrev) * lightOvershootPerc;
  //   // let percDiff = lightOvershoot / distDiff;
  //   // let distFinal = percDiff * distDiff + distPrev;
  //   return distFinal;
  //   // let linInterp = (dist - distPrev) / speedOfLight;
  //   // let linInterpDist = distPrev - (dist + distPrev) * linInterp;
  //   // if (fromX == 119 && fromY == 49) {
  //   //   console.log(
  //   //     `dist:${dist - lightDist} distPrev:${
  //   //       distPrev - lightDist
  //   //     } lIntp:${linInterp} lIntpD:${linInterpDist}`
  //   //   );
  //   // }
  //   // return distPrev + linInterpDist;
  // }

  // if (dist > distPrev) {
  //   let linInterp = -dist / (-dist - distPrev);
  //   let linInterpDist = distPrev - (dist + distPrev) * linInterp;
  //   if (fromX == 119 && fromY == 49) {
  //     console.log(
  //       `dist:${-dist} distPrev:${distPrev} lIntp:${linInterp} lIntpD:${linInterpDist}`
  //     );
  //   }

  //   found = "impact";
  //   return (clock - lastDist + linInterpDist) * speedOfLight;
  // } else if (clock - lastDist > 1000) {
  //   found = "gone";
  // }
  // distPrev = dist;
  // }
  // console.log(found);
  // let distanceFinal = (clock - lastDist - linInterpDist) / speedOfLight;
  // console.log(distanceFinal);
  // return distanceFinal;
};

const updatePixels = (pixelData) => {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      const pixelStartIndex = (j * width + i) * 4;
      imageData.data[pixelStartIndex] = 255 * pixelData[i][j]; // red value
      imageData.data[pixelStartIndex + 1] = 255 * pixelData[i][j]; // green value
      imageData.data[pixelStartIndex + 2] = 0; // blue value
      imageData.data[pixelStartIndex + 3] = 255; // alpha value
      // imageData.data[pixelStartIndex] = 255 * pixelData[i][j]; // red value
      // imageData.data[pixelStartIndex + 1] = 255 * pixelData[i][j]; // green value
      // imageData.data[pixelStartIndex + 2] = 0; // blue value
      // imageData.data[pixelStartIndex + 3] = 255 * pixelData[i][j]; // alpha value
    }
  }
};

// const updatePixel = (x, y) => {
//   //loop for all electrons. Let's do one for now.
//   //With infinite speed of light.
//   const pixelStartIndex = (x * width + y) * 4;
//   imageData.data[pixelStartIndex] = 255; // red value
//   imageData.data[pixelStartIndex + 1] = 255; // green value
//   imageData.data[pixelStartIndex + 2] = 0; // blue value
//   imageData.data[pixelStartIndex + 3] = pixelData[x][y].force; // alpha value
// };
const putImage = () => {
  // ctx.imageSmoothingEnabled = smoothImage;
  ctx.putImageData(imageData, 0, 0);
};

const nextTick = () => {
  if (clock < 200) {
    electron[0].x[clock] = 150;
    electron[0].y[clock] = 150;
    electron[1].velX = 3 * Math.sin(clock / 25);
    updateElectrons();
    updateScreen();
    putImage();
    clock++;
    requestAnimationFrame(nextTick);
  }
};
nextTick();
document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX;
  mouseY = event.pageY;
  mouseMoved = 100;
});
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
