// Galtonova deska: kuličky padají přes kolíky, histogram se blíží binomickému a normálnímu rozdělení.
import { h, tex } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { s } from './plot.js';

export default function galton(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let rows = 10, p = .5, balls = [], bins, total = 0, raf = 0, running = false;
  const W = 600, H = 420;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gal-svg' });
  const info = h('div', { class: 'pp-info' });
  const rowR = h('input', { type: 'range', class: 'range', min: 4, max: 16, step: 1, value: rows });
  const pR = h('input', { type: 'range', class: 'range', min: .1, max: .9, step: .05, value: p });
  const rowL = h('span', { class: 'pp-val' }), pL = h('span', { class: 'pp-val' });
  const go = h('button', { class: 'btn primary capsule', html: icon('play') + `<span>${T('Pustit kuličky', 'Drop balls')}</span>` });
  const reset = () => { bins = new Array(rows + 1).fill(0); total = 0; balls = []; };
  rowR.oninput = () => { rows = +rowR.value; reset(); draw(); };
  pR.oninput = () => { p = +pR.value; reset(); draw(); };
  el.append(h('div', { class: 'osc-wrap' }, svg), h('div', { class: 'pp-ctrl' }, go, h('label', { class: 'pp-slider' }, rowL, rowR), h('label', { class: 'pp-slider' }, pL, pR)), info);
  reset();
  const top = 30, pegGap = (H * .45) / rows;
  const colX = k => W / 2 + (k - rows / 2) * Math.min(34, (W - 60) / (rows + 1));
  function draw() {
    rowL.innerHTML = tex(`n = ${rows}`); pL.innerHTML = tex(`p = ${num(p, 2).replace(',', '{,}')}`);
    let g = '';
    for (let r = 0; r < rows; r++) for (let k = 0; k <= r; k++) g += `<circle cx="${W / 2 + (k - r / 2) * Math.min(34, (W - 60) / (rows + 1))}" cy="${top + r * pegGap}" r="3.5" class="gal-peg"/>`;
    const baseY = H - 14, maxH = H * .38, maxB = Math.max(1, ...bins);
    const bw = Math.min(34, (W - 60) / (rows + 1)) - 4;
    bins.forEach((c, k) => { const hh = c / maxB * maxH; g += `<rect x="${colX(k) - bw / 2}" y="${baseY - hh}" width="${bw}" height="${hh}" rx="4" class="gal-bin"/>`; });
    // expected binomial (scaled) + normal curve
    const comb = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; };
    void comb;
    if (total > 20) {
      const mu = rows * p, sd = Math.sqrt(rows * p * (1 - p));
      let d = '';
      for (let i = 0; i <= 120; i++) { const k = -0.5 + (rows + 1) * i / 120; const y = total * Math.exp(-((k - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)); d += `${i ? 'L' : 'M'}${colX(k).toFixed(1)} ${(baseY - Math.min(y / maxB * maxH, maxH * 1.3)).toFixed(1)}`; }
      g += `<path d="${d}" class="gal-normal"/>`;
    }
    for (const b of balls) g += `<circle cx="${b.x}" cy="${b.y}" r="5" class="gal-ball"/>`;
    svg.innerHTML = g;
    const mu = rows * p, v = rows * p * (1 - p);
    info.innerHTML = `<div>${tex(`\\Pr(k) = \\binom{${rows}}{k} p^k (1-p)^{${rows}-k}`)}</div><div>${tex(`\\mu = np = ${num(mu, 2).replace(',', '{,}')},\\quad \\sigma^2 = np(1-p) = ${num(v, 2).replace(',', '{,}')}`)}</div><div class="muted small">${T(`Kuliček: ${total}. Čím víc řad, tím víc se tvar blíží Gaussově křivce – centrální limitní věta.`, `Balls: ${total}. More rows → closer to the Gaussian bell – the central limit theorem.`)}</div>`;
  }
  function tick() {
    if (running && Math.random() < .55) balls.push({ r: -1, k: 0, x: W / 2, y: 6, t: 0 });
    for (const b of balls) {
      b.t += .16;
      if (b.t >= 1) {
        b.t = 0; b.r++;
        if (b.r >= rows) { bins[b.k]++; total++; b.done = true; continue; }
        if (b.r > 0 && Math.random() < p) b.k++;
      }
      const r = Math.max(b.r, 0);
      const x0 = W / 2 + (b.k - r / 2) * Math.min(34, (W - 60) / (rows + 1));
      const kk = b.k + (b.r >= 0 && b.t > .5 ? 0 : 0);
      b.x = x0 + (Math.random() - .5) * .6; b.y = top + (b.r + b.t) * pegGap - 8;
      void kk;
    }
    balls = balls.filter(b => !b.done);
    draw();
    if (running || balls.length) raf = requestAnimationFrame(tick);
  }
  go.onclick = () => {
    running = !running;
    go.innerHTML = running ? icon('pause') + `<span>${T('Zastavit', 'Stop')}</span>` : icon('play') + `<span>${T('Pustit kuličky', 'Drop balls')}</span>`;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  draw();
  return () => { running = false; cancelAnimationFrame(raf); };
}
