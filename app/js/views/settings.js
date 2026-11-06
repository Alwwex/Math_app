import { profile, saveProfile, store, flushSaves } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, download, pickFile, toast, confirmDialog, emo, modal } from '../util.js';
import { icon } from '../icons.js';
import { applyTheme, rerender, lock } from '../main.js';
import { currentUser, updateUser, deleteUser, verifyPin, AVATARS, COLORS } from '../auth.js';

function abToB64(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function b64ToAb(str) { const s = atob(str); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b.buffer; }

export default {
  async mount(root) {
    const u = currentUser();
    const inner = h('div', { class: 'set-inner' });
    root.append(inner);
    const E = (cs, en) => (lang() === 'en' ? en : cs);

    const seg = (opts, cur, on) => { const s = h('div', { class: 'seg' }); opts.forEach(([v, l]) => s.append(h('button', { class: cur === v ? 'on' : '', onclick: () => on(v) }, l))); return s; };
    const toggle = (val, on) => { const b = h('button', { class: 'switch' + (val ? ' on' : ''), role: 'switch', 'aria-checked': String(!!val) }, h('i')); b.onclick = () => { val = !val; b.classList.toggle('on', val); b.setAttribute('aria-checked', String(val)); on(val); }; return b; };
    const cell = (ic, color, title, ctl, sub) => h('div', { class: 'cell' }, h('div', { class: 'ic-box', style: { background: color }, html: icon(ic) }), h('div', { class: 'lines' }, h('b', {}, title), sub ? h('small', {}, sub) : null), ctl ? h('div', { class: 'set-row-ctl' }, ctl) : null);
    const group = (title, ...cells) => h('section', {}, title ? h('div', { class: 'group-title' }, title) : null, h('div', { class: 'group' }, ...cells));

    inner.append(h('h1', { class: 'large-title' }, t('set.title')));

    // profile card
    const av = h('div', { class: 'avatar', style: { '--av': u.color }, html: emo(u.avatar) });
    const nameIn = h('input', { class: 'input', value: u.name, maxlength: 24 });
    nameIn.onchange = async () => { const n = nameIn.value.trim(); if (!n) return; await updateUser(u.id, { name: n }); profile.name = n; saveProfile(); rerender(); };
    const avs = h('div', { class: 'set-avatars' });
    AVATARS.forEach(a => { const b = h('button', { class: 'set-av' + (a === u.avatar ? ' on' : ''), html: emo(a) }); b.onclick = async () => { await updateUser(u.id, { avatar: a }); av.innerHTML = emo(a); [...avs.children].forEach(x => x.classList.toggle('on', x === b)); rerender(); }; avs.append(b); });
    const cols = h('div', { class: 'set-colors' });
    COLORS.forEach(c => { const b = h('button', { class: 'set-color' + (c === u.color ? ' on' : ''), style: { '--c': c } }); b.onclick = async () => { await updateUser(u.id, { color: c }); av.style.setProperty('--av', c); [...cols.children].forEach(x => x.classList.toggle('on', x === b)); }; cols.append(b); });
    inner.append(h('section', {}, h('div', { class: 'group-title' }, t('set.profile')), h('div', { class: 'group' }, h('div', { class: 'set-profile' }, av, h('div', { class: 'grow' }, nameIn)), avs, cols)));

    // security
    const pinBtn = h('button', { class: 'btn small tinted' }, u.pin ? t('set.pinOff') : t('set.pinSet'));
    pinBtn.onclick = async () => {
      if (u.pin) { await updateUser(u.id, { pin: null }); toast(emo('key') + ' PIN ' + E('zrušen', 'removed')); rerender(); return; }
      const inp = h('input', { class: 'input', inputmode: 'numeric', maxlength: 4, placeholder: '••••', style: { textAlign: 'center', fontSize: '24px', letterSpacing: '.4em' } });
      modal({ title: t('set.pinSet'), body: h('div', {}, h('p', { class: 'muted' }, E('Zvol 4 číslice. Při spuštění aplikace se na PIN zeptáme.', 'Choose 4 digits. The app will ask for it on launch.')), h('div', { class: 'field' }, inp)),
        actions: [{ label: t('cancel'), cls: 'ghost' }, { label: t('save'), cls: 'primary', onClick: async () => { if (!/^\d{4}$/.test(inp.value)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return false; } await updateUser(u.id, { pin: inp.value, remember: false }); toast(emo('lock') + ' PIN ' + E('nastaven', 'set')); rerender(); } }] });
      setTimeout(() => inp.focus(), 60);
    };
    const remember = toggle(u.remember && !u.pin, async v => { await updateUser(u.id, { remember: v }); });
    if (u.pin) remember.disabled = true;
    inner.append(group(E('Zabezpečení', 'Security'),
      cell('lock', '#ff9500', t('set.pin'), pinBtn, u.pin ? E('Profil je zamčený PINem', 'Profile is locked with a PIN') : E('Bez PINu', 'No PIN')),
      cell('person', '#34c759', t('set.remember'), remember, t('set.rememberHint')),
      h('button', { class: 'cell', onclick: () => lock() }, h('div', { class: 'ic-box', style: { background: '#5856d6' }, html: icon('logout') }), h('div', { class: 'lines' }, h('b', {}, t('set.lockApp'))), h('span', { class: 'chev', html: icon('right') }))));

    // language & look
    inner.append(group(E('Jazyk a vzhled', 'Language & appearance'),
      cell('globe', '#007aff', t('set.lang'), seg([['cs', 'CZ'], ['en', 'EN'], ['both', 'CZ+EN']], profile.lang, v => { profile.lang = v; saveProfile(); applyTheme(); rerender(); }), t('set.langHint')),
      cell('moon', '#1c1c1e', t('set.theme'), seg([['light', t('set.light')], ['dark', t('set.dark')], ['auto', t('set.auto')]], profile.theme, v => { profile.theme = v; saveProfile(); applyTheme(); rerender(); })),
      window.folio ? cell('fullscreen', '#30b0c7', t('set.fullscreen'), toggle(true, () => window.folio.toggleFullscreen()), 'F11') : null));

    inner.append(group(E('Pero a zvuk', 'Pen & sound'),
      cell('pen', '#ff2d55', t('set.penOnly'), toggle(profile.penOnly, v => { profile.penOnly = v; saveProfile(); }), t('set.penOnlyHint')),
      cell('volume', '#ff3b30', t('set.sounds'), toggle(profile.sounds, v => { profile.sounds = v; saveProfile(); })),
      cell('book', '#a2845e', t('set.flipSound'), toggle(profile.flipSound, v => { profile.flipSound = v; saveProfile(); }))));

    // data
    const usage = h('span', { class: 'val' }, '…');
    navigator.storage?.estimate?.().then(e => { usage.textContent = `${(e.usage / 1048576).toFixed(1)} MB`; }).catch(() => { usage.textContent = '—'; });
    const exportBackup = async () => {
      await flushSaves();
      const out = {};
      for (const [k, v] of await store.entries('')) { if (k.startsWith('global:')) continue; out[k] = v instanceof ArrayBuffer ? { __ab: abToB64(v) } : (v && v.data instanceof ArrayBuffer ? { ...v, data: { __ab: abToB64(v.data) } } : v); }
      download(new Blob([JSON.stringify({ app: 'folio', version: 2, user: { name: u.name, avatar: u.avatar, color: u.color }, date: new Date().toISOString(), data: out })], { type: 'application/json' }), `folio-${u.name}-${new Date().toLocaleDateString('sv-SE')}.json`);
      toast(emo('check') + ' ' + t('set.saved'));
    };
    const importBackup = async () => {
      const f = await pickFile('application/json,.json');
      if (!f) return;
      try {
        const json = JSON.parse(await f.text());
        if (json.app !== 'folio') throw new Error('not a Folio backup');
        for (const [k, v] of Object.entries(json.data)) await store.set(k, v && v.__ab ? b64ToAb(v.__ab) : (v && v.data && v.data.__ab ? { ...v, data: b64ToAb(v.data.__ab) } : v));
        toast(emo('check') + ' ' + t('set.imported'));
        setTimeout(() => location.reload(), 700);
      } catch (e) { toast(emo('warning') + ' ' + e.message); }
    };
    const resetProgress = async () => {
      if (!await confirmDialog(t('set.reset'), t('set.resetConfirm'), t('set.reset'))) return;
      Object.assign(profile, { xp: 0, streak: { last: null, count: 0 }, days: {}, goals: {}, lessons: {}, quizzes: {}, cards: {} });
      saveProfile(); rerender();
    };
    const delProfile = async () => {
      if (!await confirmDialog(t('set.deleteProfile'), E(`Smaže profil „${u.name}" včetně poznámek, sešitů a pokroku.`, `Deletes profile "${u.name}" including notes, notebooks and progress.`))) return;
      if (u.pin) {
        const pin = prompt('PIN');
        if (!(await verifyPin(u, pin || ''))) { toast(emo('cross') + ' PIN'); return; }
      }
      await deleteUser(u.id);
      lock();
    };
    const btnCell = (ic, color, title, fn, danger) => h('button', { class: 'cell', onclick: fn }, h('div', { class: 'ic-box', style: { background: color }, html: icon(ic) }), h('div', { class: 'lines' }, h('b', { style: danger ? { color: 'var(--red)' } : null }, title)), h('span', { class: 'chev', html: icon('right') }));
    inner.append(group(t('set.data'),
      h('div', { class: 'cell' }, h('div', { class: 'ic-box', style: { background: '#8e8e93' }, html: icon('layers') }), h('div', { class: 'lines' }, h('b', {}, t('set.storage')), h('small', {}, E('Vše je uložené v tomto zařízení a funguje i offline.', 'Stored on this device, works offline.'))), usage),
      btnCell('download', '#34c759', t('set.export'), exportBackup),
      btnCell('upload', '#007aff', t('set.import'), importBackup),
      btnCell('reset', '#ff9500', t('set.reset'), resetProgress),
      btnCell('trash', '#ff3b30', t('set.deleteProfile'), delProfile, true)));

    inner.append(h('section', {}, h('div', { class: 'group-title' }, t('set.about')), h('div', { class: 'group' }, h('div', { class: 'cell no-icon' }, h('div', { class: 'lines' },
      h('b', {}, 'Folio 2.0'),
      h('small', { style: { whiteSpace: 'normal' } }, E('Kniha: K. F. Riley, M. P. Hobson, S. J. Bence – Mathematical Methods for Physics and Engineering (Cambridge University Press). Lekce, testy a kartičky jsou vlastní studijní materiál ke knize.', 'Book: Riley, Hobson & Bence – Mathematical Methods for Physics and Engineering (CUP). Lessons, tests and cards are original study material for the book.')),
      h('small', { style: { whiteSpace: 'normal', marginTop: '6px' } }, 'pdf.js (Apache-2.0) · KaTeX (MIT) · perfect-freehand (MIT) · Fluent Emoji (MIT) · Inter, Literata, Caveat (OFL)'))))));
  },
};
