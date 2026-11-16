// Le corps du robot, en vraie 3D : un petit rendu transparent posé sur la page.
// mascot.js décide où il va et ce qu'il fait ; ce fichier le dessine et l'anime :
// il se tourne pour rouler, penche, s'écrase à l'atterrissage, fait de vrais saltos, tient des accessoires.

import * as THREE from '../vendor/three.min.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const { sin, cos, abs, PI, min, max } = Math;
const clamp = (v, a, b) => min(b, max(a, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export const UNITS = { w: 6.4, h: 6, height: 2.75 }; // cadre du rendu et taille du robot, en unités de scène

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25, ...o });
const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };
const box = (w, h, d, r, m, x, y, z) => mesh(new RoundedBoxGeometry(w, h, d, 5, r), m, x, y, z);
const group = (x = 0, y = 0, z = 0, ...kids) => { const g = new THREE.Group(); g.position.set(x, y, z); if (kids.length) g.add(...kids); return g; };

// ---------- le visage : un petit écran redessiné selon l'humeur ----------
function makeFace() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  let last = '';
  const star = (x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + (i * PI) / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(x + cos(a) * q, y + sin(a) * q); } g.closePath(); g.fill(); };
  const heart = (x, y, r) => { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.1, x, y - r * 0.35); g.bezierCurveTo(x + r * 0.7, y - r * 1.1, x + r * 1.5, y - r * 0.1, x, y + r * 0.9); g.fill(); };
  const pill = (x, y, w, h) => { g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, min(w, h) / 2); g.fill(); };
  const arc = (x, y, r, up) => { g.beginPath(); g.arc(x, y + (up ? r * 0.5 : -r * 0.5), r, up ? PI * 1.1 : PI * 0.1, up ? PI * 1.9 : PI * 0.9); g.stroke(); };
  function draw(eyes, blink, lx, ly, t) {
    const live = eyes === 'dizzy' || eyes === 'scan';
    const key = live ? '' : [eyes, blink > 0.5 ? 1 : 0, Math.round(lx * 6), Math.round(ly * 5)].join();
    if (!live && key === last) return;
    last = key;
    g.clearRect(0, 0, 256, 128);
    let col = '#7df3ff';
    if (eyes === 'heart') col = '#ff6b9d';
    else if (eyes === 'star') col = '#ffd84a';
    else if (eyes === 'angry' || eyes === 'x') col = '#ff6257';
    g.fillStyle = g.strokeStyle = col;
    g.shadowColor = col; g.shadowBlur = 14;
    g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round';
    const ox = lx * 13, oy = ly * 9, L = 78 + ox, Rr = 178 + ox, Y = 54 + oy;
    const shut = blink > 0.5 && !['closed', 'happy', 'x', 'dizzy', 'scan'].includes(eyes);
    let mouth = 'flat';
    if (shut) { pill(L, Y, 40, 9); pill(Rr, Y, 40, 9); }
    else switch (eyes) {
      case 'happy': arc(L, Y, 20, true); arc(Rr, Y, 20, true); mouth = 'smile'; break;
      case 'closed': arc(L, Y - 4, 18, false); arc(Rr, Y - 4, 18, false); mouth = 'smile'; break;
      case 'star': star(L, Y, 27); star(Rr, Y, 27); mouth = 'open'; break;
      case 'heart': heart(L, Y, 21); heart(Rr, Y, 21); mouth = 'smile'; break;
      case 'big': pill(L, Y, 46, 56); pill(Rr, Y, 46, 56); mouth = 'o'; break;
      case 'wink': pill(L, Y, 34, 46); arc(Rr, Y, 18, true); mouth = 'smile'; break;
      case 'uneven': pill(L, Y, 44, 54); pill(Rr, Y + 6, 30, 26); mouth = 'side'; break;
      case 'down': pill(L, Y + 12, 36, 30); pill(Rr, Y + 12, 36, 30); break;
      case 'angry': case 'sad': {
        const s = eyes === 'angry' ? 1 : -1;
        pill(L, Y + 4, 36, 40); pill(Rr, Y + 4, 36, 40);
        g.save(); g.globalCompositeOperation = 'destination-out'; g.shadowBlur = 0;
        for (const [x, d] of [[L, 1], [Rr, -1]]) { g.beginPath(); g.moveTo(x - 30, Y - 30); g.lineTo(x + 30, Y - 30); g.lineTo(x + 30, Y - 4 - 14 * s * d); g.lineTo(x - 30, Y - 4 + 14 * s * d); g.fill(); }
        g.restore(); mouth = eyes === 'angry' ? 'flat' : 'frown'; break;
      }
      case 'x': for (const x of [L, Rr]) { g.beginPath(); g.moveTo(x - 16, Y - 16); g.lineTo(x + 16, Y + 16); g.moveTo(x + 16, Y - 16); g.lineTo(x - 16, Y + 16); g.stroke(); } mouth = 'wavy'; break;
      case 'dizzy': g.lineWidth = 7; for (const [x, d] of [[78, 1], [178, -1]]) { g.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = a * 2.1; g.lineTo(x + cos(a * d + t * 7) * r, 54 + sin(a * d + t * 7) * r); } g.stroke(); } mouth = 'wavy'; break;
      case 'scan': { const x = 128 + sin(t * 4) * 76; g.fillRect(x - 5, 22, 10, 84); g.globalAlpha = 0.35; g.fillRect(40, 60, 176, 6); g.globalAlpha = 1; mouth = ''; break; }
      default: pill(L, Y, 36, 48); pill(Rr, Y, 36, 48);
    }
    g.lineWidth = 7;
    g.beginPath();
    const mx = 128 + ox * 0.6, my = 104;
    if (mouth === 'smile') g.arc(mx, my - 10, 15, PI * 0.15, PI * 0.85);
    else if (mouth === 'frown') g.arc(mx, my + 10, 15, PI * 1.15, PI * 1.85);
    else if (mouth === 'o') g.arc(mx, my, 7, 0, PI * 2);
    else if (mouth === 'open') { g.arc(mx, my - 6, 13, 0, PI); g.closePath(); g.fill(); }
    else if (mouth === 'side') { g.moveTo(mx - 10, my + 2); g.lineTo(mx + 12, my - 4); }
    else if (mouth === 'wavy') { g.moveTo(mx - 20, my); g.bezierCurveTo(mx - 10, my - 12, mx - 4, my + 12, mx + 4, my); g.bezierCurveTo(mx + 10, my - 10, mx + 14, my + 8, mx + 20, my); }
    else if (mouth === 'flat') { g.moveTo(mx - 9, my); g.lineTo(mx + 9, my); }
    g.stroke();
    tex.needsUpdate = true;
  }
  return { tex, draw };
}

// ---------- accessoires : de petits volumes simples ----------
function makeProps(M) {
  const cyl = (r1, r2, h, m, seg = 20) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
  const sph = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m);
  const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const P = {};
  // tenus dans la main droite (origine = la paume, l'objet monte le long de +y)
  P.wand = group(0, 0, 0, at(cyl(0.035, 0.035, 0.9, M.dark), 0, 0.4, 0), at(new THREE.Mesh(new THREE.OctahedronGeometry(0.16), glow('#ffd84a')), 0, 0.95, 0));
  P.wrench = group(0, 0, 0, at(cyl(0.05, 0.05, 0.7, M.steel), 0, 0.3, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.055, 10, 20, PI * 1.5), M.steel), 0, 0.76, 0, 0, 0, PI * 0.75));
  P.phone = group(0, 0, 0, at(box(0.3, 0.55, 0.05, 0.02, M.dark), 0, 0.3, 0), at(new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.46), glow('#7dd3fc')), 0, 0.3, -0.03, 0, PI, 0));
  P.cup = group(0, 0, 0, at(cyl(0.17, 0.13, 0.3, M.white), 0, 0.2, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 8, 16), M.white), 0.18, 0.2, 0), at(cyl(0.14, 0.14, 0.02, mat('#5b3a1e', { clearcoat: 1 })), 0, 0.34, 0));
  P.mic = group(0, 0, 0, at(cyl(0.05, 0.04, 0.45, M.dark), 0, 0.22, 0), at(sph(0.13, M.steel), 0, 0.52, 0));
  P.glass = group(0, 0, 0, at(cyl(0.04, 0.04, 0.4, M.dark), 0, 0.2, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 10, 28), M.dark), 0, 0.64, 0), at(new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transparent: true, opacity: 0.4, roughness: 0, side: THREE.DoubleSide })), 0, 0.64, 0));
  P.cup2 = group(0, 0, 0, at(cyl(0.16, 0.2, 0.06, M.gold), 0, 0.05, 0), at(cyl(0.04, 0.04, 0.2, M.gold), 0, 0.17, 0), at(cyl(0.24, 0.1, 0.34, M.gold), 0, 0.44, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), M.gold), 0.25, 0.46, 0), at(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), M.gold), -0.25, 0.46, 0));
  const hand = ['wand', 'wrench', 'phone', 'cup', 'mic', 'glass', 'cup2'];
  // parapluie : tenu, mais toujours droit
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 10, 0, PI * 2, 0, PI * 0.42), mat('#ef4444', { side: THREE.DoubleSide, clearcoat: 0.2 }));
  canopy.scale.y = 0.6;
  P.umbrella = group(0.95, 1.1, 0.25, at(cyl(0.03, 0.03, 2.2, M.dark), 0, 1.0, 0), at(canopy, 0, 1.45, 0));
  // sur la tête (origine = sommet du crâne)
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 24), mat('#f472b6'));
  P.partyhat = group(0, 0, 0, at(cone, 0.1, 0.33, 0, 0, 0, -0.14), at(sph(0.09, glow('#fde047')), 0.15, 0.72, 0));
  P.grad = group(0, 0, 0, at(cyl(0.36, 0.4, 0.16, M.dark, 24), 0, 0.07, 0), at(box(1.05, 0.05, 1.05, 0.02, M.dark), 0, 0.17, 0, 0, PI / 4, 0), at(cyl(0.02, 0.02, 0.36, glow('#fbbf24')), 0.46, 0.0, 0.3), at(sph(0.05, glow('#fbbf24')), 0.46, -0.2, 0.3));
  const bulbM = new THREE.MeshBasicMaterial({ color: '#fde047', toneMapped: false });
  P.bulb = group(0, 0, 0, at(sph(0.2, bulbM), 0, 0.85, 0), at(cyl(0.09, 0.07, 0.14, M.steel), 0, 0.63, 0));
  // sur le visage
  const lens = mat('#0b1020', { clearcoat: 1, roughness: 0.1 });
  P.shades = group(0, 0, 0, at(box(0.44, 0.26, 0.05, 0.02, lens), -0.25, 0, 0), at(box(0.44, 0.26, 0.05, 0.02, lens), 0.25, 0, 0), at(box(0.2, 0.05, 0.04, 0.01, lens), 0, 0.07, 0));
  // devant le corps
  const pages = mat('#f8fafc', { clearcoat: 0 });
  P.book = group(0, 1.02, 0.72, at(box(0.42, 0.04, 0.56, 0.015, pages), -0.22, 0, 0, 0, 0, 0.22), at(box(0.42, 0.04, 0.56, 0.015, pages), 0.22, 0, 0, 0, 0, -0.22), at(box(0.9, 0.03, 0.6, 0.01, mat('#1e3a8a')), 0, -0.05, 0));
  P.book.rotation.x = 0.7;
  P.laptop = group(0, 0.98, 0.66, at(box(0.9, 0.04, 0.56, 0.015, M.steel), 0, 0, 0), at(box(0.9, 0.56, 0.04, 0.015, M.dark), 0, 0.27, 0.3, 0.25), at(new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.46), glow('#22d3ee')), 0, 0.275, 0.275, 0.25 + PI, 0, PI));
  const wood = mat('#9d174d', { clearcoat: 1 });
  P.guitar = group(-0.05, 0.92, 0.5, at(cyl(0.36, 0.36, 0.12, wood, 28), 0, 0, 0, PI / 2), at(cyl(0.27, 0.27, 0.12, wood, 28), 0.36, 0.1, 0, PI / 2), at(box(0.95, 0.09, 0.05, 0.02, mat('#713f12')), 0.95, 0.26, 0.03, 0, 0, 0.27), at(cyl(0.1, 0.1, 0.13, M.dark), 0, 0, 0.01, PI / 2));
  P.tie = group(0, 1.36, 0.42, at(new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 4), mat('#4c1d95')), 0, -0.3, 0, PI, PI / 4, 0), at(box(0.14, 0.1, 0.06, 0.02, mat('#4c1d95')), 0, 0, 0));
  P.tie.scale.z = 0.35;
  // en l'air
  P.balls = group(0, 2.2, 0.5, sph(0.13, mat('#ef4444', { clearcoat: 1 })), sph(0.13, mat('#22c55e', { clearcoat: 1 })), sph(0.13, mat('#3b82f6', { clearcoat: 1 })));
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  P.beam = group(0, 0, 0, at(beam, 0, -0.55, 1.5, -PI / 2 - 0.35));
  const fl = (c, s) => at(new THREE.Mesh(new THREE.ConeGeometry(0.13 * s, 0.6 * s, 12), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, toneMapped: false })), 0, -0.3 * s, 0, PI);
  P.flame = group(0, 0.16, 0, group(-0.3, 0, 0, fl('#fb923c', 1), fl('#fde047', 0.6)), group(0.3, 0, 0, fl('#fb923c', 1), fl('#fde047', 0.6)));
  return { P, hand };
}

// ---------- le robot ----------
export function createBody(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  pm.dispose();
  scene.environmentIntensity = 0.6;
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-3, 6, 6);
  const rim = new THREE.DirectionalLight(0x9cc2ff, 1.6); rim.position.set(4, 3, -5);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.55);
  scene.add(key, rim, hemi);

  const FOV = 20, dist = UNITS.h / 2 / Math.tan((FOV * PI) / 360);
  const camera = new THREE.PerspectiveCamera(FOV, UNITS.w / UNITS.h, 1, 60);
  camera.position.set(0, 3.2, dist);
  camera.lookAt(0, 1.85, 0);
  camera.updateMatrixWorld();
  const feet = new THREE.Vector3(0, 0, 0).project(camera);
  const feetAt = (1 - feet.y) / 2; // part de la hauteur du cadre où se trouvent les roues

  const M = {
    body: mat('#3b82f6', { clearcoat: 0.8, roughness: 0.38, envMapIntensity: 0.7 }),
    head: mat('#e8edf5', { clearcoat: 1, roughness: 0.25 }),
    dark: mat('#1e293b', { roughness: 0.5 }),
    mid: mat('#475569', { roughness: 0.45 }),
    tyre: mat('#0f172a', { roughness: 0.85, clearcoat: 0 }),
    steel: mat('#cbd5e1', { metalness: 1, roughness: 0.28, clearcoat: 0 }),
    gold: mat('#f6c544', { metalness: 1, roughness: 0.25, clearcoat: 0 }),
    white: mat('#f8fafc'),
    visor: mat('#070b16', { clearcoat: 0.5, roughness: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.25 }),
    panel: mat('#ffffff', { transparent: true, opacity: 0.16, roughness: 0.2 }),
    core: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    led: new THREE.MeshBasicMaterial({ color: '#ff4d4d', toneMapped: false }),
    ear: new THREE.MeshBasicMaterial({ color: '#3b82f6', toneMapped: false }),
  };
  const face = makeFace();

  // châssis et roues
  const wheel = (x) => {
    const g = group(x, 0.27, 0,
      mesh(new THREE.TorusGeometry(0.19, 0.085, 12, 28), M.tyre),
      mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.13, 20), M.steel));
    g.children[0].rotation.y = PI / 2;
    g.children[1].rotation.z = PI / 2;
    for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(0.15, 0.24, 0.05), M.dark); b.rotation.x = (i * PI) / 3; g.add(b); }
    return g;
  };
  const wheelL = wheel(-0.55), wheelR = wheel(0.55);
  const chassis = box(0.86, 0.3, 0.62, 0.1, M.dark, 0, 0.36, 0);
  // corps
  const torso = box(1.18, 1.0, 0.82, 0.2, M.body, 0, 0.98, 0);
  const belt = box(1.2, 0.07, 0.84, 0.03, M.dark, 0, 0.56, 0);
  const panel = box(0.8, 0.56, 0.05, 0.1, M.panel, 0, 1.02, 0.4);
  const core = mesh(new THREE.CircleGeometry(0.14, 28), M.core, 0, 1.02, 0.435);
  const coreRing = mesh(new THREE.RingGeometry(0.17, 0.2, 32), M.ear, 0, 1.02, 0.434);
  const neck = mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 20), M.mid, 0, 1.52, 0);
  // tête (pivot au cou)
  const skull = box(1.3, 0.86, 0.9, 0.26, M.head, 0, 0.47, 0);
  const visor = box(1.06, 0.56, 0.1, 0.05, M.visor, 0, 0.46, 0.42);
  const screen = mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshBasicMaterial({ map: face.tex, transparent: true, toneMapped: false }), 0, 0.46, 0.474);
  const earL = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 20), M.mid, -0.68, 0.47, 0), earR = earL.clone();
  earL.rotation.z = PI / 2; earR.rotation.z = PI / 2; earR.position.x = 0.68;
  const earGlowL = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), M.ear, -0.69, 0.47, 0), earGlowR = earGlowL.clone();
  earGlowL.rotation.z = PI / 2; earGlowR.rotation.z = PI / 2; earGlowR.position.x = 0.69;
  const antenna = group(0, 0.88, 0, mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.32, 10), M.mid, 0, 0.16, 0), mesh(new THREE.SphereGeometry(0.1, 18, 14), M.led, 0, 0.36, 0), mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16), M.mid, 0, 0.02, 0));
  const hatSpot = group(0, 0.9, 0), faceSpot = group(0, 0.5, 0.5);
  const head = group(0, 1.56, 0, skull, visor, screen, earL, earR, earGlowL, earGlowR, antenna, hatSpot, faceSpot);
  // bras : épaule, coude, main
  const arm = (side) => {
    const palm = group(0, -0.36, 0);
    const handG = group(0, -0.36, 0, mesh(new THREE.SphereGeometry(0.15, 18, 14), M.head), mesh(new THREE.CapsuleGeometry(0.05, 0.1, 4, 8), M.head, 0.09 * side, -0.13, 0.05), mesh(new THREE.CapsuleGeometry(0.05, 0.1, 4, 8), M.head, -0.06 * side, -0.14, 0.05));
    const fore = group(0, -0.36, 0, mesh(new THREE.CapsuleGeometry(0.085, 0.24, 6, 12), M.dark, 0, -0.18, 0), handG, palm);
    const sh = group(0.7 * side, 1.3, 0, mesh(new THREE.SphereGeometry(0.15, 18, 14), M.mid), mesh(new THREE.CapsuleGeometry(0.09, 0.22, 6, 12), M.dark, 0, -0.2, 0), mesh(new THREE.SphereGeometry(0.1, 14, 10), M.mid, 0, -0.36, 0), fore);
    return { sh, fore, palm };
  };
  const armL = arm(-1), armR = arm(1);

  const model = group(0, -1.3, 0, wheelL, wheelR, chassis, torso, belt, panel, core, coreRing, neck, head, armL.sh, armR.sh);
  const pivot = group(0, 1.3, 0, model);
  const rig = group(0, 0, 0, pivot);
  scene.add(rig);
  // ombre de contact
  const sc = document.createElement('canvas'); sc.width = sc.height = 64;
  const sg = sc.getContext('2d'), grad = sg.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, 'rgba(15,23,42,.42)'); grad.addColorStop(1, 'rgba(15,23,42,0)');
  sg.fillStyle = grad; sg.fillRect(0, 0, 64, 64);
  const shadow = mesh(new THREE.PlaneGeometry(2.3, 1.0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }), 0, 0.01, 0);
  shadow.rotation.x = -PI / 2;
  scene.add(shadow);

  const { P: props, hand: handProps } = makeProps(M);
  for (const [name, o] of Object.entries(props)) {
    o.visible = false;
    if (handProps.includes(name)) armR.palm.add(o);
    else if (['partyhat', 'grad', 'bulb'].includes(name)) hatSpot.add(o);
    else if (name === 'shades') faceSpot.add(o);
    else if (name === 'beam') head.add(o);
    else model.add(o);
  }

  const J = { yaw: 0, ant: 0, antV: 0, wheel: 0, lookX: 0, lookY: 0, tumble: 0, night: 0, hue: 0 };
  let move = '', moveT = 0, blinkAt = 2, blink = 0, color = new THREE.Color('#3b82f6');
  const tmp = new THREE.Color();

  // Chaque mouvement règle une pose : y (hauteur), yaw, rx/rz (bascule), sx/sy (écrasement), tête, bras [levée, avant, coude].
  function pose(m, t, s) {
    const p = { x: 0, y: 0, yaw: 0, face: 1, rx: 0, rz: 0, sx: 1, sy: 1 + sin(t * 2.2) * 0.012, sc: 1, hy: 0, hp: 0, hr: 0, L: [0.22 + sin(t * 2.2) * 0.03, 0, 0.25], R: [0.22 - sin(t * 2.2) * 0.03, 0, 0.25], lookAtMouse: 1 };
    const both = (a, f, e) => { p.L = [a, f, e]; p.R = [a, f, e]; };
    switch (m) {
      case 'look': p.hy = sin(t * 1.6) * 0.7; p.yaw = sin(t * 1.6) * 0.25; p.lookAtMouse = 0; break;
      case 'walk': { const w = t * 9; p.yaw = s.dir * 1.0; p.rx = 0.1; p.y = abs(sin(w)) * 0.035; p.L = [0.2, sin(w) * 0.6, 0.5]; p.R = [0.2, -sin(w) * 0.6, 0.5]; p.hp = -0.05; p.lookAtMouse = 0; break; }
      case 'moonwalk': { const w = t * 6; p.yaw = -s.dir * 1.0; p.rx = -0.1; p.L = [0.3, sin(w) * 0.8, 0.6]; p.R = [0.3, -sin(w) * 0.8, 0.6]; p.hr = 0.1; p.lookAtMouse = 0; break; }
      case 'crouch': p.sy = 0.74; p.sx = 1.14; both(0.5, -0.7, 0.6); p.hp = 0.15; break;
      case 'hop': p.yaw = s.dir * 0.75; p.sy = 1.1; p.sx = 0.94; p.rx = (0.5 - s.air) * 0.5; both(2.7, 0.2, 0.15); p.hp = -0.2; p.lookAtMouse = 0; break;
      case 'land': p.sy = 0.78 + min(1, t * 6) * 0.22; p.sx = 1.14 - min(1, t * 6) * 0.14; both(1.0, 0.2, 0.5); break;
      case 'dangle': p.y = 0.25; p.rz = clamp(-s.vx / 1400, -0.7, 0.7); p.rx = clamp(s.vy / 2600, -0.4, 0.4); p.L = [2.85 + sin(t * 17) * 0.2, 0, 0.1]; p.R = [2.85 - sin(t * 17) * 0.2, 0, 0.1]; p.hr = -p.rz * 0.5; p.lookAtMouse = 0; break;
      case 'fallen': p.rz = J.tumble; p.y = 0.5; both(1.7 + sin(t * 20) * 0.5, 0.2, 0.3); p.lookAtMouse = 0; break;
      case 'wave': p.R = [2.55 + sin(t * 11) * 0.35, 0.25, 0.25 + sin(t * 11) * 0.2]; p.hr = 0.14; p.rz = -0.05; p.y = abs(sin(t * 5.5)) * 0.04; break;
      case 'dance': { const w = t * 6.5; p.y = abs(sin(w)) * 0.2; p.rz = sin(w) * 0.16; p.yaw = sin(w / 2) * 0.7; p.L = [1.5 + sin(w) * 1.0, 0.3, 0.6]; p.R = [1.5 - sin(w) * 1.0, 0.3, 0.6]; p.hr = -sin(w) * 0.2; p.sy = 1 - abs(cos(w)) * 0.06; p.lookAtMouse = 0; break; }
      case 'spin': p.yaw = t * 10; p.face = 0; both(1.55, 0, 0.05); p.y = 0.1 + sin(t * 5) * 0.05; p.sy = 1.05; p.lookAtMouse = 0; break;
      case 'jump': { const k = (t % 0.6) / 0.6, a = sin(PI * k); p.y = a * 0.85; p.sy = k < 0.12 || k > 0.9 ? 0.82 : 1.08; p.sx = 2 - p.sy - 0.02; both(0.4 + a * 2.4, 0.1, 0.2); break; }
      case 'flip': { const k = clamp(t / 1.05, 0, 1), a = sin(PI * k); p.y = a * 1.25; p.rx = -PI * 2 * (k * k * (3 - 2 * k)); p.sy = k < 0.1 ? 0.8 : 1; both(0.6 + a * 1.2, 0.8 * a, 0.9 * a); p.lookAtMouse = 0; break; }
      case 'shake': p.x = sin(t * 46) * 0.06; both(2.0, 0.3, 0.2); p.sy = 1.06; p.hp = -0.12; break;
      case 'tilt': p.hr = 0.38; p.rz = 0.07; p.R = [2.35, 0.5, 1.5 + sin(t * 9) * 0.12]; break;
      case 'sway': p.rz = sin(t * 2.6) * 0.14; p.x = sin(t * 2.6) * 0.1; p.L = [0.9 + sin(t * 2.6) * 0.5, 0.3, 0.5]; p.R = [0.9 - sin(t * 2.6) * 0.5, 0.3, 0.5]; p.hr = sin(t * 2.6 + 0.6) * 0.16; break;
      case 'snooze': p.sy = 0.96 + sin(t * 1.2) * 0.025; p.y = -0.02; p.hp = 0.42; p.hr = 0.12; both(0.12, 0.1, 0.1); p.lookAtMouse = 0; break;
      case 'bounce': p.y = abs(sin(t * 5.5)) * 0.22; p.sy = 1 - abs(cos(t * 5.5)) * 0.07; both(0.7 + abs(sin(t * 5.5)) * 0.5, 0.3, 0.6); break;
      case 'type': p.hp = 0.28; p.L = [0.25, 1.05 + sin(t * 16) * 0.12, 0.7]; p.R = [0.25, 1.05 - sin(t * 16) * 0.12, 0.7]; p.lookAtMouse = 0; break;
      case 'shiver': p.x = sin(t * 38) * 0.035; both(0.15, 0.95, 1.75); p.sy = 0.96; p.hp = 0.1; break;
      case 'wobble': p.rz = sin(t * 5) * 0.32; p.yaw = sin(t * 2) * 0.5; p.hr = -sin(t * 5) * 0.25; both(1.2, 0, 0.3); p.lookAtMouse = 0; break;
      case 'lean': p.rz = 0.17; p.yaw = -0.35; p.hr = -0.1; p.L = [0.75, -0.2, 1.7]; p.R = [0.3, 0.1, 0.3]; break;
      case 'salute': p.sy = 1.04; p.R = [2.1, 0.55, 2.0]; p.L = [0.08, 0, 0]; p.hp = -0.08; break;
      case 'pushup': { const d = (sin(t * 4.5) + 1) / 2; p.rx = 1.36; p.y = -0.72 - d * 0.16; both(0.5, 1.55, 0.3 + d * 1.1); p.hp = -0.9; p.yaw = 0.75; p.lookAtMouse = 0; break; }
      case 'float': p.y = 0.55 + sin(t * 2.2) * 0.1; p.rz = sin(t * 1.4) * 0.07; both(1.25, 0.1, 0.15); p.rx = sin(t * 1.8) * 0.05; break;
      case 'sneeze': { const k = t / 1.2; if (k < 0.55) { p.hp = -0.5 * (k / 0.55); p.rx = -0.14 * (k / 0.55); both(0.8, 0.5, 1.4); } else { const q = min(1, (k - 0.55) * 8); p.hp = 0.7 * q; p.rx = 0.35 * q; p.y = 0.12 * sin(PI * min(1, (k - 0.55) * 4)); both(0.5, 0.9, 0.4); } p.lookAtMouse = 0; break; }
      case 'grow': p.sc = 1 + sin(PI * clamp(t / 2.2, 0, 1)) * 0.38; both(1.4, 0, 0.2); break;
      case 'shrink': p.sc = 1 - sin(PI * clamp(t / 2.6, 0, 1)) * 0.45; both(0.6, 0.6, 1.2); p.hp = -0.2; break;
      case 'glitch': p.x = (Math.random() - 0.5) * 0.22; p.sx = 1 + (Math.random() - 0.5) * 0.3; p.sy = 1 + (Math.random() - 0.5) * 0.2; p.hr = (Math.random() - 0.5) * 0.5; both(Math.random() * 2.5, 0, Math.random()); p.lookAtMouse = 0; break;
      case 'stretch': p.sy = 1.14; p.sx = 0.93; both(2.95, -0.1, 0.05); p.hp = -0.3; p.rz = sin(t * 2) * 0.06; break;
      case 'nod': p.hp = sin(t * 9) * 0.3 + 0.05; break;
      case 'no': p.hy = sin(t * 9) * 0.55; p.lookAtMouse = 0; break;
      case 'bow': { const a = sin(PI * clamp(t / 1.8, 0, 1)); p.rx = a * 0.75; p.hp = a * 0.3; p.R = [0.2, 0.9 * a, 1.6 * a]; p.L = [0.5 * a, -0.4 * a, 0.3]; p.lookAtMouse = 0; break; }
      case 'clap': { const c = abs(sin(t * 12)); p.L = [0.42 - c * 0.3, 1.15, 0.5]; p.R = [0.42 - c * 0.3, 1.15, 0.5]; p.y = abs(sin(t * 6)) * 0.05; break; }
      case 'hiccup': { const k = (t % 0.62) / 0.62; if (k < 0.2) { p.y = sin((PI * k) / 0.2) * 0.2; p.sy = 1.1; p.hp = -0.15; both(0.7, 0, 0.4); } break; }
      default: break;
    }
    return p;
  }

  function setArm(a, side, [lift, fwd, elbow], k, dt) {
    a.sh.rotation.z = damp(a.sh.rotation.z, side * lift, k, dt);
    a.sh.rotation.x = damp(a.sh.rotation.x, -fwd, k, dt);
    a.fore.rotation.x = damp(a.fore.rotation.x, -elbow, k, dt);
  }

  return {
    feetAt,
    resize(w, h, dpr) { renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); },
    setColor(c) { color.set(c); },
    /** s : { move, eyes, prop, tint, hat, tie, dir, vx, vy, speed (px/s), unit (px par unité), air, mx, my (regard, −1…1), night } */
    render(s, dt, time) {
      if (s.move !== move) { move = s.move; moveT = 0; if (move === 'fallen') J.tumble = 0; }
      moveT += dt;
      const p = pose(move, moveT, s);
      const quick = move === 'glitch' || move === 'shake' || move === 'shiver' ? 60 : 14;

      // orientation : il se tourne vers là où il va, sinon il regarde un peu la souris
      J.lookX = damp(J.lookX, p.lookAtMouse ? s.mx : 0, 6, dt);
      J.lookY = damp(J.lookY, p.lookAtMouse ? s.my : 0, 6, dt);
      if (p.face) J.yaw = damp(J.yaw, p.yaw + J.lookX * 0.32, 9, dt); else J.yaw = p.yaw;
      if (move === 'fallen') J.tumble += clamp(-s.vx / 160, -9, 9) * dt + dt * 2.5;
      rig.rotation.y = J.yaw;
      rig.position.x = damp(rig.position.x, p.x, quick, dt);
      pivot.rotation.x = move === 'flip' ? p.rx : damp(pivot.rotation.x, p.rx, 12, dt);
      pivot.rotation.z = move === 'fallen' ? p.rz : damp(pivot.rotation.z, p.rz, 12, dt);
      const sx = damp(pivot.scale.x, p.sx * p.sc, 18, dt), sy = damp(pivot.scale.y, p.sy * p.sc, 18, dt);
      pivot.scale.set(sx, sy, sx);
      // les roues restent au sol quand le corps s'écrase
      pivot.position.y = 1.3 * sy + (pivot.userData.y = damp(pivot.userData.y || 0, p.y, 16, dt));

      head.rotation.y = damp(head.rotation.y, p.hy + J.lookX * 0.3, 10, dt);
      head.rotation.x = damp(head.rotation.x, p.hp + J.lookY * 0.22, 10, dt);
      head.rotation.z = damp(head.rotation.z, p.hr, 10, dt);
      // accessoires qui imposent une prise
      const prop = s.prop || '';
      if (handProps.includes(prop) && p.R[0] < 1.1 && move !== 'walk') p.R = [1.15, 0.75, 0.9];
      if (prop === 'umbrella') p.R = [0.9, 0.5, 1.2];
      if ((prop === 'book' || prop === 'laptop') && move !== 'type') { p.L = [0.3, 0.95, 0.9]; p.R = [0.3, 0.95, 0.9]; p.hp = 0.3; }
      if (prop === 'guitar') { p.L = [0.9, 0.9, 1.3]; p.R = [0.35, 0.8 + sin(time * 14) * 0.12, 1.2]; }
      if (prop === 'balls') { p.L = [0.5, 0.9 + sin(time * 9) * 0.25, 0.9]; p.R = [0.5, 0.9 - sin(time * 9) * 0.25, 0.9]; p.hp = -0.25; }
      setArm(armL, -1, p.L, quick, dt);
      setArm(armR, 1, p.R, quick, dt);

      // roues : elles tournent de la distance parcourue ; antenne : un ressort
      J.wheel += ((s.speed || 0) * dt) / ((s.unit || 27) * 0.27) * (move === 'moonwalk' ? -1 : 1);
      wheelL.rotation.x = wheelR.rotation.x = J.wheel;
      const push = clamp(-(s.vx || 0) / 900, -1, 1) * cos(J.yaw) + pivot.rotation.z * -0.8 + sin(time * 2.4) * 0.04;
      J.antV += ((push - J.ant) * 120 - J.antV * 9) * dt;
      J.ant = clamp(J.ant + J.antV * dt, -1.1, 1.1);
      antenna.rotation.z = J.ant;
      antenna.rotation.x = -pivot.rotation.x * 0.4;

      // visage, couleurs, lumières
      if ((blinkAt -= dt) < 0) { blink = 0.13; blinkAt = 1.6 + Math.random() * 3.6; }
      blink = max(0, blink - dt);
      face.draw(s.eyes || 'normal', blink > 0 ? 1 : 0, J.lookX, J.lookY, time);
      if (s.tint === 'rainbow') { J.hue = (J.hue + dt * 0.6) % 1; tmp.setHSL(J.hue, 0.85, 0.55); } else tmp.copy(color);
      M.body.color.lerp(tmp, 1 - Math.exp(-8 * dt));
      M.ear.color.copy(M.body.color).lerp(tmp.set('#ffffff'), 0.25);
      const beat = 0.75 + sin(time * 3) * 0.25;
      M.core.color.copy(M.body.color).lerp(tmp.set('#ffffff'), 0.55 + beat * 0.4);
      M.led.color.setRGB(1, 0.22 + beat * 0.2, 0.22 + beat * 0.15);
      J.night = damp(J.night, s.night ? 1 : 0, 4, dt);
      scene.environmentIntensity = 0.6 - J.night * 0.42;
      key.intensity = 1.7 - J.night * 1.3;
      hemi.intensity = 0.55 - J.night * 0.4;

      for (const [name, o] of Object.entries(props)) o.visible = name === prop || (name === 'grad' && s.hat === 'grad' && !['partyhat', 'bulb'].includes(prop)) || (name === 'tie' && !!s.tie);
      if (prop === 'balls') props.balls.children.forEach((b, i) => { const a = time * 5 + (i * PI * 2) / 3; b.position.set(cos(a) * 0.55, abs(sin(a)) * 1.0 - 0.3, 0); });
      if (prop === 'flame') props.flame.children.forEach((f, i) => f.scale.set(1, 0.8 + Math.random() * 0.5, 1));
      if (prop === 'bulb') props.bulb.children[0].material.color.setHSL(0.14, 1, 0.55 + sin(time * 12) * 0.12);
      if (prop === 'umbrella') props.umbrella.rotation.z = -pivot.rotation.z;

      // ombre : plus petite et plus pâle quand il décolle
      const lift = clamp((pivot.userData.y || 0) * 0.6 + (s.air || 0) * 1.2 + (move === 'dangle' || move === 'fallen' ? 1.2 : 0), 0, 1.4);
      shadow.scale.setScalar((1 - lift * 0.45) * p.sc);
      shadow.material.opacity = clamp(1 - lift * 0.75, 0, 1) * (s.tint === 'ghost' ? 0.3 : 1);
      renderer.render(scene, camera);
    },
    dispose() { renderer.dispose(); },
  };
}
