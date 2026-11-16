// Stage Veolia : le drone flottant qui cartographie l'émissaire du Cap Sicié.
// Maquette fidèle au rapport de stage et aux photos du drone final :
//  – galerie en coupe d'après le plan d'Amphitria (2,82 m de haut, 1,49 m de large, cunette de 1,07 m, banquette),
//    coques de protection de 2,50 m, puits des Moulières et sa cascade, grappin d'arrivée ;
//  – drone de 3,39 m × 0,80 m en tubes PVC noirs : flotteurs Ø125, rails hauts sur montants avec diagonale vers l'avant,
//    valise étanche (radar Vega C22 sous le couvercle, Odeon, 3 enregistreurs EL-USB-4, batterie 12 V 8 Ah),
//    projecteurs, GoPro, Insta360, anémomètre, deux sondes de pression qui traînent au fond.
// Tout le drone est construit en mètres puis mis à l'échelle K.
import { THREE, mat, box, rbox, cyl, sph, tor, tube, at, grp, dyn, plate, glow, pool, lerp, clamp, damp, env, rng, finalize, patternTex } from '../kit.js';

const K = 1.3;                       // unités de scène par mètre
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const bump = (x, c, w) => Math.exp(-((x - c) ** 2) / (2 * w * w));
/** Épaisseur de sédiments (m) le long de la tranche de galerie (x en unités de scène) : le plus gros tas est sous le puits. */
const bed = (x) => 0.05 + 0.2 * bump(x, -3.4, 0.6) + 0.36 * bump(x, -0.35, 0.8) + 0.14 * bump(x, 2.2, 0.45) + 0.24 * bump(x, 4.0, 0.7) + 0.012 * Math.sin(x * 6);

/** Tube entre deux points. */
function pipe(a, b, r, m, seg = 16) {
  const d = V().subVectors(b, a), len = d.length();
  const o = cyl(r, len, m, seg);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
/** Ligne de tubes : coudes arrondis par une sphère, manchons et joints clairs aux raccords, comme sur le vrai drone. */
function run(g, pts, r, m, sleeve, seam, every = 0.3) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], len = a.distanceTo(b);
    g.add(pipe(a, b, r, m));
    const n = Math.max(1, Math.round(len / every));
    for (let k = 0; k <= n; k++) {
      const p = V().lerpVectors(a, b, k / n), q = V().lerpVectors(a, b, Math.min(1, k / n + 0.04 / len));
      if (k < n || i === pts.length - 2) g.add(pipe(p, q, r * 1.07, sleeve));
      const s0 = V().lerpVectors(a, b, Math.min(1, k / n + 0.045 / len)), s1 = V().lerpVectors(a, b, Math.min(1, k / n + 0.052 / len));
      if (k < n) g.add(pipe(s0, s1, r * 1.075, seam, 14));
    }
  }
  for (const p of pts) g.add(at(sph(r * 1.07, sleeve, 14), p.x, p.y, p.z));
}
function label(text, w, h, opt = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = Math.round((512 * h) / w);
  const g = c.getContext('2d');
  if (opt.bg) { g.fillStyle = opt.bg; g.fillRect(0, 0, c.width, c.height); }
  g.fillStyle = opt.color || '#fff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    let px = Math.round(c.height / (lines.length * 1.45)) * (i === 0 ? 1 : 0.78);
    g.font = `${i === 0 ? 700 : 500} ${px}px system-ui, sans-serif`;
    const wide = g.measureText(line).width;
    if (wide > c.width * 0.9) { px *= (c.width * 0.9) / wide; g.font = `${i === 0 ? 700 : 500} ${px}px system-ui, sans-serif`; }
    g.fillText(line, c.width / 2, (c.height * (i + 0.5)) / lines.length + (i === 0 ? 2 : -2));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: !opt.bg, roughness: 0.7 }));
  m.userData.noShadow = true;
  return m;
}

export default function drone(ctx) {
  const s = ctx.state;
  s.run ??= true;
  s.reset ??= 0;
  s.view ??= 'all';
  s.open ??= false;
  s.out ||= {};

  // ---------------------------------------------------------------- la galerie
  const L = 11.2, Y0 = 0.24;                    // longueur de la tranche, épaisseur du radier
  const CW = 0.535, YB = 1.0, WL = 0.72;        // demi-largeur de cunette, banquette, niveau d'eau (m)
  const ZC = -0.205, YC = 2.1, RV = 0.725;      // voûte : centre et rayon (m)
  const XS = -0.35;                             // position du puits des Moulières le long de la tranche
  const root = grp(plate(12.2, 5.4));
  root.children[0].position.z = 0.05;
  const P2 = (z, y) => new THREE.Vector2(-z * K, Y0 + y * K);
  const arcPts = (R, a0, a1, n = 26) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return P2(ZC + R * Math.cos(a), YC + R * Math.sin(a)); });
  const A0 = Math.PI, A1 = Math.PI / 2 - 0.42;
  const extrude = (pts, len, m, x0) => {
    const o = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: len, bevelEnabled: false, curveSegments: 4 }), m);
    o.rotation.y = Math.PI / 2;
    o.position.x = x0;
    return o;
  };
  const concrete = mat(0xb9b6ac, { roughness: 0.96 });
  const section = [P2(CW, 0), P2(-CW, 0), P2(-CW, YB), P2(-0.95, YB), P2(-0.93, YC), ...arcPts(RV, A0, A1), ...arcPts(RV + 0.27, A1, A0), P2(-1.23, YC), P2(-1.27, -Y0 / K), P2(CW, -Y0 / K)];
  root.add(extrude(section, L, concrete, -L / 2));
  // faces de coupe hachurées, comme sur un plan
  const hatch = patternTex(64, (g, n) => { g.fillStyle = '#8f8c83'; g.fillRect(0, 0, n, n); g.strokeStyle = '#6f6c64'; g.lineWidth = 5; for (let i = -n; i < n * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + n, n); g.stroke(); } }, 2.2, 2.2);
  const cutMat = new THREE.MeshStandardMaterial({ map: hatch, roughness: 1, side: THREE.DoubleSide });
  for (const x of [-L / 2 - 0.004, L / 2 + 0.004]) {
    const cap = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(section)), cutMat);
    cap.rotation.y = Math.PI / 2; cap.position.x = x;
    root.add(cap);
  }
  // coques de protection en polyester (2,50 m chacune), posées sur la paroi et la voûte
  const prv = mat(0xd9d6c4, { roughness: 0.5, metalness: 0.05 });
  const shell = [P2(-0.925, YB + 0.02), P2(-0.905, YC), ...arcPts(RV - 0.028, A0, A1 + 0.02), ...arcPts(RV - 0.002, A1 + 0.02, A0), P2(-0.928, YC), P2(-0.948, YB + 0.02)];
  const SEG = 2.5 * K;
  for (let x = -L / 2 - 1.1; x < L / 2; x += SEG) {
    const a = Math.max(x + 0.018, -L / 2 + 0.01), b = Math.min(x + SEG - 0.018, L / 2 - 0.01);
    if (b - a > 0.1) root.add(extrude(shell, b - a, prv, a));
  }
  // banquette : traces d'humidité et dépôts
  const rnd = rng(11);
  for (let i = 0; i < 16; i++) root.add(at(cyl(0.05 + rnd() * 0.09, 0.012, mat(0x5f584c, { roughness: 1 }), 10), lerp(-5.3, 5.3, rnd()), Y0 + YB * K + 0.006, -(CW + 0.08 + rnd() * 0.28) * K));
  // sédiments : le profil se lit sur la face de coupe
  const sed = new THREE.Shape();
  sed.moveTo(-L / 2 + 0.01, 0);
  for (let i = 0; i <= 140; i++) { const x = lerp(-L / 2 + 0.01, L / 2 - 0.01, i / 140); sed.lineTo(x, bed(x) * K); }
  sed.lineTo(L / 2 - 0.01, 0);
  const sedMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(sed, { depth: CW * 2 * K - 0.01, bevelEnabled: false }), mat(0x55493a, { roughness: 1 }));
  sedMesh.position.set(0, Y0, -CW * K + 0.004);
  root.add(sedMesh);
  for (let i = 0; i < 26; i++) { const x = lerp(-5.4, 5.4, rnd()); root.add(at(sph(0.025 + rnd() * 0.04, mat(0x3d352b, { roughness: 1 }), 8), x, Y0 + bed(x) * K, lerp(-0.6, 0.6, rnd()))); }
  // eau usée
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x5f7f78, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.5, depthWrite: false });
  root.add(at(box(L - 0.03, WL * K, CW * 2 * K - 0.012, waterMat), 0, Y0 + (WL * K) / 2, 0));
  const WY = Y0 + WL * K;
  const streakMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, depthWrite: false });
  const streaks = Array.from({ length: 12 }, (_, k) => {
    const m = dyn(at(box(0.3 + rnd() * 0.3, 0.004, 0.02, streakMat), 0, WY + 0.006, lerp(-0.62, 0.62, rnd())));
    m.userData.off = k * 0.93 + rnd();
    root.add(m);
    return m;
  });

  // puits des Moulières : cheminée, cascade, remous
  const crownY = Y0 + (YC + RV + 0.27) * K, shaftZ = (ZC - 0.08) * K;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.3, 30, 1, true, Math.PI * 0.62, Math.PI * 1.5), mat(0xb9b6ac, { roughness: 0.96, side: THREE.DoubleSide }));
  root.add(at(shaft, XS, crownY + 0.4, shaftZ - 0.25));
  root.add(at(tor(0.62, 0.05, concrete), XS, crownY + 1.05, shaftZ - 0.25, Math.PI / 2));
  const fallTex = patternTex(64, (g, n) => { g.clearRect(0, 0, n, n); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`; g.fillRect(Math.random() * n, Math.random() * n, 1.5 + Math.random() * 2, 8 + Math.random() * 22); } }, 2, 3);
  const fallMat = new THREE.MeshBasicMaterial({ map: fallTex, color: 0xdfeee9, transparent: true, opacity: 0.75, depthWrite: false, side: THREE.DoubleSide });
  const fallH = crownY + 0.9 - WY;
  const fall = dyn(at(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, fallH, 18, 1, true), fallMat), XS, WY + fallH / 2, shaftZ + 0.02));
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  const foams = [0, 1, 2].map((i) => { const f = dyn(at(tor(0.2, 0.025, foamMat, Math.PI * 2, 28), XS, WY + 0.008, shaftZ + 0.02, Math.PI / 2)); f.userData.ph = i / 3; root.add(f); return f; });
  root.add(fall);
  // signalétique
  root.add(at(label('PUITS DES MOULIÈRES', 1.5, 0.2, { bg: '#1e3a8a' }), XS + 1.55, Y0 + 1.72 * K, -0.915 * K + 0.03));
  root.add(at(label('AMPHITRIA  →', 1.0, 0.18, { bg: '#f1f5f9', color: '#0f172a' }), 4.3, Y0 + 1.55 * K, -0.92 * K + 0.03));
  root.add(at(label('ÉMISSAIRE DU CAP SICIÉ\n6,4 km  ·  galerie de 2,82 m', 2.6, 0.42, { color: '#334155' }), -3.6, 0.012, 2.25, -Math.PI / 2));
  // cote de hauteur à l'entrée de la tranche, comme sur le plan de coupe
  const dim = mat(0x2563eb, { roughness: 0.6 });
  root.add(at(box(0.012, 2.82 * K, 0.012, dim), -L / 2 - 0.02, Y0 + 1.41 * K, ZC * K));
  for (const y of [0, 2.82]) root.add(at(box(0.012, 0.012, 0.22, dim), -L / 2 - 0.02, Y0 + y * K, ZC * K));
  const dimLabel = at(label('2,82 m', 0.62, 0.17, { bg: '#2563eb' }), -L / 2 - 0.03, Y0 + 1.75 * K, ZC * K + 0.42, 0, -Math.PI / 2);
  root.add(dimLabel);
  // grappin d'arrivée, pendu à son palan au bout de la tranche
  const X0 = -2.05, X1 = 3.2;
  const GX = X1 - 0.56 * K, yellow = mat(0xf2c200, { roughness: 0.45 }), steel = mat('steel');
  const hookTop = Y0 + (YC + RV) * K - 0.05;
  const hookY = WY + 1.42 * K;
  root.add(at(rbox(0.5, 0.2, 0.3, yellow, 0.04), GX, hookTop - 0.12, 0), at(cyl(0.012, hookTop - 0.22 - hookY, steel, 6), GX, (hookTop - 0.22 + hookY) / 2, 0));
  const grapnel = grp(at(cyl(0.02, 0.26, yellow, 8), 0, 0, 0));
  for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + 0.4; grapnel.add(tube([[0, -0.12, 0], [Math.cos(a) * 0.1, -0.2, Math.sin(a) * 0.1], [Math.cos(a) * 0.19, -0.1, Math.sin(a) * 0.19]], 0.014, yellow, 10, 6)); }
  root.add(at(grapnel, GX, hookY, 0));

  // ---------------------------------------------------------------- le drone (en mètres)
  const pvc = mat(0x23262b, { roughness: 0.55 }), sleeve = mat(0x2d3137, { roughness: 0.5 }), seam = mat(0x8d949b, { roughness: 0.5, metalness: 0.3 });
  const black = mat(0x15171a, { roughness: 0.6 }), caseM = mat(0x1b1d21, { roughness: 0.72 }), rod = mat(0x18191c, { roughness: 0.4, metalness: 0.4 });
  const hull = grp();
  const R1 = 0.0625, R2 = 0.055, HW = 0.34, UP = 0.44;
  // flotteurs : boucle basse, arrière arrondi, avant en pointe
  run(hull, [V(1.55, 0, 0.1), V(1.25, 0, HW), V(-1.5, 0, HW), V(-1.66, 0, 0.2), V(-1.66, 0, -0.2), V(-1.5, 0, -HW), V(1.25, 0, -HW), V(1.55, 0, -0.1), V(1.55, 0, 0.1)], R1, pvc, sleeve, seam, 0.29);
  // rails hauts : montant arrière, montant central, diagonale qui redescend vers l'avant
  for (const z of [HW, -HW]) {
    run(hull, [V(-1.45, R1, z), V(-1.45, UP, z), V(0.55, UP, z), V(1.0, 0.03, z)], R2, pvc, sleeve, seam, 0.42);
    run(hull, [V(-0.2, R1, z), V(-0.2, UP - R2, z)], R2, pvc, sleeve, seam, 0.5);
  }
  hull.add(pipe(V(-1.45, UP, -HW), V(-1.45, UP, HW), R2, pvc));
  // traverses : deux sous la platine, deux lests rouges au centre, deux à l'avant
  const red = mat(0x6a1f24, { roughness: 0.55 });
  for (const x of [-1.3, -0.72]) hull.add(pipe(V(x, 0.0, -HW), V(x, 0.0, HW), 0.02, pvc, 10));
  for (const x of [0.22, 0.5]) hull.add(pipe(V(x, 0.0, -HW), V(x, 0.0, HW), 0.045, red, 14));
  for (const x of [0.86, 1.2]) hull.add(pipe(V(x, 0.0, -HW), V(x, 0.0, HW), 0.02, pvc, 10));
  // colliers gris à l'arrière
  for (const z of [HW, -HW]) hull.add(at(tor(R1 * 1.12, 0.012, seam, Math.PI * 2, 20), -1.56, 0, z * 0.82, 0, 0.9 * Math.sign(z), 0));
  // l'autocollant, enroulé sur le rail
  const stickerTex = new THREE.TextureLoader().load('images/veolia-autocollant.png');
  stickerTex.colorSpace = THREE.SRGBColorSpace; stickerTex.anisotropy = 8;
  const sticker = (len, x, z, face) => {
    const g = new THREE.PlaneGeometry(len, 0.15, 24, 10), p = g.attributes.position, R = R2 * 1.1;
    for (let i = 0; i < p.count; i++) { const phi = face * (0.62 - p.getY(i) / R); p.setXYZ(i, p.getX(i) * face, Math.cos(phi) * R, Math.sin(phi) * R); }
    g.computeVertexNormals();
    const o = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: stickerTex, roughness: 0.4, side: THREE.DoubleSide }));
    o.userData.noShadow = true;
    return at(o, x, UP, z);
  };
  hull.add(sticker(0.56, -0.85, HW, 1), sticker(0.56, -0.85, -HW, -1));
  // point d'accroche : quatre tiges, deux sommets, une boucle de câble pour le grappin
  const apexA = V(-0.82, 1.02, 0), apexB = V(-0.3, 1.02, 0);
  for (const z of [HW, -HW]) hull.add(pipe(V(-1.32, R1, z), apexA, 0.011, rod, 8), pipe(V(0.32, R1, z), apexB, 0.011, rod, 8));
  hull.add(tube([[apexA.x, apexA.y, 0], [-0.74, 1.3, 0], [-0.56, 1.42, 0], [-0.38, 1.3, 0], [apexB.x, apexB.y, 0]], 0.007, steel, 30, 6));
  hull.add(at(tor(0.022, 0.005, steel, Math.PI * 2, 12), apexA.x, apexA.y + 0.02, 0), at(tor(0.022, 0.005, steel, Math.PI * 2, 12), apexB.x, apexB.y + 0.02, 0));

  // platine et valise étanche
  const CX = -1.0, CWd = 0.5, CD = 0.4, CH = 0.2, PY = 0.045;
  hull.add(at(box(0.7, 0.012, 0.6, black), CX, PY, 0));
  const tub = grp();
  tub.add(at(rbox(CWd, CH * 0.62, CD, caseM, 0.025), 0, CH * 0.31, 0));
  for (let i = -3; i <= 3; i++) tub.add(at(box(0.014, CH * 0.5, CD + 0.012, caseM), i * 0.07, CH * 0.3, 0));
  tub.add(at(box(0.11, 0.05, 0.004, mat(0xf4f4f1, { roughness: 0.6 })), 0.08, CH * 0.33, CD / 2 + 0.006));           // étiquette
  for (const x of [-0.14, 0.14]) tub.add(at(rbox(0.05, 0.05, 0.02, mat(0x0e0f11, { roughness: 0.5 }), 0.006), x, CH * 0.58, CD / 2 + 0.008)); // fermoirs
  for (const z of [-0.1, 0, 0.1]) tub.add(at(cyl(0.012, 0.03, mat(0xb9bcc0, { roughness: 0.6 }), 10), -CWd / 2 - 0.012, CH * 0.3, z, 0, 0, Math.PI / 2)); // presse-étoupes
  // l'intérieur : batterie au fond, platine surélevée, Odeon, enregistreurs, bornier, disjoncteur
  const inner = grp();
  inner.add(at(box(0.15, 0.09, 0.065, mat(0x202328, { roughness: 0.5 })), 0.12, 0.06, 0.12));
  inner.add(at(box(0.11, 0.004, 0.05, mat(0xe8e8e2)), 0.12, 0.107, 0.12));
  inner.add(at(box(CWd - 0.05, 0.006, CD - 0.05, mat(0x3a4047, { roughness: 0.7 })), 0, CH * 0.6, 0));
  const iy = CH * 0.6 + 0.004;
  const odeon = grp(at(rbox(0.09, 0.03, 0.2, mat(0xc9ced4, { roughness: 0.5 }), 0.012), 0, 0.015, 0), at(box(0.07, 0.004, 0.11, mat(0x2f5fb3, { roughness: 0.4 })), 0, 0.031, 0.02), at(box(0.055, 0.004, 0.045, mat(0xaebfae, { roughness: 0.3 })), 0, 0.034, -0.045));
  inner.add(at(odeon, -0.14, iy, 0.02));
  for (let i = 0; i < 3; i++) inner.add(at(cyl(0.011, 0.07, mat(0x14161a), 10), -0.03 + i * 0.04, iy + 0.012, 0.02, Math.PI / 2), at(cyl(0.012, 0.016, mat(0xf2f2f2), 10), -0.03 + i * 0.04, iy + 0.012, 0.064, Math.PI / 2));
  for (const x of [0.02, 0.1]) inner.add(at(rbox(0.065, 0.02, 0.12, mat(0x101113, { roughness: 0.35 }), 0.006), x, iy + 0.01, -0.11)); // batteries externes
  for (let i = 0; i < 9; i++) inner.add(at(box(0.008, 0.03, 0.04, mat(0x9aa0a6)), -0.07 + i * 0.0095, iy + 0.015, 0.15));
  inner.add(at(box(0.02, 0.05, 0.05, mat(0xf0f0ee)), -0.1, iy + 0.025, 0.15), at(box(0.008, 0.012, 0.014, mat(0xee7a1c)), -0.1, iy + 0.054, 0.15));
  inner.add(tube([[0.1, 0.1, 0.1], [0.02, iy + 0.03, 0.1], [-0.03, iy + 0.02, 0.13]], 0.004, mat(0xcf362b), 12, 5), tube([[0.14, 0.1, 0.1], [0.05, iy + 0.04, 0.14], [0, iy + 0.02, 0.15]], 0.004, mat(0x3b82f6), 12, 5));
  tub.add(inner);
  hull.add(at(tub, CX, PY + 0.006, 0));
  // couvercle (animé) : nervures, écrou du radar, et le Vega C22 fixé dessous, qui mesure à travers
  const lid = dyn(grp());
  lid.add(at(rbox(CWd, CH * 0.36, CD, caseM, 0.025), 0, CH * 0.18, CD / 2));
  for (let i = -3; i <= 3; i++) lid.add(at(box(0.014, CH * 0.3, CD + 0.012, caseM), i * 0.07, CH * 0.2, CD / 2));
  lid.add(at(cyl(0.03, 0.014, mat(0xd8d8d2, { roughness: 0.5 }), 8), -0.04, CH * 0.37, CD / 2 + 0.03));
  const c22 = grp(at(cyl(0.038, 0.05, mat(0xb9bcc0, { roughness: 0.45 }), 20), 0, -0.03, 0), at(cyl(0.039, 0.008, mat(0xf2c200), 20), 0, -0.004, 0), at(cyl(0.028, 0.03, mat(0xa9acb0), 16), 0, -0.07, 0));
  lid.add(at(c22, -0.04, 0.0, CD / 2 + 0.03));
  lid.position.set(CX, PY + 0.006 + CH * 0.63, -CD / 2);
  // capteurs autour de la valise
  const lens = mat(0x0b0d10, { roughness: 0.15, metalness: 0.4 });
  hull.add(at(grp(at(rbox(0.07, 0.05, 0.04, mat(0xbfc4c9, { roughness: 0.3, transparent: true, opacity: 0.55 }), 0.008), 0, 0.06, 0), at(rbox(0.055, 0.038, 0.028, mat(0x1c1d20)), 0, 0.06, 0), at(cyl(0.012, 0.012, lens, 12), 0.015, 0.063, 0.02, Math.PI / 2), at(cyl(0.008, 0.035, black, 8), 0, 0.02, 0)), CX + 0.31, PY, -0.16)); // GoPro
  hull.add(at(grp(at(cyl(0.008, 0.2, black, 8), 0, 0.1, 0), at(rbox(0.046, 0.11, 0.03, mat(0x1a1b1e, { roughness: 0.3 }), 0.014), 0, 0.25, 0), at(sph(0.017, lens, 12), 0, 0.28, 0.016), at(sph(0.017, lens, 12), 0, 0.28, -0.016), at(cyl(0.034, 0.13, mat(0xdfe6ea, { roughness: 0.05, transparent: true, opacity: 0.25 }), 16), 0, 0.25, 0)), CX + 0.31, PY, -0.05)); // Insta360 dans son caisson
  const kestrel = grp(at(rbox(0.045, 0.12, 0.022, mat(0xb8d629, { roughness: 0.45 }), 0.01), 0, 0.06, 0), at(tor(0.018, 0.006, mat(0xb8d629), Math.PI * 2, 14), 0, 0.132, 0), at(cyl(0.015, 0.006, mat(0x222), 10), 0, 0.132, 0, Math.PI / 2), at(box(0.03, 0.03, 0.002, mat(0x9fb39f, { roughness: 0.3 })), 0, 0.075, 0.012));
  hull.add(at(kestrel, CX - 0.3, PY, -0.2));
  const spotGlows = [];
  const spot = (x, z, ry) => {
    const g = grp(at(rbox(0.085, 0.085, 0.05, mat(0x1f4fb0, { roughness: 0.4 }), 0.012), 0, 0.07, 0), at(rbox(0.07, 0.07, 0.01, mat(0x101113), 0.008), 0, 0.07, 0.026), at(box(0.05, 0.05, 0.004, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfeaff, emissiveIntensity: 2.2 })), 0, 0.07, 0.033), at(box(0.06, 0.02, 0.03, black), 0, 0.015, 0));
    const h = at(glow(0xdfeaff, 0.55, 0.9), 0, 0.07, 0.06);
    g.add(h); spotGlows.push(h);
    return at(g, x, PY, z, 0, ry, 0);
  };
  hull.add(spot(CX + 0.34, 0.14, Math.PI / 2 - 0.25), spot(CX + 0.34, 0.03, Math.PI / 2 + 0.1), spot(CX - 0.33, 0.05, -Math.PI / 2));
  // câbles
  const cable = mat(0x0c0d0f, { roughness: 0.6 });
  hull.add(tube([[CX - 0.26, 0.11, 0.1], [CX - 0.36, 0.1, 0.22], [-1.5, 0.09, 0.3]], 0.006, cable, 16, 5), tube([[CX - 0.26, 0.11, -0.1], [CX - 0.36, 0.1, -0.22], [-1.5, 0.09, -0.3]], 0.006, cable, 16, 5), tube([[CX + 0.2, 0.1, 0.21], [CX + 0.3, 0.07, 0.2], [CX + 0.34, 0.09, 0.14]], 0.005, cable, 10, 5));
  finalize(hull);

  // sondes de pression : tuyaux souples lestés, à l'arrière, à gauche et à droite ; ils suivent le fond
  const hoseM = mat(0xcfd8dc, { roughness: 0.25, transparent: true, opacity: 0.6 });
  const probes = [0.3, -0.3].map((z, i) => {
    const g = dyn(grp());
    g.add(tube([[0, 0, 0], [-0.1, -0.16, 0], [-0.32, -0.36, 0], [-0.62, -0.5, 0]], 0.014, hoseM, 20, 8));
    g.add(pipe(V(-0.6, -0.49, 0), V(-0.72, -0.545, 0), 0.02, black, 10));                                            // gaine thermo
    g.add(pipe(V(-0.72, -0.545, 0), V(-0.96, -0.655, 0), 0.02, i ? mat(0xcbbf9a, { roughness: 0.7 }) : mat(0xf2c200, { roughness: 0.5 }), 10)); // lest
    g.add(pipe(V(-0.3, -0.34, 0), V(-0.58, -0.48, 0), 0.008, steel, 8));                                              // sonde Vega S51 dans le tuyau
    g.position.set(-1.56, 0.02, z);
    return g;
  });
  const LEN = Math.hypot(0.96, 0.655), PHI0 = Math.atan2(0.655, 0.96);

  // faisceau du radar et cône des projecteurs
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x45a8ea, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
  const beamH = YC + RV - WL - 0.26;
  const beam = dyn(at(new THREE.Mesh(new THREE.ConeGeometry(0.2, beamH, 24, 1, true), beamMat), CX - 0.04, 0.26 + beamH / 2, 0.03, Math.PI));
  const lit = dyn(at(pool(0xdfeaff, 2.6, 0.5), CX + 1.6, 0.02, 0.05));

  const craft = dyn(grp(hull, lid, ...probes, beam, lit));
  hull.userData.dyn = true;
  craft.scale.setScalar(K);
  root.add(craft);

  // ---------------------------------------------------------------- profil mesuré, révélé au passage
  const N = 60, BZ = 1.62;
  const barGeo = new THREE.BoxGeometry(0.12, 1, 0.15).translate(0, 0.5, 0);
  const bars = dyn(new THREE.InstancedMesh(barGeo, new THREE.MeshStandardMaterial({ roughness: 0.5 }), N));
  bars.frustumCulled = false;
  const shown = new Float32Array(N);
  const tmp = new THREE.Object3D();
  const col = new THREE.Color();
  const cGood = new THREE.Color(0x2c9a57), cWarn = new THREE.Color(0xf0b400), cBad = new THREE.Color(0xcf362b), cIdle = new THREE.Color(0x8b9297);
  const barX = (k) => lerp(-5.3, 5.3, k / (N - 1));
  root.add(bars, at(box(11, 0.04, 0.3, mat('dgrey')), 0, 0.02, BZ));

  let prog = 0, hold = 0, seenReset = s.reset, lidA = 0, lift = 0;
  const clock = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.floor(min % 60)).padStart(2, '0')}`;

  function update(dt, t, focus) {
    if (s.reset !== seenReset) { seenReset = s.reset; prog = 0; hold = 0; shown.fill(0); s.run = true; }
    if (prog >= 1) {
      hold += dt;
      if (hold > 3.2 && s.run) { prog = 0; hold = 0; shown.fill(0); }
    } else if (s.run) prog = Math.min(1, prog + dt / 20);

    // le drone avance au fil du courant ; à l'arrivée le grappin le soulève un peu
    const x = lerp(X0, X1, prog);
    lift = damp(lift, prog >= 1 ? 1 : 0, 2.5, dt);
    const under = bump(x - 1.3, XS, 0.5);                       // l'arrière passe sous la cascade
    craft.position.set(x, WY + Math.sin(t * 1.7) * 0.015 + lift * 0.16 - under * 0.02, 0);
    craft.rotation.x = Math.sin(t * 1.3) * 0.025 + under * Math.sin(t * 9) * 0.02;
    craft.rotation.z = Math.sin(t * 1.1) * 0.008 + lift * 0.02;
    grapnel.position.y = hookY + lift * 0.16 + (1 - lift) * Math.sin(t * 1.5) * 0.01;

    // sondes : l'extrémité repose sur les sédiments
    probes.forEach((g, i) => {
      const tipX = x + (-1.56 - 0.9) * K;
      const depth = clamp(WL - bed(tipX) - 0.03 + lift * 0.1, 0.12, LEN - 0.02);
      g.rotation.z = damp(g.rotation.z, Math.asin(depth / LEN) - PHI0 + Math.sin(t * 2 + i) * 0.01, 6, dt);
    });
    // valise
    lidA = damp(lidA, s.open ? 1 : 0, 5, dt);
    lid.rotation.x = -lidA * 1.75;
    beamMat.opacity = (0.13 + 0.06 * Math.sin(t * 9)) * (1 - lidA);
    fallTex.offset.y = (t * 1.9) % 1;
    foams.forEach((f) => { const k = (t * 0.7 + f.userData.ph) % 1; f.scale.setScalar(0.5 + k * 2.2); f.material.opacity = 0.5 * (1 - k); });
    for (const h of spotGlows) h.material.opacity = lerp(0.35, 1, env.night);

    for (let k = 0; k < N; k++) {
      const bx = barX(k);
      if (bx < x - 2.2) shown[k] = Math.min(1, shown[k] + dt * 3.5);
      tmp.position.set(bx, 0.04, BZ);
      tmp.scale.set(1, 0.03 + shown[k] * (0.08 + bed(bx) * 2.6), 1);
      tmp.updateMatrix();
      bars.setMatrixAt(k, tmp.matrix);
      const h = bed(bx) / 0.4;
      col.copy(cGood).lerp(cWarn, Math.min(1, h * 2));
      if (h > 0.5) col.lerp(cBad, (h - 0.5) * 2);
      bars.setColorAt(k, col.lerpColors(cIdle, col, shown[k]));
    }
    bars.instanceMatrix.needsUpdate = true;
    bars.instanceColor.needsUpdate = true;
    for (const m of streaks) m.position.x = ((t * 0.92 + m.userData.off * 1.1) % (L - 0.6)) - (L - 0.6) / 2;

    if (focus) {
      const p = root.position;
      ctx.world.light(p.x + x + 0.6, WY + 0.9, p.z + 0.3, 0xdfeaff, lerp(1.5, 11, env.night));
    }
    // afficheurs : valeurs de la mission réelle (départ 08 h 13, 6,4 km, 2 h 53)
    const o = s.out;
    const sedNow = bed(x - 2.4);
    o.pos = Math.round(prog * 6400);
    o.clock = clock(8 * 60 + 13 + prog * 173);
    o.air = (2.82 - WL - 0.1 * Math.min(1, prog / 0.42) + bump(x, XS + 1.3, 0.35) * 1.4 + 0.01 * Math.sin(t * 2.3)).toFixed(2);
    o.sed = Math.round(sedNow * 100);
    o.h2s = Math.round(4 + 96 * clamp((prog - 0.34) / 0.12) * (0.75 + 0.25 * Math.sin(prog * 21)) + Math.sin(t * 1.9));
    o.bat = (8 - prog * 2.9).toFixed(1);
  }

  /** Cadrage rapproché, demandé depuis le pupitre : la caméra suit le drone. */
  const view = () => (s.view === 'craft' || s.open ? { x: craft.position.x + (s.open ? CX * K : -0.3), z: s.open ? -0.1 : 0.1, y: WY + (s.open ? 0.3 : 0.5), foot: s.open ? [1.5, 1.3] : [5.2, 2.2], height: s.open ? 0.9 : 2.3, pitch: s.open ? 1.05 : 0.34 } : null);

  return { group: root, update, view, foot: [12.2, 5.4], height: 4.6, yaw: -0.5, pitch: 0.36 };
}
