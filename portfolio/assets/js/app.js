// Page principale : mêmes onglets qu'avant (Accueil, Compétences, Formation, Projets, Expérience,
// Centres d'intérêt), rendus dans la langue du visiteur, avec la scène 3D sur l'accueil et dans chaque projet.
import { LANGS, DIR, SHORT, NAMES, detectLang, rememberLang, pick, translator } from './i18n.js';
import { buildConsole } from './decks.js';

// ---------- données ----------
const isDraft = new URLSearchParams(location.search).has('draft');
function loadData() {
  if (isDraft) {
    try {
      const d = JSON.parse(localStorage.getItem('portfolio.draft') || 'null');
      if (d && d.profile) return d;
    } catch {}
  }
  return window.PORTFOLIO || { profile: {}, projects: [] };
}
const D = loadData();
const projects = (D.projects || []).filter((p) => p && p.id);
const N = projects.length;
const items = projects.map((p) => ({ id: p.id, model: p.model || 'generic', state: {} }));

// ---------- outils ----------
const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isVideo = (src) => /\.(mp4|webm)$/i.test(src || '');

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  cap: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.500 6-2.500v-5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.900M16 3.100a4 4 0 0 1 0 7.800',
  briefcase: 'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  heart: 'M20.840 4.610a5.500 5.500 0 0 0-7.780 0L12 5.670l-1.060-1.060a5.500 5.500 0 0 0-7.780 7.780l1.060 1.060L12 21.230l7.780-7.780 1.060-1.060a5.500 5.500 0 0 0 0-7.780z',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M5 12.500l4.500 4.500L19 7.500',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  back: 'M19 12H5M11 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  cube: 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  file: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.500 8.500l-2 5-5 2 2-5z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
};
const icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;
const LINKEDIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.940 8.500H3.560V20h3.380zM5.250 3a1.970 1.970 0 1 0 0 3.940 1.970 1.970 0 0 0 0-3.940zM20.440 13.340c0-3.110-1.660-5.090-4.330-5.090-1.500 0-2.510.830-2.940 1.610h-.050V8.500H9.880V20h3.380v-5.690c0-1.500.280-2.950 2.140-2.950 1.830 0 1.860 1.720 1.860 3.050V20h3.380z"/></svg>';

function h(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v; // uniquement pour les icônes définies ci-dessus
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false && kid !== '') n.append(kid);
  return n;
}
const ic = (name, cls) => h('span', { html: icon(name, cls), style: 'display:contents' });

// ---------- état ----------
const TABS = [
  ['accueil', 'nav.home', 'home'],
  ['competences', 'nav.skills', 'star'],
  ['formation', 'nav.education', 'cap'],
  ['projets', 'nav.projects', 'users'],
  ['experience', 'nav.experience', 'briefcase'],
  ['interets', 'nav.interests', 'heart'],
];
let lang = detectLang();
let t = translator(lang);
const P = (v) => pick(v, lang);
let route = parseRoute();
let world = null;
let no3d = false;
let lightsOff = false;
let liveConsole = null;
let mounted = false;

const el = { view: $('#view'), tabs: $('#tabs'), langs: $('#langs'), brand: $('#brand'), burger: $('#burger'), foot: $('#foot'), bay: $('#bay'), canvas: $('#world'), lightbox: $('#lightbox'), skip: $('#skip') };

function parseRoute() {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (a === 'projets' && b) {
    const k = projects.findIndex((p) => p.id === decodeURIComponent(b));
    if (k >= 0) return { page: 'projets', k };
  }
  return { page: TABS.some((x) => x[0] === a) ? a : 'accueil', k: -1, anchor: a === 'contact' ? 'contact' : '' };
}
const href = (page, id) => '#/' + (page === 'accueil' ? '' : page) + (id ? '/' + encodeURIComponent(id) : '');

// ---------- robot ----------
const ROBOT = {
  accueil: { color: '#3b82f6' },
  competences: { color: '#eab308', star: true },
  formation: { color: '#2563eb', hat: true },
  projets: { color: '#06b6d4' },
  experience: { color: '#9333ea', tie: true, briefcase: true },
  interets: { color: '#db2777', guitar: true },
};
function mascot(page) {
  const c = ROBOT[page] || ROBOT.accueil;
  const eyes = c.star
    ? '<polygon points="42,29 43,31 45,31 43.5,32.5 44,34.5 42,33.5 40,34.5 40.5,32.5 39,31 41,31" fill="#fbbf24"/><polygon points="58,29 59,31 61,31 59.5,32.5 60,34.5 58,33.5 56,34.5 56.5,32.5 55,31 57,31" fill="#fbbf24"/>'
    : '<circle cx="42" cy="32" r="3" fill="#60a5fa"/><circle cx="58" cy="32" r="3" fill="#60a5fa"/>';
  const top = c.hat
    ? '<g transform="translate(0,-8)"><path d="M30 20 50 10l20 10-20 10z" fill="#1e1e24" stroke="#000"/><rect x="48" y="18" width="4" height="4" fill="#fcd34d"/><path d="M52 20q8 5 10 15" stroke="#fcd34d" stroke-width="2" fill="none"/><circle cx="62" cy="35" r="2" fill="#fcd34d"/></g>'
    : '<path d="M50 20V10" stroke="#64748b" stroke-width="3"/><circle cx="50" cy="8" r="4" fill="#ef4444"/>';
  const chest = c.tie ? '<path d="M50 45l5 35-5 5-5-5z" fill="#4c1d95"/>' : '<rect x="35" y="50" width="30" height="25" rx="2" fill="#fff" fill-opacity=".3"/><circle cx="50" cy="62" r="5" fill="#fff" fill-opacity=".5"/>';
  const left = c.guitar ? '<g transform="translate(15,55) rotate(-45)"><rect width="15" height="25" rx="5" fill="#9d174d"/><rect x="5" y="-15" width="5" height="20" fill="#713f12"/><circle cx="7.5" cy="18" r="4" fill="#fce7f3"/></g>' : '';
  const right = c.briefcase ? '<g transform="translate(75,65)"><rect width="16" height="12" rx="1" fill="#581c87"/><path d="M5 0v-3h6v3" stroke="#581c87" stroke-width="2" fill="none"/></g>' : '';
  const b = h('button', { class: 'mascot', type: 'button', 'aria-label': t('mascot.hi'), html: `<svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <ellipse cx="50" cy="90" rx="20" ry="5" fill="#000" fill-opacity=".2"/>
    <g class="mascot__body"><path d="M40 85h20V75H40z" fill="#334155"/><circle cx="40" cy="85" r="5" fill="#1e293b"/><circle cx="60" cy="85" r="5" fill="#1e293b"/>
    <rect x="30" y="45" width="40" height="35" rx="5" fill="${c.color}"/>${chest}
    <g class="mascot__head"><rect x="32" y="20" width="36" height="25" rx="8" fill="#cbd5e1"/><rect x="35" y="25" width="30" height="15" rx="4" fill="#0f172a"/><g class="mascot__eyes">${eyes}</g>${top}</g>
    <path d="M30 55 20 65" stroke="#334155" stroke-width="4" stroke-linecap="round"/>${left}
    <g class="mascot__arm"><path d="M70 55l10 10" stroke="#334155" stroke-width="4" stroke-linecap="round"/></g>${right}</g></svg><span class="mascot__say">${''}</span>` });
  b.lastChild.textContent = t('mascot.hi');
  b.addEventListener('click', () => {
    b.classList.remove('is-waving');
    void b.offsetWidth;
    b.classList.add('is-waving');
    setTimeout(() => b.classList.remove('is-waving'), 1800);
  });
  return b;
}

// ---------- éléments partagés ----------
const tagList = (p) => (p.tags && p.tags.length ? h('ul', { class: 'tags' }, p.tags.map((x) => h('li', { dir: 'auto' }, P(x)))) : null);
const whenOf = (p) => [p.year || p.date, P(p.duration) && `(${P(p.duration)})`].filter(Boolean).join(' ');
const firstPhoto = (p) => {
  const m = (p.media || []).find((x) => x && x.src && !isVideo(x.src)) || (p.media || []).find((x) => x && x.poster);
  return m ? (isVideo(m.src) ? m.poster : m.src) : '';
};
function pageHead(page, iconName, title, sub) {
  return h('header', { class: 'phead' },
    mascot(page),
    h('span', { class: 'phead__icon', html: icon(iconName) }),
    h('div', { class: 'phead__main' }, h('h1', { class: 'phead__title' }, title), sub && h('p', { class: 'phead__sub' }, sub)));
}
function projectCard(p) {
  const photo = firstPhoto(p);
  return h('a', { class: 'card pcard', href: href('projets', p.id) },
    h('div', { class: 'pcard__img' },
      photo && h('img', { src: photo, alt: '', loading: 'lazy', decoding: 'async' }),
      h('span', { class: 'datepill', dir: 'auto' }, whenOf(p)),
      !no3d && h('span', { class: 'pcard__3d' }, ic('cube'), t('proj.badge3d'))),
    h('div', { class: 'pcard__body' },
      h('h3', { class: 'pcard__title' }, P(p.title)),
      h('p', { class: 'pcard__sum' }, P(p.summary)),
      tagList(p)));
}

// ---------- pages ----------
const PAGES = {
  accueil() {
    const pr = D.profile;
    const name = P(pr.name) || '';
    const cut = name.indexOf(' ');
    const cv = 'cv.html?lang=' + lang;
    return [
      mascot('accueil'),
      h('section', { class: 'hero' },
        h('div', { class: 'hero__text' },
          P(pr.status) && h('p', { class: 'hero__badge' }, h('i'), P(pr.status)),
          h('h1', { class: 'hero__name' }, cut > 0 ? [name.slice(0, cut), h('span', null, name.slice(cut + 1))] : name),
          P(pr.title) && h('p', { class: 'hero__role' }, P(pr.title)),
          P(pr.pitch) && h('p', { class: 'hero__pitch' }, P(pr.pitch)),
          h('div', { class: 'hero__cta' },
            N > 0 && h('a', { class: 'pill', href: href('projets') }, t('home.projects')),
            h('button', { class: 'pill pill--white', type: 'button', onclick: () => $('#contact').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }) }, t('home.contact')))),
        h('div', { class: 'hero__side' },
          pr.photo && h('img', { class: 'hero__photo', src: pr.photo, alt: name, width: 168, height: 168 }),
          h('div', { class: 'hero__links' },
            pr.linkedin && h('a', { class: 'linkedin', href: pr.linkedin, target: '_blank', rel: 'noopener', 'aria-label': t('contact.linkedin'), title: t('contact.linkedin'), html: LINKEDIN }),
            h('a', { class: 'cvcard', href: cv, 'aria-label': t('home.cvOpen') },
              h('span', { class: 'cvcard__top' }, h('span', { style: 'display:inline-flex;gap:6px;align-items:center' }, ic('file'), t('home.cv')), ic('download')),
              h('span', { class: 'cvcard__page' }, h('iframe', { src: 'cv.html?thumb&lang=' + lang, tabindex: '-1', 'aria-hidden': 'true', loading: 'lazy', title: 'CV' })))))),
      N > 0 && h('section', { class: 'sec' },
        h('div', { class: 'sec__head' },
          h('div', null, h('h2', { class: 'sec__title' }, t('home.featured')), h('p', { class: 'sec__sub' }, t(no3d ? 'home.featuredFlat' : 'home.featuredSub'))),
          h('a', { class: 'more', href: href('projets') }, t('home.all'), ic('next', 'flip'))),
        no3d
          ? h('div', { class: 'grid' }, projects.slice(0, 2).map(projectCard))
          : h('div', { class: 'bench', 'data-world': '-1' }, h('p', { class: 'bench__hint' }, t('hint.pick')))),
      h('section', { class: 'contact', id: 'contact' },
        h('h2', null, t('contact.title')),
        h('p', null, t('contact.sub')),
        h('div', { class: 'contact__row' },
          pr.email && h('a', { class: 'pill', href: 'mailto:' + pr.email, dir: 'ltr' }, ic('mail'), pr.email),
          pr.email && h('button', { class: 'round', type: 'button', 'aria-label': t('contact.copy'), title: t('contact.copy'), html: icon('copy'), onclick: copyMail }),
          pr.linkedin && h('a', { class: 'round', href: pr.linkedin, target: '_blank', rel: 'noopener', 'aria-label': t('contact.linkedin'), title: t('contact.linkedin'), html: LINKEDIN.replace('<svg', '<svg width="18" height="18"') }))),
    ];
  },

  competences() {
    return [
      pageHead('competences', 'star', t('page.skills'), t('page.skillsSub')),
      h('section', { class: 'card panel' },
        h('h2', { class: 'panel__title' }, ic('cube'), h('span', null, t('page.skillsAll'))),
        h('div', { class: 'families' }, (D.skills || []).map((g) => h('div', { class: 'family' }, h('h3', null, P(g.group)), h('ul', null, (g.items || []).map((x) => h('li', null, P(x)))))))),
      (D.languages || []).length > 0 && h('section', { class: 'card panel', style: 'margin-block-start:22px' },
        h('h2', { class: 'panel__title' }, ic('users'), h('span', null, t('sec.languages'))),
        h('dl', { class: 'langlist' }, D.languages.map((l) => h('div', null, h('dt', null, P(l.name)), h('dd', null, P(l.level)))))),
    ];
  },

  formation() {
    return [
      pageHead('formation', 'cap', t('page.education'), t('page.educationSub')),
      h('section', { class: 'card panel' },
        h('ol', { class: 'tl' }, (D.education || []).map((e) => h('li', { class: 'tl__item' },
          h('div', { class: 'tl__top' }, h('h2', { class: 'tl__title' }, P(e.title)), e.date && h('span', { class: 'datepill', dir: 'ltr' }, e.date)),
          P(e.school) && h('p', { class: 'tl__org' }, P(e.school)),
          P(e.detail) && h('p', { class: 'tl__detail' }, P(e.detail)))))),
    ];
  },

  projets() {
    if (route.k >= 0) return projectPage(route.k);
    return [
      pageHead('projets', 'users', t('page.projects'), t('page.projectsSub')),
      h('div', { class: 'grid' }, projects.map(projectCard)),
    ];
  },

  experience() {
    return [
      pageHead('experience', 'briefcase', t('page.experience'), t('page.experienceSub')),
      h('ol', { class: 'tl tl--cards' }, (D.experience || []).map((e) => {
        const linked = e.projectId && projects.find((p) => p.id === e.projectId);
        return h('li', { class: 'tl__item' },
          h('div', { class: 'tl__top' },
            h('h2', { class: 'tl__title' }, P(e.role), linked && h('a', { class: 'badge', href: href('projets', linked.id) }, t('exp.badge'))),
            h('span', { class: 'datepill', dir: 'auto' }, whenOf(e))),
          P(e.org) && h('p', { class: 'tl__org' }, P(e.org)),
          (e.tasks || []).length > 0 && h('ul', { class: 'tl__tasks' }, e.tasks.map((x) => h('li', null, P(x)))));
      })),
    ];
  },

  interets() {
    const icons = { scoutisme: 'compass', musique: 'music', sport: 'trophy' };
    return [
      pageHead('interets', 'heart', t('page.interests'), t('page.interestsSub')),
      h('div', { class: 'hobbies' }, (D.interests || []).map((i) => h('article', { class: 'card hobby' },
        h('span', { class: 'hobby__icon', html: icon(icons[i.id] || 'heart') }),
        h('h2', { style: 'font-size:1.1rem;font-weight:700;color:var(--ink)' }, P(i.title)),
        h('p', null, P(i.text))))),
    ];
  },
};

// ---------- page d'un projet ----------
const api = {
  night: () => lightsOff,
  setNight(v) { lightsOff = !!v; if (world) world.setTheme(lightsOff ? 0 : 1); },
};
function paragraphs(text) {
  return String(text).split(/\n\s*\n/).map((block) => {
    const lines = block.trim().split('\n');
    if (!lines[0]) return null;
    const p = h('p', { class: /^\d+[.)]\s/.test(lines[0]) ? 'is-step' : null });
    lines.forEach((line, i) => { if (i) p.append(h('br')); p.append(line); });
    return p;
  });
}
function figure(m) {
  const cap = P(m.caption);
  return h('figure', { class: 'story__fig' },
    h('img', { src: m.src, alt: cap, loading: 'lazy', decoding: 'async' }),
    h('button', { class: 'zoom', type: 'button', 'aria-label': t('sheet.zoom'), onclick: () => openLightbox(m.src, cap) }),
    cap && h('figcaption', null, cap));
}
function projectPage(k) {
  const p = projects[k];
  const S = p.sections || {};
  const media = (p.media || []).filter((m) => m && m.src);
  const photos = media.filter((m) => !isVideo(m.src));
  const part = (key) => (P(S[key]) ? h('div', null, h('h3', null, t('sheet.' + key)), paragraphs(P(S[key]))) : null);
  const con = buildConsole(items[k].model, items[k].state, t, api);
  liveConsole = no3d ? null : con;
  const stepper = () => h('span', { class: 'phead__nav' },
    h('a', { class: 'round', href: k > 0 ? href('projets', projects[k - 1].id) : null, 'aria-label': t('deck.prev'), title: t('deck.prev'), 'aria-disabled': k === 0 ? 'true' : null, style: k === 0 ? 'opacity:.4;pointer-events:none' : null, html: icon('prev', 'flip') }),
    h('a', { class: 'round', href: k < N - 1 ? href('projets', projects[k + 1].id) : null, 'aria-label': t('deck.next'), title: t('deck.next'), 'aria-disabled': k === N - 1 ? 'true' : null, style: k === N - 1 ? 'opacity:.4;pointer-events:none' : null, html: icon('next', 'flip') }));

  const first = [part('context'), part('goal')].filter(Boolean);
  const blocks = [];
  let used = 0;
  if (first.length) blocks.push(h('section', { class: 'card story__block' + (photos[used] ? '' : ' story__block--solo') }, h('div', { class: 'story__text' }, first), photos[used] && figure(photos[used++])));
  if (part('build')) blocks.push(h('section', { class: 'card story__block story__block--flip' + (photos[used] ? '' : ' story__block--solo') }, h('div', { class: 'story__text' }, part('build')), photos[used] && figure(photos[used++])));
  const last = [part('results'), part('review')].filter(Boolean);
  if (last.length) blocks.push(h('div', { class: last.length > 1 ? 'pair' : null }, last.map((x) => h('section', { class: 'card story__text' }, x))));
  // En 3D, toutes les photos non placées vont dans la galerie ; sans 3D, la première sert d'image d'en-tête.
  const hero = no3d ? photos[used++] || photos[0] : null;
  const rest = media.filter((m) => isVideo(m.src) || (photos.indexOf(m) >= used && m !== hero));

  return [
    h('header', { class: 'phead phead--project' },
      mascot('projets'),
      h('div', { class: 'phead__main' },
        h('p', { class: 'phead__row' }, h('span', { class: 'datepill', dir: 'auto' }, whenOf(p)), P(p.org) && h('span', { class: 'phead__org' }, P(p.org))),
        h('h1', { class: 'phead__title', style: 'margin-block-start:8px' }, P(p.title)),
        tagList(p)),
      h('div', { class: 'phead__nav' }, h('a', { class: 'pill pill--dark', href: href('projets') }, ic('back', 'flip'), t('proj.back')), stepper())),
    h('section', { class: 'card stage', 'aria-label': t('stage.title') },
      h('div', { class: 'stage__view', 'data-world': no3d ? null : String(k) },
        no3d && hero && h('img', { class: 'stage__photo', src: hero.src, alt: P(hero.caption) }),
        !no3d && h('p', { class: 'bench__hint' }, t('hint.orbit'))),
      !no3d && h('div', { class: 'stage__side' },
        h('h2', { class: 'stage__title' }, h('i'), t('stage.title')),
        con.el,
        h('p', { class: 'stage__note' }, t('stage.note')))),
    P(p.summary) && h('p', { class: 'card lead', style: 'margin-block-start:22px' }, P(p.summary)),
    h('div', { class: 'story' }, blocks,
      rest.length > 0 && h('section', { class: 'card panel' },
        h('h2', { class: 'panel__title' }, ic('cube'), h('span', null, t('sheet.media'))),
        h('div', { class: 'gallery' }, rest.map((m) => {
          const cap = P(m.caption);
          return isVideo(m.src)
            ? h('figure', { class: 'shot shot--video' }, h('video', { src: m.src, poster: m.poster || null, controls: true, preload: 'none', playsinline: true }), cap && h('figcaption', null, cap))
            : h('figure', { class: 'shot' }, h('img', { src: m.src, alt: cap, loading: 'lazy', decoding: 'async' }), h('button', { class: 'zoom', type: 'button', 'aria-label': t('sheet.zoom'), onclick: () => openLightbox(m.src, cap) }), cap && h('figcaption', null, cap));
        })))),
    h('div', { class: 'endrow' },
      p.pdf ? h('a', { class: 'pill pill--white', href: p.pdf, target: '_blank', rel: 'noopener' }, ic('file'), t('sheet.report')) : h('span'),
      stepper()),
  ];
}

function openLightbox(src, caption) {
  el.lightbox.replaceChildren(
    h('button', { class: 'round', type: 'button', 'aria-label': t('sheet.close'), html: icon('close'), onclick: () => el.lightbox.close() }),
    h('img', { src, alt: caption || '' }),
    caption ? h('p', null, caption) : h('span'));
  el.lightbox.showModal();
}
el.lightbox.addEventListener('click', (e) => { if (e.target.tagName !== 'IMG' && e.target.tagName !== 'P') el.lightbox.close(); });

async function copyMail(e) {
  const b = e.currentTarget;
  try {
    await navigator.clipboard.writeText(D.profile.email);
    b.innerHTML = icon('check');
    b.title = t('contact.copied');
    setTimeout(() => { b.innerHTML = icon('copy'); b.title = t('contact.copy'); }, 2200);
  } catch {
    location.href = 'mailto:' + D.profile.email;
  }
}

// ---------- rendu ----------
function renderNav() {
  el.brand.textContent = P(D.profile.name) || 'Portfolio';
  el.skip.textContent = t('skip');
  const desc = $('meta[name="description"]');
  if (desc && P(D.profile.pitch)) desc.content = P(D.profile.pitch);
  el.tabs.setAttribute('aria-label', t('nav.menu'));
  el.tabs.replaceChildren(...TABS.map(([page, label, ico]) => h('a', { href: href(page), 'aria-current': route.page === page ? 'page' : null }, ic(ico), t(label))));
  el.langs.setAttribute('aria-label', t('lang.label'));
  el.langs.replaceChildren(...LANGS.map((l) => h('button', { type: 'button', lang: l, title: NAMES[l], 'aria-label': NAMES[l], 'aria-pressed': String(l === lang), onclick: () => setLang(l) }, SHORT[l])));
  el.burger.innerHTML = icon('menu');
  el.burger.setAttribute('aria-label', t('nav.menu'));
  el.foot.replaceChildren(
    h('span', null, '© ' + new Date().getFullYear() + ' ' + (P(D.profile.name) || '')),
    h('span', { style: 'display:inline-flex;gap:18px' }, h('a', { href: 'cv.html?lang=' + lang }, t('nav.cv')), D.profile.linkedin && h('a', { href: D.profile.linkedin, target: '_blank', rel: 'noopener' }, 'LinkedIn')));
}
function render(resetScroll) {
  el.bay.append(el.canvas); // la scène 3D survit au changement de page
  mounted = false;
  liveConsole = null;
  if (lightsOff && !(route.page === 'projets' && route.k >= 0 && items[route.k].model === 'lampe')) api.setNight(false);
  renderNav();
  el.view.dataset.page = route.page;
  el.view.replaceChildren(h('div', { class: 'wrap' + (reduced ? '' : ' fade') }, PAGES[route.page]()));
  const name = P(D.profile.name) || 'Portfolio';
  const tab = TABS.find((x) => x[0] === route.page);
  document.title = route.k >= 0 ? `${P(projects[route.k].title)} – ${name}` : route.page === 'accueil' ? `${name} – ${P(D.profile.title)}` : `${t(tab[1])} – ${name}`;
  mountWorld();
  if (resetScroll) scrollTo(0, 0);
  if (route.anchor) requestAnimationFrame(() => document.getElementById(route.anchor)?.scrollIntoView({ block: 'center' }));
}

// ---------- scène 3D ----------
function mountWorld() {
  const host = el.view.querySelector('[data-world]');
  if (!world) return;
  if (!host) { world.setRunning(false); return; }
  host.prepend(el.canvas);
  world.show(+host.dataset.world, !mounted && !world.painted);
  mounted = true;
  updateRunning();
}
let hostVisible = true;
const watcher = new IntersectionObserver((entries) => { hostVisible = entries[entries.length - 1].isIntersecting; updateRunning(); });
watcher.observe(el.canvas);
function updateRunning() {
  if (world) world.setRunning(mounted && hostVisible && !document.hidden);
}
document.addEventListener('visibilitychange', updateRunning);

async function startWorld() {
  if (!N) return;
  try {
    if (!document.createElement('canvas').getContext('webgl2')) throw new Error('WebGL 2 indisponible');
    const { World } = await import('./world/world.js');
    world = new World(el.canvas, items, {
      rtl: DIR[lang] === 'rtl',
      lux: 1,
      reduced,
      onPick: (k) => { location.hash = href('projets', projects[k].id); },
      onFirstFrame: () => root.classList.add('world-on'),
    });
    el.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); world.setRunning(false); });
    el.canvas.addEventListener('webglcontextrestored', () => location.reload());
    mountWorld();
  } catch (err) {
    console.warn('3D indisponible :', err);
    world = null;
    no3d = true;
    render(false);
  }
}
// Les afficheurs du pupitre se rafraîchissent quelques fois par seconde.
setInterval(() => { if (world && liveConsole && !document.hidden) liveConsole.sync(); }, 110);

// ---------- langue, navigation ----------
function setLang(next) {
  lang = next;
  t = translator(lang);
  rememberLang(lang);
  root.lang = lang;
  root.dir = DIR[lang];
  if (world) world.setRtl(DIR[lang] === 'rtl');
  render(false);
}
addEventListener('hashchange', () => {
  route = parseRoute();
  el.tabs.classList.remove('is-open');
  el.burger.setAttribute('aria-expanded', 'false');
  render(true);
  el.view.focus({ preventScroll: true });
});
// « Aller au contenu » : on déplace le focus sans toucher à l'adresse (elle sert aux onglets).
el.skip.addEventListener('click', (e) => { e.preventDefault(); el.view.focus(); el.view.scrollIntoView(); });
el.burger.addEventListener('click', () => el.burger.setAttribute('aria-expanded', String(el.tabs.classList.toggle('is-open'))));

// ---------- démarrage ----------
root.lang = lang;
root.dir = DIR[lang];
render(false);
if (isDraft) document.body.append(h('p', { class: 'banner', role: 'status' }, 'Aperçu du brouillon de l’admin : ce contenu n’est pas encore publié.'));
startWorld();
