// Émetteur sonore sélectif : 7 800 Hz pendant 2 s pour allumer le robot à 3 m.
import { THREE, mat, box, rbox, cyl, sph, tor, tube, lathe, plane, at, grp, dyn, plate, led, screen, patternTex, clamp, lerp, damp, env, every } from '../kit.js';

const TARGET = 7800, BAND = 60, NEED = 2;
// Scénario de démonstration : [fréquence, durée d'émission, pause]
const DEMO = [[7800, 3.2, 2.2], [7350, 2.8, 2.0], [7800, 3.2, 2.6], [8250, 2.6, 2.0]];

export default function sonore(ctx) {
  const s = ctx.state;
  s.freq ??= TARGET;
  s.emit ??= false;
  s.out ||= {};

  const root = grp(plate(11.4, 6.6));

  // Plaque d'essai et composants.
  const BX = -3.2, BZ = 0.5, TOPY = 0.2;
  const bb = at(grp(), BX, 0, BZ);
  bb.add(at(rbox(3.7, TOPY, 2.3, mat('ivory'), 0.05), 0, TOPY / 2, 0));
  const holes = patternTex(32, (g, n) => {
    g.fillStyle = '#ece8dc';
    g.fillRect(0, 0, n, n);
    g.fillStyle = '#8c8b84';
    g.fillRect(n / 2 - 3, n / 2 - 3, 6, 6);
  }, 34, 20);
  const top = at(plane(3.5, 2.1, new THREE.MeshStandardMaterial({ map: holes, roughness: 0.8 })), 0, TOPY + 0.002, 0, -Math.PI / 2);
  top.userData.noShadow = true;
  bb.add(top, at(box(3.5, 0.012, 0.09, mat('grey')), 0, TOPY + 0.004, 0));
  for (const [z, c] of [[-0.98, 'red'], [-0.86, 'blue'], [0.86, 'red'], [0.98, 'blue']]) bb.add(at(box(3.4, 0.012, 0.025, mat(c)), 0, TOPY + 0.006, z));
  const dip = (x, z, w = 0.44) => {
    bb.add(at(box(w, 0.14, 0.3, mat('black')), x, TOPY + 0.11, z));
    for (const dz of [-0.17, 0.17]) bb.add(at(box(w * 0.86, 0.1, 0.02, mat('steel')), x, TOPY + 0.05, z + dz));
  };
  dip(-1.2, 0);
  dip(-0.35, 0);
  dip(0.75, 0, 0.34);
  bb.add(at(box(0.26, 0.2, 0.26, mat('blue')), -1.35, TOPY + 0.1, -0.55), at(cyl(0.075, 0.03, mat('gold'), 12), -1.35, TOPY + 0.215, -0.55));
  for (const [x, z, r] of [[-0.85, -0.5, 0], [-0.1, 0.52, 1.57], [0.3, -0.5, 0], [-1.5, 0.5, 1.57], [1.1, 0.5, 0]]) bb.add(at(cyl(0.045, 0.3, mat(0xd6b78a, { roughness: 0.6 }), 10), x, TOPY + 0.09, z, 0, r, Math.PI / 2));
  for (const [x, z] of [[0.1, -0.62], [1.25, -0.45]]) bb.add(at(cyl(0.11, 0.3, mat('black'), 14), x, TOPY + 0.15, z), at(cyl(0.1, 0.01, mat('steel'), 14), x, TOPY + 0.305, z));
  bb.add(at(cyl(0.09, 0.03, mat('orange'), 12), -0.6, TOPY + 0.1, 0.55, Math.PI / 2));
  const jumper = (a, b, c, h = 0.35) => bb.add(tube([[a[0], TOPY, a[1]], [(a[0] + b[0]) / 2, TOPY + h, (a[1] + b[1]) / 2], [b[0], TOPY, b[1]]], 0.022, mat(c, { roughness: 0.5 }), 14, 6));
  jumper([-1.6, -0.92], [-1.2, -0.3], 'red');
  jumper([-1.0, 0.3], [-0.5, 0.92], 'black', 0.3);
  jumper([-0.9, -0.3], [-0.35, -0.3], 'yellow', 0.22);
  jumper([-0.15, 0.3], [0.6, 0.3], 0x2c9a57, 0.28);
  jumper([0.3, -0.86], [0.75, -0.3], 'orange', 0.3);
  jumper([0.95, 0.3], [1.5, 0.86], 'blue', 0.32);
  jumper([-1.7, 0.6], [-0.2, 0.7], 'white', 0.5);
  jumper([0.5, -0.5], [1.55, -0.7], 'yellow', 0.4);
  bb.add(at(box(0.3, 0.12, 0.3, mat('black')), 0.45, TOPY + 0.06, 0.62));
  const button = dyn(at(cyl(0.11, 0.12, mat('red'), 16), 0.45, TOPY + 0.17, 0.62));
  bb.add(button);
  root.add(bb);
  // Pile 9 V.
  root.add(at(rbox(0.95, 0.36, 0.55, mat('black'), 0.04), BX - 1.2, 0.18, BZ + 1.75, 0, 0.3, 0), at(rbox(0.5, 0.37, 0.56, mat('orange'), 0.04), BX - 1.38, 0.18, BZ + 1.8, 0, 0.3, 0));
  root.add(tube([[BX - 0.8, 0.3, BZ + 1.65], [BX - 0.9, 0.5, BZ + 1.3], [BX - 1.5, TOPY, BZ + 0.98]], 0.02, mat('red'), 12, 5));

  // Haut-parleur tourné vers le robot.
  const SX = BX + 2.35, SY = 0.72;
  root.add(at(box(0.12, 0.5, 0.5, mat('dgrey')), SX - 0.22, 0.25, BZ), at(cyl(0.5, 0.14, mat('black'), 32), SX - 0.1, SY, BZ, 0, 0, Math.PI / 2), at(cyl(0.26, 0.2, mat('dgrey'), 20), SX - 0.26, SY, BZ, 0, 0, Math.PI / 2));
  const membrane = dyn(at(grp(lathe([[0.1, 0], [0.46, 0.17]], mat(0x34383c, { roughness: 0.9, side: THREE.DoubleSide }), 32), at(sph(0.11, mat('black'), 14), 0, 0.02, 0)), SX - 0.06, SY, BZ, 0, 0, -Math.PI / 2));
  root.add(membrane);
  root.add(tube([[BX + 0.9, TOPY, BZ + 0.3], [BX + 1.6, 0.5, BZ + 0.2], [SX - 0.3, SY - 0.1, BZ + 0.15]], 0.018, mat('black'), 12, 5));

  // Le robot récepteur, à 3 m.
  const RX = 3.9;
  const bot = dyn(at(grp(), RX, 0, BZ));
  bot.add(at(cyl(0.6, 0.2, mat('white'), 30), 0, 0.3, 0), at(cyl(0.615, 0.06, mat('red'), 30), 0, 0.3, 0));
  for (const z of [-0.6, 0.6]) bot.add(at(cyl(0.26, 0.12, mat('rubber'), 18), 0, 0.26, z, Math.PI / 2));
  bot.add(at(cyl(0.5, 0.03, mat('pcb'), 26), 0, 0.5, 0), at(rbox(0.3, 0.36, 0.72, mat(0x2b50cf, { roughness: 0.6 }), 0.05), -0.4, 0.76, 0));
  const eyes = [-0.19, 0.19].map((z) => {
    bot.add(at(cyl(0.11, 0.1, mat('steel'), 18), -0.56, 0.8, z, 0, 0, Math.PI / 2));
    const e = at(led(0x4de3ff, 0.06), -0.62, 0.8, z);
    bot.add(e);
    return e;
  });
  bot.add(at(cyl(0.05, 0.16, mat('black'), 10), -0.1, 0.6, 0));
  const halo = Array.from({ length: 10 }, (_, k) => {
    const a = (k / 10) * Math.PI * 2;
    const l = at(led(0x35e07d, 0.045), Math.cos(a) * 0.42, 1.25, Math.sin(a) * 0.42);
    bot.add(l);
    return l;
  });
  root.add(bot);

  // Ondes sonores.
  const rings = Array.from({ length: 7 }, (_, k) => {
    const m = new THREE.MeshBasicMaterial({ color: 0x2c9a57, transparent: true, opacity: 0, depthWrite: false });
    const r = dyn(at(tor(1, 0.022, m, Math.PI * 2, 48), 0, SY, BZ, 0, Math.PI / 2, 0));
    r.userData.off = k / 7;
    root.add(r);
    return r;
  });

  // Repère de portée au sol.
  const rule = screen(5.6, 0.6, 448, 48);
  rule.mesh.material.transparent = true;
  rule.mesh.material.depthWrite = false;
  {
    const g = rule.ctx;
    g.strokeStyle = g.fillStyle = '#fff';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(4, 24); g.lineTo(180, 24); g.moveTo(268, 24); g.lineTo(444, 24);
    g.moveTo(4, 8); g.lineTo(4, 40); g.moveTo(444, 8); g.lineTo(444, 40);
    g.stroke();
    g.font = 'bold 30px sans-serif';
    g.textAlign = 'center';
    g.fillText('3 m', 224, 35);
    rule.refresh();
  }
  root.add(at(rule.mesh, (SX + RX) / 2 - 0.1, 0.006, BZ + 1.55, -Math.PI / 2));

  // Oscilloscope.
  const scope = at(grp(), 0.2, 0, -2.2, 0, -0.18, 0);
  scope.add(at(rbox(2.3, 1.3, 0.85, mat(0xdde1e4, { roughness: 0.5 }), 0.06), 0, 0.73, 0), at(rbox(1.45, 1.0, 0.04, mat('black'), 0.02), -0.33, 0.76, 0.42));
  const osc = screen(1.3, 0.86, 256, 170);
  scope.add(at(osc.mesh, -0.33, 0.76, 0.445));
  for (let k = 0; k < 4; k++) scope.add(at(cyl(0.085, 0.07, mat('dgrey'), 14), 0.62 + (k % 2) * 0.3, 0.95 - ((k / 2) | 0) * 0.34, 0.45, Math.PI / 2));
  for (let k = 0; k < 3; k++) scope.add(at(box(0.14, 0.07, 0.04, mat(k ? 'grey' : 'yellow')), 0.5 + k * 0.2, 0.3, 0.44));
  root.add(scope);
  root.add(tube([[0.8, 0.3, -1.8], [0.2, 0.08, -0.9], [-1.4, 0.3, -0.2], [BX + 0.75, TOPY + 0.1, BZ - 0.2]], 0.022, mat('black'), 30, 5));

  let dur = 0, robotOn = false, latched = false, level = 0, step = 0, clock = 0, wiggle = 0;
  const redraw = every(0.12);
  const cIn = new THREE.Color(0x2c9a57), cOut = new THREE.Color(0x8b9297);

  function update(dt, t, focus) {
    if (!s.user) {
      const [f, on, off] = DEMO[step];
      clock += dt;
      s.freq = f;
      s.emit = clock < on;
      if (clock > on + off) { clock = 0; step = (step + 1) % DEMO.length; }
    }
    const inBand = Math.abs(s.freq - TARGET) <= BAND;
    if (s.emit) {
      dur += dt;
      if (inBand && dur >= NEED && !latched) { robotOn = !robotOn; latched = true; wiggle = 1; }
    } else { dur = 0; latched = false; }
    level = damp(level, s.emit ? 1 : 0, 6, dt);

    button.position.y = TOPY + 0.17 - (s.emit ? 0.05 : 0);
    membrane.scale.y = 1 + level * 0.12 * Math.sin(t * 60);
    const speed = 0.42;
    for (const r of rings) {
      const u = (t * speed + r.userData.off) % 1;
      r.position.x = lerp(SX + 0.1, RX - 0.7, u);
      r.scale.setScalar(0.3 + u * 1.15);
      r.material.opacity = level * (1 - u) * (1 - u) * 0.85 * (0.75 + 0.25 * env.night);
      r.material.color.copy(inBand ? cIn : cOut);
    }

    wiggle = Math.max(0, wiggle - dt * 0.9);
    bot.rotation.y = Math.sin(t * 16) * 0.22 * wiggle;
    for (const e of eyes) e.userData.set(robotOn);
    const listening = s.emit && inBand && !latched;
    const lit = listening ? Math.floor(clamp(dur / NEED) * 10) : robotOn ? 10 : 0;
    const refused = s.emit && !inBand && Math.sin(t * 9) > 0;
    halo.forEach((l, k) => l.userData.set(refused || k < lit, refused ? 0xff4a3d : listening ? 0xffb829 : 0x35e07d));

    if (focus && redraw(dt)) {
      const g = osc.ctx, W = 256, H = 170;
      g.fillStyle = '#080c0b';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#1c2925';
      g.lineWidth = 1;
      for (let x = 0; x <= W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 10; y <= H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      const per = (52 * TARGET) / s.freq;
      const ph = t * 90;
      g.lineWidth = 2.5;
      g.strokeStyle = '#f3d21b';
      g.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const u = ((x + ph) / per) % 1;
        const y = 50 - level * 28 * (u < 0.5 ? 4 * u - 1 : 3 - 4 * u);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.strokeStyle = '#3fe07a';
      g.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = 122 - level * 30 * Math.sin(((x + ph) / per) * Math.PI * 2 - 0.9);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.fillStyle = '#cfe6dc';
      g.font = 'bold 15px sans-serif';
      g.fillText(s.freq + ' Hz', 8, 18);
      osc.refresh();
    }
    rule.mesh.material.color.setScalar(lerp(0.25, 0.85, env.night));

    const o = s.out;
    o.freq = s.freq;
    o.dur = dur.toFixed(1);
    o.rx = s.emit && !inBand ? '@ignored' : listening ? '@listen' : robotOn ? '@on' : '@off';
  }

  return { group: root, update, foot: [11.4, 6.6], height: 2.4, yaw: -0.4, pitch: 0.44 };
}
