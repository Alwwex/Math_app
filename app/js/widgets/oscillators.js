// Dvě závaží na třech pružinách – normální módy (ve fázi / v protifázi) a jejich skládání.
import { h, tex } from '../util.js';
import { lang } from '../i18n.js';
import { icon } from '../icons.js';
import { s } from './plot.js';

export default function oscillators(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const w1 = 1, w2 = Math.sqrt(3); // k/m = 1 → ω1 = 1, ω2 = √3
  let A = 1, B = 0, t = 0, raf = 0, running = true;
  const modes = [[T('Mód 1: ve fázi', 'Mode 1: in phase'), 1, 0], [T('Mód 2: v protifázi', 'Mode 2: out of phase'), 0, 1], [T('Směs obou', 'Mixture'), .7, .7], [T('Jen první vychýlené', 'Only first displaced'), .5, .5]];
  const pills = h('div', { class: 'fm-pills' });
  modes.forEach(([l, a, b], i) => pills.append(h('button', { class: 'pill' + (i === 0 ? ' on' : ''), onclick: e => { A = a; B = b; t = 0; hist = []; [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, l)));
  const W = 600, H = 300;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'osc-svg' });
  const info = h('div', { class: 'pp-info' });
  const pause = h('button', { class: 'btn icon tinted', html: icon('pause'), onclick: () => { running = !running; pause.innerHTML = icon(running ? 'pause' : 'play'); if (running) loop(); } });
  el.append(pills, h('div', { class: 'osc-wrap' }, svg), h('div', { class: 'pp-ctrl' }, pause, info));
  let hist = [];
  function spring(x1, x2, y) {
    const n = 12, L = x2 - x1; let d = `M${x1} ${y}`;
    for (let i = 1; i < n; i++) d += `L${x1 + L * i / n} ${y + (i % 2 ? -12 : 12)}`;
    return d + `L${x2} ${y}`;
  }
  function draw() {
    const x1 = A * Math.cos(w1 * t) + B * Math.cos(w2 * t), x2 = A * Math.cos(w1 * t) - B * Math.cos(w2 * t);
    hist.push([x1, x2]); if (hist.length > 360) hist.shift();
    const y = 80, X1 = 200 + x1 * 40, X2 = 400 + x2 * 40;
    let g = `<line x1="30" y1="40" x2="30" y2="120" class="osc-wall"/><line x1="570" y1="40" x2="570" y2="120" class="osc-wall"/>`;
    g += `<path d="${spring(30, X1 - 26, y)}" class="osc-spring"/><path d="${spring(X1 + 26, X2 - 26, y)}" class="osc-spring mid"/><path d="${spring(X2 + 26, 570, y)}" class="osc-spring"/>`;
    g += `<rect x="${X1 - 26}" y="${y - 26}" width="52" height="52" rx="12" class="osc-mass a"/><rect x="${X2 - 26}" y="${y - 26}" width="52" height="52" rx="12" class="osc-mass b"/>`;
    g += `<text x="${X1}" y="${y + 6}" class="osc-t">m</text><text x="${X2}" y="${y + 6}" class="osc-t">m</text>`;
    const base = 225;
    const path = k => hist.map((p, i) => `${i ? 'L' : 'M'}${30 + i * 1.5} ${base - p[k] * 32}`).join('');
    g += `<line x1="30" y1="${base}" x2="570" y2="${base}" class="osc-axis"/><path d="${path(0)}" class="osc-line a"/><path d="${path(1)}" class="osc-line b"/>`;
    svg.innerHTML = g;
    info.innerHTML = tex(`x_1 = A\\cos t + B\\cos\\sqrt3\\,t,\\quad x_2 = A\\cos t - B\\cos\\sqrt3\\,t`) + `<div class="muted small">${T('Normální mód = všechna tělesa kmitají stejnou frekvencí. Libovolný pohyb je jejich součet.', 'Normal mode = everything oscillates at one frequency. Any motion is a sum of modes.')}</div>`;
  }
  function loop() { if (!running) return; t += .045; draw(); raf = requestAnimationFrame(loop); }
  loop();
  return () => { running = false; cancelAnimationFrame(raf); };
}
