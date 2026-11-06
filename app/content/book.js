// Kniha, kapitoly a obsah lekcí. Obsah každé kapitoly se načítá až když je potřeba.
import { toc, PAGES } from './toc.js';

export const book = {
  title: { cs: 'Matematické metody pro fyziku a techniku', en: 'Mathematical Methods for Physics and Engineering' },
  short: { cs: 'Matematické metody', en: 'Mathematical Methods' },
  authors: 'K. F. Riley · M. P. Hobson · S. J. Bence',
  edition: { cs: '3. vydání', en: 'Third edition' },
  pdf: 'book/mmpe.pdf',
  cover: 'book/cover.jpg',
  coverSmall: 'book/cover-small.jpg',
  pages: PAGES,
};

// emoji + barva pro každou kapitolu
const META = {
  0: ['bulb', '#ff9500'], 1: ['abacus', '#ff3b30'], 2: ['chart', '#007aff'], 3: ['cyclone', '#5856d6'], 4: ['infinity', '#30b0c7'],
  5: ['mountain', '#34c759'], 6: ['package', '#a2845e'], 7: ['compass', '#ff9500'], 8: ['numbers', '#007aff'], 9: ['guitar', '#ff2d55'],
  10: ['tornado', '#5ac8fa'], 11: ['wave', '#007aff'], 12: ['music', '#af52de'], 13: ['antenna', '#30b0c7'], 14: ['hourglass', '#ff9500'],
  15: ['bell', '#ffcc00'], 16: ['link', '#8e8e93'], 17: ['violin', '#a2845e'], 18: ['gem', '#5ac8fa'], 19: ['atom', '#5856d6'],
  20: ['fire', '#ff3b30'], 21: ['drum', '#ff9500'], 22: ['coaster', '#ff2d55'], 23: ['puzzle', '#34c759'], 24: ['galaxy', '#5856d6'],
  25: ['airplane', '#007aff'], 26: ['ice', '#30b0c7'], 27: ['laptop', '#8e8e93'], 28: ['snowflake', '#5ac8fa'], 29: ['testtube', '#34c759'],
  30: ['die', '#ff3b30'], 31: ['barchart', '#af52de'],
};

export const GROUPS = [
  { id: 'start', title: { cs: 'Začni tady', en: 'Start here' }, chapters: [0] },
  { id: 'basics', title: { cs: 'Základy', en: 'Foundations' }, chapters: [1, 2, 3, 4] },
  { id: 'multi', title: { cs: 'Analýza více proměnných', en: 'Multivariable calculus' }, chapters: [5, 6, 10, 11] },
  { id: 'linear', title: { cs: 'Vektory a matice', en: 'Vectors and matrices' }, chapters: [7, 8, 9, 26] },
  { id: 'fourier', title: { cs: 'Řady a transformace', en: 'Series and transforms' }, chapters: [12, 13] },
  { id: 'ode', title: { cs: 'Diferenciální rovnice', en: 'Differential equations' }, chapters: [14, 15, 16, 17, 20, 21] },
  { id: 'special', title: { cs: 'Speciální funkce a kvantová mechanika', en: 'Special functions and quantum mechanics' }, chapters: [18, 19] },
  { id: 'var', title: { cs: 'Variační počet a integrální rovnice', en: 'Variational calculus and integral equations' }, chapters: [22, 23] },
  { id: 'complex', title: { cs: 'Komplexní analýza', en: 'Complex analysis' }, chapters: [24, 25] },
  { id: 'num', title: { cs: 'Numerika', en: 'Numerical methods' }, chapters: [27] },
  { id: 'groups', title: { cs: 'Symetrie a grupy', en: 'Symmetry and groups' }, chapters: [28, 29] },
  { id: 'prob', title: { cs: 'Pravděpodobnost a statistika', en: 'Probability and statistics' }, chapters: [30, 31] },
];

const warm = { n: 0, page: null, title: { cs: 'Rozcvička: funkce a grafy', en: 'Warm-up: functions and graphs' }, sections: [] };
export const chapters = [warm, ...toc].map(ch => ({ ...ch, id: String(ch.n), emoji: META[ch.n][0], color: META[ch.n][1] }));
export const chapter = n => chapters.find(c => c.n === Number(n)) || null;

const pad = n => String(n).padStart(2, '0');
const loaders = Object.fromEntries(chapters.map(c => [c.n, () => import(`./chapters/ch${pad(c.n)}.js`)]));
const cache = new Map();
export async function loadChapter(n) {
  n = Number(n);
  if (cache.has(n)) return cache.get(n);
  const meta = chapter(n);
  let mod;
  try { mod = (await loaders[n]()).default; } catch (e) { console.warn('chapter', n, e); return null; }
  const c = normalize(mod, meta);
  cache.set(n, c);
  registerGlossary(c);
  return c;
}
export async function loadAllChapters() { return (await Promise.all(chapters.map(c => loadChapter(c.n)))).filter(Boolean); }

function sectionPage(meta, sec) {
  const first = String(sec).split(/[–\-, ]+/)[0];
  return meta.sections.find(s => s.n === first)?.page ?? meta.page;
}
function normalize(mod, meta) {
  const id = String(meta.n);
  const steps = mod.steps.map((s, i) => ({ ...s, id: s.id || 's' + i, emoji: s.emoji || s.icon || meta.emoji, page: s.page ?? (s.sec ? sectionPage(meta, s.sec) : meta.page) }));
  steps.forEach((s, si) => s.blocks.forEach((b, bi) => { if (b.t === 'check' && !b.q.id) b.q.id = `${id}-c${si}-${bi}`; }));
  const quiz = (mod.quiz || []).map((q, i) => ({ ...q, id: q.id || `${id}-q${i}` }));
  const glossary = (mod.glossary || []).map(g => ({ ...g, chapter: meta.n }));
  return { ...meta, ...mod, id, n: meta.n, title: meta.title, emoji: meta.emoji, color: meta.color, steps, quiz, glossary };
}

// glossary lookup for [[term]] popovers
const glossary = new Map();
function registerGlossary(c) { for (const g of c.glossary) if (!glossary.has(g.id)) glossary.set(g.id, g); }
export function glossaryLookup(id) { return glossary.get(id) || null; }

// which chapter / section is on a given PDF page
export function locate(page) {
  let ch = null;
  for (const c of chapters) if (c.page && c.page <= page) ch = c;
  if (!ch) return null;
  let sec = null;
  for (const s of ch.sections) if (s.page <= page) sec = s;
  return { chapter: ch, section: sec };
}
export const chapterLabel = (c, L) => (c.n === 0 ? L(c.title) : `${c.n}. ${L(c.title)}`);
