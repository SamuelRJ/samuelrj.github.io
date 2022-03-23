import * as THREE from "three";
import { Scene } from "three";
// @ts-ignore
import hardwoodFloor from "./textures/hardwood_floor.png";

// Floor stuff
export function initScenery(scene: THREE.Scene) {
  let clump = [initFloor(scene), initLines(scene)];
  return clump;
}

export function initFloor(scene: THREE.Scene) {
  const floor_texture = new THREE.TextureLoader().load(hardwoodFloor);
  const floor_geometry = new THREE.PlaneGeometry(10, 10);
  const floor_material = new THREE.MeshBasicMaterial({
    map: floor_texture,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floor_geometry, floor_material);
  scene.add(floor);
  floor.rotation.x = 90 * (Math.PI / 180);
  floor.position.y = -0;
  return floor;
}

export function initLines(scene: THREE.Scene) {
  const line_material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });
  let points = [];
  points.push(new THREE.Vector3(-5, 0, -5));
  points.push(new THREE.Vector3(0, 5, 0));
  points.push(new THREE.Vector3(5, 0, 5));
  points.push(new THREE.Vector3(0, 5, 0));
  points.push(new THREE.Vector3(-5, 0, 5));
  points.push(new THREE.Vector3(0, 5, 0));
  points.push(new THREE.Vector3(5, 0, -5));
  let line_geometry = new THREE.BufferGeometry().setFromPoints(points);
  let line = new THREE.Line(line_geometry, line_material);
  scene.add(line);
  return line;
}

export function updateLines(
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  scene.remove(line);
  const camPos = camera.position;
  const line_material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });
  let centerness = Math.sqrt(Math.pow(camPos.x, 2) + Math.pow(camPos.z, 2));
  let centerWoah = Math.pow(centerness, 1.2) / 100;
  let randy = centerWoah;

  let rest = 5;
  let points = [];
  points = [];
  points.push(
    new THREE.Vector3(-randy * Math.random() - 5, 0, -randy * Math.random() - 5)
  );
  points.push(new THREE.Vector3(0, randy * Math.random() + 5, 0));
  points.push(
    new THREE.Vector3(randy * Math.random() + 5, 0, randy * Math.random() + 5)
  );
  points.push(new THREE.Vector3(0, randy * Math.random() + 5, 0));
  points.push(
    new THREE.Vector3(-randy * Math.random() - 5, 0, randy * Math.random() + 5)
  );
  points.push(new THREE.Vector3(0, randy * Math.random() + 5, 0));
  points.push(
    new THREE.Vector3(randy * Math.random() + 5, 0, -randy * Math.random() - 5)
  );
  let line_geometry = new THREE.BufferGeometry().setFromPoints(points);
  line = new THREE.Line(line_geometry, line_material);
  scene.add(line);
  return line;
}
