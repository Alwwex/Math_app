// Čtečka PDF jako opravdová kniha: dvoustrana, otáčení listů (i tažením prstem), záložky,
// obsah, přiblížení a psaní/zvýrazňování přímo do stránek. Vše se ukládá.
import * as pdfjsLib from '../../vendor/pdfjs/pdf.min.js';
import { profile, saveProfile, store, saveLater, flushSaves } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, clamp, pickFile, toast, sound, sleep } from '../util.js';
import { icon } from '../icons.js';
import { InkSurface, InkToolbar, inkState, drawStrokes, onInk } from '../ink.js';
import { book as bookMeta } from '../../content/book.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../../vendor/pdfjs/pdf.worker.min.js', import.meta.url).href;

const INK_W = 1000;

function hashStr(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36); }

async function loadBookSource() {
  const user = await store.get('book:user');
  if (user?.data) return { id: 'u-' + hashStr(user.name + user.size), name: user.name.replace(/\.pdf$/i, ''), data: user.data, user: true };
  const res = await fetch(bookMeta.samplePdf);
  const buf = await res.arrayBuffer();
  return { id: 'sample', name: t('reader.sample'), data: buf, user: false };
}

export default {
  async mount(root, params, query) {
    root.classList.add('no-scroll', 'reader-view');
    inkState.tool = 'hand';
    const R = { cleanup: [] };

    // ---------- DOM ----------
    const titleEl = h('div', { class: 'rd-title' });
    const pageInfo = h('div', { class: 'rd-pageinfo' });
    const bmBtn = h('button', { class: 'btn icon ghost', title: t('reader.bookmarks'), html: icon('bookmark') });
    const top = h('div', { class: 'rd-top' },
      h('a', { class: 'btn icon ghost', href: '#/home', html: icon('left'), title: t('back') }),
      h('button', { class: 'btn icon ghost', title: t('reader.toc'), html: icon('list'), onclick: () => togglePanel() }),
      titleEl, h('div', { class: 'grow' }), pageInfo,
      bmBtn,
      h('button', { class: 'btn icon ghost', title: t('reader.zoom') + ' −', html: icon('zoomOut'), onclick: () => setZoom(R.zoom - .25) }),
      h('button', { class: 'btn icon ghost', title: t('reader.zoom') + ' +', html: icon('zoomIn'), onclick: () => setZoom(R.zoom + .25) }),
      h('button', { class: 'btn icon ghost', title: t('reader.tint'), html: icon('sun'), onclick: () => cycleTint() }),
      h('button', { class: 'btn icon ghost', title: lang() === 'en' ? 'Full-page reading' : 'Čtení na celou plochu', html: icon('maximize'), onclick: () => immersive(true) }),
      h('button', { class: 'btn small', html: icon('file') + `<span>${t('reader.open')}</span>`, onclick: () => openPdf() }));
    const stage = h('div', { class: 'rd-stage' });
    const bookEl = h('div', { class: 'rd-book' });
    const desk = h('div', { class: 'rd-desk' }, bookEl);
    stage.append(desk);
    const prevBtn = h('button', { class: 'rd-nav prev', html: icon('left'), 'aria-label': t('prev'), onclick: () => flip(-1) });
    const nextBtn = h('button', { class: 'rd-nav next', html: icon('right'), 'aria-label': t('next'), onclick: () => flip(1) });
    const loading = h('div', { class: 'rd-loading' }, h('div', { class: 'rd-spinner' }), t('reader.loading'));
    const scrub = h('input', { type: 'range', class: 'range rd-scrub', min: 1, max: 1, value: 1 });
    const bubble = h('div', { class: 'rd-bubble' });
    const toolbar = new InkToolbar({ getSurface: () => R.lastSurface });
    const bottom = h('div', { class: 'rd-bottom' }, h('div', { class: 'rd-scrub-wrap' }, scrub, bubble), toolbar.el);
    const panel = h('aside', { class: 'rd-panel' });
    const dropHint = h('div', { class: 'rd-drop' }, h('div', { html: icon('upload') }), t('reader.drop'));
    root.append(top, stage, prevBtn, nextBtn, bottom, panel, loading, dropHint);
    root.classList.add('tint-' + (profile.readerTint || 'white'));

    // ---------- load ----------
    const src = await loadBookSource();
    R.src = src;
    titleEl.textContent = src.name;
    let doc;
    try {
      doc = await pdfjsLib.getDocument({ data: new Uint8Array(src.data.slice(0)), isEvalSupported: false }).promise;
    } catch (e) {
      loading.innerHTML = '';
      loading.append(h('div', {}, '⚠️ PDF se nepodařilo otevřít.'), h('code', {}, String(e.message || e)));
      if (src.user) loading.append(h('button', { class: 'btn', onclick: async () => { await store.del('book:user'); location.reload(); } }, t('reader.useSample')));
      return;
    }
    R.doc = doc;
    R.n = doc.numPages;
    const p1 = await doc.getPage(1);
    const vp = p1.getViewport({ scale: 1 });
    R.aspect = vp.width / vp.height;
    R.inkH = INK_W / R.aspect;
    const stateKey = 'reader:' + src.id;
    R.state = (await store.get(stateKey)) || { page: 0, bookmarks: [], zoom: 1 };
    R.zoom = R.state.zoom || 1;
    const saveState = () => saveLater(stateKey, () => R.state, 400);
    scrub.max = R.n;
    if (query?.page) R.state.page = clamp(parseInt(query.page, 10) - 1, 0, R.n - 1);
    R.cur = clamp(R.state.page, 0, R.n - 1);
    loading.remove();

    // ---------- ink cache ----------
    const inkCache = new Map();
    async function getInk(i) {
      if (!inkCache.has(i)) inkCache.set(i, (await store.get(`ink:${src.id}:${i}`)) || []);
      return inkCache.get(i);
    }
    const saveInk = (i) => saveLater(`ink:${src.id}:${i}`, () => inkCache.get(i) || [], 500);

    // ---------- page bitmap cache ----------
    const cache = new Map();
    function bitmap(i) {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.min(2600, Math.round(R.pageW * dpr));
      const key = i + '@' + w;
      if (cache.has(key)) { const v = cache.get(key); cache.delete(key); cache.set(key, v); return v; }
      const p = (async () => {
        const page = await doc.getPage(i + 1);
        const v1 = page.getViewport({ scale: 1 });
        const vp2 = page.getViewport({ scale: w / v1.width });
        const c = document.createElement('canvas');
        c.width = Math.round(vp2.width); c.height = Math.round(vp2.height);
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp2 }).promise;
        return c;
      })();
      cache.set(key, p);
      while (cache.size > 14) cache.delete(cache.keys().next().value);
      return p;
    }

    // ---------- layout ----------
    function layout() {
      const imm = root.classList.contains('immersive');
      const sw = stage.clientWidth - (imm ? 32 : 48), sh = stage.clientHeight - (imm ? 20 : 36);
      R.spread = sw > 820 && sw / sh > R.aspect * 1.45;
      let ph = Math.min(sh, sw / (R.aspect * (R.spread ? 2 : 1)));
      ph = Math.max(200, ph) * R.zoom;
      R.pageH = Math.round(ph); R.pageW = Math.round(ph * R.aspect);
      bookEl.style.width = (R.spread ? 2 * R.pageW : R.pageW) + 'px';
      bookEl.style.height = R.pageH + 'px';
      bookEl.classList.toggle('spread', R.spread);
      bookEl.classList.toggle('single', !R.spread);
      root.classList.toggle('zoomed', R.zoom > 1.01);
      desk.style.minWidth = (R.spread ? 2 * R.pageW : R.pageW) + (imm ? 32 : 48) + 'px';
      desk.style.minHeight = R.pageH + (imm ? 20 : 36) + 'px';
    }
    const spreadOf = p => Math.floor((p + 1) / 2);
    function slotsFor(p) {
      if (!R.spread) return [p];
      const s = spreadOf(p);
      const L = 2 * s - 1, Rr = 2 * s;
      return [L >= 0 ? L : null, Rr < R.n ? Rr : null];
    }

    // ---------- page elements ----------
    const surfaces = [];
    function makePage(i, side) {
      const pg = h('div', { class: `rd-page ${side}` + (i == null ? ' empty' : '') });
      if (i == null) return pg;
      const cv = h('canvas', { class: 'pdf' });
      const inkHost = h('div', { class: 'rd-ink' });
      pg.append(cv, inkHost, h('div', { class: 'rd-curve' }));
      if (R.state.bookmarks.includes(i)) pg.append(h('div', { class: 'rd-ribbon' }));
      pg.dataset.page = i;
      bitmap(i).then(bm => {
        cv.width = bm.width; cv.height = bm.height;
        cv.getContext('2d').drawImage(bm, 0, 0);
        pg.classList.add('ready');
      });
      return pg;
    }
    async function attachInk(pg) {
      const i = +pg.dataset.page;
      if (Number.isNaN(i)) return;
      const strokes = await getInk(i);
      const host = pg.querySelector('.rd-ink');
      if (!host) return;
      const s = new InkSurface(host, { width: INK_W, height: R.inkH, strokes, blend: true, dark: () => profile.readerTint === 'night',
        onChange: () => { inkCache.set(i, s.strokes); saveInk(i); R.lastSurface = s; },
        onTouch: (phase, e) => { if (phase === 'start') dragStart(e); else if (phase === 'move') dragMove(e); else dragEnd(e); return true; } });
      s.page = i;
      surfaces.push(s);
      if (!R.lastSurface) R.lastSurface = s;
    }
    function clearSurfaces() { while (surfaces.length) surfaces.pop().destroy(); R.lastSurface = null; }

    function render() {
      clearSurfaces();
      bookEl.innerHTML = '';
      const slots = slotsFor(R.cur);
      const sides = R.spread ? ['left', 'right'] : ['single'];
      const pages = slots.map((i, k) => makePage(i, sides[k]));
      // page-stack edges (thicker on the side with more pages)
      const frac = R.n > 1 ? R.cur / (R.n - 1) : 0;
      bookEl.style.setProperty('--left-stack', (2 + frac * 10).toFixed(1) + 'px');
      bookEl.style.setProperty('--right-stack', (2 + (1 - frac) * 10).toFixed(1) + 'px');
      bookEl.append(h('div', { class: 'rd-edges' }), ...pages);
      if (R.spread) bookEl.append(h('div', { class: 'rd-spine' }));
      pages.forEach(attachInk);
      updateChrome();
      // prefetch neighbours
      for (const d of [1, 2, 3, -1, -2]) { const j = R.cur + d; if (j >= 0 && j < R.n) bitmap(j); }
    }
    function updateChrome() {
      const slots = slotsFor(R.cur).filter(x => x != null);
      pageInfo.textContent = slots.length > 1 ? `${slots[0] + 1}–${slots[1] + 1} / ${R.n}` : `${(slots[0] ?? 0) + 1} / ${R.n}`;
      scrub.value = R.cur + 1;
      const marked = slots.some(i => R.state.bookmarks.includes(i));
      bmBtn.classList.toggle('on', marked);
      prevBtn.disabled = !canFlip(-1);
      nextBtn.disabled = !canFlip(1);
      R.state.page = R.cur; saveState();
    }
    function canFlip(dir) {
      if (R.spread) { const s = spreadOf(R.cur); return dir > 0 ? 2 * s + 1 < R.n : s > 0; }
      return dir > 0 ? R.cur + 1 < R.n : R.cur > 0;
    }
    function targetOf(dir) {
      if (R.spread) { const s = spreadOf(R.cur) + dir; return Math.max(0, 2 * s - 1); }
      return R.cur + dir;
    }

    // ---------- face rendering for the turning leaf ----------
    async function face(i) {
      const c = h('canvas', { class: 'pdf' });
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(R.pageW * dpr); c.height = Math.round(R.pageH * dpr);
      if (i == null) return c;
      const [bm, strokes] = await Promise.all([bitmap(i), getInk(i)]);
      const ctx = c.getContext('2d');
      ctx.drawImage(bm, 0, 0, c.width, c.height);
      ctx.save(); ctx.scale(c.width / INK_W, c.height / R.inkH);
      ctx.globalCompositeOperation = 'multiply';
      drawStrokes(ctx, strokes, false);
      ctx.restore();
      return c;
    }

    // ---------- flipping ----------
    let session = null;
    async function startFlip(dir) {
      if (session || !canFlip(dir)) return null;
      const from = slotsFor(R.cur);
      const target = targetOf(dir);
      const to = slotsFor(target);
      let frontI, backI, side;
      if (R.spread) {
        if (dir > 0) { frontI = from[1]; backI = to[0]; side = 'right'; }
        else { frontI = from[0]; backI = to[1]; side = 'left'; }
      } else {
        if (dir > 0) { frontI = from[0]; backI = null; side = 'single'; }
        else { frontI = null; backI = to[0]; side = 'single'; }
      }
      const sess = { dir, target, p: 0, ready: false };
      session = sess;
      const [fc, bc] = await Promise.all([face(frontI), face(backI)]);
      // page underneath
      const under = R.spread ? (dir > 0 ? to[1] : to[0]) : (dir > 0 ? to[0] : from[0]);
      const slotSel = R.spread ? (dir > 0 ? '.rd-page.right' : '.rd-page.left') : '.rd-page.single';
      const old = bookEl.querySelector(slotSel);
      const underEl = makePage(under, R.spread ? (dir > 0 ? 'right' : 'left') : 'single');
      if (old) { old.replaceWith(underEl); }
      const leaf = h('div', { class: `rd-leaf ${side} ${dir > 0 ? 'fwd' : 'back'}` });
      const ff = h('div', { class: 'rd-face front' }, fc, h('div', { class: 'rd-shade' }));
      const bf = h('div', { class: 'rd-face back' }, bc, h('div', { class: 'rd-shade' }));
      if (backI == null && !R.spread) bf.classList.add('blank');
      if (frontI == null && !R.spread) ff.classList.add('blank');
      leaf.append(ff, bf);
      const shadow = h('div', { class: `rd-castshadow ${R.spread ? (dir > 0 ? 'right' : 'left') : 'single'}` });
      bookEl.append(shadow, leaf);
      Object.assign(sess, { leaf, shadow, underEl, ready: true });
      setProgress(sess, sess.p);
      sound.flip();
      return sess;
    }
    function setProgress(sess, p) {
      sess.p = p;
      if (!sess.ready) return;
      const back = sess.dir < 0;
      let ang;
      if (R.spread) ang = back ? 180 * p : -180 * p;
      else ang = back ? -180 + 180 * p : -180 * p;
      const lift = Math.sin(Math.abs(ang) * Math.PI / 180);
      sess.leaf.style.transform = `rotateY(${ang}deg) translateZ(${lift * 2}px)`;
      sess.leaf.style.setProperty('--shade', (lift * .45).toFixed(3));
      sess.leaf.style.setProperty('--lift', lift.toFixed(3));
      sess.shadow.style.opacity = (R.spread ? lift : (back ? p : 1 - p) * .9).toFixed(3);
      if (!R.spread) sess.leaf.style.opacity = Math.abs(ang) > 150 ? (180 - Math.abs(ang)) / 30 : 1;
    }
    function animateTo(sess, goal, ms) {
      return new Promise(res => {
        const p0 = sess.p, t0 = performance.now();
        const dur = ms * Math.abs(goal - p0) + 60;
        const step = now => {
          const k = Math.min(1, (now - t0) / dur);
          const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          setProgress(sess, p0 + (goal - p0) * e);
          if (k < 1) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
      });
    }
    async function finishFlip(sess, complete) {
      await animateTo(sess, complete ? 1 : 0, 620);
      if (complete) R.cur = sess.target;
      session = null;
      render();
    }
    async function flip(dir) {
      if (session) return;
      if (!canFlip(dir)) { bookEl.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-dir * 10}px)` }, { transform: 'translateX(0)' }], { duration: 300 }); return; }
      const sess = await startFlip(dir);
      if (sess) await finishFlip(sess, true);
    }
    async function goTo(p, animateFade = true) {
      p = clamp(p, 0, R.n - 1);
      if (session) return;
      const same = slotsFor(p).join() === slotsFor(R.cur).join();
      if (same) { R.cur = p; updateChrome(); return; }
      if (Math.abs(p - R.cur) <= (R.spread ? 2 : 1)) return flip(p > R.cur ? 1 : -1);
      R.cur = p;
      if (animateFade) { bookEl.classList.add('jump'); await sleep(160); }
      render();
      if (animateFade) { sound.flip(); requestAnimationFrame(() => bookEl.classList.remove('jump')); }
    }

    // ---------- drag to turn ----------
    let drag = null;
    function dragStart(e) {
      if (session || R.zoom > 1.01) return;
      const r = bookEl.getBoundingClientRect();
      const rel = (e.clientX - r.left) / r.width;
      let dir = 0;
      if (R.spread) dir = rel > .5 ? 1 : -1; else dir = rel > .55 ? 1 : rel < .45 ? -1 : 0;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), dir, rel, sess: null, starting: false, hist: [] };
    }
    async function dragMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag.hist.push([performance.now(), e.clientX]); if (drag.hist.length > 6) drag.hist.shift();
      if (!drag.sess && !drag.starting && Math.abs(dx) > 14 && drag.dir && Math.sign(dx) === -drag.dir) {
        drag.starting = true;
        drag.sess = await startFlip(drag.dir);
        if (!drag) return;
        drag.starting = false;
        if (!drag.sess) { drag = null; return; }
      }
      if (drag.sess) {
        const span = R.pageW * (R.spread ? 1.7 : 1.3);
        setProgress(drag.sess, clamp(-dx * drag.dir / span, 0, 1));
      }
    }
    function dragEnd(e) {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.sess) {
        const h0 = d.hist[0], h1 = d.hist[d.hist.length - 1];
        const v = h0 && h1 && h1[0] > h0[0] ? (h1[1] - h0[1]) / (h1[0] - h0[0]) : 0;
        const fling = -v * d.dir > .45;
        finishFlip(d.sess, d.sess.p > .33 || fling);
      } else if (Math.abs(e.clientX - d.x) < 8 && performance.now() - d.t < 400) {
        // tap on the outer edge → turn, tap in the middle → show/hide toolbars
        if (R.spread ? d.rel > .78 : d.rel > .7) flip(1);
        else if (R.spread ? d.rel < .22 : d.rel < .3) flip(-1);
        else if (inkState.tool === 'hand') immersive(!root.classList.contains('immersive'));
      }
    }
    bookEl.addEventListener('pointerdown', e => {
      if (e.target.closest('.ink-layer') && inkState.tool !== 'hand') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      bookEl.setPointerCapture(e.pointerId);
      dragStart(e);
    });
    bookEl.addEventListener('pointermove', dragMove);
    bookEl.addEventListener('pointerup', dragEnd);
    bookEl.addEventListener('pointercancel', dragEnd);

    // wheel & keys
    let wheelLock = 0;
    stage.addEventListener('wheel', e => {
      if (e.ctrlKey) { e.preventDefault(); setZoom(R.zoom + (e.deltaY < 0 ? .1 : -.1)); return; }
      if (R.zoom > 1.01) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock || Math.abs(e.deltaY) + Math.abs(e.deltaX) < 12) return;
      wheelLock = now + 650;
      flip((e.deltaY || e.deltaX) > 0 ? 1 : -1);
    }, { passive: false });
    const onKey = e => {
      if (e.target.closest('input, textarea, select')) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); flip(1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); flip(-1); }
      else if (e.key === 'Home') goTo(0); else if (e.key === 'End') goTo(R.n - 1);
      else if (e.key === 'b') toggleBookmark();
      else if (e.key === 'Escape' && root.classList.contains('immersive')) immersive(false);
    };
    window.addEventListener('keydown', onKey);
    R.cleanup.push(() => window.removeEventListener('keydown', onKey));

    // scrubber
    scrub.addEventListener('input', () => {
      bubble.textContent = `${t('page')} ${scrub.value}`;
      bubble.style.left = ((scrub.value - 1) / Math.max(1, R.n - 1) * 100) + '%';
      bubble.classList.add('on');
    });
    scrub.addEventListener('change', () => { bubble.classList.remove('on'); goTo(scrub.value - 1); });

    // full-page reading (hides the bars, bigger book)
    function immersive(on) {
      root.classList.toggle('immersive', on);
      if (on) toast(lang() === 'en' ? 'Tap the middle of the page to show the toolbars' : 'Klepnutím doprostřed stránky se lišty zase ukážou', 2200);
      requestAnimationFrame(() => { layout(); render(); });
    }
    // zoom
    function setZoom(z) {
      R.zoom = clamp(Math.round(z * 100) / 100, 1, 3);
      R.state.zoom = R.zoom; saveState();
      layout(); render();
    }
    // tint
    function cycleTint() {
      const order = ['white', 'sepia', 'night'];
      root.classList.remove('tint-' + profile.readerTint);
      profile.readerTint = order[(order.indexOf(profile.readerTint) + 1) % 3];
      root.classList.add('tint-' + profile.readerTint);
      saveProfile();
      surfaces.forEach(s => s.redraw());
      toast({ white: '📄 Bílý papír', sepia: '📜 Sépiový papír', night: '🌙 Noční režim' }[profile.readerTint]);
    }
    // bookmarks
    function toggleBookmark() {
      const slots = slotsFor(R.cur).filter(x => x != null);
      const marked = slots.filter(i => R.state.bookmarks.includes(i));
      if (marked.length) R.state.bookmarks = R.state.bookmarks.filter(i => !marked.includes(i));
      else R.state.bookmarks.push(R.spread && slots.length > 1 ? slots[0] : slots[0]);
      R.state.bookmarks.sort((a, b) => a - b);
      saveState(); render();
      if (panel.classList.contains('open')) fillPanel();
    }
    bmBtn.onclick = toggleBookmark;

    // side panel (contents + bookmarks)
    let outline = null;
    async function fillPanel() {
      panel.innerHTML = '';
      panel.append(h('div', { class: 'rd-panel-head' }, h('h3', { class: 'display' }, src.name), h('button', { class: 'btn icon ghost', html: icon('x'), onclick: () => togglePanel(false) })));
      const sec1 = h('div', { class: 'rd-psec' }, h('div', { class: 'eyebrow' }, t('reader.toc')));
      if (outline === null) {
        try {
          const raw = await doc.getOutline();
          outline = [];
          const walk = async (items, depth) => {
            for (const it of items || []) {
              let page = null;
              try {
                const dest = typeof it.dest === 'string' ? await doc.getDestination(it.dest) : it.dest;
                if (dest) page = await doc.getPageIndex(dest[0]);
              } catch (e) { /* ignore */ }
              outline.push({ title: it.title, page, depth });
              if (depth < 2) await walk(it.items, depth + 1);
            }
          };
          await walk(raw, 0);
        } catch (e) { outline = []; }
      }
      if (!outline.length) sec1.append(h('p', { class: 'muted small' }, t('reader.noOutline')));
      outline.forEach(o => sec1.append(h('button', { class: 'rd-toc-item', style: { paddingLeft: 14 + o.depth * 16 + 'px' }, onclick: () => { if (o.page != null) { goTo(o.page); togglePanel(false); } } }, h('span', {}, o.title), h('small', {}, o.page != null ? String(o.page + 1) : ''))));
      const sec2 = h('div', { class: 'rd-psec' }, h('div', { class: 'eyebrow' }, t('reader.bookmarks')));
      if (!R.state.bookmarks.length) sec2.append(h('p', { class: 'muted small' }, t('reader.noBookmarks')));
      R.state.bookmarks.forEach(i => sec2.append(h('button', { class: 'rd-toc-item bm', onclick: () => { goTo(i); togglePanel(false); } }, h('span', { html: icon('bookmark') + ` ${t('page')} ${i + 1}` }))));
      const sec3 = h('div', { class: 'rd-psec' }, h('div', { class: 'eyebrow' }, lang() === 'en' ? 'Lessons' : 'Lekce'),
        h('button', { class: 'btn small soft', onclick: () => { profile.sectionPages['1-1'] = R.cur + 1; saveProfile(); toast('✓ ' + t('reader.setStart')); } }, t('reader.setStart')),
        h('a', { class: 'btn small', href: '#/lesson/1-1', html: icon('lesson') + '<span>1.1</span>' }));
      panel.append(sec1, sec2, sec3);
      if (src.user) panel.append(h('div', { class: 'rd-psec' }, h('button', { class: 'btn small ghost', onclick: async () => { await store.del('book:user'); location.hash = '#/reader'; location.reload(); } }, t('reader.useSample'))));
    }
    function togglePanel(force) {
      const open = force ?? !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      if (open) fillPanel();
    }

    // open PDF (file picker or drag & drop)
    async function useFile(file) {
      if (!file || !/pdf$/i.test(file.type || file.name)) return;
      const data = await file.arrayBuffer();
      await store.set('book:user', { name: file.name, size: file.size, data, added: Date.now() });
      toast('📖 ' + file.name);
      await flushSaves();
      location.hash = '#/reader';
      location.reload();
    }
    async function openPdf() { useFile(await pickFile('application/pdf')); }
    root.addEventListener('dragover', e => { e.preventDefault(); root.classList.add('dragging'); });
    root.addEventListener('dragleave', e => { if (e.target === root || !root.contains(e.relatedTarget)) root.classList.remove('dragging'); });
    root.addEventListener('drop', e => { e.preventDefault(); root.classList.remove('dragging'); useFile(e.dataTransfer.files[0]); });

    // ink tool changes: switch touch-action / pointer behaviour
    R.cleanup.push(onInk(() => bookEl.classList.toggle('drawing', inkState.tool !== 'hand')));

    // resize
    const ro = new ResizeObserver(() => { if (session) return; const sp = R.spread, pw = R.pageW; layout(); if (sp !== R.spread || Math.abs(pw - R.pageW) > 4) render(); });
    ro.observe(stage);
    R.cleanup.push(() => ro.disconnect());

    layout();
    render();
    if (query?.section && !src.user) toast(lang() === 'en' ? `📖 Section ${query.section.replace('-', '.')} in the book` : `📖 Část ${query.section.replace('-', '.')} v knize`);

    return () => {
      R.cleanup.forEach(f => f());
      clearSurfaces();
      toolbar.destroy();
      doc.destroy();
      inkState.tool = 'pen';
    };
  },
};
