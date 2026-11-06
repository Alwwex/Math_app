import { profile, saveProfile, lessonState, bump } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, bi, tex, reward, confetti, sound, toast, emo } from '../util.js';
import { icon } from '../icons.js';
import { chapter, chapters, loadChapter } from '../../content/book.js';
import { widgets } from '../widgets/index.js';
import { renderQuestion } from '../question.js';
import { openPad, setPadContext } from '../pad.js';
import { speakBlocks, blocksOf, stopSpeaking, ttsSupported } from '../tts.js';

const NOTE = { tip: ['bulb', 'lesson.tip'], warn: ['warning', 'lesson.warn'], lang: ['globe', 'lesson.lang'], phys: ['atom', 'lesson.phys'] };

export default {
  async mount(root, params, query) {
    const meta = chapter(params[0] ?? 1);
    if (!meta) { location.hash = '#/library'; return; }
    const sec = await loadChapter(meta.n);
    const id = sec.id;
    profile.lastChapter = sec.n; saveProfile();
    const st = lessonState(id);
    let idx = query?.step != null ? Math.min(+query.step, sec.steps.length - 1) : Math.min(st.step || 0, sec.steps.length - 1);
    let cleanups = [];
    root.classList.add('no-scroll');
    root.style.setProperty('--cc', sec.color);
    const padTitle = () => `${t('notes')} · ${L(sec.title)}`;
    setPadContext(`pad:lesson:${id}`, padTitle());
    let renderGen = 0, pop = null;

    const side = h('aside', { class: 'lesson-side' });
    const main = h('div', { class: 'lesson-main' });
    root.append(h('div', { class: 'lesson' }, side, main));

    function renderSide() {
      side.innerHTML = '';
      const pct = Math.round(st.done.length / sec.steps.length * 100);
      side.append(
        h('a', { class: 'btn ghost small side-back', href: `#/chapter/${id}`, html: icon('left') + `<span>${sec.n ? `${t('nav.chapter')} ${sec.n}` : t('nav.library')}</span>` }),
        h('div', { class: 'side-head' },
          h('div', { class: 'ring-wrap' }, h('div', { class: 'ring', style: { '--p': pct, '--size': '58px', '--th': '6px', '--c': 'var(--green)' } }), h('span', { html: emo(sec.emoji) })),
          h('div', {}, h('div', { class: 'eyebrow' }, `${pct} % · ${st.done.length}/${sec.steps.length}`), h('div', { class: 'side-title' }, L(sec.title)))));
      const list = h('ol', { class: 'step-list' });
      sec.steps.forEach((s, i) => {
        const done = st.done.includes(s.id);
        list.append(h('li', {}, h('button', { class: 'step-item' + (i === idx ? ' on' : '') + (done ? ' done' : ''), onclick: () => go(i) },
          h('span', { class: 'step-ic', html: emo(s.emoji) }),
          h('span', { class: 'step-t' }, L(s.title), s.sec ? h('small', {}, '§ ' + s.sec) : null),
          done ? h('span', { class: 'step-check', html: icon('check') }) : null)));
      });
      side.append(list, h('div', { class: 'side-actions' },
        sec.quiz.length ? h('a', { class: 'btn tinted small', href: `#/quiz/${id}`, html: icon('quiz') + `<span>${t('ch.test')}</span>` }) : null,
        h('a', { class: 'btn tinted small', href: `#/cards?ch=${id}`, html: icon('cards') + `<span>${t('ch.cards')}</span>` })));
      requestAnimationFrame(() => list.querySelector('.on')?.scrollIntoView({ block: 'nearest' }));
    }

    function langSeg() {
      const seg = h('div', { class: 'seg lang-seg' });
      [['cs', 'CZ'], ['en', 'EN'], ['both', 'CZ+EN']].forEach(([v, lab]) => seg.append(h('button', { class: profile.lang === v ? 'on' : '', onclick: () => { profile.lang = v; saveProfile(); document.documentElement.lang = v === 'en' ? 'en' : 'cs'; renderSide(); renderStep(0); } }, lab)));
      return seg;
    }

    async function renderBlock(b, page) {
      switch (b.t) {
        case 'lead': page.append(bi(b, 'p', 'lead')); break;
        case 'p': page.append(bi(b, 'p', 'para')); break;
        case 'math': page.append(h('div', { class: 'math-block', html: tex(lang() === 'en' && b.texEn ? b.texEn : b.tex, true) })); break;
        case 'def': {
          const box = h('div', { class: 'box def' }, h('div', { class: 'box-head' }, h('span', { class: 'box-tag' }, t('lesson.definition')), h('span', { html: lrt(b.title) })));
          box.append(bi(b, 'div', 'box-body'));
          page.append(box); break;
        }
        case 'note': {
          const [e, label] = NOTE[b.kind] || NOTE.tip;
          page.append(h('div', { class: 'box note ' + b.kind }, h('div', { class: 'note-ic', html: emo(b.kind === 'lang' && lang() === 'en' ? 'speech' : e) }), h('div', {}, h('div', { class: 'note-label' }, t(label)), h('div', { class: 'note-body', html: lrt(b) }))));
          break;
        }
        case 'list': {
          const ul = h('ul', { class: 'nice-list' });
          b.items.forEach(it => ul.append(h('li', { html: lrt(it) })));
          page.append(ul); break;
        }
        case 'widget': {
          const card = h('div', { class: 'widget-card' }, h('div', { class: 'widget-badge', html: icon('sparkles') + `<span>${lang() === 'en' ? 'Interactive' : 'Interaktivní'}</span>` }));
          const host = h('div', { class: 'widget-host' });
          card.append(host);
          page.append(card);
          const loader = widgets[b.name];
          if (!loader) { host.textContent = b.name; break; }
          const mod = await loader();
          const c = mod.default(host, b.opts || {});
          if (typeof c === 'function') cleanups.push(c);
          break;
        }
        case 'example': page.append(renderExample(b)); break;
        case 'check': {
          const card = h('div', { class: 'check-card' }, h('div', { class: 'check-head', html: emo('target') + `<span>${t('lesson.quickCheck')}</span>` }));
          const prev = st.checks[b.q.id];
          const q = renderQuestion(b.q, {
            onResult: (ok, el) => {
              bump('questions');
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
          b.items.forEach((it, i) => g.append(h('div', { class: 'summary-item rise', style: { animationDelay: i * 60 + 'ms' } }, h('div', { class: 'summary-ic', html: emo(it.emoji || it.icon || 'star') }), h('div', { html: lrt(it) }))));
          page.append(g); break;
        }
        case 'cta': {
          page.append(h('div', { class: 'cta-row' },
            sec.quiz.length ? h('a', { class: 'btn primary big capsule', href: `#/quiz/${id}`, html: icon('quiz') + `<span>${lang() === 'en' ? 'Take the test' : 'Spustit test'}</span>` }) : null,
            h('a', { class: 'btn tinted big capsule', href: `#/cards?ch=${id}`, html: icon('cards') + `<span>${lang() === 'en' ? 'Practise the terms' : 'Procvičit pojmy'}</span>` })));
          break;
        }
      }
    }

    function renderExample(b) {
      const box = h('div', { class: 'example' });
      box.append(h('div', { class: 'ex-head' }, h('span', { class: 'ex-tag' }, t('lesson.example')), h('span', { html: lrt(b.title) })));
      box.append(h('div', { class: 'ex-task', html: lrt(b.task) }));
      const stepsBox = h('ol', { class: 'ex-steps' });
      box.append(stepsBox);
      const ans = h('div', { class: 'ex-answer', html: `<span>${t('answer')}</span> ${lrt(b.answer)}` });
      const ctrl = h('div', { class: 'ex-ctrl' });
      let k = 0;
      const nextBtn = h('button', { class: 'btn primary capsule', html: `<span>${t('lesson.nextStep')}</span>` + icon('down') });
      const allBtn = h('button', { class: 'btn ghost small' }, t('lesson.showAll'));
      const reveal = () => {
        if (k < b.steps.length) { stepsBox.append(h('li', { class: 'ex-step rise', html: lrt(b.steps[k]) })); k++; sound.pop(); }
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
      const gen = ++renderGen;
      stopSpeaking();
      const lastStep = idx === sec.steps.length - 1;
      const stepsBtn = h('button', { class: 'lt-steps', title: lang() === 'en' ? 'All steps' : 'Všechny kroky', html: `${icon('list')}<span>${t('lesson.step')} ${idx + 1} ${t('of')} ${sec.steps.length}</span>${icon('down')}` });
      stepsBtn.onclick = e => { e.stopPropagation(); toggleStepsPop(stepsBtn); };
      const readBtn = ttsSupported ? h('button', { class: 'btn small tinted', title: lang() === 'en' ? 'Read the step aloud' : 'Přečíst krok nahlas', html: icon('speak') + `<span>${lang() === 'en' ? 'Read aloud' : 'Předčíst'}</span>` }) : null;
      if (readBtn) readBtn.onclick = () => speakBlocks(blocksOf(page), { title: L(s.title) });
      const top = h('div', { class: 'lesson-top' },
        h('div', { class: 'lt-nav' },
          h('button', { class: 'btn icon small ghost', title: t('prev') + ' (Alt+←)', disabled: idx === 0, html: icon('left'), onclick: () => go(idx - 1) }),
          h('button', { class: 'btn icon small ghost', title: t('next') + ' (Alt+→)', disabled: lastStep, html: icon('right'), onclick: () => go(idx + 1) })),
        h('div', { class: 'grow' }, stepsBtn,
          h('div', { class: 'lesson-progress' }, ...sec.steps.map((x, i) => h('button', { class: (i === idx ? 'cur' : '') + (st.done.includes(x.id) ? ' done' : ''), title: `${i + 1}. ${L(x.title)}`, 'aria-label': `${i + 1}. ${L(x.title)}`, onclick: () => go(i) }, h('i'))))),
        langSeg(),
        readBtn,
        h('button', { class: 'btn small tinted', onclick: () => openPad(`pad:lesson:${id}`, padTitle()), html: icon('scratch') + `<span>${t('lesson.scratch')}</span>` }),
        s.page ? h('a', { class: 'btn small tinted', href: `#/reader?page=${s.page}`, html: icon('book') + `<span>${t('ch.p')} ${s.page}</span>` }) : null);
      const page = h('article', { class: 'lesson-page' + (dir > 0 ? ' in-right' : dir < 0 ? ' in-left' : '') });
      page.append(h('div', { class: 'page-kicker' }, h('span', { class: 'page-emoji', html: emo(s.emoji) }),
        h('span', {}, `${sec.n ? `${t('nav.chapter')} ${sec.n}` : L(sec.title)}${s.sec ? ' · § ' + s.sec : ''}`)));
      page.append(h('h1', { class: 'page-title' }, L(s.title)));
      if (profile.lang === 'both' && s.title.en) page.append(h('div', { class: 'page-title-en' }, s.title.en));
      const scroller = h('div', { class: 'lesson-scroll' }, page);
      main.append(top, scroller);
      for (const b of s.blocks) { await renderBlock(b, page); if (gen !== renderGen) return; }
      if (s.page) page.append(h('a', { class: 'book-ref', href: `#/reader?page=${s.page}`, html: `${emo('openbook')}<span><b>${lang() === 'en' ? 'In the book' : 'V knize'}</b> ${s.sec ? '§ ' + s.sec + ', ' : ''}${lang() === 'en' ? 'page' : 'strana'} ${s.page}</span>${icon('right')}` }));
      const nav = h('div', { class: 'lesson-nav' });
      if (idx > 0) nav.append(h('button', { class: 'btn big ghost', onclick: () => go(idx - 1), html: icon('left') + `<span>${t('prev')}</span>` }));
      nav.append(h('div', { class: 'grow' }));
      const last = idx === sec.steps.length - 1;
      const nextBtn = h('button', { class: 'btn big primary capsule', html: `<span>${last ? t('lesson.finish') : t('next') + ': ' + L(sec.steps[idx + 1].title)}</span>` + icon(last ? 'check' : 'right') });
      nextBtn.onclick = () => completeAndGo(nextBtn, last);
      nav.append(nextBtn);
      page.append(nav);
      scroller.scrollTop = 0;
    }

    function completeAndGo(btn, last) {
      const s = sec.steps[idx];
      if (!st.done.includes(s.id)) { st.done.push(s.id); reward(10, btn); bump('steps'); saveProfile(); sound.step(); }
      if (last) {
        confetti(); sound.correct();
        toast(emo('party') + ' ' + t('lesson.done'));
        if (!st.finished) { st.finished = Date.now(); reward(25, btn); saveProfile(); }
        renderSide();
        const nextCh = chapters[chapters.findIndex(c => c.n === sec.n) + 1];
        if (nextCh) setTimeout(() => { location.hash = `#/chapter/${sec.quiz.length ? sec.id : nextCh.id}`; }, 1600);
        return;
      }
      go(idx + 1);
    }
    function toggleStepsPop(anchor) {
      if (pop) { closePop(); return; }
      const r = anchor.getBoundingClientRect();
      pop = h('div', { class: 'step-pop', style: { left: Math.max(8, Math.min(r.left, innerWidth - 348)) + 'px', top: r.bottom + 8 + 'px' } });
      const list = h('ol', { class: 'step-list' });
      sec.steps.forEach((x, i) => list.append(h('li', {}, h('button', { class: 'step-item' + (i === idx ? ' on' : '') + (st.done.includes(x.id) ? ' done' : ''), onclick: () => { closePop(); go(i); } },
        h('span', { class: 'step-ic', html: emo(x.emoji) }), h('span', { class: 'step-t' }, L(x.title), x.sec ? h('small', {}, '§ ' + x.sec) : null),
        st.done.includes(x.id) ? h('span', { class: 'step-check', html: icon('check') }) : null))));
      pop.append(h('div', { class: 'step-pop-head' }, h('span', { html: emo(sec.emoji) }), h('b', {}, L(sec.title))), list);
      document.body.append(pop);
      sound.open();
      requestAnimationFrame(() => { pop?.classList.add('open'); list.querySelector('.on')?.scrollIntoView({ block: 'center' }); });
      setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
    }
    function outside(e) { if (pop && !pop.contains(e.target)) closePop(); }
    function closePop() {
      document.removeEventListener('pointerdown', outside, true);
      const p = pop; pop = null;
      if (p) { p.classList.remove('open'); setTimeout(() => p.remove(), 250); }
    }
    function go(i) {
      if (i === idx || i < 0 || i >= sec.steps.length) return;
      sound.swipe();
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
    return () => { cleanups.forEach(c => c()); window.removeEventListener('keydown', onKey); closePop(); stopSpeaking(); setPadContext(null); };
  },
};
