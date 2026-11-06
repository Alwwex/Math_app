// Společné vykreslení otázek (rychlé ověření v lekci i testy).
import { h, rt, lrt, sound, shuffle } from './util.js';
import { t, L, lang } from './i18n.js';
import { icon } from './icons.js';
import { figure } from './widgets/plot.js';

export function parseNum(s) {
  if (s == null) return NaN;
  const v = String(s).trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (/^-?\d*\.?\d+\/\d+$/.test(v)) { const [a, b] = v.split('/'); return parseFloat(a) / parseFloat(b); }
  return v === '' ? NaN : Number(v);
}

export function renderQuestion(q, { onResult, number } = {}) {
  const el = h('div', { class: 'qcard', 'data-type': q.type });
  let answered = false;
  if (number) el.append(h('div', { class: 'q-num' }, number));
  el.append(h('div', { class: 'q-text', html: lrt(q.q) }));
  if (q.fig) el.append(h('div', { class: 'q-fig' }, figure(q.fig)));
  const body = h('div', { class: 'q-body' });
  const fb = h('div', { class: 'q-fb' });
  el.append(body, fb);

  function finish(ok, extra = '') {
    if (answered) return;
    answered = true;
    el.classList.add('answered', ok ? 'is-good' : 'is-bad');
    if (ok) sound.correct(); else { sound.wrong(); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 600); }
    fb.className = 'q-fb show ' + (ok ? 'good' : 'bad');
    fb.innerHTML = `<div class="q-fb-head">${icon(ok ? 'check' : 'x')}<b>${ok ? t('correct') : t('wrong')}</b>${extra}</div>${q.explain ? `<div class="q-fb-exp">${lrt(q.explain)}</div>` : ''}`;
    onResult?.(ok, el);
  }

  if (q.type === 'mcq') {
    const opts = h('div', { class: 'q-opts' });
    q.options.forEach((o, i) => {
      const b = h('button', { class: 'q-opt' }, h('span', { class: 'q-letter' }, String.fromCharCode(65 + i)), h('span', { class: 'q-otext', html: lrt(o) }));
      b.onclick = () => {
        if (answered) return;
        const ok = i === q.answer;
        b.classList.add(ok ? 'good' : 'bad');
        if (!ok) opts.children[q.answer].classList.add('good', 'reveal');
        [...opts.children].forEach(c => c.disabled = true);
        finish(ok);
      };
      opts.append(b);
    });
    body.append(opts);
  } else if (q.type === 'tf') {
    const opts = h('div', { class: 'q-opts tf' });
    const labels = q.labels ? q.labels.map(x => L(x)) : [t('quiz.true'), t('quiz.false')];
    [true, false].forEach((v, i) => {
      const b = h('button', { class: 'q-opt big' }, h('span', { class: 'q-tf-ic' }, v ? '✓' : '✗'), h('span', {}, labels[i]));
      b.onclick = () => {
        if (answered) return;
        const ok = v === q.answer;
        b.classList.add(ok ? 'good' : 'bad');
        if (!ok) opts.children[q.answer ? 0 : 1].classList.add('good', 'reveal');
        [...opts.children].forEach(c => c.disabled = true);
        finish(ok);
      };
      opts.append(b);
    });
    body.append(opts);
  } else if (q.type === 'num') {
    const inp = h('input', { class: 'input q-input', inputmode: 'decimal', autocomplete: 'off', placeholder: t('quiz.typeAnswer') });
    const btn = h('button', { class: 'btn primary' }, t('check'));
    const row = h('div', { class: 'q-numrow' }, inp, q.unit ? h('span', { class: 'q-unit' }, q.unit) : null, btn);
    const go = () => {
      if (answered) return;
      const v = parseNum(inp.value);
      if (!Number.isFinite(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); inp.focus(); return; }
      const ok = Math.abs(v - q.answer) <= (q.tol ?? 1e-6);
      inp.disabled = true; btn.disabled = true;
      inp.classList.add(ok ? 'good' : 'bad');
      finish(ok, ok ? '' : ` <span class="q-correct">${t('answer')}: ${rt('$' + String(q.answer).replace('.', lang() === 'en' ? '.' : '{,}').replace('-', '-') + '$')}</span>`);
    };
    btn.onclick = go;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    body.append(row);
  } else if (q.type === 'match') {
    const left = h('div', { class: 'q-col' }), right = h('div', { class: 'q-col' });
    let selL = null, mistakes = 0, matched = 0;
    const pairs = q.pairs.map((p, i) => ({ l: p[0], r: p[1], i }));
    const L1 = shuffle(pairs), R1 = shuffle(pairs);
    const lb = L1.map(p => { const b = h('button', { class: 'q-m' }, p.l); b.onclick = () => { if (b.classList.contains('done') || answered) return; lb.forEach(x => x.classList.remove('sel')); b.classList.add('sel'); selL = { b, p }; sound.pop(); }; left.append(b); return b; });
    R1.forEach(p => {
      const b = h('button', { class: 'q-m' }, p.r);
      b.onclick = () => {
        if (!selL || b.classList.contains('done') || answered) return;
        if (selL.p.i === p.i) {
          selL.b.classList.remove('sel'); selL.b.classList.add('done'); b.classList.add('done');
          selL.b.style.setProperty('--k', matched); b.style.setProperty('--k', matched);
          matched++; selL = null; sound.pop();
          if (matched === pairs.length) finish(mistakes === 0, mistakes ? ` <span class="q-correct">(${lang() === 'en' ? 'mistakes' : 'chyb'}: ${mistakes})</span>` : '');
        } else {
          mistakes++;
          b.classList.add('bad'); selL.b.classList.add('bad');
          const sb = selL.b;
          setTimeout(() => { b.classList.remove('bad'); sb.classList.remove('bad'); }, 500);
          sound.wrong();
        }
      };
      right.append(b);
    });
    void lb;
    body.append(h('p', { class: 'muted small' }, t('quiz.matchHint')), h('div', { class: 'q-match' }, left, right));
  }
  return { el, isAnswered: () => answered };
}
