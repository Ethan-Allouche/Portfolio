// Stage Enedis : un départ HTA, trois tronçons, un défaut à isoler puis à réalimenter.
import { THREE, mat, box, rbox, cyl, sph, cone, tube, plane, at, grp, dyn, plate, glow, led, lerp, damp, rng } from '../kit.js';

const CLIENTS = [120, 85, 140];
const LIVE = { normal: [1, 1, 1], tripped: [0, 0, 0], isolated: [1, 0, 0], fed: [1, 0, 1], repair: [1, 0, 1] };
const DEMO = { normal: 4.5, tripped: 2.8, isolated: 2.8, fed: 3.2 };

export default function reseau(ctx) {
  const s = ctx.state;
  for (const k of ['fault', 'isolate', 'feed', 'repair']) s[k] ??= 0;
  s.out ||= {};

  const G = 0.24;
  const root = grp(plate(12, 8));
  root.add(at(rbox(11.5, G, 7.5, mat(0xa9bf9f, { roughness: 1 }), 0.08), 0, G / 2, 0));
  root.add(at(box(11.5, 0.02, 0.9, mat(0x70777a, { roughness: 0.9 })), 0, G + 0.011, 2.7));
  for (let k = 0; k < 10; k++) root.add(at(box(0.5, 0.01, 0.05, mat('white')), -5.1 + k * 1.13, G + 0.024, 2.7));

  // Matériaux d'état, un par tronçon.
  const wireMat = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0x2a2d2c, emissive: 0xffa51f, emissiveIntensity: 0, roughness: 0.5 }));
  const winMat = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0x29323a, emissive: 0xffd37a, emissiveIntensity: 0, roughness: 0.3 }));
  const wood = mat(0x8a6a45, { roughness: 0.9 });
  const TOP = G + 2.3;

  // Ligne aérienne sur poteaux.
  const P = [[-3.9, -2.5], [-2.5, -1.6], [-1.1, -2.0], [0.3, -1.4], [1.7, -2.0], [3.1, -1.5], [4.4, -2.3]];
  P.forEach(([x, z]) => {
    root.add(at(cyl(0.065, 2.3, wood, 10, 0.045), x, G + 1.15, z), at(box(0.07, 0.07, 0.95, wood), x, TOP - 0.1, z));
    for (const dz of [-0.38, 0, 0.38]) root.add(at(cyl(0.035, 0.13, mat('ivory'), 8), x, TOP, z + dz));
  });
  const span = (a, b, m, y = TOP + 0.06, spread = 0.38) => {
    for (const dz of [-spread, 0, spread]) root.add(tube([[a[0], y, a[1] + dz], [(a[0] + b[0]) / 2, y - 0.17, (a[1] + b[1]) / 2 + dz], [b[0], y, b[1] + dz]], 0.014, m, 10, 5));
  };
  for (let k = 0; k < 6; k++) span(P[k], P[k + 1], wireMat[(k / 2) | 0]);

  // Postes sources.
  function source(x, z) {
    root.add(at(box(1.8, 0.06, 1.5, mat('concrete')), x, G + 0.03, z));
    root.add(at(rbox(0.8, 0.8, 0.55, mat('dgrey'), 0.05), x - 0.3, G + 0.46, z));
    for (const dx of [-0.2, 0, 0.2]) root.add(at(cyl(0.05, 0.36, mat('ivory'), 8), x - 0.3 + dx, G + 1.04, z));
    for (const dz of [-0.33, 0.33]) for (let k = 0; k < 5; k++) root.add(at(box(0.05, 0.55, 0.06, mat('dgrey')), x - 0.6 + k * 0.15, G + 0.45, z + dz));
    root.add(at(box(0.55, 0.6, 0.6, mat('white')), x + 0.5, G + 0.33, z), at(box(0.65, 0.07, 0.7, mat('red')), x + 0.5, G + 0.66, z));
  }
  source(-5.0, -2.9);
  source(5.0, -3.1);
  const feedA = new THREE.MeshStandardMaterial({ color: 0x2a2d2c, emissive: 0xffa51f, emissiveIntensity: 1.6, roughness: 0.5 });
  root.add(tube([[-5.3, G + 1.2, -2.9], [-4.6, TOP - 0.2, -2.7], [P[0][0], TOP + 0.06, P[0][1]]], 0.014, feedA, 10, 5));
  root.add(tube([[4.7, G + 1.2, -3.1], [4.6, TOP - 0.25, -2.7], [P[6][0], TOP + 0.06, P[6][1]]], 0.014, feedA, 10, 5));

  // Interrupteurs télécommandés.
  const switches = [2, 4, 6].map((k) => {
    const [x, z] = P[k];
    root.add(at(rbox(0.28, 0.36, 0.22, mat('grey'), 0.03), x, G + 1.45, z + 0.14), at(cyl(0.012, 0.4, mat('black'), 5), x + 0.1, G + 1.8, z + 0.14));
    const l = at(led(0x35e07d, 0.075), x, G + 1.5, z + 0.27);
    root.add(l);
    return l;
  });

  // Villages : maisons, fenêtres et petit transformateur de quartier.
  const rnd = rng(11);
  const villages = [[-2.7, 0.5], [0.3, 0.9], [3.4, 0.6]];
  villages.forEach(([vx, vz], sec) => {
    for (let k = 0; k < 5; k++) {
      const x = vx + (k % 3) * 0.95 - 0.95 + rnd() * 0.2, z = vz + ((k / 3) | 0) * 1.05 - 0.4 + rnd() * 0.2;
      const w = 0.62 + rnd() * 0.2;
      root.add(at(box(w, 0.48, 0.58, mat('white')), x, G + 0.24, z));
      root.add(at(cone(w * 0.78, 0.38, mat(k % 2 ? 0xb5553c : 0xa2472f, { roughness: 0.8 }), 4), x, G + 0.67, z, 0, Math.PI / 4, 0));
      for (const dx of [-0.15, 0.15]) {
        const win = at(plane(0.13, 0.16, winMat[sec]), x + dx, G + 0.27, z + 0.292);
        win.userData.noShadow = true;
        root.add(win);
      }
    }
    const px = vx, pz = vz - 1.15;
    root.add(at(cyl(0.05, 1.7, wood, 8), px, G + 0.85, pz), at(cyl(0.13, 0.3, mat('grey'), 12), px + 0.16, G + 1.45, pz));
    const near = P[sec * 2 + 1];
    root.add(tube([[px, G + 1.7, pz], [(px + near[0]) / 2, G + 1.85, (pz + near[1]) / 2], [near[0], TOP, near[1]]], 0.012, wireMat[sec], 8, 5));
  });

  // Arbres.
  for (const [x, z, h] of [[-4.6, 1.2, 1], [-0.9, -0.4, 0.8], [1.9, 1.5, 1.1], [5.0, 1.1, 0.9], [2.2, -3.2, 1], [-1.5, -3.3, 0.9], [5.2, -0.9, 0.8], [-5.2, -0.6, 0.9]]) {
    root.add(at(cyl(0.06, 0.4 * h, wood, 6), x, G + 0.2 * h, z), at(cone(0.36 * h, 0.9 * h, mat('green'), 8), x, G + 0.8 * h, z));
  }

  // Le défaut : un arbre tombé sur la ligne, entre les poteaux 3 et 4.
  const FX = (P[2][0] + P[3][0]) / 2, FZ = (P[2][1] + P[3][1]) / 2;
  const fault = dyn(at(grp(), FX, G, FZ));
  fault.add(at(cyl(0.09, 2.5, wood, 8), 0.1, 1.05, 0.5, 1.0, 0, 0.25), at(cone(0.5, 1.2, mat('green'), 8), 0.32, 1.9, -0.25, 1.0, 0, 0.25));
  const alarm = at(led(0xff4a3d, 0.1), 0, 2.75, 0);
  const spark = at(glow(0xfff0a0, 1.4, 0), 0.25, 2.2, -0.1);
  fault.add(alarm, spark);
  root.add(fault);

  // Camionnette d'intervention.
  const van = dyn(at(grp(), -5, G + 0.02, 2.7));
  van.add(at(rbox(0.95, 0.42, 0.46, mat('blue'), 0.06), 0, 0.36, 0), at(rbox(0.3, 0.2, 0.42, mat(0x1c2a36, { roughness: 0.2 }), 0.03), 0.28, 0.5, 0));
  for (const dx of [-0.3, 0.3]) for (const dz of [-0.24, 0.24]) van.add(at(cyl(0.11, 0.07, mat('rubber'), 12), dx, 0.11, dz, Math.PI / 2));
  const beacon = at(led(0xffb829, 0.06), -0.1, 0.62, 0);
  van.add(beacon);
  root.add(van);

  // Énergie qui circule sur les tronçons sous tension.
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xffd060 });
  const beads = [0, 1, 2].flatMap((sec) => [0, 1].map((k) => {
    const b = dyn(sph(0.055, beadMat, 8));
    b.add(glow(0xffc040, 0.6, 0.9));
    root.add(b);
    return { b, sec, off: k / 2 };
  }));

  let phase = 'normal', clock = 0, outage = 0, repairT = 0, vanX = -5;
  const live = [1, 1, 1];
  const seen = { fault: s.fault, isolate: s.isolate, feed: s.feed, repair: s.repair };
  const NEXT = { fault: ['normal', 'tripped'], isolate: ['tripped', 'isolated'], feed: ['isolated', 'fed'], repair: ['fed', 'repair'] };
  const go = (p) => {
    phase = p;
    clock = 0;
    if (p === 'tripped') outage = 0;
    if (p === 'repair') repairT = 0;
  };

  function update(dt, t) {
    for (const k in NEXT) {
      if (s[k] !== seen[k]) {
        seen[k] = s[k];
        if (phase === NEXT[k][0]) go(NEXT[k][1]);
      }
    }
    clock += dt;
    if (!s.user && DEMO[phase] && clock > DEMO[phase]) go({ normal: 'tripped', tripped: 'isolated', isolated: 'fed', fed: 'repair' }[phase]);

    const stopX = FX + 0.2;
    if (phase === 'repair') {
      repairT += dt;
      vanX = Math.min(stopX, vanX + dt * 2.6);
      if (repairT > 5.2) go('normal');
    } else if (phase === 'normal') vanX = Math.max(-5, vanX - dt * 2.6);
    van.position.x = vanX;
    van.rotation.y = phase === 'normal' && vanX > -4.99 ? Math.PI : 0;
    beacon.userData.set(phase === 'repair' && Math.sin(t * 10) > 0);

    const want = LIVE[phase];
    let cut = 0;
    for (let k = 0; k < 3; k++) {
      live[k] = damp(live[k], want[k], 7, dt);
      wireMat[k].emissiveIntensity = live[k] * 1.6;
      winMat[k].emissiveIntensity = live[k] * 2.2;
      if (!want[k]) cut += CLIENTS[k];
    }
    if (cut) outage += dt;

    const broken = phase !== 'normal';
    fault.visible = broken;
    alarm.userData.set(broken && Math.sin(t * 8) > 0);
    spark.userData.level = phase === 'tripped' ? 0.5 + 0.5 * Math.sin(t * 31) * Math.sin(t * 17) : 0;
    const open = phase === 'isolated' || phase === 'fed' || phase === 'repair';
    switches[0].userData.set(true, open ? 0xff4a3d : 0x35e07d);
    switches[1].userData.set(true, open ? 0xff4a3d : 0x35e07d);
    switches[2].userData.set(true, phase === 'fed' || phase === 'repair' ? 0x35e07d : 0xff4a3d);

    for (const d of beads) {
      d.b.visible = want[d.sec] > 0;
      let u = (t * 0.5 + d.off) % 1;
      if (d.sec === 2 && (phase === 'fed' || phase === 'repair')) u = 1 - u; // alimenté par l'autre poste
      const k = d.sec * 2 + (u < 0.5 ? 0 : 1);
      const v = u < 0.5 ? u * 2 : u * 2 - 1;
      d.b.position.set(lerp(P[k][0], P[k + 1][0], v), TOP + 0.06 - 0.17 * Math.sin(Math.PI * v), lerp(P[k][1], P[k + 1][1], v));
    }

    const o = s.out;
    o.cut = cut;
    o.time = Math.round(outage);
    o.st = { normal: '@normal', tripped: '@tripped', isolated: '@isolated', fed: '@fed', repair: '@repairing' }[phase];
    o.phase = phase;
  }

  return { group: root, update, foot: [12, 8], height: 2.9, yaw: -0.42, pitch: 0.5 };
}
