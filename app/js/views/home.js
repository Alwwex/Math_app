import { profile, lessonState, quizState, currentStreak, level, store } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt } from '../util.js';
import { icon } from '../icons.js';
import { book, getSection } from '../../content/book.js';

export function coverSVG() {
  // generative cover art: function curves on a deep blue cover
  const curves = [];
  for (let i = 0; i < 7; i++) {
    const a = 0.6 + i * 0.22, ph = i * 0.7;
    let d = '';
    for (let x = 0; x <= 200; x += 4) {
      const y = 150 - i * 12 + Math.sin(x / 200 * Math.PI * a * 2 + ph) * (18 + i * 3);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    curves.push(`<path d="${d}" fill="none" stroke="${i % 3 === 0 ? '#e8794a' : 'rgba(255,255,255,.35)'}" stroke-width="${i % 3 === 0 ? 2.2 : 1.2}"/>`);
  }
  return `<svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="cv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a4a8f"/><stop offset="1" stop-color="#16264d"/></linearGradient>
    <pattern id="gp" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/></pattern></defs>
    <rect width="200" height="280" fill="url(#cv)"/><rect width="200" height="280" fill="url(#gp)"/>
    ${curves.join('')}
    <circle cx="150" cy="70" r="26" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.2"/>
    <path d="M124 70h52M150 44v52" stroke="rgba(255,255,255,.25)"/>
  </svg>`;
}

export default {
  async mount(root) {
    root.classList.add('home');
    const hr = new Date().getHours();
    const greet = hr < 10 ? t('home.morning') : hr < 18 ? t('home.day') : t('home.evening');
    const dateStr = new Date().toLocaleDateString(lang() === 'en' ? 'en-GB' : 'cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    const lv = level();
    const streak = currentStreak();

    const sec = getSection('1-1');
    const ls = lessonState('1-1');
    const qs = quizState('1-1');
    const doneSteps = ls.done.length, totalSteps = sec.steps.length;
    const pct = Math.round(doneSteps / totalSteps * 100);
    const nbIndex = (await store.get('nb:index')) || [];
    const dueCards = sec.glossary.filter(g => { const c = profile.cards[g.id]; return !c || c.due <= Date.now(); }).length;

    const head = h('header', { class: 'home-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, dateStr),
        h('h1', { class: 'display home-title' }, `${greet}${profile.name ? ', ' + profile.name : ''} `, h('span', { class: 'wave' }, '👋')),
        h('p', { class: 'muted' }, t('home.sub'))),
      h('div', { class: 'home-stats' },
        h('div', { class: 'stat' }, h('span', { class: 'stat-ic' }, streak ? '🔥' : '🌱'), h('div', {}, h('b', {}, String(streak)), h('small', {}, t('streak')))),
        h('div', { class: 'stat' }, h('div', { class: 'ring', style: { '--p': Math.round(lv.pct * 100), '--size': '46px', '--th': '5px' } }, h('span', {}, String(lv.lvl))), h('div', {}, h('b', {}, profile.xp + ' XP'), h('small', {}, `${t('level')} ${lv.lvl}`)))));

    const hero = h('section', { class: 'hero card' },
      h('a', { class: 'cover', href: '#/reader', html: coverSVG() + `<div class="cover-text"><small>${L(book.subtitle)}</small><b>${L(book.title)}</b><span>${lang() === 'en' ? 'Chapter' : 'Kapitola'} 1</span></div><div class="cover-spine"></div>` }),
      h('div', { class: 'hero-body' },
        h('div', { class: 'eyebrow' }, `${lang() === 'en' ? 'Chapter' : 'Kapitola'} 1 · ${L(book.chapters[0].title)}`),
        h('h2', { class: 'display hero-title' }, `${sec.number} ${L(sec.title)}`),
        h('p', { class: 'muted hero-blurb', html: lrt(sec.blurb) }),
        h('div', { class: 'hero-progress' }, h('div', { class: 'progress' }, h('i', { style: { width: pct + '%' } })), h('span', {}, `${doneSteps}/${totalSteps} ${t('home.steps')}`)),
        h('div', { class: 'hero-actions' },
          h('a', { class: 'btn primary big', href: '#/lesson/1-1', html: icon('lesson') + `<span>${t('home.continue')}</span>` }),
          h('a', { class: 'btn big', href: '#/reader', html: icon('book') + `<span>${t('home.openBook')}</span>` }))));

    const tiles = h('section', { class: 'tiles' });
    const tileData = [
      ['reader', 'book', '#/reader', t('home.tiles.reader'), '', 'blue'],
      ['lesson', 'lesson', '#/lesson/1-1', t('home.tiles.lesson'), `${pct} %`, 'violet'],
      ['quiz', 'quiz', '#/quiz/1-1', t('home.tiles.quiz'), qs.attempts.length ? `${Math.round(qs.best * 100)} % ${t('home.best')}` : '', 'coral'],
      ['cards', 'cards', '#/cards', t('home.tiles.cards'), `${dueCards} ${t('home.toLearn')}`, 'teal'],
      ['notebook', 'notebook', '#/notebook', t('home.tiles.notebook'), `${nbIndex.length} ${t('home.notebooks')}`, 'warn'],
    ];
    tileData.forEach(([k, ic, href, desc, stat, color], i) => {
      tiles.append(h('a', { class: `tile tile-${color} rise`, href, style: { animationDelay: i * 60 + 'ms' } },
        h('div', { class: 'tile-ic', html: icon(ic) }),
        h('div', { class: 'tile-name' }, t('nav.' + k)),
        h('p', { class: 'tile-desc' }, desc),
        stat ? h('div', { class: 'tile-stat' }, stat) : null));
    });

    // Contents
    const contents = h('div', { class: 'card home-contents' }, h('h3', { class: 'display' }, t('home.contents')));
    for (const ch of book.chapters) {
      contents.append(h('div', { class: 'toc-ch' }, `${ch.n}. ${L(ch.title)}`));
      for (const s of ch.sections) {
        const st = s.ready ? lessonState(s.id) : null;
        const done = st ? st.done.length : 0;
        const total = s.ready ? getSection(s.id).steps.length : 1;
        contents.append(h(s.ready ? 'a' : 'div', { class: 'toc-sec' + (s.ready ? '' : ' locked'), href: s.ready ? `#/lesson/${s.id}` : null },
          h('span', { class: 'toc-n' }, s.n),
          h('span', { class: 'toc-t' }, L(s.title)),
          s.ready ? h('span', { class: 'ring', style: { '--p': Math.round(done / total * 100), '--size': '30px', '--th': '4px', '--c': 'var(--good)' } }) : h('span', { class: 'chip' }, t('home.soon'))));
      }
    }

    // Week chart
    const week = h('div', { class: 'card home-week' }, h('h3', { class: 'display' }, t('home.week')));
    const bars = h('div', { class: 'week-bars' });
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const vals = days.map(d => profile.days[d.toLocaleDateString('sv-SE')] || 0);
    const max = Math.max(30, ...vals);
    days.forEach((d, i) => {
      const v = vals[i];
      bars.append(h('div', { class: 'wb' + (i === 6 ? ' today' : '') },
        h('div', { class: 'wb-v' }, v ? String(v) : ''),
        h('div', { class: 'wb-bar' }, h('i', { style: { height: Math.max(4, v / max * 100) + '%', animationDelay: i * 70 + 'ms' } })),
        h('div', { class: 'wb-d' }, d.toLocaleDateString(lang() === 'en' ? 'en-GB' : 'cs-CZ', { weekday: 'short' }))));
    });
    week.append(bars, h('p', { class: 'muted small' }, lang() === 'en' ? 'XP earned per day. Every lesson step, correct answer and card counts.' : 'Získané XP za den. Počítá se každý krok lekce, správná odpověď i kartička.'));

    root.append(h('div', { class: 'home-inner' }, head, hero, tiles, h('section', { class: 'home-grid' }, contents, week)));
  },
};
