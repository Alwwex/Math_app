// Matice 2×2 jako zobrazení roviny: mřížka se transformuje, determinant = plocha, vlastní vektory zůstávají na své přímce.
import { h, tex } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s } from './plot.js';

const f2 = v => num(v, 2).replace(',', '{,}');
export default function matrix2d(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let M = [1, 1, 0, 1], shown = [1, 0, 0, 1], raf = 0;
  const presets = [
    [T('Zkosení', 'Shear'), [1, 1, 0, 1]], [T('Otočení 45°', 'Rotation 45°'), [Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2]],
    [T('Symetrická', 'Symmetric'), [2, 1, 1, 2]], [T('Zrcadlení', 'Reflection'), [1, 0, 0, -1]], [T('Natažení', 'Stretch'), [2, 0, 0, .5]], [T('Singulární', 'Singular'), [1, 2, .5, 1]],
  ];
  const pills = h('div', { class: 'fm-pills' });
  presets.forEach(([l, m]) => pills.append(h('button', { class: 'pill', onclick: e => { [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); M = m.slice(); syncInputs(); animate(); } }, l)));
  const inputs = [0, 1, 2, 3].map(i => { const inp = h('input', { class: 'input mx-in', type: 'number', step: .1, value: M[i] }); inp.oninput = () => { const v = parseFloat(inp.value); if (Number.isFinite(v)) { M[i] = v; animate(); } }; return inp; });
  const syncInputs = () => inputs.forEach((inp, i) => { inp.value = Math.round(M[i] * 100) / 100; });
  const matBox = h('div', { class: 'mx-mat' }, h('span', { class: 'mx-br' }), h('div', { class: 'mx-grid' }, ...inputs), h('span', { class: 'mx-br r' }));
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  const replay = h('button', { class: 'btn small tinted', html: icon('play') + `<span>${T('Přehrát', 'Replay')}</span>`, onclick: () => { shown = [1, 0, 0, 1]; animate(); } });
  el.append(pills, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, h('div', { class: 'mx-row' }, h('span', { html: tex('A =') }), matBox), info, replay)));
  function eig(m) {
    const [a, b, c, d] = m, tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
    if (disc < -1e-9) return null;
    const l1 = tr / 2 + Math.sqrt(Math.max(disc, 0)), l2 = tr / 2 - Math.sqrt(Math.max(disc, 0));
    const vec = l => (Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : (Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]));
    return [[l1, vec(l1)], [l2, vec(l2)]];
  }
  let plot;
  function draw(m) {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -4, xmax: 4, ymin: -3, ymax: 3, width: 600, height: 450, step: 1, ystep: 1, labels: false });
    const tr = (x, y) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y];
    for (let k = -8; k <= 8; k++) {
      const [x1, y1] = tr(k, -8), [x2, y2] = tr(k, 8), [x3, y3] = tr(-8, k), [x4, y4] = tr(8, k);
      s('line', { x1: plot.X(x1), y1: plot.Y(y1), x2: plot.X(x2), y2: plot.Y(y2), class: 'mx-gl' + (k === 0 ? ' axis-t' : '') }, plot.gBack);
      s('line', { x1: plot.X(x3), y1: plot.Y(y3), x2: plot.X(x4), y2: plot.Y(y4), class: 'mx-gl' + (k === 0 ? ' axis-t' : '') }, plot.gBack);
    }
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => tr(x, y));
    const det = m[0] * m[3] - m[1] * m[2];
    s('polygon', { points: sq.map(([x, y]) => `${plot.X(x)},${plot.Y(y)}`).join(' '), class: 'mx-sq ' + (det >= 0 ? 'pos' : 'neg') }, plot.gMain);
    const e1 = tr(1, 0), e2 = tr(0, 1);
    for (const [v, c] of [[e1, 'var(--green)'], [e2, 'var(--red)']]) { s('line', { x1: plot.X(0), y1: plot.Y(0), x2: plot.X(v[0]), y2: plot.Y(v[1]), style: `stroke:${c};stroke-width:4;stroke-linecap:round` }, plot.gMain); const d = plot.dot(v[0], v[1], { r: 6 }); d.style.fill = c; }
    const E = eig(M);
    if (E) for (const [, v] of E) { const L = Math.hypot(...v) || 1; s('line', { x1: plot.X(-6 * v[0] / L), y1: plot.Y(-6 * v[1] / L), x2: plot.X(6 * v[0] / L), y2: plot.Y(6 * v[1] / L), class: 'mx-eig' }, plot.gMain); }
    const detM = M[0] * M[3] - M[1] * M[2];
    info.innerHTML = `<div>${tex(`\\det A = ${f2(detM)}`)}</div><div class="muted small">${T('= kolikrát se zvětší plocha (žlutý čtverec). Záporné znaménko = převrácení orientace.', '= area scale factor (yellow square). Negative = orientation flipped.')}</div>` +
      (E ? `<div>${tex(`\\lambda_1 = ${f2(E[0][0])},\\quad \\lambda_2 = ${f2(E[1][0])}`)}</div><div class="muted small">${T('Fialové přímky = vlastní směry: vektory na nich se jen natáhnou λ-krát.', 'Purple lines = eigen-directions: vectors there are only stretched by λ.')}</div>` : `<div class="muted small">${T('Žádná reálná vlastní čísla – matice všechno otáčí.', 'No real eigenvalues – the matrix rotates everything.')}</div>`) +
      (Math.abs(detM) < 1e-6 ? `<div class="bad-t small">${T('Singulární matice: rovina se zmáčkne do přímky, inverze neexistuje.', 'Singular: the plane collapses to a line, no inverse.')}</div>` : '');
  }
  function animate() {
    cancelAnimationFrame(raf);
    const from = shown.slice(), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - k, 3);
      shown = from.map((v, i) => v + (M[i] - v) * e);
      draw(shown);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  pills.firstChild.classList.add('on');
  animate();
  return () => cancelAnimationFrame(raf);
}
