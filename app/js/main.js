import { loadProfile, profile, saveProfile, onProfile, currentStreak, level, flushSaves } from './store.js';
import { t } from './i18n.js';
import { h, $, toast, setGlossary } from './util.js';
import { icon } from './icons.js';
import { glossaryLookup } from '../content/book.js';

const ROUTES = {
  home: () => import('./views/home.js'),
  reader: () => import('./views/reader.js'),
  lesson: () => import('./views/lesson.js'),
  quiz: () => import('./views/quiz.js'),
  cards: () => import('./views/cards.js'),
  notebook: () => import('./views/notebook.js'),
  settings: () => import('./views/settings.js'),
};
const NAV = [
  ['home', 'home', '#/home'],
  ['reader', 'book', '#/reader'],
  ['lesson', 'lesson', '#/lesson/1-1'],
  ['quiz', 'quiz', '#/quiz/1-1'],
  ['cards', 'cards', '#/cards'],
  ['notebook', 'notebook', '#/notebook'],
];

let cleanup = null;
let navToken = 0;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { name: parts[0] || 'home', params: parts.slice(1), query };
}

async function route() {
  const token = ++navToken;
  const { name, params, query } = parseHash();
  const loader = ROUTES[name] || ROUTES.home;
  try { cleanup?.(); } catch (e) { console.error(e); }
  cleanup = null;
  await flushSaves();
  const mod = await loader();
  if (token !== navToken) return;
  const host = $('#view');
  host.innerHTML = '';
  const root = h('section', { class: 'view view-' + name });
  host.append(root);
  renderRail(name);
  try {
    cleanup = (await mod.default.mount(root, params, query)) || null;
  } catch (e) {
    console.error(e);
    root.append(h('div', { class: 'empty' }, h('h3', {}, 'Ups, něco se pokazilo.'), h('code', {}, String(e?.message || e))));
  }
}

function renderRail(active) {
  const rail = $('#rail');
  rail.innerHTML = '';
  rail.append(h('a', { class: 'rail-logo', href: '#/home', title: 'Folio', html: `<svg viewBox="0 0 64 64"><path d="M10 14c8-4 16-4 22 1v38c-6-5-14-5-22-1z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M54 14c-8-4-16-4-22 1v38c6-5 14-5 22-1z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M37 40c4-10 8-14 13-15" fill="none" stroke="#e8794a" stroke-width="4" stroke-linecap="round"/></svg>` }));
  for (const [key, ic, href] of NAV) {
    rail.append(h('a', { class: 'rail-item' + (active === key ? ' active' : ''), href, html: icon(ic) + `<span>${t('nav.' + key)}</span>` }));
  }
  rail.append(h('div', { class: 'rail-spacer' }));
  const lv = level();
  rail.append(h('div', { class: 'rail-xp', id: 'rail-xp', title: `${profile.xp} XP`, html:
    `<span class="flame">${currentStreak() ? '🔥' : '✨'}</span><span>${currentStreak()} ${profile.lang === 'en' ? 'd' : 'd'}</span><span>${t('level')} ${lv.lvl}</span>` }));
  rail.append(h('a', { class: 'rail-item' + (active === 'settings' ? ' active' : ''), href: '#/settings', html: icon('settings') + `<span>${t('nav.settings')}</span>` }));
}

export function applyTheme() {
  const dark = profile.theme === 'dark' || (profile.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.lang = profile.lang === 'en' ? 'en' : 'cs';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#14161b' : '#f3eee4');
}

async function boot() {
  await loadProfile();
  applyTheme();
  setGlossary(glossaryLookup);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  onProfile(() => {
    const xp = $('#rail-xp');
    if (xp) {
      const lv = level();
      xp.innerHTML = `<span class="flame">${currentStreak() ? '🔥' : '✨'}</span><span>${currentStreak()} d</span><span>${t('level')} ${lv.lvl}</span>`;
    }
  });

  // Pen detection → automatically switch to "pen draws, finger scrolls"
  window.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen' && !profile.penOnly && !profile.penAutoDone) {
      profile.penOnly = true; profile.penAutoDone = true; saveProfile();
      toast(profile.lang === 'en' ? '✏️ Pen detected – the pen writes, your finger scrolls.' : '✏️ Pero rozpoznáno – perem píšeš, prstem posouváš.', 4200);
    }
  }, true);

  // Disable browser pinch-zoom of the whole UI (Ctrl+wheel stays for accessibility in reader)
  document.addEventListener('gesturestart', e => e.preventDefault());

  window.addEventListener('hashchange', route);
  await route();
  setTimeout(() => $('#splash')?.classList.add('gone'), 250);

  // Offline support for the web version (not needed inside the desktop app)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.hostname.match(/^(localhost|127\.)/)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

boot();

export function rerender() { route(); }
