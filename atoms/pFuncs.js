// Particle functions

import { getLvl } from "./index.js";
import { getField } from "./fFuncs.js";
import { calcDist, get, calculateGradientForParticle } from "./miscFuncs.js";
import { getInfoP, setInfoP } from "./uiAndControl.js";
import { getPCharge, getPMass } from "./LUTs/periodicTableLUT.js";

let p = []; //Particles
const width = get("width");
const height = get("height");
const screenWidth = get("screenWidth");
const screenHeight = get("screenHeight");
const scale = get("scale");
const particleContainerElem = document.getElementById("particleContainer");
let damping = 0.97;
let globalCharge = 0;

export const createParticle = (x, y, velX, velY, numP, numN, numE) => {
  if (numP == 0 && numN == 0) {
    createElectrons(x, y, velX, velY, numE);
    return;
  }
  const elem = document.createElement("div");

  let newP = {
    id: getNewID(),
    x,
    y,
    velX,
    velY,
    numP,
    numN,
    numE,
    charge: 0,
    mass: 0,
    active: true,
    elem,
  };
  newP.charge = getPCharge(newP);
  newP.mass = getPMass(newP);

  elem.className = `particle particle_${newP.charge}_${newP.mass}`;
  elem.style.background = calculateGradientForParticle(newP.charge, newP.mass);
  particleContainerElem.appendChild(elem);
  if (getLvl() != 3) {
    newP.elem.style.display = "none";
  }
  p.push(newP);
  return newP;
};

const createElectrons = (x, y, velX, velY, numE) => {
  for (let i = 0; i < numE; i++) {
    const elem = document.createElement("div");
    let newP = {
      id: getNewID(),
      x: x + Math.random() * 10 - 5,
      y: y + Math.random() * 10 - 5,
      velX: Math.random() - 0.5,
      velY: Math.random() - 0.5,
      numP: 0,
      numN: 0,
      numE: 1,
      charge: -1,
      mass: 1,
      active: true,
      elem,
    };
    elem.className = `particle particle_${newP.charge}_${newP.mass}`;
    elem.style.background = calculateGradientForParticle(
      newP.charge,
      newP.mass
    );
    particleContainerElem.appendChild(elem);
    if (getLvl() != 3) {
      newP.elem.style.display = "none";
    }
    p.push(newP);
  }
};

const getNewID = () => {
  return String(Math.round(Math.random() * 1000000));
};
export const getGlobalCharge = () => {
  return globalCharge;
};

export const getParticles = () => {
  return p;
};

export const pushNewP = (p) => {
  p.push(p);
};

export const updateParticles = () => {
  for (let thisP in p) {
    if (!p[thisP].active) {
      continue;
    }
    for (let thatP in p) {
      if (!p[thatP].active || !p[thisP].active) {
        continue;
      }
      if (p[thisP].id >= p[thatP].id) {
        continue;
      }

      let dist = calcDist(p[thisP].x, p[thisP].y, p[thatP].x, p[thatP].y);
      let radius = Math.sqrt(
        Math.abs(p[thisP].charge) + Math.abs(p[thatP].charge)
      );
      radius += (p[thisP].mass + p[thatP].mass) ** 0.3 / 10;

      if (dist > radius) {
        updateVelocity(thisP, thatP, dist);
      } else {
        if (isElectron(thisP) && isElectron(thatP)) {
        } else {
          collideParticles(thisP, thatP);
        }
      }
    }
  }

  let newGlobalCharge = 0;
  for (let thisP in p) {
    if (!p[thisP].active) {
      continue;
    }
    newGlobalCharge += p[thisP].charge;
    addDamping(thisP);
    let impedance = 1; // addImpedance(thisP);
    p[thisP].x += p[thisP].velX / impedance;
    p[thisP].y += p[thisP].velY / impedance;
    wallCheck(thisP);
    p[thisP].elem.style.left = `${scale * p[thisP].x}px`;
    p[thisP].elem.style.top = `${scale * p[thisP].y}px`;
  }
  globalCharge = newGlobalCharge;

  // popInactivePs();

  return p;
  // particlesOutWithOldInWithNew();
};

const addImpedance = (theP) => {
  let width = get("width");
  let height = get("height");
  let x = Math.max(0, Math.min(width - 1, Math.floor(p[theP].x)));
  let y = Math.max(0, Math.min(height - 1, Math.floor(p[theP].y)));
  // let xPrev = Math.max(
  //   0,
  //   Math.min(width - 1, Math.floor(p[theP].x - p[theP].velX))
  // );
  // let yPrev = Math.max(
  //   0,
  //   Math.min(width - 1, Math.floor(p[theP].y - p[theP].velY))
  // );
  let field = getField();
  return field[x][y].dk;
  // if (field[xPrev][yPrev].dk != field[x][y].dk) {
  //   let relativeDk = field[xPrev][yPrev].dk / field[x][y].dk;
  //   p[theP].velX *= relativeDk;
  //   p[theP].velY *= relativeDk;
  // }
  // p[theP].velY *= damping;
};

const popInactivePs = () => {
  for (let interrogatedP in p) {
    if (!p[interrogatedP].active) {
      p.splice(interrogatedP, 1);
    }
  }
};

export const getDamping = () => {
  return damping || 0.99;
};
export const updateDamping = (jean) => {
  let newDamping = 1.05;
  let dampingArea = {
    l: -30,
    r: 90,
    t: 10,
    b: 230,
  };
  //216 to 20
  if (jean.x > 5 && jean.x < 90) {
    newDamping = Math.min(
      1,
      Math.max(
        0,
        (1.15 * (dampingArea.b - jean.y - dampingArea.t)) / dampingArea.b
      )
    );
    damping = Math.round(100 * newDamping) / 100;
  }
};

const addDamping = (theP) => {
  p[theP].velX *= damping;
  p[theP].velY *= damping;
};

const isElectron = (theP) => {
  if (p[theP].mass == 1 && p[theP].charge == -1) {
    return true;
  }
  return false;
};

const collideParticles = (thisP, thatP) => {
  //add in the good stuff, here. Energies and such.
  combineParticles(thisP, thatP);
};

const combineParticles = (thisP, thatP) => {
  let x =
    (p[thisP].x * p[thisP].mass + p[thatP].x * p[thatP].mass) /
    (p[thisP].mass + p[thatP].mass);
  let y =
    (p[thisP].y * p[thisP].mass + p[thatP].y * p[thatP].mass) /
    (p[thisP].mass + p[thatP].mass);
  let velX =
    (p[thisP].velX * p[thisP].mass + p[thatP].velX * p[thatP].mass) /
    (p[thisP].mass + p[thatP].mass);
  let velY =
    (p[thisP].velY * p[thisP].mass + p[thatP].velY * p[thatP].mass) /
    (p[thisP].mass + p[thatP].mass);
  let numP = p[thisP].numP + p[thatP].numP;
  let numN = p[thisP].numN + p[thatP].numN;
  let numE = p[thisP].numE + p[thatP].numE;
  p[thisP].active = false;
  p[thatP].active = false;
  p[thisP].elem.style.display = "none";
  p[thatP].elem.style.display = "none";
  let newP = createParticle(x, y, velX, velY, numP, numN, numE); //make drawing better. Electron is now orbiting electron
  let infoP = getInfoP();
  if (thisP == infoP || thatP == infoP) {
    setInfoP(p.indexOf(newP));
  }
};

const updateVelocity = (thisP, thatP, dist) => {
  let xDist = p[thisP].x - p[thatP].x;
  let yDist = p[thisP].y - p[thatP].y;
  let xForce = ((xDist / dist) * 1) / dist;
  let yForce = ((yDist / dist) * 1) / dist;
  let forceScale = p[thisP].charge * p[thatP].charge;
  xForce *= forceScale;
  yForce *= forceScale;

  p[thisP].velX += xForce / p[thisP].mass;
  p[thisP].velY += yForce / p[thisP].mass;
  p[thatP].velX -= xForce / p[thatP].mass;
  p[thatP].velY -= yForce / p[thatP].mass;
};

export const logParticles = () => {
  for (let anothaP in p) {
    console.log("");
    if (p[anothaP].active) {
      console.log(p[anothaP]);
    }
  }
};

const wallCheck = (theP) => {
  let bounceDamping = 0.8;
  let impedance = 1; // addImpedance(theP);
  if (p[theP].x > width - 1) {
    p[theP].velX *= -bounceDamping;
    p[theP].x += p[theP].velX / impedance;
    p[theP].x = Math.min(width - 1, p[theP].x);
  } else if (p[theP].x < 0) {
    p[theP].velX *= -bounceDamping;
    p[theP].x += p[theP].velX / impedance;
    p[theP].x = Math.max(0, p[theP].x);
  }
  if (p[theP].y > height - 1) {
    p[theP].velY *= -bounceDamping;
    p[theP].y += p[theP].velY / impedance;
    p[theP].y = Math.min(height - 1, p[theP].y);
  } else if (p[theP].y < 0) {
    p[theP].velY *= -bounceDamping;
    p[theP].y += p[theP].velY / impedance;
    p[theP].y = Math.max(0, p[theP].y);
  }
};

export const protonMass = () => {
  // return 1836; //Real ratio, but 50 is more fun.
  return 50;
};
export const neutronMass = () => {
  // return 1836; //Real ratio, but 50 is more fun.
  return 50;
};
