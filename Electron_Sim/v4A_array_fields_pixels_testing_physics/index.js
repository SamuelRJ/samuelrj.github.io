const ctx = document.getElementById("canvas").getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const pixelData = [];
const electron = [];
const imageData = ctx.createImageData(width, height);

let clock = 1;
let mouseX = width / 2;
let mouseY = height / 2;
let speedOfLight = 1;

for (let i = 0; i < width; i++) {
  pixelData[i] = [];
  for (let j = 0; j < height; j++) {
    pixelData[i][j] = {
      val: 0.5,
      lastDistToE: {},
    };
  }
}

const getLastDistToE = (fromX, fromY, electron) => {
  return pixelData[fromX][fromY].lastDistToE[electron.id] || 0;
};

for (let i = 0; i < 2; i++) {
  electron[i] = {
    id: String(Date.now() + i),
    index: i,
    x: new Array(0, 0, 0),
    y: new Array(0, 0, 0),
    dToE: new Array(0, 0, 0),
    velX: 0,
    velY: 0,
    charge: -1,
  };
  // console.log(electron[i].id);
}
//redo electron datatype. Get rid of velocity. Let electron.x[clock] the sum of the forces. Then turn it into a position by adding it to the current position.
let offset = 30;
electron[0].x[0] = 100;
electron[0].y[0] = 50;
electron[0].velX = -0.3;
electron[0].velY = -0.08;
electron[1].x[0] = 1;
electron[1].y[0] = 10;
electron[1].velX = 0.3;

const placeElectron = (x, y, velX, velY) => {
  let newE = {
    id: String(Date.now()),
    index: electron.length,
    x: new Array(0, 0, 0),
    y: new Array(0, 0, 0),
    dToE: new Array(0, 0, 0),
    velX: velX,
    velY: velY,
    charge: -1,
  };
  electron.push(newE);
};

// placeElectron(10, 10, 0, 1);

const clamp = (min, max) => (value) => Math.min(max, Math.max(min, value));
const clamp8Bit = clamp(0, 255);
const simpleDistance = (x1, y1, x2, y2) => {
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
};

const updateElectrons = () => {
  for (let i = 0; i < electron.length; i++) {
    for (let j = 0; j < i; j++) {
      let e2eData = calculateDistances(
        electron[i].x[clock - 1],
        electron[i].y[clock - 1],
        electron[j],
        clock
      );
      // console.log(e2eData);
      if (e2eData.d != -1) {
        let force = 1 / e2eData.d;
        let xPerc = e2eData.dx ** 2 / e2eData.d ** 2;
        let xDir = 1;
        if (e2eData.dx < 0) {
          xDir = -1;
        }
        let yPerc = e2eData.dy ** 2 / e2eData.d ** 2;
        let yDir = 1;
        if (e2eData.dy < 0) {
          yDir = -1;
        }
        if (j != 0) {
          electron[i].velX += (force * xPerc * xDir) / 10;
          electron[i].velY += (force * yPerc * yDir) / 10;
        }
        electron[j].velX -= (force * xPerc * xDir) / 10;
        electron[j].velY -= (force * yPerc * yDir) / 10;
      }
      electron[i].x[clock] = electron[i].x[clock - 1] + electron[i].velX;
      electron[i].y[clock] = electron[i].y[clock - 1] + electron[i].velY;
    }
  }
  // mouseControlElectron();

  electron[0].x[clock] = electron[0].x[clock - 1] + electron[0].velX;
  electron[0].y[clock] = electron[0].y[clock - 1] + electron[0].velY;
};

const mouseControlElectron = () => {
  let vxTarget = Math.round(mouseX - electron[0].x[clock - 1]) / 30;
  let vyTarget = Math.round(mouseY - electron[0].y[clock - 1]) / 30;
  let vTarget = (vxTarget ** 2 + vyTarget ** 2) ** 0.5;
  if (vTarget > speedOfLight * 0.9) {
    let vTargetScale = vTarget / (speedOfLight * 0.9);
    vxTarget /= vTargetScale;
    vyTarget /= vTargetScale;
  }
  electron[0].velX -= Math.round(100 * (electron[0].velX - vxTarget)) / 500;
  electron[0].velY -= Math.round(100 * (electron[0].velY - vyTarget)) / 500;
};

const updateScreen = () => {
  for (let i = 0; i < width - 1; i++) {
    for (let j = 0; j < height - 1; j++) {
      updatePixelValue(i, j);
    }
  }
  updatePixels(pixelData);
};

const updatePixelValue = (x, y) => {
  pixelData[x][y].val = 0;
  for (let i = 0; i < electron.length; i++) {
    let d2eX = x - electron[i].x[clock];
    let d2eY = y - electron[i].y[clock];
    let d2e = (d2eX ** 2 + d2eY ** 2) ** 0.5;
    if (d2e < clock * speedOfLight) {
      let nextFrame = getLastDistToE(x, y, electron[i]);
      // let lastDistance = nextFrame;
      // let lastDistFramesAway = clock - lastDistance;

      let data = calculateDistances(x, y, electron[i], nextFrame);
      let force = data.f;

      if (force >= 0) {
        d2e = 1 / force;
      }
      // console.log(d2e);
      // console.log("");
    }
    let force = 1 / (d2e + 1);
    // let distances = calculateDistances(x, y, electron[i], 0);
    pixelData[x][y].val += force;
  }
};

// const findDistanceInNumFrames = (x1, y1, electron) => {
//   let lastDist = pixelData[x][y].lastDistToE;
//   let lastVel = 1;
//   let framesBack = 0;

//   return framesBack;
// };

const calculateDistances = (fromX, fromY, toElectron, lastDist) => {
  let currentFrame = lastDist;
  while (currentFrame < clock) {
    let distBtwn = simpleDistance(
      fromX,
      fromY,
      toElectron.x[currentFrame],
      toElectron.y[currentFrame]
    );
    let distInFrames = distBtwn / speedOfLight;
    if (distInFrames > clock - currentFrame) {
    }
    currentFrame++;
  }

  let distAt = 0;
  let distPrev = distAt;

  // let frameCounter = clock - lastDist;
  while (currentFrame < clock) {
    if (clock - frameCounter < 0) {
      let data = {
        f: -1,
        d: -1,
        dx: -1,
        dy: -1,
      };
      return data;
    }
    distAt = simpleDistance(
      fromX,
      fromY,
      toElectron.x[clock - frameCounter],
      toElectron.y[clock - frameCounter]
    );
    if (distAt - frameCounter * speedOfLight < 0) {
      let timeAtFrame = frameCounter * speedOfLight;
      let distX = fromX - toElectron.x[clock - frameCounter];
      let distY = fromY - toElectron.y[clock - frameCounter];
      let calcdDistance =
        distPrev -
        0.3 *
          (distPrev - distAt) *
          ((timeAtFrame - distPrev) / (distAt - distPrev));
      let velocity = (distPrev - distAt) / speedOfLight; //measured in % of speedOfLight
      let velocityMult = (1 - velocity) / (1 + velocity);
      let force = velocityMult / calcdDistance;
      let framesBack = Math.ceil(calcdDistance / speedOfLight + 1);
      if (Math.random() < 0.01) {
        console.log(framesBack);
      }
      pixelData[fromX][fromY].lastDistToE[toElectron.id] = clock - framesBack;

      if (fromX == 100 && fromY == 80) {
        // console.log(pixelData[fromX][fromY]);
      }
      let data = {
        f: force,
        d: calcdDistance,
        dx: distX,
        dy: distY,
      };

      return data;
    }
    distPrev = distAt;
    currentFrame++;
  }
};

const updatePixels = (pixelData) => {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      pixelData[i][j].val = Math.max(0, Math.min(1, pixelData[i][j].val));
      const pixelStartIndex = (j * width + i) * 4;
      imageData.data[pixelStartIndex] = 255 * pixelData[i][j].val; // red value
      imageData.data[pixelStartIndex + 1] = 255 * pixelData[i][j].val; // green value
      imageData.data[pixelStartIndex + 2] = 0; // blue value
      imageData.data[pixelStartIndex + 3] = 255; // alpha value
    }
  }
};

const putImage = () => {
  // ctx.imageSmoothingEnabled = smoothImage;
  ctx.putImageData(imageData, 0, 0);
};

const nextTick = () => {
  if (clock < 1000) {
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
});

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
