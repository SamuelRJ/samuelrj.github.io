import * as THREE from "three";
import { Camera } from "three";
import { cube_x_rot_offset, cube_y_rot_offset } from "./consts";
// @ts-ignore
import sqwubby from "./textures/sqwubby.png";

let cube_x_rot = 0;
let cube_y_rot = 0;
let cube_z_rot = 0;
let cubePosToX, cubePosToY, cubePosToZ;
let lookX, lookY, lookZ;
let look;
let oldLook;
let oldMousePosX, oldMousePosY;

export function initCube(scene: THREE.Scene) {
  const cube_texture = new THREE.TextureLoader().load(sqwubby);
  const cube_geometry = new THREE.BoxGeometry();
  const cubeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xffffff }), //right side
    new THREE.MeshBasicMaterial({ color: 0xffffff }), //left side
    new THREE.MeshBasicMaterial({ color: 0xffffff }), //top side
    new THREE.MeshBasicMaterial({ color: 0xffffff }), //top side
    new THREE.MeshBasicMaterial({ map: cube_texture }), //front side
    new THREE.MeshBasicMaterial({ color: 0xffffff }), //back side
  ];

  //create material, color, or image texture
  let cube = new THREE.Mesh(cube_geometry, cubeMaterials);
  scene.add(cube);
  // const cube_material = new THREE.MeshBasicMaterial({ map: cube_texture });
  // const cube_material = new THREE.MeshBasicMaterial({
  //   map: cube_texture,
  //   transparent: true,
  //   side: THREE.DoubleSide,
  // });
  // const cube = new THREE.Mesh(cube_geometry, cube_material);
  // scene.add(cube);
  cube.position.x = -0.25;
  cube.position.y = 1;
  cube.position.z = -0.25;
  cube.position.y = 3;
  lookX = -0.25;
  lookY = 1;
  look = new THREE.Vector3(lookX, lookY, lookZ);
  oldLook = look;
  return cube;
}

export function rotateCube(
  cube: THREE.Mesh,
  mouseX: number,
  mouseY: number,
  camera: THREE.Camera
) {
  // let attention =
  //   0.01 + 0.1 / Math.max(1, Math.sqrt(mouseX * mouseX + mouseY * mouseY));
  // let attention = 1;

  // if (Math.random() < attention) {
  //   look = newCoordinates(mouseX, mouseY, camera);
  // }
  // if (Math.abs(oldLook.lookX - look.lookX) < 1) {
  //   oldLook = look;
  // }
  // oldLook.x += (look.x - oldLook.x) / 5;
  // oldLook.y += (look.y - oldLook.y) / 5;

  // cube.lookAt(oldLook);
  lookX = camera.position.x + Math.sin(mouseX) * 5;
  // lookX += (oldLook.x - look.X) / 5;
  lookY = camera.position.y + mouseY * 5;
  // lookY += (oldLook.y - look.Y) / 5;
  lookZ = camera.position.z; //+ Math.sin(mouseX) * 5;
  // lookZ += (oldLook.z - look.Z) / 5;
  look = new THREE.Vector3(lookX, lookY, lookZ);
  oldLook.x -= (oldLook.x - look.x) / 20;
  oldLook.y -= (oldLook.y - look.y) / 20;
  oldLook.z -= (oldLook.z - look.z) / 20;
  cube.lookAt(oldLook);
}

// function newCoordinates(mouseX, mouseY, camera) {
//   const centerness = Math.sqrt(
//     Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2)
//   );
//   const knoddy = Math.max(0, -1 + centerness / 10);
//   lookX = mouseX / 2 + knoddy * mouseX - 0.25;
//   lookY = mouseY / 3 + knoddy * mouseY + 1;
//   // look = new THREE.Vector3(lookX, lookY, lookZ);
//   look = new THREE.Vector3(lookX, lookY, lookZ);
//   if (!oldLook) {
//     oldLook = look;
//   }
//   return camera.position;
// }
