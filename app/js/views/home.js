import { profile, lessonState, quizState, currentStreak, level, store, todayGoals } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, tex, emo } from '../util.js';
import { icon } from '../icons.js';
import { book, chapters, chapter, loadChapter, locate } from '../../content/book.js';
import { currentUser } from '../auth.js';

const GOALS = { steps: 5, questions: 15, cards: 10 };

export function rings(vals, size = 150) {
  // Apple-style activity rings
  const cols = ['#ff2d55', '#34c759', '#0a84ff'];
  const w = 14, gap = 3;
  let svg = `<svg viewBox="0 0 ${size} ${size}" class="rings" width="${size}" height="${size}">`;
  vals.forEach((v, i) => {
    const r = size / 2 - w / 2 - i * (w + gap);
    const c = 2 * Math.PI * r;
    const p = Math.min(v, 1.999);
    svg += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${cols[i]}" stroke-opacity=".18" stroke-width="${w}"/>`;
    svg += `<circle class="ring-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${cols[i]}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" style="--to:${c * (1 - Math.min(p, 1))}; animation-delay:${200 + i * 150}ms" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
  });
  return svg + '</svg>';
}

export function chapterCard(c, st, opts = {}) {
  const total = c.stepsCount || 0;
  const done = st?.done?.length || 0;
  const pct = total ? Math.round(done / total * 100) : 0;
  const a = h('a', { class: 'chcard' + (opts.compact ? ' compact' : ''), href: `#/chapter/${c.id}`, style: { '--cc': c.color } },
    h('div', { class: 'chcard-emo', style: { viewTransitionName: opts.vt ? `ch-emo-${c.id}` : 'none' }, html: emo(c.emoji) }),
    h('div', { class: 'chcard-n' }, c.n ? `${lang() === 'en' ? 'Chapter' : 'Kapitola'} ${c.n}` : (lang() === 'en' ? 'Warm-up' : 'Rozcvička')),
    h('div', { class: 'chcard-t' }, L(c.title)),
    h('div', { class: 'chcard-meta' }, c.page ? `${t('ch.p')} ${c.page}–${c.end} · ${c.sections.length} ${lang() === 'en' ? 'sections' : 'oddílů'}` : (lang() === 'en' ? 'Animated intro' : 'Animovaný úvod')),
    h('div', { class: 'chcard-bar' }, h('i', { style: { width: pct + '%' } })));
  if (st?.finished) a.append(h('div', { class: 'chcard-done', html: icon('check') }));
  return a;
}

const FORMULAS = [
  ['e^{i\\pi} + 1 = 0', 'Eulerova identita – spojuje pět nejdůležitějších čísel.', "Euler's identity – five key numbers in one line.", 3],
  ['\\nabla \\cdot \\mathbf{E} = \\dfrac{\\rho}{\\varepsilon_0}', 'Gaussův zákon v diferenciálním tvaru.', "Gauss's law in differential form.", 10],
  ['\\oint_C f(z)\\,dz = 2\\pi i \\sum \\operatorname{Res} f', 'Reziduová věta – integrál po křivce spočítáš ze singularit.', 'Residue theorem – contour integrals from singularities.', 24],
  ['f(x) = \\sum_{n=0}^{\\infty} \\dfrac{f^{(n)}(a)}{n!}(x-a)^n', 'Taylorova řada.', 'Taylor series.', 4],
  ['\\dfrac{\\partial}{\\partial y}\\left(\\dfrac{\\partial F}{\\partial y\'}\\right) \\to \\dfrac{d}{dx}\\dfrac{\\partial F}{\\partial y\'} - \\dfrac{\\partial F}{\\partial y} = 0', 'Eulerova–Lagrangeova rovnice.', 'Euler–Lagrange equation.', 22],
  ['\\det(A - \\lambda I) = 0', 'Charakteristická rovnice – odtud vlastní čísla.', 'Characteristic equation – gives the eigenvalues.', 8],
  ['\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}', 'Gaussův integrál.', 'The Gaussian integral.', 6],
  ['\\hat{f}(\\omega) = \\dfrac{1}{\\sqrt{2\\pi}}\\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}\\,dt', 'Fourierova transformace.', 'Fourier transform.', 13],
  ['\\cosh^2 x - \\sinh^2 x = 1', 'Hyperbolická obdoba vzorce sin² + cos² = 1.', 'The hyperbolic twin of sin² + cos² = 1.', 3],
  ['\\iiint_V \\nabla\\cdot\\mathbf{a}\\,dV = \\oiint_S \\mathbf{a}\\cdot d\\mathbf{S}', 'Gaussova (divergenční) věta.', 'Divergence theorem.', 11],
  ['\\Pr(A\\,|\\,B) = \\dfrac{\\Pr(B\\,|\\,A)\\Pr(A)}{\\Pr(B)}', 'Bayesova věta.', "Bayes' theorem.", 30],
  ['\\Gamma(n+1) = n!', 'Funkce gama zobecňuje faktoriál.', 'The gamma function generalises the factorial.', 18],
];

export default {
  async mount(root) {
    root.classList.add('home');
    const u = currentUser();
    const hr = new Date().getHours();
    const greet = hr < 5 ? (lang() === 'en' ? 'Good night' : 'Dobrou noc') : hr < 10 ? t('home.morning') : hr < 18 ? t('home.day') : t('home.evening');
    const dateStr = new Date().toLocaleDateString(lang() === 'en' ? 'en-GB' : 'cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

    const lastN = profile.lastChapter ?? 1;
    const cur = await loadChapter(lastN) || await loadChapter(1);
    const st = lessonState(cur.id);
    const readerState = (await store.get('reader:book')) || {};
    const lastPage = (readerState.page ?? (cur.page ? cur.page - 1 : 0)) + 1;
    const loc = locate(lastPage);
    const pct = Math.round(st.done.length / cur.steps.length * 100);
    const nextStep = cur.steps[Math.min(st.step || 0, cur.steps.length - 1)];

    const head = h('header', { class: 'home-head' },
      h('div', {}, h('div', { class: 'eyebrow cap' }, dateStr), h('h1', { class: 'large-title' }, `${greet}, ${u?.name || ''}`)),
      h('div', { class: 'home-streak' }, h('div', { html: emo(currentStreak() ? 'fire' : 'seedling') }), h('div', {}, h('b', {}, `${currentStreak()}`), h('small', {}, t('streak')))));

    // continue card
    const cont = h('section', { class: 'card cont' },
      h('a', { class: 'cont-cover', href: `#/reader?page=${lastPage}`, html: `<img src="${book.cover}" alt="">` }),
      h('div', { class: 'cont-body' },
        h('div', { class: 'eyebrow' }, t('home.upNext')),
        h('div', { class: 'cont-ch' }, h('span', { html: emo(cur.emoji) }), h('span', {}, cur.n ? `${lang() === 'en' ? 'Chapter' : 'Kapitola'} ${cur.n}` : (lang() === 'en' ? 'Warm-up' : 'Rozcvička'))),
        h('h2', { class: 'title-2' }, L(cur.title)),
        h('p', { class: 'muted' }, `${t('lesson.step')} ${Math.min((st.step || 0) + 1, cur.steps.length)}/${cur.steps.length}: ${L(nextStep.title)}`),
        h('div', { class: 'cont-prog' }, h('div', { class: 'progress' }, h('i', { style: { width: pct + '%' } })), h('span', {}, pct + ' %')),
        h('div', { class: 'cont-actions' },
          h('a', { class: 'btn primary capsule', href: `#/lesson/${cur.id}`, html: icon('play') + `<span>${st.done.length ? t('ch.continue') : t('ch.start')}</span>` }),
          h('a', { class: 'btn tinted capsule', href: `#/reader?page=${lastPage}`, html: icon('book') + `<span>${t('home.readOn')} · ${t('ch.p')} ${lastPage}</span>` })),
        loc ? h('div', { class: 'cont-where subtle' }, `${t('home.lastPage')} ${lastPage}${loc.section ? ` · ${loc.section.n} ${L(loc.section.title)}` : ''}`) : null));

    // goals
    const g = todayGoals();
    const gv = [g.steps / GOALS.steps, g.questions / GOALS.questions, g.cards / GOALS.cards];
    const goals = h('section', { class: 'card goals' },
      h('div', { class: 'goals-head' }, h('h3', { class: 'title-3' }, t('home.goals')), h('a', { class: 'btn small ghost', href: '#/tests' }, lang() === 'en' ? 'Practice' : 'Procvičit')),
      h('div', { class: 'goals-body' }, h('div', { html: rings(gv) }),
        h('div', { class: 'goals-legend' },
          leg('#ff2d55', t('home.goalSteps'), g.steps, GOALS.steps),
          leg('#34c759', t('home.goalQ'), g.questions, GOALS.questions),
          leg('#0a84ff', t('home.goalCards'), g.cards, GOALS.cards))));
    function leg(c, label, v, max) { return h('div', { class: 'leg' }, h('i', { style: { background: c } }), h('div', {}, h('small', {}, label), h('b', {}, `${v}`, h('span', {}, `/${max}`)))); }

    // chapter carousel
    const carousel = h('div', { class: 'carousel' });
    const start = Math.max(0, chapters.findIndex(c => c.n === cur.n) - 1);
    for (const c of [...chapters.slice(start), ...chapters.slice(0, start)].slice(0, 12)) {
      const mod = await loadChapter(c.n);
      carousel.append(chapterCard({ ...c, stepsCount: mod?.steps.length || 0 }, profile.lessons[c.id], { compact: true }));
    }
    const shelf = h('section', { class: 'shelf' },
      h('div', { class: 'shelf-head' }, h('h3', { class: 'title-3' }, t('nav.chapters')), h('a', { class: 'btn small ghost', href: '#/library' }, t('home.all') + ' ›')),
      carousel);

    // formula of the day + week
    const dayIdx = Math.floor(Date.now() / 86400000) % FORMULAS.length;
    const F = FORMULAS[dayIdx];
    const fch = chapter(F[3]);
    const formula = h('a', { class: 'card formula', href: `#/chapter/${F[3]}` },
      h('div', { class: 'eyebrow' }, t('home.formula')),
      h('div', { class: 'formula-tex', html: tex(F[0], true) }),
      h('p', { class: 'muted' }, lang() === 'en' ? F[2] : F[1]),
      h('div', { class: 'formula-ch subtle', html: `${emo(fch.emoji)} ${lang() === 'en' ? 'Chapter' : 'Kapitola'} ${fch.n} · ${L(fch.title)}` }));

    const week = h('section', { class: 'card week' }, h('div', { class: 'goals-head' }, h('h3', { class: 'title-3' }, t('home.week')), h('span', { class: 'chip', html: `${emo('star')} ${profile.xp} XP · ${t('level')} ${level().lvl}` })));
    const bars = h('div', { class: 'week-bars' });
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const vals = days.map(d => profile.days[d.toLocaleDateString('sv-SE')] || 0);
    const max = Math.max(30, ...vals);
    days.forEach((d, i) => bars.append(h('div', { class: 'wb' + (i === 6 ? ' today' : '') },
      h('div', { class: 'wb-bar' }, h('i', { style: { height: Math.max(3, vals[i] / max * 100) + '%', animationDelay: i * 60 + 'ms' } })),
      h('div', { class: 'wb-d' }, d.toLocaleDateString(lang() === 'en' ? 'en-GB' : 'cs-CZ', { weekday: 'narrow' })))));
    week.append(bars);

    root.append(h('div', { class: 'home-inner' }, head, h('div', { class: 'home-grid' }, cont, goals), shelf, h('div', { class: 'home-grid two' }, formula, week)));
    void quizState; void lrt;
  },
};
