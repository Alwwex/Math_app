import { profile, saveProfile, bump } from '../store.js';
import { t, L, lang } from '../i18n.js';
import { h, lrt, tex, reward, confetti, shuffle, sound, emo } from '../util.js';
import { icon } from '../icons.js';
import { loadAllChapters } from '../../content/book.js';

const DAY = 86400000;
const INTERVAL = [0, 0, DAY, 3 * DAY, 7 * DAY, 14 * DAY];

export function speak(text, l = 'en-GB') {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = l; u.rate = .92;
    const v = speechSynthesis.getVoices().find(v => v.lang?.startsWith(l.slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { /* no speech */ }
}
const key = g => `${g.chapter}:${g.id}`;

export default {
  async mount(root, params, query) {
    const chs = (await loadAllChapters()).filter(c => c.glossary.length);
    let filter = query?.ch ?? 'all';
    let tab = 'study';
    let dir = profile.cardDir || 'csen';
    root.classList.add('cards-view');
    const head = h('div', { class: 'cards-head' });
    const body = h('div', { class: 'cards-body' });
    root.append(h('div', { class: 'cards-inner' }, head, body));
    const deck = () => chs.filter(c => filter === 'all' || c.id === String(filter)).flatMap(c => c.glossary);

    function renderHead() {
      head.innerHTML = '';
      const tabs = h('div', { class: 'seg' },
        h('button', { class: tab === 'study' ? 'on' : '', onclick: () => { tab = 'study'; renderHead(); render(); } }, t('cards.study')),
        h('button', { class: tab === 'list' ? 'on' : '', onclick: () => { tab = 'list'; renderHead(); render(); } }, t('cards.glossary')));
      const dirs = h('div', { class: 'seg' },
        h('button', { class: dir === 'csen' ? 'on' : '', onclick: () => { dir = 'csen'; profile.cardDir = dir; saveProfile(); renderHead(); render(); } }, 'CZ → EN'),
        h('button', { class: dir === 'encs' ? 'on' : '', onclick: () => { dir = 'encs'; profile.cardDir = dir; saveProfile(); renderHead(); render(); } }, 'EN → CZ'));
      const chips = h('div', { class: 'cards-chips' });
      const chip = (val, label, e) => h('button', { class: 'chip' + (String(filter) === String(val) ? ' on' : ''), html: (e ? emo(e) : '') + `<span>${label}</span>`, onclick: () => { filter = val; renderHead(); render(); } });
      chips.append(chip('all', lang() === 'en' ? 'All' : 'Vše'));
      for (const c of chs) chips.append(chip(c.id, c.n ? `${c.n}` : '★', c.emoji));
      head.append(h('div', { class: 'cards-top' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, `${deck().length} ${lang() === 'en' ? 'terms' : 'pojmů'}`), h('h1', { class: 'large-title' }, t('cards.title'))), tabs, dirs), chips);
    }
    const boxOf = g => profile.cards[key(g)]?.box || 1;

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
      function next() {
        stage.innerHTML = '';
        if (!queue.length) {
          stage.append(h('div', { class: 'cards-done rise' }, h('div', { class: 'cd-emoji', html: emo('party') }), h('h2', { class: 'title-2' }, t('cards.finished')),
            h('p', { class: 'muted' }, lang() === 'en' ? 'Cards come back when they are due – the better you know one, the longer it waits.' : 'Kartičky se vrátí, až přijdou na řadu – čím lépe pojem umíš, tím déle počká.'),
            h('button', { class: 'btn tinted capsule', onclick: () => { all.forEach(g => { if (profile.cards[key(g)]) profile.cards[key(g)].due = 0; }); saveProfile(); render(); } }, lang() === 'en' ? 'Practise all again' : 'Procvičit znovu vše')));
          if (seen) confetti({ count: 90 });
          return;
        }
        const g = queue[0];
        const front = dir === 'csen' ? g.cs : g.en, back = dir === 'csen' ? g.en : g.cs;
        const ch = chs.find(c => c.n === g.chapter);
        const card = h('div', { class: 'flash' });
        card.append(h('div', { class: 'flash-inner' },
          h('div', { class: 'flash-face front' },
            h('div', { class: 'flash-lang', html: `${emo(ch?.emoji || 'books')} ${ch?.n ? t('nav.chapter') + ' ' + ch.n : ''}` }),
            h('div', { class: 'flash-term' }, front),
            h('div', { class: 'flash-hint' }, t('cards.flip'))),
          h('div', { class: 'flash-face back' },
            h('div', { class: 'flash-lang' }, dir === 'csen' ? 'English' : 'Česky'),
            h('div', { class: 'flash-term' }, back),
            h('div', { class: 'flash-def', html: lrt(g.def) }),
            g.ex ? h('div', { class: 'flash-ex', html: tex(g.ex) }) : null,
            h('button', { class: 'btn small ghost flash-say', html: icon('volume') + '<span>' + g.en + '</span>', onclick: e => { e.stopPropagation(); speak(g.en); } }))));
        card.onclick = () => { card.classList.toggle('flipped'); sound.pop(); };
        const bNo = h('button', { class: 'btn big capsule flash-no', html: icon('x') + `<span>${t('cards.dont')}</span>` });
        const bYes = h('button', { class: 'btn big capsule good flash-yes', html: icon('check') + `<span>${t('cards.know')}</span>` });
        const answer = know => {
          const c = profile.cards[key(g)] || { box: 1, due: 0 };
          if (know) { c.box = Math.min(5, c.box + 1); c.due = Date.now() + INTERVAL[c.box]; queue.shift(); reward(2, bYes); sound.correct(); }
          else { c.box = 1; c.due = Date.now(); queue.push(queue.shift()); sound.wrong(); }
          profile.cards[key(g)] = c; bump('cards'); saveProfile();
          seen++;
          card.classList.add(know ? 'out-right' : 'out-left');
          setTimeout(next, 380);
        };
        bNo.onclick = () => answer(false);
        bYes.onclick = () => answer(true);
        stage.append(h('div', { class: 'flash-prog' }, `${Math.min(seen + 1, total)} / ${total}`), card, h('div', { class: 'flash-actions' }, bNo, bYes));
      }
      next();
    }

    function renderList() {
      const search = h('input', { class: 'input gl-search', placeholder: t('cards.search') });
      const list = h('div', { class: 'group gl-list' });
      const draw = () => {
        const q = search.value.trim().toLowerCase();
        list.innerHTML = '';
        deck().filter(g => !q || g.cs.toLowerCase().includes(q) || g.en.toLowerCase().includes(q)).forEach(g => {
          list.append(h('div', { class: 'gl-item' },
            h('div', { class: 'gl-terms' }, h('b', {}, g.cs), h('span', { class: 'gl-arrow' }, '·'), h('span', { class: 'gl-en' }, g.en),
              h('button', { class: 'btn icon small ghost', html: icon('volume'), title: 'Vyslovit', onclick: () => speak(g.en) })),
            h('div', { class: 'gl-def', html: lrt(g.def) }),
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
      if (e.key === ' ') { e.preventDefault(); root.querySelector('.flash')?.click(); }
      if (e.key === 'ArrowRight') root.querySelector('.flash-yes')?.click();
      if (e.key === 'ArrowLeft') root.querySelector('.flash-no')?.click();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  },
};
