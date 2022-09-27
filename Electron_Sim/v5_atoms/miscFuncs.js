// Misc functions

let scaledUp = 5; //pixels per pixel
let width = canvas.width / scaledUp;
let height = canvas.height / scaledUp;

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

export const calculateGradientForParticle = _.memoize((charge, mass) => {
  const massCalc = Math.min(255, mass / (charge + 0.001));
  const rVal = -charge * 255;
  const gVal = charge * 255;
  // const rVal = clamp8Bit(-charge * 255);
  // const gVal = clamp8Bit(charge * 255);
  const bVal = clamp8Bit(massCalc);
  return `radial-gradient(
    circle,
    rgba(${rVal}, ${gVal}, ${bVal}, 1) 0%,
    rgba(${rVal}, ${gVal}, ${bVal}, 1) 0.10%,
    rgba(${rVal}, ${gVal}, 0, 0.1) 0.3%,
    rgba(${rVal}, ${gVal}, 0, 0.05) 40%,
    rgba(${rVal}, ${gVal}, 0, 0.0) 100%
  )`;
});
