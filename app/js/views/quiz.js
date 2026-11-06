import { quizState, saveProfile } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, reward, confetti, shuffle, sound } from '../util.js';
import { icon } from '../icons.js';
import { getSection } from '../../content/book.js';
import { renderQuestion } from '../question.js';
import { openPad, closePad } from '../pad.js';

export default {
  async mount(root, params) {
    const id = params[0] || '1-1';
    const sec = getSection(id);
    const qs = quizState(id);
    root.classList.add('quiz-view');
    const wrap = h('div', { class: 'quiz-wrap' });
    root.append(wrap);

    function intro() {
      wrap.innerHTML = '';
      const wrongN = qs.wrong.filter(w => sec.quiz.some(q => q.id === w)).length;
      const card = h('div', { class: 'quiz-intro card rise' },
        h('div', { class: 'qi-art', html: `<div class="qi-badge">${sec.number}</div>` }),
        h('div', { class: 'eyebrow' }, t('quiz.title')),
        h('h1', { class: 'display' }, L(sec.title)),
        h('p', { class: 'muted' }, lang() === 'en' ? 'Answer the questions, use the scratch paper for calculations. Mistakes are saved so you can fix them later.' : 'Odpovídej na otázky, na výpočty máš pomocný papír. Chyby se ukládají, abys je mohl(a) později opravit.'),
        h('div', { class: 'qi-stats' },
          h('div', {}, h('b', {}, qs.attempts.length ? Math.round(qs.best * 100) + ' %' : '—'), h('small', {}, t('home.best'))),
          h('div', {}, h('b', {}, String(qs.attempts.length)), h('small', {}, lang() === 'en' ? 'attempts' : 'pokusů')),
          h('div', {}, h('b', {}, String(wrongN)), h('small', {}, lang() === 'en' ? 'to fix' : 'k opravě'))),
        h('div', { class: 'qi-modes' },
          mode('⚡', t('quiz.quick'), `10 ${t('quiz.questions')}`, () => run(shuffle(sec.quiz).slice(0, 10), 'quick'), 'primary'),
          mode('📝', t('quiz.full'), `${sec.quiz.length} ${t('quiz.questions')}`, () => run(shuffle(sec.quiz), 'full')),
          mode('🔁', t('quiz.mistakes'), `${wrongN} ${t('quiz.questions')}`, () => wrongN ? run(shuffle(sec.quiz.filter(q => qs.wrong.includes(q.id))), 'fix') : sound.wrong(), '', !wrongN)));
      if (qs.attempts.length) {
        const hist = h('div', { class: 'qi-hist' }, h('div', { class: 'eyebrow' }, t('quiz.history')));
        const bars = h('div', { class: 'qi-bars' });
        qs.attempts.slice(-12).forEach(a => bars.append(h('div', { class: 'qi-bar', title: new Date(a.date).toLocaleString() }, h('i', { style: { height: Math.max(6, a.score / a.total * 100) + '%' } }), h('span', {}, Math.round(a.score / a.total * 100) + ''))));
        hist.append(bars);
        card.append(hist);
      }
      wrap.append(card);
    }
    function mode(emoji, title, sub, fn, cls = '', disabled = false) {
      const b = h('button', { class: 'qi-mode ' + cls, onclick: fn }, h('span', { class: 'qi-emoji' }, emoji), h('span', {}, h('b', {}, title), h('small', {}, sub)));
      if (disabled) b.classList.add('disabled');
      return b;
    }

    function run(list, kind) {
      let i = 0, score = 0, combo = 0;
      const results = [];
      wrap.innerHTML = '';
      const bar = h('div', { class: 'quiz-bar' });
      const dots = h('div', { class: 'quiz-dots' }, ...list.map(() => h('i')));
      const comboEl = h('div', { class: 'quiz-combo' });
      bar.append(
        h('button', { class: 'btn icon ghost', html: icon('x'), 'aria-label': t('close'), onclick: () => { closePad(); intro(); } }),
        dots, comboEl,
        h('button', { class: 'btn small', html: icon('pen') + `<span>${t('quiz.scratch')}</span>`, onclick: () => openPad(`pad:quiz:${id}`, `${t('quiz.scratch')} · ${sec.number}`) }));
      const stage = h('div', { class: 'quiz-stage' });
      wrap.append(bar, stage);

      function show() {
        stage.innerHTML = '';
        [...dots.children].forEach((d, k) => d.className = k < i ? (results[k] ? 'good' : 'bad') : k === i ? 'cur' : '');
        const q = list[i];
        const nextBtn = h('button', { class: 'btn primary big quiz-next', html: `<span>${i === list.length - 1 ? t('quiz.result') : t('next')}</span>` + icon('right') });
        nextBtn.style.visibility = 'hidden';
        const { el } = renderQuestion(q, {
          number: `${t('quiz.question')} ${i + 1} / ${list.length}`,
          onResult: (ok, qel) => {
            results[i] = ok;
            if (ok) {
              score++; combo++;
              qs.wrong = qs.wrong.filter(w => w !== q.id);
              reward(4, qel.querySelector('.q-fb') || qel);
            } else {
              combo = 0;
              if (!qs.wrong.includes(q.id)) qs.wrong.push(q.id);
            }
            comboEl.className = 'quiz-combo' + (combo >= 2 ? ' on' : '');
            comboEl.innerHTML = combo >= 2 ? `🔥 ${combo} ${lang() === 'en' ? 'in a row' : 'v řadě'}` : '';
            if (combo >= 2) comboEl.animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(.34,1.56,.64,1)' });
            saveProfile();
            nextBtn.style.visibility = 'visible';
            nextBtn.classList.add('pop');
            dots.children[i].className = ok ? 'good' : 'bad';
          },
        });
        el.classList.add('q-enter');
        stage.append(el, h('div', { class: 'quiz-next-row' }, nextBtn));
        nextBtn.onclick = () => { i++; if (i < list.length) show(); else finish(); };
        el.querySelector('input')?.focus({ preventScroll: true });
      }

      function finish() {
        closePad();
        const total = list.length;
        const pct = score / total;
        qs.attempts.push({ date: Date.now(), score, total, kind });
        if (pct > qs.best) qs.best = pct;
        saveProfile();
        if (pct >= .8) { reward(20, wrap); confetti(); }
        wrap.innerHTML = '';
        const ring = h('div', { class: 'ring res-ring', style: { '--p': 0, '--size': '170px', '--th': '14px', '--c': pct >= .8 ? 'var(--good)' : pct >= .5 ? 'var(--warn)' : 'var(--bad)' } }, h('span', {}, '0 %'));
        const msg = pct >= .8 ? t('quiz.great') : pct >= .5 ? t('quiz.good') : t('quiz.keep');
        const review = h('div', { class: 'res-review' }, h('div', { class: 'eyebrow' }, t('quiz.review')));
        list.forEach((q, k) => {
          const det = h('details', { class: 'res-item ' + (results[k] ? 'good' : 'bad') },
            h('summary', {}, h('span', { class: 'res-mark' }, results[k] ? '✓' : '✗'), h('span', { class: 'res-q', html: lrt(q.q) })),
            h('div', { class: 'res-exp', html: lrt(q.explain) }));
          review.append(det);
        });
        const wrongN = list.filter((_, k) => !results[k]).length;
        wrap.append(h('div', { class: 'quiz-result card rise' },
          ring,
          h('h1', { class: 'display' }, msg),
          h('p', { class: 'muted' }, `${score} / ${total} ${lang() === 'en' ? 'correct' : 'správně'}`),
          h('div', { class: 'res-actions' },
            h('button', { class: 'btn primary big', onclick: () => run(shuffle(list), kind), html: icon('reset') + `<span>${t('quiz.again')}</span>` }),
            wrongN ? h('button', { class: 'btn big', onclick: () => run(list.filter((_, k) => !results[k]), 'fix'), html: `🔁 <span>${t('quiz.mistakes')} (${wrongN})</span>` }) : null,
            h('a', { class: 'btn big ghost', href: `#/lesson/${id}` , html: icon('lesson') + `<span>${t('nav.lesson')}</span>` })),
          review));
        // animate ring
        const t0 = performance.now();
        const anim = now => {
          const k = Math.min(1, (now - t0) / 1200);
          const e = 1 - Math.pow(1 - k, 3);
          ring.style.setProperty('--p', Math.round(pct * 100 * e));
          ring.querySelector('span').textContent = Math.round(pct * 100 * e) + ' %';
          if (k < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      }
      show();
    }

    intro();
    return () => closePad();
  },
};
