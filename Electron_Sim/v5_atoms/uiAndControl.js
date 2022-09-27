// User interface and controls

import { clamp8Bit, get, calcDist } from "./miscFuncs.js";
import { createParticle, protonMass } from "./pFuncs.js";
import { getLvl } from "./index.js";

let scaleUp = get("scale"); //how many pixels per pixel

const particleContainerElem = document.getElementById("particleContainer");

const ctx = document.getElementById("canvas").getContext("2d");
const width = get("width");
const height = get("height");
const screenWidth = width * scaleUp;
const screenHeight = height * scaleUp;
const imageData = ctx.createImageData(screenWidth, screenHeight);
const imageDataLvl3 = [];
let pauseTimer = 0;
let autoPauseTimeout = 500;
let textFadeTimer = 0;
let sizePtoCreate = 1;

let clickCreates = "nothing"; //nothing, electron, proton, wire

export const isPaused = () => {
  pauseTimer++;
  if (pauseTimer < autoPauseTimeout) {
    return false;
  } else if (pauseTimer == autoPauseTimeout) {
    drawPause();
  }
  return true;
};

export const updateScreen = (field, p) => {
  let level = getLvl();
  if (level == 3) {
    // updateScreenLvl3(p);
  }
  if (level == 2) {
    updateScreenLvl2(field);
  }
};

const updateScreenLvl2 = (field) => {
  for (let i = 0; i < screenWidth - 1; i++) {
    for (let j = 0; j < screenHeight - 1; j++) {
      let pixelStartIndex = (j * screenWidth + i) * 4;
      let x = Math.floor(i / scaleUp);
      let y = Math.floor(j / scaleUp);

      const rVal = clamp8Bit(-field[x][y].val);
      const gVal = clamp8Bit(field[x][y].val);
      const bVal = clamp8Bit(50 * field[x][y].mass ** 0.2);

      imageData.data[pixelStartIndex] = rVal; // red value
      imageData.data[pixelStartIndex + 1] = gVal; // green value
      imageData.data[pixelStartIndex + 2] = bVal; // blue value
    }
  }
  ctx.putImageData(imageData, 0, 0);
  updateTextOnScreen();
};

let neverTyped = true;
const updateTextOnScreen = () => {
  if (textFadeTimer++ <= 500) {
    if (neverTyped) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(
        0,
        (500 - textFadeTimer) / 100
      )}`;
      ctx.font = "13px serif";
      ctx.fillText(
        "Press 'e' or 'p' to \"click-to-create\" electrons or protons",
        5,
        15
      );
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(
        0,
        (200 - textFadeTimer) / 100
      )}`;
      ctx.font = "10px serif";
      ctx.fillText(`Click creates: ${sizePtoCreate}x ${clickCreates}`, 5, 15);
    }
  }
};

const createScreen = () => {
  for (let i = 1; i < screenWidth - 1; i++) {
    for (let j = 1; j < screenHeight - 1; j++) {
      const pixelStartIndex = (j * screenWidth + i) * 4;
      imageData.data[pixelStartIndex] = 0; // red value
      imageData.data[pixelStartIndex + 1] = 0; // green value
      imageData.data[pixelStartIndex + 2] = 0; // blue value
      imageData.data[pixelStartIndex + 3] = 255; // alpha value
    }
  }
  ctx.putImageData(imageData, 0, 0);
};

const drawPause = () => {
  ctx.beginPath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(screenWidth / 2 - 15, screenHeight / 2 - 30, 10, 60);
  ctx.fillRect(screenWidth / 2 + 15, screenHeight / 2 - 30, 10, 60);
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.stroke();
};

const drawBlackBackground = () => {
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.stroke();
};

const unpause = () => {
  drawBlackBackground();
  pauseTimer = 0;
};

document.addEventListener("mousemove", (event) => {
  if (!isPaused()) {
    unpause();
  }
});

document.addEventListener("click", (event) => {
  unpause();
  if (clickCreates == "nothing") {
    return;
  }
  if (clickCreates == "wire") {
    return;
  }
  if (pauseTimer < autoPauseTimeout) {
    let mouseX = event.pageX / scaleUp;
    let mouseY = event.pageY / scaleUp;
    if (clickCreates == "electron") {
      for (let i = 0; i < sizePtoCreate; i++) {
        createParticle(
          mouseX + Math.random() * 10 - 5,
          mouseY + Math.random() * 10 - 5,
          0,
          0,
          -1,
          1
        );
      }
    } else if (clickCreates == "proton") {
      let charge = sizePtoCreate;
      let mass = protonMass() * sizePtoCreate;
      createParticle(
        mouseX + Math.random() * 10 - 5,
        mouseY + Math.random() * 10 - 5,
        0,
        0,
        charge,
        mass
      );
    }
  }
});

document.addEventListener("keydown", (event) => {
  neverTyped = false;
  textFadeTimer = 0;
  if (event.code == "Space") {
    if (pauseTimer >= autoPauseTimeout) {
      unpause();
    } else {
      drawPause();
      pauseTimer = autoPauseTimeout;
    }
  } else if (event.key == "e") {
    clickCreates = "electron";
  } else if (event.key == "p") {
    clickCreates = "proton";
  } else if (event.key == "w") {
    clickCreates = "wire";
  } else if (event.code.includes("Digit")) {
    clickSizeAdding(event);
  }
});

const clickSizeAdding = (event) => {
  let addVal = parseInt(event.code.substring(5, 6));
  if (addVal == 0) {
    sizePtoCreate = 1;
  } else {
    //addVal = Math.pow(10, addVal - 1);
    if (event.shiftKey) {
      sizePtoCreate = addVal;
      if (sizePtoCreate == 0) {
        sizePtoCreate = 1;
      }
    } else {
      sizePtoCreate = addVal;
    }
  }
  console.log(sizePtoCreate);
};

createScreen();

/* OLD FUNCS

const updateScreenLvl3 = (p) => {
  drawBlackBackground();
  for (let theP in p) {
    if (p[theP].active) {
      if (imageDataLvl3[p[theP].id] == null) {
        imageDataLvl3[p[theP].id] = createImageLvl3(p[theP]);
      }
      // ctx.putImageData(imageDataLvl3[p[theP].id], p[theP].x, p[theP].y);
      ctx.drawImage(imageDataLvl3[p[theP].id], p[theP].x, p[theP].y);
    }
  }
};

function imageDataToImage(imagedata) {
  const tempCtx = document.getElementById("tempCanvas").getContext("2d");
  tempCanvas.width = imagedata.width;
  tempCanvas.height = imagedata.height;
  tempCtx.putImageData(imagedata, 0, 0);

  var image = new Image();
  image.src = tempCanvas.toDataURL();
  return image;
}

const createImageLvl3 = (p) => {
  let w = 20;
  let h = 20;
  let newImageData = ctx.createImageData(w * 2, h * 2);
  let q = p.charge;
  let m = p.mass;
  for (let i = 0; i < w * 2; i++) {
    for (let j = 0; j < h * 2; j++) {
      let pixelStartIndex = (j * w * 2 + i) * 4;
      let dist = calcDist(i, j, w, h);
      const rVal = clamp8Bit((-q * 100) / dist);
      const gVal = clamp8Bit((q * 100) / dist);
      const bVal = clamp8Bit((50 * m ** 0.2) / dist);
      const aVal = clamp8Bit(255 / dist);
      newImageData.data[pixelStartIndex] = rVal; // red value
      newImageData.data[pixelStartIndex + 1] = gVal; // green value
      newImageData.data[pixelStartIndex + 2] = bVal; // blue value
      newImageData.data[pixelStartIndex + 3] = aVal; // alpha value
    }
  }
  return imageDataToImage(newImageData);
  // return newImageData;
};

*/
