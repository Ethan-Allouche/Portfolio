// Pupitres des maquettes : pour chaque modèle 3D, ses afficheurs et ses commandes.
// Les commandes écrivent dans l'état de la maquette, les afficheurs lisent state.out.

const toggle = (key, on, off = on) => ({ t: 'act', label: (s) => (s[key] ? on : off), run: (s) => { s[key] = !s[key]; }, lit: (s) => !!s[key] });
const bump = (key, label, more = {}) => ({ t: 'act', label: () => label, run: (s) => { s[key] = (s[key] || 0) + 1; }, ...more });


export const CONSOLES = {
  drone: {
    read: [['pos', 'r.pos', 'm'], ['clock', 'r.clock'], ['air', 'r.air', 'm'], ['sed', 'r.sed', 'cm'], ['h2s', 'r.h2s', 'ppm'], ['bat', 'r.bat', 'h']],
    ctl: [
      { t: 'seg', key: 'view', label: 'c.view', opts: [['all', 'c.viewAll'], ['craft', 'c.viewCraft']] },
      { ...toggle('open', 'c.caseClose', 'c.caseOpen') },
      { t: 'act', label: (s) => (s.run ? 'c.pause' : 'c.resume'), run: (s) => { s.run = !s.run; } },
      bump('reset', 'c.restart'),
    ],
  },
  station: {
    read: [['level', 'r.level', '%'], ['hz', 'r.hz', 'Hz'], ['pmp', 'r.pump'], ['st', 'r.state']],
    ctl: [
      { t: 'seg', key: 'mode', label: 'c.mode', opts: [['auto', 'c.auto'], ['manual', 'c.manual']] },
      { ...toggle('pump', 'c.pump'), led: true, off: (s) => s.mode === 'auto' },
      { ...toggle('screen', 'c.screen'), led: true, off: (s) => s.mode === 'auto' },
      { t: 'rng', key: 'hz', label: 'c.setpoint', min: 10, max: 50, step: 1, unit: 'Hz' },
      { ...toggle('fault', 'c.ack', 'c.fault'), warn: true },
    ],
  },
  arrosage: {
    read: [['vol', 'r.vol', 'L'], ['ph', 'r.phase']],
    ctl: [
      { t: 'seg', key: 'speed', label: 'c.speed', opts: [[1, '1'], [2, '2'], [3, '3']], raw: true },
      { t: 'rng', key: 'qty', label: 'c.qty', min: 10, max: 2000, step: 10, unit: 'L' },
      bump('start', 'c.cycle', { primary: true, off: (s) => s.out.phase && s.out.phase !== 'ready' }),
    ],
  },
  reseau: {
    read: [['reg', 'r.regime'], ['zone', 'r.zone'], ['cut', 'r.cut'], ['st', 'r.state']],
    ctl: [
      { t: 'seg', key: 'cam', label: 'c.view', opts: [['all', 'c.camAll'], ['site', 'c.camSite'], ['bex', 'c.camBex']] },
      { t: 'act', primary: true, label: (s) => 'a.' + (s.out.next || 'wait'), off: (s) => !s.out.next, run: (s) => { s.go = (s.go || 0) + 1; } },
      bump('touch', 'a.touch', { off: (s) => s.out.st === '@tripped' || s.out.st === '@reclose' }),
    ],
  },
  sonore: {
    read: [['freq', 'r.freq', 'Hz'], ['dur', 'r.dur', 's'], ['rx', 'r.rx']],
    ctl: [
      { t: 'rng', key: 'freq', label: 'c.txfreq', min: 7000, max: 8600, step: 50, unit: 'Hz' },
      { ...toggle('emit', 'c.silence', 'c.emit'), primary: true },
    ],
  },
  robot: {
    read: [['dist', 'r.dist', 'cm'], ['pl', 'r.ml'], ['pr', 'r.mr'], ['scn', 'r.scn']],
    ctl: [
      { ...toggle('zoom', 'c.wide', 'c.follow') },
      { t: 'seg', key: 'mode', label: 'c.mode', opts: [['auto', 'c.auto'], ['manual', 'c.manual']] },
      { t: 'pad' },
    ],
  },
  lampe: {
    read: [['amb', 'r.amb', '%'], ['pwm', 'r.pwm', '%'], ['md', 'r.mode']],
    ctl: [
      { t: 'seg', key: 'mode', label: 'c.mode', opts: [['auto', 'c.auto'], ['manual', 'c.manual'], ['fade', 'c.fade']] },
      { t: 'rng', key: 'level', label: 'c.level', min: 0, max: 100, step: 1, unit: '%', off: (s) => s.mode !== 'manual' },
      { ...toggle('cover', 'c.uncover', 'c.cover') },
      { t: 'act', label: (s, api) => (api.night() ? 'c.lightsOn' : 'c.lightsOff'), run: (s, api) => api.setNight(!api.night()), lit: (s, api) => api.night() },
    ],
  },
  armoire: {
    read: [['meas', 'r.meas'], ['ref', 'r.ref'], ['ok', 'r.verdict']],
    ctl: [
      { t: 'seg', key: 'step', label: 'c.test', opts: [['pt100', 's.pt100'], ['lamps', 's.lamps'], ['pwm', 's.pwm'], ['tor', 's.tor']] },
      { t: 'rng', key: 'duty', label: 'c.cmd', min: 0, max: 100, step: 1, unit: '%', off: (s) => s.step === 'pt100' || s.step === 'tor' },
    ],
  },
  generic: { read: [], ctl: [] },
};

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const ARROWS = { f: 'M12 5l7 9H5z', b: 'M12 19l7-9H5z', l: 'M5 12l9-7v14z', r: 'M19 12l-9-7v14z' };

/**
 * Construit le pupitre d'une maquette.
 * `api` donne accès à l'éclairage de la scène (pour la lampe, dont le capteur mesure cette lumière).
 * @returns {{ el: HTMLElement, sync: () => void }} l'élément, et une fonction qui rafraîchit afficheurs et commandes.
 */
export function buildConsole(model, state, t, api = { night: () => false, setNight() {} }) {
  const def = CONSOLES[model] || CONSOLES.generic;
  state.out ||= {};
  const root = el('div', 'console');
  const syncs = [];
  const touch = () => { state.user = true; };

  if (def.read.length) {
    const lcd = el('dl', 'lcd');
    for (const [key, label, unit] of def.read) {
      const cell = el('div', 'lcd__cell');
      const value = el('span', 'lcd__num');
      const u = el('span', 'lcd__unit', unit || '');
      const dd = el('dd', 'lcd__value');
      dd.dir = 'ltr';
      dd.append(value, u);
      cell.append(el('dt', 'lcd__label', t(label)), dd);
      lcd.append(cell);
      let shown;
      syncs.push(() => {
        const raw = state.out[key];
        const isState = typeof raw === 'string' && raw[0] === '@';
        const text = raw == null ? '–' : isState ? t('st.' + raw.slice(1)) : String(raw);
        if (text === shown) return;
        shown = text;
        value.textContent = text;
        dd.classList.toggle('lcd__value--word', isState);
        u.hidden = isState || !unit;
      });
    }
    root.append(lcd);
  }

  if (def.ctl.length) {
    const box = el('div', 'controls');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', t('deck.console'));
    for (const c of def.ctl) {
      if (c.t === 'seg') {
        const wrap = el('div', 'ctl ctl--seg');
        wrap.append(el('span', 'ctl__label', t(c.label)));
        const group = el('div', 'seg');
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', t(c.label));
        const btns = c.opts.map(([val, label]) => {
          const b = el('button', 'seg__opt', c.raw ? label : t(label));
          b.type = 'button';
          b.addEventListener('click', () => { touch(); state[c.key] = val; sync(); });
          group.append(b);
          return [val, b];
        });
        wrap.append(group);
        box.append(wrap);
        syncs.push(() => { for (const [val, b] of btns) b.setAttribute('aria-pressed', String(state[c.key] === val)); });
      } else if (c.t === 'rng') {
        const wrap = el('label', 'ctl ctl--rng');
        const head = el('span', 'ctl__label', t(c.label));
        const out = el('output', 'ctl__out');
        out.dir = 'ltr';
        const input = el('input', 'rng');
        input.type = 'range';
        input.min = c.min; input.max = c.max; input.step = c.step;
        let dragging = false;
        input.addEventListener('pointerdown', () => { dragging = true; });
        input.addEventListener('pointerup', () => { dragging = false; });
        input.addEventListener('pointercancel', () => { dragging = false; });
        input.addEventListener('input', () => { touch(); state[c.key] = +input.value; sync(); });
        const row = el('span', 'ctl__row');
        row.append(head, out);
        wrap.append(row, input);
        box.append(wrap);
        syncs.push(() => {
          const v = Math.round(+state[c.key] || 0);
          if (!dragging && +input.value !== v) input.value = v;
          out.textContent = v + (c.unit ? ' ' + c.unit : '');
          input.style.setProperty('--fill', ((v - c.min) / (c.max - c.min)) * 100 + '%');
          const off = c.off ? !!c.off(state) : false;
          input.disabled = off;
          wrap.classList.toggle('is-off', off);
        });
      } else if (c.t === 'act') {
        const b = el('button', 'btn btn--panel' + (c.primary ? ' btn--go' : '') + (c.warn ? ' btn--warn' : '') + (c.led ? ' btn--led' : ''));
        b.type = 'button';
        const text = el('span');
        if (c.led) b.append(el('i', 'pilot'));
        b.append(text);
        b.addEventListener('click', () => { touch(); c.run(state, api); sync(); });
        box.append(b);
        let shown;
        syncs.push(() => {
          const key = c.label(state, api);
          if (key !== shown) { shown = key; text.textContent = t(key); }
          b.disabled = c.off ? !!c.off(state) : false;
          if (c.lit) b.setAttribute('aria-pressed', String(!!c.lit(state, api)));
        });
      } else if (c.t === 'pad') {
        const pad = el('div', 'pad');
        pad.dir = 'ltr';
        for (const [dir, label] of [['f', 'c.fwd'], ['l', 'c.left'], ['r', 'c.right'], ['b', 'c.back']]) {
          const b = el('button', 'pad__key pad__key--' + dir);
          b.type = 'button';
          b.setAttribute('aria-label', t(label));
          b.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="${ARROWS[dir]}"/></svg>`;
          const go = (e) => { e.preventDefault(); touch(); state.mode = 'manual'; state.drive = dir; b.classList.add('is-held'); sync(); };
          const stop = () => { if (state.drive === dir) state.drive = ''; b.classList.remove('is-held'); };
          b.addEventListener('pointerdown', (e) => { go(e); try { b.setPointerCapture(e.pointerId); } catch {} });
          b.addEventListener('pointerup', stop);
          b.addEventListener('pointercancel', stop);
          b.addEventListener('lostpointercapture', stop);
          b.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) go(e); });
          b.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
          b.addEventListener('blur', stop);
          b.addEventListener('contextmenu', (e) => e.preventDefault());
          pad.append(b);
        }
        box.append(pad);
      } else if (c.t === 'note') {
        box.append(el('p', 'ctl__note', t(c.label)));
      }
    }
    root.append(box);
  }

  function sync() { for (const f of syncs) f(); }
  sync();
  return { el: root, sync };
}
