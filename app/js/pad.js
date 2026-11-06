// Pomocný papír – plovoucí okno, které jde chytit za horní lištu a přesunout kamkoli
// (myší, prstem i perem), zvětšit tahem za roh, zmenšit na lísteček nebo přichytit k okraji.
// Je dostupný všude; lekce a testy mají každý svůj papír, jinde se otevře společný.
import { h, clamp, sound } from './util.js';
import { icon } from './icons.js';
import { t, lang } from './i18n.js';
import { store, saveLater, profile, saveProfile } from './store.js';
import { InkSurface, InkToolbar, inkState } from './ink.js';

let current = null;
const E = (cs, en) => (lang() === 'en' ? en : cs);
let ctx = null;
const listeners = new Set();
const emit = () => listeners.forEach(f => f(!!current));
export const onPad = fn => { listeners.add(fn); return () => listeners.delete(fn); };
export const padOpen = () => !!current;

// the view tells us which paper belongs to it (lesson / test); everything else uses a shared one
export function setPadContext(key, title) { ctx = key ? { key, title } : null; }
export function openContextPad() {
  const c = ctx || { key: 'pad:global', title: E('Pomocný papír', 'Scratch paper') };
  return openPad(c.key, c.title);
}
export function togglePad() { if (current) current.close(); else openContextPad(); }

const MIN_W = 300, MIN_H = 240;
function defaultRect() {
  const w = Math.min(540, innerWidth - 32), hh = Math.min(innerHeight - 96, 720);
  return { x: innerWidth - w - 24, y: 64, w, h: hh };
}
function fit(r) {
  const w = clamp(r.w, MIN_W, Math.max(MIN_W, innerWidth - 16));
  const hh = clamp(r.h, MIN_H, Math.max(MIN_H, innerHeight - 16));
  return { w, h: hh, x: clamp(r.x, 8, Math.max(8, innerWidth - w - 8)), y: clamp(r.y, 8, Math.max(8, innerHeight - hh - 8)) };
}

export async function openPad(key, title) {
  if (current?.key === key) { current.restore(); current.focusWin(); return current; }
  current?.close(true);
  const data = (await store.get(key)) || { strokes: [], pages: 1, title };
  data.title = title;
  let rect = fit(profile.padWin?.rect || defaultRect());
  let docked = !!profile.padWin?.docked, minimized = false;

  const win = h('section', { class: 'fpad', role: 'dialog', 'aria-label': title });
  const body = h('div', { class: 'fpad-body' });
  const paper = h('div', { class: 'pad-paper paper paper-lined' });
  const more = h('button', { class: 'btn small ghost pad-more', html: icon('plus') + `<span>${t('nb.addPage')}</span>` });
  body.append(paper, more);
  const tb = new InkToolbar({ tools: ['pen', 'hl', 'eraser', 'line'], getSurface: () => surface });
  const dockBtn = h('button', { class: 'fpad-b', title: E('Přichytit vpravo / uvolnit', 'Dock right / float') });
  const minBtn = h('button', { class: 'fpad-b', title: E('Zmenšit', 'Minimise'), html: icon('minus') });
  const closeBtn = h('button', { class: 'fpad-b', title: t('close'), html: icon('x') });
  const head = h('header', { class: 'fpad-head' },
    h('span', { class: 'fpad-grip', html: icon('grip') }),
    h('span', { class: 'pad-ic', html: icon('scratch') }),
    h('div', { class: 'fpad-title' }, h('b', {}, title), h('small', {}, E('Chyť lištu a přesuň', 'Drag the bar to move'))),
    dockBtn, minBtn, closeBtn);
  const rsR = h('div', { class: 'fpad-rs r', title: E('Změnit velikost', 'Resize') });
  const rsL = h('div', { class: 'fpad-rs l', title: E('Změnit velikost', 'Resize') });
  win.append(head, h('div', { class: 'fpad-tools' }, tb.el), body, rsL, rsR);
  document.body.append(win);

  const apply = () => {
    const r = docked ? { x: innerWidth - Math.min(rect.w, innerWidth - 16) - 8, y: 8, w: Math.min(rect.w, innerWidth - 16), h: innerHeight - 16 } : rect;
    if (minimized) { win.style.left = clamp(r.x, 8, innerWidth - 200) + 'px'; win.style.top = clamp(r.y, 8, innerHeight - 56) + 'px'; win.style.width = ''; win.style.height = ''; }
    else Object.assign(win.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    win.classList.toggle('docked', docked && !minimized);
    win.classList.toggle('min', minimized);
    dockBtn.innerHTML = icon(docked ? 'float' : 'dock');
  };
  const persist = () => { profile.padWin = { rect, docked }; saveProfile(); };
  apply();

  // ---- drag the window by its header (pointer events → mouse, touch and pen) ----
  let drag = null;
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    if (docked) { docked = false; rect = fit({ ...rect, x: e.clientX - rect.w / 2, y: e.clientY - 20 }); apply(); }
    drag = { id: e.pointerId, dx: e.clientX - rect.x, dy: e.clientY - rect.y, moved: false };
    head.setPointerCapture(e.pointerId);
    win.classList.add('dragging');
  });
  head.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.moved = true;
    rect = minimized ? { ...rect, x: e.clientX - drag.dx, y: e.clientY - drag.dy } : fit({ ...rect, x: e.clientX - drag.dx, y: e.clientY - drag.dy });
    apply();
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null;
    win.classList.remove('dragging');
    // drop near the right edge → dock
    if (moved && !minimized && e.clientX > innerWidth - 24) { docked = true; apply(); sound.tick(); }
    if (moved) persist();
    else if (minimized) restore();
  };
  head.addEventListener('pointerup', endDrag);
  head.addEventListener('pointercancel', endDrag);
  head.addEventListener('dblclick', e => { if (!e.target.closest('button')) { docked = !docked; minimized = false; apply(); persist(); sound.tick(); } });

  // ---- resize from the bottom corners ----
  for (const [el, side] of [[rsR, 1], [rsL, -1]]) {
    let rs = null;
    el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (docked) { docked = false; } rs = { id: e.pointerId, x: e.clientX, y: e.clientY, r: { ...rect } }; el.setPointerCapture(e.pointerId); win.classList.add('resizing'); });
    el.addEventListener('pointermove', e => {
      if (!rs || e.pointerId !== rs.id) return;
      const dx = e.clientX - rs.x, dy = e.clientY - rs.y;
      const w = clamp(rs.r.w + dx * side, MIN_W, innerWidth - 16);
      rect = fit({ x: side < 0 ? rs.r.x + (rs.r.w - w) : rs.r.x, y: rs.r.y, w, h: rs.r.h + dy });
      apply();
    });
    const end = e => { if (rs && e.pointerId === rs.id) { rs = null; win.classList.remove('resizing'); persist(); } };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  const H = () => 1414 * data.pages;
  paper.style.aspectRatio = `1000 / ${H()}`;
  const save = () => saveLater(key, () => ({ ...data, strokes: surface.strokes }));
  const surface = new InkSurface(paper, { width: 1000, height: H(), strokes: data.strokes, onChange: save });
  more.onclick = () => { data.pages++; surface.H = H(); paper.style.aspectRatio = `1000 / ${H()}`; save(); sound.tick(); requestAnimationFrame(() => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })); };
  if (inkState.tool === 'hand') inkState.tool = 'pen';

  function minimize() { minimized = true; apply(); sound.tick(); }
  function restore() { if (!minimized) return; minimized = false; rect = fit(rect); apply(); sound.tick(); }
  function focusWin() { win.animate([{ transform: 'scale(1.025)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
  dockBtn.onclick = () => { docked = !docked; minimized = false; apply(); persist(); sound.tick(); };
  minBtn.onclick = () => (minimized ? restore() : minimize());
  closeBtn.onclick = () => close();

  const onResize = () => { rect = fit(rect); apply(); };
  window.addEventListener('resize', onResize);
  const onKey = e => { if (e.key === 'Escape' && !minimized && !document.querySelector('.modal-back')) close(); };
  document.addEventListener('keydown', onKey);

  function close(instant = false) {
    if (current?.win !== win) return;
    current = null;
    window.removeEventListener('resize', onResize);
    document.removeEventListener('keydown', onKey);
    win.classList.remove('open');
    if (!instant) sound.close();
    setTimeout(() => { surface.destroy(); tb.destroy(); win.remove(); }, instant ? 0 : 280);
    emit();
  }
  requestAnimationFrame(() => win.classList.add('open'));
  sound.open();
  current = { key, win, close, restore, focusWin };
  emit();
  return current;
}
export function closePad() { current?.close(); }
