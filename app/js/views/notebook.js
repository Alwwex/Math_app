// Sešity: stránky papíru (linky, čtverečky, tečky, osy) a psaní perem jako na iPadu.
import { store, saveLater, flushSaves } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, uid, modal, confirmDialog, download, toast } from '../util.js';
import { icon } from '../icons.js';
import { InkSurface, InkToolbar, inkState, drawStrokes } from '../ink.js';

const PAPERS = ['blank', 'lined', 'grid', 'dots', 'axes'];
const COVERS = ['#2f62d8', '#e8794a', '#23935f', '#7a55d0', '#13897f', '#d4483f', '#3a3f4b', '#d9952b'];
const PW = 1000, PH = 1414;

async function getIndex() { return (await store.get('nb:index')) || []; }
async function setIndex(idx) { await store.set('nb:index', idx); }

export async function ensureDefaultNotebook() {
  const idx = await getIndex();
  if (idx.length) return idx;
  const id = uid(), p1 = uid();
  idx.push({ id, title: lang() === 'en' ? 'Chapter 1 – notes' : 'Kapitola 1 – výpisky', color: COVERS[0], paper: 'lined', pages: [p1], created: Date.now(), updated: Date.now() });
  await store.set('nbpage:' + p1, { paper: 'lined', strokes: [] });
  await setIndex(idx);
  return idx;
}

function paperThumb(paper) { return h('div', { class: `paper paper-${paper} paper-thumb` }); }

export default {
  async mount(root, params) {
    if (params[0]) return openNotebook(root, params[0]);
    return listNotebooks(root);
  },
};

async function listNotebooks(root) {
  const idx = await ensureDefaultNotebook();
  root.append(h('div', { class: 'topbar' }, h('div', { class: 'grow' }, h('h1', {}, t('nb.title')), h('div', { class: 'sub' }, `${idx.length} ${t('home.notebooks')}`)),
    h('button', { class: 'btn primary', html: icon('plus') + `<span>${t('nb.new')}</span>`, onclick: () => newDialog() })));
  const grid = h('div', { class: 'nb-grid' });
  root.append(h('div', { class: 'nb-inner' }, grid));
  idx.sort((a, b) => b.updated - a.updated).forEach((nb, i) => {
    grid.append(h('a', { class: 'nb-card rise', href: `#/notebook/${nb.id}`, style: { animationDelay: i * 50 + 'ms', '--cover': nb.color } },
      h('div', { class: 'nb-cover' }, h('div', { class: 'nb-band' }), h('div', { class: 'nb-label' }, h('b', {}, nb.title), h('small', {}, `${nb.pages.length} ${t('nb.pages')}`)), h('div', { class: 'nb-rings' }, ...Array.from({ length: 7 }, () => h('i')))),
      h('div', { class: 'nb-meta' }, new Date(nb.updated).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))));
  });
  grid.append(h('button', { class: 'nb-card nb-new', onclick: () => newDialog() }, h('div', { class: 'nb-cover' }, h('div', { class: 'nb-plus', html: icon('plus') }), h('span', {}, t('nb.new')))));

  // lesson / quiz pads
  const pads = await store.keys('pad:');
  if (pads.length) {
    const box = h('div', { class: 'nb-pads' }, h('h3', { class: 'display' }, t('nb.lessonPads')));
    for (const k of pads) {
      const d = await store.get(k);
      const prev = h('canvas', { width: 200, height: 140, class: 'pad-prev' });
      const ctx = prev.getContext('2d');
      ctx.scale(.2, .2);
      drawStrokes(ctx, d.strokes || [], document.documentElement.dataset.theme === 'dark');
      box.append(h('button', { class: 'pad-tile', onclick: async () => { const { openPad } = await import('../pad.js'); openPad(k, d.title || k); } }, prev, h('span', {}, d.title || k)));
    }
    root.querySelector('.nb-inner').append(box);
  }

  function newDialog() {
    let color = COVERS[(idx.length) % COVERS.length], paper = 'lined';
    const name = h('input', { class: 'input', value: (lang() === 'en' ? 'Notebook ' : 'Sešit ') + (idx.length + 1) });
    const colors = h('div', { class: 'nb-colors' });
    COVERS.forEach(c => { const b = h('button', { class: 'swatch big' + (c === color ? ' on' : ''), style: { '--c': c } }); b.onclick = () => { color = c; [...colors.children].forEach(x => x.classList.toggle('on', x === b)); }; colors.append(b); });
    const papers = h('div', { class: 'nb-papers' });
    PAPERS.forEach(p => { const b = h('button', { class: 'paper-pick' + (p === paper ? ' on' : '') }, paperThumb(p), h('span', {}, t('paper.' + p))); b.onclick = () => { paper = p; [...papers.children].forEach(x => x.classList.toggle('on', x === b)); }; papers.append(b); });
    const body = h('div', {}, h('div', { class: 'field' }, h('label', {}, t('nb.name')), name), h('div', { class: 'field' }, h('label', {}, t('nb.color')), colors), h('div', { class: 'field' }, h('label', {}, t('nb.paper')), papers));
    modal({ title: t('nb.new'), body, actions: [{ label: t('cancel'), cls: 'ghost' }, { label: t('create'), cls: 'primary', onClick: async () => {
      const id = uid(), p1 = uid();
      idx.push({ id, title: name.value.trim() || 'Sešit', color, paper, pages: [p1], created: Date.now(), updated: Date.now() });
      await store.set('nbpage:' + p1, { paper, strokes: [] });
      await setIndex(idx);
      location.hash = '#/notebook/' + id;
    } }] });
    setTimeout(() => name.select(), 50);
  }
}

async function openNotebook(root, id) {
  const idx = await getIndex();
  const nb = idx.find(n => n.id === id);
  if (!nb) { location.hash = '#/notebook'; return; }
  root.classList.add('no-scroll', 'nb-open');
  if (inkState.tool === 'hand') inkState.tool = 'pen';
  const surfaces = new Map();
  let zoom = 1;
  const touchIndex = () => { nb.updated = Date.now(); saveLater('nb:index', () => idx, 600); };

  const title = h('input', { class: 'nb-title-input', value: nb.title });
  title.onchange = () => { nb.title = title.value.trim() || nb.title; touchIndex(); };
  const zoomOut = h('button', { class: 'btn icon small ghost', html: icon('zoomOut'), onclick: () => setZoom(zoom - .15) });
  const zoomIn = h('button', { class: 'btn icon small ghost', html: icon('zoomIn'), onclick: () => setZoom(zoom + .15) });
  const menuBtn = h('button', { class: 'btn icon ghost', html: icon('more'), onclick: () => menu() });
  const top = h('div', { class: 'topbar nb-top' },
    h('a', { class: 'btn icon ghost', href: '#/notebook', html: icon('left') }),
    h('span', { class: 'nb-dot', style: { background: nb.color } }),
    title, h('div', { class: 'grow' }), zoomOut, zoomIn,
    h('button', { class: 'btn small', html: icon('plus') + `<span>${t('nb.addPage')}</span>`, onclick: () => addPage() }), menuBtn);
  const toolbar = new InkToolbar({ getSurface: () => currentSurface() });
  const pagesEl = h('div', { class: 'nb-pages' });
  const scroller = h('div', { class: 'nb-scroll' }, pagesEl);
  root.append(top, h('div', { class: 'nb-toolbar-wrap' }, toolbar.el), scroller);

  function currentSurface() {
    // the page closest to the middle of the screen
    const mid = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
    let best = null, bd = Infinity;
    for (const [, s] of surfaces) { const r = s.host.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = s; } }
    return best;
  }
  function setZoom(z) { zoom = Math.max(.6, Math.min(2, z)); pagesEl.style.setProperty('--zoom', zoom); }

  async function renderPage(pid, i, animate = false) {
    const data = (await store.get('nbpage:' + pid)) || { paper: nb.paper, strokes: [] };
    const wrap = h('div', { class: 'nb-page-wrap' + (animate ? ' pop' : '') });
    const page = h('div', { class: `nb-page paper paper-${data.paper}` });
    const foot = h('div', { class: 'nb-page-foot' }, h('span', {}, `${i + 1}`),
      h('button', { class: 'btn icon small ghost', html: icon('trash'), title: t('nb.deletePage'), onclick: async () => {
        if (nb.pages.length === 1) return;
        if (!await confirmDialog(t('nb.deletePage'), t('nb.confirmDelete'))) return;
        const k = nb.pages.indexOf(pid);
        nb.pages.splice(k, 1);
        surfaces.get(pid)?.destroy(); surfaces.delete(pid);
        await store.del('nbpage:' + pid);
        touchIndex(); await flushSaves();
        wrap.remove();
        [...pagesEl.querySelectorAll('.nb-page-foot > span')].forEach((s, j) => s.textContent = j + 1);
      } }),
      paperMenu(data, page));
    wrap.append(page, foot);
    pagesEl.append(wrap);
    const surf = new InkSurface(page, { width: PW, height: PH, strokes: data.strokes, onChange: () => { saveLater('nbpage:' + pid, () => ({ ...data, strokes: surf.strokes })); touchIndex(); } });
    surfaces.set(pid, surf);
  }
  function paperMenu(data, page) {
    const sel = h('select', { class: 'paper-select', title: t('nb.paper') });
    PAPERS.forEach(p => sel.append(h('option', { value: p, selected: p === data.paper ? '' : null }, t('paper.' + p))));
    sel.onchange = () => {
      page.classList.remove('paper-' + data.paper);
      data.paper = sel.value;
      page.classList.add('paper-' + data.paper);
      const pid = [...surfaces.entries()].find(([, s]) => s.host === page)?.[0];
      if (pid) saveLater('nbpage:' + pid, () => ({ ...data, strokes: surfaces.get(pid).strokes }));
    };
    return sel;
  }
  async function addPage() {
    const pid = uid();
    const last = nb.pages[nb.pages.length - 1];
    const prevPaper = (await store.get('nbpage:' + last))?.paper || nb.paper;
    await store.set('nbpage:' + pid, { paper: prevPaper, strokes: [] });
    nb.pages.push(pid); touchIndex();
    await renderPage(pid, nb.pages.length - 1, true);
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }
  async function exportPage() {
    const s = currentSurface();
    if (!s) return;
    const pid = [...surfaces.entries()].find(([, x]) => x === s)[0];
    const data = await store.get('nbpage:' + pid);
    const c = document.createElement('canvas');
    c.width = 1600; c.height = Math.round(1600 * PH / PW);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.scale(c.width / PW, c.height / PH);
    drawPaper(ctx, data?.paper || 'blank');
    drawStrokes(ctx, s.strokes, false);
    c.toBlob(b => download(b, `${nb.title} – ${nb.pages.indexOf(pid) + 1}.png`), 'image/png');
    toast('🖼️ ' + t('nb.export'));
  }
  function menu() {
    const body = h('div', { class: 'nb-menu' },
      h('button', { class: 'btn', html: icon('image') + `<span>${t('nb.export')}</span>`, onclick: () => { m.close(); exportPage(); } }),
      h('button', { class: 'btn coral', html: icon('trash') + `<span>${t('nb.deleteNb')}</span>`, onclick: async () => {
        m.close();
        if (!await confirmDialog(t('nb.deleteNb'), t('nb.confirmDelete'))) return;
        for (const p of nb.pages) await store.del('nbpage:' + p);
        idx.splice(idx.indexOf(nb), 1);
        await setIndex(idx);
        location.hash = '#/notebook';
      } }));
    const m = modal({ title: nb.title, body, actions: [{ label: t('close'), cls: 'ghost' }] });
  }

  for (let i = 0; i < nb.pages.length; i++) await renderPage(nb.pages[i], i);
  return () => { toolbar.destroy(); surfaces.forEach(s => s.destroy()); flushSaves(); };
}

// Paper backgrounds for PNG export (mirrors the CSS patterns)
function drawPaper(ctx, paper) {
  ctx.save();
  ctx.strokeStyle = '#c9d8f0'; ctx.fillStyle = '#b7c3d6'; ctx.lineWidth = 1.2;
  if (paper === 'lined') {
    for (let y = 110; y < PH; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(PW, y); ctx.stroke(); }
    ctx.strokeStyle = '#f2b8b0'; ctx.beginPath(); ctx.moveTo(90, 0); ctx.lineTo(90, PH); ctx.stroke();
  } else if (paper === 'grid' || paper === 'axes') {
    for (let x = 0; x < PW; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, PH); ctx.stroke(); }
    for (let y = 0; y < PH; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(PW, y); ctx.stroke(); }
    if (paper === 'axes') {
      ctx.strokeStyle = '#5b6474'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(PW, 700); ctx.moveTo(500, 0); ctx.lineTo(500, PH); ctx.stroke();
    }
  } else if (paper === 'dots') {
    for (let x = 25; x < PW; x += 25) for (let y = 25; y < PH; y += 25) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
