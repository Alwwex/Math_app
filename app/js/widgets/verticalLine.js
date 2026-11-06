// Test svislou přímkou – táhni přímku nebo nech ji projet celou křivku.
import { h, tex, clamp, sound } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s, drawIn } from './plot.js';

const CURVES = [
  { name: ['Parabola', 'Parabola'], tex: 'y = \\tfrac12 x^2 - 2', x: t => t, y: t => t * t / 2 - 2, t: [-4.5, 4.5], func: true },
  { name: ['Kružnice', 'Circle'], tex: 'x^2 + y^2 = 9', x: t => 3 * Math.cos(t), y: t => 3 * Math.sin(t), t: [0, 2 * Math.PI], func: false },
  { name: ['Ležatá parabola', 'Sideways parabola'], tex: 'x = \\tfrac12 y^2 - 2', x: t => t * t / 2 - 2, y: t => t, t: [-3.6, 3.6], func: false },
  { name: ['Kubika', 'Cubic'], tex: 'y = \\tfrac13 x^3 - x', x: t => t, y: t => t ** 3 / 3 - t, t: [-3.3, 3.3], func: true },
  { name: ['Esíčko', 'S-curve'], tex: 'x = y^3 - 3y', x: t => t ** 3 - 3 * t, y: t => t, t: [-2.3, 2.3], func: false },
];

export default function verticalLine(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const li = () => (lang() === 'en' ? 1 : 0);
  let C = CURVES[0], c = 1, maxHits = 0, worstX = null, raf = 0;
  el.classList.add('vl');
  const pills = h('div', { class: 'fm-pills' });
  CURVES.forEach(cv => {
    const b = h('button', { class: 'pill' + (cv === C ? ' on' : '') }, cv.name[li()]);
    b.onclick = () => { C = cv; [...pills.children].forEach(x => x.classList.toggle('on', x === b)); build(); };
    pills.append(b);
  });
  const box = h('div', { class: 'vl-plot' });
  const verdict = h('div', { class: 'vl-verdict' });
  const count = h('div', { class: 'vl-count' });
  const sweep = h('button', { class: 'btn primary', html: icon('play') + `<span>${T('Projet přímkou celou křivku', 'Sweep the line across')}</span>` });
  const eq = h('div', { class: 'vl-eq' });
  el.append(pills, h('div', { class: 'vl-wrap' }, box, h('div', { class: 'vl-side' }, eq, count, verdict, sweep, h('p', { class: 'muted small' }, T('Tip: přímku můžeš chytit prstem, perem nebo myší a táhnout.', 'Tip: grab the line with your finger, pen or mouse and drag it.')))));

  let plot, vline, handle, dotsG, pts;
  function build() {
    cancelAnimationFrame(raf);
    box.innerHTML = '';
    maxHits = 0; worstX = null;
    verdict.className = 'vl-verdict'; verdict.innerHTML = '';
    plot = new Plot(box, { xmin: -5, xmax: 5, ymin: -4, ymax: 4.5, width: 560, height: 440 });
    eq.innerHTML = tex(C.tex, true);
    pts = [];
    for (let i = 0; i <= 600; i++) { const t = C.t[0] + (C.t[1] - C.t[0]) * i / 600; pts.push([C.x(t), C.y(t)]); }
    const path = s('path', { d: plot.paramD(C.x, C.y, C.t[0], C.t[1], 600), class: 'curve thick' }, plot.gMain);
    drawIn(path, 800);
    vline = s('line', { y1: 0, y2: plot.height, class: 'vl-line' }, plot.gTop);
    dotsG = s('g', {}, plot.gTop);
    handle = s('g', { class: 'vl-handle' }, plot.gTop);
    s('rect', { x: -22, y: plot.height - 34, width: 44, height: 28, rx: 14 }, handle);
    s('path', { d: `M-8 ${plot.height - 20} l-5 0 M8 ${plot.height - 20} l5 0 M-13 ${plot.height - 20} l4 -4 M-13 ${plot.height - 20} l4 4 M13 ${plot.height - 20} l-4 -4 M13 ${plot.height - 20} l-4 4`, class: 'vl-grip' }, handle);
    plot.onDrag(p => { c = clamp(p.x, -4.9, 4.9); update(); });
    update();
  }
  function hits(xc) {
    const ys = [];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if ((x0 - xc) * (x1 - xc) <= 0 && x0 !== x1) {
        const y = y0 + (y1 - y0) * (xc - x0) / (x1 - x0);
        if (!ys.some(v => Math.abs(v - y) < .08)) ys.push(y);
      }
    }
    return ys;
  }
  function update() {
    const X = plot.X(c);
    vline.setAttribute('x1', X); vline.setAttribute('x2', X);
    handle.setAttribute('transform', `translate(${X} 0)`);
    const ys = hits(c);
    dotsG.innerHTML = '';
    const bad = ys.length > 1;
    for (const y of ys) {
      const d = s('circle', { cx: X, cy: plot.Y(y), r: 8, class: 'vl-hit' + (bad ? ' bad' : '') }, dotsG);
      void d;
    }
    vline.classList.toggle('bad', bad);
    if (ys.length > maxHits) { maxHits = ys.length; worstX = c; }
    const n = ys.length;
    const word = lang() === 'en' ? (n === 1 ? 'intersection' : 'intersections') : (n === 1 ? 'průsečík' : n >= 2 && n <= 4 ? 'průsečíky' : 'průsečíků');
    count.className = 'vl-count ' + (bad ? 'bad' : n === 1 ? 'good' : '');
    count.innerHTML = `${tex('x = ' + num(c, 2).replace(',', '{,}'))} → <b>${n}</b> ${word} ${bad ? '✗' : n === 1 ? '✓' : ''}`;
  }
  sweep.onclick = () => {
    cancelAnimationFrame(raf);
    maxHits = 0; worstX = null;
    verdict.className = 'vl-verdict';
    const t0 = performance.now(), dur = 2600;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      c = -4.9 + 9.8 * k;
      update();
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        const isF = maxHits <= 1;
        if (isF) sound.correct(); else sound.wrong();
        verdict.className = 'vl-verdict show ' + (isF ? 'good' : 'bad');
        verdict.innerHTML = isF
          ? `<b>${T('Je to graf funkce ✓', 'It is the graph of a function ✓')}</b><br>${T('Žádná svislá přímka ji neprotla víckrát než jednou.', 'No vertical line crossed it more than once.')}`
          : `<b>${T('Není to graf funkce ✗', 'Not the graph of a function ✗')}</b><br>${T('Například přímka', 'For example the line')} ${tex('x = ' + num(worstX, 1).replace(',', '{,}'))} ${T('ji protla', 'crossed it')} ${maxHits}×.`;
        if (!isF) { c = worstX; update(); }
      }
    };
    raf = requestAnimationFrame(step);
  };
  build();
  return () => cancelAnimationFrame(raf);
}
