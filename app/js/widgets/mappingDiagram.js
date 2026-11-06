// Šipkový diagram mezi dvěma množinami – je to funkce, nebo ne?
import { h, sound, sleep } from '../util.js';
import { lang } from '../i18n.js';
import { s } from './plot.js';

const SC = [
  {
    name: { cs: 'Žák → oblíbená barva', en: 'Student → favourite colour' },
    X: ['Anna', 'Ben', 'Cyril', 'Dana'],
    Y: { cs: ['modrá', 'zelená', 'červená'], en: ['blue', 'green', 'red'] },
    arrows: [[0, 0], [1, 1], [2, 0], [3, 2]],
    func: true,
    why: { cs: 'Z každého žáka vede právě jedna šipka. Že Anna i Cyril mají modrou, nevadí.', en: 'Exactly one arrow leaves each student. Anna and Cyril both liking blue is fine.' },
  },
  {
    name: { cs: 'Číslo → jeho druhá odmocnina (±)', en: 'Number → its square roots (±)' },
    X: ['0', '1', '4', '9'],
    Y: { cs: ['−3', '−2', '−1', '0', '1', '2', '3'], en: ['−3', '−2', '−1', '0', '1', '2', '3'] },
    arrows: [[0, 3], [1, 4], [1, 2], [2, 5], [2, 1], [3, 6], [3, 0]],
    func: false, bad: [1, 2, 3],
    why: { cs: 'Ze čísla 4 vedou dvě šipky (k 2 i k −2). Jeden vstup má dva výstupy → není to funkce.', en: 'Two arrows leave 4 (to 2 and to −2). One input with two outputs → not a function.' },
  },
  {
    name: { cs: 'x → x²', en: 'x → x²' },
    X: ['−2', '−1', '0', '1', '2'],
    Y: { cs: ['0', '1', '4'], en: ['0', '1', '4'] },
    arrows: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],
    func: true,
    why: { cs: 'Každý vstup má jeden výstup. Do jednoho výstupu smí vést víc šipek.', en: 'Every input has one output. Several arrows may point at the same output.' },
  },
  {
    name: { cs: 'Žák → jeho pes', en: 'Student → their dog' },
    X: ['Anna', 'Ben', 'Cyril', 'Dana'],
    Y: { cs: ['Rex', 'Bára', 'Fík'], en: ['Rex', 'Bella', 'Fido'] },
    arrows: [[0, 0], [1, 1], [2, 2]],
    func: false, bad: [3],
    why: { cs: 'Dana žádného psa nemá – z prvku Dana nevede žádná šipka. Na množině všech žáků to tedy funkce není.', en: 'Dana has no dog – no arrow leaves Dana. So on the set of all students this is not a function.' },
  },
];

export default function mappingDiagram(el) {
  let idx = 0;
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  el.classList.add('md');
  const tabs = h('div', { class: 'seg md-tabs' });
  const title = h('div', { class: 'md-title' });
  const svgBox = h('div', { class: 'md-svg' });
  const ask = h('div', { class: 'md-ask' });
  const fb = h('div', { class: 'md-fb' });
  SC.forEach((sc, i) => {
    const b = h('button', { class: i === idx ? 'on' : '' }, String.fromCharCode(65 + i));
    b.onclick = () => { idx = i; [...tabs.children].forEach(c => c.classList.toggle('on', c === b)); draw(); };
    tabs.append(b);
  });
  el.append(h('div', { class: 'md-head' }, tabs, title), svgBox, ask, fb);

  function draw() {
    const sc = SC[idx];
    const Y = sc.Y[lang() === 'en' ? 'en' : 'cs'];
    title.textContent = sc.name[lang() === 'en' ? 'en' : 'cs'];
    fb.className = 'md-fb'; fb.innerHTML = '';
    svgBox.innerHTML = '';
    const W = 560, H = 300;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'md-diagram' });
    svgBox.append(svg);
    const defs = s('defs', {}, svg);
    const mk = s('marker', { id: 'mdArrow' + idx, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    s('path', { d: 'M0 0 L10 5 L0 10 z', class: 'md-arrowhead' }, mk);
    // ovals
    s('ellipse', { cx: 120, cy: 150, rx: 92, ry: 132, class: 'md-set a' }, svg);
    s('ellipse', { cx: 440, cy: 150, rx: 92, ry: 132, class: 'md-set b' }, svg);
    s('text', { x: 120, y: 14, class: 'md-setname', 'text-anchor': 'middle' }, svg).textContent = T('vstupy  X', 'inputs  X');
    s('text', { x: 440, y: 14, class: 'md-setname', 'text-anchor': 'middle' }, svg).textContent = T('výstupy  Y', 'outputs  Y');
    const py = (n, i) => 150 + (i - (n - 1) / 2) * Math.min(42, 230 / Math.max(n - 1, 1));
    // nodes: circles for short labels, pills for words
    const node = (cls, cx, cy, name) => {
      const g = s('g', { class: 'md-node ' + cls, transform: `translate(${cx} ${cy})` }, svg);
      const w = name.length > 3 ? Math.max(40, name.length * 8.4 + 18) : 34;
      s('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 16 }, g);
      s('text', { 'text-anchor': 'middle', y: 5 }, g).textContent = name;
      g.w = w;
      return g;
    };
    const xNodes = sc.X.map((name, i) => node('x', 120, py(sc.X.length, i), name));
    const yNodes = Y.map((name, i) => node('y', 440, py(Y.length, i), name));
    const arrowEls = sc.arrows.map(([a, b], k) => {
      const y1 = py(sc.X.length, a), y2 = py(Y.length, b);
      const xa = 120 + xNodes[a].w / 2 + 2, xb = 440 - yNodes[b].w / 2 - 4;
      const p = s('path', { d: `M${xa} ${y1} C ${xa + 120} ${y1}, ${xb - 120} ${y2}, ${xb} ${y2}`, class: 'md-arrow', 'marker-end': `url(#mdArrow${idx})` }, svg);
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 600, delay: 150 + k * 140, fill: 'forwards', easing: 'ease-out' });
      p.dataset.from = a;
      return p;
    });
    ask.innerHTML = '';
    ask.append(h('span', {}, T('Je to funkce?', 'Is it a function?')));
    const yes = h('button', { class: 'btn small' }, T('Ano ✓', 'Yes ✓'));
    const no = h('button', { class: 'btn small' }, T('Ne ✗', 'No ✗'));
    const answer = async (v) => {
      yes.disabled = no.disabled = true;
      const ok = v === sc.func;
      if (ok) sound.correct(); else sound.wrong();
      fb.className = 'md-fb show ' + (ok ? 'good' : 'bad');
      fb.innerHTML = `<b>${ok ? T('Správně!', 'Correct!') : T('Kdepak.', 'Not quite.')}</b> ${sc.func ? T('Je to funkce.', 'It is a function.') : T('Není to funkce.', 'It is not a function.')} ${sc.why[lang() === 'en' ? 'en' : 'cs']}`;
      if (!sc.func) {
        for (const b of sc.bad) xNodes[b].classList.add('bad');
        arrowEls.forEach(p => { if (sc.bad.includes(+p.dataset.from)) p.classList.add('bad'); });
      } else {
        xNodes.forEach((n, i) => setTimeout(() => n.classList.add('good'), i * 120));
      }
      await sleep(10);
    };
    yes.onclick = () => answer(true);
    no.onclick = () => answer(false);
    ask.append(yes, no);
  }
  draw();
}
