// Brachistochrona: závod kuliček po přímce, kružnici a cykloidě. Nejrychlejší není nejkratší cesta!
import { h, tex, sound } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { s } from './plot.js';

export default function brachistochrone(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const W = 600, H = 340, ox = 40, oy = 40, scale = 160; // A = (0,0), B = (π, 2) in units of the cycloid radius R=1 → scaled
  const Bx = Math.PI, By = 2;
  const g = 9.81;
  // paths as arrays of points (x right, y down)
  const N = 400;
  const cyc = Array.from({ length: N + 1 }, (_, i) => { const th = Math.PI * i / N; return [th - Math.sin(th), 1 - Math.cos(th)]; });
  const line = Array.from({ length: N + 1 }, (_, i) => [Bx * i / N, By * i / N]);
  // circular arc through A and B bulging down: centre (cx, cy) with A,B on circle, choose a quarter-ish circle
  const cx = Bx, cyy = 0, rr = Math.hypot(Bx, 0); // centre above B at height 0 → passes through A(0,0) and B(π, ... ) approx
  const arcPts = []; { const R2 = Math.hypot(Bx - 0, By - 0) * .8; void R2; }
  for (let i = 0; i <= N; i++) { const a = Math.PI - (Math.PI / 2) * i / N; arcPts.push([cx + rr * Math.cos(a), cyy + (By / rr) * rr * Math.sin(a) * 1]); }
  const paths = [
    { pts: line, color: 'var(--orange)', name: T('Přímka (nejkratší)', 'Straight line (shortest)') },
    { pts: arcPts, color: 'var(--green)', name: T('Oblouk', 'Arc') },
    { pts: cyc, color: 'var(--purple)', name: T('Cykloida', 'Cycloid') },
  ];
  // time parametrisation: v = sqrt(2 g y), dt = ds / v
  for (const p of paths) {
    p.t = [0]; let tt = 0;
    for (let i = 1; i < p.pts.length; i++) {
      const [x0, y0] = p.pts[i - 1], [x1, y1] = p.pts[i];
      const ds = Math.hypot(x1 - x0, y1 - y0), yy = (y0 + y1) / 2;
      tt += ds / Math.sqrt(2 * g * Math.max(yy, 1e-4));
      p.t.push(tt);
    }
    p.total = tt;
  }
  const X = x => ox + x * scale, Y = y => oy + y * (scale * .55);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'br-svg' });
  const board = h('div', { class: 'br-board' });
  const go = h('button', { class: 'btn primary capsule', html: icon('play') + `<span>${T('Start závodu', 'Start the race')}</span>` });
  el.append(h('div', { class: 'osc-wrap' }, svg), h('div', { class: 'pp-ctrl' }, go, board));
  let raf = 0;
  function frame(tt) {
    let gg = `<circle cx="${X(0)}" cy="${Y(0)}" r="6" class="br-pin"/><circle cx="${X(Bx)}" cy="${Y(By)}" r="6" class="br-pin"/><text x="${X(0) - 18}" y="${Y(0) - 10}" class="br-l">A</text><text x="${X(Bx) + 10}" y="${Y(By) + 4}" class="br-l">B</text>`;
    for (const p of paths) gg += `<path d="${p.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join('')}" class="br-path" style="stroke:${p.color}"/>`;
    for (const p of paths) {
      let i = p.t.findIndex(v => v >= tt); if (i < 0) i = p.pts.length - 1;
      const [x, y] = p.pts[i];
      gg += `<circle cx="${X(x)}" cy="${Y(y)}" r="11" class="br-ball" style="fill:${p.color}"/>`;
    }
    svg.innerHTML = gg;
  }
  function results(tt) {
    board.innerHTML = '';
    [...paths].sort((a, b) => a.total - b.total).forEach((p, i) => board.append(h('div', { class: 'br-row' + (tt >= p.total ? ' done' : '') }, h('i', { style: { background: p.color } }), h('span', {}, `${i + 1}. ${p.name}`), h('b', {}, tt >= p.total ? `${num(p.total, 2)} s` : '…'))));
  }
  go.onclick = () => {
    cancelAnimationFrame(raf);
    const t0 = performance.now(), slow = 1.6;
    let finished = 0;
    const step = now => {
      const tt = (now - t0) / 1000 / slow;
      frame(tt); results(tt);
      const f = paths.filter(p => tt >= p.total).length;
      if (f > finished) { finished = f; sound.pop(); }
      if (tt < Math.max(...paths.map(p => p.total)) + .1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  frame(0); results(0);
  board.append(h('div', { class: 'muted small' }, T('Kulička po cykloidě vyhraje, i když jede delší cestou: rychle nabere rychlost.', 'The cycloid wins despite the longer path: it gains speed early.')));
  void tex;
  return () => cancelAnimationFrame(raf);
}
