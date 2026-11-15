// Stage Veolia : drone flottant qui cartographie les sédiments d'un émissaire.
import { THREE, mat, box, rbox, cyl, sph, tor, tube, at, grp, dyn, plate, glow, pool, lerp, env, rng } from '../kit.js';

const bump = (x, c, w) => Math.exp(-((x - c) ** 2) / (2 * w * w));
/** Hauteur du lit de sédiments le long de la galerie. */
const bed = (x) => 0.05 + 0.33 * bump(x, -2.5, 0.7) + 0.2 * bump(x, 0.6, 0.5) + 0.4 * bump(x, 3.1, 0.75) + 0.02 * Math.sin(x * 5);

export default function drone(ctx) {
  const s = ctx.state;
  s.run ??= true;
  s.reset ??= 0;
  s.out ||= {};

  const R = 2.7, L = 10.4, FLOOR = 0.3, WATER = 0.8, ZC = -0.4;
  const root = grp(plate(11.4, 7.4));

  // Galerie en coupe : voûte arrière, radier, eau.
  const arc = (r, m) => at(new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 44, 1, true, Math.PI * 0.44, Math.PI * 0.56), m), 0, FLOOR, ZC, 0, 0, Math.PI / 2);
  root.add(arc(R + 0.14, mat('concrete')), arc(R, mat(0x8f918b, { roughness: 1, side: THREE.BackSide })));
  for (const x of [-L / 2, -L / 6, L / 6, L / 2]) root.add(at(tor(R + 0.07, 0.13, mat('concrete'), Math.PI * 0.56), x, FLOOR, ZC, 0, Math.PI / 2, 0));
  root.add(at(box(L, FLOOR, 5.4, mat('concrete')), 0, FLOOR / 2, ZC));
  root.add(at(box(L - 0.04, WATER - FLOOR, 5.3, mat('water')), 0, (FLOOR + WATER) / 2, ZC));

  // Sédiments.
  const sg = new THREE.PlaneGeometry(L - 0.1, 5.2, 90, 10);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i);
    sp.setZ(i, bed(x) * (0.55 + 0.45 * Math.cos((y / 2.6) * 1.4)));
  }
  sg.computeVertexNormals();
  root.add(at(new THREE.Mesh(sg, mat('sludge')), 0, FLOOR + 0.005, ZC, -Math.PI / 2));

  // Filets d'eau en surface.
  const rnd = rng(7);
  const streakMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false });
  const streaks = Array.from({ length: 9 }, (_, k) => {
    const m = dyn(at(box(0.4, 0.006, 0.03, streakMat), 0, WATER + 0.012, ZC + lerp(-2.4, 2.4, rnd())));
    m.userData.off = k * 1.3 + rnd();
    root.add(m);
    return m;
  });

  // Le drone.
  const pvc = mat('pvc');
  const craft = dyn(grp());
  craft.add(at(cyl(0.25, 2.5, pvc, 28), 0, 0.02, 0, 0, 0, Math.PI / 2));
  for (const x of [-1.25, 1.25]) {
    const cap = at(sph(0.25, pvc, 20), x, 0.02, 0);
    cap.scale.x = 0.55;
    craft.add(cap);
  }
  for (const x of [-0.9, -0.3, 0.3, 0.9]) craft.add(at(tor(0.26, 0.03, mat('dgrey')), x, 0.02, 0, 0, Math.PI / 2, 0));
  craft.add(at(rbox(0.62, 0.3, 0.38, mat('black'), 0.04), -0.3, 0.4, 0));
  craft.add(at(rbox(0.5, 0.26, 0.34, mat('yellow'), 0.04), 0.45, 0.38, 0));
  craft.add(at(cyl(0.12, 0.22, mat('blue')), -0.95, 0.36, 0), at(cyl(0.1, 0.04, mat('white')), -0.95, 0.49, 0));
  craft.add(at(cyl(0.03, 1.3, mat('steel'), 10), -1.15, 0.85, 0));
  craft.add(tube([[-1.15, 1.5, 0], [-0.3, 1.64, 0], [0.7, 1.2, 0], [1.24, 0.3, 0]], 0.022, mat(0xc0359b, { roughness: 0.5 }), 40, 6));
  craft.add(at(cyl(0.09, 0.16, mat('steel')), 1.34, 0.3, 0, 0, 0, Math.PI / 2));
  for (const z of [-0.14, 0.14]) {
    craft.add(tube([[-0.5, -0.12, z], [-0.72, -0.24, z * 1.6], [-0.95, -0.28, z * 2]], 0.018, mat('black'), 12, 5));
    craft.add(at(cyl(0.05, 0.42, mat('steel'), 12), -1.14, -0.3, z * 2.1, 0, 0, Math.PI / 2 - 0.25));
  }
  const lamp = at(glow(0xffeccc, 1.3, 0.9), 1.5, 0.32, 0);
  const lit = at(pool(0xffe6b8, 3.2, 0.55), 2.3, 0.03, 0);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x45a8ea, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const beamH = FLOOR + R - WATER - 0.5;
  const beam = at(new THREE.Mesh(new THREE.ConeGeometry(0.42, beamH, 28, 1, true), beamMat), -0.95, 0.5 + beamH / 2, 0, Math.PI);
  craft.add(lamp, lit, beam);
  root.add(craft);

  // Profil mesuré : une colonne par point de mesure, révélée au passage du drone.
  const N = 56;
  const barGeo = new THREE.BoxGeometry(0.13, 1, 0.16).translate(0, 0.5, 0);
  const bars = dyn(new THREE.InstancedMesh(barGeo, new THREE.MeshStandardMaterial({ roughness: 0.5 }), N));
  bars.frustumCulled = false;
  const shown = new Float32Array(N);
  const tmp = new THREE.Object3D();
  const col = new THREE.Color();
  const cGood = new THREE.Color(0x2c9a57), cWarn = new THREE.Color(0xf0b400), cBad = new THREE.Color(0xcf362b);
  const barX = (k) => lerp(-4.95, 4.95, k / (N - 1));
  const cIdle = new THREE.Color(0x8b9297);
  const tint = (k) => {
    const h = bed(barX(k)) / 0.45;
    col.copy(cGood).lerp(cWarn, Math.min(1, h * 2));
    if (h > 0.5) col.lerp(cBad, (h - 0.5) * 2);
    bars.setColorAt(k, col.lerpColors(cIdle, col, shown[k]));
  };
  root.add(bars, at(box(10.3, 0.05, 0.32, mat('dgrey')), 0, 0.025, 3.05));

  let prog = 0, hold = 0, seenReset = s.reset;
  const X0 = -3.9, X1 = 3.9;

  function update(dt, t, focus) {
    if (s.reset !== seenReset) {
      seenReset = s.reset;
      prog = 0; hold = 0; shown.fill(0);
      s.run = true;
    }
    if (prog >= 1) {
      hold += dt;
      if (hold > 2.2 && s.run) { prog = 0; hold = 0; shown.fill(0); }
    } else if (s.run) prog = Math.min(1, prog + dt / 17);

    const x = lerp(X0, X1, prog);
    craft.position.set(x, WATER + Math.sin(t * 1.7) * 0.02, ZC);
    craft.rotation.x = Math.sin(t * 1.3) * 0.03;
    beamMat.opacity = 0.16 + 0.08 * Math.sin(t * 9);

    for (let k = 0; k < N; k++) {
      const bx = barX(k);
      if (bx < x - 0.9) shown[k] = Math.min(1, shown[k] + dt * 3.5);
      tmp.position.set(bx, 0.05, 3.05);
      tmp.scale.set(1, 0.03 + shown[k] * (0.1 + bed(bx) * 3.3), 1);
      tmp.updateMatrix();
      bars.setMatrixAt(k, tmp.matrix);
      tint(k);
    }
    bars.instanceMatrix.needsUpdate = true;
    bars.instanceColor.needsUpdate = true;

    for (const m of streaks) m.position.x = ((t * 0.85 + m.userData.off * 1.15) % 10.2) - 5.1;

    if (focus) {
      const p = root.position;
      ctx.world.light(p.x + x + 1.1, WATER + 1.3, p.z + ZC, 0xffe8c0, lerp(2, 12, env.night));
    }
    const o = s.out;
    o.pos = Math.round(prog * 6400);
    o.air = (2.2 + 0.02 * Math.sin(t * 2.3)).toFixed(2);
    o.sed = Math.round(bed(x - 1.1) * 100);
    o.bat = (8 - prog * 0.9).toFixed(1);
  }

  return { group: root, update, foot: [11.4, 7.4], height: 3.2, yaw: -0.52, pitch: 0.4 };
}
