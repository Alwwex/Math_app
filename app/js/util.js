import { profile, awardXP } from './store.js';
import { t, L, lang } from './i18n.js';
import { icon } from './icons.js';

// ---------- DOM helpers ----------
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);
// 3D emoji image (Fluent Emoji, MIT) – looks the same on every platform
// names like "fox" are the curated set, "u:1f984" is any emoji from the full set (emoji/u/)
export const emoSrc = name => (String(name).startsWith('u:') ? `emoji/u/${name.slice(2)}.webp` : `emoji/${name}.png`);
export const emo = (name, cls = '') => `<img class="emo ${cls}" src="${emoSrc(name)}" alt="" draggable="false">`;
export function emoEl(name, cls = '') { const i = document.createElement('img'); i.className = 'emo ' + cls; i.src = emoSrc(name); i.alt = ''; i.draggable = false; return i; }
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- Rich text: $math$, $$display$$, **bold**, *italic*, [[term|label]] ----------
const mathCache = new Map();
export function tex(src, display = false) {
  const key = (display ? 'D' : 'I') + src;
  if (mathCache.has(key)) return mathCache.get(key);
  let out;
  try {
    out = window.katex.renderToString(src, { displayMode: display, throwOnError: false, strict: false, trust: false });
  } catch (e) { out = `<code>${src}</code>`; }
  mathCache.set(key, out);
  return out;
}
export function rt(text) {
  if (text == null) return '';
  let s = String(text);
  const slots = [];
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { slots.push(tex(m.trim(), true)); return `\u0000${slots.length - 1}\u0000`; });
  s = s.replace(/\$([^$]+?)\$/g, (_, m) => { slots.push(tex(m, false)); return `\u0000${slots.length - 1}\u0000`; });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, term, label) => `<span class="term" data-term="${term}">${label || term}</span>`);
  s = s.replace(/\n\n/g, '<span class="pbr"></span>').replace(/\n/g, '<br>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[+i]);
  return s;
}
// Localised rich text
export const lrt = v => rt(L(v));

// Bilingual block: main language + (in "both" mode) the English translation
export function bi(v, tag = 'p', cls = '') {
  const main = h(tag, { class: cls, html: lrt(v) });
  if (profile.lang !== 'both' || typeof v !== 'object' || !v.en) return main;
  const wrap = h('div', { class: 'bi ' + cls });
  main.className = '';
  wrap.append(main, h(tag, { class: 'bi-en', html: `<span class="bi-tag">EN</span>${rt(v.en)}` }));
  return wrap;
}

// ---------- Glossary term popovers ----------
let glossaryLookup = () => null;
export function setGlossary(fn) { glossaryLookup = fn; }
let pop;
document.addEventListener('pointerover', e => {
  const term = e.target.closest?.('.term');
  if (!term) { if (pop && !e.target.closest('.term-pop')) { pop.remove(); pop = null; } return; }
  showTerm(term);
});
document.addEventListener('click', e => { const term = e.target.closest?.('.term'); if (term) showTerm(term); });
function showTerm(el) {
  const g = glossaryLookup(el.dataset.term);
  if (!g) return;
  pop?.remove();
  const other = lang() === 'en' ? g.cs : g.en;
  pop = h('div', { class: 'term-pop', html: `<b>${lang() === 'en' ? 'CZ' : 'EN'}: ${other}</b><br>${lrt(g.def)}` });
  document.body.append(pop);
  const r = el.getBoundingClientRect(), pr = pop.getBoundingClientRect();
  let x = r.left + r.width / 2 - pr.width / 2, y = r.top - pr.height - 10;
  if (y < 8) y = r.bottom + 10;
  pop.style.left = clamp(x, 8, innerWidth - pr.width - 8) + 'px';
  pop.style.top = y + 'px';
  clearTimeout(showTerm.timer);
  showTerm.timer = setTimeout(() => { pop?.remove(); pop = null; }, 4000);
}

// ---------- Toasts ----------
export function toast(html, ms = 2600) {
  const el = h('div', { class: 'toast', html });
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
}

// XP reward with flying "+N"
export function reward(xp, fromEl) {
  awardXP(xp);
  const target = $('#rail-xp');
  if (fromEl && target) {
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const fly = h('div', { class: 'xp-fly' }, `+${xp} XP`);
    document.body.append(fly);
    const x0 = a.left + a.width / 2, y0 = a.top;
    const anim = fly.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${x0}px, ${y0 - 50}px) scale(1.2)`, opacity: 1, offset: .3 },
      { transform: `translate(${b.left + b.width / 2}px, ${b.top + 10}px) scale(.5)`, opacity: .2 },
    ], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = () => { fly.remove(); target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 350 }); };
  } else {
    toast(`<span class="xp">+${xp} XP</span>`);
  }
}

// ---------- Confetti ----------
export function confetti({ x = innerWidth / 2, y = innerHeight / 3, count = 140, spread = 1 } = {}) {
  const c = $('#fx');
  const ctx = c.getContext('2d');
  const dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#007aff', '#ff9500', '#34c759', '#ffcc00', '#af52de', '#30b0c7', '#ff2d55', '#5856d6'];
  const parts = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * spread;
    const v = 6 + Math.random() * 9;
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[(Math.random() * colors.length) | 0], shape: Math.random() < .5 ? 0 : 1, life: 0 };
  });
  let raf;
  const tick = () => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
    let alive = 0;
    for (const p of parts) {
      p.life++; p.vy += .28; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > innerHeight + 30) continue;
      alive++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 160);
      ctx.fillStyle = p.c;
      if (p.shape) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { ctx.beginPath(); ctx.arc(0, 0, p.r / 1.4, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    if (alive && parts[0].life < 200) raf = requestAnimationFrame(tick); else { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
  };
  cancelAnimationFrame(raf);
  tick();
}

// ---------- Sounds (synthesised, no files needed) ----------
let ac;
export function audio() { const a = (ac ||= new (window.AudioContext || window.webkitAudioContext)()); if (a.state === 'suspended') a.resume().catch(() => {}); return a; }
// quiet interface sounds – each one is a few dozen milliseconds of a soft sine or filtered noise
const ui = () => profile.sounds && profile.uiSounds !== false;
function blip(f1, f2, dur, vol, type = 'sine', delay = 0) {
  const a = audio(), now = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, now); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, now + dur * .8);
  g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + .006); g.gain.exponentialRampToValueAtTime(.0001, now + dur);
  o.connect(g).connect(a.destination); o.start(now); o.stop(now + dur + .02);
}
let noiseBuf;
function whoosh(f1, f2, dur, vol) {
  const a = audio(), now = a.currentTime;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = a.createBufferSource(); src.buffer = noiseBuf;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.setValueAtTime(f1, now); bp.frequency.exponentialRampToValueAtTime(f2, now + dur);
  const g = a.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, now + dur);
  src.connect(bp).connect(g).connect(a.destination); src.start(now); src.stop(now + dur + .05);
}
let lastTap = 0;
export const sound = {
  // soft click for buttons
  tap() { if (!ui()) return; const n = performance.now(); if (n - lastTap < 45) return; lastTap = n; blip(1500, 1100, .05, .022, 'triangle'); },
  // tiny tick (drag & drop, small changes)
  tick() { if (!ui()) return; blip(2300, 2100, .035, .018); },
  toggle(on = true) { if (!ui()) return; on ? (blip(880, 880, .07, .025), blip(1320, 1320, .09, .022, 'sine', .055)) : (blip(1320, 1320, .07, .022), blip(880, 880, .09, .022, 'sine', .055)); },
  open() { if (!ui()) return; whoosh(500, 1900, .22, .03); blip(660, 990, .14, .012); },
  close() { if (!ui()) return; whoosh(1700, 450, .2, .026); },
  // lesson step finished – a soft marimba third
  step() { if (!profile.sounds) return; blip(659.25, 659.25, .35, .045); blip(987.77, 987.77, .45, .04, 'sine', .09); },
  swipe() { if (!ui()) return; whoosh(900, 2600, .16, .028); },
  select() { if (!ui()) return; blip(1046.5, 1046.5, .12, .022); },
  correct() {
    if (!profile.sounds) return;
    const a = audio(), now = a.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, now + i * .07); g.gain.linearRampToValueAtTime(.12, now + i * .07 + .02); g.gain.exponentialRampToValueAtTime(.001, now + i * .07 + .45);
      o.connect(g).connect(a.destination); o.start(now + i * .07); o.stop(now + i * .07 + .5);
    });
  },
  wrong() {
    if (!profile.sounds) return;
    const a = audio(), now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(140, now + .25);
    g.gain.setValueAtTime(.14, now); g.gain.exponentialRampToValueAtTime(.001, now + .3);
    o.connect(g).connect(a.destination); o.start(now); o.stop(now + .32);
  },
  pop() {
    if (!profile.sounds) return;
    const a = audio(), now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(900, now + .08);
    g.gain.setValueAtTime(.08, now); g.gain.exponentialRampToValueAtTime(.001, now + .12);
    o.connect(g).connect(a.destination); o.start(now); o.stop(now + .14);
  },
  flip() {
    if (!profile.sounds || !profile.flipSound) return;
    const a = audio(), now = a.currentTime, dur = .32;
    const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) { const t = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 1.5) * (0.6 + 0.4 * Math.sin(t * 40)); }
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(2400, now); bp.frequency.linearRampToValueAtTime(1200, now + dur); bp.Q.value = .7;
    const g = a.createGain(); g.gain.value = .22;
    src.connect(bp).connect(g).connect(a.destination); src.start(now);
  },
};

// ---------- Modals ----------
export function modal({ title, body, actions = [], onClose } = {}) {
  const back = h('div', { class: 'modal-back' });
  const box = h('div', { class: 'modal', role: 'dialog' });
  if (title) box.append(h('h2', {}, title));
  if (body) box.append(typeof body === 'string' ? h('div', { class: 'muted', html: body }) : body);
  const bar = h('div', { class: 'actions' });
  const close = (v) => { back.remove(); onClose?.(v); };
  for (const a of actions) bar.append(h('button', { class: 'btn ' + (a.cls || ''), onclick: () => { const r = a.onClick?.(); if (r !== false) close(a.value); } }, a.label));
  if (actions.length) box.append(bar);
  back.append(box);
  back.addEventListener('pointerdown', e => { if (e.target === back) close(null); });
  document.body.append(back);
  return { close, box };
}
export function confirmDialog(title, text, okLabel = t('delete'), cls = 'coral') {
  return new Promise(res => modal({ title, body: text, actions: [{ label: t('cancel'), value: false, cls: 'ghost' }, { label: okLabel, value: true, cls }], onClose: v => res(!!v) }));
}

export function pickFile(accept) {
  return new Promise(res => {
    const inp = h('input', { type: 'file', accept, style: { display: 'none' } });
    inp.onchange = () => { res(inp.files[0] || null); inp.remove(); };
    document.body.append(inp);
    inp.click();
  });
}
export function download(blob, name) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export { icon, t, L };
