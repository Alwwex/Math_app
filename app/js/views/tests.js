import { profile, quizState } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, emo } from '../util.js';
import { icon } from '../icons.js';
import { chapters, loadChapter } from '../../content/book.js';

export default {
  async mount(root) {
    root.classList.add('tests-view');
    const inner = h('div', { class: 'ch-inner' });
    root.append(inner);
    const all = (await Promise.all(chapters.map(c => loadChapter(c.n)))).filter(Boolean);
    const total = all.reduce((a, c) => a + c.quiz.length, 0);
    const tried = all.filter(c => quizState(c.id).attempts.length);
    const avg = tried.length ? Math.round(tried.reduce((a, c) => a + quizState(c.id).best, 0) / tried.length * 100) : 0;
    inner.append(h('div', { class: 'page-head flush' }, h('div', { class: 'eyebrow' }, `${total} ${t('quiz.questions')} · ${all.length} ${lang() === 'en' ? 'tests' : 'testů'}`), h('h1', { class: 'large-title' }, t('tests.title'))));
    inner.append(h('a', { class: 'mix-card', href: '#/quiz/mix' },
      h('div', { html: emo('die') }),
      h('div', { class: 'grow' }, h('b', {}, t('tests.mix')), h('small', {}, t('tests.mixSub'))),
      h('div', { class: 'mix-stat' }, h('b', {}, tried.length ? avg + ' %' : '—'), h('small', {}, lang() === 'en' ? 'avg. best' : 'průměr')),
      h('span', { class: 'chev', html: icon('right') })));
    const grid = h('div', { class: 'tests-grid' });
    for (const c of all) {
      if (!c.quiz.length) continue;
      const qs = quizState(c.id);
      const best = Math.round(qs.best * 100);
      const col = qs.attempts.length ? (best >= 80 ? 'var(--green)' : best >= 50 ? 'var(--orange)' : 'var(--red)') : 'var(--fill)';
      grid.append(h('a', { class: 'test-card', href: `#/quiz/${c.id}`, style: { '--cc': c.color } },
        h('div', { class: 'ring-wrap' }, h('div', { class: 'ring', style: { '--p': best, '--c': col, '--size': '54px', '--th': '6px' } }), h('span', { html: emo(c.emoji) })),
        h('div', { class: 'grow' }, h('small', {}, c.n ? `${t('nav.chapter')} ${c.n}` : (lang() === 'en' ? 'Warm-up' : 'Rozcvička')), h('b', {}, L(c.title)),
          h('div', { class: 'subtle small' }, `${c.quiz.length} ${t('quiz.questions')}${qs.attempts.length ? ` · ${lang() === 'en' ? 'best' : 'nejlépe'} ${best} %` : ''}${qs.wrong.length ? ` · ${qs.wrong.length} ${lang() === 'en' ? 'to fix' : 'k opravě'}` : ''}`))));
    }
    inner.append(h('div', { class: 'group-title', style: { marginTop: '26px' } }, t('tests.chapters')), grid);
    void profile;
  },
};
