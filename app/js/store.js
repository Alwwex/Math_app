// Trvalé úložiště (IndexedDB). Každý profil má vlastní jmenný prostor klíčů "u:<id>:…",
// globální data (seznam profilů) mají předponu "global:".
const DB_NAME = 'folio';
const DB_VER = 1;
let dbp = null;
let NS = '';

function openDB() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}
const wrap = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
const full = k => (k.startsWith('global:') ? k : NS + k);

async function rawGet(k) { const db = await openDB(); return wrap(db.transaction('kv').objectStore('kv').get(k)); }
async function rawSet(k, v) { const db = await openDB(); const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); return new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function rawDel(k) { const db = await openDB(); const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); return new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function rawKeys() { const db = await openDB(); return (await wrap(db.transaction('kv').objectStore('kv').getAllKeys())).filter(k => typeof k === 'string'); }

export const store = {
  async get(key, fallback = undefined) { const v = await rawGet(full(key)); return v === undefined ? fallback : v; },
  set(key, value) { return rawSet(full(key), value); },
  del(key) { return rawDel(full(key)); },
  async keys(prefix = '') { const p = full(prefix); return (await rawKeys()).filter(k => k.startsWith(p)).map(k => (k.startsWith('global:') ? k : k.slice(NS.length))); },
  async entries(prefix = '') { const out = []; for (const k of await this.keys(prefix)) out.push([k, await this.get(k)]); return out; },
  raw: { get: rawGet, set: rawSet, del: rawDel, keys: rawKeys },
};
export function setNamespace(userId) { NS = userId ? `u:${userId}:` : ''; }
export function namespace() { return NS; }

// Debounced writes (ink strokes, profile…)
const pending = new Map();
export function saveLater(key, getValue, delay = 500) {
  const fk = full(key);
  clearTimeout(pending.get(fk)?.timer);
  const timer = setTimeout(() => { pending.delete(fk); rawSet(fk, getValue()).catch(err => console.error('save failed', key, err)); }, delay);
  pending.set(fk, { timer, getValue });
}
export async function flushSaves() {
  const jobs = [];
  for (const [fk, p] of pending) { clearTimeout(p.timer); jobs.push(rawSet(fk, p.getValue())); }
  pending.clear();
  await Promise.all(jobs);
}
window.addEventListener('pagehide', () => { flushSaves(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSaves(); });
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});

// ---------- profile (settings + progress of the signed-in user) ----------
const today = () => new Date().toLocaleDateString('sv-SE');
const DEFAULT_PROFILE = {
  version: 2,
  lang: 'cs', theme: 'light', penOnly: false, sounds: true, flipSound: true, readerTint: 'white',
  name: '', xp: 0, streak: { last: null, count: 0 }, days: {}, goals: {},
  lessons: {}, quizzes: {}, cards: {}, sectionPages: {}, lastChapter: 1, cardDir: 'csen',
  ink: { tool: 'pen', color: '#1f2430', size: 1, hlColor: '#ffd84d' },
};
export const profile = structuredClone(DEFAULT_PROFILE);
const listeners = new Set();

export async function loadProfile() {
  for (const k of Object.keys(profile)) delete profile[k];
  Object.assign(profile, structuredClone(DEFAULT_PROFILE));
  const saved = await store.get('profile');
  if (saved) Object.assign(profile, saved, { ink: { ...DEFAULT_PROFILE.ink, ...(saved.ink || {}) } });
  return profile;
}
export function saveProfile() {
  saveLater('profile', () => structuredClone(profile), 300);
  listeners.forEach(fn => fn(profile));
}
export function onProfile(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// daily goals: lesson steps, answered questions, cards
export function bump(kind, n = 1) {
  const d = today();
  const g = (profile.goals[d] ||= { steps: 0, questions: 0, cards: 0 });
  g[kind] = (g[kind] || 0) + n;
  saveProfile();
}
export function todayGoals() { return profile.goals[today()] || { steps: 0, questions: 0, cards: 0 }; }
export function awardXP(amount) {
  const d = today();
  profile.xp += amount;
  profile.days[d] = (profile.days[d] || 0) + amount;
  touchStreak();
  saveProfile();
}
export function touchStreak() {
  const d = today(), s = profile.streak;
  if (s.last === d) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  s.count = s.last === y.toLocaleDateString('sv-SE') ? s.count + 1 : 1;
  s.last = d;
}
export function currentStreak() {
  const s = profile.streak;
  if (!s.last) return 0;
  const y = new Date(); y.setDate(y.getDate() - 1);
  return (s.last === today() || s.last === y.toLocaleDateString('sv-SE')) ? s.count : 0;
}
export function level(xp = profile.xp) {
  const lvl = Math.floor(Math.sqrt(xp / 40)) + 1;
  const cur = 40 * (lvl - 1) ** 2, next = 40 * lvl ** 2;
  return { lvl, pct: (xp - cur) / (next - cur), next: next - xp };
}
export function lessonState(id) { return (profile.lessons[id] ||= { step: 0, done: [], checks: {} }); }
export function quizState(id) { return (profile.quizzes[id] ||= { best: 0, attempts: [], wrong: [] }); }
export { today, DEFAULT_PROFILE };
