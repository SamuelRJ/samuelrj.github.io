const ctx = document.getElementById("canvas").getContext("2d");

const width = 800;
const height = 500;
const field = [];
const range = 1;
const imageData = ctx.createImageData(width, height);

let clock = 0;
let simSpeed = 2;
let dampening = 0.9999;
let smoothImage = false;
let mouseX = width / 2;
let mouseY = height / 2;

for (let i = 0; i < width; i++) {
  field[i] = [];
  for (let j = 0; j < height; j++) {
    field[i][j] = {
      x: i,
      y: j,
      pos: 0,
      vel: 0,
      acc: 0,
      nextAcc: 0,
    };
  }
}

const clamp = (min, max) => (value) => Math.min(max, Math.max(min, value));
const clamp8Bit = clamp(0, 255);

const updateField = (fieldAt, field) => {
  let adjField = [
    field[fieldAt.x - 1][fieldAt.y],
    field[fieldAt.x + 1][fieldAt.y],
    field[fieldAt.x][fieldAt.y + 1],
    field[fieldAt.x][fieldAt.y - 1],
  ];
  for (let i = 0; i < 4; i++) {
    let force = adjField[i].pos - fieldAt.pos;
    force /= 50;
    fieldAt.nextAcc += force;
    adjField[i].nextAcc -= force;
  }

  // for (let i = fieldAt.x - 1; i <= fieldAt.x + 1; i++) {
  //   for (let j = fieldAt.y - 1; j <= fieldAt.y + 1; j++) {
  //     let distance = Math.sqrt(
  //       Math.abs(i - fieldAt.x) ** 2 + Math.abs(j - fieldAt.y) ** 2
  //     );
  //     if (distance == 0) {
  //       continue;
  //     } else if (distance == 1) {
  //       let force = field[i][j].pos - fieldAt.pos; // / distance ** 2;
  //       force /= 50;
  //       funMath(fieldAt, field[i][j], force);
  //     }
  //   }
  // }
};

const updateFieldForces = (field) => {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      updateField(field[i][j], field);
    }
  }
};

const updateVelandPos = (field) => {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      field[i][j].acc = field[i][j].nextAcc;
      field[i][j].nextAcc = 0;
      field[i][j].vel += field[i][j].acc;
      field[i][j].pos += field[i][j].vel;
      addRipples(field[i][j]);
      addDiscoTrip(field[i][j]);
      addYSwing(field[i][j]);
    }
  }
};

const addRipples = (fieldAt) => {
  if (fieldAt.vel > 2 || fieldAt.vel < -2) {
    return;
  }
  let noisyVal = Math.random();
  if (noisyVal < 0.00002) {
    noisyVal = 300 * Math.random();
  } else if (noisyVal < 0.01) {
    noisyVal = 0;
  } else {
    noisyVal = 1;
  }
  fieldAt.vel *= noisyVal;
};

const addDiscoTrip = (fieldAt) => {
  if (Math.abs(fieldAt.acc) > 5) {
    fieldAt.vel *= -mouseX / 500;
  }
  let noisyVal = Math.random();
  if (noisyVal < 0.00002) {
    noisyVal = 100 * Math.random();
  } else if (noisyVal < 0.01) {
    noisyVal = 0;
  } else {
    noisyVal = 1;
  }
  fieldAt.vel *= noisyVal;
  if (Math.abs(fieldAt.pos) > 500) {
    fieldAt.vel = -fieldAt.pos;
  }
};

const addYSwing = (fieldAt) => {
  fieldAt.pos += fieldAt.pos * ((mouseY - height / 2) / height / 30);
  fieldAt.vel += fieldAt.vel * -((mouseY - height / 2) / height);
};

const updatePixels = (field) => {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      const pixelStartIndex = (j * width + i) * 4;
      imageData.data[pixelStartIndex] = clamp8Bit(-field[i][j].pos); // red value
      imageData.data[pixelStartIndex + 1] = clamp8Bit(field[i][j].pos); // green value
      imageData.data[pixelStartIndex + 2] = clamp8Bit(-10 * field[i][j].vel); // blue value
      imageData.data[pixelStartIndex + 3] = 255; // alpha value
    }
  }
};

const addPreset = (preset) => {
  if (preset > -1) {
    let srcX1 = 0;
    let srcX2 = 0;
    let srcY1 = 0;
    let srcY2 = 0;
    let newVal = 0;
    if (preset == 0) {
      srcX1 = Math.round(width / 2);
      srcY1 = Math.round(height / 2);
      if (clock < 100) {
        field[srcX1][srcY1].pos = 255;
      }
      field[srcX1][srcY1].vel = 0;
      field[srcX1][srcY1].acc = 0;
    }
    if (preset == 1) {
      newVal = 255;
      srcX1 = Math.round(width / 2 - 3);
      srcY1 = Math.round(height / 2 - 3);
      srcX2 = Math.round(width / 2 + 3);
      srcY2 = Math.round(height / 2 + 3);
      field[srcX1][srcY1].pos = newVal;
      field[srcX1][srcY1].vel = 0;
      field[srcX1][srcY1].acc = 0;
      field[srcX2][srcY2].pos = -newVal;
      field[srcX2][srcY2].vel = 0;
      field[srcX2][srcY2].acc = 0;
    } else if (preset == 2) {
      newVal = 255 * Math.sin(clock / 10);
      srcX1 = Math.round(width / 2 - 3);
      srcY1 = Math.round(height / 2 - 3);
      srcX2 = Math.round(width / 2 + 3);
      srcY2 = Math.round(height / 2 + 3);
      field[srcX1][srcY1].pos = newVal;
      field[srcX1][srcY1].vel = 0;
      field[srcX1][srcY1].acc = 0;
      field[srcX2][srcY2].pos = -newVal;
      field[srcX2][srcY2].vel = 0;
      field[srcX2][srcY2].acc = 0;
    } else if (preset == 3) {
      newVal = Math.min(255, clock * 10);
      srcX1 = Math.round(width / 2 - 10 * Math.sin(clock / 50));
      srcY1 = Math.round(height / 2 - 10 * Math.cos(clock / 50));
      srcX2 = Math.round(width / 2 + 10 * Math.sin(clock / 50));
      srcY2 = Math.round(height / 2 + 10 * Math.cos(clock / 50));
      field[srcX1][srcY1].pos = newVal;
      field[srcX1][srcY1].vel = 0;
      field[srcX1][srcY1].acc = 0;
      field[srcX2][srcY2].pos = -newVal;
      field[srcX2][srcY2].vel = 0;
      field[srcX2][srcY2].acc = 0;
    } else if (preset == 4) {
      newVal = 255 * Math.sin(clock / 50);
      srcX1 = width / 2;
      srcY1 = height / 2;
      field[srcX1][srcY1].pos = newVal;
      field[srcX1][srcY1].vel = 0;
      field[srcX1][srcY1].acc = 0;
    }
  }
};

const putImage = () => {
  ctx.imageSmoothingEnabled = smoothImage;
  ctx.putImageData(imageData, 0, 0);
};

const nextTick = () => {
  for (let i = 0; i < simSpeed; i++) {
    updateFieldForces(field);

    addPreset(0);

    // pass 1: update values
    updateVelandPos(field);
    clock++;
  }
  // pass 2: update pixels
  updatePixels(field);

  // console.log(`imageData`, imageData);
  // Draw image data to the canvas
  putImage();

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX - 400;
  mouseY = event.pageY;
  // adjX = mouseX * mouseX * 30 + 2;
  // adjY = mouseY * mouseY * 5 + 1;
  // console.log(`AdjX:${Math.round(adjX, 2)} AdjY:${Math.round(adjY, 2)}`);
});
document.addEventListener("click", (event) => {
  // console.log("clicked")
  field[mouseX - 9][mouseY - 6].pos = 255;
  smoothImage = !smoothImage;
  openFullscreen();
});

function openFullscreen() {
  if (ctx.requestFullscreen) {
    ctx.requestFullscreen();
  } else if (ctx.webkitRequestFullscreen) {
    /* Safari */
    ctx.webkitRequestFullscreen();
  } else if (ctx.msRequestFullscreen) {
    /* IE11 */
    ctx.msRequestFullscreen();
  }
}
