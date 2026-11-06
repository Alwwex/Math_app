// Sudá / lichá funkce: překlop graf podle osy y nebo ho otoč kolem počátku a uvidíš, jestli sedí.
import { h, tex, sound } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s, drawIn } from './plot.js';

const PRESETS = [
  { tex: 'x^2', f: x => x * x, kind: 'even' },
  { tex: 'x^3', f: x => x ** 3, kind: 'odd' },
  { tex: '\\tfrac14 x^4 - x^2', f: x => x ** 4 / 4 - x * x, kind: 'even' },
  { tex: 'x^3 - 3x', f: x => x ** 3 - 3 * x, kind: 'odd' },
  { tex: '\\tfrac{1}{x}', f: x => (Math.abs(x) < 1e-9 ? NaN : 1 / x), kind: 'odd' },
  { tex: '\\tfrac12 x^2 + x', f: x => x * x / 2 + x, kind: 'none' },
];

export default function symmetry(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let P = PRESETS[0], a = 1.5, busy = false;
  el.classList.add('sy');
  const pills = h('div', { class: 'fm-pills' });
  PRESETS.forEach(pr => {
    const b = h('button', { class: 'pill' + (pr === P ? ' on' : ''), html: tex('f(x) = ' + pr.tex) });
    b.onclick = () => { if (busy) return; P = pr; [...pills.children].forEach(c => c.classList.toggle('on', c === b)); build(); };
    pills.append(b);
  });
  const box = h('div', { class: 'sy-plot' });
  const bMirror = h('button', { class: 'btn soft' }, '🪞 ' + T('Překlopit podle osy y', 'Reflect in the y-axis'));
  const bRotate = h('button', { class: 'btn soft' }, '🔄 ' + T('Otočit kolem počátku o 180°', 'Rotate 180° about the origin'));
  const verdict = h('div', { class: 'sy-verdict' });
  const vals = h('div', { class: 'sy-vals' });
  const slider = h('input', { type: 'range', class: 'range', min: .2, max: 3, step: .01, value: a });
  slider.oninput = () => { a = +slider.value; updatePts(); };
  el.append(pills, h('div', { class: 'sy-wrap' }, box, h('div', { class: 'sy-side' }, bMirror, bRotate, verdict, vals, h('label', { class: 'sy-a' }, h('span', { html: tex('a') }), slider))));

  let plot, ghost, main, gp;
  const X0 = () => plot.X(0), Y0 = () => plot.Y(0);
  function build() {
    box.innerHTML = '';
    verdict.className = 'sy-verdict'; verdict.innerHTML = '';
    plot = new Plot(box, { xmin: -4, xmax: 4, ymin: -4, ymax: 4, width: 480, height: 440 });
    s('line', { x1: X0(), x2: X0(), y1: 0, y2: plot.height, class: 'sy-mirror' }, plot.gBack);
    main = plot.curve(P.f, { cls: 'curve thick' });
    drawIn(main, 700);
    ghost = s('g', { class: 'sy-ghost' }, plot.gMain);
    plot.curve(P.f, { cls: 'curve ghostline', parent: ghost });
    ghost.style.opacity = 0;
    gp = s('g', {}, plot.gTop);
    updatePts();
  }
  function updatePts() {
    gp.innerHTML = '';
    const fa = P.f(a), fm = P.f(-a);
    if (Number.isFinite(fa) && Number.isFinite(fm)) {
      s('line', { x1: plot.X(a), y1: plot.Y(fa), x2: plot.X(-a), y2: plot.Y(fm), class: 'guide' }, gp);
      plot.dot(a, fa, { r: 7, cls: 'dot sy-p', parent: gp });
      plot.dot(-a, fm, { r: 7, cls: 'dot sy-q', parent: gp });
    }
    const as = num(a, 2).replace(',', '{,}');
    const same = Math.abs(fa - fm) < 1e-9, opp = Math.abs(fa + fm) < 1e-9;
    vals.innerHTML = `<div class="sy-p-t">${tex(`f(${as}) = ${num(fa, 2).replace(',', '{,}')}`)}</div><div class="sy-q-t">${tex(`f(-${as}) = ${num(fm, 2).replace(',', '{,}')}`)}</div>
      <div class="muted">${same ? T('Hodnoty jsou <b>stejné</b> → f(−a) = f(a)', 'Values are <b>equal</b> → f(−a) = f(a)') : opp ? T('Hodnoty jsou <b>opačné</b> → f(−a) = −f(a)', 'Values are <b>opposite</b> → f(−a) = −f(a)') : T('Ani stejné, ani opačné.', 'Neither equal nor opposite.')}</div>`;
  }
  async function animate(type) {
    if (busy) return;
    busy = true;
    verdict.className = 'sy-verdict';
    ghost.style.transformBox = 'view-box';
    ghost.style.transformOrigin = `${X0()}px ${Y0()}px`;
    ghost.style.opacity = 1;
    const frames = type === 'mirror'
      ? [{ transform: 'scale(1, 1)' }, { transform: 'scale(-1, 1)' }]
      : [{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }];
    await ghost.animate(frames, { duration: 1400, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }).finished;
    const match = (type === 'mirror' && P.kind === 'even') || (type === 'rotate' && P.kind === 'odd');
    if (match) sound.correct(); else sound.wrong();
    main.classList.toggle('match', match);
    verdict.className = 'sy-verdict show ' + (match ? 'good' : 'bad');
    verdict.innerHTML = match
      ? (type === 'mirror' ? `<b>${T('Sedí přesně! Funkce je sudá.', 'Perfect match! The function is even.')}</b> ${tex('f(-x) = f(x)')}` : `<b>${T('Sedí přesně! Funkce je lichá.', 'Perfect match! The function is odd.')}</b> ${tex('f(-x) = -f(x)')}`)
      : (type === 'mirror' ? T('Nesedí – podle osy y souměrná není, takže <b>není sudá</b>.', 'No match – not symmetric about the y-axis, so <b>not even</b>.') : T('Nesedí – podle počátku souměrná není, takže <b>není lichá</b>.', 'No match – not symmetric about the origin, so <b>not odd</b>.'));
    setTimeout(() => { ghost.getAnimations().forEach(an => an.cancel()); ghost.style.opacity = 0; main.classList.remove('match'); busy = false; }, 2200);
  }
  bMirror.onclick = () => animate('mirror');
  bRotate.onclick = () => animate('rotate');
  build();
}
