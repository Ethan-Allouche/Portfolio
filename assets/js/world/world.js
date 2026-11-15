// Le « banc d'essai » : une seule scène 3D, toutes les maquettes posées dessus.
// La page choisit la vue : l'ensemble du banc (show(-1)) ou une maquette (show(k)), et la caméra s'y rend.
import { THREE, env, glows, themed, damp, clamp, lerp, smooth, finalize, patternTex } from './kit.js';
import { RoomEnvironment } from '../../vendor/RoomEnvironment.js';
import { MODELS } from './models/index.js';

const DAY = new THREE.Color('#e8eefb');
const NIGHT = new THREE.Color('#0f172a');
const SUN = new THREE.Color('#fff3e2');
const MOON = new THREE.Color('#9bb6ff');
const FOV = 30;
const GAP_NEAR = 12.5; // écart entre maquettes en vue d'ensemble
const GAP_FAR = 26;    // écart quand on en regarde une seule
const TRAVEL = 1.25;   // durée d'un déplacement de caméra, en secondes

export class World {
  constructor(canvas, items, opts = {}) {
    this.canvas = canvas;
    this.opts = opts;
    this.rtl = !!opts.rtl;
    this.reduced = !!opts.reduced;
    this.lux = this.luxTarget = opts.lux ?? 1;
    this.from = this.to = -1; // -1 = vue d'ensemble, sinon numéro de maquette
    this.tr = 1;              // avancement du déplacement en cours (1 = arrivé)
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.orbitFor = 0;
    this.running = false;
    this.focus = 0;
    this.active = -1;

    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1;
    this.small = Math.min(window.innerWidth, window.innerHeight) < 700;
    this.maxDpr = Math.min(window.devicePixelRatio || 1, this.small ? 1.75 : 2);
    this.dpr = this.maxDpr;

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color();
    scene.fog = new THREE.Fog(0xffffff, 40, 120);
    const pm = new THREE.PMREMGenerator(r);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 400);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x8f9bb3, 0.6);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(this.small ? 1024 : 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    this.sun.shadow.radius = 2.5;
    this.accent = new THREE.PointLight(0xffffff, 0, 16, 1.7);
    this.accentWant = { on: false, x: 0, y: 0, z: 0, color: new THREE.Color(0xffffff), power: 0 };
    scene.add(this.hemi, this.sun, this.sun.target, this.accent);

    // Le plan de travail : ne reçoit que les ombres, la page sert de fond.
    this.groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.28;
    ground.receiveShadow = true;
    scene.add(ground);
    const dots = patternTex(64, (g, s) => {
      g.clearRect(0, 0, s, s);
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(s / 2, s / 2, 2.2, 0, 7);
      g.fill();
    }, 900, 900);
    this.dotMat = new THREE.MeshBasicMaterial({ map: dots, transparent: true, opacity: 0.5, depthWrite: false });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), this.dotMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -0.275;
    scene.add(grid);

    // Les maquettes.
    const hooks = opts.hooks || {};
    this.insts = items.map((it) => {
      const make = MODELS[it.model] || MODELS.generic;
      const inst = make({ state: it.state, hooks, world: this });
      finalize(inst.group);
      scene.add(inst.group);
      inst.foot ||= [9, 6.5];
      inst.height ||= 3;
      return inst;
    });

    this.cur = null;
    this.ray = new THREE.Raycaster();
    this._bindPointer();
    this.resize();
    this._loop = this._loop.bind(this);
  }

  // ---------- réglages venant de la page ----------
  /** Vue demandée : -1 pour tout le banc, k pour la maquette k. */
  show(k, instant) {
    k = Math.max(-1, Math.min(this.insts.length - 1, k | 0));
    if (k === this.to) { if (instant) this.tr = 1; return; }
    this.from = this.tr > 0.5 ? this.to : this.from;
    this.to = k;
    this.tr = instant || this.reduced ? 1 : 0;
    this.orbitFor = -2;
  }
  setTheme(lux, instant) {
    this.luxTarget = clamp(lux);
    if (instant) this.lux = this.luxTarget;
  }
  setRtl(rtl) {
    this.rtl = rtl;
    this.cur = null;
  }
  setRunning(on) {
    if (on === this.running) return;
    this.running = on;
    if (on) {
      this.last = performance.now();
      requestAnimationFrame(this._loop);
    }
  }
  /** Lumière d'appoint unique, que la maquette active peut déplacer. */
  light(x, y, z, color, power) {
    const a = this.accentWant;
    a.on = true;
    a.x = x; a.y = y; a.z = z;
    a.color.set(color);
    a.power = power;
  }

  resize() {
    const c = this.canvas;
    const W = c.clientWidth || window.innerWidth;
    const H = c.clientHeight || window.innerHeight;
    if (W === this.W && H === this.H) return;
    this.W = W;
    this.H = H;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.cur = null;
  }

  // ---------- cadrage ----------
  _rects() {
    const { W, H } = this;
    const pad = Math.min(W, H) * 0.035;
    const q = { x0: pad, x1: W - pad, y0: pad, y1: H - pad };
    return { hero: q, st: q };
  }
  _fit(a, b, q) {
    const t = Math.tan((FOV * Math.PI) / 360);
    const th = (t * (q.x1 - q.x0)) / this.H;
    const tv = (t * (q.y1 - q.y0)) / this.H;
    return Math.max(a / th, b / tv);
  }
  _grid(q) {
    const n = this.insts.length;
    const aspect = (q.x1 - q.x0) / (q.y1 - q.y0);
    const cols = Math.min(n, aspect > 1.9 ? 4 : aspect > 0.95 ? 3 : 2);
    return { cols, rows: Math.ceil(n / cols) };
  }
  _place(gap, grid) {
    const { cols, rows } = grid;
    const side = this.rtl ? -1 : 1;
    this.insts.forEach((inst, i) => {
      const col = i % cols;
      const row = (i / cols) | 0;
      const inRow = row === rows - 1 ? this.insts.length - row * cols : cols;
      inst.group.position.set(side * (col - (inRow - 1) / 2) * gap, 0, (row - (rows - 1) / 2) * gap * 0.92);
    });
  }
  _overview(q, grid) {
    const gw = (grid.cols - 1) * GAP_NEAR + 10;
    const gd = (grid.rows - 1) * GAP_NEAR * 0.92 + 8;
    const yaw = (this.rtl ? 1 : -1) * 0.32;
    const pitch = 0.74;
    const a = (Math.abs(Math.cos(yaw)) * gw + Math.abs(Math.sin(yaw)) * gd) / 2;
    const b = ((Math.abs(Math.sin(yaw)) * gw + Math.abs(Math.cos(yaw)) * gd) / 2) * Math.sin(pitch) + 2.2;
    return this._pose(0, 0.6, 0, yaw, pitch, this._fit(a, b, q), q);
  }
  _station(i, q) {
    const inst = this.insts[i];
    const p = inst.group.position;
    const yaw = (this.rtl ? -1 : 1) * (inst.yaw ?? -0.5);
    const pitch = inst.pitch ?? 0.4;
    const [w, d] = inst.foot;
    const h = inst.height;
    const c = Math.abs(Math.cos(yaw)), sn = Math.abs(Math.sin(yaw));
    const a = (c * w + sn * d) / 2 + 0.3;
    const b = ((sn * w + c * d) / 2) * Math.sin(pitch) + (h / 2) * Math.cos(pitch) + 0.3;
    return this._pose(p.x, h * 0.36, p.z, yaw, pitch, this._fit(a, b, q), q);
  }
  _pose(x, y, z, yaw, pitch, dist, q) {
    return { x, y, z, yaw, pitch, dist, cx: (q.x0 + q.x1) / 2 - this.W / 2, cy: (q.y0 + q.y1) / 2 - this.H / 2 };
  }

  // ---------- boucle ----------
  _loop(now) {
    if (!this.running) return;
    requestAnimationFrame(this._loop);
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time = (this.time || 0) + dt;
    this._govern(dt);
    this.resize();

    const { hero, st } = this._rects();
    const grid = this._grid(hero);
    this.tr = Math.min(1, this.tr + dt / TRAVEL);
    const u = smooth(0, 1, this.tr);
    const { from, to } = this;

    // 0 = vue d'ensemble, 1 = plongée sur une maquette
    const dive = lerp(from < 0 ? 0 : 1, to < 0 ? 0 : 1, u);
    this.focus = dive;
    this._place(lerp(GAP_NEAR, GAP_FAR, dive), grid);

    const a = from < 0 ? this._overview(hero, grid) : this._station(from, st);
    const b = to < 0 ? this._overview(hero, grid) : this._station(to, st);
    const want = {};
    for (const k in a) want[k] = lerp(a[k], b[k], u);
    if (from >= 0 && to >= 0 && from !== to) want.dist *= 1 + 0.22 * Math.sin(Math.PI * u);
    this.active = u > 0.5 ? to : from;

    if (this.orbitFor !== this.active && !this.dragging) {
      this.orbitYaw = damp(this.orbitYaw, 0, 4, dt);
      this.orbitPitch = damp(this.orbitPitch, 0, 4, dt);
    }
    const sway = this.reduced ? 0 : Math.sin(this.time * 0.22) * 0.05;
    want.yaw += this.orbitYaw + sway;
    want.pitch = clamp(want.pitch + this.orbitPitch, 0.12, 1.25);

    if (!this.cur || this.reduced) this.cur = want;
    else for (const k in want) this.cur[k] = damp(this.cur[k], want[k], 5.5, dt);
    const p = this.cur;

    const cam = this.camera;
    const cp = Math.cos(p.pitch);
    cam.position.set(p.x + p.dist * Math.sin(p.yaw) * cp, p.y + p.dist * Math.sin(p.pitch), p.z + p.dist * Math.cos(p.yaw) * cp);
    cam.lookAt(p.x, p.y, p.z);
    cam.near = Math.max(0.5, p.dist * 0.08);
    cam.far = p.dist * 3 + 160;
    cam.setViewOffset(this.W, this.H, -p.cx, -p.cy, this.W, this.H);

    this._ambience(dt, p, dive);

    // Animation des maquettes proches seulement.
    this.accentWant.on = false;
    this.insts.forEach((inst, k) => {
      const near = dive < 0.6 || Math.abs(k - this.active) <= 1;
      if (near && inst.update) inst.update(dt, this.time, k === this.active, dive);
    });
    const aw = this.accentWant;
    if (aw.on) {
      this.accent.position.set(aw.x, aw.y, aw.z);
      this.accent.color.copy(aw.color);
    }
    this.accent.intensity = damp(this.accent.intensity, aw.on ? aw.power : 0, 8, dt);

    this.renderer.render(this.scene, cam);
    if (!this.painted) {
      this.painted = true;
      this.opts.onFirstFrame && this.opts.onFirstFrame();
    }
  }

  _ambience(dt, p, dive) {
    this.lux = damp(this.lux, this.luxTarget, 3.2, dt);
    const lux = this.lux;
    env.night = 1 - lux;
    const bg = this.scene.background.copy(NIGHT).lerp(DAY, lux);
    this.scene.fog.color.copy(bg);
    this.scene.fog.near = p.dist + lerp(46, 9, dive);
    this.scene.fog.far = this.scene.fog.near + lerp(90, 30, dive);
    this.hemi.intensity = lerp(0.08, 0.36, lux);
    this.sun.intensity = lerp(0.35, 2.7, lux);
    this.sun.color.copy(MOON).lerp(SUN, lux);
    this.scene.environmentIntensity = lerp(0.12, 0.5, lux);
    this.groundMat.opacity = lerp(0.5, 0.24, lux);
    this.dotMat.color.setRGB(lerp(0.2, 0.52, lux), lerp(0.27, 0.64, lux), lerp(0.42, 0.95, lux));
    this.dotMat.opacity = lerp(0.4, 0.5, lux);
    for (const t of themed) t.m.color.copy(t.night).lerp(t.day, lux);
    const g = lerp(1, 0.2, lux);
    for (const s of glows) s.material.opacity = s.userData.level * (s.userData.floor ? 1 - lux : g);

    // L'ombre suit le regard ; son emprise se resserre quand on plonge.
    const half = lerp(34, 9, dive);
    const sc = this.sun.shadow.camera;
    this.sun.target.position.set(p.x, 0, p.z);
    this.sun.position.set(p.x + (this.rtl ? -17 : 17), 46, p.z - 13);
    if (Math.abs(sc.right - half) > 0.05) {
      sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half;
      sc.near = 10; sc.far = 120;
      sc.updateProjectionMatrix();
    }
  }

  /** Baisse la définition si l'appareil peine à suivre. */
  _govern(dt) {
    this.avg = this.avg ? this.avg * 0.95 + dt * 0.05 : dt;
    this.frames = (this.frames || 0) + 1;
    if (this.frames > 50 && this.avg > 0.03 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.W, this.H, false);
      this.frames = 0;
      this.avg = 0.016;
    }
  }

  // ---------- souris et doigt ----------
  _hit(ev) {
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), this.camera);
    let best = -1;
    let bd = Infinity;
    const boxv = new THREE.Box3();
    const hit = new THREE.Vector3();
    this.insts.forEach((inst, k) => {
      const c = inst.group.position;
      boxv.min.set(c.x - 5, -0.3, c.z - 4);
      boxv.max.set(c.x + 5, 4.5, c.z + 4);
      if (this.ray.ray.intersectBox(boxv, hit)) {
        const d = hit.distanceTo(this.camera.position);
        if (d < bd) { bd = d; best = k; }
      }
    });
    return best;
  }
  _bindPointer() {
    const c = this.canvas;
    let sx = 0, sy = 0, moved = 0;
    c.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      sx = e.clientX; sy = e.clientY; moved = 0;
      this.orbitFor = this.active;
      c.setPointerCapture?.(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.dragging) {
        if (e.pointerType === 'mouse') c.style.cursor = this.to < 0 ? (this._hit(e) >= 0 ? 'pointer' : '') : 'grab';
        return;
      }
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = e.clientX; sy = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      this.orbitYaw = clamp(this.orbitYaw - dx * 0.006, -1.4, 1.4);
      this.orbitPitch = clamp(this.orbitPitch + dy * 0.004, -0.3, 0.6);
    });
    const end = (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (e.type === 'pointerup' && moved < 6 && this.to < 0) {
        const k = this._hit(e);
        if (k >= 0 && this.opts.onPick) this.opts.onPick(k);
      }
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }
}
