// Newtonova–Raphsonova metoda: tečny „skáčou" ke kořeni. Klepni na osu x pro nový start.
import { h, tex, sleep, sound } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s } from './plot.js';

export default function newton(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const F = [
    { tex: 'x^3 - 2x - 5', f: x => x ** 3 - 2 * x - 5, d: x => 3 * x * x - 2, view: [-1, 4, -10, 25], x0: 3.5 },
    { tex: '\\cos x - x', f: x => Math.cos(x) - x, d: x => -Math.sin(x) - 1, view: [-1, 3, -3.5, 1.6], x0: 2.5 },
    { tex: 'x^2 - 2', f: x => x * x - 2, d: x => 2 * x, view: [-.5, 4, -3, 12], x0: 3.6 },
  ];
  let cur = F[0], x0 = cur.x0, busy = false;
  const pills = h('div', { class: 'fm-pills' });
  F.forEach((f, i) => pills.append(h('button', { class: 'pill' + (i === 0 ? ' on' : ''), html: tex(`f(x) = ${f.tex}`), onclick: e => { cur = f; x0 = f.x0; [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); build(); } })));
  const box = h('div', { class: 'cp-plot' }), table = h('div', { class: 'nw-table' });
  const run = h('button', { class: 'btn primary capsule', html: icon('play') + `<span>${T('Iterovat', 'Iterate')}</span>` });
  el.append(pills, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, h('div', { class: 'pp-info' }, h('div', { html: tex('x_{n+1} = x_n - \\dfrac{f(x_n)}{f\'(x_n)}', true) })), run, table, h('p', { class: 'subtle small' }, T('Klepnutím do grafu zvolíš start x₀.', 'Tap the plot to choose the start x₀.')))));
  let plot, g;
  function build() {
    box.innerHTML = ''; table.innerHTML = '';
    const [a, b, c, d] = cur.view;
    plot = new Plot(box, { xmin: a, xmax: b, ymin: c, ymax: d, width: 600, height: 420 });
    plot.curve(cur.f, { cls: 'curve thick' });
    g = s('g', {}, plot.gTop);
    plot.dot(x0, 0, { r: 7, cls: 'dot nw-start' });
    plot.svg.onclick = e => { if (busy) return; x0 = plot.toPlot(e).x; build(); };
  }
  run.onclick = async () => {
    if (busy) return; busy = true; build();
    let x = x0; const rows = [[0, x]];
    for (let n = 1; n <= 6; n++) {
      const fx = cur.f(x), dx = cur.d(x);
      if (Math.abs(dx) < 1e-9) break;
      const xn = x - fx / dx;
      s('line', { x1: plot.X(x), y1: plot.Y(0), x2: plot.X(x), y2: plot.Y(fx), class: 'guide' }, g);
      const tan = s('line', { x1: plot.X(x), y1: plot.Y(fx), x2: plot.X(xn), y2: plot.Y(0), class: 'nw-tan' }, g);
      const L = Math.hypot(plot.X(xn) - plot.X(x), plot.Y(0) - plot.Y(fx));
      tan.style.strokeDasharray = L; tan.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 500, easing: 'ease-out', fill: 'forwards' });
      plot.dot(x, fx, { r: 5, cls: 'dot nw-pt' });
      await sleep(560);
      const dd = plot.dot(xn, 0, { r: 6, cls: 'dot nw-x pop-in' }); void dd;
      sound.pop();
      rows.push([n, xn]);
      table.innerHTML = rows.map(([k, v]) => `<div>${tex(`x_{${k}} = ${num(v, 8).replace(',', '{,}')}`)}</div>`).join('');
      if (Math.abs(xn - x) < 1e-9) break;
      x = xn;
    }
    table.insertAdjacentHTML('beforeend', `<div class="muted small">${T('Počet platných číslic se zhruba zdvojnásobí v každém kroku (kvadratická konvergence).', 'The number of correct digits roughly doubles each step (quadratic convergence).')}</div>`);
    busy = false;
  };
  build();
}
