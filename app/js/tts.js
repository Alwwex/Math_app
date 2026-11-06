// Předčítání (text-to-speech) přes Web Speech API – česky i anglicky.
// Vzorce převádí na slova („x na druhou", „integrál od a do b"…), čte po odstavcích,
// zvýrazní právě čtený blok a nabízí malý přehrávač (pauza, další, rychlost).
import { profile, saveProfile } from './store.js';
import { h, toast, emo } from './util.js';
import { icon } from './icons.js';

const synth = window.speechSynthesis || null;
export const ttsSupported = !!synth && 'SpeechSynthesisUtterance' in window;

let voices = [];
const listeners = new Set();
function loadVoices() { voices = synth?.getVoices() || []; listeners.forEach(f => f(voices)); }
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }
export const onVoices = fn => { listeners.add(fn); return () => listeners.delete(fn); };

export const ttsPrefs = () => (profile.tts ||= { rate: 1, voiceCs: '', voiceEn: '' });
export function voicesFor(lang) {
  const quality = v => (/natural|neural|online/i.test(v.name) ? 0 : /google|microsoft/i.test(v.name) ? 1 : 2) + (v.localService ? 0 : .5);
  return voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang)).sort((a, b) => quality(a) - quality(b));
}
export function pickVoice(lang) {
  const pref = ttsPrefs()[lang === 'cs' ? 'voiceCs' : 'voiceEn'];
  const list = voicesFor(lang);
  return list.find(v => v.name === pref) || list[0] || null;
}

// ---------- LaTeX → spoken words ----------
const W = {
  cs: { frac: (a, b) => `${a} lomeno ${b}`, sq: 'na druhou', cube: 'na třetí', pow: p => `na ${p}`, sqrt: x => `odmocnina z ${x}`, root: (n, x) => `${n}-tá odmocnina z ${x}`,
    sub: s => ` index ${s}`, int: 'integrál', from: 'od', to: 'do', sum: 'suma', prod: 'součin', lim: 'limita', tends: 'jde k', eq: 'rovná se', neq: 'nerovná se', approx: 'přibližně',
    le: 'je menší nebo rovno', ge: 'je větší nebo rovno', lt: 'je menší než', gt: 'je větší než', plus: 'plus', minus: 'mínus', times: 'krát', div: 'děleno', pm: 'plus minus',
    inf: 'nekonečno', partial: 'parciální', nabla: 'nabla', in: 'patří do', deg: 'stupňů', dots: 'a tak dále', deriv: (y, x) => `derivace ${y} podle ${x}`, abs: x => `absolutní hodnota ${x}`, vec: x => `vektor ${x}`, implies: 'z toho plyne', iff: 'právě když', cdot: 'krát' },
  en: { frac: (a, b) => `${a} over ${b}`, sq: 'squared', cube: 'cubed', pow: p => `to the power ${p}`, sqrt: x => `square root of ${x}`, root: (n, x) => `${n}th root of ${x}`,
    sub: s => ` sub ${s}`, int: 'integral', from: 'from', to: 'to', sum: 'sum', prod: 'product', lim: 'limit', tends: 'tends to', eq: 'equals', neq: 'is not equal to', approx: 'is approximately',
    le: 'is less than or equal to', ge: 'is greater than or equal to', lt: 'is less than', gt: 'is greater than', plus: 'plus', minus: 'minus', times: 'times', div: 'divided by', pm: 'plus or minus',
    inf: 'infinity', partial: 'partial', nabla: 'del', in: 'in', deg: 'degrees', dots: 'and so on', deriv: (y, x) => `d ${y} by d ${x}`, abs: x => `the absolute value of ${x}`, vec: x => `vector ${x}`, implies: 'implies', iff: 'if and only if', cdot: 'times' },
};
const GREEK = { alpha: 'alfa', beta: 'beta', gamma: 'gama', delta: 'delta', epsilon: 'epsilon', varepsilon: 'epsilon', zeta: 'zéta', eta: 'éta', theta: 'théta', vartheta: 'théta', iota: 'jóta', kappa: 'kappa', lambda: 'lambda', mu: 'mí', nu: 'ný', xi: 'ksí', pi: 'pí', rho: 'ró', sigma: 'sigma', tau: 'tau', phi: 'fí', varphi: 'fí', chi: 'chí', psi: 'psí', omega: 'omega' };
const GREEK_EN = { mu: 'mu', nu: 'nu', pi: 'pi', phi: 'phi', varphi: 'phi', chi: 'chi', psi: 'psi', rho: 'rho', xi: 'xi', eta: 'eta', zeta: 'zeta', theta: 'theta', vartheta: 'theta', iota: 'iota' };
const FUNCS = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'sinh', 'cosh', 'tanh', 'ln', 'log', 'exp', 'det', 'max', 'min', 'arg', 'Re', 'Im', 'arcsin', 'arccos', 'arctan', 'tr', 'dim', 'ker', 'deg'];

// read one balanced {...} group (or a single token) starting at i
function group(s, i) {
  while (s[i] === ' ') i++;
  if (s[i] === '{') {
    let d = 0, j = i;
    for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) break; } }
    return [s.slice(i + 1, j), j + 1];
  }
  if (s[i] === '\\') { const m = /^\\[a-zA-Z]+/.exec(s.slice(i)); if (m) return [m[0], i + m[0].length]; }
  return [s[i] || '', i + 1];
}

export function texToSpeech(src, lang = 'cs') {
  const w = W[lang] || W.cs;
  const say = x => texToSpeech(x, lang);
  let s = String(src)
    .replace(/\\(left|right|big|Big|bigg|Bigg|displaystyle|textstyle|,|;|!|quad|qquad)\b/g, ' ')
    .replace(/\\(mathrm|mathbf|mathit|mathcal|boldsymbol|operatorname|text|textrm|textbf|hat|tilde|bar|overline)\s*/g, '')
    .replace(/&|\\\\/g, ', ');
  let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S])/.exec(s.slice(i));
      if (!m) { i++; continue; }
      const cmd = m[1]; i += m[0].length;
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const [a, j] = group(s, i); const [b, k] = group(s, j); i = k;
        const da = /^d\s*([a-zA-Z]*)$|^\\partial\s*([a-zA-Z]*)$/.exec(a.trim()), db = /^(?:d|\\partial)\s*([a-zA-Z])$/.exec(b.trim());
        out += ' ' + (da && db ? w.deriv(da[1] || da[2] || '', db[1]) : w.frac(say(a), say(b))) + ' ';
      } else if (cmd === 'sqrt') {
        let n = null;
        if (s[i] === '[') { const e = s.indexOf(']', i); n = s.slice(i + 1, e); i = e + 1; }
        const [a, j] = group(s, i); i = j;
        out += ' ' + (n ? w.root(say(n), say(a)) : w.sqrt(say(a))) + ' ';
      } else if (cmd === 'int' || cmd === 'iint' || cmd === 'oint' || cmd === 'sum' || cmd === 'prod' || cmd === 'lim') {
        let lo = '', hi = '';
        for (let r = 0; r < 2; r++) {
          while (s[i] === ' ') i++;
          if (s[i] === '_') { const [g, j] = group(s, i + 1); lo = g; i = j; } else if (s[i] === '^') { const [g, j] = group(s, i + 1); hi = g; i = j; }
        }
        const name = cmd === 'sum' ? w.sum : cmd === 'prod' ? w.prod : cmd === 'lim' ? w.lim : w.int;
        out += ` ${name} ${lo ? (cmd === 'lim' ? say(lo) : `${w.from} ${say(lo)}`) : ''} ${hi ? `${w.to} ${say(hi)}` : ''} `;
      } else if (cmd === 'vec' || cmd === 'mathbf') { const [a, j] = group(s, i); i = j; out += ` ${w.vec(say(a))} `; }
      else if (GREEK[cmd.toLowerCase()]) out += ' ' + (lang === 'en' ? (GREEK_EN[cmd.toLowerCase()] || cmd.toLowerCase()) : GREEK[cmd.toLowerCase()]) + ' ';
      else if (FUNCS.includes(cmd)) out += ` ${cmd} `;
      else {
        const map = { cdot: w.cdot, times: w.times, div: w.div, pm: w.pm, mp: w.pm, le: w.le, leq: w.le, ge: w.ge, geq: w.ge, ne: w.neq, neq: w.neq, approx: w.approx, sim: w.approx,
          infty: w.inf, partial: w.partial, nabla: w.nabla, to: w.tends, rightarrow: w.tends, in: w.in, ldots: w.dots, cdots: w.dots, dots: w.dots, Rightarrow: w.implies, implies: w.implies,
          iff: w.iff, Leftrightarrow: w.iff, circ: w.deg, lt: w.lt, gt: w.gt, equiv: w.eq };
        out += map[cmd] ? ` ${map[cmd]} ` : ' ';
      }
      continue;
    }
    if (c === '^') {
      const [g, j] = group(s, i + 1); i = j;
      const t = g.trim();
      out += ' ' + (t === '2' ? w.sq : t === '3' ? w.cube : t === '\\circ' ? w.deg : t === '\\prime' || t === "'" ? '' : w.pow(say(g))) + ' ';
      continue;
    }
    if (c === '_') { const [g, j] = group(s, i + 1); i = j; out += w.sub(say(g)) + ' '; continue; }
    if (c === '|') { const e = s.indexOf('|', i + 1); if (e > i) { out += ` ${w.abs(say(s.slice(i + 1, e)))} `; i = e + 1; continue; } }
    const ops = { '=': w.eq, '+': w.plus, '-': w.minus, '−': w.minus, '<': w.lt, '>': w.gt, '/': w.div, '*': w.times, '≤': w.le, '≥': w.ge };
    if (ops[c]) { out += ` ${ops[c]} `; i++; continue; }
    if (c === '{' || c === '}') { i++; continue; }
    out += c; i++;
  }
  out = out.replace(/\s+/g, ' ').trim();
  if (lang === 'cs') out = out.replace(/\bdo nekonečno\b/g, 'do nekonečna').replace(/\bk nekonečno\b/g, 'k nekonečnu').replace(/\bod mínus nekonečno\b/g, 'od mínus nekonečna');
  return out;
}

// ---------- DOM → speakable text ----------
const SKIP = 'button:not(.q-opt), .widget-card, svg, canvas, .btn, .seg, .lesson-nav, .tts-skip, input, select, .katex-html, .q-tf-ic, .q-fb-head svg';
export function textOf(el, lang) {
  const c = el.cloneNode(true);
  c.querySelectorAll('.katex').forEach(k => {
    const a = k.querySelector('annotation');
    k.replaceWith(document.createTextNode(' ' + (a ? texToSpeech(a.textContent, lang) : k.textContent) + ' '));
  });
  c.querySelectorAll(SKIP).forEach(x => x.remove());
  c.querySelectorAll('br, li, p, div, .ex-tag, .box-tag, .note-label, .q-letter, .bi-tag').forEach(x => x.append(document.createTextNode('. ')));
  return c.textContent.replace(/\s*\.\s*(\.\s*)+/g, '. ').replace(/\s+/g, ' ').replace(/^[.\s]+/, '').trim();
}
// split a container into blocks; in CZ+EN mode the English parts get the English voice
export function blocksOf(container, selector = ':scope > *') {
  const base = profile.lang === 'en' ? 'en' : 'cs';
  const out = [];
  for (const el of container.querySelectorAll(selector)) {
    if (el.matches('.widget-card, .lesson-nav, .cta-row, .book-ref, .ex-ctrl, .page-kicker')) continue;
    const ens = [...el.querySelectorAll('.bi-en')];
    if (ens.length) {
      const c = el.cloneNode(true); c.querySelectorAll('.bi-en').forEach(x => x.remove());
      const txt = textOf(c, 'cs'); if (txt) out.push({ el, text: txt, lang: 'cs' });
      ens.forEach(e => { const t2 = textOf(e, 'en'); if (t2) out.push({ el: e, text: t2, lang: 'en' }); });
      continue;
    }
    const text = textOf(el, base);
    if (text) out.push({ el, text, lang: base });
  }
  return out;
}

// ---------- engine ----------
function chunks(text) {
  // Chromium cuts off long utterances – speak sentence by sentence
  const parts = text.match(/[^.!?;:]+[.!?;:]*\s*/g) || [text];
  const out = []; let cur = '';
  for (const p of parts) { if ((cur + p).length > 220 && cur) { out.push(cur); cur = ''; } cur += p; }
  if (cur.trim()) out.push(cur);
  return out;
}
let warned = false;
function utter(text, lang) {
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(lang);
  if (v) u.voice = v;
  else if (!warned && voices.length) {
    warned = true;
    toast(emo('speech') + (lang === 'cs' ? ' Český hlas není v systému nainstalovaný – Windows: Nastavení → Čas a jazyk → Řeč → Přidat hlasy.' : ' No English voice installed.'), 6000);
  }
  u.lang = lang === 'cs' ? 'cs-CZ' : 'en-GB';
  u.rate = ttsPrefs().rate || 1;
  u.pitch = 1;
  return u;
}

const S = { blocks: [], i: 0, playing: false, gen: 0, bar: null, title: '' };

function mark() {
  document.querySelectorAll('.tts-on').forEach(e => e.classList.remove('tts-on'));
  const b = S.blocks[S.i];
  if (b && S.bar) { b.el.classList.add('tts-on'); b.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}
function playFrom(i) {
  if (!ttsSupported) return;
  const gen = ++S.gen;
  synth.cancel();
  S.i = i; S.playing = true;
  if (i >= S.blocks.length) { stopSpeaking(); return; }
  mark(); renderBar();
  const b = S.blocks[i];
  const list = chunks(b.text);
  let k = 0;
  const next = () => {
    if (gen !== S.gen) return;
    if (k >= list.length) { playFrom(i + 1); return; }
    const u = utter(list[k++], b.lang);
    u.onend = next;
    u.onerror = e => {
      if (gen !== S.gen || e.error === 'interrupted' || e.error === 'canceled') return;
      // no usable voice on this system → stop instead of skipping through everything
      stopSpeaking();
      toast(emo('speech') + (profile.lang === 'en' ? ' Read-aloud could not start – no speech voice is installed on this system.' : ' Předčítání se nespustilo – v systému není nainstalovaný hlas (Windows: Nastavení → Čas a jazyk → Řeč).'), 6000);
    };
    synth.speak(u);
  };
  next();
  // Chromium on Windows sometimes pauses long queues – keep it awake
  clearInterval(S.keep);
  S.keep = setInterval(() => { if (!S.playing) return clearInterval(S.keep); if (synth.paused) synth.resume(); }, 5000);
}

export function speakBlocks(blocks, { title = '', start = 0 } = {}) {
  if (!ttsSupported) { toast(emo('speech') + ' Předčítání tady není k dispozici.'); return; }
  if (!voices.length) loadVoices();
  S.blocks = blocks; S.title = title;
  if (!S.bar) { S.bar = h('div', { class: 'tts-bar' }); document.body.append(S.bar); requestAnimationFrame(() => S.bar?.classList.add('show')); }
  playFrom(start);
}
export function speakText(text, lang = profile.lang === 'en' ? 'en' : 'cs') {
  if (!ttsSupported) return;
  S.gen++; synth.cancel();
  chunks(text).forEach(c => synth.speak(utter(c, lang)));
}
export function pauseSpeaking() { S.gen++; S.playing = false; synth?.cancel(); renderBar(); }
export function stopSpeaking() {
  S.gen++; S.playing = false; synth?.cancel(); clearInterval(S.keep);
  document.querySelectorAll('.tts-on').forEach(e => e.classList.remove('tts-on'));
  const bar = S.bar; S.bar = null;
  if (bar) { bar.classList.remove('show'); setTimeout(() => bar.remove(), 350); }
  S.blocks = [];
}
export const isSpeaking = () => S.playing;

const RATES = [0.8, 1, 1.15, 1.3, 1.5];
function renderBar() {
  const bar = S.bar;
  if (!bar) return;
  const p = ttsPrefs();
  bar.innerHTML = '';
  bar.classList.toggle('playing', S.playing);
  const rateBtn = h('button', { class: 'tts-rate', title: 'Rychlost' }, `${String(p.rate || 1).replace('.', ',')}×`);
  rateBtn.onclick = () => { p.rate = RATES[(RATES.indexOf(p.rate || 1) + 1) % RATES.length]; saveProfile(); if (S.playing) playFrom(S.i); else renderBar(); };
  bar.append(
    h('div', { class: 'tts-eq' }, h('i'), h('i'), h('i'), h('i')),
    h('div', { class: 'tts-info' }, h('b', {}, S.playing ? (profile.lang === 'en' ? 'Reading aloud' : 'Předčítám') : (profile.lang === 'en' ? 'Paused' : 'Pozastaveno')), h('small', {}, `${S.title}${S.title ? ' · ' : ''}${Math.min(S.i + 1, S.blocks.length)}/${S.blocks.length}`)),
    h('button', { class: 'tts-btn', title: 'Zpět', html: icon('left'), onclick: () => playFrom(Math.max(0, S.i - 1)) }),
    h('button', { class: 'tts-btn main', title: S.playing ? 'Pauza' : 'Pokračovat', html: icon(S.playing ? 'pause' : 'play'), onclick: () => (S.playing ? pauseSpeaking() : playFrom(S.i)) }),
    h('button', { class: 'tts-btn', title: 'Dál', html: icon('right'), onclick: () => playFrom(Math.min(S.blocks.length - 1, S.i + 1)) }),
    rateBtn,
    h('button', { class: 'tts-btn', title: 'Zavřít', html: icon('x'), onclick: stopSpeaking }));
}
window.addEventListener('hashchange', () => { if (S.bar) stopSpeaking(); });
