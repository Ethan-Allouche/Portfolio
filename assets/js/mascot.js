// Le robot du site. Il habite la page, pas l'écran : posé sur l'en-tête, il marche sur le bord des cartes,
// saute de l'une à l'autre, se téléporte, s'endort, se laisse attraper et lancer, et enchaîne des émotes.
// Quand la page défile il reste où il est ; de temps en temps, s'il en a envie, il vient voir ce que tu regardes.
// Une émote = un mouvement du corps + des yeux + un accessoire + des particules : les émotes nommées
// ci-dessous sont complétées par des mélanges tirés au hasard, d'où des milliers de variantes.

const R = Math.random;
const pick = (a) => a[(R() * a.length) | 0];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + R() * (b - a);

const SKIN = {
  accueil: { color: '#3b82f6', act: 'wave' },
  competences: { color: '#eab308', act: 'juggle', eyes: 'star' },
  formation: { color: '#2563eb', act: 'read', hat: 'grad' },
  projets: { color: '#06b6d4', act: 'work' },
  experience: { color: '#9333ea', act: 'work', tie: true },
  interets: { color: '#db2777', act: 'guitar' },
};

// mouvement, durée (s), yeux, accessoire, particules [formes, style, cadence], réplique éventuelle, teinte
const EMOTES = {
  wave: ['wave', 1.8, 'happy', '', null, 'hi'],
  dance: ['dance', 3.2, 'happy', '', ['note', 'rise', 0.28]],
  disco: ['dance', 3.6, 'star', 'shades', ['star spark', 'burst', 0.2]],
  spin: ['spin', 1.4, 'big', '', ['spark', 'burst', 0.22]],
  jump: ['jump', 1.1, 'happy', '', null],
  flip: ['flip', 1.2, 'big', '', ['spark', 'burst', 0.25]],
  moonwalk: ['moonwalk', 2.6, 'cool', 'shades', null],
  shock: ['shake', 1.2, 'big', '', ['t:!', 'pop', 0.5]],
  confused: ['tilt', 2.2, 'uneven', '', ['t:?', 'rise', 0.6]],
  love: ['sway', 2.6, 'heart', '', ['heart', 'rise', 0.24]],
  sleep: ['snooze', 6, 'closed', '', ['t:z', 'drift', 0.7]],
  scan: ['still', 2.8, 'scan', 'beam', null, 'scan'],
  juggle: ['bounce', 3.2, 'happy', 'balls', null],
  read: ['still', 3.6, 'down', 'book', null],
  work: ['type', 3.4, 'down', 'laptop', ['t:0 t:1', 'rise', 0.3]],
  guitar: ['sway', 3.6, 'closed', 'guitar', ['note', 'rise', 0.3]],
  sing: ['bounce', 2.6, 'closed', 'mic', ['note', 'rise', 0.25]],
  party: ['jump', 2.4, 'star', 'partyhat', ['conf', 'confetti', 0.06]],
  angry: ['shake', 1.8, 'angry', '', ['bolt', 'pop', 0.5]],
  cry: ['shiver', 2.4, 'sad', '', ['drop', 'fall', 0.24]],
  laugh: ['bounce', 1.8, 'happy', '', ['t:ha', 'rise', 0.3]],
  dizzy: ['wobble', 2.4, 'dizzy', '', ['star', 'orbit', 0.3]],
  cool: ['lean', 2.6, 'cool', 'shades', null],
  salute: ['salute', 1.6, 'normal', '', null],
  pushup: ['pushup', 3, 'angry', '', ['drop', 'burst', 0.5]],
  levitate: ['float', 3.2, 'closed', '', ['spark', 'orbit', 0.3]],
  shiver: ['shiver', 2, 'big', '', ['snow', 'fall', 0.3]],
  sneeze: ['sneeze', 1.2, 'closed', '', ['puff', 'burst', 0.6]],
  idea: ['jump', 1.4, 'big', 'bulb', ['spark', 'burst', 0.3]],
  grow: ['grow', 2.2, 'big', '', null],
  tiny: ['shrink', 2.6, 'big', '', null],
  rainbow: ['sway', 3, 'star', '', ['spark', 'rise', 0.2], '', 'rainbow'],
  ghost: ['float', 2.6, 'big', '', null, '', 'ghost'],
  glitch: ['glitch', 1.4, 'x', '', ['conf', 'burst', 0.15]],
  charge: ['still', 2.6, 'closed', '', ['bolt', 'rise', 0.25]],
  fix: ['type', 2.6, 'down', 'wrench', ['spark', 'burst', 0.4]],
  selfie: ['lean', 2, 'wink', 'phone', ['spark', 'pop', 0.9]],
  coffee: ['still', 3, 'closed', 'cup', ['puff', 'rise', 0.55]],
  hover: ['float', 2.2, 'big', 'flame', null],
  stretch: ['stretch', 2.2, 'closed', '', null],
  nod: ['nod', 1.6, 'happy', '', null],
  no: ['no', 1.6, 'uneven', '', null],
  bow: ['bow', 1.8, 'closed', '', null],
  clap: ['clap', 1.8, 'happy', '', ['spark', 'burst', 0.25]],
  wink: ['tilt', 1.4, 'wink', '', ['spark', 'pop', 0.8]],
  hiccup: ['hiccup', 1.8, 'big', '', null],
  detective: ['lean', 3, 'uneven', 'glass', ['t:?', 'rise', 0.9]],
  magic: ['wave', 2.4, 'star', 'wand', ['star spark', 'burst', 0.1]],
  rain: ['shiver', 2.8, 'sad', 'umbrella', ['drop', 'rainfall', 0.08]],
  trophy: ['jump', 2.2, 'star', 'cup2', ['star', 'burst', 0.2]],
};
const MOVES = [...new Set(Object.values(EMOTES).map((e) => e[0]))];
const EYES = ['normal', 'happy', 'star', 'heart', 'big', 'closed', 'wink', 'cool', 'angry', 'sad', 'dizzy', 'uneven', 'x', 'down'];
const PROPS = ['', '', 'shades', 'partyhat', 'bulb', 'cup', 'wand', 'phone', 'balls', 'book', 'mic', 'glass', 'wrench', 'umbrella', 'cup2', 'guitar'];
const SPARKS = [null, ['note', 'rise', 0.3], ['spark star', 'burst', 0.2], ['heart', 'rise', 0.3], ['conf', 'confetti', 0.08], ['bolt', 'rise', 0.3], ['star', 'orbit', 0.3], ['t:?', 'rise', 0.6], ['t:!', 'pop', 0.5]];
const REACTIONS = ['shock', 'laugh', 'love', 'spin', 'flip', 'wave', 'dizzy', 'party', 'wink', 'glitch', 'jump', 'dance', 'salute', 'clap', 'magic', 'hiccup', 'idea'];
const LINES = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

// Les particules sont dessinées (jamais d'émoji : leur rendu change d'un téléphone à l'autre).
const SHAPES = {
  note: ['<path d="M6 2.500 13 1v9.200a2.300 2.300 0 1 1-1.500-2.150V4.300L7.500 5.200v6.500A2.300 2.300 0 1 1 6 9.550z"/>', ''],
  star: ['<path d="M8 1l2 4.300 4.700.600-3.450 3.250.9 4.650L8 11.500 3.850 13.800l.9-4.650L1.300 5.900 6 5.300z"/>', '#fbbf24'],
  spark: ['<path d="M8 0c.6 4.400 3.600 7.400 8 8-4.400.600-7.400 3.600-8 8-.6-4.400-3.600-7.400-8-8 4.400-.600 7.400-3.600 8-8z"/>', '#fbbf24'],
  heart: ['<path d="M8 14.500 2.300 8.700a3.600 3.600 0 0 1 5.100-5.100l.6.600.6-.600a3.600 3.600 0 0 1 5.100 5.100z"/>', '#f43f5e'],
  bolt: ['<path d="M9.500 0 2.500 9h4.300L5.500 16l8-9.500H9z"/>', '#f59e0b'],
  drop: ['<path d="M8 1c3 4 4.500 6.300 4.500 8.700a4.500 4.500 0 0 1-9 0C3.500 7.300 5 5 8 1z"/>', '#38bdf8'],
  snow: ['<path d="M8 1v14M2 4.500l12 7M14 4.500l-12 7" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/>', '#7dd3fc'],
  puff: ['<circle cx="8" cy="8" r="6"/>', '#cbd5e1'],
  conf: ['<rect x="3" y="5" width="10" height="6" rx="1"/>', ''],
};

const SVG = `<svg viewBox="-20 -24 140 130" aria-hidden="true">
<ellipse class="rb-shadow" cx="50" cy="91" rx="20" ry="4.5"/>
<g class="rb-all"><g class="rb-flame"><path d="M36 86q4 16 8 0zM56 86q4 16 8 0z" fill="#f97316"/><path d="M38 86q2 9 4 0zM58 86q2 9 4 0z" fill="#fde047"/></g>
<g class="rb-wheels"><path d="M40 86h20V76H40z" fill="#334155"/><circle class="rb-wheel" cx="40" cy="86" r="5.500" fill="#1e293b"/><circle class="rb-wheel" cx="60" cy="86" r="5.500" fill="#1e293b"/><path class="rb-spoke" d="M37 86h6M57 86h6" stroke="#94a3b8" stroke-width="1.500"/></g>
<g class="rb-body"><rect x="30" y="45" width="40" height="35" rx="6" fill="var(--rb)"/><rect x="35" y="50" width="30" height="24" rx="3" fill="#fff" fill-opacity=".28"/><circle class="rb-core" cx="50" cy="62" r="5" fill="#fff" fill-opacity=".6"/>
<path class="rb-tie" d="M50 46l5 30-5 5-5-5z" fill="#4c1d95"/></g>
<g class="rb-arm rb-arm--l"><path d="M31 55 20 66" stroke="#334155" stroke-width="4.500" stroke-linecap="round"/><circle cx="19.500" cy="66.500" r="3.200" fill="#64748b"/></g>
<g class="rb-arm rb-arm--r"><path d="M69 55l11 11" stroke="#334155" stroke-width="4.500" stroke-linecap="round"/><circle cx="80.500" cy="66.500" r="3.200" fill="#64748b"/>
  <g class="rb-prop" data-p="wand"><path d="M80 66l10-16" stroke="#1e293b" stroke-width="2.500" stroke-linecap="round"/><path d="M90 46l1.500 3 3 .500-2.200 2 .600 3-2.900-1.600-2.900 1.600.600-3-2.200-2 3-.500z" fill="#facc15"/></g>
  <g class="rb-prop" data-p="wrench"><path d="M80 66l9-12" stroke="#64748b" stroke-width="3.500" stroke-linecap="round"/><circle cx="90" cy="52" r="4" fill="none" stroke="#64748b" stroke-width="3"/></g>
  <g class="rb-prop" data-p="phone"><rect x="78" y="52" width="9" height="15" rx="2" fill="#0f172a"/><rect x="79.500" y="54" width="6" height="10" fill="#7dd3fc"/></g>
  <g class="rb-prop" data-p="cup"><path d="M77 58h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" fill="#fff" stroke="#94a3b8"/><path d="M87 60h2a2 2 0 0 1 0 5h-2" fill="none" stroke="#94a3b8" stroke-width="1.500"/></g>
  <g class="rb-prop" data-p="mic"><path d="M80 66l4-9" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/><circle cx="85" cy="54" r="4" fill="#475569"/></g>
  <g class="rb-prop" data-p="glass"><circle cx="86" cy="56" r="6" fill="#bae6fd" fill-opacity=".6" stroke="#1e293b" stroke-width="2"/><path d="M82 61l-3 5" stroke="#1e293b" stroke-width="2.500" stroke-linecap="round"/></g>
  <g class="rb-prop" data-p="umbrella"><path d="M80 66V34" stroke="#1e293b" stroke-width="2"/><path d="M58 36a22 16 0 0 1 44 0z" fill="#ef4444"/></g>
  <g class="rb-prop" data-p="cup2"><path d="M76 44h14v6a7 7 0 0 1-14 0zM81 57h4v5h-4zM78 62h10v3H78z" fill="#facc15"/></g>
</g>
<g class="rb-prop" data-p="guitar"><g transform="translate(22 52) rotate(-38)"><rect width="15" height="24" rx="6" fill="#9d174d"/><rect x="5.500" y="-17" width="4" height="20" fill="#713f12"/><circle cx="7.500" cy="14" r="3.500" fill="#fce7f3"/></g></g>
<g class="rb-prop" data-p="book"><path d="M34 60h15v13H34zM51 60h15v13H51z" fill="#fff" stroke="#1e3a8a" stroke-width="1.500"/><path d="M37 64h9M37 68h9M54 64h9M54 68h9" stroke="#93c5fd"/></g>
<g class="rb-prop" data-p="laptop"><path d="M35 60h30v13H35z" fill="#0f172a"/><path d="M31 73h38v3H31z" fill="#94a3b8"/><path d="M39 64h10M39 68h16" stroke="#22d3ee"/></g>
<g class="rb-prop" data-p="balls"><circle class="rb-ball" cx="30" cy="26" r="4" fill="#ef4444"/><circle class="rb-ball" cx="50" cy="6" r="4" fill="#22c55e"/><circle class="rb-ball" cx="70" cy="26" r="4" fill="#3b82f6"/></g>
<g class="rb-head"><rect x="32" y="20" width="36" height="25" rx="8" fill="#cbd5e1"/><rect x="35" y="25" width="30" height="15" rx="4" fill="#0f172a"/>
  <g class="rb-eyes"><g class="rb-pupils">
    <g data-e="normal"><circle cx="42" cy="32" r="3"/><circle cx="58" cy="32" r="3"/></g>
    <g data-e="big"><circle cx="42" cy="32" r="4.500"/><circle cx="58" cy="32" r="4.500"/></g>
    <g data-e="down"><circle cx="42" cy="35" r="2.600"/><circle cx="58" cy="35" r="2.600"/></g>
    <g data-e="uneven"><circle cx="42" cy="32" r="2.200"/><circle cx="58" cy="32" r="4.200"/></g>
    <g data-e="scan"><rect x="38" y="30.500" width="24" height="3" rx="1.500" fill="#f43f5e"/></g></g>
    <g data-e="happy" fill="none" stroke-width="2.200" stroke-linecap="round"><path d="M39 33.500q3-4 6 0M55 33.500q3-4 6 0"/></g>
    <g data-e="closed" fill="none" stroke-width="2.200" stroke-linecap="round"><path d="M39 32.500h6M55 32.500h6"/></g>
    <g data-e="wink" stroke-width="2.200" stroke-linecap="round"><circle cx="42" cy="32" r="3"/><path d="M55 32.500h6" fill="none"/></g>
    <g data-e="star"><path d="M42 28l1.200 2.500 2.800.400-2 2 .500 2.800-2.500-1.300-2.500 1.300.500-2.800-2-2 2.800-.400zM58 28l1.200 2.500 2.800.400-2 2 .500 2.800-2.500-1.300-2.500 1.300.500-2.800-2-2 2.800-.400z" fill="#fbbf24" stroke="none"/></g>
    <g data-e="heart"><path d="M42 36l-3.500-3.500a2.100 2.100 0 0 1 3.500-2 2.100 2.100 0 0 1 3.500 2zM58 36l-3.500-3.500a2.100 2.100 0 0 1 3.500-2 2.100 2.100 0 0 1 3.500 2z" fill="#fb7185" stroke="none"/></g>
    <g data-e="angry" stroke-width="2.200" stroke-linecap="round"><circle cx="42" cy="34" r="2.400"/><circle cx="58" cy="34" r="2.400"/><path d="M38.500 28.500l6 2.500M61.500 28.500l-6 2.500" fill="none"/></g>
    <g data-e="sad" stroke-width="2.200" stroke-linecap="round"><circle cx="42" cy="34" r="2.400"/><circle cx="58" cy="34" r="2.400"/><path d="M38.500 30.500l6-2M61.500 30.500l-6-2" fill="none"/></g>
    <g data-e="dizzy" fill="none" stroke-width="1.800"><path d="M42 32m-3 0a3 3 0 1 0 6 0a2 2 0 1 0-4 0a1 1 0 1 0 2 0M58 32m-3 0a3 3 0 1 0 6 0a2 2 0 1 0-4 0a1 1 0 1 0 2 0"/></g>
    <g data-e="x" fill="none" stroke-width="2.200" stroke-linecap="round"><path d="M39.500 29.500l5 5m0-5-5 5M55.500 29.500l5 5m0-5-5 5"/></g>
    <g data-e="cool"><path d="M36 29h28v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5 5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" fill="#020617" stroke="#475569" stroke-width="1"/></g>
  </g>
  <path class="rb-ant" d="M50 20V10" stroke="#64748b" stroke-width="3"/><circle class="rb-bulb" cx="50" cy="8" r="4" fill="#ef4444"/>
  <g class="rb-hat" data-h="grad"><path d="M30 14 50 5l20 9-20 9z" fill="#1e1e24"/><path d="M52 14q9 4 10 14" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="62" cy="29" r="2.200" fill="#fcd34d"/></g>
  <g class="rb-prop" data-p="partyhat"><path d="M40 21 50-4l10 25z" fill="#ec4899"/><circle cx="50" cy="-5" r="3.500" fill="#fde047"/><path d="M44 12l11-3M42 17l15-4" stroke="#fde047" stroke-width="2"/></g>
  <g class="rb-prop" data-p="bulb"><circle cx="50" cy="-6" r="8" fill="#fde047"/><path d="M46 3h8v4h-8z" fill="#94a3b8"/><path d="M36-10l-5-3M64-10l5-3M50-18v-5" stroke="#facc15" stroke-width="2" stroke-linecap="round"/></g>
  <g class="rb-prop" data-p="shades"><path d="M34 28h32v4a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5h-2a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5z" fill="#020617"/></g>
</g>
<g class="rb-prop" data-p="beam"><path d="M50 33 4 96h92z" fill="#f43f5e" fill-opacity=".22"/></g>
</g></svg>`;

export function createMascot({ say, reduced }) {
  const root = document.createElement('div');
  root.className = 'robot';
  root.innerHTML = `<div class="robot__fx"></div><div class="robot__say" role="status"></div><button class="robot__btn" type="button"><span class="robot__flip">${SVG}</span></button>`;
  document.body.append(root);
  const btn = root.querySelector('.robot__btn');
  const fx = root.querySelector('.robot__fx');
  const bubble = root.querySelector('.robot__say');
  const pupils = root.querySelector('.rb-pupils');
  const view = document.getElementById('view') || document.body;
  const nav = document.querySelector('.nav');

  const S = {
    x: 0, y: 0, dir: 1, mode: 'idle', vx: 0, vy: 0, plat: null, u: 0.3, goal: 0.3,
    until: 0, next: 2, emote: '', spark: null, sparkT: 0, hop: null, drag: null,
    page: 'accueil', skin: SKIN.accueil, size: 80, placed: false, seen: true,
    quiet: 0, away: 0, visitAt: rnd(8, 26), scrollAt: 0, lastScroll: 0, sayUntil: 0, dodgeAt: 0,
    mouse: { x: -999, y: -999, t: 0, speed: 0 },
  };
  const measure = () => { S.size = parseFloat(getComputedStyle(root).getPropertyValue('--s')) * 0.68 || 80; };
  const navH = () => (nav ? nav.offsetHeight : 52);
  const docW = () => document.documentElement.clientWidth;
  measure();

  // ----- où peut-il se poser ? le bord supérieur de l'en-tête et des cartes, en coordonnées de page -----
  const WHERE = '.phead, .hero__photo, .card, .contact, .bench, .pdfbox, .heromedia';
  let plats = [];
  function scan() {
    const sx = scrollX, sy = scrollY, min = navH() + S.size * 0.92 + 1;
    plats = [...view.querySelectorAll(WHERE)].map((el) => { const r = el.getBoundingClientRect(); return { el, l: r.left + sx, w: r.width, top: r.top + sy }; })
      .filter((p) => p.w > 100 && p.top >= min && p.el.offsetParent)
      .sort((a, b) => a.top - b.top || a.l - b.l);
    return plats;
  }
  const live = (p) => { const r = p.el.getBoundingClientRect(); p.l = r.left + scrollX; p.w = r.width; p.top = r.top + scrollY; return p; };
  const margin = (p) => (p.el.classList.contains('hero__photo') ? 0.32 : Math.min(0.45, (S.size * 0.45) / Math.max(p.w, 1)));
  const spot = (p, u) => ({ x: clamp(p.l + p.w * u, S.size * 0.6, docW() - S.size * 0.6), y: p.top });
  const inView = (y, pad = 0) => y - S.size > scrollY + navH() - pad && y < scrollY + innerHeight + pad;
  const onScreen = () => inView(S.y, S.size * 0.5);
  function sit(p, u) {
    S.plat = p; S.u = clamp(u, margin(p), 1 - margin(p));
    const q = spot(live(p), S.u); S.x = q.x; S.y = q.y;
    if (!S.placed) { S.placed = true; root.classList.add('is-ready'); }
  }
  const nearest = (x, y) => plats.slice().sort((a, b) => Math.abs(a.top - y) + Math.abs(clamp(x, a.l, a.l + a.w) - x) * 0.5 - (Math.abs(b.top - y) + Math.abs(clamp(x, b.l, b.l + b.w) - x) * 0.5))[0] || null;

  // ----- émotes, particules, répliques -----
  function setLook(move, eyes, prop, tint) {
    root.dataset.move = move || '';
    root.dataset.eyes = eyes || S.skin.eyes || 'normal';
    root.dataset.prop = prop || '';
    root.dataset.tint = tint || '';
  }
  function rest(wait) { S.mode = 'idle'; S.emote = ''; S.spark = null; S.next = wait; setLook(''); }
  function play(name, custom) {
    const e = custom || EMOTES[name];
    if (!e || !S.plat) return;
    S.mode = 'emote'; S.emote = name; S.until = e[1]; S.spark = e[4]; S.sparkT = 0.15;
    setLook(e[0], e[2], e[3], e[6]);
    if (e[5]) talk(e[5]);
  }
  const remix = () => play('remix', [pick(MOVES), rnd(1.6, 3.4), pick(EYES), pick(PROPS), pick(SPARKS), '', R() < 0.1 ? 'rainbow' : '']);
  function particle(kinds, style) {
    if (!S.seen || fx.childElementCount > 40) return;
    const kind = pick(kinds.split(' '));
    const el = document.createElement('span');
    el.className = 'robot__bit robot__bit--' + style;
    if (kind.startsWith('t:')) el.textContent = kind.slice(2);
    else { const [d, color] = SHAPES[kind]; el.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`; el.style.color = color || `hsl(${(R() * 360) | 0} 85% 58%)`; }
    el.style.setProperty('--dx', rnd(-1, 1).toFixed(2));
    el.style.setProperty('--rot', ((R() * 360) | 0) + 'deg');
    el.style.setProperty('--up', String((rnd(20, 90)) | 0));
    el.style.left = S.x + rnd(-0.5, 0.5) * S.size * (style === 'rainfall' ? 1.5 : 0.7) + 'px';
    el.style.top = S.y - S.size * (style === 'fall' ? 0.72 : style === 'rainfall' ? 1.55 : style === 'dust' ? 0.06 : 1.02) + 'px';
    fx.append(el);
    setTimeout(() => el.remove(), 1500);
  }
  const burst = (kinds, n = 8, style = 'burst') => { for (let i = 0; i < n; i++) particle(kinds, style); };
  function talk(key, ms = 2600) {
    if (!S.seen) return;
    const text = say(key, S.page);
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.add('is-on');
    S.sayUntil = performance.now() + ms;
  }

  // ----- déplacements -----
  function teleport(p, u) {
    S.mode = 'tele'; S.emote = ''; S.spark = null; setLook('');
    const leave = S.placed && S.seen;
    if (leave) { burst('spark', 9); root.classList.add('is-out'); }
    setTimeout(() => {
      if (!p.el.isConnected) { scan(); p = nearest(S.x, S.y); if (!p) { root.classList.remove('is-out'); return rest(1); } }
      sit(p, u);
      S.seen = onScreen();
      root.classList.remove('is-out');
      root.classList.add('is-in');
      burst('spark', 9);
      setTimeout(() => root.classList.remove('is-in'), 300);
      rest(rnd(0.6, 1.4));
    }, leave ? 200 : 0);
  }
  function hopTo(p, u) {
    live(p);
    u = clamp(u, margin(p), 1 - margin(p));
    const to = spot(p, u), dist = Math.hypot(to.x - S.x, to.y - S.y);
    if (dist < 12) { sit(p, u); S.mode = 'emote'; S.emote = 'hello'; S.until = 0.55; S.spark = null; return setLook('jump', 'happy'); }
    if (dist > Math.max(520, innerHeight * 0.75)) return teleport(p, u);
    S.hop = { x0: S.x, y0: S.y, p, u, t: -0.16, d: clamp(dist / 560, 0.42, 0.85), h: clamp(46 + dist * 0.16, 56, 130), jet: dist > 300 };
    S.mode = 'hop'; S.emote = ''; S.spark = null;
    S.dir = to.x >= S.x ? 1 : -1;
    setLook('crouch', 'big');
  }
  function think() {
    scan();
    if (!S.plat || !S.plat.el.isConnected) { const p = nearest(S.x, S.y); if (!p) return rest(2); sit(p, 0.3); }
    const r = R(), m = margin(S.plat);
    if (r < 0.30) {
      S.goal = clamp(S.u + rnd(-0.5, 0.5), m, 1 - m);
      if (Math.abs(S.goal - S.u) * S.plat.w < 24) return rest(rnd(0.6, 1.6));
      S.mode = 'walk'; S.dir = S.goal > S.u ? 1 : -1; setLook('walk');
    } else if (r < 0.44) play(S.skin.act);
    else if (r < 0.66) play(pick(Object.keys(EMOTES)));
    else if (r < 0.74) remix();
    else if (r < 0.80) { talk(pick([...LINES, 'page'])); rest(rnd(1.5, 3)); }
    else if (r < 0.87) {
      // un saut vers une carte voisine : celles qui l'entourent, pas celles que tu regardes
      const near = plats.filter((p) => p.el !== S.plat.el && Math.abs(p.top - S.y) < innerHeight * 0.6 && inView(p.top) === S.seen);
      if (near.length) hopTo(pick(near), rnd(0.15, 0.85)); else rest(rnd(1, 2));
    } else { S.mode = 'idle'; S.next = rnd(1.5, 3.5); setLook('look'); }
  }
  /** Hors de l'écran depuis un moment : parfois il vient voir, parfois il rentre en haut de la page, parfois il reste. */
  function wander() {
    S.away = 0; S.visitAt = rnd(7, 24);
    scan();
    if (!plats.length) return;
    const r = R();
    if (r < 0.5) {
      const here = plats.filter((p) => inView(p.top, -10));
      if (here.length) teleport(pick(here), rnd(0.15, 0.85));
    } else if (r < 0.72 && S.plat !== plats[0]) teleport(plats[0], rnd(0.12, 0.5));
  }

  // ----- boucle -----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    requestAnimationFrame(frame);
    if (!S.placed) return;
    if (scrollY !== S.lastScroll) { S.lastScroll = scrollY; S.scrollAt = now; }
    S.quiet += dt;

    if (S.mode === 'drag') {
      const tx = S.drag.x + scrollX, ty = S.drag.y + scrollY + S.size * 0.62;
      S.vx = ((tx - S.x) / Math.max(dt, 0.008)) * 0.25 + S.vx * 0.75;
      S.vy = ((ty - S.y) / Math.max(dt, 0.008)) * 0.25 + S.vy * 0.75;
      S.x = tx; S.y = ty;
    } else if (S.mode === 'fall') {
      S.vy += 2300 * dt;
      const half = S.size * 0.6, w = docW();
      S.x += S.vx * dt;
      if (S.x < half || S.x > w - half) { S.x = clamp(S.x, half, w - half); S.vx *= -0.55; }
      const prev = S.y;
      S.y += S.vy * dt;
      const vr = view.getBoundingClientRect();
      let land = null, landY = vr.bottom + scrollY - 6;
      if (S.vy > 0) for (const p of plats) if (S.x > p.l + 8 && S.x < p.l + p.w - 8 && p.top >= prev - 2 && p.top < landY) { land = p; landY = p.top; }
      if (S.y >= landY && S.vy > 0) {
        S.y = landY;
        if (S.vy > 560) { S.vy *= -0.3; S.vx *= 0.5; burst('puff', 3, 'dust'); }
        else {
          S.vx = S.vy = 0;
          if (!land) { scan(); land = nearest(S.x, S.y); }
          if (land) { sit(land, (S.x - land.l) / land.w); play(pick(['dizzy', 'shock', 'laugh', 'jump'])); } else rest(1);
        }
      }
    } else if (S.mode === 'hop') {
      const f = S.hop;
      f.t += dt / f.d;
      if (!f.p.el.isConnected) { S.plat = null; rest(0.2); }
      else if (f.t >= 0) {
        if (root.dataset.move === 'crouch') setLook('hop', 'happy', f.jet ? 'flame' : '');
        const to = spot(live(f.p), f.u), k = Math.min(1, f.t), e = k * k * (3 - 2 * k);
        S.x = f.x0 + (to.x - f.x0) * e;
        S.y = f.y0 + (to.y - f.y0) * e - Math.sin(Math.PI * k) * f.h;
        if (k >= 1) { sit(f.p, f.u); S.mode = 'emote'; S.emote = 'land'; S.until = 0.22; setLook('land'); burst('puff', 3, 'dust'); }
      }
    } else if (S.mode !== 'tele') {
      if (!S.plat || !S.plat.el.isConnected) {
        // la page vient d'être redessinée : il se repose sur ce qui se trouve au même endroit
        scan();
        const p = nearest(S.x, S.y);
        if (p) sit(p, (S.x - p.l) / Math.max(p.w, 1)); else S.plat = null;
      }
      if (S.plat) {
        const p = live(S.plat);
        if (S.mode === 'walk') {
          const step = (64 / Math.max(p.w, 1)) * dt;
          S.u += Math.sign(S.goal - S.u) * step;
          if (Math.abs(S.goal - S.u) <= step) rest(rnd(0.5, 1.6));
        } else if (S.mode === 'emote') {
          if (S.spark && (S.sparkT -= dt) < 0) { S.sparkT = S.spark[2]; particle(S.spark[0], S.spark[1]); }
          if (S.emote === 'moonwalk') S.u = clamp(S.u - S.dir * (50 / p.w) * dt, margin(p), 1 - margin(p));
          if ((S.until -= dt) <= 0) rest(S.emote === 'land' ? rnd(0.3, 0.9) : rnd(0.8, 2.4));
        } else if ((S.next -= dt) <= 0) {
          if (!S.seen) S.next = 1.5; // personne ne regarde : il attend sagement
          else if (S.quiet > 50) play('sleep');
          else think();
        }
        if (S.mode !== 'hop' && S.mode !== 'tele') { const q = spot(p, S.u); S.x = q.x; S.y = q.y; }
      }
    }

    S.seen = onScreen();
    if (S.seen) S.away = 0;
    else if ((S.mode === 'idle' || S.mode === 'walk' || S.mode === 'emote') && now - S.scrollAt > 700) { S.away += dt; if (S.away > S.visitAt) wander(); }

    if (S.seen) {
      // regard : les pupilles suivent la souris quand elle est proche
      const mx = S.mouse.x + scrollX - S.x, my = S.mouse.y + scrollY - (S.y - S.size * 0.8), d = Math.hypot(mx, my);
      const near = d < 320 && now - S.mouse.t < 4000;
      pupils.style.transform = near ? `translate(${(clamp(mx / 60, -1, 1) * 2.4 * S.dir).toFixed(2)}px, ${(clamp(my / 60, -1, 1) * 1.8).toFixed(2)}px)` : '';
      // esquive : une souris qui fonce sur lui le fait réapparaître un peu plus loin
      if (d < 44 && S.mouse.speed > 1.8 && (S.mode === 'walk' || S.mode === 'idle') && now - S.dodgeAt > 4000 && now - S.mouse.t < 120) {
        S.dodgeAt = now; scan();
        const here = plats.filter((p) => inView(p.top, -10));
        if (here.length) teleport(pick(here), rnd(0.1, 0.9));
      }
    }
    root.style.setProperty('--x', S.x.toFixed(1) + 'px');
    root.style.setProperty('--y', S.y.toFixed(1) + 'px');
    root.style.setProperty('--dir', S.dir);
    root.dataset.mode = S.mode;
    if (S.sayUntil && now > S.sayUntil) { bubble.classList.remove('is-on'); S.sayUntil = 0; }
    bubble.classList.toggle('is-left', S.x > docW() - 210);
  }

  // ----- interactions -----
  let down = null;
  btn.addEventListener('pointerdown', (e) => {
    if (reduced) return;
    down = { x: e.clientX, y: e.clientY, moved: false };
    try { btn.setPointerCapture(e.pointerId); } catch {}
  });
  btn.addEventListener('pointermove', (e) => {
    if (!down) return;
    if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) {
      down.moved = true;
      S.mode = 'drag'; S.plat = null; S.hop = null; S.emote = ''; S.spark = null;
      setLook('dangle', 'big');
      talk('grab', 1500);
    }
    if (down.moved) { S.drag = { x: e.clientX, y: e.clientY }; e.preventDefault(); }
  });
  const release = () => {
    if (!down) return;
    const wasDrag = down.moved;
    down = null;
    if (wasDrag) { scan(); S.mode = 'fall'; S.vx = clamp(S.vx, -1300, 1300); S.vy = clamp(S.vy, -1500, 1200); setLook('fallen', 'dizzy'); }
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  let clicks = 0, clickT = 0;
  btn.addEventListener('click', () => {
    if (S.mode === 'drag' || S.mode === 'fall' || S.mode === 'hop' || S.mode === 'tele') return;
    S.quiet = 0;
    const now = performance.now();
    clicks = now - clickT < 450 ? clicks + 1 : 1;
    clickT = now;
    if (reduced) { talk(pick(['hi', ...LINES, 'page'])); return; }
    if (S.emote === 'sleep') { play('shock'); talk('wake'); return; }
    if (clicks === 2) return play('flip');
    if (clicks >= 4) { clicks = 0; play('party'); talk('combo'); return; }
    if (R() < 0.25) { remix(); talk(pick(LINES)); }
    else { play(pick(REACTIONS)); if (R() < 0.6) talk(pick(['hi', ...LINES, 'page'])); }
  });
  btn.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!reduced) play('sleep'); });
  addEventListener('pointermove', (e) => {
    const now = performance.now(), dtm = Math.max(1, now - S.mouse.t);
    S.mouse.speed = Math.hypot(e.clientX - S.mouse.x, e.clientY - S.mouse.y) / dtm;
    S.mouse.x = e.clientX; S.mouse.y = e.clientY; S.mouse.t = now;
    if (S.emote === 'sleep' && S.quiet > 50 && S.seen) { play('shock'); talk('wake'); }
    S.quiet = Math.min(S.quiet, 30);
  }, { passive: true });
  addEventListener('keydown', () => { S.quiet = Math.min(S.quiet, 30); });
  addEventListener('resize', measure);

  setLook('');
  if (reduced) root.classList.add('is-calm');
  else requestAnimationFrame((t0) => { last = t0; frame(t0); });

  function paint() {
    root.style.setProperty('--x', S.x.toFixed(1) + 'px');
    root.style.setProperty('--y', S.y.toFixed(1) + 'px');
    root.style.setProperty('--dir', S.dir);
  }
  return {
    /** Changement de page : nouvelle tenue. S'il était à l'écran il saute sur le nouvel en-tête depuis là où il se trouvait ; sinon il y est déjà. */
    setPage(page, viewportY) {
      S.page = page;
      S.skin = SKIN[page] || SKIN.accueil;
      root.style.setProperty('--rb', S.skin.color);
      root.dataset.hat = S.skin.hat || '';
      root.dataset.tie = S.skin.tie ? '1' : '';
      btn.setAttribute('aria-label', say('name', page));
      bubble.classList.remove('is-on');
      measure();
      scan();
      const home = plats[0];
      if (!home) { S.plat = null; return; }
      if (S.mode === 'drag' || S.mode === 'fall') return;
      S.hop = null; S.away = 0;
      const first = !S.placed;
      if (first || reduced || !S.seen) {
        sit(home, first ? 0.5 : rnd(0.15, 0.6));
        S.dir = 1; rest(first ? 2.5 : 1.2); paint();
        return;
      }
      // même endroit de l'écran qu'avant le changement, puis un saut jusqu'à l'en-tête
      S.y = clamp(viewportY ?? S.y, navH() + S.size, innerHeight) + scrollY;
      S.plat = null;
      hopTo(home, (S.x - home.l) / Math.max(home.w, 1));
      if (R() < 0.4) setTimeout(() => { if (S.mode === 'idle' && S.seen) { play(S.skin.act); if (R() < 0.6) talk('page'); } }, 1500);
    },
    /** Où il se trouve à l'écran, à relever juste avant de redessiner la page. */
    viewportY: () => S.y - scrollY,
    cheer() { if (!reduced && S.seen && S.mode !== 'drag' && S.mode !== 'fall') play(pick(['party', 'trophy', 'clap', 'jump'])); },
    setNight(on) { root.classList.toggle('is-night', !!on); if (on && !reduced && S.seen) { play('shiver'); talk('dark'); } },
    /** La page a été redessinée sans changer d'onglet (langue, par exemple). */
    relabel() {
      btn.setAttribute('aria-label', say('name', S.page));
      bubble.classList.remove('is-on');
      if (reduced) { scan(); if (plats[0]) { sit(plats[0], 0.5); paint(); } }
    },
  };
}
