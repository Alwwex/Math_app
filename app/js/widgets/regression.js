// Metoda nejmenších čtverců: táhni body, přímka se přepočítá, čtverce reziduí ukazují, co se minimalizuje.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

export default function regression(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let pts = [[.6, 1.2], [1.4, 1.5], [2.2, 2.6], [3, 2.7], [3.8, 3.9], [4.6, 4.1], [5.4, 5.3]];
  let showSq = true, drag = -1;
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  const sq = h('button', { class: 'chip on', onclick: () => { showSq = !showSq; sq.classList.toggle('on', showSq); draw(); } }, T('Čtverce odchylek', 'Squared residuals'));
  const add = h('button', { class: 'btn small tinted', onclick: () => { pts.push([Math.random() * 5 + .5, Math.random() * 4 + 1]); draw(); } }, T('+ bod', '+ point'));
  el.append(h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info, h('div', { class: 'row' }, sq, add), h('p', { class: 'subtle small' }, T('Přetahuj body. Přímka vždy minimalizuje součet ploch čtverců.', 'Drag the points. The line always minimises the total area of the squares.')))));
  let plot;
  function fit() {
    const n = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
    const mx = sx / n, my = sy / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
    const b = sxy / sxx, a = my - b * mx, r = sxy / Math.sqrt(sxx * syy);
    return { a, b, r, mx, my };
  }
  function draw() {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -.3, xmax: 6.3, ymin: -.3, ymax: 6.3, width: 560, height: 460, step: 1, ystep: 1 });
    const { a, b, r, mx, my } = fit();
    let S = 0;
    for (const [x, y] of pts) {
      const yh = a + b * x, e = y - yh; S += e * e;
      if (showSq) { const side = plot.Y(Math.min(y, yh)) - plot.Y(Math.max(y, yh)); s('rect', { x: plot.X(x), y: plot.Y(Math.max(y, yh)), width: Math.abs(side), height: Math.abs(side), class: 'rg-sq' }, plot.gBack); }
      plot.line(x, y, x, yh, 'rg-res', plot.gBack);
    }
    plot.curve(x => a + b * x, { cls: 'curve thick' });
    plot.dot(mx, my, { r: 5, cls: 'dot rg-mean' });
    pts.forEach(([x, y]) => plot.dot(x, y, { r: 9, cls: 'dot rg-pt' }));
    info.innerHTML = `<div>${tex(`y = ${num(a, 2).replace(',', '{,}')} + ${num(b, 2).replace(',', '{,}')}\\,x`)}</div><div>${tex(`\\sum (y_i - \\hat y_i)^2 = ${num(S, 3).replace(',', '{,}')}`)}</div><div>${tex(`r = ${num(r, 3).replace(',', '{,}')}`)}</div><div class="muted small">${T('Přímka vždy prochází těžištěm bodů (malá tečka).', 'The line always passes through the centroid (small dot).')}</div>`;
    plot.svg.style.touchAction = 'none';
    plot.svg.onpointerdown = e => { const p = plot.toPlot(e); let best = -1, bd = .5; pts.forEach(([x, y], i) => { const d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = i; } }); drag = best; if (drag >= 0) plot.svg.setPointerCapture(e.pointerId); };
    plot.svg.onpointermove = e => { if (drag < 0) return; const p = plot.toPlot(e); pts[drag] = [clamp(p.x, 0, 6), clamp(p.y, 0, 6)]; const k = drag; requestAnimationFrame(() => { draw(); drag = k; }); };
    plot.svg.onpointerup = plot.svg.onpointercancel = () => { drag = -1; };
  }
  draw();
}
