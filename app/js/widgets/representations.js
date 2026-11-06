// Čtyři zápisy jedné funkce (slovně / tabulka / graf / vzorec) + animace padajícího kamene.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s } from './plot.js';

export default function representations(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const sf = t => 5 * t * t;
  let t = 1.5, playing = false, raf = 0;
  el.classList.add('rep');

  // ---- scene: bridge + falling stone
  const scene = h('div', { class: 'rep-scene' });
  const SW = 220, SH = 420, top = 60, bottom = 390;
  const svg = s('svg', { viewBox: `0 0 ${SW} ${SH}` });
  scene.append(svg);
  const sky = s('rect', { x: 0, y: 0, width: SW, height: SH, class: 'rep-sky' }, svg); void sky;
  s('rect', { x: 0, y: top - 14, width: 120, height: 14, rx: 3, class: 'rep-bridge' }, svg);
  for (let i = 0; i < 5; i++) s('rect', { x: 8 + i * 24, y: top - 30, width: 4, height: 16, class: 'rep-rail' }, svg);
  s('rect', { x: 0, y: top - 32, width: 120, height: 4, rx: 2, class: 'rep-rail' }, svg);
  s('rect', { x: 0, y: bottom, width: SW, height: SH - bottom, class: 'rep-water' }, svg);
  s('path', { d: `M0 ${bottom} q 14 -6 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0`, class: 'rep-wave' }, svg);
  // ruler
  for (let m = 0; m <= 45; m += 5) {
    const y = top + (bottom - top) * m / 45;
    s('line', { x1: 168, x2: m % 10 === 0 ? 184 : 178, y1: y, y2: y, class: 'rep-tick' }, svg);
    if (m % 10 === 0 || m === 45) s('text', { x: 190, y: y + 4, class: 'rep-tl' }, svg).textContent = m + ' m';
  }
  s('line', { x1: 168, x2: 168, y1: top, y2: bottom, class: 'rep-tick' }, svg);
  const trail = s('line', { x1: 140, x2: 140, y1: top, y2: top, class: 'rep-trail' }, svg);
  const stone = s('g', {}, svg);
  s('path', { d: 'M-11 -3 Q-9 -12 0 -12 Q11 -11 12 -2 Q13 9 2 11 Q-10 12 -12 4 Z', class: 'rep-stone' }, stone);
  s('path', { d: 'M-4 -6 q 3 -2 6 0', class: 'rep-stone-hl' }, stone);
  const splash = s('g', { class: 'rep-splash', transform: `translate(140 ${bottom})` }, svg);
  for (let i = 0; i < 6; i++) s('circle', { r: 3, cx: 0, cy: 0, class: 'drop', style: `--a:${-150 + i * 24}deg` }, splash);
  const clock = h('div', { class: 'rep-clock' });
  scene.append(clock);

  // ---- four cards
  const cards = h('div', { class: 'rep-cards' });
  const cWords = h('div', { class: 'rep-card' }, h('div', { class: 'rep-cap' }, '🗣️ ' + T('Slovně', 'In words')));
  const words = h('p', { class: 'rep-words' });
  cWords.append(words);
  const cTable = h('div', { class: 'rep-card' }, h('div', { class: 'rep-cap' }, '🔢 ' + T('Tabulkou', 'Table')));
  const tbl = h('table', { class: 'rep-table' });
  const ts = [0, .5, 1, 1.5, 2, 2.5, 3];
  tbl.innerHTML = `<tr><th>${tex('t\\,[\\mathrm{s}]')}</th>${ts.map(v => `<td>${num(v)}</td>`).join('')}</tr><tr><th>${tex('s\\,[\\mathrm{m}]')}</th>${ts.map(v => `<td>${num(sf(v))}</td>`).join('')}</tr>`;
  cTable.append(h('div', { class: 'rep-table-wrap' }, tbl));
  const cGraph = h('div', { class: 'rep-card' }, h('div', { class: 'rep-cap' }, '📈 ' + T('Grafem', 'Graph')));
  const pbox = h('div');
  cGraph.append(pbox);
  const plot = new Plot(pbox, { xmin: -.3, xmax: 3.4, ymin: -4, ymax: 50, width: 340, height: 200, xlabel: 't', ylabel: 's', step: .5, ystep: 10 });
  plot.curve(sf, { a: 0, b: 3, cls: 'curve' });
  const vg = plot.line(t, 0, t, sf(t), 'guide', plot.gTop);
  const hg = plot.line(0, sf(t), t, sf(t), 'guide', plot.gTop);
  const pd = plot.dot(t, sf(t), { r: 6, cls: 'dot big' });
  const cFormula = h('div', { class: 'rep-card' }, h('div', { class: 'rep-cap' }, '✍️ ' + T('Vzorcem', 'Formula')));
  const formula = h('div', { class: 'rep-formula' });
  cFormula.append(formula);
  cards.append(cWords, cTable, cGraph, cFormula);

  // ---- controls
  const slider = h('input', { type: 'range', min: 0, max: 3, step: .01, value: t, class: 'range' });
  const play = h('button', { class: 'btn icon primary', html: icon('play'), 'aria-label': 'play' });
  const ctr = h('div', { class: 'rep-ctrl' }, play, h('span', { class: 'rep-t', html: tex('t') }), slider);
  el.append(h('div', { class: 'rep-grid' }, scene, cards), ctr);

  function update() {
    const sv = sf(t);
    const y = top + (bottom - top) * sv / 45;
    stone.setAttribute('transform', `translate(140 ${y - 10}) rotate(${t * 120})`);
    trail.setAttribute('y2', Math.max(top, y - 14));
    clock.innerHTML = `⏱ ${num(t, 2)} s`;
    words.innerHTML = T(`Kámen padá <b>${num(t, 2)} s</b>, a tak už urazil <b>${num(sv, 1)} m</b>.`, `The stone has been falling for <b>${num(t, 2)} s</b>, so it has dropped <b>${num(sv, 1)} m</b>.`);
    const near = ts.reduce((b, v, i) => (Math.abs(v - t) < Math.abs(ts[b] - t) ? i : b), 0);
    tbl.querySelectorAll('td').forEach((td, i) => td.classList.toggle('hit', i % ts.length === near && Math.abs(ts[near] - t) < .13));
    vg.setAttribute('x1', plot.X(t)); vg.setAttribute('x2', plot.X(t)); vg.setAttribute('y1', plot.Y(0)); vg.setAttribute('y2', plot.Y(sv));
    hg.setAttribute('x1', plot.X(0)); hg.setAttribute('x2', plot.X(t)); hg.setAttribute('y1', plot.Y(sv)); hg.setAttribute('y2', plot.Y(sv));
    pd.setAttribute('cx', plot.X(t)); pd.setAttribute('cy', plot.Y(sv));
    const ts2 = num(t, 2).replace(',', '{,}');
    formula.innerHTML = tex('s(t) = 5t^2', true) + tex(`s(${ts2}) = 5 \\cdot ${ts2}^2 \\approx ${num(sv, 2).replace(',', '{,}')}\\ \\mathrm{m}`, true);
    slider.value = t;
    splash.classList.toggle('on', t >= 2.999);
  }
  slider.oninput = () => { stop(); t = +slider.value; update(); };
  function stop() { playing = false; cancelAnimationFrame(raf); play.innerHTML = icon('play'); }
  play.onclick = () => {
    if (playing) return stop();
    if (t >= 2.99) t = 0;
    playing = true; play.innerHTML = icon('pause');
    let last = performance.now();
    const step = now => {
      t = clamp(t + (now - last) / 1000, 0, 3); last = now;
      update();
      if (t >= 3) return stop();
      if (playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  update();
  return () => cancelAnimationFrame(raf);
}
