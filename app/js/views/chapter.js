import { profile, saveProfile, lessonState, quizState } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, emo } from '../util.js';
import { icon } from '../icons.js';
import { chapter, chapters, loadChapter } from '../../content/book.js';

export default {
  async mount(root, params) {
    const meta = chapter(params[0] ?? 1);
    if (!meta) { location.hash = '#/library'; return; }
    const c = await loadChapter(meta.n);
    profile.lastChapter = meta.n; saveProfile();
    const st = lessonState(c.id), qs = quizState(c.id);
    const pct = Math.round(st.done.length / c.steps.length * 100);
    root.classList.add('chapter-view');
    root.style.setProperty('--cc', c.color);

    const idx = chapters.findIndex(x => x.n === c.n);
    const prev = chapters[idx - 1], next = chapters[idx + 1];
    const hero = h('section', { class: 'ch-hero' },
      h('div', { class: 'ch-nav' },
        h('a', { class: 'btn small ghost', href: '#/library', html: icon('left') + `<span>${t('lib.title')}</span>` }),
        h('div', { class: 'grow' }),
        prev ? h('a', { class: 'btn icon small ghost', href: `#/chapter/${prev.id}`, title: L(prev.title), html: icon('up') }) : null,
        next ? h('a', { class: 'btn icon small ghost', href: `#/chapter/${next.id}`, title: L(next.title), html: icon('down') }) : null),
      h('div', { class: 'ch-hero-main' },
        h('div', { class: 'ch-emo', style: { viewTransitionName: `ch-emo-${c.id}` }, html: emo(c.emoji) }),
        h('div', { class: 'ch-titles' },
          h('div', { class: 'eyebrow' }, c.n ? `${t('nav.chapter')} ${c.n}${c.page ? ` · ${t('ch.p')} ${c.page}–${c.end}` : ''}` : (lang() === 'en' ? 'Warm-up' : 'Rozcvička')),
          h('h1', { class: 'large-title' }, L(c.title)),
          lang() !== 'en' && c.title.en ? h('div', { class: 'ch-en' }, c.title.en) : null)),
      c.intro ? h('p', { class: 'ch-intro', html: lrt(c.intro) }) : null,
      h('div', { class: 'ch-actions' },
        h('a', { class: 'btn primary big capsule', href: `#/lesson/${c.id}`, html: icon('play') + `<span>${st.finished ? t('ch.review') : st.done.length ? t('ch.continue') : t('ch.start')}</span>` }),
        c.quiz.length ? h('a', { class: 'btn tinted big capsule', href: `#/quiz/${c.id}`, html: icon('quiz') + `<span>${t('ch.test')}${qs.attempts.length ? ` · ${Math.round(qs.best * 100)} %` : ''}</span>` }) : null,
        c.page ? h('a', { class: 'btn tinted big capsule', href: `#/reader?page=${c.page}`, html: icon('book') + `<span>${t('ch.read')}</span>` }) : null),
      h('div', { class: 'ch-progress' }, h('div', { class: 'progress' }, h('i', { style: { width: pct + '%' } })), h('span', {}, `${st.done.length}/${c.steps.length} ${t('ch.steps')}`)));

    // lesson steps
    const steps = h('div', { class: 'group' });
    c.steps.forEach((s, i) => {
      const done = st.done.includes(s.id);
      steps.append(h('a', { class: 'cell', href: `#/lesson/${c.id}?step=${i}` },
        h('span', { html: emo(s.emoji) }),
        h('div', { class: 'lines' }, h('b', {}, L(s.title)), h('small', {}, `${s.sec ? '§ ' + s.sec + ' · ' : ''}${s.page ? t('ch.p') + ' ' + s.page : ''}`)),
        done ? h('span', { class: 'cell-done', html: icon('check') }) : null,
        h('span', { class: 'chev', html: icon('right') })));
    });
    // sections in the book
    const secs = h('div', { class: 'group' });
    for (const s of c.sections) {
      secs.append(h('a', { class: 'cell no-icon', href: `#/reader?page=${s.page}` },
        h('span', { class: 'sec-n' }, s.n),
        h('div', { class: 'lines' }, h('b', {}, L(s.title)), lang() !== 'en' ? h('small', {}, s.title.en) : null),
        h('span', { class: 'val' }, String(s.page)),
        h('span', { class: 'chev', html: icon('right') })));
    }
    if (c.exercises) secs.append(h('a', { class: 'cell no-icon', href: `#/reader?page=${c.exercises}` }, h('span', { class: 'sec-n', html: emo('memo') }), h('div', { class: 'lines' }, h('b', {}, t('ch.exercises'))), h('span', { class: 'val' }, String(c.exercises)), h('span', { class: 'chev', html: icon('right') })));
    if (c.answers) secs.append(h('a', { class: 'cell no-icon', href: `#/reader?page=${c.answers}` }, h('span', { class: 'sec-n', html: emo('check') }), h('div', { class: 'lines' }, h('b', {}, t('ch.answers'))), h('span', { class: 'val' }, String(c.answers)), h('span', { class: 'chev', html: icon('right') })));

    // glossary preview
    const terms = h('div', { class: 'ch-terms' });
    c.glossary.slice(0, 12).forEach(g => terms.append(h('span', { class: 'chip', title: g.en }, lang() === 'en' ? g.en : g.cs)));

    root.append(h('div', { class: 'ch-inner' }, hero,
      h('div', { class: 'ch-cols' },
        h('section', {}, h('div', { class: 'group-title' }, t('ch.lesson')), steps,
          c.glossary.length ? h('div', { class: 'ch-terms-box' }, h('div', { class: 'group-title' }, t('ch.cards')), terms, h('a', { class: 'btn small tinted', href: `#/cards?ch=${c.id}`, html: icon('cards') + `<span>${lang() === 'en' ? 'Practise terms' : 'Procvičit pojmy'}</span>` })) : null),
        c.sections.length ? h('section', {}, h('div', { class: 'group-title' }, t('ch.sections')), secs) : null)));
  },
};
