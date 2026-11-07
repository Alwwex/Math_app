// Kartičky s pojmy – nejde o překlad, ale o význam. Vše je česky i anglicky zároveň:
//  • „Co to znamená?"  – vidíš pojem (CZ + EN), otočíš a zkontroluješ význam,
//  • „Který pojem?"    – vidíš význam, hádáš pojem,
//  • „Výběr"           – k pojmu vybereš správný význam ze čtyř možností.
// Pokrok se ukládá do Leitnerových krabiček (čím líp pojem umíš, tím později se vrátí).
import { profile, saveProfile, bump } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, rt, tex, reward, confetti, shuffle, sound, emo } from '../util.js';
import { icon } from '../icons.js';
import { loadAllChapters } from '../../content/book.js';
import { speakParts, speakable } from '../tts.js';

const DAY = 86400000;
const INTERVAL = [0, 0, DAY, 3 * DAY, 7 * DAY, 14 * DAY];
const key = g => `${g.chapter}:${g.id}`;
const E = (cs, en) => (lang() === 'en' ? en : cs);
const MODES = [
  ['mean', 'thinking', 'Co to znamená?', 'What does it mean?'],
  ['term', 'magnifier', 'Který pojem?', 'Which term?'],
  ['choice', 'target', 'Výběr', 'Multiple choice'],
];

// ---------- bilingual building blocks ----------
const add = (el, ...kids) => el.append(...kids.filter(Boolean));
const defCs = g => g.def?.cs ?? g.def ?? '';
const defEn = g => g.def?.en ?? '';
function termBlock(g, size = '') {
  return h('div', { class: 'fc-term ' + size },
    h('div', { class: 'fc-cs' }, g.cs),
    h('div', { class: 'fc-en' }, h('span', { class: 'fc-tag' }, 'EN'), g.en));
}
function meaningBlock(g) {
  const cs = defCs(g), en = defEn(g);
  const box = h('div', { class: 'fc-mean' }, h('div', { class: 'fc-row' }, h('span', { class: 'fc-tag cs' }, 'CZ'), h('span', { html: rt(cs) })));
  if (en && en !== cs) box.append(h('div', { class: 'fc-row en' }, h('span', { class: 'fc-tag' }, 'EN'), h('span', { html: rt(en) })));
  return box;
}
function question(cs, en) {
  return h('div', { class: 'fc-q' }, h('span', { html: emo('thinking') }), h('b', {}, cs), h('span', { class: 'fc-q-en' }, en));
}
function say(g) {
  speakParts([
    { text: `${g.cs}. ${speakable(rt(defCs(g)), 'cs')}`, lang: 'cs' },
    { text: `${g.en}. ${speakable(rt(defEn(g) || defCs(g)), 'en')}`, lang: 'en' },
  ]);
}
const sayBtn = g => h('button', { class: 'btn icon small ghost fc-say', title: E('Přečíst česky i anglicky', 'Read in Czech and English'), html: icon('speak'), onclick: e => { e.stopPropagation(); say(g); } });

export default {
  async mount(root, params, query) {
    const chs = (await loadAllChapters()).filter(c => c.glossary.length);
    let filter = query?.ch ?? 'all';
    let tab = 'study';
    let mode = ['mean', 'term', 'choice'].includes(profile.cardMode) ? profile.cardMode : 'mean';
    root.classList.add('cards-view');
    const head = h('div', { class: 'cards-head' });
    const body = h('div', { class: 'cards-body' });
    root.append(h('div', { class: 'cards-inner' }, head, body));
    const deck = () => chs.filter(c => filter === 'all' || c.id === String(filter)).flatMap(c => c.glossary);
    const everything = () => chs.flatMap(c => c.glossary);

    function renderHead() {
      head.innerHTML = '';
      const tabs = h('div', { class: 'seg' },
        h('button', { class: tab === 'study' ? 'on' : '', onclick: () => { tab = 'study'; renderHead(); render(); } }, t('cards.study')),
        h('button', { class: tab === 'list' ? 'on' : '', onclick: () => { tab = 'list'; renderHead(); render(); } }, t('cards.glossary')));
      const chips = h('div', { class: 'cards-chips' });
      const chip = (val, label, e) => h('button', { class: 'chip' + (String(filter) === String(val) ? ' on' : ''), html: (e ? emo(e) : '') + `<span>${label}</span>`, onclick: () => { filter = val; renderHead(); render(); } });
      chips.append(chip('all', E('Vše', 'All')));
      for (const c of chs) chips.append(chip(c.id, c.n ? `${c.n}` : '★', c.emoji));
      head.append(h('div', { class: 'cards-top' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, `${deck().length} ${E('pojmů', 'terms')} · ${E('česky i anglicky', 'Czech & English')}`), h('h1', { class: 'large-title' }, t('cards.title'))), tabs), chips);
      if (tab === 'study') {
        const modes = h('div', { class: 'fc-modes' });
        for (const [m, e, cs, en] of MODES) {
          modes.append(h('button', { class: 'fc-mode' + (mode === m ? ' on' : ''), onclick: () => { mode = m; profile.cardMode = m; saveProfile(); renderHead(); render(); } },
            h('span', { html: emo(e) }), h('span', {}, h('b', {}, lang() === 'en' ? en : cs), h('small', {}, m === 'mean' ? E('pojem → význam', 'term → meaning') : m === 'term' ? E('význam → pojem', 'meaning → term') : E('4 možnosti', '4 options')))));
        }
        head.append(modes);
      }
    }
    const boxOf = g => profile.cards[key(g)]?.box || 1;
    function grade(g, know) {
      const c = profile.cards[key(g)] || { box: 1, due: 0 };
      if (know) { c.box = Math.min(5, c.box + 1); c.due = Date.now() + INTERVAL[c.box]; }
      else { c.box = 1; c.due = Date.now(); }
      profile.cards[key(g)] = c; bump('cards'); saveProfile();
    }

    function render() {
      body.innerHTML = '';
      if (tab === 'list') return renderList();
      const all = deck();
      const boxes = h('div', { class: 'leitner' });
      for (let b = 1; b <= 5; b++) {
        const n = all.filter(g => boxOf(g) === b).length;
        boxes.append(h('div', { class: 'lb lb-' + b }, h('div', { class: 'lb-stack' }, ...Array.from({ length: Math.min(n, 5) }, (_, i) => h('i', { style: { '--i': i } }))), h('b', {}, String(n)), h('small', {}, `${t('cards.box')} ${b}`)));
      }
      const queue = shuffle(all.filter(g => { const c = profile.cards[key(g)]; return !c || c.due <= Date.now(); })).slice(0, 30);
      const stage = h('div', { class: 'card-stage' });
      body.append(boxes, stage);
      let seen = 0;
      const total = queue.length;

      function done() {
        stage.append(h('div', { class: 'cards-done rise' }, h('div', { class: 'cd-emoji', html: emo('party') }), h('h2', { class: 'title-2' }, t('cards.finished')),
          h('p', { class: 'muted' }, E('Kartičky se vrátí, až přijdou na řadu – čím lépe pojem umíš, tím déle počká.', 'Cards come back when they are due – the better you know one, the longer it waits.')),
          h('button', { class: 'btn tinted capsule', onclick: () => { all.forEach(g => { if (profile.cards[key(g)]) profile.cards[key(g)].due = 0; }); saveProfile(); render(); } }, E('Procvičit znovu vše', 'Practise all again'))));
        if (seen) confetti({ count: 90 });
      }
      const chapterTag = g => { const ch = chs.find(c => c.n === g.chapter); return h('div', { class: 'flash-lang', html: `${emo(ch?.emoji || 'books')} ${ch?.n ? t('nav.chapter') + ' ' + ch.n : E('Rozcvička', 'Warm-up')}` }); };

      function next() {
        stage.innerHTML = '';
        if (!queue.length) return done();
        const g = queue[0];
        stage.append(h('div', { class: 'flash-prog' }, `${Math.min(seen + 1, total)} / ${total}`));
        if (mode === 'choice') return choiceCard(g);
        // flip card: "what does it mean?" or the reverse "which term is it?"
        const front = h('div', { class: 'flash-face front' }, chapterTag(g));
        const back = h('div', { class: 'flash-face back' }, chapterTag(g), sayBtn(g));
        if (mode === 'mean') {
          add(front, question('Co to znamená?', 'What does it mean?'), termBlock(g, 'big'), h('div', { class: 'flash-hint' }, t('cards.flip')));
          add(back, termBlock(g, 'small'), meaningBlock(g), g.ex ? h('div', { class: 'flash-ex', html: tex(g.ex) }) : null);
        } else {
          add(front, question('Který pojem to je?', 'Which term is it?'), meaningBlock(g), g.ex ? h('div', { class: 'flash-ex', html: tex(g.ex) }) : null, h('div', { class: 'flash-hint' }, t('cards.flip')));
          add(back, h('div', { class: 'fc-answer-cap' }, E('Je to', 'It is')), termBlock(g, 'big'), meaningBlock(g));
        }
        const card = h('div', { class: 'flash' }, h('div', { class: 'flash-inner' }, front, back));
        card.onclick = () => { card.classList.toggle('flipped'); sound.swipe(); };
        const bNo = h('button', { class: 'btn big capsule flash-no', html: icon('x') + `<span>${t('cards.dont')}</span>` });
        const bYes = h('button', { class: 'btn big capsule good flash-yes', html: icon('check') + `<span>${t('cards.know')}</span>` });
        const answer = know => {
          grade(g, know);
          if (know) { queue.shift(); reward(2, bYes); sound.correct(); } else { queue.push(queue.shift()); sound.wrong(); }
          seen++;
          card.classList.add(know ? 'out-right' : 'out-left');
          setTimeout(next, 380);
        };
        bNo.onclick = () => answer(false);
        bYes.onclick = () => answer(true);
        stage.append(card, h('div', { class: 'flash-actions' }, bNo, bYes));
      }

      // four meanings, one is right – distractors preferably from the same chapter
      function choiceCard(g) {
        const sameDef = x => defCs(x) === defCs(g);
        const pool = everything().filter(x => x !== g && !sameDef(x));
        const near = shuffle(pool.filter(x => x.chapter === g.chapter));
        const far = shuffle(pool.filter(x => x.chapter !== g.chapter));
        const opts = shuffle([g, ...[...near, ...far].slice(0, 3)]);
        const card = h('div', { class: 'fc-choice' }, chapterTag(g), sayBtn(g), question('Co to znamená?', 'What does it mean?'), termBlock(g, 'big'));
        const list = h('div', { class: 'fc-opts' });
        const nextBtn = h('button', { class: 'btn primary big capsule fc-next', html: `<span>${t('next')}</span>` + icon('right') });
        nextBtn.style.visibility = 'hidden';
        let answered = false;
        opts.forEach((o, i) => {
          const b = h('button', { class: 'fc-opt' }, h('span', { class: 'q-letter' }, String.fromCharCode(65 + i)), meaningBlock(o));
          b.onclick = () => {
            if (answered) return;
            answered = true;
            const ok = o === g;
            b.classList.add(ok ? 'good' : 'bad');
            if (!ok) { list.children[opts.indexOf(g)].classList.add('good', 'reveal'); b.append(h('div', { class: 'fc-was' }, `= ${o.cs} · ${o.en}`)); }
            [...list.children].forEach(c => { c.disabled = true; });
            grade(g, ok);
            if (ok) { reward(3, b); sound.correct(); } else sound.wrong();
            if (g.ex) card.append(h('div', { class: 'flash-ex', html: tex(g.ex) }));
            queue.shift(); if (!ok) queue.push(g);
            seen++;
            nextBtn.style.visibility = 'visible'; nextBtn.classList.add('pop');
            nextBtn.focus({ preventScroll: true });
            nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          };
          list.append(b);
        });
        nextBtn.onclick = next;
        card.append(list);
        stage.append(card, nextBtn);
      }
      next();
    }

    function renderList() {
      const search = h('input', { class: 'input gl-search', placeholder: E('Hledat pojem nebo význam…', 'Search a term or meaning…') });
      const list = h('div', { class: 'group gl-list' });
      const draw = () => {
        const q = search.value.trim().toLowerCase();
        list.innerHTML = '';
        deck().filter(g => !q || [g.cs, g.en, defCs(g), defEn(g)].some(s => s.toLowerCase().includes(q))).forEach(g => {
          list.append(h('div', { class: 'gl-item' },
            h('div', { class: 'gl-terms' }, h('b', {}, g.cs), h('span', { class: 'gl-arrow' }, '·'), h('span', { class: 'gl-en' }, g.en), sayBtn(g)),
            h('div', { class: 'gl-def' }, meaningBlock(g)),
            h('div', { class: 'gl-box' }, '●'.repeat(boxOf(g)) + '○'.repeat(5 - boxOf(g)))));
        });
      };
      search.oninput = draw;
      body.append(search, list);
      draw();
    }

    renderHead();
    render();
    const onKey = e => {
      if (tab !== 'study' || e.target.closest('input')) return;
      if (mode === 'choice') {
        const n = '1234'.indexOf(e.key) + 1 || 'abcd'.indexOf(e.key.toLowerCase()) + 1;
        if (n) root.querySelectorAll('.fc-opt')[n - 1]?.click();
        if (e.key === 'Enter' || e.key === 'ArrowRight') { const nb = root.querySelector('.fc-next'); if (nb?.style.visibility === 'visible') { e.preventDefault(); nb.click(); } }
        return;
      }
      if (e.key === ' ') { e.preventDefault(); root.querySelector('.flash')?.click(); }
      if (e.key === 'ArrowRight') root.querySelector('.flash-yes')?.click();
      if (e.key === 'ArrowLeft') root.querySelector('.flash-no')?.click();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  },
};
