// Boîte à outils 3D : matériaux, primitives, fusion des géométries, écrans, voyants.
import * as THREE from '../../vendor/three.min.js';
import { RoundedBoxGeometry } from '../../vendor/RoundedBoxGeometry.js';
import { mergeGeometries } from '../../vendor/BufferGeometryUtils.js';

export { THREE };

// État d'ambiance partagé (0 = plein jour, 1 = nuit).
export const env = { night: 0 };
export const glows = [];   // sprites lumineux, opacité pilotée par l'ambiance
export const themed = [];  // matériaux dont la couleur suit le thème

const PALETTE = {
  white:    { color: 0xf1f1ec, roughness: 0.55 },
  ivory:    { color: 0xe6e2d6, roughness: 0.7 },
  grey:     { color: 0xb7bcb8, roughness: 0.6 },
  dgrey:    { color: 0x5a625f, roughness: 0.6 },
  black:    { color: 0x1d2120, roughness: 0.5 },
  rubber:   { color: 0x151716, roughness: 0.92 },
  steel:    { color: 0xc5cbcf, roughness: 0.32, metalness: 1 },
  alu:      { color: 0xd2d6d8, roughness: 0.48, metalness: 0.85 },
  copper:   { color: 0xc87533, roughness: 0.35, metalness: 1 },
  gold:     { color: 0xd9b25a, roughness: 0.3, metalness: 1 },
  pcb:      { color: 0x1c7a40, roughness: 0.45 },
  pcbBlue:  { color: 0x165f9c, roughness: 0.45 },
  red:      { color: 0xcf362b, roughness: 0.5 },
  orange:   { color: 0xee7a1c, roughness: 0.5 },
  yellow:   { color: 0xf0b400, roughness: 0.5 },
  green:    { color: 0x2c9a57, roughness: 0.55 },
  blue:     { color: 0x2867c7, roughness: 0.5 },
  sky:      { color: 0x5aa6e0, roughness: 0.5 },
  pvc:      { color: 0x8b9297, roughness: 0.5 },
  concrete: { color: 0xd4d5cf, roughness: 0.95 },
  card:     { color: 0xc49a63, roughness: 0.85 },
  soil:     { color: 0x4f3d2f, roughness: 1 },
  leaf:     { color: 0x49a84c, roughness: 0.7 },
  water:    { color: 0x2f9fc6, roughness: 0.08, transparent: true, opacity: 0.72 },
  glass:    { color: 0xdcecef, roughness: 0.05, transparent: true, opacity: 0.22 },
  sludge:   { color: 0x6b5a45, roughness: 1 },
};
const mats = new Map();

/** Matériau partagé de la palette, ou variante nommée avec ses propres réglages. */
export function mat(name, extra) {
  const key = extra ? name + JSON.stringify(extra) : name;
  if (!mats.has(key)) {
    const m = new THREE.MeshStandardMaterial({ ...(PALETTE[name] || { color: name }), ...extra });
    if (m.transparent) m.depthWrite = false;
    mats.set(key, m);
  }
  return mats.get(key);
}

/** Matériau dont la couleur glisse entre une teinte de jour et une teinte de nuit. */
export function themedMat(day, night, extra = {}) {
  const m = new THREE.MeshStandardMaterial({ color: day, roughness: 0.8, ...extra });
  themed.push({ m, day: new THREE.Color(day), night: new THREE.Color(night) });
  return m;
}
let plateMat;
export const plateMaterial = () => (plateMat ||= themedMat(0xf7f9fd, 0x1e293b, { roughness: 0.85 }));

// ---------- primitives ----------
export const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
export const rbox = (w, h, d, m, r = 0.08, seg = 3) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)), m);
export const cyl = (r, h, m, seg = 24, rTop = r) => new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, h, seg), m);
export const sph = (r, m, seg = 20) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg / 2 | 0)), m);
export const tor = (R, r, m, arc = Math.PI * 2, seg = 40) => new THREE.Mesh(new THREE.TorusGeometry(R, r, 10, seg, arc), m);
export const cone = (r, h, m, seg = 24) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
export const plane = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
export function tube(pts, r, m, seg = 40, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, radial, false), m);
}
export function lathe(profile, m, seg = 32) {
  return new THREE.Mesh(new THREE.LatheGeometry(profile.map((p) => new THREE.Vector2(p[0], p[1])), seg), m);
}
/** Place et oriente un objet, puis le renvoie. */
export function at(o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
}
export function grp(...kids) {
  const g = new THREE.Group();
  for (const k of kids) if (k) g.add(k);
  return g;
}
/** Marque un objet comme animé : il ne sera pas fusionné. */
export function dyn(o) {
  o.userData.dyn = true;
  return o;
}

/** Socle arrondi d'une maquette, dessus à y = 0. */
export function plate(w, d, h = 0.28) {
  return at(rbox(w, h, d, plateMaterial(), 0.14, 4), 0, -h / 2, 0);
}

// ---------- fusion des parties fixes (beaucoup moins d'appels de dessin) ----------
const EMPTY = new THREE.BufferGeometry();
export function finalize(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const done = [];
  const tmp = new THREE.Matrix4();
  (function walk(o) {
    if (o.userData.dyn) return;
    if (o.isMesh && !o.isInstancedMesh) {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!g.attributes.normal) g.computeVertexNormals();
      g.applyMatrix4(tmp.multiplyMatrices(inv, o.matrixWorld));
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material).push(g);
      done.push(o);
    }
    for (const c of o.children.slice()) walk(c);
  })(root);
  for (const o of done) {
    o.geometry.dispose();
    if (o.children.length) o.geometry = EMPTY;
    else o.parent.remove(o);
  }
  for (const [m, list] of buckets) {
    const mesh = new THREE.Mesh(mergeGeometries(list, false), m);
    list.forEach((g) => g.dispose());
    mesh.userData.merged = true;
    root.add(mesh);
  }
  root.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    const flat = m.isMeshBasicMaterial || m.transparent || o.userData.noShadow;
    o.castShadow = !flat;
    o.receiveShadow = !m.isMeshBasicMaterial && !o.userData.noShadow;
  });
  return root;
}

// ---------- lumière : halos, voyants, flaques de lumière ----------
let glowTex;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,.55)');
  r.addColorStop(0.6, 'rgba(255,255,255,.12)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}
/** Halo additif. `level` (0..1) règle son intensité ; il ressort surtout la nuit. */
export function glow(color, size = 1, level = 0) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  const s = new THREE.Sprite(m);
  s.scale.setScalar(size);
  s.userData.dyn = true;
  s.userData.level = level;
  glows.push(s);
  return s;
}
/** Flaque de lumière posée au sol. */
export function pool(color, size = 3, level = 0) {
  const m = new THREE.MeshBasicMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
  p.rotation.x = -Math.PI / 2;
  p.userData.dyn = true;
  p.userData.level = level;
  p.userData.floor = true;
  glows.push(p);
  return p;
}
/** Voyant : petite lentille émissive avec halo. led.userData.set(allumé, couleur?) */
export function led(color = 0x35e07d, r = 0.07) {
  const m = new THREE.MeshStandardMaterial({ color: 0x3a3f3d, emissive: color, emissiveIntensity: 0, roughness: 0.35 });
  const mesh = sph(r, m, 12);
  mesh.userData.dyn = true;
  const halo = glow(color, r * 10, 0);
  mesh.add(halo);
  const on = new THREE.Color(color);
  mesh.userData.set = (lit, col) => {
    if (col !== undefined) {
      on.set(col);
      m.emissive.copy(on);
      halo.material.color.copy(on);
    }
    m.emissiveIntensity = lit ? 2.4 : 0;
    m.color.set(lit ? on : 0x3a3f3d);
    halo.userData.level = lit ? 1 : 0;
  };
  return mesh;
}

// ---------- écrans dessinés au canvas ----------
export function screen(w, h, px = 256, py = 128) {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = py;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  mesh.userData.dyn = true;
  return { mesh, ctx: c.getContext('2d'), w: px, h: py, refresh: () => { tex.needsUpdate = true; } };
}
/** Texture répétée générée au canvas (trous de plaque d'essai, pistes…). */
export function patternTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------- petits utilitaires numériques ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
/** Générateur pseudo-aléatoire déterministe (mêmes maquettes à chaque visite). */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
/** Minuterie pour redessiner un écran à cadence réduite. */
export function every(period) {
  let acc = period;
  return (dt) => {
    acc += dt;
    if (acc < period) return false;
    acc = 0;
    return true;
  };
}
