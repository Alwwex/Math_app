// Ovládání okna ve stylu macOS („semafor"): červená zavře aplikaci, žlutá ji schová do lišty,
// zelená přepíná celou obrazovku ↔ okno (s Altem okno maximalizuje). Jen v desktopové aplikaci.
import { h, sound } from './util.js';
import { lang } from './i18n.js';

const G = {
  close: '<path d="M3.5 3.5l5 5M8.5 3.5l-5 5"/>',
  min: '<path d="M2.8 6h6.4"/>',
  full: '<path d="M3.2 7.6V3.2h4.4z M8.8 4.4v4.4H4.4z" fill="currentColor" stroke="none"/>',
  exit: '<path d="M5.6 1.8v3.8H1.8z M6.4 10.2V6.4h3.8z" fill="currentColor" stroke="none"/>',
};
const svg = p => `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">${p}</svg>`;

export function initWindowControls() {
  const f = window.folio;
  if (!f?.frameless) return;
  const root = document.documentElement;
  root.classList.add('has-wctl', 'plat-' + f.platform);
  const E = (cs, en) => (lang() === 'en' ? en : cs);
  const full = h('button', { class: 'wc full', 'aria-label': 'fullscreen' });
  const el = h('div', { class: 'wctl' },
    h('button', { class: 'wc close', title: E('Zavřít Folio', 'Quit Folio'), 'aria-label': 'close', html: svg(G.close), onclick: () => { sound.close(); setTimeout(() => f.close(), 120); } }),
    h('button', { class: 'wc min', title: E('Schovat do lišty', 'Minimise'), 'aria-label': 'minimise', html: svg(G.min), onclick: () => f.minimize() }),
    full);
  full.onclick = e => { if (e.altKey && !f.isFullscreen()) f.toggleMaximize(); else f.toggleFullscreen(); sound.tick(); };
  document.body.append(el, h('div', { class: 'wdrag' }));
  const upd = fs => {
    root.classList.toggle('windowed', !fs);
    full.innerHTML = svg(fs ? G.exit : G.full);
    full.title = fs ? E('Do okna', 'Exit full screen') : E('Na celou obrazovku (Alt = maximalizovat)', 'Full screen (Alt = maximise)');
  };
  upd(f.isFullscreen());
  f.onFullscreen?.(upd);
  window.addEventListener('blur', () => el.classList.add('inactive'));
  window.addEventListener('focus', () => el.classList.remove('inactive'));
}
