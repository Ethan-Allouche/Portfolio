// Lampe SmartLight : carte sur mesure avec Arduino Nano, capteur de lumière et télécommande infrarouge.
import { THREE, mat, box, rbox, cyl, sph, tube, lathe, plane, at, grp, dyn, plate, glow, pool, led, patternTex, clamp, lerp, damp, env, rng } from '../kit.js';

const WARM = new THREE.Color(0xffdfa6);
const DEMO = ['auto', 'fade', 'manual'];

export default function lampe(ctx) {
  const s = ctx.state;
  s.mode ??= 'auto';
  s.level ??= 70;
  s.cover ??= false;
  s.out ||= {};

  const root = grp(plate(9.4, 6.2));
  const white = mat('white');

  // ----- la lampe -----
  const LX = -2.75, LZ = -0.45;
  root.add(at(lathe([[0, 0], [0.98, 0], [1.04, 0.05], [1.0, 0.13], [0.62, 0.2], [0.13, 0.27], [0, 0.27]], white, 40), LX, 0, LZ));
  root.add(tube([[LX - 0.3, 0.24, LZ], [LX - 0.52, 1.5, LZ], [LX - 0.25, 2.75, LZ], [LX + 0.7, 3.4, LZ], [LX + 1.55, 3.25, LZ], [LX + 2.0, 2.82, LZ]], 0.075, white, 56, 10));
  const TILT = 0.62;
  const HX = LX + 2.14, HY = 2.62;
  const head = at(grp(), HX, HY, LZ, 0, 0, TILT);
  head.add(cyl(0.5, 0.78, white, 32, 0.13), at(sph(0.14, white, 14), 0, 0.4, 0));
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff6e2, emissive: 0xffdfa6, emissiveIntensity: 0.2, roughness: 0.4 });
  const bulb = dyn(at(cyl(0.44, 0.03, bulbMat, 28), 0, -0.4, 0));
  const halo = at(glow(0xffdfa6, 2.6, 0), 0, -0.45, 0);
  const BEAM = 2.95;
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xffdfa6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const beam = dyn(at(new THREE.Mesh(new THREE.ConeGeometry(1.45, BEAM, 36, 1, true), beamMat), 0, -0.3 - BEAM / 2, 0));
  beam.userData.noShadow = true;
  head.add(bulb, halo, beam);
  root.add(head);
  // Point d'impact du faisceau sur le socle.
  const SPX = HX + Math.sin(TILT) * (0.3 + HY / Math.cos(TILT));
  const spot = at(pool(0xffdfa6, 5.6, 0), SPX - 0.2, 0.02, LZ + 0.1);
  spot.userData.floor = false;
  root.add(spot);

  // ----- la carte SmartLight -----
  const PX = SPX - 0.1, PZ = -0.35, PY = 0.26;
  const pcb = at(grp(), PX, 0, PZ);
  for (const [x, z] of [[-1.55, -1.05], [1.55, -1.05], [-1.55, 1.05], [1.55, 1.05]]) pcb.add(at(cyl(0.07, PY, mat('gold'), 6), x, PY / 2, z));
  pcb.add(at(rbox(3.4, 0.07, 2.4, mat('pcb'), 0.035), 0, PY, 0));
  const traces = patternTex(512, (g, n) => {
    g.fillStyle = '#1c7a40';
    g.fillRect(0, 0, n, n);
    g.lineWidth = 5;
    g.lineCap = g.lineJoin = 'round';
    const r = rng(11);
    for (let k = 0; k < 30; k++) {
      let x = 30 + r() * (n - 60), y = 30 + r() * (n - 100);
      g.strokeStyle = '#36a860';
      g.beginPath();
      g.moveTo(x, y);
      for (let j = 0; j < 3; j++) {
        const len = 40 + r() * 110, dir = ((r() * 8) | 0) * (Math.PI / 4);
        x = clamp(x + Math.cos(dir) * len, 16, n - 16);
        y = clamp(y + Math.sin(dir) * len, 16, n - 60);
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = '#d9b25a';
      g.beginPath();
      g.arc(x, y, 7, 0, 7);
      g.fill();
      g.fillStyle = '#145c30';
      g.beginPath();
      g.arc(x, y, 3, 0, 7);
      g.fill();
    }
    g.fillStyle = '#eaf6ec';
    g.font = 'bold 34px sans-serif';
    g.fillText('SmartLight', 22, n - 18);
  });
  const top = at(plane(3.3, 2.3, new THREE.MeshStandardMaterial({ map: traces, roughness: 0.5 })), 0, PY + 0.037, 0, -Math.PI / 2);
  top.userData.noShadow = true;
  pcb.add(top);
  const Y = PY + 0.035;
  // Arduino Nano sur ses barrettes.
  for (const x of [-0.27, 0.27]) pcb.add(at(box(0.09, 0.16, 1.5, mat('black')), 0.35 + x, Y + 0.08, -0.15));
  pcb.add(at(rbox(0.68, 0.045, 1.62, mat('pcbBlue'), 0.02), 0.35, Y + 0.185, -0.15));
  pcb.add(at(box(0.3, 0.05, 0.3, mat('black')), 0.35, Y + 0.23, -0.05, 0, Math.PI / 4, 0), at(box(0.28, 0.13, 0.3, mat('steel')), 0.35, Y + 0.27, -0.86), at(box(0.12, 0.05, 0.12, mat('steel')), 0.35, Y + 0.23, 0.48));
  // Borniers à vis, jack, USB-C, régulateur, condensateurs.
  for (const z of [-0.7, -0.15, 0.4]) {
    pcb.add(at(rbox(0.36, 0.36, 0.5, mat('blue'), 0.03), -1.42, Y + 0.18, z));
    for (const dz of [-0.12, 0.12]) pcb.add(at(cyl(0.06, 0.02, mat('steel'), 10), -1.42, Y + 0.37, z + dz));
  }
  pcb.add(at(rbox(0.5, 0.36, 0.36, mat('blue'), 0.03), -0.55, Y + 0.18, 0.95));
  pcb.add(at(rbox(0.46, 0.38, 0.6, mat('black'), 0.03), 1.4, Y + 0.19, -0.75), at(cyl(0.1, 0.1, mat('steel'), 14), 1.66, Y + 0.2, -0.75, 0, 0, Math.PI / 2));
  pcb.add(at(rbox(0.32, 0.11, 0.26, mat('steel'), 0.03), 1.52, Y + 0.055, 0.0));
  pcb.add(at(box(0.3, 0.42, 0.14, mat('black')), -0.6, Y + 0.21, -0.85), at(box(0.3, 0.26, 0.03, mat('alu')), -0.6, Y + 0.44, -0.93));
  for (const [x, z] of [[-0.75, 0.2], [-0.35, -0.3]]) pcb.add(at(cyl(0.13, 0.32, mat('black'), 16), x, Y + 0.16, z), at(cyl(0.12, 0.01, mat('alu'), 16), x, Y + 0.325, z));
  for (const x of [1.0, 1.25, 1.5]) pcb.add(at(box(0.18, 0.09, 0.18, mat('steel')), x, Y + 0.045, 0.6), at(cyl(0.055, 0.05, mat('black'), 10), x, Y + 0.11, 0.6));
  // Récepteur infrarouge et capteur de lumière (LDR).
  const IRZ = 1.05;
  pcb.add(at(box(0.16, 0.2, 0.1, mat('black')), 0.3, Y + 0.1, IRZ), at(sph(0.075, mat('black'), 12), 0.3, Y + 0.13, IRZ + 0.05));
  const SX = 1.2, SZ = 0.95;
  for (const dx of [-0.04, 0.04]) pcb.add(at(cyl(0.012, 0.3, mat('steel'), 5), SX + dx, Y + 0.15, SZ));
  pcb.add(at(cyl(0.11, 0.05, mat(0xc9553a, { roughness: 0.4 }), 16), SX, Y + 0.32, SZ), at(cyl(0.085, 0.052, mat(0xe9c46a, { roughness: 0.3 }), 16), SX, Y + 0.322, SZ));
  const cap = dyn(at(grp(cyl(0.17, 0.26, mat('black'), 18), at(cyl(0.05, 0.1, mat('black'), 10), 0, 0.17, 0)), SX, 2, SZ));
  cap.visible = false;
  pcb.add(cap);
  const power = at(led(0x35e07d, 0.05), -1.0, Y + 0.05, 0.7);
  const modeLed = at(led(0x35e07d, 0.06), -1.0, Y + 0.05, 0.95);
  pcb.add(power, modeLed);
  root.add(pcb);
  // Câbles : vers la lampe, et alimentation.
  root.add(tube([[PX - 1.6, Y + 0.2, PZ - 0.15], [PX - 2.2, 0.1, PZ - 0.2], [LX + 1.5, 0.05, LZ + 0.75], [LX + 0.75, 0.1, LZ + 0.3]], 0.035, mat('ivory'), 30, 6));
  root.add(tube([[PX + 1.7, Y + 0.2, PZ - 0.75], [PX + 2.4, 0.08, PZ - 0.95], [PX + 2.75, 0.05, PZ - 1.9], [PX + 2.5, 0.05, -2.95]], 0.04, mat('black'), 30, 6));

  // ----- la télécommande -----
  const RX = PX + 0.9, RZ = 2.05, RROT = 0.42;
  const remote = at(grp(), RX, 0, RZ, 0, RROT, 0);
  remote.add(at(rbox(0.82, 0.1, 1.65, white, 0.05), 0, 0.05, 0));
  const keys = [0xcf362b, 0x2c9a57, 0x2867c7, 0xf1f1ec, 0xee7a1c, 0x49a84c, 0x5aa6e0, 0xf1f1ec, 0xf0b400, 0x2c9a57, 0x7d5fd0, 0xf1f1ec];
  remote.add(at(cyl(0.085, 0.03, mat('red'), 12), -0.24, 0.105, -0.6), at(cyl(0.085, 0.03, mat('black'), 12), 0.24, 0.105, -0.6));
  keys.forEach((c, k) => remote.add(at(cyl(0.075, 0.03, mat(c, { roughness: 0.5 }), 12), -0.24 + (k % 3) * 0.24, 0.105, -0.3 + ((k / 3) | 0) * 0.26)));
  remote.add(at(sph(0.05, mat(0x402020, { roughness: 0.2 }), 10), 0, 0.06, -0.83));
  const irGlow = at(glow(0xff3b30, 0.9, 0), 0, 0.08, -0.86);
  remote.add(irGlow);
  root.add(remote);
  // Rayon infrarouge, de la télécommande au récepteur.
  const from = new THREE.Vector3(RX - Math.sin(RROT) * 0.86, 0.08, RZ - Math.cos(RROT) * 0.86);
  const to = new THREE.Vector3(PX + 0.3, Y + 0.13, PZ + IRZ + 0.06);
  const irMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending });
  const ir = dyn(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 6), irMat));
  ir.userData.noShadow = true;
  const dir = to.clone().sub(from);
  ir.position.copy(from).addScaledVector(dir, 0.5);
  ir.scale.y = dir.length();
  ir.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  ir.visible = false;
  root.add(ir);

  // ----- comportement -----
  let level = 0.2, hue = 0.08, flash = 0, seenMode = s.mode, demoT = 0, demoI = 0, amb = 1, capY = 2;
  const color = WARM.clone();
  const want = new THREE.Color();

  function update(dt, t, focus) {
    if (!s.user) {
      demoT += dt;
      if (demoT > 6.5) {
        demoT = 0;
        demoI = (demoI + 1) % DEMO.length;
        s.mode = DEMO[demoI];
      }
      if (s.mode === 'manual') s.level = Math.round(55 + 43 * Math.sin(demoT * 1.1));
    }
    if (s.mode !== seenMode) {
      seenMode = s.mode;
      flash = 0.5;
    }
    flash = Math.max(0, flash - dt);

    // Le capteur mesure la lumière ambiante… c'est-à-dire l'éclairage de l'atelier, que le pupitre peut éteindre.
    amb = damp(amb, s.cover ? 0.03 : clamp(1 - env.night), 5, dt);
    let target;
    if (s.mode === 'auto') target = clamp(1.03 - amb * 0.88, 0.05, 1);
    else if (s.mode === 'fade') target = 0.9;
    else target = clamp(s.level / 100);
    level = damp(level, target, 5, dt);
    if (s.mode === 'fade') {
      hue = (hue + dt * 0.11) % 1;
      want.setHSL(hue, 0.9, 0.62);
    } else want.copy(WARM);
    color.lerp(want, 1 - Math.exp(-5 * dt));

    bulbMat.emissive.copy(color);
    bulbMat.emissiveIntensity = 0.12 + level * 3.4;
    halo.material.color.copy(color);
    halo.userData.level = level;
    beamMat.color.copy(color);
    beamMat.opacity = level * lerp(0.07, 0.2, env.night);
    spot.material.color.copy(color);
    spot.userData.level = level * 0.85;

    power.userData.set(true);
    modeLed.userData.set(true, s.mode === 'auto' ? 0x35e07d : s.mode === 'manual' ? 0xffb829 : color.getHex());
    irGlow.userData.level = flash > 0 ? 1 : 0;
    ir.visible = flash > 0.12;
    irMat.opacity = 0.4 + 0.4 * Math.sin(t * 60);

    capY = damp(capY, s.cover ? Y + 0.3 : 2, 9, dt);
    cap.position.y = capY;
    cap.visible = capY < 1.9;

    if (focus) {
      const p = root.position;
      ctx.world.light(p.x + SPX - 0.5, 1.5, p.z + LZ + 0.2, color, level * lerp(1.5, 16, env.night));
    }
    const o = s.out;
    o.amb = Math.round(amb * 100);
    o.pwm = Math.round(level * 100);
    o.md = '@' + s.mode;
  }

  return { group: root, update, foot: [9.4, 6.2], height: 3.7, yaw: -0.46, pitch: 0.36 };
}
