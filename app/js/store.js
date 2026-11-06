// Trvalé úložiště: IndexedDB (funguje v Electronu i v prohlížeči, data zůstávají po restartu).
const DB_NAME = 'folio';
const DB_VER = 1;
let dbp = null;

function openDB() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction('kv', mode);
    const s = t.objectStore('kv');
    let result;
    Promise.resolve(fn(s)).then(r => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

const wrap = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

export const store = {
  async get(key, fallback = undefined) {
    const db = await openDB();
    const v = await wrap(db.transaction('kv').objectStore('kv').get(key));
    return v === undefined ? fallback : v;
  },
  async set(key, value) {
    return tx('readwrite', s => { s.put(value, key); });
  },
  async del(key) {
    return tx('readwrite', s => { s.delete(key); });
  },
  async keys(prefix = '') {
    const db = await openDB();
    const all = await wrap(db.transaction('kv').objectStore('kv').getAllKeys());
    return all.filter(k => typeof k === 'string' && k.startsWith(prefix));
  },
  async entries(prefix = '') {
    const keys = await this.keys(prefix);
    const out = [];
    for (const k of keys) out.push([k, await this.get(k)]);
    return out;
  },
  async clear() {
    return tx('readwrite', s => { s.clear(); });
  },
};

// Debounced writer – used for frequently-changing data (ink, profile)
const pending = new Map();
export function saveLater(key, getValue, delay = 500) {
  clearTimeout(pending.get(key)?.timer);
  const timer = setTimeout(() => {
    pending.delete(key);
    store.set(key, getValue()).catch(err => console.error('save failed', key, err));
  }, delay);
  pending.set(key, { timer, getValue });
}
export async function flushSaves() {
  const jobs = [];
  for (const [key, p] of pending) {
    clearTimeout(p.timer);
    jobs.push(store.set(key, p.getValue()));
  }
  pending.clear();
  await Promise.all(jobs);
}
window.addEventListener('pagehide', () => { flushSaves(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSaves(); });

// Ask the browser to keep our data (no automatic eviction)
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});

// ---------- Profile (settings + progress) ----------
const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD

const DEFAULT_PROFILE = {
  version: 1,
  lang: 'cs',            // 'cs' | 'en' | 'both'
  theme: 'light',        // 'light' | 'dark' | 'auto'
  penOnly: false,        // touch scrolls, pen draws
  sounds: true,
  flipSound: true,
  readerTint: 'white',   // 'white' | 'sepia' | 'night'
  name: '',
  xp: 0,
  streak: { last: null, count: 0 },
  days: {},
  lessons: {},
  quizzes: {},
  cards: {},
  sectionPages: {},
  ink: { tool: 'pen', color: '#1f2430', size: 1, hlColor: '#ffd84d' },
  achievements: {},
};

export const profile = structuredClone(DEFAULT_PROFILE);
const listeners = new Set();

export async function loadProfile() {
  const saved = await store.get('profile');
  if (saved) Object.assign(profile, structuredClone(DEFAULT_PROFILE), saved, { ink: { ...DEFAULT_PROFILE.ink, ...(saved.ink || {}) } });
  return profile;
}
export function saveProfile() {
  saveLater('profile', () => structuredClone(profile), 300);
  listeners.forEach(fn => fn(profile));
}
export function onProfile(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function awardXP(amount) {
  const d = today();
  profile.xp += amount;
  profile.days[d] = (profile.days[d] || 0) + amount;
  touchStreak();
  saveProfile();
}
export function touchStreak() {
  const d = today();
  const s = profile.streak;
  if (s.last === d) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yd = y.toLocaleDateString('sv-SE');
  s.count = s.last === yd ? s.count + 1 : 1;
  s.last = d;
}
export function currentStreak() {
  const s = profile.streak;
  if (!s.last) return 0;
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (s.last === today() || s.last === y.toLocaleDateString('sv-SE')) return s.count;
  return 0;
}
export function level(xp = profile.xp) {
  const lvl = Math.floor(Math.sqrt(xp / 40)) + 1;
  const cur = 40 * (lvl - 1) ** 2, next = 40 * lvl ** 2;
  return { lvl, pct: (xp - cur) / (next - cur), next: next - xp };
}
export function lessonState(id) {
  return (profile.lessons[id] ||= { step: 0, done: [], checks: {} });
}
export function quizState(id) {
  return (profile.quizzes[id] ||= { best: 0, attempts: [], wrong: [] });
}
export { today, DEFAULT_PROFILE };
