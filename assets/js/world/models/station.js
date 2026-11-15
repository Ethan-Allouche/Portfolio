// Station d'épuration : pompage et dégrillage pilotés par automate, variateurs en Modbus.
import { THREE, mat, box, rbox, cyl, sph, tor, tube, at, grp, dyn, plate, glow, led, screen, clamp, every } from '../kit.js';

export default function station(ctx) {
  const s = ctx.state;
  s.mode ??= 'auto';
  s.pump ??= false;
  s.screen ??= false;
  s.hz ??= 40;
  s.fault ??= false;
  s.out ||= {};

  const root = grp(plate(11.8, 7.6));
  const wall = mat(0xe3e4df, { roughness: 0.95 });
  const alu = mat('alu');
  const T = 0.18;

  function basin(w, h, d, x, z) {
    const g = at(grp(), x, 0, z);
    g.add(at(box(w, T, d, wall), 0, T / 2, 0));
    g.add(at(box(w, h, T, wall), 0, h / 2, d / 2 - T / 2), at(box(w, h, T, wall), 0, h / 2, -d / 2 + T / 2));
    g.add(at(box(T, h, d - 2 * T, wall), w / 2 - T / 2, h / 2, 0), at(box(T, h, d - 2 * T, wall), -w / 2 + T / 2, h / 2, 0));
    root.add(g);
  }
  function water(w, d, x, z) {
    const m = dyn(new THREE.Mesh(new THREE.BoxGeometry(w - 2 * T - 0.02, 1, d - 2 * T - 0.02).translate(0, 0.5, 0), mat('water')));
    root.add(at(m, x, T, z));
    return m;
  }
  const AX = -3.7, BX = 2.3, Z = -0.5;
  basin(3.6, 1.5, 3.4, AX, Z);
  basin(2.7, 0.85, 1.4, -0.55, Z);
  basin(2.6, 1.5, 2.8, BX, Z);
  const wA = water(3.6, 3.4, AX, Z);
  const wB = water(2.6, 2.8, BX, Z);
  const wC = water(2.7, 1.4, -0.55, Z);
  wC.scale.y = 0.42;

  // Dégrilleur : grille inclinée et râteaux entraînés par un motoréducteur.
  const P0 = [-1.3, 0.3], P1 = [0.2, 2.1];
  const slope = Math.atan2(P1[1] - P0[1], P1[0] - P0[0]);
  const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
  const mid = [(P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2];
  for (const dz of [-0.5, 0.5]) {
    root.add(at(box(len, 0.08, 0.08, alu), mid[0], mid[1], Z + dz, 0, 0, slope));
    root.add(at(box(0.08, P1[1], 0.08, alu), P1[0], P1[1] / 2, Z + dz));
  }
  for (let k = 0; k < 9; k++) root.add(at(cyl(0.014, len * 0.62, mat('steel'), 6), P0[0] + Math.cos(slope) * len * 0.31, P0[1] + Math.sin(slope) * len * 0.31, Z - 0.4 + k * 0.1, 0, 0, slope - Math.PI / 2));
  root.add(at(rbox(0.42, 0.42, 0.5, mat('grey'), 0.04), P1[0], P1[1] + 0.1, Z), at(cyl(0.16, 0.5, mat('blue')), P1[0], P1[1] + 0.1, Z + 0.5, Math.PI / 2));
  const rakes = Array.from({ length: 5 }, () => {
    const r = dyn(grp(box(0.07, 0.07, 0.92, mat('orange')), at(box(0.16, 0.03, 0.9, mat('orange')), 0.06, 0.04, 0)));
    r.rotation.z = slope;
    root.add(r);
    return r;
  });

  // Pompe de relevage sur le bac de pompage, et conduite de refoulement.
  root.add(at(box(2.6, 0.1, 0.34, alu), BX, 1.55, Z));
  root.add(at(cyl(0.3, 0.78, mat('blue'), 28), BX, 2.0, Z), at(cyl(0.26, 0.12, mat('dgrey')), BX, 2.45, Z));
  for (const y of [1.78, 1.93, 2.08, 2.23]) root.add(at(tor(0.31, 0.024, mat('blue')), BX, y, Z, Math.PI / 2));
  root.add(at(cyl(0.05, 1.2, mat('steel'), 10), BX, 0.95, Z), at(cyl(0.24, 0.4, mat('dgrey')), BX, 0.42, Z));
  const fan = dyn(at(box(0.44, 0.03, 0.07, mat('white')), BX, 2.53, Z));
  root.add(fan);
  root.add(tube([[BX + 0.2, 0.45, Z - 0.6], [BX + 0.25, 1.2, Z - 1.25], [BX + 0.2, 2.2, Z - 1.6], [BX - 0.6, 2.42, Z - 2.2], [-0.8, 2.42, Z - 2.3], [AX + 0.5, 2.38, Z - 2.2], [AX, 2.25, Z - 1.5], [AX, 1.86, Z - 1.1]], 0.11, mat('pvc'), 70, 10));
  root.add(at(cyl(0.16, 0.22, mat('orange')), 0.4, 2.42, Z - 2.28, 0, 0, Math.PI / 2), at(box(0.06, 0.3, 0.06, mat('red')), 0.4, 2.62, Z - 2.28));
  const jetMat = new THREE.MeshBasicMaterial({ color: 0x86d4ee, transparent: true, opacity: 0.85 });
  const jet = dyn(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1, 10).translate(0, -0.5, 0), jetMat), AX, 1.84, Z - 1.1));
  root.add(jet);

  // Armoire de commande : écran, voyants, colonne lumineuse.
  const CX = 4.75, CZ = -2.85;
  root.add(at(rbox(1.3, 1.9, 0.5, mat('grey'), 0.04), CX, 1.55, CZ), at(rbox(1.14, 1.74, 0.04, mat(0xc9cdc9, { roughness: 0.6 }), 0.02), CX, 1.55, CZ + 0.26));
  for (const dx of [-0.5, 0.5]) root.add(at(box(0.1, 0.6, 0.1, mat('dgrey')), CX + dx, 0.3, CZ));
  const hmi = screen(0.74, 0.46, 256, 160);
  root.add(at(hmi.mesh, CX, 1.98, CZ + 0.285), at(rbox(0.84, 0.56, 0.03, mat('black'), 0.01), CX, 1.98, CZ + 0.27));
  const pilot = { run: led(0x35e07d, 0.06), manu: led(0xffb829, 0.06), fault: led(0xff4a3d, 0.06) };
  root.add(at(pilot.run, CX - 0.3, 1.5, CZ + 0.29), at(pilot.manu, CX, 1.5, CZ + 0.29), at(pilot.fault, CX + 0.3, 1.5, CZ + 0.29));
  root.add(at(cyl(0.03, 0.34, mat('steel'), 8), CX + 0.4, 2.67, CZ));
  const tower = { g: led(0x35e07d, 0.11), a: led(0xffb829, 0.11), r: led(0xff4a3d, 0.11) };
  root.add(at(tower.g, CX + 0.4, 2.88, CZ), at(tower.a, CX + 0.4, 3.08, CZ), at(tower.r, CX + 0.4, 3.28, CZ));

  // Câbles Modbus et trames qui circulent dessus.
  const lines = [
    [[CX - 0.5, 0.62, CZ], [BX + 0.8, 0.08, CZ - 0.3], [BX + 0.9, 0.08, Z - 1.6], [BX + 0.5, 1.5, Z - 0.9], [BX + 0.1, 1.9, Z - 0.32]],
    [[CX - 0.5, 0.62, CZ], [1.2, 0.08, CZ - 0.2], [0.6, 0.08, Z - 0.9], [P1[0] + 0.1, 1.6, Z - 0.7], [P1[0], P1[1] + 0.1, Z - 0.28]],
  ].map((pts) => {
    root.add(tube(pts, 0.035, mat('black'), 50, 6));
    return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  });
  const beadMat = new THREE.MeshBasicMaterial({ color: 0x35e07d });
  const beads = [];
  lines.forEach((curve, li) => {
    for (let k = 0; k < 3; k++) {
      const b = dyn(sph(0.055, beadMat, 8));
      b.add(glow(0x35e07d, 0.5, 0.8));
      root.add(b);
      beads.push({ b, curve, off: k / 3 + li * 0.17, dir: k % 2 ? -1 : 1 });
    }
  });

  let level = 46, hz = 0, run = false, rake = 0, spin = 0;
  const redraw = every(0.2);
  const v = new THREE.Vector3();

  function update(dt, t, focus) {
    const auto = s.mode === 'auto';
    let pumpOn, screenOn;
    if (s.fault) pumpOn = screenOn = false;
    else if (auto) {
      if (level > 72) run = true;
      if (level < 22) run = false;
      pumpOn = screenOn = run;
      s.pump = s.screen = run;
    } else {
      pumpOn = !!s.pump;
      screenOn = !!s.screen;
      run = pumpOn;
    }
    hz += clamp((pumpOn ? s.hz : 0) - hz, -dt * 32, dt * 32);
    const flow = hz / 50;
    level = clamp(level + ((level < 97 ? 5.5 : 0) - 13 * flow) * dt, 3, 100);

    wB.scale.y = 0.12 + (level / 100) * 1.14;
    wA.scale.y = 1.2 - (level / 100) * 0.72;
    spin += flow * 22 * dt;
    fan.rotation.y = spin;
    jet.visible = flow > 0.04;
    jet.scale.set(0.5 + flow * 0.9, 1.84 - T - wA.scale.y, 0.5 + flow * 0.9);

    rake = (rake + (screenOn ? 0.16 : 0) * dt) % 1;
    rakes.forEach((r, k) => {
      const u = (rake + k / rakes.length) % 1;
      r.position.set(P0[0] + (P1[0] - P0[0]) * u, P0[1] + (P1[1] - P0[1]) * u + 0.06, Z);
    });

    const blink = Math.sin(t * 9) > 0;
    pilot.run.userData.set(hz > 1 && !s.fault);
    pilot.manu.userData.set(!auto);
    pilot.fault.userData.set(s.fault && blink);
    tower.g.userData.set(hz > 1 && !s.fault);
    tower.a.userData.set(!auto && !s.fault);
    tower.r.userData.set(s.fault && blink);

    for (const d of beads) {
      const u = (((t * 0.45 + d.off) % 1) + 1) % 1;
      d.curve.getPoint(d.dir > 0 ? u : 1 - u, v);
      d.b.position.copy(v);
    }

    if (focus && redraw(dt)) {
      const g = hmi.ctx;
      g.fillStyle = '#0d1513';
      g.fillRect(0, 0, 256, 160);
      g.strokeStyle = '#4c5a55';
      g.lineWidth = 3;
      g.strokeRect(18, 18, 50, 124);
      g.fillStyle = '#3aa6c9';
      g.fillRect(21, 21 + 118 * (1 - level / 100), 44, 118 * (level / 100));
      g.fillStyle = '#e4ece7';
      g.font = 'bold 46px sans-serif';
      g.fillText(hz.toFixed(1), 88, 76);
      g.font = '22px sans-serif';
      g.fillStyle = '#8fa39b';
      g.fillText('Hz', 206, 76);
      g.fillStyle = s.fault ? '#ff5a4d' : auto ? '#35e07d' : '#ffb829';
      g.fillRect(88, 100, 150, 38);
      g.fillStyle = '#0d1513';
      g.font = 'bold 24px sans-serif';
      g.fillText(s.fault ? 'DEFAUT' : auto ? 'AUTO' : 'MANU', 100, 128);
      hmi.refresh();
    }

    const o = s.out;
    o.level = Math.round(level);
    o.hz = hz.toFixed(1);
    o.bus = 'go';
    o.st = s.fault ? '@fault' : hz > 1 ? '@run' : '@stop';
  }

  return { group: root, update, foot: [11.8, 7.6], height: 3.4, yaw: -0.5, pitch: 0.42 };
}
