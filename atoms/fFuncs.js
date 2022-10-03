// Field functions

import { get } from "./miscFuncs.js";
import { calcDist } from "./miscFuncs.js";
import { getParticles, getGlobalCharge } from "./pFuncs.js";
import { getLvl } from "./index.js";

let scaleUp = get("scale"); //how many pixels per pixel
const width = get("width");
const height = get("height");

const field = [];

// Create field
for (let i = 0; i < width; i++) {
  field[i] = [];
  for (let j = 0; j < height; j++) {
    field[i][j] = {
      x: i,
      y: j,
      val: 0,
      vel: 0,
      acc: 0,
      mass: 0,
      dk: 1,
    };
  }
}

// Create wall
for (let i = 0; i < 400; i++) {
  field[i] = [];
  for (let j = 0; j < 400; j++) {
    field[i][j] = {
      x: i,
      y: j,
      val: 0,
      vel: 0,
      acc: 0,
      mass: 0,
      dk: 1,
    };
  }
}

export const getField = () => {
  return field;
};

export const updateFields = (p) => {
  let level = getLvl();
  if (level == 2) {
    return updateFieldsLvl2(p);
  }
};

const updateFieldsLvl2 = (p) => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      field[x][y].val = 0;
      field[x][y].mass = 0;
    }
  }
  let globalCharge = getGlobalCharge();
  let range = Math.max(width, height);
  let numParticles = getParticles().length;
  let rangeFactor = Math.round(Math.max(3, 1 - numParticles ** 0.5));
  // let rangeFactor = Math.round(Math.max(10, 100 - numParticles ** 0.5));
  for (let theP in p) {
    if (p[theP].active) {
      let thisRange = Math.floor(
        Math.max(
          20,
          Math.min(
            400,
            rangeFactor * (p[theP].mass + Math.abs(p[theP].charge) ** 0.5)
          )
        )
      );
      let pX = Math.floor(p[theP].x);
      let pY = Math.floor(p[theP].y);
      let xMin = Math.max(0, pX - thisRange);
      let xMax = Math.min(width - 1, pX + thisRange);
      let yMin = Math.max(0, pY - thisRange);
      let yMax = Math.min(height - 1, pY + thisRange);
      for (let x = xMin; x < xMax; x++) {
        for (let y = yMin; y < yMax; y++) {
          let dist = calcDist(p[theP].x, p[theP].y, x, y);

          // field[x][y].val += (100 * p[theP].charge) / dist ** 0.5;
          if (dist < thisRange) {
            field[x][y].val +=
              ((100 * p[theP].charge) / dist) *
              ((thisRange - dist) / thisRange);
            // field[x][y].val *= Math.min(1, (thisRange - dist) / thisRange);
            field[x][y].mass += Math.sqrt(p[theP].mass) / dist;
          }
        }
      }
    }
  }
  return field;
};

// const updateFieldsSlowForSomeReason = (p) => {
//   for (let x = 0; x < width; x++) {
//     for (let y = 0; y < height; y++) {
//       field[x][y].mass = 0;
//       field[x][y].val = 0;
//       for (let theP in p) {
//         if (p[theP].active) {
//           let dist = calcDist(p[theP].x, p[theP].y, x, y);
//           field[x][y].val += (100 * p[theP].charge) / dist ** 0.5;
//           if (dist < 10) {
//             field[x][y].mass += p[theP].mass / Math.pow(dist * 2, 5);
//           }
//         }
//       }
//     }
//   }
// };
