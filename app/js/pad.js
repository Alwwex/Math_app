// Výsuvný „poznámkový papír" – psaní perem vedle lekce nebo testu. Ukládá se automaticky.
import { h } from './util.js';
import { icon } from './icons.js';
import { t } from './i18n.js';
import { store, saveLater, profile } from './store.js';
import { InkSurface, InkToolbar, inkState } from './ink.js';

let current = null;

export async function openPad(key, title) {
  if (current?.key === key) { current.close(); return; }
  current?.close();
  const data = (await store.get(key)) || { strokes: [], pages: 1, title };
  data.title = title;
  const drawer = h('aside', { class: 'drawer pad-drawer' });
  const body = h('div', { class: 'drawer-body pad-body' });
  const paper = h('div', { class: 'pad-paper paper paper-lined' });
  body.append(paper);
  const more = h('button', { class: 'btn small ghost pad-more', html: icon('plus') + `<span>${t('nb.addPage')}</span>` });
  body.append(more);
  const tb = new InkToolbar({ tools: ['pen', 'hl', 'eraser', 'line'], getSurface: () => surface });
  const close = () => {
    drawer.classList.remove('open');
    setTimeout(() => { surface.destroy(); tb.destroy(); drawer.remove(); }, 450);
    document.removeEventListener('keydown', onKey);
    current = null;
  };
  drawer.append(
    h('div', { class: 'drawer-head' }, h('span', { class: 'pad-ic', html: icon('pen') }), h('h3', {}, title), h('button', { class: 'btn icon ghost', html: icon('x'), 'aria-label': t('close'), onclick: close })),
    h('div', { class: 'pad-tools' }, tb.el),
    body);
  document.body.append(drawer);
  const H = () => 1414 * data.pages;
  paper.style.aspectRatio = `1000 / ${H()}`;
  const surface = new InkSurface(paper, { width: 1000, height: H(), strokes: data.strokes, onChange: () => saveLater(key, () => ({ ...data, strokes: surface.strokes })) });
  more.onclick = () => { data.pages++; surface.H = H(); paper.style.aspectRatio = `1000 / ${H()}`; saveLater(key, () => ({ ...data, strokes: surface.strokes })); requestAnimationFrame(() => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })); };
  if (inkState.tool === 'hand') inkState.tool = 'pen';
  requestAnimationFrame(() => drawer.classList.add('open'));
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  current = { key, close };
  void profile;
  return current;
}
export function closePad() { current?.close(); }
