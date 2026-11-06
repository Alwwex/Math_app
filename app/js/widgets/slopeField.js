// Směrové pole ODR y' = f(x, y): klepni a z toho bodu se nakreslí řešení (Runge–Kutta).
import { h, tex } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

export default function slopeField(el, opts = {}) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const P = [
    { k: 'growth', name: T('Růst', 'Growth'), f: (x, y) => .6 * y, tex: "y' = 0{,}6\\,y", sol: T('Řešení y = C e^{0,6x}: exponenciální růst / pokles.', 'Solutions y = C e^{0.6x}: exponential growth or decay.'), view: [-3, 3, -3, 3] },
    { k: 'linear', name: T('Lineární', 'Linear'), f: (x, y) => x - y, tex: "y' = x - y", sol: T('Všechna řešení se přimknou k přímce y = x − 1.', 'All solutions approach the line y = x − 1.'), view: [-3, 3, -3, 3] },
    { k: 'logistic', name: T('Logistická', 'Logistic'), f: (x, y) => 1.2 * y * (1 - y), tex: "y' = 1{,}2\\,y(1-y)", sol: T('Populace roste a ustálí se na kapacitě y = 1.', 'The population grows and levels off at capacity y = 1.'), view: [-3, 5, -.6, 1.6] },
    { k: 'sep', name: T('Separovatelná', 'Separable'), f: (x, y) => -x / (Math.abs(y) < .05 ? .05 * Math.sign(y || 1) : y), tex: "y' = -x/y", sol: T('Řešení jsou kružnice x² + y² = C.', 'Solutions are circles x² + y² = C.'), view: [-3, 3, -2.3, 2.3] },
    { k: 'riccati', name: T('Nelineární', 'Nonlinear'), f: (x, y) => x - y * y, tex: "y' = x - y^2", sol: T('Nemá elementární řešení – numerika ale funguje.', 'No elementary solution – but numerics work.'), view: [-3, 4, -3, 3] },
  ];
  let cur = P.find(p => p.k === opts.preset) || P[0];
  let sols = [];
  const pills = h('div', { class: 'fm-pills' });
  P.forEach(p => pills.append(h('button', { class: 'pill' + (p === cur ? ' on' : ''), html: tex(p.tex), onclick: e => { cur = p; sols = []; [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); build(); } })));
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  const clear = h('button', { class: 'btn small tinted', onclick: () => { sols = []; build(); } }, T('Smazat křivky', 'Clear curves'));
  el.append(pills, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info, clear)));
  let plot;
  const COLS = ['var(--blue)', 'var(--orange)', 'var(--green)', 'var(--purple)', 'var(--red)', 'var(--teal)'];
  function rk(x, y, hh) { const f = cur.f; const k1 = f(x, y), k2 = f(x + hh / 2, y + hh * k1 / 2), k3 = f(x + hh / 2, y + hh * k2 / 2), k4 = f(x + hh, y + hh * k3); return y + hh * (k1 + 2 * k2 + 2 * k3 + k4) / 6; }
  function trace(x0, y0, dir) { const pts = []; let x = x0, y = y0; const [a, b, c, d] = cur.view; for (let i = 0; i < 800; i++) { pts.push([x, y]); const ny = rk(x, y, dir * .01); x += dir * .01; y = ny; if (x < a || x > b || y < c - 1 || y > d + 1 || !Number.isFinite(y)) break; } return pts; }
  function build() {
    box.innerHTML = '';
    const [a, b, c, d] = cur.view;
    plot = new Plot(box, { xmin: a, xmax: b, ymin: c, ymax: d, width: 600, height: 430 });
    const nx = 22, ny = 16;
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = a + (b - a) * (i + .5) / (nx + 1), y = c + (d - c) * (j + .5) / (ny + 1);
      const m = cur.f(x, y); if (!Number.isFinite(m)) continue;
      const dx = 1, dy = m, L = Math.hypot(plot.X(x + dx) - plot.X(x), plot.Y(y + dy) - plot.Y(y)) || 1;
      const ux = (plot.X(x + dx) - plot.X(x)) / L * 9, uy = (plot.Y(y + dy) - plot.Y(y)) / L * 9;
      s('line', { x1: plot.X(x) - ux, y1: plot.Y(y) - uy, x2: plot.X(x) + ux, y2: plot.Y(y) + uy, class: 'sf-seg' }, plot.gBack);
    }
    sols.forEach((p, i) => drawSol(p, i, false));
    info.innerHTML = `<div>${tex(cur.tex)}</div><div class="muted small">${cur.sol}</div><div class="subtle small">${T('Klepni do grafu – vznikne řešení procházející tím bodem.', 'Tap the plot – a solution through that point appears.')}</div>`;
    plot.svg.onclick = e => { const p = plot.toPlot(e); sols.push(p); drawSol(p, sols.length - 1, true); };
  }
  function drawSol(p, i, anim) {
    const pts = [...trace(p.x, p.y, -1).reverse(), ...trace(p.x, p.y, 1)];
    let dd = ''; pts.forEach(([x, y], k) => { dd += (k ? 'L' : 'M') + plot.X(x).toFixed(1) + ' ' + plot.Y(y).toFixed(1); });
    const path = s('path', { d: dd, class: 'curve thick' }, plot.gMain);
    path.style.stroke = COLS[i % COLS.length];
    const dot = plot.dot(p.x, p.y, { r: 6 }); dot.style.fill = COLS[i % COLS.length];
    if (anim) { const L = path.getTotalLength(); path.style.strokeDasharray = L; path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 900, easing: 'ease-out' }); }
  }
  build();
  void num;
}
