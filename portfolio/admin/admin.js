// Admin du portfolio : édite le contenu dans les trois langues, garde un brouillon dans le navigateur,
// puis publie (envoi direct sur GitHub, ou téléchargement de data/content.js).

const LANGS = ['fr', 'en', 'he'];
const DRAFT = 'portfolio.draft';
const GH = 'portfolio.admin.github';
const VIEW = 'portfolio.admin.view';
const MODELS = [
  ['drone', 'Drone flottant dans une galerie'],
  ['station', 'Station d’épuration'],
  ['arrosage', 'Arrosage hydroponique'],
  ['reseau', 'Réseau électrique'],
  ['sonore', 'Émetteur sonore et robot'],
  ['robot', 'Robot détecteur d’obstacles'],
  ['lampe', 'Lampe SmartLight'],
  ['armoire', 'Platine UniLogic et instruments'],
  ['generic', 'Maquette générique (pour un nouveau projet)'],
];
const SECTION_KEYS = [['context', 'Contexte'], ['goal', 'Objectif'], ['build', 'Réalisation'], ['results', 'Résultats'], ['review', 'Bilan']];

const clone = (o) => JSON.parse(JSON.stringify(o));
const published = clone(window.PORTFOLIO || { version: 2, profile: {}, projects: [], experience: [], education: [], skills: [], languages: [], interests: [] });
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

let data = clone(published);
let hadDraft = false;
try {
  const d = JSON.parse(store.get(DRAFT) || 'null');
  if (d && d.profile && JSON.stringify(d) !== JSON.stringify(published)) { data = d; hadDraft = true; }
} catch {}
for (const k of ['projects', 'experience', 'education', 'skills', 'languages', 'interests']) data[k] ||= [];
data.profile ||= {};

let view = store.get(VIEW) || (innerWidth < 860 ? 'fr' : 'all');
let section = 'profile';
const opened = new WeakSet();
const pending = new Map(); // chemin dans le dépôt → fichier à envoyer
const previews = new Map(); // chemin → URL locale pour l'aperçu

const $ = (s) => document.querySelector(s);
function h(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false && kid !== '') n.append(kid);
  return n;
}
const blankL = () => ({ fr: '', en: '', he: '' });
const asL = (v) => (v && typeof v === 'object' ? { fr: v.fr || '', en: v.en || '', he: v.he || '' } : { fr: v || '', en: v || '', he: v || '' });

// ---------- brouillon ----------
let timer = 0;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const ok = store.set(DRAFT, JSON.stringify(data));
    paintState(ok ? '' : 'Impossible d’enregistrer le brouillon dans ce navigateur.');
  }, 250);
  paintState();
}
const isDirty = () => JSON.stringify(data) !== JSON.stringify(published) || pending.size > 0;
function paintState(problem) {
  const el = $('#state');
  const dirty = isDirty();
  el.className = 'state' + (dirty ? ' is-dirty' : '');
  el.textContent = problem || (dirty ? 'Brouillon non publié, gardé sur cet appareil' : 'Identique au site en ligne');
}

// ---------- champs ----------
/** Champ traduit : une ligne par langue, signalée tant qu'elle reste vide alors qu'une autre est remplie. */
function fieldL(label, holder, key, opt = {}) {
  holder[key] = asL(holder[key]);
  const v = holder[key];
  const rows = LANGS.map((l) => {
    const input = opt.multi ? h('textarea', { rows: opt.rows || 3 }) : h('input', { type: 'text' });
    input.value = v[l];
    input.lang = l;
    input.dir = l === 'he' ? 'rtl' : 'ltr';
    input.setAttribute('aria-label', `${label} (${l.toUpperCase()})`);
    if (opt.placeholder && l === 'fr') input.placeholder = opt.placeholder;
    input.addEventListener('input', () => { v[l] = input.value; mark(); save(); opt.onchange && opt.onchange(); });
    return h('label', { class: 'lrow', 'data-l': l }, h('span', { class: 'ltag' }, l === 'he' ? 'עב' : l.toUpperCase()), input);
  });
  const mark = () => {
    const some = LANGS.some((l) => v[l].trim());
    rows.forEach((r, i) => r.classList.toggle('is-missing', some && !v[LANGS[i]].trim()));
  };
  mark();
  return h('fieldset', { class: 'f' }, label && h('legend', null, label), opt.hint && h('p', { class: 'hint' }, opt.hint), rows);
}
function field(label, holder, key, opt = {}) {
  const input = h('input', { type: opt.type || 'text', placeholder: opt.placeholder, autocomplete: 'off', spellcheck: 'false' });
  input.value = holder[key] ?? '';
  if (opt.ltr) input.dir = 'ltr';
  input.addEventListener('input', () => { holder[key] = input.value; if (!opt.local) save(); opt.onchange && opt.onchange(); });
  return h('label', { class: 'f' }, h('span', { class: 'lab' }, label), input, opt.hint && h('span', { class: 'hint' }, opt.hint));
}
function choice(label, holder, key, options, opt = {}) {
  const sel = h('select', null, options.map(([val, text]) => h('option', { value: val }, text)));
  sel.value = holder[key] ?? options[0][0];
  sel.addEventListener('change', () => { holder[key] = sel.value; save(); });
  return h('label', { class: 'f' }, h('span', { class: 'lab' }, label), sel, opt.hint && h('span', { class: 'hint' }, opt.hint));
}
const ico = (label, glyph, onclick, disabled) => h('button', { class: 'ico', type: 'button', 'aria-label': label, title: label, disabled, onclick: (e) => { e.preventDefault(); e.stopPropagation(); onclick(); } }, glyph);
function move(list, i, d) {
  const j = i + d;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  save();
  render();
}
function removeAt(list, i, what) {
  if (!confirm(`Supprimer ${what} ? Tant que tu n’as pas publié, le site en ligne ne change pas.`)) return;
  list.splice(i, 1);
  save();
  render();
}

/** Liste de fiches repliables (projets, expériences…). */
function cards(list, { title, body, make, add, what }) {
  return [
    list.map((item, i) => {
      const card = h('details', { class: 'card', open: opened.has(item) },
        h('summary', null,
          h('span', { class: 'ttl' }, title(item) || '(sans titre)'),
          h('span', { class: 'tools' },
            ico('Monter', '↑', () => move(list, i, -1), i === 0),
            ico('Descendre', '↓', () => move(list, i, 1), i === list.length - 1),
            ico('Supprimer', '✕', () => removeAt(list, i, what)))),
        h('div', { class: 'card__body' }));
      const fill = () => { if (!card.dataset.done) { card.dataset.done = '1'; card.lastChild.append(...[body(item, card)].flat(Infinity).filter(Boolean)); } };
      if (card.open) fill();
      card.addEventListener('toggle', () => { if (card.open) { opened.add(item); fill(); } else opened.delete(item); });
      return card;
    }),
    h('p', null, h('button', { class: 'btn', type: 'button', onclick: () => { const it = make(); list.push(it); opened.add(it); save(); render(); } }, add)),
  ];
}
/** Petite liste de textes traduits (étiquettes, missions, compétences). */
function miniList(label, holder, key, addLabel) {
  holder[key] ||= [];
  const list = holder[key];
  const box = h('div', { class: 'mini' });
  const paint = () => {
    box.replaceChildren(
      ...list.map((_, i) => h('div', { class: 'mini__row' },
        fieldL('', list, i),
        h('span', { class: 'tools' }, ico('Monter', '↑', () => { if (i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; save(); paint(); } }, i === 0), ico('Supprimer', '✕', () => { list.splice(i, 1); save(); paint(); })))),
      h('p', null, h('button', { class: 'btn btn--quiet', type: 'button', onclick: () => { list.push(blankL()); save(); paint(); box.querySelector('.mini__row:last-of-type input, .mini__row:last-of-type textarea')?.focus(); } }, addLabel)));
  };
  paint();
  return h('div', { class: 'f' }, h('span', { class: 'lab' }, label), box);
}

// ---------- fichiers (photos, vidéos, PDF) ----------
const extOf = (name) => (name.match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase();
/** Réduit une photo trop lourde (1600 px de côté au plus, JPEG) pour garder un site rapide. */
async function slim(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 350e3) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.84));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file;
  } catch { return file; }
}
async function stage(file, path) {
  const ready = await slim(file);
  const ext = ready.type === 'image/jpeg' ? 'jpg' : extOf(ready.name) || 'bin';
  const full = `${path}.${ext}`;
  pending.set(full, ready);
  if (previews.has(full)) URL.revokeObjectURL(previews.get(full));
  previews.set(full, URL.createObjectURL(ready));
  paintState();
  return full;
}
const filePicker = (label, accept, onfile) => h('span', { class: 'btn btn--quiet file' }, label, h('input', { type: 'file', accept, 'aria-label': label, onchange: (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) onfile(f); } }));
function thumb(src) {
  if (!src) return h('span', { class: 'thumb' }, 'Aucun fichier');
  const url = previews.get(src) || '../' + src;
  if (/\.(mp4|webm)$/i.test(src)) return h('span', { class: 'thumb' }, pending.has(src) ? 'Vidéo à envoyer' : 'Vidéo');
  if (/\.pdf$/i.test(src)) return h('span', { class: 'thumb' }, 'PDF');
  const img = h('img', { class: 'thumb', src: url, alt: '' });
  img.addEventListener('error', () => img.replaceWith(h('span', { class: 'thumb' }, 'Fichier introuvable')));
  return img;
}
function freeName(p) {
  const used = new Set((p.media || []).flatMap((m) => [m.src, m.poster]).filter(Boolean).map((s) => s.replace(/\.\w+$/, '')));
  let n = 1;
  while (used.has(`images/${p.id}-${n}`)) n++;
  return `images/${p.id}-${n}`;
}
function mediaEditor(p) {
  p.media ||= [];
  const box = h('div', { class: 'mini' });
  const paint = () => {
    box.replaceChildren(
      ...p.media.map((m, i) => h('div', { class: 'media-row' },
        thumb(/\.(mp4|webm)$/i.test(m.src || '') && m.poster ? m.poster : m.src),
        h('div', { class: 'stack' },
          field('Fichier', m, 'src', { ltr: true, placeholder: 'images/mon-projet-1.jpg', onchange: () => {} }),
          /\.(mp4|webm)$/i.test(m.src || '') && field('Image d’attente de la vidéo', m, 'poster', { ltr: true, placeholder: 'images/mon-projet-1.jpg' }),
          fieldL('Légende', m, 'caption')),
        h('span', { class: 'tools' },
          ico('Monter', '↑', () => { if (i > 0) { [p.media[i - 1], p.media[i]] = [p.media[i], p.media[i - 1]]; save(); paint(); } }, i === 0),
          ico('Supprimer', '✕', () => { p.media.splice(i, 1); save(); paint(); })))),
      h('p', null, filePicker('Ajouter une photo ou une vidéo', 'image/*,video/mp4,video/webm', async (f) => {
        if (!p.id) return alert('Donne d’abord un identifiant au projet.');
        if (f.size > 45e6) return alert('Ce fichier dépasse 45 Mo : compresse la vidéo avant de l’ajouter.');
        const src = await stage(f, freeName(p));
        p.media.push({ src, caption: blankL() });
        save();
        paint();
      })));
  };
  paint();
  return h('div', { class: 'f' }, h('span', { class: 'lab' }, 'Photos et vidéos'), h('p', { class: 'hint' }, 'Les photos lourdes sont allégées automatiquement. Les fichiers ajoutés ici partent avec la prochaine publication.'), box);
}

// ---------- rubriques ----------
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const SECTIONS = {
  profile: {
    label: 'Profil',
    draw: () => {
      const p = data.profile;
      const photo = h('div', { class: 'media-row' });
      const paintPhoto = () => photo.replaceChildren(thumb(p.photo), h('div', { class: 'stack' }, field('Photo', p, 'photo', { ltr: true }), h('p', null, filePicker('Changer la photo', 'image/*', async (f) => { p.photo = await stage(f, 'images/' + (slug(asL(p.name).fr) || 'portrait')); save(); paintPhoto(); }))), h('span'));
      paintPhoto();
      return [
        h('p', { class: 'intro' }, 'Ce qui s’affiche en haut du site et en tête du CV.'),
        h('div', { class: 'panel' },
          fieldL('Nom', p, 'name'),
          fieldL('Titre', p, 'title', { hint: 'La ligne sous ton nom : ton domaine, en quelques mots.' }),
          fieldL('Présentation', p, 'pitch', { multi: true, hint: 'Deux ou trois phrases. Elles servent aussi de description pour Google.' }),
          fieldL('Ce que tu cherches', p, 'status', { hint: 'Affiché à côté du voyant vert. Laisse vide pour le masquer.' })),
        h('div', { class: 'panel' },
          h('h3', null, 'Coordonnées'),
          h('div', { class: 'row2' },
            field('E-mail', p, 'email', { type: 'email', ltr: true }),
            field('LinkedIn', p, 'linkedin', { type: 'url', ltr: true }),
            field('Téléphone', p, 'phone', { ltr: true, hint: 'Facultatif. S’il est rempli, il sera visible par tout le monde sur le CV.' })),
          fieldL('Ville', p, 'location'),
          fieldL('Permis', p, 'license'),
          photo),
      ];
    },
  },
  projects: {
    label: 'Projets',
    count: () => data.projects.length,
    draw: () => [
      h('p', { class: 'intro' }, 'L’ordre de cette liste est l’ordre de visite sur le site. Chaque projet a sa maquette 3D, son résumé et sa fiche détaillée.'),
      cards(data.projects, {
        what: 'ce projet',
        add: 'Ajouter un projet',
        title: (p) => [p.year, asL(p.title).fr].filter(Boolean).join('  ·  '),
        make: () => ({ id: 'projet-' + (data.projects.length + 1), model: 'generic', year: String(new Date().getFullYear()), duration: blankL(), org: blankL(), title: blankL(), summary: blankL(), tags: [], sections: {}, media: [], pdf: '' }),
        body: (p, card) => {
          p.sections ||= {};
          const pdf = h('div', { class: 'f' });
          const paintPdf = () => pdf.replaceChildren(field('Rapport PDF', p, 'pdf', { ltr: true, placeholder: `projects/${p.id}.pdf`, hint: pending.has(p.pdf) ? 'Ce PDF partira avec la prochaine publication.' : 'Facultatif.' }), h('p', null, filePicker('Choisir un PDF', 'application/pdf', (f) => { if (!p.id) return alert('Donne d’abord un identifiant au projet.'); const path = `projects/${p.id}.pdf`; pending.set(path, f); p.pdf = path; paintState(); save(); paintPdf(); })));
          paintPdf();
          return [
            h('div', { class: 'row2' },
              field('Année', p, 'year', { onchange: () => { card.querySelector('.ttl').textContent = [p.year, p.title.fr].filter(Boolean).join('  ·  '); } }),
              choice('Maquette 3D', p, 'model', MODELS, { hint: 'La scène animée affichée pour ce projet.' }),
              field('Identifiant', p, 'id', { ltr: true, hint: 'Sert au lien direct et aux noms de fichiers. Minuscules, chiffres et tirets.', onchange: () => { p.id = slug(p.id); } })),
            fieldL('Titre', p, 'title', { onchange: () => { card.querySelector('.ttl').textContent = [p.year, p.title.fr].filter(Boolean).join('  ·  '); } }),
            fieldL('Cadre', p, 'org', { placeholder: 'Stage chez…, Projet à l’IUT…' }),
            fieldL('Durée', p, 'duration', { placeholder: '120 heures, 8 semaines…' }),
            fieldL('Résumé', p, 'summary', { multi: true, hint: 'Deux lignes au plus : c’est le texte du pupitre et du CV.' }),
            miniList('Étiquettes', p, 'tags', 'Ajouter une étiquette'),
            h('h3', null, 'Fiche détaillée'),
            SECTION_KEYS.map(([k, label]) => fieldL(label, p.sections, k, { multi: true, rows: 5 })),
            mediaEditor(p),
            pdf,
          ];
        },
      }),
    ],
  },
  experience: {
    label: 'Expérience',
    count: () => data.experience.length,
    draw: () => [
      h('p', { class: 'intro' }, 'Stages, emplois, engagements. Du plus récent au plus ancien.'),
      cards(data.experience, {
        what: 'cette expérience',
        add: 'Ajouter une expérience',
        title: (e) => [e.date, asL(e.role).fr].filter(Boolean).join('  ·  '),
        make: () => ({ id: 'exp-' + Date.now().toString(36), date: String(new Date().getFullYear()), duration: blankL(), role: blankL(), org: blankL(), tasks: [], projectId: '' }),
        body: (e) => [
          h('div', { class: 'row2' },
            field('Dates', e, 'date', { placeholder: '2026 ou 2024 – 2025' }),
            choice('Projet lié', e, 'projectId', [['', 'Aucun'], ...data.projects.map((p) => [p.id, asL(p.title).fr || p.id])], { hint: 'Ajoute un lien « Voir le projet ». Un projet lié n’est pas répété dans le CV.' })),
          fieldL('Poste', e, 'role'),
          fieldL('Entreprise et lieu', e, 'org'),
          fieldL('Durée', e, 'duration'),
          miniList('Missions', e, 'tasks', 'Ajouter une mission'),
        ],
      }),
    ],
  },
  education: {
    label: 'Formation',
    count: () => data.education.length,
    draw: () => [
      h('p', { class: 'intro' }, 'Diplômes et certifications. Du plus récent au plus ancien.'),
      cards(data.education, {
        what: 'cette formation',
        add: 'Ajouter une formation',
        title: (e) => [e.date, asL(e.title).fr].filter(Boolean).join('  ·  '),
        make: () => ({ id: 'edu-' + Date.now().toString(36), date: String(new Date().getFullYear()), title: blankL(), school: blankL(), detail: blankL() }),
        body: (e) => [field('Dates', e, 'date', { placeholder: '2023 – 2026' }), fieldL('Diplôme', e, 'title'), fieldL('Établissement', e, 'school'), fieldL('Précision', e, 'detail', { hint: 'Spécialité, mention, équivalence pour un lecteur étranger…' })],
      }),
    ],
  },
  skills: {
    label: 'Compétences',
    count: () => data.skills.length,
    draw: () => [
      h('p', { class: 'intro' }, 'Des familles de compétences, sans pourcentage : chaque ligne doit pouvoir se prouver par un projet.'),
      cards(data.skills, {
        what: 'cette famille',
        add: 'Ajouter une famille',
        title: (g) => asL(g.group).fr,
        make: () => ({ group: blankL(), items: [] }),
        body: (g) => [fieldL('Nom de la famille', g, 'group'), miniList('Compétences', g, 'items', 'Ajouter une compétence')],
      }),
    ],
  },
  languages: {
    label: 'Langues',
    count: () => data.languages.length,
    draw: () => [
      cards(data.languages, {
        what: 'cette langue',
        add: 'Ajouter une langue',
        title: (l) => [asL(l.name).fr, asL(l.level).fr].filter(Boolean).join('  ·  '),
        make: () => ({ name: blankL(), level: blankL() }),
        body: (l) => [fieldL('Langue', l, 'name'), fieldL('Niveau', l, 'level', { placeholder: 'Langue maternelle, courant, B2…' })],
      }),
    ],
  },
  interests: {
    label: 'Centres d’intérêt',
    count: () => data.interests.length,
    draw: () => [
      cards(data.interests, {
        what: 'ce centre d’intérêt',
        add: 'Ajouter un centre d’intérêt',
        title: (i) => asL(i.title).fr,
        make: () => ({ id: 'int-' + Date.now().toString(36), title: blankL(), text: blankL() }),
        body: (i) => [fieldL('Titre', i, 'title'), fieldL('En une phrase', i, 'text', { multi: true, rows: 2 })],
      }),
    ],
  },
  publish: { label: 'Publier', draw: drawPublish },
};

// ---------- publication ----------
const fileText = () => '// Contenu du portfolio (français, anglais, hébreu).\n// Ce fichier se modifie depuis la page admin/ : inutile de l’éditer à la main.\nwindow.PORTFOLIO = ' + JSON.stringify(data, null, 1) + ';\n';
function download(name, blob) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function guessRepo() {
  const host = location.hostname;
  const m = host.match(/^([a-z0-9-]+)\.github\.io$/i);
  const first = location.pathname.split('/').filter(Boolean)[0];
  return { owner: m ? m[1] : 'ethan-allouche', repo: m && first && first !== 'admin' ? first : m ? host : 'Portfolio' };
}
function ghConfig() {
  let saved = {};
  try { saved = JSON.parse(store.get(GH) || '{}'); } catch {}
  return { ...guessRepo(), branch: '', token: '', keep: false, ...saved };
}
const gh = ghConfig();
const toBase64 = (blob) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => ko(r.error); r.readAsDataURL(blob); });
async function api(path, opt = {}) {
  const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}${path}`, {
    ...opt,
    headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + gh.token.trim(), 'X-GitHub-Api-Version': '2022-11-28', ...(opt.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (res.status === 404 && opt.allow404) return null;
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).message || ''; } catch {}
    const why = res.status === 401 ? 'jeton refusé (expiré ou mal copié)' : res.status === 403 ? 'accès refusé : le jeton n’a pas le droit d’écrire dans ce dépôt' : res.status === 404 ? 'dépôt introuvable avec ce jeton' : res.status === 409 ? 'conflit : le dépôt a changé pendant l’envoi, réessaie' : 'erreur ' + res.status;
    throw new Error(`${why}${detail ? ' (' + detail + ')' : ''}`);
  }
  return res.json();
}
const repoPath = (p) => p.split('/').map(encodeURIComponent).join('/');
async function putFile(path, blob, message) {
  const existing = await api(`/contents/${repoPath(path)}?ref=${encodeURIComponent(gh.branch)}`, { allow404: true });
  await api(`/contents/${repoPath(path)}`, { method: 'PUT', body: JSON.stringify({ message, branch: gh.branch, content: await toBase64(blob), ...(existing && existing.sha ? { sha: existing.sha } : {}) }) });
}
async function connect() {
  if (!gh.token.trim()) throw new Error('colle d’abord ton jeton GitHub');
  const repo = await api('');
  if (repo.permissions && repo.permissions.push === false) throw new Error('ce jeton peut lire le dépôt, mais pas y écrire');
  if (!gh.branch) gh.branch = repo.default_branch || 'main';
  return repo;
}
function rememberGh() {
  const { token, ...rest } = gh;
  store.set(GH, JSON.stringify(gh.keep ? gh : rest));
}

function checks() {
  const issues = [];
  const ids = data.projects.map((p) => p.id);
  if (ids.some((id) => !id)) issues.push('Un projet n’a pas d’identifiant.');
  if (new Set(ids).size !== ids.length) issues.push('Deux projets portent le même identifiant.');
  let missing = 0;
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (!Array.isArray(o) && 'fr' in o && 'en' in o && 'he' in o && Object.keys(o).length === 3) {
      const filled = LANGS.filter((l) => String(o[l] || '').trim()).length;
      if (filled > 0 && filled < 3) missing++;
      return;
    }
    Object.values(o).forEach(walk);
  })(data);
  return { issues, missing };
}

function drawPublish() {
  const { issues, missing } = checks();
  const log = h('div', { class: 'log', role: 'status' });
  const say = (cls, text) => { log.append(h('p', { class: 'msg msg--' + cls }, text)); };
  const files = [...pending.keys()];

  const sendBtn = h('button', { class: 'btn btn--go', type: 'button' }, 'Publier sur le site');
  sendBtn.addEventListener('click', async () => {
    log.replaceChildren();
    if (issues.length) return say('bad', 'Corrige d’abord : ' + issues.join(' '));
    sendBtn.disabled = true;
    try {
      say('info', 'Connexion à GitHub…');
      await connect();
      rememberGh();
      for (const [path, blob] of [...pending]) {
        say('info', `Envoi de ${path}…`);
        await putFile(path, blob, `Admin : ajoute ${path}`);
        pending.delete(path);
      }
      say('info', 'Envoi du contenu…');
      await putFile('data/content.js', new Blob([fileText()], { type: 'text/javascript' }), 'Admin : met à jour le contenu du portfolio');
      Object.assign(published, clone(data));
      for (const k of Object.keys(published)) if (!(k in data)) delete published[k];
      clearTimeout(timer);
      store.del(DRAFT);
      paintState();
      say('ok', 'Publié. GitHub met le site à jour en une à deux minutes : recharge-le ensuite pour vérifier.');
    } catch (e) {
      say('bad', 'La publication a échoué : ' + (e.message || e) + '. Rien n’est perdu, ton brouillon est toujours là.');
    }
    sendBtn.disabled = false;
  });
  const testBtn = h('button', { class: 'btn', type: 'button', onclick: async () => {
    log.replaceChildren();
    try { const r = await connect(); rememberGh(); say('ok', `Connexion réussie au dépôt ${r.full_name}, branche ${gh.branch}.`); } catch (e) { say('bad', 'Connexion impossible : ' + (e.message || e) + '.'); }
  } }, 'Tester la connexion');

  const keep = h('input', { type: 'checkbox' });
  keep.checked = !!gh.keep;
  keep.addEventListener('change', () => { gh.keep = keep.checked; rememberGh(); });

  return [
    h('p', { class: 'intro' }, 'Tes modifications restent un brouillon sur cet appareil tant que tu n’as pas publié. Le bouton « Aperçu », en haut, montre le site avec ce brouillon.'),
    issues.length > 0 && h('p', { class: 'msg msg--bad' }, issues.join(' ')),
    missing > 0 && h('p', { class: 'msg msg--warn' }, `${missing} champ${missing > 1 ? 's ne sont' : ' n’est'} pas traduit${missing > 1 ? 's' : ''} dans les trois langues (repérés en orange). En attendant, le site affiche le texte français à la place.`),
    files.length > 0 && h('p', { class: 'msg msg--info' }, `${files.length} fichier${files.length > 1 ? 's' : ''} à envoyer : ${files.join(', ')}. Ils ne sont gardés que tant que cette page reste ouverte.`),
    h('div', { class: 'panel' },
      h('h3', null, 'Publier en un clic'),
      h('p', { class: 'hint' }, 'L’admin écrit directement dans ton dépôt GitHub. Il lui faut un jeton, à créer une seule fois.'),
      h('ol', { class: 'steps' },
        h('li', null, 'Sur GitHub : Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.'),
        h('li', null, 'Repository access : « Only select repositories », puis choisis le dépôt du portfolio.'),
        h('li', null, 'Permissions, Repository permissions : « Contents » sur « Read and write ». Rien d’autre.'),
        h('li', null, 'Copie le jeton et colle-le ci-dessous.')),
      h('div', { class: 'row2' },
        field('Jeton GitHub', gh, 'token', { type: 'password', ltr: true, local: true, onchange: rememberGh }),
        field('Compte', gh, 'owner', { ltr: true, local: true, onchange: rememberGh }),
        field('Dépôt', gh, 'repo', { ltr: true, local: true, onchange: rememberGh }),
        field('Branche', gh, 'branch', { ltr: true, local: true, placeholder: 'détectée automatiquement', onchange: rememberGh })),
      h('label', { style: 'display:flex;gap:8px;align-items:center' }, keep, 'Garder le jeton dans ce navigateur (à éviter sur un ordinateur partagé)'),
      h('p', { style: 'display:flex;flex-wrap:wrap;gap:10px' }, sendBtn, testBtn),
      log),
    h('div', { class: 'panel' },
      h('h3', null, 'Ou publier à la main'),
      h('ol', { class: 'steps' },
        h('li', null, 'Télécharge le fichier ci-dessous.'),
        h('li', null, 'Sur GitHub, ouvre le dossier ', h('code', null, 'data'), ' du dépôt, puis « Add file », « Upload files », et dépose ', h('code', null, 'content.js'), ' à la place de l’ancien.'),
        files.length > 0 && h('li', null, 'Fais pareil pour les photos, vidéos et PDF, dans les dossiers ', h('code', null, 'images'), ' et ', h('code', null, 'projects'), '.')),
      h('p', { style: 'display:flex;flex-wrap:wrap;gap:10px' },
        h('button', { class: 'btn', type: 'button', onclick: () => download('content.js', new Blob([fileText()], { type: 'text/javascript' })) }, 'Télécharger content.js'),
        files.length > 0 && h('button', { class: 'btn', type: 'button', onclick: () => { for (const [path, blob] of pending) download(path.split('/').pop(), blob); } }, 'Télécharger les fichiers ajoutés'))),
    h('div', { class: 'panel' },
      h('h3', null, 'Sauvegarde'),
      h('p', { style: 'display:flex;flex-wrap:wrap;gap:10px' },
        filePicker('Reprendre un content.js sauvegardé', '.js,.json,text/javascript,application/json', async (f) => {
          try {
            const text = await f.text();
            const parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
            if (!parsed.profile) throw new Error('profil absent');
            data = parsed;
            for (const k of ['projects', 'experience', 'education', 'skills', 'languages', 'interests']) data[k] ||= [];
            save();
            render();
          } catch (e) { alert('Ce fichier n’est pas un content.js valide (' + (e.message || e) + ').'); }
        }),
        h('button', { class: 'btn btn--danger', type: 'button', onclick: () => {
          if (!confirm('Abandonner le brouillon et revenir au contenu du site en ligne ?')) return;
          data = clone(published);
          pending.clear();
          clearTimeout(timer);
          store.del(DRAFT);
          render();
          paintState();
        } }, 'Abandonner le brouillon'))),
  ];
}

// ---------- rendu ----------
function render() {
  $('#nav').replaceChildren(...Object.entries(SECTIONS).map(([key, s]) => h('button', { type: 'button', 'aria-current': String(key === section), onclick: () => { section = key; render(); scrollTo({ top: 0 }); } }, s.label, s.count && h('span', { class: 'n' }, String(s.count())))));
  $('#main').replaceChildren(h('h2', null, SECTIONS[section].label), ...[SECTIONS[section].draw()].flat(Infinity).filter(Boolean));
  paintState();
}
function paintView() {
  document.body.dataset.view = view;
  $('#view').replaceChildren(...[['all', 'Toutes'], ['fr', 'FR'], ['en', 'EN'], ['he', 'עב']].map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(v === view), onclick: () => { view = v; store.set(VIEW, v); paintView(); } }, label)));
}
$('#go').addEventListener('click', () => { section = 'publish'; render(); scrollTo({ top: 0 }); });
$('#preview').addEventListener('click', () => { clearTimeout(timer); store.set(DRAFT, JSON.stringify(data)); });
addEventListener('beforeunload', (e) => { if (pending.size) { e.preventDefault(); e.returnValue = ''; } });

paintView();
render();
if (hadDraft) $('#main').prepend(h('p', { class: 'msg msg--info' }, 'Brouillon retrouvé : tu reprends là où tu t’étais arrêté. Pour repartir du site en ligne, va dans « Publier », puis « Abandonner le brouillon ».'));
