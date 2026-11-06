// Interaktivní graf: posouvej bod po křivce, sleduj [x, f(x)], definiční obor a obor hodnot jako „stíny".
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s, drawIn } from './plot.js';

const PRESETS = [
  { tex: 'x^2', f: x => x * x, D: [-Infinity, Infinity], H: [0, Infinity], Dt: ['\\mathbb{R}', '\\mathbb{R}'], Ht: ['\\langle 0, \\infty)', '[0, \\infty)'] },
  { tex: '\\sqrt{x}', f: x => (x < 0 ? NaN : Math.sqrt(x)), D: [0, Infinity], H: [0, Infinity], Dt: ['\\langle 0, \\infty)', '[0, \\infty)'], Ht: ['\\langle 0, \\infty)', '[0, \\infty)'] },
  { tex: '\\tfrac{1}{x}', f: x => (Math.abs(x) < 1e-9 ? NaN : 1 / x), D: [-Infinity, Infinity], hole: 0, H: [-Infinity, Infinity], hHole: 0, Dt: ['\\mathbb{R}\\setminus\\{0\\}', '\\mathbb{R}\\setminus\\{0\\}'], Ht: ['\\mathbb{R}\\setminus\\{0\\}', '\\mathbb{R}\\setminus\\{0\\}'] },
  { tex: '|x|', f: x => Math.abs(x), D: [-Infinity, Infinity], H: [0, Infinity], Dt: ['\\mathbb{R}', '\\mathbb{R}'], Ht: ['\\langle 0, \\infty)', '[0, \\infty)'] },
  { tex: '\\sqrt{9 - x^2}', f: x => (9 - x * x < 0 ? NaN : Math.sqrt(9 - x * x)), D: [-3, 3], H: [0, 3], Dt: ['\\langle -3, 3\\rangle', '[-3, 3]'], Ht: ['\\langle 0, 3\\rangle', '[0, 3]'] },
  { tex: 'x^3 - 3x', f: x => x ** 3 - 3 * x, D: [-Infinity, Infinity], H: [-Infinity, Infinity], Dt: ['\\mathbb{R}', '\\mathbb{R}'], Ht: ['\\mathbb{R}', '\\mathbb{R}'] },
];

export default function grapher(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const li = () => (lang() === 'en' ? 1 : 0);
  let P = PRESETS[0], x = 1.5, showD = true, showH = true;
  el.classList.add('gr');
  const pills = h('div', { class: 'fm-pills' });
  PRESETS.forEach(pr => {
    const b = h('button', { class: 'pill' + (pr === P ? ' on' : ''), html: tex('f(x) = ' + pr.tex) });
    b.onclick = () => { P = pr; [...pills.children].forEach(c => c.classList.toggle('on', c === b)); if (!Number.isFinite(P.f(x))) x = P === PRESETS[2] ? 1 : 1; build(true); };
    pills.append(b);
  });
  const box = h('div', { class: 'gr-plot' });
  const read = h('div', { class: 'gr-read' });
  const info = h('div', { class: 'gr-info' });
  const tD = h('button', { class: 'chip accent on' }, '▬ ' + T('Definiční obor', 'Domain'));
  const tH = h('button', { class: 'chip coral on' }, '▮ ' + T('Obor hodnot', 'Range'));
  tD.onclick = () => { showD = !showD; tD.classList.toggle('on', showD); build(false); };
  tH.onclick = () => { showH = !showH; tH.classList.toggle('on', showH); build(false); };
  const slider = h('input', { type: 'range', class: 'range', min: -5, max: 5, step: .01, value: x });
  slider.oninput = () => { x = +slider.value; update(); };
  el.append(pills, h('div', { class: 'gr-wrap' }, box, h('div', { class: 'gr-side' }, read, info, h('div', { class: 'gr-toggles' }, tD, tH))), h('div', { class: 'gr-slider' }, h('span', { html: tex('x') }), slider));

  let plot, pt, vg, hg, xMark, yMark;
  function build(animate) {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -5, xmax: 5, ymin: -4, ymax: 6, width: 560, height: 420 });
    // domain & range shadows
    const xmn = Math.max(P.D[0], plot.xmin), xmx = Math.min(P.D[1], plot.xmax);
    if (showD) {
      const bar = s('line', { x1: plot.X(xmn), x2: plot.X(xmx), y1: plot.Y(0), y2: plot.Y(0), class: 'gr-dom' }, plot.gBack);
      bar.animate([{ opacity: 0, strokeWidth: 0 }, { opacity: 1 }], { duration: 500 });
      if (P.hole !== undefined) plot.dot(P.hole, 0, { r: 6, open: true, cls: 'dot dom-hole', parent: plot.gBack });
      if (Number.isFinite(P.D[0])) plot.dot(P.D[0], 0, { r: 6, cls: 'dot dom-end', parent: plot.gBack });
      if (Number.isFinite(P.D[1])) plot.dot(P.D[1], 0, { r: 6, cls: 'dot dom-end', parent: plot.gBack });
    }
    if (showH) {
      const ymn = Math.max(P.H[0], plot.ymin), ymx = Math.min(P.H[1], plot.ymax);
      const bar = s('line', { x1: plot.X(0), x2: plot.X(0), y1: plot.Y(ymn), y2: plot.Y(ymx), class: 'gr-rng' }, plot.gBack);
      bar.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
      if (P.hHole !== undefined) plot.dot(0, P.hHole, { r: 6, open: true, cls: 'dot rng-hole', parent: plot.gBack });
      if (Number.isFinite(P.H[0])) plot.dot(0, P.H[0], { r: 6, cls: 'dot rng-end', parent: plot.gBack });
      if (Number.isFinite(P.H[1])) plot.dot(0, P.H[1], { r: 6, cls: 'dot rng-end', parent: plot.gBack });
    }
    const curve = plot.curve(P.f, { cls: 'curve thick' });
    if (animate) drawIn(curve, 900);
    vg = plot.line(0, 0, 0, 0, 'guide', plot.gTop);
    hg = plot.line(0, 0, 0, 0, 'guide', plot.gTop);
    xMark = plot.dot(0, 0, { r: 5, cls: 'dot xmark' });
    yMark = plot.dot(0, 0, { r: 5, cls: 'dot ymark' });
    pt = plot.dot(0, 0, { r: 10, cls: 'dot handle' });
    plot.onDrag(p => { x = clamp(p.x, -5, 5); update(); });
    info.innerHTML = `<div>${tex('D(f) = ' + P.Dt[li()])}</div><div>${tex('H(f) = ' + P.Ht[li()])}</div>`;
    if (lang() === 'en') info.innerHTML = `<div>${T('', 'Domain: ')}${tex(P.Dt[1])}</div><div>${T('', 'Range: ')}${tex(P.Ht[1])}</div>`;
    update();
  }
  function update() {
    slider.value = x;
    const y = P.f(x);
    const ok = Number.isFinite(y);
    const xs = num(x, 2).replace(',', '{,}');
    for (const e of [pt, vg, hg, xMark, yMark]) e.style.display = ok ? '' : 'none';
    if (ok) {
      pt.setAttribute('cx', plot.X(x)); pt.setAttribute('cy', plot.Y(clamp(y, -4.5, 6.5)));
      vg.setAttribute('x1', plot.X(x)); vg.setAttribute('x2', plot.X(x)); vg.setAttribute('y1', plot.Y(0)); vg.setAttribute('y2', plot.Y(y));
      hg.setAttribute('x1', plot.X(0)); hg.setAttribute('x2', plot.X(x)); hg.setAttribute('y1', plot.Y(y)); hg.setAttribute('y2', plot.Y(y));
      xMark.setAttribute('cx', plot.X(x)); xMark.setAttribute('cy', plot.Y(0));
      yMark.setAttribute('cx', plot.X(0)); yMark.setAttribute('cy', plot.Y(clamp(y, -4.5, 6.5)));
      const ys = num(y, 2).replace(',', '{,}');
      const pair = lang() === 'en' ? `(${xs},\\ ${ys})` : `[${xs};\\ ${ys}]`;
      read.className = 'gr-read';
      read.innerHTML = `<div class="gr-big">${tex(`f(${xs}) = ${ys}`)}</div><div class="muted">${T('bod grafu', 'point on the graph')} ${tex(pair)}</div>`;
    } else {
      read.className = 'gr-read bad';
      read.innerHTML = `<div class="gr-big">${tex(`f(${xs})`)} ${T('neexistuje', 'is undefined')}</div><div class="muted">${tex(xs + ' \\notin D(f)')} – ${T('nad tímto x žádný bod grafu není.', 'there is no point of the graph above this x.')}</div>`;
    }
  }
  build(true);
}
