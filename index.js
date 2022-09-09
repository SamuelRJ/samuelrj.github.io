const ctx = document.getElementById("canvas").getContext("2d");

const resolution = 4;
const width = 500 / resolution;
const height = 500 / resolution;
const field = [];

let time = 0;
let timeSlower = 1;
let potentialBias = 0;
let adjX = 5;
let adjY = 3;
let timer = 1;
let toggler = false;

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
  const reach = Math.round(adjY);
  // if (
  //   fieldAt.x < reach ||
  //   fieldAt.x > width - reach ||
  //   fieldAt.y < reach ||
  //   fieldAt.y > height - reach
  // ) {
  //   field.nextPotential = 0;
  //   return;
  // }
  let counter = 0;
  let xMin = Math.max(fieldAt.x - reach, 0);
  let xMax = Math.min(fieldAt.x + reach, width - 1);
  let yMin = Math.max(fieldAt.y - reach, 0);
  let yMax = Math.min(fieldAt.y + reach, height - 1);
  for (let i = xMin; i <= xMax; i++) {
    for (let j = yMin; j <= yMax; j++) {
      let distance = Math.sqrt(
        Math.abs(i - fieldAt.x) ** 2 + Math.abs(j - fieldAt.y) ** 2
      );
      if (i == fieldAt.x && j == fieldAt.y) {
        continue;
      }
      counter++;
      fieldAt.nextPotential += field[i][j].potential / distance;
    }
  }
  fieldAt.nextPotential /= reach * adjX;
  if (fieldAt.nextPotential > 0.5) {
    fieldAt.nextPotential *= -0.49;
  } else if (fieldAt.nextPotential > 0.2) {
    fieldAt.nextPotential *= 1.1 + potentialBias / 100000;
  } else if (fieldAt.nextPotential < -0.5) {
    fieldAt.nextPotential *= -0.51;
  } else if (fieldAt.nextPotential < -0.2) {
    fieldAt.nextPotential *= 1.1 - potentialBias / 100000;
  }

  fieldAt.nextPotential += (Math.random() - 0.5) / 2;
};

const draw = (field) => {
  let b = (field.potential - field.nextPotential) * 100;
  field.potential += field.nextPotential;
  field.potential /= 1.2;
  let g;
  let r;
  g = Math.min(255, Math.max(0, field.potential * 255));
  r = Math.min(255, Math.max(0, -field.potential * 255));

  ctx.beginPath();
  ctx.fillStyle = `rgb(
    ${r},
    ${g},
    ${b})`;
  // ctx.fillRect(
  //   field.x * resolution,
  //   field.y * resolution,
  //   resolution,
  //   resolution
  // );
  ctx.fillRect(
    field.x * resolution + (timer % resolution),
    field.y * resolution + ((timer / resolution) % resolution),
    1,
    1
  );
  ctx.stroke();
};

const nextTick = () => {
  // if (!(time % resolution)) {
  //   ctx.clearRect(0, 0, 500, 500);
  //   ctx.fillStyle = "#000";
  //   ctx.fillRect(0, 0, 500, 500);
  // }
  if (time == 0) {
    potentialBias = 0;
    for (let i = 0; i < width - 1; i++) {
      for (let j = 0; j < height - 1; j++) {
        potentialBias += field[i][j].potential;
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
  timer++;

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  let mouseX = event.pageX / window.innerWidth;
  let mouseY = 1 - event.pageY / window.innerHeight;
  adjX = mouseX * mouseX * 30 + 2;
  adjY = mouseY * mouseY * 5 + 1;
  // console.log(`AdjX:${Math.round(adjX, 2)} AdjY:${Math.round(adjY, 2)}`);
});
document.addEventListener("click", (event) => {
  toggler = !toggler;
});
