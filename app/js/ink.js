// Inkoustový engine: psaní perem s tlakem, zvýrazňovač, guma, pravítko, zpět/znovu.
import { getStroke } from '../vendor/perfect-freehand.js';
import { profile, saveProfile } from './store.js';
import { h, clamp } from './util.js';
import { icon } from './icons.js';
import { t } from './i18n.js';

export const PEN_COLORS = ['#1f2430', '#2f62d8', '#d4483f', '#23935f', '#7a55d0', '#e8794a'];
export const HL_COLORS = ['#ffd84d', '#7ee0a3', '#ff9ec7', '#8cc8ff'];
export const PEN_SIZES = [2, 3.4, 5.6];
export const HL_SIZES = [14, 22, 32];
const ERASER_R = [8, 14, 24];

// ---------- shared tool state ----------
export const inkState = {
  get tool() { return profile.ink.tool; },
  set tool(v) { profile.ink.tool = v; saveProfile(); emit(); },
  get color() { return profile.ink.color; },
  set color(v) { profile.ink.color = v; saveProfile(); emit(); },
  get hlColor() { return profile.ink.hlColor; },
  set hlColor(v) { profile.ink.hlColor = v; saveProfile(); emit(); },
  get size() { return profile.ink.size ?? 1; },
  set size(v) { profile.ink.size = v; saveProfile(); emit(); },
};
const subs = new Set();
function emit() {
  document.body.dataset.inkTool = profile.ink.tool;
  subs.forEach(f => f());
}
export function onInk(fn) { subs.add(fn); return () => subs.delete(fn); }
export function setTool(tool) { inkState.tool = tool; }
document.body.dataset.inkTool = profile.ink?.tool || 'pen';

let activeSurface = null;
export const getActiveSurface = () => activeSurface;

// ---------- stroke rendering ----------
const pathCache = new WeakMap();
function outlineToPath(pts) {
  const p = new Path2D();
  if (pts.length < 2) return p;
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    p.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  p.closePath();
  return p;
}
function strokePath(s) {
  let p = pathCache.get(s);
  if (p) return p;
  if (s.t === 'line') {
    p = new Path2D();
    p.moveTo(s.p[0][0], s.p[0][1]);
    p.lineTo(s.p[1][0], s.p[1][1]);
  } else {
    const opts = s.t === 'hl'
      ? { size: s.w, thinning: 0, smoothing: .55, streamline: .5, simulatePressure: false, start: { cap: true }, end: { cap: true } }
      : { size: s.w, thinning: s.pen ? .62 : .5, smoothing: .55, streamline: .42, simulatePressure: !s.pen, last: true };
    p = outlineToPath(getStroke(s.p, opts));
  }
  pathCache.set(s, p);
  return p;
}
function displayColor(c, dark) {
  if (dark && (c === '#1f2430' || c === '#000000')) return '#eef0f5';
  return c;
}
export function drawStroke(ctx, s, dark = false) {
  const p = strokePath(s);
  ctx.save();
  if (s.t === 'hl') {
    ctx.globalAlpha = dark ? .35 : .45;
    ctx.fillStyle = s.c;
    ctx.fill(p);
  } else if (s.t === 'line') {
    ctx.strokeStyle = displayColor(s.c, dark);
    ctx.lineWidth = s.w;
    ctx.lineCap = 'round';
    ctx.stroke(p);
  } else {
    ctx.fillStyle = displayColor(s.c, dark);
    ctx.fill(p);
  }
  ctx.restore();
}
export function drawStrokes(ctx, strokes, dark = false) {
  for (const s of strokes) if (s.t === 'hl') drawStroke(ctx, s, dark);
  for (const s of strokes) if (s.t !== 'hl') drawStroke(ctx, s, dark);
}

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let tt = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  tt = clamp(tt, 0, 1);
  return Math.hypot(px - (ax + tt * dx), py - (ay + tt * dy));
}
function strokeBBox(s) {
  if (s._bb) return s._bb;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of s.p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const pad = s.w / 2 + 2;
  Object.defineProperty(s, '_bb', { value: [x0 - pad, y0 - pad, x1 + pad, y1 + pad], enumerable: false, configurable: true });
  return s._bb;
}
function hitStroke(s, x, y, r) {
  const [x0, y0, x1, y1] = strokeBBox(s);
  if (x < x0 - r || x > x1 + r || y < y0 - r || y > y1 + r) return false;
  const rr = r + s.w / 2;
  const pts = s.p;
  if (pts.length === 1) return Math.hypot(pts[0][0] - x, pts[0][1] - y) < rr;
  for (let i = 1; i < pts.length; i++) if (distToSeg(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) < rr) return true;
  return false;
}

function findScrollParent(el) {
  let n = el?.parentElement;
  while (n && n !== document.body) {
    const st = getComputedStyle(n);
    if (/(auto|scroll)/.test(st.overflowY + st.overflowX) && (n.scrollHeight > n.clientHeight || n.scrollWidth > n.clientWidth)) return n;
    n = n.parentElement;
  }
  return null;
}

// ---------- InkSurface ----------
export class InkSurface {
  constructor(host, { width = 1000, height = 1414, strokes = [], onChange, onTouch, dark = () => document.documentElement.dataset.theme === 'dark', blend = false } = {}) {
    this.host = host;
    this.W = width; this.H = height;
    this.strokes = strokes;
    this.onChange = onChange;
    this.onTouch = onTouch;
    this.dark = dark;
    this.undoStack = []; this.redoStack = [];
    this.cur = null;
    this.canvas = h('canvas', { class: 'ink-layer' + (blend ? ' blend' : '') });
    this.live = h('canvas', { class: 'ink-live' });
    host.append(this.canvas, this.live);
    this.ctx = this.canvas.getContext('2d');
    this.lctx = this.live.getContext('2d');
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this._down = e => this.down(e);
    this._move = e => this.move(e);
    this._up = e => this.up(e);
    this.canvas.addEventListener('pointerdown', this._down);
    this.canvas.addEventListener('pointermove', this._move);
    this.canvas.addEventListener('pointerup', this._up);
    this.canvas.addEventListener('pointercancel', this._up);
    this.canvas.addEventListener('pointerleave', () => { if (!this.cur) this.clearLive(); });
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    this.resize();
  }
  resize() {
    const r = this.host.getBoundingClientRect();
    const cw = this.host.clientWidth, ch = this.host.clientHeight;
    if (!cw || !ch) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    for (const c of [this.canvas, this.live]) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); }
    this.scale = cw / this.W;
    this.dpr = dpr;
    this.redraw();
    void r;
  }
  setTransform(ctx) { ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, 0, 0); }
  redraw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setTransform(ctx);
    drawStrokes(ctx, this.strokes, this.dark());
  }
  setStrokes(strokes) { this.strokes = strokes; this.undoStack = []; this.redoStack = []; this.redraw(); }
  clearLive() { this.lctx.setTransform(1, 0, 0, 1, 0, 0); this.lctx.clearRect(0, 0, this.live.width, this.live.height); }
  local(e) {
    const r = this.canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * this.W, (e.clientY - r.top) / r.height * this.H];
  }
  changed() { this.onChange?.(this.strokes); }

  down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const tool = inkState.tool;
    if (tool === 'hand') return;
    // Finger while "pen only" → scroll / gesture instead of drawing
    if (e.pointerType === 'touch' && profile.penOnly) {
      this.pan = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, el: findScrollParent(this.host) };
      this.canvas.setPointerCapture(e.pointerId);
      this.onTouch?.('start', e);
      return;
    }
    if (this.cur) {
      // second finger: cancel the stroke, treat as a pan
      if (e.pointerType === 'touch' && this.cur.type === 'touch') { this.cur = null; this.clearLive(); this.pan = { id: e.pointerId, x: e.clientX, y: e.clientY, el: findScrollParent(this.host) }; }
      return;
    }
    e.preventDefault();
    activeSurface = this;
    this.canvas.setPointerCapture(e.pointerId);
    const [x, y] = this.local(e);
    const isPen = e.pointerType === 'pen';
    const pr = isPen ? (e.pressure || .5) : .5;
    this.cur = { id: e.pointerId, type: e.pointerType, tool };
    if (tool === 'eraser') {
      this.cur.erased = [];
      this.eraseAt(x, y);
    } else if (tool === 'line') {
      this.cur.stroke = { t: 'line', c: inkState.color, w: PEN_SIZES[inkState.size], p: [[x, y], [x, y]] };
    } else {
      const hl = tool === 'hl';
      this.cur.stroke = { t: hl ? 'hl' : 'pen', c: hl ? inkState.hlColor : inkState.color, w: (hl ? HL_SIZES : PEN_SIZES)[inkState.size], pen: isPen, p: [[x, y, pr]] };
    }
    this.drawLive();
  }
  move(e) {
    if (this.pan && e.pointerId === this.pan.id) {
      const dx = e.clientX - this.pan.x, dy = e.clientY - this.pan.y;
      this.pan.x = e.clientX; this.pan.y = e.clientY;
      if (this.onTouch?.('move', e, dx, dy) !== true && this.pan.el) { this.pan.el.scrollTop -= dy; this.pan.el.scrollLeft -= dx; }
      return;
    }
    if (!this.cur) {
      if (inkState.tool === 'eraser' && e.pointerType !== 'touch') this.drawEraserCursor(...this.local(e));
      return;
    }
    if (e.pointerId !== this.cur.id) return;
    const evs = e.getCoalescedEvents?.() || [e];
    const tool = this.cur.tool;
    for (const ev of evs.length ? evs : [e]) {
      const [x, y] = this.local(ev);
      if (tool === 'eraser') { this.eraseAt(x, y); continue; }
      const s = this.cur.stroke;
      if (tool === 'line') {
        let [x0, y0] = s.p[0];
        let nx = x, ny = y;
        const ang = Math.atan2(ny - y0, nx - x0) * 180 / Math.PI;
        const snap = [-180, -90, 0, 90, 180].find(a => Math.abs(ang - a) < 4);
        if (snap !== undefined) { if (snap === 90 || snap === -90) nx = x0; else ny = y0; }
        s.p[1] = [nx, ny];
      } else {
        const last = s.p[s.p.length - 1];
        if (Math.hypot(x - last[0], y - last[1]) < .35) continue;
        s.p.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10, s.pen ? (ev.pressure || .5) : .5]);
      }
    }
    this.drawLive();
  }
  up(e) {
    if (this.pan && e.pointerId === this.pan.id) {
      const pan = this.pan; this.pan = null;
      this.onTouch?.('end', e, e.clientX - (pan.sx ?? pan.x), e.clientY - (pan.sy ?? pan.y));
      return;
    }
    if (!this.cur || e.pointerId !== this.cur.id) return;
    const cur = this.cur; this.cur = null;
    this.clearLive();
    if (cur.tool === 'eraser') {
      if (cur.erased.length) { this.undoStack.push({ type: 'erase', items: cur.erased }); this.redoStack = []; this.changed(); }
      return;
    }
    const s = cur.stroke;
    if (s.t === 'line' && Math.hypot(s.p[1][0] - s.p[0][0], s.p[1][1] - s.p[0][1]) < 2) return;
    this.strokes.push(s);
    this.undoStack.push({ type: 'add', stroke: s });
    this.redoStack = [];
    if (s.t === 'hl') this.redraw(); else { this.setTransform(this.ctx); drawStroke(this.ctx, s, this.dark()); }
    this.changed();
  }
  eraseAt(x, y) {
    const r = ERASER_R[inkState.size];
    for (let i = this.strokes.length - 1; i >= 0; i--) {
      const s = this.strokes[i];
      if (hitStroke(s, x, y, r)) {
        this.strokes.splice(i, 1);
        this.cur.erased.push({ stroke: s, index: i });
      }
    }
    if (this.cur.erased.length !== this.cur.lastCount) { this.cur.lastCount = this.cur.erased.length; this.redraw(); }
    this.drawEraserCursor(x, y);
  }
  drawEraserCursor(x, y) {
    this.clearLive();
    const c = this.lctx; this.setTransform(c);
    c.beginPath(); c.arc(x, y, ERASER_R[inkState.size], 0, Math.PI * 2);
    c.fillStyle = 'rgba(128,128,128,.12)'; c.fill();
    c.lineWidth = 1.2 / this.scale; c.strokeStyle = 'rgba(100,100,100,.7)'; c.stroke();
  }
  drawLive() {
    if (!this.cur || this.cur.tool === 'eraser') return;
    this.clearLive();
    this.setTransform(this.lctx);
    pathCache.delete(this.cur.stroke);
    drawStroke(this.lctx, this.cur.stroke, this.dark());
  }
  undo() {
    const op = this.undoStack.pop();
    if (!op) return false;
    if (op.type === 'add') { const i = this.strokes.lastIndexOf(op.stroke); if (i >= 0) this.strokes.splice(i, 1); }
    else if (op.type === 'erase') { for (const it of [...op.items].reverse()) this.strokes.splice(Math.min(it.index, this.strokes.length), 0, it.stroke); }
    else if (op.type === 'clear') { this.strokes.push(...op.strokes); }
    this.redoStack.push(op);
    this.redraw(); this.changed();
    return true;
  }
  redo() {
    const op = this.redoStack.pop();
    if (!op) return false;
    if (op.type === 'add') this.strokes.push(op.stroke);
    else if (op.type === 'erase') { for (const it of op.items) { const i = this.strokes.indexOf(it.stroke); if (i >= 0) this.strokes.splice(i, 1); } }
    else if (op.type === 'clear') { this.strokes.length = 0; }
    this.undoStack.push(op);
    this.redraw(); this.changed();
    return true;
  }
  clear() {
    if (!this.strokes.length) return;
    this.undoStack.push({ type: 'clear', strokes: [...this.strokes] });
    this.strokes.length = 0;
    this.redraw(); this.changed();
  }
  focus() { activeSurface = this; }
  destroy() {
    this.ro.disconnect();
    if (activeSurface === this) activeSurface = null;
    this.canvas.remove(); this.live.remove();
  }
}

// Ctrl+Z / Ctrl+Y on the last used surface
window.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.target.closest?.('input, textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { if (activeSurface?.undo()) e.preventDefault(); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { if (activeSurface?.redo()) e.preventDefault(); }
});

// ---------- Floating toolbar ----------
export class InkToolbar {
  constructor({ tools = ['hand', 'pen', 'hl', 'eraser', 'line'], extra = [], getSurface = () => activeSurface, clearable = true } = {}) {
    this.tools = tools;
    this.getSurface = getSurface;
    this.el = h('div', { class: 'inkbar' });
    this.extra = extra;
    this.clearable = clearable;
    this.render();
    this.off = onInk(() => this.render());
  }
  render() {
    const el = this.el;
    el.innerHTML = '';
    const tool = inkState.tool;
    const names = { hand: ['hand', 'ink.hand'], pen: ['pen', 'ink.pen'], hl: ['highlighter', 'ink.hl'], eraser: ['eraser', 'ink.eraser'], line: ['ruler', 'ink.line'] };
    const g1 = h('div', { class: 'inkbar-group' });
    for (const tl of this.tools) {
      const [ic, label] = names[tl];
      const b = h('button', { class: 'ink-btn' + (tool === tl ? ' on' : ''), title: t(label), 'aria-label': t(label), html: icon(ic) });
      if (tl === 'pen' || tl === 'line') b.style.setProperty('--tip', inkState.color);
      if (tl === 'hl') b.style.setProperty('--tip', inkState.hlColor);
      b.onclick = () => { inkState.tool = tl; };
      g1.append(b);
    }
    el.append(g1);
    if (tool !== 'hand') {
      el.append(h('div', { class: 'inkbar-sep' }));
      if (tool !== 'eraser') {
        const g2 = h('div', { class: 'inkbar-group colors' });
        const hl = tool === 'hl';
        for (const c of hl ? HL_COLORS : PEN_COLORS) {
          const cur = hl ? inkState.hlColor : inkState.color;
          const b = h('button', { class: 'swatch' + (cur === c ? ' on' : ''), style: { '--c': c }, 'aria-label': c });
          b.onclick = () => { if (hl) inkState.hlColor = c; else inkState.color = c; };
          g2.append(b);
        }
        el.append(g2, h('div', { class: 'inkbar-sep' }));
      }
      const g3 = h('div', { class: 'inkbar-group sizes' });
      [0, 1, 2].forEach(i => {
        const b = h('button', { class: 'size-btn' + (inkState.size === i ? ' on' : ''), 'aria-label': 'size ' + (i + 1) }, h('i', { style: { width: (6 + i * 5) + 'px', height: (6 + i * 5) + 'px' } }));
        b.onclick = () => { inkState.size = i; };
        g3.append(b);
      });
      el.append(g3);
    }
    el.append(h('div', { class: 'inkbar-sep' }));
    const g4 = h('div', { class: 'inkbar-group' });
    g4.append(
      h('button', { class: 'ink-btn', title: t('ink.undo'), html: icon('undo'), onclick: () => this.getSurface()?.undo() }),
      h('button', { class: 'ink-btn', title: t('ink.redo'), html: icon('redo'), onclick: () => this.getSurface()?.redo() }),
    );
    if (this.clearable) g4.append(h('button', { class: 'ink-btn', title: t('ink.clear'), html: icon('trash'), onclick: () => this.getSurface()?.clear() }));
    el.append(g4);
    if (this.extra.length) { el.append(h('div', { class: 'inkbar-sep' })); const g5 = h('div', { class: 'inkbar-group' }); g5.append(...this.extra); el.append(g5); }
  }
  destroy() { this.off(); this.el.remove(); }
}
