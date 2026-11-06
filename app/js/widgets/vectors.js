// Vektory v rovině: součet (rovnoběžník), skalární součin (průmět), vektorový součin (plocha).
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

const f2 = v => num(v, 2).replace(',', '{,}');
export default function vectors(el, opts = {}) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let mode = opts.mode || 'sum';
  const a = { x: 2.6, y: .8 }, b = { x: .9, y: 2.2 };
  let drag = null;
  const tabs = h('div', { class: 'seg' });
  [['sum', T('Součet', 'Sum')], ['dot', T('Skalární součin', 'Scalar product')], ['cross', T('Vektorový součin', 'Vector product')]].forEach(([k, l]) =>
    tabs.append(h('button', { class: k === mode ? 'on' : '', onclick: e => { mode = k; [...tabs.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, l)));
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  el.append(tabs, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info, h('p', { class: 'subtle small' }, T('Chyť konec vektoru a táhni.', 'Grab the tip of a vector and drag.')))));
  let plot;
  const arrow = (p, q, col, label, w = 4) => {
    const ang = Math.atan2(plot.Y(q.y) - plot.Y(p.y), plot.X(q.x) - plot.X(p.x));
    const X = plot.X(q.x), Y = plot.Y(q.y), L = 14;
    s('line', { x1: plot.X(p.x), y1: plot.Y(p.y), x2: X - Math.cos(ang) * 8, y2: Y - Math.sin(ang) * 8, style: `stroke:${col};stroke-width:${w};stroke-linecap:round` }, plot.gMain);
    s('path', { d: `M${X} ${Y} L${X - L * Math.cos(ang - .4)} ${Y - L * Math.sin(ang - .4)} L${X - L * Math.cos(ang + .4)} ${Y - L * Math.sin(ang + .4)}Z`, style: `fill:${col}` }, plot.gMain);
    if (label) { const t2 = s('text', { x: X + 10, y: Y - 8, class: 'cp-lbl', style: `fill:${col}` }, plot.gTop); t2.textContent = label; }
  };
  function draw() {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -3.5, xmax: 4.5, ymin: -2.5, ymax: 3.5, width: 600, height: 450, step: 1, ystep: 1 });
    const O = { x: 0, y: 0 };
    const dot = a.x * b.x + a.y * b.y, cross = a.x * b.y - a.y * b.x;
    const la = Math.hypot(a.x, a.y), lb = Math.hypot(b.x, b.y);
    const ang = Math.acos(clamp(dot / (la * lb), -1, 1));
    if (mode === 'sum') {
      const c = { x: a.x + b.x, y: a.y + b.y };
      s('polygon', { points: [O, a, c, b].map(p => `${plot.X(p.x)},${plot.Y(p.y)}`).join(' '), class: 'vec-par' }, plot.gBack);
      plot.line(a.x, a.y, c.x, c.y, 'guide', plot.gBack); plot.line(b.x, b.y, c.x, c.y, 'guide', plot.gBack);
      arrow(O, c, 'var(--purple)', 'a + b', 5);
      info.innerHTML = `<div>${tex(`\\mathbf a = (${f2(a.x)},\\ ${f2(a.y)})`)}</div><div>${tex(`\\mathbf b = (${f2(b.x)},\\ ${f2(b.y)})`)}</div><div>${tex(`\\mathbf a + \\mathbf b = (${f2(a.x + b.x)},\\ ${f2(a.y + b.y)})`)}</div><div class="muted small">${T('Pravidlo rovnoběžníku: součet je úhlopříčka.', 'Parallelogram rule: the sum is the diagonal.')}</div>`;
    } else if (mode === 'dot') {
      const k = dot / (la * la), pr = { x: a.x * k, y: a.y * k };
      plot.line(b.x, b.y, pr.x, pr.y, 'guide', plot.gBack);
      s('line', { x1: plot.X(0), y1: plot.Y(0), x2: plot.X(pr.x), y2: plot.Y(pr.y), class: 'vec-proj' }, plot.gBack);
      info.innerHTML = `<div>${tex(`\\mathbf a\\cdot\\mathbf b = a_xb_x + a_yb_y = ${f2(dot)}`)}</div><div>${tex(`|\\mathbf a||\\mathbf b|\\cos\\theta = ${f2(la)}\\cdot${f2(lb)}\\cdot\\cos ${num(ang * 180 / Math.PI, 0)}^\\circ`)}</div><div class="${Math.abs(dot) < .05 ? 'good-t' : 'muted'} small">${Math.abs(dot) < .05 ? T('Kolmé vektory → skalární součin je 0.', 'Perpendicular → the scalar product is 0.') : T('Zelená úsečka je průmět b na směr a.', 'The green segment is the projection of b onto a.')}</div>`;
    } else {
      const c = { x: a.x + b.x, y: a.y + b.y };
      s('polygon', { points: [O, a, c, b].map(p => `${plot.X(p.x)},${plot.Y(p.y)}`).join(' '), class: 'vec-area ' + (cross >= 0 ? 'pos' : 'neg') }, plot.gBack);
      info.innerHTML = `<div>${tex(`|\\mathbf a\\times\\mathbf b| = |\\mathbf a||\\mathbf b|\\sin\\theta = ${f2(Math.abs(cross))}`)}</div><div>${tex(`(\\mathbf a\\times\\mathbf b)_z = a_xb_y - a_yb_x = ${f2(cross)}`)}</div><div class="muted small">${T('Velikost = plocha rovnoběžníku. Znaménko říká, zda vektor míří k tobě (+) nebo od tebe (−) – pravidlo pravé ruky.', 'Magnitude = parallelogram area. Sign: towards you (+) or away (−), right-hand rule.')}</div>`;
    }
    arrow(O, a, 'var(--blue)', 'a'); arrow(O, b, 'var(--orange)', 'b');
    for (const [p, c] of [[a, 'var(--blue)'], [b, 'var(--orange)']]) { const d = plot.dot(p.x, p.y, { r: 11, cls: 'dot vec-handle' }); d.style.fill = c; }
    plot.svg.style.touchAction = 'none';
    plot.svg.onpointerdown = e => { const p = plot.toPlot(e); drag = Math.hypot(p.x - a.x, p.y - a.y) < Math.hypot(p.x - b.x, p.y - b.y) ? a : b; plot.svg.setPointerCapture(e.pointerId); mv(e); };
    plot.svg.onpointermove = e => drag && mv(e);
    plot.svg.onpointerup = plot.svg.onpointercancel = () => { drag = null; };
  }
  let pend = false;
  function mv(e) { const p = plot.toPlot(e); drag.x = Math.round(clamp(p.x, -3.3, 4.3) * 10) / 10; drag.y = Math.round(clamp(p.y, -2.3, 3.3) * 10) / 10; if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; const k = drag; draw(); drag = k; }); } }
  draw();
}
