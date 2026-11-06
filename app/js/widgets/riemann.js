// Numerická integrace: obdélníky, lichoběžníky, Simpson – a jak rychle klesá chyba.
import { h, tex } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

export default function riemann(el, opts = {}) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const F = [
    { tex: '\\sin x', f: Math.sin, a: 0, b: Math.PI, exact: 2, view: [-.3, 3.5, -.3, 1.3] },
    { tex: 'e^{-x^2}', f: x => Math.exp(-x * x), a: 0, b: 2, exact: 0.882081390762422, view: [-.2, 2.3, -.2, 1.2] },
    { tex: 'x^2', f: x => x * x, a: 0, b: 2, exact: 8 / 3, view: [-.2, 2.3, -.3, 4.4] },
  ];
  let cur = F[0], n = 6, method = opts.method || 'mid';
  const pills = h('div', { class: 'fm-pills' });
  F.forEach((f, i) => pills.append(h('button', { class: 'pill' + (i === 0 ? ' on' : ''), html: tex(`\\int ${f.tex}\\,dx`), onclick: e => { cur = f; [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } })));
  const meth = h('div', { class: 'seg' });
  [['left', T('Levé', 'Left')], ['mid', T('Střed', 'Midpoint')], ['trap', T('Lichoběžník', 'Trapezium')], ['simp', 'Simpson']].forEach(([k, l]) => meth.append(h('button', { class: k === method ? 'on' : '', onclick: e => { method = k; [...meth.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, l)));
  const nR = h('input', { type: 'range', class: 'range', min: 2, max: 40, step: 2, value: n }), nL = h('span', { class: 'pp-val' });
  nR.oninput = () => { n = +nR.value; draw(); };
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  el.append(pills, meth, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info)), h('div', { class: 'pp-ctrl' }, h('label', { class: 'pp-slider' }, nL, nR)));
  function approx(m, N) {
    const { f, a, b } = cur, hh = (b - a) / N; let S = 0;
    if (m === 'left') for (let i = 0; i < N; i++) S += f(a + i * hh);
    if (m === 'mid') for (let i = 0; i < N; i++) S += f(a + (i + .5) * hh);
    if (m === 'trap') { S = (f(a) + f(b)) / 2; for (let i = 1; i < N; i++) S += f(a + i * hh); }
    if (m === 'simp') { S = f(a) + f(b); for (let i = 1; i < N; i++) S += (i % 2 ? 4 : 2) * f(a + i * hh); return S * hh / 3; }
    return S * hh;
  }
  function draw() {
    nL.innerHTML = tex(`n = ${n}`);
    box.innerHTML = '';
    const [x0, x1, y0, y1] = cur.view;
    const plot = new Plot(box, { xmin: x0, xmax: x1, ymin: y0, ymax: y1, width: 600, height: 400 });
    const { f, a, b } = cur, hh = (b - a) / n;
    for (let i = 0; i < n; i++) {
      const xl = a + i * hh, xr = xl + hh;
      let pts;
      if (method === 'left') pts = [[xl, 0], [xl, f(xl)], [xr, f(xl)], [xr, 0]];
      else if (method === 'mid') { const ym = f(xl + hh / 2); pts = [[xl, 0], [xl, ym], [xr, ym], [xr, 0]]; }
      else if (method === 'trap') pts = [[xl, 0], [xl, f(xl)], [xr, f(xr)], [xr, 0]];
      else { // Simpson: parabola through pairs
        if (i % 2) continue;
        const xm = xr, xe = xl + 2 * hh, y0p = f(xl), y1p = f(xm), y2p = f(xe);
        const q = x => { const t = (x - xl) / hh; return y0p * (t - 1) * (t - 2) / 2 - y1p * t * (t - 2) + y2p * t * (t - 1) / 2; };
        pts = [[xl, 0]]; for (let k = 0; k <= 20; k++) { const x = xl + 2 * hh * k / 20; pts.push([x, q(x)]); } pts.push([xe, 0]);
      }
      s('polygon', { points: pts.map(([x, y]) => `${plot.X(x)},${plot.Y(y)}`).join(' '), class: 'rm-bar' }, plot.gBack);
    }
    plot.curve(f, { cls: 'curve thick' });
    const A = approx(method, n), err = Math.abs(A - cur.exact);
    const errs = ['left', 'mid', 'trap', 'simp'].map(m => [m, Math.abs(approx(m, n) - cur.exact)]);
    info.innerHTML = `<div>${tex(`\\int_{${num(a, 2)}}^{${cur.b === Math.PI ? '\\pi' : num(b, 2)}} ${cur.tex}\\,dx = ${num(cur.exact, 6).replace(',', '{,}')}`)}</div><div>${tex(`\\text{${T('odhad', 'estimate')}} = ${num(A, 6).replace(',', '{,}')}`)}</div><div>${tex(`\\text{${T('chyba', 'error')}} = ${err.toExponential(2).replace('e', '\\cdot 10^{').replace(/$/, '}')}`)}</div>` +
      `<div class="rm-errs">${errs.map(([m, e]) => `<div class="${m === method ? 'on' : ''}"><span>${{ left: T('levé', 'left'), mid: T('střed', 'midpoint'), trap: T('lichoběžník', 'trapezium'), simp: 'Simpson' }[m]}</span><i style="width:${Math.max(2, Math.min(100, 100 + Math.log10(e + 1e-16) * 14))}%"></i></div>`).join('')}</div><div class="muted small">${T('Zdvojnásob n: chyba levých obdélníků klesne 2×, lichoběžníku 4×, Simpsona 16×.', 'Double n: the left-rule error halves, trapezium quarters, Simpson drops 16×.')}</div>`;
  }
  draw();
}
