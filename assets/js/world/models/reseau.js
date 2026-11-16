// Stage Enedis (agence ASGARD, bureau d'exploitation) : la délivrance d'un accès sur une ligne HTA 20 kV,
// telle que décrite dans le rapport : réparation d'un interrupteur aérien (IACM 50 A) sous tension.
//  1. prise de schéma : on boucle la fin de ligne sur l'autre poste source (interrupteur télécommandé) puis on ouvre
//     l'interrupteur en aval, pour réduire la zone concernée ;
//  2. mise en RSE du départ (régime spécial d'exploitation : au moindre contact, coupure immédiate, sans réenclenchement) ;
//  3. délivrance de l'attestation de travail sous tension (ATST), l'équipe répare depuis la nacelle ;
//  4. fin de travaux : retour au régime normal (RNE) et au schéma normal.
// On peut aussi faire toucher la ligne par une branche pour voir la différence entre RNE (réenclenchement) et RSE.
import { THREE, mat, box, rbox, cyl, sph, cone, tor, tube, plane, at, grp, dyn, plate, glow, led, screen, lerp, damp, clamp, rng, every } from '../kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function bar(a, b, r, m, seg = 8) {
  const d = V().subVectors(b, a), len = d.length();
  const o = cyl(r, len, m, seg);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
function sign(text, w, h, bg = '#1e3a8a', color = '#fff') {
  const c = document.createElement('canvas');
  c.width = 384; c.height = Math.round((384 * h) / w);
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    let px = (c.height / lines.length) * 0.62; g.font = `700 ${px}px system-ui, sans-serif`;
    const wide = g.measureText(line).width; if (wide > c.width * 0.92) { px *= (c.width * 0.92) / wide; g.font = `700 ${px}px system-ui, sans-serif`; }
    g.fillText(line, c.width / 2, (c.height * (i + 0.5)) / lines.length);
  });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }));
  m.userData.noShadow = true;
  return m;
}

const CLIENTS = [180, 140, 220];          // clients raccordés sur chacun des trois tronçons du départ

export default function reseau(ctx) {
  const s = ctx.state;
  s.go ??= 0;
  s.touch ??= 0;
  s.cam ??= 'all';
  s.out ||= {};
  const rnd = rng(11);

  // ---------------------------------------------------------------- le terrain
  const G = 0.24;
  const root = grp(plate(12.8, 8.2));
  root.add(at(rbox(12.3, G, 7.7, mat(0xa9bf9f, { roughness: 1 }), 0.08), 0, G / 2, 0));
  const road = mat(0x6f7578, { roughness: 0.92 });
  root.add(at(box(12.3, 0.02, 0.8, road), 0, G + 0.011, -0.55));
  for (let k = 0; k < 11; k++) root.add(at(box(0.5, 0.01, 0.04, mat('white')), -5.4 + k * 1.1, G + 0.024, -0.55));
  const logo = new THREE.TextureLoader().load('images/enedis.jpg');
  logo.colorSpace = THREE.SRGBColorSpace; logo.anisotropy = 4;
  const logoMat = new THREE.MeshStandardMaterial({ map: logo, roughness: 0.5 });
  const badge = (w) => { const m = plane(w, w, logoMat); m.userData.noShadow = true; return m; };

  // matériaux d'état : conducteurs et fenêtres de chaque tronçon
  const wireMat = [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: 0x2a2d2c, emissive: 0xffa51f, emissiveIntensity: 0, roughness: 0.5 }));
  const winMat = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0x29323a, emissive: 0xffd37a, emissiveIntensity: 0, roughness: 0.3 }));
  const concrete = mat(0xb3b1a8, { roughness: 0.9 }), galva = mat(0x9ea4a8, { metalness: 0.8, roughness: 0.45 }), glassI = mat(0x6b4a34, { roughness: 0.25 });
  const TOP = G + 2.5, LZ = -1.75;

  // ---------------------------------------------------------------- la ligne HTA : poteaux béton, armements, isolateurs
  const PX = [-4.4, -3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3, 4.4];
  const P = PX.map((x, i) => [x, LZ + Math.sin(i * 1.7) * 0.12]);
  const insul = (x, y, z) => { const g = grp(); for (let i = 0; i < 3; i++) g.add(at(cyl(0.045 - i * 0.006, 0.03, glassI, 10), 0, i * 0.035, 0)); return at(g, x, y, z); };
  P.forEach(([x, z]) => {
    root.add(at(cyl(0.085, 2.5, concrete, 4, 0.055), x, G + 1.25, z, 0, Math.PI / 4, 0), at(box(0.06, 0.06, 1.0, galva), x, TOP - 0.02, z));
    for (const dz of [-0.4, 0, 0.4]) root.add(insul(x, TOP + 0.02, z + dz));
  });
  const SEC = (k) => (k < 3 ? 0 : k < 5 ? 1 : k < 7 ? 2 : 3);       // tronçon porté par la portée k → k+1
  const WY = TOP + 0.13;
  for (let k = 0; k < 8; k++) for (const dz of [-0.4, 0, 0.4]) root.add(tube([[P[k][0], WY, P[k][1] + dz], [(P[k][0] + P[k + 1][0]) / 2, WY - 0.14, (P[k][1] + P[k + 1][1]) / 2 + dz], [P[k + 1][0], WY, P[k + 1][1] + dz]], 0.013, wireMat[SEC(k)], 10, 5));

  // ---------------------------------------------------------------- les deux postes sources
  function source(x, z, name, flip) {
    const g = grp();
    g.add(at(box(2.1, 0.04, 1.9, mat(0xc9c8c1, { roughness: 1 })), 0, 0.02, 0));
    // transformateur : cuve, radiateurs, conservateur, traversées
    g.add(at(rbox(0.7, 0.62, 0.5, mat(0x7c8489, { roughness: 0.5 }), 0.04), -0.45, 0.4, -0.3));
    for (let i = 0; i < 6; i++) g.add(at(box(0.04, 0.5, 0.16, mat(0x6b7378)), -0.72 + i * 0.11, 0.38, 0.03));
    g.add(at(cyl(0.09, 0.5, mat(0x7c8489), 12), -0.45, 0.82, -0.42, 0, 0, Math.PI / 2));
    for (const dx of [-0.2, 0, 0.2]) g.add(insul(-0.45 + dx, 0.72, -0.22), at(cyl(0.012, 0.2, galva, 5), -0.45 + dx, 0.92, -0.22));
    // bâtiment des cellules HTA
    g.add(at(box(0.9, 0.8, 0.8, mat(0xeceae3, { roughness: 0.8 })), 0.5, 0.42, -0.35), at(box(1.0, 0.06, 0.9, mat(0x4b5563)), 0.5, 0.85, -0.35), at(box(0.22, 0.46, 0.01, mat(0x2563eb)), 0.3, 0.27, 0.055), at(badge(0.26), 0.68, 0.5, 0.056));
    g.add(at(sign(name, 0.8, 0.16), 0.5, 0.75, 0.056));
    // portique de départ
    for (const dz of [-0.45, 0.45]) g.add(at(box(0.05, 1.9, 0.05, galva), flip * 0.75, 0.95, 0.5 + dz * 0), at(box(0.05, 1.9, 0.05, galva), flip * 0.75, 0.95, dz));
    g.add(at(box(0.06, 0.06, 1.0, galva), flip * 0.75, 1.9, 0));
    for (const dz of [-0.4, 0, 0.4]) g.add(insul(flip * 0.75, 1.93, dz));
    // clôture
    for (const [w, d, cx, cz] of [[2.1, 0.02, 0, 0.94], [2.1, 0.02, 0, -0.94], [0.02, 1.9, 1.04, 0], [0.02, 1.9, -1.04, 0]]) g.add(at(box(w, 0.34, d, mat(0x9aa5a0, { roughness: 0.6, transparent: true, opacity: 0.45 })), cx, 0.2, cz));
    root.add(at(g, x, G, z));
    return g;
  }
  const SA = [-5.3, -3.0], SB = [5.3, -3.0];
  source(SA[0], SA[1], 'POSTE SOURCE', 1);
  source(SB[0], SB[1], 'POSTE SOURCE PS 4', -1);
  const feedMat = [wireMat[0], wireMat[3]];
  for (const dz of [-0.4, 0, 0.4]) {
    root.add(tube([[SA[0] + 0.75, G + 2.04, SA[1] + dz], [-4.75, G + 2.2, -2.4 + dz], [P[0][0], WY, P[0][1] + dz]], 0.013, feedMat[0], 10, 5));
    root.add(tube([[SB[0] - 0.75, G + 2.04, SB[1] + dz], [4.75, G + 2.2, -2.4 + dz], [P[8][0], WY, P[8][1] + dz]], 0.013, feedMat[1], 10, 5));
  }
  const rseLamp = at(led(0x22d3ee, 0.09), SA[0] + 0.5, G + 1.0, SA[1] - 0.35);
  root.add(rseLamp);

  // ---------------------------------------------------------------- interrupteurs aériens
  /** IACM : six isolateurs, trois couteaux, tringle et poignée de commande au pied du poteau. */
  function iacm(k, name, remote) {
    const [x, z] = P[k];
    const g = grp(at(box(0.5, 0.05, 1.05, galva), 0, 0, 0));
    const blades = [];
    for (const dz of [-0.4, 0, 0.4]) {
      g.add(insul(-0.2, 0.03, dz), insul(0.2, 0.03, dz));
      const b = dyn(at(grp(at(box(0.4, 0.018, 0.03, mat('copper')), 0.2, 0, 0)), -0.2, 0.16, dz));
      g.add(b); blades.push(b);
    }
    root.add(at(g, x, TOP - 0.32, z));
    root.add(at(cyl(0.012, 1.7, galva, 5), x + 0.09, G + 1.3, z + 0.09), at(rbox(0.16, 0.24, 0.12, mat(remote ? 0x9aa0a6 : 0xf2c200, { roughness: 0.5 }), 0.02), x + 0.09, G + 0.6, z + 0.12));
    const l = at(led(0x35e07d, 0.06), x + 0.09, G + 0.78, z + 0.2);
    root.add(l, at(sign(name, 0.46, 0.14, '#0f172a'), x, G + 1.5, z + 0.075));
    if (remote) root.add(at(rbox(0.3, 0.4, 0.2, mat('grey'), 0.02), x - 0.12, G + 1.0, z + 0.13), at(cyl(0.008, 0.6, mat('black'), 5), x - 0.2, G + 1.5, z + 0.13), at(box(0.3, 0.02, 0.22, mat(0x1f2a44, { roughness: 0.3 })), x - 0.12, G + 2.0, z + 0.2, 0.6));
    return { blades, led: l, x, z, open: 0 };
  }
  const swWork = iacm(3, 'IACM P219');
  const swTail = iacm(5, 'P221');
  const swLoop = iacm(7, 'INTER 3', true);
  swLoop.open = 1;

  // ---------------------------------------------------------------- postes de distribution et villages
  const villages = [[-3.0, 1.4, 1], [0.1, 1.7, 4], [2.4, 1.3, 6]];
  villages.forEach(([vx, vz, pole], sec) => {
    const [px, pz] = P[pole];
    // transformateur sur poteau (H61) et descente basse tension
    root.add(at(rbox(0.28, 0.34, 0.22, mat(0x7c8489, { roughness: 0.5 }), 0.03), px, G + 1.55, pz + 0.15));
    for (let i = 0; i < 4; i++) root.add(at(box(0.02, 0.28, 0.06, mat(0x6b7378)), px - 0.1 + i * 0.065, G + 1.55, pz + 0.28));
    root.add(tube([[px, G + 1.4, pz + 0.2], [px + 0.05, G + 0.6, pz + 0.5], [vx, G + 0.03, vz - 0.9]], 0.014, mat('black'), 16, 5));
    for (let k = 0; k < 5; k++) {
      const x = vx + (k % 3) * 0.85 - 0.85 + rnd() * 0.15, z = vz + ((k / 3) | 0) * 0.95 - 0.35 + rnd() * 0.15, w = 0.56 + rnd() * 0.16;
      root.add(at(box(w, 0.44, 0.52, mat(0xf2ede2, { roughness: 0.85 })), x, G + 0.22, z), at(cone(w * 0.78, 0.34, mat(k % 2 ? 0xb5553c : 0xa2472f, { roughness: 0.8 }), 4), x, G + 0.61, z, 0, Math.PI / 4, 0), at(box(0.1, 0.2, 0.01, mat(0x6b4a34)), x, G + 0.1, z + 0.262));
      for (const dx of [-0.16, 0.16]) { const win = at(plane(0.11, 0.13, winMat[sec]), x + dx, G + 0.27, z + 0.263); win.userData.noShadow = true; root.add(win); }
    }
  });
  const wood = mat(0x8a6a45, { roughness: 0.9 });
  for (const [x, z, h] of [[-5.3, 0.6, 1], [-1.4, 0.4, 0.8], [1.3, 0.2, 0.9], [-4.7, -3.3, 1], [-0.4, -3.3, 1.1], [1.8, -3.2, 0.9], [3.6, -3.4, 1], [-5.6, 2.9, 0.9], [-1.6, 2.9, 1]]) root.add(at(cyl(0.06, 0.4 * h, wood, 6), x, G + 0.2 * h, z), at(cone(0.36 * h, 0.9 * h, mat('green'), 8), x, G + 0.8 * h, z));

  // ---------------------------------------------------------------- la zone de RSE, peinte au sol sous la ligne
  const zoneMat = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0, depthWrite: false }));
  [[-4.9, -1.1], [-1.1, 1.1], [1.1, 3.3]].forEach(([a, b], i) => { const m = dyn(plane(b - a, 1.5, zoneMat[i])); root.add(at(m, (a + b) / 2, G + 0.03, LZ, -Math.PI / 2)); });
  const zoneSign = dyn(at(sign('ZONE DE RSE  20 kV', 1.5, 0.2, '#0d9488'), -2.4, G + 0.05, LZ + 0.95, -Math.PI / 2));
  root.add(zoneSign);

  // ---------------------------------------------------------------- le chantier : camion nacelle, techniciens, balisage
  const WX = P[3][0], truck = dyn(grp());
  const whiteT = mat(0xf4f5f3, { roughness: 0.4 }), blueT = mat(0x1d4ed8, { roughness: 0.45 });
  truck.add(at(rbox(1.15, 0.2, 0.5, whiteT, 0.03), 0, 0.27, 0), at(rbox(0.42, 0.42, 0.5, whiteT, 0.05), 0.4, 0.5, 0), at(box(0.3, 0.2, 0.46, mat(0x1c2a36, { roughness: 0.15 })), 0.47, 0.56, 0), at(box(1.16, 0.06, 0.51, blueT), 0, 0.3, 0), at(badge(0.16), 0.36, 0.42, 0.253));
  for (const dx of [-0.36, 0.38]) for (const dz of [-0.26, 0.26]) truck.add(at(cyl(0.12, 0.08, mat('rubber'), 14), dx, 0.12, dz, Math.PI / 2));
  const beacon = at(led(0xffb829, 0.05), 0.4, 0.75, 0);
  truck.add(beacon, at(cyl(0.1, 0.16, mat(0x4b5563), 14), -0.3, 0.45, 0));
  const arm1 = dyn(grp(at(box(1.25, 0.07, 0.07, whiteT), 0.625, 0, 0)));
  const arm2 = dyn(grp(at(box(1.0, 0.06, 0.06, mat(0xf0701f, { roughness: 0.5 })), 0.5, 0, 0)));
  const bucket = dyn(grp(at(rbox(0.3, 0.3, 0.3, mat(0xf4f5f3, { roughness: 0.5 }), 0.03), 0, 0.12, 0)));
  const person = (vest) => grp(at(cyl(0.06, 0.26, mat(vest, { roughness: 0.7 }), 10), 0, 0.33, 0), at(sph(0.06, mat(0xe8b796, { roughness: 0.7 }), 10), 0, 0.53, 0), at(sph(0.068, mat(0xf4f5f3, { roughness: 0.4 }), 10), 0, 0.555, 0), at(cyl(0.05, 0.2, mat(0x1e293b), 8), 0, 0.1, 0));
  const lineman = person(0xf2c200);
  const hand = dyn(at(bar(V(0, 0.4, 0), V(0.16, 0.5, 0), 0.018, mat(0xf07a1f)), 0, 0, 0));
  lineman.add(hand);
  bucket.add(at(lineman, 0, 0.0, 0));
  arm2.add(at(bucket, 1.0, 0, 0));
  arm1.add(at(arm2, 1.25, 0, 0));
  truck.add(at(arm1, -0.3, 0.55, 0));
  root.add(truck);
  const ground = dyn(at(person(0xf2c200), WX + 0.9, G + 0.02, -1.05));
  const cones = dyn(grp());
  for (const [dx, dz] of [[-1.0, 0.3], [-0.5, 0.42], [0.4, 0.42], [1.0, 0.3]]) cones.add(at(cone(0.06, 0.18, mat('orange'), 10), WX + dx, G + 0.11, -0.55 + dz));
  cones.add(at(cone(0.16, 0.26, mat(0xdc2626), 3), WX - 1.5, G + 0.2, -0.2, 0, 0.4, 0));
  root.add(ground, cones);

  // ---------------------------------------------------------------- le bureau d'exploitation (BEX), en coupe au premier plan
  const BXc = 4.2, BZc = 2.55, floorY = G + 0.02;
  root.add(at(box(3.4, 0.05, 2.4, mat(0x3f4a5a, { roughness: 0.8 })), BXc, floorY, BZc), at(box(3.4, 1.5, 0.08, mat(0xe9edf3, { roughness: 0.9 })), BXc, floorY + 0.75, BZc - 1.2), at(box(0.08, 1.5, 2.4, mat(0xdfe5ee, { roughness: 0.9 })), BXc + 1.7, floorY + 0.75, BZc));
  root.add(at(sign('BEX  ·  AGENCE ASGARD', 1.15, 0.16), BXc - 0.72, floorY + 1.33, BZc - 1.155), at(badge(0.2), BXc - 1.5, floorY + 1.33, BZc - 1.155));
  // mur d'images : le schéma unifilaire du départ, tenu à jour
  const wallScr = screen(1.5, 0.84, 512, 288);
  root.add(at(box(1.6, 0.94, 0.04, mat(0x0b1220)), BXc + 0.55, floorY + 0.86, BZc - 1.14), at(wallScr.mesh, BXc + 0.55, floorY + 0.86, BZc - 1.115));
  // pupitre, trois écrans, téléphone, chargé d'exploitation
  root.add(at(rbox(1.7, 0.05, 0.6, mat(0xd8dde6, { roughness: 0.5 }), 0.015), BXc + 0.3, floorY + 0.48, BZc - 0.1));
  for (const dx of [-0.4, 1.0]) root.add(at(box(0.05, 0.46, 0.5, mat(0x64748b)), BXc + dx, floorY + 0.24, BZc - 0.1));
  const desk = screen(0.42, 0.26, 256, 160);
  root.add(at(rbox(0.46, 0.3, 0.02, mat(0x0b1220), 0.008), BXc + 0.3, floorY + 0.72, BZc - 0.3), at(desk.mesh, BXc + 0.3, floorY + 0.72, BZc - 0.288));
  for (const [dx, ry, c] of [[-0.2, 0.45, 0x1e3a8a], [0.8, -0.45, 0x134e4a]]) root.add(at(rbox(0.42, 0.28, 0.02, mat(0x0b1220), 0.008), BXc + dx, floorY + 0.71, BZc - 0.24, 0, ry, 0), at(plane(0.38, 0.24, new THREE.MeshBasicMaterial({ color: c })), BXc + dx + Math.sin(ry) * 0.012, floorY + 0.71, BZc - 0.228, 0, ry, 0));
  for (const dx of [-0.2, 0.3, 0.8]) root.add(at(cyl(0.015, 0.1, mat(0x334155), 6), BXc + dx, floorY + 0.54, BZc - 0.28));
  root.add(at(rbox(0.26, 0.012, 0.1, mat(0x1e293b), 0.004), BXc + 0.3, floorY + 0.512, BZc + 0.02), at(rbox(0.12, 0.03, 0.16, mat(0x111827), 0.01), BXc + 0.95, floorY + 0.52, BZc + 0.02));
  const cex = person(0x1d4ed8);
  cex.scale.setScalar(1.15);
  root.add(at(cex, BXc + 0.3, floorY + 0.14, BZc + 0.42, 0, Math.PI, 0), at(rbox(0.3, 0.06, 0.3, mat(0x1e293b), 0.03), BXc + 0.3, floorY + 0.3, BZc + 0.42), at(cyl(0.02, 0.28, mat(0x64748b), 6), BXc + 0.3, floorY + 0.15, BZc + 0.42));
  root.add(at(cyl(0.012, 0.9, mat(0x64748b), 5), BXc + 1.55, floorY + 1.95, BZc - 1.1));
  // liaisons : télécommande vers l'interrupteur, téléphone vers le chantier
  const mkLink = (a, b, color) => {
    const curve = new THREE.QuadraticBezierCurve3(V(...a), V((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 1.3, (a[2] + b[2]) / 2), V(...b));
    const dots = [0, 1, 2].map((k) => { const d = dyn(sph(0.05, new THREE.MeshBasicMaterial({ color }), 8)); d.add(glow(color, 0.5, 0.9)); root.add(d); return { d, off: k / 3 }; });
    return { curve, dots, on: 0 };
  };
  const radioTop = [BXc + 1.55, floorY + 2.4, BZc - 1.1];
  const linkLoop = mkLink(radioTop, [P[7][0] - 0.2, G + 1.8, P[7][1] + 0.13], 0x60a5fa);
  const linkSrc = mkLink(radioTop, [SA[0] + 0.5, G + 1.0, SA[1] - 0.2], 0x22d3ee);
  const linkSite = mkLink([BXc + 0.95, floorY + 0.6, BZc], [WX + 0.9, G + 0.6, -1.05], 0x4ade80);

  // la branche qui touche la ligne, entre deux poteaux du premier tronçon
  const FX = (P[1][0] + P[2][0]) / 2, FZ = (P[1][1] + P[2][1]) / 2;
  const branch = dyn(at(grp(bar(V(0, 0, 1.3), V(0.1, 2.3, 0.1), 0.07, wood), at(cone(0.5, 1.3, mat('green'), 8), 0.12, 2.5, -0.1, -0.5, 0, 0)), FX, G, FZ));
  const spark = at(glow(0xfff0a0, 1.6, 0), 0.1, 2.5, 0);
  branch.add(spark);
  root.add(branch);

  // énergie qui circule
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xffd060 });
  const beads = [0, 1, 2].flatMap((sec) => [0, 1].map((k) => { const b = dyn(sph(0.05, beadMat, 8)); b.add(glow(0xffc040, 0.55, 0.9)); root.add(b); return { b, sec, off: k / 2 }; }));
  const RANGE = [[0, 3], [3, 5], [5, 7]];

  // ---------------------------------------------------------------- déroulé de l'accès
  // phases : normal → looped (schéma réduit) → rse → work (ATST délivrée) → done (travaux finis) → normal
  let phase = 'normal', clock = 0, seenGo = s.go, seenTouch = s.touch, trip = 0, recl = 0, touchT = -1, tripped = false, back = false, fix = 0, truckX = -6.5, lift = 0;
  const live = [1, 1, 1], zone = [0, 0, 0];
  const NEXT = { normal: 'loop', looped: 'rse', rse: 'atst', done: 'rne' };
  const DEMO = { normal: 4.5, looped: 3.5, rse: 3.5, done: 3 };
  const draw = every(0.25);
  const v = V();

  function advance() {
    if (tripped) { tripped = false; return; }
    if (phase === 'normal') phase = 'looped';
    else if (phase === 'looped') phase = 'rse';
    else if (phase === 'rse') { phase = 'work'; fix = 0; }
    else if (phase === 'done') { phase = 'normal'; back = true; }
    clock = 0;
  }

  function update(dt, t, focus) {
    if (s.go !== seenGo) { seenGo = s.go; advance(); }
    if (s.touch !== seenTouch) { seenTouch = s.touch; if (touchT < 0 && !tripped) { touchT = 0; recl = 0; } }
    clock += dt;
    if (!s.user && DEMO[phase] && clock > DEMO[phase] && !tripped && touchT < 0) advance();

    const rse = phase === 'rse' || phase === 'work' || phase === 'done';   // le RSE reste en place jusqu'à la restitution
    const reduced = phase !== 'normal';                     // fin de ligne reprise par PS 4
    // contact d'une branche : en RNE le départ réenclenche tout seul, en RSE il reste ouvert
    let blackout = false;
    if (touchT >= 0) {
      touchT += dt;
      if (rse) { if (touchT > 0.25) { tripped = true; touchT = -1; } }
      else { blackout = (touchT > 0.2 && touchT < 0.6) || (touchT > 1.3 && touchT < 1.7); recl = touchT > 1.7 ? 2 : touchT > 0.6 ? 1 : 0; if (touchT > 2.6) touchT = -1; }
    }
    branch.visible = touchT >= 0 || tripped;
    spark.userData.level = touchT >= 0 && touchT < 0.25 ? 1 : touchT > 1.2 && touchT < 1.35 ? 1 : 0;

    // interrupteurs
    // l'ordre des manœuvres compte : on ferme la boucle avant d'ouvrir P221, et l'inverse au retour
    swLoop.open = damp(swLoop.open, reduced ? 0 : back && clock < 0.9 ? 0 : 1, 5, dt);
    swTail.open = damp(swTail.open, reduced && !(phase === 'looped' && clock < 0.9) ? 1 : 0, 5, dt);
    for (const sw of [swWork, swTail, swLoop]) {
      sw.blades.forEach((b) => { b.rotation.z = sw.open * 1.1; });
      sw.led.userData.set(true, sw.open > 0.5 ? 0xff4a3d : 0x35e07d);
    }
    // quels tronçons sont sous tension, et depuis quel poste
    const fromA = !(tripped || blackout);
    const want = [fromA ? 1 : 0, fromA ? 1 : 0, swTail.open > 0.5 ? (swLoop.open < 0.5 ? 1 : 0) : fromA ? 1 : 0];
    let cut = 0;
    for (let k = 0; k < 3; k++) {
      live[k] = damp(live[k], want[k], 14, dt);
      wireMat[k].emissiveIntensity = live[k] * 1.5;
      winMat[k].emissiveIntensity = live[k] * 2.2;
      if (!want[k]) cut += CLIENTS[k];
      const inZone = rse && (k < 2 || !reduced) ? 1 : 0;
      zone[k] = damp(zone[k], inZone, 4, dt);
      zoneMat[k].opacity = zone[k] * (0.3 + 0.1 * Math.sin(t * 2.4)) * (tripped ? 0.5 + 0.5 * Math.sin(t * 9) : 1);
    }
    wireMat[3].emissiveIntensity = 1.5;
    zoneSign.visible = zone[0] > 0.3;
    rseLamp.userData.set(rse && (tripped ? Math.sin(t * 10) > 0 : true), tripped ? 0xff4a3d : 0x22d3ee);

    // le chantier : le camion arrive dès la prise de schéma, la nacelle ne monte qu'avec l'ATST
    const onSite = phase === 'looped' || phase === 'rse' || phase === 'work' || phase === 'done';
    truckX = damp(truckX, onSite ? WX - 0.25 : -7.2, onSite ? 1.6 : 1.1, dt);
    truck.position.set(truckX, G + 0.02, -0.55);
    truck.visible = truckX > -6.6;
    const parked = Math.abs(truckX - (WX - 0.25)) < 0.08;
    lift = damp(lift, phase === 'work' && parked && !tripped ? 1 : 0, 1.6, dt);
    arm1.rotation.z = 0.25 + lift * 0.95;
    arm2.rotation.z = -0.1 - lift * 1.05;
    arm1.rotation.y = lift * 1.35;
    bucket.rotation.z = -(arm1.rotation.z + arm2.rotation.z);
    hand.rotation.z = lift > 0.9 ? Math.sin(t * 7) * 0.5 : 0;
    ground.visible = cones.visible = parked;
    beacon.userData.set(onSite && Math.sin(t * 10) > 0);
    if (phase === 'work' && lift > 0.9 && !tripped) { fix += dt; if (fix > 6) { phase = 'done'; clock = 0; } }

    // liaisons animées
    linkLoop.on = damp(linkLoop.on, (phase === 'looped' && clock < 2.2) || (phase === 'normal' && back && clock < 2) ? 1 : 0, 6, dt);
    linkSrc.on = damp(linkSrc.on, (phase === 'rse' && clock < 2.2) || (phase === 'done') ? 1 : 0, 6, dt);
    linkSite.on = damp(linkSite.on, (phase === 'work' && lift < 0.9) || phase === 'done' || tripped ? 1 : 0, 6, dt);
    for (const L of [linkLoop, linkSrc, linkSite]) L.dots.forEach(({ d, off }) => { d.visible = L.on > 0.3; L.curve.getPoint((t * 0.6 + off) % 1, v); d.position.copy(v); });

    for (const d of beads) {
      d.b.visible = want[d.sec] > 0;
      let u = (t * 0.45 + d.off) % 1;
      if (d.sec === 2 && swTail.open > 0.5) u = 1 - u;       // la fin de ligne est alimentée par l'autre poste
      const [a, b] = RANGE[d.sec], f = a + clamp(u || 0) * (b - a), k = clamp(Math.floor(f), a, b - 1), w = f - k;
      d.b.position.set(lerp(P[k][0], P[k + 1][0], w), WY - 0.14 * Math.sin(Math.PI * w), lerp(P[k][1], P[k + 1][1], w));
    }

    // écrans du BEX : schéma unifilaire du départ
    if (focus && draw(dt)) {
      for (const [scr, W, H] of [[wallScr, 512, 288], [desk, 256, 160]]) {
        const g = scr.ctx, k = W / 512;
        g.fillStyle = '#0b1220'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#93c5fd'; g.font = `bold ${20 * k}px sans-serif`; g.textAlign = 'left';
        g.fillText('Départ HTA 20 kV', 14 * k, 28 * k);
        g.fillStyle = rse ? (tripped ? '#f87171' : '#5eead4') : '#86efac'; g.textAlign = 'right';
        g.fillText(tripped ? 'RSE : DÉCLENCHÉ' : rse ? 'RSE' : 'RNE', W - 14 * k, 28 * k);
        const y = H * 0.56, xs = (i) => (50 + i * 51.5) * k;
        if (rse) { g.fillStyle = 'rgba(94,234,212,.22)'; g.fillRect(xs(0) - 14 * k, y - 46 * k, xs(reduced ? 5 : 7) - xs(0) + 20 * k, 92 * k); }
        const seg = (a, b, on) => { g.strokeStyle = on ? '#fbbf24' : '#475569'; g.lineWidth = 5 * k; g.beginPath(); g.moveTo(xs(a), y); g.lineTo(xs(b), y); g.stroke(); };
        seg(0, 3, want[0]); seg(3, 5, want[1]); seg(5, 7, want[2]); seg(7, 8, 1);
        for (const [i, name] of [[0, 'PS'], [8, 'PS 4']]) { g.fillStyle = '#e2e8f0'; g.fillRect(xs(i) - 12 * k, y - 12 * k, 24 * k, 24 * k); g.fillStyle = '#e2e8f0'; g.font = `${13 * k}px sans-serif`; g.textAlign = 'center'; g.fillText(name, xs(i), y + 34 * k); }
        for (const [i, sw, name] of [[3, swWork, 'P219'], [5, swTail, 'P221'], [7, swLoop, 'INTER 3']]) {
          g.fillStyle = '#0b1220'; g.fillRect(xs(i) - 9 * k, y - 9 * k, 18 * k, 18 * k);
          g.strokeStyle = sw.open > 0.5 ? '#f87171' : '#4ade80'; g.lineWidth = 3 * k; g.strokeRect(xs(i) - 9 * k, y - 9 * k, 18 * k, 18 * k);
          g.beginPath(); if (sw.open > 0.5) { g.moveTo(xs(i) - 7 * k, y + 6 * k); g.lineTo(xs(i) + 5 * k, y - 7 * k); } else { g.moveTo(xs(i) - 8 * k, y); g.lineTo(xs(i) + 8 * k, y); } g.stroke();
          g.fillStyle = '#cbd5e1'; g.font = `${12 * k}px sans-serif`; g.fillText(name, xs(i), y - 20 * k);
        }
        for (const [i, on] of [[1, want[0]], [4, want[1]], [6, want[2]]]) { g.strokeStyle = on ? '#fbbf24' : '#475569'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(xs(i), y); g.lineTo(xs(i), y + 26 * k); g.stroke(); g.fillStyle = on ? '#fde68a' : '#475569'; g.beginPath(); g.arc(xs(i), y + 32 * k, 7 * k, 0, 7); g.fill(); }
        if (phase === 'work' || phase === 'done') { g.fillStyle = '#fb923c'; g.font = `bold ${13 * k}px sans-serif`; g.fillText(phase === 'work' ? 'ATST délivrée · réparation IACM 50 A' : 'Fin de travaux', xs(3), y + 70 * k); }
        scr.refresh();
      }
    }

    const o = s.out;
    o.reg = rse ? 'RSE' : 'RNE';
    o.zone = rse ? CLIENTS[0] + CLIENTS[1] + (reduced ? 0 : CLIENTS[2]) : 0;
    o.cut = cut;
    o.st = tripped ? '@tripped' : touchT >= 0 ? '@reclose' : { normal: '@normal', looped: '@looped', rse: '@rse', work: '@atst', done: '@done' }[phase];
    o.next = tripped ? 'rearm' : touchT >= 0 ? '' : NEXT[phase] || '';
    o.phase = phase;
  }

  /** Cadrages rapprochés demandés depuis le pupitre : le chantier ou le bureau d'exploitation. */
  const view = () => (s.cam === 'site' ? { x: WX + 0.1, z: -1.15, y: G + 1.35, foot: [4.2, 2.6], height: 3.0, pitch: 0.36 } : s.cam === 'bex' ? { x: BXc + 0.25, z: BZc - 0.35, y: floorY + 0.75, foot: [3.3, 2.2], height: 1.7, pitch: 0.4 } : null);
  return { group: root, update, view, foot: [12.8, 8.2], height: 3.2, yaw: -0.4, pitch: 0.52 };
}
