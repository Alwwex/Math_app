import { profile, saveProfile, lessonState } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, rt, lrt, bi, tex, reward, confetti, sound, toast } from '../util.js';
import { icon } from '../icons.js';
import { getSection, sectionMeta } from '../../content/book.js';
import { widgets } from '../widgets/index.js';
import { renderQuestion } from '../question.js';
import { openPad, closePad } from '../pad.js';

export default {
  async mount(root, params) {
    const id = params[0] || '1-1';
    const sec = getSection(id);
    const meta = sectionMeta(id);
    if (!sec) { root.append(h('div', { class: 'empty' }, h('h3', {}, t('home.soon')))); return; }
    const st = lessonState(id);
    let idx = Math.min(st.step || 0, sec.steps.length - 1);
    let cleanups = [];
    root.classList.add('no-scroll');

    const side = h('aside', { class: 'lesson-side' });
    const main = h('div', { class: 'lesson-main' });
    const shell = h('div', { class: 'lesson' }, side, main);
    root.append(shell);

    function renderSide() {
      side.innerHTML = '';
      const pct = Math.round(st.done.length / sec.steps.length * 100);
      side.append(
        h('a', { class: 'btn ghost small side-back', href: '#/home', html: icon('left') + `<span>${t('nav.home')}</span>` }),
        h('div', { class: 'side-head' },
          h('div', { class: 'ring', style: { '--p': pct, '--size': '58px', '--th': '6px', '--c': 'var(--good)' } }, h('span', {}, pct + '%')),
          h('div', {}, h('div', { class: 'eyebrow' }, `${lang() === 'en' ? 'Section' : 'Část'} ${sec.number}`), h('div', { class: 'side-title display' }, L(sec.title)))),
        h('div', { class: 'eyebrow side-cap' }, t('lesson.contents')));
      const list = h('ol', { class: 'step-list' });
      sec.steps.forEach((s, i) => {
        const done = st.done.includes(s.id);
        const li = h('li', {}, h('button', { class: 'step-item' + (i === idx ? ' on' : '') + (done ? ' done' : ''), onclick: () => go(i) },
          h('span', { class: 'step-ic' }, done ? '✓' : s.icon),
          h('span', { class: 'step-t' }, L(s.title))));
        list.append(li);
      });
      side.append(list);
      const sideActions = h('div', { class: 'side-actions' },
        h('a', { class: 'btn soft small', href: `#/quiz/${id}`, html: icon('quiz') + `<span>${t('nav.quiz')}</span>` }),
        h('a', { class: 'btn soft small', href: '#/cards', html: icon('cards') + `<span>${t('nav.cards')}</span>` }));
      side.append(sideActions);
    }

    function langSeg() {
      const seg = h('div', { class: 'seg lang-seg' });
      [['cs', 'CZ'], ['en', 'EN'], ['both', 'CZ+EN']].forEach(([v, lab]) => {
        seg.append(h('button', { class: profile.lang === v ? 'on' : '', onclick: () => { profile.lang = v; saveProfile(); document.documentElement.lang = v === 'en' ? 'en' : 'cs'; renderSide(); renderStep(0); } }, lab));
      });
      return seg;
    }

    async function renderBlock(b, page) {
      switch (b.t) {
        case 'lead': page.append(bi(b, 'p', 'lead')); break;
        case 'p': page.append(bi(b, 'p', 'para')); break;
        case 'math': page.append(h('div', { class: 'math-block', html: tex(lang() === 'en' && b.texEn ? b.texEn : b.tex, true) })); break;
        case 'def': {
          const box = h('div', { class: 'box def' }, h('div', { class: 'box-head' }, h('span', { class: 'box-tag' }, t('lesson.definition')), h('span', {}, L(b.title))));
          box.append(bi(b, 'div', 'box-body'));
          page.append(box); break;
        }
        case 'note': {
          const meta2 = { tip: ['💡', t('lesson.tip')], warn: ['⚠️', t('lesson.warn')], lang: ['🇬🇧', t('lesson.lang')] }[b.kind] || ['💡', ''];
          if (b.kind === 'lang' && lang() === 'en') meta2[0] = '🇨🇿';
          page.append(h('div', { class: 'box note ' + b.kind }, h('div', { class: 'note-ic' }, meta2[0]), h('div', {}, h('div', { class: 'note-label' }, meta2[1]), h('div', { class: 'note-body', html: lrt(b) }))));
          break;
        }
        case 'list': {
          const ul = h('ul', { class: 'nice-list' });
          b.items.forEach(it => ul.append(h('li', { html: lrt(it) })));
          page.append(ul); break;
        }
        case 'widget': {
          const card = h('div', { class: 'widget-card' }, h('div', { class: 'widget-badge' }, '✨ ' + (lang() === 'en' ? 'Try it' : 'Vyzkoušej si')));
          const host = h('div', { class: 'widget-host' });
          card.append(host);
          page.append(card);
          const mod = await widgets[b.name]();
          const c = mod.default(host, b.opts || {});
          if (typeof c === 'function') cleanups.push(c);
          break;
        }
        case 'example': page.append(renderExample(b)); break;
        case 'check': {
          const card = h('div', { class: 'check-card' }, h('div', { class: 'check-head' }, h('span', {}, '⚡'), t('lesson.quickCheck')));
          const prev = st.checks[b.q.id];
          const q = renderQuestion(b.q, {
            onResult: (ok, el) => {
              if (ok && prev !== true) reward(5, el);
              st.checks[b.q.id] = ok || prev === true;
              saveProfile();
            },
          });
          card.append(q.el);
          page.append(card); break;
        }
        case 'summary': {
          const g = h('div', { class: 'summary-grid' });
          b.items.forEach((it, i) => g.append(h('div', { class: 'summary-item rise', style: { animationDelay: i * 70 + 'ms' } }, h('div', { class: 'summary-ic' }, it.icon), h('div', { html: lrt(it) }))));
          page.append(g); break;
        }
        case 'cta': {
          page.append(h('div', { class: 'cta-row' },
            h('a', { class: 'btn primary big', href: `#/quiz/${id}`, html: icon('quiz') + `<span>${lang() === 'en' ? 'Take the test' : 'Spustit test'}</span>` }),
            h('a', { class: 'btn big', href: '#/cards', html: icon('cards') + `<span>${lang() === 'en' ? 'Practise the terms' : 'Procvičit pojmy'}</span>` }),
            h('a', { class: 'btn big', href: '#/notebook', html: icon('notebook') + `<span>${lang() === 'en' ? 'Write a summary' : 'Napsat si výpisky'}</span>` })));
          break;
        }
      }
    }

    function renderExample(b) {
      const box = h('div', { class: 'example' });
      box.append(h('div', { class: 'ex-head' }, h('span', { class: 'ex-tag' }, t('lesson.example')), h('span', {}, L(b.title))));
      box.append(h('div', { class: 'ex-task', html: lrt(b.task) }));
      const stepsBox = h('ol', { class: 'ex-steps' });
      box.append(stepsBox);
      const ans = h('div', { class: 'ex-answer', html: `<span>${t('answer')}:</span> ${lrt(b.answer)}` });
      const ctrl = h('div', { class: 'ex-ctrl' });
      let k = 0;
      const nextBtn = h('button', { class: 'btn primary', html: `<span>${t('lesson.nextStep')}</span>` + icon('down') });
      const allBtn = h('button', { class: 'btn ghost small' }, t('lesson.showAll'));
      const reveal = () => {
        if (k < b.steps.length) {
          stepsBox.append(h('li', { class: 'ex-step rise', html: lrt(b.steps[k]) }));
          k++;
          sound.pop();
        }
        if (k >= b.steps.length) { ctrl.remove(); box.append(ans); ans.classList.add('pop'); }
      };
      nextBtn.onclick = reveal;
      allBtn.onclick = () => { while (k < b.steps.length) reveal(); };
      ctrl.append(nextBtn, allBtn);
      box.append(ctrl);
      return box;
    }

    async function renderStep(dir = 1) {
      cleanups.forEach(c => { try { c(); } catch (e) { /* ignore */ } });
      cleanups = [];
      const s = sec.steps[idx];
      st.step = idx; saveProfile();
      main.innerHTML = '';
      const top = h('div', { class: 'lesson-top' },
        h('div', { class: 'grow' }, h('div', { class: 'sub' }, `${t('lesson.step')} ${idx + 1} ${t('of')} ${sec.steps.length}`), h('div', { class: 'lesson-progress' }, ...sec.steps.map((_, i) => h('i', { class: (i < idx ? 'past' : i === idx ? 'cur' : '') + (st.done.includes(sec.steps[i].id) ? ' done' : '') })))),
        langSeg(),
        h('button', { class: 'btn small', onclick: () => openPad(`pad:lesson:${id}`, `${t('notes')} · ${sec.number}`), html: icon('pen') + `<span>${t('lesson.scratch')}</span>` }),
        h('a', { class: 'btn small', href: `#/reader?page=${(profile.sectionPages?.[id] ?? meta.pdfPage)}&section=${id}`, html: icon('book') + `<span>${t('lesson.openBook')}</span>` }));
      const page = h('article', { class: 'lesson-page' + (dir > 0 ? ' in-right' : dir < 0 ? ' in-left' : '') });
      page.append(h('div', { class: 'page-kicker' }, h('span', { class: 'page-emoji' }, s.icon), `${sec.number} · ${t('lesson.step')} ${idx + 1}`));
      page.append(h('h1', { class: 'page-title display' }, L(s.title)));
      if (profile.lang === 'both') page.append(h('div', { class: 'page-title-en' }, s.title.en));
      const scroller = h('div', { class: 'lesson-scroll' }, page);
      main.append(top, scroller);
      for (const b of s.blocks) await renderBlock(b, page);
      // nav
      const nav = h('div', { class: 'lesson-nav' });
      if (idx > 0) nav.append(h('button', { class: 'btn big ghost', onclick: () => go(idx - 1), html: icon('left') + `<span>${L(sec.steps[idx - 1].title)}</span>` }));
      nav.append(h('div', { class: 'grow' }));
      const last = idx === sec.steps.length - 1;
      const nextBtn = h('button', { class: 'btn big primary', html: `<span>${last ? t('lesson.finish') : t('next') + ': ' + L(sec.steps[idx + 1].title)}</span>` + icon(last ? 'check' : 'right') });
      nextBtn.onclick = () => completeAndGo(nextBtn, last);
      nav.append(nextBtn);
      page.append(nav);
      scroller.scrollTop = 0;
    }

    function completeAndGo(btn, last) {
      const s = sec.steps[idx];
      if (!st.done.includes(s.id)) { st.done.push(s.id); reward(10, btn); saveProfile(); }
      if (last) {
        confetti();
        sound.correct();
        toast(`🎉 ${t('lesson.done')}`);
        if (!st.finished) { st.finished = Date.now(); reward(25, btn); saveProfile(); }
        renderSide();
        return;
      }
      go(idx + 1);
    }

    function go(i) {
      if (i === idx) return;
      const dir = i > idx ? 1 : -1;
      idx = i;
      renderSide();
      renderStep(dir);
    }

    renderSide();
    await renderStep(0);
    const onKey = e => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight' && e.altKey && idx < sec.steps.length - 1) go(idx + 1);
      if (e.key === 'ArrowLeft' && e.altKey && idx > 0) go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    void rt;
    return () => { cleanups.forEach(c => c()); window.removeEventListener('keydown', onKey); closePad(); };
  },
};
