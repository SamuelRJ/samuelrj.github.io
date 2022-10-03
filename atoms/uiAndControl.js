// User interface and controls

import { clamp8Bit, get, calcDist } from "./miscFuncs.js";
import {
  createParticle,
  protonMass,
  getParticles,
  getGlobalCharge,
} from "./pFuncs.js";
import { getLvl, changeLvlTo } from "./index.js";
import { heyJean, setAtom, getAtom } from "./jean.js";
import { getNeutrons } from "./LUTs/periodicTableLUT.js";

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
let mouseX = 0;
let mouseY = 0;

let rapidFire = false;

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
  console.log(getGlobalCharge());

  for (let i = 0; i < screenWidth - 1; i++) {
    for (let j = 0; j < screenHeight - 1; j++) {
      let pixelStartIndex = (j * screenWidth + i) * 4;
      let x = Math.floor(i / scaleUp);
      let y = Math.floor(j / scaleUp);
      let qFieldVal = field[x][y].val;

      let rVal = clamp8Bit(-qFieldVal);
      let gVal = clamp8Bit(qFieldVal);
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
  // updateTextOnScreen();
};

const checkRapidFire = () => {
  if (rapidFire) {
    clickCreateParticle();
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

export const isPaused = () => {
  pauseTimer++;
  if (pauseTimer < autoPauseTimeout) {
    return false;
  } else if (pauseTimer == autoPauseTimeout) {
    drawPause();
  }
  return true;
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

const unpause = () => {
  drawBlackBackground();
  pauseTimer = 0;
};

export const drawBlackBackground = () => {
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.stroke();
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
  if (clickCreates.sel == "info") {
    findInfoP();
    return;
  }
  if (pauseTimer < autoPauseTimeout) {
    mouseX = event.pageX / scaleUp;
    mouseY = event.pageY / scaleUp;
    clickCreateParticle();
  }
  unpause();
});

const clickCreateParticle = () => {
  let newP = createParticle(
    mouseX + Math.random() * 10 - 5,
    mouseY + Math.random() * 10 - 5,
    0,
    0,
    clickCreates.numP,
    clickCreates.numN,
    clickCreates.numE
  );
};

document.addEventListener("keydown", (event) => {
  if (!getKeyStatus(event)) {
    updateKeyStatus(event, true);
    selPHandling(event);
  }
  // neverTyped = false;
  textFadeTimer = 0;

  if (event.code == "Space") {
    // logParticles();
    if (pauseTimer >= autoPauseTimeout) {
      unpause();
    } else {
      drawPause();
      pauseTimer = autoPauseTimeout;
    }
  }
  // else if (event.key == "w") {
  //   clickCreates.sel = "wire";
  // }
  else if (event.key == "i") {
    clickCreates.sel = "info";
  } else if (event.key == "Escape") {
    clickCreates.numP = 0;
    clickCreates.numN = 0;
    clickCreates.numE = 0;
  } else if (
    event.key == "w" ||
    event.key == "a" ||
    event.key == "s" ||
    event.key == "d"
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
  if (getKeyStatus(event)) {
    updateKeyStatus(event, false);
  }
  if (
    event.key == "w" ||
    event.key == "a" ||
    event.key == "s" ||
    event.key == "d"
  ) {
    heyJean("move", event.key, false);
  } else if (event.key == "r") {
    rapidFire = false;
  }
});

let keyStatus = {
  num: [false, false, false, false, false, false, false, false, false, false],
  p: false,
  n: false,
  e: false,
};

const updateKeyStatus = (event, status) => {
  if (event.code.includes("Digit")) {
    keyStatus.num[parseInt(event.code.substring(5, 6))] = status;
  } else {
    keyStatus[event.key] = status;
  }
};
const getKeyStatus = (event) => {
  if (event.code.includes("Digit")) {
    return keyStatus.num[parseInt(event.code.substring(5, 6))];
  } else {
    return keyStatus[event.key];
  }
};

let clickCreates = {
  sel: "info",
  info: 0, //particleID,
  numP: 0,
  numN: 0,
  numE: 0,
};

export const getClickCreates = () => {
  return clickCreates;
};

let sizePtoCreate = 0;
const selPHandling = (event) => {
  if (event.code.includes("Digit")) {
    if (!stillTyping()) {
      sizePtoCreate = parseInt(event.code.substring(5, 6));
    } else {
      sizePtoCreate *= 10;
      sizePtoCreate += parseInt(event.code.substring(5, 6));
    }
  } else {
    if (event.key == "p") {
      clickCreates.sel = "proton";
      if (sizePtoCreate >= 0) {
        clickCreates.numP = sizePtoCreate;
        sizePtoCreate = -1;
        clickCreates.numN = getNeutrons(clickCreates.numP);
      }
      stillTyping(false);
    } else if (event.key == "n") {
      clickCreates.sel = "neutron";
      if (sizePtoCreate >= 0) {
        clickCreates.numN = sizePtoCreate;
        sizePtoCreate = -1;
      }
      stillTyping(false);
    } else if (event.key == "e") {
      clickCreates.sel = "electron";
      if (sizePtoCreate >= 0) {
        clickCreates.numE = sizePtoCreate;
        sizePtoCreate = -1;
        stillTyping(false);
      }
    }
  }
};

let typingNumTimer = 0;
const stillTyping = (still) => {
  const typingDelay = 1000;
  if (still != null && still == false) {
    typingNumTimer -= typingDelay;
    return false;
  }
  if (Date.now() - typingNumTimer < typingDelay) {
    typingNumTimer = Date.now();
    return true;
  }
  typingNumTimer = Date.now();
  return false;
};

export const getNumOfPsToCreate = () => {
  return sizePtoCreate;
};

createScreen();
