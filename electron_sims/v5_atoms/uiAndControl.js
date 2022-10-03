// User interface and controls

import { clamp8Bit, get, calcDist } from "./miscFuncs.js";
import {
  createParticle,
  protonMass,
  logParticles,
  getParticles,
} from "./pFuncs.js";
import { getLvl, changeLvlTo } from "./index.js";
import { heyJean } from "./jean.js";

let scaleUp = get("scale"); //how many pixels per pixel
let infoP = -1;

const particleContainerElem = document.getElementById("particleContainer");

const ctx = document.getElementById("canvas").getContext("2d");
const width = get("width");
const height = get("height");
const screenWidth = width * scaleUp;
const screenHeight = height * scaleUp;
const imageData = ctx.createImageData(screenWidth, screenHeight);
let pauseTimer = 0;
let autoPauseTimeout = 2000;
let textFadeTimer = 0;
let sizePtoCreate = 1;
let mouseX = 0;
let mouseY = 0;

let clickCreates = "nothing"; //nothing, electron, proton, wire
let rapidFire = false;

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
  checkRapidFire();
  let level = getLvl();
  if (level == 3) {
    // updateScreenLvl3(p);
  }
  if (level == 2) {
    updateScreenLvl2(field);
  }
  showParticleInfo();
};

const updateScreenLvl2 = (field) => {
  for (let i = 0; i < screenWidth - 1; i++) {
    for (let j = 0; j < screenHeight - 1; j++) {
      let pixelStartIndex = (j * screenWidth + i) * 4;
      let x = Math.floor(i / scaleUp);
      let y = Math.floor(j / scaleUp);

      let rVal = clamp8Bit(-field[x][y].val);
      let gVal = clamp8Bit(field[x][y].val);
      let bVal = clamp8Bit(Math.pow(field[x][y].mass, 2));

      rVal += 20 * (field[x][y].dk - 1);
      gVal += 20 * (field[x][y].dk - 1);
      // const aVal = clamp8Bit(Math.abs(field[x][y].val + field[x][y].mass) / 2);

      imageData.data[pixelStartIndex] = rVal; // red value
      imageData.data[pixelStartIndex + 1] = gVal; // green value
      imageData.data[pixelStartIndex + 2] = bVal; // blue value
      // imageData.data[pixelStartIndex + 3] = aVal; // alpha value
    }
  }
  ctx.putImageData(imageData, 0, 0);
  updateTextOnScreen();
};

const checkRapidFire = () => {
  if (rapidFire) {
    clickCreateParticle();
  }
};

let neverTyped = true;
const updateTextOnScreen = () => {
  if (textFadeTimer++ <= 500) {
    if (neverTyped) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(
        0,
        (500 - textFadeTimer) / 100
      )}`;
      ctx.font = "24px serif";
      ctx.fillText(
        "Press 'e' or 'p' to \"click-to-create\" electrons or protons",
        5,
        25
      );
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(
        0,
        (200 - textFadeTimer) / 100
      )}`;
      ctx.font = "20px serif";
      ctx.fillText(`Click creates: ${sizePtoCreate}x ${clickCreates}`, 5, 25);
    }
  }
  if (infoP != -1) {
    showParticleInfo();
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
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(screenWidth / 2 - 15, screenHeight / 2 - 30, 10, 60);
  ctx.fillRect(screenWidth / 2 + 15, screenHeight / 2 - 30, 10, 60);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.stroke();
};

export const drawBlackBackground = () => {
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.stroke();
};

const unpause = () => {
  drawBlackBackground();
  pauseTimer = 0;
};

const clickCreateParticle = () => {
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
};

export const getInfoP = () => {
  return infoP;
};
export const setInfoP = (newInfoP) => {
  infoP = newInfoP;
};

const showParticleInfo = () => {
  let p = getParticles();
  if (infoP == -1) {
    return;
  }
  if (p[infoP].active) {
    ctx.fillStyle = `rgba(255, 255, 255, 1)`;
    ctx.font = "20px serif";
    ctx.fillText(`Particle info`, 10, 750);
    ctx.fillText(`         Charge: ${p[infoP].charge}`, 10, 770);
    ctx.fillText(`            Mass: ${p[infoP].mass}`, 10, 790);
  }
};

const findInfoP = () => {
  let p = getParticles();
  let minDist = 10000;
  for (let theP in p) {
    if (p[theP].active) {
      let distance = calcDist(p[theP].x, p[theP].y, mouseX, mouseY);
      if (distance <= minDist) {
        minDist = distance;
        infoP = theP;
      }
    }
  }
  if (minDist > 30) {
    infoP = -1;
  }
};

document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX / scaleUp;
  mouseY = event.pageY / scaleUp;
  if (!isPaused()) {
    unpause();
  }
});

document.addEventListener("click", (event) => {
  unpause();
  if (clickCreates == "nothing") {
    findInfoP();
    return;
  }
  if (clickCreates == "wire") {
    return;
  }
  if (pauseTimer < autoPauseTimeout) {
    mouseX = event.pageX / scaleUp;
    mouseY = event.pageY / scaleUp;
    clickCreateParticle();
  }
});

document.addEventListener("keydown", (event) => {
  neverTyped = false;
  textFadeTimer = 0;

  if (event.code == "Space") {
    // logParticles();
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
  }
  // else if (event.key == "w") {
  //   clickCreates = "wire";
  // }
  else if (event.key == "z") {
    clickCreates = "nothing";
  } else if (event.code.includes("Digit")) {
    clickSizeAdding(event);
  } else if (
    event.key == "i" ||
    event.key == "j" ||
    event.key == "k" ||
    event.key == "l"
  ) {
    heyJean("move", event.key, true);
  } else if (event.key == ",") {
    changeLvlTo(1);
  } else if (event.key == ".") {
    changeLvlTo(2);
  } else if (event.key == "/") {
    changeLvlTo(3);
  } else if (event.key == "r") {
    rapidFire = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (
    event.key == "i" ||
    event.key == "j" ||
    event.key == "k" ||
    event.key == "l"
  ) {
    heyJean("move", event.key, false);
  } else if (event.key == "r") {
    rapidFire = false;
  }
});

const clickSizeAdding = (event) => {
  let addVal = parseInt(event.code.substring(5, 6));
  if (addVal == 0) {
    sizePtoCreate = 1;
  } else {
    //addVal = Math.pow(10, addVal - 1);
    if (!event.shiftKey) {
      sizePtoCreate = addVal;
      if (addVal == 6) {
        sizePtoCreate = 10;
      } else if (addVal == 7) {
        sizePtoCreate = 20;
      } else if (addVal == 8) {
        sizePtoCreate = 50;
      } else if (addVal == 9) {
        sizePtoCreate = 100;
      }
    } else {
    }
  }
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
