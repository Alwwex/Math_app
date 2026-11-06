// Animace: „funkční stroj" – vstup spadne do stroje, ozubená kola se roztočí a vypadne výstup.
import { h, tex, sleep, sound } from '../util.js';
import { L, num, lang } from '../i18n.js';
import { Plot, s } from './plot.js';

const FUNCS = [
  { key: 'lin', tex: 'f(x) = 2x + 1', f: x => 2 * x + 1, view: [-3.5, 4, -6, 9] },
  { key: 'sq', tex: 'f(x) = x^2', f: x => x * x, view: [-3.5, 4, -1.5, 10] },
  { key: 'abs', tex: 'f(x) = |x|', f: x => Math.abs(x), view: [-3.5, 4, -1, 4.5] },
  { key: 'sqrt', tex: 'f(x) = \\sqrt{x}', f: x => (x < 0 ? NaN : Math.sqrt(x)), view: [-3.5, 4, -.6, 2.6] },
];

function gearPath(r, teeth = 10, depth = 5) {
  let d = '';
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = (i % 4 === 0 || i % 4 === 1) ? r + depth : r;
    d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(2) + ' ' + (Math.sin(a) * rr).toFixed(2);
  }
  return d + 'Z';
}

export default function functionMachine(el) {
  let fn = FUNCS[0];
  let busy = false;
  const results = [];
  const T = (cs, en) => (lang() === 'en' ? en : cs);

  el.classList.add('fm');
  el.innerHTML = '';
  const pills = h('div', { class: 'fm-pills' });
  FUNCS.forEach(F => {
    const b = h('button', { class: 'pill' + (F === fn ? ' on' : ''), html: tex(F.tex) });
    b.onclick = () => { if (busy) return; queue.length = 0; fn = F; [...pills.children].forEach(c => c.classList.toggle('on', c === b)); label.innerHTML = tex(F.tex); results.length = 0; renderTable(); renderPlot(); };
    pills.append(b);
  });

  const inputs = h('div', { class: 'fm-inputs' }, h('div', { class: 'fm-cap' }, T('Vstupy', 'Inputs')));
  const chips = h('div', { class: 'fm-chips' });
  [-2, -1, 0, 1, 2, 3].forEach(v => chips.append(h('button', { class: 'fm-chip', onclick: e => feed(v, e.currentTarget) }, String(v).replace('-', '−'))));
  const own = h('input', { class: 'input fm-own', type: 'number', step: 'any', placeholder: T('vlastní', 'your own'), inputmode: 'decimal' });
  const ownBtn = h('button', { class: 'btn small primary' }, T('Vhodit', 'Drop in'));
  ownBtn.onclick = () => { const v = parseFloat(own.value.replace(',', '.')); if (Number.isFinite(v)) feed(v, own); };
  own.addEventListener('keydown', e => { if (e.key === 'Enter') ownBtn.click(); });
  inputs.append(chips, h('div', { class: 'fm-own-row' }, own, ownBtn));

  // Machine
  const machine = h('div', { class: 'fm-machine' });
  const hopper = h('div', { class: 'fm-hopper' });
  const body = h('div', { class: 'fm-body' });
  const gears = s('svg', { viewBox: '-60 -40 120 80', class: 'fm-gears' });
  const g1 = s('g', { transform: 'translate(-22 4)' }, gears); s('path', { d: gearPath(18, 10, 5), class: 'gear g1' }, g1); s('circle', { r: 5, class: 'gear-hub' }, g1);
  const g2 = s('g', { transform: 'translate(20 -6)' }, gears); s('path', { d: gearPath(13, 8, 4), class: 'gear g2' }, g2); s('circle', { r: 4, class: 'gear-hub' }, g2);
  const label = h('div', { class: 'fm-label', html: tex(fn.tex) });
  const lamp = h('div', { class: 'fm-lamp' });
  const msg = h('div', { class: 'fm-msg' });
  body.append(lamp, gears, label, msg);
  const chute = h('div', { class: 'fm-chute' });
  machine.append(hopper, body, chute);

  // Output: table + plot
  const out = h('div', { class: 'fm-out' }, h('div', { class: 'fm-cap' }, T('Výstupy', 'Outputs')));
  const table = h('table', { class: 'fm-table' });
  const plotBox = h('div', { class: 'fm-plot' });
  out.append(table, plotBox);

  const stage = h('div', { class: 'fm-stage' }, inputs, machine, out);
  el.append(pills, stage);

  let plot;
  function renderPlot() {
    plotBox.innerHTML = '';
    const [x0, x1, y0, y1] = fn.view;
    const ext = results.filter(r => Number.isFinite(r.y)).map(r => r.y);
    plot = new Plot(plotBox, { xmin: Math.min(x0, ...results.map(r => r.x - 1)), xmax: Math.max(x1, ...results.map(r => r.x + 1)), ymin: Math.min(y0, ...ext.map(v => v - 1)), ymax: Math.max(y1, ...ext.map(v => v + 1)), width: 300, height: 260, labels: true });
    if (results.length >= 3) {
      const p = plot.curve(fn.f, { cls: 'curve ghost' });
      p.style.opacity = .35;
    }
    for (const r of results) if (Number.isFinite(r.y)) plot.dot(r.x, r.y, { r: 5, cls: 'dot pop-in' });
  }
  function renderTable() {
    table.innerHTML = `<thead><tr><th>${tex('x')}</th><th>${tex('f(x)')}</th></tr></thead>`;
    const tb = h('tbody');
    for (const r of results.slice(-6)) {
      tb.append(h('tr', { class: r.fresh ? 'fresh' : '' }, h('td', {}, num(r.x)), h('td', { class: Number.isFinite(r.y) ? '' : 'bad' }, Number.isFinite(r.y) ? num(r.y) : '✕')));
      r.fresh = false;
    }
    if (!results.length) tb.append(h('tr', { class: 'empty-row' }, h('td', { colspan: 2 }, T('Klepni na vstup ←', 'Tap an input ←'))));
    table.append(tb);
  }

  const queue = [];
  async function feed(v, from) {
    if (busy) { if (queue.length < 4) queue.push([v, from]); return; }
    busy = true;
    msg.textContent = '';
    machine.classList.remove('error');
    // flying ball from the chip to the hopper
    const a = from.getBoundingClientRect(), b = hopper.getBoundingClientRect(), host = el.getBoundingClientRect();
    const ball = h('div', { class: 'fm-ball' }, num(v));
    el.append(ball);
    const x0 = a.left - host.left + a.width / 2 - 24, y0 = a.top - host.top + a.height / 2 - 24;
    const x1 = b.left - host.left + b.width / 2 - 24, y1 = b.top - host.top + 6;
    await ball.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 70}px) scale(1.1)`, offset: .5 },
      { transform: `translate(${x1}px, ${y1}px) scale(1)` },
      { transform: `translate(${x1}px, ${y1 + 50}px) scale(.3)`, opacity: 0 },
    ], { duration: 750, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' }).finished;
    ball.remove();
    machine.classList.add('working');
    sound.pop();
    await sleep(600);
    machine.classList.remove('working');
    const y = fn.f(v);
    if (!Number.isFinite(y)) {
      machine.classList.add('error');
      sound.wrong();
      msg.textContent = T(`√ ze záporného čísla neumím! ${num(v)} ∉ D(f)`, `Can't take √ of a negative! ${num(v)} ∉ domain`);
      results.push({ x: v, y: NaN, fresh: true });
      renderTable();
      busy = false;
      if (queue.length) setTimeout(() => feed(...queue.shift()), 400);
      return;
    }
    // output ball
    const c = chute.getBoundingClientRect();
    const tb = table.getBoundingClientRect();
    const out = h('div', { class: 'fm-ball out' }, num(y));
    el.append(out);
    const ox = c.left - host.left + c.width / 2 - 24, oy = c.top - host.top + c.height / 2 - 24;
    const tx = tb.left - host.left + tb.width / 2 - 24, ty = tb.top - host.top + 40;
    await out.animate([
      { transform: `translate(${ox - 30}px, ${oy}px) scale(.3)`, opacity: 0 },
      { transform: `translate(${ox}px, ${oy}px) scale(1.15)`, opacity: 1, offset: .25 },
      { transform: `translate(${tx}px, ${ty}px) scale(.8)`, opacity: .9 },
    ], { duration: 700, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).finished;
    out.remove();
    results.push({ x: v, y, fresh: true });
    renderTable(); renderPlot();
    busy = false;
    if (queue.length) feed(...queue.shift());
  }

  renderTable(); renderPlot();
  void L;
}
