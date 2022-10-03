// Lvl 1: (todo) Doppler for RF demos
// Lvl 2: Every pixel and every particle. Correct mathematical shading of e-field
//Optimization todo: Sample every other pixel and interpolate. Or relative to distance. Clamp to 60fps and adjust sampling with a warning.
// Lvl 3: Particles with radial gradient skirts. Just looking at each other

//faster render ways:
/*
  every particle is a canvas. Move it around
*/

import {
  createParticle,
  updateParticles,
  protonMass,
  getParticles,
} from "./pFuncs.js";
import { updateFields } from "./fFuncs.js";
import { updateScreen, isPaused, drawBlackBackground } from "./uiAndControl.js";
import { get } from "./miscFuncs.js";
import { heyJean } from "./jean.js";

const width = get("width");
const height = get("height");
let level = 2;

export const getLvl = () => {
  return level;
};

export const changeLvlTo = (newLvl) => {
  if (newLvl == level) {
    return;
  }
  if (level == 3) {
    let p = getParticles();
    for (let theP in p) {
      p[theP].elem.style.display = "none";
    }
  }
  if (level == 2) {
    drawBlackBackground();
  }
  if (newLvl == 3) {
    let p = getParticles();
    for (let theP in p) {
      if (p[theP].active) {
        p[theP].elem.style.display = "";
      }
    }
  }
  if (newLvl == 2) {
    //write code to set up level 2
  }
  level = newLvl;
};
// Create starting electrons
for (let i = 0; i < 1; i++) {
  createParticle(
    Math.random() * width * 0.9 + 15,
    Math.random() * height * 0.9 + 15,
    0,
    0,
    0,
    0,
    1
  );
}
// Create starting protons
for (let i = 0; i < 1; i++) {
  let numProtonsInClump = 1;
  createParticle(
    Math.random() * width * 0.9 + 15,
    Math.random() * height * 0.5 + height / 2,
    0,
    0,
    1,
    0,
    0
  );
}

const nextTick = () => {
  if (!isPaused()) {
    let p = updateParticles();
    let f = updateFields(p);
    updateScreen(f, p);
  }
  heyJean();
  requestAnimationFrame(nextTick);
};
nextTick();
