// Hudba ke studiu. Skladby se generují živě přes Web Audio (žádné soubory, funguje offline):
// klidné plochy, lo-fi klavír, déšť, moře, krb, noční hrací strojek a hnědý šum.
// Navíc jde přidat vlastní hudbu (MP3, M4A, OGG, WAV) – ukládá se do profilu.
import { profile, saveProfile, store } from './store.js';
import { audio } from './util.js';

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export const TRACKS = [
  { id: 'calm', emoji: 'sun', name: { cs: 'Ranní klid', en: 'Morning calm' }, desc: { cs: 'měkké plochy a třpyt', en: 'soft pads & sparkles' }, hue: '#ff9f43' },
  { id: 'lofi', emoji: 'coffee', name: { cs: 'Lo-fi klavír', en: 'Lo-fi piano' }, desc: { cs: 'pomalý beat, praskání desky', en: 'slow beat, vinyl crackle' }, hue: '#a2845e' },
  { id: 'rain', emoji: 'u:2614', name: { cs: 'Déšť za oknem', en: 'Rain on the window' }, desc: { cs: 'kapky a tiché tóny', en: 'raindrops & quiet keys' }, hue: '#5ac8fa' },
  { id: 'night', emoji: 'moon', name: { cs: 'Noční knihovna', en: 'Night library' }, desc: { cs: 'hrací strojek a ticho', en: 'music box & stillness' }, hue: '#5856d6' },
  { id: 'waves', emoji: 'wave', name: { cs: 'Moře', en: 'Ocean' }, desc: { cs: 'vlny na pláži', en: 'waves on the shore' }, hue: '#30b0c7' },
  { id: 'fire', emoji: 'fire', name: { cs: 'Krb', en: 'Fireplace' }, desc: { cs: 'praskání dřeva', en: 'crackling wood' }, hue: '#ff6b3d' },
  { id: 'focus', emoji: 'brain', name: { cs: 'Hnědý šum', en: 'Brown noise' }, desc: { cs: 'pro hluboké soustředění', en: 'for deep focus' }, hue: '#8e8e93' },
];

// ---------- audio graph ----------
let G = null;
function graph() {
  if (G) return G;
  const a = audio();
  const master = a.createGain(); master.gain.value = 0;
  const comp = a.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .02; comp.release.value = .3;
  const warm = a.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 9000;
  master.connect(warm).connect(comp).connect(a.destination);
  // reverb: generated impulse response (decaying stereo noise)
  const len = Math.floor(a.sampleRate * 3.6), ir = a.createBuffer(2, len, a.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  const verb = a.createConvolver(); verb.buffer = ir;
  const verbOut = a.createGain(); verbOut.gain.value = .9;
  verb.connect(verbOut).connect(master);
  // noise buffers (white / pink / brown), 6 s loops
  const nb = type => {
    const n = a.sampleRate * 6, b = a.createBuffer(2, n, a.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (type === 'white') d[i] = w * .5;
        else if (type === 'pink') { b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
        else { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      }
    }
    return b;
  };
  G = { a, master, verb, buf: { white: nb('white'), pink: nb('pink'), brown: nb('brown') } };
  return G;
}

// ---------- instruments ----------
function noise(env, type, gain, filters = []) {
  const { a } = env;
  const src = a.createBufferSource(); src.buffer = G.buf[type]; src.loop = true;
  src.loopStart = Math.random() * 2;
  const g = a.createGain(); g.gain.value = gain;
  let node = src;
  for (const [ft, f, q = .7] of filters) { const bq = a.createBiquadFilter(); bq.type = ft; bq.frequency.value = f; bq.Q.value = q; node.connect(bq); node = bq; }
  node.connect(g).connect(env.out);
  src.start(a.currentTime, Math.random() * 4);
  env.nodes.push(src);
  return { src, g, last: node };
}
function voice(env, { f, t, dur = 2, vol = .1, type = 'sine', attack = .005, wet = .3, fm = 0, ratio = 1, partials = [] }) {
  const { a } = env;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  const o = a.createOscillator(); o.type = type; o.frequency.value = f;
  if (fm) { const m = a.createOscillator(), mg = a.createGain(); m.frequency.value = f * ratio; mg.gain.setValueAtTime(f * fm, t); mg.gain.exponentialRampToValueAtTime(f * fm * .05 + .01, t + Math.min(dur, .9)); m.connect(mg).connect(o.frequency); m.start(t); m.stop(t + dur + .05); }
  o.connect(g);
  for (const [mul, pv] of partials) { const p = a.createOscillator(), pg = a.createGain(); p.frequency.value = f * mul; pg.gain.value = pv; p.connect(pg).connect(g); p.start(t); p.stop(t + dur + .05); }
  g.connect(env.out);
  if (wet) { const s = a.createGain(); s.gain.value = wet; g.connect(s).connect(env.wet); }
  o.start(t); o.stop(t + dur + .05);
}
const epiano = (env, f, t, vol = .08, dur = 2.6) => voice(env, { f, t, dur, vol, fm: 1.4, ratio: 1, partials: [[2, .12], [3.01, .03]], wet: .35 });
const bell = (env, f, t, vol = .05, dur = 4) => voice(env, { f, t, dur, vol, attack: .004, partials: [[2.76, .25], [5.4, .08]], wet: .7 });
function pad(env, notes, t, dur, vol = .022, cutoff = 1100) {
  const { a } = env;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + dur * .35); g.gain.setValueAtTime(1, t + dur * .6); g.gain.linearRampToValueAtTime(0, t + dur);
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(cutoff * .6, t); lp.frequency.linearRampToValueAtTime(cutoff, t + dur * .5); lp.frequency.linearRampToValueAtTime(cutoff * .7, t + dur); lp.Q.value = .4;
  lp.connect(g); g.connect(env.out);
  const s = a.createGain(); s.gain.value = .55; g.connect(s).connect(env.wet);
  for (const m of notes) for (const det of [-7, 6]) {
    const o = a.createOscillator(), og = a.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det + rnd(-2, 2);
    og.gain.value = vol; o.connect(og).connect(lp); o.start(t); o.stop(t + dur + .1);
  }
}
function drum(env, kind, t, vol = 1) {
  const { a } = env;
  if (kind === 'kick') {
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
    g.gain.setValueAtTime(.32 * vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .38);
    o.connect(g).connect(env.out); o.start(t); o.stop(t + .4);
    return;
  }
  const src = a.createBufferSource(); src.buffer = G.buf.white;
  const f = a.createBiquadFilter(), g = a.createGain();
  if (kind === 'snare') { f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = .8; g.gain.setValueAtTime(.12 * vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); }
  else { f.type = 'highpass'; f.frequency.value = 7500; g.gain.setValueAtTime(.035 * vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .045); }
  src.connect(f).connect(g).connect(env.out);
  if (kind === 'snare') { const s = a.createGain(); s.gain.value = .25; g.connect(s).connect(env.wet); }
  src.start(t, Math.random() * 5); src.stop(t + .2);
}
// lookahead scheduler
function loop(env, stepSec, fn) {
  let next = env.a.currentTime + .15, n = 0;
  const tick = () => { while (next < env.a.currentTime + .35) { fn(n++, next); next += typeof stepSec === 'function' ? stepSec(n) : stepSec; } };
  tick();
  const id = setInterval(tick, 90);
  env.timers.push(() => clearInterval(id));
}
function every(env, min, max, fn) {
  let id;
  const go = () => { fn(env.a.currentTime + .05); id = setTimeout(go, rnd(min, max) * 1000); };
  id = setTimeout(go, rnd(min * .3, max * .6) * 1000);
  env.timers.push(() => clearTimeout(id));
}

// ---------- tracks ----------
const GEN = {
  calm(env) {
    const chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 54, 59, 62]];
    loop(env, 8, (n, t) => { pad(env, chords[n % 4], t, 10.5); voice(env, { f: mtof(chords[n % 4][0] - 12), t, dur: 9, vol: .07, attack: 2, wet: .2 }); });
    const pent = [74, 76, 78, 81, 83, 86, 88];
    every(env, 1.2, 3.8, t => bell(env, mtof(pick(pent)), t, rnd(.018, .04)));
    noise(env, 'pink', .012, [['lowpass', 1200]]);
  },
  lofi(env) {
    const bpm = 72, s16 = 60 / bpm / 4;
    const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
    const pent = [72, 74, 76, 79, 81, 84];
    let mel = 2;
    // swing: long-short sixteenths
    loop(env, n => (n % 2 ? s16 * 1.16 : s16 * .84), (n, t) => {
      const step = n % 16, bar = Math.floor(n / 16), ch = chords[bar % 4];
      if (step === 0) ch.forEach((m, i) => epiano(env, mtof(m), t + i * .012, .045, 3.2));
      if (step === 6 && Math.random() < .7) ch.slice(1).forEach(m => epiano(env, mtof(m + 12), t, .022, 1.6));
      if (step === 0 || step === 8) voice(env, { f: mtof(ch[0] - 12), t, dur: 1.4, vol: .13, type: 'triangle', attack: .01, wet: 0 });
      if (step === 0 || step === 7 || (step === 10 && Math.random() < .5)) drum(env, 'kick', t, .9);
      if (step === 4 || step === 12) drum(env, 'snare', t, .8);
      if (step % 2 === 0) drum(env, 'hat', t, step % 4 === 0 ? .6 : 1);
      if (step % 2 === 0 && bar % 2 === 1 && Math.random() < .3) { mel = Math.max(0, Math.min(pent.length - 1, mel + pick([-2, -1, 1, 1, 2]))); epiano(env, mtof(pent[mel]), t, .035, 1.8); }
    });
    // vinyl: hiss + crackle
    noise(env, 'white', .006, [['bandpass', 5000, .5]]);
    every(env, .04, .5, t => drum(env, 'hat', t, rnd(.1, .5)));
    env.bus.frequency.value = 3600;
  },
  rain(env) {
    noise(env, 'pink', .55, [['highpass', 380], ['lowpass', 3200]]);
    noise(env, 'brown', .22, [['lowpass', 220]]);
    every(env, .03, .22, t => voice(env, { f: rnd(1800, 4200), t, dur: .05, vol: rnd(.004, .016), attack: .001, wet: .15 }));
    const keys = [57, 60, 64, 67, 69, 72, 76];
    every(env, 3.5, 8, t => { const m = pick(keys); epiano(env, mtof(m), t, .03, 3.5); if (Math.random() < .4) epiano(env, mtof(m + pick([3, 4, 7])), t + .35, .022, 3); });
    loop(env, 16, (n, t) => pad(env, [45, 52, 57, 60, 64], t, 17, .008, 700));
  },
  night(env) {
    voice(env, { f: 55, t: env.a.currentTime + .1, dur: 3600, vol: .05, attack: 4, wet: .2 });
    voice(env, { f: 82.41, t: env.a.currentTime + .1, dur: 3600, vol: .03, attack: 6, wet: .3 });
    const scale = [69, 72, 74, 76, 79, 81, 84];
    let k = 3, rest = 0;
    loop(env, .42, (n, t) => {
      if (rest > 0) { rest--; return; }
      if (n % 12 === 11) { rest = Math.floor(rnd(2, 7)); return; }
      k = Math.max(0, Math.min(scale.length - 1, k + pick([-2, -1, -1, 1, 1, 2])));
      if (Math.random() < .85) bell(env, mtof(scale[k]), t, rnd(.025, .045), 3.2);
    });
    noise(env, 'brown', .05, [['lowpass', 300]]);
  },
  waves(env) {
    const n = noise(env, 'pink', .05, [['lowpass', 600]]);
    const lp = n.last;
    const swell = () => {
      const t = env.a.currentTime, up = rnd(2.8, 4.2), down = rnd(4, 6.5), peak = rnd(.45, .8);
      n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(n.g.gain.value, t);
      n.g.gain.linearRampToValueAtTime(peak, t + up); n.g.gain.linearRampToValueAtTime(.06, t + up + down);
      lp.frequency.cancelScheduledValues(t); lp.frequency.setValueAtTime(lp.frequency.value, t);
      lp.frequency.linearRampToValueAtTime(rnd(1600, 2600), t + up); lp.frequency.linearRampToValueAtTime(450, t + up + down);
      const id = setTimeout(swell, (up + down - rnd(0, 1.2)) * 1000); env.timers.push(() => clearTimeout(id));
    };
    swell();
    noise(env, 'brown', .18, [['lowpass', 160]]);
  },
  fire(env) {
    noise(env, 'brown', .5, [['lowpass', 380]]);
    noise(env, 'pink', .025, [['bandpass', 900, .6]]);
    const crack = t => {
      const { a } = env, src = a.createBufferSource(); src.buffer = G.buf.white;
      const f = a.createBiquadFilter(), g = a.createGain(), big = Math.random() < .08;
      f.type = 'highpass'; f.frequency.value = rnd(1200, 4200);
      const d = big ? rnd(.03, .07) : rnd(.004, .02);
      g.gain.setValueAtTime(big ? rnd(.18, .3) : rnd(.02, .12), t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      src.connect(f).connect(g).connect(env.out); src.start(t, Math.random() * 5); src.stop(t + d + .02);
    };
    every(env, .02, .28, crack);
  },
  focus(env) { noise(env, 'brown', .75, [['lowpass', 900]]); noise(env, 'pink', .03, [['lowpass', 2500]]); },
};

// ---------- player ----------
const prefs = () => (profile.music ||= { vol: .5, track: 'calm', mode: 'list' });
const state = { id: null, playing: false, files: [], startedAt: 0 };
const subs = new Set();
const emit = () => subs.forEach(f => f(state));
export const onMusic = fn => { subs.add(fn); return () => subs.delete(fn); };
export const musicState = () => ({ ...state, vol: prefs().vol, mode: prefs().mode, id: state.id || prefs().track });
let cur = null, el = null, advanceT = null;

function startGen(id) {
  const g = graph();
  const a = g.a;
  const out = a.createGain(); out.gain.setValueAtTime(0, a.currentTime); out.gain.linearRampToValueAtTime(1, a.currentTime + 2.5);
  const bus = a.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 12000;
  const wet = a.createGain(); wet.gain.value = 1;
  bus.connect(out).connect(g.master);
  wet.connect(g.verb);
  const env = { a, out: bus, bus, wet, nodes: [], timers: [] };
  GEN[id](env);
  return {
    stop() {
      const t = a.currentTime;
      out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + 1.6);
      env.timers.forEach(f => f());
      setTimeout(() => { env.nodes.forEach(n => { try { n.stop(); } catch (e) { /* ok */ } }); out.disconnect(); wet.disconnect(); }, 1800);
    },
  };
}
async function startFile(id) {
  const blob = await store.get('music:blob:' + id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  el ||= new Audio();
  el.src = url; el.volume = prefs().vol;
  el.onended = () => (prefs().mode === 'one' ? (el.currentTime = 0, el.play()) : next());
  await el.play().catch(() => {});
  return { stop() { el.pause(); URL.revokeObjectURL(url); } };
}
function setMasterGain() {
  if (!G) return;
  const v = prefs().vol, t = G.a.currentTime;
  G.master.gain.cancelScheduledValues(t); G.master.gain.setTargetAtTime(state.playing ? v * v * 1.4 : 0, t, .25);
  if (el) el.volume = v;
}
export async function play(id = state.id || prefs().track) {
  clearTimeout(advanceT);
  if (cur && state.id === id && state.playing) return;
  cur?.stop(); cur = null;
  state.id = id; prefs().track = id; saveProfile();
  state.playing = true; state.startedAt = Date.now();
  if (GEN[id]) { graph(); setMasterGain(); cur = startGen(id); if (prefs().mode === 'list') advanceT = setTimeout(next, 7 * 60 * 1000); }
  else { setMasterGain(); cur = await startFile(id); if (!cur) { state.playing = false; } }
  emit();
}
export function pause() {
  clearTimeout(advanceT);
  state.playing = false;
  setMasterGain();
  const c = cur; cur = null;
  setTimeout(() => c?.stop(), 50);
  emit();
}
export function toggle() { state.playing ? pause() : play(); }
function order() { return [...TRACKS.map(t => t.id), ...state.files.map(f => f.id)]; }
export function next() { const o = order(); const i = o.indexOf(state.id || prefs().track); play(o[(i + 1) % o.length]); }
export function prev() { const o = order(); const i = o.indexOf(state.id || prefs().track); play(o[(i - 1 + o.length) % o.length]); }
export function setVolume(v) { prefs().vol = v; saveProfile(); setMasterGain(); emit(); }
export function setMode(m) { prefs().mode = m; saveProfile(); clearTimeout(advanceT); if (m === 'list' && state.playing && GEN[state.id]) advanceT = setTimeout(next, 7 * 60 * 1000); emit(); }
export function trackInfo(id = state.id || prefs().track) {
  const t = TRACKS.find(x => x.id === id);
  if (t) return t;
  const f = state.files.find(x => x.id === id);
  return f ? { id, emoji: 'music', name: { cs: f.name, en: f.name }, desc: { cs: 'vlastní hudba', en: 'your music' }, hue: '#ff2d55', file: true } : TRACKS[0];
}
export async function loadFiles() { state.files = (await store.get('music:files')) || []; emit(); return state.files; }
export async function addFiles(files) {
  for (const f of files) {
    if (!f.type.startsWith('audio/') && !/\.(mp3|m4a|ogg|wav|flac|aac|opus)$/i.test(f.name)) continue;
    const id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await store.set('music:blob:' + id, f);
    state.files.push({ id, name: f.name.replace(/\.[^.]+$/, ''), size: f.size });
  }
  await store.set('music:files', state.files);
  emit();
}
export async function removeFile(id) {
  if (state.id === id) pause();
  state.files = state.files.filter(f => f.id !== id);
  await store.set('music:files', state.files);
  await store.del('music:blob:' + id);
  emit();
}
// stop on sign-out / profile switch
export function resetMusic() { pause(); state.id = null; state.files = []; emit(); }
