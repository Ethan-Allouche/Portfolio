// Robot détecteur d'obstacles : pilotage différentiel, mode manuel ou autonome.
import { THREE, mat, box, rbox, cyl, sph, cone, tor, tube, at, grp, dyn, plate, screen, clamp, lerp, damp, every } from '../kit.js';

const BX = 4.95, BZ = 3.05, BODY = 0.68, RANGE = 3;

export default function robot(ctx) {
  const s = ctx.state;
  s.mode ??= 'auto';
  s.drive ??= '';
  s.out ||= {};

  const root = grp(plate(11.6, 7.8));
  for (const [w, d, x, z] of [[10.9, 0.05, 0, 3.5], [10.9, 0.05, 0, -3.5], [0.05, 7.05, 5.45, 0], [0.05, 7.05, -5.45, 0]]) root.add(at(box(w, 0.012, d, mat('grey')), x, 0.007, z));

  // Obstacles (x, z, rayon).
  const obstacles = [];
  const put = (x, z, r, ...meshes) => {
    obstacles.push([x, z, r]);
    root.add(at(grp(...meshes), x, 0, z));
  };
  put(-2.3, -1.5, 0.82, at(rbox(1.15, 1.0, 1.15, mat('card'), 0.03), 0, 0.5, 0, 0, 0.4, 0), at(box(1.17, 0.012, 0.12, mat(0xa98450)), 0, 1.0, 0, 0, 0.4, 0));
  put(2.3, 1.45, 0.86, at(rbox(1.35, 0.17, 0.95, mat('blue'), 0.03), 0, 0.085, 0, 0, 0.2, 0), at(rbox(1.25, 0.15, 0.9, mat('red'), 0.03), 0.03, 0.245, 0, 0, -0.15, 0), at(rbox(1.15, 0.14, 0.85, mat('ivory'), 0.03), 0, 0.39, 0, 0, 0.35, 0));
  put(0.45, -1.95, 0.46, at(box(0.8, 0.06, 0.8, mat('black')), 0, 0.03, 0), at(cone(0.3, 0.95, mat('orange'), 20), 0, 0.53, 0), at(tor(0.17, 0.035, mat('white')), 0, 0.5, 0, Math.PI / 2));
  put(-0.5, 2.05, 0.4, at(cyl(0.34, 0.9, mat('steel'), 24), 0, 0.45, 0), at(cyl(0.345, 0.3, mat('red'), 24), 0, 0.45, 0));
  put(3.65, -1.55, 0.62, at(rbox(0.9, 0.9, 0.9, mat('yellow'), 0.06), 0, 0.45, 0, 0, 0.7, 0));
  put(-4.0, 1.7, 0.46, at(sph(0.44, mat('green'), 24), 0, 0.44, 0));

  // Le robot (l'avant est vers +x).
  const bot = dyn(grp());
  bot.add(at(cyl(0.62, 0.2, mat('white'), 32), 0, 0.3, 0), at(cyl(0.635, 0.06, mat('red'), 32), 0, 0.3, 0));
  const wheels = [-0.63, 0.63].map((z) => {
    const w = dyn(at(grp(cyl(0.27, 0.12, mat('rubber'), 20), cyl(0.12, 0.13, mat('white'), 12), at(box(0.06, 0.135, 0.4, mat('grey')), 0, 0, 0)), 0, 0.27, z, Math.PI / 2));
    bot.add(w);
    return w;
  });
  bot.add(at(sph(0.09, mat('steel'), 10), 0.45, 0.09, 0), at(sph(0.09, mat('steel'), 10), -0.45, 0.09, 0));
  for (const a of [0.6, 2.6, 4.6]) bot.add(at(cyl(0.03, 0.12, mat('gold'), 6), Math.cos(a) * 0.42, 0.46, Math.sin(a) * 0.42));
  bot.add(at(cyl(0.52, 0.03, mat('pcb'), 28), 0, 0.53, 0));
  bot.add(at(rbox(0.58, 0.05, 0.4, mat('pcbBlue'), 0.02), -0.12, 0.57, 0.04), at(box(0.5, 0.06, 0.04, mat('black')), -0.12, 0.62, 0.21), at(box(0.5, 0.06, 0.04, mat('black')), -0.12, 0.62, -0.13), at(box(0.12, 0.09, 0.12, mat('steel')), -0.42, 0.6, 0.04));
  bot.add(at(box(0.28, 0.03, 0.28, mat('red')), 0.05, 0.56, -0.33), at(box(0.12, 0.2, 0.1, mat('black')), 0.05, 0.66, -0.36));
  bot.add(at(rbox(0.26, 0.34, 0.76, mat(0x2b50cf, { roughness: 0.6 }), 0.05), 0.46, 0.78, 0));
  for (const z of [-0.19, 0.19]) bot.add(at(cyl(0.11, 0.1, mat('steel'), 20), 0.6, 0.82, z, 0, 0, Math.PI / 2), at(cyl(0.085, 0.11, mat('black'), 16), 0.6, 0.82, z, 0, 0, Math.PI / 2));
  for (const sz of [-1, 1]) bot.add(at(box(0.08, 0.08, 0.14, mat('black')), 0.5, 0.6, sz * 0.44, 0, -sz * 0.5, 0));
  const lcd = screen(0.62, 0.26, 160, 64);
  const lcdHolder = at(grp(at(rbox(0.72, 0.36, 0.06, mat('pcbBlue'), 0.02), 0, 0, -0.04), lcd.mesh), -0.34, 0.86, 0, 0, -Math.PI / 2, 0);
  lcdHolder.children[0].rotation.x = lcd.mesh.rotation.x = -0.75;
  bot.add(lcdHolder, at(cyl(0.012, 0.75, mat('steel'), 5), -0.3, 0.95, 0.36));
  bot.add(tube([[-0.05, 0.6, 0.2], [0.15, 0.85, 0.25], [0.4, 0.7, 0.2]], 0.014, mat('yellow'), 10, 5), tube([[-0.05, 0.6, -0.1], [0.2, 0.9, -0.2], [0.4, 0.72, -0.2]], 0.014, mat('orange'), 10, 5));

  // Faisceaux des capteurs.
  const fan = (half, op) => {
    const m = new THREE.MeshBasicMaterial({ color: 0x35c7e0, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false });
    const f = dyn(new THREE.Mesh(new THREE.CircleGeometry(1, 20, -half, half * 2), m));
    f.rotation.x = -Math.PI / 2;
    return f;
  };
  const beams = [[0, fan(0.24, 0.3)], [0.62, fan(0.09, 0.22)], [-0.62, fan(0.09, 0.22)]].map(([ang, mesh]) => {
    const holder = at(grp(mesh), 0.6, 0.52, 0, 0, -ang, 0);
    bot.add(holder);
    return { ang, mesh };
  });
  root.add(bot);

  // ----- simulation -----
  let x = -4, z = 0.2, th = 0.35, v = 0, w = 0, turn = 0;
  const dists = [RANGE, RANGE, RANGE];
  const cNear = new THREE.Color(0xff4a3d), cMid = new THREE.Color(0xffb829), cFar = new THREE.Color(0x35c7e0);

  function cast(ox, oz, a) {
    const dx = Math.cos(a), dz = Math.sin(a);
    let t = RANGE;
    if (dx > 1e-6) t = Math.min(t, (BX + BODY - ox) / dx);
    if (dx < -1e-6) t = Math.min(t, (-BX - BODY - ox) / dx);
    if (dz > 1e-6) t = Math.min(t, (BZ + BODY - oz) / dz);
    if (dz < -1e-6) t = Math.min(t, (-BZ - BODY - oz) / dz);
    for (const [cx, cz, r] of obstacles) {
      const px = cx - ox, pz = cz - oz;
      const proj = px * dx + pz * dz;
      if (proj < 0) continue;
      const d2 = px * px + pz * pz - proj * proj;
      if (d2 > r * r) continue;
      t = Math.min(t, proj - Math.sqrt(r * r - d2));
    }
    return Math.max(0, t);
  }
  const blocked = (nx, nz) => Math.abs(nx) > BX || Math.abs(nz) > BZ || obstacles.some(([cx, cz, r]) => Math.hypot(nx - cx, nz - cz) < r + BODY);
  const redraw = every(0.2);

  function update(dt, t, focus) {
    const fx = x + Math.cos(th) * 0.6, fz = z + Math.sin(th) * 0.6;
    beams.forEach((b, k) => { dists[k] = cast(fx, fz, th + b.ang); });
    const [dC, dL, dR] = dists;

    let tv, tw;
    if (s.mode === 'auto') {
      if (dC < 1.15 || dL < 0.55 || dR < 0.55) {
        if (!turn) turn = dL < dR ? -1 : 1; // on tourne vers le côté dégagé
        tw = turn * 2.0;
        tv = dC < 0.5 ? -0.25 : 0.2;
      } else {
        turn = 0;
        tv = 1.3;
        tw = clamp((dR - dL) * 0.3, -0.6, 0.6) + Math.sin(t * 0.7) * 0.15;
      }
    } else {
      turn = 0;
      tv = s.drive === 'f' ? 1.35 : s.drive === 'b' ? -1.0 : 0;
      tw = s.drive === 'l' ? -2.2 : s.drive === 'r' ? 2.2 : 0;
    }
    v = damp(v, tv, 7, dt);
    w = damp(w, tw, 9, dt);
    th += w * dt;
    const nx = x + Math.cos(th) * v * dt, nz = z + Math.sin(th) * v * dt;
    if (!blocked(nx, nz)) { x = nx; z = nz; } else v = 0;

    bot.position.set(x, 0, z);
    bot.rotation.y = -th;
    const vl = v + w * 0.63, vr = v - w * 0.63;
    wheels[0].rotation.y -= (vl / 0.27) * dt;
    wheels[1].rotation.y -= (vr / 0.27) * dt;
    beams.forEach((b, k) => {
      const d = Math.max(0.05, dists[k]);
      b.mesh.scale.set(d, d, 1);
      b.mesh.material.color.copy(d < 0.7 ? cNear : d < 1.4 ? cMid : cFar);
    });

    const cm = Math.round(dC * 40);
    if (focus && redraw(dt)) {
      const g = lcd.ctx;
      g.fillStyle = '#1740c8';
      g.fillRect(0, 0, 160, 64);
      g.fillStyle = '#eaf2ff';
      g.font = 'bold 24px monospace';
      g.fillText(s.mode === 'auto' ? 'MODE AUTO' : 'MODE MANU', 8, 26);
      g.fillText('D: ' + (dC >= RANGE ? '---' : cm) + ' cm', 8, 54);
      lcd.refresh();
    }
    const o = s.out;
    o.dist = dC >= RANGE ? '120+' : cm;
    o.pl = Math.round(clamp(vl / 1.4, -1, 1) * 100);
    o.pr = Math.round(clamp(vr / 1.4, -1, 1) * 100);
  }

  return { group: root, update, foot: [11.6, 7.8], height: 1.7, yaw: -0.36, pitch: 0.62 };
}
