// Rostoucí / klesající: kulička jede po grafu zleva doprava a barví ho.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s } from './plot.js';

const PRESETS = [
  {
    name: ['f(x) = x³ − 3x', 'f(x) = x³ − 3x'], f: x => x ** 3 - 3 * x, view: [-2.4, 2.4, -5, 5], xs: 'x', ys: 'y',
    turns: [-1, 1], kinds: ['inc', 'dec', 'inc'],
    iv: [['(-\\infty, -1\\rangle', '(-\\infty, -1]'], ['\\langle -1, 1\\rangle', '[-1, 1]'], ['\\langle 1, \\infty)', '[1, \\infty)']],
  },
  {
    name: ['Teplota během dne', 'Temperature during a day'], f: h0 => 10 - 6 * Math.cos(Math.PI * (h0 - 3) / 12), view: [-1, 25, -2, 19], step: 3, ystep: 4, a: 0, b: 24, xs: 'h', ys: '°C',
    turns: [3, 15], kinds: ['dec', 'inc', 'dec'],
    iv: [['\\langle 0, 3\\rangle', '[0, 3]'], ['\\langle 3, 15\\rangle', '[3, 15]'], ['\\langle 15, 24\\rangle', '[15, 24]']],
    story: ['Ráno ve 3 h je nejchladněji (4 °C), odpoledne v 15 h nejtepleji (16 °C).', 'At 3 a.m. it is coldest (4 °C), at 3 p.m. warmest (16 °C).'],
  },
];

export default function monotonic(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const li = () => (lang() === 'en' ? 1 : 0);
  let P = PRESETS[0], x, raf = 0, playing = false;
  el.classList.add('mo');
  const pills = h('div', { class: 'fm-pills' });
  PRESETS.forEach(pr => {
    const b = h('button', { class: 'pill' + (pr === P ? ' on' : '') }, pr.name[li()]);
    b.onclick = () => { stop(); P = pr; [...pills.children].forEach(c => c.classList.toggle('on', c === b)); build(); };
    pills.append(b);
  });
  const box = h('div', { class: 'mo-plot' });
  const badge = h('div', { class: 'mo-badge' });
  const ivs = h('div', { class: 'mo-ivs' });
  const story = h('p', { class: 'muted' });
  const play = h('button', { class: 'btn primary', html: icon('play') + `<span>${T('Spustit jízdu', 'Start the ride')}</span>` });
  const slider = h('input', { type: 'range', class: 'range', step: .01 });
  slider.oninput = () => { stop(); x = +slider.value; update(); };
  el.append(pills, h('div', { class: 'mo-wrap' }, box, h('div', { class: 'mo-side' }, badge, play, ivs, story)), h('div', { class: 'gr-slider' }, h('span', { html: tex(PRESETS[0].xs) }), slider));

  let plot, trailG, ball, a, b;
  function build() {
    const [xmin, xmax, ymin, ymax] = P.view;
    a = P.a ?? xmin + .05; b = P.b ?? xmax - .05;
    x = a;
    slider.min = a; slider.max = b; slider.value = x;
    box.innerHTML = '';
    plot = new Plot(box, { xmin, xmax, ymin, ymax, width: 560, height: 400, step: P.step, ystep: P.ystep, xlabel: P.xs, ylabel: P.ys });
    const base = plot.curve(P.f, { a, b, cls: 'curve faint' });
    void base;
    trailG = s('g', {}, plot.gMain);
    for (const tx of P.turns) {
      s('line', { x1: plot.X(tx), x2: plot.X(tx), y1: 0, y2: plot.height, class: 'mo-turn' }, plot.gBack);
    }
    ball = s('g', { class: 'mo-ball' }, plot.gTop);
    s('circle', { r: 11 }, ball);
    s('path', { d: 'M-5 0 L5 0 M1 -4 L5 0 L1 4', class: 'mo-arrow' }, ball);
    story.textContent = P.story ? P.story[li()] : '';
    ivs.innerHTML = '';
    update();
  }
  function kindAt(v) {
    let i = 0;
    while (i < P.turns.length && v > P.turns[i]) i++;
    return P.kinds[i];
  }
  function update() {
    const y = P.f(x);
    // trail split into monotonic runs
    trailG.innerHTML = '';
    const cuts = [a, ...P.turns.filter(tp => tp > a && tp < x), x];
    for (let i = 0; i < cuts.length - 1; i++) {
      const k = kindAt((cuts[i] + cuts[i + 1]) / 2);
      plot.curve(P.f, { a: cuts[i], b: cuts[i + 1], cls: 'curve thick mo-' + k, parent: trailG });
    }
    const eps = (b - a) / 400;
    const dy = P.f(x + eps) - P.f(x - eps);
    const ang = Math.atan2(-(plot.Y(P.f(x + eps)) - plot.Y(P.f(x - eps))), plot.X(x + eps) - plot.X(x - eps)) * 180 / Math.PI;
    ball.setAttribute('transform', `translate(${plot.X(x)} ${plot.Y(clamp(y, P.view[2], P.view[3]))}) rotate(${-ang})`);
    const k = Math.abs(dy) < 1e-4 ? 'flat' : dy > 0 ? 'inc' : 'dec';
    ball.setAttribute('class', 'mo-ball ' + k);
    badge.className = 'mo-badge ' + k;
    badge.innerHTML = k === 'inc' ? T('Funkce <b>ROSTE</b> ↗', 'The function is <b>INCREASING</b> ↗') : k === 'dec' ? T('Funkce <b>KLESÁ</b> ↘', 'The function is <b>DECREASING</b> ↘') : T('Bod obratu ⟳', 'Turning point ⟳');
    slider.value = x;
    // reveal intervals already passed (only re-render when the count changes)
    const shown = P.kinds.filter((_, i) => i === 0 || x >= P.turns[i - 1] + .02).length;
    if (ivs.childElementCount !== shown) {
      ivs.innerHTML = '';
      P.kinds.slice(0, shown).forEach((kk, i) => ivs.append(h('div', { class: 'mo-iv ' + kk + (i === shown - 1 ? ' rise' : ''), html: `${kk === 'inc' ? T('roste na', 'increasing on') : T('klesá na', 'decreasing on')} ${tex(P.iv[i][li()])}` })));
    }
    void num;
  }
  function stop() { playing = false; cancelAnimationFrame(raf); play.innerHTML = icon('play') + `<span>${T('Spustit jízdu', 'Start the ride')}</span>`; }
  play.onclick = () => {
    if (playing) return stop();
    if (x >= b - .01) x = a;
    playing = true;
    play.innerHTML = icon('pause') + `<span>${T('Pauza', 'Pause')}</span>`;
    let last = performance.now();
    const speed = (b - a) / 4.5;
    const step = now => {
      const dt = (now - last) / 1000; last = now;
      // slow down near turning points
      const near = Math.min(...P.turns.map(tp => Math.abs(tp - x))) / (b - a);
      x = Math.min(b, x + dt * speed * (0.35 + Math.min(1, near * 8)));
      update();
      if (x >= b) return stop();
      if (playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  build();
  return () => cancelAnimationFrame(raf);
}
