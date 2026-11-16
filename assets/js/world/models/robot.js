// Robot détecteur d'obstacles, reproduit d'après la photo du vrai robot et son programme Arduino :
//  – coque blanche à quatre lobes, plaque brune, carte verte « IUT de TOULON – GEII », trois tourelles bleues imprimées en 3D
//    portant chacune un ultrason HC-SR04 et un capteur infrarouge Sharp, fils en boucles, écran LCD 16×2 ;
//  – en automatique, les huit scénarios du programme (seuil 35 cm, décision toutes les 300 ms, mêmes puissances) ;
//  – en manuel, la radiocommande : gâchette pour la vitesse, molette pour la direction (mixage différentiel).
import { THREE, mat, box, rbox, cyl, sph, cone, tor, tube, at, grp, dyn, plate, screen, clamp, lerp, damp, every, rng } from '../kit.js';

const BX = 4.95, BZ = 3.05, BODY = 0.72;
const CM = 22;                 // centimètres par unité de scène (le robot fait environ 30 cm)
const RANGE = 80 / CM;         // portée utile du capteur Sharp : 80 cm
const SEUIL = 35 / CM;         // « int d = 35 » dans le programme

function label(text, w, h, color = '#fff', bg) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = Math.round((256 * h) / w);
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  let px = c.height * 0.7; g.font = `700 ${px}px system-ui, sans-serif`;
  const wide = g.measureText(text).width; if (wide > c.width * 0.94) { px *= (c.width * 0.94) / wide; g.font = `700 ${px}px system-ui, sans-serif`; }
  g.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: !bg, roughness: 0.6 }));
  m.userData.noShadow = true;
  return m;
}

export default function robot(ctx) {
  const s = ctx.state;
  s.mode ??= 'auto';
  s.drive ??= '';
  s.out ||= {};
  const rnd = rng(3);

  // ---------------------------------------------------------------- la salle : sol, zone d'essai au ruban, obstacles
  const root = grp(plate(11.6, 7.8));
  root.add(at(box(11.2, 0.012, 7.4, mat(0xd9d4c8, { roughness: 0.85 })), 0, 0.006, 0));
  const tape = mat(0xf2c200, { roughness: 0.6 });
  for (const [w, d, x, z] of [[10.9, 0.07, 0, 3.5], [10.9, 0.07, 0, -3.5], [0.07, 7.07, 5.45, 0], [0.07, 7.07, -5.45, 0]]) root.add(at(box(w, 0.006, d, tape), x, 0.016, z));
  const obstacles = [];
  const put = (x, z, r, ...meshes) => { obstacles.push([x, z, r]); root.add(at(grp(...meshes), x, 0.012, z)); };
  const card = mat('card');
  put(-2.3, -1.5, 0.82, at(rbox(1.15, 1.0, 1.15, card, 0.02), 0, 0.5, 0, 0, 0.4, 0), at(box(1.17, 0.012, 0.14, mat(0xb08f5e)), 0, 1.0, 0, 0, 0.4, 0), at(box(0.5, 0.3, 0.004, mat(0xf2efe8)), 0.24, 0.55, 0.54, 0, 0.4, 0));
  put(2.3, 1.45, 0.86, at(rbox(1.35, 0.17, 0.95, mat('blue'), 0.03), 0, 0.085, 0, 0, 0.2, 0), at(rbox(1.25, 0.15, 0.9, mat('red'), 0.03), 0.03, 0.245, 0, 0, -0.15, 0), at(rbox(1.15, 0.14, 0.85, mat('ivory'), 0.03), 0, 0.39, 0, 0, 0.35, 0));
  put(0.45, -1.95, 0.46, at(box(0.8, 0.06, 0.8, mat('black')), 0, 0.03, 0), at(cone(0.3, 0.95, mat('orange'), 20), 0, 0.53, 0), at(tor(0.17, 0.035, mat('white')), 0, 0.5, 0, Math.PI / 2));
  // caisse à outils rouge
  put(-0.5, 2.05, 0.62, at(rbox(1.0, 0.42, 0.5, mat(0xc0281f, { roughness: 0.4 }), 0.04), 0, 0.21, 0, 0, 0.3, 0), at(rbox(1.02, 0.1, 0.52, mat(0x8f1c15, { roughness: 0.4 }), 0.03), 0, 0.46, 0, 0, 0.3, 0), at(tor(0.16, 0.022, mat('black'), Math.PI), 0, 0.5, 0, 0, 0.3, 0));
  // pied de tabouret d'atelier
  put(3.65, -1.55, 0.6, at(cyl(0.5, 0.05, mat('black'), 5), 0, 0.03, 0), at(cyl(0.05, 1.5, mat('steel'), 10), 0, 0.8, 0), at(cyl(0.4, 0.08, mat(0x2b50cf, { roughness: 0.6 }), 24), 0, 1.58, 0));
  // sac à dos
  put(-4.0, 1.7, 0.5, at(rbox(0.7, 0.85, 0.45, mat(0x30363b, { roughness: 0.9 }), 0.16), 0, 0.42, 0, 0, -0.5, 0), at(rbox(0.5, 0.3, 0.12, mat(0x3f474d, { roughness: 0.9 }), 0.05), 0.1, 0.3, 0.22, 0, -0.5, 0));

  // ---------------------------------------------------------------- le robot (l'avant est vers +x)
  const white = mat(0xf4f3ee, { roughness: 0.22 }), blue3d = mat(0x1d33d4, { roughness: 0.62 }), silver = mat(0xc9ccd0, { metalness: 0.85, roughness: 0.35 });
  const blackP = mat(0x111214, { roughness: 0.45 }), steel = mat('steel');
  const bot = dyn(grp());
  // coque : socle à quatre lobes et capot
  bot.add(at(rbox(1.26, 0.36, 1.3, white, 0.15), 0, 0.26, 0), at(rbox(1.04, 0.12, 1.06, white, 0.06), 0, 0.43, 0));
  for (const [x, z] of [[0.52, 0.54], [0.52, -0.54], [-0.52, 0.54], [-0.52, -0.54]]) bot.add(at(cyl(0.19, 0.2, white, 20), x, 0.18, z), at(sph(0.19, white, 18), x, 0.28, z), at(cyl(0.022, 0.012, steel, 8), x * 1.08, 0.5, z * 1.05));
  // carton, ruban rouge, adhésif noir et câble torsadé qui pend à l'avant
  bot.add(at(box(0.012, 0.2, 0.62, card), 0.635, 0.27, 0), at(box(0.006, 0.05, 0.5, mat(0xd32027, { roughness: 0.5 })), 0.643, 0.27, 0.02), at(box(0.01, 0.16, 0.12, blackP), 0.646, 0.24, -0.03));
  for (const [c, dz] of [[0xf2c200, 0], [0xcf362b, 0.014], [0x111111, -0.014]]) bot.add(tube([[0.42, 0.6, dz], [0.6, 0.52, dz + 0.02], [0.64, 0.3, dz - 0.03], [0.63, 0.1, dz + 0.02]], 0.009, mat(c), 16, 5));
  bot.add(tube([[0.3, 0.3, 0.63], [0.2, 0.36, 0.72], [0.0, 0.2, 0.9], [-0.25, 0.05, 1.0]], 0.012, mat(0xd32027), 14, 5));   // collier rouge sur le côté
  // roues, à peine visibles sous la coque
  const wheels = [-0.5, 0.5].map((z) => { const w = dyn(at(grp(cyl(0.2, 0.1, mat('rubber'), 18), at(box(0.05, 0.11, 0.3, mat('grey')), 0, 0, 0)), 0, 0.2, z, Math.PI / 2)); bot.add(w); return w; });
  bot.add(at(sph(0.07, steel, 10), 0.42, 0.07, 0), at(sph(0.07, steel, 10), -0.42, 0.07, 0));
  // plaque brune, entretoises, boulon, connecteur
  bot.add(at(cyl(0.58, 0.022, mat(0xb08a35, { roughness: 0.5 }), 8), 0, 0.5, 0, 0, Math.PI / 8, 0));
  bot.add(at(cyl(0.022, 0.1, steel, 8), 0.42, 0.56, 0.36), at(cyl(0.04, 0.03, steel, 6), 0.42, 0.53, 0.36), at(box(0.04, 0.05, 0.16, blackP), 0.46, 0.535, 0));
  for (const [x, z] of [[0.3, 0.42], [0.3, -0.42], [-0.3, 0.42], [-0.3, -0.42]]) bot.add(at(cyl(0.018, 0.14, mat('gold'), 6), x, 0.58, z));
  // carte verte et sa sérigraphie
  const pcb = mat(0x1e8f4e, { roughness: 0.45 });
  bot.add(at(rbox(0.72, 0.022, 1.12, pcb, 0.01), 0.08, 0.66, 0));
  bot.add(at(label('IUT de TOULON', 0.26, 0.04), 0.425, 0.673, -0.38, -Math.PI / 2, 0, Math.PI / 2), at(label('GEII', 0.1, 0.035), 0.385, 0.673, -0.44, -Math.PI / 2, 0, Math.PI / 2), at(label('V1.0 Déc. 2021', 0.24, 0.035), 0.425, 0.673, 0.4, -Math.PI / 2, 0, Math.PI / 2));
  // capteurs : un ultrason HC-SR04 (deux capsules) et un infrarouge Sharp
  const capsule = (y, z) => grp(at(cyl(0.062, 0.06, silver, 20), 0.03, y, z, 0, 0, Math.PI / 2), at(cyl(0.05, 0.062, mat(0x2a2c30, { roughness: 0.9 }), 16), 0.032, y, z, 0, 0, Math.PI / 2));
  const sharp = (y, z, vertical) => grp(at(rbox(0.06, vertical ? 0.24 : 0.07, vertical ? 0.07 : 0.24, blackP, 0.01), 0.03, y, z), at(cyl(0.02, 0.02, mat(0x2a1a1a, { roughness: 0.2 }), 10), 0.062, y + (vertical ? 0.06 : 0), z + (vertical ? 0 : 0.06), 0, 0, Math.PI / 2), at(cyl(0.02, 0.02, mat(0x2a1a1a, { roughness: 0.2 }), 10), 0.062, y - (vertical ? 0.06 : 0), z - (vertical ? 0 : 0.06), 0, 0, Math.PI / 2), at(box(0.04, 0.045, 0.06, mat(0xf2f2ee)), 0.04, y - (vertical ? 0 : 0.06), z + (vertical ? 0.06 : 0)));
  // tourelle centrale : large, ultrason horizontal au-dessus du Sharp
  const centre = grp(at(rbox(0.1, 0.4, 0.5, blue3d, 0.03), -0.03, 0.2, 0), at(cyl(0.12, 0.1, blue3d, 20), -0.03, 0.34, -0.11, 0, 0, Math.PI / 2), at(cyl(0.12, 0.1, blue3d, 20), -0.03, 0.34, 0.11, 0, 0, Math.PI / 2), capsule(0.3, -0.11), capsule(0.3, 0.11), sharp(0.13, 0, false), at(rbox(0.16, 0.03, 0.5, blue3d, 0.01), 0, 0.015, 0));
  for (const z of [-0.2, 0.2]) centre.add(at(cyl(0.014, 0.02, steel, 8), 0.03, 0.05, z, 0, 0, Math.PI / 2));
  bot.add(at(centre, 0.4, 0.67, 0));
  // tourelles latérales : étroites, capteurs à la verticale, tournées vers l'extérieur
  const side = (sz) => {
    const g = grp(at(rbox(0.1, 0.46, 0.22, blue3d, 0.025), -0.03, 0.23, 0), capsule(0.37, 0), capsule(0.09, 0), sharp(0.23, 0, true), at(rbox(0.14, 0.03, 0.26, blue3d, 0.01), 0, 0.015, 0));
    return at(g, 0.3, 0.67, sz * 0.43, 0, -sz * 0.62, 0);
  };
  bot.add(side(1), side(-1));
  // derrière : écran LCD, Arduino, pont en H L298N, récepteur radio et son antenne
  const lcd = screen(0.44, 0.15, 192, 64);
  const lcdHolder = at(grp(at(rbox(0.56, 0.22, 0.03, mat(0x1c3fb0, { roughness: 0.5 }), 0.008), 0, 0, -0.02), lcd.mesh, at(rbox(0.48, 0.18, 0.02, blackP, 0.006), 0, 0, -0.008)), -0.1, 0.9, 0, 0, -Math.PI / 2, 0);
  lcdHolder.rotation.z = 0; lcdHolder.children.forEach((c) => { c.rotation.x = -0.5; });
  bot.add(lcdHolder, at(box(0.03, 0.2, 0.03, blackP), -0.06, 0.76, 0.2), at(box(0.03, 0.2, 0.03, blackP), -0.06, 0.76, -0.2));
  bot.add(at(rbox(0.3, 0.03, 0.42, mat(0x16639c, { roughness: 0.45 }), 0.008), -0.08, 0.69, 0.24), at(box(0.07, 0.06, 0.07, silver), -0.2, 0.72, 0.4), at(box(0.22, 0.04, 0.03, blackP), -0.08, 0.72, 0.06), at(box(0.22, 0.04, 0.03, blackP), -0.08, 0.72, 0.43));
  bot.add(at(rbox(0.26, 0.025, 0.26, mat(0xc0281f, { roughness: 0.5 }), 0.008), -0.1, 0.69, -0.3), at(box(0.1, 0.16, 0.09, blackP), -0.17, 0.78, -0.33), at(box(0.05, 0.05, 0.12, mat(0x2867c7)), -0.02, 0.72, -0.4));
  for (let i = 0; i < 5; i++) bot.add(at(box(0.012, 0.12, 0.085, mat(0x1b1c1e)), -0.2 + i * 0.017, 0.8, -0.33));
  bot.add(at(rbox(0.12, 0.05, 0.16, blackP, 0.01), -0.22, 0.7, 0), at(cyl(0.006, 0.6, mat(0x777), 5), -0.26, 1.0, -0.05, 0, 0, 0.12));
  // les fils : grandes boucles de couleur entre les tourelles et les cartes
  const wires = [[0xf2c200, [[0.36, 0.86, 0.05], [0.2, 1.25, 0.2], [-0.05, 1.2, 0.3], [-0.08, 0.74, 0.3]]], [0xf07a1f, [[0.36, 0.86, -0.08], [0.25, 1.38, 0.0], [0.0, 1.3, 0.16], [-0.04, 0.74, 0.2]]], [0xcf362b, [[0.3, 0.9, 0.42], [0.36, 1.05, 0.1], [0.3, 1.0, -0.3], [-0.05, 0.74, -0.25]]], [0x1f6fd6, [[0.3, 0.92, -0.42], [0.1, 1.3, -0.35], [-0.15, 1.15, -0.1], [-0.1, 0.74, 0.12]]], [0x111111, [[0.3, 0.88, 0.44], [0.12, 1.12, 0.5], [-0.12, 0.98, 0.42], [-0.12, 0.74, 0.36]]], [0xf2c200, [[0.3, 0.96, -0.44], [0.4, 1.12, -0.2], [0.34, 1.02, 0.2], [0.3, 0.98, 0.42]]]];
  for (const [c, pts] of wires) bot.add(tube(pts, 0.009, mat(c, { roughness: 0.5 }), 24, 5));

  // faisceaux des trois capteurs infrarouges et arc du seuil de 35 cm
  const fan = (half) => {
    const m = new THREE.MeshBasicMaterial({ color: 0x35c7e0, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false });
    const f = dyn(new THREE.Mesh(new THREE.CircleGeometry(1, 16, -half, half * 2), m));
    f.rotation.x = -Math.PI / 2;
    return f;
  };
  const beams = [[0, 0.62, 0], [0.62, 0.46, 0.43], [-0.62, 0.46, -0.43]].map(([ang, ox, oz]) => {
    const mesh = fan(0.07);
    bot.add(at(grp(mesh), ox, 0.82, oz, 0, -ang, 0));
    return { ang, mesh, ox, oz };
  });
  const ring = dyn(new THREE.Mesh(new THREE.RingGeometry(SEUIL + 0.6 - 0.012, SEUIL + 0.6 + 0.012, 40, 1, -1.0, 2.0), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
  bot.add(ring);
  root.add(bot);

  // la radiocommande, posée au bord : gâchette (vitesse), molette (direction), bouton de mode
  const radio = grp(at(rbox(0.26, 0.5, 0.2, blackP, 0.06), 0, 0.3, 0, 0, 0, 0.25), at(rbox(0.5, 0.26, 0.24, mat(0x24272b, { roughness: 0.5 }), 0.06), 0.12, 0.62, 0), at(cyl(0.008, 0.7, steel, 5), 0.3, 1.05, 0.06), at(box(0.3, 0.03, 0.26, blackP), -0.04, 0.03, 0));
  const knob = dyn(at(grp(cyl(0.13, 0.08, mat(0x55595e, { roughness: 0.7 }), 20), at(box(0.03, 0.085, 0.2, mat(0xc9ccd0)), 0, 0, 0)), 0.14, 0.62, 0.17, Math.PI / 2));
  const trigger = dyn(at(box(0.05, 0.16, 0.06, mat(0xc0281f)), 0.16, 0.42, 0));
  radio.add(knob, trigger);
  root.add(at(radio, 4.7, 0.012, 3.0, 0, 2.4, 0));

  // ---------------------------------------------------------------- simulation
  let x = -4, z = 0.2, th = 0.35, tick = 0, pg = 0, pd = 0, sg = 1, sd = 1, scn = 1, back = 0, vl = 0, vr = 0, mol = 1500, gach = 1500;
  const dists = [RANGE, RANGE, RANGE];
  const cNear = new THREE.Color(0xff4a3d), cFar = new THREE.Color(0x35c7e0);
  function cast(ox, oz, a) {
    const dx = Math.cos(a), dz = Math.sin(a);
    let t = RANGE;
    if (dx > 1e-6) t = Math.min(t, (BX + BODY - ox) / dx);
    if (dx < -1e-6) t = Math.min(t, (-BX - BODY - ox) / dx);
    if (dz > 1e-6) t = Math.min(t, (BZ + BODY - oz) / dz);
    if (dz < -1e-6) t = Math.min(t, (-BZ - BODY - oz) / dz);
    for (const [cx, cz, r] of obstacles) {
      const px = cx - ox, pz = cz - oz, proj = px * dx + pz * dz;
      if (proj < 0) continue;
      const d2 = px * px + pz * pz - proj * proj;
      if (d2 > r * r) continue;
      t = Math.min(t, proj - Math.sqrt(r * r - d2));
    }
    return Math.max(0, t);
  }
  const blocked = (nx, nz) => Math.abs(nx) > BX || Math.abs(nz) > BZ || obstacles.some(([cx, cz, r]) => Math.hypot(nx - cx, nz - cz) < r + BODY);
  const redraw = every(0.2);
  const speed = (p) => Math.max(0, p - 30) * 0.02;        // un moteur ne décolle pas en dessous d'un certain rapport cyclique
  const map = (v, a, b, c, d) => c + ((v - a) * (d - c)) / (b - a);

  function update(dt, t, focus) {
    const c0 = Math.cos(th), s0 = Math.sin(th);
    beams.forEach((b, k) => { dists[k] = cast(x + c0 * b.ox - s0 * b.oz, z + s0 * b.ox + c0 * b.oz, th + b.ang); });
    const [dM, dD, dG] = dists;   // milieu, droite, gauche

    if (s.mode === 'auto') {
      mol = damp(mol, 1500, 8, dt); gach = damp(gach, 1500, 8, dt);
      if (back > 0) back -= dt;
      else if ((tick += dt) >= 0.3) {
        tick = 0;
        const G = dG > SEUIL, M = dM > SEUIL, D = dD > SEUIL;
        sg = sd = 1;
        if (G && M && D) { scn = 1; pg = 90; pd = 90; }
        else if (G && M && !D) { scn = 2; pg = 40; pd = 78; }                 // obstacle à droite : on s'en écarte
        else if (G && !M && D) { scn = 3; if (rnd() < 0.5) { pg = 78; pd = 40; } else { pg = 40; pd = 78; } }
        else if (G && !M && !D) { scn = 4; pg = 40; pd = 78; }
        else if (!G && M && D) { scn = 5; pg = 78; pd = 40; }                 // obstacle à gauche
        else if (!G && M && !D) { scn = 6; pg = 78; pd = 78; }                // couloir : on avance prudemment
        else if (!G && !M && D) { scn = 7; pg = 78; pd = 40; }
        else { scn = 8; sg = sd = -1; pd = 120; pg = 0; back = 0.75; }        // cul-de-sac : on recule en pivotant
      }
    } else {
      // radiocommande : impulsions de 1000 à 2000 µs, zone morte entre 1450 et 1550
      gach = damp(gach, s.drive === 'f' ? 2000 : s.drive === 'b' ? 1000 : 1500, 9, dt);
      mol = damp(mol, s.drive === 'r' ? 2000 : s.drive === 'l' ? 1000 : 1500, 9, dt);
      let vit = 0; sg = sd = 1; scn = 0; back = 0;
      if (gach > 1550) vit = map(gach, 1550, 2000, 0, 100);
      else if (gach < 1450) { vit = map(gach, 1450, 1000, 0, 100); sg = sd = -1; }
      else if (Math.abs(mol - 1500) > 50) vit = 55;                            // pour pivoter sur place depuis le pupitre
      let cg = 255, cd = 255;
      if (mol > 1550) cd = map(mol, 1550, 2000, 255, 0);
      if (mol < 1450) cg = map(mol, 1450, 1000, 255, 0);
      pg = Math.min(255, (vit * cg) / 100); pd = Math.min(255, (vit * cd) / 100);
      if (vit === 55) { pg = mol > 1500 ? 110 : 0; pd = mol > 1500 ? 0 : 110; }
    }
    vl = damp(vl, sg * speed(pg), 8, dt);
    vr = damp(vr, sd * speed(pd), 8, dt);
    const v = (vl + vr) / 2, w = (vl - vr) / 1.2;
    th += w * dt;
    const nx = x + Math.cos(th) * v * dt, nz = z + Math.sin(th) * v * dt;
    if (!blocked(nx, nz)) { x = nx; z = nz; } else { vl *= 0.5; vr *= 0.5; }

    bot.position.set(x, 0.012, z);
    bot.rotation.y = -th;
    wheels[0].rotation.y -= (vl / 0.2) * dt;
    wheels[1].rotation.y -= (vr / 0.2) * dt;
    beams.forEach((b, k) => {
      const d = Math.max(0.05, dists[k]);
      b.mesh.scale.set(d, d, 1);
      b.mesh.material.color.copy(d < SEUIL ? cNear : cFar);
      b.mesh.material.opacity = d < SEUIL ? 0.42 : 0.24;
    });
    ring.visible = s.mode === 'auto';
    knob.rotation.y = ((mol - 1500) / 500) * 0.9;
    trigger.rotation.z = ((gach - 1500) / 500) * 0.35;

    const cm = (d) => (d >= RANGE - 0.01 ? '--' : String(Math.round(d * CM)).padStart(2, ' '));
    if (focus && redraw(dt)) {
      const g = lcd.ctx;
      g.fillStyle = '#1b46d8'; g.fillRect(0, 0, 192, 64);
      g.fillStyle = '#eef4ff'; g.font = 'bold 22px monospace'; g.textAlign = 'left';
      g.fillText(s.mode === 'auto' ? 'Mode Auto   S' + scn : 'Mode Manu', 6, 25);
      g.fillText(`G${cm(dG)} M${cm(dM)} D${cm(dD)}`, 6, 53);
      lcd.refresh();
    }
    const o = s.out;
    o.dist = dM >= RANGE - 0.01 ? '80+' : Math.round(dM * CM);
    o.scn = s.mode === 'auto' ? scn + ' / 8' : '—';
    o.pl = Math.round(sg * pg);
    o.pr = Math.round(sd * pd);
  }

  return { group: root, update, foot: [11.6, 7.8], height: 1.9, yaw: -0.36, pitch: 0.6, view: () => (s.zoom ? { x: x, z: z, y: 0.5, foot: [2.7, 2.4], height: 1.5, pitch: 0.4 } : null) };
}
