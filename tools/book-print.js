// Sestaví tiskovou podobu ukázkové knihy (kapitola 1.1) z obsahu aplikace.
// Spouští se přes `node tools/build-sample-pdf.js`, výsledek: app/assets/ukazka-kniha.pdf
import sec from '../app/content/ch1-1.js';
import { book } from '../app/content/book.js';
import { rt, tex } from '../app/js/util.js';
import { Plot, s, figure } from '../app/js/widgets/plot.js';

const c = v => (v == null ? '' : typeof v === 'string' ? v : v.cs);
const R = v => rt(c(v)).replace(/<span class="term" data-term="[^"]*">([^<]*)<\/span>/g, '$1');
const root = document.getElementById('book');
const add = html => root.insertAdjacentHTML('beforeend', html);

// ---------- cover ----------
let curves = '';
for (let i = 0; i < 9; i++) {
  let d = '';
  for (let x = 0; x <= 160; x += 2) {
    const y = 120 - i * 9 + Math.sin(x / 160 * Math.PI * (0.7 + i * .2) * 2 + i * .8) * (12 + i * 2.4);
    d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
  }
  curves += `<path d="${d}" fill="none" stroke="${i % 3 === 0 ? '#e8794a' : 'rgba(255,255,255,.32)'}" stroke-width="${i % 3 === 0 ? 1.4 : .7}"/>`;
}
add(`<div class="page cover" style="page: cover">
  <svg class="art" viewBox="0 0 160 230" preserveAspectRatio="none"><defs><pattern id="g" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="rgba(255,255,255,.07)" stroke-width=".4"/></pattern></defs><rect width="160" height="230" fill="url(#g)"/>${curves}
  <circle cx="118" cy="52" r="20" fill="none" stroke="rgba(255,255,255,.4)" stroke-width=".6"/><path d="M96 52h44M118 30v44" stroke="rgba(255,255,255,.25)" stroke-width=".5"/></svg>
  <div class="pub">FOLIO</div>
  <div class="t"><small>${c(book.subtitle)}</small><h1>${c(book.title)}</h1><div class="ch">Kapitola 1 · ${c(book.chapters[0].title)}</div></div>
</div>`);

// ---------- contents ----------
add(`<div class="page" style="page: plain; padding-top: 6mm"><div class="kicker">Obsah</div><h1 class="chapter">Kapitola 1 <br>${c(book.chapters[0].title)}</h1>
<div class="toc">
  <div><b>1.1 ${c(sec.title)}</b><span>3</span></div>
  ${sec.steps.map((st, i) => `<div class="sub"><span>1.1.${i + 1} ${c(st.title)}</span><span></span></div>`).join('')}
  <div class="sub"><span>Cvičení 1.1</span><span></span></div>
  ${book.chapters[0].sections.slice(1).map(s2 => `<div class="dim"><span>${s2.n} ${c(s2.title)}</span><span>připravuje se</span></div>`).join('')}
</div>
<p style="margin-top:6mm;font-size:8.5pt;color:#8a8f99">Ukázková kniha aplikace Folio. Ke každé části patří interaktivní lekce s animacemi, test a kartičky s pojmy. Otevři v aplikaci své vlastní PDF tlačítkem „Otevřít PDF".</p>
</div>`);

// ---------- figures for widgets ----------
function svgStr(el) { return el.outerHTML; }
function plotBox(opts, draw) {
  const host = document.createElement('div');
  const p = new Plot(host, { width: 420, height: 300, ...opts });
  draw(p);
  return host.innerHTML;
}
const FIG = {
  functionMachine: () => `<figure><div class="machine"><div class="ball">2</div><span class="arr">→</span><div class="box2">${tex('f(x) = 2x + 1')}</div><span class="arr">→</span><div class="ball o">5</div></div>
    <table class="vt"><tr><th>${tex('x')}</th><td>−2</td><td>−1</td><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>${tex('f(x)')}</th><td>−3</td><td>−1</td><td>1</td><td>3</td><td>5</td><td>7</td></tr></table>
    <figcaption>Obr. 1: Funkce jako stroj – vstup 2, výstup f(2) = 5.</figcaption></figure>`,
  mappingDiagram: () => {
    const W = 420, H = 226;
    const xs = ['−2', '−1', '0', '1', '2'], ys = ['0', '1', '4'], arr = [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]];
    const py = (n, i) => 122 + (i - (n - 1) / 2) * 36;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="plot"><ellipse cx="90" cy="122" rx="62" ry="98" fill="#eef3fd" stroke="#b9cbf3" stroke-width="2"/><ellipse cx="330" cy="122" rx="62" ry="98" fill="#fbeee6" stroke="#f0c3a8" stroke-width="2"/>`;
    arr.forEach(([a, b]) => { const y1 = py(5, a), y2 = py(3, b); g += `<path d="M106 ${y1} C 200 ${y1}, 230 ${y2}, 312 ${y2}" fill="none" stroke="#666" stroke-width="1.6"/><path d="M312 ${y2} l-8 -4 l0 8z" fill="#666"/>`; });
    xs.forEach((x, i) => { g += `<circle cx="90" cy="${py(5, i)}" r="14" fill="#fff" stroke="#2f62d8" stroke-width="2"/><text x="90" y="${py(5, i) + 5}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="13">${x}</text>`; });
    ys.forEach((y, i) => { g += `<circle cx="330" cy="${py(3, i)}" r="14" fill="#fff" stroke="#e8794a" stroke-width="2"/><text x="330" y="${py(3, i) + 5}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="13">${y}</text>`; });
    g += `<text x="90" y="16" text-anchor="middle" font-family="Inter" font-size="12" fill="#8a8f99">X (vstupy)</text><text x="330" y="16" text-anchor="middle" font-family="Inter" font-size="12" fill="#8a8f99">Y (výstupy)</text></svg>`;
    return `<figure>${g}<figcaption>Obr. 2: Šipkový diagram funkce x ↦ x². Z každého vstupu vede právě jedna šipka.</figcaption></figure>`;
  },
  representations: () => `<figure><table class="vt"><tr><th>${tex('t\\ [\\mathrm{s}]')}</th><td>0</td><td>0,5</td><td>1</td><td>1,5</td><td>2</td><td>2,5</td><td>3</td></tr><tr><th>${tex('s\\ [\\mathrm{m}]')}</th><td>0</td><td>1,25</td><td>5</td><td>11,25</td><td>20</td><td>31,25</td><td>45</td></tr></table>
    <div class="plots">${plotBox({ xmin: -.3, xmax: 3.4, ymin: -4, ymax: 50, step: .5, ystep: 10, xlabel: 't', ylabel: 's' }, p => { p.curve(t => 5 * t * t, { a: 0, b: 3 }); [0, 1, 2, 3].forEach(t => p.dot(t, 5 * t * t, { r: 5 })); })}</div>
    <figcaption>Obr. 3: Volný pád s(t) = 5t² – tabulkou i grafem.</figcaption></figure>`,
  grapher: () => `<figure><div class="plots">${plotBox({ xmin: -2, xmax: 6, ymin: -1, ymax: 3.2 }, p => {
      s('line', { x1: p.X(0), x2: p.X(6), y1: p.Y(0), y2: p.Y(0), class: 'gr-dom' }, p.gBack);
      s('line', { x1: p.X(0), x2: p.X(0), y1: p.Y(0), y2: p.Y(3.2), class: 'gr-rng' }, p.gBack);
      p.curve(x => (x < 0 ? NaN : Math.sqrt(x)), { cls: 'curve thick' });
      p.line(4, 0, 4, 2, 'guide', p.gTop); p.line(0, 2, 4, 2, 'guide', p.gTop); p.dot(4, 2, { r: 6 });
    })}</div><figcaption>Obr. 4: Graf funkce f(x) = √x. Modře D(f) = ⟨0, ∞), oranžově H(f) = ⟨0, ∞). Bod [4; 2] leží na grafu, protože f(4) = 2.</figcaption></figure>`,
  verticalLine: () => `<figure><div class="plots">${plotBox({ xmin: -4, xmax: 4, ymin: -4, ymax: 4 }, p => {
      p.curve(x => x * x / 2 - 2, { cls: 'curve thick' });
      s('line', { x1: p.X(1), x2: p.X(1), y1: 0, y2: p.height, class: 'vl-line' }, p.gTop);
      p.dot(1, -1.5, { r: 7, cls: 'dot' });
    })}${plotBox({ xmin: -4, xmax: 4, ymin: -4, ymax: 4 }, p => {
      s('path', { d: p.paramD(t => 3 * Math.cos(t), t => 3 * Math.sin(t), 0, 2 * Math.PI), class: 'curve thick' }, p.gMain);
      s('line', { x1: p.X(1), x2: p.X(1), y1: 0, y2: p.height, class: 'vl-line bad' }, p.gTop);
      const y = Math.sqrt(8);
      s('circle', { cx: p.X(1), cy: p.Y(y), r: 7, class: 'vl-hit bad' }, p.gTop);
      s('circle', { cx: p.X(1), cy: p.Y(-y), r: 7, class: 'vl-hit bad' }, p.gTop);
    })}</div><figcaption>Obr. 5: Parabola projde testem svislou přímkou (1 průsečík), kružnice ne (2 průsečíky).</figcaption></figure>`,
  piecewise: () => `<figure><div class="plots">${plotBox({ xmin: -4, xmax: 3, ymin: -1, ymax: 6 }, p => {
      p.curve(x => 1 - x, { a: -4, b: -1, cls: 'curve thick', color: '#2f62d8' });
      p.curve(x => x * x, { a: -1, b: 3, cls: 'curve thick', color: '#e8794a' });
      const d1 = p.dot(-1, 2, { r: 6 }); d1.style.fill = '#2f62d8';
      const d2 = p.dot(-1, 1, { r: 6, open: true }); d2.style.stroke = '#e8794a';
    })}</div><figcaption>Obr. 6: Funkce po částech. Plné kolečko [−1; 2] do grafu patří, prázdné [−1; 1] ne.</figcaption></figure>`,
  symmetry: () => `<figure><div class="plots">${plotBox({ xmin: -3, xmax: 3, ymin: -3, ymax: 4 }, p => {
      p.curve(x => x * x, { cls: 'curve thick' });
      p.line(1.5, 2.25, -1.5, 2.25, 'guide', p.gTop); p.dot(1.5, 2.25, { r: 5 }); p.dot(-1.5, 2.25, { r: 5 });
    })}${plotBox({ xmin: -3, xmax: 3, ymin: -3.5, ymax: 3.5 }, p => {
      p.curve(x => x ** 3 / 2, { cls: 'curve thick', color: '#7a55d0' });
      p.line(1.4, 1.372, -1.4, -1.372, 'guide', p.gTop); p.dot(1.4, 1.372, { r: 5 }); p.dot(-1.4, -1.372, { r: 5 });
    })}</div><figcaption>Obr. 7: Sudá funkce x² (souměrná podle osy y) a lichá funkce ½x³ (souměrná podle počátku).</figcaption></figure>`,
  monotonic: () => `<figure><div class="plots">${plotBox({ xmin: -2.4, xmax: 2.4, ymin: -4, ymax: 4 }, p => {
      const f = x => x ** 3 - 3 * x;
      p.curve(f, { a: -2.4, b: -1, cls: 'curve thick mo-inc' });
      p.curve(f, { a: -1, b: 1, cls: 'curve thick mo-dec' });
      p.curve(f, { a: 1, b: 2.4, cls: 'curve thick mo-inc' });
      p.dot(-1, 2, { r: 5 }); p.dot(1, -2, { r: 5 });
    })}</div><figcaption>Obr. 8: f(x) = x³ − 3x roste na (−∞, −1⟩, klesá na ⟨−1, 1⟩ a roste na ⟨1, ∞).</figcaption></figure>`,
};

// ---------- section ----------
let html = `<section class="sec"><div class="kicker">Kapitola 1</div><h2 class="sec-title"><span>1.1</span> ${c(sec.title)}</h2>`;
sec.steps.forEach((st, i) => {
  if (st.id === 'shrnuti') {
    html += `<h3><span class="n">1.1.${i + 1}</span> ${c(st.title)}</h3><ul class="l">${st.blocks.find(b => b.t === 'summary').items.map(it => `<li>${R(it)}</li>`).join('')}</ul>`;
    return;
  }
  html += `<h3><span class="n">1.1.${i + 1}</span> ${c(st.title)}</h3>`;
  for (const b of st.blocks) {
    if (b.t === 'lead') html += `<p class="lead">${R(b)}</p>`;
    else if (b.t === 'p') html += `<p>${R(b)}</p>`;
    else if (b.t === 'math') html += tex(b.tex, true);
    else if (b.t === 'def') html += `<div class="box def"><div><span class="lab">Definice</span><span class="ttl">${c(b.title)}</span></div><div style="margin-top:1.5mm">${R(b)}</div></div>`;
    else if (b.t === 'note') html += `<div class="box note ${b.kind}"><b class="l">${{ tip: 'Tip', warn: 'Pozor', lang: 'V angličtině' }[b.kind]}</b>${R(b)}</div>`;
    else if (b.t === 'list') html += `<ul class="l">${b.items.map(it => `<li>${R(it)}</li>`).join('')}</ul>`;
    else if (b.t === 'widget') html += FIG[b.name]?.() || '';
    else if (b.t === 'example') html += `<div class="ex"><span class="lab">Příklad</span><b>${c(b.title)}</b><div style="margin-top:1.5mm">${R(b.task)}</div><ol>${b.steps.map(x => `<li>${R(x)}</li>`).join('')}</ol><div class="ans"><b>Výsledek:</b> ${R(b.answer)}</div></div>`;
  }
});
html += '</section>';
add(html);

// ---------- exercises ----------
let ex = `<section class="sec exercises"><div class="kicker">Procvičování</div><h2 class="sec-title"><span>1.1</span> Cvičení</h2><ol>`;
const answers = [];
sec.quiz.forEach((q, i) => {
  ex += `<li>${R(q.q)}`;
  if (q.fig) ex += `<figure>${svgStr(figure(q.fig, 360, 240))}</figure>`;
  if (q.type === 'mcq') ex += `<div class="opts">${q.options.map((o, k) => `<div>(${String.fromCharCode(97 + k)}) ${R(o)}</div>`).join('')}</div>`;
  if (q.type === 'tf') ex += q.labels ? '' : ' <i>(pravda / nepravda)</i>';
  if (q.type === 'match') ex += `<div class="opts">${q.pairs.map(p => `<div>${p[0]}</div>`).join('')}</div><div class="opts" style="margin-top:2mm"><i>${[...q.pairs].reverse().map(p => p[1]).join(' · ')}</i></div>`;
  ex += '</li>';
  let a;
  if (q.type === 'mcq') a = `(${String.fromCharCode(97 + q.answer)}) ${R(q.options[q.answer])}`;
  else if (q.type === 'num') a = R(`$${String(q.answer).replace('.', '{,}')}$`) + (q.unit ? ' ' + q.unit : '');
  else if (q.type === 'tf') a = q.labels ? c(q.labels[q.answer ? 0 : 1]) : (q.answer ? 'pravda' : 'nepravda');
  else if (q.type === 'match') a = q.pairs.map(p => `${p[0]} – ${p[1]}`).join(', ');
  answers.push(`<div><b>${i + 1}.</b> ${a}</div>`);
});
ex += `</ol><h3>Výsledky</h3><div class="answers">${answers.join('')}</div></section>`;
add(ex);

window.__ready = true;
