// Mise en service d'une armoire UniLogic : sonde Pt100, lampes, ventilateurs PWM, entrées TOR.
import { THREE, mat, box, rbox, cyl, sph, tube, plane, at, grp, dyn, plate, glow, led, screen, patternTex, clamp, lerp, damp, every } from '../kit.js';

const STEPS = ['pt100', 'lamps', 'pwm', 'tor'];
const TILT = 0.4;
const UP = new THREE.Vector3(0, 1, 0);

/** Câble souple entre deux points mobiles : un cylindre étiré à chaque image. */
function link(m, r = 0.022) {
  const mesh = dyn(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6), m));
  const d = new THREE.Vector3();
  mesh.userData.span = (a, b) => {
    d.subVectors(b, a);
    const len = d.length() || 1e-4;
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
    mesh.scale.set(1, len, 1);
  };
  return mesh;
}
/** Étiquette gravée (identifiants techniques, identiques dans toutes les langues). */
function label(text, w, h) {
  const tex = patternTex(256, (g, n) => {
    g.fillStyle = '#e8e9e4';
    g.fillRect(0, 0, n, n);
    g.fillStyle = '#1d2120';
    g.font = `bold ${n * 0.6}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const parts = text.split(' ');
    parts.forEach((p, k) => {
      g.save();
      g.translate(((k + 0.5) / parts.length) * n, n / 2);
      g.scale((h / w) * parts.length * 0.5, 1);
      g.fillText(p, 0, 0);
      g.restore();
    });
  });
  const m = plane(w, h, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  m.userData.noShadow = true;
  return m;
}

export default function armoire(ctx) {
  const s = ctx.state;
  s.step ??= 'pt100';
  s.duty ??= 50;
  s.out ||= {};

  const root = grp(plate(11.8, 7.6));
  const BX = -0.4, BZ = -1.0;
  const cs = Math.cos(TILT), sn = Math.sin(TILT);
  /** Repère de la platine (x à droite, y vers le haut, z vers nous) vers le repère du socle. */
  const R = (x, y, z) => new THREE.Vector3(BX + x, y * cs + z * sn, BZ - y * sn + z * cs);

  // ----- la platine inclinée -----
  const bd = at(grp(), BX, 0, BZ, -TILT, 0, 0);
  const F = 0.06; // face avant de la platine
  bd.add(at(rbox(7.3, 4.3, 0.12, mat(0x2a2f2d, { roughness: 0.7 }), 0.05), 0, 2.15, 0));
  for (const y of [3.15, 1.6]) bd.add(at(box(y > 2 ? 3.9 : 3.3, 0.24, 0.07, mat('steel')), y > 2 ? -1.55 : -1.85, y, F + 0.035));
  // Disjoncteur, compteur d'énergie, alimentation 24 V.
  for (const x of [-3.15, -2.8]) bd.add(at(rbox(0.33, 0.98, 0.62, mat('white'), 0.03), x, 3.15, F + 0.36), at(box(0.14, 0.22, 0.14, mat('blue')), x, 3.22, F + 0.72));
  bd.add(at(rbox(0.75, 0.98, 0.62, mat('white'), 0.03), -2.15, 3.15, F + 0.36), at(box(0.5, 0.26, 0.02, mat('black')), -2.15, 3.35, F + 0.675));
  const pulse = at(led(0xff4a3d, 0.045), -2.15, 3.0, F + 0.68);
  bd.add(pulse);
  bd.add(at(rbox(1.15, 1.2, 0.85, mat('alu'), 0.03), -1.0, 3.15, F + 0.47));
  for (let k = 0; k < 5; k++) bd.add(at(box(0.9, 0.035, 0.02, mat('dgrey')), -1.0, 2.85 + k * 0.13, F + 0.9));
  const psu = at(led(0x35e07d, 0.05), -0.6, 3.6, F + 0.9);
  bd.add(psu);
  // Automate UniStream avec son écran intégré.
  bd.add(at(rbox(2.9, 2.0, 0.5, mat('dgrey'), 0.06), 2.0, 3.0, F + 0.25), at(rbox(2.7, 1.8, 0.04, mat('black'), 0.04), 2.0, 3.0, F + 0.51));
  const hmi = screen(2.3, 1.44, 320, 200);
  bd.add(at(hmi.mesh, 2.0, 3.0, F + 0.535));
  // Borniers.
  const TB = [];
  for (let k = 0; k < 16; k++) {
    const x = -3.35 + k * 0.2;
    bd.add(at(rbox(0.17, 0.52, 0.42, mat(k % 5 === 4 ? 'blue' : k % 7 === 6 ? 'orange' : 'grey'), 0.02), x, 1.6, F + 0.26), at(cyl(0.045, 0.02, mat('steel'), 8), x, 1.72, F + 0.475, Math.PI / 2));
    TB.push(x);
  }
  // Sonde Pt100.
  bd.add(at(rbox(0.3, 0.26, 0.26, mat('alu'), 0.03), -3.3, 2.35, F + 0.13), at(cyl(0.035, 0.9, mat('steel'), 10), -3.9, 2.35, F + 0.13, 0, 0, Math.PI / 2));
  bd.add(tube([[-3.2, 2.22, F + 0.15], [-3.05, 2.0, F + 0.3], [-3.3, 1.9, F + 0.45]], 0.02, mat('white'), 10, 5));
  // Ventilateurs V0 et V1.
  const fans = [-2.75, -1.55].map((x) => {
    bd.add(at(rbox(1.0, 1.0, 0.3, mat('black'), 0.06), x, 0.72, F + 0.15), at(cyl(0.44, 0.31, mat(0x0f1110, { roughness: 0.9 }), 28), x, 0.72, F + 0.155, Math.PI / 2));
    const rotor = dyn(at(grp(at(cyl(0.15, 0.1, mat('dgrey'), 16), 0, 0, 0, Math.PI / 2)), x, 0.72, F + 0.3));
    for (let k = 0; k < 7; k++) rotor.add(at(box(0.3, 0.13, 0.02, mat('grey')), Math.cos((k / 7) * 6.283) * 0.27, Math.sin((k / 7) * 6.283) * 0.27, 0, 0.5, 0, (k / 7) * 6.283));
    bd.add(rotor);
    return rotor;
  });
  bd.add(at(label('V0 V1', 1.0, 0.2), -2.15, 1.32, F + 0.002));
  // Pupitre : lampes H1 à H3 et interrupteurs I0 à I3.
  const PXc = 2.0, PYc = 0.95;
  bd.add(at(rbox(2.9, 1.5, 0.22, mat('grey'), 0.05), PXc, PYc, F + 0.11));
  const DF = F + 0.22;
  const lamps = [-0.9, 0, 0.9].map((dx) => {
    const m = new THREE.MeshStandardMaterial({ color: 0x77705f, emissive: 0xffc45e, emissiveIntensity: 0, roughness: 0.3 });
    const lens = dyn(at(cyl(0.2, 0.14, m, 20), PXc + dx, PYc + 0.33, DF + 0.07, Math.PI / 2));
    const halo = at(glow(0xffc45e, 1.3, 0), PXc + dx, PYc + 0.33, DF + 0.2);
    bd.add(at(cyl(0.25, 0.05, mat('steel'), 20), PXc + dx, PYc + 0.33, DF + 0.025, Math.PI / 2), lens, halo);
    return { m, halo };
  });
  bd.add(at(label('H1 H2 H3', 2.3, 0.2), PXc, PYc + 0.02, DF + 0.002));
  const SWX = [-1.05, -0.35, 0.35, 1.05];
  const levers = SWX.map((dx) => {
    bd.add(at(cyl(0.1, 0.06, mat('steel'), 12), PXc + dx, PYc - 0.4, DF + 0.03, Math.PI / 2));
    const l = dyn(at(grp(at(cyl(0.032, 0.3, mat('steel'), 8), 0, 0, 0.15, Math.PI / 2), at(sph(0.05, mat('red'), 8), 0, 0, 0.3)), PXc + dx, PYc - 0.4, DF + 0.05));
    bd.add(l);
    return l;
  });
  bd.add(at(label('I0 I1 I2 I3', 2.5, 0.18), PXc, PYc - 0.64, DF + 0.002));
  // Câblage fixe.
  const wire = (a, b, c, lift = 0.5) => bd.add(tube([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(a[2], b[2]) + lift], b], 0.02, mat(c, { roughness: 0.5 }), 14, 5));
  wire([-1.0, 2.5, F + 0.3], [TB[9], 1.85, F + 0.3], 'red', 0.35);
  wire([-0.8, 2.5, F + 0.3], [TB[10], 1.85, F + 0.3], 'blue', 0.3);
  wire([TB[12], 1.85, F + 0.3], [0.6, 2.6, F + 0.2], 'orange', 0.4);
  wire([TB[14], 1.85, F + 0.3], [0.6, 2.4, F + 0.2], 'yellow', 0.35);
  wire([TB[15], 1.35, F + 0.3], [0.6, 0.95, F + 0.2], 0x2c9a57, 0.4);
  wire([-2.75, 1.25, F + 0.2], [TB[4], 1.35, F + 0.3], 'red', 0.2);
  wire([-1.55, 1.25, F + 0.2], [TB[7], 1.35, F + 0.3], 'black', 0.2);
  root.add(bd);
  // Béquilles.
  for (const x of [-3.3, 3.3]) root.add(at(box(0.12, 4.25 * cs, 0.12, mat('alu')), BX + x, (4.25 * cs) / 2, BZ - 4.3 * sn - 0.1));
  root.add(at(box(6.72, 0.12, 0.12, mat('alu')), BX, 0.06, BZ - 4.3 * sn - 0.1));

  // ----- multimètre -----
  const MX = -4.75, MZ = 2.3;
  const mm = at(grp(), MX, 0, MZ, -0.62, 0.45, 0);
  mm.scale.setScalar(0.9);
  mm.add(at(rbox(1.25, 2.2, 0.34, mat('red'), 0.12), 0, 1.1, 0), at(rbox(1.05, 2.0, 0.36, mat('dgrey'), 0.08), 0, 1.1, 0.02));
  const lcd = screen(0.86, 0.5, 256, 144);
  mm.add(at(lcd.mesh, 0, 1.72, 0.205));
  mm.add(at(cyl(0.34, 0.08, mat('black'), 24), 0, 0.95, 0.2, Math.PI / 2));
  const dial = dyn(at(box(0.1, 0.5, 0.06, mat('white')), 0, 0.95, 0.25));
  mm.add(dial);
  for (const [dx, c] of [[-0.3, 'red'], [0, 'black'], [0.3, 'red']]) mm.add(at(cyl(0.075, 0.04, mat(c), 12), dx, 0.3, 0.2, Math.PI / 2));
  root.add(mm, at(box(0.8, 0.06, 0.5, mat('dgrey')), MX - 0.2, 0.33, MZ - 0.55, 0.9, 0.45, 0));

  // ----- oscilloscope -----
  const OX = 3.45, OZ = 2.3, OR = -0.32;
  const osc = at(grp(), OX, 0, OZ, 0, OR, 0);
  osc.add(at(rbox(2.9, 1.7, 1.15, mat('ivory'), 0.08), 0, 0.93, 0), at(rbox(2.7, 1.5, 0.05, mat('dgrey'), 0.05), 0, 0.93, 0.565));
  for (const x of [-1.2, 1.2]) osc.add(at(box(0.25, 0.08, 0.9, mat('black')), x, 0.04, 0));
  const scope = screen(1.75, 1.2, 280, 192);
  osc.add(at(scope.mesh, -0.38, 0.95, 0.595));
  for (const [x, y, r] of [[0.85, 1.35, 0.11], [1.15, 1.35, 0.08], [0.85, 0.98, 0.09], [1.15, 0.98, 0.09], [0.85, 0.62, 0.07], [1.15, 0.62, 0.07]]) osc.add(at(cyl(r, 0.1, mat('grey'), 14), x, y, 0.62, Math.PI / 2));
  osc.add(at(cyl(0.06, 0.08, mat('gold'), 10), 1.0, 0.3, 0.6, Math.PI / 2));
  root.add(osc);

  // ----- pointes de touche -----
  const probe = (c) => {
    const g = dyn(grp(at(cyl(0.012, 0.3, mat('steel'), 6), 0, 0.15, 0), at(cyl(0.055, 0.6, mat(c), 10), 0, 0.6, 0), at(cyl(0.075, 0.05, mat(c), 10), 0, 0.33, 0)));
    g.rotation.x = 1.05;
    g.userData.pos = new THREE.Vector3();
    g.userData.goal = new THREE.Vector3();
    root.add(g);
    return g;
  };
  const tail = new THREE.Vector3(0, 0.9 * Math.cos(1.05), 0.9 * Math.sin(1.05));
  const pr = probe('red'), pb = probe('black'), ps = probe('dgrey');
  const jack = (dx) => {
    const v = new THREE.Vector3(dx, 0.3, 0.22).multiplyScalar(0.9).applyEuler(mm.rotation);
    return v.add(mm.position);
  };
  const jR = jack(0.3), jB = jack(0), jS = new THREE.Vector3(1.0, 0.3, 0.64).applyEuler(osc.rotation).add(osc.position);
  const cables = [[pr, jR, 'red'], [pb, jB, 'black'], [ps, jS, 'dgrey']].map(([p, j, c]) => {
    const a = link(mat(c)), b = link(mat(c));
    root.add(a, b);
    return { p, j, a, b, end: new THREE.Vector3(), mid: new THREE.Vector3() };
  });
  const park = { r: new THREE.Vector3(MX + 1.15, 0.02, MZ + 0.5), b: new THREE.Vector3(MX + 1.5, 0.02, MZ + 0.2), s: new THREE.Vector3(OX - 2.0, 0.02, OZ + 0.5) };
  const T = {
    ptA: R(TB[0], 1.72, F + 0.5), ptB: R(TB[1], 1.72, F + 0.5),
    zero: R(TB[10], 1.72, F + 0.5),
    lamp: R(PXc, PYc + 0.12, DF + 0.02),
    fan: R(-2.3, 1.22, F + 0.2),
    sw: SWX.map((dx) => R(PXc + dx, PYc - 0.22, DF + 0.02)),
  };
  for (const p of [pr, pb, ps]) p.userData.pos.copy(p === pr ? park.r : p === pb ? park.b : park.s);

  // ----- séquence d'essais -----
  let demoT = 0, demoI = 0, spin = 0, torT = 0, torK = 0, bits = 0b0101, phase = 0;
  const lampLvl = [0, 0, 0];
  const drawHmi = every(0.3), drawScope = every(0.09), drawLcd = every(0.25);
  let reading = '', unit = '';

  function update(dt, t, focus) {
    if (!s.user) {
      demoT += dt;
      if (demoT > 5.5) {
        demoT = 0;
        demoI = (demoI + 1) % STEPS.length;
        s.step = STEPS[demoI];
      }
      s.duty = Math.round(55 + 40 * Math.sin(t * 0.8));
    }
    const step = STEPS.includes(s.step) ? s.step : 'pt100';
    const duty = clamp(s.duty / 100);
    const temp = 21.4 + 0.5 * Math.sin(t * 0.25);

    // Entrées tout ou rien : un interrupteur bascule à tour de rôle.
    if (step === 'tor') {
      torT += dt;
      if (torT > 1.3) {
        torT = 0;
        torK = (torK + 1) % 4;
        bits ^= 1 << torK;
      }
    }
    levers.forEach((l, k) => { l.rotation.x = damp(l.rotation.x, bits & (1 << k) ? -0.55 : 0.55, 14, dt); });

    // Actionneurs.
    const lampCmd = step === 'lamps' ? duty : 0.12;
    lamps.forEach((l, k) => {
      lampLvl[k] = damp(lampLvl[k], lampCmd * (step === 'lamps' ? 1 : k === 0 ? 1 : 0), 6, dt);
      l.m.emissiveIntensity = lampLvl[k] * 2.8;
      l.halo.userData.level = lampLvl[k] * 0.9;
    });
    const fanCmd = step === 'pwm' ? duty : 0.25;
    spin = damp(spin, fanCmd * 34, 2, dt);
    fans[0].rotation.z -= spin * dt;
    fans[1].rotation.z -= spin * dt * 0.93;
    pulse.userData.set(Math.sin(t * 5) > 0.7);
    psu.userData.set(true);

    // Où poser les pointes, et quoi lire.
    let gr = park.r, gb = park.b, gs = park.s, expect = '';
    if (step === 'pt100') {
      gr = T.ptA; gb = T.ptB;
      const ohm = 100 * (1 + 0.00385 * temp);
      reading = (ohm + 0.04 * Math.sin(t * 3.1)).toFixed(1);
      unit = 'Ω';
      expect = ohm.toFixed(1) + ' Ω';
    } else if (step === 'lamps') {
      gr = T.lamp; gb = T.zero;
      reading = (24 * duty + 0.03 * Math.sin(t * 4)).toFixed(1);
      unit = 'V';
      expect = (24 * duty).toFixed(1) + ' V';
    } else if (step === 'tor') {
      gr = T.sw[torK]; gb = T.zero;
      const on = !!(bits & (1 << torK));
      reading = (on ? 24 + 0.02 * Math.sin(t * 4) : 0).toFixed(1);
      unit = 'V';
      expect = on ? '24.0 V' : '0.0 V';
    } else {
      gs = T.fan;
      reading = '----';
      unit = '';
      expect = '115.2 Hz';
    }
    dial.rotation.z = damp(dial.rotation.z, step === 'pt100' ? 0.9 : step === 'pwm' ? 0 : -0.9, 8, dt);
    pr.userData.goal.copy(gr); pb.userData.goal.copy(gb); ps.userData.goal.copy(gs);
    for (const c of cables) {
      const u = c.p.userData;
      const k = 1 - Math.exp(-7 * dt);
      u.pos.lerp(u.goal, k);
      // Petite levée pendant le déplacement, pour ne pas traverser la platine.
      const far = u.pos.distanceTo(u.goal);
      c.p.position.copy(u.pos);
      c.p.position.z += Math.min(0.5, far * 0.5);
      c.end.copy(c.p.position).add(tail);
      c.mid.addVectors(c.end, c.j).multiplyScalar(0.5);
      c.mid.y = Math.min(c.mid.y, 0.12);
      c.mid.z += 0.5;
      c.a.userData.span(c.end, c.mid);
      c.b.userData.span(c.mid, c.j);
    }

    if (focus && drawLcd(dt)) {
      const g = lcd.ctx;
      g.fillStyle = '#b9c7a6';
      g.fillRect(0, 0, 256, 144);
      g.fillStyle = '#1c231b';
      g.font = 'bold 66px monospace';
      g.textAlign = 'right';
      g.fillText(reading, 200, 104);
      g.font = 'bold 40px sans-serif';
      g.textAlign = 'left';
      g.fillText(unit, 206, 104);
      g.font = 'bold 22px sans-serif';
      g.fillText(step === 'pt100' ? 'Ω' : step === 'pwm' ? 'OFF' : 'V ⎓', 12, 28);
      lcd.refresh();
    }
    if (focus && drawScope(dt)) {
      const g = scope.ctx, W = 280, H = 192;
      g.fillStyle = '#06121c';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(120,170,200,.28)';
      g.lineWidth = 1;
      g.beginPath();
      for (let x = 0; x <= W; x += 28) { g.moveTo(x, 0); g.lineTo(x, H); }
      for (let y = 0; y <= H; y += 32) { g.moveTo(0, y); g.lineTo(W, y); }
      g.stroke();
      g.strokeStyle = '#4fd8ff';
      g.lineWidth = 3;
      g.beginPath();
      const hi = 44, lo = 150;
      if (step === 'pwm') {
        phase = (phase + 0.012) % 1;
        const per = 70;
        let prev = null;
        for (let x = 0; x <= W; x++) {
          const u = ((x / per + phase) % 1 + 1) % 1;
          const y = u < duty ? hi : lo;
          if (prev === null) g.moveTo(x, y);
          else if (y !== prev) { g.lineTo(x, prev); g.lineTo(x, y); }
          prev = y;
        }
        g.lineTo(W, prev);
      } else {
        g.moveTo(0, lo);
        g.lineTo(W, lo);
      }
      g.stroke();
      g.fillStyle = '#d9f4ff';
      g.font = 'bold 18px monospace';
      g.fillText(step === 'pwm' ? '115.2 Hz  ' + Math.round(duty * 100) + ' %' : 'CH2  5.00 V', 8, 22);
      scope.refresh();
    }
    if (focus && drawHmi(dt)) {
      const g = hmi.ctx;
      g.fillStyle = '#0d1b2a';
      g.fillRect(0, 0, 320, 200);
      g.fillStyle = '#1f6feb';
      g.fillRect(0, 0, 320, 34);
      g.fillStyle = '#fff';
      g.font = 'bold 20px sans-serif';
      g.fillText('UniStream', 10, 24);
      g.font = 'bold 30px monospace';
      g.fillStyle = '#9be7ff';
      g.fillText(temp.toFixed(1) + ' °C', 12, 74);
      g.font = 'bold 16px sans-serif';
      ['H1', 'H2', 'H3'].forEach((n, k) => {
        g.fillStyle = '#8aa0b4';
        g.fillText(n, 12 + k * 100, 104);
        g.fillStyle = '#22303d';
        g.fillRect(40 + k * 100, 92, 56, 14);
        g.fillStyle = '#ffc45e';
        g.fillRect(40 + k * 100, 92, 56 * lampLvl[k], 14);
      });
      ['V0', 'V1'].forEach((n, k) => {
        g.fillStyle = '#8aa0b4';
        g.fillText(n, 12 + k * 150, 138);
        g.fillStyle = '#22303d';
        g.fillRect(40 + k * 150, 126, 100, 14);
        g.fillStyle = '#4fd8ff';
        g.fillRect(40 + k * 150, 126, 100 * fanCmd, 14);
      });
      for (let k = 0; k < 4; k++) {
        g.fillStyle = '#8aa0b4';
        g.fillText('I' + k, 12 + k * 76, 178);
        g.fillStyle = bits & (1 << k) ? '#35e07d' : '#33414d';
        g.beginPath();
        g.arc(50 + k * 76, 172, 9, 0, 7);
        g.fill();
      }
      hmi.refresh();
    }

    const o = s.out;
    o.meas = step === 'pwm' ? Math.round(duty * 100) + ' %' : reading + ' ' + unit;
    o.ref = expect;
    o.ok = '@ok';
  }

  return { group: root, update, foot: [11.8, 7.6], height: 4.2, yaw: -0.34, pitch: 0.4 };
}
