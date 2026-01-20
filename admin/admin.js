/* Full Admin (statique) pour GitHub Pages
   - Charge /data/content.json (et/ou /data/content.js)
   - Permet d'éditer les sections
   - Export/Import de content.json
   IMPORTANT: GitHub Pages ne permet pas d'écrire sur le serveur.
   => Après export, remplace data/content.json ET data/content.js dans ton repo puis push.
*/

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, children = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return n;
};

const ICON_NAMES = ['Leaf', 'Music', 'Trophy', 'Heart', 'Star', 'Cpu', 'Code', 'Users', 'Briefcase', 'GraduationCap', 'Home'];

let state = null;
let activeSection = 'global';

function setStatus(type, msg) {
  const box = $('#status');
  const cls = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-900'
    : type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
      : 'bg-slate-50 border-slate-200 text-slate-900';
  box.innerHTML = '';
  box.appendChild(
    el('div', { class: `border rounded-xl px-4 py-3 ${cls}` }, [
      el('div', { class: 'font-semibold mb-1' }, [type === 'error' ? 'Erreur' : type === 'success' ? 'OK' : 'Info']),
      el('div', { class: 'text-sm leading-relaxed' }, [msg])
    ])
  );
}

async function loadRemoteContent() {
  // 1) Mode "hébergé" (GitHub Pages / serveur) => fetch OK
  try {
    const res = await fetch('../data/content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  } catch (e) {
    // 2) Mode local file:// => fetch bloqué par le navigateur
    if (window.__PORTFOLIO_CONTENT__) {
      // clone (évite de modifier l'objet global)
      return JSON.parse(JSON.stringify(window.__PORTFOLIO_CONTENT__));
    }
    throw new Error('Failed to fetch (ouvre le dossier via un petit serveur local, ou utilise Importer JSON).');
  }
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Pour que le site marche aussi en local via file:// (sans serveur),
// on génère un fichier JS statique qui pose window.__PORTFOLIO_CONTENT__.
function downloadContentJs(filename, data) {
  const js = 'window.__PORTFOLIO_CONTENT__ = ' + JSON.stringify(data, null, 2) + ';\n';
  const blob = new Blob([js], { type: 'application/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus('success', 'JSON copié dans le presse-papiers.');
  } catch {
    setStatus('error', "Impossible de copier. Utilise le bouton Télécharger.");
  }
}

function navButton(id, label, desc) {
  const isActive = id === activeSection;
  return el('button', {
    class: `w-full text-left px-4 py-3 rounded-xl border transition ${isActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`,
    onclick: () => { activeSection = id; render(); }
  }, [
    el('div', { class: 'font-semibold' }, [label]),
    el('div', { class: `text-xs mt-1 ${isActive ? 'text-slate-200' : 'text-slate-500'}` }, [desc])
  ]);
}

function inputRow(label, value, { type = 'text', placeholder = '', oninput } = {}) {
  const id = 'i_' + Math.random().toString(36).slice(2);
  const inp = el('input', {
    id,
    type,
    value: value ?? '',
    placeholder,
    class: 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900'
  });
  if (oninput) inp.addEventListener('input', (e) => oninput(e.target.value));
  return el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
    el('label', { for: id, class: 'text-sm font-semibold text-slate-700' }, [label]),
    el('div', { class: 'md:col-span-2' }, [inp])
  ]);
}

function textareaRow(label, value, { placeholder = '', oninput } = {}) {
  const id = 't_' + Math.random().toString(36).slice(2);
  const ta = el('textarea', {
    id,
    placeholder,
    class: 'w-full min-h-[110px] rounded-xl border border-slate-200 px-3 py-2 text-sm mono focus:outline-none focus:ring-2 focus:ring-slate-900'
  }, []);
  ta.value = value ?? '';
  if (oninput) ta.addEventListener('input', (e) => oninput(e.target.value));
  return el('div', { class: 'grid md:grid-cols-3 gap-3' }, [
    el('label', { for: id, class: 'text-sm font-semibold text-slate-700 pt-2' }, [label]),
    el('div', { class: 'md:col-span-2' }, [ta])
  ]);
}

function numberRow(label, value, { min = 0, max = 100, step = 1, oninput } = {}) {
  return inputRow(label, value, { type: 'number', placeholder: `${min}-${max}`, oninput: (v) => oninput(Number(v)) });
}

function selectRow(label, value, options, { onchange } = {}) {
  const id = 's_' + Math.random().toString(36).slice(2);
  const sel = el('select', {
    id,
    class: 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900'
  });
  options.forEach(opt => {
    sel.appendChild(el('option', { value: opt }, [opt]));
  });
  sel.value = value ?? options[0];
  if (onchange) sel.addEventListener('change', (e) => onchange(e.target.value));
  return el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
    el('label', { for: id, class: 'text-sm font-semibold text-slate-700' }, [label]),
    el('div', { class: 'md:col-span-2' }, [sel])
  ]);
}

// Select avec couple value/label
function selectRowKV(label, value, options, { onchange } = {}) {
  const id = 's_' + Math.random().toString(36).slice(2);
  const sel = el('select', {
    id,
    class: 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900'
  });
  (options || []).forEach(opt => {
    sel.appendChild(el('option', { value: opt.value }, [opt.label]));
  });
  sel.value = (value ?? (options && options[0] ? options[0].value : ''));
  if (onchange) sel.addEventListener('change', (e) => onchange(e.target.value));
  return el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
    el('label', { for: id, class: 'text-sm font-semibold text-slate-700' }, [label]),
    el('div', { class: 'md:col-span-2' }, [sel])
  ]);
}

function checkboxRow(label, checked, { onchange } = {}) {
  const id = 'c_' + Math.random().toString(36).slice(2);
  const inp = el('input', {
    id,
    type: 'checkbox',
    class: 'h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
  });
  inp.checked = !!checked;
  if (onchange) inp.addEventListener('change', (e) => onchange(!!e.target.checked));
  return el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
    el('label', { for: id, class: 'text-sm font-semibold text-slate-700' }, [label]),
    el('div', { class: 'md:col-span-2 flex items-center gap-3' }, [
      inp,
      el('span', { class: 'text-xs text-slate-500' }, ["Afficher sur la page d'accueil"])
    ])
  ]);
}

function card(title, children, actions = []) {
  return el('div', { class: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5' }, [
    el('div', { class: 'flex items-start justify-between gap-4 mb-4' }, [
      el('div', {}, [
        el('div', { class: 'text-lg font-extrabold text-slate-900' }, [title]),
      ]),
      el('div', { class: 'flex gap-2 flex-wrap justify-end' }, actions)
    ]),
    ...children
  ]);
}

function smallBtn(label, cls, onClick) {
  return el('button', {
    class: `px-3 py-1.5 rounded-xl text-xs font-bold border ${cls}`,
    onclick: onClick
  }, [label]);
}

function renderTopBar() {
  return el('div', { class: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6' }, [
    el('div', {}, [
      el('div', { class: 'text-2xl font-extrabold text-slate-900' }, ['Admin — Contenu du portfolio']),
      el('div', { class: 'text-sm text-slate-600 mt-1' }, [
        'Tu édites le contenu puis tu exportes un nouveau ',
        el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['data/content.json']),
        ' à commit/push sur GitHub.'
      ])
    ]),
    el('div', { class: 'flex gap-2 flex-wrap' }, [
      smallBtn('Télécharger content.json (+ content.js)', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
        downloadJson('content.json', state);
        downloadContentJs('content.js', state);
        setStatus('success', "Téléchargé : content.json + content.js. Remplace les 2 fichiers dans /data puis commit/push.");
      }),
      smallBtn('Copier JSON', 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50', () => {
        copyToClipboard(JSON.stringify(state, null, 2));
      }),
      smallBtn('Importer content.json', 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50', () => {
        $('#importFile').click();
      }),
      smallBtn('Ouvrir le site', 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50', () => {
        window.open('../index.html', '_blank');
      })
    ])
  ]);
}

function renderImportHidden() {
  const inp = el('input', {
    id: 'importFile',
    type: 'file',
    accept: 'application/json',
    class: 'hidden',
    onchange: async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const txt = await file.text();
        const parsed = JSON.parse(txt);
        state = parsed;
        setStatus('success', 'Import OK. N’oublie pas de télécharger puis commit/push.');
        render();
      } catch (err) {
        setStatus('error', 'JSON invalide: ' + err.message);
      } finally {
        e.target.value = '';
      }
    }
  });
  return inp;
}

function renderGlobal() {
  const s = state.personalInfo || (state.personalInfo = {});
  const cc = state.coreCompetencies || (state.coreCompetencies = []);
  const ui = state.uiText || (state.uiText = {});

  const children = [
    el('div', { class: 'grid lg:grid-cols-2 gap-6' }, [
      card('Infos personnelles', [
        inputRow('Nom', s.name, { oninput: (v) => { s.name = v; } }),
        inputRow('Âge', s.age, { oninput: (v) => { s.age = v; } }),
        inputRow('Adresse', s.address, { oninput: (v) => { s.address = v; } }),
        inputRow('Téléphone', s.phone, { oninput: (v) => { s.phone = v; } }),
        inputRow('Email', s.email, { oninput: (v) => { s.email = v; } }),
        inputRow('Permis', s.permis, { oninput: (v) => { s.permis = v; } }),
        inputRow('Objectif', s.objective, { oninput: (v) => { s.objective = v; } }),
        inputRow('Formation actuelle', s.formation_actuelle, { oninput: (v) => { s.formation_actuelle = v; } }),
        inputRow('École actuelle', s.ecole_actuelle, { oninput: (v) => { s.ecole_actuelle = v; } })
      ]),

      card('Compétences GEII (pourcentages + descriptions)', [
        el('div', { class: 'text-sm text-slate-600 mb-3' }, [
          'Ces 4 blocs ouvrent ensuite la page par niveaux (N1/N2/N3).'
        ]),
        ...cc.map((c, idx) => card(`${c.title}`, [
          numberRow('Pourcentage', c.percentage, { oninput: (v) => { c.percentage = Math.max(0, Math.min(100, v||0)); } }),
          inputRow('circleColor (classe Tailwind)', c.circleColor, { oninput: (v) => { c.circleColor = v; } }),
          textareaRow('Description', c.desc, { oninput: (v) => { c.desc = v; } })
        ], [
          smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ cc.splice(idx-1,0,cc.splice(idx,1)[0]); render(); } }),
          smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<cc.length-1){ cc.splice(idx+1,0,cc.splice(idx,1)[0]); render(); } }),
          smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { cc.splice(idx,1); render(); })
        ])),
        el('div', { class: 'mt-3' }, [
          smallBtn('+ Ajouter une compétence coeur', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
            cc.push({ title: 'Nouvelle', percentage: 50, circleColor: 'text-slate-900', style: '', tagStyle: '', desc: '' });
            render();
          })
        ])
      ]),

      card('Textes UI (titres / sous-titres)', [
        el('div', { class: 'text-sm text-slate-600 mb-3' }, [
          "Optionnel : personnalise les sous-titres affichés en haut des pages."
        ]),
        inputRow('Sous-titre Compétences', ui.competencesSubtitle || '', { oninput: (v) => { ui.competencesSubtitle = v; } }),
        inputRow('Sous-titre Projets', ui.projetsSubtitle || '', { oninput: (v) => { ui.projetsSubtitle = v; } })
      ])
    ])
  ];

  return el('div', { class: 'space-y-6' }, children);
}

function renderSkills() {
  const skills = state.skills || (state.skills = []);
  return el('div', { class: 'space-y-4' }, [
    el('div', { class: 'text-sm text-slate-600' }, ['Compétences techniques (barres + %).']),
    ...skills.map((sk, idx) => card(sk.name || `Compétence ${idx+1}`, [
      inputRow('Nom', sk.name, { oninput: (v) => { sk.name = v; } }),
      inputRow('Niveau (texte)', sk.level, { oninput: (v) => { sk.level = v; } }),
      numberRow('Valeur (%)', sk.val, { oninput: (v) => { sk.val = Math.max(0, Math.min(100, v||0)); } }),
      textareaRow('Description', sk.desc, { oninput: (v) => { sk.desc = v; } })
    ], [
      smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ skills.splice(idx-1,0,skills.splice(idx,1)[0]); render(); } }),
      smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<skills.length-1){ skills.splice(idx+1,0,skills.splice(idx,1)[0]); render(); } }),
      smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { skills.splice(idx,1); render(); })
    ])),
    smallBtn('+ Ajouter', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      skills.push({ name: 'Nouvelle compétence', level: 'Notions', val: 50, desc: '' });
      render();
    })
  ]);
}

function renderFormations() {
  const formations = state.formations || (state.formations = []);
  return el('div', { class: 'space-y-4' }, [
    el('div', { class: 'text-sm text-slate-600' }, ['Formation / diplômes. Pour la carte cliquable, mets isClickable=true et une image (dans /images).']),
    ...formations.map((f, idx) => card(f.title || `Formation ${idx+1}`, [
      inputRow('id (unique, sans espaces)', f.id, { oninput: (v) => { f.id = v; } }),
      inputRow('Date', f.date, { oninput: (v) => { f.date = v; } }),
      inputRow('Titre', f.title, { oninput: (v) => { f.title = v; } }),
      inputRow('École', f.school, { oninput: (v) => { f.school = v; } }),
      textareaRow('Description', f.desc, { oninput: (v) => { f.desc = v; } }),
      selectRow('isClickable', String(!!f.isClickable), ['true','false'], { onchange: (v) => { f.isClickable = (v === 'true'); } }),
      inputRow('Image (ex: geii.jpg)', f.image || '', { oninput: (v) => { f.image = v || undefined; } }),
      f.image ? el('div', { class: 'mt-2 text-xs text-slate-600' }, [
        'Preview: ', el('img', { src: `../images/${f.image}`, class: 'mt-2 w-full max-w-sm rounded-xl border border-slate-200', onerror: "this.style.display='none'" })
      ]) : el('div')
    ], [
      smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ formations.splice(idx-1,0,formations.splice(idx,1)[0]); render(); } }),
      smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<formations.length-1){ formations.splice(idx+1,0,formations.splice(idx,1)[0]); render(); } }),
      smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { formations.splice(idx,1); render(); })
    ])),
    smallBtn('+ Ajouter', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      formations.push({ id: 'nouvelle-formation', date: '2026', title: 'Nouvelle formation', school: '', desc: '', isClickable: false });
      render();
    })
  ]);
}

function renderProjects() {
  const projects = state.projects || (state.projects = []);
  const coreTitles = (state.coreCompetencies || []).map(c => c.title);
  const levelsByComp = state.competencyLevels || (state.competencyLevels = {});
  const projectLevelMap = state.projectLevelMap || (state.projectLevelMap = {});

  return el('div', { class: 'space-y-4' }, [
    el('div', { class: 'text-sm text-slate-600' }, [
      'Projets. Images attendues: ',
      el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['images/<id>-1.jpg']),
      ' et PDF: ',
      el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['projects/<id>.pdf']),
      '.'
    ]),

    ...projects.map((p, idx) => {
      const tagsText = (p.tags || []).join(', ');
      const compsText = (p.competencies || []).join(', ');

      // 1) Texte détaillé du projet (sections modifiables)
      const c = p.content || (p.content = {});
      // Compat: anciens champs block1/block2/block3
      if (!c.contexteText && c.block1Text) c.contexteText = c.block1Text;
      if (!c.realisationText && c.block2Text) c.realisationText = c.block2Text;
      if (!c.resultatsText && c.block3Text) c.resultatsText = c.block3Text;

      // 2) Mapping projet -> niveaux GEII (pour afficher dans pages niveaux)
      if (!projectLevelMap[p.id]) projectLevelMap[p.id] = {};
      const levelRowEls = (p.competencies || []).map((compTitle) => {
        const allowed = (levelsByComp[compTitle] || []).map(l => l.id);
        const opts = ['(aucun)', ...allowed];
        const cur = projectLevelMap[p.id][compTitle] || '(aucun)';
        return selectRow(`${compTitle} — niveau`, cur, opts, {
          onchange: (v) => {
            projectLevelMap[p.id][compTitle] = (v === '(aucun)') ? undefined : v;
          }
        });
      });

      return card(p.title || `Projet ${idx+1}`, [
        inputRow('id (unique)', p.id, { oninput: (v) => {
          const oldId = p.id;
          p.id = v;
          // Si tu renomme l'id, on tente de conserver le mapping niveaux
          if (oldId && oldId !== v && projectLevelMap[oldId] && !projectLevelMap[v]) {
            projectLevelMap[v] = projectLevelMap[oldId];
            delete projectLevelMap[oldId];
          }
        } }),
        inputRow('Année / durée', p.year, { oninput: (v) => { p.year = v; } }),
        inputRow('Titre', p.title, { oninput: (v) => { p.title = v; } }),
        textareaRow('Description', p.desc, { oninput: (v) => { p.desc = v; } }),
        checkboxRow('Projet à la une (Accueil)', !!p.featured, { onchange: (v) => { p.featured = v; } }),
        card('Légendes des médias (optionnel)', [
          el('div', { class: 'text-xs text-slate-600 mb-2' }, [
            "Si tu laisses vide, rien ne s'affiche sur le site."
          ]),
          inputRow('Légende média 1 (images/<id>-1)', (p.mediaCaptions && p.mediaCaptions['1']) || '', { placeholder: 'Ex: Vue d\'ensemble / Schéma global…', oninput: (v) => {
            const t = (v || '').trim();
            if (!p.mediaCaptions) p.mediaCaptions = {};
            if (!t) { delete p.mediaCaptions['1']; } else { p.mediaCaptions['1'] = v; }
            if (p.mediaCaptions && Object.keys(p.mediaCaptions).length === 0) delete p.mediaCaptions;
          }}),
          inputRow('Légende média 2 (images/<id>-2)', (p.mediaCaptions && p.mediaCaptions['2']) || '', { placeholder: 'Ex: Câblage / Interface / Étape 1…', oninput: (v) => {
            const t = (v || '').trim();
            if (!p.mediaCaptions) p.mediaCaptions = {};
            if (!t) { delete p.mediaCaptions['2']; } else { p.mediaCaptions['2'] = v; }
            if (p.mediaCaptions && Object.keys(p.mediaCaptions).length === 0) delete p.mediaCaptions;
          }}),
          inputRow('Légende média 3 (images/<id>-3)', (p.mediaCaptions && p.mediaCaptions['3']) || '', { placeholder: 'Ex: Résultat / Prototype / Étape 2…', oninput: (v) => {
            const t = (v || '').trim();
            if (!p.mediaCaptions) p.mediaCaptions = {};
            if (!t) { delete p.mediaCaptions['3']; } else { p.mediaCaptions['3'] = v; }
            if (p.mediaCaptions && Object.keys(p.mediaCaptions).length === 0) delete p.mediaCaptions;
          }}),
        ]),
        textareaRow('Compétences GEII (séparées par virgule)', compsText, { oninput: (v) => {
          p.competencies = v.split(',').map(x => x.trim()).filter(Boolean);
          render();
        }}),
        textareaRow('Tags (séparés par virgule)', tagsText, { oninput: (v) => {
          p.tags = v.split(',').map(x => x.trim()).filter(Boolean);
        }}),

        card('Détail du projet (page projet)', [
          inputRow('Titre section Contexte', c.contexteTitle || 'Contexte', { oninput: (v) => { c.contexteTitle = v; } }),
          textareaRow('Texte Contexte', c.contexteText || '', { oninput: (v) => { c.contexteText = v; } }),
          inputRow('Titre section Objectif', c.objectifTitle || 'Objectif', { oninput: (v) => { c.objectifTitle = v; } }),
          textareaRow('Texte Objectif', c.objectifText || '', { oninput: (v) => { c.objectifText = v; } }),
          inputRow('Titre section Réalisation', c.realisationTitle || 'Réalisation', { oninput: (v) => { c.realisationTitle = v; } }),
          textareaRow('Texte Réalisation', c.realisationText || '', { oninput: (v) => { c.realisationText = v; } }),
          inputRow('Titre section Résultats', c.resultatsTitle || 'Résultats', { oninput: (v) => { c.resultatsTitle = v; } }),
          textareaRow('Texte Résultats', c.resultatsText || '', { oninput: (v) => { c.resultatsText = v; } }),
          inputRow('Titre section Bilan', c.bilanTitle || 'Bilan', { oninput: (v) => { c.bilanTitle = v; } }),
          textareaRow('Texte Bilan', c.bilanText || '', { oninput: (v) => { c.bilanText = v; } }),
        ]),

        card('Relier à un niveau GEII (affiché dans les pages niveaux)', [
          el('div', { class: 'text-xs text-slate-600 mb-2' }, [
            "Tu choisis le niveau pour chaque compétence (Concevoir/Vérifier/etc). Sur la page projet, on affiche seulement la compétence (pas le niveau)."
          ]),
          ...(levelRowEls.length ? levelRowEls : [el('div', { class: 'text-xs text-slate-500' }, ["Ajoute d’abord des compétences GEII ci-dessus."])])
        ]),

        el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
          el('div', { class: 'text-sm font-semibold text-slate-700' }, ['Preview image 1']),
          el('div', { class: 'md:col-span-2' }, [
            el('img', { src: `../images/${p.id}-1.jpg`, class: 'w-full max-w-sm rounded-xl border border-slate-200', onerror: "this.style.display='none'" }),
            el('div', { class: 'text-xs text-slate-500 mt-2' }, [`../images/${p.id}-1.jpg`])
          ])
        ])
      ], [
        smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ projects.splice(idx-1,0,projects.splice(idx,1)[0]); render(); } }),
        smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<projects.length-1){ projects.splice(idx+1,0,projects.splice(idx,1)[0]); render(); } }),
        smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { projects.splice(idx,1); render(); })
      ]);
    }),

    el('div', { class: 'flex gap-2 flex-wrap' }, [
      smallBtn('+ Ajouter', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
        projects.push({
          id: 'nouveau-projet',
          featured: false,
          year: '2026',
          title: 'Nouveau projet',
          desc: '',
          competencies: [],
          tags: [],
          content: {
            contexteTitle: 'Contexte',
            contexteText: '',
            objectifTitle: 'Objectif',
            objectifText: '',
            realisationTitle: 'Réalisation',
            realisationText: '',
            resultatsTitle: 'Résultats',
            resultatsText: '',
            bilanTitle: 'Bilan',
            bilanText: ''
          }
        });
        render();
      }),
      smallBtn('Outil: renommer image/pdf', 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50', () => {
        activeSection = 'assets';
        render();
      })
    ])
  ]);
}

function renderExperiences() {
  const exps = state.experiences || (state.experiences = []);
  const projectOptions = [
    { value: '', label: '(Aucun projet lié)' },
    ...((state.projects || []).map(p => ({ value: p.id, label: `${p.id} — ${p.title || ''}`.trim() })))
  ];
  return el('div', { class: 'space-y-4' }, [
    el('div', { class: 'text-sm text-slate-600' }, ['Expériences. Le champ tasks est une liste (une ligne = une tâche).']),
    ...exps.map((x, idx) => card(x.company || `Expérience ${idx+1}`, [
      inputRow('id', x.id, { oninput: (v) => { x.id = v; } }),
      inputRow('Date', x.date, { oninput: (v) => { x.date = v; } }),
      inputRow('Entreprise', x.company, { oninput: (v) => { x.company = v; } }),
      inputRow('Titre', x.title, { oninput: (v) => { x.title = v; } }),
      textareaRow('Description courte', x.desc, { oninput: (v) => { x.desc = v; } }),
      textareaRow('Détails (long)', x.details || '', { oninput: (v) => { x.details = v; } }),
      textareaRow('Tâches (1 par ligne)', (x.tasks || []).join('\n'), { oninput: (v) => { x.tasks = v.split('\n').map(t=>t.trim()).filter(Boolean); } }),
      selectRow('isClickable', String(!!x.isClickable), ['true','false'], { onchange: (v) => { x.isClickable = (v === 'true'); } }),
      selectRowKV('Page projet liée (optionnel)', x.linkedProjectId || '', projectOptions, { onchange: (v) => { x.linkedProjectId = v || undefined; } }),
      inputRow('Logo (ex: enedis.jpg)', x.logo || '', { oninput: (v) => { x.logo = v || undefined; } }),
      x.logo ? el('img', { src: `../images/${x.logo}`, class: 'mt-2 w-full max-w-sm rounded-xl border border-slate-200', onerror: "this.style.display='none'" }) : el('div')
    ], [
      smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ exps.splice(idx-1,0,exps.splice(idx,1)[0]); render(); } }),
      smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<exps.length-1){ exps.splice(idx+1,0,exps.splice(idx,1)[0]); render(); } }),
      smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { exps.splice(idx,1); render(); })
    ])),
    smallBtn('+ Ajouter', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      exps.push({ id: 'nouvelle-exp', date: '2026', company: 'Entreprise', title: 'Poste', desc: '', isClickable: false, logo: '' });
      render();
    })
  ]);
}

function renderInterests() {
  const ints = state.interests || (state.interests = []);
  return el('div', { class: 'space-y-4' }, [
    el('div', { class: 'text-sm text-slate-600' }, [
      'Centres d’intérêt. Image attendue: ',
      el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['images/<id>.jpg']),
      '.'
    ]),
    ...ints.map((it, idx) => card(it.title || `Intérêt ${idx+1}`, [
      inputRow('id', it.id, { oninput: (v) => { it.id = v; } }),
      inputRow('Titre', it.title, { oninput: (v) => { it.title = v; } }),
      textareaRow('Texte court', it.text || '', { oninput: (v) => { it.text = v; } }),
      textareaRow('Détails', it.details || '', { oninput: (v) => { it.details = v; } }),
      selectRow('iconName', it.iconName || 'Star', ICON_NAMES, { onchange: (v) => { it.iconName = v; } }),
      inputRow('Couleur (classes Tailwind)', it.color || '', { oninput: (v) => { it.color = v; } }),
      el('img', { src: `../images/${it.id}.jpg`, class: 'mt-2 w-full max-w-sm rounded-xl border border-slate-200', onerror: "this.style.display='none'" })
    ], [
      smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx>0){ ints.splice(idx-1,0,ints.splice(idx,1)[0]); render(); } }),
      smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if (idx<ints.length-1){ ints.splice(idx+1,0,ints.splice(idx,1)[0]); render(); } }),
      smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { ints.splice(idx,1); render(); })
    ])),
    smallBtn('+ Ajouter', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      ints.push({ id: 'nouvel-interet', title: 'Nouvel intérêt', text: '', details: '', iconName: 'Star', color: 'bg-slate-100 text-slate-700' });
      render();
    })
  ]);
}

function renderCompetencyLevels() {
  const levels = state.competencyLevels || (state.competencyLevels = {});
  const coreTitles = (state.coreCompetencies || []).map(c => c.title);

  // ensure keys exist
  coreTitles.forEach(t => { if (!levels[t]) levels[t] = []; });

  const wrap = el('div', { class: 'space-y-6' });
  wrap.appendChild(el('div', { class: 'text-sm text-slate-600' }, [
    'Niveaux par compétence GEII (N1/N2/N3). Maintenir et Intégrer n’ont pas de niveau 3 dans ton cas (tu peux gérer ici).'
  ]));

  coreTitles.forEach(title => {
    const arr = levels[title];
    const section = card(title, [
      ...arr.map((lvl, idx) => card(`${lvl.label || lvl.id}`, [
        inputRow('id (n1/n2/n3)', lvl.id, { oninput: (v) => { lvl.id = v; } }),
        inputRow('Label', lvl.label, { oninput: (v) => { lvl.label = v; } }),
        numberRow('Mastery (%)', lvl.mastery, { oninput: (v) => { lvl.mastery = Math.max(0, Math.min(100, v||0)); } }),
        textareaRow('Description', lvl.desc, { oninput: (v) => { lvl.desc = v; } })
      ], [
        smallBtn('↑', 'bg-white border-slate-200 hover:bg-slate-50', () => { if(idx>0){ arr.splice(idx-1,0,arr.splice(idx,1)[0]); render(); } }),
        smallBtn('↓', 'bg-white border-slate-200 hover:bg-slate-50', () => { if(idx<arr.length-1){ arr.splice(idx+1,0,arr.splice(idx,1)[0]); render(); } }),
        smallBtn('Supprimer', 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', () => { arr.splice(idx,1); render(); })
      ])),

      smallBtn('+ Ajouter un niveau', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
        arr.push({ id: 'nX', label: 'Nouveau niveau', mastery: 50, desc: '' });
        render();
      })
    ]);
    wrap.appendChild(section);
  });

  return wrap;
}

function renderProjectLevelMap() {
  const map = state.projectLevelMap || (state.projectLevelMap = {});
  const projects = state.projects || [];
  const coreTitles = (state.coreCompetencies || []).map(c => c.title);
  const levels = state.competencyLevels || {};

  const wrap = el('div', { class: 'space-y-6' });
  wrap.appendChild(el('div', { class: 'text-sm text-slate-600' }, [
    "Associe chaque projet à un niveau par compétence (pour que la page 'Niveau' affiche les bons projets)."
  ]));

  projects.forEach(p => {
    if (!map[p.id]) map[p.id] = {};
    const row = map[p.id];

    const children = [];
    coreTitles.forEach(ct => {
      const allowed = (levels[ct] || []).map(l => l.id);
      const opts = ['(aucun)', ...allowed];
      children.push(selectRow(`${ct}`, row[ct] || '(aucun)', opts, { onchange: (v) => { row[ct] = v === '(aucun)' ? undefined : v; } }));
    });

    wrap.appendChild(card(`${p.title} — ${p.id}`, [
      el('div', { class: 'text-xs text-slate-500 mb-2' }, ['Tip: si tu changes un id de projet, pense à l’aligner ici.']),
      ...children
    ]));
  });

  wrap.appendChild(card('JSON brut (advanced)', [
    textareaRow('projectLevelMap (JSON)', JSON.stringify(map, null, 2), {
      oninput: (v) => {
        try {
          state.projectLevelMap = JSON.parse(v);
          setStatus('success', 'projectLevelMap: JSON OK');
        } catch {
          setStatus('error', 'projectLevelMap: JSON invalide');
        }
      }
    })
  ]));

  return wrap;
}

function renderAssetsTool() {
  const projects = state.projects || [];
  const wrap = el('div', { class: 'space-y-6' });

  wrap.appendChild(el('div', { class: 'bg-white border border-slate-200 rounded-2xl p-5' }, [
    el('div', { class: 'font-extrabold text-slate-900 text-lg' }, ['Outil — Renommer images et PDF']),
    el('div', { class: 'text-sm text-slate-600 mt-1' }, [
      'GitHub Pages ne permet pas l’upload serveur. Ici tu choisis un fichier et le navigateur télécharge une copie renommée au bon format. ',
      'Ensuite tu la mets dans ',
      el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['images/']),
      ' ou ',
      el('span', { class: 'mono bg-slate-100 px-1.5 py-0.5 rounded' }, ['projects/']),
      ' et tu push.'
    ])
  ]));

  const pick = el('select', { class: 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm' });
  projects.forEach(p => pick.appendChild(el('option', { value: p.id }, [`${p.title} (${p.id})`])));

  let selectedId = projects[0]?.id || '';
  pick.value = selectedId;
  pick.addEventListener('change', (e) => { selectedId = e.target.value; });

  const imgIndex = el('select', { class: 'rounded-xl border border-slate-200 px-3 py-2 text-sm' }, [
    el('option', { value: '1' }, ['1 (principale)']),
    el('option', { value: '2' }, ['2']),
    el('option', { value: '3' }, ['3'])
  ]);

  let imageFile = null;
  let pdfFile = null;

  const imgInput = el('input', { type: 'file', accept: 'image/*', class: 'w-full text-sm', onchange: (e) => { imageFile = e.target.files?.[0] || null; } });
  const pdfInput = el('input', { type: 'file', accept: 'application/pdf', class: 'w-full text-sm', onchange: (e) => { pdfFile = e.target.files?.[0] || null; } });

  const dlRenamed = (file, newName) => {
    const url = URL.createObjectURL(file);
    const a = el('a', { href: url, download: newName });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  wrap.appendChild(card('1) Choisir le projet', [
    el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
      el('div', { class: 'text-sm font-semibold text-slate-700' }, ['Projet']),
      el('div', { class: 'md:col-span-2' }, [pick])
    ]),
    el('div', { class: 'bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 mt-3 mono' }, [
      'images/<id>-1.jpg, images/<id>-2.jpg, images/<id>-3.jpg\nprojects/<id>.pdf'
    ])
  ]));

  wrap.appendChild(card('2) Renommer une image', [
    el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
      el('div', { class: 'text-sm font-semibold text-slate-700' }, ['Fichier image']),
      el('div', { class: 'md:col-span-2' }, [imgInput])
    ]),
    el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
      el('div', { class: 'text-sm font-semibold text-slate-700' }, ['Numéro']),
      el('div', { class: 'md:col-span-2' }, [imgIndex])
    ]),
    smallBtn('Générer (download)', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      if (!imageFile || !selectedId) return setStatus('error', 'Choisis un fichier image + un projet.');
      const newName = `${selectedId}-${imgIndex.value}.jpg`;
      dlRenamed(imageFile, newName);
      setStatus('success', `Image prête: ${newName} (à mettre dans images/)`);
    })
  ]));

  wrap.appendChild(card('3) Renommer un PDF', [
    el('div', { class: 'grid md:grid-cols-3 gap-3 items-center' }, [
      el('div', { class: 'text-sm font-semibold text-slate-700' }, ['Fichier PDF']),
      el('div', { class: 'md:col-span-2' }, [pdfInput])
    ]),
    smallBtn('Générer (download)', 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800', () => {
      if (!pdfFile || !selectedId) return setStatus('error', 'Choisis un fichier PDF + un projet.');
      const newName = `${selectedId}.pdf`;
      dlRenamed(pdfFile, newName);
      setStatus('success', `PDF prêt: ${newName} (à mettre dans projects/)`);
    })
  ]));

  return wrap;
}

function renderRawJson() {
  return card('JSON complet', [
    textareaRow('content.json', JSON.stringify(state, null, 2), {
      oninput: (v) => {
        try {
          const parsed = JSON.parse(v);
          state = parsed;
          setStatus('success', 'JSON OK (chargé en mémoire).');
        } catch (err) {
          setStatus('error', 'JSON invalide: ' + err.message);
        }
      }
    }),
    el('div', { class: 'text-xs text-slate-600 mt-3' }, [
      "Tip: si tu casses le JSON ici, utilise Importer pour récupérer une version valide."
    ])
  ]);
}

function renderSection() {
  switch (activeSection) {
    case 'global': return renderGlobal();
    case 'skills': return renderSkills();
    case 'formations': return renderFormations();
    case 'projects': return renderProjects();
    case 'experiences': return renderExperiences();
    case 'interests': return renderInterests();
    case 'levels': return renderCompetencyLevels();
    case 'map': return renderProjectLevelMap();
    case 'assets': return renderAssetsTool();
    case 'json': return renderRawJson();
    default: return renderGlobal();
  }
}

function render() {
  const nav = $('#nav');
  nav.innerHTML = '';
  nav.appendChild(navButton('global', 'Global', 'Infos + GEII (4 compétences)'));
  nav.appendChild(navButton('skills', 'Skills', 'Compétences techniques'));
  nav.appendChild(navButton('formations', 'Formation', 'Parcours / diplômes'));
  nav.appendChild(navButton('projects', 'Projets', 'Ajouter / éditer projets'));
  nav.appendChild(navButton('levels', 'Niveaux GEII', 'N1/N2/N3 + %'));
  nav.appendChild(navButton('map', 'Mapping projets↔niveaux', 'Projets par niveau'));
  nav.appendChild(navButton('experiences', 'Expérience', 'Stages / jobs'));
  nav.appendChild(navButton('interests', 'Centres d\'intérêt', 'Cartes + icônes'));
  nav.appendChild(navButton('assets', 'Outil fichiers', 'Renommer image/pdf'));
  nav.appendChild(navButton('json', 'JSON brut', 'Édition avancée'));

  const content = $('#content');
  content.innerHTML = '';
  content.appendChild(renderImportHidden());
  content.appendChild(renderTopBar());
  content.appendChild(renderSection());
}

(async function init() {
  // On rend toujours l'UI disponible, même si le fetch est bloqué (cas file://)
  state = window.__PORTFOLIO_CONTENT__ || {};
  render();

  // Branche 1: si content.js a déjà fourni le contenu, on est bon.
  if (window.__PORTFOLIO_CONTENT__) {
    setStatus('success', "Content chargé (via content.js). Modifie, puis clique 'Télécharger content.json (+ content.js)'.");
  } else {
    setStatus('info', "Chargement de data/content.json…");
    try {
      state = await loadRemoteContent();
      setStatus('success', "Content chargé. Modifie, puis clique 'Télécharger content.json (+ content.js)'.");
      render();
    } catch (err) {
      setStatus('error', "Failed to fetch. Astuce: clique 'Importer JSON' pour charger /data/content.json, puis télécharge et remplace /data/content.json ET /data/content.js.");
    }
  }

  // Wire les boutons de la sidebar (ils restent visibles même si le fetch échoue)
  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) btnDownload.onclick = () => {
    downloadJson('content.json', state);
    downloadContentJs('content.js', state);
    setStatus('success', "Téléchargé : content.json + content.js. Remplace les 2 fichiers dans /data puis commit/push.");
  };
  const btnCopy = document.getElementById('btnCopy');
  if (btnCopy) btnCopy.onclick = () => copyToClipboard(JSON.stringify(state, null, 2));

  const fileImport = document.getElementById('fileImport');
  if (fileImport) fileImport.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      state = parsed;
      setStatus('success', 'Import OK. N’oublie pas de télécharger puis commit/push.');
      render();
    } catch (err) {
      setStatus('error', 'JSON invalide: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };
})();
