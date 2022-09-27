// Field functions

import { get } from "./miscFuncs.js";
import { calcDist } from "./miscFuncs.js";
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
    };
  }
}

export const updateFields = (p) => {
  let level = getLvl();
  if (level == 2) {
    return updateFieldsLvl2(p);
  }
};

const updateFieldsLvl2 = (p) => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      field[x][y].val = 0;
      field[x][y].mass = 0;
    }
  }
  let range = Math.max(width, height);
  for (let theP in p) {
    if (p[theP].active) {
      let pX = Math.floor(p[theP].x);
      let pY = Math.floor(p[theP].y);
      let xMin = Math.max(0, pX - range);
      let xMax = Math.min(width - 1, pX + range);
      let yMin = Math.max(0, pY - range);
      let yMax = Math.min(height - 1, pY + range);
      for (let x = xMin; x < xMax; x++) {
        for (let y = yMin; y < yMax; y++) {
          let dist = calcDist(p[theP].x, p[theP].y, x, y);
          field[x][y].val += (100 * p[theP].charge) / dist ** 0.5;
          if (dist < 10) {
            field[x][y].mass += p[theP].mass / Math.pow(dist * 2, 5);
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
