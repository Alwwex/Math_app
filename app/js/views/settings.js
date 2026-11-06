import { profile, saveProfile, store, DEFAULT_PROFILE, flushSaves } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, download, pickFile, toast, confirmDialog } from '../util.js';
import { icon } from '../icons.js';
import { applyTheme, rerender } from '../main.js';

function abToB64(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function b64ToAb(str) { const s = atob(str); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b.buffer; }

export default {
  async mount(root) {
    root.append(h('div', { class: 'topbar' }, h('div', { class: 'grow' }, h('h1', {}, t('set.title')))));
    const inner = h('div', { class: 'set-inner' });
    root.append(inner);

    const seg = (opts, cur, on) => {
      const s = h('div', { class: 'seg' });
      opts.forEach(([v, label]) => s.append(h('button', { class: cur === v ? 'on' : '', onclick: () => on(v) }, label)));
      return s;
    };
    const toggle = (val, on) => {
      const b = h('button', { class: 'switch' + (val ? ' on' : ''), role: 'switch', 'aria-checked': String(!!val) }, h('i'));
      b.onclick = () => { val = !val; b.classList.toggle('on', val); b.setAttribute('aria-checked', String(val)); on(val); };
      return b;
    };
    const row = (title, hint, control) => h('div', { class: 'set-row' }, h('div', {}, h('div', { class: 'set-t' }, title), hint ? h('div', { class: 'set-h' }, hint) : null), control);
    const group = (title, ic, ...rows) => h('section', { class: 'set-group card' }, h('h2', { class: 'set-gt', html: icon(ic) + `<span>${title}</span>` }), ...rows);

    const name = h('input', { class: 'input', value: profile.name || '', placeholder: lang() === 'en' ? 'Your name' : 'Tvoje jméno' });
    name.onchange = () => { profile.name = name.value.trim(); saveProfile(); };

    inner.append(
      group(t('set.lang'), 'globe',
        row(t('set.lang'), t('set.langHint'), seg([['cs', 'Čeština'], ['en', 'English'], ['both', 'CZ + EN']], profile.lang, v => { profile.lang = v; saveProfile(); applyTheme(); rerender(); })),
        row(t('set.name'), '', name)),
      group(t('set.theme'), 'sun',
        row(t('set.theme'), '', seg([['light', '☀️ ' + t('set.light')], ['dark', '🌙 ' + t('set.dark')], ['auto', t('set.auto')]], profile.theme, v => { profile.theme = v; saveProfile(); applyTheme(); rerender(); }))),
      group(t('set.pen'), 'pen',
        row(t('set.penOnly'), t('set.penOnlyHint'), toggle(profile.penOnly, v => { profile.penOnly = v; saveProfile(); }))),
      group(t('set.sounds'), 'volume',
        row(t('set.sounds'), '', toggle(profile.sounds, v => { profile.sounds = v; saveProfile(); })),
        row(t('set.flipSound'), '', toggle(profile.flipSound, v => { profile.flipSound = v; saveProfile(); }))),
    );

    const usage = h('span', { class: 'chip' }, '…');
    navigator.storage?.estimate?.().then(e => { usage.textContent = `${(e.usage / 1048576).toFixed(1)} MB`; }).catch(() => { usage.textContent = '—'; });
    const exportBtn = h('button', { class: 'btn', html: icon('download') + `<span>${t('set.export')}</span>` });
    exportBtn.onclick = async () => {
      await flushSaves();
      const entries = await store.entries('');
      const out = {};
      for (const [k, v] of entries) out[k] = v instanceof ArrayBuffer ? { __ab: abToB64(v) } : (v && v.data instanceof ArrayBuffer ? { ...v, data: { __ab: abToB64(v.data) } } : v);
      const blob = new Blob([JSON.stringify({ app: 'folio', version: 1, date: new Date().toISOString(), data: out })], { type: 'application/json' });
      download(blob, `folio-zaloha-${new Date().toLocaleDateString('sv-SE')}.json`);
      toast('💾 ' + t('set.saved'));
    };
    const importBtn = h('button', { class: 'btn', html: icon('upload') + `<span>${t('set.import')}</span>` });
    importBtn.onclick = async () => {
      const f = await pickFile('application/json,.json');
      if (!f) return;
      try {
        const json = JSON.parse(await f.text());
        if (json.app !== 'folio') throw new Error('not a Folio backup');
        for (const [k, v] of Object.entries(json.data)) {
          let val = v;
          if (v && v.__ab) val = b64ToAb(v.__ab);
          else if (v && v.data && v.data.__ab) val = { ...v, data: b64ToAb(v.data.__ab) };
          await store.set(k, val);
        }
        toast('✓ ' + t('set.imported'));
        setTimeout(() => location.reload(), 600);
      } catch (e) { toast('⚠️ ' + e.message); }
    };
    const resetBtn = h('button', { class: 'btn coral', html: icon('reset') + `<span>${t('set.reset')}</span>` });
    resetBtn.onclick = async () => {
      if (!await confirmDialog(t('set.reset'), t('set.resetConfirm'), t('set.reset'))) return;
      Object.assign(profile, { xp: 0, streak: { last: null, count: 0 }, days: {}, lessons: {}, quizzes: {}, cards: {}, achievements: {} });
      saveProfile();
      rerender();
    };
    inner.append(group(t('set.data'), 'layers',
      row(t('set.storage'), lang() === 'en' ? 'Everything is stored on this computer and works offline.' : 'Vše je uložené v tomto počítači a funguje i bez internetu.', usage),
      h('div', { class: 'set-actions' }, exportBtn, importBtn, resetBtn)));

    inner.append(h('section', { class: 'set-group card set-about' },
      h('h2', { class: 'set-gt', html: icon('sparkles') + `<span>${t('set.about')}</span>` }),
      h('p', { class: 'muted' }, lang() === 'en'
        ? 'Folio – an interactive maths textbook, book reader and notebook. Made for Windows touch laptops with a pen. Keyboard: ← → turn pages, Ctrl+Z undo, B bookmark.'
        : 'Folio – interaktivní učebnice matematiky, čtečka knihy a sešit. Dělané pro dotykové notebooky s Windows a perem. Klávesy: ← → listování, Ctrl+Z zpět, B záložka.'),
      h('p', { class: 'subtle small' }, 'pdf.js (Apache-2.0) · KaTeX (MIT) · perfect-freehand (MIT) · Inter, Literata, Fraunces, Caveat (OFL)')));
    void DEFAULT_PROFILE;
  },
};
