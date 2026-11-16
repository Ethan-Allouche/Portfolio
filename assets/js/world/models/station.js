// Station d'épuration (maquette EPURA de l'IUT) : relevage, dégrillage, floculation, décantation.
// D'après la vidéo de la maquette : bassins maçonnés à l'enduit blanc, tuyaux PVC gris à raccords orange,
// agitateur sur portique en profilés alu, pont racleur à courroie sur le décanteur.
// D'après le schéma et le rapport : bac tampon, deux pompes RX2/20 sur variateurs ATV12 pilotés en Modbus
// par un automate M340, capteurs de niveau haut et bas, alternance des pompes, dégrilleur à marches.
import { THREE, mat, box, rbox, cyl, sph, tor, tube, at, grp, dyn, plate, glow, led, screen, clamp, lerp, damp, every, patternTex, rng } from '../kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function pipe(a, b, r, m, seg = 14) {
  const d = V().subVectors(b, a), len = d.length();
  const o = cyl(r, len, m, seg);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}

export default function station(ctx) {
  const s = ctx.state;
  s.mode ??= 'auto';
  s.pump ??= false;
  s.screen ??= false;
  s.hz ??= 40;
  s.fault ??= false;
  s.out ||= {};

  const root = grp(plate(13, 7.4));
  root.children[0].position.z = -0.5;
  const rnd = rng(5);

  // ---------------------------------------------------------------- matériaux
  const crepi = patternTex(128, (g, n) => { g.fillStyle = '#f1efea'; g.fillRect(0, 0, n, n); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${150 + Math.random() * 60 | 0},${150 + Math.random() * 55 | 0},${140 + Math.random() * 50 | 0},${0.1 + Math.random() * 0.22})`; g.fillRect(Math.random() * n, Math.random() * n, 1.4, 1.4); } }, 3, 3);
  const wall = new THREE.MeshStandardMaterial({ map: crepi, color: 0xdedbd3, roughness: 1 });
  const alu = mat(0xc9ced2, { metalness: 0.9, roughness: 0.38 }), aluDark = mat(0x9aa0a5, { metalness: 0.9, roughness: 0.45 });
  const pvc = mat(0x8a8f93, { roughness: 0.5 }), orange = mat(0xf0701f, { roughness: 0.55 }), blackM = mat(0x16181a, { roughness: 0.5 });
  const steel = mat('steel'), cable = mat(0x0e0f10, { roughness: 0.7 });
  const waterOf = (c, o = 0.62) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.08, metalness: 0.05, transparent: true, opacity: o, depthWrite: false });

  // ---------------------------------------------------------------- génie civil
  const T = 0.2, ZB = -1.7, ZF = 1.3;
  /** Bassin : quatre murs arrondis et un fond ; `solid` remplit dessous quand le bassin est surélevé. */
  function basin(x0, x1, z0, z1, top, floor) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    root.add(at(box(w, floor, d, wall), cx, floor / 2, cz));
    for (const z of [z0 + T / 2, z1 - T / 2]) root.add(at(rbox(w, top, T, wall, 0.07), cx, top / 2, z));
    for (const x of [x0 + T / 2, x1 - T / 2]) root.add(at(rbox(T, top, d, wall, 0.07), x, top / 2, cz));
  }
  function pond(x0, x1, z0, z1, floor, color, o) {
    const m = dyn(new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 2 * T - 0.01, 1, z1 - z0 - 2 * T - 0.01).translate(0, 0.5, 0), waterOf(color, o)));
    root.add(at(m, (x0 + x1) / 2, floor, (z0 + z1) / 2));
    return m;
  }
  const A = [-5.9, -3.6], B = [-3.6, -1.3], C = [-1.3, -0.1], D = [-0.1, 2.2], E = [2.2, 4.9];
  basin(A[0], A[1], ZB, ZF, 1.75, 0.2);            // bac de relevage
  basin(B[0], B[1], -1.2, 0.6, 2.05, 1.3);         // canal du dégrilleur, surélevé
  basin(C[0], C[1], -1.2, 0.6, 1.6, 0.95);         // petit bassin intermédiaire
  basin(D[0], D[1], ZB, ZF, 1.5, 0.2);             // floculation
  basin(E[0], E[1], ZB, ZF, 1.5, 0.2);             // décanteur
  // épaulements de maçonnerie, comme sur la maquette
  root.add(at(rbox(2.3, 1.1, 0.5, wall, 0.08), -2.45, 0.55, 0.85), at(rbox(1.2, 0.8, 0.7, wall, 0.08), -0.7, 0.4, 0.95), at(rbox(3.5, 1.2, 0.5, wall, 0.08), -1.85, 0.6, -1.45));
  const wA = pond(A[0], A[1], ZB, ZF, 0.2, 0x7f958a, 0.7);
  const wB = pond(B[0], B[1], -1.2, 0.6, 1.3, 0x86a39a, 0.66);
  const wC = pond(C[0], C[1], -1.2, 0.6, 0.95, 0x86aaa6, 0.62);
  const wD = pond(D[0], D[1], ZB, ZF, 0.2, 0x8fbcc4, 0.58);
  const wE = pond(E[0], E[1], ZB, ZF, 0.2, 0x76bcd6, 0.52);
  wB.scale.y = 0.36; wC.scale.y = 0.42; wD.scale.y = 1.02; wE.scale.y = 1.05;
  // bac d'eau propre, en plexi
  const glass = mat(0xe4f3f7, { roughness: 0.05, transparent: true, opacity: 0.22 });
  root.add(at(box(1.0, 0.06, 1.4, glass), 5.45, 0.03, 0.4));
  for (const [w, d, x, z] of [[1.0, 0.03, 5.45, -0.3], [1.0, 0.03, 5.45, 1.1], [0.03, 1.4, 4.96, 0.4], [0.03, 1.4, 5.94, 0.4]]) root.add(at(box(w, 0.95, d, glass), x, 0.5, z));
  const wF = dyn(new THREE.Mesh(new THREE.BoxGeometry(0.93, 1, 1.33).translate(0, 0.5, 0), waterOf(0x9bdcf2, 0.5)));
  root.add(at(wF, 5.45, 0.06, 0.4));
  // bac tampon, devant le relevage
  const tank = mat(0xeef1f2, { roughness: 0.35, transparent: true, opacity: 0.42 });
  root.add(at(rbox(3.2, 0.85, 0.85, tank, 0.1), -4.2, 0.43, 2.15), at(cyl(0.16, 0.05, mat(0x2563eb, { roughness: 0.5 }), 20), -4.9, 0.88, 2.15));
  const wT = dyn(new THREE.Mesh(new THREE.BoxGeometry(3.05, 1, 0.72).translate(0, 0.5, 0), waterOf(0x7aa6b2, 0.6)));
  root.add(at(wT, -4.2, 0.05, 2.15));

  // ---------------------------------------------------------------- tuyauterie PVC grise, raccords orange
  const R = 0.075;
  function line(pts, r = R, unions = true) {
    for (let i = 0; i < pts.length - 1; i++) {
      root.add(pipe(pts[i], pts[i + 1], r, pvc));
      if (unions && pts[i].distanceTo(pts[i + 1]) > 0.5) for (const k of [0.12, 0.88]) { const p = V().lerpVectors(pts[i], pts[i + 1], k), q = V().lerpVectors(pts[i], pts[i + 1], k + (k < 0.5 ? 0.12 : -0.12) * (0.9 / pts[i].distanceTo(pts[i + 1]))); root.add(pipe(p, q, r * 1.18, orange)); }
    }
    for (const p of pts.slice(1, -1)) root.add(at(sph(r * 1.22, pvc, 12), p.x, p.y, p.z));
  }
  // deux pompes de relevage RX2/20, chacune avec sa colonne ; collecteur vers le canal du dégrilleur
  const pumpM = mat(0x5f666b, { metalness: 0.5, roughness: 0.4 });
  const pumps = [-5.25, -4.35].map((x, i) => {
    const g = dyn(grp(at(cyl(0.2, 0.62, pumpM, 22), 0, 0.31, 0), at(cyl(0.22, 0.08, blackM, 22), 0, 0.04, 0), at(cyl(0.13, 0.12, blackM, 16), 0, 0.68, 0), at(box(0.16, 0.05, 0.02, mat(0xf2c200)), 0, 0.4, 0.2)));
    const lamp = led(0x35e07d, 0.05);
    g.add(at(lamp, 0, 0.78, 0));
    root.add(at(g, x, 0.2, -0.35));
    line([V(x + 0.12, 0.8, -0.35), V(x + 0.12, 2.42, -0.35), V(x + 0.12, 2.42, -0.9)], 0.06, true);
    return { g, lamp, x };
  });
  line([V(-5.13, 2.42, -0.9), V(-3.25, 2.42, -0.9), V(-3.25, 2.42, -0.3), V(-3.25, 2.12, -0.3)], R);
  root.add(at(rbox(0.2, 0.2, 0.2, mat(0xb58a3c, { metalness: 0.8, roughness: 0.35 }), 0.03), -3.9, 2.42, -0.9));       // clapet
  // du canal vers le petit bassin : deux tubes qui passent par-dessus le mur, comme sur la vidéo
  line([V(-1.75, 1.72, -0.75), V(-0.55, 1.72, -0.75), V(-0.55, 1.12, -0.75)], R);
  root.add(pipe(V(-0.55, 1.2, -0.75), V(-0.55, 1.34, -0.75), R * 1.3, mat(0xf2f2ef)));
  line([V(-1.75, 1.5, 0.1), V(-1.05, 1.5, 0.1), V(-0.95, 1.38, 0.1)], R, false);
  root.add(pipe(V(-1.7, 1.5, 0.1), V(-1.55, 1.5, 0.1), R * 1.18, orange), pipe(V(-1.7, 1.72, -0.75), V(-1.55, 1.72, -0.75), R * 1.18, orange));
  // sortie du décanteur vers le bac d'eau propre, et retour vers le bac tampon par une petite pompe
  line([V(4.75, 1.3, 0.4), V(5.3, 1.3, 0.4), V(5.3, 1.02, 0.4)], 0.06, false);
  const back = [V(3.6, 0.12, 1.42), V(3.6, 0.12, 2.5), V(-2.2, 0.12, 2.5), V(-2.5, 0.12, 2.2), V(-2.62, 0.3, 2.15)];
  line(back, 0.06, true);
  root.add(at(cyl(0.16, 0.3, mat(0x2867c7, { roughness: 0.45 }), 18), 2.6, 0.2, 2.5, 0, 0, Math.PI / 2), at(box(0.3, 0.06, 0.3, blackM), 2.6, 0.03, 2.5));
  line([V(-4.9, 0.3, 1.74), V(-4.9, 0.3, 1.25)], 0.07, false);
  const backCurve = new THREE.CatmullRomCurve3(back, false, 'catmullrom', 0.05);

  // ---------------------------------------------------------------- capteurs de niveau
  const probe = (x, y, z) => { const l = led(0xff4a3d, 0.05); root.add(at(cyl(0.035, 0.16, mat(0xe8e8e2), 12), x, y, z - 0.08, Math.PI / 2), at(l, x, y, z + 0.02)); return l; };
  root.add(at(box(0.05, 1.5, 0.05, alu), -3.95, 1.0, ZB + T + 0.03));
  const NH = 1.36, NB = 0.6;
  const ledNH = probe(-3.95, NH, ZB + T + 0.14), ledNB = probe(-3.95, NB, ZB + T + 0.14);
  // ultrason au-dessus du canal
  root.add(at(box(0.05, 0.6, 0.05, alu), -2.9, 2.32, -1.1), at(box(0.05, 0.05, 0.5, alu), -2.9, 2.6, -0.87), at(cyl(0.07, 0.16, mat(0x30363b), 14), -2.9, 2.5, -0.65));
  const ping = dyn(at(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xff7a6b, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })), -2.9, 2.05, -0.65, Math.PI));
  root.add(ping);

  // ---------------------------------------------------------------- dégrilleur à marches
  const P0 = [-3.15, 1.38], P1 = [-2.25, 2.72];
  const slope = Math.atan2(P1[1] - P0[1], P1[0] - P0[0]), len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
  const mid = [(P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2], SZ = -0.3;
  for (const dz of [-0.52, 0.52]) root.add(at(box(len + 0.3, 0.3, 0.03, alu), mid[0], mid[1], SZ + dz, 0, 0, slope));
  for (const p of [P0, P1]) root.add(at(cyl(0.13, 1.0, aluDark, 20), p[0], p[1], SZ, Math.PI / 2));
  for (let k = 0; k < 14; k++) root.add(at(cyl(0.008, len, steel, 5), mid[0] + 0.05, mid[1] - 0.06, SZ - 0.46 + k * 0.07, 0, 0, slope - Math.PI / 2));
  root.add(at(rbox(0.3, 0.3, 0.26, mat(0x2867c7, { roughness: 0.45 }), 0.04), P1[0], P1[1], SZ + 0.68), at(cyl(0.11, 0.3, blackM, 16), P1[0], P1[1], SZ + 0.95, Math.PI / 2));
  for (const dz of [-0.5, 0.5]) root.add(at(box(0.06, 1.0, 0.06, alu), P1[0] + 0.12, 2.3, SZ + dz));
  root.add(at(rbox(0.5, 0.3, 0.9, mat(0x3f474d, { roughness: 0.6 }), 0.03), P1[0] + 0.42, 2.2, SZ));           // bac à déchets
  const steps = Array.from({ length: 8 }, () => { const r = dyn(grp(at(box(0.16, 0.025, 0.96, aluDark), 0, 0, 0), at(box(0.025, 0.1, 0.96, aluDark), -0.07, 0.05, 0))); root.add(r); return r; });
  // déversoirs triangulaires en sortie de canal
  for (const [x, rz] of [[-1.95, 0.5], [-1.5, -0.5]]) root.add(at(box(0.06, 0.62, 1.38, wall), x, 1.52, SZ, 0, 0, rz));

  // ---------------------------------------------------------------- floculation : portique alu et agitateur
  const prof = (w, h, d, x, y, z) => { const g = grp(at(box(w, h, d, alu), 0, 0, 0)); if (w > h && w > d) g.add(at(box(w, h * 0.3, d * 1.04, aluDark), 0, 0, 0)); else if (h > w && h > d) g.add(at(box(w * 1.04, h, d * 0.3, aluDark), 0, 0, 0)); else g.add(at(box(w * 0.3, h * 1.04, d, aluDark), 0, 0, 0)); return at(g, x, y, z); };
  const P = 0.1;
  for (const z of [-1.0, 0.75]) { root.add(prof(P, 1.5, P, 0.25, 0.95, z), prof(P, 1.5, P, 1.2, 0.95, z), prof(1.05, P, P, 0.725, 1.72, z)); }
  root.add(prof(P, P, 1.85, 0.25, 1.72, -0.125), prof(P, P, 1.85, 1.2, 1.72, -0.125), prof(1.25, P, P, 0.9, 0.3, 0.95));
  root.add(at(rbox(0.22, 0.26, 0.22, blackM, 0.03), 0.72, 1.95, -0.6), at(cyl(0.09, 0.05, alu, 18), 0.72, 1.8, -0.6));
  const stir = dyn(grp(at(cyl(0.025, 1.5, steel, 8), 0, -0.75, 0), at(cyl(0.07, 0.05, alu, 14), 0, -0.5, 0), at(cyl(0.07, 0.05, alu, 14), 0, -1.0, 0)));
  for (let i = 0; i < 3; i++) stir.add(at(box(0.5, 0.12, 0.02, steel), Math.cos((i * Math.PI * 2) / 3) * 0.25, -1.42, Math.sin((i * Math.PI * 2) / 3) * 0.25, 0.5, -(i * Math.PI * 2) / 3, 0));
  root.add(at(stir, 0.72, 1.78, -0.6));
  root.add(tube([[0.72, 2.08, -0.6], [0.5, 2.3, -1.0], [0.1, 1.7, -1.75], [0.2, 0.3, -2.3]], 0.022, cable, 30, 6));
  // dosage du floculant
  root.add(at(cyl(0.12, 0.3, mat(0xf4f4f1, { roughness: 0.4, transparent: true, opacity: 0.7 }), 16), 1.75, 1.75, -1.5), at(cyl(0.05, 0.06, mat(0x2c9a57), 12), 1.75, 1.93, -1.5), at(cyl(0.012, 0.25, mat(0xdcecef), 6), 1.75, 1.5, -1.42, 0.3));

  // ---------------------------------------------------------------- décanteur : pont racleur sur rails, courroie, moteurs
  const RX0 = 2.5, RX1 = 4.6, RY = 1.56;
  for (const x of [RX0, RX1]) root.add(prof(P, P, 2.9, x, RY, -0.2), at(box(0.02, 0.012, 2.8, blackM), x + 0.07, RY + 0.06, -0.2));
  for (const z of [-1.6, 1.2]) root.add(prof(RX1 - RX0, P, P, (RX0 + RX1) / 2, RY, z));
  for (const [x, z] of [[RX0, -1.6], [RX1, -1.6], [RX1, 1.2]]) root.add(at(rbox(0.26, 0.26, 0.2, blackM, 0.03), x, RY + 0.18, z), at(cyl(0.06, 0.06, alu, 14), x, RY + 0.18, z + 0.13, Math.PI / 2));
  root.add(at(box(0.3, 0.03, 0.42, blackM), RX1 + 0.05, RY - 0.05, 1.5));
  const bridge = dyn(grp(at(box(RX1 - RX0 + 0.2, 0.03, 0.26, mat(0xf0f1f1, { roughness: 0.4 })), 0, 0.08, 0), at(box(0.14, 0.12, 0.3, blackM), -(RX1 - RX0) / 2, 0.04, 0), at(box(0.14, 0.12, 0.3, blackM), (RX1 - RX0) / 2, 0.04, 0)));
  for (const x of [-0.6, 0.6]) bridge.add(at(cyl(0.018, 1.25, steel, 6), x, -0.6, 0));
  bridge.add(at(box(1.7, 0.16, 0.02, steel), 0, -1.22, 0));
  root.add(at(bridge, (RX0 + RX1) / 2, RY, 0));
  // lamelles inclinées près de la sortie
  const lam = mat(0xdfe9ee, { roughness: 0.2, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 9; i++) root.add(at(box(0.012, 0.6, 1.0, lam), 4.05 + i * 0.07, 1.0, 0.55, 0, 0, -0.5));
  root.add(tube([[RX1 + 0.05, RY + 0.2, -1.6], [5.0, 1.5, -1.9], [4.9, 0.3, -2.4], [4.2, 0.15, -2.6]], 0.022, cable, 26, 6), tube([[RX0, RY + 0.22, -1.6], [2.3, 1.9, -1.9], [2.6, 0.5, -2.5], [3.2, 0.2, -2.7]], 0.022, cable, 26, 6));

  // ---------------------------------------------------------------- armoire ouverte : M340, deux ATV12, protections
  const AXc = 3.7, AZ = -3.3, AY = 1.75;
  const grey = mat(0xc4c8c9, { roughness: 0.55 });
  root.add(at(box(1.9, 2.3, 0.05, grey), AXc, AY, AZ - 0.2), at(box(0.05, 2.3, 0.45, grey), AXc - 0.95, AY, AZ), at(box(0.05, 2.3, 0.45, grey), AXc + 0.95, AY, AZ), at(box(1.95, 0.05, 0.45, grey), AXc, AY + 1.15, AZ), at(box(1.95, 0.05, 0.45, grey), AXc, AY - 1.15, AZ));
  for (const dx of [-0.8, 0.8]) root.add(at(box(0.08, 0.6, 0.08, mat('dgrey')), AXc + dx, 0.3, AZ));
  root.add(at(box(1.84, 2.24, 0.02, mat(0xe9e4d2, { roughness: 0.7 })), AXc, AY, AZ - 0.16));                    // platine
  const duct = mat(0xa9aeb1, { roughness: 0.7 });
  for (const y of [AY + 0.98, AY + 0.25, AY - 0.45, AY - 1.0]) root.add(at(box(1.8, 0.1, 0.1, duct), AXc, y, AZ - 0.1));
  for (const x of [AXc - 0.86, AXc + 0.86]) root.add(at(box(0.1, 2.1, 0.1, duct), x, AY, AZ - 0.1));
  // automate M340 : rack, alimentation, processeur, cartes
  const plc = grp(at(box(1.0, 0.36, 0.04, mat(0x30363b)), 0, 0, -0.06));
  const plcLeds = [];
  ['#3a4046', '#2f3439', '#3a4046', '#3a4046', '#3a4046'].forEach((c, i) => {
    plc.add(at(rbox(0.18, 0.34, 0.2, mat(c, { roughness: 0.5 }), 0.012), -0.4 + i * 0.2, 0, 0.05), at(box(0.14, 0.05, 0.004, mat(0xd9dcdc)), -0.4 + i * 0.2, 0.12, 0.152));
    const l = led(0x35e07d, 0.014); plc.add(at(l, -0.44 + i * 0.2, 0.06, 0.155)); plcLeds.push(l);
  });
  root.add(at(plc, AXc - 0.3, AY + 0.62, AZ - 0.06));
  // variateurs Altivar 12
  const drives = [0, 1].map((i) => {
    const sc = screen(0.13, 0.07, 96, 48);
    const g = grp(at(rbox(0.3, 0.52, 0.3, mat(0xe7e8e4, { roughness: 0.5 }), 0.015), 0, 0, 0), at(box(0.26, 0.2, 0.004, mat(0x2f8f5b, { roughness: 0.5 })), 0, 0.12, 0.152), at(sc.mesh, 0, 0.13, 0.156), at(cyl(0.035, 0.02, mat(0x3a4046), 14), 0, -0.02, 0.156, Math.PI / 2), at(box(0.26, 0.08, 0.02, mat(0x3a4046)), 0, -0.22, 0.14));
    root.add(at(g, AXc - 0.45 + i * 0.5, AY - 0.1, AZ - 0.02));
    return sc;
  });
  // disjoncteurs, contacteurs, borniers
  for (let i = 0; i < 5; i++) root.add(at(box(0.07, 0.22, 0.16, mat(0xf0f0ee)), AXc + 0.42 + i * 0.08, AY + 0.62, AZ - 0.06), at(box(0.03, 0.05, 0.02, mat(i ? 0x1f2326 : 0xcf362b)), AXc + 0.42 + i * 0.08, AY + 0.64, AZ + 0.03));
  for (let i = 0; i < 2; i++) root.add(at(box(0.16, 0.24, 0.2, mat(0x25292c)), AXc + 0.45 + i * 0.22, AY - 0.1, AZ - 0.05));
  for (let i = 0; i < 22; i++) root.add(at(box(0.05, 0.14, 0.12, mat(i % 7 === 3 ? 0x2f7fd0 : i % 5 === 0 ? 0x6cae3c : 0x9aa0a6)), AXc - 0.58 + i * 0.055, AY - 0.74, AZ - 0.08));
  const wireCols = [0xcf362b, 0x2867c7, 0x1c1c1c, 0x6cae3c];
  for (let i = 0; i < 9; i++) root.add(tube([[AXc - 0.5 + i * 0.12, AY - 0.66, AZ - 0.02], [AXc - 0.5 + i * 0.12 + (rnd() - 0.5) * 0.1, AY - 0.52, AZ + 0.02], [AXc - 0.5 + i * 0.1, AY - 0.42, AZ - 0.04]], 0.008, mat(wireCols[i % 4]), 8, 4));
  // pupitre de supervision à côté : écran, voyants, arrêt d'urgence, colonne lumineuse
  const DX = 1.55, DZ = -3.1;
  root.add(at(rbox(1.2, 1.1, 0.5, grey, 0.03), DX, 0.55, DZ), at(rbox(1.2, 0.08, 0.8, grey, 0.03), DX, 1.3, DZ + 0.1, 0.5));
  const hmi = screen(0.72, 0.44, 320, 196);
  root.add(at(rbox(0.84, 0.56, 0.04, blackM, 0.012), DX - 0.1, 1.36, DZ + 0.13, -1.07), at(hmi.mesh, DX - 0.1, 1.38, DZ + 0.145, -1.07));
  const pilot = { run: led(0x35e07d, 0.05), manu: led(0xffb829, 0.05), fault: led(0xff4a3d, 0.05) };
  root.add(at(pilot.run, DX + 0.45, 1.48, DZ - 0.08), at(pilot.manu, DX + 0.45, 1.39, DZ + 0.08), at(pilot.fault, DX + 0.45, 1.3, DZ + 0.24));
  root.add(at(cyl(0.07, 0.03, mat(0xf2c200), 16), DX + 0.3, 1.2, DZ + 0.38, 0.5), at(cyl(0.05, 0.05, mat(0xcf362b), 16), DX + 0.3, 1.23, DZ + 0.4, 0.5));
  root.add(at(cyl(0.025, 0.4, steel, 8), AXc + 0.8, AY + 1.36, AZ));
  const tower = { g: led(0x35e07d, 0.09), a: led(0xffb829, 0.09), r: led(0xff4a3d, 0.09) };
  root.add(at(tower.g, AXc + 0.8, AY + 1.62, AZ), at(tower.a, AXc + 0.8, AY + 1.79, AZ), at(tower.r, AXc + 0.8, AY + 1.96, AZ));

  // ---------------------------------------------------------------- liaison Modbus : variateurs → pompes, automate → dégrilleur
  const lines = [
    [[AXc - 0.45, AY - 0.4, AZ + 0.05], [AXc - 0.6, 0.3, AZ + 0.2], [0, 0.1, -2.6], [-4.4, 0.1, -2.3], [-4.9, 1.2, -1.95], [-4.9, 1.9, -1.2], [-5.25, 1.2, -0.45]],
    [[AXc - 0.3, AY + 0.45, AZ + 0.05], [AXc - 0.9, 0.4, AZ + 0.3], [-0.5, 0.1, -2.75], [-2.0, 0.6, -1.9], [-2.2, 2.4, -1.3], [P1[0], P1[1], SZ + 0.8]],
  ].map((pts) => { root.add(tube(pts, 0.028, cable, 60, 6)); return new THREE.CatmullRomCurve3(pts.map((p) => V(...p))); });
  const beadMat = new THREE.MeshBasicMaterial({ color: 0x35e07d });
  const beads = [];
  lines.forEach((curve, li) => { for (let k = 0; k < 3; k++) { const b = dyn(sph(0.05, beadMat, 8)); b.add(glow(0x35e07d, 0.45, 0.8)); root.add(b); beads.push({ b, curve, off: k / 3 + li * 0.17, dir: k % 2 ? -1 : 1 }); } });
  // gouttes qui circulent dans le retour vers le bac tampon
  const dropMat = new THREE.MeshBasicMaterial({ color: 0x7fd3f2 });
  const drops = Array.from({ length: 6 }, (_, k) => { const d = dyn(sph(0.035, dropMat, 6)); root.add(d); return { d, off: k / 6 }; });

  // ---------------------------------------------------------------- jets et remous
  const jetMat = new THREE.MeshBasicMaterial({ color: 0xbfe6ef, transparent: true, opacity: 0.8, depthWrite: false });
  const jetGeo = new THREE.CylinderGeometry(0.05, 0.07, 1, 10).translate(0, -0.5, 0);
  const jet = (x, y, z) => { const j = dyn(at(new THREE.Mesh(jetGeo, jetMat), x, y, z)); root.add(j); return j; };
  const jA = jet(-3.25, 2.1, -0.3), jC = jet(-0.55, 1.1, -0.75), jC2 = jet(-0.93, 1.34, 0.1), jF = jet(5.3, 1.0, 0.4), jT = jet(-2.62, 0.5, 2.15);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false });
  const foam = (x, z) => { const f = dyn(at(tor(0.14, 0.02, foamMat, Math.PI * 2, 22), x, 0, z, Math.PI / 2)); root.add(f); return f; };
  const foams = [[foam(-3.25, -0.3), wB, 1.3], [foam(-0.55, -0.75), wC, 0.95], [foam(-4.9, 1.0), wA, 0.2], [foam(0.72, -0.6), wD, 0.2]];

  // ---------------------------------------------------------------- automatisme (logique du rapport)
  // niveau haut atteint → pompe à pleine vitesse ; sous le niveau haut → vitesse lente ; niveau bas → arrêt ; les pompes alternent.
  let level = 55, hz = 0, running = false, fast = false, active = 0, swap = 0, rake = 0, spin = 0, ride = 0, clean = 0.3, buf = 0.6, wasOn = false;
  const SWAP = 7;      // l'alternance de 30 s, accélérée pour la démonstration
  const redraw = every(0.2);
  const v = V();
  const pct = (y) => ((y - 0.2) / 1.45) * 100;

  function update(dt, t, focus) {
    const auto = s.mode === 'auto';
    const high = level >= pct(NH), low = level > pct(NB);
    let target = 0, screenOn;
    if (s.fault) { running = false; screenOn = false; }
    else if (auto) {
      if (high) { running = true; fast = true; } else if (running) fast = false;
      if (!low) running = false;
      target = running ? (fast ? 50 : 50 * (5000 / 32000) + 8) : 0;
      screenOn = running;
      s.pump = s.screen = running;
    } else { running = !!s.pump; target = running ? s.hz : 0; screenOn = !!s.screen; }
    if (running) { swap += dt; if (swap > SWAP) { swap = 0; active = 1 - active; } }
    if (running && !wasOn) swap = 0;
    wasOn = running;
    hz += clamp(target - hz, -dt * 40, dt * 40);
    const flow = hz / 50;
    const inflow = 5.5 + 3.5 * Math.sin(t * 0.21) + (buf > 0.15 ? 0 : -3);
    level = clamp(level + (inflow - 15 * flow) * dt, 2, 100);
    buf = clamp(buf + (0.035 * flow - 0.012 * (inflow / 6)) * dt * 3, 0.12, 0.92);
    clean = (clean + flow * dt * 0.02) % 0.85;

    wA.scale.y = 0.06 + (level / 100) * 1.45;
    wT.scale.y = 0.1 + buf * 0.68;
    wF.scale.y = 0.12 + clean;
    wB.scale.y = damp(wB.scale.y, 0.28 + flow * 0.22, 2, dt);
    wC.scale.y = damp(wC.scale.y, 0.36 + flow * 0.12, 2, dt);

    pumps.forEach((p, i) => {
      const on = running && i === active && hz > 1;
      p.lamp.userData.set(on);
      p.g.position.x = p.x + (on ? Math.sin(t * 60) * 0.004 * flow : 0);
    });
    ledNH.userData.set(high);
    ledNB.userData.set(low);
    ping.material.opacity = 0.1 + 0.14 * Math.abs(Math.sin(t * 4));

    const pour = flow > 0.04;
    jA.visible = jC.visible = jC2.visible = pour;
    jF.visible = jT.visible = pour;
    const wide = 0.6 + flow * 0.9;
    jA.scale.set(wide, 2.1 - 1.3 - wB.scale.y, wide);
    jC.scale.set(wide, 1.1 - 0.95 - wC.scale.y + 0.3, wide);
    jC2.scale.set(wide * 0.8, 1.34 - 0.95 - wC.scale.y + 0.05, wide * 0.8);
    jF.scale.set(wide * 0.7, 1.0 - 0.06 - wF.scale.y, wide * 0.7);
    jT.scale.set(wide * 0.7, 0.2, wide * 0.7);
    foams.forEach(([f, w, base], i) => {
      const k = (t * 0.9 + i * 0.3) % 1;
      f.position.y = base + w.scale.y + 0.006;
      f.scale.setScalar(0.6 + k * 1.8);
      f.visible = i === 3 || (i === 2 ? inflow > 1 : pour);
    });

    rake = (rake + (screenOn ? 0.14 : 0) * dt) % 1;
    steps.forEach((r, k) => {
      const u = (rake + k / steps.length) % 1;
      r.position.set(P0[0] + (P1[0] - P0[0]) * u, P0[1] + (P1[1] - P0[1]) * u + 0.1, SZ);
    });
    spin += dt * (1.2 + flow * 2.2);
    stir.rotation.y = spin;
    ride += dt * 0.22;
    bridge.position.z = -0.2 + Math.sin(ride) * 1.05;

    const blink = Math.sin(t * 9) > 0;
    pilot.run.userData.set(hz > 1 && !s.fault);
    pilot.manu.userData.set(!auto);
    pilot.fault.userData.set(s.fault && blink);
    tower.g.userData.set(hz > 1 && !s.fault);
    tower.a.userData.set(!auto && !s.fault);
    tower.r.userData.set(s.fault && blink);
    plcLeds.forEach((l, i) => l.userData.set(s.fault ? i === 1 && blink : i < 2 || Math.sin(t * (5 + i * 3) + i) > 0));

    for (const d of beads) {
      const u = (((t * 0.4 + d.off) % 1) + 1) % 1;
      d.curve.getPoint(d.dir > 0 ? u : 1 - u, v);
      d.b.position.copy(v);
    }
    drops.forEach(({ d, off }) => { backCurve.getPoint((t * 0.12 * (0.3 + flow) + off) % 1, v); d.position.copy(v); d.position.y += 0.07; d.visible = pour; });

    if (focus && redraw(dt)) {
      // variateurs : fréquence de la pompe en service
      drives.forEach((sc, i) => {
        const g = sc.ctx;
        g.fillStyle = '#141a12'; g.fillRect(0, 0, 96, 48);
        g.fillStyle = i === active && hz > 1 ? '#ff5a3c' : '#5a2a22';
        g.font = 'bold 30px monospace'; g.textAlign = 'right';
        g.fillText(i === active && hz > 1 ? hz.toFixed(1) : 'rdY', 90, 36);
        sc.refresh();
      });
      // supervision : synoptique du relevage
      const g = hmi.ctx;
      g.fillStyle = '#dfe5ea'; g.fillRect(0, 0, 320, 196);
      g.fillStyle = '#1e3a8a'; g.fillRect(0, 0, 320, 26);
      g.fillStyle = '#fff'; g.font = 'bold 15px sans-serif'; g.textAlign = 'left';
      g.fillText('EPURA  Pompage / Dégrillage', 8, 18);
      g.strokeStyle = '#475569'; g.lineWidth = 3; g.strokeRect(16, 44, 86, 134);
      g.fillStyle = '#6b9db0'; g.fillRect(18, 46 + 130 * (1 - level / 100), 82, 130 * (level / 100));
      for (const [y, on, name] of [[NH, high, 'NH'], [NB, low, 'NB']]) { const py = 46 + 130 * (1 - pct(y) / 100); g.fillStyle = on ? '#e11d48' : '#94a3b8'; g.beginPath(); g.arc(112, py, 6, 0, 7); g.fill(); g.fillStyle = '#0f172a'; g.font = '12px sans-serif'; g.fillText(name, 122, py + 4); }
      [0, 1].forEach((i) => { const on = running && i === active && hz > 1; g.fillStyle = on ? '#22c55e' : '#94a3b8'; g.beginPath(); g.arc(178 + i * 70, 76, 20, 0, 7); g.fill(); g.fillStyle = '#0f172a'; g.font = 'bold 14px sans-serif'; g.textAlign = 'center'; g.fillText('P' + (i + 1), 178 + i * 70, 81); g.textAlign = 'left'; });
      g.fillStyle = '#0f172a'; g.font = 'bold 34px sans-serif'; g.fillText(hz.toFixed(1), 156, 142);
      g.font = '15px sans-serif'; g.fillStyle = '#475569'; g.fillText('Hz', 248, 142);
      g.fillStyle = s.fault ? '#e11d48' : auto ? '#16a34a' : '#d97706'; g.fillRect(156, 154, 150, 26);
      g.fillStyle = '#fff'; g.font = 'bold 15px sans-serif'; g.fillText(s.fault ? 'DÉFAUT' : auto ? 'MODE AUTO' : 'MODE MANU', 166, 172);
      hmi.refresh();
    }

    const o = s.out;
    o.level = Math.round(level);
    o.hz = hz.toFixed(1);
    o.pmp = hz > 1 ? 'P' + (active + 1) : '—';
    o.bus = 'go';
    o.st = s.fault ? '@fault' : hz > 1 ? '@run' : '@stop';
  }

  return { group: root, update, foot: [13, 7.4], height: 3.6, yaw: -0.5, pitch: 0.46 };
}
