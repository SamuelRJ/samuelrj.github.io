const ctx = document.getElementById("canvas").getContext("2d");

const particles = [];
const particlesOld = [];
const width = 130;
const height = 130;
const size = 4;
let time = 0;
let timeSlower = 1;
let numAlive = 0;
let populationMax = 10;

for (let i = 0; i < width; i++) {
  particles[i] = [];
  particlesOld[i] = [];
  for (let j = 0; j < height; j++) {
    particles[i][j] = {
      x: i,
      y: j,
      alive: false,
      neighbors: 0,
    };
    // if (Math.random() < 0.001) {
    //   particles[i][j].alive = true;
    // }
    particlesOld[i][j] = particles[i][j];
  }
}
particles[width / 2][height / 2].alive = true;
particlesOld[width / 2][height / 2].alive = true;

const updateParticle = (particle, particlesOld) => {
  let aliveNeighborCount = 0;
  for (let i = particle.x - 1; i <= particle.x + 1; i++) {
    for (let j = particle.y - 1; j <= particle.y + 1; j++) {
      if (i == particle.x && j == particle.y) {
        continue;
      }
      if (particlesOld[i][j].alive) {
        aliveNeighborCount++;
        // console.log(
        //   `x:${particle.x} y:${particle.y} a:${particle.alive} i:${i} j:${j} an:${particlesOld[i][j].alive} n:${aliveNeighborCount}`
        // );
      }
    }
  }
  particle.neighbors = aliveNeighborCount;
};

const draw = (particle) => {
  ctx.beginPath();
  if (particle.alive) {
    ctx.fillStyle = "#DDD";
  } else {
    ctx.fillStyle = "#222";
  }
  ctx.fillRect(particle.x * size, particle.y * size, size, size);
  ctx.stroke();
};

const nextTick = () => {
  if (time == 0) {
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 500, 500);
    for (let i = 0; i < width - 1; i++) {
      for (let j = 0; j < height - 1; j++) {
        // particlesOld[i][j] = particles[i][j];
        draw(particles[i][j]);
      }
    }
    // console.log(numAlive);
    numAlive = 0;
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        updateParticle(particles[i][j], particlesOld);
        if (particles[i][j].alive) {
          numAlive++;
        }
      }
    }
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        if (particles[i][j].alive) {
          if (particles[i][j].neighbors < 2 || particles[i][j].neighbors > 3) {
            particles[i][j].alive = false;
          }
        } else {
          if (particles[i][j].neighbors >= 1) {
            if (Math.random() > numAlive / ((width * height) / populationMax)) {
              particles[i][j].alive = true;
            } else if (numAlive < 2) {
              particles[i][j].alive = true;
            }
          }
        }
      }
    }
  }
  time++;
  time %= timeSlower;

  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  let mouseX = event.pageX / window.innerWidth;
  let mouseY = 1 - event.pageY / window.innerHeight;
  populationMax = Math.round(mouseX * mouseX * 100 + 3);
  console.log(populationMax);
});
