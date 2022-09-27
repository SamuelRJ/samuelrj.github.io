const ctx = document.getElementById("canvas").getContext("2d");

const resolution = 4;
const width = 500 / resolution;
const height = 500 / resolution;
const field = [];

let time = 0;
let timeSlower = 1;

for (let i = 0; i < width; i++) {
  field[i] = [];
  for (let j = 0; j < height; j++) {
    field[i][j] = {
      x: i,
      y: j,
      potential: 0,
      nextPotential: 0,
      r: 0,
      g: 0,
      b: 0,
    };
    if (Math.random() < 0.1) {
      field[i][j].nextPotential = Math.random();
    }
  }
}
for (let i = 10; i < 15; i++) {
  for (let j = 10; j < 15; j++) {
    field[i][j].nextPotential = 1;
  }
}

const updateField = (fieldAt, field) => {
  fieldAt.nextPotential = 0;
  if (
    fieldAt.x == 0 ||
    fieldAt.x == width ||
    fieldAt.y == 0 ||
    fieldAt.y == height
  ) {
    field.nextPotential = 0;
    return;
  }
  let counter = 0;
  let xMin = Math.max(fieldAt.x - 1, 0);
  let xMax = Math.min(fieldAt.x + 1, width);
  let yMin = Math.max(fieldAt.y - 1, 0);
  let yMax = Math.min(fieldAt.y + 1, height);
  for (let i = xMin; i <= xMax; i++) {
    for (let j = yMin; j <= yMax; j++) {
      if (i == fieldAt.x && j == fieldAt.y) {
        continue;
      }
      counter++;
      fieldAt.nextPotential += field[i][j].potential;
    }
  }
  fieldAt.nextPotential /= counter;
  fieldAt.nextPotential += (Math.random() - 0.5) / 2;
};

const draw = (field) => {
  field.potential = field.nextPotential;
  let g = Math.min(255, Math.max(0, field.potential * 255));
  let r = Math.min(255, Math.max(0, -field.potential * 255));
  ctx.beginPath();
  ctx.fillStyle = `rgb(
    ${r},
    ${g},
    ${0})`;
  ctx.fillRect(
    field.x * resolution,
    field.y * resolution,
    resolution,
    resolution
  );
  ctx.stroke();
};

const nextTick = () => {
  if (time == 0) {
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 500, 500);
    for (let i = 0; i < width - 1; i++) {
      for (let j = 0; j < height - 1; j++) {
        draw(field[i][j]);
      }
    }
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        updateField(field[i][j], field);
      }
    }
    // for (let i = 1; i < width - 1; i++) {
    //   for (let j = 1; j < height - 1; j++) {
    //     if (field[i][j].alive) {
    //       if (field[i][j].neighbors < 3 || field[i][j].neighbors > 4) {
    //         field[i][j].alive -= 0.2;
    //       }
    //     } else {
    //       if (field[i][j].neighbors >= 1) {
    //         if (Math.random() > numAlive / ((width * height) / populationMax)) {
    //           field[i][j].alive = 1;
    //         } else if (numAlive < 2) {
    //           field[i][j].alive += 0.1;
    //         }
    //       }
    //     }
    //   }
    // }
  }
  time++;
  time %= timeSlower;

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  let mouseX = event.pageX / window.innerWidth;
  let mouseY = 1 - event.pageY / window.innerHeight;
});
