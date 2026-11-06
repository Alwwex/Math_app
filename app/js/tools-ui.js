// Nástroje dostupné odkudkoli: mini přehrávač hudby a pomocný papír v postranním panelu,
// na telefonu plovoucí tlačítko, a okno s playlistem.
import { h, emo, sound, toast } from './util.js';
import { icon } from './icons.js';
import { L, lang } from './i18n.js';
import * as M from './music.js';
import { togglePad, onPad, padOpen } from './pad.js';

const E = (cs, en) => (lang() === 'en' ? en : cs);
let side = null, fab = null, sheet = null;

function eq() { return h('span', { class: 'eqz' }, h('i'), h('i'), h('i')); }

// ---------- sidebar block (persistent element, re-attached on every nav render) ----------
export function sideTools() {
  if (side) { refresh(); return side; }
  side = h('div', { class: 'side-tools' });
  M.onMusic(refresh);
  onPad(refresh);
  refresh();
  return side;
}
function refresh() {
  const st = M.musicState(), tr = M.trackInfo(st.id);
  if (side) {
    side.innerHTML = '';
    const mini = h('div', { class: 'mini' + (st.playing ? ' playing' : ''), style: { '--hue': tr.hue } },
      h('button', { class: 'mini-art', title: E('Hudba ke studiu', 'Study music'), html: emo(tr.emoji), onclick: e => openSheet(e.currentTarget) }),
      h('button', { class: 'mini-meta', onclick: e => openSheet(e.currentTarget) }, h('small', {}, st.playing ? E('Hraje', 'Playing') : E('Hudba ke studiu', 'Study music')), h('b', {}, L(tr.name))),
      st.playing ? eq() : null,
      h('button', { class: 'mini-btn', title: st.playing ? E('Pauza', 'Pause') : E('Přehrát', 'Play'), html: icon(st.playing ? 'pause' : 'play'), onclick: () => M.toggle() }));
    const paper = h('button', { class: 'side-item side-paper' + (padOpen() ? ' on' : ''), title: E('Pomocný papír', 'Scratch paper'), onclick: () => togglePad(), html: icon('scratch') + `<span>${E('Pomocný papír', 'Scratch paper')}</span>` });
    side.append(paper, mini);
  }
  if (fab) {
    fab.classList.toggle('playing', st.playing);
    fab.querySelector('.fab-paper')?.classList.toggle('on', padOpen());
  }
  if (sheet) renderSheet();
}

// ---------- phone: floating buttons ----------
export function mobileTools() {
  if (fab) return fab;
  fab = h('div', { class: 'mtools' },
    h('button', { class: 'fab-music', title: E('Hudba', 'Music'), html: icon('music'), onclick: e => openSheet(e.currentTarget) }),
    h('button', { class: 'fab-paper', title: E('Pomocný papír', 'Scratch paper'), html: icon('scratch'), onclick: () => togglePad() }));
  document.body.append(fab);
  refresh();
  return fab;
}

// ---------- the music sheet ----------
export function openSheet(anchor) {
  if (sheet) { closeSheet(); return; }
  sheet = h('div', { class: 'msheet' });
  document.body.append(sheet);
  const r = anchor.getBoundingClientRect();
  if (innerWidth > 760) {
    if (r.top < innerHeight / 2) { sheet.style.top = r.bottom + 8 + 'px'; sheet.style.left = Math.max(8, Math.min(r.right - 360, innerWidth - 368)) + 'px'; sheet.classList.add('from-top'); }
    else { sheet.style.left = Math.min(r.right + 14, innerWidth - 376) + 'px'; sheet.style.bottom = Math.max(12, innerHeight - r.bottom - 10) + 'px'; }
  }
  M.loadFiles();
  renderSheet();
  sound.open();
  requestAnimationFrame(() => sheet?.classList.add('open'));
  setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc); }, 0);
}
function outside(e) { if (sheet && !sheet.contains(e.target) && !e.target.closest('.mini, .mtools')) closeSheet(); }
function esc(e) { if (e.key === 'Escape') closeSheet(); }
function closeSheet() {
  document.removeEventListener('pointerdown', outside, true);
  document.removeEventListener('keydown', esc);
  const s = sheet; sheet = null;
  if (s) { s.classList.remove('open'); sound.close(); setTimeout(() => s.remove(), 300); }
}
function row(tr, st) {
  const on = st.id === tr.id;
  const b = h('button', { class: 'ms-row' + (on ? ' on' : ''), style: { '--hue': tr.hue } },
    h('span', { class: 'ms-ic', html: emo(tr.emoji) }),
    h('span', { class: 'ms-t' }, h('b', {}, L(tr.name)), h('small', {}, L(tr.desc))),
    on && st.playing ? eq() : null);
  b.onclick = () => { if (on) M.toggle(); else M.play(tr.id); };
  return b;
}
function renderSheet() {
  const st = M.musicState(), tr = M.trackInfo(st.id);
  sheet.innerHTML = '';
  sheet.classList.toggle('playing', st.playing);
  const vol = h('input', { type: 'range', class: 'ms-vol', min: 0, max: 1, step: .01, value: st.vol, 'aria-label': E('Hlasitost', 'Volume') });
  vol.oninput = () => M.setVolume(+vol.value);
  vol.style.setProperty('--v', st.vol * 100 + '%');
  vol.addEventListener('input', () => vol.style.setProperty('--v', vol.value * 100 + '%'));
  const mode = h('button', { class: 'ms-b' + (st.mode === 'one' ? ' on' : ''), title: st.mode === 'one' ? E('Opakovat jednu skladbu', 'Repeat one') : E('Hrát celý playlist', 'Play the whole playlist'), html: icon(st.mode === 'one' ? 'repeat1' : 'repeat') });
  mode.onclick = () => { M.setMode(st.mode === 'one' ? 'list' : 'one'); sound.toggle(st.mode !== 'one'); };
  sheet.append(
    h('div', { class: 'ms-now', style: { '--hue': tr.hue } },
      h('div', { class: 'ms-art', html: emo(tr.emoji) }),
      h('div', { class: 'ms-meta' }, h('small', {}, st.playing ? E('Právě hraje', 'Now playing') : E('Hudba ke studiu', 'Study music')), h('b', {}, L(tr.name)), h('span', {}, L(tr.desc))),
      h('div', { class: 'ms-ctrl' },
        mode,
        h('button', { class: 'ms-b', title: E('Předchozí', 'Previous'), html: icon('prev'), onclick: () => M.prev() }),
        h('button', { class: 'ms-b play', title: st.playing ? E('Pauza', 'Pause') : E('Přehrát', 'Play'), html: icon(st.playing ? 'pause' : 'play'), onclick: () => M.toggle() }),
        h('button', { class: 'ms-b', title: E('Další', 'Next'), html: icon('next'), onclick: () => M.next() }),
        h('span', { class: 'ms-b ghost', html: icon('volume') })),
      vol));
  const list = h('div', { class: 'ms-list' }, h('div', { class: 'ms-cap' }, E('Ke studiu – hraje se živě v aplikaci', 'For studying – generated live')));
  M.TRACKS.forEach(t => list.append(row(t, st)));
  list.append(h('div', { class: 'ms-cap' }, E('Vlastní hudba', 'Your music')));
  for (const f of st.files) {
    const r = row(M.trackInfo(f.id), st);
    r.append(h('span', { class: 'ms-del', title: E('Odebrat', 'Remove'), html: icon('x'), onclick: e => { e.stopPropagation(); M.removeFile(f.id); } }));
    list.append(r);
  }
  const add = h('button', { class: 'ms-row add', html: `<span class="ms-ic plus">${icon('plus')}</span><span class="ms-t"><b>${E('Přidat hudbu…', 'Add music…')}</b><small>MP3, M4A, OGG, WAV</small></span>` });
  add.onclick = async () => {
    const files = await pickFiles('audio/*,.mp3,.m4a,.ogg,.wav,.flac,.opus');
    if (!files.length) return;
    await M.addFiles(files);
    toast(emo('music') + ' ' + E(`Přidáno: ${files.length}`, `Added: ${files.length}`));
  };
  list.append(add);
  sheet.append(list);
}
function pickFiles(accept) {
  return new Promise(res => {
    const inp = h('input', { type: 'file', accept, multiple: true, style: { display: 'none' } });
    inp.onchange = () => { res([...inp.files]); inp.remove(); };
    document.body.append(inp);
    inp.click();
  });
}
