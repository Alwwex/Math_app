// Malá knihovna na kreslení grafů do SVG (souřadnice, mřížka, křivky, body, tažení).
const NS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, parent) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  parent?.append(el);
  return el;
}

function niceStep(range, px) {
  const target = range / (px / 46);
  const pow = 10 ** Math.floor(Math.log10(target));
  for (const m of [1, 2, 5, 10]) if (m * pow >= target) return m * pow;
  return 10 * pow;
}

export class Plot {
  constructor(container, { xmin = -5, xmax = 5, ymin = -5, ymax = 5, width = 560, height = 400, grid = true, labels = true, xlabel = 'x', ylabel = 'y', step, ystep, cls = '' } = {}) {
    Object.assign(this, { xmin, xmax, ymin, ymax, width, height });
    this.svg = s('svg', { viewBox: `0 0 ${width} ${height}`, class: 'plot ' + cls, preserveAspectRatio: 'xMidYMid meet' });
    container?.append(this.svg);
    this.gGrid = s('g', { class: 'p-grid' }, this.svg);
    this.gAxes = s('g', { class: 'p-axes' }, this.svg);
    this.gBack = s('g', { class: 'p-back' }, this.svg);
    this.gMain = s('g', { class: 'p-main' }, this.svg);
    this.gTop = s('g', { class: 'p-top' }, this.svg);
    const clipId = 'clip' + Math.random().toString(36).slice(2, 8);
    const defs = s('defs', {}, this.svg);
    const cp = s('clipPath', { id: clipId }, defs);
    s('rect', { x: 0, y: 0, width, height }, cp);
    this.gMain.setAttribute('clip-path', `url(#${clipId})`);
    this.gBack.setAttribute('clip-path', `url(#${clipId})`);
    this.step = step || niceStep(xmax - xmin, width);
    this.ystep = ystep || niceStep(ymax - ymin, height);
    if (grid) this.drawGrid(labels, xlabel, ylabel);
  }
  X(x) { return (x - this.xmin) / (this.xmax - this.xmin) * this.width; }
  Y(y) { return this.height - (y - this.ymin) / (this.ymax - this.ymin) * this.height; }
  ix(px) { return this.xmin + px / this.width * (this.xmax - this.xmin); }
  iy(py) { return this.ymin + (this.height - py) / this.height * (this.ymax - this.ymin); }
  drawGrid(labels, xlabel, ylabel) {
    const { xmin, xmax, ymin, ymax } = this;
    const st = this.step, sy = this.ystep;
    for (let x = Math.ceil(xmin / st) * st; x <= xmax + 1e-9; x += st) {
      if (Math.abs(x) < 1e-9) continue;
      s('line', { x1: this.X(x), x2: this.X(x), y1: 0, y2: this.height, class: 'gl' }, this.gGrid);
    }
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) {
      if (Math.abs(y) < 1e-9) continue;
      s('line', { y1: this.Y(y), y2: this.Y(y), x1: 0, x2: this.width, class: 'gl' }, this.gGrid);
    }
    const ax = this.gAxes;
    const y0 = Math.min(Math.max(this.Y(0), 0), this.height), x0 = Math.min(Math.max(this.X(0), 0), this.width);
    s('line', { x1: 0, x2: this.width - 2, y1: y0, y2: y0, class: 'axis' }, ax);
    s('line', { x1: x0, x2: x0, y1: this.height, y2: 2, class: 'axis' }, ax);
    s('path', { d: `M${this.width - 10} ${y0 - 5} L${this.width - 1} ${y0} L${this.width - 10} ${y0 + 5}`, class: 'axis-arrow' }, ax);
    s('path', { d: `M${x0 - 5} 10 L${x0} 1 L${x0 + 5} 10`, class: 'axis-arrow' }, ax);
    if (!labels) return;
    const fmt = v => (Math.round(v * 100) / 100).toString().replace('-', '−');
    for (let x = Math.ceil(xmin / st) * st; x <= xmax - st / 2; x += st) {
      if (Math.abs(x) < 1e-9) continue;
      s('line', { x1: this.X(x), x2: this.X(x), y1: y0 - 4, y2: y0 + 4, class: 'tick' }, ax);
      s('text', { x: this.X(x), y: Math.min(y0 + 18, this.height - 4), class: 'tl', 'text-anchor': 'middle' }, ax).textContent = fmt(x);
    }
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax - sy / 2; y += sy) {
      if (Math.abs(y) < 1e-9) continue;
      s('line', { y1: this.Y(y), y2: this.Y(y), x1: x0 - 4, x2: x0 + 4, class: 'tick' }, ax);
      s('text', { x: Math.max(x0 - 8, 14), y: this.Y(y) + 4, class: 'tl', 'text-anchor': 'end' }, ax).textContent = fmt(y);
    }
    s('text', { x: x0 - 7, y: y0 + 16, class: 'tl', 'text-anchor': 'end' }, ax).textContent = '0';
    s('text', { x: this.width - 6, y: y0 - 10, class: 'al', 'text-anchor': 'end' }, ax).textContent = xlabel;
    s('text', { x: x0 + 10, y: 16, class: 'al' }, ax).textContent = ylabel;
  }
  // Path for y = f(x) on [a, b]; breaks where f is undefined or jumps wildly
  fnD(f, a = this.xmin, b = this.xmax, n = 480) {
    let d = '', pen = false, prevY = null;
    const H = this.height;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n;
      const y = f(x);
      if (!Number.isFinite(y)) { pen = false; prevY = null; continue; }
      let py = this.Y(y);
      if (prevY !== null && Math.abs(py - prevY) > H * 1.5) pen = false;
      py = Math.max(-H, Math.min(2 * H, py));
      d += (pen ? 'L' : 'M') + this.X(x).toFixed(2) + ' ' + py.toFixed(2);
      pen = true; prevY = py;
    }
    return d;
  }
  paramD(fx, fy, t0, t1, n = 360) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const tt = t0 + (t1 - t0) * i / n;
      d += (i ? 'L' : 'M') + this.X(fx(tt)).toFixed(2) + ' ' + this.Y(fy(tt)).toFixed(2);
    }
    return d;
  }
  curve(f, { a, b, cls = 'curve', parent = this.gMain, color } = {}) {
    const p = s('path', { d: this.fnD(f, a ?? this.xmin, b ?? this.xmax), class: cls }, parent);
    if (color) p.style.stroke = color;
    return p;
  }
  dot(x, y, { r = 6, cls = 'dot', open = false, parent = this.gTop } = {}) {
    return s('circle', { cx: this.X(x), cy: this.Y(y), r, class: cls + (open ? ' open' : '') }, parent);
  }
  line(x1, y1, x2, y2, cls = 'guide', parent = this.gBack) {
    return s('line', { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), class: cls }, parent);
  }
  text(x, y, str, cls = 'lbl', parent = this.gTop) {
    const tx = s('text', { x: this.X(x), y: this.Y(y), class: cls }, parent);
    tx.textContent = str;
    return tx;
  }
  // convert pointer event to plot coordinates
  toPlot(e) {
    const pt = this.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = this.svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: this.ix(p.x), y: this.iy(p.y), px: p.x, py: p.y };
  }
  // simple drag helper on the whole svg
  onDrag(fn, { start, axis = 'x' } = {}) {
    let active = false;
    // horizontal drags keep vertical finger-scrolling of the lesson alive
    this.svg.style.touchAction = axis === 'x' ? 'pan-y pinch-zoom' : 'none';
    this.svg.addEventListener('pointerdown', e => {
      if (start && !start(this.toPlot(e), e)) return;
      active = true; this.svg.setPointerCapture(e.pointerId); fn(this.toPlot(e), e, 'start');
    });
    this.svg.addEventListener('pointermove', e => { if (active) fn(this.toPlot(e), e, 'move'); });
    const end = e => { if (active) { active = false; fn(this.toPlot(e), e, 'end'); } };
    this.svg.addEventListener('pointerup', end);
    this.svg.addEventListener('pointercancel', end);
  }
}

// Animated drawing of a path (stroke-dashoffset)
export function drawIn(path, ms = 900, delay = 0) {
  const len = path.getTotalLength?.() || 1000;
  path.style.strokeDasharray = `${len} ${len}`;
  path.style.strokeDashoffset = len;
  const a = path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  a.onfinish = () => { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; a.cancel(); };
  return a;
}

export function colorVar(name) {
  const map = { accent: 'var(--accent)', coral: 'var(--coral)', good: 'var(--good)', bad: 'var(--bad)', violet: 'var(--violet)', teal: 'var(--teal)', warn: 'var(--warn)' };
  return map[name] || name;
}

// Static figure for questions: { view:[x0,x1,y0,y1], curves:[{f, dom, color}], param:[{x,y,t}], dots:[{x,y,open}], vline }
export function figure(spec, w = 420, hgt = 300) {
  const [xmin, xmax, ymin, ymax] = spec.view;
  const p = new Plot(null, { xmin, xmax, ymin, ymax, width: w, height: hgt, cls: 'fig' });
  for (const c of spec.curves || []) {
    const path = p.curve(c.f, { a: c.dom?.[0], b: c.dom?.[1], cls: 'curve' });
    path.style.stroke = colorVar(c.color || 'accent');
  }
  for (const c of spec.param || []) {
    const path = s('path', { d: p.paramD(c.x, c.y, c.t[0], c.t[1]), class: 'curve' }, p.gMain);
    path.style.stroke = colorVar(c.color || 'accent');
  }
  for (const d of spec.dots || []) p.dot(d.x, d.y, { open: d.open, r: 5 });
  return p.svg;
}
