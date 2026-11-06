import { profile, saveProfile } from '../store.js';
import { t, lang } from '../i18n.js';
import { h, lrt, tex, reward, confetti, shuffle, sound } from '../util.js';
import { icon } from '../icons.js';
import { glossaryAll } from '../../content/book.js';

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

export default {
  async mount(root) {
    const all = glossaryAll();
    let tab = 'study';
    let dir = profile.cardDir || 'csen';
    root.classList.add('cards-view');
    const top = h('div', { class: 'topbar' });
    const body = h('div', { class: 'cards-body' });
    root.append(top, body);

    function renderTop() {
      top.innerHTML = '';
      const tabs = h('div', { class: 'seg' },
        h('button', { class: tab === 'study' ? 'on' : '', onclick: () => { tab = 'study'; renderTop(); render(); } }, t('cards.study')),
        h('button', { class: tab === 'list' ? 'on' : '', onclick: () => { tab = 'list'; renderTop(); render(); } }, t('cards.glossary')));
      const dirs = h('div', { class: 'seg' },
        h('button', { class: dir === 'csen' ? 'on' : '', onclick: () => { dir = 'csen'; profile.cardDir = dir; saveProfile(); renderTop(); render(); } }, t('cards.dir.csen')),
        h('button', { class: dir === 'encs' ? 'on' : '', onclick: () => { dir = 'encs'; profile.cardDir = dir; saveProfile(); renderTop(); render(); } }, t('cards.dir.encs')));
      top.append(h('div', { class: 'grow' }, h('h1', {}, t('cards.title')), h('div', { class: 'sub' }, `${all.length} ${lang() === 'en' ? 'terms · section 1.1' : 'pojmů · část 1.1'}`)), tabs, dirs);
    }

    function boxOf(g) { return profile.cards[g.id]?.box || 1; }

    function render() {
      body.innerHTML = '';
      if (tab === 'list') return renderList();
      // boxes overview
      const boxes = h('div', { class: 'leitner' });
      for (let b = 1; b <= 5; b++) {
        const n = all.filter(g => boxOf(g) === b).length;
        boxes.append(h('div', { class: 'lb lb-' + b }, h('div', { class: 'lb-stack', style: { '--n': Math.min(n, 6) } }, ...Array.from({ length: Math.min(n, 6) }, (_, i) => h('i', { style: { '--i': i } }))), h('b', {}, String(n)), h('small', {}, `${t('cards.box')} ${b}`)));
      }
      const queue = shuffle(all.filter(g => { const c = profile.cards[g.id]; return !c || c.due <= Date.now(); }));
      const stage = h('div', { class: 'card-stage' });
      body.append(h('div', { class: 'cards-inner' }, boxes, stage));
      let seen = 0;
      const total = queue.length;

      function next() {
        stage.innerHTML = '';
        if (!queue.length) {
          stage.append(h('div', { class: 'cards-done rise' }, h('div', { class: 'cd-emoji' }, '🎉'), h('h2', { class: 'display' }, t('cards.finished')), h('p', { class: 'muted' }, lang() === 'en' ? 'Cards come back when they are due again – the better you know one, the longer it waits.' : 'Kartičky se vrátí, až zase přijdou na řadu – čím lépe pojem umíš, tím déle počká.'),
            h('button', { class: 'btn', onclick: () => { all.forEach(g => { if (profile.cards[g.id]) profile.cards[g.id].due = 0; }); saveProfile(); render(); } }, lang() === 'en' ? 'Practise all again' : 'Procvičit znovu vše')));
          if (seen) confetti({ count: 90 });
          return;
        }
        const g = queue[0];
        const front = dir === 'csen' ? g.cs : g.en;
        const back = dir === 'csen' ? g.en : g.cs;
        const card = h('div', { class: 'flash' });
        const inner = h('div', { class: 'flash-inner' },
          h('div', { class: 'flash-face front' },
            h('div', { class: 'flash-lang' }, dir === 'csen' ? '🇨🇿 česky' : '🇬🇧 English'),
            h('div', { class: 'flash-term display' }, front),
            h('div', { class: 'flash-hint' }, t('cards.flip'))),
          h('div', { class: 'flash-face back' },
            h('div', { class: 'flash-lang' }, dir === 'csen' ? '🇬🇧 English' : '🇨🇿 česky'),
            h('div', { class: 'flash-term display' }, back),
            h('div', { class: 'flash-def', html: lrt(g.def) }),
            g.ex ? h('div', { class: 'flash-ex', html: tex(g.ex) }) : null,
            h('button', { class: 'btn small ghost flash-say', html: icon('volume') + '<span>' + g.en + '</span>', onclick: e => { e.stopPropagation(); speak(g.en); } })));
        card.append(inner);
        card.onclick = () => { card.classList.toggle('flipped'); sound.pop(); };
        const prog = h('div', { class: 'flash-prog' }, `${seen + 1} / ${total}`);
        const bNo = h('button', { class: 'btn big flash-no', html: icon('x') + `<span>${t('cards.dont')}</span>` });
        const bYes = h('button', { class: 'btn big good flash-yes', html: icon('check') + `<span>${t('cards.know')}</span>` });
        const answer = (know) => {
          const c = profile.cards[g.id] || { box: 1, due: 0 };
          if (know) { c.box = Math.min(5, c.box + 1); c.due = Date.now() + INTERVAL[c.box]; queue.shift(); reward(2, bYes); sound.correct(); }
          else { c.box = 1; c.due = Date.now(); queue.push(queue.shift()); sound.wrong(); }
          profile.cards[g.id] = c; saveProfile();
          seen++;
          card.classList.add(know ? 'out-right' : 'out-left');
          setTimeout(next, 380);
        };
        bNo.onclick = () => answer(false);
        bYes.onclick = () => answer(true);
        stage.append(prog, card, h('div', { class: 'flash-actions' }, bNo, bYes));
        stage.onkeydown = null;
      }
      next();
    }

    function renderList() {
      const search = h('input', { class: 'input gl-search', placeholder: t('cards.search') });
      const list = h('div', { class: 'gl-list' });
      const draw = () => {
        const q = search.value.trim().toLowerCase();
        list.innerHTML = '';
        all.filter(g => !q || g.cs.toLowerCase().includes(q) || g.en.toLowerCase().includes(q)).forEach((g, i) => {
          list.append(h('div', { class: 'gl-item rise', style: { animationDelay: Math.min(i, 12) * 30 + 'ms' } },
            h('div', { class: 'gl-terms' }, h('b', {}, g.cs), h('span', { class: 'gl-arrow' }, '↔'), h('b', { class: 'gl-en' }, g.en),
              h('button', { class: 'btn icon small ghost', html: icon('volume'), title: 'Vyslovit', onclick: () => speak(g.en) })),
            h('div', { class: 'gl-def', html: lrt(g.def) }),
            h('div', { class: 'gl-box' }, '●'.repeat(boxOf(g)) + '○'.repeat(5 - boxOf(g)))));
        });
      };
      search.oninput = draw;
      body.append(h('div', { class: 'cards-inner' }, search, list));
      draw();
    }

    renderTop();
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
