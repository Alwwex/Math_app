// Funkce po částech: barevné předpisy, aktivní část se rozsvítí, plná/prázdná kolečka.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, drawIn } from './plot.js';

const COLORS = ['var(--accent)', 'var(--coral)', 'var(--violet)'];
const PRESETS = [
  {
    name: ['Příklad z výkladu', 'Example from the text'], fname: 'f',
    view: [-4, 3, -1, 6],
    pieces: [
      { f: x => 1 - x, a: -Infinity, b: -1, bIn: true, tex: '1 - x', cond: ['x \\le -1', 'x \\le -1'] },
      { f: x => x * x, a: -1, aIn: false, b: Infinity, tex: 'x^2', cond: ['x > -1', 'x > -1'] },
    ],
    x0: -2,
  },
  {
    name: ['Absolutní hodnota', 'Absolute value'], fname: '|x|', abs: true,
    view: [-4, 4, -1, 5],
    pieces: [
      { f: x => -x, a: -Infinity, b: 0, bIn: false, tex: '-x', cond: ['x < 0', 'x < 0'] },
      { f: x => x, a: 0, aIn: true, b: Infinity, tex: 'x', cond: ['x \\ge 0', 'x \\ge 0'] },
    ],
    x0: -2.5,
  },
  {
    name: ['Poštovné podle hmotnosti', 'Postage by weight'], fname: 'p', unit: ['Kč', 'CZK'], xunit: 'kg',
    view: [-.4, 3.6, -8, 85], step: .5, ystep: 10,
    pieces: [
      { f: () => 30, a: 0, aIn: false, b: 1, bIn: true, tex: '30', cond: ['0 < x \\le 1', '0 < x \\le 1'] },
      { f: () => 50, a: 1, aIn: false, b: 2, bIn: true, tex: '50', cond: ['1 < x \\le 2', '1 < x \\le 2'] },
      { f: () => 70, a: 2, aIn: false, b: 3, bIn: true, tex: '70', cond: ['2 < x \\le 3', '2 < x \\le 3'] },
    ],
    x0: 1.4,
  },
];

export default function piecewise(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const li = () => (lang() === 'en' ? 1 : 0);
  let P = PRESETS[0], x = P.x0;
  el.classList.add('pw');
  const pills = h('div', { class: 'fm-pills' });
  PRESETS.forEach(pr => {
    const b = h('button', { class: 'pill' + (pr === P ? ' on' : '') }, pr.name[li()]);
    b.onclick = () => { P = pr; x = pr.x0; [...pills.children].forEach(c => c.classList.toggle('on', c === b)); build(true); };
    pills.append(b);
  });
  const formula = h('div', { class: 'pw-formula' });
  const box = h('div', { class: 'pw-plot' });
  const read = h('div', { class: 'pw-read' });
  const slider = h('input', { type: 'range', class: 'range', step: .01 });
  slider.oninput = () => { x = +slider.value; update(); };
  const replay = h('button', { class: 'btn small', html: icon('play') + `<span>${T('Kreslit postupně', 'Draw step by step')}</span>` });
  replay.onclick = () => build(true);
  el.append(pills, h('div', { class: 'pw-wrap' }, h('div', { class: 'pw-side' }, formula, read, replay), box), h('div', { class: 'gr-slider' }, h('span', { html: tex('x') }), slider));

  let plot, pt, vg, rows;
  function build(animate) {
    const [xmin, xmax, ymin, ymax] = P.view;
    slider.min = xmin + .05; slider.max = xmax - .05;
    // formula
    formula.innerHTML = '';
    const lhs = h('div', { class: 'pw-lhs', html: tex(P.abs ? '|x| =' : `${P.fname}(x) =`) });
    const brace = h('div', { class: 'pw-brace' });
    const rowsBox = h('div', { class: 'pw-rows' });
    rows = P.pieces.map((pc, i) => {
      const r = h('div', { class: 'pw-row', style: { '--c': COLORS[i] } },
        h('span', { class: 'pw-dot' }),
        h('span', { class: 'pw-expr', html: tex(pc.tex) }),
        h('span', { class: 'pw-cond', html: tex(`\\text{${T('pro', 'if')} } ${pc.cond[li()]}`) }));
      rowsBox.append(r);
      return r;
    });
    formula.append(lhs, brace, rowsBox);
    // plot
    box.innerHTML = '';
    plot = new Plot(box, { xmin, xmax, ymin, ymax, width: 520, height: 400, step: P.step, ystep: P.ystep });
    P.pieces.forEach((pc, i) => {
      const a = Math.max(pc.a, xmin), b = Math.min(pc.b, xmax);
      const p = plot.curve(pc.f, { a, b, cls: 'curve thick', color: COLORS[i] });
      if (animate) drawIn(p, 700, i * 650);
      const ends = [];
      if (Number.isFinite(pc.a)) ends.push([pc.a, pc.aIn]);
      if (Number.isFinite(pc.b)) ends.push([pc.b, pc.bIn]);
      for (const [ex, inc] of ends) {
        const d = plot.dot(ex, pc.f(ex), { r: 6.5, open: !inc, cls: 'dot pw-end' + (inc ? ' closed' : '') });
        d.style.setProperty('--c', COLORS[i]);
        if (animate) d.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 350, delay: i * 650 + 600, fill: 'backwards', easing: 'cubic-bezier(.34,1.56,.64,1)' });
      }
    });
    vg = plot.line(0, 0, 0, 0, 'guide', plot.gTop);
    pt = plot.dot(0, 0, { r: 9, cls: 'dot handle' });
    plot.onDrag(p => { x = clamp(p.x, xmin + .05, xmax - .05); update(); });
    update();
  }
  function pieceAt(v) {
    return P.pieces.findIndex(pc => (v > pc.a || (pc.aIn && v === pc.a)) && (v < pc.b || (pc.bIn && v === pc.b)));
  }
  function update() {
    slider.value = x;
    // snap to nice values near breakpoints so students can test the edge cases
    let v = Math.round(x * 100) / 100;
    for (const pc of P.pieces) for (const e of [pc.a, pc.b]) if (Number.isFinite(e) && Math.abs(v - e) < .06) v = e;
    const i = pieceAt(v);
    rows.forEach((r, k) => r.classList.toggle('on', k === i));
    const xs = num(v, 2).replace(',', '{,}');
    if (i < 0) {
      pt.style.display = 'none'; vg.style.display = 'none';
      read.className = 'pw-read bad';
      read.innerHTML = `${tex(`x = ${xs}`)} ${T('nepatří do definičního oboru.', 'is not in the domain.')}`;
      return;
    }
    const pc = P.pieces[i];
    const y = pc.f(v);
    pt.style.display = ''; vg.style.display = '';
    pt.style.setProperty('--c', COLORS[i]);
    pt.setAttribute('cx', plot.X(v)); pt.setAttribute('cy', plot.Y(y));
    vg.setAttribute('x1', plot.X(v)); vg.setAttribute('x2', plot.X(v)); vg.setAttribute('y1', plot.Y(0)); vg.setAttribute('y2', plot.Y(y));
    const ys = num(y, 2).replace(',', '{,}');
    const unit = P.unit ? `\\ \\text{${P.unit[li()]}}` : '';
    const lhs = P.abs ? `|${xs}|` : `${P.fname}(${xs})`;
    const sub = pc.tex.includes('x') ? pc.tex.replace(/x/g, v < 0 ? `(${xs})` : xs) + ' = ' : '';
    read.className = 'pw-read';
    read.style.setProperty('--c', COLORS[i]);
    read.innerHTML = `<div class="muted">${tex(`${xs}`)} ${T('splňuje', 'satisfies')} ${tex(pc.cond[li()])} → ${T(`${i + 1}. předpis`, `piece ${i + 1}`)}</div><div class="pw-big">${tex(`${lhs} = ${sub}${ys}${unit}`)}</div>`;
  }
  build(true);
}
