// Jean

import { getDamping, updateDamping } from "./pFuncs.js";

const Jean = document.getElementById("jean").getContext("2d");

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
    // console.log(jean.x);
  }
};

const updateJeanControls = (jeanInfo, jeanDir) => {
  if (jeanInfo == "i") {
    jean.i = jeanDir;
  } else if (jeanInfo == "j") {
    jean.j = jeanDir;
  } else if (jeanInfo == "k") {
    jean.k = jeanDir;
  } else if (jeanInfo == "l") {
    jean.l = jeanDir;
  }
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
  Jean.fillStyle = `rgba(0, 255, 255, 11)`;
  Jean.font = "24px serif";
  Jean.fillText(`${getDamping()}`, 25, 42);
};
