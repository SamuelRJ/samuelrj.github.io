// Lvl 1: (todo) Doppler for RF demos
// Lvl 2: Every pixel and every particle. Correct mathematical shading of e-field
//Optimization todo: Sample every other pixel and interpolate. Or relative to distance. Clamp to 60fps and adjust sampling with a warning.
// Lvl 3: Particles with radial gradient skirts. Just looking at each other

//faster render ways:
/*
  every particle is a canvas. Move it around
*/

import { createParticle, updateParticles, protonMass } from "./pFuncs.js";
import { updateFields } from "./fFuncs.js";
import { updateScreen, isPaused } from "./uiAndControl.js";
import { get } from "./miscFuncs.js";

const width = get("width");
const height = get("height");
let level = 3;

//TODO:
// - Make orbitals for atoms. Shiftable based on surrounding fields.
// - Make electron energy go somewhere when combining
// - Allow high-energy electrons to knock out other electrons. Or excite it. Ionization energy vs excitation energy
export const getLvl = () => {
  if (level == 0) {
    return 3;
  }
  return level;
};
// Create starting electrons
for (let i = 0; i < 1; i++) {
  createParticle(
    Math.random() * width * 0.9 + 15,
    Math.random() * height * 0.9 + 15,
    0,
    0,
    -1,
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
    1 * numProtonsInClump,
    protonMass() * numProtonsInClump
  );
}

const nextTick = () => {
  if (!isPaused()) {
    let p = updateParticles();
    let f = updateFields(p);
    updateScreen(f, p);
  }
  requestAnimationFrame(nextTick);
};
nextTick();
