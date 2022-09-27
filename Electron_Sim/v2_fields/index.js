const ctx = document.getElementById("canvas").getContext("2d");

// const width = window.innerWidth;
// const height = window.innerHeight;
canvas.width = 500;
canvas.height = 400;
const width = canvas.width;
const height = canvas.height;
const field = [];
const electron = [];
const range = 1;
const imageData = ctx.createImageData(width, height);

let clock = 0;
let simSpeed = 1;
let dampening = 0.99;
let smoothImage = false;
let mouseX = width / 2;
let mouseY = height / 2;
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

for (let i = 0; i < 100; i++) {
  electron[i] = {
    x: Math.random() * (width - 1),
    y: Math.random() * (height - 1),
    velX: 0,
    velY: 0,
    charge: -0.5,
  };
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
  fieldAt.pos *= dampening;
};

const updateElectrons = () => {
  for (let i = 0; i < electron.length; i++) {
    updateElectron(electron[i]);
  }
};

const updateElectron = (electronAt) => {
  let xVal = Math.round(electronAt.x);
  let yVal = Math.round(electronAt.y);

  let adjField = [
    field[xVal - 1][yVal],
    field[xVal + 1][yVal],
    field[xVal][yVal + 1],
    field[xVal][yVal - 1],
  ];
  let eSpeedDiv = 10;
  electronAt.velX += (adjField[1].pos - adjField[0].pos) / eSpeedDiv;
  electronAt.velY += (adjField[2].pos - adjField[3].pos) / eSpeedDiv;
  let electronSpeed = Math.sqrt(electronAt.velX ** 2 + electronAt.velY ** 2);
  let electronMaxSpeed = 2;
  if (electronSpeed > electronMaxSpeed) {
    let speedReductionFactor = electronSpeed / electronMaxSpeed;
    electronAt.velX /= speedReductionFactor;
    electronAt.velY /= speedReductionFactor;
  }
  electronAt.x += electronAt.velX / eSpeedDiv;
  if (electronAt.x <= 1 || electronAt.x > width - 2) {
    electronAt.x -= electronAt.velX / eSpeedDiv;
    electronAt.velX *= -1;
    goBackToTheCenter(electronAt);
  }
  electronAt.y += electronAt.velY / eSpeedDiv;
  if (electronAt.y <= 1 || electronAt.y > height - 21) {
    electronAt.y -= electronAt.velY / eSpeedDiv;
    electronAt.velY *= -1;
    goBackToTheCenter(electronAt);
  }
  electronAt.velX = Math.min(1, electronAt.velX);
  electronAt.velY = Math.min(1, electronAt.velY);

  field[xVal][yVal].pos = 255 * electronAt.charge;
  field[xVal][yVal].vel = 0;
  field[xVal][yVal].acc = 0;
};

const goBackToTheCenter = (electronAt) => {
  electronAt.x = width / 2 + Math.random() * 50;
  electronAt.y = height / 2 + Math.random() * 50;
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
    }
  }
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
      mouseX + 399,
      mouseY,
      1,
      mouseX + 399,
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
    ctx.arc(mouseX + 399, mouseY, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
};

const nextTick = () => {
  for (let i = 0; i < simSpeed; i++) {
    updateElectrons();
    updateFieldForces(field);
    // addPreset(1);
    updateVelandPos(field);
    clock++;
  }
  updatePixels(field);
  putImage();

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  mouseX = event.pageX - 400;
  mouseY = event.pageY;
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
