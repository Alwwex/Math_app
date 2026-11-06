// Vektorové pole: šipky, proudící částice a „lopatkové kolečko", které ukazuje rotaci (curl) a divergenci.
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { Plot, s } from './plot.js';

const f2 = v => num(v, 2).replace(',', '{,}');
export default function field(el, opts = {}) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const P = [
    { k: 'rot', name: T('Vír', 'Vortex'), F: (x, y) => [-y, x], tex: '\\mathbf F = (-y,\\ x)', div: () => 0, curl: () => 2 },
    { k: 'src', name: T('Zdroj', 'Source'), F: (x, y) => [x, y], tex: '\\mathbf F = (x,\\ y)', div: () => 2, curl: () => 0 },
    { k: 'saddle', name: T('Sedlo', 'Saddle'), F: (x, y) => [x, -y], tex: '\\mathbf F = (x,\\ -y)', div: () => 0, curl: () => 0 },
    { k: 'shear', name: T('Smykový tok', 'Shear flow'), F: (x, y) => [y, 0], tex: '\\mathbf F = (y,\\ 0)', div: () => 0, curl: () => -1 },
    { k: 'grav', name: T('Gravitace', 'Gravity'), F: (x, y) => { const r = Math.max(Math.hypot(x, y), .35); return [-x / r ** 3, -y / r ** 3]; }, tex: '\\mathbf F = -\\mathbf r / r^3', div: (x, y) => (Math.hypot(x, y) < .35 ? NaN : 0), curl: () => 0 },
  ];
  let cur = P.find(p => p.k === opts.preset) || P[0];
  let wheel = { x: 1.2, y: .8 }, ang = 0, raf = 0, drag = false;
  const pills = h('div', { class: 'fm-pills' });
  P.forEach(p => pills.append(h('button', { class: 'pill' + (p === cur ? ' on' : ''), onclick: e => { cur = p; [...pills.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); build(); } }, p.name)));
  const box = h('div', { class: 'cp-plot' }), info = h('div', { class: 'pp-info' });
  el.append(pills, h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, info, h('p', { class: 'subtle small' }, T('Přetáhni kolečko. Když se točí, má pole v tom místě nenulovou rotaci.', 'Drag the paddle wheel. If it spins, the field has non-zero curl there.')))));
  let plot, parts = [], gP, gW;
  function build() {
    box.innerHTML = '';
    plot = new Plot(box, { xmin: -3, xmax: 3, ymin: -2.25, ymax: 2.25, width: 600, height: 450, step: 1, ystep: 1 });
    for (let x = -2.75; x <= 2.8; x += .5) for (let y = -2; y <= 2.05; y += .5) {
      const [u, v] = cur.F(x, y); const m = Math.hypot(u, v); if (!m) continue;
      const L = .18 + .14 * Math.tanh(m / 2), dx = u / m * L, dy = v / m * L;
      const X1 = plot.X(x - dx), Y1 = plot.Y(y - dy), X2 = plot.X(x + dx), Y2 = plot.Y(y + dy);
      const a = Math.atan2(Y2 - Y1, X2 - X1);
      s('path', { d: `M${X1} ${Y1}L${X2} ${Y2}M${X2} ${Y2}l${-7 * Math.cos(a - .5)} ${-7 * Math.sin(a - .5)}M${X2} ${Y2}l${-7 * Math.cos(a + .5)} ${-7 * Math.sin(a + .5)}`, class: 'fld-arrow', style: `opacity:${.35 + .5 * Math.tanh(m)}` }, plot.gBack);
    }
    gP = s('g', {}, plot.gMain); gW = s('g', { class: 'fld-wheel' }, plot.gTop);
    parts = Array.from({ length: 70 }, () => ({ x: (Math.random() - .5) * 6, y: (Math.random() - .5) * 4.5, life: Math.random() * 120 }));
    plot.svg.style.touchAction = 'none';
    plot.svg.onpointerdown = e => { drag = true; plot.svg.setPointerCapture(e.pointerId); const p = plot.toPlot(e); wheel = { x: clamp(p.x, -2.7, 2.7), y: clamp(p.y, -2, 2) }; };
    plot.svg.onpointermove = e => { if (!drag) return; const p = plot.toPlot(e); wheel = { x: clamp(p.x, -2.7, 2.7), y: clamp(p.y, -2, 2) }; };
    plot.svg.onpointerup = plot.svg.onpointercancel = () => { drag = false; };
  }
  function frame() {
    gP.innerHTML = '';
    for (const p of parts) {
      const [u, v] = cur.F(p.x, p.y); const m = Math.hypot(u, v) || 1; const sp = Math.min(m, 2.5) / m;
      p.x += u * sp * .012; p.y += v * sp * .012; p.life++;
      if (Math.abs(p.x) > 3.1 || Math.abs(p.y) > 2.4 || p.life > 160 || Math.hypot(p.x, p.y) < .08) { p.x = (Math.random() - .5) * 6; p.y = (Math.random() - .5) * 4.5; p.life = 0; }
      s('circle', { cx: plot.X(p.x), cy: plot.Y(p.y), r: 2.6, class: 'fld-p', style: `opacity:${Math.min(1, p.life / 20, (160 - p.life) / 20)}` }, gP);
    }
    const c = cur.curl(wheel.x, wheel.y), d = cur.div(wheel.x, wheel.y);
    ang += c * .02;
    const X = plot.X(wheel.x), Y = plot.Y(wheel.y), R = 26;
    let g = `<circle cx="${X}" cy="${Y}" r="${R}" class="fw-ring"/>`;
    for (let i = 0; i < 4; i++) { const a = ang + i * Math.PI / 2; g += `<line x1="${X}" y1="${Y}" x2="${X + R * Math.cos(a)}" y2="${Y - R * Math.sin(a)}" class="fw-blade"/>`; }
    gW.innerHTML = g + `<circle cx="${X}" cy="${Y}" r="5" class="fw-hub"/>`;
    info.innerHTML = `<div>${tex(cur.tex)}</div><div>${tex(`\\nabla\\cdot\\mathbf F = ${Number.isNaN(d) ? '\\text{?}' : f2(d)}`)}</div><div>${tex(`(\\nabla\\times\\mathbf F)_z = ${f2(c)}`)}</div><div class="muted small">${d > 0 ? T('Kladná divergence: pole odsud „vytéká" (zdroj).', 'Positive divergence: the field flows out (a source).') : c ? T('Nenulová rotace: kolečko se točí.', 'Non-zero curl: the wheel spins.') : T('Nulová divergence i rotace v tomto bodě.', 'Zero divergence and curl at this point.')}</div>`;
    raf = requestAnimationFrame(frame);
  }
  build(); frame();
  return () => cancelAnimationFrame(raf);
}
