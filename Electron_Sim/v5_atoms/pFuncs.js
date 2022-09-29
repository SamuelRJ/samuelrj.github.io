// Particle functions

import { getLvl } from "./index.js";
import { getField } from "./fFuncs.js";
import { calcDist, get, calculateGradientForParticle } from "./miscFuncs.js";

let p = []; //Particle
const width = get("width");
const height = get("height");
const screenWidth = get("screenWidth");
const screenHeight = get("screenHeight");
const scale = get("scale");
const particleContainerElem = document.getElementById("particleContainer");
let damping = 0.97;
let globalCharge = 0;

export const createParticle = (x, y, velX, velY, charge, mass) => {
  const elem = document.createElement("div");
  elem.className = `particle particle_${charge}_${mass}`;
  elem.style.background = calculateGradientForParticle(charge, mass);
  particleContainerElem.appendChild(elem);

  let newP = {
    id: getNewID(),
    x,
    y,
    velX,
    velY,
    charge,
    mass,
    active: true,
    elem,
  };
  if (getLvl() != 3) {
    newP.elem.style.display = "none";
  }
  p.push(newP);
  return newP;
};

const getNewID = () => {
  return String(Math.round(Math.random() * 1000000));
};
const getGlobalCharge = () => {
  return globalCharge;
};

export const getParticles = () => {
  return p;
};

export const pushNewP = (p) => {
  p.push(p);
};

export const updateParticles = () => {
  let newGlobalCharge = 0;
  for (let thisP in p) {
    if (!p[thisP].active) {
      continue;
    }
    newGlobalCharge += p[thisP].charge;
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
  for (let thisP in p) {
    if (!p[thisP].active) {
      continue;
    }
    addDamping(thisP);
    let impedance = addImpedance(thisP);
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
  if (!field[x][y].dk) {
    console.log(field[x][y].dk);
  }
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

export const protonMass = () => {
  // return 1836; //Real ratio, but 10 is more fun.
  return 100;
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
  let charge = p[thisP].charge + p[thatP].charge;
  let mass = p[thisP].mass + p[thatP].mass;
  p[thisP].active = false;
  p[thatP].active = false;
  p[thisP].elem.style.display = "none";
  p[thatP].elem.style.display = "none";
  createParticle(x, y, velX, velY, charge, mass); //make drawing better. Electron is now orbiting electron
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
  let impedance = addImpedance(theP);
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
