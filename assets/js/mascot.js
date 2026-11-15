// Le robot du site. Il vit par-dessus la page : il marche sur le bord des cartes, vole de l'une à l'autre,
// se téléporte, s'endort, réagit à la souris, se laisse attraper et lancer, et enchaîne des émotes.
// Une émote = un mouvement du corps + des yeux + un accessoire + des particules : les émotes nommées
// ci-dessous sont complétées par des mélanges tirés au hasard, d'où des milliers de variantes.

const R = Math.random;
const pick = (a) => a[(R() * a.length) | 0];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const SKIN = {
  accueil: { color: '#3b82f6', act: 'wave' },
  competences: { color: '#eab308', act: 'juggle', eyes: 'star' },
  formation: { color: '#2563eb', act: 'read', hat: 'grad' },
  projets: { color: '#06b6d4', act: 'work' },
  experience: { color: '#9333ea', act: 'work', tie: true },
  interets: { color: '#db2777', act: 'guitar' },
};

// mouvement, durée (s), yeux, accessoire, particules [glyphes, style, cadence], réplique éventuelle
const EMOTES = {
  wave: ['wave', 1.8, 'happy', '', null, 'hi'],
  dance: ['dance', 3.2, 'happy', '', ['♪♫♬', 'rise', 0.25]],
  disco: ['dance', 3.6, 'star', 'shades', ['✦✧★', 'burst', 0.18]],
  spin: ['spin', 1.4, 'big', '', ['✦', 'burst', 0.2]],
  jump: ['jump', 1.1, 'happy', '', null],
  flip: ['flip', 1.2, 'big', '', ['✧', 'burst', 0.25]],
  moonwalk: ['moonwalk', 2.6, 'cool', 'shades', null],
  shock: ['shake', 1.2, 'big', '', ['!', 'pop', 0.5]],
  confused: ['tilt', 2.2, 'uneven', '', ['?', 'rise', 0.6]],
  love: ['sway', 2.6, 'heart', '', ['❤', 'rise', 0.22]],
  sleep: ['snooze', 6, 'closed', '', ['z', 'drift', 0.7]],
  scan: ['still', 2.8, 'scan', 'beam', null, 'scan'],
  juggle: ['bounce', 3.2, 'happy', 'balls', null],
  read: ['still', 3.6, 'down', 'book', null],
  work: ['type', 3.4, 'down', 'laptop', ['01', 'rise', 0.3]],
  guitar: ['sway', 3.6, 'closed', 'guitar', ['♪♫', 'rise', 0.3]],
  sing: ['bounce', 2.6, 'closed', 'mic', ['♪♬', 'rise', 0.25]],
  party: ['jump', 2.4, 'star', 'partyhat', ['●■▲', 'confetti', 0.06]],
  angry: ['shake', 1.8, 'angry', '', ['💢', 'pop', 0.5]],
  cry: ['shiver', 2.4, 'sad', '', ['💧', 'fall', 0.22]],
  laugh: ['bounce', 1.8, 'happy', '', ['ha', 'rise', 0.3]],
  dizzy: ['wobble', 2.4, 'dizzy', '', ['✶', 'orbit', 0.3]],
  cool: ['lean', 2.6, 'cool', 'shades', null],
  salute: ['salute', 1.6, 'normal', '', null],
  pushup: ['pushup', 3, 'angry', '', ['💦', 'burst', 0.5]],
  levitate: ['float', 3.2, 'closed', '', ['✦', 'orbit', 0.3]],
  shiver: ['shiver', 2, 'big', '', ['❄', 'fall', 0.3]],
  sneeze: ['sneeze', 1.2, 'closed', '', ['💨', 'burst', 0.6]],
  idea: ['jump', 1.4, 'big', 'bulb', ['✦', 'burst', 0.3]],
  grow: ['grow', 2.2, 'big', '', null],
  tiny: ['shrink', 2.6, 'big', '', null],
  rainbow: ['sway', 3, 'star', '', ['✦', 'rise', 0.2], '', 'rainbow'],
  ghost: ['float', 2.6, 'big', '', null, '', 'ghost'],
  glitch: ['glitch', 1.4, 'x', '', ['▚▞', 'burst', 0.15]],
  charge: ['still', 2.6, 'closed', '', ['⚡', 'rise', 0.25]],
  fix: ['type', 2.6, 'down', 'wrench', ['✦', 'burst', 0.4]],
  selfie: ['lean', 2, 'wink', 'phone', ['✦', 'pop', 0.9]],
  coffee: ['still', 3, 'closed', 'cup', ['~', 'rise', 0.5]],
  rocket: ['jump', 1.6, 'big', 'flame', ['💨', 'fall', 0.12]],
  stretch: ['stretch', 2.2, 'closed', '', null],
  nod: ['nod', 1.6, 'happy', '', null],
  no: ['no', 1.6, 'uneven', '', null],
  bow: ['bow', 1.8, 'closed', '', null],
  clap: ['clap', 1.8, 'happy', '', ['✦', 'burst', 0.25]],
  wink: ['tilt', 1.4, 'wink', '', ['✦', 'pop', 0.8]],
  hiccup: ['hiccup', 1.8, 'big', '', null],
  detective: ['lean', 3, 'uneven', 'glass', ['?', 'rise', 0.9]],
  magic: ['wave', 2.4, 'star', 'wand', ['✦✧★', 'burst', 0.1]],
  rain: ['shiver', 2.8, 'sad', 'umbrella', ['💧', 'rainfall', 0.08]],
  trophy: ['jump', 2.2, 'star', 'cup2', ['✦', 'burst', 0.2]],
};
const MOVES = [...new Set(Object.values(EMOTES).map((e) => e[0]))];
const EYES = ['normal', 'happy', 'star', 'heart', 'big', 'closed', 'wink', 'cool', 'angry', 'sad', 'dizzy', 'uneven', 'x', 'down'];
const PROPS = ['', '', 'shades', 'partyhat', 'bulb', 'cup', 'wand', 'phone', 'balls', 'book', 'mic', 'glass', 'wrench', 'umbrella', 'cup2', 'guitar'];
const SPARKS = [null, ['♪♫', 'rise', 0.3], ['✦✧', 'burst', 0.2], ['❤', 'rise', 0.3], ['●■▲', 'confetti', 0.08], ['⚡', 'rise', 0.3], ['✶', 'orbit', 0.3], ['?', 'rise', 0.6], ['!', 'pop', 0.5]];
const REACTIONS = ['shock', 'laugh', 'love', 'spin', 'flip', 'wave', 'dizzy', 'party', 'wink', 'glitch', 'jump', 'dance', 'salute', 'clap', 'magic', 'hiccup', 'idea'];

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

  const S = {
    x: 120, y: 200, dir: 1, mode: 'fall', vy: 0, vx: 0,
    plat: null, u: 0.3, goal: 0.3, until: 0, next: 1.5, emote: '', spark: null, sparkT: 0,
    fly: null, page: 'accueil', skin: SKIN.accueil, drag: null, idle: 0, lastMove: 0, mouse: { x: -999, y: -999, t: 0, speed: 0 },
    scrollV: 0, lastScroll: scrollY, sayUntil: 0, size: 64,
  };
  const size = () => (S.size = innerWidth < 700 ? 60 : 80);
  size();

  // ----- où peut-il se poser ? le bord supérieur des cartes visibles, sinon le bas de l'écran -----
  let plats = [];
  function scan() {
    const top = 52 + S.size + 6;
    plats = [...document.querySelectorAll('.phead, .card, .contact, .bench, .pdfbox, .hero__photo')].map((el) => ({ el, r: el.getBoundingClientRect() })).filter((p) => p.r.width > 90 && p.r.top > top && p.r.top < innerHeight - 8 && p.el.offsetParent);
  }
  const rectOf = (p) => (p ? p.el.getBoundingClientRect() : { left: 8, width: innerWidth - 16, top: innerHeight - 4 });
  const usable = (p) => { if (!p) return true; if (!p.el.isConnected) return false; const r = p.el.getBoundingClientRect(); return r.top > 52 + S.size * 0.7 && r.top < innerHeight - 4 && r.width > 60; };
  const spot = (p, u) => { const r = rectOf(p); return { x: clamp(r.left + r.width * u, S.size / 2, innerWidth - S.size / 2), y: r.top }; };

  // ----- émotes -----
  function setLook(move, eyes, prop, tint) {
    root.dataset.move = move || '';
    root.dataset.eyes = eyes || S.skin.eyes || 'normal';
    root.dataset.prop = prop || '';
    root.dataset.tint = tint || '';
  }
  function play(name, custom) {
    const e = custom || EMOTES[name];
    if (!e) return;
    S.mode = 'emote';
    S.emote = name;
    S.until = e[1];
    S.spark = e[4];
    S.sparkT = 0;
    setLook(e[0], e[2], e[3], e[6]);
    if (e[5]) talk(e[5]);
  }
  const remix = () => play('remix', [pick(MOVES), 1.6 + R() * 2, pick(EYES), pick(PROPS), pick(SPARKS), '', R() < 0.12 ? 'rainbow' : '']);
  function particle(glyphs, style) {
    const s = document.createElement('span');
    s.className = 'robot__bit robot__bit--' + style;
    s.textContent = glyphs.length > 2 && !/[\u{1F000}-\u{1FFFF}]/u.test(glyphs) ? pick([...glyphs]) : glyphs;
    s.style.setProperty('--dx', (R() * 2 - 1).toFixed(2));
    s.style.setProperty('--h', String((R() * 360) | 0));
    s.style.left = S.x + (R() - 0.5) * S.size * (style === 'rainfall' ? 1.6 : 0.7) + 'px';
    s.style.top = S.y - S.size * (style === 'fall' ? 0.62 : style === 'rainfall' ? 1.5 : 0.95) + 'px';
    fx.append(s);
    setTimeout(() => s.remove(), 1600);
  }
  function burst(glyph, n = 8, style = 'burst') { for (let i = 0; i < n; i++) particle(glyph, style); }
  function talk(key, ms = 2600) {
    const text = say(key, S.page);
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.add('is-on');
    S.sayUntil = performance.now() + ms;
  }

  // ----- déplacements -----
  function flyTo(p, u, teleport) {
    const to = spot(p, u);
    if (teleport) {
      burst('✦', 10);
      root.classList.add('is-tele');
      setTimeout(() => { S.plat = p; S.u = u; const q = spot(p, u); S.x = q.x; S.y = q.y; root.classList.remove('is-tele'); burst('✦', 10); S.mode = 'idle'; S.next = 0.5; }, 260);
      S.mode = 'tele';
      return;
    }
    S.fly = { x0: S.x, y0: S.y, p, u, t: 0, d: clamp(Math.hypot(to.x - S.x, to.y - S.y) / 420, 0.7, 2.2) };
    S.mode = 'fly';
    S.dir = to.x >= S.x ? 1 : -1;
    setLook('fly', 'big', 'flame');
  }
  function think() {
    scan();
    if (!usable(S.plat)) { const p = pick(plats) || null; return flyTo(p, 0.15 + R() * 0.7); }
    const r = R();
    if (r < 0.30) {
      S.goal = clamp(S.u + (R() - 0.5) * 0.9, 0.04, 0.96);
      S.mode = 'walk';
      S.dir = S.goal > S.u ? 1 : -1;
      setLook('walk');
    } else if (r < 0.42) play(S.skin.act);
    else if (r < 0.66) play(pick(Object.keys(EMOTES)));
    else if (r < 0.76) remix();
    else if (r < 0.90 && (plats.length > 1 || S.plat)) { const others = plats.filter((p) => !S.plat || p.el !== S.plat.el); flyTo(R() < 0.15 ? null : pick(others) || null, 0.1 + R() * 0.8, R() < 0.3); }
    else if (r < 0.95) talk(pick(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'page']));
    else { S.mode = 'idle'; S.next = 1 + R() * 2; setLook('look'); }
  }

  // ----- boucle -----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.idle += dt;
    S.scrollV = S.scrollV * 0.9 + Math.abs(scrollY - S.lastScroll);
    S.lastScroll = scrollY;

    if (S.mode === 'drag') {
      S.vx = (S.drag.x - S.x) / Math.max(dt, 0.008) * 0.25 + S.vx * 0.75;
      S.vy = (S.drag.y + S.size * 0.55 - S.y) / Math.max(dt, 0.008) * 0.25 + S.vy * 0.75;
      S.x = S.drag.x;
      S.y = S.drag.y + S.size * 0.55;
    } else if (S.mode === 'fall') {
      S.vy += 2200 * dt;
      S.x = clamp(S.x + S.vx * dt, S.size / 2, innerWidth - S.size / 2);
      if (S.x <= S.size / 2 || S.x >= innerWidth - S.size / 2) S.vx *= -0.6;
      const prev = S.y;
      S.y += S.vy * dt;
      scan();
      let land = null, landY = innerHeight - 4;
      for (const p of plats) if (S.x > p.r.left && S.x < p.r.right && p.r.top >= prev - 2 && p.r.top < landY) { land = p; landY = p.r.top; }
      if (S.y >= landY && S.vy > 0) {
        S.y = landY;
        if (S.vy > 520) { S.vy *= -0.32; S.vx *= 0.5; burst('✦', 4); }
        else { S.plat = land; const r = rectOf(land); S.u = clamp((S.x - r.left) / r.width, 0.02, 0.98); S.vx = S.vy = 0; play(pick(['dizzy', 'shock', 'laugh', 'jump'])); }
      }
    } else if (S.mode === 'fly') {
      const f = S.fly;
      f.t += dt / f.d;
      const to = spot(f.p, f.u), k = f.t * f.t * (3 - 2 * f.t);
      S.x = f.x0 + (to.x - f.x0) * k;
      S.y = f.y0 + (to.y - f.y0) * k - Math.sin(Math.PI * k) * Math.min(160, 60 + Math.abs(to.x - f.x0) * 0.2);
      if ((S.sparkT -= dt) < 0) { S.sparkT = 0.07; particle('💨', 'fall'); }
      if (f.t >= 1) { S.plat = f.p; S.u = f.u; S.mode = 'idle'; S.next = 0.4; setLook(''); }
    } else if (S.mode !== 'tele') {
      // posé sur une carte : il suit la page quand elle défile
      if (!usable(S.plat)) { scan(); const p = plats.sort((a, b) => Math.abs(a.r.top - S.y) - Math.abs(b.r.top - S.y))[0] || null; flyTo(p, 0.15 + R() * 0.7, S.scrollV > 60); }
      else {
        if (S.mode === 'walk') {
          const w = rectOf(S.plat).width, step = (70 / Math.max(w, 1)) * dt;
          S.u += Math.sign(S.goal - S.u) * step;
          if (Math.abs(S.goal - S.u) <= step) { S.mode = 'idle'; S.next = 0.3 + R(); setLook(''); }
        } else if (S.mode === 'emote') {
          if (S.spark && (S.sparkT -= dt) < 0) { S.sparkT = S.spark[2]; particle(S.spark[0], S.spark[1]); }
          if (S.emote === 'moonwalk') S.u = clamp(S.u - S.dir * (60 / rectOf(S.plat).width) * dt, 0.04, 0.96);
          if ((S.until -= dt) <= 0) { S.mode = 'idle'; S.next = 0.4 + R() * 1.2; setLook(''); }
        } else if ((S.next -= dt) <= 0) {
          if (S.idle > 45) play('sleep');
          else think();
        }
        const q = spot(S.plat, S.u);
        S.x = q.x;
        S.y = q.y;
      }
    }

    // regard : les pupilles suivent la souris quand elle est proche
    const mx = S.mouse.x - S.x, my = S.mouse.y - (S.y - S.size * 0.7), d = Math.hypot(mx, my);
    const near = d < 320 && now - S.mouse.t < 4000;
    pupils.style.transform = near ? `translate(${(clamp(mx / 60, -1, 1) * 2.4 * S.dir).toFixed(2)}px, ${(clamp(my / 60, -1, 1) * 1.8).toFixed(2)}px)` : '';
    // esquive : une souris qui fonce sur lui le fait disparaître ailleurs
    if (d < 46 && S.mouse.speed > 1.6 && (S.mode === 'walk' || S.mode === 'idle') && now - S.lastMove > 2500) { S.lastMove = now; scan(); flyTo(pick(plats) || null, R(), true); }

    root.style.setProperty('--x', S.x.toFixed(1) + 'px');
    root.style.setProperty('--y', S.y.toFixed(1) + 'px');
    root.style.setProperty('--dir', S.dir);
    root.dataset.mode = S.mode;
    if (S.sayUntil && now > S.sayUntil) { bubble.classList.remove('is-on'); S.sayUntil = 0; }
    bubble.classList.toggle('is-left', S.x > innerWidth - 190);
    requestAnimationFrame(frame);
  }

  // ----- interactions -----
  let down = null;
  btn.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    try { btn.setPointerCapture(e.pointerId); } catch {}
  });
  btn.addEventListener('pointermove', (e) => {
    if (!down) return;
    if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) {
      down.moved = true;
      S.mode = 'drag';
      S.plat = null;
      setLook('dangle', 'big');
      talk('grab', 1500);
    }
    if (down.moved) { S.drag = { x: e.clientX, y: e.clientY }; e.preventDefault(); }
  });
  const release = () => {
    if (!down) return;
    const wasDrag = down.moved;
    down = null;
    if (wasDrag) { S.mode = 'fall'; S.vx = clamp(S.vx, -1400, 1400); S.vy = clamp(S.vy, -1600, 1200); setLook('fallen', 'dizzy'); }
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  let clicks = 0, clickT = 0;
  btn.addEventListener('click', (e) => {
    if (S.mode === 'drag' || S.mode === 'fall') return;
    S.idle = 0;
    const now = performance.now();
    clicks = now - clickT < 450 ? clicks + 1 : 1;
    clickT = now;
    if (S.emote === 'sleep' && S.mode === 'emote') { play('shock'); talk('wake'); return; }
    if (clicks === 2) return play('flip');
    if (clicks >= 4) { clicks = 0; play('party'); talk('combo'); return; }
    if (R() < 0.25) { remix(); talk(pick(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'])); }
    else { play(pick(REACTIONS)); if (R() < 0.6) talk(pick(['hi', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'page'])); }
  });
  btn.addEventListener('contextmenu', (e) => { e.preventDefault(); play('sleep'); });
  addEventListener('pointermove', (e) => {
    const now = performance.now(), dtm = Math.max(1, now - S.mouse.t);
    S.mouse.speed = Math.hypot(e.clientX - S.mouse.x, e.clientY - S.mouse.y) / dtm;
    S.mouse.x = e.clientX; S.mouse.y = e.clientY; S.mouse.t = now;
    if (S.idle > 45 && S.emote === 'sleep') { S.idle = 0; play('shock'); talk('wake'); }
    S.idle = Math.min(S.idle, 30);
  }, { passive: true });
  addEventListener('keydown', () => { S.idle = 0; });
  addEventListener('resize', () => { size(); });
  addEventListener('scroll', () => { if (S.scrollV > 900 && S.mode !== 'emote' && S.mode !== 'fly') play('dizzy'); }, { passive: true });

  setLook('');
  if (reduced) {
    // Mouvements réduits : il reste sagement en bas de l'écran et ne réagit qu'au clic.
    root.classList.add('is-calm');
    S.x = innerWidth - 60; S.y = innerHeight - 6;
    root.style.setProperty('--x', S.x + 'px'); root.style.setProperty('--y', S.y + 'px'); root.style.setProperty('--dir', -1);
  } else requestAnimationFrame((t) => { last = t; frame(t); });

  return {
    /** Changement d'onglet : nouvelle tenue, et il rejoint la nouvelle page en volant. */
    setPage(page) {
      S.page = page;
      S.skin = SKIN[page] || SKIN.accueil;
      root.style.setProperty('--rb', S.skin.color);
      root.dataset.hat = S.skin.hat || '';
      root.dataset.tie = S.skin.tie ? '1' : '';
      btn.setAttribute('aria-label', say('name', page));
      if (reduced) return;
      S.plat = null;
      requestAnimationFrame(() => { scan(); const p = plats[0] || null; if (S.mode !== 'drag') flyTo(p, 0.12 + R() * 0.3, R() < 0.35); setTimeout(() => { if (S.mode === 'idle') { play(S.skin.act); talk('page'); } }, 1900); });
    },
    cheer() { if (!reduced && S.mode !== 'drag') { play(pick(['party', 'trophy', 'clap', 'jump'])); } },
    setNight(on) { root.classList.toggle('is-night', !!on); if (on && !reduced) { play('shiver'); talk('dark'); } },
    relabel() { btn.setAttribute('aria-label', say('name', S.page)); bubble.classList.remove('is-on'); },
  };
}
