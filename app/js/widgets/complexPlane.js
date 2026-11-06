// Komplexní rovina: tvar z = x + iy ↔ r·e^{iθ}, násobení jako otočení, n-té odmocniny.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

const f2 = v => num(v, 2).replace(',', '{,}');
export default function complexPlane(el, opts = {}) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let mode = opts.mode || 'polar';
  let z = { x: 1.6, y: 1.1 }, w = { x: .8, y: .9 }, n = 5, drag = null;
  el.classList.add('cp');
  const tabs = h('div', { class: 'seg' });
  const modes = [['polar', T('Tvar čísla', 'Forms')], ['mult', T('Násobení', 'Multiplication')], ['roots', T('Odmocniny', 'Roots')], ['powers', T('Mocniny', 'Powers')]];
  modes.forEach(([k, l]) => tabs.append(h('button', { class: k === mode ? 'on' : '', onclick: e => { mode = k; [...tabs.children].forEach(b => b.classList.toggle('on', b === e.currentTarget)); draw(); } }, l)));
  const box = h('div', { class: 'cp-plot' });
  const info = h('div', { class: 'pp-info' });
  const nRange = h('input', { type: 'range', class: 'range', min: 2, max: 12, step: 1, value: n });
  const nLab = h('span', { class: 'pp-val' });
  nRange.oninput = () => { n = +nRange.value; draw(); };
  const nRow = h('label', { class: 'pp-slider' }, nLab, nRange);
  el.append(tabs, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info, nRow, h('p', { class: 'subtle small' }, T('Tahni body myší, prstem nebo perem.', 'Drag the points with mouse, finger or pen.')))));
  let plot;
  const mag = p => Math.hypot(p.x, p.y), arg = p => Math.atan2(p.y, p.x);
  function vec(p, cls, label, col) {
    s('line', { x1: plot.X(0), y1: plot.Y(0), x2: plot.X(p.x), y2: plot.Y(p.y), class: 'cp-vec ' + cls, style: col ? `stroke:${col}` : '' }, plot.gMain);
    const d = plot.dot(p.x, p.y, { r: 8, cls: 'dot cp-pt ' + cls });
    if (col) d.style.fill = col;
    if (label) { const t2 = plot.text(p.x, p.y, label, 'cp-lbl'); t2.setAttribute('dx', 10); t2.setAttribute('dy', -10); }
    return d;
  }
  function arc(r, a0, a1, col) {
    const steps = 40; let d = '';
    for (let i = 0; i <= steps; i++) { const a = a0 + (a1 - a0) * i / steps; d += (i ? 'L' : 'M') + plot.X(r * Math.cos(a)) + ' ' + plot.Y(r * Math.sin(a)); }
    s('path', { d, class: 'cp-arc', style: `stroke:${col}` }, plot.gBack);
  }
  function draw() {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -3.2, xmax: 3.2, ymin: -2.4, ymax: 2.4, width: 600, height: 450, xlabel: 'Re', ylabel: 'Im', step: 1, ystep: 1 });
    s('circle', { cx: plot.X(0), cy: plot.Y(0), r: plot.X(1) - plot.X(0), class: 'cp-unit' }, plot.gBack);
    nRow.style.display = (mode === 'roots' || mode === 'powers') ? '' : 'none';
    nLab.innerHTML = tex(`n = ${n}`);
    const r = mag(z), th = arg(z);
    if (mode === 'polar') {
      plot.line(z.x, 0, z.x, z.y, 'guide', plot.gTop); plot.line(0, z.y, z.x, z.y, 'guide', plot.gTop);
      arc(Math.min(.6, r * .4), 0, th, 'var(--orange)');
      vec({ x: z.x, y: -z.y }, 'ghost', 'z*', 'var(--ink-3)');
      vec(z, 'main', 'z');
      info.innerHTML = `<div>${tex(`z = ${f2(z.x)} ${z.y < 0 ? '-' : '+'} ${f2(Math.abs(z.y))}\\,i`)}</div><div>${tex(`|z| = r = ${f2(r)}`)}</div><div>${tex(`\\arg z = \\theta = ${f2(th)}\\ (${num(th * 180 / Math.PI, 1).replace(',', '{,}')}^\\circ)`)}</div><div>${tex(`z = ${f2(r)}\\,e^{${f2(th)}\\,i}`)}</div><div class="subtle small">${T('Šedě komplexně sdružené číslo', 'Grey: complex conjugate')} ${tex('z^*')}</div>`;
    } else if (mode === 'mult') {
      const p = { x: z.x * w.x - z.y * w.y, y: z.x * w.y + z.y * w.x };
      arc(.5, 0, arg(z), 'var(--blue)'); arc(.75, 0, arg(w), 'var(--green)'); arc(1, 0, arg(p), 'var(--purple)');
      vec(z, 'main', 'z_1'); vec(w, 'second', 'z_2', 'var(--green)'); vec(p, 'prod', 'z_1z_2', 'var(--purple)');
      info.innerHTML = `<div>${tex(`|z_1 z_2| = |z_1|\\,|z_2| = ${f2(mag(z))}\\cdot${f2(mag(w))} = ${f2(mag(p))}`)}</div><div>${tex(`\\arg(z_1z_2) = \\arg z_1 + \\arg z_2`)}</div><div class="muted small">${T('Násobení = otočení o úhel a natažení o délku.', 'Multiplying = rotate by the angle and stretch by the length.')}</div>`;
    } else if (mode === 'roots') {
      const R = Math.pow(r, 1 / n);
      const pts = [];
      for (let k = 0; k < n; k++) { const a = (th + 2 * Math.PI * k) / n; pts.push({ x: R * Math.cos(a), y: R * Math.sin(a) }); }
      s('polygon', { points: pts.map(p => `${plot.X(p.x)},${plot.Y(p.y)}`).join(' '), class: 'cp-poly' }, plot.gBack);
      pts.forEach((p, k) => { const d = plot.dot(p.x, p.y, { r: 6, cls: 'dot cp-root' }); d.style.animationDelay = k * 40 + 'ms'; });
      vec(z, 'main', 'z');
      info.innerHTML = `<div>${tex(`\\sqrt[${n}]{z} = r^{1/${n}}\\, e^{i(\\theta + 2\\pi k)/${n}}`)}</div><div>${tex(`k = 0, 1, \\dots, ${n - 1}`)}</div><div class="muted small">${T(`${n} odmocnin leží v pravidelném ${n}-úhelníku.`, `The ${n} roots form a regular ${n}-gon.`)}</div>`;
    } else {
      let p = { x: 1, y: 0 }; const pts = [p];
      for (let k = 1; k <= n; k++) { p = { x: p.x * z.x - p.y * z.y, y: p.x * z.y + p.y * z.x }; pts.push(p); }
      let d = '';
      pts.forEach((q, i) => { d += (i ? 'L' : 'M') + plot.X(clamp(q.x, -50, 50)) + ' ' + plot.Y(clamp(q.y, -50, 50)); });
      s('path', { d, class: 'cp-spiral' }, plot.gBack);
      pts.forEach((q, k) => { if (k) { const dd = plot.dot(clamp(q.x, -50, 50), clamp(q.y, -50, 50), { r: 5, cls: 'dot cp-root' }); dd.style.animationDelay = k * 50 + 'ms'; } });
      vec(z, 'main', 'z');
      info.innerHTML = `<div>${tex(`z^n = r^n\\,(\\cos n\\theta + i\\sin n\\theta)`)}</div><div class="muted small">${T('Moivreova věta: mocnina otáčí o násobky úhlu. Pro |z| < 1 spirála míří dovnitř, pro |z| > 1 ven.', "de Moivre: powers rotate by multiples of the angle. |z| < 1 spirals in, |z| > 1 spirals out.")}</div>`;
    }
    plot.svg.style.touchAction = 'none';
    plot.svg.onpointerdown = e => {
      const p = plot.toPlot(e);
      const dz = Math.hypot(p.x - z.x, p.y - z.y), dw = Math.hypot(p.x - w.x, p.y - w.y);
      drag = mode === 'mult' && dw < dz ? w : z;
      plot.svg.setPointerCapture(e.pointerId);
      move(e);
    };
    plot.svg.onpointermove = e => drag && move(e);
    plot.svg.onpointerup = plot.svg.onpointercancel = () => { drag = null; };
  }
  let pending = false;
  function move(e) {
    const p = plot.toPlot(e);
    drag.x = Math.round(clamp(p.x, -3, 3) * 20) / 20; drag.y = Math.round(clamp(p.y, -2.2, 2.2) * 20) / 20;
    if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; const keep = drag; draw(); drag = keep; }); }
  }
  draw();
}
