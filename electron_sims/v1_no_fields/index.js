const ctx = document.getElementById("canvas").getContext("2d");

// // Ways of making functions
// function helloSamOG() {
//   console.log('hello sam')
// }
// const helloSam1 = () => console.log('hello sam');
// const helloSam2 = () => {
//   console.log('hello sam')
// }

const resolution = 20; // 1-100

const draw = (particle) => {
  const radiusParticle = particle.radius;
  const radiusCharge = Math.abs(particle.charge) * 10;
  const x = particle.pos[0];

  particle.pos[0] -
    radiusParticle / 2 +
    (Math.random() * particle.temperature) / 200;
  const y =
    particle.pos[1] -
    radiusParticle / 2 +
    (Math.random() * particle.temperature) / 200;
  const gradient = ctx.createRadialGradient(
    x,
    y,
    radiusParticle,
    x,
    y,
    radiusCharge
  );
  gradient.addColorStop(0, `rgba(255,255,100,255)`);
  gradient.addColorStop(1, `rgba(255,255,100,0)`);
  // for (let i = 0; i < resolution; i++) {
  //   gradient.addColorStop(
  //     i / resolution / 2,
  //     `rgba(255,255,100,${(resolution - i) / resolution ** 1.5})`
  //   );
  // }
  ctx.beginPath();
  ctx.arc(x, y, radiusCharge, 0, 2 * Math.PI, false);
  ctx.fillStyle = gradient;
  ctx.fill();
};

const electronMass = 1;
const protonMass = 1836;
const electronCharge = -1;
const protonCharge = 1;
const electronColor = "#FF5";
const protonColor = "#55F";
const electronRadius = 1;
const protonRadius = 3; //look this up later

// function for elsewhere:
const calculateMass = (particle) =>
  particle.numElectrons * electronMass + particle.numProtons * protonMass;

const particles = [];
for (let i = 0; i < 25; i++) {
  particles[i] = {
    index: i,
    pos: [100 + 80 * (i % 5), 100 + 80 * Math.floor(i / 5)],
    truePos: [100 + 80 * (i % 5), 100 + 80 * Math.floor(i / 5)],
    vel: [0, 0],
    force: [0, 0],
    numElectrons: 1,
    numProtons: 0,
    radius: 1,
    charge: -1,
    stationary: false,
    temperature: 0,
  };
}

let numParticles = particles.length;
for (let i = 0; i < 10; i++) {
  particles[numParticles + i] = {
    index: numParticles + i,
    pos: [10 + 57 * i, 60],
    truePos: [10 + 57 * i, 60],
    vel: [0, 0],
    force: [0, 0],
    numElectrons: 1,
    numProtons: 0,
    radius: 1,
    charge: -1,
    stationary: true,
    temperature: 10000,
  };
}

numParticles = particles.length;
for (let i = 0; i < 10; i++) {
  particles[numParticles + i] = {
    index: numParticles + i,
    pos: [10 + 57 * i, 540],
    truePos: [10 + 57 * i, 540],
    vel: [0, 0],
    force: [0, 0],
    numElectrons: 1,
    numProtons: 0,
    radius: 1,
    charge: -1,
    stationary: true,
    temperature: 0,
  };
}

numParticles = particles.length;
for (let i = 0; i < 10; i++) {
  particles[numParticles + i] = {
    index: numParticles + i,
    pos: [60, 10 + 57 * i],
    truePos: [60, 10 + 57 * i],
    vel: [0, 0],
    force: [0, 0],
    numElectrons: 1,
    numProtons: 0,
    radius: 1,
    charge: -1,
    stationary: true,
    temperature: 10000,
  };
}

numParticles = particles.length;
for (let i = 0; i < 10; i++) {
  particles[numParticles + i] = {
    index: numParticles + i,
    pos: [540, 10 + 57 * i],
    truePos: [540, 10 + 57 * i],
    vel: [0, 0],
    force: [0, 0],
    numElectrons: 1,
    numProtons: 0,
    radius: 1,
    charge: -1,
    stationary: true,
    temperature: 0,
  };
}

const calculateDistance = (p1, p2) => {
  return Math.sqrt((p1.pos[0] - p2.pos[0]) ** 2 + (p1.pos[1] - p2.pos[1]) ** 2);
};

const updateParticleBetter = (particle, particles) => {
  const electrostaticPotential = 0;
};

const updateParticle = (particle, particles) => {
  const totalForce = [0, 0];
  for (let i = 0; i < particles.length; i++) {
    if (particle.stationary || particle.index == i) {
      continue;
    }
    const particle2 = particles[i];
    const distance = [
      particle.pos[0] - particle2.pos[0],
      particle.pos[1] - particle2.pos[1],
    ];
    distance[2] = Math.sqrt(distance[0] ** 2 + distance[1] ** 2);
    const force = [0, 0, 1 / distance[2] ** 2];
    force[0] = force[2] * (distance[0] / distance[2]);
    force[1] = force[2] * (distance[1] / distance[2]);

    totalForce[0] += force[0];
    totalForce[1] += force[1];
  }

  const forceMult = 10000;

  particle.vel[0] += totalForce[0] * forceMult;
  particle.vel[1] += totalForce[1] * forceMult;

  let dampening = 0.99;
  particle.vel[0] *= dampening;
  particle.vel[1] *= dampening;

  particle.truePos[0] += particle.vel[0] / 100;
  particle.truePos[1] += particle.vel[1] / 100;

  particle.pos[0] =
    particle.truePos[0] + ((Math.random() - 0.5) * particle.temperature) / 200;
  particle.pos[1] =
    particle.truePos[1] + ((Math.random() - 0.5) * particle.temperature) / 200;
  // const distance = calculateDistance(particle, particle2);
  // const force = 1 / totalDistance ** 2;
  // particle.pos[0] =
  //   particle.pos[0] + force * (particle.pos[0] - particle2.pos[0]);
};

const nextTick = () => {
  ctx.clearRect(0, 0, 500, 500);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 500, 500);
  for (let i = 0; i < particles.length; i++) {
    updateParticle(particles[i], particles);
  }
  for (let i = 0; i < particles.length; i++) {
    draw(particles[i]);
  }
  requestAnimationFrame(nextTick);
};
nextTick();

document.addEventListener("mousemove", (event) => {
  let mouseX = (event.pageX / window.innerWidth) * 2 - 1;
  let mouseY = 1 - (event.pageY / window.innerHeight) * 2;
  // console.log(`mouseX=${mouseX}, mouseY=${mouseY}`);
});

// =======================================================
// =======================================================
// =======================================================

// aka while(true) in processing
/*
const update = () => {
  requestAnimationFrame(update);
};
update();
*/

// const atom = (x, y, c) => {
//   return { x: x, y: y, vx: 0, vy: 0, color: c };
// };
// const random = () => {
//   return Math.random() * 400 + 50;
// };
// const create = (number, color) => {
//   group = [];
//   for (let i = 0; i < number; i++) {
//     group.push(atom(random(), random(), color));
//     atoms.push(group[i]);
//   }
//   return group;
// };
// const rule = (atoms1, atoms2, g) => {
//   for (let i = 0; i < atoms1.length; i++) {
//     fx = 0;
//     fy = 0;
//     for (let j = 0; j < atoms2.length; j++) {
//       a = atoms1[i];
//       b = atoms2[j];
//       dx = a.x - b.x;
//       dy = a.y - b.y;
//       d = Math.sqrt(dx * dx + dy * dy);
//       if (d > 0) {
//         F = (g * 1) / (d * d * d);
//         F = Math.min(F, 0.01);
//         fx += F * dx;
//         fy += F * dy;
//       }
//     }
//     a.vx = (a.vx + fx) * 0.98;
//     a.vy = (a.vy + fy) * 0.98;
//     a.x += a.vx;
//     a.x = Math.max(a.x, 0);
//     a.x = Math.min(a.x, 495);
//     a.y += a.vy;
//     a.y = Math.max(a.y, 0);
//     a.y = Math.min(a.y, 495);
//     if (a.x <= 0) {
//       a.x = 0 + Math.random() / 10;
//       a.vx *= -1;
//     }
//     if (a.x >= 495) {
//       a.x = 495 - Math.random() / 10;
//       a.vx *= -1;
//     }
//     if (a.y <= 0) {
//       a.y = 0 + Math.random() / 10;
//       a.vy *= -1;
//     }
//     if (a.y >= 495) {
//       a.y = 495 - Math.random() / 10;
//       a.vy *= -1;
//     }
//   }
// };
// const wall = (x, y, w, h) => {};
// const yellow = create(1000, "yellow");
// //red = create(200, "red");
// //green = create(100, "green");
// // rule(yellow, yellow, 25);
