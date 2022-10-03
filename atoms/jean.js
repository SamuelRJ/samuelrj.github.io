// Jean

import { getPInfo } from "./LUTs/periodicTableLUT.js";
import { getDamping, getParticles, updateDamping } from "./pFuncs.js";
import { getClickCreates, getInfoP } from "./uiAndControl.js";

const Jean = document.getElementById("jean").getContext("2d");
let atom = getPInfo();

let jean = {
  x: 100,
  y: 100,
  xp: 100,
  yp: 100,
  xVel: 0,
  yVel: 0,
  xAcc: 0,
  yAcc: 0,
  i: false,
  j: false,
  k: false,
  l: false,
};

export const heyJean = (jeanAction, jeanInfo, jeanDir) => {
  if (jeanAction == "move") {
    updateJeanControls(jeanInfo, jeanDir);
  } else {
    updateJeanMovement(jean);
    drawJeansCarpet(jean);
    updateJeanMetrics(jean);
    drawJean(jean);
  }
};

const updateJeanControls = (jeanInfo, jeanDir) => {
  if (jeanInfo == "w") {
    jean.i = jeanDir;
  } else if (jeanInfo == "a") {
    jean.j = jeanDir;
  } else if (jeanInfo == "s") {
    jean.k = jeanDir;
  } else if (jeanInfo == "d") {
    jean.l = jeanDir;
  }
  console.log(jeanDir);
};

const updateJeanMovement = (jean) => {
  let jeanCurrentSpeed = (jean.xVel ** 2 + jean.yVel ** 2) ** 0.5;
  let jeanSpeed = 0.5 / (jeanCurrentSpeed + 3);
  if (jean.i) {
    jean.yAcc -= jeanSpeed;
  }
  if (jean.j) {
    jean.xAcc -= jeanSpeed;
  }
  if (jean.k) {
    jean.yAcc += jeanSpeed;
  }
  if (jean.l) {
    jean.xAcc += jeanSpeed;
  }
  jean.xAcc -= 0.03 * jean.xVel;
  jean.yAcc -= 0.03 * jean.yVel;
  jean.xp = jean.x;
  jean.yp = jean.y;
  jean.x += jean.xVel;
  jean.y += jean.yVel;
  jean.xVel += jean.xAcc;
  jean.yVel += jean.yAcc;
  let damping = 0.8;
  jean.xVel *= damping;
  jean.yVel *= damping;
  updateDamping(jean);
};

export const giveMeJean = () => {
  return jean;
};

const drawJean = (jean) => {
  const gradient = Jean.createRadialGradient(
    jean.x,
    jean.y,
    20,
    jean.x,
    jean.y,
    40
  );
  gradient.addColorStop(0, `rgba(100,100,100,100)`);
  gradient.addColorStop(0.5, `rgba(100,100,255,0.5)`);
  gradient.addColorStop(1, `rgba(100,100,255,255)`);
  Jean.beginPath();
  Jean.arc(jean.x, jean.y, 20, 0, 2 * Math.PI, false);
  Jean.fillStyle = gradient;
  Jean.fill();
};

const drawJeansCarpet = (jean) => {
  let randoR = 10 + 10 * Math.sin(Date.now() * 0.0001);
  let randoG = 10 + 10 * Math.sin(Date.now() * 0.0002);
  let randoB = 20 + 20 * Math.sin(Date.now() * 0.0003);
  Jean.beginPath();
  Jean.fillStyle = `rgba(${randoR}, ${randoG}, ${randoB}, 0.2)`;
  Jean.fillRect(0, 0, 500, 800);
  Jean.stroke();
};

export const updateJeanMetrics = (jean) => {
  Jean.beginPath();
  Jean.fillStyle = `rgba(${20}, ${60}, ${150}, 0.2)`;
  Jean.fillRect(20, 20, 52, 200);
  Jean.beginPath();
  Jean.fillStyle = `rgba(${40}, ${90}, ${180}, 0.2)`;
  let filledHeight = (getDamping() * 200) / 52;
  let filledOffsetFromTop = 52;
  let filledOffsetTop = 200 - 52 - filledHeight;
  let filledOffsetTotal = filledOffsetFromTop + filledOffsetTop;
  Jean.fillRect(20, filledOffsetTotal, 52, filledHeight);
  Jean.stroke();
  Jean.fillStyle = `rgba(0, 255, 255, 1)`;
  Jean.font = "24px serif";
  Jean.fillText(`${getDamping()}`, 25, 42);
  updateJeanAtomDisplay();
};

// let clickCreates = {
//   sel: "info",
//   info: 0, //particleID,
//   p: 0,
//   n: 0,
//   e: 0,
// };

const updateJeanAtomDisplay = () => {
  let clickCreates = getClickCreates();
  if (clickCreates.sel == "info") {
    let infoP = getInfoP();
    if (infoP == -1) {
      return;
    }
    let p = getParticles();
    clickCreates.numP = p[infoP].numP;
    clickCreates.numN = p[infoP].numN;
    clickCreates.numE = p[infoP].numE;
  }

  // console.log(clickCreates);

  let pViewer = {
    x: 20,
    y: 600,
    w: 150,
    h: 150,
  };

  // Number of Protons
  Jean.fillStyle = `rgba(50, 255, 50, .1)`;
  Jean.fillRect(pViewer.x, pViewer.y, pViewer.w, pViewer.h);
  Jean.stroke();
  Jean.fillStyle = `rgba(50, 255, 50, 1)`;
  Jean.font = "40px serif";
  Jean.textAlign = "left";
  Jean.fillText(`${clickCreates.numP}`, pViewer.x + 8, pViewer.y + 37);

  // Number of Neutrons
  Jean.fillStyle = `rgba(50, 50, 255, .1)`;
  Jean.fillRect(pViewer.x, pViewer.y, pViewer.w, pViewer.h);
  Jean.stroke();
  Jean.fillStyle = `rgba(180, 180, 180, 1)`;
  Jean.font = "40px serif";
  Jean.textAlign = "center";
  Jean.fillText(
    `${clickCreates.numN}`,
    pViewer.x + pViewer.w / 2,
    pViewer.y + 37
  );

  // Number of Electrons
  Jean.fillStyle = `rgba(255, 50, 50, .1)`;
  Jean.fillRect(pViewer.x, pViewer.y, pViewer.w, pViewer.h);
  Jean.stroke();
  Jean.fillStyle = `rgba(255, 50, 50, 1)`;
  Jean.font = "40px serif";
  Jean.textAlign = "right";
  Jean.fillText(
    `${clickCreates.numE}`,
    pViewer.x + pViewer.w - 8,
    pViewer.y + 37
  );
  setAtom(clickCreates);

  let atomicSymbol = "";
  if (atom.symbol != null) {
    atomicSymbol = atom.symbol;
  }

  // Symbol
  Jean.fillStyle = `rgba(200, 200, 200, 1)`;
  Jean.font = "100px serif";
  Jean.textAlign = "center";
  Jean.fillText(`${atomicSymbol}`, pViewer.x + pViewer.w / 2, pViewer.y + 125);
  Jean.textAlign = "left";
};

export const setAtom = (newAtom) => {
  atom = getPInfo(newAtom);
  if (atom == null) {
    atom = getPInfo();
  }
};
export const getAtom = () => {
  return atom;
};

// My real name? Jean Allalong.
