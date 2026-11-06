// Grupa symetrií rovnostranného trojúhelníku (C3v ≅ S3): otáčej, překlápěj, skládej operace.
import { h, tex, sound } from '../util.js';
import { lang } from '../i18n.js';
import { s } from './plot.js';

// elements as permutations of vertex positions [0,1,2] → where vertex labels go
const OPS = {
  I: [0, 1, 2], R: [1, 2, 0], R2: [2, 0, 1], A: [0, 2, 1], B: [2, 1, 0], C: [1, 0, 2],
};
const NAMES = { I: 'I', R: 'R', R2: 'R^2', A: 'K', B: 'L', C: 'M' };
const compose = (p, q) => p.map((_, i) => q[p[i]]); // apply p then q
const key = perm => Object.keys(OPS).find(k => OPS[k].every((v, i) => v === perm[i]));

export default function groupTriangle(el) {
  const T = (cs, en) => (lang() === 'en' ? en : cs);
  let state = [0, 1, 2], seq = [], busy = false, angle = 0, flipAxis = null;
  const W = 300, H = 290, cx = 150, cy = 160, R = 105;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gt-svg' });
  const info = h('div', { class: 'pp-info' });
  const btns = h('div', { class: 'gt-btns' });
  const ops = [['R', T('Otočit o 120°', 'Rotate 120°'), 'rot', 120], ['R2', T('Otočit o 240°', 'Rotate 240°'), 'rot', 240], ['A', T('Překlopit K', 'Reflect K'), 'flip', 0], ['B', T('Překlopit L', 'Reflect L'), 'flip', 1], ['C', T('Překlopit M', 'Reflect M'), 'flip', 2]];
  ops.forEach(([k, l, type, arg]) => btns.append(h('button', { class: 'btn tinted', html: tex(NAMES[k]) + `<span>${l}</span>`, onclick: () => apply(k, type, arg) })));
  btns.append(h('button', { class: 'btn ghost', onclick: () => { state = [0, 1, 2]; seq = []; draw(); } }, T('Znovu', 'Reset')));
  const table = h('div', { class: 'gt-table' });
  el.append(h('div', { class: 'gt-wrap' }, h('div', { class: 'gt-stage' }, svg), h('div', { class: 'pp-side' }, btns, info)), table);
  const vpos = i => { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  const COLS = ['#ff3b30', '#34c759', '#007aff'];
  function draw(rot = 0, flip = 0) {
    let g = '';
    for (let i = 0; i < 3; i++) { const [x, y] = vpos(i), a = -Math.PI / 2 + i * 2 * Math.PI / 3; const [x2, y2] = [cx - R * .6 * Math.cos(a), cy - R * .6 * Math.sin(a)]; g += `<line x1="${x + (x - cx) * .25}" y1="${y + (y - cy) * .25}" x2="${x2}" y2="${y2}" class="gt-axis"/><text x="${x + (x - cx) * .36}" y="${y + (y - cy) * .36 + 5}" class="gt-ax-l">${['K', 'L', 'M'][i]}</text>`; }
    // triangle with labelled vertices according to state, transformed by current animation
    const pts = [0, 1, 2].map(i => vpos(i));
    let tf = `rotate(${rot} ${cx} ${cy})`;
    if (flipAxis != null) { const a = (-Math.PI / 2 + flipAxis * 2 * Math.PI / 3) * 180 / Math.PI; tf = `rotate(${a} ${cx} ${cy}) translate(${cx} ${cy}) scale(1 ${Math.cos(flip * Math.PI)}) translate(${-cx} ${-cy}) rotate(${-a} ${cx} ${cy})`; }
    g += `<g transform="${tf}"><polygon points="${pts.map(p => p.join(',')).join(' ')}" class="gt-tri"/>`;
    state.forEach((lab, pos) => { const [x, y] = pts[pos]; g += `<circle cx="${x}" cy="${y}" r="15" fill="${COLS[lab]}"/><text x="${x}" y="${y + 5}" class="gt-l">${lab + 1}</text>`; });
    g += `</g>`;
    svg.innerHTML = g;
    const k = key(state);
    info.innerHTML = `<div>${T('Výsledek skládání', 'Composition result')}: ${seq.length ? tex(seq.map(x => NAMES[x]).reverse().join('\\,') + ' = ' + NAMES[k]) : tex('I')}</div><div class="muted small">${T('Šest operací tvoří grupu: složení dvou operací je zase operace, každá má inverzní. Pozor: záleží na pořadí – grupa není komutativní.', 'The six operations form a group: composing gives another one, each has an inverse. Order matters – the group is non-Abelian.')}</div>`;
    // Cayley table
    const ks = Object.keys(OPS);
    table.innerHTML = `<table class="gt-cayley"><tr><th>∘</th>${ks.map(c => `<th>${tex(NAMES[c])}</th>`).join('')}</tr>${ks.map(r => `<tr><th>${tex(NAMES[r])}</th>${ks.map(c => { const res = key(compose(OPS[c], OPS[r])); return `<td class="${res === k && seq.length ? 'hit' : ''}">${tex(NAMES[res])}</td>`; }).join('')}</tr>`).join('')}</table>`;
  }
  function apply(k, type, arg) {
    if (busy) return; busy = true;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / 650), e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      if (type === 'rot') draw(arg * e); else { flipAxis = arg; draw(0, e); }
      if (p < 1) requestAnimationFrame(step);
      else {
        flipAxis = null;
        const perm = OPS[k];
        const ns = [0, 0, 0]; state.forEach((lab, pos) => { ns[perm[pos]] = lab; });
        state = ns; seq.push(k); if (seq.length > 4) seq.shift();
        sound.pop(); draw(); busy = false;
      }
    };
    requestAnimationFrame(step);
  }
  draw();
  void angle;
}
