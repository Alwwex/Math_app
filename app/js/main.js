import { profile, saveProfile, onProfile, currentStreak, level, flushSaves, store } from './store.js';
import { t, L } from './i18n.js';
import { h, $, toast, setGlossary, emo } from './util.js';
import { icon } from './icons.js';
import { chapters, glossaryLookup, loadAllChapters } from '../content/book.js';
import { autoSignIn, currentUser } from './auth.js';

const ROUTES = {
  home: () => import('./views/home.js'),
  library: () => import('./views/library.js'),
  chapter: () => import('./views/chapter.js'),
  reader: () => import('./views/reader.js'),
  lesson: () => import('./views/lesson.js'),
  quiz: () => import('./views/quiz.js'),
  tests: () => import('./views/tests.js'),
  cards: () => import('./views/cards.js'),
  notebook: () => import('./views/notebook.js'),
  settings: () => import('./views/settings.js'),
};
const NAV = [
  ['home', 'today', '#/home'],
  ['library', 'grid', '#/library'],
  ['reader', 'book', '#/reader'],
  ['tests', 'quiz', '#/tests'],
  ['cards', 'cards', '#/cards'],
  ['notebook', 'notebook', '#/notebook'],
];

let cleanup = null, navToken = 0, locked = true, lastName = null;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] || 'home', params: parts.slice(1), query: Object.fromEntries(new URLSearchParams(qs || '')) };
}

async function route() {
  if (locked) return;
  const token = ++navToken;
  const { name, params, query } = parseHash();
  const loader = ROUTES[name] || ROUTES.home;
  const mod = await loader();
  if (token !== navToken) return;
  const swap = async () => {
    try { cleanup?.(); } catch (e) { console.error(e); }
    cleanup = null;
    await flushSaves();
    const host = $('#view');
    host.innerHTML = '';
    const root = h('section', { class: 'view view-' + name + (document.startViewTransition ? '' : ' enter') });
    host.append(root);
    $('#app').classList.toggle('side-hidden', name === 'reader');
    renderNav(name, params);
    try { cleanup = (await mod.default.mount(root, params, query)) || null; }
    catch (e) { console.error(e); root.append(h('div', { class: 'empty' }, h('h3', {}, 'Něco se pokazilo'), h('code', {}, String(e?.message || e)))); }
  };
  const same = lastName === name && name !== 'chapter' && name !== 'lesson';
  lastName = name;
  if (document.startViewTransition && !same && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { await document.startViewTransition(swap).updateCallbackDone; } catch (e) { /* aborted */ }
  } else await swap();
}

function avatarHTML(u, size = 38) {
  return `<div class="avatar" style="--av:${u.color};width:${size}px;height:${size}px">${emo(u.avatar)}</div>`;
}

function renderNav(active, params = []) {
  const side = $('#side');
  const u = currentUser();
  side.innerHTML = '';
  const top = h('div', { class: 'side-top' },
    h('a', { class: 'side-brand', href: '#/home', html: `<img src="assets/icon-192.png" alt=""><span>Folio</span>` }),
    h('button', { class: 'side-toggle', title: 'Panel', html: icon('sidebar'), onclick: () => { $('#app').classList.toggle('side-collapsed'); profile.sideCollapsed = $('#app').classList.contains('side-collapsed'); saveProfile(); } }));
  side.append(top);
  for (const [key, ic, href] of NAV) side.append(h('a', { class: 'side-item' + (active === key ? ' active' : ''), href, html: icon(ic) + `<span>${t('nav.' + key)}</span>` }));
  side.append(h('div', { class: 'side-cap' }, t('nav.chapters')));
  const list = h('div', { class: 'side-chapters' });
  const curCh = ['chapter', 'lesson', 'quiz'].includes(active) ? params[0] : null;
  for (const c of chapters) {
    const st = profile.lessons[c.id];
    list.append(h('a', { class: 'side-item side-chapter' + (curCh === c.id ? ' active' : ''), href: `#/chapter/${c.id}`, title: L(c.title),
      html: `<span class="num">${c.n || '★'}</span><span class="t">${L(c.title)}</span>${st?.finished ? '<span class="badge">✓</span>' : ''}` }));
  }
  side.append(list, h('div', { class: 'side-spacer' }));
  if (u) {
    const lv = level();
    side.append(h('div', { class: 'side-user' },
      h('a', { href: '#/settings', html: avatarHTML(u) }),
      h('div', { class: 'who' }, h('b', {}, u.name), h('small', {}, `${t('level')} ${lv.lvl} · ${currentStreak()} ${t('daysShort')} ${currentStreak() ? '🔥' : ''}`)),
      h('a', { class: 'btn icon small ghost' + (active === 'settings' ? ' tinted' : ''), href: '#/settings', title: t('nav.settings'), html: icon('settings') })));
  }
  // active chapter into view
  requestAnimationFrame(() => list.querySelector('.active')?.scrollIntoView({ block: 'nearest' }));
  // phone tab bar
  const tab = $('#tabbar');
  tab.innerHTML = '';
  for (const [key, ic, href] of [...NAV.slice(0, 5), ['settings', 'settings', '#/settings']]) tab.append(h('a', { class: active === key ? 'active' : '', href, html: icon(ic) + `<span>${t('nav.' + key)}</span>` }));
}

export function applyTheme() {
  const dark = profile.theme === 'dark' || (profile.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.lang = profile.lang === 'en' ? 'en' : 'cs';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#000000' : '#f2f2f7');
}

export async function enterApp() {
  locked = false;
  applyTheme();
  $('#app').classList.remove('locked');
  $('#app').classList.toggle('side-collapsed', !!profile.sideCollapsed);
  loadAllChapters();
  if (!location.hash || location.hash === '#/' || location.hash.startsWith('#/login')) location.hash = '#/home';
  lastName = null;
  await route();
}
export async function lock() {
  await flushSaves();
  try { cleanup?.(); } catch (e) { /* ignore */ }
  cleanup = null;
  locked = true;
  const { signOut } = await import('./auth.js');
  await signOut();
  $('#app').classList.add('locked');
  document.documentElement.dataset.theme = 'light';
  const host = $('#view');
  host.innerHTML = '';
  const root = h('section', { class: 'view no-scroll' });
  host.append(root);
  const { showLock } = await import('./views/lock.js');
  showLock(root, () => enterApp());
}

async function boot() {
  setGlossary(glossaryLookup);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  onProfile(() => {
    const who = $('#side .who small');
    if (who) { const lv = level(); who.textContent = `${t('level')} ${lv.lvl} · ${currentStreak()} ${t('daysShort')} ${currentStreak() ? '🔥' : ''}`; }
  });
  window.addEventListener('pointerdown', e => {
    if (!locked && e.pointerType === 'pen' && !profile.penOnly && !profile.penAutoDone) {
      profile.penOnly = true; profile.penAutoDone = true; saveProfile();
      toast(emo('pencil') + (profile.lang === 'en' ? ' Pen detected – the pen writes, your finger scrolls.' : ' Pero rozpoznáno – perem píšeš, prstem posouváš.'), 4200);
    }
  }, true);
  document.addEventListener('gesturestart', e => e.preventDefault());
  window.addEventListener('hashchange', route);
  window.addEventListener('keydown', e => {
    if (e.key === 'F11' && window.folio?.toggleFullscreen) { e.preventDefault(); window.folio.toggleFullscreen(); }
  });

  const u = await autoSignIn();
  setTimeout(() => $('#splash')?.classList.add('gone'), 700);
  if (u) await enterApp(); else await lock();

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  void store;
}

boot();
export function rerender() { lastName = null; route(); }
