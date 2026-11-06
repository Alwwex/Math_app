import { profile } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h } from '../util.js';
import { icon } from '../icons.js';
import { book, chapters, GROUPS, loadChapter } from '../../content/book.js';
import { chapterCard } from './home.js';

export default {
  async mount(root) {
    root.classList.add('library');
    const done = Object.values(profile.lessons).filter(s => s.finished).length;
    const banner = h('section', { class: 'lib-banner' },
      h('img', { class: 'lib-cover', src: book.cover, alt: '' }),
      h('div', { class: 'lib-info' },
        h('div', { class: 'eyebrow' }, `${L(book.edition)} · ${book.pages} ${t('ch.pages')}`),
        h('h1', { class: 'large-title' }, L(book.title)),
        lang() !== 'en' ? h('div', { class: 'lib-en' }, book.title.en) : null,
        h('div', { class: 'muted' }, book.authors),
        h('div', { class: 'lib-stats' },
          h('div', {}, h('b', {}, '31'), h('small', {}, lang() === 'en' ? 'chapters' : 'kapitol')),
          h('div', {}, h('b', {}, String(chapters.reduce((a, c) => a + c.sections.length, 0))), h('small', {}, lang() === 'en' ? 'sections' : 'oddílů')),
          h('div', {}, h('b', {}, String(done)), h('small', {}, lang() === 'en' ? 'finished' : 'hotovo'))),
        h('div', { class: 'row' },
          h('a', { class: 'btn primary capsule', href: '#/reader', html: icon('book') + `<span>${lang() === 'en' ? 'Open the book' : 'Otevřít knihu'}</span>` }),
          h('a', { class: 'btn tinted capsule', href: `#/lesson/${profile.lastChapter ?? 1}`, html: icon('play') + `<span>${t('ch.continue')}</span>` }))));
    const inner = h('div', { class: 'lib-inner' }, banner);
    root.append(inner);
    for (const g of GROUPS) {
      const grid = h('div', { class: 'lib-grid' });
      inner.append(h('section', { class: 'lib-group' }, h('h2', { class: 'title-2' }, L(g.title)), grid));
      for (const n of g.chapters) {
        const c = chapters.find(x => x.n === n);
        const mod = await loadChapter(n);
        grid.append(chapterCard({ ...c, stepsCount: mod?.steps.length || 0 }, profile.lessons[c.id], { vt: true }));
      }
    }
  },
};
