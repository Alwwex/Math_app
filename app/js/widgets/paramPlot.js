// Univerzální graf s parametry: posuvníky, animace parametru, plocha pod křivkou, body a popisek.
// opts: { view:[x0,x1,y0,y1], params:[{k,label,min,max,step,value}], curves:[{f:(x,P)=>y, color, label, dash, a, b, width}],
//         area:{f,a,b,color}, points:P=>[{x,y,color,open}], info:P=>'tex', play:'k', loop:true, xlabel, ylabel, height }
import { h, tex, clamp } from '../util.js';
import { lang, num } from '../i18n.js';
import { icon } from '../icons.js';
import { Plot, s, colorVar } from './plot.js';

const COLS = ['var(--blue)', 'var(--orange)', 'var(--green)', 'var(--purple)', 'var(--red)', 'var(--teal)'];

export default function paramPlot(el, opts) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  const P = {};
  for (const p of opts.params || []) P[p.k] = p.value ?? p.min;
  el.classList.add('pp');
  const box = h('div', { class: 'pp-plot' });
  const info = h('div', { class: 'pp-info' });
  const legend = h('div', { class: 'pp-legend' });
  const sliders = h('div', { class: 'pp-sliders' });
  let raf = 0, playing = false;
  const playBtn = opts.play ? h('button', { class: 'btn icon tinted', html: icon('play'), 'aria-label': 'play' }) : null;

  for (const p of opts.params || []) {
    const val = h('span', { class: 'pp-val' });
    const r = h('input', { type: 'range', class: 'range', min: p.min, max: p.max, step: p.step ?? (p.int ? 1 : (p.max - p.min) / 200), value: P[p.k] });
    r.oninput = () => { if (opts.play === p.k) stop(); P[p.k] = +r.value; val.innerHTML = fmt(p); draw(); };
    const fmt = q => tex(`${q.label ?? q.k} = ${q.int ? P[q.k] : num(P[q.k], 2).replace(',', '{,}')}`);
    val.innerHTML = fmt(p);
    p._r = r; p._v = val; p._fmt = fmt;
    sliders.append(h('label', { class: 'pp-slider' }, val, r));
  }
  el.append(h('div', { class: 'pp-wrap' }, box, h('div', { class: 'pp-side' }, legend, info)), h('div', { class: 'pp-ctrl' }, playBtn, sliders));

  let plot;
  function draw() {
    box.innerHTML = '';
    const [x0, x1, y0, y1] = typeof opts.view === 'function' ? opts.view(P) : opts.view;
    plot = new Plot(box, { xmin: x0, xmax: x1, ymin: y0, ymax: y1, width: 600, height: opts.height || 380, xlabel: opts.xlabel || 'x', ylabel: opts.ylabel || 'y', step: opts.step, ystep: opts.ystep });
    if (opts.area) {
      const A = opts.area;
      const a = typeof A.a === 'function' ? A.a(P) : A.a, b = typeof A.b === 'function' ? A.b(P) : A.b;
      let d = `M${plot.X(a)} ${plot.Y(0)}`;
      for (let i = 0; i <= 200; i++) { const x = a + (b - a) * i / 200; const y = A.f(x, P); d += `L${plot.X(x)} ${plot.Y(clamp(y, y0 - 10, y1 + 10))}`; }
      d += `L${plot.X(b)} ${plot.Y(0)}Z`;
      const ar = s('path', { d, class: 'pp-area' }, plot.gBack);
      ar.style.fill = colorVar(A.color || 'var(--blue)');
    }
    legend.innerHTML = '';
    (opts.curves || []).forEach((c, i) => {
      if (c.show && !c.show(P)) return;
      const col = colorVar(c.color || COLS[i % COLS.length]);
      const path = plot.curve(x => c.f(x, P), { a: c.a, b: c.b, cls: 'curve' + (c.thin ? '' : ' thick') });
      path.style.stroke = col;
      if (c.dash) path.style.strokeDasharray = '7 6';
      if (c.width) path.style.strokeWidth = c.width;
      if (c.label) legend.append(h('div', { class: 'pp-leg' }, h('i', { style: { background: col } }), h('span', { html: tex(typeof c.label === 'function' ? c.label(P, T) : c.label) })));
    });
    for (const pt of (opts.points ? opts.points(P) : [])) {
      const d = plot.dot(pt.x, pt.y, { r: pt.r || 6, open: pt.open });
      if (pt.color) d.style.fill = pt.open ? 'var(--surface)' : colorVar(pt.color);
      if (pt.color && pt.open) d.style.stroke = colorVar(pt.color);
    }
    if (opts.extra) opts.extra(plot, P, s);
    info.innerHTML = opts.info ? opts.info(P, T).split('\n').map(line => `<div>${line.trim().startsWith('<') ? line : tex(line)}</div>`).join('') : '';
    info.style.display = opts.info ? '' : 'none';
  }
  const pp = (opts.params || []).find(p => p.k === opts.play);
  function stop() { playing = false; cancelAnimationFrame(raf); if (playBtn) playBtn.innerHTML = icon('play'); }
  if (playBtn) playBtn.onclick = () => {
    if (playing) return stop();
    playing = true; playBtn.innerHTML = icon('pause');
    let last = performance.now();
    const speed = (pp.max - pp.min) / (opts.duration || 6);
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      let v = P[pp.k] + dt * speed;
      if (v > pp.max) { if (opts.loop === false) { v = pp.max; stop(); } else v = pp.min; }
      P[pp.k] = pp.int ? Math.round(v * 1000) / 1000 : v;
      pp._r.value = P[pp.k];
      if (pp.int) P[pp.k] = Math.floor(v);
      pp._v.innerHTML = pp._fmt(pp);
      draw();
      if (pp.int) P[pp.k] = v;
      if (playing) raf = requestAnimationFrame(step);
    };
    if (pp.int) { // integer params step slowly
      const tick = () => { if (!playing) return; P[pp.k] = P[pp.k] >= pp.max ? pp.min : P[pp.k] + 1; pp._r.value = P[pp.k]; pp._v.innerHTML = pp._fmt(pp); draw(); raf = setTimeout(tick, opts.interval || 650); };
      tick(); return;
    }
    raf = requestAnimationFrame(step);
  };
  draw();
  return () => { cancelAnimationFrame(raf); clearTimeout(raf); };
}
