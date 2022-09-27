const ctx = document.getElementById("canvas").getContext("2d");

// const width = window.innerWidth;
// const height = window.innerHeight;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const width = canvas.width;
const height = canvas.height;
const field = [];
const range = 1;
const imageData = ctx.createImageData(width, height);

let clock = 0;
let simSpeed = 1;
let dampening = 0.9999;
let smoothImage = false;
let mouseX = width / 2;
let mouseY = height / 2;
let mouseXrel = 0;
let mouseYrel = 0;
let fullScreen = false;
let mouseMoved = -1;
let cursorBrightness = 0;

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
      addThing1(field[i][j]);
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

const handleMouse = () => {
  if (mouseMoved > 0) {
    // document.getElementById("canvas_div_no_cursor").style.cursor = "none";
    mouseMoved -= 1;
    if (mouseMoved > 80) {
      cursorBrightness += 0.2;
      cursorBrightness = Math.min(1, cursorBrightness);
    } else {
      cursorBrightness = mouseMoved / 80;
    }
    const gradient = ctx.createRadialGradient(
      mouseX,
      mouseY,
      1,
      mouseX,
      mouseY,
      20
    );
    gradient.addColorStop(0, `rgba(255,255,250,${0.2 * cursorBrightness})`);
    gradient.addColorStop(0.3, `rgba(255,255,250,0)`);
    gradient.addColorStop(0.5, `rgba(0,0,0,${0.2 * cursorBrightness})`);
    gradient.addColorStop(1, `rgba(0,0,0,0)`);
    // for (let i = 0; i < resolution; i++) {
    //   gradient.addColorStop(
    //     i / resolution / 2,
    //     `rgba(255,255,100,${(resolution - i) / resolution ** 1.5})`
    //   );
    // }
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
};

const addThing1 = (fieldAt) => {
  if (fieldAt.vel < 0.001 && fieldAt.vel > -0.001) {
    let xPos = fieldAt.x;
    let yPos = fieldAt.y;
    fieldAt.pos += Math.abs(Math.log(Math.abs(fieldAt.vel) + 0.01));
    // fieldAt.vel += Math.sin(clock / 10);
  }
};

const nextTick = () => {
  for (let i = 0; i < simSpeed; i++) {
    updateFieldForces(field);
    addPreset(0);
    updateVelandPos(field);
    clock++;
  }
  updatePixels(field);
  putImage();
  handleMouse();

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX;
  mouseXrel = (mouseX - width / 2) / (width / 2);
  mouseY = event.pageY;
  mouseYrel = (mouseY - height / 2) / (height / 2);
  mouseMoved = 100;
});

function fullscreen() {
  var el = document.getElementById("canvas");
  fullScreen = !fullScreen;
  if (fullScreen) {
    if (el.webkitRequestFullScreen) {
      el.webkitRequestFullScreen();
    } else {
      el.mozRequestFullScreen();
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // width = canvas.width;
    // height = canvas.height;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
  }
}

canvas.addEventListener("click", fullscreen);
