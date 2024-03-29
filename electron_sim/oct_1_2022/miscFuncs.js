// Misc functions

let scaledUp = 2; //pixels per pixel
let width = 800 / scaledUp;
let height = 800 / scaledUp;

export const get = (getWhat) => {
  if (getWhat == "width") {
    return width;
  }
  if (getWhat == "height") {
    return height;
  }
  if (getWhat == "screenWidth") {
    return width * scaledUp;
  }
  if (getWhat == "screenHeight") {
    return height * scaledUp;
  }
  if (getWhat == "scale") {
    return scaledUp;
  }
};

export const clamp = (min, max) => (value) =>
  Math.min(max, Math.max(min, value));
export const clamp8Bit = clamp(0, 255);
export const calcDist = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};
export const calcDistish = (x1, y1, x2, y2) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

export const calculateGradientForParticle = (charge, mass) => {
  const massCalc = Math.min(255, mass / (5 * Math.abs(charge) + 0.001));
  // const massCalc = Math.min(255, 255 - 255 * Math.abs(charge));
  const rVal = clamp8Bit((-charge * 255) / mass ** 0.1);
  const gVal = clamp8Bit((charge * 255) / mass ** 0.1);
  const bVal = clamp8Bit(massCalc);
  const sizeHelper = Math.max((2 * mass ** 0.4) / 5 - 2, 0.5);
  return `radial-gradient(
    circle,
    rgba(${rVal}, ${gVal}, ${bVal}, 1) 0%,
    rgba(${rVal}, ${gVal}, ${bVal}, 1) ${Math.min(100, sizeHelper)}%,
    rgba(0, 0, 0, 0) ${Math.min(100, sizeHelper * 2)}%,
    rgba(0, 0, 0, 0) 100%
  )`;
  // return `radial-gradient(
  //   circle,
  //   rgba(${rVal}, ${gVal}, ${bVal}, 1) 0%,
  //   rgba(${rVal}, ${gVal}, ${bVal}, 1) ${sizeHelper}%,
  //   rgba(${rVal}, ${gVal}, 0, ${sizeHelper}) 0.3%,
  //   rgba(${rVal}, ${gVal}, 0, ${sizeHelper / 2}) 40%,
  //   rgba(${rVal}, ${gVal}, 0, 0.0) 100%
  // )`;
};
