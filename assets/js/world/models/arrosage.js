// Arrosage hydroponique : dosage par moteurs pas à pas, mélange, puis arrosage.
import { THREE, mat, box, rbox, cyl, sph, tube, at, grp, dyn, plate, led, screen, clamp, lerp, damp, every } from '../kit.js';

export default function arrosage(ctx) {
  const s = ctx.state;
  s.speed ??= 2;
  s.qty ??= 800;
  s.start ??= 0;
  s.out ||= {};

  const root = grp(plate(11.6, 7.2));
  const alu = mat('alu');

  function tank(w, h, d, x, z) {
    const g = at(grp(), x, 0, z);
    const glass = mat('glass');
    g.add(at(box(w, 0.1, d, mat('dgrey')), 0, 0.05, 0));
    g.add(at(box(w, h, 0.05, glass), 0, h / 2 + 0.1, d / 2), at(box(w, h, 0.05, glass), 0, h / 2 + 0.1, -d / 2));
    g.add(at(box(0.05, h, d, glass), w / 2, h / 2 + 0.1, 0), at(box(0.05, h, d, glass), -w / 2, h / 2 + 0.1, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.07, h + 0.1, 0.07, alu), (sx * w) / 2, h / 2 + 0.1, (sz * d) / 2));
    for (const sz of [-1, 1]) g.add(at(box(w + 0.07, 0.07, 0.07, alu), 0, h + 0.13, (sz * d) / 2));
    for (const sx of [-1, 1]) g.add(at(box(0.07, 0.07, d, alu), (sx * w) / 2, h + 0.13, 0));
    root.add(g);
    const wm = new THREE.MeshStandardMaterial({ color: 0x2f9fc6, roughness: 0.08, transparent: true, opacity: 0.74, depthWrite: false });
    const wtr = dyn(new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 1, d - 0.08).translate(0, 0.5, 0), wm));
    root.add(at(wtr, x, 0.1, z));
    return wtr;
  }
  const AX = -3.9, BX = -1.2, Z = -0.9;
  const wA = tank(2.0, 2.1, 2.0, AX, Z);
  const wB = tank(2.0, 2.5, 2.0, BX, Z);
  const blue = new THREE.Color(0x2f9fc6), fed = new THREE.Color(0x58b56a);

  // Liaison entre les deux bacs, avec vanne.
  root.add(tube([[AX + 1.0, 0.45, Z + 0.6], [AX + 1.35, 0.45, Z + 0.6], [BX - 1.0, 0.45, Z + 0.6]], 0.08, mat('pvc'), 8));
  root.add(at(cyl(0.12, 0.2, mat('gold')), (AX + BX) / 2, 0.45, Z + 0.6, 0, 0, Math.PI / 2), at(box(0.3, 0.05, 0.07, mat('red')), (AX + BX) / 2, 0.62, Z + 0.6));

  // Mélangeur.
  root.add(at(box(2.1, 0.08, 0.3, alu), BX, 2.68, Z), at(cyl(0.2, 0.42, mat('grey')), BX, 2.93, Z), at(cyl(0.035, 2.0, mat('steel'), 8), BX, 1.7, Z));
  const mixer = dyn(at(grp(), BX, 0.72, Z));
  for (let k = 0; k < 3; k++) mixer.add(at(box(0.62, 0.04, 0.2, mat('steel')), Math.cos((k * 2 * Math.PI) / 3) * 0.3, 0, Math.sin((k * 2 * Math.PI) / 3) * 0.3, 0.5, (-k * 2 * Math.PI) / 3, 0));
  root.add(mixer);

  // Deux doseurs : réservoir orange, moteur pas à pas, tuyau vers le bac.
  root.add(at(box(2.5, 0.08, 0.6, alu), BX, 3.3, Z - 1.25));
  for (const sx of [-1, 1]) root.add(at(box(0.08, 3.3, 0.08, alu), BX + sx * 1.2, 1.65, Z - 1.25));
  const dosers = [-0.55, 0.55].map((dx) => {
    const x = BX + dx;
    root.add(at(cyl(0.3, 0.95, mat('orange'), 24), x, 3.82, Z - 1.25), at(cyl(0.12, 0.12, mat('black')), x, 4.35, Z - 1.25));
    root.add(at(rbox(0.46, 0.46, 0.46, mat('black'), 0.03), x, 2.98, Z - 1.25), at(box(0.46, 0.46, 0.04, alu), x, 2.98, Z - 1.0));
    const rotor = dyn(at(grp(cyl(0.15, 0.06, mat('steel'), 20), at(box(0.05, 0.065, 0.26, mat('red')), 0, 0, 0)), x, 2.98, Z - 0.94, Math.PI / 2));
    root.add(rotor);
    root.add(tube([[x, 2.74, Z - 1.1], [x, 2.6, Z - 0.8], [x * 0.5 + BX * 0.5, 2.62, Z - 0.5]], 0.03, mat('white'), 14, 6));
    const drops = [0, 1].map(() => {
      const d = dyn(sph(0.05, mat('orange'), 8));
      root.add(d);
      return d;
    });
    return { rotor, drops, x: x * 0.5 + BX * 0.5 };
  });

  // Départ vers les plantes : électrovanne puis rampe goutte-à-goutte.
  const TX = 3.1, TZ = 0.5;
  root.add(tube([[BX + 1.0, 0.4, Z - 0.3], [0.6, 0.4, Z - 0.3], [1.0, 0.4, TZ - 1.2], [1.3, 1.2, TZ - 1.0], [1.5, 1.75, TZ - 0.2], [TX + 1.7, 1.75, TZ - 0.2]], 0.07, mat('pvc'), 60, 8));
  root.add(at(rbox(0.3, 0.26, 0.26, mat('gold'), 0.03), 0.4, 0.4, Z - 0.3), at(cyl(0.13, 0.3, mat('blue')), 0.4, 0.68, Z - 0.3));
  const valve = at(led(0x35e07d, 0.05), 0.4, 0.88, Z - 0.3);
  root.add(valve);

  root.add(at(rbox(3.9, 0.7, 1.5, mat('white'), 0.06), TX, 0.35, TZ), at(box(3.7, 0.06, 1.3, mat('soil')), TX, 0.7, TZ));
  const plants = [];
  const emitters = [];
  for (let k = 0; k < 5; k++) {
    const x = TX - 1.5 + k * 0.75;
    root.add(at(cyl(0.035, 0.14, mat('black'), 8), x, 1.66, TZ - 0.2));
    const h = 0.55 + ((k * 37) % 5) * 0.09;
    const p = dyn(at(grp(at(cyl(0.03, h, mat('leaf'), 6), 0, h / 2, 0)), x, 0.72, TZ + 0.1));
    for (let j = 0; j < 6; j++) {
      const a = j * 2.4 + k;
      const leaf = at(sph(0.2, mat(j % 2 ? 'leaf' : 0x3b9442, { roughness: 0.7 }), 10), Math.cos(a) * 0.17, h * (0.35 + j * 0.12), Math.sin(a) * 0.17, 0.5, -a, 0.3);
      leaf.scale.set(1, 0.16, 0.55);
      p.add(leaf);
    }
    if (k % 2 === 0) p.add(at(sph(0.08, mat('red'), 10), 0.14, h * 0.55, 0.1));
    root.add(p);
    plants.push(p);
    const drop = dyn(sph(0.045, mat('water'), 8));
    root.add(drop);
    emitters.push({ drop, x });
  }

  // Pupitre tactile.
  const desk = at(grp(), -4.5, 0, 2.3, 0, 0.45, 0);
  desk.add(at(cyl(0.07, 1.25, mat('dgrey'), 12), 0, 0.62, 0), at(cyl(0.4, 0.06, mat('dgrey'), 24), 0, 0.03, 0));
  const head = at(grp(rbox(1.6, 1.05, 0.12, mat('black'), 0.05)), 0, 1.55, 0.05, -0.45);
  const hmi = screen(1.38, 0.84, 256, 156);
  head.add(at(hmi.mesh, 0, 0, 0.065));
  desk.add(head);
  root.add(desk);

  let phase = 'ready', t1 = 0, t2 = 0, d1 = 1, timer = 0, vol = 0, wait = 0, seen = s.start;
  let nutrient = 0, lvlA = 1.7, lvlB = 1.15, perk = 0.86, mixSpin = 0;
  const redraw = every(0.2);

  function begin() {
    const k = [1, 1.45, 1.9][clamp((s.speed | 0) - 1, 0, 2)];
    d1 = (2.2 + (s.qty / 2000) * 4.5) / k;
    t1 = d1;
    t2 = d1 * 0.64;
    vol = 0;
    phase = 'dosing';
  }

  function update(dt, t, focus) {
    if (s.start !== seen) {
      seen = s.start;
      if (phase === 'ready') begin();
    }
    if (phase === 'ready') {
      wait += dt;
      if (!s.user && wait > 3) {
        s.speed = (s.speed % 3) + 1;
        begin();
      }
      lvlA = damp(lvlA, 1.7, 0.6, dt);
    } else wait = 0;

    const dosing = phase === 'dosing';
    if (dosing) {
      const run1 = t1 > 0, run2 = t2 > 0;
      t1 = Math.max(0, t1 - dt);
      t2 = Math.max(0, t2 - dt);
      const rate = [1, 1.45, 1.9][clamp((s.speed | 0) - 1, 0, 2)];
      if (run1) dosers[0].rotor.rotation.y += dt * 5 * rate;
      if (run2) dosers[1].rotor.rotation.y += dt * 5 * rate;
      vol = (s.qty * 0.012 * (d1 - t1)) / d1;
      nutrient = clamp(nutrient + dt / d1);
      lvlB = Math.min(1.9, lvlB + dt * 0.12);
      lvlA = Math.max(1.0, lvlA - dt * 0.12);
      if (!run1 && !run2) { phase = 'mixing'; timer = 3; }
    } else if (phase === 'mixing') {
      timer -= dt;
      if (timer <= 0) { phase = 'watering'; timer = 4.2; }
    } else if (phase === 'watering') {
      timer -= dt;
      lvlB = Math.max(1.15, lvlB - dt * 0.18);
      nutrient = Math.max(0, nutrient - dt * 0.22);
      perk = Math.min(1.08, perk + dt * 0.07);
      if (timer <= 0) phase = 'ready';
    }
    if (phase !== 'watering') perk = Math.max(0.86, perk - dt * 0.012);

    mixSpin = damp(mixSpin, phase === 'mixing' ? 9 : phase === 'dosing' ? 1.5 : 0, 3, dt);
    mixer.rotation.y += mixSpin * dt;
    wA.scale.y = lvlA;
    wB.scale.y = lvlB;
    wB.material.color.copy(blue).lerp(fed, nutrient * 0.85);

    dosers.forEach((d, i) => {
      const on = dosing && (i ? t2 : t1) > 0;
      d.drops.forEach((drop, k) => {
        const u = (t * 2.2 + k * 0.5 + i * 0.3) % 1;
        drop.visible = on;
        drop.position.set(d.x, lerp(2.58, 0.1 + lvlB, u * u), Z - 0.5);
      });
    });
    const watering = phase === 'watering';
    valve.userData.set(watering);
    emitters.forEach((e, k) => {
      const u = (t * 1.9 + k * 0.23) % 1;
      e.drop.visible = watering;
      e.drop.position.set(e.x, lerp(1.58, 0.78, u * u), TZ - 0.2);
    });
    plants.forEach((p, k) => {
      p.scale.setScalar(perk);
      p.rotation.z = Math.sin(t * 1.3 + k) * 0.04;
    });

    if (focus && redraw(dt)) {
      const g = hmi.ctx;
      g.fillStyle = '#f3f5f4';
      g.fillRect(0, 0, 256, 156);
      [250, 350, 450].forEach((v, k) => {
        g.fillStyle = k + 1 === (s.speed | 0) ? '#2c9a57' : '#9aa19d';
        g.beginPath();
        g.ellipse(40 + k * 62, 34, 26, 18, 0, 0, 7);
        g.fill();
        g.fillStyle = '#fff';
        g.font = 'bold 15px sans-serif';
        g.fillText(String(v), 27 + k * 62, 39);
      });
      g.fillStyle = phase === 'ready' ? '#9aa19d' : '#e2372c';
      g.beginPath();
      g.arc(222, 34, 22, 0, 7);
      g.fill();
      g.fillStyle = '#1c2421';
      g.font = 'bold 30px sans-serif';
      g.fillText(t1.toFixed(2), 20, 104);
      g.fillText(t2.toFixed(2), 140, 104);
      g.font = '14px sans-serif';
      g.fillStyle = '#5c6661';
      g.fillText('P1 (s)', 20, 126);
      g.fillText('P2 (s)', 140, 126);
      g.fillStyle = '#c8cdca';
      g.fillRect(20, 138, 216, 8);
      g.fillStyle = '#2f9fc6';
      g.fillRect(20, 138, 216 * clamp(s.qty / 2000), 8);
      hmi.refresh();
    }

    const o = s.out;
    o.t1 = t1.toFixed(1);
    o.t2 = t2.toFixed(1);
    o.vol = vol.toFixed(1);
    o.ph = '@' + phase;
    o.phase = phase;
  }

  return { group: root, update, foot: [11.6, 7.2], height: 4.4, yaw: -0.46, pitch: 0.36 };
}
