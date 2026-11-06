import { quizState, saveProfile, bump } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, reward, confetti, shuffle, sound, emo } from '../util.js';
import { icon } from '../icons.js';
import { chapter, loadChapter, loadAllChapters } from '../../content/book.js';
import { renderQuestion } from '../question.js';
import { openPad, setPadContext } from '../pad.js';
import { speakBlocks, blocksOf, stopSpeaking, ttsSupported } from '../tts.js';

export default {
  async mount(root, params) {
    const id = params[0] || '1';
    const mix = id === 'mix';
    let sec, pool;
    if (mix) {
      const all = await loadAllChapters();
      pool = all.flatMap(c => c.quiz.map(q => ({ ...q, _ch: c })));
      sec = { id: 'mix', title: { cs: 'Mix ze všech kapitol', en: 'Mix from all chapters' }, emoji: 'die', color: '#5856d6', n: null };
    } else {
      const meta = chapter(id);
      if (!meta) { location.hash = '#/tests'; return; }
      sec = await loadChapter(meta.n);
      pool = sec.quiz.map(q => ({ ...q, _ch: sec }));
    }
    const qs = quizState(sec.id);
    const padKey = `pad:quiz:${sec.id}`, padTitle = `${t('quiz.scratch')} · ${L(sec.title)}`;
    setPadContext(padKey, padTitle);
    let curQ = null;
    root.classList.add('quiz-view');
    root.style.setProperty('--cc', sec.color);
    const wrap = h('div', { class: 'quiz-wrap' });
    root.append(wrap);

    function intro() {
      wrap.innerHTML = '';
      const wrongN = qs.wrong.filter(w => pool.some(q => q.id === w)).length;
      const card = h('div', { class: 'quiz-intro card rise' },
        h('a', { class: 'btn small ghost qi-back', href: mix ? '#/tests' : `#/chapter/${sec.id}`, html: icon('left') + `<span>${mix ? t('tests.title') : `${t('nav.chapter')} ${sec.n || ''}`}</span>` }),
        h('div', { class: 'qi-art', html: emo(sec.emoji) }),
        h('div', { class: 'eyebrow' }, mix ? t('tests.title') : `${t('quiz.title')} · ${sec.n ? t('nav.chapter') + ' ' + sec.n : ''}`),
        h('h1', { class: 'large-title' }, L(sec.title)),
        h('p', { class: 'muted' }, lang() === 'en' ? 'Use the scratch paper for calculations. Mistakes are saved so you can fix them later.' : 'Na výpočty máš pomocný papír. Chyby se ukládají, takže je můžeš později opravit.'),
        h('div', { class: 'qi-stats' },
          h('div', {}, h('b', {}, qs.attempts.length ? Math.round(qs.best * 100) + ' %' : '—'), h('small', {}, t('home.best'))),
          h('div', {}, h('b', {}, String(qs.attempts.length)), h('small', {}, lang() === 'en' ? 'attempts' : 'pokusů')),
          h('div', {}, h('b', {}, String(wrongN)), h('small', {}, lang() === 'en' ? 'to fix' : 'k opravě'))),
        h('div', { class: 'qi-modes' },
          mode('flag', mix ? t('tests.mix') : t('quiz.full'), `${mix ? 15 : pool.length} ${t('quiz.questions')}`, () => run(shuffle(pool).slice(0, mix ? 15 : pool.length), 'full'), 'primary'),
          !mix && pool.length > 6 ? mode('clock', t('quiz.quick'), `6 ${t('quiz.questions')}`, () => run(shuffle(pool).slice(0, 6), 'quick')) : null,
          mode('target', t('quiz.mistakes'), `${wrongN} ${t('quiz.questions')}`, () => wrongN ? run(shuffle(pool.filter(q => qs.wrong.includes(q.id))), 'fix') : sound.wrong(), '', !wrongN)));
      if (qs.attempts.length) {
        const bars = h('div', { class: 'qi-bars' });
        qs.attempts.slice(-12).forEach(a => bars.append(h('div', { class: 'qi-bar', title: new Date(a.date).toLocaleString() }, h('i', { style: { height: Math.max(6, a.score / a.total * 100) + '%' } }), h('span', {}, Math.round(a.score / a.total * 100) + ''))));
        card.append(h('div', { class: 'qi-hist' }, h('div', { class: 'eyebrow' }, t('quiz.history')), bars));
      }
      wrap.append(card);
    }
    function mode(e, title, sub, fn, cls = '', disabled = false) {
      const b = h('button', { class: 'qi-mode ' + cls, onclick: fn }, h('span', { class: 'qi-emoji', html: emo(e) }), h('span', {}, h('b', {}, title), h('small', {}, sub)));
      if (disabled) b.classList.add('disabled');
      return b;
    }

    function run(list, kind) {
      let i = 0, score = 0, combo = 0;
      const results = [];
      wrap.innerHTML = '';
      const dots = h('div', { class: 'quiz-dots' }, ...list.map(() => h('i')));
      const comboEl = h('div', { class: 'quiz-combo' });
      const bar = h('div', { class: 'quiz-bar' },
        h('button', { class: 'btn icon ghost', html: icon('x'), 'aria-label': t('close'), onclick: () => { stopSpeaking(); intro(); } }),
        dots, comboEl,
        ttsSupported ? h('button', { class: 'btn small tinted', title: lang() === 'en' ? 'Read the question aloud' : 'Přečíst otázku nahlas', html: icon('speak') + `<span>${lang() === 'en' ? 'Read' : 'Přečíst'}</span>`, onclick: () => curQ && speakBlocks(blocksOf(curQ, '.q-text, .q-opt, .q-fb.show'), { title: lang() === 'en' ? 'Question' : 'Otázka' }) }) : null,
        h('button', { class: 'btn small tinted', html: icon('scratch') + `<span>${t('quiz.scratch')}</span>`, onclick: () => openPad(padKey, padTitle) }));
      const stage = h('div', { class: 'quiz-stage' });
      wrap.append(bar, stage);

      function show() {
        stage.innerHTML = '';
        [...dots.children].forEach((d, k) => d.className = k < i ? (results[k] ? 'good' : 'bad') : k === i ? 'cur' : '');
        const q = list[i];
        const nextBtn = h('button', { class: 'btn primary big capsule quiz-next', html: `<span>${i === list.length - 1 ? t('quiz.result') : t('next')}</span>` + icon('right') });
        nextBtn.style.visibility = 'hidden';
        const chLabel = mix && q._ch ? ` · ${q._ch.n ? t('nav.chapter') + ' ' + q._ch.n : L(q._ch.title)}` : '';
        const { el } = renderQuestion(q, {
          number: `${t('quiz.question')} ${i + 1} / ${list.length}${chLabel}`,
          onResult: (ok, qel) => {
            results[i] = ok;
            bump('questions');
            if (ok) { score++; combo++; qs.wrong = qs.wrong.filter(w => w !== q.id); reward(4, qel.querySelector('.q-fb') || qel); }
            else { combo = 0; if (!qs.wrong.includes(q.id)) qs.wrong.push(q.id); }
            comboEl.className = 'quiz-combo' + (combo >= 2 ? ' on' : '');
            comboEl.innerHTML = combo >= 2 ? `${emo('fire')} ${combo}× ${lang() === 'en' ? 'in a row' : 'v řadě'}` : '';
            if (combo >= 2) comboEl.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' });
            saveProfile();
            nextBtn.style.visibility = 'visible';
            nextBtn.classList.add('pop');
            dots.children[i].className = ok ? 'good' : 'bad';
          },
        });
        el.classList.add('q-enter');
        curQ = el; stopSpeaking();
        stage.append(el, h('div', { class: 'quiz-next-row' }, nextBtn));
        nextBtn.onclick = () => { i++; if (i < list.length) show(); else finish(); };
        el.querySelector('input')?.focus({ preventScroll: true });
      }

      function finish() {
        stopSpeaking();
        const total = list.length, pct = score / total;
        qs.attempts.push({ date: Date.now(), score, total, kind });
        if (pct > qs.best) qs.best = pct;
        saveProfile();
        if (pct >= .8) { reward(20, wrap); confetti(); }
        wrap.innerHTML = '';
        const col = pct >= .8 ? 'var(--green)' : pct >= .5 ? 'var(--orange)' : 'var(--red)';
        const ring = h('div', { class: 'ring-wrap' }, h('div', { class: 'ring res-ring', style: { '--p': 0, '--size': '170px', '--th': '16px', '--c': col } }), h('span', { class: 'res-pct' }, '0 %'));
        const msg = pct >= .8 ? t('quiz.great') : pct >= .5 ? t('quiz.good') : t('quiz.keep');
        const review = h('div', { class: 'res-review' }, h('div', { class: 'group-title' }, t('quiz.review')));
        const grp = h('div', { class: 'group' });
        list.forEach((q, k) => grp.append(h('details', { class: 'res-item ' + (results[k] ? 'good' : 'bad') },
          h('summary', {}, h('span', { class: 'res-mark', html: icon(results[k] ? 'check' : 'x') }), h('span', { class: 'res-q', html: lrt(q.q) })),
          h('div', { class: 'res-exp', html: lrt(q.explain) }))));
        review.append(grp);
        const wrongN = list.filter((_, k) => !results[k]).length;
        wrap.append(h('div', { class: 'quiz-result card rise' },
          h('div', { class: 'res-emo', html: emo(pct >= .8 ? 'trophy' : pct >= .5 ? 'muscle' : 'brain') }),
          ring, h('h1', { class: 'large-title' }, msg),
          h('p', { class: 'muted' }, `${score} / ${total} ${lang() === 'en' ? 'correct' : 'správně'}`),
          h('div', { class: 'res-actions' },
            h('button', { class: 'btn primary big capsule', onclick: () => run(shuffle(list), kind), html: icon('reset') + `<span>${t('quiz.again')}</span>` }),
            wrongN ? h('button', { class: 'btn tinted big capsule', onclick: () => run(list.filter((_, k) => !results[k]), 'fix'), html: `<span>${t('quiz.mistakes')} (${wrongN})</span>` }) : null,
            !mix ? h('a', { class: 'btn ghost big', href: `#/chapter/${sec.id}`, html: `<span>${t('nav.chapter')} ${sec.n || ''}</span>` }) : null),
          review));
        const t0 = performance.now();
        const anim = now => {
          const k = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
          ring.firstChild.style.setProperty('--p', Math.round(pct * 100 * e));
          ring.lastChild.textContent = Math.round(pct * 100 * e) + ' %';
          if (k < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      }
      show();
    }
    intro();
    return () => { stopSpeaking(); setPadContext(null); };
  },
};
