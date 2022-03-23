import * as THREE from "three";
import { initCube, rotateCube } from "./cube";
import { initScenery, initLines, updateLines, initFloor } from "./scenenery";
// @ts-ignore
import hardwoodFloor from "./textures/hardwood_floor.png";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

// Camera stuff
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.y = 1;
//camera.position.y = 0;
camera.position.z = 5.1;
let camera_velocity_x = 0;
let camera_velocity_y = 0;
let camera_velocity_z = 0;
var camera_braking = 0.95;
var camera_damping = 100;
var camera_v_max = 0.5 / camera_braking;

let line = initLines(scene);
let cube = initCube(scene);
//let floor = initFloor(scene);
initFloor(scene);

// let scenery = initScenery(scene);
// let floor = scenery[0]
// let line = scenery[1]

function init() {
  const loader = new GLTFLoader();
  loader.load(
    "./textures/SpooeyEk.glb",
    function (gltf) {
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function animate() {
  rotate_camera(0, -wheel_x_rot / 300, 0);
  wasd_camera();
  move_camera();
  rotateCube(cube, mouseX, mouseY, camera);
  line = updateLines(line, scene, camera);

  //sphere_stuff();
  //electron_stuff();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();
//let scenery = initScenery(scene);
//let floor = scenery[0];
//let lines = scenery[1];

function rotate_camera(x, y, z): void {
  camera.rotation.x = x;
  camera.rotation.y = y;
  camera.rotation.z = z;
}
function wasd_camera() {
  if (w_down) {
    camera_velocity_z -=
      ((camera_v_max + camera_velocity_z) / camera_damping) *
      Math.cos(camera.rotation.y);
    camera_velocity_x -=
      ((camera_v_max + camera_velocity_x) / camera_damping) *
      Math.sin(camera.rotation.y);
  }
  if (s_down) {
    camera_velocity_z +=
      ((camera_v_max + camera_velocity_z) / camera_damping) *
      Math.cos(camera.rotation.y);
    camera_velocity_x +=
      ((camera_v_max + camera_velocity_x) / camera_damping) *
      Math.sin(camera.rotation.y);
  }
  if (a_down) {
    camera_velocity_z -=
      ((camera_v_max + camera_velocity_z) / camera_damping) *
      Math.sin(-camera.rotation.y);
    camera_velocity_x -=
      ((camera_v_max + camera_velocity_x) / camera_damping) *
      Math.cos(-camera.rotation.y);
  }
  if (d_down) {
    camera_velocity_z +=
      ((camera_v_max + camera_velocity_z) / camera_damping) *
      Math.sin(-camera.rotation.y);
    camera_velocity_x +=
      ((camera_v_max + camera_velocity_x) / camera_damping) *
      Math.cos(-camera.rotation.y);
  }
}
function move_camera() {
  camera_velocity_z = camera_velocity_z * camera_braking;
  camera_velocity_x = camera_velocity_x * camera_braking;

  min_camera_velocity();

  camera.position.x += camera_velocity_x;
  camera.position.y += camera_velocity_y;
  camera.position.z += camera_velocity_z;
}
function min_camera_velocity() {
  if (Math.abs(camera_velocity_x) < 0.000001) {
    camera_velocity_x = 0;
  }
  if (Math.abs(camera_velocity_y) < 0.000001) {
    camera_velocity_y = 0;
  }
  if (Math.abs(camera_velocity_z) < 0.000001) {
    camera_velocity_z = 0;
  }
}

// Sphere stuff
let num_spheres = 0;
let spheres = [];
for (let i = 0; i < num_spheres; i++) {
  const sphere_geometry = new THREE.SphereGeometry(0.1, 32, 16);
  const sphere_material = new THREE.MeshBasicMaterial({
    color: rando(0, 0xffffff),
  });
  let sphere = new THREE.Mesh(sphere_geometry, sphere_material);
  spheres.push(sphere);
  scene.add(sphere);
}
function sphere_stuff() {
  for (let i = 0; i < num_spheres; i++) {
    spheres[i].position.x = spheres[i].position.x + rando(-0.1, 0.1);
    spheres[i].position.y = spheres[i].position.y + rando(-0.1, 0.1);
    spheres[i].position.z = spheres[i].position.z + rando(-0.1, 0.1);
  }
}
function rando(min, max) {
  let val = Math.random();
  val *= max - min;
  val += min;
  return val;
}

// Medium stuff
// const medium_texture = new THREE.TextureLoader().load(
// copper;
// );
// const medium_geometry = new THREE.PlaneGeometry(3, 3);
// const medium_material = new THREE.MeshBasicMaterial({
//   map: medium_texture,
//   side: THREE.DoubleSide,
// });
// const medium = new THREE.Mesh(medium_geometry, medium_material);
// scene.add(medium);
// medium.rotation.x = 0 * (Math.PI / 180);
// medium.position.y = 0;

// // Electrons
// class Electron {
//   constructor(geometry, velocity_x, velocity_y) {
//     this.geometry = geometry;
//     this.velocity_x = velocity_x;
//     this.velocity_y = velocity_y;
//   }
// }
// class Electrons {
//   constructor() {
//     this.electrons = [];
//   }
//   newElectron(geometry, velocity_x, velocity_y) {
//     let e = new Electron(geometry, velocity_x, velocity_y);
//     this.electrons.push(e);
//     return e;
//   }
//   get numOfElectrons() {
//     return this.electrons.length;
//   }
//   updateElectrons() {
//     electron_stuff();
//   }
// }
// let num_electrons = 10; // Square edge count
// let e = new Electrons();
// for (let i = 0; i < num_electrons; i++) {
//   for (let j = 0; j < num_electrons; j++) {
//     const electron_geometry = new THREE.SphereGeometry(0.02, 32, 16);
//     const electron_material = new THREE.MeshBasicMaterial({
//       color: 0xffff00,
//     });
//     let geometry = new THREE.Mesh(electron_geometry, electron_material);
//     geometry.position.x = (i - num_electrons / 2) / 10;
//     geometry.position.y = (j - num_electrons / 2) / 10;

//     e.newElectron(geometry, 0, 0);
//     scene.add(geometry);
//   }
// }
// function electron_stuff() {
//   for (var i = 0; i < e.numOfElectrons; i++) {
//     for (var j = 0; j < e.numOfElectrons; j++) {
//       if (i != j) {
//         var force = calc_force(e.electrons[i], e.electrons[j]);

//         e.electrons[i].velocity_x += force[0];
//         e.electrons[i].velocity_y += force[1];
//       }
//     }
//   }
//   for (var i = 0; i < e.numOfElectrons; i++) {
//     e.electrons[i].geometry.position.x += e.electrons[i].velocity_x;
//     e.electrons[i].geometry.position.y += e.electrons[i].velocity_y;
//   }
// }

// function calc_distance(x1, y1, x2, y2) {
//   if (y1 == "a") {
//     return x1 - x2;
//   } else if (x1 == "a") {
//     return y1 - y2;
//   }
//   return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
// }

// function calc_force(electron1, electron2) {
//   var distance = calc_distance(
//     electron1.geometry.position.x,
//     electron1.geometry.position.y,
//     electron2.geometry.position.x,
//     electron2.geometry.position.y
//   );
//   var x_dis = calc_distance(
//     electron1.geometry.position.x,
//     "a",
//     electron2.geometry.position.x,
//     "a"
//   );
//   var y_dis = calc_distance(
//     "a",
//     electron1.geometry.position.y,
//     "a",
//     electron2.geometry.position.y
//   );
//   var x_force = x_dis / distance;
//   var y_force = y_dis / distance;
//   let force_scale = 1 / 1000000;
//   let force = [x_force * force_scale, y_force * force_scale];
//   return force;
// }

// function impedante_at(x, y) {
//   // rectangle at
//   //check_overlap()
// }

// function printSomething() {
//   console.log(e.numOfElectrons);
// }

// Helper variables
let mouseX = 0;
let mouseY = 0;
let wheel_y_rot = 0;
let wheel_x_rot = 0;
let w_down = false;
let a_down = false;
let s_down = false;
let d_down = false;

// var Element = function (id, x, y, z, ry) {
//   var div = document.createElement("div");
//   div.style.width = "320px";
//   div.style.height = "240px";
//   div.style.backgroundColor = "#000";
//   var iframe = document.createElement("iframe");
//   iframe.style.width = "320px";
//   iframe.style.height = "240px";
//   iframe.style.border = "0px";
//   iframe.src = [
//     "http://www.youtube.com/embed/",
//     id,
//     "?rel=0&mute=1&vq=small&autoplay=0",
//   ].join("");

//   div.appendChild(iframe);
//   var object = new CSS3DObject(div);
//   object.position.set(x, y, z);
//   object.rotation.y = ry;
//   console.log(object);
//   return object;
// };
//&autoplay=1
//"?rel=0&mute=1&vq=tiny",

// function init() {
//   var container = document.getElementById("container");

//   var group = new THREE.Group();
//   group.add(new Element("yvWXlN2gW8k", -250, -170, 0, 10));
//   group.add(new Element("UK_5YZZOtjE", 250, -170, 0, 20));
//   group.add(new Element("BzKqT9o3l2Q", -250, 170, 0, 30));
//   group.add(new Element("KXXNGYN0hJY", 250, 170, 0, 40));
//   scene.add(group);

//   window.addEventListener("resize", onWindowResize, false);

//   /* Road stuff */
//   // const geometry = new THREE.PlaneGeometry(100, 100);
//   // const material = new THREE.MeshBasicMaterial({
//   //   color: 0xffff00,
//   //   side: THREE.DoubleSide,
//   // });
//   // const plane = new THREE.Mesh(geometry, material);
//   // plane.position.x = 10;
//   // plane.position.y = 10;
//   // plane.position.z = 10;
//   // plane.rotation.x = 10;
//   // scene.add(plane);
// }

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onwheel = function (e) {
  if (e.ctrlKey) {
    // Your zoom/scale factor
    // camera.position.z -= e.deltaY * 0.01;
  } else {
    // Your trackpad X and Y positions
    for (var i = 0; i < e.touch; i++) {
      console.log(e.touch.pageX);
    }
    wheel_y_rot += e.deltaY;
    wheel_x_rot += e.deltaX;
    // camera.rotation.y -= e.deltaX * 0.005;
    // camera.rotation.x += e.deltaY * 0.005;
  }
};
window.addEventListener("keypress", function (event) {
  var name = event.key;
  var code = event.code;
  if (name == "d") {
    d_down = true;
  } else if (name == "s") {
    s_down = true;
  } else if (name == "a") {
    a_down = true;
  } else if (name == "w") {
    w_down = true;
  }
});
window.addEventListener("keyup", (event) => {
  var name = event.key;
  var code = event.code;
  if (name == "d") {
    d_down = false;
  } else if (name == "s") {
    s_down = false;
  } else if (name == "a") {
    a_down = false;
  } else if (name == "w") {
    w_down = false;
  }
});
window.addEventListener("mousemove", (event) => {
  mouseX = (event.pageX / window.innerWidth) * 2 - 1;
  mouseY = 1 - (event.pageY / window.innerHeight) * 2;
});
window.addEventListener("resize", (event) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// // Youtube stuff, fingers crossed
// //create css3dobject
// let element = document.createElement("iframe");
// element.src = ["https://www.youtube.com/embed/jh_ukt8g53c", "?rel=0"].join(""); //test url
// element.style.width = "200px";
// element.style.height = "150px";
// let cssObject = new THREE.CSS3DObject(element);
// cssObject.position.set(325, 50, 25); // = child.position;
// cssObject.rotation.set(0, 0, 0); // = child.rotation;
// cssObject.scale.x = 100;
// cssObject.scale.y = 100;
// cssObject.scale.z = 100;

// cssScene.add(cssObject);

// //setting renderer..
// renderer = new THREE.WebGLRenderer({
//   antialias: true,
//   alpha: true,
//   preserveDrawingBuffer: true,
// });
// renderer.domElement.style.background = "";
// renderer.domElement.style.zIndex = 0;
// renderer.setPixelRatio(window.devicePixelRatio);

// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;

// renderer.setClearColor(0x000000, 0);
// renderer.domElement.style.position = "absolute";
// renderer.autoClear = false;
// container.appendChild(renderer.domElement);

// cssRenderer = new THREE.CSS3DRenderer({ alpha: true });
// cssRenderer.setSize(window.innerWidth, window.innerHeight);
// cssRenderer.domElement.style.position = "absolute";
// cssRenderer.domElement.style.top = 0;

// document.body.appendChild(cssRenderer.domElement);
// cssRenderer.domElement.style.zIndex = 1;

// renderer.domElement.style.position = "absolute";
// renderer.domElement.style.top = 0;
// renderer.domElement.style.zIndex = 1;

// cssRenderer.domElement.appendChild(renderer.domElement);

// function render() {
//   cssRenderer.render(cssScene, camera);
//   renderer.render(scene, camera);
// }

animate();

// window.onwheel = function (e) {
//   if (e.ctrlKey) {
//     // Your zoom/scale factor
//     // camera.position.z -= e.deltaY * 0.01;
//   } else {
//     // Your trackpad X and Y positions
//     for (var i = 0; i < e.touch; i++) {
//       console.log(e.touch.pageX);
//     }
//     wheel_y_rot += e.deltaY;
//     wheel_x_rot += e.deltaX;
//     // camera.rotation.y -= e.deltaX * 0.005;
//     // camera.rotation.x += e.deltaY * 0.005;
//   }
// };

// window.addEventListener("mousemove", (event) => {
//   mouseX = (event.pageX / window.innerWidth) * 2 - 1;
//   mouseY = 1 - (event.pageY / window.innerHeight) * 2;
// });

// window.addEventListener("mousemove", mousemove);
